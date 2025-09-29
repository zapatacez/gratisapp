CREATE TABLE `cities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cities_name_unique` ON `cities` (`name`);--> statement-breakpoint
CREATE TABLE `districts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`city_id` integer NOT NULL,
	FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `events` ADD `city_id` integer NOT NULL REFERENCES cities(id);--> statement-breakpoint
ALTER TABLE `events` ADD `district_id` integer NOT NULL REFERENCES districts(id);