CREATE TABLE `app_acessos_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appId` int NOT NULL,
	`usuarioId` int,
	`codigoAcessoId` int,
	`tipoAcesso` enum('codigo','email','link_magico') NOT NULL,
	`ip` varchar(45),
	`userAgent` text,
	`sucesso` boolean DEFAULT true,
	`motivoFalha` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `app_acessos_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `app_codigos_acesso` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appId` int NOT NULL,
	`codigo` varchar(50) NOT NULL,
	`descricao` varchar(255),
	`ativo` boolean DEFAULT true,
	`validoAte` timestamp,
	`permissao` enum('visualizar','editar','administrar') DEFAULT 'visualizar',
	`vezesUsado` int DEFAULT 0,
	`ultimoUso` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_codigos_acesso_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_codigos_acesso_codigo_unique` UNIQUE(`codigo`)
);
--> statement-breakpoint
CREATE TABLE `app_sessoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appId` int NOT NULL,
	`usuarioId` int,
	`codigoAcessoId` int,
	`token` varchar(255) NOT NULL,
	`ip` varchar(45),
	`userAgent` text,
	`expiraEm` timestamp NOT NULL,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `app_sessoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `app_sessoes_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `app_usuarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`senhaHash` varchar(255) NOT NULL,
	`permissao` enum('visualizar','editar','administrar') DEFAULT 'visualizar',
	`ativo` boolean DEFAULT true,
	`emailVerificado` boolean DEFAULT false,
	`resetToken` varchar(64),
	`resetTokenExpira` timestamp,
	`ultimoAcesso` timestamp,
	`vezesAcesso` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_usuarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `app_acessos_log` ADD CONSTRAINT `app_acessos_log_appId_apps_id_fk` FOREIGN KEY (`appId`) REFERENCES `apps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `app_acessos_log` ADD CONSTRAINT `app_acessos_log_usuarioId_app_usuarios_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `app_usuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `app_acessos_log` ADD CONSTRAINT `app_acessos_log_codigoAcessoId_app_codigos_acesso_id_fk` FOREIGN KEY (`codigoAcessoId`) REFERENCES `app_codigos_acesso`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `app_codigos_acesso` ADD CONSTRAINT `app_codigos_acesso_appId_apps_id_fk` FOREIGN KEY (`appId`) REFERENCES `apps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `app_sessoes` ADD CONSTRAINT `app_sessoes_appId_apps_id_fk` FOREIGN KEY (`appId`) REFERENCES `apps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `app_sessoes` ADD CONSTRAINT `app_sessoes_usuarioId_app_usuarios_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `app_usuarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `app_sessoes` ADD CONSTRAINT `app_sessoes_codigoAcessoId_app_codigos_acesso_id_fk` FOREIGN KEY (`codigoAcessoId`) REFERENCES `app_codigos_acesso`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `app_usuarios` ADD CONSTRAINT `app_usuarios_appId_apps_id_fk` FOREIGN KEY (`appId`) REFERENCES `apps`(`id`) ON DELETE no action ON UPDATE no action;