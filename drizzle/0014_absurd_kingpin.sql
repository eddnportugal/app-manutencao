CREATE TABLE `compartilhamento_visualizacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`compartilhamentoId` int NOT NULL,
	`dataVisualizacao` timestamp NOT NULL DEFAULT (now()),
	`ip` varchar(45),
	`userAgent` text,
	`dispositivo` varchar(100),
	`navegador` varchar(100),
	`sistemaOperacional` varchar(100),
	`duracaoSegundos` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compartilhamento_visualizacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `compartilhamentos_equipe` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`remetenteId` int,
	`remetenteNome` varchar(255),
	`destinatarioId` int NOT NULL,
	`destinatarioNome` varchar(255),
	`destinatarioEmail` varchar(320),
	`destinatarioTelefone` varchar(20),
	`tipoItem` enum('vistoria','manutencao','ocorrencia','checklist','antes_depois','ordem_servico','tarefa_simples') NOT NULL,
	`itemId` int NOT NULL,
	`itemProtocolo` varchar(50),
	`itemTitulo` varchar(255),
	`token` varchar(64) NOT NULL,
	`canalEnvio` enum('email','whatsapp','ambos') DEFAULT 'email',
	`emailEnviado` boolean DEFAULT false,
	`whatsappEnviado` boolean DEFAULT false,
	`mensagem` text,
	`expiraEm` timestamp,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compartilhamentos_equipe_id` PRIMARY KEY(`id`),
	CONSTRAINT `compartilhamentos_equipe_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes_visualizacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`compartilhamentoId` int NOT NULL,
	`visualizacaoId` int NOT NULL,
	`usuarioId` int NOT NULL,
	`lida` boolean DEFAULT false,
	`lidaEm` timestamp,
	`emailEnviado` boolean DEFAULT false,
	`emailEnviadoEm` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_visualizacao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `compartilhamento_visualizacoes` ADD CONSTRAINT `compartilhamento_visualizacoes_compartilhamentoId_compartilhamentos_equipe_id_fk` FOREIGN KEY (`compartilhamentoId`) REFERENCES `compartilhamentos_equipe`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compartilhamentos_equipe` ADD CONSTRAINT `compartilhamentos_equipe_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compartilhamentos_equipe` ADD CONSTRAINT `compartilhamentos_equipe_remetenteId_users_id_fk` FOREIGN KEY (`remetenteId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `compartilhamentos_equipe` ADD CONSTRAINT `compartilhamentos_equipe_destinatarioId_membros_equipe_id_fk` FOREIGN KEY (`destinatarioId`) REFERENCES `membros_equipe`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes_visualizacao` ADD CONSTRAINT `notificacoes_visualizacao_compartilhamentoId_compartilhamentos_equipe_id_fk` FOREIGN KEY (`compartilhamentoId`) REFERENCES `compartilhamentos_equipe`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes_visualizacao` ADD CONSTRAINT `notificacoes_visualizacao_visualizacaoId_compartilhamento_visualizacoes_id_fk` FOREIGN KEY (`visualizacaoId`) REFERENCES `compartilhamento_visualizacoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes_visualizacao` ADD CONSTRAINT `notificacoes_visualizacao_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;