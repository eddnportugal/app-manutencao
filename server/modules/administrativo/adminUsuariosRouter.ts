
import { z } from "zod";
import { eq, desc, and, or, like, asc, sql, gte, lte } from "drizzle-orm";
import { getDb } from "../../db";
import { users, condominios, adminLogs, membrosEquipe } from "../../../drizzle/schema";
import { router, protectedProcedure } from "../../_core/trpc";

export const adminUsuariosRouter = router({
  // Listar todos os usuários (apenas admin)
  listar: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      search: z.string().optional(),
      role: z.enum(["user", "admin", "sindico", "morador"]).optional(),
      tipoConta: z.enum(["sindico", "administradora", "admin"]).optional(),
      orderBy: z.enum(["createdAt", "lastSignedIn", "name"]).default("createdAt"),
      orderDir: z.enum(["asc", "desc"]).default("desc"),
    }))
    .query(async ({ input, ctx }) => {
      // Verificar se é admin
      if (ctx.user?.role !== 'admin') {
        throw new Error("Apenas administradores podem acessar esta função");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const conditions = [];
      
      if (input.search) {
        conditions.push(
          or(
            like(users.name, `%${input.search}%`),
            like(users.email, `%${input.search}%`)
          )
        );
      }
      
      if (input.role) {
        conditions.push(eq(users.role, input.role));
      }
      
      if (input.tipoConta) {
        conditions.push(eq(users.tipoConta, input.tipoConta));
      }
      
      // Contar total
      const totalResult = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
      
      const total = Number(totalResult[0]?.count || 0);
      
      // Buscar usuários com paginação
      const offset = (input.page - 1) * input.limit;
      
      let query = db.select({
        id: users.id,
        openId: users.openId,
        name: users.name,
        email: users.email,
        role: users.role,
        tipoConta: users.tipoConta,
        tipoUsuario: users.tipoUsuario,
        diasUtilizacao: users.diasUtilizacao,
        cidade: users.cidade,
        adimplente: users.adimplente,
        bloqueado: users.bloqueado,
        motivoBloqueio: users.motivoBloqueio,
        loginMethod: users.loginMethod,
        avatarUrl: users.avatarUrl,
        phone: users.phone,
        valorPlano: users.valorPlano,
        faixaPrecoId: users.faixaPrecoId,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
      }).from(users);
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }
      
      // Ordenação
      const orderColumn = input.orderBy === 'name' ? users.name : 
                         input.orderBy === 'lastSignedIn' ? users.lastSignedIn : 
                         users.createdAt;
      
      const result = await query
        .orderBy(input.orderDir === 'asc' ? asc(orderColumn) : desc(orderColumn))
        .limit(input.limit)
        .offset(offset);
      
      // Calcular dias de utilização automaticamente baseado no createdAt
      // E contar membros da equipe por organização do usuário
      const usuariosComDias = await Promise.all(result.map(async (usuario) => {
        const createdDate = new Date(usuario.createdAt);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - createdDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Buscar organizações do usuário e contar membros da equipe
        const orgs = await db.select({ id: condominios.id })
          .from(condominios)
          .where(eq(condominios.sindicoId, usuario.id));
        
        let totalMembrosEquipe = 0;
        if (orgs.length > 0) {
          for (const org of orgs) {
            const [countResult] = await db.select({ count: sql<number>`count(*)` })
              .from(membrosEquipe)
              .where(eq(membrosEquipe.condominioId, org.id));
            totalMembrosEquipe += Number(countResult?.count || 0);
          }
        }
        
        return {
          ...usuario,
          diasUtilizacao: diffDays,
          totalMembrosEquipe,
        };
      }));
      
      return {
        usuarios: usuariosComDias,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),

  // Obter detalhes de um usuário
  obter: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error("Apenas administradores podem acessar esta função");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const [usuario] = await db.select().from(users)
        .where(eq(users.id, input.id))
        .limit(1);
      
      if (!usuario) throw new Error("Usuário não encontrado");
      
      // Buscar organizações do usuário
      const organizacoes = await db.select()
        .from(condominios)
        .where(eq(condominios.sindicoId, input.id));
      
      return {
        ...usuario,
        organizacoes,
      };
    }),

  // Atualizar usuário (role, tipoConta, tipoUsuario, etc)
  atualizar: protectedProcedure
    .input(z.object({
      id: z.number(),
      role: z.enum(["user", "admin", "sindico", "morador"]).optional(),
      tipoConta: z.enum(["sindico", "administradora", "admin"]).optional(),
      tipoUsuario: z.enum(["usuario", "pequena_empresa", "media_empresa"]).optional(),
      diasUtilizacao: z.number().optional(),
      cidade: z.string().optional(),
      adimplente: z.boolean().optional(),
      bloqueado: z.boolean().optional(),
      motivoBloqueio: z.string().optional(),
      name: z.string().optional(),
      phone: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error("Apenas administradores podem acessar esta função");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Buscar dados anteriores do usuário
      const [usuarioAnterior] = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
      if (!usuarioAnterior) throw new Error("Usuário não encontrado");
      
      const { id, ...updateData } = input;
      
      // Remover campos undefined
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );
      
      if (Object.keys(cleanData).length === 0) {
        throw new Error("Nenhum campo para atualizar");
      }
      
      await db.update(users).set(cleanData).where(eq(users.id, id));
      
      // Registrar log de atividade
      const detalhes = {
        antes: {
          role: usuarioAnterior.role,
          tipoConta: usuarioAnterior.tipoConta,
          tipoUsuario: usuarioAnterior.tipoUsuario,
          diasUtilizacao: usuarioAnterior.diasUtilizacao,
          cidade: usuarioAnterior.cidade,
          adimplente: usuarioAnterior.adimplente,
          bloqueado: usuarioAnterior.bloqueado,
          name: usuarioAnterior.name,
          phone: usuarioAnterior.phone,
        },
        depois: cleanData,
      };
      
      await db.insert(adminLogs).values({
        adminId: ctx.user.id,
        adminNome: ctx.user.name || 'Admin',
        adminEmail: ctx.user.email || '',
        acao: 'editar',
        entidade: 'usuario',
        entidadeId: id,
        entidadeNome: usuarioAnterior.name || usuarioAnterior.email || `ID: ${id}`,
        detalhes: JSON.stringify(detalhes),
      });
      
      return { success: true, message: "Usuário atualizado com sucesso" };
    }),

  // Excluir usuário
  excluir: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error("Apenas administradores podem acessar esta função");
      }
      
      // Não permitir excluir a si mesmo
      if (ctx.user.id === input.id) {
        throw new Error("Você não pode excluir sua própria conta");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verificar se o usuário existe
      const [usuario] = await db.select().from(users)
        .where(eq(users.id, input.id))
        .limit(1);
      
      if (!usuario) throw new Error("Usuário não encontrado");
      
      // Registrar log de atividade ANTES de excluir
      const detalhes = {
        usuarioExcluido: {
          id: usuario.id,
          name: usuario.name,
          email: usuario.email,
          role: usuario.role,
          tipoConta: usuario.tipoConta,
          createdAt: usuario.createdAt,
        },
      };
      
      await db.insert(adminLogs).values({
        adminId: ctx.user.id,
        adminNome: ctx.user.name || 'Admin',
        adminEmail: ctx.user.email || '',
        acao: 'excluir',
        entidade: 'usuario',
        entidadeId: input.id,
        entidadeNome: usuario.name || usuario.email || `ID: ${input.id}`,
        detalhes: JSON.stringify(detalhes),
      });
      
      // Excluir usuário
      await db.delete(users).where(eq(users.id, input.id));
      
      return { success: true, message: "Usuário excluído com sucesso" };
    }),

  // Atualizar valor do plano do usuário
  atualizarValorPlano: protectedProcedure
    .input(z.object({
      userId: z.number(),
      valorPlano: z.string().nullable(),
      faixaPrecoId: z.number().nullable().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error("Apenas administradores podem acessar esta função");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Buscar usuário
      const [usuario] = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
      if (!usuario) throw new Error("Usuário não encontrado");
      
      // Atualizar valor do plano
      await db.update(users).set({
        valorPlano: input.valorPlano,
        faixaPrecoId: input.faixaPrecoId ?? null,
      }).where(eq(users.id, input.userId));
      
      // Registrar log
      await db.insert(adminLogs).values({
        adminId: ctx.user.id,
        adminNome: ctx.user.name || 'Admin',
        adminEmail: ctx.user.email || '',
        acao: 'editar',
        entidade: 'usuario',
        entidadeId: input.userId,
        entidadeNome: usuario.name || usuario.email || `ID: ${input.userId}`,
        detalhes: JSON.stringify({
          campo: 'valorPlano',
          antes: usuario.valorPlano,
          depois: input.valorPlano,
        }),
      });
      
      return { success: true, message: "Valor do plano atualizado com sucesso" };
    }),

  // Estatísticas de usuários
  estatisticas: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error("Apenas administradores podem acessar esta função");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Total de usuários
      const totalResult = await db.select({ count: sql<number>`count(*)` }).from(users);
      const total = Number(totalResult[0]?.count || 0);
      
      // Por role
      const porRoleResult = await db.select({
        role: users.role,
        count: sql<number>`count(*)`
      }).from(users).groupBy(users.role);
      
      const porRole = porRoleResult.reduce((acc, item) => {
        acc[item.role] = Number(item.count);
        return acc;
      }, {} as Record<string, number>);
      
      // Por tipoConta
      const porTipoContaResult = await db.select({
        tipoConta: users.tipoConta,
        count: sql<number>`count(*)`
      }).from(users).groupBy(users.tipoConta);
      
      const porTipoConta = porTipoContaResult.reduce((acc, item) => {
        if (item.tipoConta) acc[item.tipoConta] = Number(item.count);
        return acc;
      }, {} as Record<string, number>);
      
      // Por loginMethod
      const porLoginMethodResult = await db.select({
        loginMethod: users.loginMethod,
        count: sql<number>`count(*)`
      }).from(users).groupBy(users.loginMethod);
      
      const porLoginMethod = porLoginMethodResult.reduce((acc, item) => {
        if (item.loginMethod) acc[item.loginMethod] = Number(item.count);
        return acc;
      }, {} as Record<string, number>);
      
      // Usuários ativos nos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const ativosResult = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.lastSignedIn, thirtyDaysAgo));
      
      const ativos30dias = Number(ativosResult[0]?.count || 0);
      
      // Novos usuários nos últimos 30 dias
      const novosResult = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo));
      
      const novos30dias = Number(novosResult[0]?.count || 0);
      
      // Usuários por mês (últimos 6 meses)
      const porMes = [];
      for (let i = 5; i >= 0; i--) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - i);
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
        
        const mesResult = await db.select({ count: sql<number>`count(*)` })
          .from(users)
          .where(and(
            gte(users.createdAt, startDate),
            lte(users.createdAt, endDate)
          ));
        
        porMes.push({
          mes: startDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          count: Number(mesResult[0]?.count || 0),
        });
      }
      
      return {
        total,
        porRole,
        porTipoConta,
        porLoginMethod,
        ativos30dias,
        novos30dias,
        porMes,
      };
    }),

  // Listar logs de atividades administrativas
  listarLogs: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      acao: z.enum(["criar", "editar", "excluir", "ativar", "desativar", "promover", "rebaixar"]).optional(),
      entidade: z.enum(["usuario", "condominio", "vistoria", "manutencao", "ordem_servico", "funcao", "configuracao"]).optional(),
      adminId: z.number().optional(),
      dataInicio: z.date().optional(),
      dataFim: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error("Apenas administradores podem acessar esta função");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const conditions = [];
      
      if (input.acao) {
        conditions.push(eq(adminLogs.acao, input.acao));
      }
      
      if (input.entidade) {
        conditions.push(eq(adminLogs.entidade, input.entidade));
      }
      
      if (input.adminId) {
        conditions.push(eq(adminLogs.adminId, input.adminId));
      }
      
      if (input.dataInicio) {
        conditions.push(gte(adminLogs.createdAt, input.dataInicio));
      }
      
      if (input.dataFim) {
        conditions.push(lte(adminLogs.createdAt, input.dataFim));
      }
      
      // Contar total
      const totalResult = await db.select({ count: sql<number>`count(*)` })
        .from(adminLogs)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
      
      const total = Number(totalResult[0]?.count || 0);
      
      // Buscar logs com paginação
      const offset = (input.page - 1) * input.limit;
      
      let query = db.select().from(adminLogs);
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }
      
      const logs = await query
        .orderBy(desc(adminLogs.createdAt))
        .limit(input.limit)
        .offset(offset);
      
      return {
        logs,
        total,
        page: input.page,
        totalPages: Math.ceil(total / input.limit),
      };
    }),
});
