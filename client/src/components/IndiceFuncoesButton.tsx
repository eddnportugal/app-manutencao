import { Link } from "wouter";
import { BookOpen } from "lucide-react";

/**
 * Botão de atalho para o Índice de Funções do sistema.
 * Pode ser usado em qualquer página de função para navegar
 * rapidamente ao catálogo completo.
 * 
 * variant:
 *  - "light" (padrão): fundo branco translúcido — ideal para headers com gradient colorido
 *  - "default": fundo laranja suave — ideal para headers claros
 */
export function IndiceFuncoesButton({ variant = "light" }: { variant?: "light" | "default" }) {
  const isLight = variant === "light";

  return (
    <Link href="/dashboard/indice-funcoes">
      <button
        className={
          isLight
            ? "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/20 transition-all"
            : "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-200 transition-all"
        }
        title="Ver todas as funções do sistema"
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Todas as Funções</span>
      </button>
    </Link>
  );
}
