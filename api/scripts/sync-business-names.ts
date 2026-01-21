
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log('🔄 Starting Business Name Sync...');

    // 1. Sync User.businessName from UMKMProfile
    const usersToFix = await prisma.user.findMany({
        where: {
            userRoles: {
                some: { role: { name: 'umkm' } }
            },
            businessName: null,
            umkmProfiles: {
                some: {} // Has at least one profile
            }
        },
        include: { umkmProfiles: true }
    });

    console.log(`Found ${usersToFix.length} users needing business name sync.`);

    for (const user of usersToFix) {
        const profile = user.umkmProfiles[0];
        if (profile?.businessName) {
            await prisma.user.update({
                where: { id: user.id },
                data: { businessName: profile.businessName }
            });
            process.stdout.write('.');
        }
    }
    console.log('\n✅ Synced business names.');

    // 2. Fix Orphan Demo User
    const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@example.com' },
        include: { umkmProfiles: true }
    });

    if (demoUser && demoUser.umkmProfiles.length === 0) {
        console.log('🔧 Fixing orphan demo user...');
        await prisma.uMKMProfile.create({
            data: {
                userId: demoUser.id,
                businessName: 'Demo UMKM Business',
                ownerName: demoUser.fullName,
                sector: 'Technology',
                status: 'verified',
                city: 'Jakarta',
                province: 'DKI Jakarta',
                address: 'Jl. Jendral Sudirman No. 1'
            }
        });
        await prisma.user.update({
            where: { id: demoUser.id },
            data: { businessName: 'Demo UMKM Business' }
        });
        console.log('✅ Created profile for demo@example.com');
    }

    console.log('🎉 Consistency Fix Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
