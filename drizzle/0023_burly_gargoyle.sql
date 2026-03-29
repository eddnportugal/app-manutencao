CREATE TABLE `preferencias_layout` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tema` enum('laranja','azul','verde','roxo') NOT NULL DEFAULT 'laranja',
	`layout` enum('classico','compacto','moderno') NOT NULL DEFAULT 'classico',
	`modoEscuro` boolean DEFAULT false,
	`tamanhoFonte` enum('pequeno','medio','grande') DEFAULT 'medio',
	`sidebarExpandida` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `preferencias_layout_id` PRIMARY KEY(`id`),
	CONSTRAINT `preferencias_layout_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `preferencias_layout` ADD CONSTRAINT `preferencias_layout_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;