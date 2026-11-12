# Shopify rubric review

Reviewed against the supplied Shopify Rubric (1).pdf. The customer site retains its existing pages and branding.

| Criterion (2 points each) | Evidence in the site |
| --- | --- |
| Value proposition | Opening copy names dairy-free no-bake cake slices, recognizable ingredients, the Guelph customer, convenience, four flavours and the $5.50 CAD / 80 g price. |
| Product/service offering | Four illustrated flavours with distinct ingredient-based descriptions, price, serving weight, full ingredients, allergens and frozen-storage instructions. Lemon's honey/non-vegan detail is visible. |
| Target/customer fit | Guelph location and local pickup; language for dessert lovers avoiding dairy or refined sugar; explanation that refined-sugar-free is not sugar-free. |
| Customer journey/functionality | Each flavour links to the existing form and preselects one slice. Contact email, quantities, pickup preference and price acknowledgement are required. Saved requests show reference, flavours, quantity, total, contact email, pickup preference and next steps. FAQs explain payment and changes. |
| Professionalism | Consistent existing branding, readable product information, a visible mobile preorder link, direct contact links and no invented ratings, certifications or sales results. |

Verification: TypeScript passed; six unit tests passed; production build passed; both customer pages returned HTTP 200; thirteen integration checks passed against an isolated local D1 database, including saving, validation, duplicate prevention, admin login, editing, deletion and CSV export. No visual browser QA was available. Flavour preselection and the confirmation presentation were checked in source/build, not through browser interaction.

No new pages or database migrations were introduced by this rubric pass. The changes were deployed to the existing naturally-decadent Cloudflare Worker, and the live homepage, order page, styles and required-email validation were verified. The site uses a preorder-request workflow with manual email follow-up, not online checkout or automated email. The rubric's five criteria total 10 points, but its overall Level 4 label says 11 points minimum; that threshold is inconsistent. Grading and any separate requirement to use Shopify itself remain the instructor's decision.
