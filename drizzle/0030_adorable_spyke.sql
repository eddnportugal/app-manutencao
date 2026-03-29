CREATE TABLE `faixas_preco` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(100) NOT NULL,
	`usuariosMin` int NOT NULL,
	`usuariosMax` int,
	`valorMensal` decimal(10,2) NOT NULL,
	`descricao` text,
	`ativo` boolean DEFAULT true,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `faixas_preco_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_field_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`condominioId` int NOT NULL,
	`modalType` enum('rapida','completa') NOT NULL,
	`functionType` enum('vistoria','manutencao','ocorrencia','checklist','antes_depois','inventario','leitura_medidores','inspecao_seguranca','controle_pragas','limpeza','jardinagem','orcamentos','ordem_compra','contratos') NOT NULL,
	`fieldsConfig` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_field_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `app_modulos` MODIFY COLUMN `cor` varchar(50);--> statement-breakpoint
ALTER TABLE `app_modulos` MODIFY COLUMN `bgCor` varchar(100);--> statement-breakpoint
ALTER TABLE `configuracoes_financeiras` ADD `emailNotificacaoCadastro` varchar(320);--> statement-breakpoint
ALTER TABLE `configuracoes_financeiras` ADD `notificarNovoCadastro` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `valorPlano` decimal(10,2);--> statement-breakpoint
ALTER TABLE `users` ADD `faixaPrecoId` int;--> statement-breakpoint
ALTER TABLE `user_field_settings` ADD CONSTRAINT `user_field_settings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_field_settings` ADD CONSTRAINT `user_field_settings_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;