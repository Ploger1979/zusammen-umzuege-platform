# Phase 40.1: Offer Model and API Foundation Audit

## 1. Files Created
* `src/models/Offer.ts` (Mongoose Schema for the new Offer system)
* `src/lib/offer-number.ts` (Helper logic to auto-increment offer numbers)
* `src/app/api/offers/route.ts` (POST route to create or update offers)
* `src/app/api/offers/[id]/route.ts` (GET and PUT routes for specific offer IDs)
* `src/app/api/offers/request/[requestId]/route.ts` (GET route to fetch an offer linked to a specific request ID)

## 2. Files Modified
* No existing files were modified. The logic is 100% decoupled from the Invoice system and the Request system to ensure zero risk to production stability.

## 3. Offer Model Fields
The `Offer` schema includes the following exact fields:
* `requestId` (String, required)
* `offerNr` (String, unique, required)
* `offerDate` (Date)
* `validUntil` (Date, required)
* `customerName`, `customerAddress`, `customerPhone`, `customerEmail`
* `viewingType` (Enum: 'besichtigung_vor_ort', 'online_besichtigung', 'telefonische_beratung')
* `greetingText`
* `includedServices` (Array of Strings)
* `inventoryList` (Array of Strings)
* `pricing`
  * `optionA`: `{ title, description, price }`
  * `optionB`: `{ title, description, price }`
  * `taxMode`: Enum ('inkl_mwst', 'zzgl_mwst')
* `legalNote` (Safe default string included)
* `changeCondition` (Safe default string included)
* Mongoose Timestamps (`createdAt`, `updatedAt`)

## 4. Offer Number Format
* Format: `ANG-YYYY-001`
* Logic implemented in `src/lib/offer-number.ts`. It safely checks the database for existing numbers starting with `ANG-YYYY-` and increments the suffix by `1` without conflicting with invoice numbers (`RE-YYYY-`).

## 5. Auth Protection Added
* **Admin Verification**: All API routes (`POST`, `GET`, `PUT`) use `getAdminSession()`.
* **Security Rule**: The endpoint strictly checks `if (!session || (session.role !== 'admin' && session.role !== 'superadmin'))`.
* **Rejection**: Unauthorized requests return `403 Unauthorized` consistently with the existing API structure. No public exposure of offers.

## 6. Validations Applied
* `requestId`, `customerName`, `viewingType`, and `validUntil` are required fields in the POST body. Missing fields reject the request with `400 Bad Request`.
* Prices default to `0` and taxMode defaults to `inkl_mwst`.

## 7. Build and Test Results
* **`npm run build`**: ✅ Passed. Next.js compiled successfully in ~22 seconds with no new warnings or type errors.
* **`npm run test:unit`**: ✅ Passed. (6 test files, 35 tests passed)
* **`npm run test:integration`**: ✅ Passed. (4 test files, 15 tests passed).

## 8. Risks or Follow-Up Steps
* **Risk**: None detected. The backend foundation is completely isolated.
* **Follow-up Step**: Proceed to Phase 40.2 to build the frontend component (`OfferGenerator.tsx`) and the admin page (`admin/offer/page.tsx`). After that, link the "Angebot erstellen" button in the admin requests view.
