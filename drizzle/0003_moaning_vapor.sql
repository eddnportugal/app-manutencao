CREATE TABLE `campos_rapidos_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`userId` int,
	`tipoCampo` enum('titulo','descricao','local','observacao') NOT NULL,
	`tipoTarefa` enum('vistoria','manutencao','ocorrencia','antes_depois'),
	`valor` text NOT NULL,
	`nome` varchar(100),
	`vezesUsado` int DEFAULT 0,
	`ultimoUso` timestamp,
	`favorito` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `campos_rapidos_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `campos_rapidos_templates` ADD CONSTRAINT `campos_rapidos_templates_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campos_rapidos_templates` ADD CONSTRAINT `campos_rapidos_templates_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;