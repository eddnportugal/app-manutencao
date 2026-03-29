import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Zap, Loader2, Settings } from "lucide-react";
import { iconMap, CORES_FUNCOES_RAPIDAS } from "./QuickFunctionsEditor";

interface FuncoesRapidasGridProps {
  condominioId: number;
}

export default function FuncoesRapidasGrid({ condominioId }: FuncoesRapidasGridProps) {
  const [, setLocation] = useLocation();
  
  // Query para buscar funções rápidas
  const { data: funcoesRapidas, isLoading } = trpc.funcoesRapidas.listar.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );

  if (isLoading) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Funções Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!funcoesRapidas || funcoesRapidas.length === 0) {
    return (
      <Card className="border-dashed border-amber-200 bg-amber-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Funções Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Zap className="h-12 w-12 mx-auto text-amber-300 mb-3" />
            <p className="text-muted-foreground text-sm mb-4">
              Nenhuma função rápida configurada.
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Clique no ícone <Zap className="h-3 w-3 inline text-amber-500" /> ao lado de qualquer função no menu lateral para adicioná-la aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
            Funções Rápidas
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {funcoesRapidas.length}/12
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {/* Grid 6x2 */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {funcoesRapidas.map((funcao, index) => {
            const IconComponent = iconMap[funcao.icone] || Zap;
            const cor = funcao.cor || CORES_FUNCOES_RAPIDAS[index % CORES_FUNCOES_RAPIDAS.length];
            
            return (
              <button
                key={funcao.id}
                onClick={() => setLocation(funcao.path)}
                className={cn(
                  "group relative flex flex-col items-center justify-center p-3 rounded-xl",
                  "transition-all duration-200 active:scale-95",
                  "border border-slate-100 hover:border-slate-200 bg-white hover:shadow-md",
                  "dark:bg-card dark:border-slate-800"
                )}
              >
                {/* Ícone */}
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: `${cor}15` }}
                >
                  <IconComponent 
                    className="h-5 w-5" 
                    style={{ color: cor }}
                  />
                </div>
                
                {/* Nome da função */}
                <span 
                  className="text-[11px] font-semibold text-center line-clamp-2 leading-tight text-slate-700 dark:text-slate-300"
                >
                  {funcao.nome}
                </span>

                {/* Indicador de hover */}
                {/* Removido o overlay antigo para visual mais limpo */}
              </button>
            );
          })}
        </div>
        
        {/* Dica se tiver menos de 12 */}
        {funcoesRapidas.length < 12 && (
          <p className="text-xs text-muted-foreground text-center mt-4">
            Adicione mais funções clicando no <Zap className="h-3 w-3 inline text-amber-500" /> no menu lateral
          </p>
        )}
      </CardContent>
    </Card>
  );
}
