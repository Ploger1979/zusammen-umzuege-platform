# Phase 36: Safe Playwright E2E Public Request Submission

## Goal Achieved
Successfully implemented and passed the first end-to-end form submission test for the public request flow (`/de/angebot`). The test fills out a multi-step form with fake data, submits it, verifies the success UI, and asserts that the data was safely saved to the in-memory MongoDB server.

## Files Changed
- `tests/e2e/public-request-submission.spec.ts` (CREATED): Contains the E2E flow.
- `playwright/global-setup.ts` (MODIFIED): Hardcoded `MongoMemoryServer` port to `65023` and `dbName` to `testdb` to ensure consistent connection across test workers and Next.js server.
- `playwright.config.ts` (MODIFIED): Hardcoded `MONGODB_URI` environment variable for Next.js to match the global setup server.
- `src/app/api/requests/route.ts` (MODIFIED): Enhanced API error logging inside the catch block for easier debugging.

## E2E Flow Tested
1. Visited `/de/angebot` directly.
2. Verified form rendered correctly.
3. Filled in fake customer and address data.
4. Clicked the `submit` button.
5. Waited for and verified the translation-agnostic success heading (`erfolgreich|Vielen Dank|Anfrage versendet`).
6. Successfully connected to `mongodb-memory-server` from the Playwright worker process and confirmed the request was saved as expected.

## Test Data Used
- **First Name:** E2E
- **Last Name:** Testkunde
- **Email:** e2e-test@example.com
- **Phone:** 0123456789
- **From:** Musterstraße 1, 30159 Hannover
- **To:** Teststraße 2, 10115 Berlin
- **Date:** 2026-07-01T10:00

## Proof External Services Were Mocked
The test runs utilizing the Playwright `webServer` config which explicitly injects `MOCK_EXTERNAL_SERVICES='true'` into the Next.js process. Consequently, `sendWhatsAppNotification` inside `/api/requests/route.ts` bypasses network calls when `process.env.MOCK_EXTERNAL_SERVICES` is truthy (handled within the WhatsApp lib), ensuring zero real notifications were fired. Production database protection logic (`src/lib/mongodb.ts`) also remains active, explicitly blocking connections missing `127.0.0.1` or `localhost`.

## Results
- **Playwright E2E Result:** ✅ 1 passed (33.7s) - UI success state and memory database assertion passed.
- **Unit Tests Result:** ✅ 35 passed across 6 test files.
- **Integration Tests Result:** ✅ 15 passed across 4 test files.
- **Build Result:** ✅ Production build generated successfully (`Compiled successfully in 32.6s`).

## UI Selector Learnings
- **Dynamic Classes & Locales:** Relying on strict string matches for success states or button text is flaky due to `next-intl` rendering dynamic translations (`t('successTitle')`). Standardizing on regex matches (`/erfolgreich|Vielen Dank|Anfrage versendet/i`) and explicit HTML roles (`button[type="submit"]`) improved resilience.
- **Form Fields:** Using standard CSS selectors (`input[name="firstName"]`) is optimal for generic controlled inputs.
- **Mongoose Assertions:** Because request schemas use nested objects (`customer.email`), standard `findOne({ email: ... })` queries will fail. Dot notation (`{'customer.email': '...'}`) must be used.
