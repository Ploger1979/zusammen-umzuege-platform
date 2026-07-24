# Phase 40: Umzugsangebot / Festpreisangebot System Plan

## 1. Goal Description
Implement a dedicated admin feature to generate professional moving offers (Umzugsangebote) for customers following a viewing appointment (on-site, online, or by phone). This system will visually match the existing high-quality invoice design but will be completely separated at the database, API, and logic layers to ensure the accounting and invoice systems remain untouched and secure.

## 2. Recommended Architecture

### Data Model
* **Recommendation**: **Create a NEW `Offer` model (`src/models/Offer.ts`)**.
* **Why?**: Mixing offers with invoices is dangerous for accounting. Invoices require strict, sequential numbering and specific tax logic. Offers are non-binding proposals with completely different fields (e.g., `validUntilDate`, `viewingType`, multiple price options, inventory lists). A separate model ensures zero risk to the billing system.

### API Routes
* **Recommendation**: **Create NEW API routes (`src/app/api/offers/...`)**.
* **Why?**: Separation of concerns. We must not modify `api/invoices` to handle offers. A dedicated `offers` API ensures clean CRUD operations specifically tailored to the offer data structure.

### UI Component & Print Layout
* **Recommendation**: **Create `OfferGenerator.tsx`** based heavily on the visual structure of `InvoiceGenerator.tsx`.
* **Why?**: The user explicitly requested the exact same visual design (header, footer, typography, watermark). By cloning the outer print shell of the invoice generator but replacing the inner contents (Option A / Option B instead of standard invoice items), we achieve 100% visual consistency without tangling the React states of invoices and offers.

## 3. Files to be Created

#### Models
* `[NEW]` src/models/Offer.ts (Schema for storing offer data, price options, viewing types, etc.)

#### API Routes
* `[NEW]` src/app/api/offers/route.ts
* `[NEW]` src/app/api/offers/[id]/route.ts
* `[NEW]` src/app/api/offers/request/[requestId]/route.ts

#### Frontend Components
* `[NEW]` src/components/OfferGenerator.tsx (The main interactive UI and Print layout)

#### Admin Pages
* `[NEW]` src/app/[locale]/admin/offer/page.tsx (The page rendering the OfferGenerator)

## 4. Files to be Modified

#### Admin Requests Page
* `[MODIFY]` src/app/[locale]/admin/requests/page.tsx
  - Add the "Angebot erstellen" button next to each request.
  - Link this button to `/de/admin/offer?request_id=...`

## 5. Data Model Plan (`Offer.ts`)
The schema will include:
* `requestId` (String, linking to the original request)
* `offerNr` (String, distinct from invoiceNr, e.g., "ANG-2026-001")
* `offerDate` & `validUntil` (Dates)
* `customer` (Name, Address, Phone, Email)
* `viewingType` (Enum: 'Vor Ort', 'Online', 'Telefonisch')
* `greetingText` (String)
* `includedServices` (Array of Strings)
* `inventoryList` (Array of Strings)
* `pricing`:
  - `optionA`: { description: string, price: number }
  - `optionB`: { description: string, price: number }
  - `taxMode`: 'inkl. MwSt.' | 'zzgl. MwSt.'
* `legalNote` & `changeCondition` (Strings)

## 6. Safe Implementation Phases

**Phase 40.1: Database & API Foundation**
- Create the `Offer.ts` Mongoose model.
- Create the REST API endpoints to save, fetch, and update offers.
- *Risk*: Minimal. Totally isolated from `Invoice.ts`.

**Phase 40.2: UI & Component Construction**
- Build `OfferGenerator.tsx`.
- Implement the exact print/PDF CSS classes used in `InvoiceGenerator.tsx`.
- Map the required text fields (Document Title, Subtitle based on viewing type, Legal Notes).
- *Risk*: Minimal. Independent component.

**Phase 40.3: Integration**
- Add the "Angebot erstellen" button in the Admin Requests list.
- Ensure the button pre-fills the `OfferGenerator` with customer data from the database.
- *Risk*: Low. Modifies the Admin Request UI slightly without affecting Request logic.

## 7. Risks & Final Recommendation

* **Risk**: Confusion between Offer and Invoice numbers.
* **Mitigation**: Prefix offer numbers clearly (e.g., `ANG-` vs `RE-`) and ensure the UI explicitly says "Angebot erstellen".
* **Final Recommendation**: Proceed with a completely decoupled architecture (New Model, New API, New Component). This guarantees 100% safety for the existing production invoice system while delivering the exact visual outcome the user requested.
