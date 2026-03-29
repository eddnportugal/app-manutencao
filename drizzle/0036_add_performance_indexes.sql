-- Migration: Adicionar índices para performance
-- Cobre as colunas mais consultadas em queries de listagem e lookup

-- Users: login e autenticação
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_openId ON users(openId);
CREATE INDEX IF NOT EXISTS idx_users_resetToken ON users(resetToken);

-- Condominios: FK de síndico
CREATE INDEX IF NOT EXISTS idx_condominios_sindicoId ON condominios(sindicoId);

-- Moradores: listagem por condomínio, login, busca
CREATE INDEX IF NOT EXISTS idx_moradores_condominioId ON moradores(condominioId);
CREATE INDEX IF NOT EXISTS idx_moradores_email ON moradores(email);
CREATE INDEX IF NOT EXISTS idx_moradores_loginToken ON moradores(loginToken);
CREATE INDEX IF NOT EXISTS idx_moradores_resetToken ON moradores(resetToken);
CREATE INDEX IF NOT EXISTS idx_moradores_usuarioId ON moradores(usuarioId);

-- Funcionários: login e listagem
CREATE INDEX IF NOT EXISTS idx_funcionarios_loginEmail ON funcionarios(loginEmail);
CREATE INDEX IF NOT EXISTS idx_funcionarios_resetToken ON funcionarios(resetToken);

-- Funcionário vínculos
CREATE INDEX IF NOT EXISTS idx_funcionario_condominios_funcId ON funcionario_condominios(funcionarioId);
CREATE INDEX IF NOT EXISTS idx_funcionario_condominios_condId ON funcionario_condominios(condominioId);
CREATE INDEX IF NOT EXISTS idx_funcionario_funcoes_funcId ON funcionario_funcoes(funcionarioId);
CREATE INDEX IF NOT EXISTS idx_funcionario_acessos_funcId ON funcionario_acessos(funcionarioId);

-- Ordens de Serviço: listagem por condomínio e status
CREATE INDEX IF NOT EXISTS idx_ordens_servico_condominioId ON ordens_servico(condominioId);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_status ON ordens_servico(status);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_protocolo ON ordens_servico(protocolo);

-- Timeline
CREATE INDEX IF NOT EXISTS idx_timeline_entries_condominioId ON timeline_entries(condominioId);

-- Vencimentos
CREATE INDEX IF NOT EXISTS idx_vencimentos_condominioId ON vencimentos(condominioId);
CREATE INDEX IF NOT EXISTS idx_vencimentos_dataVencimento ON vencimentos(dataVencimento);

-- Notificações
CREATE INDEX IF NOT EXISTS idx_notificacoes_userId ON notificacoes(userId);
CREATE INDEX IF NOT EXISTS idx_notificacoes_condominioId ON notificacoes(condominioId);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);

-- Infrações
CREATE INDEX IF NOT EXISTS idx_notificacoes_infracao_condominioId ON notificacoes_infracao(condominioId);
CREATE INDEX IF NOT EXISTS idx_notificacoes_infracao_status ON notificacoes_infracao(status);

-- Comunicados
CREATE INDEX IF NOT EXISTS idx_comunicados_condominioId ON comunicados(condominioId);

-- Avisos
CREATE INDEX IF NOT EXISTS idx_avisos_condominioId ON avisos(condominioId);

-- Lembretes
CREATE INDEX IF NOT EXISTS idx_lembretes_condominioId ON lembretes(condominioId);
CREATE INDEX IF NOT EXISTS idx_lembretes_enviado ON lembretes(enviado);

-- Leitura de medidores
CREATE INDEX IF NOT EXISTS idx_leitura_medidores_condominioId ON leitura_medidores(condominioId);
CREATE INDEX IF NOT EXISTS idx_leitura_medidores_protocolo ON leitura_medidores(protocolo);

-- Controle de pragas
CREATE INDEX IF NOT EXISTS idx_controle_pragas_condominioId ON controle_pragas(condominioId);

-- Jardinagem
CREATE INDEX IF NOT EXISTS idx_jardinagem_condominioId ON jardinagem(condominioId);

-- Manutenções
CREATE INDEX IF NOT EXISTS idx_manutencoes_condominioId ON manutencoes(condominioId);

-- Vistorias
CREATE INDEX IF NOT EXISTS idx_vistorias_condominioId ON vistorias(condominioId);

-- Ocorrências
CREATE INDEX IF NOT EXISTS idx_ocorrencias_condominioId ON ocorrencias(condominioId);

-- Checklists
CREATE INDEX IF NOT EXISTS idx_checklists_condominioId ON checklists(condominioId);

-- Push subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_userId ON push_subscriptions(userId);

-- Field settings
CREATE INDEX IF NOT EXISTS idx_user_field_settings_userId ON user_field_settings(userId);
CREATE INDEX IF NOT EXISTS idx_user_field_settings_condominioId ON user_field_settings(condominioId);
