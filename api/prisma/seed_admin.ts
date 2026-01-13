import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // Create or get admin role
    let role = await prisma.role.findUnique({ where: { name: 'admin' } });
    if (!role) {
        role = await prisma.role.create({
            data: { name: 'admin', displayName: 'Administrator' }
        });
        console.log('Created admin role');
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: 'admin@semindo.com' } });
    if (existing) {
        console.log('User admin@semindo.com already exists');
        return;
    }

    // Create user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
        data: {
            email: 'admin@semindo.com',
            passwordHash,
            fullName: 'Admin Semindo',
            emailVerified: true,
            isActive: true,
        }
    });

    // Assign role
    await prisma.userRole.create({
        data: { userId: user.id, roleId: role.id }
    });

    console.log('✅ Created admin@semindo.com with password admin123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
