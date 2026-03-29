import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Wrench,
  ClipboardCheck,
  FileText,
  PieChart
} from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import Chart from "chart.js/auto";
import { useTranslation } from "react-i18next";

interface DashboardChartsProps {
  condominioId?: number;
}

export function DashboardCharts({ condominioId }: DashboardChartsProps) {
  const { t, i18n } = useTranslation();
  const chartOsStatusRef = useRef<HTMLCanvasElement>(null);
  const chartOsTipoRef = useRef<HTMLCanvasElement>(null);
  const chartOsMensalRef = useRef<HTMLCanvasElement>(null);
  const chartInstancesRef = useRef<Chart[]>([]);

  // Buscar lista de OS para calcular estatísticas
  const { data: osListData } = trpc.ordensServico.list.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId }
  );
  const osList = (osListData as any)?.items || osListData;

  // Buscar lista de manutenções
  const { data: manutencaoList } = trpc.manutencao.list.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId }
  );

  // Buscar lista de vistorias
  const { data: vistoriaList } = trpc.vistoria.list.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId }
  );

  // Buscar lista de checklists
  const { data: checklistList } = trpc.checklist.list.useQuery(
    { condominioId: condominioId || 0 },
    { enabled: !!condominioId }
  );

  // Calcular estatísticas a partir das listas
  const osStats = useMemo(() => {
    if (!osList) return null;
    const total = osList.length;
    const concluidas = osList.filter((os: any) => 
      os.status?.nome?.toLowerCase().includes('conclu') || 
      os.status?.nome?.toLowerCase().includes('fechad') ||
      os.status?.nome?.toLowerCase().includes('finaliz')
    ).length;
    const abertas = total - concluidas;
    const atrasadas = osList.filter((os: any) => 
      os.prazo && new Date(os.prazo) < new Date() && 
      !(os.status?.nome?.toLowerCase().includes('conclu') || 
        os.status?.nome?.toLowerCase().includes('fechad'))
    ).length;
    
    // Agrupar por status
    const statusCount: Record<string, { count: number; cor: string }> = {};
    osList.forEach((os: any) => {
      const statusNome = os.status?.nome || 'Sem status';
      const statusCor = os.status?.cor || '#6B7280';
      if (!statusCount[statusNome]) {
        statusCount[statusNome] = { count: 0, cor: statusCor };
      }
      statusCount[statusNome].count++;
    });
    
    const porStatus = Object.entries(statusCount).map(([status, data]) => ({
      status,
      count: data.count,
      cor: data.cor
    }));
    
    // Agrupar por mês
    const mesCount: Record<string, number> = {};
    osList.forEach((os: any) => {
      const date = new Date(os.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      mesCount[key] = (mesCount[key] || 0) + 1;
    });
    
    const porMes = Object.entries(mesCount).map(([key, count]) => {
      const [ano, mes] = key.split('-').map(Number);
      return { ano, mes, count };
    });
    
    return { total, abertas, concluidas, atrasadas, porStatus, porMes };
  }, [osList]);

  // Destruir gráficos antigos ao desmontar
  useEffect(() => {
    return () => {
      chartInstancesRef.current.forEach(chart => chart.destroy());
    };
  }, []);

  // Criar gráfico de OS por Status
  useEffect(() => {
    if (!chartOsStatusRef.current || !osStats?.porStatus) return;

    // Destruir gráfico anterior se existir
    const existingChart = chartInstancesRef.current.find(
      c => c.canvas === chartOsStatusRef.current
    );
    if (existingChart) {
      existingChart.destroy();
      chartInstancesRef.current = chartInstancesRef.current.filter(
        c => c.canvas !== chartOsStatusRef.current
      );
    }

    const ctx = chartOsStatusRef.current.getContext("2d");
    if (!ctx) return;

    const statusData = osStats.porStatus || [];
    const labels = statusData.map((s: any) => s.status || t('dashboard.charts.noStatus'));
    const data = statusData.map((s: any) => s.count || 0);
    const colors = [
      "#f97316", // laranja
      "#22c55e", // verde
      "#3b82f6", // azul
      "#eab308", // amarelo
      "#ef4444", // vermelho
      "#8b5cf6", // roxo
    ];

    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              usePointStyle: true,
              font: { size: 11 }
            }
          }
        }
      }
    });

    chartInstancesRef.current.push(chart);
  }, [osStats?.porStatus, t]);

  // Criar gráfico de OS por Mês
  useEffect(() => {
    if (!chartOsMensalRef.current || !osStats?.porMes) return;

    const existingChart = chartInstancesRef.current.find(
      c => c.canvas === chartOsMensalRef.current
    );
    if (existingChart) {
      existingChart.destroy();
      chartInstancesRef.current = chartInstancesRef.current.filter(
        c => c.canvas !== chartOsMensalRef.current
      );
    }

    const ctx = chartOsMensalRef.current.getContext("2d");
    if (!ctx) return;

    const getMonthName = (monthIndex: number) => {
      const date = new Date(2023, monthIndex, 1);
      return new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(date);
    };

    const mesData = osStats.porMes || [];
    
    // Preencher dados dos últimos 6 meses
    const hoje = new Date();
    const labels: string[] = [];
    const data: number[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mesLabel = getMonthName(d.getMonth());
      labels.push(mesLabel);
      
      const mesNum = d.getMonth() + 1;
      const anoNum = d.getFullYear();
      const found = mesData.find((m: any) => m.mes === mesNum && m.ano === anoNum);
      data.push(found?.count || 0);
    }

    const chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: t('dashboard.charts.serviceOrders'),
          data,
          backgroundColor: "#f97316",
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });

    chartInstancesRef.current.push(chart);
  }, [osStats?.porMes, t, i18n.language]);

  // Calcular KPIs
  const totalOS = osStats?.total || 0;
  const osAbertas = osStats?.abertas || 0;
  const osConcluidas = osStats?.concluidas || 0;
  const osAtrasadas = osStats?.atrasadas || 0;
  const taxaConclusao = totalOS > 0 ? Math.round((osConcluidas / totalOS) * 100) : 0;

  const totalManutencoes = manutencaoList?.length || 0;
  const totalVistorias = vistoriaList?.length || 0;
  const totalChecklists = checklistList?.length || 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500 shadow-lg shadow-orange-500/25">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{totalOS}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard.charts.totalOS')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500 shadow-lg shadow-blue-500/25">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{osAbertas}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard.charts.openOS')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-500 shadow-lg shadow-green-500/25">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{taxaConclusao}%</p>
                <p className="text-xs text-muted-foreground">{t('dashboard.charts.completionRate')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500 shadow-lg shadow-red-500/25">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{osAtrasadas}</p>
                <p className="text-xs text-muted-foreground">{t('dashboard.charts.overdueOS')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico de OS por Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <PieChart className="w-4 h-4 text-orange-500" />
              {t('dashboard.charts.osByStatus')}
            </CardTitle>
            <CardDescription>{t('dashboard.charts.osDistribution')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <canvas ref={chartOsStatusRef}></canvas>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de OS por Mês */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              {t('dashboard.charts.osLast6Months')}
            </CardTitle>
            <CardDescription>{t('dashboard.charts.osEvolution')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <canvas ref={chartOsMensalRef}></canvas>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-orange-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Wrench className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{totalManutencoes}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.charts.maintenances')}</p>
          </CardContent>
        </Card>

        <Card className="border border-blue-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">{totalVistorias}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.charts.inspections')}</p>
          </CardContent>
        </Card>

        <Card className="border border-green-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{totalChecklists}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.charts.checklists')}</p>
          </CardContent>
        </Card>

        <Card className="border border-purple-200 hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">{osConcluidas}</p>
            <p className="text-xs text-muted-foreground">{t('dashboard.charts.completed')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DashboardCharts;
