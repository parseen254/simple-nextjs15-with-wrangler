PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_dev_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`to` text NOT NULL,
	`subject` text NOT NULL,
	`content` text NOT NULL,
	`type` text DEFAULT 'email' NOT NULL,
	`read` integer DEFAULT false,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_dev_messages`("id", "to", "subject", "content", "type", "read", "created_at") SELECT "id", "to", "subject", "content", "type", "read", "created_at" FROM `dev_messages`;--> statement-breakpoint
DROP TABLE `dev_messages`;--> statement-breakpoint
ALTER TABLE `__new_dev_messages` RENAME TO `dev_messages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;