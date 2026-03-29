-- Adicionar campos extras à tabela tarefas_simples para manutenção rápida

ALTER TABLE `tarefas_simples` ADD COLUMN `prazoConclusao` TIMESTAMP NULL;
ALTER TABLE `tarefas_simples` ADD COLUMN `custoEstimado` VARCHAR(50) NULL;
ALTER TABLE `tarefas_simples` ADD COLUMN `nivelUrgencia` ENUM('baixo', 'medio', 'alto', 'critico') NULL;
ALTER TABLE `tarefas_simples` ADD COLUMN `anexos` JSON NULL;
ALTER TABLE `tarefas_simples` ADD COLUMN `qrcode` VARCHAR(500) NULL;
ALTER TABLE `tarefas_simples` ADD COLUMN `assinaturaTecnico` TEXT NULL;
ALTER TABLE `tarefas_simples` ADD COLUMN `assinaturaSolicitante` TEXT NULL;
