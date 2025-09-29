DROP INDEX `cities_name_unique`;--> statement-breakpoint
ALTER TABLE `cities` ADD `ubigeo_code` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `cities_ubigeo_code_unique` ON `cities` (`ubigeo_code`);--> statement-breakpoint
ALTER TABLE `districts` ADD `ubigeo_code` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `districts_ubigeo_code_unique` ON `districts` (`ubigeo_code`);