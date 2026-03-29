import { z } from "zod";
import { router, protectedProcedure } from "../../_core/trpc";
import { getDb } from "../../db";
import { eq, and, gte, lte, desc, inArray, sql, asc } from "drizzle-orm";
import {
  condominios,
  manutencoes,
  manutencaoImagens,
  manutencaoTimeline,
  ocorrencias,
  ocorrenciaImagens,
  ocorrenciaTimeline,
  vistorias,
  vistoriaImagens,
  vistoriaTimeline,
  checklists,
  checklistItens,
  checklistImagens,
  checklistTimeline,
  revistas,
  antesDepois,
  eventos,
  avisos,
  comunicados,
  votacoes,
  opcoesVotacao,
  votos,
  moradores,
  funcionarios,
  realizacoes,
  imagensRealizacoes,
  melhorias,
  imagensMelhorias,
  aquisicoes,
  imagensAquisicoes,
  classificados,
  achadosPerdidos,
  imagensAchadosPerdidos,
  caronas,
  vagasEstacionamento,
  albuns,
  destaques,
  imagensDestaques,
  vencimentos,
  mensagensSindico
} from "../../../drizzle/schema";

export const relatorioConsolidadoRouter = router({
    gerar: protectedProcedure
      .input(z.object({
        condominioId: z.number(),
        secoes: z.array(z.string()),
        dataInicio: z.string(),
        dataFim: z.string(),
        incluirGraficos: z.boolean().optional(),
        incluirEstatisticas: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const dataInicio = new Date(input.dataInicio);
        const dataFim = new Date(input.dataFim);
        dataFim.setHours(23, 59, 59, 999);

        // Buscar dados do condomÃ­nio
        const [condominio] = await db.select().from(condominios)
          .where(eq(condominios.id, input.condominioId));

        const resultado: any = {
          condominio: condominio || null,
          periodo: { inicio: input.dataInicio, fim: input.dataFim },
          secoes: {},
          totais: {},
          geradoEm: new Date().toISOString(),
        };

        // Buscar dados de cada secÃ§Ã£o selecionada
        for (const secao of input.secoes) {
          switch (secao) {
            case "manutencoes":
              const listaManutencoes = await db.select().from(manutencoes)
                .where(and(
                  eq(manutencoes.condominioId, input.condominioId),
                  gte(manutencoes.createdAt, dataInicio),
                  lte(manutencoes.createdAt, dataFim)
                ))
                .orderBy(desc(manutencoes.createdAt));
              
              // Buscar imagens de cada manutenÃ§Ã£o
              const manutencoesComImagens = await Promise.all(
                listaManutencoes.map(async (m) => {
                  const imgs = await db.select().from(manutencaoImagens)
                    .where(eq(manutencaoImagens.manutencaoId, m.id));
                  const timeline = await db.select().from(manutencaoTimeline)
                    .where(eq(manutencaoTimeline.manutencaoId, m.id))
                    .orderBy(desc(manutencaoTimeline.createdAt));
                  return { ...m, imagens: imgs, timeline };
                })
              );
              resultado.secoes.manutencoes = manutencoesComImagens;
              resultado.totais.manutencoes = listaManutencoes.length;
              break;

            case "ocorrencias":
              const listaOcorrencias = await db.select().from(ocorrencias)
                .where(and(
                  eq(ocorrencias.condominioId, input.condominioId),
                  gte(ocorrencias.createdAt, dataInicio),
                  lte(ocorrencias.createdAt, dataFim)
                ))
                .orderBy(desc(ocorrencias.createdAt));
              
              const ocorrenciasComImagens = await Promise.all(
                listaOcorrencias.map(async (o) => {
                  const imgs = await db.select().from(ocorrenciaImagens)
                    .where(eq(ocorrenciaImagens.ocorrenciaId, o.id));
                  const timeline = await db.select().from(ocorrenciaTimeline)
                    .where(eq(ocorrenciaTimeline.ocorrenciaId, o.id))
                    .orderBy(desc(ocorrenciaTimeline.createdAt));
                  return { ...o, imagens: imgs, timeline };
                })
              );
              resultado.secoes.ocorrencias = ocorrenciasComImagens;
              resultado.totais.ocorrencias = listaOcorrencias.length;
              break;

            case "vistorias":
              const listaVistorias = await db.select().from(vistorias)
                .where(and(
                  eq(vistorias.condominioId, input.condominioId),
                  gte(vistorias.createdAt, dataInicio),
                  lte(vistorias.createdAt, dataFim)
                ))
                .orderBy(desc(vistorias.createdAt));
              
              const vistoriasComImagens = await Promise.all(
                listaVistorias.map(async (v) => {
                  const imgs = await db.select().from(vistoriaImagens)
                    .where(eq(vistoriaImagens.vistoriaId, v.id));
                  const timeline = await db.select().from(vistoriaTimeline)
                    .where(eq(vistoriaTimeline.vistoriaId, v.id))
                    .orderBy(desc(vistoriaTimeline.createdAt));
                  return { ...v, imagens: imgs, timeline };
                })
              );
              resultado.secoes.vistorias = vistoriasComImagens;
              resultado.totais.vistorias = listaVistorias.length;
              break;

            case "checklists":
              const listaChecklists = await db.select().from(checklists)
                .where(and(
                  eq(checklists.condominioId, input.condominioId),
                  gte(checklists.createdAt, dataInicio),
                  lte(checklists.createdAt, dataFim)
                ))
                .orderBy(desc(checklists.createdAt));
              
              const checklistsComItens = await Promise.all(
                listaChecklists.map(async (c) => {
                  const itens = await db.select().from(checklistItens)
                    .where(eq(checklistItens.checklistId, c.id));
                  const imgs = await db.select().from(checklistImagens)
                    .where(eq(checklistImagens.checklistId, c.id));
                  const timeline = await db.select().from(checklistTimeline)
                    .where(eq(checklistTimeline.checklistId, c.id))
                    .orderBy(desc(checklistTimeline.createdAt));
                  return { ...c, itens, imagens: imgs, timeline };
                })
              );
              resultado.secoes.checklists = checklistsComItens;
              resultado.totais.checklists = listaChecklists.length;
              break;

            case "antesDepois":
              // antesDepois usa revistaId, buscar via revistas do condomÃ­nio
              const revistasParaAntesDepois = await db.select({ id: revistas.id }).from(revistas)
                .where(eq(revistas.condominioId, input.condominioId));
              const revistaIdsAD = revistasParaAntesDepois.map(r => r.id);
              
              let listaAntesDepois: any[] = [];
              if (revistaIdsAD.length > 0) {
                listaAntesDepois = await db.select().from(antesDepois)
                  .where(and(
                    inArray(antesDepois.revistaId, revistaIdsAD),
                    gte(antesDepois.createdAt, dataInicio),
                    lte(antesDepois.createdAt, dataFim)
                  ))
                  .orderBy(desc(antesDepois.createdAt));
              }
              resultado.secoes.antesDepois = listaAntesDepois;
              resultado.totais.antesDepois = listaAntesDepois.length;
              break;

            case "eventos":
              // eventos usa revistaId
              const revistasParaEventos = await db.select({ id: revistas.id }).from(revistas)
                .where(eq(revistas.condominioId, input.condominioId));
              const revistaIdsEv = revistasParaEventos.map(r => r.id);
              
              let listaEventos: any[] = [];
              if (revistaIdsEv.length > 0) {
                listaEventos = await db.select().from(eventos)
                  .where(and(
                    inArray(eventos.revistaId, revistaIdsEv),
                    gte(eventos.dataEvento, dataInicio),
                    lte(eventos.dataEvento, dataFim)
                  ))
                  .orderBy(desc(eventos.dataEvento));
              }
              resultado.secoes.eventos = listaEventos;
              resultado.totais.eventos = listaEventos.length;
              break;

            case "avisos":
              // avisos usa revistaId
              const revistasParaAvisos = await db.select({ id: revistas.id }).from(revistas)
                .where(eq(revistas.condominioId, input.condominioId));
              const revistaIdsAv = revistasParaAvisos.map(r => r.id);
              
              let listaAvisos: any[] = [];
              if (revistaIdsAv.length > 0) {
                listaAvisos = await db.select().from(avisos)
                  .where(and(
                    inArray(avisos.revistaId, revistaIdsAv),
                    gte(avisos.createdAt, dataInicio),
                    lte(avisos.createdAt, dataFim)
                  ))
                  .orderBy(desc(avisos.createdAt));
              }
              resultado.secoes.avisos = listaAvisos;
              resultado.totais.avisos = listaAvisos.length;
              break;

            case "comunicados":
              // comunicados usa revistaId
              const revistasParaComunicados = await db.select({ id: revistas.id }).from(revistas)
                .where(eq(revistas.condominioId, input.condominioId));
              const revistaIdsCom = revistasParaComunicados.map(r => r.id);
              
              let listaComunicados: any[] = [];
              if (revistaIdsCom.length > 0) {
                listaComunicados = await db.select().from(comunicados)
                  .where(and(
                    inArray(comunicados.revistaId, revistaIdsCom),
                    gte(comunicados.createdAt, dataInicio),
                    lte(comunicados.createdAt, dataFim)
                  ))
                  .orderBy(desc(comunicados.createdAt));
              }
              resultado.secoes.comunicados = listaComunicados;
              resultado.totais.comunicados = listaComunicados.length;
              break;

            case "votacoes":
              // votacoes usa revistaId
              const revistasParaVotacoes = await db.select({ id: revistas.id }).from(revistas)
                .where(eq(revistas.condominioId, input.condominioId));
              const revistaIdsVot = revistasParaVotacoes.map(r => r.id);
              
              let listaVotacoes: any[] = [];
              if (revistaIdsVot.length > 0) {
                listaVotacoes = await db.select().from(votacoes)
                  .where(and(
                    inArray(votacoes.revistaId, revistaIdsVot),
                    gte(votacoes.createdAt, dataInicio),
                    lte(votacoes.createdAt, dataFim)
                  ))
                  .orderBy(desc(votacoes.createdAt));
              }
              
              const votacoesComOpcoes = await Promise.all(
                listaVotacoes.map(async (v) => {
                  const opcoes = await db.select().from(opcoesVotacao)
                    .where(eq(opcoesVotacao.votacaoId, v.id));
                  const totalVotos = await db.select({ count: sql<number>`count(*)` })
                    .from(votos)
                    .where(eq(votos.votacaoId, v.id));
                  return { ...v, opcoes, totalVotos: totalVotos[0]?.count || 0 };
                })
              );
              resultado.secoes.votacoes = votacoesComOpcoes;
              resultado.totais.votacoes = listaVotacoes.length;
              break;

            case "moradores":
              const listaMoradores = await db.select().from(moradores)
                .where(eq(moradores.condominioId, input.condominioId))
                .orderBy(moradores.nome);
              resultado.secoes.moradores = listaMoradores;
              resultado.totais.moradores = listaMoradores.length;
              break;

            case "funcionarios":
              const listaFuncionarios = await db.select().from(funcionarios)
                .where(eq(funcionarios.condominioId, input.condominioId))
                .orderBy(funcionarios.nome);
              resultado.secoes.funcionarios = listaFuncionarios;
              resultado.totais.funcionarios = listaFuncionarios.length;
              break;

            case "realizacoes":
              // realizacoes usa revistaId
              const revistasParaRealizacoes = await db.select({ id: revistas.id }).from(revistas)
                .where(eq(revistas.condominioId, input.condominioId));
              const revistaIdsReal = revistasParaRealizacoes.map(r => r.id);
              
              let listaRealizacoes: any[] = [];
              if (revistaIdsReal.length > 0) {
                listaRealizacoes = await db.select().from(realizacoes)
                  .where(and(
                    inArray(realizacoes.revistaId, revistaIdsReal),
                    gte(realizacoes.createdAt, dataInicio),
                    lte(realizacoes.createdAt, dataFim)
                  ))
                  .orderBy(desc(realizacoes.createdAt));
              }
              
              const realizacoesComImagens = await Promise.all(
                listaRealizacoes.map(async (r) => {
                  const imgs = await db.select().from(imagensRealizacoes)
                    .where(eq(imagensRealizacoes.realizacaoId, r.id));
                  return { ...r, imagens: imgs };
                })
              );
              resultado.secoes.realizacoes = realizacoesComImagens;
              resultado.totais.realizacoes = listaRealizacoes.length;
              break;

            case "melhorias":
              // melhorias usa revistaId
              const revistasParaMelhorias = await db.select({ id: revistas.id }).from(revistas)
                .where(eq(revistas.condominioId, input.condominioId));
              const revistaIdsMel = revistasParaMelhorias.map(r => r.id);
              
              let listaMelhorias: any[] = [];
              if (revistaIdsMel.length > 0) {
                listaMelhorias = await db.select().from(melhorias)
                  .where(and(
                    inArray(melhorias.revistaId, revistaIdsMel),
                    gte(melhorias.createdAt, dataInicio),
                    lte(melhorias.createdAt, dataFim)
                  ))
                  .orderBy(desc(melhorias.createdAt));
              }
              
              const melhoriasComImagens = await Promise.all(
                listaMelhorias.map(async (m) => {
                  const imgs = await db.select().from(imagensMelhorias)
                    .where(eq(imagensMelhorias.melhoriaId, m.id));
                  return { ...m, imagens: imgs };
                })
              );
              resultado.secoes.melhorias = melhoriasComImagens;
              resultado.totais.melhorias = listaMelhorias.length;
              break;

            case "aquisicoes":
              // aquisicoes usa revistaId
              const revistasParaAquisicoes = await db.select({ id: revistas.id }).from(revistas)
                .where(eq(revistas.condominioId, input.condominioId));
              const revistaIdsAq = revistasParaAquisicoes.map(r => r.id);
              
              let listaAquisicoes: any[] = [];
              if (revistaIdsAq.length > 0) {
                listaAquisicoes = await db.select().from(aquisicoes)
                  .where(and(
                    inArray(aquisicoes.revistaId, revistaIdsAq),
                    gte(aquisicoes.createdAt, dataInicio),
                    lte(aquisicoes.createdAt, dataFim)
                  ))
                  .orderBy(desc(aquisicoes.createdAt));
              }
              
              const aquisicoesComImagens = await Promise.all(
                listaAquisicoes.map(async (a) => {
                  const imgs = await db.select().from(imagensAquisicoes)
                    .where(eq(imagensAquisicoes.aquisicaoId, a.id));
                  return { ...a, imagens: imgs };
                })
              );
              resultado.secoes.aquisicoes = aquisicoesComImagens;
              resultado.totais.aquisicoes = listaAquisicoes.length;
              break;

            case "classificados":
              // classificados usa condominioId e createdAt
              const listaClassificados = await db.select().from(classificados)
                .where(and(
                  eq(classificados.condominioId, input.condominioId),
                  gte(classificados.createdAt, dataInicio),
                  lte(classificados.createdAt, dataFim)
                ))
                .orderBy(desc(classificados.createdAt));
              resultado.secoes.classificados = listaClassificados;
              resultado.totais.classificados = listaClassificados.length;
              break;

            case "achadosPerdidos":
              const listaAchadosPerdidos = await db.select().from(achadosPerdidos)
                .where(and(
                  eq(achadosPerdidos.condominioId, input.condominioId),
                  gte(achadosPerdidos.createdAt, dataInicio),
                  lte(achadosPerdidos.createdAt, dataFim)
                ))
                .orderBy(desc(achadosPerdidos.createdAt));
              
              const achadosComImagens = await Promise.all(
                listaAchadosPerdidos.map(async (a) => {
                  const imgs = await db.select().from(imagensAchadosPerdidos)
                    .where(eq(imagensAchadosPerdidos.achadoPerdidoId, a.id));
                  return { ...a, imagens: imgs };
                })
              );
              resultado.secoes.achadosPerdidos = achadosComImagens;
              resultado.totais.achadosPerdidos = listaAchadosPerdidos.length;
              break;

            case "caronas":
              const listaCaronas = await db.select().from(caronas)
                .where(and(
                  eq(caronas.condominioId, input.condominioId),
                  gte(caronas.createdAt, dataInicio),
                  lte(caronas.createdAt, dataFim)
                ))
                .orderBy(desc(caronas.createdAt));
              resultado.secoes.caronas = listaCaronas;
              resultado.totais.caronas = listaCaronas.length;
              break;

            case "estacionamento":
              const listaVagas = await db.select().from(vagasEstacionamento)
                .where(eq(vagasEstacionamento.condominioId, input.condominioId))
                .orderBy(vagasEstacionamento.numero);
              resultado.secoes.estacionamento = listaVagas;
              resultado.totais.estacionamento = listaVagas.length;
              break;

            case "albuns":
              const listaAlbuns = await db.select().from(albuns)
                .where(and(
                  eq(albuns.condominioId, input.condominioId),
                  gte(albuns.createdAt, dataInicio),
                  lte(albuns.createdAt, dataFim)
                ))
                .orderBy(desc(albuns.createdAt));
              
              const albunsComFotos = await Promise.all(
                listaAlbuns.map(async (a) => {
                  // Aqui precisarÃ­amos das fotos, mas no schema atual nÃ£o vi tabela de fotos ligada a albuns diretamente
                  // Assumindo que pode haver uma tabela fotos ou similar
                  return { ...a, fotos: [] }; 
                })
              );
              resultado.secoes.albuns = albunsComFotos;
              resultado.totais.albuns = listaAlbuns.length;
              break;

            case "destaques":
              const listaDestaques = await db.select().from(destaques)
                .where(and(
                  eq(destaques.condominioId, input.condominioId),
                  gte(destaques.createdAt, dataInicio),
                  lte(destaques.createdAt, dataFim)
                ))
                .orderBy(desc(destaques.createdAt));
              
              const destaquesComImagens = await Promise.all(
                listaDestaques.map(async (d) => {
                  const imgs = await db.select().from(imagensDestaques)
                    .where(eq(imagensDestaques.destaqueId, d.id));
                  return { ...d, imagens: imgs };
                })
              );
              resultado.secoes.destaques = destaquesComImagens;
              resultado.totais.destaques = listaDestaques.length;
              break;

            case "vencimentos":
              const listaVencimentos = await db.select().from(vencimentos)
                .where(and(
                  eq(vencimentos.condominioId, input.condominioId),
                  gte(vencimentos.dataVencimento, dataInicio),
                  lte(vencimentos.dataVencimento, dataFim)
                ))
                .orderBy(vencimentos.dataVencimento);
              resultado.secoes.vencimentos = listaVencimentos;
              resultado.totais.vencimentos = listaVencimentos.length;
              break;

            case "mensagensSindico":
              // Buscar revistas do condomÃ­nio primeiro
              const revistasDoCondominio = await db.select({ id: revistas.id }).from(revistas)
                .where(eq(revistas.condominioId, input.condominioId));
              const revistaIds = revistasDoCondominio.map(r => r.id);
              
              let listaMensagens: any[] = [];
              if (revistaIds.length > 0) {
                listaMensagens = await db.select().from(mensagensSindico)
                  .where(inArray(mensagensSindico.revistaId, revistaIds))
                  .orderBy(desc(mensagensSindico.createdAt));
              }
              resultado.secoes.mensagensSindico = listaMensagens;
              resultado.totais.mensagensSindico = listaMensagens.length;
              break;

            case "condominio":
              resultado.secoes.condominio = condominio;
              resultado.totais.condominio = 1;
              break;
          }
        }

        return resultado;
      }),
  });

