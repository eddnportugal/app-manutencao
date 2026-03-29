import { trpc } from "@/lib/trpc";

export function useCondominioAtivo() {
  const { data: condominios, isLoading } = trpc.condominio.list.useQuery();
  
  // Por enquanto, retorna o primeira organização como ativo
  // No futuro, pode ser expandido para permitir seleção de condomínio
  const condominioAtivo = condominios?.[0] || null;
  
  return {
    condominioAtivo,
    condominios: condominios || [],
    isLoading,
  };
}
