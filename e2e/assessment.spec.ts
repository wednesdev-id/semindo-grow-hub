import { test, expect } from '@playwright/test';

test('Assessment Flow', async ({ page }) => {
    const uniqueId = Date.now().toString();
    const email = `test${uniqueId}@example.com`;
    const password = 'password123';

    // 1. Register
    await page.goto('/register');
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    await page.check('input[name="agreeTerms"]');
    await page.click('button[type="submit"]');

    // 2. Login (if not auto-logged in, but RegisterPage redirects to /login)
    await page.waitForURL('/login');
    await expect(page.getByText('Welcome Back!')).toBeVisible();
    // Wait for hydration/animation
    await page.waitForTimeout(1000);
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeEditable();
    await emailInput.fill(email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for dashboard or home redirect
    await page.waitForURL(/\/dashboard|\//);
    await expect(page.getByText('Dashboard')).toBeVisible(); // Confirm login success

    // 3. Navigate to Assessment Landing Page
    await page.goto('/assessment');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/Semindo/);
    await expect(page.getByText('Self-Assessment UMKM')).toBeVisible();

    // 4. Start Assessment
    // Wait for templates to load
    await expect(page.getByText('Mulai Asesmen').first()).toBeVisible();
    await page.getByText('Mulai Asesmen').first().click();

    // 5. Wait for Wizard to load
    await page.waitForURL(/\/assessment\/[a-zA-Z0-9-]+/);
    await expect(page.getByText('Bagian 1')).toBeVisible();

    // 6. Fill out the form (Generic approach)
    while (true) {
        const submitButton = page.getByRole('button', { name: 'Kirim Jawaban' });
        const nextButton = page.getByRole('button', { name: 'Lanjut' });

        // Fill visible inputs
        const radioGroups = await page.locator('[role="radiogroup"]').all();
        for (const group of radioGroups) {
            await group.locator('button, input[type="radio"]').first().click();
        }

        const textInputs = await page.locator('textarea, input[type="text"]').all();
        for (const input of textInputs) {
            await input.fill('Test Answer');
        }

        if (await submitButton.isVisible()) {
            await submitButton.click();
            break;
        } else if (await nextButton.isVisible()) {
            await nextButton.click();
            await page.waitForTimeout(500);
        } else {
            // Fallback if no buttons found (maybe loading)
            await page.waitForTimeout(1000);
            if (!await nextButton.isVisible() && !await submitButton.isVisible()) {
                throw new Error('No navigation button found');
            }
        }
    }

    // 7. Verify Results Page
    await page.waitForURL(/\/assessment\/results\/[a-zA-Z0-9-]+/);
    await expect(page.getByText('Laporan Hasil Assessment')).toBeVisible();
    await expect(page.getByText('Skor Anda')).toBeVisible();
});
