/**
 * Rate Limiter in-memory para endpoints sensíveis.
 * Protege contra brute-force em login, registro e recuperação de senha.
 * 
 * Estratégia: sliding window por IP + chave (ex: email).
 * Em produção com múltiplas instâncias, substituir por Redis.
 */

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

interface RateLimitConfig {
  /** Número máximo de tentativas na janela */
  maxAttempts: number;
  /** Janela de tempo em ms (padrão: 15 min) */
  windowMs: number;
  /** Tempo de bloqueio após exceder limite em ms (padrão: 15 min) */
  blockDurationMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 10,
  windowMs: 15 * 60 * 1000,       // 15 minutos
  blockDurationMs: 15 * 60 * 1000, // 15 minutos de bloqueio
};

// Configurações específicas por tipo de operação
export const RATE_LIMIT_CONFIGS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 15 * 60 * 1000 },
  register: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 },
  passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000, blockDurationMs: 60 * 60 * 1000 },
  magicLink: { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 },
} as const;

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    // Limpeza periódica de entradas expiradas (a cada 5 min)
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Verifica se a ação está permitida. Se não, lança erro.
   * @param key Chave única (ex: "login:192.168.1.1:user@email.com")
   * @param config Configuração do rate limit
   */
  check(key: string, config: RateLimitConfig = DEFAULT_CONFIG): void {
    const now = Date.now();
    const entry = this.store.get(key);

    if (entry) {
      // Se está bloqueado, verificar se o bloqueio expirou
      if (entry.blockedUntil && now < entry.blockedUntil) {
        const remainingSec = Math.ceil((entry.blockedUntil - now) / 1000);
        throw new Error(
          `Muitas tentativas. Tente novamente em ${remainingSec} segundos.`
        );
      }

      // Se a janela expirou, resetar
      if (now - entry.firstAttempt > config.windowMs) {
        this.store.set(key, { count: 1, firstAttempt: now });
        return;
      }

      // Incrementar contador
      entry.count++;

      // Se excedeu o limite, bloquear
      if (entry.count > config.maxAttempts) {
        entry.blockedUntil = now + config.blockDurationMs;
        const remainingSec = Math.ceil(config.blockDurationMs / 1000);
        throw new Error(
          `Muitas tentativas. Tente novamente em ${remainingSec} segundos.`
        );
      }
    } else {
      // Primeira tentativa
      this.store.set(key, { count: 1, firstAttempt: now });
    }
  }

  /** Resetar contador para uma chave (ex: após login bem-sucedido) */
  reset(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    this.store.forEach((entry, key) => {
      const maxAge = Math.max(
        entry.blockedUntil ? entry.blockedUntil - entry.firstAttempt : 0,
        60 * 60 * 1000 // mínimo 1h antes de limpar
      );
      if (now - entry.firstAttempt > maxAge) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.store.delete(key));
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Instância global singleton
export const rateLimiter = new RateLimiter();

/**
 * Helper para extrair IP de um request tRPC (via ctx.req)
 */
export function getClientIp(req: any): string {
  return (
    req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
    req?.headers?.['x-real-ip'] ||
    req?.socket?.remoteAddress ||
    req?.ip ||
    'unknown'
  );
}
