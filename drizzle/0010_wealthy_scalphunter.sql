ALTER TABLE `campos_rapidos_templates` MODIFY COLUMN `tipoTarefa` enum('vistoria','manutencao','ocorrencia','antes_depois','checklist');--> statement-breakpoint
ALTER TABLE `tarefas_simples` MODIFY COLUMN `tipo` enum('vistoria','manutencao','ocorrencia','antes_depois','checklist') NOT NULL;--> statement-breakpoint
ALTER TABLE `tarefas_simples` ADD `itensChecklist` json;