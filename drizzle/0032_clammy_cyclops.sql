CREATE TABLE `controle_praga_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`controlePragaId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `controle_praga_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `controle_pragas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(20) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`tipoServico` enum('dedetizacao','desratizacao','descupinizacao','desinfeccao','outro') DEFAULT 'dedetizacao',
	`tipoPraga` varchar(100),
	`produtosUtilizados` text,
	`empresaFornecedor` varchar(255),
	`localizacao` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`enderecoGeo` text,
	`dataAplicacao` timestamp,
	`proximaAplicacao` timestamp,
	`garantiaDias` int,
	`custo` decimal(10,2),
	`responsavelNome` varchar(255),
	`observacoes` text,
	`status` enum('agendada','em_andamento','realizada','finalizada','cancelada') NOT NULL DEFAULT 'agendada',
	`prioridade` enum('baixa','media','alta','urgente') DEFAULT 'media',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `controle_pragas_id` PRIMARY KEY(`id`),
	CONSTRAINT `controle_pragas_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
CREATE TABLE `jardinagem` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(20) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`tipoServico` enum('poda','plantio','adubacao','irrigacao','limpeza','paisagismo','outro') DEFAULT 'poda',
	`plantasEspecies` text,
	`produtosUtilizados` text,
	`areaMetrosQuadrados` decimal(10,2),
	`localizacao` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`enderecoGeo` text,
	`dataRealizacao` timestamp,
	`proximaRealizacao` timestamp,
	`recorrencia` enum('unica','semanal','quinzenal','mensal','bimestral','trimestral') DEFAULT 'unica',
	`custo` decimal(10,2),
	`responsavelNome` varchar(255),
	`observacoes` text,
	`status` enum('agendada','em_andamento','realizada','finalizada','cancelada') NOT NULL DEFAULT 'agendada',
	`prioridade` enum('baixa','media','alta','urgente') DEFAULT 'media',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jardinagem_id` PRIMARY KEY(`id`),
	CONSTRAINT `jardinagem_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
CREATE TABLE `jardinagem_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`jardinagemId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jardinagem_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leitura_medidor_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`leituraMedidorId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `leitura_medidor_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leitura_medidores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(20) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`tipoMedidor` enum('agua','gas','energia','outro') DEFAULT 'energia',
	`identificacaoMedidor` varchar(100),
	`leituraAtual` decimal(15,3),
	`leituraAnterior` decimal(15,3),
	`consumo` decimal(15,3),
	`unidadeMedida` varchar(20) DEFAULT 'kWh',
	`localizacao` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`enderecoGeo` text,
	`dataLeitura` timestamp,
	`proximaLeitura` timestamp,
	`responsavelNome` varchar(255),
	`observacoes` text,
	`status` enum('pendente','realizada','conferida','finalizada') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leitura_medidores_id` PRIMARY KEY(`id`),
	CONSTRAINT `leitura_medidores_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
ALTER TABLE `controle_praga_imagens` ADD CONSTRAINT `controle_praga_imagens_controlePragaId_controle_pragas_id_fk` FOREIGN KEY (`controlePragaId`) REFERENCES `controle_pragas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `controle_pragas` ADD CONSTRAINT `controle_pragas_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jardinagem` ADD CONSTRAINT `jardinagem_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `jardinagem_imagens` ADD CONSTRAINT `jardinagem_imagens_jardinagemId_jardinagem_id_fk` FOREIGN KEY (`jardinagemId`) REFERENCES `jardinagem`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leitura_medidor_imagens` ADD CONSTRAINT `leitura_medidor_imagens_leituraMedidorId_leitura_medidores_id_fk` FOREIGN KEY (`leituraMedidorId`) REFERENCES `leitura_medidores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leitura_medidores` ADD CONSTRAINT `leitura_medidores_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;