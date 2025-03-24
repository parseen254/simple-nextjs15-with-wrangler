CREATE TABLE `dev_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`to` text NOT NULL,
	`subject` text NOT NULL,
	`content` text NOT NULL,
	`type` text DEFAULT 'email',
	`read` integer DEFAULT false,
	`created_at` integer NOT NULL
);
