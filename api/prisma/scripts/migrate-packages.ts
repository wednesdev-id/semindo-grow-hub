/**
 * Migration Script: Create Default Packages for Existing Consultants
 * 
 * This script creates a default "Standard Session" package for all consultants
 * who have an hourlyRate set but no packages yet.
 * 
 * Run with: npx tsx api/prisma/scripts/migrate-packages.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting package migration...\n');

    // Find all consultants with hourlyRate but no packages
    const consultantsWithoutPackages = await prisma.consultantProfile.findMany({
        where: {
            packages: {
                none: {}
            },
            hourlyRate: {
                gt: 0
            }
        },
        select: {
            id: true,
            hourlyRate: true,
            user: {
                select: {
                    fullName: true
                }
            }
        }
    });

    console.log(`Found ${consultantsWithoutPackages.length} consultants without packages.\n`);

    if (consultantsWithoutPackages.length === 0) {
        console.log('✅ No migration needed. All consultants already have packages or no hourlyRate set.');
        return;
    }

    let created = 0;
    let errors = 0;

    for (const consultant of consultantsWithoutPackages) {
        try {
            // Create a default "Standard Session" package
            await prisma.consultationPackage.create({
                data: {
                    consultantId: consultant.id,
                    name: 'Standard Session',
                    durationMinutes: 60,
                    price: consultant.hourlyRate,
                    description: 'Standard 1-hour consultation session',
                    isActive: true,
                    sortOrder: 0
                }
            });

            console.log(`✅ Created package for: ${consultant.user.fullName} (Rp ${consultant.hourlyRate.toLocaleString()})`);
            created++;
        } catch (error) {
            console.error(`❌ Failed for ${consultant.user.fullName}:`, error);
            errors++;
        }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   Created: ${created} packages`);
    console.log(`   Errors: ${errors}`);
    console.log('\n✅ Migration complete!');
}

main()
    .catch((e) => {
        console.error('Migration failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
