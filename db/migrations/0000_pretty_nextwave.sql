CREATE TABLE `essays` (
	`id` text PRIMARY KEY NOT NULL,
	`week_start` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`due_at` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`notes_json` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `essays_week_start_unique` ON `essays` (`week_start`);--> statement-breakpoint
CREATE TABLE `meal_days` (
	`id` text PRIMARY KEY NOT NULL,
	`week_start` text NOT NULL,
	`day_index` integer NOT NULL,
	`label` text DEFAULT '' NOT NULL,
	`target_calories` integer,
	`target_protein_g` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `meal_days_week_day_unique` ON `meal_days` (`week_start`,`day_index`);--> statement-breakpoint
CREATE TABLE `restaurant_picks` (
	`id` text PRIMARY KEY NOT NULL,
	`week_start` text NOT NULL,
	`day_index` integer NOT NULL,
	`meal_type` text NOT NULL,
	`restaurant_id` text NOT NULL,
	FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `restaurant_picks_slot_unique` ON `restaurant_picks` (`week_start`,`day_index`,`meal_type`);--> statement-breakpoint
CREATE TABLE `restaurants` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`cuisine` text DEFAULT '' NOT NULL,
	`menu_json` text
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`week_start` text NOT NULL,
	`essay_id` text,
	`title` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`done` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`essay_id`) REFERENCES `essays`(`id`) ON UPDATE no action ON DELETE set null
);
