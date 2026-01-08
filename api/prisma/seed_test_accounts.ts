import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const TEST_USERS = [
    { email: 'admin@test.com', password: 'Test123!', fullName: 'Test Admin', role: 'admin' },
    { email: 'umkm@test.com', password: 'Test123!', fullName: 'Test UMKM User', role: 'umkm' },
    { email: 'konsultan@test.com', password: 'Test123!', fullName: 'Test Konsultan', role: 'konsultan' },
    { email: 'finance@test.com', password: 'Test123!', fullName: 'Test Finance Partner', role: 'finance_partner' },
    { email: 'ecosystem@test.com', password: 'Test123!', fullName: 'Test Ecosystem Partner', role: 'ecosystem_partner' },
    { email: 'superadmin@test.com', password: 'Test123!', fullName: 'Test Super Admin', role: 'super_admin' },
];

async function main() {
    console.log('🧪 Creating test accounts for each role...\n');

    for (const testUser of TEST_USERS) {
        // Check if role exists
        let role = await prisma.role.findUnique({ where: { name: testUser.role } });

        if (!role) {
            console.log(`⚠️  Role ${testUser.role} not found, creating...`);
            role = await prisma.role.create({
                data: {
                    name: testUser.role,
                    displayName: testUser.role.replace('_', ' ').toUpperCase(),
                }
            });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email: testUser.email } });

        if (existingUser) {
            console.log(`⏭️  ${testUser.email} already exists, skipping...`);
            continue;
        }

        // Create user
        const passwordHash = await bcrypt.hash(testUser.password, 10);
        const user = await prisma.user.create({
            data: {
                email: testUser.email,
                passwordHash,
                fullName: testUser.fullName,
                emailVerified: true,
                isActive: true,
            }
        });

        // Assign role
        await prisma.userRole.create({
            data: {
                userId: user.id,
                roleId: role.id,
            }
        });

        // Create UMKM profile if role is umkm
        if (testUser.role === 'umkm') {
            await prisma.uMKMProfile.create({
                data: {
                    userId: user.id,
                    businessName: 'Test UMKM Business',
                    ownerName: testUser.fullName,
                    address: 'Jl. Test No. 123',
                    city: 'Jakarta Selatan',
                    province: 'DKI Jakarta',
                    sector: 'Kuliner',
                    status: 'pending',
                }
            });
        }

        console.log(`✅ Created: ${testUser.email} (${testUser.role})`);
    }

    console.log('\n📋 Test Account Credentials:');
    console.log('═══════════════════════════════════════════════════');
    for (const user of TEST_USERS) {
        console.log(`| ${user.role.padEnd(18)} | ${user.email.padEnd(22)} | ${user.password} |`);
    }
    console.log('═══════════════════════════════════════════════════');
    console.log('\n✨ Done! You can now login with these accounts.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
