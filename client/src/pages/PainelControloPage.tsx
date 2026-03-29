import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, 
  BarChart, 
  LineChart, 
  StatCard, 
  CircularProgress,
  statusColors,
  prioridadeColors,
  tipoManutencaoColors,
  categoriaOcorrenciaColors
} from "@/components/Charts";
import { 
  ClipboardCheck, 
  Wrench, 
  AlertTriangle, 
  CheckSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChartIcon,
  Activity
} from "lucide-react";

interface PainelControloPageProps {
  condominioId: number;
}

export function PainelControloPage({ condominioId }: PainelControloPageProps) {
  const [periodo, setPeriodo] = useState<number>(30);
  
  // Queries
  const { data: estatisticas, isLoading: loadingStats } = trpc.painelControlo.getEstatisticasGerais.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: evolucao, isLoading: loadingEvolucao } = trpc.painelControlo.getEvolucaoTemporal.useQuery(
    { condominioId, dias: periodo },
    { enabled: !!condominioId }
  );
  
  const { data: prioridades, isLoading: loadingPrioridades } = trpc.painelControlo.getDistribuicaoPrioridade.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: itensRecentes, isLoading: loadingRecentes } = trpc.painelControlo.getItensRecentes.useQuery(
    { condominioId, limite: 10 },
    { enabled: !!condominioId }
  );

  const isLoading = loadingStats || loadingEvolucao || loadingPrioridades || loadingRecentes;

  // Preparar dados para gráficos
  const statusPieData = estatisticas ? [
    { label: "Pendentes", value: estatisticas.totais?.pendentes || 0, color: statusColors.pendente },
    { label: "Finalizadas", value: estatisticas.totais?.finalizadas || 0, color: statusColors.finalizada },
    { label: "Total Outros", value: (estatisticas.totais?.total || 0) - (estatisticas.totais?.pendentes || 0) - (estatisticas.totais?.finalizadas || 0), color: "#94a3b8" },
  ] : [];

  const vistoriasStatusData = estatisticas ? [
    { label: "Pendentes", value: estatisticas.vistorias.pendentes, color: statusColors.pendente },
    { label: "Realizadas", value: estatisticas.vistorias.realizadas, color: statusColors.realizada },
    { label: "Ação Necessária", value: estatisticas.vistorias.acaoNecessaria, color: statusColors.acao_necessaria },
    { label: "Finalizadas", value: estatisticas.vistorias.finalizadas, color: statusColors.finalizada },
    { label: "Reabertas", value: estatisticas.vistorias.reabertas, color: statusColors.reaberta },
  ] : [];

  const manutencoesStatusData = estatisticas ? [
    { label: "Pendentes", value: estatisticas.manutencoes.pendentes, color: statusColors.pendente },
    { label: "Realizadas", value: estatisticas.manutencoes.realizadas, color: statusColors.realizada },
    { label: "Ação Necessária", value: estatisticas.manutencoes.acaoNecessaria, color: statusColors.acao_necessaria },
    { label: "Finalizadas", value: estatisticas.manutencoes.finalizadas, color: statusColors.finalizada },
    { label: "Reabertas", value: estatisticas.manutencoes.reabertas, color: statusColors.reaberta },
  ] : [];

  const manutencoesTipoData = estatisticas ? [
    { label: "Preventiva", value: estatisticas.manutencoes.porTipo.preventiva, color: tipoManutencaoColors.preventiva },
    { label: "Corretiva", value: estatisticas.manutencoes.porTipo.corretiva, color: tipoManutencaoColors.corretiva },
    { label: "Emergencial", value: estatisticas.manutencoes.porTipo.emergencial, color: tipoManutencaoColors.emergencial },
    { label: "Programada", value: estatisticas.manutencoes.porTipo.programada, color: tipoManutencaoColors.programada },
  ] : [];

  const ocorrenciasStatusData = estatisticas ? [
    { label: "Pendentes", value: estatisticas.ocorrencias.pendentes, color: statusColors.pendente },
    { label: "Realizadas", value: estatisticas.ocorrencias.realizadas, color: statusColors.realizada },
    { label: "Ação Necessária", value: estatisticas.ocorrencias.acaoNecessaria, color: statusColors.acao_necessaria },
    { label: "Finalizadas", value: estatisticas.ocorrencias.finalizadas, color: statusColors.finalizada },
    { label: "Reabertas", value: estatisticas.ocorrencias.reabertas, color: statusColors.reaberta },
  ] : [];

  const ocorrenciasCategoriaData = estatisticas ? [
    { label: "Segurança", value: estatisticas.ocorrencias.porCategoria.seguranca, color: categoriaOcorrenciaColors.seguranca },
    { label: "Barulho", value: estatisticas.ocorrencias.porCategoria.barulho, color: categoriaOcorrenciaColors.barulho },
    { label: "Manutenção", value: estatisticas.ocorrencias.porCategoria.manutencao, color: categoriaOcorrenciaColors.manutencao },
    { label: "Convivência", value: estatisticas.ocorrencias.porCategoria.convivencia, color: categoriaOcorrenciaColors.convivencia },
    { label: "Animais", value: estatisticas.ocorrencias.porCategoria.animais, color: categoriaOcorrenciaColors.animais },
    { label: "Estacionamento", value: estatisticas.ocorrencias.porCategoria.estacionamento, color: categoriaOcorrenciaColors.estacionamento },
    { label: "Limpeza", value: estatisticas.ocorrencias.porCategoria.limpeza, color: categoriaOcorrenciaColors.limpeza },
    { label: "Outros", value: estatisticas.ocorrencias.porCategoria.outros, color: categoriaOcorrenciaColors.outros },
  ] : [];

  const checklistsStatusData = estatisticas ? [
    { label: "Pendentes", value: estatisticas.checklists.pendentes, color: statusColors.pendente },
    { label: "Realizadas", value: estatisticas.checklists.realizadas, color: statusColors.realizada },
    { label: "Ação Necessária", value: estatisticas.checklists.acaoNecessaria, color: statusColors.acao_necessaria },
    { label: "Finalizadas", value: estatisticas.checklists.finalizadas, color: statusColors.finalizada },
    { label: "Reabertas", value: estatisticas.checklists.reabertas, color: statusColors.reaberta },
  ] : [];

  const prioridadeBarData = prioridades ? prioridades.map(p => ({
    label: p.prioridade.charAt(0).toUpperCase() + p.prioridade.slice(1),
    values: [
      { name: "Vistorias", value: p.vistorias, color: "#3b82f6" },
      { name: "Manutenções", value: p.manutencoes, color: "#22c55e" },
      { name: "Ocorrências", value: p.ocorrencias, color: "#f59e0b" },
    ]
  })) : [];

  const evolucaoLineData = evolucao ? {
    labels: evolucao.map(e => {
      const date = new Date(e.data);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      { name: "Vistorias", values: evolucao.map(e => e.vistorias), color: "#3b82f6" },
      { name: "Manutenções", values: evolucao.map(e => e.manutencoes), color: "#22c55e" },
      { name: "Ocorrências", values: evolucao.map(e => e.ocorrencias), color: "#f59e0b" },
      { name: "Checklists", values: evolucao.map(e => e.checklists), color: "#8b5cf6" },
    ]
  } : { labels: [], datasets: [] };

  // Calcular taxa de conclusão
  const taxaConclusao = estatisticas && estatisticas.totais && estatisticas.totais.total > 0
    ? Math.round((estatisticas.totais.finalizadas / estatisticas.totais.total) * 100)
    : 0;

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
      pendente: { label: "Pendente", color: "text-amber-700", bg: "bg-amber-100" },
      realizada: { label: "Realizada", color: "text-blue-700", bg: "bg-blue-100" },
      acao_necessaria: { label: "Ação Necessária", color: "text-red-700", bg: "bg-red-100" },
      finalizada: { label: "Finalizada", color: "text-green-700", bg: "bg-green-100" },
      reaberta: { label: "Reaberta", color: "text-purple-700", bg: "bg-purple-100" },
    };
    const config = statusConfig[status] || { label: status, color: "text-gray-700", bg: "bg-gray-100" };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "vistoria": return <ClipboardCheck className="h-4 w-4 text-blue-500" />;
      case "manutencao": return <Wrench className="h-4 w-4 text-green-500" />;
      case "ocorrencia": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "checklist": return <CheckSquare className="h-4 w-4 text-purple-500" />;
      default: return null;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "vistoria": return "Vistoria";
      case "manutencao": return "Manutenção";
      case "ocorrencia": return "Ocorrência";
      case "checklist": return "Checklist";
      default: return tipo;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Painel de Controlo
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral das métricas de Vistorias, Manutenções, Ocorrências e Checklists
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo.toString()} onValueChange={(v) => setPeriodo(Number(v))}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Registos"
          value={estatisticas?.totais?.total || 0}
          subtitle="Todos os tipos"
          icon={<Activity className="h-5 w-5" />}
          color="primary"
        />
        <StatCard
          title="Pendentes"
          value={estatisticas?.totais?.pendentes || 0}
          subtitle="Aguardando ação"
          icon={<Clock className="h-5 w-5" />}
          color="warning"
        />
        <StatCard
          title="Finalizados"
          value={estatisticas?.totais?.finalizadas || 0}
          subtitle="Concluídos com sucesso"
          icon={<CheckCircle className="h-5 w-5" />}
          color="success"
        />
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-3xl font-bold mt-1">{taxaConclusao}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {estatisticas?.totais?.finalizadas || 0} de {estatisticas?.totais?.total || 0}
                </p>
              </div>
              <CircularProgress 
                value={taxaConclusao} 
                color={taxaConclusao >= 70 ? "#22c55e" : taxaConclusao >= 40 ? "#f59e0b" : "#ef4444"}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards por Secção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardCheck className="h-5 w-5 text-blue-500" />
              <span className="font-medium">Vistorias</span>
            </div>
            <p className="text-2xl font-bold">{estatisticas?.vistorias.total || 0}</p>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-amber-600">{estatisticas?.vistorias.pendentes || 0} pendentes</span>
              <span className="text-green-600">{estatisticas?.vistorias.finalizadas || 0} finalizadas</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-5 w-5 text-green-500" />
              <span className="font-medium">Manutenções</span>
            </div>
            <p className="text-2xl font-bold">{estatisticas?.manutencoes.total || 0}</p>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-amber-600">{estatisticas?.manutencoes.pendentes || 0} pendentes</span>
              <span className="text-green-600">{estatisticas?.manutencoes.finalizadas || 0} finalizadas</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <span className="font-medium">Ocorrências</span>
            </div>
            <p className="text-2xl font-bold">{estatisticas?.ocorrencias.total || 0}</p>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-amber-600">{estatisticas?.ocorrencias.pendentes || 0} pendentes</span>
              <span className="text-green-600">{estatisticas?.ocorrencias.finalizadas || 0} finalizadas</span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="h-5 w-5 text-purple-500" />
              <span className="font-medium">Checklists</span>
            </div>
            <p className="text-2xl font-bold">{estatisticas?.checklists.total || 0}</p>
            <div className="flex gap-2 mt-2 text-xs">
              <span className="text-amber-600">{estatisticas?.checklists.pendentes || 0} pendentes</span>
              <span className="text-green-600">{estatisticas?.checklists.finalizadas || 0} finalizadas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geral" className="flex items-center gap-2">
            <PieChartIcon className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="vistorias" className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Vistorias
          </TabsTrigger>
          <TabsTrigger value="manutencoes" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Manutenções
          </TabsTrigger>
          <TabsTrigger value="ocorrencias" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Ocorrências
          </TabsTrigger>
          <TabsTrigger value="checklists" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Checklists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LineChart 
              data={evolucaoLineData} 
              title={`Evolução Temporal (${periodo} dias)`}
              height={250}
            />
            <BarChart 
              data={prioridadeBarData} 
              title="Distribuição por Prioridade"
              height={250}
            />
          </div>
        </TabsContent>

        <TabsContent value="vistorias" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PieChart 
              data={vistoriasStatusData} 
              title="Vistorias por Status"
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Resumo de Vistorias</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vistoriasStatusData.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.value}</span>
                        <span className="text-xs text-muted-foreground">
                          ({estatisticas?.vistorias.total ? Math.round((item.value / estatisticas.vistorias.total) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manutencoes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PieChart 
              data={manutencoesStatusData} 
              title="Manutenções por Status"
            />
            <PieChart 
              data={manutencoesTipoData} 
              title="Manutenções por Tipo"
            />
          </div>
        </TabsContent>

        <TabsContent value="ocorrencias" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PieChart 
              data={ocorrenciasStatusData} 
              title="Ocorrências por Status"
            />
            <PieChart 
              data={ocorrenciasCategoriaData} 
              title="Ocorrências por Categoria"
            />
          </div>
        </TabsContent>

        <TabsContent value="checklists" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PieChart 
              data={checklistsStatusData} 
              title="Checklists por Status"
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Resumo de Checklists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklistsStatusData.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.value}</span>
                        <span className="text-xs text-muted-foreground">
                          ({estatisticas?.checklists.total ? Math.round((item.value / estatisticas.checklists.total) * 100) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Itens Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {itensRecentes && itensRecentes.length > 0 ? (
            <div className="space-y-3">
              {itensRecentes.map((item, index) => (
                <div 
                  key={`${item.tipo}-${index}`} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTipoIcon((item as { itemTipo?: string }).itemTipo || "")}
                    <div>
                      <p className="font-medium text-sm">
                        {(item as { titulo?: string }).titulo || getTipoLabel((item as { itemTipo?: string }).itemTipo || "")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getTipoLabel((item as { itemTipo?: string }).itemTipo || "")} • {(item as { protocolo?: string }).protocolo || "Sem protocolo"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge((item as { status?: string }).status || "pendente")}
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma atividade recente</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
