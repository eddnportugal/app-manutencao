-- Permissões de módulos por funcionário
CREATE TABLE IF NOT EXISTS `funcionario_permissoes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `funcionarioId` int NOT NULL,
  `modulo` varchar(50) NOT NULL,
  `habilitado` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_func_perm_func` (`funcionarioId`),
  KEY `idx_func_perm_modulo` (`modulo`),
  CONSTRAINT `fk_func_perm_func` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios` (`id`) ON DELETE CASCADE
);

-- Templates por segmento (infraestrutura para ativação futura)
CREATE TABLE IF NOT EXISTS `templates_categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `segmento` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `campos` json DEFAULT NULL,
  `ativo` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_tpl_segmento` (`segmento`),
  KEY `idx_tpl_tipo` (`tipo`)
);

-- Add 'master' to user roles (ALTER ENUM is not directly supported, doing MODIFY)
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','sindico','morador','master') NOT NULL DEFAULT 'user';
