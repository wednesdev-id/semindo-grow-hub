
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    const email = 'seller@example.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log('User found:', user);
    } else {
        console.log('User not found:', email);
        // Only check for demo if seller is missing, just in case
        const demo = await prisma.user.findUnique({ where: { email: 'demo@example.com' } });
        if (demo) console.log('Demo user found:', demo);
    }
}

checkUser()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
