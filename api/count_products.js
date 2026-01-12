const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const total = await prisma.product.count();
        const active = await prisma.product.count({ where: { deletedAt: null } });
        const published = await prisma.product.count({ where: { isPublished: true, deletedAt: null } });
        const unpublished = await prisma.product.count({ where: { isPublished: false, deletedAt: null } });

        console.log('Total Products:', total);
        console.log('Active (not deleted):', active);
        console.log('Published:', published);
        console.log('Unpublished:', unpublished);

        const unpublishedList = await prisma.product.findMany({
            where: { isPublished: false, deletedAt: null },
            select: { id: true, title: true, status: true, storeId: true, sellerId: true }
        });
        console.log('Unpublished Products:', JSON.stringify(unpublishedList, null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
