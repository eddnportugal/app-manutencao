ALTER TABLE `ordens_servico` MODIFY COLUMN `protocolo` varchar(50);--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD `responsavelPrincipalId` int;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD `responsavelPrincipalNome` varchar(255);--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_responsavelPrincipalId_os_responsaveis_id_fk` FOREIGN KEY (`responsavelPrincipalId`) REFERENCES `os_responsaveis`(`id`) ON DELETE no action ON UPDATE no action;