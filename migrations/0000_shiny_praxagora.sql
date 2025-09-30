CREATE TABLE `cities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ubigeo_code` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cities_ubigeo_code_unique` ON `cities` (`ubigeo_code`);--> statement-breakpoint
CREATE TABLE `districts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ubigeo_code` text NOT NULL,
	`name` text NOT NULL,
	`city_id` integer NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `districts_ubigeo_code_unique` ON `districts` (`ubigeo_code`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`description` text NOT NULL,
	`organizer` text,
	`event_date` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`user_id` integer DEFAULT 1 NOT NULL,
	`created` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`modified` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`deleted` integer,
	`city_id` integer NOT NULL,
	`district_id` integer NOT NULL,
	`image_source` text,
	`image_url` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`district_id`) REFERENCES `districts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `events` (`user_id`);--> statement-breakpoint
CREATE INDEX `event_date_idx` ON `events` (`event_date`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text,
	`created` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`modified` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);