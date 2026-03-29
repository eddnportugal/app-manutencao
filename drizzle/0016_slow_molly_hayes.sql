CREATE TABLE `timeline_notificacoes_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timelineId` int NOT NULL,
	`notificarResponsavel` boolean DEFAULT true,
	`notificarCriador` boolean DEFAULT true,
	`emailsAdicionais` text,
	`notificarMudancaStatus` boolean DEFAULT true,
	`notificarAtualizacao` boolean DEFAULT true,
	`notificarNovaImagem` boolean DEFAULT false,
	`notificarComentario` boolean DEFAULT true,
	`notificarCompartilhamento` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timeline_notificacoes_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_notificacoes_historico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timelineId` int NOT NULL,
	`tipoEvento` enum('mudanca_status','atualizacao','nova_imagem','comentario','compartilhamento','criacao','finalizacao') NOT NULL,
	`statusAnterior` varchar(100),
	`statusNovo` varchar(100),
	`descricaoEvento` text,
	`emailsEnviados` text,
	`totalEnviados` int DEFAULT 0,
	`enviado` boolean DEFAULT false,
	`erroEnvio` text,
	`usuarioId` int,
	`usuarioNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_notificacoes_historico_id` PRIMARY KEY(`id`)
);
