CREATE TABLE `product_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`store_id` integer NOT NULL,
	`parent_category_id` integer,
	`name` text(256) NOT NULL,
	`slug` text(256) NOT NULL,
	`description` text(1024),
	`created_at` text(26) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text(26),
	`deleted_at` text(26),
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`parent_category_id`) REFERENCES `product_categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `storeId_slug_pair_unique_idx` ON `product_categories` (`store_id`,`slug`);--> statement-breakpoint
CREATE TABLE `stores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`creator_id` text(256) NOT NULL,
	`name` text(256) NOT NULL,
	`slug` text(256) NOT NULL,
	`created_at` text(26) DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` text(26),
	`deleted_at` text(26)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stores_creatorId_unique` ON `stores` (`creator_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `stores_slug_unique` ON `stores` (`slug`);