const { MarketplaceService } = require('./src/systems/marketplace/services/marketplace.service');
const service = new MarketplaceService();

async function main() {
    try {
        const where = {
            isPublished: true,
        };
        const products = await service.findAllProducts({
            where,
            orderBy: { createdAt: 'desc' },
        });
        console.log('Products found:', products.length);
        console.log(JSON.stringify(products, null, 2));
    } catch (e) {
        console.error(e);
    }
}

main();
