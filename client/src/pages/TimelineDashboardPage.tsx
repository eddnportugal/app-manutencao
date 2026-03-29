import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Calendar,
  User,
  Activity,
  Zap,
  Eye
} from "lucide-react";
import { Link } from "wouter";

// Cores para os gráficos
const CORES_STATUS = [
  "#22c55e", // Verde - Finalizado
  "#3b82f6", // Azul - Em Andamento
  "#f59e0b", // Amarelo - Pendente
  "#ef4444", // Vermelho - Urgente
  "#8b5cf6", // Roxo - Outros
  "#06b6d4", // Ciano
  "#ec4899", // Rosa
  "#84cc16", // Lima
];

const CORES_PRIORIDADE = {
  "Crítica": "#dc2626",
  "Urgente": "#ef4444",
  "Alta": "#f97316",
  "Média": "#f59e0b",
  "Normal": "#3b82f6",
  "Baixa": "#22c55e",
  "Sem prioridade": "#6b7280",
};

interface TimelineDashboardPageProps {
  condominioId: number;
}

export default function TimelineDashboardPage({ condominioId }: TimelineDashboardPageProps) {
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState<"7dias" | "30dias" | "90dias" | "ano" | "todos">("30dias");

  const { data: estatisticas, isLoading: loadingEstatisticas, refetch: refetchEstatisticas } = 
    trpc.timeline.estatisticas.useQuery({ condominioId, periodo });
  
  const { data: alertas, isLoading: loadingAlertas, refetch: refetchAlertas } = 
    trpc.timeline.alertas.useQuery({ condominioId, limite: 10 });
  
  const { data: resumo, isLoading: loadingResumo, refetch: refetchResumo } = 
    trpc.timeline.resumoRapido.useQuery({ condominioId });

  const handleRefresh = () => {
    refetchEstatisticas();
    refetchAlertas();
    refetchResumo();
  };

  // Calcular percentuais para gráfico de pizza
  const calcularPercentuais = (dados: { nome: string; quantidade: number }[]) => {
    const total = dados.reduce((acc, d) => acc + d.quantidade, 0);
    return dados.map(d => ({
      ...d,
      percentual: total > 0 ? Math.round((d.quantidade / total) * 100) : 0
    }));
  };

  // Renderizar gráfico de pizza simples com CSS
  const renderGraficoPizza = (dados: { nome: string; quantidade: number }[], cores: string[]) => {
    const total = dados.reduce((acc, d) => acc + d.quantidade, 0);
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>Sem dados para exibir</p>
        </div>
      );
    }

    let acumulado = 0;
    const segmentos = dados.map((d, i) => {
      const percentual = (d.quantidade / total) * 100;
      const inicio = acumulado;
      acumulado += percentual;
      return { ...d, percentual, inicio, fim: acumulado, cor: cores[i % cores.length] };
    });

    const gradiente = segmentos
      .map(s => `${s.cor} ${s.inicio}% ${s.fim}%`)
      .join(", ");

    return (
      <div className="flex items-center gap-6">
        <div 
          className="w-40 h-40 rounded-full shadow-lg"
          style={{ background: `conic-gradient(${gradiente})` }}
        />
        <div className="flex flex-col gap-2">
          {segmentos.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.cor }} />
              <span className="text-gray-700 dark:text-gray-300">{s.nome}</span>
              <span className="font-semibold">{s.quantidade}</span>
              <span className="text-gray-500">({s.percentual.toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Renderizar gráfico de barras simples com CSS
  const renderGraficoBarras = (dados: { nome: string; quantidade: number }[], corBase: string = "#f97316") => {
    const maxValor = Math.max(...dados.map(d => d.quantidade), 1);
    
    if (dados.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>Sem dados para exibir</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {dados.map((d, i) => {
          const largura = (d.quantidade / maxValor) * 100;
          const cor = (CORES_PRIORIDADE as Record<string, string>)[d.nome] || corBase;
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-[200px]">{d.nome}</span>
                <span className="font-semibold">{d.quantidade}</span>
              </div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${largura}%`, backgroundColor: cor }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Renderizar gráfico de linha simples com SVG
  const renderGraficoLinha = (dados: { data: string; criadas: number; finalizadas: number }[]) => {
    if (dados.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>Sem dados para exibir</p>
        </div>
      );
    }

    const maxValor = Math.max(...dados.flatMap(d => [d.criadas, d.finalizadas]), 1);
    const largura = 100;
    const altura = 150;
    const padding = 30;
    const larguraUtil = largura - padding * 2;
    const alturaUtil = altura - padding * 2;

    const pontosX = dados.length > 1 
      ? dados.map((_, i) => padding + (i / (dados.length - 1)) * larguraUtil)
      : [largura / 2];
    
    const pontosCriadas = dados.map((d, i) => ({
      x: pontosX[i],
      y: altura - padding - (d.criadas / maxValor) * alturaUtil
    }));
    
    const pontosFinalizadas = dados.map((d, i) => ({
      x: pontosX[i],
      y: altura - padding - (d.finalizadas / maxValor) * alturaUtil
    }));

    const linhaPath = (pontos: { x: number; y: number }[]) => {
      if (pontos.length === 0) return "";
      return pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    };

    return (
      <div className="w-full">
        <svg viewBox={`0 0 ${largura} ${altura}`} className="w-full h-48">
          {/* Linhas de grade */}
          {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
            <line
              key={i}
              x1={padding}
              y1={altura - padding - v * alturaUtil}
              x2={largura - padding}
              y2={altura - padding - v * alturaUtil}
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Linha de criadas */}
          <path
            d={linhaPath(pontosCriadas)}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Linha de finalizadas */}
          <path
            d={linhaPath(pontosFinalizadas)}
            fill="none"
            stroke="#22c55e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Pontos criadas */}
          {pontosCriadas.map((p, i) => (
            <circle key={`c-${i}`} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
          ))}
          
          {/* Pontos finalizadas */}
          {pontosFinalizadas.map((p, i) => (
            <circle key={`f-${i}`} cx={p.x} cy={p.y} r="3" fill="#22c55e" />
          ))}
        </svg>
        
        <div className="flex justify-center gap-6 mt-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Criadas</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Finalizadas</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-orange-500" />
            Dashboard de Timelines
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral e estatísticas das suas timelines
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={periodo} onValueChange={(v: typeof periodo) => setPeriodo(v)}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7dias">Últimos 7 dias</SelectItem>
              <SelectItem value="30dias">Últimos 30 dias</SelectItem>
              <SelectItem value="90dias">Últimos 90 dias</SelectItem>
              <SelectItem value="ano">Último ano</SelectItem>
              <SelectItem value="todos">Todo período</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Cards de Resumo Rápido */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Ativas</p>
                {loadingResumo ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{resumo?.totalAtivas || 0}</p>
                )}
              </div>
              <Activity className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Pendentes</p>
                {loadingResumo ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{resumo?.pendentes || 0}</p>
                )}
              </div>
              <Clock className="w-8 h-8 text-yellow-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Em Andamento</p>
                {loadingResumo ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{resumo?.emAndamento || 0}</p>
                )}
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Finalizadas Hoje</p>
                {loadingResumo ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{resumo?.finalizadasHoje || 0}</p>
                )}
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-cyan-200 dark:border-cyan-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Criadas Hoje</p>
                {loadingResumo ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{resumo?.criadasHoje || 0}</p>
                )}
              </div>
              <Zap className="w-8 h-8 text-cyan-500 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 dark:text-red-400 font-medium">Urgentes</p>
                {loadingResumo ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{resumo?.urgentes || 0}</p>
                )}
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="w-5 h-5 text-orange-500" />
              Distribuição por Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEstatisticas ? (
              <div className="flex items-center justify-center h-48">
                <Skeleton className="w-40 h-40 rounded-full" />
              </div>
            ) : (
              renderGraficoPizza(estatisticas?.porStatus || [], CORES_STATUS)
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Prioridade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              Distribuição por Prioridade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEstatisticas ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              renderGraficoBarras(estatisticas?.porPrioridade || [])
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Evolução Temporal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Evolução Temporal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEstatisticas ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              renderGraficoLinha(estatisticas?.evolucaoTemporal || [])
            )}
          </CardContent>
        </Card>

        {/* Top Responsáveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-orange-500" />
              Top Responsáveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEstatisticas ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              renderGraficoBarras(estatisticas?.porResponsavel || [], "#8b5cf6")
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Alertas e Pendências
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAlertas ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : alertas && alertas.length > 0 ? (
            <div className="space-y-3">
              {alertas.map((alerta) => (
                <div 
                  key={alerta.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    alerta.urgencia === "alta" 
                      ? "bg-red-50 dark:bg-red-900/20 border-red-500" 
                      : alerta.urgencia === "media"
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                      : "bg-gray-50 dark:bg-gray-800/50 border-gray-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {alerta.titulo}
                        </h4>
                        <Badge variant={
                          alerta.urgencia === "alta" ? "destructive" : 
                          alerta.urgencia === "media" ? "default" : "secondary"
                        }>
                          {alerta.urgencia === "alta" ? "Urgente" : 
                           alerta.urgencia === "media" ? "Atenção" : "Normal"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {alerta.responsavel || "Sem responsável"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alerta.status || "Sem status"}
                        </span>
                        <span>{alerta.mensagem}</span>
                      </div>
                    </div>
                    <Link href={`/dashboard/timeline-historico`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <CheckCircle2 className="w-12 h-12 mb-3 text-green-500" />
              <p className="text-lg font-medium">Tudo em dia!</p>
              <p className="text-sm">Não há alertas ou pendências no momento.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/timeline">
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
            <Zap className="w-4 h-4 mr-2" />
            Nova Timeline
          </Button>
        </Link>
        <Link href="/dashboard/timeline-historico">
          <Button variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            Ver Histórico
          </Button>
        </Link>
      </div>
    </div>
  );
}
