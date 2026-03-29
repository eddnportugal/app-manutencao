import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../../_core/trpc";
import { getDb } from "../../db";
import { eq, and } from "drizzle-orm";
import { condominioFuncoes, FUNCOES_DISPONIVEIS } from "../../../drizzle/schema";

export const funcoesCondominioRouter = router({
    // Listar todas as funÃ§Ãµes disponÃ­veis
    listarDisponiveis: publicProcedure.query(() => {
      return FUNCOES_DISPONIVEIS;
    }),

    // Obter funÃ§Ãµes habilitadas para um condomÃ­nio
    listar: protectedProcedure
      .input(z.object({ condominioId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        
        const result = await db.select()
          .from(condominioFuncoes)
          .where(eq(condominioFuncoes.condominioId, input.condominioId));
        
        return result;
      }),

    // Obter lista de IDs de funÃ§Ãµes habilitadas
    listarHabilitadas: protectedProcedure
      .input(z.object({ condominioId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return FUNCOES_DISPONIVEIS.map(f => f.id);
        
        const result = await db.select()
          .from(condominioFuncoes)
          .where(and(
            eq(condominioFuncoes.condominioId, input.condominioId),
            eq(condominioFuncoes.habilitada, true)
          ));
        
        // Se nÃ£o hÃ¡ registros, todas estÃ£o habilitadas por padrÃ£o
        if (result.length === 0) {
          return FUNCOES_DISPONIVEIS.map(f => f.id);
        }
        
        return result.map(r => r.funcaoId);
      }),

    // Habilitar/desabilitar uma funÃ§Ã£o (apenas admin)
    toggle: protectedProcedure
      .input(z.object({
        condominioId: z.number(),
        funcaoId: z.string(),
        habilitada: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verificar se Ã© admin
        if (ctx.user?.role !== 'admin') {
          throw new Error("Apenas administradores podem alterar funÃ§Ãµes");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Verificar se jÃ¡ existe registro
        const existing = await db.select()
          .from(condominioFuncoes)
          .where(and(
            eq(condominioFuncoes.condominioId, input.condominioId),
            eq(condominioFuncoes.funcaoId, input.funcaoId)
          ));
        
        if (existing.length > 0) {
          await db.update(condominioFuncoes)
            .set({ habilitada: input.habilitada })
            .where(and(
              eq(condominioFuncoes.condominioId, input.condominioId),
              eq(condominioFuncoes.funcaoId, input.funcaoId)
            ));
        } else {
          await db.insert(condominioFuncoes).values({
            condominioId: input.condominioId,
            funcaoId: input.funcaoId,
            habilitada: input.habilitada,
          });
        }
        
        return { success: true, ...input };
      }),

    // Atualizar mÃºltiplas funÃ§Ãµes de uma vez (apenas admin)
    atualizarMultiplas: protectedProcedure
      .input(z.object({
        condominioId: z.number(),
        funcoes: z.array(z.object({
          funcaoId: z.string(),
          habilitada: z.boolean(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verificar se Ã© admin
        if (ctx.user?.role !== 'admin') {
          throw new Error("Apenas administradores podem alterar funÃ§Ãµes");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        for (const funcao of input.funcoes) {
          const existing = await db.select()
            .from(condominioFuncoes)
            .where(and(
              eq(condominioFuncoes.condominioId, input.condominioId),
              eq(condominioFuncoes.funcaoId, funcao.funcaoId)
            ));
          
          if (existing.length > 0) {
            await db.update(condominioFuncoes)
              .set({ habilitada: funcao.habilitada })
              .where(and(
                eq(condominioFuncoes.condominioId, input.condominioId),
                eq(condominioFuncoes.funcaoId, funcao.funcaoId)
              ));
          } else {
            await db.insert(condominioFuncoes).values({
              condominioId: input.condominioId,
              funcaoId: funcao.funcaoId,
              habilitada: funcao.habilitada,
            });
          }
        }
        
        return { success: true, updated: input.funcoes.length };
      }),

    // Inicializar funÃ§Ãµes para um condomÃ­nio (todas habilitadas)
    inicializar: protectedProcedure
      .input(z.object({ condominioId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        // Verificar se Ã© admin
        if (ctx.user?.role !== 'admin') {
          throw new Error("Apenas administradores podem inicializar funÃ§Ãµes");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Verificar se jÃ¡ existem registros
        const existing = await db.select()
          .from(condominioFuncoes)
          .where(eq(condominioFuncoes.condominioId, input.condominioId));
        
        if (existing.length > 0) {
          return { initialized: false, message: "FunÃ§Ãµes jÃ¡ inicializadas" };
        }
        
        // Criar registros para todas as funÃ§Ãµes (todas habilitadas)
        for (const funcao of FUNCOES_DISPONIVEIS) {
          await db.insert(condominioFuncoes).values({
            condominioId: input.condominioId,
            funcaoId: funcao.id,
            habilitada: true,
          });
        }
        
        return { initialized: true, count: FUNCOES_DISPONIVEIS.length };
      }),
  });

