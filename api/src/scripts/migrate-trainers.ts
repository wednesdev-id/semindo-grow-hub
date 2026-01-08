import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateTrainers() {
    console.log('🔄 Starting Trainer Migration...');

    // 1. Get the 'konsultan' and 'trainer' role IDs
    const trainerRole = await prisma.role.findUnique({ where: { name: 'trainer' } });
    const konsultanRole = await prisma.role.findUnique({ where: { name: 'konsultan' } });

    if (!konsultanRole) {
        console.error('❌ Role "konsultan" not found! Run seed first.');
        return;
    }

    // If 'trainer' role doesn't exist, we might have users just with "trainer-like" history or manual check
    // But let's assume valid role exists or we check users who might have intended to be trainers

    // Find all users who MIGHT be trainers (e.g. have 'trainer' role or were manually tagged)
    let trainers: any[] = [];
    if (trainerRole) {
        trainers = await prisma.user.findMany({
            where: {
                userRoles: {
                    some: {
                        roleId: trainerRole.id
                    }
                }
            },
            include: {
                userRoles: true
            }
        });
    } else {
        console.log('ℹ️ Role "trainer" does not exist in DB. Checking by name or legacy data...');
        // Fallback: Check if there's any user with 'trainer' in their data metadata if applicable
        // Or just look for users who don't have ConsultantProfile but might be relevant
    }

    console.log(`Found ${trainers.length} trainers to migrate.`);

    for (const trainer of trainers) {
        console.log(`Processing trainer: ${trainer.fullName} (${trainer.email})`);

        try {
            // 1. Assign 'konsultan' role if not already assigned
            const hasKonsultan = trainer.userRoles.some((r: any) => r.roleId === konsultanRole.id);

            if (!hasKonsultan) {
                await prisma.userRole.create({
                    data: {
                        userId: trainer.id,
                        roleId: konsultanRole.id
                    }
                });
                console.log('  ✅ Assigned "konsultan" role');
            }

            // 2. Remove 'trainer' role if exists
            if (trainerRole) {
                // Note: Prisma many-to-many delete might need explicit table access if using valid relations
                // But here we access UserRole directly
                await prisma.userRole.deleteMany({
                    where: {
                        userId: trainer.id,
                        roleId: trainerRole.id
                    }
                });
                console.log('  🗑️ Removed "trainer" role');
            }

            // 3. Create/Update Consultant Profile with LMS capability
            const existingProfile = await prisma.consultantProfile.findUnique({
                where: { userId: trainer.id }
            });

            if (!existingProfile) {
                await prisma.consultantProfile.create({
                    data: {
                        userId: trainer.id,
                        title: 'Professional Instructor', // Default title
                        bio: 'Experienced instructor migrated from Trainer system.',
                        expertiseAreas: ['General Training'],
                        canTeachCourses: true, // Key flag
                        status: 'APPROVED',
                        isAcceptingNewClients: false, // Maybe they only want to teach?

                        // Required fields default
                        yearsExperience: 5,
                        hourlyRate: 100000
                    }
                });
                console.log('  ✨ Created ConsultantProfile (LMS Instructor)');
            } else {
                await prisma.consultantProfile.update({
                    where: { id: existingProfile.id },
                    data: {
                        canTeachCourses: true, // Enable LMS
                    }
                });
                console.log('  🔄 Updated existing profile with LMS capability');
            }

        } catch (error) {
            console.error(`  ❌ Failed to migrate ${trainer.email}:`, error);
        }
    }

    console.log('✅ Trainer Migration Complete!');
}

migrateTrainers()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
