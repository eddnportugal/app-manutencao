-- Equipes (grupos de funcionários)
CREATE TABLE IF NOT EXISTS `equipes` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `condominioId` int NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `cor` varchar(20) DEFAULT '#3b82f6',
  `ativo` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `equipes_condominioId_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`)
);

-- Junção equipe ↔ funcionário
CREATE TABLE IF NOT EXISTS `equipe_funcionarios` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `equipeId` int NOT NULL,
  `funcionarioId` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `ef_equipeId_fk` FOREIGN KEY (`equipeId`) REFERENCES `equipes`(`id`) ON DELETE CASCADE,
  CONSTRAINT `ef_funcionarioId_fk` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `equipe_func_unique` (`equipeId`, `funcionarioId`)
);
