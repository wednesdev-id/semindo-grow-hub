const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = '5908f949-b9ba-47fe-b182-3e20bfa56fe3';
    try {
        const store = await prisma.store.findFirst({ where: { userId } });
        console.log('Store found:', store ? store.id : 'None');

        const query = {
            where: {
                OR: [
                    store ? { storeId: store.id } : {},
                    { sellerId: userId }
                ],
                deletedAt: null
            }
        };
        console.log('Query:', JSON.stringify(query, null, 2));

        const products = await prisma.product.findMany(query);
        console.log('Products found count:', products.length);
        console.log('Product IDs:', products.map(p => p.id));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
