
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStore() {
    const storeId = '367ea52d-745b-4450-807f-5c848221d795';
    const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: { user: true }
    });
    console.log('Store Status:', store);
}

checkStore()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
