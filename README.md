# Naturally Decadent

A responsive, single-page HTML website for the Naturally Decadent cake concept and student mock preorder experiment. No framework, install, or build is needed.

## Open the website

Open `dist/index.html` directly in your browser. All styles, illustrations, and the order PDF are local files, so the site also works offline. The clipboard button may require localhost or HTTPS; the visible email link always remains available.

For a local server, run from this directory:

```sh
python3 -m http.server 8000 --directory dist --bind 127.0.0.1
```

Then open http://127.0.0.1:8000.

## Replace the four cake photos

1. Put your photographs in `dist/assets/`, for example `chocolate.jpg`, `lemon.jpg`, `mango.jpg`, and `raspberry.jpg`.
2. In `dist/index.html`, change each product image's `src` from `assets/FLAVOUR-placeholder.svg` to your photo filename. Replace its `alt` text with a description of the actual cake.
3. Remove the corresponding `photo-label` text and update the collection note and footer when the images are no longer placeholders.

The photo areas crop with `object-fit: cover`; centered square or portrait photographs work best. The hero is a separate decorative concept illustration in the HTML.

## Edit the content

- Page copy and ingredient/allergen placeholders: `dist/index.html`.
- Colours, typography, and mobile layout: `dist/styles.css`.
- Email copy button: `dist/script.js`.
- Downloaded order form: `dist/assets/naturally-decadent-preorder-form.pdf` (unchanged copy of the supplied PDF).
- Contact address: `stefankvitanov@gmail.com` in the HTML and JavaScript.
- Storage instruction: “Keep refrigerated.”

The form has no automatic upload or sending. Visitors download it, fill it with a PDF annotation tool or print it, then manually attach the saved PDF, photo, or scan to an email. Clicking an email link opens a draft; it does not send anything or attach a file.

## Project scope

This page presents the supplied non-binding mock preorder experiment. All prices are proposed: $5.50 CAD per 80 g slice. No payment is collected, no cakes are sold, and pickup preferences are hypothetical. The exact Guelph pickup location and full ingredient/allergen information remain unconfirmed. Do not change this to a live-order promise without updating the form and the page together.

The page uses `noindex, nofollow` while it is an experiment. There are no analytics, third-party scripts, external fonts, accounts, or checkout dependencies. The Sites deployment starts private. Public access must be enabled deliberately before sharing a hosted link with participants.

See `docs/design-notes.md` for the landing-page outline and rubric mapping.
