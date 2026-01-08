import { test, expect } from '@playwright/test';

test.describe('Marketplace Product Verification', () => {
    test.beforeEach(async ({ page }) => {
        // Debug: Print console logs
        page.on('console', msg => console.log(`LOGIN LOG: ${msg.text()}`));
        page.on('response', async response => {
            if (response.url().includes('/auth/login')) {
                console.log(`LOGIN API STATUS: ${response.status()}`);
            }
        });

        // Login as Admin
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@semindo.id');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should verify and approve a pending product', async ({ page, request }) => {
        // Debug: Print console logs
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

        // Debug: Inspect Network Response
        page.on('response', async response => {
            if (response.url().includes('/marketplace/products/pending')) {
                console.log(`API STATUS: ${response.status()}`);
                const body = await response.text();
                console.log(`API RESPONSE: ${body}`);
            }
        });

        // Create a pending product via API to ensure there is one
        const loginRes = await request.post('/api/v1/auth/login', {
            data: { email: 'seller@example.com', password: 'password123' }
        });
        const loginBody = await loginRes.json();
        const token = loginBody.data.token;

        await request.post('/api/v1/marketplace/products', {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                title: `Pending Product ${Date.now()}`,
                description: 'To be verified',
                price: 100000,
                stock: 10,
                category: 'Kuliner',
                images: ['https://placehold.co/600x400']
            }
        });

        // Navigate to Verification Page
        await page.goto('/marketplace/verification');

        // Wait for spinner to disappear (if any)
        await expect(page.locator('.lucide-loader-2')).not.toBeVisible();

        // Wait for table to load
        await expect(page.locator('table')).toBeVisible();

        // Find a row that has the approve button
        const productRow = page.locator('tbody tr', { has: page.locator('button.text-green-600') }).first();
        await expect(productRow).toBeVisible();

        // Click Approve
        const approveButton = productRow.locator('button.text-green-600');

        // Setup listener for success toast
        const toastPromise = page.waitForSelector("text=Product Approved");

        await approveButton.click();

        // Verify success toast
        await toastPromise;

        // Verify row is removed (optimistic update)
        // Note: DataGrid renders a "No results" row when empty, so we check for that
        await expect(page.locator('text=No results.')).toBeVisible();
    });
});
