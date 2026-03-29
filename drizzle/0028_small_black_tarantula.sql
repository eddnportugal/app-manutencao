ALTER TABLE `checklists` MODIFY COLUMN `status` enum('pendente','realizada','acao_necessaria','finalizada','reaberta','rascunho') NOT NULL DEFAULT 'pendente';--> statement-breakpoint
ALTER TABLE `links_compartilhaveis` MODIFY COLUMN `tipo` enum('vistoria','manutencao','ocorrencia','checklist','ordem-servico') NOT NULL;--> statement-breakpoint
ALTER TABLE `manutencoes` MODIFY COLUMN `status` enum('pendente','realizada','acao_necessaria','finalizada','reaberta','rascunho') NOT NULL DEFAULT 'pendente';--> statement-breakpoint
ALTER TABLE `vistorias` MODIFY COLUMN `status` enum('pendente','realizada','acao_necessaria','finalizada','reaberta','rascunho') NOT NULL DEFAULT 'pendente';--> statement-breakpoint
ALTER TABLE `tarefas_simples` ADD `prioridade` enum('baixa','media','alta','urgente') DEFAULT 'media';--> statement-breakpoint
ALTER TABLE `tarefas_simples` ADD `responsavelId` int;--> statement-breakpoint
ALTER TABLE `tarefas_simples` ADD CONSTRAINT `tarefas_simples_responsavelId_membros_equipe_id_fk` FOREIGN KEY (`responsavelId`) REFERENCES `membros_equipe`(`id`) ON DELETE no action ON UPDATE no action;