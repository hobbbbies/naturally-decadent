import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const preorders = sqliteTable("preorders", {
  id: text("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  requestKey: text("request_key").notNull().unique(),
  customerName: text("customer_name").notNull(),
  orderDate: text("order_date").notNull(),
  chocolate: integer("chocolate").notNull().default(0),
  lemon: integer("lemon").notNull().default(0),
  mango: integer("mango").notNull().default(0),
  raspberry: integer("raspberry").notNull().default(0),
  pickupWindow: text("pickup_window").notNull(),
  priceFeedback: text("price_feedback"),
  unitPriceCents: integer("unit_price_cents").notNull().default(550),
  version: integer("version").notNull().default(1),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  index("preorders_created_at_idx").on(table.createdAt),
  check("valid_quantities", sql`${table.chocolate} BETWEEN 0 AND 99 AND ${table.lemon} BETWEEN 0 AND 99 AND ${table.mango} BETWEEN 0 AND 99 AND ${table.raspberry} BETWEEN 0 AND 99`),
  check("has_slices", sql`${table.chocolate} + ${table.lemon} + ${table.mango} + ${table.raspberry} > 0`),
  check("valid_pickup_window", sql`${table.pickupWindow} IN ('09-11', '11-13', '13-15', '15-17')`),
  check("valid_price_feedback", sql`${table.priceFeedback} IS NULL OR ${table.priceFeedback} IN ('Good value', 'Reasonable', 'Too expensive')`),
]);

export type Preorder = typeof preorders.$inferSelect;
