/**
 * Verificação de ownership: garante que o usuário logado
 * é o síndico do condomínio sendo acessado.
 * 
 * Uso nos routers:
 *   await verifyCondominioOwnership(db, ctx.user.id, input.condominioId);
 */
import { eq } from "drizzle-orm";
import { condominios } from "../../drizzle/schema";

/**
 * Verifica se o userId é o síndico do condomínio.
 * Lança erro se não for (previne acesso cross-condomínio).
 */
export async function verifyCondominioOwnership(
  db: any,
  userId: number,
  condominioId: number
): Promise<void> {
  const [condominio] = await db
    .select({ sindicoId: condominios.sindicoId })
    .from(condominios)
    .where(eq(condominios.id, condominioId))
    .limit(1);

  if (!condominio) {
    throw new Error("Condomínio não encontrado");
  }

  if (condominio.sindicoId !== userId) {
    throw new Error("Sem permissão para acessar dados deste condomínio");
  }
}
