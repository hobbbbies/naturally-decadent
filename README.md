# Naturally Decadent

A cake showcase with a simple online mock preorder form and an editable database. Source lives in `/Users/stefanvitanov/repos/naturally-decadent`.

## Pages

- `/` — original cake homepage, with its local edits preserved and ordering links updated.
- `/order` — name, date, four cake quantities, hypothetical pickup window, and optional price feedback.
- `/admin` — protected list of saved responses, an edit form, and CSV export.

All prices are $5.50 CAD per 80 g slice. The order page follows `Updated_Mock_Preorder_Form.docx.pdf`, with the deadline and price-acknowledgement field deliberately omitted. Nothing is charged, prepared, or reserved. There is no email-sending integration; submissions save directly to the database.

## Database and editing

The hosted site uses Cloudflare D1 (SQLite-compatible) with one `preorders` table. Open `/admin` while signed in with the existing Sites owner account to view and edit submissions. The hosted `ADMIN_EMAILS` setting controls admin access and is checked on every admin endpoint. The contact email on the website is separate from the administrator's sign-in account.

Choose **Edit**, change the name, date, quantities, pickup window or price feedback, and select **Save changes**. Original submission timestamps remain unchanged. If another edit occurred meanwhile, the app rejects an outdated save instead of silently overwriting it.

Choose **Export CSV** to download responses for a spreadsheet. Editing an exported CSV does not automatically update the database; use the admin editor for saved changes. Sites Settings also provides a database viewer.

A unique submission key prevents accidental duplicates when the same request is retried. It does not attempt to identify the same participant across different devices or separate submissions. Totals are calculated from the fixed price on the server. There is no delete button or public endpoint for reading submitted names.

## Local development

Node 22.13+ is required. Dependencies are installed in this checkout.

```sh
npm run dev -- --hostname 127.0.0.1 --port 5173
```

Open http://127.0.0.1:5173/order. Local and hosted databases are separate.

The local development server simulates ChatGPT sign-in. The ignored `.dev.vars` configures the simulated local administrator. Visit http://127.0.0.1:5173/admin and use the sign-in button. The simulation is excluded from production.

For a fresh checkout, install dependencies, create an ignored `.dev.vars` containing `ADMIN_EMAILS="seedy@sites.test"`, build, and apply the initial local migration:

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_lying_stryfe.sql
```

Do not replay a migration already applied. Local SQLite files are under `.wrangler/state/v3/d1/` and may be inspected with a SQLite browser while the local server is stopped. Local test data is not uploaded to the hosted database.

## Editing content

- Order page and form: `app/order/`.
- Shared flavours, ingredients, allergens, pickup windows, price and storage text: `lib/catalog.ts`.
- Admin interface: `app/admin/`.
- Database schema: `db/schema.ts`.
- Form validation: `lib/order-validation.ts`.
- Backend routes: `app/api/`.
- Simple form/admin styling: `app/globals.css`.
- Homepage HTML: `content/home.html`; styles: `public/home.css`.
- Cake photo placeholders: `public/assets/*-placeholder.svg`.

Replace photo paths and alt text in `app/order/order-form.tsx` and `content/home.html` when adding actual photos. Remove the corresponding placeholder captions too. Keep homepage descriptions consistent with `lib/catalog.ts`. The lemon recipe contains honey and is not vegan. Storage follows the new PDF: keep frozen, thaw in the refrigerator at 4°C or below, and consume within three days of thawing.

The previous static website is preserved locally under ignored `artifacts/legacy-static/`. `dist/` now contains generated deployment output; edit the source files above, not `dist/`.

## Checks

```sh
npx tsc --noEmit
node --experimental-strip-types --test tests/money.test.mjs
node tests/preorders.integration.mjs
npm run build
```

The integration tests require the local dev server and initialized local database. They refuse non-local URLs and create clearly labelled local QA records. They cover server validation, price calculation, retry/concurrency behavior, admin authorization, editing conflicts and CSV escaping.

## Hosting

The existing Sites project and private audience are preserved. Publishing applies versioned schema migrations to hosted D1 before deploying the backend. Never put database files or `.dev.vars` into source control. The `ADMIN_EMAILS` runtime setting must remain configured for the owner account. Keep the page unindexed while it is a mock experiment.
