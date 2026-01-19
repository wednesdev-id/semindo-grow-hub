"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokopediaAdapter = exports.shopeeAdapter = exports.MockMarketplaceAdapter = void 0;
class MockMarketplaceAdapter {
    constructor(platformName) {
        Object.defineProperty(this, "platformName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.platformName = platformName;
    }
    async syncStock(productId, stock) {
        console.log(`[${this.platformName}] Syncing stock for product ${productId} to ${stock}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    }
    async getProducts(shopId) {
        console.log(`[${this.platformName}] Fetching products for shop ${shopId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        // Return mock products
        return [
            {
                id: `ext-${this.platformName}-1`,
                name: `Product 1 from ${this.platformName}`,
                price: 100000,
                stock: 50,
                url: `https://${this.platformName}.com/product/1`
            },
            {
                id: `ext-${this.platformName}-2`,
                name: `Product 2 from ${this.platformName}`,
                price: 200000,
                stock: 25,
                url: `https://${this.platformName}.com/product/2`
            }
        ];
    }
}
exports.MockMarketplaceAdapter = MockMarketplaceAdapter;
exports.shopeeAdapter = new MockMarketplaceAdapter('Shopee');
exports.tokopediaAdapter = new MockMarketplaceAdapter('Tokopedia');
