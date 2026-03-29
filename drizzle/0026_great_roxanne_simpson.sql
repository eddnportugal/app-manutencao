CREATE TABLE `historico_temas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tema` varchar(50) NOT NULL,
	`layout` varchar(50) NOT NULL,
	`modoEscuro` boolean DEFAULT false,
	`tamanhoFonte` varchar(20) DEFAULT 'medio',
	`descricao` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_temas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `temas_personalizados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`slug` varchar(50) NOT NULL,
	`nome` varchar(100) NOT NULL,
	`corPrimaria` varchar(20) NOT NULL,
	`corSecundaria` varchar(20),
	`corFundo` varchar(20),
	`corTexto` varchar(20),
	`corAcento` varchar(20),
	`modoEscuro` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `temas_personalizados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `historico_temas` ADD CONSTRAINT `historico_temas_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `temas_personalizados` ADD CONSTRAINT `temas_personalizados_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;