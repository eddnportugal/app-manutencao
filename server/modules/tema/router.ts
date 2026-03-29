import { z } from "zod";
import { eq, desc, and } from "drizzle-orm";
import { protectedProcedure, router } from "../../_core/trpc";
import { getDb } from "../../db";
import { nanoid } from "nanoid";
import { 
  preferenciasLayout, 
  historicoTemas, 
  temasPersonalizados 
} from "../../../drizzle/schema";

export const preferenciasLayoutRouter = router({
    get: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return null;
        
        const [prefs] = await db.select().from(preferenciasLayout)
          .where(eq(preferenciasLayout.userId, ctx.user.id));
        
        // Se usar tema personalizado, buscar dados do tema
        let temaPersonalizado = null;
        if (prefs?.usarTemaPersonalizado && prefs?.temaPersonalizadoId) {
          const [tema] = await db.select().from(temasPersonalizados)
            .where(eq(temasPersonalizados.id, prefs.temaPersonalizadoId));
          temaPersonalizado = tema || null;
        }
        
        return {
          ...(prefs || {
            tema: "laranja",
            layout: "classico",
            modoEscuro: false,
            tamanhoFonte: "medio",
            sidebarExpandida: true,
            usarTemaPersonalizado: false,
            temaPersonalizadoId: null,
          }),
          temaPersonalizado,
        };
      }),

    save: protectedProcedure
      .input(z.object({
        tema: z.enum(["laranja", "azul", "verde", "roxo", "vermelho", "marrom", "cinza"]).optional(),
        layout: z.enum(["classico", "compacto", "moderno"]).optional(),
        modoEscuro: z.boolean().optional(),
        tamanhoFonte: z.enum(["pequeno", "medio", "grande"]).optional(),
        sidebarExpandida: z.boolean().optional(),
        temaPersonalizadoId: z.number().nullable().optional(),
        usarTemaPersonalizado: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Verificar se já existe preferência para o usuário
        const [existing] = await db.select().from(preferenciasLayout)
          .where(eq(preferenciasLayout.userId, ctx.user.id));
        
        if (existing) {
          // Atualizar
          await db.update(preferenciasLayout)
            .set({
              tema: input.tema || existing.tema,
              layout: input.layout || existing.layout,
              modoEscuro: input.modoEscuro !== undefined ? input.modoEscuro : existing.modoEscuro,
              tamanhoFonte: input.tamanhoFonte || existing.tamanhoFonte,
              sidebarExpandida: input.sidebarExpandida !== undefined ? input.sidebarExpandida : existing.sidebarExpandida,
              temaPersonalizadoId: input.temaPersonalizadoId !== undefined ? input.temaPersonalizadoId : existing.temaPersonalizadoId,
              usarTemaPersonalizado: input.usarTemaPersonalizado !== undefined ? input.usarTemaPersonalizado : existing.usarTemaPersonalizado,
            })
            .where(eq(preferenciasLayout.id, existing.id));
        } else {
          // Criar
          await db.insert(preferenciasLayout).values({
            userId: ctx.user.id,
            tema: input.tema || "laranja",
            layout: input.layout || "classico",
            modoEscuro: input.modoEscuro || false,
            tamanhoFonte: input.tamanhoFonte || "medio",
            sidebarExpandida: input.sidebarExpandida !== undefined ? input.sidebarExpandida : true,
            temaPersonalizadoId: input.temaPersonalizadoId || null,
            usarTemaPersonalizado: input.usarTemaPersonalizado || false,
          });
        }
        
        return { success: true };
      }),
});

export const historicoTemasRouter = router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        
        return db.select().from(historicoTemas)
          .where(eq(historicoTemas.userId, ctx.user.id))
          .orderBy(desc(historicoTemas.createdAt))
          .limit(10);
      }),

    save: protectedProcedure
      .input(z.object({
        tema: z.string(),
        layout: z.string(),
        modoEscuro: z.boolean().optional(),
        tamanhoFonte: z.string().optional(),
        descricao: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.insert(historicoTemas).values({
          userId: ctx.user.id,
          tema: input.tema,
          layout: input.layout,
          modoEscuro: input.modoEscuro || false,
          tamanhoFonte: input.tamanhoFonte || "medio",
          descricao: input.descricao || `Tema ${input.tema} aplicado`,
        });
        
        return { success: true, id: Number(result[0].insertId) };
      }),

    restaurar: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Buscar histórico
        const [historico] = await db.select().from(historicoTemas)
          .where(and(
            eq(historicoTemas.id, input.id),
            eq(historicoTemas.userId, ctx.user.id)
          ));
        
        if (!historico) throw new Error("Histórico não encontrado");
        
        // Atualizar preferências atuais
        const [existing] = await db.select().from(preferenciasLayout)
          .where(eq(preferenciasLayout.userId, ctx.user.id));
        
        if (existing) {
          await db.update(preferenciasLayout)
            .set({
              tema: historico.tema as "laranja" | "azul" | "verde" | "roxo" | "vermelho" | "marrom" | "cinza",
              layout: historico.layout as "classico" | "compacto" | "moderno",
              modoEscuro: historico.modoEscuro,
              tamanhoFonte: historico.tamanhoFonte as "pequeno" | "medio" | "grande",
            })
            .where(eq(preferenciasLayout.id, existing.id));
        }
        
        return { success: true };
      }),
});

export const temasPersonalizadosRouter = router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) return [];
        
        return db.select().from(temasPersonalizados)
          .where(and(
            eq(temasPersonalizados.userId, ctx.user.id),
            eq(temasPersonalizados.ativo, true)
          ))
          .orderBy(desc(temasPersonalizados.createdAt));
      }),

    create: protectedProcedure
      .input(z.object({
        nome: z.string().min(1),
        corPrimaria: z.string(),
        corSecundaria: z.string().optional(),
        corFundo: z.string().optional(),
        corTexto: z.string().optional(),
        corAcento: z.string().optional(),
        modoEscuro: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Gerar slug único
        const slug = `custom-${nanoid(8)}`;
        
        const result = await db.insert(temasPersonalizados).values({
          userId: ctx.user.id,
          slug,
          nome: input.nome,
          corPrimaria: input.corPrimaria,
          corSecundaria: input.corSecundaria,
          corFundo: input.corFundo,
          corTexto: input.corTexto,
          corAcento: input.corAcento,
          modoEscuro: input.modoEscuro || false,
        });
        
        return { success: true, id: Number(result[0].insertId), slug };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().min(1).optional(),
        corPrimaria: z.string().optional(),
        corSecundaria: z.string().optional(),
        corFundo: z.string().optional(),
        corTexto: z.string().optional(),
        corAcento: z.string().optional(),
        modoEscuro: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { id, ...data } = input;
        
        await db.update(temasPersonalizados)
          .set(data)
          .where(and(
            eq(temasPersonalizados.id, id),
            eq(temasPersonalizados.userId, ctx.user.id)
          ));
        
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.update(temasPersonalizados)
          .set({ ativo: false })
          .where(and(
            eq(temasPersonalizados.id, input.id),
            eq(temasPersonalizados.userId, ctx.user.id)
          ));
        
        return { success: true };
      }),
});
