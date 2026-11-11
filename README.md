# Naturally Decadent

A cake showcase with online preorders, a database, and password-protected administration. Source: `/Users/stefanvitanov/repos/naturally-decadent`.

## Pages

- `/` — cake homepage and ordering instructions.
- `/order` — name, required contact email, date, four cake quantities, required pickup window and price acknowledgement, optional price feedback, and confirmation reference.
- `/admin` — password login, preorder list, edit form, and CSV export.

All prices are $5.50 CAD per 80 g slice. Requests save directly to the database. Payment and pickup details are confirmed separately.

New responses require a pickup window and explicit price acknowledgement in both client and server validation. The existing database stores the proposed unit price, without a separate acknowledgement column. No new migration is required. Existing responses and the admin editor retain support for blank pickup times.

## Administration

Open `/admin` and enter the administrator password. The server reads it from the secret `ADMIN_PASSWORD` environment setting. It is never embedded in the customer-facing JavaScript.

Successful login creates an eight-hour session with an HTTP-only cookie; only a SHA-256 hash of its random token is stored in the database. Every admin endpoint checks the session. Signing out revokes it in the database. Repeated login attempts are rate limited per network address and time window. Production cookies use Secure when served over HTTPS.

The admin list includes the customer's email as a contact link, and CSV exports include an email address column. Choose **Edit** to change a customer's name, email, date, quantities, pickup window or price feedback. Choose **Save changes** to update the database. Original submission timestamps stay intact, and outdated edits are rejected if another save occurred in the meantime. Older preorders without an email remain editable. Email addresses are collected for contact; the app does not send automated email.

Choose **Delete** beside an order and confirm to permanently remove it. Deletion requires an active admin session and rejects outdated versions if the order has changed since the list was loaded.

Choose **Export CSV** for a spreadsheet copy. Editing the CSV does not update the database automatically. A unique submission key prevents duplicates when the same request is retried. There is no public endpoint for reading preorder names.

## Local development

Node 22.13+ is required. Create an ignored `.dev.vars` containing `ADMIN_PASSWORD="your-password"`. This checkout already has the requested password configured locally.

```sh
npm ci
npm run build
```

On a fresh local database, apply migrations in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_lying_stryfe.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_certain_steel_serpent.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_clumsy_pretty_boy.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0003_customer_email.sql
npm run dev -- --hostname 127.0.0.1 --port 5173
```

Apply each migration only once. The first creates preorders; the second adds admin sessions and login-attempt counters; the third permits blank pickup times while retaining existing orders; the fourth adds customer email addresses. Local and hosted databases are separate. Existing preorder records are preserved.

## Editing content

- Homepage: `content/home.html`; styles: `public/home.css`.
- Order page: `app/order/`.
- Shared flavours, ingredients, allergens, pickup windows, price, and storage: `lib/catalog.ts`.
- Admin page and login form: `app/admin/`.
- Admin session validation: `lib/admin.ts`.
- Login/logout endpoints: `app/api/admin/login/` and `app/api/admin/logout/`.
- Database schema: `db/schema.ts`; migrations: `drizzle/`.
- Shared form/admin styles: `app/globals.css`.
- Photo placeholders: `public/assets/*-placeholder.svg`.

Replace photo paths and alt text in `app/order/order-form.tsx` and `content/home.html` when adding actual photographs. The lemon recipe contains honey and is not vegan. Storage: keep frozen, thaw in the refrigerator at 4°C or below, and consume within three days of thawing.

`dist/` is generated deployment output. The original static files and old PDF are archived locally under ignored `artifacts/`.

## Checks

```sh
npx tsc --noEmit
node --experimental-strip-types --test tests/money.test.mjs
node --experimental-strip-types --test tests/order-validation.test.mjs
node tests/preorders.integration.mjs
npm run build
```

Integration tests require the local server and initialized local database. They refuse non-local URLs, create QA records, and cover submissions, retries, password login, authorization, session revocation, login rate limits, editing conflicts, and CSV escaping. Set `ADMIN_TEST_PASSWORD` when the local password differs from the requested development password.

## Hosting

The app's administrator login is independent of ChatGPT. The existing hosted preview still uses the original private Sites URL and its hosting-level access policy. Removing that outer platform gate or domain association requires a hosting/access change; changing the app login alone does not change the host. Set `ADMIN_PASSWORD` in the production hosting provider's secret settings. Publishing applies new database migrations before deploying the backend.
