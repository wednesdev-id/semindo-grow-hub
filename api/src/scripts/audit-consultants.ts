
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('=== CONSULTANT DATA AUDIT ===');

    // 1. Check Roles
    const roles = await prisma.role.findMany({
        where: { name: { contains: 'onsul', mode: 'insensitive' } }
    });
    console.log('1. Roles found matching "onsul":');
    console.table(roles);

    // 2. Check Users with these roles
    const users = await prisma.user.findMany({
        where: {
            userRoles: {
                some: {
                    role: {
                        name: { in: roles.map(r => r.name) }
                    }
                }
            }
        },
        include: {
            userRoles: { include: { role: true } },
            consultantProfile: true
        }
    });

    console.log(`\n2. Users with Consultant Roles: ${users.length}`);
    users.forEach(u => {
        console.log(` - [${u.id}] ${u.fullName} | Roles: ${u.userRoles.map(ur => ur.role.name).join(', ')} | Profile: ${u.consultantProfile ? 'YES (' + u.consultantProfile.status + ')' : 'NO'}`);
    });

    // 3. Count Profiles
    const profileCount = await prisma.consultantProfile.count();
    console.log(`\n3. Total ConsultantProfile records in DB: ${profileCount}`);

    if (profileCount > 0) {
        const profiles = await prisma.consultantProfile.findMany({ include: { user: true } });
        console.log('Sample Profile Statuses:', profiles.map(p => `${p.status} (User: ${p.user?.fullName})`));
    }

    // 4. Simulate API Query
    console.log('\n4. Simulating "listConsultants" Query ({ status: "all" })');
    const where: any = {};
    // Logic from service: if status=all, do nothing to where.status
    // So where remain empty.

    const results = await prisma.consultantProfile.findMany({
        where: {}, // Explicitly empty
        select: { id: true, status: true, userId: true }
    });
    console.log(`Simulated Query Found: ${results.length} records`);
    console.log(results);

    console.log('=== AUDIT COMPLETE ===');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
