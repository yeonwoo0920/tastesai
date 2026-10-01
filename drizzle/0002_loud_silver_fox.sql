CREATE TABLE `communities` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_user_id` text NOT NULL,
	`name` text NOT NULL,
	`work` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`color` text NOT NULL,
	`accent` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `communities_name_unique` ON `communities` (`name`);