import { z } from "zod";
import { eq, desc, and, gte } from "drizzle-orm";
import { protectedProcedure, router } from "../../_core/trpc";
import { getDb } from "../../db";
import { 
  vistorias, 
  manutencoes, 
  ocorrencias, 
  checklists 
} from "../../../drizzle/schema";

export const painelControloRouter = router({
  // EstatÃ­sticas gerais de todas as secÃ§Ãµes
  getEstatisticasGerais: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
     .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { vistorias: { total: 0, pendentes: 0, realizadas: 0, acaoNecessaria: 0, finalizadas: 0, reabertas: 0 }, manutencoes: { total: 0, pendentes: 0, realizadas: 0, acaoNecessaria: 0, finalizadas: 0, reabertas: 0, porTipo: { preventiva: 0, corretiva: 0, emergencial: 0, programada: 0 } }, ocorrencias: { total: 0, pendentes: 0, realizadas: 0, acaoNecessaria: 0, finalizadas: 0, reabertas: 0, porCategoria: { seguranca: 0, barulho: 0, manutencao: 0, convivencia: 0, animais: 0, estacionamento: 0, limpeza: 0, outros: 0 } }, checklists: { total: 0, pendentes: 0, realizadas: 0, acaoNecessaria: 0, finalizadas: 0, reabertas: 0 } };
      const { condominioId } = input;
      // Vistorias
      const vistoriasData = await db.select().from(vistorias).where(eq(vistorias.condominioId, condominioId));
      const vistoriasStats = {
        total: vistoriasData.length,
        pendentes: vistoriasData.filter(v => v.status === "pendente").length,
        realizadas: vistoriasData.filter(v => v.status === "realizada").length,
        acaoNecessaria: vistoriasData.filter(v => v.status === "acao_necessaria").length,
        finalizadas: vistoriasData.filter(v => v.status === "finalizada").length,
        reabertas: vistoriasData.filter(v => v.status === "reaberta").length,
      };

      // ManutenÃ§Ãµes
      const manutencoesData = await db.select().from(manutencoes).where(eq(manutencoes.condominioId, condominioId));
      const manutencoesStats = {
        total: manutencoesData.length,
        pendentes: manutencoesData.filter(m => m.status === "pendente").length,
        realizadas: manutencoesData.filter(m => m.status === "realizada").length,
        acaoNecessaria: manutencoesData.filter(m => m.status === "acao_necessaria").length,
        finalizadas: manutencoesData.filter(m => m.status === "finalizada").length,
        reabertas: manutencoesData.filter(m => m.status === "reaberta").length,
        porTipo: {
          preventiva: manutencoesData.filter(m => m.tipo === "preventiva").length,
          corretiva: manutencoesData.filter(m => m.tipo === "corretiva").length,
          emergencial: manutencoesData.filter(m => m.tipo === "emergencial").length,
          programada: manutencoesData.filter(m => m.tipo === "programada").length,
        },
      };

      // OcorrÃªncias
      const ocorrenciasData = await db.select().from(ocorrencias).where(eq(ocorrencias.condominioId, condominioId));
      const ocorrenciasStats = {
        total: ocorrenciasData.length,
        pendentes: ocorrenciasData.filter(o => o.status === "pendente").length,
        realizadas: ocorrenciasData.filter(o => o.status === "realizada").length,
        acaoNecessaria: ocorrenciasData.filter(o => o.status === "acao_necessaria").length,
        finalizadas: ocorrenciasData.filter(o => o.status === "finalizada").length,
        reabertas: ocorrenciasData.filter(o => o.status === "reaberta").length,
        porCategoria: {
          seguranca: ocorrenciasData.filter(o => o.categoria === "seguranca").length,
          barulho: ocorrenciasData.filter(o => o.categoria === "barulho").length,
          manutencao: ocorrenciasData.filter(o => o.categoria === "manutencao").length,
          convivencia: ocorrenciasData.filter(o => o.categoria === "convivencia").length,
          animais: ocorrenciasData.filter(o => o.categoria === "animais").length,
          estacionamento: ocorrenciasData.filter(o => o.categoria === "estacionamento").length,
          limpeza: ocorrenciasData.filter(o => o.categoria === "limpeza").length,
          outros: ocorrenciasData.filter(o => o.categoria === "outros").length,
        },
      };

      // Checklists
      const checklistsData = await db.select().from(checklists).where(eq(checklists.condominioId, condominioId));
      const checklistsStats = {
        total: checklistsData.length,
        pendentes: checklistsData.filter(c => c.status === "pendente").length,
        realizadas: checklistsData.filter(c => c.status === "realizada").length,
        acaoNecessaria: checklistsData.filter(c => c.status === "acao_necessaria").length,
        finalizadas: checklistsData.filter(c => c.status === "finalizada").length,
        reabertas: checklistsData.filter(c => c.status === "reaberta").length,
      };

      return {
        vistorias: vistoriasStats,
        manutencoes: manutencoesStats,
        ocorrencias: ocorrenciasStats,
        checklists: checklistsStats,
        totais: {
          total: vistoriasStats.total + manutencoesStats.total + ocorrenciasStats.total + checklistsStats.total,
          pendentes: vistoriasStats.pendentes + manutencoesStats.pendentes + ocorrenciasStats.pendentes + checklistsStats.pendentes,
          finalizadas: vistoriasStats.finalizadas + manutencoesStats.finalizadas + ocorrenciasStats.finalizadas + checklistsStats.finalizadas,
        },
      };
    }),

  // EvoluÃ§Ã£o temporal (itens criados por dia nos Ãºltimos 30 dias)
  getEvolucaoTemporal: protectedProcedure
    .input(z.object({ condominioId: z.number(), dias: z.number().default(30) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const { condominioId, dias } = input;
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - dias);

      const vistoriasData = await db.select().from(vistorias)
        .where(and(eq(vistorias.condominioId, condominioId), gte(vistorias.createdAt, dataInicio)));
      const manutencoesData = await db.select().from(manutencoes)
        .where(and(eq(manutencoes.condominioId, condominioId), gte(manutencoes.createdAt, dataInicio)));
      const ocorrenciasData = await db.select().from(ocorrencias)
        .where(and(eq(ocorrencias.condominioId, condominioId), gte(ocorrencias.createdAt, dataInicio)));
      const checklistsData = await db.select().from(checklists)
        .where(and(eq(checklists.condominioId, condominioId), gte(checklists.createdAt, dataInicio)));

      const evolucao: Record<string, { vistorias: number; manutencoes: number; ocorrencias: number; checklists: number }> = {};
      
      for (let i = 0; i < dias; i++) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        const key = data.toISOString().split("T")[0];
        evolucao[key] = { vistorias: 0, manutencoes: 0, ocorrencias: 0, checklists: 0 };
      }

      vistoriasData.forEach(v => {
        const key = new Date(v.createdAt).toISOString().split("T")[0];
        if (evolucao[key]) evolucao[key].vistorias++;
      });
      manutencoesData.forEach(m => {
        const key = new Date(m.createdAt).toISOString().split("T")[0];
        if (evolucao[key]) evolucao[key].manutencoes++;
      });
      ocorrenciasData.forEach(o => {
        const key = new Date(o.createdAt).toISOString().split("T")[0];
        if (evolucao[key]) evolucao[key].ocorrencias++;
      });
      checklistsData.forEach(c => {
        const key = new Date(c.createdAt).toISOString().split("T")[0];
        if (evolucao[key]) evolucao[key].checklists++;
      });

      return Object.entries(evolucao)
        .map(([data, valores]) => ({ data, ...valores }))
        .sort((a, b) => a.data.localeCompare(b.data));
    }),

  // DistribuiÃ§Ã£o por prioridade
  getDistribuicaoPrioridade: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const { condominioId } = input;

      const vistoriasData = await db.select().from(vistorias).where(eq(vistorias.condominioId, condominioId));
      const manutencoesData = await db.select().from(manutencoes).where(eq(manutencoes.condominioId, condominioId));
      const ocorrenciasData = await db.select().from(ocorrencias).where(eq(ocorrencias.condominioId, condominioId));

      const prioridades = ["baixa", "media", "alta", "urgente"];
      const distribuicao = prioridades.map(p => ({
        prioridade: p,
        vistorias: vistoriasData.filter(v => v.prioridade === p).length,
        manutencoes: manutencoesData.filter(m => m.prioridade === p).length,
        ocorrencias: ocorrenciasData.filter(o => o.prioridade === p).length,
        total: vistoriasData.filter(v => v.prioridade === p).length +
               manutencoesData.filter(m => m.prioridade === p).length +
               ocorrenciasData.filter(o => o.prioridade === p).length,
      }));

      return distribuicao;
    }),

  // Itens recentes (timeline geral)
  getItensRecentes: protectedProcedure
    .input(z.object({ condominioId: z.number(), limite: z.number().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const { condominioId, limite } = input;

      const vistoriasData = await db.select().from(vistorias)
        .where(eq(vistorias.condominioId, condominioId))
        .orderBy(desc(vistorias.createdAt))
        .limit(limite);
      const manutencoesData = await db.select().from(manutencoes)
        .where(eq(manutencoes.condominioId, condominioId))
        .orderBy(desc(manutencoes.createdAt))
        .limit(limite);
      const ocorrenciasData = await db.select().from(ocorrencias)
        .where(eq(ocorrencias.condominioId, condominioId))
        .orderBy(desc(ocorrencias.createdAt))
        .limit(limite);
      const checklistsData = await db.select().from(checklists)
        .where(eq(checklists.condominioId, condominioId))
        .orderBy(desc(checklists.createdAt))
        .limit(limite);

      const itens: Array<{ itemTipo: string; createdAt: Date; [key: string]: unknown }> = [
        ...vistoriasData.map((v: typeof vistoriasData[0]) => ({ ...v, itemTipo: "vistoria" as const })),
        ...manutencoesData.map((m: typeof manutencoesData[0]) => ({ ...m, itemTipo: "manutencao" as const })),
        ...ocorrenciasData.map((o: typeof ocorrenciasData[0]) => ({ ...o, itemTipo: "ocorrencia" as const })),
        ...checklistsData.map((c: typeof checklistsData[0]) => ({ ...c, itemTipo: "checklist" as const })),
      ];

      return itens
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limite);
    }),
});
