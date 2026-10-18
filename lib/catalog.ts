export const UNIT_PRICE_CENTS = 550;
export const FLAVOURS = ["chocolate", "lemon", "mango", "raspberry"] as const;
export type Flavour = (typeof FLAVOURS)[number];
export const CAKES = [
  { id: "chocolate", name: "Chocolate", ingredients: "Coconut, walnuts and/or hazelnuts, dates, unsweetened baking chocolate, cashews, coconut milk, sea moss, maple syrup, hazelnut butter, sunflower-seed butter, cocoa powder, cocoa butter, sea salt.", allergens: "Cashews, walnuts/hazelnuts, coconut; sunflower seeds." },
  { id: "lemon", name: "Lemon", ingredients: "Coconut, walnuts, macadamias, dates, cashews, sea moss, honey, dried mango, lemon juice and zest, turmeric, coconut oil.", allergens: "Cashews, walnuts, macadamias, coconut. Contains honey; not vegan." },
  { id: "mango", name: "Mango", ingredients: "Coconut, walnuts, macadamias, dates, fresh/frozen mango, dried mango.", allergens: "Walnuts, macadamias, coconut." },
  { id: "raspberry", name: "Raspberry", ingredients: "Almonds, dates, vanilla, salt, cashews, raspberries, almond milk, agave syrup, lemon juice, coconut oil.", allergens: "Almonds, cashews, coconut." },
] as const;
export const PICKUP_WINDOWS = [
  { value: "09-11", label: "9:00–11:00 AM" },
  { value: "11-13", label: "11:00 AM–1:00 PM" },
  { value: "13-15", label: "1:00–3:00 PM" },
  { value: "15-17", label: "3:00–5:00 PM" },
] as const;
export const PRICE_FEEDBACK = ["Good value", "Reasonable", "Too expensive"] as const;
export const STORAGE = "Keep frozen until ready to serve. Thaw in the refrigerator (4°C or below) and consume within 3 days of thawing.";
export const money = (cents: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100);
