# Preorder page

The order page collects name, date, quantities, one required pickup window, required acknowledgement of the $5.50 CAD per 80 g price, and optional price feedback. Ingredients, allergens and frozen-storage instructions follow the supplied product information. Cake images are labelled as illustrations. The page presents a regular preorder service, with payment and exact pickup details confirmed separately.

Client and server validation require pickup and acknowledgement for new preorders. The database structure is unchanged: it stores the unit price but does not have a separate acknowledgement column. Older responses and the admin editor continue to support blank pickup times. Retries use a unique key, totals are calculated on the server, and successful submissions return a reference.
