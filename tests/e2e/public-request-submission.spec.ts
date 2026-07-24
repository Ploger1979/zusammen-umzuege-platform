import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import Request from '../../src/models/Request'; // Path to the model

test.describe('Public Request Submission', () => {
    test('submits a fake public request successfully', async ({ page }) => {
        // 1. Open the form page directly
        await page.goto('/de/angebot');
        await page.waitForLoadState('networkidle');

        // Verify the form loaded
        await expect(page.locator('form')).toBeVisible();

        // 2. Fill Address From
        await page.fill('input[name="addressFromStreet"]', 'Musterstraße 1');
        await page.fill('input[name="addressFromCity"]', '30159 Hannover');

        // 3. Fill Address To
        await page.fill('input[name="addressToStreet"]', 'Teststraße 2');
        await page.fill('input[name="addressToCity"]', '10115 Berlin');

        // 4. Contact Details & Date
        await page.fill('input[name="date"]', '2026-07-01T10:00');
        await page.fill('input[name="firstName"]', 'E2E');
        await page.fill('input[name="lastName"]', 'Testkunde');
        await page.fill('input[name="email"]', 'e2e-test@example.com');
        await page.fill('input[name="phone"]', '0123456789');

        // 5. Submit Form
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeEnabled();
        await submitButton.click();

        // 6. Verify Success Message (Checkmark and text)
        const successTitle = page.getByRole('heading', { name: /erfolgreich|Vielen Dank|Anfrage versendet/i });
        await expect(successTitle).toBeVisible({ timeout: 10000 });

        // 7. Safely verify in memory database
        console.log('Waiting for API to finish DB operations...');
        await page.waitForTimeout(2000);
        
        console.log('Verifying data in in-memory MongoDB...');
        const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:65023/testdb';
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(MONGODB_URI);
        }
        console.log("Total requests in DB:", await Request.countDocuments());
        console.log("All requests:", await Request.find({}));
        const savedRequest = await Request.findOne({ 'customer.email': 'e2e-test@example.com' });
        expect(savedRequest).not.toBeNull();
        expect(savedRequest?.customer?.firstName).toBe('E2E');
        expect(savedRequest?.customer?.lastName).toBe('Testkunde');
        expect(savedRequest?.status).toBe('new');
        
        await mongoose.disconnect();
    });
});
