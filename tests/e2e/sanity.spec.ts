import { test, expect } from '@playwright/test';

test('homepage loads and basic elements are visible', async ({ page }) => {
  // Go to the German homepage directly to bypass any locale redirects locally
  await page.goto('/de');

  // Verify the page title or basic element
  // Checking for 'Zusammen Umzüge' which should be present in the title or text
  await expect(page).toHaveTitle(/Zusammen/);

  // Check if a header exists to ensure the server rendered correctly
  const header = page.locator('header');
  await expect(header).toBeVisible();

  // Make sure the main CTA button (Angebot) is visible
  // We don't interact with it yet
  const angebotButton = page.getByRole('link', { name: /Angebot|Anfragen/i }).first();
  await expect(angebotButton).toBeVisible();
});
