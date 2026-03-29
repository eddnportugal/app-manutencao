CREATE TABLE `achados_perdidos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`usuarioId` int NOT NULL,
	`tipo` enum('achado','perdido') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`fotoUrl` text,
	`localEncontrado` varchar(255),
	`dataOcorrencia` timestamp,
	`status` enum('aberto','resolvido') DEFAULT 'aberto',
	`contato` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `achados_perdidos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `albuns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`categoria` enum('eventos','obras','areas_comuns','melhorias','outros') NOT NULL DEFAULT 'outros',
	`capaUrl` text,
	`dataEvento` timestamp,
	`destaque` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `albuns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anexos_comentario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comentarioId` int NOT NULL,
	`url` text NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`tamanho` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `anexos_comentario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `antes_depois` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`fotoAntesUrl` text,
	`fotoDepoisUrl` text,
	`dataRealizacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `antes_depois_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anunciantes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`categoria` enum('comercio','servicos','profissionais','alimentacao','saude','educacao','outros') NOT NULL DEFAULT 'outros',
	`logoUrl` text,
	`telefone` varchar(20),
	`whatsapp` varchar(20),
	`email` varchar(320),
	`website` text,
	`endereco` text,
	`instagram` varchar(100),
	`facebook` varchar(100),
	`horarioFuncionamento` text,
	`statusAnunciante` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `anunciantes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `anuncios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`anuncianteId` int NOT NULL,
	`revistaId` int,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`bannerUrl` text,
	`linkDestino` text,
	`posicao` enum('capa','contracapa','pagina_interna','rodape','lateral') NOT NULL DEFAULT 'pagina_interna',
	`tamanho` enum('pequeno','medio','grande','pagina_inteira') NOT NULL DEFAULT 'medio',
	`dataInicio` timestamp,
	`dataFim` timestamp,
	`statusAnuncio` enum('ativo','pausado','expirado','pendente') NOT NULL DEFAULT 'pendente',
	`visualizacoes` int DEFAULT 0,
	`cliques` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `anuncios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `app_modulos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appId` int NOT NULL,
	`moduloKey` varchar(50) NOT NULL,
	`titulo` varchar(100) NOT NULL,
	`icone` varchar(50),
	`cor` varchar(20),
	`bgCor` varchar(20),
	`ordem` int DEFAULT 0,
	`habilitado` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `app_modulos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `apps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`logoUrl` text,
	`corPrimaria` varchar(20) DEFAULT '#4F46E5',
	`corSecundaria` varchar(20) DEFAULT '#10B981',
	`shareLink` varchar(50),
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apps_id` PRIMARY KEY(`id`),
	CONSTRAINT `apps_shareLink_unique` UNIQUE(`shareLink`)
);
--> statement-breakpoint
CREATE TABLE `aquisicoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`imagemUrl` text,
	`valor` varchar(50),
	`fornecedor` varchar(255),
	`dataAquisicao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aquisicoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `avisos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text,
	`tipo` enum('urgente','importante','informativo') DEFAULT 'informativo',
	`imagemUrl` text,
	`destaque` boolean DEFAULT false,
	`dataExpiracao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `avisos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `caronas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`usuarioId` int,
	`moradorId` int,
	`contato` varchar(255),
	`tipo` enum('oferece','procura') NOT NULL,
	`origem` varchar(255) NOT NULL,
	`destino` varchar(255) NOT NULL,
	`dataCarona` timestamp,
	`horario` varchar(10),
	`vagasDisponiveis` int DEFAULT 1,
	`observacoes` text,
	`status` enum('ativa','concluida','cancelada') DEFAULT 'ativa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `caronas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklist_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklist_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklist_itens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistId` int NOT NULL,
	`descricao` varchar(500) NOT NULL,
	`completo` boolean DEFAULT false,
	`observacao` text,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklist_itens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklist_template_itens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`descricao` varchar(500) NOT NULL,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklist_template_itens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklist_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`categoria` varchar(100),
	`icone` varchar(50),
	`cor` varchar(20),
	`isPadrao` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklist_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklist_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`checklistId` int NOT NULL,
	`tipo` enum('abertura','atualizacao','status_alterado','comentario','imagem_adicionada','responsavel_alterado','item_completo','fechamento','reabertura') NOT NULL,
	`descricao` text NOT NULL,
	`statusAnterior` varchar(50),
	`statusNovo` varchar(50),
	`userId` int,
	`userNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checklist_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `checklists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(20) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` varchar(255),
	`descricao` text,
	`observacoes` text,
	`responsavelId` int,
	`responsavelNome` varchar(255),
	`localizacao` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`enderecoGeo` text,
	`dataAgendada` timestamp,
	`dataRealizada` timestamp,
	`status` enum('pendente','realizada','acao_necessaria','finalizada','reaberta') NOT NULL DEFAULT 'pendente',
	`prioridade` enum('baixa','media','alta','urgente') DEFAULT 'media',
	`categoria` varchar(100),
	`totalItens` int DEFAULT 0,
	`itensCompletos` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checklists_id` PRIMARY KEY(`id`),
	CONSTRAINT `checklists_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
CREATE TABLE `classificados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`usuarioId` int,
	`moradorId` int,
	`tipo` enum('produto','servico') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`preco` varchar(50),
	`fotoUrl` text,
	`contato` varchar(255),
	`status` enum('pendente','aprovado','rejeitado','vendido') DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `classificados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comentarios_item` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` int NOT NULL,
	`itemTipo` enum('vistoria','manutencao','ocorrencia','checklist') NOT NULL,
	`condominioId` int NOT NULL,
	`autorId` int,
	`autorNome` varchar(255) NOT NULL,
	`autorWhatsapp` varchar(20),
	`autorEmail` varchar(320),
	`autorFoto` text,
	`texto` text NOT NULL,
	`isInterno` boolean NOT NULL DEFAULT false,
	`lido` boolean NOT NULL DEFAULT false,
	`lidoPorId` int,
	`lidoEm` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comentarios_item_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comunicados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`anexoUrl` text,
	`anexoNome` varchar(255),
	`anexoTipo` varchar(100),
	`anexoTamanho` int,
	`dataPublicacao` timestamp DEFAULT (now()),
	`destaque` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comunicados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `condominio_funcoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`funcaoId` varchar(50) NOT NULL,
	`habilitada` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `condominio_funcoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `condominios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigo` varchar(50),
	`cnpj` varchar(20),
	`nome` varchar(255) NOT NULL,
	`endereco` text,
	`cidade` varchar(100),
	`estado` varchar(50),
	`cep` varchar(10),
	`logoUrl` text,
	`bannerUrl` text,
	`capaUrl` text,
	`corPrimaria` varchar(20) DEFAULT '#4F46E5',
	`corSecundaria` varchar(20) DEFAULT '#10B981',
	`cadastroToken` varchar(32),
	`assembleiaLink` text,
	`assembleiaData` timestamp,
	`sindicoId` int,
	`cabecalhoLogoUrl` text,
	`cabecalhoNomeCondominio` varchar(255),
	`cabecalhoNomeSindico` varchar(255),
	`rodapeTexto` text,
	`rodapeContato` varchar(255),
	`telefoneContato` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `condominios_id` PRIMARY KEY(`id`),
	CONSTRAINT `condominios_cadastroToken_unique` UNIQUE(`cadastroToken`)
);
--> statement-breakpoint
CREATE TABLE `configuracoes_email` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`provedor` enum('resend','sendgrid','mailgun','smtp') DEFAULT 'resend',
	`apiKey` text,
	`emailRemetente` varchar(255),
	`nomeRemetente` varchar(255),
	`ativo` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracoes_email_id` PRIMARY KEY(`id`),
	CONSTRAINT `configuracoes_email_condominioId_unique` UNIQUE(`condominioId`)
);
--> statement-breakpoint
CREATE TABLE `configuracoes_push` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`vapidPublicKey` text,
	`vapidPrivateKey` text,
	`vapidSubject` varchar(255),
	`ativo` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracoes_push_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `destaques` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` varchar(255),
	`descricao` text,
	`link` text,
	`arquivoUrl` text,
	`arquivoNome` varchar(255),
	`videoUrl` text,
	`ordem` int DEFAULT 0,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `destaques_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dicas_seguranca` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`categoria` enum('geral','incendio','roubo','criancas','idosos','digital','veiculos') DEFAULT 'geral',
	`icone` varchar(50) DEFAULT 'shield',
	`ativo` boolean DEFAULT true,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dicas_seguranca_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`dataEvento` timestamp,
	`horaInicio` varchar(10),
	`horaFim` varchar(10),
	`local` varchar(255),
	`imagemUrl` text,
	`tipo` enum('agendado','realizado') DEFAULT 'agendado',
	`nomeResponsavel` varchar(255),
	`whatsappResponsavel` varchar(20),
	`lembreteAntecedencia` int DEFAULT 1,
	`lembreteEnviado` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eventos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `favoritos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`condominioId` int,
	`tipoItem` enum('aviso','comunicado','evento','realizacao','melhoria','aquisicao','votacao','classificado','carona','achado_perdido','funcionario','galeria','card_secao') NOT NULL,
	`itemId` int,
	`cardSecaoId` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favoritos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`albumId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(500),
	`ordem` int DEFAULT 0,
	`largura` int,
	`altura` int,
	`tamanho` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funcionario_acessos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionarioId` int NOT NULL,
	`condominioId` int NOT NULL,
	`dataHora` timestamp NOT NULL DEFAULT (now()),
	`ip` varchar(45),
	`userAgent` text,
	`dispositivo` varchar(100),
	`navegador` varchar(100),
	`sistemaOperacional` varchar(100),
	`localizacao` varchar(255),
	`latitude` varchar(20),
	`longitude` varchar(20),
	`cidade` varchar(100),
	`regiao` varchar(100),
	`pais` varchar(100),
	`tipoAcesso` enum('login','logout','recuperacao_senha','alteracao_senha') DEFAULT 'login',
	`sucesso` boolean DEFAULT true,
	`motivoFalha` text,
	CONSTRAINT `funcionario_acessos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funcionario_apps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionarioId` int NOT NULL,
	`appId` int NOT NULL,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funcionario_apps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funcionario_condominios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionarioId` int NOT NULL,
	`condominioId` int NOT NULL,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funcionario_condominios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funcionario_funcoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`funcionarioId` int NOT NULL,
	`funcaoKey` varchar(100) NOT NULL,
	`habilitada` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funcionario_funcoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funcionarios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cargo` varchar(100),
	`departamento` varchar(100),
	`telefone` varchar(20),
	`email` varchar(255),
	`fotoUrl` text,
	`descricao` text,
	`dataAdmissao` timestamp,
	`ativo` boolean DEFAULT true,
	`tipoFuncionario` enum('zelador','porteiro','supervisor','gerente','auxiliar','sindico_externo') DEFAULT 'auxiliar',
	`loginEmail` varchar(255),
	`senha` varchar(255),
	`loginAtivo` boolean DEFAULT false,
	`ultimoLogin` timestamp,
	`resetToken` varchar(64),
	`resetTokenExpira` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funcionarios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `funcoes_rapidas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`funcaoId` varchar(100) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`path` varchar(255) NOT NULL,
	`icone` varchar(100) NOT NULL,
	`cor` varchar(20) NOT NULL,
	`ordem` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `funcoes_rapidas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historico_compartilhamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`linkId` int NOT NULL,
	`membroId` int,
	`membroNome` varchar(255),
	`membroWhatsapp` varchar(20),
	`compartilhadoPorId` int,
	`compartilhadoPorNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_compartilhamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historico_notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`tipo` enum('push','email','whatsapp','sistema') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text,
	`destinatarios` int DEFAULT 0,
	`sucessos` int DEFAULT 0,
	`falhas` int DEFAULT 0,
	`lembreteId` int,
	`enviadoPor` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_achados_perdidos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`achadoPerdidoId` int NOT NULL,
	`imagemUrl` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_achados_perdidos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_aquisicoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`aquisicaoId` int NOT NULL,
	`imagemUrl` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_aquisicoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_custom` (
	`id` int AUTO_INCREMENT NOT NULL,
	`paginaId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_custom_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_destaques` (
	`id` int AUTO_INCREMENT NOT NULL,
	`destaqueId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_destaques_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_melhorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`melhoriaId` int NOT NULL,
	`imagemUrl` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_melhorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_realizacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`realizacaoId` int NOT NULL,
	`imagemUrl` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_realizacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `imagens_vagas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vagaId` int NOT NULL,
	`tipo` enum('imagem','anexo') DEFAULT 'imagem',
	`url` text NOT NULL,
	`nome` varchar(255),
	`mimeType` varchar(100),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `imagens_vagas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inscricoes_revista` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`revistaId` int,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`unidade` varchar(50),
	`whatsapp` varchar(20),
	`status` enum('pendente','ativo','inativo') NOT NULL DEFAULT 'pendente',
	`ativadoPor` int,
	`dataAtivacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inscricoes_revista_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lembretes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`tipo` enum('assembleia','vencimento','evento','manutencao','custom') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text,
	`dataAgendada` timestamp NOT NULL,
	`antecedenciaHoras` int DEFAULT 24,
	`enviado` boolean DEFAULT false,
	`enviadoEm` timestamp,
	`referenciaId` int,
	`referenciaTipo` varchar(50),
	`canais` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lembretes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `links_compartilhaveis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`tipo` enum('vistoria','manutencao','ocorrencia','checklist') NOT NULL,
	`itemId` int NOT NULL,
	`token` varchar(64) NOT NULL,
	`editavel` boolean NOT NULL DEFAULT false,
	`expiracaoHoras` int DEFAULT 168,
	`acessos` int NOT NULL DEFAULT 0,
	`criadoPorId` int,
	`criadoPorNome` varchar(255),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `links_compartilhaveis_id` PRIMARY KEY(`id`),
	CONSTRAINT `links_compartilhaveis_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `links_uteis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`descricao` text,
	`icone` varchar(50),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `links_uteis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manutencao_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`manutencaoId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manutencao_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manutencao_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`manutencaoId` int NOT NULL,
	`tipo` enum('abertura','atualizacao','status_alterado','comentario','imagem_adicionada','responsavel_alterado','fechamento','reabertura') NOT NULL,
	`descricao` text NOT NULL,
	`statusAnterior` varchar(50),
	`statusNovo` varchar(50),
	`userId` int,
	`userNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `manutencao_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `manutencoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(20) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` varchar(255),
	`descricao` text,
	`observacoes` text,
	`responsavelId` int,
	`responsavelNome` varchar(255),
	`localizacao` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`enderecoGeo` text,
	`dataAgendada` timestamp,
	`dataRealizada` timestamp,
	`status` enum('pendente','realizada','acao_necessaria','finalizada','reaberta') NOT NULL DEFAULT 'pendente',
	`prioridade` enum('baixa','media','alta','urgente') DEFAULT 'media',
	`tipo` enum('preventiva','corretiva','emergencial','programada') DEFAULT 'corretiva',
	`tempoEstimadoDias` int DEFAULT 0,
	`tempoEstimadoHoras` int DEFAULT 0,
	`tempoEstimadoMinutos` int DEFAULT 0,
	`fornecedor` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `manutencoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `manutencoes_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
CREATE TABLE `melhorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`imagemUrl` text,
	`custo` varchar(50),
	`dataImplementacao` timestamp,
	`status` enum('planejada','em_andamento','concluida') DEFAULT 'planejada',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `melhorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `membros_equipe` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`descricao` text,
	`cargo` varchar(100),
	`fotoUrl` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `membros_equipe_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mensagens_sindico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`fotoSindicoUrl` text,
	`nomeSindico` varchar(255),
	`titulo` varchar(255),
	`mensagem` text,
	`assinatura` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mensagens_sindico_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moradores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`usuarioId` int,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`telefone` varchar(20),
	`celular` varchar(20),
	`apartamento` varchar(20) NOT NULL,
	`bloco` varchar(20),
	`andar` varchar(10),
	`tipo` enum('proprietario','inquilino','familiar','funcionario') DEFAULT 'proprietario',
	`cpf` varchar(14),
	`dataNascimento` timestamp,
	`fotoUrl` text,
	`observacoes` text,
	`dataEntrada` timestamp,
	`dataSaida` timestamp,
	`ativo` boolean DEFAULT true,
	`senha` varchar(255),
	`loginToken` varchar(64),
	`loginTokenExpira` timestamp,
	`resetToken` varchar(64),
	`resetTokenExpira` timestamp,
	`ultimoLogin` timestamp,
	`bloqueadoVotacao` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `moradores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`condominioId` int,
	`tipo` enum('aviso','evento','votacao','classificado','carona','geral') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text,
	`link` varchar(500),
	`referenciaId` int,
	`lida` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes_infracao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`moradorId` int NOT NULL,
	`tipoInfracaoId` int,
	`titulo` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`imagens` json,
	`status` enum('pendente','respondida','resolvida','arquivada') DEFAULT 'pendente',
	`dataOcorrencia` timestamp,
	`pdfUrl` text,
	`linkPublico` varchar(64) NOT NULL,
	`enviadoWhatsapp` boolean DEFAULT false,
	`enviadoEmail` boolean DEFAULT false,
	`criadoPor` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificacoes_infracao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ocorrencia_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ocorrenciaId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ocorrencia_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ocorrencia_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ocorrenciaId` int NOT NULL,
	`tipo` enum('abertura','atualizacao','status_alterado','comentario','imagem_adicionada','responsavel_alterado','fechamento','reabertura') NOT NULL,
	`descricao` text NOT NULL,
	`statusAnterior` varchar(50),
	`statusNovo` varchar(50),
	`userId` int,
	`userNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ocorrencia_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ocorrencias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(20) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` varchar(255),
	`descricao` text,
	`observacoes` text,
	`reportadoPorId` int,
	`reportadoPorNome` varchar(255),
	`responsavelId` int,
	`responsavelNome` varchar(255),
	`localizacao` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`enderecoGeo` text,
	`dataOcorrencia` timestamp,
	`status` enum('pendente','realizada','acao_necessaria','finalizada','reaberta') NOT NULL DEFAULT 'pendente',
	`prioridade` enum('baixa','media','alta','urgente') DEFAULT 'media',
	`categoria` enum('seguranca','barulho','manutencao','convivencia','animais','estacionamento','limpeza','outros') DEFAULT 'outros',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ocorrencias_id` PRIMARY KEY(`id`),
	CONSTRAINT `ocorrencias_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
CREATE TABLE `opcoes_votacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`votacaoId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`imagemUrl` text,
	`votos` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `opcoes_votacao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ordens_servico` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(10) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`categoriaId` int,
	`prioridadeId` int,
	`statusId` int,
	`setorId` int,
	`endereco` text,
	`latitude` varchar(20),
	`longitude` varchar(20),
	`localizacaoDescricao` varchar(255),
	`tempoEstimadoDias` int DEFAULT 0,
	`tempoEstimadoHoras` int DEFAULT 0,
	`tempoEstimadoMinutos` int DEFAULT 0,
	`dataInicio` timestamp,
	`dataFim` timestamp,
	`tempoDecorridoMinutos` int,
	`valorEstimado` decimal(10,2),
	`valorReal` decimal(10,2),
	`manutencaoId` int,
	`chatToken` varchar(64),
	`chatAtivo` boolean DEFAULT true,
	`solicitanteId` int,
	`solicitanteNome` varchar(255),
	`solicitanteTipo` enum('sindico','morador','funcionario','administradora') DEFAULT 'sindico',
	`shareToken` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ordens_servico_id` PRIMARY KEY(`id`),
	CONSTRAINT `ordens_servico_chatToken_unique` UNIQUE(`chatToken`),
	CONSTRAINT `ordens_servico_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `os_categorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`icone` varchar(50),
	`cor` varchar(20),
	`isPadrao` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_categorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_chat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`remetenteId` int,
	`remetenteNome` varchar(255) NOT NULL,
	`remetenteTipo` enum('sindico','morador','funcionario','visitante') DEFAULT 'visitante',
	`mensagem` text,
	`anexoUrl` text,
	`anexoNome` varchar(255),
	`anexoTipo` varchar(100),
	`anexoTamanho` int,
	`lida` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `os_chat_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_configuracoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`habilitarOrcamentos` boolean DEFAULT true,
	`habilitarAprovacaoOrcamento` boolean DEFAULT true,
	`habilitarGestaoFinanceira` boolean DEFAULT true,
	`habilitarRelatoriosGastos` boolean DEFAULT true,
	`habilitarVinculoManutencao` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_configuracoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `os_configuracoes_condominioId_unique` UNIQUE(`condominioId`)
);
--> statement-breakpoint
CREATE TABLE `os_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`url` text NOT NULL,
	`tipo` enum('antes','durante','depois','orcamento','outro') DEFAULT 'outro',
	`descricao` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `os_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_materiais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`quantidade` int DEFAULT 1,
	`unidade` varchar(20),
	`emEstoque` boolean DEFAULT false,
	`precisaPedir` boolean DEFAULT false,
	`pedidoDescricao` text,
	`valorUnitario` decimal(10,2),
	`valorTotal` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_materiais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_orcamentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`fornecedor` varchar(255),
	`descricao` text,
	`valor` decimal(10,2) NOT NULL,
	`dataOrcamento` timestamp DEFAULT (now()),
	`dataValidade` timestamp,
	`aprovado` boolean DEFAULT false,
	`aprovadoPor` int,
	`dataAprovacao` timestamp,
	`motivoRejeicao` text,
	`anexoUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_orcamentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_prioridades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`nivel` int DEFAULT 1,
	`cor` varchar(20),
	`icone` varchar(50),
	`isPadrao` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_prioridades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_responsaveis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cargo` varchar(100),
	`telefone` varchar(20),
	`email` varchar(255),
	`funcionarioId` int,
	`principal` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `os_responsaveis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_setores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`descricao` text,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_setores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`cor` varchar(20),
	`icone` varchar(50),
	`ordem` int DEFAULT 0,
	`isFinal` boolean DEFAULT false,
	`isPadrao` boolean DEFAULT false,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `os_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `os_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ordemServicoId` int NOT NULL,
	`tipo` enum('criacao','status_alterado','responsavel_adicionado','responsavel_removido','material_adicionado','material_removido','orcamento_adicionado','orcamento_aprovado','orcamento_rejeitado','orcamento_removido','inicio_servico','fim_servico','comentario','foto_adicionada','localizacao_atualizada','vinculo_manutencao') NOT NULL,
	`descricao` text,
	`usuarioId` int,
	`usuarioNome` varchar(255),
	`dadosAnteriores` json,
	`dadosNovos` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `os_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paginas_custom` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` varchar(255),
	`descricao` text,
	`link` text,
	`videoUrl` text,
	`arquivoUrl` text,
	`arquivoNome` varchar(255),
	`imagens` json,
	`ativo` boolean DEFAULT true,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paginas_custom_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `preferencias_notificacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`avisos` boolean DEFAULT true,
	`eventos` boolean DEFAULT true,
	`votacoes` boolean DEFAULT true,
	`classificados` boolean DEFAULT true,
	`caronas` boolean DEFAULT true,
	`emailNotificacoes` boolean DEFAULT false,
	`efeitoTransicao` varchar(50) DEFAULT 'slide',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `preferencias_notificacao_id` PRIMARY KEY(`id`),
	CONSTRAINT `preferencias_notificacao_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `publicidades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`anunciante` varchar(255) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`imagemUrl` text,
	`linkUrl` text,
	`telefone` varchar(20),
	`tipo` enum('banner','destaque','lateral') DEFAULT 'banner',
	`ativo` boolean DEFAULT true,
	`dataInicio` timestamp,
	`dataFim` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `publicidades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int,
	`moradorId` int,
	`userId` int,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`userAgent` text,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `realizacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`imagemUrl` text,
	`dataRealizacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `realizacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regras_normas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`categoria` enum('geral','convivencia','areas_comuns','animais','barulho','estacionamento','mudancas','obras','piscina','salao_festas') DEFAULT 'geral',
	`ativo` boolean DEFAULT true,
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `regras_normas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `respostas_comentario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`comentarioId` int NOT NULL,
	`autorId` int,
	`autorNome` varchar(255) NOT NULL,
	`autorFoto` text,
	`texto` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `respostas_comentario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `respostas_infracao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificacaoId` int NOT NULL,
	`autorTipo` enum('sindico','morador') NOT NULL,
	`autorId` int,
	`autorNome` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`imagens` json,
	`lidaPeloSindico` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `respostas_infracao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `revistas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` text,
	`edicao` varchar(50),
	`capaUrl` text,
	`templateId` varchar(50) DEFAULT 'default',
	`status` enum('rascunho','publicada','arquivada') NOT NULL DEFAULT 'rascunho',
	`publicadaEm` timestamp,
	`visualizacoes` int DEFAULT 0,
	`shareLink` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revistas_id` PRIMARY KEY(`id`),
	CONSTRAINT `revistas_shareLink_unique` UNIQUE(`shareLink`)
);
--> statement-breakpoint
CREATE TABLE `secoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`tipo` enum('mensagem_sindico','avisos','comunicados','dicas_seguranca','regras','links_uteis','telefones_uteis','realizacoes','antes_depois','melhorias','aquisicoes','funcionarios','agenda_eventos','eventos','achados_perdidos','caronas','vagas_estacionamento','classificados','votacoes','publicidade') NOT NULL,
	`titulo` varchar(255),
	`ordem` int DEFAULT 0,
	`ativo` boolean DEFAULT true,
	`config` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `secoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `telefones_uteis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`descricao` text,
	`categoria` varchar(100),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `telefones_uteis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templates_notificacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`titulo` varchar(100) NOT NULL,
	`mensagem` text NOT NULL,
	`categoria` enum('assembleia','manutencao','vencimento','aviso','evento','custom') DEFAULT 'custom',
	`icone` varchar(50),
	`cor` varchar(20),
	`urlDestino` varchar(255),
	`ativo` boolean DEFAULT true,
	`usageCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templates_notificacao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tipos_infracao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricaoPadrao` text,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tipos_infracao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vagas_estacionamento` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`numero` varchar(20) NOT NULL,
	`apartamento` varchar(20),
	`bloco` varchar(20),
	`tipo` enum('coberta','descoberta','moto') DEFAULT 'coberta',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vagas_estacionamento_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `valores_salvos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`tipo` enum('responsavel','categoria_vistoria','categoria_manutencao','categoria_checklist','categoria_ocorrencia','tipo_vistoria','tipo_manutencao','tipo_checklist','tipo_ocorrencia','fornecedor','localizacao') NOT NULL,
	`valor` varchar(255) NOT NULL,
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `valores_salvos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vencimento_alertas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vencimentoId` int NOT NULL,
	`tipoAlerta` enum('na_data','um_dia_antes','uma_semana_antes','quinze_dias_antes','um_mes_antes') NOT NULL,
	`ativo` boolean DEFAULT true,
	`enviado` boolean DEFAULT false,
	`dataEnvio` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vencimento_alertas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vencimento_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`nome` varchar(255),
	`ativo` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vencimento_emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vencimento_notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vencimentoId` int NOT NULL,
	`alertaId` int,
	`emailDestinatario` varchar(320) NOT NULL,
	`assunto` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`status` enum('enviado','erro','pendente') NOT NULL DEFAULT 'pendente',
	`erroMensagem` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vencimento_notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vencimentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`tipo` enum('contrato','servico','manutencao') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`fornecedor` varchar(255),
	`valor` decimal(10,2),
	`dataInicio` timestamp,
	`dataVencimento` timestamp NOT NULL,
	`ultimaRealizacao` timestamp,
	`proximaRealizacao` timestamp,
	`periodicidade` enum('unico','mensal','bimestral','trimestral','semestral','anual') DEFAULT 'unico',
	`status` enum('ativo','vencido','renovado','cancelado') NOT NULL DEFAULT 'ativo',
	`observacoes` text,
	`arquivoUrl` text,
	`arquivoNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vencimentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vistoria_imagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vistoriaId` int NOT NULL,
	`url` text NOT NULL,
	`legenda` varchar(255),
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vistoria_imagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vistoria_timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vistoriaId` int NOT NULL,
	`tipo` enum('abertura','atualizacao','status_alterado','comentario','imagem_adicionada','responsavel_alterado','fechamento','reabertura') NOT NULL,
	`descricao` text NOT NULL,
	`statusAnterior` varchar(50),
	`statusNovo` varchar(50),
	`userId` int,
	`userNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vistoria_timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vistorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`condominioId` int NOT NULL,
	`protocolo` varchar(20) NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`subtitulo` varchar(255),
	`descricao` text,
	`observacoes` text,
	`responsavelId` int,
	`responsavelNome` varchar(255),
	`localizacao` varchar(255),
	`latitude` decimal(10,8),
	`longitude` decimal(11,8),
	`enderecoGeo` text,
	`dataAgendada` timestamp,
	`dataRealizada` timestamp,
	`status` enum('pendente','realizada','acao_necessaria','finalizada','reaberta') NOT NULL DEFAULT 'pendente',
	`prioridade` enum('baixa','media','alta','urgente') DEFAULT 'media',
	`tipo` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vistorias_id` PRIMARY KEY(`id`),
	CONSTRAINT `vistorias_protocolo_unique` UNIQUE(`protocolo`)
);
--> statement-breakpoint
CREATE TABLE `votacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revistaId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`tipo` enum('funcionario_mes','enquete','decisao') NOT NULL,
	`imagemUrl` text,
	`arquivoUrl` text,
	`videoUrl` text,
	`dataInicio` timestamp,
	`dataFim` timestamp,
	`status` enum('ativa','encerrada') DEFAULT 'ativa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `votacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `votos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`votacaoId` int NOT NULL,
	`opcaoId` int NOT NULL,
	`usuarioId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `votos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','sindico','morador') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `avatarUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `apartment` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `senha` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `resetToken` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `resetTokenExpira` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `tipoConta` enum('sindico','administradora','admin') DEFAULT 'sindico';--> statement-breakpoint
ALTER TABLE `achados_perdidos` ADD CONSTRAINT `achados_perdidos_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `achados_perdidos` ADD CONSTRAINT `achados_perdidos_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `albuns` ADD CONSTRAINT `albuns_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anexos_comentario` ADD CONSTRAINT `anexos_comentario_comentarioId_comentarios_item_id_fk` FOREIGN KEY (`comentarioId`) REFERENCES `comentarios_item`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `antes_depois` ADD CONSTRAINT `antes_depois_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anunciantes` ADD CONSTRAINT `anunciantes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anuncios` ADD CONSTRAINT `anuncios_anuncianteId_anunciantes_id_fk` FOREIGN KEY (`anuncianteId`) REFERENCES `anunciantes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `anuncios` ADD CONSTRAINT `anuncios_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `app_modulos` ADD CONSTRAINT `app_modulos_appId_apps_id_fk` FOREIGN KEY (`appId`) REFERENCES `apps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `apps` ADD CONSTRAINT `apps_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aquisicoes` ADD CONSTRAINT `aquisicoes_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `avisos` ADD CONSTRAINT `avisos_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `caronas` ADD CONSTRAINT `caronas_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `caronas` ADD CONSTRAINT `caronas_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `caronas` ADD CONSTRAINT `caronas_moradorId_moradores_id_fk` FOREIGN KEY (`moradorId`) REFERENCES `moradores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_imagens` ADD CONSTRAINT `checklist_imagens_checklistId_checklists_id_fk` FOREIGN KEY (`checklistId`) REFERENCES `checklists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_itens` ADD CONSTRAINT `checklist_itens_checklistId_checklists_id_fk` FOREIGN KEY (`checklistId`) REFERENCES `checklists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_template_itens` ADD CONSTRAINT `checklist_template_itens_templateId_checklist_templates_id_fk` FOREIGN KEY (`templateId`) REFERENCES `checklist_templates`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_templates` ADD CONSTRAINT `checklist_templates_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_timeline` ADD CONSTRAINT `checklist_timeline_checklistId_checklists_id_fk` FOREIGN KEY (`checklistId`) REFERENCES `checklists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklist_timeline` ADD CONSTRAINT `checklist_timeline_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_responsavelId_users_id_fk` FOREIGN KEY (`responsavelId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classificados` ADD CONSTRAINT `classificados_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classificados` ADD CONSTRAINT `classificados_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `classificados` ADD CONSTRAINT `classificados_moradorId_moradores_id_fk` FOREIGN KEY (`moradorId`) REFERENCES `moradores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comentarios_item` ADD CONSTRAINT `comentarios_item_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comentarios_item` ADD CONSTRAINT `comentarios_item_autorId_users_id_fk` FOREIGN KEY (`autorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comentarios_item` ADD CONSTRAINT `comentarios_item_lidoPorId_users_id_fk` FOREIGN KEY (`lidoPorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comunicados` ADD CONSTRAINT `comunicados_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `condominio_funcoes` ADD CONSTRAINT `condominio_funcoes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `condominios` ADD CONSTRAINT `condominios_sindicoId_users_id_fk` FOREIGN KEY (`sindicoId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `configuracoes_email` ADD CONSTRAINT `configuracoes_email_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `configuracoes_push` ADD CONSTRAINT `configuracoes_push_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `destaques` ADD CONSTRAINT `destaques_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dicas_seguranca` ADD CONSTRAINT `dicas_seguranca_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `eventos` ADD CONSTRAINT `eventos_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoritos` ADD CONSTRAINT `favoritos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `favoritos` ADD CONSTRAINT `favoritos_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fotos` ADD CONSTRAINT `fotos_albumId_albuns_id_fk` FOREIGN KEY (`albumId`) REFERENCES `albuns`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionario_acessos` ADD CONSTRAINT `funcionario_acessos_funcionarioId_funcionarios_id_fk` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionario_acessos` ADD CONSTRAINT `funcionario_acessos_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionario_apps` ADD CONSTRAINT `funcionario_apps_funcionarioId_funcionarios_id_fk` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionario_apps` ADD CONSTRAINT `funcionario_apps_appId_apps_id_fk` FOREIGN KEY (`appId`) REFERENCES `apps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionario_condominios` ADD CONSTRAINT `funcionario_condominios_funcionarioId_funcionarios_id_fk` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionario_condominios` ADD CONSTRAINT `funcionario_condominios_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionario_funcoes` ADD CONSTRAINT `funcionario_funcoes_funcionarioId_funcionarios_id_fk` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcionarios` ADD CONSTRAINT `funcionarios_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `funcoes_rapidas` ADD CONSTRAINT `funcoes_rapidas_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_compartilhamentos` ADD CONSTRAINT `historico_compartilhamentos_linkId_links_compartilhaveis_id_fk` FOREIGN KEY (`linkId`) REFERENCES `links_compartilhaveis`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_compartilhamentos` ADD CONSTRAINT `historico_compartilhamentos_membroId_membros_equipe_id_fk` FOREIGN KEY (`membroId`) REFERENCES `membros_equipe`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_compartilhamentos` ADD CONSTRAINT `historico_compartilhamentos_compartilhadoPorId_users_id_fk` FOREIGN KEY (`compartilhadoPorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_notificacoes` ADD CONSTRAINT `historico_notificacoes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_notificacoes` ADD CONSTRAINT `historico_notificacoes_lembreteId_lembretes_id_fk` FOREIGN KEY (`lembreteId`) REFERENCES `lembretes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_notificacoes` ADD CONSTRAINT `historico_notificacoes_enviadoPor_users_id_fk` FOREIGN KEY (`enviadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_achados_perdidos` ADD CONSTRAINT `imagens_achados_perdidos_achadoPerdidoId_achados_perdidos_id_fk` FOREIGN KEY (`achadoPerdidoId`) REFERENCES `achados_perdidos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_aquisicoes` ADD CONSTRAINT `imagens_aquisicoes_aquisicaoId_aquisicoes_id_fk` FOREIGN KEY (`aquisicaoId`) REFERENCES `aquisicoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_custom` ADD CONSTRAINT `imagens_custom_paginaId_paginas_custom_id_fk` FOREIGN KEY (`paginaId`) REFERENCES `paginas_custom`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_destaques` ADD CONSTRAINT `imagens_destaques_destaqueId_destaques_id_fk` FOREIGN KEY (`destaqueId`) REFERENCES `destaques`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_melhorias` ADD CONSTRAINT `imagens_melhorias_melhoriaId_melhorias_id_fk` FOREIGN KEY (`melhoriaId`) REFERENCES `melhorias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_realizacoes` ADD CONSTRAINT `imagens_realizacoes_realizacaoId_realizacoes_id_fk` FOREIGN KEY (`realizacaoId`) REFERENCES `realizacoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `imagens_vagas` ADD CONSTRAINT `imagens_vagas_vagaId_vagas_estacionamento_id_fk` FOREIGN KEY (`vagaId`) REFERENCES `vagas_estacionamento`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inscricoes_revista` ADD CONSTRAINT `inscricoes_revista_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inscricoes_revista` ADD CONSTRAINT `inscricoes_revista_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `inscricoes_revista` ADD CONSTRAINT `inscricoes_revista_ativadoPor_users_id_fk` FOREIGN KEY (`ativadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `lembretes` ADD CONSTRAINT `lembretes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `links_compartilhaveis` ADD CONSTRAINT `links_compartilhaveis_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `links_compartilhaveis` ADD CONSTRAINT `links_compartilhaveis_criadoPorId_users_id_fk` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `links_uteis` ADD CONSTRAINT `links_uteis_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencao_imagens` ADD CONSTRAINT `manutencao_imagens_manutencaoId_manutencoes_id_fk` FOREIGN KEY (`manutencaoId`) REFERENCES `manutencoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencao_timeline` ADD CONSTRAINT `manutencao_timeline_manutencaoId_manutencoes_id_fk` FOREIGN KEY (`manutencaoId`) REFERENCES `manutencoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencao_timeline` ADD CONSTRAINT `manutencao_timeline_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `manutencoes` ADD CONSTRAINT `manutencoes_responsavelId_users_id_fk` FOREIGN KEY (`responsavelId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `melhorias` ADD CONSTRAINT `melhorias_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `membros_equipe` ADD CONSTRAINT `membros_equipe_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mensagens_sindico` ADD CONSTRAINT `mensagens_sindico_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `moradores` ADD CONSTRAINT `moradores_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `moradores` ADD CONSTRAINT `moradores_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes` ADD CONSTRAINT `notificacoes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes_infracao` ADD CONSTRAINT `notificacoes_infracao_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes_infracao` ADD CONSTRAINT `notificacoes_infracao_moradorId_moradores_id_fk` FOREIGN KEY (`moradorId`) REFERENCES `moradores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes_infracao` ADD CONSTRAINT `notificacoes_infracao_tipoInfracaoId_tipos_infracao_id_fk` FOREIGN KEY (`tipoInfracaoId`) REFERENCES `tipos_infracao`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notificacoes_infracao` ADD CONSTRAINT `notificacoes_infracao_criadoPor_users_id_fk` FOREIGN KEY (`criadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencia_imagens` ADD CONSTRAINT `ocorrencia_imagens_ocorrenciaId_ocorrencias_id_fk` FOREIGN KEY (`ocorrenciaId`) REFERENCES `ocorrencias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencia_timeline` ADD CONSTRAINT `ocorrencia_timeline_ocorrenciaId_ocorrencias_id_fk` FOREIGN KEY (`ocorrenciaId`) REFERENCES `ocorrencias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencia_timeline` ADD CONSTRAINT `ocorrencia_timeline_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_reportadoPorId_users_id_fk` FOREIGN KEY (`reportadoPorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ocorrencias` ADD CONSTRAINT `ocorrencias_responsavelId_users_id_fk` FOREIGN KEY (`responsavelId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `opcoes_votacao` ADD CONSTRAINT `opcoes_votacao_votacaoId_votacoes_id_fk` FOREIGN KEY (`votacaoId`) REFERENCES `votacoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_categoriaId_os_categorias_id_fk` FOREIGN KEY (`categoriaId`) REFERENCES `os_categorias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_prioridadeId_os_prioridades_id_fk` FOREIGN KEY (`prioridadeId`) REFERENCES `os_prioridades`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_statusId_os_status_id_fk` FOREIGN KEY (`statusId`) REFERENCES `os_status`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_setorId_os_setores_id_fk` FOREIGN KEY (`setorId`) REFERENCES `os_setores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_manutencaoId_manutencoes_id_fk` FOREIGN KEY (`manutencaoId`) REFERENCES `manutencoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ordens_servico` ADD CONSTRAINT `ordens_servico_solicitanteId_users_id_fk` FOREIGN KEY (`solicitanteId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_categorias` ADD CONSTRAINT `os_categorias_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_chat` ADD CONSTRAINT `os_chat_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_chat` ADD CONSTRAINT `os_chat_remetenteId_users_id_fk` FOREIGN KEY (`remetenteId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_configuracoes` ADD CONSTRAINT `os_configuracoes_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_imagens` ADD CONSTRAINT `os_imagens_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_materiais` ADD CONSTRAINT `os_materiais_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_orcamentos` ADD CONSTRAINT `os_orcamentos_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_orcamentos` ADD CONSTRAINT `os_orcamentos_aprovadoPor_users_id_fk` FOREIGN KEY (`aprovadoPor`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_prioridades` ADD CONSTRAINT `os_prioridades_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_responsaveis` ADD CONSTRAINT `os_responsaveis_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_responsaveis` ADD CONSTRAINT `os_responsaveis_funcionarioId_funcionarios_id_fk` FOREIGN KEY (`funcionarioId`) REFERENCES `funcionarios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_setores` ADD CONSTRAINT `os_setores_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_status` ADD CONSTRAINT `os_status_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_timeline` ADD CONSTRAINT `os_timeline_ordemServicoId_ordens_servico_id_fk` FOREIGN KEY (`ordemServicoId`) REFERENCES `ordens_servico`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `os_timeline` ADD CONSTRAINT `os_timeline_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `paginas_custom` ADD CONSTRAINT `paginas_custom_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `preferencias_notificacao` ADD CONSTRAINT `preferencias_notificacao_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publicidades` ADD CONSTRAINT `publicidades_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_moradorId_moradores_id_fk` FOREIGN KEY (`moradorId`) REFERENCES `moradores`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `realizacoes` ADD CONSTRAINT `realizacoes_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `regras_normas` ADD CONSTRAINT `regras_normas_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `respostas_comentario` ADD CONSTRAINT `respostas_comentario_comentarioId_comentarios_item_id_fk` FOREIGN KEY (`comentarioId`) REFERENCES `comentarios_item`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `respostas_comentario` ADD CONSTRAINT `respostas_comentario_autorId_users_id_fk` FOREIGN KEY (`autorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `respostas_infracao` ADD CONSTRAINT `respostas_infracao_notificacaoId_notificacoes_infracao_id_fk` FOREIGN KEY (`notificacaoId`) REFERENCES `notificacoes_infracao`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revistas` ADD CONSTRAINT `revistas_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `secoes` ADD CONSTRAINT `secoes_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `telefones_uteis` ADD CONSTRAINT `telefones_uteis_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `templates_notificacao` ADD CONSTRAINT `templates_notificacao_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tipos_infracao` ADD CONSTRAINT `tipos_infracao_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vagas_estacionamento` ADD CONSTRAINT `vagas_estacionamento_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `valores_salvos` ADD CONSTRAINT `valores_salvos_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vencimento_alertas` ADD CONSTRAINT `vencimento_alertas_vencimentoId_vencimentos_id_fk` FOREIGN KEY (`vencimentoId`) REFERENCES `vencimentos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vencimento_emails` ADD CONSTRAINT `vencimento_emails_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vencimento_notificacoes` ADD CONSTRAINT `vencimento_notificacoes_vencimentoId_vencimentos_id_fk` FOREIGN KEY (`vencimentoId`) REFERENCES `vencimentos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vencimento_notificacoes` ADD CONSTRAINT `vencimento_notificacoes_alertaId_vencimento_alertas_id_fk` FOREIGN KEY (`alertaId`) REFERENCES `vencimento_alertas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vencimentos` ADD CONSTRAINT `vencimentos_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vistoria_imagens` ADD CONSTRAINT `vistoria_imagens_vistoriaId_vistorias_id_fk` FOREIGN KEY (`vistoriaId`) REFERENCES `vistorias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vistoria_timeline` ADD CONSTRAINT `vistoria_timeline_vistoriaId_vistorias_id_fk` FOREIGN KEY (`vistoriaId`) REFERENCES `vistorias`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vistoria_timeline` ADD CONSTRAINT `vistoria_timeline_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vistorias` ADD CONSTRAINT `vistorias_condominioId_condominios_id_fk` FOREIGN KEY (`condominioId`) REFERENCES `condominios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `vistorias` ADD CONSTRAINT `vistorias_responsavelId_users_id_fk` FOREIGN KEY (`responsavelId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votacoes` ADD CONSTRAINT `votacoes_revistaId_revistas_id_fk` FOREIGN KEY (`revistaId`) REFERENCES `revistas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votos` ADD CONSTRAINT `votos_votacaoId_votacoes_id_fk` FOREIGN KEY (`votacaoId`) REFERENCES `votacoes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votos` ADD CONSTRAINT `votos_opcaoId_opcoes_votacao_id_fk` FOREIGN KEY (`opcaoId`) REFERENCES `opcoes_votacao`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `votos` ADD CONSTRAINT `votos_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;