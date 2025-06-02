CREATE TABLE `product_prices` (
	`id` integer PRIMARY KEY NOT NULL,
	`store_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`pricing_model` text NOT NULL,
	`currency` text(3) NOT NULL,
	`amount` integer,
	`quantity` integer,
	`amount_decimal` text,
	`created_at` text(26) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text(26),
	`deleted_at` text(26),
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY NOT NULL,
	`store_id` integer NOT NULL,
	`name` text(256) NOT NULL,
	`slug` text(288) NOT NULL,
	`description` text(1024),
	`colors` text,
	`images` text,
	`pricing_model` text NOT NULL,
	`in_stock` integer DEFAULT false NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`created_at` text(26) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text(26),
	`deleted_at` text(26),
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_product_categories` (
	`id` integer PRIMARY KEY NOT NULL,
	`store_id` integer NOT NULL,
	`parent_category_id` integer,
	`name` text(256) NOT NULL,
	`slug` text(288) NOT NULL,
	`description` text(1024),
	`created_at` text(26) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text(26),
	`deleted_at` text(26),
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_category_id`) REFERENCES `product_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_product_categories`("id", "store_id", "parent_category_id", "name", "slug", "description", "created_at", "updated_at", "deleted_at") SELECT "id", "store_id", "parent_category_id", "name", "slug", "description", "created_at", "updated_at", "deleted_at" FROM `product_categories`;--> statement-breakpoint
DROP TABLE `product_categories`;--> statement-breakpoint
ALTER TABLE `__new_product_categories` RENAME TO `product_categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `storeId_slug_pair_unique_idx` ON `product_categories` (`store_id`,`slug`);