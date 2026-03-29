
import { z } from "zod";
import { protectedProcedure, router } from "../../_core/trpc";
import { getDb } from "../../db";
import { favoritos } from "../../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const favoritoRouter = router({
  list: protectedProcedure
    .input(z.object({ tipoItem: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || !ctx.user) return [];
      if (input.tipoItem) {
        return db.select().from(favoritos)
          .where(and(
            eq(favoritos.userId, ctx.user.id),
            eq(favoritos.tipoItem, input.tipoItem as any)
          ))
          .orderBy(desc(favoritos.createdAt));
      }
      return db.select().from(favoritos)
        .where(eq(favoritos.userId, ctx.user.id))
        .orderBy(desc(favoritos.createdAt));
    }),

  check: protectedProcedure
    .input(z.object({
      tipoItem: z.string(),
      itemId: z.number().optional(),
      cardSecaoId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || !ctx.user) return false;
      
      let conditions = [
        eq(favoritos.userId, ctx.user.id),
        eq(favoritos.tipoItem, input.tipoItem as any),
      ];
      
      if (input.itemId) {
        conditions.push(eq(favoritos.itemId, input.itemId));
      }
      if (input.cardSecaoId) {
        conditions.push(eq(favoritos.cardSecaoId, input.cardSecaoId));
      }
      
      const result = await db.select().from(favoritos)
        .where(and(...conditions));
      return result.length > 0;
    }),

  toggle: protectedProcedure
    .input(z.object({
      tipoItem: z.string(),
      itemId: z.number().optional(),
      cardSecaoId: z.string().optional(),
      condominioId: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || !ctx.user) throw new Error("Not authenticated");
      
      let conditions = [
        eq(favoritos.userId, ctx.user.id),
        eq(favoritos.tipoItem, input.tipoItem as any),
      ];
      
      if (input.itemId) {
        conditions.push(eq(favoritos.itemId, input.itemId));
      }
      if (input.cardSecaoId) {
        conditions.push(eq(favoritos.cardSecaoId, input.cardSecaoId));
      }
      
      const existing = await db.select().from(favoritos)
        .where(and(...conditions));
      
      if (existing.length > 0) {
        await db.delete(favoritos).where(eq(favoritos.id, existing[0].id));
        return { favorito: false };
      } else {
        await db.insert(favoritos).values({
          userId: ctx.user.id,
          tipoItem: input.tipoItem as any,
          itemId: input.itemId,
          cardSecaoId: input.cardSecaoId,
          condominioId: input.condominioId,
        });
        return { favorito: true };
      }
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db || !ctx.user) throw new Error("Not authenticated");
      await db.delete(favoritos)
        .where(and(
          eq(favoritos.id, input.id),
          eq(favoritos.userId, ctx.user.id)
        ));
      return { success: true };
    }),

  listCards: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db || !ctx.user) return [];
      return db.select().from(favoritos)
        .where(and(
          eq(favoritos.userId, ctx.user.id),
          eq(favoritos.tipoItem, "card_secao")
        ))
        .orderBy(desc(favoritos.createdAt));
    }),
});

