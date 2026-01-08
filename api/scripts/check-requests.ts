import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const requests = await prisma.consultationRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            status: true,
            createdAt: true,
            topic: true
        }
    });

    console.log('Recent Requests:', JSON.stringify(requests, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
