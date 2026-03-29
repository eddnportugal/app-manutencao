-- Adicionar coluna openId à tabela users (se não existir)
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `openId` varchar(64);

-- Atualizar registros existentes com um openId único baseado no id
UPDATE `users` SET `openId` = CONCAT('local_', MD5(CONCAT(id, email))) WHERE `openId` IS NULL OR `openId` = '';

-- Tornar a coluna NOT NULL após preencher os valores
ALTER TABLE `users` MODIFY COLUMN `openId` varchar(64) NOT NULL;

-- Adicionar constraint unique (se não existir)
-- ALTER TABLE `users` ADD CONSTRAINT `users_openId_unique` UNIQUE (`openId`);
