import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../src/models/User';

// ─────────────────────────────────────────────────────────────────────────────
// Phase 37: Admin Login E2E Test
//
// Safety guarantees:
//  - Uses ONLY the in-memory mongodb-memory-server (mongodb://127.0.0.1:65023/testdb)
//  - Never touches production MongoDB
//  - Uses fake admin credentials only (e2e-admin@example.com)
//  - No real emails or WhatsApp triggered
//
// URL note: The app uses next-intl with localePrefix: 'as-needed'.
//  The default locale (de) has NO locale prefix in the URL.
//  Routes are: /login, /admin/requests (NOT /de/login, /de/admin/requests)
// ─────────────────────────────────────────────────────────────────────────────

const FAKE_ADMIN_EMAIL = 'e2e-admin@example.com';
const FAKE_ADMIN_PASSWORD = 'TestPassword123!';
const FAKE_ADMIN_NAME = 'E2E Admin';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:65023/testdb';

/**
 * Seed a fake admin user directly into the in-memory database.
 * This avoids the register endpoint (which requires ADMIN_SECRET).
 */
async function seedFakeAdmin() {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(MONGODB_URI);
    }
    // Remove any leftover from a previous run
    await User.deleteOne({ email: FAKE_ADMIN_EMAIL });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(FAKE_ADMIN_PASSWORD, salt);

    await User.create({
        name: FAKE_ADMIN_NAME,
        email: FAKE_ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
    });

    console.log('✅ [E2E] Seeded fake admin user:', FAKE_ADMIN_EMAIL);
}

async function cleanupFakeAdmin() {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(MONGODB_URI);
    }
    await User.deleteOne({ email: FAKE_ADMIN_EMAIL });
    console.log('🧹 [E2E] Removed fake admin user from memory DB');
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
    }
}

test.describe('Admin Login Flow (E2E)', () => {

    // Run all tests in this suite SERIALLY to avoid ECONNRESET from parallel login requests
    // hitting the dev server simultaneously
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async () => {
        await seedFakeAdmin();
    });

    test.afterAll(async () => {
        await cleanupFakeAdmin();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Positive Tests
    // ─────────────────────────────────────────────────────────────────────────

    test('admin login page loads and shows login form', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // The page has two "Anmelden" buttons: the tab switcher and the submit button.
        // Use .first() to target the tab button (not the submit button)
        const loginTabButtons = page.getByRole('button', { name: /Anmelden/i });
        // At least one (the tab) should be visible
        await expect(loginTabButtons.first()).toBeVisible();

        // Email and password inputs must be visible
        const emailInput = page.locator('input[type="email"][name="email"]');
        const passwordInput = page.locator('input[name="password"]');
        await expect(emailInput).toBeVisible();
        await expect(passwordInput).toBeVisible();

        // Submit button (inside form) should be visible
        const submitButton = page.locator('form button[type="submit"]');
        await expect(submitButton).toBeVisible();
    });

    test('successful login with fake admin redirects to admin dashboard', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Fill login form
        await page.fill('input[type="email"][name="email"]', FAKE_ADMIN_EMAIL);
        await page.fill('input[name="password"]', FAKE_ADMIN_PASSWORD);

        // Submit (click the submit button inside the form, not the tab)
        await page.locator('form button[type="submit"]').click();

        // After successful login, app redirects to /admin/requests
        // Use waitForSelector instead of waitForURL to be more resilient
        // (waitForURL can miss the navigation if it already completed)
        const logoutButton = page.getByRole('button', { name: /Abmelden|Logout/i });
        await expect(logoutButton).toBeVisible({ timeout: 20000 });

        // Confirm we are on admin/requests
        expect(page.url()).toMatch(/\/admin\/requests/);

        // Admin page heading should be visible
        const adminHeading = page.locator('h1');
        await expect(adminHeading).toBeVisible({ timeout: 10000 });
    });

    test('logged-in admin can access protected route directly', async ({ page }) => {
        // Step 1: Log in
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        await page.fill('input[type="email"][name="email"]', FAKE_ADMIN_EMAIL);
        await page.fill('input[name="password"]', FAKE_ADMIN_PASSWORD);
        await page.locator('form button[type="submit"]').click();

        // Wait for the logout button to appear (admin dashboard loaded)
        const logoutButton = page.getByRole('button', { name: /Abmelden|Logout/i });
        await expect(logoutButton).toBeVisible({ timeout: 20000 });

        // Step 2: Navigate directly to the protected route again
        await page.goto('/admin/requests');
        await page.waitForLoadState('networkidle');

        // Should STAY on /admin/requests (not redirected to login)
        expect(page.url()).toMatch(/\/admin\/requests/);

        // Logout button still visible = still authenticated
        await expect(logoutButton).toBeVisible();
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Negative Tests
    // ─────────────────────────────────────────────────────────────────────────

    test('login with wrong password shows error and no dashboard access', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        // Correct email, wrong password
        await page.fill('input[type="email"][name="email"]', FAKE_ADMIN_EMAIL);
        await page.fill('input[name="password"]', 'WrongPassword999!');

        await page.locator('form button[type="submit"]').click();

        // Should NOT redirect to admin — should stay on /login
        await page.waitForTimeout(3000);
        expect(page.url()).toMatch(/\/login/);
        expect(page.url()).not.toMatch(/\/admin/);

        // Error message must appear
        const errorDiv = page.locator('.bg-red-100').first();
        await expect(errorDiv).toBeVisible({ timeout: 5000 });
    });

    test('unauthenticated access to admin route redirects to login', async ({ page }) => {
        // Fresh page context has no cookie — direct navigation to admin should redirect
        await page.goto('/admin/requests');
        await page.waitForLoadState('networkidle');

        // Middleware redirects to /login (default locale, no prefix)
        expect(page.url()).toMatch(/\/login/);
        expect(page.url()).not.toMatch(/\/admin/);
    });

    test('login with unknown email shows error and no dashboard access', async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');

        await page.fill('input[type="email"][name="email"]', 'nonexistent@example.com');
        await page.fill('input[name="password"]', 'SomePassword123!');

        await page.locator('form button[type="submit"]').click();

        // Should stay on /login
        await page.waitForTimeout(3000);
        expect(page.url()).toMatch(/\/login/);
        expect(page.url()).not.toMatch(/\/admin/);

        // Error must appear
        const errorDiv = page.locator('.bg-red-100').first();
        await expect(errorDiv).toBeVisible({ timeout: 5000 });
    });
});
