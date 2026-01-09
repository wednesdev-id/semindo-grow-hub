import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    try {
        console.log('--- DETAILED DB DIAGNOSIS ---');

        const products = await prisma.product.findMany({
            select: {
                id: true,
                title: true,
                storeId: true,
                sellerId: true,
                isPublished: true,
                status: true,
                deletedAt: true
            }
        });

        console.log(`Total Products: ${products.length}`);
        products.forEach(p => {
            console.log(`- ${p.title}`);
            console.log(`  ID: ${p.id}`);
            console.log(`  StoreId: ${p.storeId}`);
            console.log(`  SellerId: ${p.sellerId}`);
            console.log(`  Published: ${p.isPublished}`);
            console.log(`  Status: ${p.status}`);
            console.log(`  DeletedAt: ${p.deletedAt}`);
        });

    } catch (err) {
        console.error('Diagnosis failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
