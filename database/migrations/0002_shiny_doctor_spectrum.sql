CREATE TABLE `cars` (
	`id` text PRIMARY KEY NOT NULL,
	`sim_game_id` text NOT NULL,
	`name` text NOT NULL,
	`car_class` text,
	FOREIGN KEY (`sim_game_id`) REFERENCES `sim_games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cars_game_name_idx` ON `cars` (`sim_game_id`,`name`);--> statement-breakpoint
CREATE TABLE `lap_records` (
	`id` text PRIMARY KEY NOT NULL,
	`sim_game_id` text NOT NULL,
	`track_id` text NOT NULL,
	`car_id` text NOT NULL,
	`time_ms` integer NOT NULL,
	`recorded_at` text NOT NULL,
	`weather` text,
	`time_of_day` text,
	`notes` text,
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')) NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`sim_game_id`) REFERENCES `sim_games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`track_id`) REFERENCES `tracks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`car_id`) REFERENCES `cars`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `laps_combo_idx` ON `lap_records` (`sim_game_id`,`track_id`,`car_id`);--> statement-breakpoint
CREATE INDEX `laps_deleted_idx` ON `lap_records` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `laps_time_idx` ON `lap_records` (`time_ms`);--> statement-breakpoint
CREATE TABLE `lap_setup_values` (
	`lap_id` text NOT NULL,
	`param_id` text NOT NULL,
	`value` text NOT NULL,
	`value_num` real,
	PRIMARY KEY(`lap_id`, `param_id`),
	FOREIGN KEY (`lap_id`) REFERENCES `lap_records`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`param_id`) REFERENCES `setup_params`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `setup_params` (
	`id` text PRIMARY KEY NOT NULL,
	`sim_game_id` text NOT NULL,
	`name` text NOT NULL,
	`unit` text,
	`position` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`sim_game_id`) REFERENCES `sim_games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `setup_params_game_name_idx` ON `setup_params` (`sim_game_id`,`name`);--> statement-breakpoint
CREATE TABLE `sim_games` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`game_id` text,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sim_games_name_unique` ON `sim_games` (`name`);--> statement-breakpoint
CREATE TABLE `tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`sim_game_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text DEFAULT 'circuit' NOT NULL,
	`country` text,
	`length_m` integer,
	FOREIGN KEY (`sim_game_id`) REFERENCES `sim_games`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tracks_game_name_idx` ON `tracks` (`sim_game_id`,`name`);