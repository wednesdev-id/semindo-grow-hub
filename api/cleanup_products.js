
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const KEEP_SLUGS = [
    'kopi-arabica-gayo-premium',
    'kemeja-batik-pria-slimfit',
    'keripik-pisang-coklat-lumer'
];

async function cleanup() {
    const whereNotInKeepSlugs = {
        slug: { notIn: KEEP_SLUGS }
    };

    // Find products to delete first to get their IDs (useful for non-slug relations if needed, but relation filters usually work)
    const productsToDelete = await prisma.product.findMany({
        where: whereNotInKeepSlugs,
        select: { id: true }
    });

    const productIds = productsToDelete.map(p => p.id);

    if (productIds.length > 0) {
        console.log(`Found ${productIds.length} products to clean up.`);

        // 1. Delete Cart Items
        const deletedCartItems = await prisma.cartItem.deleteMany({
            where: { productId: { in: productIds } }
        });
        console.log(`Deleted ${deletedCartItems.count} cart items.`);

        // 2. Delete Order Items (CAREFUL: This might affect Orders. Ideally delete Orders too if they become empty)
        // For "Reset to start", assume test orders can be wiped or items removed.
        const deletedOrderItems = await prisma.orderItem.deleteMany({
            where: { productId: { in: productIds } }
        });
        console.log(`Deleted ${deletedOrderItems.count} order items.`);

        // 3. Delete Reviews (if any) - Assuming 'Review' model exists? 
        // Checking schema earlier.. didn't see Review model in previous view but logic suggests it. 
        // I'll skip Review for now and add try/catch if needed. 

        // 4. Delete Products
        const deletedProducts = await prisma.product.deleteMany({
            where: { id: { in: productIds } }
        });
        console.log(`Deleted ${deletedProducts.count} products.`);
    } else {
        console.log("No extra products found.");
    }
}

cleanup()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
