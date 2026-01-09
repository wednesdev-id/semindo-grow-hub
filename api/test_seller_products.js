const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = '5908f949-b9ba-47fe-b182-3e20bfa56fe3';

    try {
        // Test getMyProducts logic
        const store = await prisma.store.findFirst({ where: { userId } });
        console.log('=== SELLER PRODUCTS TEST ===');
        console.log('User ID:', userId);
        console.log('Store ID:', store?.id || 'No store');

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    store ? { storeId: store.id } : {},
                    { sellerId: userId }
                ],
                deletedAt: null
            },
            include: {
                seller: {
                    select: {
                        id: true,
                        fullName: true,
                        businessName: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log('\nProducts found:', products.length);
        products.forEach(p => {
            console.log(`- ${p.title} (status: ${p.status}, published: ${p.isPublished}, storeId: ${p.storeId})`);
        });

        // Test public marketplace query
        console.log('\n=== PUBLIC MARKETPLACE TEST ===');
        const publicProducts = await prisma.product.findMany({
            where: {
                deletedAt: null,
                isPublished: true
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log('Public products found:', publicProducts.length);
        publicProducts.forEach(p => {
            console.log(`- ${p.title} (status: ${p.status})`);
        });

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
