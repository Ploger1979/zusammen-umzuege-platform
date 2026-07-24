import { test, expect } from '@playwright/test';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../src/models/User';
import Request from '../../src/models/Request';

// ─────────────────────────────────────────────────────────────────────────────
// Phase 38: Admin Requests Flow E2E Test
//
// Safety guarantees:
//  - Uses ONLY in-memory mongodb-memory-server (mongodb://127.0.0.1:65023/testdb)
//  - Never touches production MongoDB
//  - Fake admin + fake customer request only
//  - No real emails or WhatsApp triggered
//  - No invoices created, no requests modified or deleted
//
// URL note: localePrefix is 'as-needed' → default locale 'de' has NO prefix.
//  Routes: /login, /admin/requests (NOT /de/login, /de/admin/requests)
// ─────────────────────────────────────────────────────────────────────────────

const FAKE_ADMIN_EMAIL    = 'e2e-requests-admin@example.com';
const FAKE_ADMIN_PASSWORD = 'TestPassword123!';
const FAKE_ADMIN_NAME     = 'E2E Requests Admin';

const FAKE_REQUEST = {
    firstName: 'E2E',
    lastName:  'Testkunde',
    email:     'e2e-customer@example.com',
    phone:     '0511123456',
    from:      'Musterstraße 1, 30159 Hannover',
    to:        'Teststraße 2, 10115 Berlin',
};

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:65023/testdb';

// ─── Helpers ───────────────────────────────────────────────────────────────

async function connectDB() {
    if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(MONGODB_URI);
    }
}

async function seedAll() {
    await connectDB();

    // Admin user
    await User.deleteOne({ email: FAKE_ADMIN_EMAIL });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(FAKE_ADMIN_PASSWORD, salt);
    await User.create({
        name: FAKE_ADMIN_NAME,
        email: FAKE_ADMIN_EMAIL,
        password: hashedPassword,
        role: 'admin',
    });

    // Customer request
    await Request.deleteMany({ 'customer.email': FAKE_REQUEST.email });
    await Request.create({
        customer: {
            firstName: FAKE_REQUEST.firstName,
            lastName:  FAKE_REQUEST.lastName,
            phone:     FAKE_REQUEST.phone,
            email:     FAKE_REQUEST.email,
        },
        moveType: 'privat',
        services: ['umzug'],
        addresses: {
            from: FAKE_REQUEST.from,
            to:   FAKE_REQUEST.to,
        },
        details: {
            floorsFrom:   2,
            floorsTo:     0,
            elevatorFrom: false,
            elevatorTo:   true,
            parking:      true,
            assembly:     false,
            date:         new Date('2026-08-01'),
        },
        items: [
            { key: 'sofa',    qty: 1 },
            { key: 'bett',    qty: 1 },
            { key: 'cartons', qty: 20 },
        ],
        message: 'E2E Test Anfrage — bitte ignorieren',
        status:  'new',
    });

    console.log('✅ [E2E] Seeded fake admin + fake request into memory DB');
}

async function cleanupAll() {
    await connectDB();
    await User.deleteOne({ email: FAKE_ADMIN_EMAIL });
    await Request.deleteMany({ 'customer.email': FAKE_REQUEST.email });
    console.log('🧹 [E2E] Cleaned up fake admin + fake request from memory DB');
    if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
    }
}

// ─── Helper: login as fake admin ────────────────────────────────────────────

async function loginAsAdmin(page: any) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.fill('input[type="email"][name="email"]', FAKE_ADMIN_EMAIL);
    await page.fill('input[name="password"]', FAKE_ADMIN_PASSWORD);
    await page.locator('form button[type="submit"]').click();
    // Wait for admin dashboard to load
    await expect(page.getByRole('button', { name: /Abmelden|Logout/i }))
        .toBeVisible({ timeout: 20000 });
}

// ─────────────────────────────────────────────────────────────────────────────

test.describe('Admin Requests Flow (E2E)', () => {

    // Serial mode: prevents ECONNRESET from concurrent logins hitting dev server
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(async () => {
        await seedAll();
    });

    test.afterAll(async () => {
        await cleanupAll();
    });

    // ─── Test 1: Admin dashboard loads after login ───────────────────────────

    test('admin can log in and reach the requests dashboard', async ({ page }) => {
        await loginAsAdmin(page);

        // Confirm URL is /admin/requests
        expect(page.url()).toMatch(/\/admin\/requests/);

        // h1 heading must be visible
        await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

        // Logout button confirms authentication
        await expect(page.getByRole('button', { name: /Abmelden|Logout/i })).toBeVisible();
    });

    // ─── Test 2: Fake request appears in the list ────────────────────────────

    test('fake customer request appears in the admin requests list', async ({ page }) => {
        await loginAsAdmin(page);

        // Wait for the list to load (networkidle handles the fetch from /api/requests)
        await page.waitForLoadState('networkidle');

        // The fake customer full name must appear somewhere on the page
        const fullName = `${FAKE_REQUEST.firstName} ${FAKE_REQUEST.lastName}`;
        await expect(page.getByText(fullName)).toBeVisible({ timeout: 10000 });
    });

    // ─── Test 3: Customer email is visible in the request card ───────────────

    test('fake customer email is visible in the request card', async ({ page }) => {
        await loginAsAdmin(page);
        await page.waitForLoadState('networkidle');

        // The admin requests page shows customer email under the name
        await expect(page.getByText(FAKE_REQUEST.email)).toBeVisible({ timeout: 10000 });
    });

    // ─── Test 4: Customer phone is visible in the request card ───────────────

    test('fake customer phone is visible in the request card', async ({ page }) => {
        await loginAsAdmin(page);
        await page.waitForLoadState('networkidle');

        // The admin requests page shows customer phone next to email
        await expect(page.getByText(FAKE_REQUEST.phone)).toBeVisible({ timeout: 10000 });
    });

    // ─── Test 5: Move type badge is visible ──────────────────────────────────

    test('move type badge "privat" is visible in the request card', async ({ page }) => {
        await loginAsAdmin(page);
        await page.waitForLoadState('networkidle');

        // The card shows a badge with the moveType value
        await expect(page.getByText('privat')).toBeVisible({ timeout: 10000 });
    });

    // ─── Test 6: Invoice/action button is visible in the request card ────────

    test('create-invoice button is visible next to the fake request', async ({ page }) => {
        await loginAsAdmin(page);
        await page.waitForLoadState('networkidle');

        // The request card shows a "Rechnung erstellen" link (since no invoice exists)
        // This confirms the request is rendered as a full card with action buttons
        const invoiceButton = page.locator('a[href*="invoice?request_id"]').first();
        await expect(invoiceButton).toBeVisible({ timeout: 10000 });
    });
});
