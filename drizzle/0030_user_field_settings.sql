-- Tabela para configuração de campos por tipo de função
-- Permite ao usuário habilitar/desabilitar campos específicos em cada modal

CREATE TABLE IF NOT EXISTS `user_field_settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `condominioId` INT NOT NULL,
  `modalType` ENUM('rapida', 'completa') NOT NULL,
  `functionType` ENUM('vistoria', 'manutencao', 'ocorrencia', 'checklist', 'antes_depois') NOT NULL,
  `fieldsConfig` JSON NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE CASCADE,
  
  -- Índice único para evitar duplicatas: um registro por usuário/condomínio/modalType/functionType
  UNIQUE KEY `unique_user_function_config` (`userId`, `condominioId`, `modalType`, `functionType`)
);

-- Índices para buscas rápidas
CREATE INDEX `idx_field_settings_user` ON `user_field_settings`(`userId`);
CREATE INDEX `idx_field_settings_condominio` ON `user_field_settings`(`condominioId`);
