import { test, expect } from '@playwright/test';

test.describe('Marketplace Product Management', () => {
    test.beforeEach(async ({ page }) => {
        // Login as Seller
        await page.goto('/login');
        await page.fill('input[type="email"]', 'seller@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Wait for login to complete and redirect
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should create a new product successfully', async ({ page }) => {
        // Mock Image Upload API
        await page.route('**/api/v1/marketplace/upload/images', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ urls: ['https://placehold.co/600x400'] })
            });
        });

        // Navigate to Add Product Page
        await page.goto('/dashboard/marketplace/products/new');

        // Fill Product Form
        await page.fill('input[name="title"]', 'Automation Test Product');
        await page.click('button[role="combobox"]'); // Category Select
        await page.click('div[role="option"]:has-text("Kuliner")'); // Select Kuliner

        await page.fill('input[name="price"]', '50000');
        await page.fill('input[name="stock"]', '100');
        await page.fill('textarea[name="description"]', 'This is a test product created by Playwright automation.');

        // Upload Dummy Image
        // We create a dummy file in memory
        const buffer = Buffer.from('dummy image content');
        await page.setInputFiles('input[type="file"]', {
            name: 'test-image.jpg',
            mimeType: 'image/jpeg',
            buffer
        });

        // Wait for upload to complete (toast or UI change)
        await expect(page.getByText('1 gambar berhasil diupload')).toBeVisible();

        // Submit Form
        await page.click('button[type="submit"]');

        // Verify Success and Redirection
        await expect(page.getByText('Produk berhasil diupload')).toBeVisible();
        await expect(page).toHaveURL(/\/dashboard\/marketplace\/products/);

        // Verify Product in List
        await expect(page.getByText('Automation Test Product')).toBeVisible();
    });

    test('should view product list', async ({ page }) => {
        await page.goto('/dashboard/marketplace/products');
        await expect(page.getByText('My Products')).toBeVisible();
        // Check if the previously created product is there
        // Note: If running in parallel or random order, this might fail if not created. 
        // But usually tests run sequentially in a file.
    });
});
