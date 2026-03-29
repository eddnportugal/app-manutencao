CREATE TABLE `timeline_compartilhamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timelineId` int NOT NULL,
	`membroEquipeId` int,
	`membroNome` varchar(255),
	`membroEmail` varchar(320),
	`membroTelefone` varchar(20),
	`canalEnvio` enum('email','whatsapp','ambos') DEFAULT 'email',
	`visualizado` boolean DEFAULT false,
	`dataVisualizacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_compartilhamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_eventos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timelineId` int NOT NULL,
	`tipo` enum('criacao','edicao','status','comentario','imagem','compartilhamento','visualizacao','pdf','registro') DEFAULT 'comentario',
	`descricao` text,
	`usuarioId` int,
	`usuarioNome` varchar(255),
	`dadosAnteriores` text,
	`dadosNovos` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_eventos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timelineId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_locais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_locais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_prioridades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`cor` varchar(20) DEFAULT '#6B7280',
	`icone` varchar(50) DEFAULT 'Minus',
	`nivel` int DEFAULT 0,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_prioridades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_responsaveis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cargo` varchar(255),
	`email` varchar(320),
	`telefone` varchar(20),
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_responsaveis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`cor` varchar(20) DEFAULT '#6B7280',
	`icone` varchar(50) DEFAULT 'Circle',
	`ordem` int DEFAULT 0,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeline_titulos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricaoPadrao` text,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_titulos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timelines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(50) NOT NULL,
	`responsavelId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`localId` int,
	`statusId` int,
	`prioridadeId` int,
	`tituloPredefId` int,
	`descricao` text,
	`dataRegistro` timestamp NOT NULL DEFAULT (now()),
	`horaRegistro` varchar(10),
	`localizacaoGps` varchar(100),
	`latitude` varchar(20),
	`longitude` varchar(20),
	`estado` enum('rascunho','enviado','registado') DEFAULT 'rascunho',
	`tokenPublico` varchar(64),
	`criadoPor` int,
	`criadoPorNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `timelines_id` PRIMARY KEY(`id`),
	CONSTRAINT `timelines_tokenPublico_unique` UNIQUE(`tokenPublico`)
);
