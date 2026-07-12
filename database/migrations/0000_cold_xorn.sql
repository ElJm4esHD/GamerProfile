CREATE TABLE `criteria` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`weight` real DEFAULT 1 NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `criteria_name_unique` ON `criteria` (`name`);--> statement-breakpoint
CREATE TABLE `game_ratings` (
	`game_id` text NOT NULL,
	`criterion_id` text NOT NULL,
	`value` integer NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	PRIMARY KEY(`game_id`, `criterion_id`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`criterion_id`) REFERENCES `criteria`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game_types` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_types_name_unique` ON `game_types` (`name`);--> statement-breakpoint
CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type_id` text NOT NULL,
	`parent_game_id` text,
	`overall_override` integer,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`type_id`) REFERENCES `game_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `games_parent_idx` ON `games` (`parent_game_id`);--> statement-breakpoint
CREATE INDEX `games_deleted_idx` ON `games` (`deleted_at`);