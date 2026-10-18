# Online mock preorder update

The new order page uses the updated PDF's name, date, quantities, price, ingredients/allergens, storage instructions, pickup windows and optional price feedback. It excludes the price-acknowledgement field and deadline as requested. The interface uses a single white form with small image placeholders, plain fields and a live hypothetical total.

Submitting saves a D1 record and returns a reference only after the save succeeds. Errors retain form contents. Retries use a unique key to prevent duplicate rows. The server validates all submitted fields and uses its own unit price. Admin data is protected with Sites sign-in and the configured owner email allowlist. Edits use a version number to detect concurrent changes; the CSV export escapes formula-leading strings.

The homepage links now point to `/order`. Its original visual design and the user's removal of the extra mock-order FAQ and bottom call-to-action remain preserved. The prior PDF-email instructions and obsolete plant-based/storage claims have been updated. No email service or payment system is involved.

The earlier `design-notes.md` documents the original landing page design; the PDF-download ordering workflow it describes has been superseded by this update.
