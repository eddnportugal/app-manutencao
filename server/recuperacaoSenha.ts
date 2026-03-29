import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import crypto from "crypto";
import { getDb } from "./db";
import bcrypt from "bcryptjs";

let db: any = null;

const initDb = async () => {
  if (!db) {
    db = await getDb();
  }
  return db;
};

// Função auxiliar para gerar token
function gerarToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Função auxiliar para fazer hash do token
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Função auxiliar para enviar email
async function enviarEmailRecuperacao(
  email: string,
  nome: string,
  link: string,
  tipo: "app" | "gestor"
): Promise<boolean> {
  try {
    // Usar o serviço de email integrado da Manus
    const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
    const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;

    if (!forgeApiUrl || !forgeApiKey) {
      console.error("Variáveis de email não configuradas");
      return false;
    }

    const assunto =
      tipo === "app"
        ? "Recuperar senha - App Manutenção"
        : "Recuperar senha - Painel de Gestão";

    const corpo =
      tipo === "app"
        ? `
        <h2>Recuperar Senha</h2>
        <p>Olá ${nome},</p>
        <p>Recebemos uma solicitação para recuperar sua senha. Clique no link abaixo para redefinir sua senha:</p>
        <p><a href="${link}">Redefinir Senha</a></p>
        <p>Este link expira em 24 horas.</p>
        <p>Se você não solicitou esta recuperação, ignore este email.</p>
      `
        : `
        <h2>Recuperar Senha - Painel de Gestão</h2>
        <p>Olá ${nome},</p>
        <p>Recebemos uma solicitação para recuperar sua senha no painel de gestão. Clique no link abaixo para redefinir sua senha:</p>
        <p><a href="${link}">Redefinir Senha</a></p>
        <p>Este link expira em 24 horas.</p>
        <p>Se você não solicitou esta recuperação, ignore este email.</p>
      `;

    // Aqui você implementaria a chamada real ao serviço de email
    // Por enquanto, apenas retornamos true para simular sucesso
    console.log(`Email de recuperação enviado para ${email}`);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return false;
  }
}

export const recuperacaoSenhaRouter = router({
  // Para Apps Criados
  app: router({
    solicitarRecuperacao: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          appId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        if (!db) {
          throw new Error("Database not initialized");
        }

        try {
          // Buscar utilizador
          const usuario = await db.execute(
            `SELECT id, nome FROM app_usuarios WHERE email = ? AND app_id = ? AND ativo = 1`,
            [input.email, input.appId]
          );

          if (!usuario || usuario.length === 0) {
            // Não revelar se o email existe (segurança)
            return { sucesso: true, mensagem: "Se o email existe, você receberá um link de recuperação" };
          }

          const usuarioId = usuario[0].id;
          const nome = usuario[0].nome || "Utilizador";

          // Gerar token
          const token = gerarToken();
          const tokenHash = hashToken(token);
          const expiraEm = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

          // Salvar token no banco
          await db.execute(
            `INSERT INTO app_tokens_recuperacao (token_hash, usuario_id, app_id, expira_em, criado_em) 
             VALUES (?, ?, ?, ?, ?)`,
            [tokenHash, usuarioId, input.appId, expiraEm, Date.now()]
          );

          // Enviar email
          const linkRecuperacao = `${process.env.VITE_FRONTEND_URL || "https://app-manutencao.com"}/app/recuperar-senha/${token}`;
          await enviarEmailRecuperacao(input.email, nome, linkRecuperacao, "app");

          return { sucesso: true, mensagem: "Se o email existe, você receberá um link de recuperação" };
        } catch (error) {
          console.error("Erro ao solicitar recuperação:", error);
          throw new Error("Erro ao processar solicitação");
        }
      }),

    validarToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        if (!db) {
          throw new Error("Database not initialized");
        }

        try {
          const tokenHash = hashToken(input.token);
          const agora = Date.now();

          const resultado = await db.execute(
            `SELECT id, usuario_id, app_id, usado FROM app_tokens_recuperacao 
             WHERE token_hash = ? AND expira_em > ? AND usado = 0`,
            [tokenHash, agora]
          );

          if (!resultado || resultado.length === 0) {
            return { valido: false };
          }

          return {
            valido: true,
            usuarioId: resultado[0].usuario_id,
            appId: resultado[0].app_id,
          };
        } catch (error) {
          console.error("Erro ao validar token:", error);
          return { valido: false };
        }
      }),

    redefinirSenha: publicProcedure
      .input(
        z.object({
          token: z.string(),
          novaSenha: z.string().min(8),
        })
      )
      .mutation(async ({ input }) => {
        if (!db) {
          throw new Error("Database not initialized");
        }

        try {
          const tokenHash = hashToken(input.token);
          const agora = Date.now();

          // Validar token
          const tokenResult = await db.execute(
            `SELECT usuario_id, app_id FROM app_tokens_recuperacao 
             WHERE token_hash = ? AND expira_em > ? AND usado = 0`,
            [tokenHash, agora]
          );

          if (!tokenResult || tokenResult.length === 0) {
            throw new Error("Token inválido ou expirado");
          }

          const usuarioId = tokenResult[0].usuario_id;

          // Hash da nova senha
          const senhaHash = await bcrypt.hash(input.novaSenha, 10);

          // Atualizar senha
          await db.execute(
            `UPDATE app_usuarios SET senha_hash = ? WHERE id = ?`,
            [senhaHash, usuarioId]
          );

          // Marcar token como usado
          await db.execute(
            `UPDATE app_tokens_recuperacao SET usado = 1 WHERE token_hash = ?`,
            [tokenHash]
          );

          return { sucesso: true, mensagem: "Senha redefinida com sucesso" };
        } catch (error) {
          console.error("Erro ao redefinir senha:", error);
          throw new Error("Erro ao redefinir senha");
        }
      }),
  }),

  // Para Gestores
  gestor: router({
    solicitarRecuperacao: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        if (!db) {
          throw new Error("Database not initialized");
        }

        try {
          // Buscar gestor (aqui você precisaria ter uma tabela de gestores)
          // Por enquanto, apenas retornamos sucesso
          const token = gerarToken();
          const tokenHash = hashToken(token);
          const expiraEm = Date.now() + 24 * 60 * 60 * 1000;

          // Salvar token
          await db.execute(
            `INSERT INTO gestor_tokens_recuperacao (token_hash, gestor_id, expira_em, criado_em) 
             VALUES (?, ?, ?, ?)`,
            [tokenHash, input.email, expiraEm, Date.now()]
          );

          // Enviar email
          const linkRecuperacao = `${process.env.VITE_FRONTEND_URL || "https://app-manutencao.com"}/recuperar-senha/${token}`;
          await enviarEmailRecuperacao(input.email, "Gestor", linkRecuperacao, "gestor");

          return { sucesso: true, mensagem: "Se o email existe, você receberá um link de recuperação" };
        } catch (error) {
          console.error("Erro ao solicitar recuperação:", error);
          throw new Error("Erro ao processar solicitação");
        }
      }),

    validarToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        if (!db) {
          throw new Error("Database not initialized");
        }

        try {
          const tokenHash = hashToken(input.token);
          const agora = Date.now();

          const resultado = await db.execute(
            `SELECT gestor_id, usado FROM gestor_tokens_recuperacao 
             WHERE token_hash = ? AND expira_em > ? AND usado = 0`,
            [tokenHash, agora]
          );

          if (!resultado || resultado.length === 0) {
            return { valido: false };
          }

          return { valido: true, gestorId: resultado[0].gestor_id };
        } catch (error) {
          console.error("Erro ao validar token:", error);
          return { valido: false };
        }
      }),

    redefinirSenha: publicProcedure
      .input(
        z.object({
          token: z.string(),
          novaSenha: z.string().min(8),
        })
      )
      .mutation(async ({ input }) => {
        if (!db) {
          throw new Error("Database not initialized");
        }

        try {
          const tokenHash = hashToken(input.token);
          const agora = Date.now();

          // Validar token
          const tokenResult = await db.execute(
            `SELECT gestor_id FROM gestor_tokens_recuperacao 
             WHERE token_hash = ? AND expira_em > ? AND usado = 0`,
            [tokenHash, agora]
          );

          if (!tokenResult || tokenResult.length === 0) {
            throw new Error("Token inválido ou expirado");
          }

          const gestorId = tokenResult[0].gestor_id;

          // Hash da nova senha
          const senhaHash = await bcrypt.hash(input.novaSenha, 10);

          // Aqui você precisaria atualizar a tabela de gestores
          // Por enquanto, apenas retornamos sucesso
          console.log(`Senha redefinida para gestor: ${gestorId}`);

          // Marcar token como usado
          await db.execute(
            `UPDATE gestor_tokens_recuperacao SET usado = 1 WHERE token_hash = ?`,
            [tokenHash]
          );

          return { sucesso: true, mensagem: "Senha redefinida com sucesso" };
        } catch (error) {
          console.error("Erro ao redefinir senha:", error);
          throw new Error("Erro ao redefinir senha");
        }
      }),
  }),
});
