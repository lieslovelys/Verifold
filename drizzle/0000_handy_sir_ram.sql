CREATE TABLE `certificates` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`issuer` text NOT NULL,
	`issued_at` text NOT NULL,
	`category` text DEFAULT 'General',
	`description` text,
	`file_key` text NOT NULL,
	`file_type` text NOT NULL,
	`file_name` text,
	`file_size` integer,
	`verify_url` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_public` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_certificates_user_id` ON `certificates` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_certificates_sort_order` ON `certificates` (`user_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_certificates_public` ON `certificates` (`user_id`,`is_public`);--> statement-breakpoint
CREATE TABLE `magic_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`token_hash` text NOT NULL,
	`code` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `magic_tokens_token_hash_unique` ON `magic_tokens` (`token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_magic_tokens_token_hash` ON `magic_tokens` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_magic_tokens_email` ON `magic_tokens` (`email`);--> statement-breakpoint
CREATE TABLE `profile_views` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`viewed_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_profile_views_user_id` ON `profile_views` (`user_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_sessions_token_hash` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_sessions_user_id` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`username` text,
	`display_name` text,
	`bio` text,
	`accent_color` text DEFAULT '#2563eb',
	`theme` text DEFAULT 'system',
	`layout` text DEFAULT 'grid',
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_username` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`);