CREATE TABLE `historico_atividades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`entidadeTipo` enum('vistoria','manutencao','ocorrencia','ordem_servico','checklist','antes_depois') NOT NULL,
	`entidadeId` int NOT NULL,
	`entidadeProtocolo` varchar(50),
	`entidadeTitulo` varchar(255),
	`acao` enum('criado','editado','status_alterado','comentario_adicionado','imagem_adicionada','imagem_removida','atribuido','prioridade_alterada','agendado','iniciado','pausado','retomado','concluido','reaberto','cancelado','arquivado','enviado','compartilhado') NOT NULL,
	`descricao` text,
	`valorAnterior` text,
	`valorNovo` text,
	`usuarioId` int,
	`usuarioNome` varchar(255),
	`metadados` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_atividades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `historico_atividades` ADD CONSTRAINT `historico_atividades_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_atividades` ADD CONSTRAINT `historico_atividades_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;