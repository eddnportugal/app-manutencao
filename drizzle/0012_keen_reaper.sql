ALTER TABLE `membros_equipe` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `membros_equipe` ADD `senha` varchar(255);--> statement-breakpoint
ALTER TABLE `membros_equipe` ADD `acessoTotal` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `membros_equipe` ADD `permissoes` json DEFAULT ('[]');--> statement-breakpoint
ALTER TABLE `membros_equipe` ADD `resetToken` varchar(64);--> statement-breakpoint
ALTER TABLE `membros_equipe` ADD `resetTokenExpira` timestamp;--> statement-breakpoint
ALTER TABLE `membros_equipe` ADD `ultimoAcesso` timestamp;