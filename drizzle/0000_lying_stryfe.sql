CREATE TABLE `preorders` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`request_key` text NOT NULL,
	`customer_name` text NOT NULL,
	`order_date` text NOT NULL,
	`chocolate` integer DEFAULT 0 NOT NULL,
	`lemon` integer DEFAULT 0 NOT NULL,
	`mango` integer DEFAULT 0 NOT NULL,
	`raspberry` integer DEFAULT 0 NOT NULL,
	`pickup_window` text NOT NULL,
	`price_feedback` text,
	`unit_price_cents` integer DEFAULT 550 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "valid_quantities" CHECK("preorders"."chocolate" BETWEEN 0 AND 99 AND "preorders"."lemon" BETWEEN 0 AND 99 AND "preorders"."mango" BETWEEN 0 AND 99 AND "preorders"."raspberry" BETWEEN 0 AND 99),
	CONSTRAINT "has_slices" CHECK("preorders"."chocolate" + "preorders"."lemon" + "preorders"."mango" + "preorders"."raspberry" > 0),
	CONSTRAINT "valid_pickup_window" CHECK("preorders"."pickup_window" IN ('09-11', '11-13', '13-15', '15-17')),
	CONSTRAINT "valid_price_feedback" CHECK("preorders"."price_feedback" IS NULL OR "preorders"."price_feedback" IN ('Good value', 'Reasonable', 'Too expensive'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `preorders_reference_unique` ON `preorders` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `preorders_request_key_unique` ON `preorders` (`request_key`);--> statement-breakpoint
CREATE INDEX `preorders_created_at_idx` ON `preorders` (`created_at`);