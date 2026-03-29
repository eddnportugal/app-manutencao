-- Tabela para modelos/templates de checklist
-- Permite salvar checklists para reutilização em futuras checagens

CREATE TABLE IF NOT EXISTS `checklist_modelos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `condominioId` INT NOT NULL,
  `userId` INT,
  `nome` VARCHAR(255) NOT NULL,
  `descricao` TEXT,
  `itens` JSON NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL
);
