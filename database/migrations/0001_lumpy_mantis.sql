CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `companies_name_unique` ON `companies` (`name`);--> statement-breakpoint
CREATE TABLE `game_genres` (
	`game_id` text NOT NULL,
	`genre_id` text NOT NULL,
	PRIMARY KEY(`game_id`, `genre_id`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game_platforms` (
	`game_id` text NOT NULL,
	`platform_id` text NOT NULL,
	PRIMARY KEY(`game_id`, `platform_id`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`platform_id`) REFERENCES `platforms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `game_tags` (
	`game_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`game_id`, `tag_id`),
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `genres` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `genres_name_unique` ON `genres` (`name`);--> statement-breakpoint
CREATE TABLE `platforms` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `platforms_name_unique` ON `platforms` (`name`);--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
ALTER TABLE `games` ADD `status` text DEFAULT 'backlog' NOT NULL;--> statement-breakpoint
ALTER TABLE `games` ADD `is_favorite` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `games` ADD `purchased_at` text;--> statement-breakpoint
ALTER TABLE `games` ADD `started_at` text;--> statement-breakpoint
ALTER TABLE `games` ADD `finished_at` text;--> statement-breakpoint
ALTER TABLE `games` ADD `release_year` integer;--> statement-breakpoint
ALTER TABLE `games` ADD `developer_id` text REFERENCES companies(id);--> statement-breakpoint
ALTER TABLE `games` ADD `publisher_id` text REFERENCES companies(id);--> statement-breakpoint
ALTER TABLE `games` ADD `difficulty` text;--> statement-breakpoint
ALTER TABLE `games` ADD `playthroughs` integer;--> statement-breakpoint
ALTER TABLE `games` ADD `playtime_minutes` integer;--> statement-breakpoint
ALTER TABLE `games` ADD `main_story_minutes` integer;--> statement-breakpoint
ALTER TABLE `games` ADD `completionist_minutes` integer;--> statement-breakpoint
ALTER TABLE `games` ADD `cover_path` text;--> statement-breakpoint
CREATE INDEX `games_status_idx` ON `games` (`status`);--> statement-breakpoint
CREATE INDEX `games_finished_idx` ON `games` (`finished_at`);