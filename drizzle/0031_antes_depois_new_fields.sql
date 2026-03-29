-- Adicionar novos campos à tabela antes_depois
ALTER TABLE `antes_depois` ADD COLUMN `responsavel` varchar(255);
ALTER TABLE `antes_depois` ADD COLUMN `status_antesdepois` enum('pendente','em_andamento','concluido') DEFAULT 'pendente';
ALTER TABLE `antes_depois` ADD COLUMN `prioridade_antesdepois` enum('baixa','media','alta') DEFAULT 'media';
