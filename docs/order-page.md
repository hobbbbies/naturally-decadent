# Preorder page

The order page collects name, date, quantities, pickup preference, and optional price feedback. It displays the supplied ingredients, allergen details, storage instructions, and $5.50 CAD per 80 g price. Images remain placeholders. The page presents the business as a regular preorder service, with payment and exact pickup details confirmed separately. There is no deadline or price-acknowledgement field.

Submitting stores a preorder and returns a reference after a successful save. Errors retain form contents. Retries use a unique key to prevent duplicate rows, and the backend calculates totals from its own price. The admin page uses a password and database-backed sessions, with checks on every protected read, edit, and export. Existing records remain intact.

The original landing-page design notes describe earlier copy and ordering workflows and are retained as historical project documentation.
