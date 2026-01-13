import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to assign 'umkm' role to all users with UMKM profiles
 * that don't have any role assigned yet
 */

async function assignUMKMRoles() {
    console.log('🔧 Assigning UMKM roles to users with UMKM profiles...');

    // First, get or create the 'umkm' role
    let umkmRole = await prisma.role.findUnique({
        where: { name: 'umkm' },
    });

    if (!umkmRole) {
        console.log('📝 Creating umkm role...');
        umkmRole = await prisma.role.create({
            data: {
                name: 'umkm',
                displayName: 'UMKM',
                description: 'Role for UMKM owners',
            },
        });
        console.log(`✅ Created role: ${umkmRole.name}`);
    } else {
        console.log(`✅ Found existing role: ${umkmRole.name}`);
    }

    // Find all users with UMKM profiles that don't have the umkm role
    const usersWithProfiles = await prisma.user.findMany({
        where: {
            umkmProfile: {
                isNot: null,
            },
        },
        include: {
            userRoles: {
                include: {
                    role: true,
                },
            },
        },
    });

    console.log(`\n📊 Found ${usersWithProfiles.length} users with UMKM profiles`);

    let assigned = 0;
    let skipped = 0;

    for (const user of usersWithProfiles) {
        // Check if user already has umkm role
        const hasUmkmRole = user.userRoles.some(ur => ur.role.name === 'umkm');

        if (hasUmkmRole) {
            skipped++;
            continue;
        }

        // Assign umkm role to user
        try {
            await prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: umkmRole.id,
                },
            });
            assigned++;
        } catch (error: any) {
            if (error.code === 'P2002') {
                // Unique constraint violation - user already has this role
                skipped++;
            } else {
                console.log(`⚠️ Error assigning role to ${user.email}: ${error.message?.substring(0, 50)}`);
            }
        }
    }

    console.log(`\n✅ Assigned umkm role to ${assigned} users`);
    console.log(`⏭️ Skipped ${skipped} users (already have role)`);

    // Verify the results
    const umkmUserCount = await prisma.userRole.count({
        where: {
            role: {
                name: 'umkm',
            },
        },
    });

    console.log(`\n📈 Total users with 'umkm' role: ${umkmUserCount}`);
}

async function main() {
    try {
        await assignUMKMRoles();
    } catch (error) {
        console.error('❌ Script failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
