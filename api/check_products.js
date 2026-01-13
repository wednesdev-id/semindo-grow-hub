
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
    const products = await prisma.product.findMany({
        select: {
            id: true,
            title: true,
            status: true,
            isPublished: true,
            storeId: true,
            sellerId: true,
            deletedAt: true,
            category: true
        }
    });

    console.log('Total Products:', products.length);
    console.table(products);
}

checkProducts()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
