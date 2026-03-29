import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

/**
 * Wrapper para rotas protegidas.
 * Redireciona para /login se o usuário não estiver autenticado.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [checked, setChecked] = useState(false);
  
  const { data: user, isLoading } = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000, // cache por 5 min
  });

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/login");
      } else {
        setChecked(true);
      }
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || !checked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
