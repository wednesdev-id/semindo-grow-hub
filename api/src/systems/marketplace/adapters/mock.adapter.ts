
export interface ExternalProduct {
    id: string;
    name: string;
    price: number;
    stock: number;
    url: string;
}

export interface MarketplaceAdapter {
    syncStock(productId: string, stock: number): Promise<boolean>;
    getProducts(shopId: string): Promise<ExternalProduct[]>;
}

export class MockMarketplaceAdapter implements MarketplaceAdapter {
    private platformName: string;

    constructor(platformName: string) {
        this.platformName = platformName;
    }

    async syncStock(productId: string, stock: number): Promise<boolean> {
        console.log(`[${this.platformName}] Syncing stock for product ${productId} to ${stock}`);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
    }

    async getProducts(shopId: string): Promise<ExternalProduct[]> {
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

export const shopeeAdapter = new MockMarketplaceAdapter('Shopee');
export const tokopediaAdapter = new MockMarketplaceAdapter('Tokopedia');
