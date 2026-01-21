
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('🔍 Checking UMKM User Data Consistency...');

    // 1. Find users with 'umkm' role
    const umkmUsers = await prisma.user.findMany({
        where: {
            userRoles: {
                some: {
                    role: {
                        name: 'umkm'
                    }
                }
            }
        },
        include: {
            umkmProfiles: true
        }
    });

    console.log(`\nFound ${umkmUsers.length} users with 'umkm' role.`);

    let missingProfile = 0;
    let missingBusinessNameInUser = 0;
    let mismatchBusinessName = 0;

    for (const user of umkmUsers) {
        // Check 1: Has Profile?
        if (user.umkmProfiles.length === 0) {
            missingProfile++;
            console.log(`❌ User ${user.email} has 'umkm' role but NO UMKM Profile.`);
            continue;
        }

        const profile = user.umkmProfiles[0];

        // Check 2: User.businessName is set?
        if (!user.businessName) {
            missingBusinessNameInUser++;
            console.log(`⚠️ User ${user.email} has empty User.businessName, but Profile has "${profile.businessName}".`);
        } else if (user.businessName !== profile.businessName) {
            mismatchBusinessName++;
            console.log(`⚠️ User ${user.email} mismatch: User="${user.businessName}" vs Profile="${profile.businessName}"`);
        }
    }

    console.log('\n--- Summary ---');
    console.log(`Total UMKM Users: ${umkmUsers.length}`);
    console.log(`Missing Profiles: ${missingProfile}`);
    console.log(`Empty User.businessName (but has profile): ${missingBusinessNameInUser}`);
    console.log(`Mismatched Business Names: ${mismatchBusinessName}`);

    if (missingBusinessNameInUser > 0 || mismatchBusinessName > 0) {
        console.log('\nRun "npx ts-node scripts/sync-business-names.ts" to fix.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
