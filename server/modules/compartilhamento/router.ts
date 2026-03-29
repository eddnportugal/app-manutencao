
import { z } from "zod";
import { getDb } from "../../db";
import { 
  linksCompartilhaveis, 
  historicoCompartilhamentos, 
  vistorias, 
  vistoriaImagens, 
  vistoriaTimeline, 
  manutencoes, 
  manutencaoImagens, 
  manutencaoTimeline, 
  ocorrencias, 
  ocorrenciaImagens, 
  ocorrenciaTimeline, 
  checklists, 
  checklistItens, 
  checklistImagens, 
  checklistTimeline, 
  comentariosItem, 
  anexosComentario, 
  respostasComentario, 
  membrosEquipe 
} from "../../../drizzle/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../../_core/trpc";
import { nanoid } from "nanoid";
import { storagePut } from "../../storage";

export const linkCompartilhavelRouter = router({
  list: protectedProcedure
    .input(z.object({ condominioId: z.number(), tipo: z.enum(["vistoria", "manutencao", "ocorrencia", "checklist"]).optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(linksCompartilhaveis.condominioId, input.condominioId), eq(linksCompartilhaveis.ativo, true)];
      if (input.tipo) {
        conditions.push(eq(linksCompartilhaveis.tipo, input.tipo));
      }
      return db.select().from(linksCompartilhaveis)
        .where(and(...conditions))
        .orderBy(desc(linksCompartilhaveis.createdAt));
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(linksCompartilhaveis).where(eq(linksCompartilhaveis.id, input.id)).limit(1);
      return result[0] || null;
    }),

  getByToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const result = await db.select().from(linksCompartilhaveis)
        .where(and(
          eq(linksCompartilhaveis.token, input.token),
          eq(linksCompartilhaveis.ativo, true)
        ))
        .limit(1);
      
      if (!result[0]) return null;
      
      // Verificar expiração
      if (result[0].expiracaoHoras && result[0].createdAt) {
        const createdAt = new Date(result[0].createdAt);
        const expiresAt = new Date(createdAt.getTime() + result[0].expiracaoHoras * 60 * 60 * 1000);
        if (new Date() > expiresAt) {
          return null; // Link expirado
        }
      }
      
      // Incrementar contador de acessos atomicamente
      await db.update(linksCompartilhaveis)
        .set({ acessos: sql`${linksCompartilhaveis.acessos} + 1` })
        .where(eq(linksCompartilhaveis.id, result[0].id));
      
      return result[0];
    }),

  create: protectedProcedure
    .input(z.object({
      condominioId: z.number(),
      tipo: z.enum(["vistoria", "manutencao", "ocorrencia", "checklist", "ordem-servico"]),
      itemId: z.number(),
      editavel: z.boolean().default(false),
      expiracaoHoras: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const token = nanoid(32);
      const result = await db.insert(linksCompartilhaveis).values({
        condominioId: input.condominioId,
        tipo: input.tipo,
        itemId: input.itemId,
        token,
        editavel: input.editavel,
        expiracaoHoras: input.expiracaoHoras || 168,
        criadoPorId: ctx.user.id,
        criadoPorNome: ctx.user.name || "UsuÃ¡rio",
      });
      return { id: result[0].insertId, token };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      editavel: z.boolean().optional(),
      expiracaoHoras: z.number().optional(),
      ativo: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(linksCompartilhaveis).set(data).where(eq(linksCompartilhaveis.id, id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(linksCompartilhaveis).set({ ativo: false }).where(eq(linksCompartilhaveis.id, input.id));
      return { success: true };
    }),

  compartilhar: protectedProcedure
    .input(z.object({
      linkId: z.number(),
      membroId: z.number().optional(),
      membroNome: z.string().optional(),
      membroWhatsapp: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Buscar dados do membro se membroId fornecido
      let nome = input.membroNome;
      let whatsapp = input.membroWhatsapp;
      
      if (input.membroId) {
        const membro = await db.select().from(membrosEquipe).where(eq(membrosEquipe.id, input.membroId)).limit(1);
        if (membro[0]) {
          nome = membro[0].nome;
          whatsapp = membro[0].whatsapp;
        }
      }
      
      // Registrar histÃ³rico de compartilhamento
      await db.insert(historicoCompartilhamentos).values({
        linkId: input.linkId,
        membroId: input.membroId || null,
        membroNome: nome || null,
        membroWhatsapp: whatsapp || null,
        compartilhadoPorId: ctx.user.id,
        compartilhadoPorNome: ctx.user.name || "UsuÃ¡rio",
      });
      
      // Buscar link para retornar URL completa
      const link = await db.select().from(linksCompartilhaveis).where(eq(linksCompartilhaveis.id, input.linkId)).limit(1);
      
      return { 
        success: true, 
        whatsapp,
        token: link[0]?.token,
      };
    }),

  historicoCompartilhamentos: protectedProcedure
    .input(z.object({ linkId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(historicoCompartilhamentos)
        .where(eq(historicoCompartilhamentos.linkId, input.linkId))
        .orderBy(desc(historicoCompartilhamentos.createdAt));
    }),
});

export const itemCompartilhadoRouter = router({
  getVistoria: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const link = await db.select().from(linksCompartilhaveis)
        .where(and(
          eq(linksCompartilhaveis.token, input.token),
          eq(linksCompartilhaveis.tipo, "vistoria"),
          eq(linksCompartilhaveis.ativo, true)
        ))
        .limit(1);
      
      if (!link[0]) return null;
      
      // Verificar expiração
      if (link[0].expiracaoHoras && link[0].createdAt) {
        const createdAt = new Date(link[0].createdAt);
        const expiresAt = new Date(createdAt.getTime() + link[0].expiracaoHoras * 60 * 60 * 1000);
        if (new Date() > expiresAt) return null;
      }
      
      const vistoria = await db.select().from(vistorias).where(eq(vistorias.id, link[0].itemId)).limit(1);
      const imagens = await db.select().from(vistoriaImagens).where(eq(vistoriaImagens.vistoriaId, link[0].itemId));
      const timeline = await db.select().from(vistoriaTimeline).where(eq(vistoriaTimeline.vistoriaId, link[0].itemId)).orderBy(desc(vistoriaTimeline.createdAt));
      
      return { 
        item: vistoria[0] || null, 
        imagens, 
        timeline,
        editavel: link[0].editavel,
      };
    }),

  getManutencao: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const link = await db.select().from(linksCompartilhaveis)
        .where(and(
          eq(linksCompartilhaveis.token, input.token),
          eq(linksCompartilhaveis.tipo, "manutencao"),
          eq(linksCompartilhaveis.ativo, true)
        ))
        .limit(1);
      
      if (!link[0]) return null;
      
      // Verificar expiração
      if (link[0].expiracaoHoras && link[0].createdAt) {
        const createdAt = new Date(link[0].createdAt);
        const expiresAt = new Date(createdAt.getTime() + link[0].expiracaoHoras * 60 * 60 * 1000);
        if (new Date() > expiresAt) return null;
      }
      
      const manutencao = await db.select().from(manutencoes).where(eq(manutencoes.id, link[0].itemId)).limit(1);
      const imagens = await db.select().from(manutencaoImagens).where(eq(manutencaoImagens.manutencaoId, link[0].itemId));
      const timeline = await db.select().from(manutencaoTimeline).where(eq(manutencaoTimeline.manutencaoId, link[0].itemId)).orderBy(desc(manutencaoTimeline.createdAt));
      
      return { 
        item: manutencao[0] || null, 
        imagens, 
        timeline,
        editavel: link[0].editavel,
      };
    }),

  getOcorrencia: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const link = await db.select().from(linksCompartilhaveis)
        .where(and(
          eq(linksCompartilhaveis.token, input.token),
          eq(linksCompartilhaveis.tipo, "ocorrencia"),
          eq(linksCompartilhaveis.ativo, true)
        ))
        .limit(1);
      
      if (!link[0]) return null;
      
      // Verificar expiração
      if (link[0].expiracaoHoras && link[0].createdAt) {
        const createdAt = new Date(link[0].createdAt);
        const expiresAt = new Date(createdAt.getTime() + link[0].expiracaoHoras * 60 * 60 * 1000);
        if (new Date() > expiresAt) return null;
      }
      
      const ocorrencia = await db.select().from(ocorrencias).where(eq(ocorrencias.id, link[0].itemId)).limit(1);
      const imagens = await db.select().from(ocorrenciaImagens).where(eq(ocorrenciaImagens.ocorrenciaId, link[0].itemId));
      const timeline = await db.select().from(ocorrenciaTimeline).where(eq(ocorrenciaTimeline.ocorrenciaId, link[0].itemId)).orderBy(desc(ocorrenciaTimeline.createdAt));
      
      return { 
        item: ocorrencia[0] || null, 
        imagens, 
        timeline,
        editavel: link[0].editavel,
      };
    }),

  getChecklist: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      
      const link = await db.select().from(linksCompartilhaveis)
        .where(and(
          eq(linksCompartilhaveis.token, input.token),
          eq(linksCompartilhaveis.tipo, "checklist"),
          eq(linksCompartilhaveis.ativo, true)
        ))
        .limit(1);
      
      if (!link[0]) return null;
      
      // Verificar expiração
      if (link[0].expiracaoHoras && link[0].createdAt) {
        const createdAt = new Date(link[0].createdAt);
        const expiresAt = new Date(createdAt.getTime() + link[0].expiracaoHoras * 60 * 60 * 1000);
        if (new Date() > expiresAt) return null;
      }
      
      const checklist = await db.select().from(checklists).where(eq(checklists.id, link[0].itemId)).limit(1);
      const itens = await db.select().from(checklistItens).where(eq(checklistItens.checklistId, link[0].itemId));
      const imagens = await db.select().from(checklistImagens).where(eq(checklistImagens.checklistId, link[0].itemId));
      const timeline = await db.select().from(checklistTimeline).where(eq(checklistTimeline.checklistId, link[0].itemId)).orderBy(desc(checklistTimeline.createdAt));
      
      return { 
        item: checklist[0] || null, 
        itens,
        imagens, 
        timeline,
        editavel: link[0].editavel,
      };
    }),
});

export const comentarioRouter = router({
  list: publicProcedure
    .input(z.object({
      itemId: z.number(),
      itemTipo: z.enum(["vistoria", "manutencao", "ocorrencia", "checklist"]),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      const comentarios = await db.select().from(comentariosItem)
        .where(and(
          eq(comentariosItem.itemId, input.itemId),
          eq(comentariosItem.itemTipo, input.itemTipo),
          eq(comentariosItem.isInterno, false)
        ))
        .orderBy(desc(comentariosItem.createdAt));
      
      // Buscar anexos para cada comentÃ¡rio
      const comentariosComAnexos = await Promise.all(
        comentarios.map(async (comentario) => {
          const anexos = await db.select().from(anexosComentario)
            .where(eq(anexosComentario.comentarioId, comentario.id));
          const respostas = await db.select().from(respostasComentario)
            .where(eq(respostasComentario.comentarioId, comentario.id))
            .orderBy(respostasComentario.createdAt);
          return { ...comentario, anexos, respostas };
        })
      );
      
      return comentariosComAnexos;
    }),

  create: publicProcedure
    .input(z.object({
      itemId: z.number(),
      itemTipo: z.enum(["vistoria", "manutencao", "ocorrencia", "checklist"]),
      condominioId: z.number(),
      autorNome: z.string().min(1),
      autorWhatsapp: z.string().optional(),
      autorEmail: z.string().optional(),
      autorFoto: z.string().optional(),
      texto: z.string().min(1),
      isInterno: z.boolean().optional(),
      anexos: z.array(z.object({
        url: z.string(),
        nome: z.string(),
        tipo: z.string(),
        tamanho: z.number().optional(),
      })).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Criar comentÃ¡rio
      const result = await db.insert(comentariosItem).values({
        itemId: input.itemId,
        itemTipo: input.itemTipo,
        condominioId: input.condominioId,
        autorNome: input.autorNome,
        autorWhatsapp: input.autorWhatsapp || null,
        autorEmail: input.autorEmail || null,
        autorFoto: input.autorFoto || null,
        texto: input.texto,
        isInterno: input.isInterno || false,
      });
      
      const comentarioId = result[0].insertId;
      
      // Criar anexos se houver
      if (input.anexos && input.anexos.length > 0) {
        await Promise.all(
          input.anexos.map(async (anexo) => {
            let url = anexo.url;
            // Upload base64 to S3 if needed
            if (url.startsWith('data:')) {
              try {
                const base64Data = url.replace(/^data:[^;]+;base64,/, "");
                const buffer = Buffer.from(base64Data, "base64");
                const uniqueId = nanoid(10);
                const ext = anexo.nome.split('.').pop() || 'bin';
                const fileKey = `comentarios/${input.condominioId}/${uniqueId}.${ext}`;
                const uploaded = await storagePut(fileKey, buffer, anexo.tipo);
                url = uploaded.url;
              } catch (e) {
                console.error("Erro ao fazer upload de anexo:", e);
              }
            }
            return db.insert(anexosComentario).values({
              comentarioId,
              url,
              nome: anexo.nome,
              tipo: anexo.tipo,
              tamanho: anexo.tamanho || null,
            });
          })
        );
      }
      
      return { id: comentarioId };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Excluir anexos primeiro
      await db.delete(anexosComentario).where(eq(anexosComentario.comentarioId, input.id));
      // Excluir respostas
      await db.delete(respostasComentario).where(eq(respostasComentario.comentarioId, input.id));
      // Excluir comentÃ¡rio
      await db.delete(comentariosItem).where(eq(comentariosItem.id, input.id));
      
      return { success: true };
    }),

  marcarLido: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(comentariosItem)
        .set({ 
          lido: true, 
          lidoPorId: ctx.user.id,
          lidoEm: new Date(),
        })
        .where(eq(comentariosItem.id, input.id));
      
      return { success: true };
    }),

  responder: publicProcedure
    .input(z.object({
      comentarioId: z.number(),
      autorNome: z.string().min(1),
      autorFoto: z.string().optional(),
      texto: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.insert(respostasComentario).values({
        comentarioId: input.comentarioId,
        autorNome: input.autorNome,
        autorFoto: input.autorFoto || null,
        texto: input.texto,
      });
      
      return { id: result[0].insertId };
    }),

  // Contar comentÃ¡rios nÃ£o lidos por item
  contarNaoLidos: protectedProcedure
    .input(z.object({
      itemId: z.number(),
      itemTipo: z.enum(["vistoria", "manutencao", "ocorrencia", "checklist"]),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return 0;
      
      const result = await db.select({ count: sql<number>`count(*)` })
        .from(comentariosItem)
        .where(and(
          eq(comentariosItem.itemId, input.itemId),
          eq(comentariosItem.itemTipo, input.itemTipo),
          eq(comentariosItem.lido, false)
        ));
      
      return result[0]?.count || 0;
    }),

  // Listar todos os comentÃ¡rios nÃ£o lidos do condomÃ­nio
  listNaoLidos: protectedProcedure
    .input(z.object({ condominioId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      
      return db.select().from(comentariosItem)
        .where(and(
          eq(comentariosItem.condominioId, input.condominioId),
          eq(comentariosItem.lido, false)
        ))
        .orderBy(desc(comentariosItem.createdAt));
    }),
});

