import { test, expect } from '@playwright/test';

test.describe('Marketplace Order Management', () => {
    test('should view orders, update status, and sync stock', async ({ page, request }) => {
        // 1. Login as Admin
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@semindo.id');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');

        // 2. Get Token for API calls
        const loginRes = await request.post('/api/v1/auth/login', {
            data: { email: 'admin@semindo.id', password: 'password123' }
        });
        const loginBody = await loginRes.json();
        const token = loginBody.data.token;

        // 2.5. Ensure User has a Store
        const storeRes = await request.get('/api/v1/marketplace/stores/me', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (storeRes.status() === 404) {
            console.log('Store not found, creating one...');
            const createStoreRes = await request.post('/api/v1/marketplace/stores', {
                headers: { Authorization: `Bearer ${token}` },
                data: {
                    name: `Test Store ${Date.now()}`,
                    slug: `test-store-${Date.now()}`,
                    description: 'Created by automation test'
                }
            });
            expect(createStoreRes.status()).toBe(201);
        }

        // 3. Create a Product (to buy)
        const productRes = await request.post('/api/v1/marketplace/products', {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                title: `Order Test Product ${Date.now()}`,
                description: 'For order testing',
                price: 50000,
                stock: 100,
                category: 'Kuliner',
                images: ['https://placehold.co/600x400']
            }
        });
        const productBody = await productRes.json();
        const productId = productBody.data.id;

        // 4. Create an Order (Buy the product)
        const orderRes = await request.post('/api/v1/marketplace/orders', {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                items: [{ productId: productId, quantity: 2 }]
            }
        });
        expect(orderRes.status()).toBe(201);
        const orderBody = await orderRes.json();
        const orderId = orderBody.data.id;

        console.log(`Created Order ID: ${orderId}`);

        // 5. Navigate to Order List
        await page.goto('/marketplace/orders');

        // Wait for table to load
        await expect(page.locator('table')).toBeVisible();

        // 6. Verify Order is Visible
        // We search for the Order ID (first 8 chars usually shown)
        const shortOrderId = orderId.substring(0, 8);
        await page.fill('input[placeholder="Search order ID..."]', shortOrderId);
        await expect(page.locator(`text=${shortOrderId}`)).toBeVisible();

        // 7. Update Status to Shipped
        // Click the "Truck" icon (Update Shipment)
        const row = page.locator('tr', { hasText: shortOrderId });
        await row.locator('button:has(svg.lucide-truck)').click();

        // Dialog should open
        await expect(page.locator('text=Update Status Pesanan')).toBeVisible();

        // Select "Shipped"
        await page.click('button[role="combobox"]'); // Click Select Trigger
        await page.click('div[role="option"]:has-text("Shipped")');

        // Input Tracking Info
        await page.fill('input[placeholder="Contoh: JNE, J&T"]', 'JNE Express');
        await page.fill('input[placeholder="Masukkan nomor resi"]', 'JNE123456789');

        // Save
        await page.click('button:has-text("Simpan Perubahan")');

        // Verify Success Toast
        await expect(page.locator('text=Status pesanan berhasil diperbarui')).toBeVisible();

        // Verify Status Badge Updated
        await expect(row.locator('text=shipped')).toBeVisible();

        // 8. Sync Stock
        await page.click('button:has-text("Sync Stock (External)")');
        await expect(page.locator('text=Stok berhasil disinkronisasi')).toBeVisible();
    });
});
