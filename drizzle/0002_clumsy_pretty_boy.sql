PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_preorders` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`request_key` text NOT NULL,
	`customer_name` text NOT NULL,
	`order_date` text NOT NULL,
	`chocolate` integer DEFAULT 0 NOT NULL,
	`lemon` integer DEFAULT 0 NOT NULL,
	`mango` integer DEFAULT 0 NOT NULL,
	`raspberry` integer DEFAULT 0 NOT NULL,
	`pickup_window` text DEFAULT '' NOT NULL,
	`price_feedback` text,
	`unit_price_cents` integer DEFAULT 550 NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	CONSTRAINT "valid_quantities" CHECK("__new_preorders"."chocolate" BETWEEN 0 AND 99 AND "__new_preorders"."lemon" BETWEEN 0 AND 99 AND "__new_preorders"."mango" BETWEEN 0 AND 99 AND "__new_preorders"."raspberry" BETWEEN 0 AND 99),
	CONSTRAINT "has_slices" CHECK("__new_preorders"."chocolate" + "__new_preorders"."lemon" + "__new_preorders"."mango" + "__new_preorders"."raspberry" > 0),
	CONSTRAINT "valid_pickup_window" CHECK("__new_preorders"."pickup_window" IN ('', '09-11', '11-13', '13-15', '15-17')),
	CONSTRAINT "valid_price_feedback" CHECK("__new_preorders"."price_feedback" IS NULL OR "__new_preorders"."price_feedback" IN ('Good value', 'Reasonable', 'Too expensive'))
);
--> statement-breakpoint
INSERT INTO `__new_preorders`("id", "reference", "request_key", "customer_name", "order_date", "chocolate", "lemon", "mango", "raspberry", "pickup_window", "price_feedback", "unit_price_cents", "version", "created_at", "updated_at") SELECT "id", "reference", "request_key", "customer_name", "order_date", "chocolate", "lemon", "mango", "raspberry", "pickup_window", "price_feedback", "unit_price_cents", "version", "created_at", "updated_at" FROM `preorders`;--> statement-breakpoint
DROP TABLE `preorders`;--> statement-breakpoint
ALTER TABLE `__new_preorders` RENAME TO `preorders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `preorders_reference_unique` ON `preorders` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `preorders_request_key_unique` ON `preorders` (`request_key`);--> statement-breakpoint
CREATE INDEX `preorders_created_at_idx` ON `preorders` (`created_at`);