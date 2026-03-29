CREATE TABLE `membro_acessos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`membroId` int NOT NULL,
	`condominioId` int NOT NULL,
	`dataHora` timestamp NOT NULL DEFAULT (now()),
	`ip` varchar(45),
	`userAgent` text,
	`dispositivo` varchar(100),
	`navegador` varchar(100),
	`sistemaOperacional` varchar(100),
	`localizacao` varchar(255),
	`tipoAcesso` enum('login','logout','recuperacao_senha','alteracao_senha') DEFAULT 'login',
	`sucesso` boolean DEFAULT true,
	`motivoFalha` text,
	CONSTRAINT `membro_acessos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `membro_acessos` ADD CONSTRAINT `membro_acessos_membroId_membros_equipe_id_fk` FOREIGN KEY (`membroId`) REFERENCES `membros_equipe`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `membro_acessos` ADD CONSTRAINT `membro_acessos_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;