CREATE TABLE `status_personalizados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`userId` int,
	`nome` varchar(100) NOT NULL,
	`cor` varchar(20) DEFAULT '#F97316',
	`icone` varchar(50),
	`ordem` int DEFAULT 0,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `status_personalizados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tarefas_simples` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`userId` int,
	`funcionarioId` int,
	`tipo` enum('vistoria','manutencao','ocorrencia','antes_depois') NOT NULL,
	`protocolo` varchar(50) NOT NULL,
	`titulo` varchar(255),
	`descricao` text,
	`imagens` json,
	`latitude` varchar(20),
	`longitude` varchar(20),
	`endereco` text,
	`statusPersonalizado` varchar(100),
	`status` enum('rascunho','enviado','concluido') NOT NULL DEFAULT 'rascunho',
	`enviadoEm` timestamp,
	`concluidoEm` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tarefas_simples_id` PRIMARY KEY(`id`),
	CONSTRAINT `tarefas_simples_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
ALTER TABLE `status_personalizados` ADD CONSTRAINT `status_personalizados_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `status_personalizados` ADD CONSTRAINT `status_personalizados_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tarefas_simples` ADD CONSTRAINT `tarefas_simples_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tarefas_simples` ADD CONSTRAINT `tarefas_simples_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tarefas_simples` ADD CONSTRAINT `tarefas_simples_funcionarioId_funcionarios_id_fk` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE no action ON UPDATE no action;