import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

// ==================== USERS ====================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "sindico", "morador", "master"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  phone: varchar("phone", { length: 20 }),
  apartment: varchar("apartment", { length: 20 }),
  // Campos para login local
  senha: varchar("senha", { length: 255 }),
  resetToken: varchar("resetToken", { length: 64 }),
  resetTokenExpira: timestamp("resetTokenExpira"),
  // Tipo de conta: sindico, administradora ou admin
  tipoConta: mysqlEnum("tipoConta", ["sindico", "administradora", "admin"]).default("sindico"),
  // Novos campos para gestão de usuários
  tipoUsuario: mysqlEnum("tipoUsuario", ["usuario", "pequena_empresa", "media_empresa"]).default("usuario"),
  diasUtilizacao: int("diasUtilizacao").default(0),
  cidade: varchar("cidade", { length: 100 }),
  adimplente: boolean("adimplente").default(true),
  bloqueado: boolean("bloqueado").default(false),
  motivoBloqueio: text("motivoBloqueio"),
  // Campo para valor personalizado do plano
  valorPlano: decimal("valorPlano", { precision: 10, scale: 2 }),
  faixaPrecoId: int("faixaPrecoId"), // Referência à faixa de preço selecionada
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== CONDOMINIOS ====================
export const condominios = mysqlTable("condominios", {
  id: int("id").autoincrement().primaryKey(),
  codigo: varchar("codigo", { length: 50 }),
  cnpj: varchar("cnpj", { length: 20 }),
  nome: varchar("nome", { length: 255 }).notNull(),
  endereco: text("endereco"),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 50 }),
  cep: varchar("cep", { length: 10 }),
  logoUrl: text("logoUrl"),
  bannerUrl: text("bannerUrl"),
  capaUrl: text("capaUrl"),
  corPrimaria: varchar("corPrimaria", { length: 20 }).default("#4F46E5"),
  corSecundaria: varchar("corSecundaria", { length: 20 }).default("#10B981"),
  cadastroToken: varchar("cadastroToken", { length: 32 }).unique(),
  assembleiaLink: text("assembleiaLink"),
  assembleiaData: timestamp("assembleiaData"),
  sindicoId: int("sindicoId").references(() => users.id),
  // Campos de cabeçalho/rodapé personalizados
  cabecalhoLogoUrl: text("cabecalhoLogoUrl"),
  cabecalhoNomeCondominio: varchar("cabecalhoNomeCondominio", { length: 255 }),
  cabecalhoNomeSindico: varchar("cabecalhoNomeSindico", { length: 255 }),
  rodapeTexto: text("rodapeTexto"),
  rodapeContato: varchar("rodapeContato", { length: 255 }),
  // Telefone de contato para mensagem de bloqueio
  telefoneContato: varchar("telefoneContato", { length: 20 }),
  // Tema padrão da organização
  temaPadrao: varchar("temaPadrao", { length: 20 }).default("laranja"),
  layoutPadrao: varchar("layoutPadrao", { length: 20 }).default("classico"),
  tamanhoFontePadrao: varchar("tamanhoFontePadrao", { length: 20 }).default("medio"),
  modoEscuroPadrao: boolean("modoEscuroPadrao").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Condominio = typeof condominios.$inferSelect;
export type InsertCondominio = typeof condominios.$inferInsert;

// ==================== REVISTAS ====================
export const revistas = mysqlTable("revistas", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: text("subtitulo"),
  edicao: varchar("edicao", { length: 50 }),
  capaUrl: text("capaUrl"),
  templateId: varchar("templateId", { length: 50 }).default("default"),
  status: mysqlEnum("status", ["rascunho", "publicada", "arquivada"]).default("rascunho").notNull(),
  publicadaEm: timestamp("publicadaEm"),
  visualizacoes: int("visualizacoes").default(0),
  shareLink: varchar("shareLink", { length: 100 }).unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Revista = typeof revistas.$inferSelect;
export type InsertRevista = typeof revistas.$inferInsert;

// ==================== SECÇÕES DA REVISTA ====================
export const secoes = mysqlTable("secoes", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  tipo: mysqlEnum("tipo", [
    "mensagem_sindico",
    "avisos",
    "comunicados",
    "dicas_seguranca",
    "regras",
    "links_uteis",
    "telefones_uteis",
    "realizacoes",
    "antes_depois",
    "melhorias",
    "aquisicoes",
    "funcionarios",
    "agenda_eventos",
    "eventos",
    "achados_perdidos",
    "caronas",
    "vagas_estacionamento",
    "classificados",
    "votacoes",
    "publicidade"
  ]).notNull(),
  titulo: varchar("titulo", { length: 255 }),
  ordem: int("ordem").default(0),
  ativo: boolean("ativo").default(true),
  config: json("config"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Secao = typeof secoes.$inferSelect;
export type InsertSecao = typeof secoes.$inferInsert;

// ==================== MENSAGEM DO SÍNDICO ====================
export const mensagensSindico = mysqlTable("mensagens_sindico", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  fotoSindicoUrl: text("fotoSindicoUrl"),
  nomeSindico: varchar("nomeSindico", { length: 255 }),
  titulo: varchar("titulo", { length: 255 }),
  mensagem: text("mensagem"),
  assinatura: varchar("assinatura", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MensagemSindico = typeof mensagensSindico.$inferSelect;
export type InsertMensagemSindico = typeof mensagensSindico.$inferInsert;

// ==================== AVISOS ====================
export const avisos = mysqlTable("avisos", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo"),
  tipo: mysqlEnum("tipo", ["urgente", "importante", "informativo"]).default("informativo"),
  imagemUrl: text("imagemUrl"),
  destaque: boolean("destaque").default(false),
  dataExpiracao: timestamp("dataExpiracao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Aviso = typeof avisos.$inferSelect;
export type InsertAviso = typeof avisos.$inferInsert;

// ==================== FUNCIONÁRIOS ====================
export const funcionarios = mysqlTable("funcionarios", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 100 }),
  departamento: varchar("departamento", { length: 100 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  fotoUrl: text("fotoUrl"),
  descricao: text("descricao"),
  dataAdmissao: timestamp("dataAdmissao"),
  ativo: boolean("ativo").default(true),
  // Tipo de funcionário para controle de acesso
  tipoFuncionario: mysqlEnum("tipoFuncionario", ["zelador", "porteiro", "supervisor", "gerente", "auxiliar", "sindico_externo"]).default("auxiliar"),
  // Campos de login
  loginEmail: varchar("loginEmail", { length: 255 }),
  senha: varchar("senha", { length: 255 }),
  loginAtivo: boolean("loginAtivo").default(false),
  ultimoLogin: timestamp("ultimoLogin"),
  // Campos de recuperação de senha
  resetToken: varchar("resetToken", { length: 64 }),
  resetTokenExpira: timestamp("resetTokenExpira"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ==================== HISTÓRICO DE ACESSOS DE FUNCIONÁRIOS ====================
export const funcionarioAcessos = mysqlTable("funcionario_acessos", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id).notNull(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  dataHora: timestamp("dataHora").defaultNow().notNull(),
  ip: varchar("ip", { length: 45 }),
  userAgent: text("userAgent"),
  dispositivo: varchar("dispositivo", { length: 100 }),
  navegador: varchar("navegador", { length: 100 }),
  sistemaOperacional: varchar("sistemaOperacional", { length: 100 }),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  cidade: varchar("cidade", { length: 100 }),
  regiao: varchar("regiao", { length: 100 }),
  pais: varchar("pais", { length: 100 }),
  tipoAcesso: mysqlEnum("tipoAcesso", ["login", "logout", "recuperacao_senha", "alteracao_senha"]).default("login"),
  sucesso: boolean("sucesso").default(true),
  motivoFalha: text("motivoFalha"),
});

export type FuncionarioAcesso = typeof funcionarioAcessos.$inferSelect;
export type InsertFuncionarioAcesso = typeof funcionarioAcessos.$inferInsert;

// ==================== FUNÇÕES DE FUNCIONÁRIOS ====================
export const funcionarioFuncoes = mysqlTable("funcionario_funcoes", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id).notNull(),
  funcaoKey: varchar("funcaoKey", { length: 100 }).notNull(),
  habilitada: boolean("habilitada").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FuncionarioFuncao = typeof funcionarioFuncoes.$inferSelect;
export type InsertFuncionarioFuncao = typeof funcionarioFuncoes.$inferInsert;

export type Funcionario = typeof funcionarios.$inferSelect;
export type InsertFuncionario = typeof funcionarios.$inferInsert;

// ==================== VÍNCULO FUNCIONÁRIO <-> CONDOMÍNIOS (MULTI-CONDOMÍNIO) ====================
export const funcionarioCondominios = mysqlTable("funcionario_condominios", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id).notNull(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FuncionarioCondominio = typeof funcionarioCondominios.$inferSelect;
export type InsertFuncionarioCondominio = typeof funcionarioCondominios.$inferInsert;

// ==================== VÍNCULO FUNCIONÁRIO <-> APPS ====================
export const funcionarioApps = mysqlTable("funcionario_apps", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id).notNull(),
  appId: int("appId").references(() => apps.id).notNull(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FuncionarioApp = typeof funcionarioApps.$inferSelect;
export type InsertFuncionarioApp = typeof funcionarioApps.$inferInsert;

// ==================== EVENTOS ====================
export const eventos = mysqlTable("eventos", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  dataEvento: timestamp("dataEvento"),
  horaInicio: varchar("horaInicio", { length: 10 }),
  horaFim: varchar("horaFim", { length: 10 }),
  local: varchar("local", { length: 255 }),
  imagemUrl: text("imagemUrl"),
  tipo: mysqlEnum("tipo", ["agendado", "realizado"]).default("agendado"),
  nomeResponsavel: varchar("nomeResponsavel", { length: 255 }),
  whatsappResponsavel: varchar("whatsappResponsavel", { length: 20 }),
  lembreteAntecedencia: int("lembreteAntecedencia").default(1), // dias de antecedência para lembrete
  lembreteEnviado: boolean("lembreteEnviado").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Evento = typeof eventos.$inferSelect;
export type InsertEvento = typeof eventos.$inferInsert;

// ==================== ANTES E DEPOIS (OBRAS) ====================
export const antesDepois = mysqlTable("antes_depois", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  fotoAntesUrl: text("fotoAntesUrl"),
  fotoDepoisUrl: text("fotoDepoisUrl"),
  dataRealizacao: timestamp("dataRealizacao"),
  responsavel: varchar("responsavel", { length: 255 }),
  status: mysqlEnum("status_antesdepois", ["pendente", "em_andamento", "concluido"]).default("pendente"),
  prioridade: mysqlEnum("prioridade_antesdepois", ["baixa", "media", "alta"]).default("media"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AntesDepois = typeof antesDepois.$inferSelect;
export type InsertAntesDepois = typeof antesDepois.$inferInsert;

// ==================== ACHADOS E PERDIDOS ====================
export const achadosPerdidos = mysqlTable("achados_perdidos", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id).notNull(),
  tipo: mysqlEnum("tipo", ["achado", "perdido"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  fotoUrl: text("fotoUrl"),
  localEncontrado: varchar("localEncontrado", { length: 255 }),
  dataOcorrencia: timestamp("dataOcorrencia"),
  status: mysqlEnum("status", ["aberto", "resolvido"]).default("aberto"),
  contato: varchar("contato", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AchadoPerdido = typeof achadosPerdidos.$inferSelect;
export type InsertAchadoPerdido = typeof achadosPerdidos.$inferInsert;

// ==================== CARONAS ====================
export const caronas = mysqlTable("caronas", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id),
  moradorId: int("moradorId").references(() => moradores.id),
  contato: varchar("contato", { length: 255 }),
  tipo: mysqlEnum("tipo", ["oferece", "procura"]).notNull(),
  origem: varchar("origem", { length: 255 }).notNull(),
  destino: varchar("destino", { length: 255 }).notNull(),
  dataCarona: timestamp("dataCarona"),
  horario: varchar("horario", { length: 10 }),
  vagasDisponiveis: int("vagasDisponiveis").default(1),
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["ativa", "concluida", "cancelada"]).default("ativa"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Carona = typeof caronas.$inferSelect;
export type InsertCarona = typeof caronas.$inferInsert;

// ==================== CLASSIFICADOS ====================
export const classificados = mysqlTable("classificados", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id),
  moradorId: int("moradorId").references(() => moradores.id),
  tipo: mysqlEnum("tipo", ["produto", "servico"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  preco: varchar("preco", { length: 50 }),
  fotoUrl: text("fotoUrl"),
  contato: varchar("contato", { length: 255 }),
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado", "vendido"]).default("pendente"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Classificado = typeof classificados.$inferSelect;
export type InsertClassificado = typeof classificados.$inferInsert;

// ==================== VOTAÇÕES ====================
export const votacoes = mysqlTable("votacoes", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipo: mysqlEnum("tipo", ["funcionario_mes", "enquete", "decisao"]).notNull(),
  imagemUrl: text("imagemUrl"),
  arquivoUrl: text("arquivoUrl"),
  videoUrl: text("videoUrl"),
  dataInicio: timestamp("dataInicio"),
  dataFim: timestamp("dataFim"),
  status: mysqlEnum("status", ["ativa", "encerrada"]).default("ativa"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Votacao = typeof votacoes.$inferSelect;
export type InsertVotacao = typeof votacoes.$inferInsert;

// ==================== OPÇÕES DE VOTAÇÃO ====================
export const opcoesVotacao = mysqlTable("opcoes_votacao", {
  id: int("id").autoincrement().primaryKey(),
  votacaoId: int("votacaoId").references(() => votacoes.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagemUrl: text("imagemUrl"),
  votos: int("votos").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OpcaoVotacao = typeof opcoesVotacao.$inferSelect;
export type InsertOpcaoVotacao = typeof opcoesVotacao.$inferInsert;

// ==================== VOTOS ====================
export const votos = mysqlTable("votos", {
  id: int("id").autoincrement().primaryKey(),
  votacaoId: int("votacaoId").references(() => votacoes.id).notNull(),
  opcaoId: int("opcaoId").references(() => opcoesVotacao.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Voto = typeof votos.$inferSelect;
export type InsertVoto = typeof votos.$inferInsert;

// ==================== VAGAS DE ESTACIONAMENTO ====================
export const vagasEstacionamento = mysqlTable("vagas_estacionamento", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  numero: varchar("numero", { length: 20 }).notNull(),
  apartamento: varchar("apartamento", { length: 20 }),
  bloco: varchar("bloco", { length: 20 }),
  tipo: mysqlEnum("tipo", ["coberta", "descoberta", "moto"]).default("coberta"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VagaEstacionamento = typeof vagasEstacionamento.$inferSelect;
export type InsertVagaEstacionamento = typeof vagasEstacionamento.$inferInsert;

// ==================== LINKS ÚTEIS ====================
export const linksUteis = mysqlTable("links_uteis", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  url: text("url").notNull(),
  descricao: text("descricao"),
  icone: varchar("icone", { length: 50 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LinkUtil = typeof linksUteis.$inferSelect;
export type InsertLinkUtil = typeof linksUteis.$inferInsert;

// ==================== TELEFONES ÚTEIS ====================
export const telefonesUteis = mysqlTable("telefones_uteis", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  descricao: text("descricao"),
  categoria: varchar("categoria", { length: 100 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TelefoneUtil = typeof telefonesUteis.$inferSelect;
export type InsertTelefoneUtil = typeof telefonesUteis.$inferInsert;

// ==================== PUBLICIDADE ====================
export const publicidades = mysqlTable("publicidades", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  anunciante: varchar("anunciante", { length: 255 }).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagemUrl: text("imagemUrl"),
  linkUrl: text("linkUrl"),
  telefone: varchar("telefone", { length: 20 }),
  tipo: mysqlEnum("tipo", ["banner", "destaque", "lateral"]).default("banner"),
  ativo: boolean("ativo").default(true),
  dataInicio: timestamp("dataInicio"),
  dataFim: timestamp("dataFim"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Publicidade = typeof publicidades.$inferSelect;
export type InsertPublicidade = typeof publicidades.$inferInsert;

// ==================== MORADORES DO CONDOMÍNIO ====================
export const moradores = mysqlTable("moradores", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  usuarioId: int("usuarioId").references(() => users.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  celular: varchar("celular", { length: 20 }),
  apartamento: varchar("apartamento", { length: 20 }).notNull(),
  bloco: varchar("bloco", { length: 20 }),
  andar: varchar("andar", { length: 10 }),
  tipo: mysqlEnum("tipo", ["proprietario", "inquilino", "familiar", "funcionario"]).default("proprietario"),
  cpf: varchar("cpf", { length: 14 }),
  dataNascimento: timestamp("dataNascimento"),
  fotoUrl: text("fotoUrl"),
  observacoes: text("observacoes"),
  dataEntrada: timestamp("dataEntrada"),
  dataSaida: timestamp("dataSaida"),
  ativo: boolean("ativo").default(true),
  // Campos de autenticação do portal do morador
  senha: varchar("senha", { length: 255 }),
  loginToken: varchar("loginToken", { length: 64 }),
  loginTokenExpira: timestamp("loginTokenExpira"),
  resetToken: varchar("resetToken", { length: 64 }),
  resetTokenExpira: timestamp("resetTokenExpira"),
  ultimoLogin: timestamp("ultimoLogin"),
  // Campo para bloqueio de votação
  bloqueadoVotacao: boolean("bloqueadoVotacao").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Morador = typeof moradores.$inferSelect;
export type InsertMorador = typeof moradores.$inferInsert;


// ==================== NOTIFICAÇÕES ====================
export const notificacoes = mysqlTable("notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  condominioId: int("condominioId").references(() => condominios.id),
  tipo: mysqlEnum("tipo", ["aviso", "evento", "votacao", "classificado", "carona", "geral"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem"),
  link: varchar("link", { length: 500 }),
  referenciaId: int("referenciaId"),
  lida: boolean("lida").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = typeof notificacoes.$inferInsert;

// ==================== REALIZAÇÕES ====================
export const realizacoes = mysqlTable("realizacoes", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagemUrl: text("imagemUrl"),
  dataRealizacao: timestamp("dataRealizacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Realizacao = typeof realizacoes.$inferSelect;
export type InsertRealizacao = typeof realizacoes.$inferInsert;

// ==================== MELHORIAS ====================
export const melhorias = mysqlTable("melhorias", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagemUrl: text("imagemUrl"),
  custo: varchar("custo", { length: 50 }),
  dataImplementacao: timestamp("dataImplementacao"),
  status: mysqlEnum("status", ["planejada", "em_andamento", "concluida"]).default("planejada"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Melhoria = typeof melhorias.$inferSelect;
export type InsertMelhoria = typeof melhorias.$inferInsert;

// ==================== AQUISIÇÕES ====================
export const aquisicoes = mysqlTable("aquisicoes", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  imagemUrl: text("imagemUrl"),
  valor: varchar("valor", { length: 50 }),
  fornecedor: varchar("fornecedor", { length: 255 }),
  dataAquisicao: timestamp("dataAquisicao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Aquisicao = typeof aquisicoes.$inferSelect;
export type InsertAquisicao = typeof aquisicoes.$inferInsert;

// ==================== PREFERÊNCIAS DE NOTIFICAÇÃO ====================
export const preferenciasNotificacao = mysqlTable("preferencias_notificacao", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull().unique(),
  avisos: boolean("avisos").default(true),
  eventos: boolean("eventos").default(true),
  votacoes: boolean("votacoes").default(true),
  classificados: boolean("classificados").default(true),
  caronas: boolean("caronas").default(true),
  emailNotificacoes: boolean("emailNotificacoes").default(false),
  efeitoTransicao: varchar("efeitoTransicao", { length: 50 }).default("slide"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PreferenciaNotificacao = typeof preferenciasNotificacao.$inferSelect;
export type InsertPreferenciaNotificacao = typeof preferenciasNotificacao.$inferInsert;

// ==================== ANUNCIANTES ====================
export const anunciantes = mysqlTable("anunciantes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: mysqlEnum("categoria", ["comercio", "servicos", "profissionais", "alimentacao", "saude", "educacao", "outros"]).default("outros").notNull(),
  logoUrl: text("logoUrl"),
  telefone: varchar("telefone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  email: varchar("email", { length: 320 }),
  website: text("website"),
  endereco: text("endereco"),
  instagram: varchar("instagram", { length: 100 }),
  facebook: varchar("facebook", { length: 100 }),
  horarioFuncionamento: text("horarioFuncionamento"),
  status: mysqlEnum("statusAnunciante", ["ativo", "inativo"]).default("ativo").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Anunciante = typeof anunciantes.$inferSelect;
export type InsertAnunciante = typeof anunciantes.$inferInsert;

// ==================== ANÚNCIOS ====================
export const anuncios = mysqlTable("anuncios", {
  id: int("id").autoincrement().primaryKey(),
  anuncianteId: int("anuncianteId").references(() => anunciantes.id).notNull(),
  revistaId: int("revistaId").references(() => revistas.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  bannerUrl: text("bannerUrl"),
  linkDestino: text("linkDestino"),
  posicao: mysqlEnum("posicao", ["capa", "contracapa", "pagina_interna", "rodape", "lateral"]).default("pagina_interna").notNull(),
  tamanho: mysqlEnum("tamanho", ["pequeno", "medio", "grande", "pagina_inteira"]).default("medio").notNull(),
  dataInicio: timestamp("dataInicio"),
  dataFim: timestamp("dataFim"),
  status: mysqlEnum("statusAnuncio", ["ativo", "pausado", "expirado", "pendente"]).default("pendente").notNull(),
  visualizacoes: int("visualizacoes").default(0),
  cliques: int("cliques").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Anuncio = typeof anuncios.$inferSelect;
export type InsertAnuncio = typeof anuncios.$inferInsert;


// ==================== COMUNICADOS ====================
export const comunicados = mysqlTable("comunicados", {
  id: int("id").autoincrement().primaryKey(),
  revistaId: int("revistaId").references(() => revistas.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  anexoUrl: text("anexoUrl"),
  anexoNome: varchar("anexoNome", { length: 255 }),
  anexoTipo: varchar("anexoTipo", { length: 100 }),
  anexoTamanho: int("anexoTamanho"),
  dataPublicacao: timestamp("dataPublicacao").defaultNow(),
  destaque: boolean("destaque").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comunicado = typeof comunicados.$inferSelect;
export type InsertComunicado = typeof comunicados.$inferInsert;


// ==================== ÁLBUNS DE FOTOS ====================
export const albuns = mysqlTable("albuns", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: mysqlEnum("categoria", ["eventos", "obras", "areas_comuns", "melhorias", "outros"]).default("outros").notNull(),
  capaUrl: text("capaUrl"),
  dataEvento: timestamp("dataEvento"),
  destaque: boolean("destaque").default(false),
  ativo: boolean("ativo").default(true),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Album = typeof albuns.$inferSelect;
export type InsertAlbum = typeof albuns.$inferInsert;

// ==================== FOTOS DOS ÁLBUNS ====================
export const fotos = mysqlTable("fotos", {
  id: int("id").autoincrement().primaryKey(),
  albumId: int("albumId").references(() => albuns.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 500 }),
  ordem: int("ordem").default(0),
  largura: int("largura"),
  altura: int("altura"),
  tamanho: int("tamanho"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Foto = typeof fotos.$inferSelect;
export type InsertFoto = typeof fotos.$inferInsert;


// ==================== DICAS DE SEGURANÇA ====================
export const dicasSeguranca = mysqlTable("dicas_seguranca", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  categoria: mysqlEnum("categoria", [
    "geral",
    "incendio",
    "roubo",
    "criancas",
    "idosos",
    "digital",
    "veiculos"
  ]).default("geral"),
  icone: varchar("icone", { length: 50 }).default("shield"),
  ativo: boolean("ativo").default(true),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DicaSeguranca = typeof dicasSeguranca.$inferSelect;
export type InsertDicaSeguranca = typeof dicasSeguranca.$inferInsert;

// ==================== REGRAS E NORMAS ====================
export const regrasNormas = mysqlTable("regras_normas", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  categoria: mysqlEnum("categoria", [
    "geral",
    "convivencia",
    "areas_comuns",
    "animais",
    "barulho",
    "estacionamento",
    "mudancas",
    "obras",
    "piscina",
    "salao_festas"
  ]).default("geral"),
  ativo: boolean("ativo").default(true),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RegraNorma = typeof regrasNormas.$inferSelect;
export type InsertRegraNorma = typeof regrasNormas.$inferInsert;

// ==================== IMAGENS DE REALIZAÇÕES ====================
export const imagensRealizacoes = mysqlTable("imagens_realizacoes", {
  id: int("id").autoincrement().primaryKey(),
  realizacaoId: int("realizacaoId").references(() => realizacoes.id).notNull(),
  imagemUrl: text("imagemUrl").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemRealizacao = typeof imagensRealizacoes.$inferSelect;
export type InsertImagemRealizacao = typeof imagensRealizacoes.$inferInsert;

// ==================== IMAGENS DE MELHORIAS ====================
export const imagensMelhorias = mysqlTable("imagens_melhorias", {
  id: int("id").autoincrement().primaryKey(),
  melhoriaId: int("melhoriaId").references(() => melhorias.id).notNull(),
  imagemUrl: text("imagemUrl").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemMelhoria = typeof imagensMelhorias.$inferSelect;
export type InsertImagemMelhoria = typeof imagensMelhorias.$inferInsert;

// ==================== IMAGENS DE AQUISIÇÕES ====================
export const imagensAquisicoes = mysqlTable("imagens_aquisicoes", {
  id: int("id").autoincrement().primaryKey(),
  aquisicaoId: int("aquisicaoId").references(() => aquisicoes.id).notNull(),
  imagemUrl: text("imagemUrl").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemAquisicao = typeof imagensAquisicoes.$inferSelect;
export type InsertImagemAquisicao = typeof imagensAquisicoes.$inferInsert;

// ==================== IMAGENS DE ACHADOS E PERDIDOS ====================
export const imagensAchadosPerdidos = mysqlTable("imagens_achados_perdidos", {
  id: int("id").autoincrement().primaryKey(),
  achadoPerdidoId: int("achadoPerdidoId").references(() => achadosPerdidos.id).notNull(),
  imagemUrl: text("imagemUrl").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemAchadoPerdido = typeof imagensAchadosPerdidos.$inferSelect;
export type InsertImagemAchadoPerdido = typeof imagensAchadosPerdidos.$inferInsert;

// ==================== IMAGENS E ANEXOS DE VAGAS ====================
export const imagensVagas = mysqlTable("imagens_vagas", {
  id: int("id").autoincrement().primaryKey(),
  vagaId: int("vagaId").references(() => vagasEstacionamento.id).notNull(),
  tipo: mysqlEnum("tipo", ["imagem", "anexo"]).default("imagem"),
  url: text("url").notNull(),
  nome: varchar("nome", { length: 255 }),
  mimeType: varchar("mimeType", { length: 100 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemVaga = typeof imagensVagas.$inferSelect;
export type InsertImagemVaga = typeof imagensVagas.$inferInsert;

// ==================== FAVORITOS ====================
export const favoritos = mysqlTable("favoritos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  condominioId: int("condominioId").references(() => condominios.id),
  tipoItem: mysqlEnum("tipoItem", [
    "aviso",
    "comunicado",
    "evento",
    "realizacao",
    "melhoria",
    "aquisicao",
    "votacao",
    "classificado",
    "carona",
    "achado_perdido",
    "funcionario",
    "galeria",
    "card_secao"
  ]).notNull(),
  itemId: int("itemId"),
  cardSecaoId: varchar("cardSecaoId", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorito = typeof favoritos.$inferSelect;
export type InsertFavorito = typeof favoritos.$inferInsert;


// ==================== VISTORIAS ====================
export const vistorias = mysqlTable("vistorias", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  responsavelId: int("responsavelId").references(() => users.id),
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  enderecoGeo: text("enderecoGeo"),
  dataAgendada: timestamp("dataAgendada"),
  dataRealizada: timestamp("dataRealizada"),
  status: mysqlEnum("status", ["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta", "rascunho"]).default("pendente").notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media"),
  tipo: varchar("tipo", { length: 100 }),
  assinaturaTecnico: text("assinaturaTecnico"),
  assinaturaSolicitante: text("assinaturaSolicitante"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vistoria = typeof vistorias.$inferSelect;
export type InsertVistoria = typeof vistorias.$inferInsert;

// ==================== IMAGENS DE VISTORIAS ====================
export const vistoriaImagens = mysqlTable("vistoria_imagens", {
  id: int("id").autoincrement().primaryKey(),
  vistoriaId: int("vistoriaId").references(() => vistorias.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VistoriaImagem = typeof vistoriaImagens.$inferSelect;
export type InsertVistoriaImagem = typeof vistoriaImagens.$inferInsert;

// ==================== ANEXOS DE VISTORIAS ====================
export const vistoriaAnexos = mysqlTable("vistoria_anexos", {
  id: int("id").autoincrement().primaryKey(),
  vistoriaId: int("vistoriaId").references(() => vistorias.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  url: text("url").notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  tamanho: int("tamanho").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VistoriaAnexo = typeof vistoriaAnexos.$inferSelect;
export type InsertVistoriaAnexo = typeof vistoriaAnexos.$inferInsert;

// ==================== TIMELINE DE VISTORIAS ====================
export const vistoriaTimeline = mysqlTable("vistoria_timeline", {
  id: int("id").autoincrement().primaryKey(),
  vistoriaId: int("vistoriaId").references(() => vistorias.id).notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "fechamento", "reabertura"]).notNull(),
  descricao: text("descricao").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  userId: int("userId").references(() => users.id),
  userNome: varchar("userNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VistoriaTimelineEvento = typeof vistoriaTimeline.$inferSelect;
export type InsertVistoriaTimelineEvento = typeof vistoriaTimeline.$inferInsert;

// ==================== MANUTENÇÕES ====================
export const manutencoes = mysqlTable("manutencoes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  responsavelId: int("responsavelId").references(() => users.id),
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  enderecoGeo: text("enderecoGeo"),
  dataAgendada: timestamp("dataAgendada"),
  dataRealizada: timestamp("dataRealizada"),
  status: mysqlEnum("status", ["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta", "rascunho"]).default("pendente").notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media"),
  tipo: mysqlEnum("tipo", ["preventiva", "corretiva", "emergencial", "programada"]).default("corretiva"),
  tempoEstimadoDias: int("tempoEstimadoDias").default(0),
  tempoEstimadoHoras: int("tempoEstimadoHoras").default(0),
  tempoEstimadoMinutos: int("tempoEstimadoMinutos").default(0),
  fornecedor: varchar("fornecedor", { length: 255 }),
  assinaturaTecnico: text("assinaturaTecnico"),
  assinaturaSolicitante: text("assinaturaSolicitante"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Manutencao = typeof manutencoes.$inferSelect;
export type InsertManutencao = typeof manutencoes.$inferInsert;

// ==================== IMAGENS DE MANUTENÇÕES ====================
export const manutencaoImagens = mysqlTable("manutencao_imagens", {
  id: int("id").autoincrement().primaryKey(),
  manutencaoId: int("manutencaoId").references(() => manutencoes.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManutencaoImagem = typeof manutencaoImagens.$inferSelect;
export type InsertManutencaoImagem = typeof manutencaoImagens.$inferInsert;

// ==================== ANEXOS DE MANUTENÇÕES ====================
export const manutencaoAnexos = mysqlTable("manutencao_anexos", {
  id: int("id").autoincrement().primaryKey(),
  manutencaoId: int("manutencaoId").references(() => manutencoes.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  url: text("url").notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  tamanho: int("tamanho").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManutencaoAnexo = typeof manutencaoAnexos.$inferSelect;
export type InsertManutencaoAnexo = typeof manutencaoAnexos.$inferInsert;

// ==================== TIMELINE DE MANUTENÇÕES ====================
export const manutencaoTimeline = mysqlTable("manutencao_timeline", {
  id: int("id").autoincrement().primaryKey(),
  manutencaoId: int("manutencaoId").references(() => manutencoes.id).notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "fechamento", "reabertura"]).notNull(),
  descricao: text("descricao").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  userId: int("userId").references(() => users.id),
  userNome: varchar("userNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ManutencaoTimelineEvento = typeof manutencaoTimeline.$inferSelect;
export type InsertManutencaoTimelineEvento = typeof manutencaoTimeline.$inferInsert;

// ==================== OCORRÊNCIAS ====================
export const ocorrencias = mysqlTable("ocorrencias", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  reportadoPorId: int("reportadoPorId").references(() => users.id),
  reportadoPorNome: varchar("reportadoPorNome", { length: 255 }),
  responsavelId: int("responsavelId").references(() => users.id),
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  enderecoGeo: text("enderecoGeo"),
  dataOcorrencia: timestamp("dataOcorrencia"),
  status: mysqlEnum("status", ["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"]).default("pendente").notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media"),
  categoria: mysqlEnum("categoria", ["seguranca", "barulho", "manutencao", "convivencia", "animais", "estacionamento", "limpeza", "outros"]).default("outros"),
  assinaturaTecnico: text("assinaturaTecnico"),
  assinaturaSolicitante: text("assinaturaSolicitante"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ocorrencia = typeof ocorrencias.$inferSelect;
export type InsertOcorrencia = typeof ocorrencias.$inferInsert;

// ==================== IMAGENS DE OCORRÊNCIAS ====================
export const ocorrenciaImagens = mysqlTable("ocorrencia_imagens", {
  id: int("id").autoincrement().primaryKey(),
  ocorrenciaId: int("ocorrenciaId").references(() => ocorrencias.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OcorrenciaImagem = typeof ocorrenciaImagens.$inferSelect;
export type InsertOcorrenciaImagem = typeof ocorrenciaImagens.$inferInsert;

// ==================== ANEXOS DE OCORRÊNCIAS ====================
export const ocorrenciaAnexos = mysqlTable("ocorrencia_anexos", {
  id: int("id").autoincrement().primaryKey(),
  ocorrenciaId: int("ocorrenciaId").references(() => ocorrencias.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  url: text("url").notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  tamanho: int("tamanho").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OcorrenciaAnexo = typeof ocorrenciaAnexos.$inferSelect;
export type InsertOcorrenciaAnexo = typeof ocorrenciaAnexos.$inferInsert;

// ==================== TIMELINE DE OCORRÊNCIAS ====================
export const ocorrenciaTimeline = mysqlTable("ocorrencia_timeline", {
  id: int("id").autoincrement().primaryKey(),
  ocorrenciaId: int("ocorrenciaId").references(() => ocorrencias.id).notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "fechamento", "reabertura"]).notNull(),
  descricao: text("descricao").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  userId: int("userId").references(() => users.id),
  userNome: varchar("userNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OcorrenciaTimelineEvento = typeof ocorrenciaTimeline.$inferSelect;
export type InsertOcorrenciaTimelineEvento = typeof ocorrenciaTimeline.$inferInsert;

// ==================== CHECKLISTS ====================
export const checklists = mysqlTable("checklists", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  responsavelId: int("responsavelId").references(() => users.id),
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  enderecoGeo: text("enderecoGeo"),
  dataAgendada: timestamp("dataAgendada"),
  dataRealizada: timestamp("dataRealizada"),
  status: mysqlEnum("status", ["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta", "rascunho"]).default("pendente").notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media"),
  categoria: varchar("categoria", { length: 100 }),
  totalItens: int("totalItens").default(0),
  itensCompletos: int("itensCompletos").default(0),
  assinaturaTecnico: text("assinaturaTecnico"),
  assinaturaSolicitante: text("assinaturaSolicitante"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Checklist = typeof checklists.$inferSelect;
export type InsertChecklist = typeof checklists.$inferInsert;

// ==================== ITENS DO CHECKLIST ====================
export const checklistItens = mysqlTable("checklist_itens", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").references(() => checklists.id).notNull(),
  descricao: varchar("descricao", { length: 500 }).notNull(),
  completo: boolean("completo").default(false),
  observacao: text("observacao"),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistItem = typeof checklistItens.$inferSelect;
export type InsertChecklistItem = typeof checklistItens.$inferInsert;

// ==================== IMAGENS DE CHECKLISTS ====================
export const checklistImagens = mysqlTable("checklist_imagens", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").references(() => checklists.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistImagem = typeof checklistImagens.$inferSelect;
export type InsertChecklistImagem = typeof checklistImagens.$inferInsert;

// ==================== ANEXOS DE CHECKLISTS ====================
export const checklistAnexos = mysqlTable("checklist_anexos", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").references(() => checklists.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  url: text("url").notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  tamanho: int("tamanho").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistAnexo = typeof checklistAnexos.$inferSelect;
export type InsertChecklistAnexo = typeof checklistAnexos.$inferInsert;

// ==================== TIMELINE DE CHECKLISTS ====================
export const checklistTimeline = mysqlTable("checklist_timeline", {
  id: int("id").autoincrement().primaryKey(),
  checklistId: int("checklistId").references(() => checklists.id).notNull(),
  tipo: mysqlEnum("tipo", ["abertura", "atualizacao", "status_alterado", "comentario", "imagem_adicionada", "responsavel_alterado", "item_completo", "fechamento", "reabertura"]).notNull(),
  descricao: text("descricao").notNull(),
  statusAnterior: varchar("statusAnterior", { length: 50 }),
  statusNovo: varchar("statusNovo", { length: 50 }),
  userId: int("userId").references(() => users.id),
  userNome: varchar("userNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistTimelineEvento = typeof checklistTimeline.$inferSelect;
export type InsertChecklistTimelineEvento = typeof checklistTimeline.$inferInsert;


// ==================== MEMBROS DA EQUIPE ====================
export const membrosEquipe = mysqlTable("membros_equipe", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  descricao: text("descricao"),
  cargo: varchar("cargo", { length: 100 }),
  fotoUrl: text("fotoUrl"),
  // Campos para login e permissões
  email: varchar("email", { length: 320 }),
  senha: varchar("senha", { length: 255 }),
  acessoTotal: boolean("acessoTotal").default(false).notNull(),
  // JSON com lista de módulos permitidos: ["vistorias", "manutencoes", "ocorrencias", "checklists", "antes_depois", "ordens_servico", "agenda_vencimentos", "historico", "gestao_organizacao", "equipe_gestao"]
  permissoes: json("permissoes").$type<string[]>().default([]),
  // Token para reset de senha
  resetToken: varchar("resetToken", { length: 64 }),
  resetTokenExpira: timestamp("resetTokenExpira"),
  ultimoAcesso: timestamp("ultimoAcesso"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MembroEquipe = typeof membrosEquipe.$inferSelect;
export type InsertMembroEquipe = typeof membrosEquipe.$inferInsert;

// ==================== EQUIPES (Grupos de Funcionários) ====================
export const equipes = mysqlTable("equipes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  cor: varchar("cor", { length: 20 }).default("#3b82f6"),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Equipe = typeof equipes.$inferSelect;
export type InsertEquipe = typeof equipes.$inferInsert;

// ==================== FUNCIONÁRIOS DAS EQUIPES (Junção) ====================
export const equipeFuncionarios = mysqlTable("equipe_funcionarios", {
  id: int("id").autoincrement().primaryKey(),
  equipeId: int("equipeId").references(() => equipes.id, { onDelete: "cascade" }).notNull(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EquipeFuncionario = typeof equipeFuncionarios.$inferSelect;

// ==================== HISTÓRICO DE ACESSOS DE MEMBROS ====================
export const membroAcessos = mysqlTable("membro_acessos", {
  id: int("id").autoincrement().primaryKey(),
  membroId: int("membroId").references(() => membrosEquipe.id).notNull(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  dataHora: timestamp("dataHora").defaultNow().notNull(),
  ip: varchar("ip", { length: 45 }), // Suporta IPv6
  userAgent: text("userAgent"),
  dispositivo: varchar("dispositivo", { length: 100 }),
  navegador: varchar("navegador", { length: 100 }),
  sistemaOperacional: varchar("sistemaOperacional", { length: 100 }),
  localizacao: varchar("localizacao", { length: 255 }),
  tipoAcesso: mysqlEnum("tipoAcesso", ["login", "logout", "recuperacao_senha", "alteracao_senha"]).default("login"),
  sucesso: boolean("sucesso").default(true),
  motivoFalha: text("motivoFalha"),
});

export type MembroAcesso = typeof membroAcessos.$inferSelect;
export type InsertMembroAcesso = typeof membroAcessos.$inferInsert;

// ==================== LINKS COMPARTILHÁVEIS ====================
export const linksCompartilhaveis = mysqlTable("links_compartilhaveis", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  tipo: mysqlEnum("tipo", ["vistoria", "manutencao", "ocorrencia", "checklist", "ordem-servico"]).notNull(),
  itemId: int("itemId").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  editavel: boolean("editavel").default(false).notNull(),
  expiracaoHoras: int("expiracaoHoras").default(168), // 7 dias por padrão
  acessos: int("acessos").default(0).notNull(),
  criadoPorId: int("criadoPorId").references(() => users.id),
  criadoPorNome: varchar("criadoPorNome", { length: 255 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LinkCompartilhavel = typeof linksCompartilhaveis.$inferSelect;
export type InsertLinkCompartilhavel = typeof linksCompartilhaveis.$inferInsert;

// ==================== HISTÓRICO DE COMPARTILHAMENTOS ====================
export const historicoCompartilhamentos = mysqlTable("historico_compartilhamentos", {
  id: int("id").autoincrement().primaryKey(),
  linkId: int("linkId").references(() => linksCompartilhaveis.id).notNull(),
  membroId: int("membroId").references(() => membrosEquipe.id),
  membroNome: varchar("membroNome", { length: 255 }),
  membroWhatsapp: varchar("membroWhatsapp", { length: 20 }),
  compartilhadoPorId: int("compartilhadoPorId").references(() => users.id),
  compartilhadoPorNome: varchar("compartilhadoPorNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricoCompartilhamento = typeof historicoCompartilhamentos.$inferSelect;
export type InsertHistoricoCompartilhamento = typeof historicoCompartilhamentos.$inferInsert;


// ==================== COMENTÁRIOS EM ITENS PARTILHADOS ====================
export const comentariosItem = mysqlTable("comentarios_item", {
  id: int("id").autoincrement().primaryKey(),
  itemId: int("itemId").notNull(),
  itemTipo: mysqlEnum("itemTipo", ["vistoria", "manutencao", "ocorrencia", "checklist"]).notNull(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  autorId: int("autorId").references(() => users.id),
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  autorWhatsapp: varchar("autorWhatsapp", { length: 20 }),
  autorEmail: varchar("autorEmail", { length: 320 }),
  autorFoto: text("autorFoto"),
  texto: text("texto").notNull(),
  isInterno: boolean("isInterno").default(false).notNull(),
  lido: boolean("lido").default(false).notNull(),
  lidoPorId: int("lidoPorId").references(() => users.id),
  lidoEm: timestamp("lidoEm"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ComentarioItem = typeof comentariosItem.$inferSelect;
export type InsertComentarioItem = typeof comentariosItem.$inferInsert;

// ==================== ANEXOS DE COMENTÁRIOS ====================
export const anexosComentario = mysqlTable("anexos_comentario", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentarioId").references(() => comentariosItem.id).notNull(),
  url: text("url").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(),
  tamanho: int("tamanho"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnexoComentario = typeof anexosComentario.$inferSelect;
export type InsertAnexoComentario = typeof anexosComentario.$inferInsert;

// ==================== RESPOSTAS A COMENTÁRIOS ====================
export const respostasComentario = mysqlTable("respostas_comentario", {
  id: int("id").autoincrement().primaryKey(),
  comentarioId: int("comentarioId").references(() => comentariosItem.id).notNull(),
  autorId: int("autorId").references(() => users.id),
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  autorFoto: text("autorFoto"),
  texto: text("texto").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RespostaComentario = typeof respostasComentario.$inferSelect;
export type InsertRespostaComentario = typeof respostasComentario.$inferInsert;


// ==================== DESTAQUES ====================
export const destaques = mysqlTable("destaques", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  descricao: text("descricao"),
  link: text("link"),
  arquivoUrl: text("arquivoUrl"),
  arquivoNome: varchar("arquivoNome", { length: 255 }),
  videoUrl: text("videoUrl"),
  ordem: int("ordem").default(0),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Destaque = typeof destaques.$inferSelect;
export type InsertDestaque = typeof destaques.$inferInsert;

// ==================== IMAGENS DE DESTAQUES ====================
export const imagensDestaques = mysqlTable("imagens_destaques", {
  id: int("id").autoincrement().primaryKey(),
  destaqueId: int("destaqueId").references(() => destaques.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemDestaque = typeof imagensDestaques.$inferSelect;
export type InsertImagemDestaque = typeof imagensDestaques.$inferInsert;


// ==================== PÁGINA 100% PERSONALIZADA ====================
export const paginasCustom = mysqlTable("paginas_custom", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  subtitulo: varchar("subtitulo", { length: 255 }),
  descricao: text("descricao"),
  link: text("link"),
  videoUrl: text("videoUrl"),
  arquivoUrl: text("arquivoUrl"),
  arquivoNome: varchar("arquivoNome", { length: 255 }),
  imagens: json("imagens").$type<Array<{url: string, legenda?: string}>>(),
  ativo: boolean("ativo").default(true),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaginaCustom = typeof paginasCustom.$inferSelect;
export type InsertPaginaCustom = typeof paginasCustom.$inferInsert;

// ==================== IMAGENS DE PÁGINAS PERSONALIZADAS ====================
export const imagensCustom = mysqlTable("imagens_custom", {
  id: int("id").autoincrement().primaryKey(),
  paginaId: int("paginaId").references(() => paginasCustom.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ImagemCustom = typeof imagensCustom.$inferSelect;
export type InsertImagemCustom = typeof imagensCustom.$inferInsert;


// ==================== AGENDA DE VENCIMENTOS ====================
export const vencimentos = mysqlTable("vencimentos", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  tipo: mysqlEnum("tipo", ["contrato", "servico", "manutencao"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  fornecedor: varchar("fornecedor", { length: 255 }),
  valor: decimal("valor", { precision: 10, scale: 2 }),
  dataInicio: timestamp("dataInicio"),
  dataVencimento: timestamp("dataVencimento").notNull(),
  ultimaRealizacao: timestamp("ultimaRealizacao"),
  proximaRealizacao: timestamp("proximaRealizacao"),
  periodicidade: mysqlEnum("periodicidade", ["unico", "mensal", "bimestral", "trimestral", "semestral", "anual"]).default("unico"),
  status: mysqlEnum("status", ["ativo", "vencido", "renovado", "cancelado"]).default("ativo").notNull(),
  observacoes: text("observacoes"),
  arquivoUrl: text("arquivoUrl"),
  arquivoNome: varchar("arquivoNome", { length: 255 }),
  setor: varchar("setor", { length: 255 }),
  responsavel: varchar("responsavel", { length: 255 }),
  imagemUrl: text("imagemUrl"),
  emailsNotificacao: text("emailsNotificacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vencimento = typeof vencimentos.$inferSelect;
export type InsertVencimento = typeof vencimentos.$inferInsert;

// ==================== CONFIGURAÇÃO DE ALERTAS DE VENCIMENTOS ====================
export const vencimentoAlertas = mysqlTable("vencimento_alertas", {
  id: int("id").autoincrement().primaryKey(),
  vencimentoId: int("vencimentoId").references(() => vencimentos.id).notNull(),
  tipoAlerta: mysqlEnum("tipoAlerta", ["na_data", "um_dia_antes", "uma_semana_antes", "quinze_dias_antes", "um_mes_antes"]).notNull(),
  ativo: boolean("ativo").default(true),
  enviado: boolean("enviado").default(false),
  dataEnvio: timestamp("dataEnvio"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VencimentoAlerta = typeof vencimentoAlertas.$inferSelect;
export type InsertVencimentoAlerta = typeof vencimentoAlertas.$inferInsert;

// ==================== E-MAILS PARA NOTIFICAÇÃO DE VENCIMENTOS ====================
export const vencimentoEmails = mysqlTable("vencimento_emails", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  nome: varchar("nome", { length: 255 }),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VencimentoEmail = typeof vencimentoEmails.$inferSelect;
export type InsertVencimentoEmail = typeof vencimentoEmails.$inferInsert;

// ==================== HISTÓRICO DE NOTIFICAÇÕES ENVIADAS ====================
export const vencimentoNotificacoes = mysqlTable("vencimento_notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  vencimentoId: int("vencimentoId").references(() => vencimentos.id).notNull(),
  alertaId: int("alertaId").references(() => vencimentoAlertas.id),
  emailDestinatario: varchar("emailDestinatario", { length: 320 }).notNull(),
  assunto: varchar("assunto", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  status: mysqlEnum("status", ["enviado", "erro", "pendente"]).default("pendente").notNull(),
  erroMensagem: text("erroMensagem"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VencimentoNotificacao = typeof vencimentoNotificacoes.$inferSelect;
export type InsertVencimentoNotificacao = typeof vencimentoNotificacoes.$inferInsert;


// ==================== PUSH SUBSCRIPTIONS (Web Push Notifications) ====================
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id),
  moradorId: int("moradorId").references(() => moradores.id),
  userId: int("userId").references(() => users.id),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("userAgent"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

// ==================== LEMBRETES AGENDADOS ====================
export const lembretes = mysqlTable("lembretes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  tipo: mysqlEnum("tipo", ["assembleia", "vencimento", "evento", "manutencao", "custom"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem"),
  dataAgendada: timestamp("dataAgendada").notNull(),
  antecedenciaHoras: int("antecedenciaHoras").default(24),
  enviado: boolean("enviado").default(false),
  enviadoEm: timestamp("enviadoEm"),
  referenciaId: int("referenciaId"),
  referenciaTipo: varchar("referenciaTipo", { length: 50 }),
  canais: json("canais").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lembrete = typeof lembretes.$inferSelect;
export type InsertLembrete = typeof lembretes.$inferInsert;

// ==================== HISTÓRICO DE NOTIFICAÇÕES ENVIADAS ====================
export const historicoNotificacoes = mysqlTable("historico_notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  tipo: mysqlEnum("tipo", ["push", "email", "whatsapp", "sistema"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem"),
  destinatarios: int("destinatarios").default(0),
  sucessos: int("sucessos").default(0),
  falhas: int("falhas").default(0),
  lembreteId: int("lembreteId").references(() => lembretes.id),
  enviadoPor: int("enviadoPor").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricoNotificacao = typeof historicoNotificacoes.$inferSelect;
export type InsertHistoricoNotificacao = typeof historicoNotificacoes.$inferInsert;

// ==================== CONFIGURAÇÕES DE EMAIL ====================
export const configuracoesEmail = mysqlTable("configuracoes_email", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull().unique(),
  provedor: mysqlEnum("provedor", ["resend", "sendgrid", "mailgun", "smtp"]).default("resend"),
  apiKey: text("apiKey"),
  emailRemetente: varchar("emailRemetente", { length: 255 }),
  nomeRemetente: varchar("nomeRemetente", { length: 255 }),
  ativo: boolean("ativo").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConfiguracaoEmail = typeof configuracoesEmail.$inferSelect;
export type InsertConfiguracaoEmail = typeof configuracoesEmail.$inferInsert;

// ==================== CONFIGURAÇÕES PUSH (VAPID) ====================
export const configuracoesPush = mysqlTable("configuracoes_push", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  vapidPublicKey: text("vapidPublicKey"),
  vapidPrivateKey: text("vapidPrivateKey"),
  vapidSubject: varchar("vapidSubject", { length: 255 }),
  ativo: boolean("ativo").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConfiguracaoPush = typeof configuracoesPush.$inferSelect;
export type InsertConfiguracaoPush = typeof configuracoesPush.$inferInsert;

// ==================== TEMPLATES DE NOTIFICAÇÃO ====================
export const templatesNotificacao = mysqlTable("templates_notificacao", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  titulo: varchar("titulo", { length: 100 }).notNull(),
  mensagem: text("mensagem").notNull(),
  categoria: mysqlEnum("categoria", ['assembleia', 'manutencao', 'vencimento', 'aviso', 'evento', 'custom']).default('custom'),
  icone: varchar("icone", { length: 50 }),
  cor: varchar("cor", { length: 20 }),
  urlDestino: varchar("urlDestino", { length: 255 }),
  ativo: boolean("ativo").default(true),
  usageCount: int("usageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TemplateNotificacao = typeof templatesNotificacao.$inferSelect;
export type InsertTemplateNotificacao = typeof templatesNotificacao.$inferInsert;


// ==================== TIPOS DE INFRAÇÃO ====================
export const tiposInfracao = mysqlTable("tipos_infracao", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricaoPadrao: text("descricaoPadrao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TipoInfracao = typeof tiposInfracao.$inferSelect;
export type InsertTipoInfracao = typeof tiposInfracao.$inferInsert;

// ==================== NOTIFICAÇÕES DE INFRAÇÃO ====================
export const notificacoesInfracao = mysqlTable("notificacoes_infracao", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  moradorId: int("moradorId").references(() => moradores.id).notNull(),
  tipoInfracaoId: int("tipoInfracaoId").references(() => tiposInfracao.id),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  imagens: json("imagens").$type<string[]>(),
  status: mysqlEnum("status", ['pendente', 'respondida', 'resolvida', 'arquivada']).default('pendente'),
  dataOcorrencia: timestamp("dataOcorrencia"),
  pdfUrl: text("pdfUrl"),
  linkPublico: varchar("linkPublico", { length: 64 }).notNull(),
  enviadoWhatsapp: boolean("enviadoWhatsapp").default(false),
  enviadoEmail: boolean("enviadoEmail").default(false),
  criadoPor: int("criadoPor").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificacaoInfracao = typeof notificacoesInfracao.$inferSelect;
export type InsertNotificacaoInfracao = typeof notificacoesInfracao.$inferInsert;

// ==================== RESPOSTAS DE INFRAÇÃO (TIMELINE/CHAT) ====================
export const respostasInfracao = mysqlTable("respostas_infracao", {
  id: int("id").autoincrement().primaryKey(),
  notificacaoId: int("notificacaoId").references(() => notificacoesInfracao.id).notNull(),
  autorTipo: mysqlEnum("autorTipo", ['sindico', 'morador']).notNull(),
  autorId: int("autorId"),
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  imagens: json("imagens").$type<string[]>(),
  lidaPeloSindico: boolean("lidaPeloSindico").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RespostaInfracao = typeof respostasInfracao.$inferSelect;
export type InsertRespostaInfracao = typeof respostasInfracao.$inferInsert;


// ==================== FUNÇÕES HABILITADAS POR CONDOMÍNIO ====================
export const condominioFuncoes = mysqlTable("condominio_funcoes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  funcaoId: varchar("funcaoId", { length: 50 }).notNull(),
  habilitada: boolean("habilitada").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CondominioFuncao = typeof condominioFuncoes.$inferSelect;
export type InsertCondominioFuncao = typeof condominioFuncoes.$inferInsert;

// Lista de todas as funções disponíveis no sistema
export const FUNCOES_DISPONIVEIS = [
  { id: "avisos", nome: "Avisos", categoria: "comunicacao", descricao: "Publicar avisos e comunicados" },
  { id: "comunicados", nome: "Comunicados", categoria: "comunicacao", descricao: "Enviar comunicados oficiais" },
  { id: "notificacoes", nome: "Notificações", categoria: "comunicacao", descricao: "Sistema de notificações" },
  { id: "notificar-morador", nome: "Notificar Morador", categoria: "comunicacao", descricao: "Notificar moradores individualmente" },
  { id: "eventos", nome: "Eventos", categoria: "agenda", descricao: "Gestão de eventos do condomínio" },
  { id: "agenda-vencimentos", nome: "Agenda de Vencimentos", categoria: "agenda", descricao: "Controle de vencimentos" },
  { id: "reservas", nome: "Reservas", categoria: "agenda", descricao: "Reserva de áreas comuns" },
  { id: "vistorias", nome: "Vistorias", categoria: "operacional", descricao: "Registro de vistorias" },
  { id: "manutencoes", nome: "Manutenções", categoria: "operacional", descricao: "Controle de manutenções" },
  { id: "ocorrencias", nome: "Ocorrências", categoria: "operacional", descricao: "Registro de ocorrências" },
  { id: "checklists", nome: "Checklists", categoria: "operacional", descricao: "Listas de verificação" },
  { id: "antes-depois", nome: "Antes e Depois", categoria: "operacional", descricao: "Registro de melhorias" },
  { id: "ordens-servico", nome: "Ordens de Serviço", categoria: "operacional", descricao: "Gestão de ordens de serviço" },
  { id: "timeline", nome: "Timeline", categoria: "operacional", descricao: "Registro de eventos e atualizações" },
  { id: "leitura-medidores", nome: "Leitura de Medidores", categoria: "operacional", descricao: "Registro de leituras de água, gás e energia" },
  { id: "controle-pragas", nome: "Controle de Pragas", categoria: "operacional", descricao: "Registros de dedetização e controle de pragas" },
  { id: "jardinagem", nome: "Jardinagem", categoria: "operacional", descricao: "Serviços de jardinagem e áreas verdes" },
  { id: "votacoes", nome: "Votações", categoria: "interativo", descricao: "Sistema de votações" },
  { id: "classificados", nome: "Classificados", categoria: "interativo", descricao: "Classificados dos moradores" },
  { id: "achados-perdidos", nome: "Achados e Perdidos", categoria: "interativo", descricao: "Itens perdidos e encontrados" },
  { id: "caronas", nome: "Caronas", categoria: "interativo", descricao: "Sistema de caronas" },
  { id: "regras", nome: "Regras e Normas", categoria: "documentacao", descricao: "Regras do condomínio" },
  { id: "dicas-seguranca", nome: "Dicas de Segurança", categoria: "documentacao", descricao: "Dicas de segurança" },
  { id: "links-uteis", nome: "Links Úteis", categoria: "documentacao", descricao: "Links importantes" },
  { id: "telefones-uteis", nome: "Telefones Úteis", categoria: "documentacao", descricao: "Telefones de emergência" },
  { id: "galeria", nome: "Galeria de Fotos", categoria: "midia", descricao: "Fotos do condomínio" },
  { id: "realizacoes", nome: "Realizações", categoria: "midia", descricao: "Realizações da gestão" },
  { id: "melhorias", nome: "Melhorias", categoria: "midia", descricao: "Melhorias realizadas" },
  { id: "aquisicoes", nome: "Aquisições", categoria: "midia", descricao: "Novas aquisições" },
  { id: "publicidade", nome: "Publicidade", categoria: "publicidade", descricao: "Gestão de anunciantes" },
  { id: "revistas", nome: "Meus Projetos", categoria: "projetos", descricao: "Apps, revistas e relatórios" },
  { id: "moradores", nome: "Moradores", categoria: "gestao", descricao: "Gestão de moradores" },
  { id: "funcionarios", nome: "Funcionários", categoria: "gestao", descricao: "Gestão de funcionários" },
  { id: "vagas", nome: "Vagas de Estacionamento", categoria: "gestao", descricao: "Gestão de vagas" },
  { id: "equipe", nome: "Equipe de Gestão", categoria: "gestao", descricao: "Membros da equipe" },
  { id: "painel-controlo", nome: "Painel de Controlo", categoria: "relatorios", descricao: "Estatísticas e gráficos" },
  { id: "relatorios", nome: "Relatórios", categoria: "relatorios", descricao: "Relatórios detalhados" },
] as const;

export type FuncaoId = typeof FUNCOES_DISPONIVEIS[number]["id"];


// ==================== APPS PERSONALIZADOS ====================
export const apps = mysqlTable("apps", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  logoUrl: text("logoUrl"),
  corPrimaria: varchar("corPrimaria", { length: 20 }).default("#4F46E5"),
  corSecundaria: varchar("corSecundaria", { length: 20 }).default("#10B981"),
  shareLink: varchar("shareLink", { length: 50 }).unique(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type App = typeof apps.$inferSelect;
export type InsertApp = typeof apps.$inferInsert;

// ==================== MÓDULOS DO APP ====================
export const appModulos = mysqlTable("app_modulos", {
  id: int("id").autoincrement().primaryKey(),
  appId: int("appId").references(() => apps.id).notNull(),
  moduloKey: varchar("moduloKey", { length: 50 }).notNull(),
  titulo: varchar("titulo", { length: 100 }).notNull(),
  icone: varchar("icone", { length: 50 }),
  cor: varchar("cor", { length: 50 }),
  bgCor: varchar("bgCor", { length: 100 }),
  ordem: int("ordem").default(0),
  habilitado: boolean("habilitado").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AppModulo = typeof appModulos.$inferSelect;
export type InsertAppModulo = typeof appModulos.$inferInsert;


// ==================== TEMPLATES DE CHECKLIST ====================
export const checklistTemplates = mysqlTable("checklist_templates", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: varchar("categoria", { length: 100 }),
  icone: varchar("icone", { length: 50 }),
  cor: varchar("cor", { length: 20 }),
  isPadrao: boolean("isPadrao").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistTemplate = typeof checklistTemplates.$inferSelect;
export type InsertChecklistTemplate = typeof checklistTemplates.$inferInsert;

// ==================== ITENS DE TEMPLATES DE CHECKLIST ====================
export const checklistTemplateItens = mysqlTable("checklist_template_itens", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").references(() => checklistTemplates.id).notNull(),
  descricao: varchar("descricao", { length: 500 }).notNull(),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChecklistTemplateItem = typeof checklistTemplateItens.$inferSelect;
export type InsertChecklistTemplateItem = typeof checklistTemplateItens.$inferInsert;


// ==================== VALORES SALVOS (Responsáveis, Categorias, Tipos, Fornecedores) ====================
export const valoresSalvos = mysqlTable("valores_salvos", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  tipo: mysqlEnum("tipo", [
    "responsavel",
    "categoria_vistoria",
    "categoria_manutencao", 
    "categoria_checklist",
    "categoria_ocorrencia",
    "tipo_vistoria",
    "tipo_manutencao",
    "tipo_checklist",
    "tipo_ocorrencia",
    "fornecedor",
    "localizacao",
    "titulo_vistoria",
    "subtitulo_vistoria",
    "descricao_vistoria",
    "observacoes_vistoria",
    "titulo_manutencao",
    "subtitulo_manutencao",
    "descricao_manutencao",
    "observacoes_manutencao",
    "titulo_ocorrencia",
    "subtitulo_ocorrencia",
    "descricao_ocorrencia",
    "observacoes_ocorrencia",
    "titulo_antesdepois",
    "descricao_antesdepois"
  ]).notNull(),
  valor: varchar("valor", { length: 255 }).notNull(),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ValorSalvo = typeof valoresSalvos.$inferSelect;
export type InsertValorSalvo = typeof valoresSalvos.$inferInsert;


// ==================== ORDENS DE SERVIÇO ====================

// Categorias de OS (personalizáveis)
export const osCategorias = mysqlTable("os_categorias", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  icone: varchar("icone", { length: 50 }),
  cor: varchar("cor", { length: 20 }),
  isPadrao: boolean("isPadrao").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsCategoria = typeof osCategorias.$inferSelect;
export type InsertOsCategoria = typeof osCategorias.$inferInsert;

// Prioridades de OS (personalizáveis)
export const osPrioridades = mysqlTable("os_prioridades", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  nivel: int("nivel").default(1), // 1=baixa, 2=normal, 3=alta, 4=urgente
  cor: varchar("cor", { length: 20 }),
  icone: varchar("icone", { length: 50 }),
  isPadrao: boolean("isPadrao").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsPrioridade = typeof osPrioridades.$inferSelect;
export type InsertOsPrioridade = typeof osPrioridades.$inferInsert;

// Status de OS (personalizáveis)
export const osStatus = mysqlTable("os_status", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cor: varchar("cor", { length: 20 }),
  icone: varchar("icone", { length: 50 }),
  ordem: int("ordem").default(0),
  isFinal: boolean("isFinal").default(false), // Se é status final (concluída/cancelada)
  isPadrao: boolean("isPadrao").default(false),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsStatus = typeof osStatus.$inferSelect;
export type InsertOsStatus = typeof osStatus.$inferInsert;

// Setores de OS (personalizáveis)
export const osSetores = mysqlTable("os_setores", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsSetor = typeof osSetores.$inferSelect;
export type InsertOsSetor = typeof osSetores.$inferInsert;

// Configurações de OS por condomínio
export const osConfiguracoes = mysqlTable("os_configuracoes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull().unique(),
  habilitarOrcamentos: boolean("habilitarOrcamentos").default(true),
  habilitarAprovacaoOrcamento: boolean("habilitarAprovacaoOrcamento").default(true),
  habilitarGestaoFinanceira: boolean("habilitarGestaoFinanceira").default(true),
  habilitarRelatoriosGastos: boolean("habilitarRelatoriosGastos").default(true),
  habilitarVinculoManutencao: boolean("habilitarVinculoManutencao").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsConfiguracao = typeof osConfiguracoes.$inferSelect;
export type InsertOsConfiguracao = typeof osConfiguracoes.$inferInsert;

// Tabela principal de Ordens de Serviço
export const ordensServico = mysqlTable("ordens_servico", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  
  // Relacionamentos com tabelas personalizáveis
  categoriaId: int("categoriaId").references(() => osCategorias.id),
  prioridadeId: int("prioridadeId").references(() => osPrioridades.id),
  statusId: int("statusId").references(() => osStatus.id),
  setorId: int("setorId").references(() => osSetores.id),
  
  // Localização
  endereco: text("endereco"),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  localizacaoDescricao: varchar("localizacaoDescricao", { length: 255 }),
  
  // Tempo estimado (em minutos totais)
  tempoEstimadoDias: int("tempoEstimadoDias").default(0),
  tempoEstimadoHoras: int("tempoEstimadoHoras").default(0),
  tempoEstimadoMinutos: int("tempoEstimadoMinutos").default(0),
  
  // Controle de tempo real
  dataInicio: timestamp("dataInicio"),
  dataFim: timestamp("dataFim"),
  tempoDecorridoMinutos: int("tempoDecorridoMinutos"),
  
  // Financeiro
  valorEstimado: decimal("valorEstimado", { precision: 10, scale: 2 }),
  valorReal: decimal("valorReal", { precision: 10, scale: 2 }),
  
  // Vínculo com manutenção
  manutencaoId: int("manutencaoId").references(() => manutencoes.id),
  
  // Chat
  chatToken: varchar("chatToken", { length: 64 }).unique(),
  chatAtivo: boolean("chatAtivo").default(true),
  
  // Responsável Principal (ID sem foreign key para evitar referência circular)
  responsavelPrincipalId: int("responsavelPrincipalId"),
  responsavelPrincipalNome: varchar("responsavelPrincipalNome", { length: 255 }),
  
  // Solicitante
  solicitanteId: int("solicitanteId").references(() => users.id),
  solicitanteNome: varchar("solicitanteNome", { length: 255 }),
  solicitanteTipo: mysqlEnum("solicitanteTipo", ["sindico", "morador", "funcionario", "administradora"]).default("sindico"),
  
  // Compartilhamento
  shareToken: varchar("shareToken", { length: 64 }).unique(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OrdemServico = typeof ordensServico.$inferSelect;
export type InsertOrdemServico = typeof ordensServico.$inferInsert;

// Responsáveis da OS
export const osResponsaveis = mysqlTable("os_responsaveis", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 100 }),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id),
  principal: boolean("principal").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OsResponsavel = typeof osResponsaveis.$inferSelect;
export type InsertOsResponsavel = typeof osResponsaveis.$inferInsert;

// Materiais da OS
export const osMateriais = mysqlTable("os_materiais", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  quantidade: int("quantidade").default(1),
  unidade: varchar("unidade", { length: 20 }),
  emEstoque: boolean("emEstoque").default(false),
  precisaPedir: boolean("precisaPedir").default(false),
  pedidoDescricao: text("pedidoDescricao"),
  valorUnitario: decimal("valorUnitario", { precision: 10, scale: 2 }),
  valorTotal: decimal("valorTotal", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsMaterial = typeof osMateriais.$inferSelect;
export type InsertOsMaterial = typeof osMateriais.$inferInsert;

// Orçamentos da OS
export const osOrcamentos = mysqlTable("os_orcamentos", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  fornecedor: varchar("fornecedor", { length: 255 }),
  descricao: text("descricao"),
  valor: decimal("valor", { precision: 10, scale: 2 }).notNull(),
  dataOrcamento: timestamp("dataOrcamento").defaultNow(),
  dataValidade: timestamp("dataValidade"),
  aprovado: boolean("aprovado").default(false),
  aprovadoPor: int("aprovadoPor").references(() => users.id),
  dataAprovacao: timestamp("dataAprovacao"),
  motivoRejeicao: text("motivoRejeicao"),
  anexoUrl: text("anexoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OsOrcamento = typeof osOrcamentos.$inferSelect;
export type InsertOsOrcamento = typeof osOrcamentos.$inferInsert;

// Timeline/Histórico da OS
export const osTimeline = mysqlTable("os_timeline", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  tipo: mysqlEnum("tipo", [
    "criacao",
    "status_alterado",
    "responsavel_adicionado",
    "responsavel_removido",
    "material_adicionado",
    "material_removido",
    "orcamento_adicionado",
    "orcamento_aprovado",
    "orcamento_rejeitado",
    "orcamento_removido",
    "inicio_servico",
    "fim_servico",
    "comentario",
    "foto_adicionada",
    "foto_removida",
    "localizacao_atualizada",
    "vinculo_manutencao",
    "anexo_adicionado",
    "anexo_removido"
  ]).notNull(),
  descricao: text("descricao"),
  usuarioId: int("usuarioId").references(() => users.id),
  usuarioNome: varchar("usuarioNome", { length: 255 }),
  dadosAnteriores: json("dadosAnteriores"),
  dadosNovos: json("dadosNovos"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OsTimeline = typeof osTimeline.$inferSelect;
export type InsertOsTimeline = typeof osTimeline.$inferInsert;

// Chat da OS
export const osChat = mysqlTable("os_chat", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  remetenteId: int("remetenteId").references(() => users.id),
  remetenteNome: varchar("remetenteNome", { length: 255 }).notNull(),
  remetenteTipo: mysqlEnum("remetenteTipo", ["sindico", "morador", "funcionario", "visitante"]).default("visitante"),
  mensagem: text("mensagem"),
  anexoUrl: text("anexoUrl"),
  anexoNome: varchar("anexoNome", { length: 255 }),
  anexoTipo: varchar("anexoTipo", { length: 100 }),
  anexoTamanho: int("anexoTamanho"),
  lida: boolean("lida").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OsChat = typeof osChat.$inferSelect;
export type InsertOsChat = typeof osChat.$inferInsert;

// Imagens da OS
export const osImagens = mysqlTable("os_imagens", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  url: text("url").notNull(),
  tipo: mysqlEnum("tipo", ["antes", "durante", "depois", "orcamento", "outro"]).default("outro"),
  descricao: varchar("descricao", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Tipos para osImagens
export type OsImagem = typeof osImagens.$inferSelect;
export type InsertOsImagem = typeof osImagens.$inferInsert;



// ==================== FUNÇÕES RÁPIDAS ====================
export const funcoesRapidas = mysqlTable("funcoes_rapidas", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  funcaoId: varchar("funcaoId", { length: 100 }).notNull(), // ID da função (ex: "avisos", "eventos", etc.)
  nome: varchar("nome", { length: 255 }).notNull(), // Nome da função
  path: varchar("path", { length: 255 }).notNull(), // Caminho/rota da função
  icone: varchar("icone", { length: 100 }).notNull(), // Nome do ícone Lucide
  cor: varchar("cor", { length: 20 }).notNull(), // Cor em hex (ex: "#EF4444")
  ordem: int("ordem").default(0).notNull(), // Ordem de exibição (0-11)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FuncaoRapida = typeof funcoesRapidas.$inferSelect;
export type InsertFuncaoRapida = typeof funcoesRapidas.$inferInsert;


// ==================== INSCRIÇÕES PARA RECEBER REVISTA ====================
export const inscricoesRevista = mysqlTable("inscricoes_revista", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  revistaId: int("revistaId").references(() => revistas.id),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  unidade: varchar("unidade", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  status: mysqlEnum("status", ["pendente", "ativo", "inativo"]).default("pendente").notNull(),
  ativadoPor: int("ativadoPor").references(() => users.id),
  dataAtivacao: timestamp("dataAtivacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InscricaoRevista = typeof inscricoesRevista.$inferSelect;
export type InsertInscricaoRevista = typeof inscricoesRevista.$inferInsert;


// ==================== TAREFAS SIMPLES ====================
// Sistema de registro rápido para vistorias, manutenções, ocorrências e antes/depois
export const tarefasSimples = mysqlTable("tarefas_simples", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  userId: int("userId").references(() => users.id),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id),
  
  // Tipo da tarefa
  tipo: mysqlEnum("tipo", ["vistoria", "manutencao", "ocorrencia", "antes_depois", "checklist"]).notNull(),
  
  // Dados principais
  protocolo: varchar("protocolo", { length: 50 }).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }),
  descricao: text("descricao"),
  local: varchar("local", { length: 255 }),
  
  // Imagens (JSON array de objetos com URL e legenda opcional)
  // Compatível com formato antigo (string[]) - o backend normaliza para o novo formato
  imagens: json("imagens").$type<{ url: string; legenda?: string }[]>(),
  
  // Itens do checklist (JSON array de objetos)
  itensChecklist: json("itensChecklist").$type<{ id: string; titulo: string; concluido: boolean; temProblema: boolean; problema?: { titulo: string; descricao: string; imagens: string[]; } }[]>(),
  
  // Localização automática
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  endereco: text("endereco"),
  
  // Status personalizado pelo usuário
  statusPersonalizado: varchar("statusPersonalizado", { length: 100 }),
  
  // Prioridade e Responsável
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media"),
  responsavelId: int("responsavelId").references(() => membrosEquipe.id),
  
  // Campos extras para manutenção
  prazoConclusao: timestamp("prazoConclusao"),
  custoEstimado: varchar("custoEstimado", { length: 50 }),
  nivelUrgencia: mysqlEnum("nivelUrgencia", ["baixo", "medio", "alto", "critico"]),
  anexos: json("anexos").$type<{ nome: string; url: string }[]>(),
  qrcode: varchar("qrcode", { length: 500 }),
  assinaturaTecnico: text("assinaturaTecnico"),
  assinaturaSolicitante: text("assinaturaSolicitante"),
  
  // Controle de envio
  status: mysqlEnum("status", ["rascunho", "enviado", "concluido"]).default("rascunho").notNull(),
  enviadoEm: timestamp("enviadoEm"),
  concluidoEm: timestamp("concluidoEm"),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TarefaSimples = typeof tarefasSimples.$inferSelect;
export type InsertTarefaSimples = typeof tarefasSimples.$inferInsert;

// ==================== STATUS PERSONALIZADOS ====================
// Permite ao usuário criar seus próprios status para as tarefas
export const statusPersonalizados = mysqlTable("status_personalizados", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  userId: int("userId").references(() => users.id),
  
  nome: varchar("nome", { length: 100 }).notNull(),
  cor: varchar("cor", { length: 20 }).default("#F97316"), // Laranja premium padrão
  icone: varchar("icone", { length: 50 }),
  ordem: int("ordem").default(0),
  ativo: boolean("ativo").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StatusPersonalizado = typeof statusPersonalizados.$inferSelect;
export type InsertStatusPersonalizado = typeof statusPersonalizados.$inferInsert;

// ==================== TEMPLATES DE CAMPOS RÁPIDOS ====================
// Permite ao usuário salvar valores frequentes para reutilização
export const camposRapidosTemplates = mysqlTable("campos_rapidos_templates", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  userId: int("userId").references(() => users.id),
  
  // Tipo do campo: titulo, descricao, local, etc.
  tipoCampo: mysqlEnum("tipoCampo", ["titulo", "descricao", "local", "observacao", "responsavel_os", "titulo_os"]).notNull(),
  
  // Tipo da tarefa (opcional - para filtrar por contexto)
  tipoTarefa: mysqlEnum("tipoTarefa", ["vistoria", "manutencao", "ocorrencia", "antes_depois", "checklist"]),
  
  // Valor salvo
  valor: text("valor").notNull(),
  
  // Nome amigável para identificação
  nome: varchar("nome", { length: 100 }),
  
  // Controle de uso
  vezesUsado: int("vezesUsado").default(0),
  ultimoUso: timestamp("ultimoUso"),
  favorito: boolean("favorito").default(false),
  ativo: boolean("ativo").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CampoRapidoTemplate = typeof camposRapidosTemplates.$inferSelect;
export type InsertCampoRapidoTemplate = typeof camposRapidosTemplates.$inferInsert;


// ==================== SISTEMA DE ACESSO AOS APPS ====================

// Códigos de acesso para apps (acesso rápido sem email/senha)
export const appCodigosAcesso = mysqlTable("app_codigos_acesso", {
  id: int("id").autoincrement().primaryKey(),
  appId: int("appId").references(() => apps.id).notNull(),
  
  codigo: varchar("codigo", { length: 50 }).notNull().unique(),
  descricao: varchar("descricao", { length: 255 }),
  
  // Controle de validade
  ativo: boolean("ativo").default(true),
  validoAte: timestamp("validoAte"), // null = sem expiração
  
  // Permissões do código
  permissao: mysqlEnum("permissao", ["visualizar", "editar", "administrar"]).default("visualizar"),
  
  // Estatísticas
  vezesUsado: int("vezesUsado").default(0),
  ultimoUso: timestamp("ultimoUso"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppCodigoAcesso = typeof appCodigosAcesso.$inferSelect;
export type InsertAppCodigoAcesso = typeof appCodigosAcesso.$inferInsert;

// Utilizadores de apps (acesso com email/senha)
export const appUsuarios = mysqlTable("app_usuarios", {
  id: int("id").autoincrement().primaryKey(),
  appId: int("appId").references(() => apps.id).notNull(),
  
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  senhaHash: varchar("senhaHash", { length: 255 }).notNull(),
  
  // Permissões
  permissao: mysqlEnum("permissao", ["visualizar", "editar", "administrar"]).default("visualizar"),
  
  // Controle de conta
  ativo: boolean("ativo").default(true),
  emailVerificado: boolean("emailVerificado").default(false),
  
  // Recuperação de senha
  resetToken: varchar("resetToken", { length: 64 }),
  resetTokenExpira: timestamp("resetTokenExpira"),
  
  // Estatísticas
  ultimoAcesso: timestamp("ultimoAcesso"),
  vezesAcesso: int("vezesAcesso").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppUsuario = typeof appUsuarios.$inferSelect;
export type InsertAppUsuario = typeof appUsuarios.$inferInsert;

// Sessões de acesso aos apps
export const appSessoes = mysqlTable("app_sessoes", {
  id: int("id").autoincrement().primaryKey(),
  appId: int("appId").references(() => apps.id).notNull(),
  
  // Pode ser vinculado a um usuário OU a um código de acesso
  usuarioId: int("usuarioId").references(() => appUsuarios.id),
  codigoAcessoId: int("codigoAcessoId").references(() => appCodigosAcesso.id),
  
  token: varchar("token", { length: 255 }).notNull().unique(),
  
  // Informações da sessão
  ip: varchar("ip", { length: 45 }),
  userAgent: text("userAgent"),
  
  // Controle de validade
  expiraEm: timestamp("expiraEm").notNull(),
  ativo: boolean("ativo").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AppSessao = typeof appSessoes.$inferSelect;
export type InsertAppSessao = typeof appSessoes.$inferInsert;

// Log de acessos aos apps (para auditoria)
export const appAcessosLog = mysqlTable("app_acessos_log", {
  id: int("id").autoincrement().primaryKey(),
  appId: int("appId").references(() => apps.id).notNull(),
  
  // Quem acessou
  usuarioId: int("usuarioId").references(() => appUsuarios.id),
  codigoAcessoId: int("codigoAcessoId").references(() => appCodigosAcesso.id),
  
  // Tipo de acesso
  tipoAcesso: mysqlEnum("tipoAcesso", ["codigo", "email", "link_magico"]).notNull(),
  
  // Informações do acesso
  ip: varchar("ip", { length: 45 }),
  userAgent: text("userAgent"),
  sucesso: boolean("sucesso").default(true),
  motivoFalha: varchar("motivoFalha", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AppAcessoLog = typeof appAcessosLog.$inferSelect;
export type InsertAppAcessoLog = typeof appAcessosLog.$inferInsert;


// ==================== ADMIN LOGS ====================
// Log de atividades administrativas (auditoria)
export const adminLogs = mysqlTable("admin_logs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Quem realizou a ação
  adminId: int("adminId").references(() => users.id).notNull(),
  adminNome: varchar("adminNome", { length: 255 }),
  adminEmail: varchar("adminEmail", { length: 320 }),
  
  // Tipo de ação
  acao: mysqlEnum("acao", ["criar", "editar", "excluir", "ativar", "desativar", "promover", "rebaixar"]).notNull(),
  
  // Entidade afetada
  entidade: mysqlEnum("entidade", ["usuario", "condominio", "vistoria", "manutencao", "ordem_servico", "funcao", "configuracao"]).notNull(),
  entidadeId: int("entidadeId"),
  entidadeNome: varchar("entidadeNome", { length: 255 }),
  
  // Detalhes da alteração (JSON com antes/depois)
  detalhes: text("detalhes"),
  
  // Informações da sessão
  ip: varchar("ip", { length: 45 }),
  userAgent: text("userAgent"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;


// ==================== HISTÓRICO DE ATIVIDADES ====================
// Histórico unificado para todas as funções operacionais e ordens de serviço
export const historicoAtividades = mysqlTable("historico_atividades", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  
  // Tipo de entidade (vistoria, manutencao, ocorrencia, ordem_servico, checklist, antes_depois)
  entidadeTipo: mysqlEnum("entidadeTipo", [
    "vistoria", 
    "manutencao", 
    "ocorrencia", 
    "ordem_servico", 
    "checklist",
    "antes_depois"
  ]).notNull(),
  entidadeId: int("entidadeId").notNull(),
  entidadeProtocolo: varchar("entidadeProtocolo", { length: 50 }),
  entidadeTitulo: varchar("entidadeTitulo", { length: 255 }),
  
  // Tipo de ação realizada
  acao: mysqlEnum("acao", [
    "criado",
    "editado", 
    "status_alterado",
    "comentario_adicionado",
    "imagem_adicionada",
    "imagem_removida",
    "atribuido",
    "prioridade_alterada",
    "agendado",
    "iniciado",
    "pausado",
    "retomado",
    "concluido",
    "reaberto",
    "cancelado",
    "arquivado",
    "enviado",
    "compartilhado"
  ]).notNull(),
  
  // Detalhes da alteração
  descricao: text("descricao"),
  valorAnterior: text("valorAnterior"),
  valorNovo: text("valorNovo"),
  
  // Quem realizou a ação
  usuarioId: int("usuarioId").references(() => users.id),
  usuarioNome: varchar("usuarioNome", { length: 255 }),
  
  // Metadados adicionais (JSON)
  metadados: text("metadados"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricoAtividade = typeof historicoAtividades.$inferSelect;
export type InsertHistoricoAtividade = typeof historicoAtividades.$inferInsert;


// ==================== COMPARTILHAMENTOS COM EQUIPE ====================
// Regista compartilhamentos de itens com membros da equipe
export const compartilhamentosEquipe = mysqlTable("compartilhamentos_equipe", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  
  // Quem compartilhou
  remetenteId: int("remetenteId").references(() => users.id),
  remetenteNome: varchar("remetenteNome", { length: 255 }),
  
  // Destinatário (membro da equipe)
  destinatarioId: int("destinatarioId").references(() => membrosEquipe.id).notNull(),
  destinatarioNome: varchar("destinatarioNome", { length: 255 }),
  destinatarioEmail: varchar("destinatarioEmail", { length: 320 }),
  destinatarioTelefone: varchar("destinatarioTelefone", { length: 20 }),
  
  // Item compartilhado
  tipoItem: mysqlEnum("tipoItem", ["vistoria", "manutencao", "ocorrencia", "checklist", "antes_depois", "ordem_servico", "tarefa_simples"]).notNull(),
  itemId: int("itemId").notNull(),
  itemProtocolo: varchar("itemProtocolo", { length: 50 }),
  itemTitulo: varchar("itemTitulo", { length: 255 }),
  
  // Token único para acesso
  token: varchar("token", { length: 64 }).notNull().unique(),
  
  // Canal de envio
  canalEnvio: mysqlEnum("canalEnvio", ["email", "whatsapp", "ambos"]).default("email"),
  
  // Status
  emailEnviado: boolean("emailEnviado").default(false),
  whatsappEnviado: boolean("whatsappEnviado").default(false),
  
  // Mensagem personalizada
  mensagem: text("mensagem"),
  
  // Validade
  expiraEm: timestamp("expiraEm"),
  ativo: boolean("ativo").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompartilhamentoEquipe = typeof compartilhamentosEquipe.$inferSelect;
export type InsertCompartilhamentoEquipe = typeof compartilhamentosEquipe.$inferInsert;

// ==================== VISUALIZAÇÕES DE COMPARTILHAMENTOS ====================
// Regista quando um destinatário visualiza o item compartilhado
export const compartilhamentoVisualizacoes = mysqlTable("compartilhamento_visualizacoes", {
  id: int("id").autoincrement().primaryKey(),
  compartilhamentoId: int("compartilhamentoId").references(() => compartilhamentosEquipe.id).notNull(),
  
  // Data/hora da visualização
  dataVisualizacao: timestamp("dataVisualizacao").defaultNow().notNull(),
  
  // Informações do dispositivo
  ip: varchar("ip", { length: 45 }), // Suporta IPv6
  userAgent: text("userAgent"),
  dispositivo: varchar("dispositivo", { length: 100 }),
  navegador: varchar("navegador", { length: 100 }),
  sistemaOperacional: varchar("sistemaOperacional", { length: 100 }),
  
  // Duração da visualização (em segundos)
  duracaoSegundos: int("duracaoSegundos"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompartilhamentoVisualizacao = typeof compartilhamentoVisualizacoes.$inferSelect;
export type InsertCompartilhamentoVisualizacao = typeof compartilhamentoVisualizacoes.$inferInsert;

// ==================== NOTIFICAÇÕES DE VISUALIZAÇÃO ====================
// Notificações enviadas ao remetente quando o destinatário visualiza
export const notificacoesVisualizacao = mysqlTable("notificacoes_visualizacao", {
  id: int("id").autoincrement().primaryKey(),
  compartilhamentoId: int("compartilhamentoId").references(() => compartilhamentosEquipe.id).notNull(),
  visualizacaoId: int("visualizacaoId").references(() => compartilhamentoVisualizacoes.id).notNull(),
  
  // Destinatário da notificação (remetente original)
  usuarioId: int("usuarioId").references(() => users.id).notNull(),
  
  // Status
  lida: boolean("lida").default(false),
  lidaEm: timestamp("lidaEm"),
  
  // Email de notificação
  emailEnviado: boolean("emailEnviado").default(false),
  emailEnviadoEm: timestamp("emailEnviadoEm"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NotificacaoVisualizacao = typeof notificacoesVisualizacao.$inferSelect;
export type InsertNotificacaoVisualizacao = typeof notificacoesVisualizacao.$inferInsert;


// ==================== TIMELINE - CONFIGURAÇÕES ====================

// Responsáveis da Timeline
export const timelineResponsaveis = mysqlTable("timeline_responsaveis", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  cargo: varchar("cargo", { length: 255 }),
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineResponsavel = typeof timelineResponsaveis.$inferSelect;
export type InsertTimelineResponsavel = typeof timelineResponsaveis.$inferInsert;

// Locais/Itens da Timeline
export const timelineLocais = mysqlTable("timeline_locais", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineLocal = typeof timelineLocais.$inferSelect;
export type InsertTimelineLocal = typeof timelineLocais.$inferInsert;

// Status da Timeline
export const timelineStatus = mysqlTable("timeline_status", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cor: varchar("cor", { length: 20 }).default("#6B7280"),
  icone: varchar("icone", { length: 50 }).default("Circle"),
  ordem: int("ordem").default(0),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineStatusConfig = typeof timelineStatus.$inferSelect;
export type InsertTimelineStatusConfig = typeof timelineStatus.$inferInsert;

// Prioridades da Timeline
export const timelinePrioridades = mysqlTable("timeline_prioridades", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  cor: varchar("cor", { length: 20 }).default("#6B7280"),
  icone: varchar("icone", { length: 50 }).default("Minus"),
  nivel: int("nivel").default(0),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelinePrioridade = typeof timelinePrioridades.$inferSelect;
export type InsertTimelinePrioridade = typeof timelinePrioridades.$inferInsert;

// Títulos predefinidos da Timeline
export const timelineTitulos = mysqlTable("timeline_titulos", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricaoPadrao: text("descricaoPadrao"),
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineTitulo = typeof timelineTitulos.$inferSelect;
export type InsertTimelineTitulo = typeof timelineTitulos.$inferInsert;

// ==================== TIMELINE - REGISTOS PRINCIPAIS ====================

export const timelines = mysqlTable("timelines", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  protocolo: varchar("protocolo", { length: 50 }).notNull(),
  
  // Campos obrigatórios
  responsavelId: int("responsavelId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  
  // Campos opcionais
  localId: int("localId"),
  statusId: int("statusId"),
  prioridadeId: int("prioridadeId"),
  tituloPredefId: int("tituloPredefId"),
  descricao: text("descricao"),
  
  // Registo automático
  dataRegistro: timestamp("dataRegistro").defaultNow().notNull(),
  horaRegistro: varchar("horaRegistro", { length: 10 }),
  localizacaoGps: varchar("localizacaoGps", { length: 100 }),
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  
  // Estado do registo
  estado: mysqlEnum("estado", ["rascunho", "enviado", "registado"]).default("rascunho"),
  
  // Categorização do andamento
  categorizacao: mysqlEnum("categorizacao", ["recebido", "encaminhado", "em_analise", "em_execucao", "aguardando_resposta", "finalizado", "reaberto"]).default("recebido"),
  
  // Token para link público
  tokenPublico: varchar("tokenPublico", { length: 64 }).unique(),
  
  // Permissão padrão para quem acessa via link público
  permissaoPublica: mysqlEnum("permissaoPublica", ["visualizar", "adicionar", "editar"]).default("visualizar"),
  
  // Membros da equipe associados a esta timeline (JSON array)
  membrosAssociados: text("membrosAssociados"),
  
  // Metadados
  criadoPor: int("criadoPor"),
  criadoPorNome: varchar("criadoPorNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Timeline = typeof timelines.$inferSelect;
export type InsertTimeline = typeof timelines.$inferInsert;

// ==================== TIMELINE - IMAGENS ====================

export const timelineImagens = mysqlTable("timeline_imagens", {
  id: int("id").autoincrement().primaryKey(),
  timelineId: int("timelineId").notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineImagem = typeof timelineImagens.$inferSelect;
export type InsertTimelineImagem = typeof timelineImagens.$inferInsert;

// ==================== TIMELINE - EVENTOS/HISTÓRICO ====================

export const timelineEventos = mysqlTable("timeline_eventos", {
  id: int("id").autoincrement().primaryKey(),
  timelineId: int("timelineId").notNull(),
  tipo: mysqlEnum("tipo", ["criacao", "edicao", "status", "comentario", "imagem", "compartilhamento", "visualizacao", "pdf", "registro", "categorizacao", "chat"]).default("comentario"),
  descricao: text("descricao"),
  usuarioId: int("usuarioId"),
  usuarioNome: varchar("usuarioNome", { length: 255 }),
  dadosAnteriores: text("dadosAnteriores"),
  dadosNovos: text("dadosNovos"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineEvento = typeof timelineEventos.$inferSelect;
export type InsertTimelineEvento = typeof timelineEventos.$inferInsert;

// ==================== TIMELINE - COMPARTILHAMENTOS ====================

export const timelineCompartilhamentos = mysqlTable("timeline_compartilhamentos", {
  id: int("id").autoincrement().primaryKey(),
  timelineId: int("timelineId").notNull(),
  membroEquipeId: int("membroEquipeId"),
  membroNome: varchar("membroNome", { length: 255 }),
  membroEmail: varchar("membroEmail", { length: 320 }),
  membroTelefone: varchar("membroTelefone", { length: 20 }),
  canalEnvio: mysqlEnum("canalEnvio", ["email", "whatsapp", "ambos"]).default("email"),
  permissao: mysqlEnum("permissao", ["visualizar", "adicionar", "editar"]).default("visualizar"),
  visualizado: boolean("visualizado").default(false),
  dataVisualizacao: timestamp("dataVisualizacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineCompartilhamento = typeof timelineCompartilhamentos.$inferSelect;
export type InsertTimelineCompartilhamento = typeof timelineCompartilhamentos.$inferInsert;

// ==================== TIMELINE - CHAT ====================

export const timelineChat = mysqlTable("timeline_chat", {
  id: int("id").autoincrement().primaryKey(),
  timelineId: int("timelineId").notNull(),
  autorNome: varchar("autorNome", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  categorizacaoNoMomento: varchar("categorizacaoNoMomento", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineChat = typeof timelineChat.$inferSelect;
export type InsertTimelineChat = typeof timelineChat.$inferInsert;

// ==================== TIMELINE - CONFIGURAÇÕES DE NOTIFICAÇÕES ====================

export const timelineNotificacoesConfig = mysqlTable("timeline_notificacoes_config", {
  id: int("id").autoincrement().primaryKey(),
  timelineId: int("timelineId").notNull(),
  // Destinatários
  notificarResponsavel: boolean("notificarResponsavel").default(true),
  notificarCriador: boolean("notificarCriador").default(true),
  emailsAdicionais: text("emailsAdicionais"), // JSON array de emails
  // Eventos que disparam notificação
  notificarMudancaStatus: boolean("notificarMudancaStatus").default(true),
  notificarAtualizacao: boolean("notificarAtualizacao").default(true),
  notificarNovaImagem: boolean("notificarNovaImagem").default(false),
  notificarComentario: boolean("notificarComentario").default(true),
  notificarCompartilhamento: boolean("notificarCompartilhamento").default(false),
  // Configurações
  ativo: boolean("ativo").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimelineNotificacoesConfig = typeof timelineNotificacoesConfig.$inferSelect;
export type InsertTimelineNotificacoesConfig = typeof timelineNotificacoesConfig.$inferInsert;

// ==================== TIMELINE - HISTÓRICO DE NOTIFICAÇÕES ====================

export const timelineNotificacoesHistorico = mysqlTable("timeline_notificacoes_historico", {
  id: int("id").autoincrement().primaryKey(),
  timelineId: int("timelineId").notNull(),
  tipoEvento: mysqlEnum("tipoEvento", [
    "mudanca_status",
    "atualizacao",
    "nova_imagem",
    "comentario",
    "compartilhamento",
    "criacao",
    "finalizacao"
  ]).notNull(),
  statusAnterior: varchar("statusAnterior", { length: 100 }),
  statusNovo: varchar("statusNovo", { length: 100 }),
  descricaoEvento: text("descricaoEvento"),
  // Destinatários
  emailsEnviados: text("emailsEnviados"), // JSON array de emails
  totalEnviados: int("totalEnviados").default(0),
  // Status do envio
  enviado: boolean("enviado").default(false),
  erroEnvio: text("erroEnvio"),
  // Quem disparou
  usuarioId: int("usuarioId"),
  usuarioNome: varchar("usuarioNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TimelineNotificacoesHistorico = typeof timelineNotificacoesHistorico.$inferSelect;
export type InsertTimelineNotificacoesHistorico = typeof timelineNotificacoesHistorico.$inferInsert;

// ==================== ANEXOS DE ORDENS DE SERVIÇO ====================
export const osAnexos = mysqlTable("os_anexos", {
  id: int("id").autoincrement().primaryKey(),
  ordemServicoId: int("ordemServicoId").references(() => ordensServico.id).notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  nomeOriginal: varchar("nomeOriginal", { length: 255 }).notNull(),
  url: text("url").notNull(),
  tipo: mysqlEnum("tipo", ["pdf", "imagem", "documento", "outro"]).default("outro").notNull(),
  mimeType: varchar("mimeType", { length: 100 }),
  tamanho: int("tamanho"), // em bytes
  descricao: text("descricao"),
  uploadPor: int("uploadPor").references(() => users.id),
  uploadPorNome: varchar("uploadPorNome", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OsAnexo = typeof osAnexos.$inferSelect;
export type InsertOsAnexo = typeof osAnexos.$inferInsert;

// ==================== PREFERÊNCIAS DE LAYOUT ====================
export const preferenciasLayout = mysqlTable("preferencias_layout", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull().unique(),
  
  // Tema de cores
  tema: mysqlEnum("tema", ["laranja", "azul", "verde", "roxo", "vermelho", "marrom", "cinza"]).default("laranja").notNull(),
  
  // Tipo de layout
  layout: mysqlEnum("layout", ["classico", "compacto", "moderno"]).default("classico").notNull(),
  
  // Modo escuro/claro
  modoEscuro: boolean("modoEscuro").default(false),
  
  // Tamanho da fonte
  tamanhoFonte: mysqlEnum("tamanhoFonte", ["pequeno", "medio", "grande"]).default("medio"),
  
  // Sidebar expandida ou recolhida por padrão
  sidebarExpandida: boolean("sidebarExpandida").default(true),
  
  // Tema personalizado (se definido, sobrescreve o tema padrão)
  temaPersonalizadoId: int("temaPersonalizadoId"),
  usarTemaPersonalizado: boolean("usarTemaPersonalizado").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PreferenciaLayout = typeof preferenciasLayout.$inferSelect;
export type InsertPreferenciaLayout = typeof preferenciasLayout.$inferInsert;

// ==================== HISTÓRICO DE TEMAS ====================
export const historicoTemas = mysqlTable("historico_temas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  
  // Configurações do tema no momento da alteração
  tema: varchar("tema", { length: 50 }).notNull(),
  layout: varchar("layout", { length: 50 }).notNull(),
  modoEscuro: boolean("modoEscuro").default(false),
  tamanhoFonte: varchar("tamanhoFonte", { length: 20 }).default("medio"),
  
  // Metadados
  descricao: varchar("descricao", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HistoricoTema = typeof historicoTemas.$inferSelect;
export type InsertHistoricoTema = typeof historicoTemas.$inferInsert;

// ==================== TEMAS PERSONALIZADOS ====================
export const temasPersonalizados = mysqlTable("temas_personalizados", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  
  // Identificador único do tema
  slug: varchar("slug", { length: 50 }).notNull(),
  nome: varchar("nome", { length: 100 }).notNull(),
  
  // Cores personalizadas
  corPrimaria: varchar("corPrimaria", { length: 20 }).notNull(),
  corSecundaria: varchar("corSecundaria", { length: 20 }),
  corFundo: varchar("corFundo", { length: 20 }),
  corTexto: varchar("corTexto", { length: 20 }),
  corAcento: varchar("corAcento", { length: 20 }),
  
  // Configurações adicionais
  modoEscuro: boolean("modoEscuro").default(false),
  
  // Status
  ativo: boolean("ativo").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TemaPersonalizado = typeof temasPersonalizados.$inferSelect;
export type InsertTemaPersonalizado = typeof temasPersonalizados.$inferInsert;

// ==================== LEITURA DE MEDIDORES ====================
export const leituraMedidores = mysqlTable("leitura_medidores", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipoMedidor: mysqlEnum("tipoMedidor", ["agua", "gas", "energia", "outro"]).default("energia"),
  identificacaoMedidor: varchar("identificacaoMedidor", { length: 100 }),
  leituraAtual: decimal("leituraAtual", { precision: 15, scale: 3 }),
  leituraAnterior: decimal("leituraAnterior", { precision: 15, scale: 3 }),
  consumo: decimal("consumo", { precision: 15, scale: 3 }),
  unidadeMedida: varchar("unidadeMedida", { length: 20 }).default("kWh"),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  enderecoGeo: text("enderecoGeo"),
  dataLeitura: timestamp("dataLeitura"),
  proximaLeitura: timestamp("proximaLeitura"),
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["pendente", "realizada", "conferida", "finalizada"]).default("pendente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LeituraMedidor = typeof leituraMedidores.$inferSelect;
export type InsertLeituraMedidor = typeof leituraMedidores.$inferInsert;

// ==================== IMAGENS DE LEITURA DE MEDIDORES ====================
export const leituraMedidorImagens = mysqlTable("leitura_medidor_imagens", {
  id: int("id").autoincrement().primaryKey(),
  leituraMedidorId: int("leituraMedidorId").references(() => leituraMedidores.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeituraMedidorImagem = typeof leituraMedidorImagens.$inferSelect;
export type InsertLeituraMedidorImagem = typeof leituraMedidorImagens.$inferInsert;

// ==================== CONTROLE DE PRAGAS ====================
export const controlePragas = mysqlTable("controle_pragas", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipoServico: mysqlEnum("tipoServico", ["dedetizacao", "desratizacao", "descupinizacao", "desinfeccao", "outro"]).default("dedetizacao"),
  tipoPraga: varchar("tipoPraga", { length: 100 }),
  produtosUtilizados: text("produtosUtilizados"),
  empresaFornecedor: varchar("empresaFornecedor", { length: 255 }),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  enderecoGeo: text("enderecoGeo"),
  dataAplicacao: timestamp("dataAplicacao"),
  proximaAplicacao: timestamp("proximaAplicacao"),
  garantiaDias: int("garantiaDias"),
  custo: decimal("custo", { precision: 10, scale: 2 }),
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["agendada", "em_andamento", "realizada", "finalizada", "cancelada"]).default("agendada").notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ControlePraga = typeof controlePragas.$inferSelect;
export type InsertControlePraga = typeof controlePragas.$inferInsert;

// ==================== IMAGENS DE CONTROLE DE PRAGAS ====================
export const controlePragaImagens = mysqlTable("controle_praga_imagens", {
  id: int("id").autoincrement().primaryKey(),
  controlePragaId: int("controlePragaId").references(() => controlePragas.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ControlePragaImagem = typeof controlePragaImagens.$inferSelect;
export type InsertControlePragaImagem = typeof controlePragaImagens.$inferInsert;

// ==================== JARDINAGEM ====================
export const jardinagem = mysqlTable("jardinagem", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  protocolo: varchar("protocolo", { length: 20 }).notNull().unique(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao"),
  tipoServico: mysqlEnum("tipoServico", ["poda", "plantio", "adubacao", "irrigacao", "limpeza", "paisagismo", "outro"]).default("poda"),
  plantasEspecies: text("plantasEspecies"),
  produtosUtilizados: text("produtosUtilizados"),
  areaMetrosQuadrados: decimal("areaMetrosQuadrados", { precision: 10, scale: 2 }),
  localizacao: varchar("localizacao", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  enderecoGeo: text("enderecoGeo"),
  dataRealizacao: timestamp("dataRealizacao"),
  proximaRealizacao: timestamp("proximaRealizacao"),
  recorrencia: mysqlEnum("recorrencia", ["unica", "semanal", "quinzenal", "mensal", "bimestral", "trimestral"]).default("unica"),
  custo: decimal("custo", { precision: 10, scale: 2 }),
  responsavelNome: varchar("responsavelNome", { length: 255 }),
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["agendada", "em_andamento", "realizada", "finalizada", "cancelada"]).default("agendada").notNull(),
  prioridade: mysqlEnum("prioridade", ["baixa", "media", "alta", "urgente"]).default("media"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Jardinagem = typeof jardinagem.$inferSelect;
export type InsertJardinagem = typeof jardinagem.$inferInsert;

// ==================== IMAGENS DE JARDINAGEM ====================
export const jardinagemImagens = mysqlTable("jardinagem_imagens", {
  id: int("id").autoincrement().primaryKey(),
  jardinagemId: int("jardinagemId").references(() => jardinagem.id).notNull(),
  url: text("url").notNull(),
  legenda: varchar("legenda", { length: 255 }),
  ordem: int("ordem").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JardinagemImagem = typeof jardinagemImagens.$inferSelect;
export type InsertJardinagemImagem = typeof jardinagemImagens.$inferInsert;

// ==================== CONFIGURAÇÕES FINANCEIRAS (ADMIN) ====================
export const configuracoesFinanceiras = mysqlTable("configuracoes_financeiras", {
  id: int("id").autoincrement().primaryKey(),
  
  // PIX
  pixAtivo: boolean("pixAtivo").default(false),
  pixTipoChave: mysqlEnum("pixTipoChave", ["cpf", "cnpj", "email", "telefone", "aleatoria"]),
  pixChave: varchar("pixChave", { length: 255 }),
  pixNomeBeneficiario: varchar("pixNomeBeneficiario", { length: 255 }),
  pixCidade: varchar("pixCidade", { length: 100 }),
  pixQrCodeUrl: text("pixQrCodeUrl"),
  
  // Boleto
  boletoAtivo: boolean("boletoAtivo").default(false),
  boletoInstrucoes: text("boletoInstrucoes"),
  boletoLinkPadrao: text("boletoLinkPadrao"),
  
  // Cartão de Crédito
  cartaoAtivo: boolean("cartaoAtivo").default(false),
  cartaoLinkPagamento: text("cartaoLinkPagamento"),
  cartaoDescricao: text("cartaoDescricao"),
  
  // Nota Fiscal
  notaFiscalAtivo: boolean("notaFiscalAtivo").default(false),
  notaFiscalInstrucoes: text("notaFiscalInstrucoes"),
  notaFiscalEmail: varchar("notaFiscalEmail", { length: 320 }),
  
  // Informações gerais (valor padrão quando não há faixa específica)
  valorMensalidade: decimal("valorMensalidade", { precision: 10, scale: 2 }),
  diaVencimento: int("diaVencimento").default(10),
  observacoes: text("observacoes"),
  
  // Notificações
  emailNotificacaoCadastro: varchar("emailNotificacaoCadastro", { length: 320 }),
  notificarNovoCadastro: boolean("notificarNovoCadastro").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConfiguracaoFinanceira = typeof configuracoesFinanceiras.$inferSelect;
export type InsertConfiguracaoFinanceira = typeof configuracoesFinanceiras.$inferInsert;

// ==================== FAIXAS DE PREÇO (BASEADO EM USUÁRIOS) ====================
export const faixasPreco = mysqlTable("faixas_preco", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull(), // Ex: "Plano Básico", "Plano Profissional"
  usuariosMin: int("usuariosMin").notNull(), // Quantidade mínima de usuários
  usuariosMax: int("usuariosMax"), // Quantidade máxima (null = ilimitado)
  valorMensal: decimal("valorMensal", { precision: 10, scale: 2 }).notNull(),
  descricao: text("descricao"), // Descrição do plano
  ativo: boolean("ativo").default(true),
  ordem: int("ordem").default(0), // Para ordenação na exibição
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FaixaPreco = typeof faixasPreco.$inferSelect;
export type InsertFaixaPreco = typeof faixasPreco.$inferInsert;

// ==================== CONFIGURAÇÃO DE CAMPOS POR FUNÇÃO ====================
// Permite ao usuário habilitar/desabilitar campos específicos em cada tipo de função
export const userFieldSettings = mysqlTable("user_field_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  // Tipo: rapida ou completa
  modalType: mysqlEnum("modalType", ["rapida", "completa"]).notNull(),
  // Função: funções operacionais e financeiras
  functionType: mysqlEnum("functionType", [
    // Operacionais existentes
    "vistoria", "manutencao", "ocorrencia", "checklist", "antes_depois", "timeline",
    // Novas operacionais
    "inventario", "leitura_medidores", "inspecao_seguranca", "controle_pragas",
    "limpeza", "jardinagem",
    // Financeiras
    "orcamentos", "ordem_compra", "contratos",
    // Extras
    "vencimentos", "ordem_servico"
  ]).notNull(),
  // Configuração dos campos como JSON: { "titulo": true, "descricao": true, "local": false, "gps": false, ... }
  fieldsConfig: json("fieldsConfig").$type<Record<string, boolean>>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserFieldSettings = typeof userFieldSettings.$inferSelect;
export type InsertUserFieldSettings = typeof userFieldSettings.$inferInsert;

// ==================== MODELOS DE CHECKLIST ====================
// Permite salvar checklists como modelos/templates para reutilização
export const checklistModelos = mysqlTable("checklist_modelos", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  userId: int("userId").references(() => users.id),
  
  // Nome do modelo
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  
  // Itens do checklist (JSON array - apenas os títulos dos itens)
  itens: json("itens").$type<{ id: string; titulo: string }[]>().notNull(),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChecklistModelo = typeof checklistModelos.$inferSelect;
export type InsertChecklistModelo = typeof checklistModelos.$inferInsert;

// ==================== FUNÇÕES PERSONALIZADAS ====================
// Permite ao usuário criar funções customizadas com campos selecionáveis
export const funcoesPersonalizadas = mysqlTable("funcoes_personalizadas", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  userId: int("userId").references(() => users.id),
  
  // Identificação da função
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  icone: varchar("icone", { length: 100 }).notNull().default("ClipboardList"),
  cor: varchar("cor", { length: 50 }).notNull().default("#3B82F6"),
  
  // Campos ativos e obrigatórios (JSON)
  // Ex: { "titulo": true, "descricao": true, "local": true, "imagens": true, ... }
  camposAtivos: json("camposAtivos").$type<Record<string, boolean>>().notNull(),
  // Ex: { "titulo": true, "descricao": false, "local": false, ... }
  camposObrigatorios: json("camposObrigatorios").$type<Record<string, boolean>>().notNull(),
  
  // Controle
  ativo: boolean("ativo").default(true),
  ordem: int("ordem").default(0),
  
  // Token público para compartilhamento (QR Code)
  shareToken: varchar("shareToken", { length: 64 }),
  
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FuncaoPersonalizada = typeof funcoesPersonalizadas.$inferSelect;
export type InsertFuncaoPersonalizada = typeof funcoesPersonalizadas.$inferInsert;

// ========== REGISTROS PERSONALIZADOS ==========
export const registrosPersonalizados = mysqlTable("registros_personalizados", {
  id: int("id").autoincrement().primaryKey(),
  funcaoId: int("funcaoId").references(() => funcoesPersonalizadas.id, { onDelete: "cascade" }).notNull(),
  condominioId: int("condominioId").references(() => condominios.id).notNull(),
  userId: int("userId").references(() => users.id),
  
  protocolo: varchar("protocolo", { length: 50 }),
  dados: json("dados").$type<Record<string, any>>().notNull(),
  imagens: json("imagens").$type<{ url: string; legenda: string }[]>(),
  checklistItems: json("checklistItems").$type<{ texto: string; checked: boolean }[]>(),
  assinaturas: json("assinaturas").$type<Record<string, string>>(),
  
  status: varchar("status", { length: 50 }).default("aberto"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RegistroPersonalizado = typeof registrosPersonalizados.$inferSelect;
export type InsertRegistroPersonalizado = typeof registrosPersonalizados.$inferInsert;

// ==================== PERMISSÕES DE MÓDULOS POR FUNCIONÁRIO ====================
export const funcionarioPermissoes = mysqlTable("funcionario_permissoes", {
  id: int("id").autoincrement().primaryKey(),
  funcionarioId: int("funcionarioId").references(() => funcionarios.id, { onDelete: "cascade" }).notNull(),
  modulo: varchar("modulo", { length: 50 }).notNull(), // 'funcionarios','equipe','manutencao','qrcode','documentos','agenda','localizacao','vistoria','timeline'
  habilitado: boolean("habilitado").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FuncionarioPermissao = typeof funcionarioPermissoes.$inferSelect;
export type InsertFuncionarioPermissao = typeof funcionarioPermissoes.$inferInsert;

// ==================== TEMPLATES POR SEGMENTO (INFRAESTRUTURA PREPARADA) ====================
export const templatesCategorias = mysqlTable("templates_categorias", {
  id: int("id").autoincrement().primaryKey(),
  segmento: varchar("segmento", { length: 100 }).notNull(), // 'academia','condominio','oficina_mecanica','eletricista', etc.
  tipo: varchar("tipo", { length: 50 }).notNull(),           // 'manutencao','vistoria','checklist'
  nome: varchar("nome", { length: 255 }).notNull(),
  campos: json("campos").$type<Record<string, any>>(),
  ativo: boolean("ativo").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TemplateCategoria = typeof templatesCategorias.$inferSelect;
export type InsertTemplateCategoria = typeof templatesCategorias.$inferInsert;
