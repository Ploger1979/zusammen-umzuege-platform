import { test, expect } from '@playwright/test';

test.describe('Public Request Navigation', () => {
    test('navigate from homepage to offer form and verify fields', async ({ page }) => {
        // 1. Homepage loads successfully
        await page.goto('/de');
        
        // Wait for page load
        await expect(page).toHaveTitle(/Zusammen/i);

        // Wait for page hydration
        await page.waitForLoadState('networkidle');

        // 2. Main CTA for quote/request is visible
        const offerButton = page.locator('a[href="/de/angebot"]').filter({ hasText: /Schnelles Angebot/i }).first();
        await expect(offerButton).toBeVisible();

        // 3. Clicking CTA opens the request form page
        // Use Promise.all to wait for navigation
        const navigationPromise = page.waitForNavigation({ url: /.*\/angebot/ });
        await offerButton.click();
        await navigationPromise;

        // Verify URL changes
        await expect(page).toHaveURL(/.*\/angebot/);

        // 4. Form renders without crash
        // Wait for QuoteFormFull container
        const formElement = page.locator('form');
        await expect(formElement).toBeVisible();

        // 5. Required customer input fields are visible
        // Since QuoteFormFull step 1 and step 2 and 3 are visible at once (or just check the DOM)
        // Let's verify standard step 3/4 customer info fields
        const firstNameInput = page.locator('input[name="firstName"]');
        await expect(firstNameInput).toBeVisible();

        const lastNameInput = page.locator('input[name="lastName"]');
        await expect(lastNameInput).toBeVisible();

        const emailInput = page.locator('input[name="email"]');
        await expect(emailInput).toBeVisible();

        const phoneInput = page.locator('input[name="phone"]');
        await expect(phoneInput).toBeVisible();

        // Verify some other step fields like services or moveType
        const privateMoveRadio = page.locator('input[name="moveType"][value="privat"]');
        await expect(privateMoveRadio).toBeVisible();
    });
});
