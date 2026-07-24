# Phase 40.3: Connect Angebot Button Audit

## 1. Files Modified
* `src/app/[locale]/admin/requests/page.tsx`

## 2. Button Placement & Visual Style
* Added the "Angebot erstellen" button directly next to the existing "Rechnung erstellen" / "Rechnung bearbeiten" buttons inside the request card action area.
* **Style:** The button uses the same Tailwind CSS styling family but with a distinct, clean `text-[#16a34a] border border-[#16a34a]` (green outline) style on light mode and `bg-gray-800` on dark mode. This visually separates it from the primary yellow Invoice button without overcrowding the UI.

## 3. Route Used
* `href="/de/admin/offer?request_id=${req._id}"`
* This correctly maps to the protected `OfferGenerator` page which parses the `request_id` from the URL parameters.

## 4. Prefill Behavior
* The `OfferGenerator` component (built in Phase 40.2) automatically parses `request_id`.
* It calls `/api/offers/request/${id}` to check if a previously saved offer exists.
* If no offer exists, it falls back to calling `/api/requests/${id}` and seamlessly prefills the `customerName`, `customerAddress`, `customerPhone`, and `customerEmail`.

## 5. Build and Test Results
* **`npm run build`**: ✅ Passed. Compiled successfully in ~30 seconds.
* **`npm run test:unit`**: ✅ Passed. (6 test files, 35 tests passed).
* **`npm run test:integration`**: ✅ Passed. (4 test files, 15 tests passed).

## 6. Risks or Follow-Up Steps
* **Risk**: The "Angebot erstellen" button currently says "Angebot erstellen" regardless of whether an offer was already created for that request or not (unlike the Invoice button which switches to "Rechnung bearbeiten").
* **Mitigation**: This is completely safe and fully functional since clicking it will load the existing offer data via the API anyway. However, a potential visual follow-up for the future could be fetching `hasOffer` for each request in the admin dashboard to toggle the text to "Angebot bearbeiten".
* **Status**: The Umzugsangebot feature is now fully implemented End-to-End for admins safely without impacting any invoice architecture.
