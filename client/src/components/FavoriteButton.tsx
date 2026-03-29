import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  tipoItem: string;
  itemId?: number;
  cardSecaoId?: string;
  condominioId?: number;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "ghost" | "outline";
  className?: string;
  showLabel?: boolean;
}

export default function FavoriteButton({
  tipoItem,
  itemId,
  cardSecaoId,
  condominioId,
  size = "icon",
  variant = "ghost",
  className,
  showLabel = false,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: checkResult, isLoading: checking } = trpc.favorito.check.useQuery(
    { tipoItem, itemId, cardSecaoId },
    { enabled: !!(itemId || cardSecaoId) }
  );

  const toggleFavorite = trpc.favorito.toggle.useMutation({
    onSuccess: (data) => {
      setIsFavorite(data.favorito);
      toast.success(data.favorito ? "Adicionado aos favoritos" : "Removido dos favoritos");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar favorito");
    },
  });

  useEffect(() => {
    if (checkResult !== undefined) {
      setIsFavorite(checkResult);
    }
  }, [checkResult]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite.mutate({ tipoItem, itemId, cardSecaoId, condominioId });
  };

  const isLoading = checking || toggleFavorite.isPending;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(
        "transition-all",
        isFavorite && "text-yellow-500 hover:text-yellow-600",
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
      title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Star
            className={cn(
              "w-4 h-4",
              isFavorite && "fill-current"
            )}
          />
          {showLabel && (
            <span className="ml-2">
              {isFavorite ? "Favorito" : "Favoritar"}
            </span>
          )}
        </>
      )}
    </Button>
  );
}
