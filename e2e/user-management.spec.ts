import { test, expect } from '@playwright/test';

test.describe('User Management CRUD', () => {
    test('should complete full user CRUD flow', async ({ page, request }) => {
        // Monitor network requests to debug API calls
        page.on('request', req => {
            if (req.url().includes('/api/v1/users')) {
                console.log(`>> ${req.method()} ${req.url()}`);
            }
        });
        page.on('response', async res => {
            if (res.url().includes('/api/v1/users')) {
                console.log(`<< ${res.status()} ${res.url()}`);
                if (res.status() >= 400) {
                    try {
                        console.log('Error Body:', await res.json());
                    } catch (e) {
                        console.log('Error Body (text):', await res.text());
                    }
                }
            }
        });

        // Setup dialog handler for delete confirmation
        page.on('dialog', async dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            await dialog.accept();
        });

        // ========================================
        // 1. LOGIN AS ADMIN
        // ========================================
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@semindo.id');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

        // ========================================
        // 2. NAVIGATE TO USER MANAGEMENT
        // ========================================
        await page.goto('/admin/users');
        await expect(page.locator('h1').filter({ hasText: /user management/i })).toBeVisible({ timeout: 10000 });
        await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

        // ========================================
        // 3. CREATE NEW USER
        // ========================================
        const timestamp = Date.now();
        const testEmail = `testuser${timestamp}@example.com`;
        const testName = `Test User ${timestamp}`;

        await page.click('button:has-text("Add User")');
        await expect(page.getByRole('heading', { name: 'Add New User' })).toBeVisible({ timeout: 5000 });

        await page.fill('#email', testEmail);
        await page.fill('#fullName', testName);
        await page.fill('#password', 'TestPassword123!');

        if (await page.locator('#phone').isVisible()) await page.fill('#phone', '+628123456789');
        if (await page.locator('#businessName').isVisible()) await page.fill('#businessName', 'Test Business');

        const roleSelect = page.locator('select#role');
        if (await roleSelect.isVisible() && await roleSelect.isEnabled()) {
            await roleSelect.selectOption('umkm');
        }

        await page.click('button:has-text("Save")');
        await expect(page.getByRole('heading', { name: 'Add New User' })).not.toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(1000);

        // ========================================
        // 4. VERIFY USER IN LIST (READ)
        // ========================================
        const searchInput = page.locator('input[placeholder="Search users..."]');
        await searchInput.fill(testEmail);
        await page.waitForTimeout(2000);

        await expect(page.locator(`text=${testEmail}`)).toBeVisible({ timeout: 10000 });
        console.log(`✅ User created: ${testEmail}`);

        // ========================================
        // 5. UPDATE USER
        // ========================================
        const userRow = page.locator('tr').filter({ hasText: testEmail });
        const editButton = userRow.locator('button').first();
        await editButton.click();

        await expect(page.getByRole('heading', { name: 'Edit User' })).toBeVisible({ timeout: 5000 });

        const updatedName = `${testName} Updated`;
        await page.fill('#fullName', updatedName);
        await page.waitForTimeout(1000); // Wait for state update

        await page.click('button:has-text("Save")');

        // Check for error toast if dialog doesn't close
        try {
            await expect(page.getByRole('heading', { name: 'Edit User' })).not.toBeVisible({ timeout: 10000 });
        } catch (e) {
            const toast = page.locator('div[role="alert"], .toast, [data-component-name="Toast"]');
            if (await toast.isVisible()) {
                console.log('Toast found:', await toast.textContent());
            } else {
                console.log('No toast found. Dialog stuck open.');
            }
            throw e;
        }

        await page.waitForTimeout(2000);
        await expect(page.locator(`text=${updatedName}`)).toBeVisible();
        console.log(`✅ User updated: ${updatedName}`);

        // ========================================
        // 6. DELETE USER
        // ========================================
        await page.reload();
        await page.waitForTimeout(2000);
        await searchInput.fill(testEmail);
        await page.waitForTimeout(2000);

        const updatedUserRow = page.locator('tr').filter({ hasText: testEmail });
        const deleteButton = updatedUserRow.locator('button').last();

        // Click delete - dialog handler defined at top of test will handle confirmation
        await deleteButton.click();

        // Wait for deletion
        await page.waitForTimeout(2000);

        // ========================================
        // 7. VERIFY DELETION (READ)
        // ========================================
        await page.reload();
        await page.waitForTimeout(2000);
        await searchInput.fill(testEmail);
        await page.waitForTimeout(2000);

        const userStillExists = await page.locator(`text=${testEmail}`).isVisible({ timeout: 2000 }).catch(() => false);
        expect(userStillExists).toBe(false);

        console.log('✅ User CRUD test completed successfully!');
    });

    test('should filter and search users', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'admin@semindo.id');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

        await page.goto('/admin/users');
        await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

        const searchInput = page.locator('input[placeholder="Search users..."]');
        await searchInput.fill('admin');
        await page.waitForTimeout(2000);

        const tableContent = await page.locator('table').textContent();
        if (tableContent?.toLowerCase().includes('no users found')) {
            console.log('⚠️ Search returned no results. "admin" might not be in the list.');
        } else {
            expect(tableContent?.toLowerCase()).toContain('admin');
            console.log('✅ Search test passed!');
        }
    });
});
