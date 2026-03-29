ALTER TABLE `users` ADD `tipoUsuario` enum('usuario','pequena_empresa','media_empresa') DEFAULT 'usuario';--> statement-breakpoint
ALTER TABLE `users` ADD `diasUtilizacao` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `cidade` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `adimplente` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `users` ADD `bloqueado` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `motivoBloqueio` text;