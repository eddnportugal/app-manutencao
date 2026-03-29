import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { getDb } from "../../db";
import { configuracoesFinanceiras, faixasPreco } from "../../../drizzle/schema";
import { router, protectedProcedure, publicProcedure } from "../../_core/trpc";

export const financeiroRouter = router({
  // Obter configurações financeiras (para Gestor/Admin visualizar)
  obter: protectedProcedure
    .query(async ({ ctx }) => {
      // Apenas admin e sindico (gestor) podem ver
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'sindico') {
        throw new Error("Acesso não autorizado");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Buscar configuração (sempre existe apenas 1 registro)
      const [config] = await db.select().from(configuracoesFinanceiras).limit(1);
      
      return config || null;
    }),

  // Salvar/Atualizar configurações (apenas Admin Master)
  salvar: protectedProcedure
    .input(z.object({
      // PIX
      pixAtivo: z.boolean().optional(),
      pixTipoChave: z.enum(["cpf", "cnpj", "email", "telefone", "aleatoria"]).nullable().optional(),
      pixChave: z.string().nullable().optional(),
      pixNomeBeneficiario: z.string().nullable().optional(),
      pixCidade: z.string().nullable().optional(),
      pixQrCodeUrl: z.string().nullable().optional(),
      
      // Boleto
      boletoAtivo: z.boolean().optional(),
      boletoInstrucoes: z.string().nullable().optional(),
      boletoLinkPadrao: z.string().nullable().optional(),
      
      // Cartão
      cartaoAtivo: z.boolean().optional(),
      cartaoLinkPagamento: z.string().nullable().optional(),
      cartaoDescricao: z.string().nullable().optional(),
      
      // Nota Fiscal
      notaFiscalAtivo: z.boolean().optional(),
      notaFiscalInstrucoes: z.string().nullable().optional(),
      notaFiscalEmail: z.string().nullable().optional(),
      
      // Geral
      valorMensalidade: z.string().nullable().optional(),
      diaVencimento: z.number().nullable().optional(),
      observacoes: z.string().nullable().optional(),
      
      // Notificações
      emailNotificacaoCadastro: z.string().nullable().optional(),
      notificarNovoCadastro: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Apenas Admin pode configurar
      if (ctx.user?.role !== 'admin') {
        throw new Error("Apenas administradores podem configurar o módulo financeiro");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verificar se já existe configuração
      const [existente] = await db.select().from(configuracoesFinanceiras).limit(1);
      
      const dados = {
        pixAtivo: input.pixAtivo ?? false,
        pixTipoChave: input.pixTipoChave,
        pixChave: input.pixChave,
        pixNomeBeneficiario: input.pixNomeBeneficiario,
        pixCidade: input.pixCidade,
        pixQrCodeUrl: input.pixQrCodeUrl,
        boletoAtivo: input.boletoAtivo ?? false,
        boletoInstrucoes: input.boletoInstrucoes,
        boletoLinkPadrao: input.boletoLinkPadrao,
        cartaoAtivo: input.cartaoAtivo ?? false,
        cartaoLinkPagamento: input.cartaoLinkPagamento,
        cartaoDescricao: input.cartaoDescricao,
        notaFiscalAtivo: input.notaFiscalAtivo ?? false,
        notaFiscalInstrucoes: input.notaFiscalInstrucoes,
        notaFiscalEmail: input.notaFiscalEmail,
        valorMensalidade: input.valorMensalidade,
        diaVencimento: input.diaVencimento ?? 10,
        observacoes: input.observacoes,
        emailNotificacaoCadastro: input.emailNotificacaoCadastro,
        notificarNovoCadastro: input.notificarNovoCadastro ?? false,
      };
      
      if (existente) {
        await db.update(configuracoesFinanceiras)
          .set(dados)
          .where(eq(configuracoesFinanceiras.id, existente.id));
        
        return { success: true, message: "Configurações atualizadas com sucesso" };
      } else {
        await db.insert(configuracoesFinanceiras).values(dados);
        
        return { success: true, message: "Configurações criadas com sucesso" };
      }
    }),

  // ==================== FAIXAS DE PREÇO ====================
  
  // Listar todas as faixas de preço
  listarFaixas: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'sindico') {
        throw new Error("Acesso não autorizado");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const faixas = await db.select().from(faixasPreco).orderBy(asc(faixasPreco.ordem), asc(faixasPreco.usuariosMin));
      return faixas;
    }),

  // Criar nova faixa de preço (Admin)
  criarFaixa: protectedProcedure
    .input(z.object({
      nome: z.string().min(1, "Nome é obrigatório"),
      usuariosMin: z.number().min(1, "Mínimo de usuários deve ser pelo menos 1"),
      usuariosMax: z.number().nullable().optional(),
      valorMensal: z.string().min(1, "Valor é obrigatório"),
      descricao: z.string().nullable().optional(),
      ativo: z.boolean().optional(),
      ordem: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error("Apenas administradores podem criar faixas de preço");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.insert(faixasPreco).values({
        nome: input.nome,
        usuariosMin: input.usuariosMin,
        usuariosMax: input.usuariosMax ?? null,
        valorMensal: input.valorMensal,
        descricao: input.descricao ?? null,
        ativo: input.ativo ?? true,
        ordem: input.ordem ?? 0,
      });
      
      return { success: true, message: "Faixa de preço criada com sucesso" };
    }),

  // Atualizar faixa de preço (Admin)
  atualizarFaixa: protectedProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().min(1, "Nome é obrigatório"),
      usuariosMin: z.number().min(1, "Mínimo de usuários deve ser pelo menos 1"),
      usuariosMax: z.number().nullable().optional(),
      valorMensal: z.string().min(1, "Valor é obrigatório"),
      descricao: z.string().nullable().optional(),
      ativo: z.boolean().optional(),
      ordem: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error("Apenas administradores podem atualizar faixas de preço");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.update(faixasPreco)
        .set({
          nome: input.nome,
          usuariosMin: input.usuariosMin,
          usuariosMax: input.usuariosMax ?? null,
          valorMensal: input.valorMensal,
          descricao: input.descricao ?? null,
          ativo: input.ativo ?? true,
          ordem: input.ordem ?? 0,
        })
        .where(eq(faixasPreco.id, input.id));
      
      return { success: true, message: "Faixa de preço atualizada com sucesso" };
    }),

  // Excluir faixa de preço (Admin)
  excluirFaixa: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new Error("Apenas administradores podem excluir faixas de preço");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db.delete(faixasPreco).where(eq(faixasPreco.id, input.id));
      
      return { success: true, message: "Faixa de preço excluída com sucesso" };
    }),

  // Obter faixa de preço para uma quantidade específica de usuários
  obterFaixaPorUsuarios: protectedProcedure
    .input(z.object({
      qtdUsuarios: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== 'admin' && ctx.user?.role !== 'sindico') {
        throw new Error("Acesso não autorizado");
      }
      
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const faixas = await db.select().from(faixasPreco)
        .where(eq(faixasPreco.ativo, true))
        .orderBy(asc(faixasPreco.usuariosMin));
      
      // Encontrar a faixa correta para a quantidade de usuários
      for (const faixa of faixas) {
        const min = faixa.usuariosMin;
        const max = faixa.usuariosMax;
        
        if (input.qtdUsuarios >= min && (max === null || input.qtdUsuarios <= max)) {
          return faixa;
        }
      }
      
      // Se não encontrou faixa específica, retorna a última (maior)
      return faixas[faixas.length - 1] || null;
    }),
});
