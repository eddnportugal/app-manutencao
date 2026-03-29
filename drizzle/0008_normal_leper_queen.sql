CREATE TABLE `admin_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`adminNome` varchar(255),
	`adminEmail` varchar(320),
	`acao` enum('criar','editar','excluir','ativar','desativar','promover','rebaixar') NOT NULL,
	`entidade` enum('usuario','condominio','vistoria','manutencao','ordem_servico','funcao','configuracao') NOT NULL,
	`entidadeId` int,
	`entidadeNome` varchar(255),
	`detalhes` text,
	`ip` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `admin_logs` ADD CONSTRAINT `admin_logs_adminId_users_id_fk` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;