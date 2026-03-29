CREATE TABLE `os_anexos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`nomeOriginal` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`tipo` enum('pdf','imagem','documento','outro') NOT NULL DEFAULT 'outro',
	`mimeType` varchar(100),
	`tamanho` int,
	`descricao` text,
	`uploadPor` int,
	`uploadPorNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `os_anexos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `os_anexos` ADD CONSTRAINT `os_anexos_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_anexos` ADD CONSTRAINT `os_anexos_uploadPor_users_id_fk` FOREIGN KEY (`uploadPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;