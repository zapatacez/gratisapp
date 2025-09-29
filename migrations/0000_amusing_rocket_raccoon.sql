CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`description` text NOT NULL,
	`event_date` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`user_id` integer DEFAULT 1 NOT NULL,
	`created` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`modified` integer DEFAULT (strftime('%s','now') * 1000) NOT NULL,
	`deleted` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
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