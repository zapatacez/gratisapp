CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`description` text NOT NULL,
	`created` integer NOT NULL,
	`modified` integer NOT NULL,
	`deleted` integer
);
