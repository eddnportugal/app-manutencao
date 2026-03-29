import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { exportRelatorioComEstatisticas, exportRelatorioConsolidadoComGraficos } from "@/lib/pdfExport";
import {
  Users,
  Building2,
  FileText,
  Download,
  FileSpreadsheet,
  Printer,
  Calendar,
  Bell,
  Wrench,
  AlertTriangle,
  ClipboardCheck,
  ListChecks,
  Vote,
  ShoppingBag,
  Search,
  CarFront,
  Image,
  Award,
  TrendingUp,
  Package,
  BarChart3,
  PieChart,
  Filter,
  RefreshCw,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  UserCheck,
  UserX,
  Home,
  Car,
  Megaphone,
  Send,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Camera,
  FolderOpen,
} from "lucide-react";

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RelatoriosPageProps {
  condominioId?: number;
}

export default function RelatoriosPage({ condominioId }: RelatoriosPageProps) {
  const [activeCategory, setActiveCategory] = useState("consolidado");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [filterStatus, setFilterStatus] = useState("todos");
  const [selectedCondominioFilter, setSelectedCondominioFilter] = useState<number | null>(null);
  
  const { data: condominios } = trpc.condominio.list.useQuery();
  // Usar o filtro selecionado, ou o condominioId passado, ou o primeiro da lista
  const selectedCondominioId = selectedCondominioFilter || condominioId || condominios?.[0]?.id;
  const selectedCondominio = condominios?.find(c => c.id === selectedCondominioId);

  // Queries para cada tipo de relatório
  const { data: moradores, isLoading: loadingMoradores } = trpc.morador.list.useQuery(
    { condominioId: selectedCondominioId || 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: manutencoes, isLoading: loadingManutencoes } = trpc.manutencao.list.useQuery(
    { condominioId: selectedCondominioId || 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: ocorrencias, isLoading: loadingOcorrencias } = trpc.ocorrencia.list.useQuery(
    { condominioId: selectedCondominioId || 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: vistorias, isLoading: loadingVistorias } = trpc.vistoria.list.useQuery(
    { condominioId: selectedCondominioId || 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: checklists, isLoading: loadingChecklists } = trpc.checklist.list.useQuery(
    { condominioId: selectedCondominioId || 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: avisos, isLoading: loadingAvisos } = trpc.aviso.list.useQuery(
    { revistaId: 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: eventos, isLoading: loadingEventos } = trpc.evento.list.useQuery(
    { revistaId: 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: votacoes, isLoading: loadingVotacoes } = trpc.votacao.list.useQuery(
    { revistaId: 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: classificados, isLoading: loadingClassificados } = trpc.classificado.list.useQuery(
    { condominioId: selectedCondominioId || 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: achados, isLoading: loadingAchados } = trpc.achadoPerdido.list.useQuery(
    { condominioId: selectedCondominioId || 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: caronas, isLoading: loadingCaronas } = trpc.carona.list.useQuery(
    { condominioId: selectedCondominioId || 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: vagas, isLoading: loadingVagas } = trpc.vagaEstacionamento.list.useQuery(
    { condominioId: selectedCondominioId || 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: albuns, isLoading: loadingAlbuns } = trpc.album.list.useQuery(
    { condominioId: selectedCondominioId || 0 },
    { enabled: !!selectedCondominioId }
  );

  const { data: ordensServico, isLoading: loadingOrdensServico } = trpc.ordensServico.list.useQuery(
    { condominioId: selectedCondominioId || 0 },
    { enabled: !!selectedCondominioId }
  );

  // Categorias de relatórios
  const categories = [
    { id: "consolidado", label: "Consolidado", icon: BarChart3, color: "text-indigo-600" },
    { id: "moradores", label: "Moradores", icon: Users, color: "text-blue-600" },
    { id: "operacional", label: "Operacional", icon: Wrench, color: "text-orange-600" },
    { id: "ordens", label: "Ordens de Serviço", icon: ClipboardCheck, color: "text-amber-600" },
    { id: "comunicacao", label: "Comunicação", icon: Megaphone, color: "text-green-600" },
    { id: "comunidade", label: "Comunidade", icon: Users, color: "text-purple-600" },
    { id: "agenda", label: "Agenda/Eventos", icon: Calendar, color: "text-pink-600" },
    { id: "midia", label: "Mídia/Galeria", icon: Image, color: "text-cyan-600" },
  ];

  // Função para exportar para CSV
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    if (!data || data.length === 0) {
      toast.error("Não há dados para exportar");
      return;
    }

    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(h => {
        const key = h.toLowerCase().replace(/ /g, "");
        const value = row[key] || row[h] || "";
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Relatório exportado com sucesso!");
  };

  // Função para imprimir
  const handlePrint = () => {
    window.print();
  };

  // Função para filtrar por período
  const filterByDateRange = <T extends { createdAt?: Date | string | null }>(items: T[] | undefined): T[] => {
    if (!items) return [];
    if (!dateRange.start && !dateRange.end) return items;
    
    return items.filter(item => {
      if (!item.createdAt) return true;
      const itemDate = new Date(item.createdAt);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end + "T23:59:59") : null;
      
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  };

  // Função para filtrar eventos por data do evento
  const filterEventosByDateRange = <T extends { dataEvento?: Date | string | null }>(items: T[] | undefined): T[] => {
    if (!items) return [];
    if (!dateRange.start && !dateRange.end) return items;
    
    return items.filter(item => {
      if (!item.dataEvento) return true;
      const itemDate = new Date(item.dataEvento);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end + "T23:59:59") : null;
      
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  };

  // Limpar filtros
  const clearFilters = () => {
    setDateRange({ start: "", end: "" });
    setFilterStatus("todos");
  };

  // Dados filtrados
  const filteredManutencoes = filterByDateRange(manutencoes);
  const filteredOcorrencias = filterByDateRange(ocorrencias);
  const filteredVistorias = filterByDateRange(vistorias);
  const filteredAvisos = filterByDateRange(avisos);
  const filteredVotacoes = filterByDateRange(votacoes);
  const filteredClassificados = filterByDateRange(classificados);
  const filteredEventos = filterEventosByDateRange(eventos);
  const filteredAlbuns = filterByDateRange(albuns);

  // Estatísticas de moradores
  const moradoresStats = {
    total: moradores?.length || 0,
    ativos: moradores?.filter(m => m.ativo !== false).length || 0,
    inativos: moradores?.filter(m => m.ativo === false).length || 0,
    comEmail: moradores?.filter(m => m.email).length || 0,
    comTelefone: moradores?.filter(m => m.telefone).length || 0,
  };

  // Estatísticas operacionais (usando dados filtrados)
  const operacionalStats = {
    manutencoes: {
      total: filteredManutencoes?.length || 0,
      pendentes: filteredManutencoes?.filter(m => m.status === "pendente").length || 0,
      realizadas: filteredManutencoes?.filter(m => m.status === "realizada").length || 0,
      finalizadas: filteredManutencoes?.filter(m => m.status === "finalizada").length || 0,
    },
    ocorrencias: {
      total: filteredOcorrencias?.length || 0,
      pendentes: filteredOcorrencias?.filter(o => o.status === "pendente").length || 0,
      realizadas: filteredOcorrencias?.filter(o => o.status === "realizada").length || 0,
      finalizadas: filteredOcorrencias?.filter(o => o.status === "finalizada").length || 0,
    },
    vistorias: {
      total: filteredVistorias?.length || 0,
      pendentes: filteredVistorias?.filter(v => v.status === "pendente").length || 0,
      realizadas: filteredVistorias?.filter(v => v.status === "realizada").length || 0,
    },
    checklists: {
      total: checklists?.length || 0,
    },
  };

  // Estatísticas de comunicação (usando dados filtrados)
  const comunicacaoStats = {
    avisos: {
      total: filteredAvisos?.length || 0,
      urgentes: filteredAvisos?.filter(a => a.tipo === "urgente").length || 0,
      informativos: filteredAvisos?.filter(a => a.tipo === "informativo").length || 0,
    },
  };

  // Estatísticas de agenda (usando dados filtrados)
  const agendaStats = {
    eventos: {
      total: filteredEventos?.length || 0,
      proximos: filteredEventos?.filter(e => e.dataEvento && new Date(e.dataEvento) > new Date()).length || 0,
      realizados: filteredEventos?.filter(e => e.dataEvento && new Date(e.dataEvento) <= new Date()).length || 0,
    },
  };

  // Estatísticas de mídia (usando dados filtrados)
  const midiaStats = {
    albuns: filteredAlbuns?.length || 0,
  };

  // Estatísticas de comunidade (usando dados filtrados)
  const comunidadeStats = {
    votacoes: {
      total: filteredVotacoes?.length || 0,
      ativas: filteredVotacoes?.filter(v => new Date(v.dataFim || 0) > new Date()).length || 0,
      encerradas: filteredVotacoes?.filter(v => new Date(v.dataFim || 0) <= new Date()).length || 0,
    },
    classificados: {
      total: filteredClassificados?.length || 0,
      ativos: filteredClassificados?.filter(c => c.status === "aprovado").length || 0,
    },
    achados: {
      total: achados?.length || 0,
      encontrados: achados?.filter(a => a.tipo === "achado").length || 0,
      perdidos: achados?.filter(a => a.tipo === "perdido").length || 0,
      resolvidos: achados?.filter(a => a.status === "resolvido").length || 0,
    },
    caronas: {
      total: caronas?.length || 0,
      ofertas: caronas?.filter(c => c.tipo === "oferece").length || 0,
      pedidos: caronas?.filter(c => c.tipo === "procura").length || 0,
    },
  };

  // Estatísticas de Ordens de Serviço (usando dados completos da query)
  const ordensServicoStats = {
    total: ordensServico?.length || 0,
    abertas: ordensServico?.filter((os: any) => os.status?.nome?.toLowerCase().includes("aberta") || os.status?.nome?.toLowerCase().includes("nova") || !os.status).length || 0,
    emAndamento: ordensServico?.filter((os: any) => os.status?.nome?.toLowerCase().includes("andamento") || os.status?.nome?.toLowerCase().includes("execução")).length || 0,
    concluidas: ordensServico?.filter((os: any) => os.status?.nome?.toLowerCase().includes("concluída") || os.status?.nome?.toLowerCase().includes("finalizada")).length || 0,
    urgentes: ordensServico?.filter((os: any) => os.prioridade === "alta" || os.prioridade === "urgente").length || 0,
    porCategoria: (() => {
      const cats: Record<string, number> = {};
      ordensServico?.forEach((os: any) => {
        const cat = os.categoria?.nome || os.categoria || "Sem categoria";
        cats[cat] = (cats[cat] || 0) + 1;
      });
      return cats;
    })(),
    tempoMedioResolucao: (() => {
      const concluidas = ordensServico?.filter((os: any) => os.dataFim && os.dataInicio) || [];
      if (concluidas.length === 0) return 0;
      const totalHoras = concluidas.reduce((acc: number, os: any) => {
        const inicio = new Date(os.dataInicio).getTime();
        const fim = new Date(os.dataFim).getTime();
        return acc + (fim - inicio) / (1000 * 60 * 60);
      }, 0);
      return Math.round(totalHoras / concluidas.length);
    })(),
  };

  // Função para obter os últimos 6 meses
  const getUltimos6Meses = () => {
    const meses = [];
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      meses.push({
        mes: data.toLocaleDateString("pt-BR", { month: "short" }),
        mesCompleto: data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
        inicio: new Date(data.getFullYear(), data.getMonth(), 1),
        fim: new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59),
      });
    }
    return meses;
  };

  // Função para contar itens por mês
  const contarPorMes = <T extends { createdAt?: Date | string | null }>(items: T[] | undefined, meses: ReturnType<typeof getUltimos6Meses>) => {
    return meses.map(m => {
      return items?.filter(item => {
        if (!item.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        return itemDate >= m.inicio && itemDate <= m.fim;
      }).length || 0;
    });
  };

  // Função para contar eventos por mês (usando dataEvento)
  const contarEventosPorMes = <T extends { dataEvento?: Date | string | null }>(items: T[] | undefined, meses: ReturnType<typeof getUltimos6Meses>) => {
    return meses.map(m => {
      return items?.filter(item => {
        if (!item.dataEvento) return false;
        const itemDate = new Date(item.dataEvento);
        return itemDate >= m.inicio && itemDate <= m.fim;
      }).length || 0;
    });
  };

  // Dados históricos por mês
  const meses = getUltimos6Meses();
  const labelsHistorico = meses.map(m => m.mes.charAt(0).toUpperCase() + m.mes.slice(1));

  const dadosHistoricos = {
    manutencoes: contarPorMes(manutencoes, meses),
    ocorrencias: contarPorMes(ocorrencias, meses),
    vistorias: contarPorMes(vistorias, meses),
    avisos: contarPorMes(avisos, meses),
    votacoes: contarPorMes(votacoes, meses),
    eventos: contarEventosPorMes(eventos, meses),
    classificados: contarPorMes(classificados, meses),
  };

  // Calcular variação percentual (mês atual vs mês anterior)
  const calcularVariacao = (dados: number[]) => {
    const mesAtual = dados[dados.length - 1] || 0;
    const mesAnterior = dados[dados.length - 2] || 0;
    if (mesAnterior === 0) return mesAtual > 0 ? 100 : 0;
    return Math.round(((mesAtual - mesAnterior) / mesAnterior) * 100);
  };

  const variacoes = {
    manutencoes: calcularVariacao(dadosHistoricos.manutencoes),
    ocorrencias: calcularVariacao(dadosHistoricos.ocorrencias),
    vistorias: calcularVariacao(dadosHistoricos.vistorias),
    avisos: calcularVariacao(dadosHistoricos.avisos),
    votacoes: calcularVariacao(dadosHistoricos.votacoes),
    eventos: calcularVariacao(dadosHistoricos.eventos),
  };

  if (!selectedCondominioId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Sistema completo de relatórios</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              Cadastre uma organização primeiro para visualizar os relatórios
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            {selectedCondominio?.nome || "Condomínio"} - Sistema completo de relatórios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const allData = {
                moradores: moradores || [],
                manutencoes: filteredManutencoes,
                ocorrencias: filteredOcorrencias,
                vistorias: filteredVistorias,
                avisos: filteredAvisos,
                eventos: filteredEventos,
                votacoes: filteredVotacoes,
              };
              
              // Exportar dados consolidados para CSV
              const headers = ["Categoria", "Total", "Pendentes", "Finalizados", "Taxa"];
              const csvData = [
                { Categoria: "Moradores", Total: moradoresStats.total, Pendentes: moradoresStats.ativos + " ativos", Finalizados: moradoresStats.inativos + " inativos", Taxa: moradoresStats.total > 0 ? Math.round((moradoresStats.ativos / moradoresStats.total) * 100) + "%" : "0%" },
                { Categoria: "Manutenções", Total: operacionalStats.manutencoes.total, Pendentes: operacionalStats.manutencoes.pendentes, Finalizados: operacionalStats.manutencoes.finalizadas, Taxa: operacionalStats.manutencoes.total > 0 ? Math.round((operacionalStats.manutencoes.finalizadas / operacionalStats.manutencoes.total) * 100) + "%" : "0%" },
                { Categoria: "Ocorrências", Total: operacionalStats.ocorrencias.total, Pendentes: operacionalStats.ocorrencias.pendentes, Finalizados: operacionalStats.ocorrencias.finalizadas, Taxa: operacionalStats.ocorrencias.total > 0 ? Math.round((operacionalStats.ocorrencias.finalizadas / operacionalStats.ocorrencias.total) * 100) + "%" : "0%" },
                { Categoria: "Vistorias", Total: operacionalStats.vistorias.total, Pendentes: operacionalStats.vistorias.pendentes, Finalizados: operacionalStats.vistorias.realizadas, Taxa: operacionalStats.vistorias.total > 0 ? Math.round((operacionalStats.vistorias.realizadas / operacionalStats.vistorias.total) * 100) + "%" : "0%" },
                { Categoria: "Avisos", Total: comunicacaoStats.avisos.total, Pendentes: comunicacaoStats.avisos.urgentes + " urgentes", Finalizados: comunicacaoStats.avisos.informativos + " informativos", Taxa: "-" },
                { Categoria: "Eventos", Total: agendaStats.eventos.total, Pendentes: agendaStats.eventos.proximos + " próximos", Finalizados: agendaStats.eventos.realizados + " realizados", Taxa: "-" },
                { Categoria: "Votações", Total: comunidadeStats.votacoes.total, Pendentes: comunidadeStats.votacoes.ativas + " ativas", Finalizados: comunidadeStats.votacoes.encerradas + " encerradas", Taxa: "-" },
              ];
              
              const csvContent = [
                headers.join(","),
                ...csvData.map(row => `"${row.Categoria}",${row.Total},"${row.Pendentes}","${row.Finalizados}","${row.Taxa}"`)
              ].join("\n");
              
              const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `relatorio_${selectedCondominio?.nome || "condominio"}_${new Date().toISOString().split("T")[0]}.csv`;
              link.click();
              toast.success("Relatório exportado para Excel/CSV!");
            }}
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel/CSV
          </Button>
        </div>
      </div>

      {/* Navegação por Categorias */}
      <div className="print:hidden">
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Button
                  key={cat.id}
                  variant={activeCategory === cat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat.id)}
                  className="whitespace-nowrap"
                >
                  <Icon className={`w-4 h-4 mr-2 ${activeCategory === cat.id ? "" : cat.color}`} />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Filtros por Período */}
      <Card className="print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Filtro por Condomínio */}
            {condominios && condominios.length > 1 && (
              <div className="flex-1">
                <Label className="text-sm font-medium">Condomínio</Label>
                <Select
                  value={selectedCondominioId?.toString() || ""}
                  onValueChange={(value) => setSelectedCondominioFilter(parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecionar condomínio" />
                  </SelectTrigger>
                  <SelectContent>
                    {condominios.map((cond) => (
                      <SelectItem key={cond.id} value={cond.id.toString()}>
                        {cond.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex-1">
              <Label htmlFor="startDate" className="text-sm font-medium">Data Inicial</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate" className="text-sm font-medium">Data Final</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={!dateRange.start && !dateRange.end}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            </div>
          </div>
          {(dateRange.start || dateRange.end) && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />
              <span>
                Filtro ativo: {dateRange.start ? new Date(dateRange.start).toLocaleDateString("pt-BR") : "Início"} até {dateRange.end ? new Date(dateRange.end).toLocaleDateString("pt-BR") : "Hoje"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conteúdo dos Relatórios */}
      <div className="space-y-6">
        {/* RELATÓRIO CONSOLIDADO */}
        {activeCategory === "consolidado" && (
          <div className="space-y-6">
            {/* Header do Relatório Consolidado */}
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Relatório Executivo</h2>
                    <p className="text-white/80">
                      {selectedCondominio?.nome || "Condomínio"} - Visão Geral
                    </p>
                    {(dateRange.start || dateRange.end) && (
                      <p className="text-sm text-white/70 mt-1">
                        Período: {dateRange.start ? new Date(dateRange.start).toLocaleDateString("pt-BR") : "Início"} a {dateRange.end ? new Date(dateRange.end).toLocaleDateString("pt-BR") : "Hoje"}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="print:hidden"
                    onClick={async () => {
                      toast.loading("Gerando PDF consolidado com gráficos...");
                      try {
                        await exportRelatorioConsolidadoComGraficos(
                          "Relatório Executivo Consolidado",
                          "Visão geral de todas as áreas da organização",
                          [
                            { label: "Moradores", valor: moradoresStats.total },
                            { label: "Manutenções", valor: operacionalStats.manutencoes.total },
                            { label: "Ocorrências", valor: operacionalStats.ocorrencias.total },
                            { label: "Vistorias", valor: operacionalStats.vistorias.total },
                          ],
                          {
                            labels: labelsHistorico,
                            manutencoes: dadosHistoricos.manutencoes,
                            ocorrencias: dadosHistoricos.ocorrencias,
                            vistorias: dadosHistoricos.vistorias,
                            avisos: dadosHistoricos.avisos,
                            votacoes: dadosHistoricos.votacoes,
                            eventos: dadosHistoricos.eventos,
                          },
                          [
                            { categoria: "Manutenções", mesAtual: dadosHistoricos.manutencoes[5] || 0, mesAnterior: dadosHistoricos.manutencoes[4] || 0, variacao: variacoes.manutencoes },
                            { categoria: "Ocorrências", mesAtual: dadosHistoricos.ocorrencias[5] || 0, mesAnterior: dadosHistoricos.ocorrencias[4] || 0, variacao: variacoes.ocorrencias },
                            { categoria: "Vistorias", mesAtual: dadosHistoricos.vistorias[5] || 0, mesAnterior: dadosHistoricos.vistorias[4] || 0, variacao: variacoes.vistorias },
                            { categoria: "Avisos", mesAtual: dadosHistoricos.avisos[5] || 0, mesAnterior: dadosHistoricos.avisos[4] || 0, variacao: variacoes.avisos },
                            { categoria: "Votações", mesAtual: dadosHistoricos.votacoes[5] || 0, mesAnterior: dadosHistoricos.votacoes[4] || 0, variacao: variacoes.votacoes },
                            { categoria: "Eventos", mesAtual: dadosHistoricos.eventos[5] || 0, mesAnterior: dadosHistoricos.eventos[4] || 0, variacao: variacoes.eventos },
                          ],
                          {
                            colunas: ["Categoria", "Total", "Pendentes/Ativos", "Finalizados/Resolvidos", "Taxa"],
                            dados: [
                              ["Moradores", String(moradoresStats.total), String(moradoresStats.ativos) + " ativos", String(moradoresStats.inativos) + " inativos", moradoresStats.total > 0 ? Math.round((moradoresStats.ativos / moradoresStats.total) * 100) + "%" : "0%"],
                              ["Manutenções", String(operacionalStats.manutencoes.total), String(operacionalStats.manutencoes.pendentes) + " pendentes", String(operacionalStats.manutencoes.finalizadas) + " finalizadas", operacionalStats.manutencoes.total > 0 ? Math.round((operacionalStats.manutencoes.finalizadas / operacionalStats.manutencoes.total) * 100) + "%" : "0%"],
                              ["Ocorrências", String(operacionalStats.ocorrencias.total), String(operacionalStats.ocorrencias.pendentes) + " pendentes", String(operacionalStats.ocorrencias.finalizadas) + " finalizadas", operacionalStats.ocorrencias.total > 0 ? Math.round((operacionalStats.ocorrencias.finalizadas / operacionalStats.ocorrencias.total) * 100) + "%" : "0%"],
                              ["Vistorias", String(operacionalStats.vistorias.total), String(operacionalStats.vistorias.pendentes) + " pendentes", String(operacionalStats.vistorias.realizadas) + " realizadas", operacionalStats.vistorias.total > 0 ? Math.round((operacionalStats.vistorias.realizadas / operacionalStats.vistorias.total) * 100) + "%" : "0%"],
                              ["Avisos", String(comunicacaoStats.avisos.total), String(comunicacaoStats.avisos.urgentes) + " urgentes", String(comunicacaoStats.avisos.informativos) + " informativos", "-"],
                              ["Votações", String(comunidadeStats.votacoes.total), String(comunidadeStats.votacoes.ativas) + " ativas", String(comunidadeStats.votacoes.encerradas) + " encerradas", comunidadeStats.votacoes.total > 0 ? Math.round((comunidadeStats.votacoes.encerradas / comunidadeStats.votacoes.total) * 100) + "%" : "0%"],
                              ["Eventos", String(agendaStats.eventos.total), String(agendaStats.eventos.proximos) + " próximos", String(agendaStats.eventos.realizados) + " realizados", agendaStats.eventos.total > 0 ? Math.round((agendaStats.eventos.realizados / agendaStats.eventos.total) * 100) + "%" : "0%"],
                            ],
                          },
                          selectedCondominio ? {
                            nome: selectedCondominio.nome,
                            logoUrl: selectedCondominio.logoUrl,
                            endereco: selectedCondominio.endereco,
                          } : undefined
                        );
                        toast.dismiss();
                        toast.success("PDF consolidado com gráficos gerado com sucesso!");
                      } catch (error) {
                        toast.dismiss();
                        toast.error("Erro ao gerar PDF");
                        console.error(error);
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Cards de Resumo Geral */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Moradores</p>
                      <p className="text-2xl font-bold text-blue-600">{moradoresStats.total}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-green-600">{moradoresStats.ativos} ativos</span>
                        {moradoresStats.ativos > 0 && (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    </div>
                    <Users className="w-8 h-8 text-blue-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Manutenções</p>
                      <p className="text-2xl font-bold text-orange-600">{operacionalStats.manutencoes.total}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-amber-600">{operacionalStats.manutencoes.pendentes} pendentes</span>
                        {variacoes.manutencoes !== 0 && (
                          <span className={`flex items-center text-xs ${variacoes.manutencoes > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {variacoes.manutencoes > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                            {Math.abs(variacoes.manutencoes)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Wrench className="w-8 h-8 text-orange-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Ocorrências</p>
                      <p className="text-2xl font-bold text-red-600">{operacionalStats.ocorrencias.total}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-red-500">{operacionalStats.ocorrencias.pendentes} pendentes</span>
                        {variacoes.ocorrencias !== 0 && (
                          <span className={`flex items-center text-xs ${variacoes.ocorrencias > 0 ? 'text-red-500' : 'text-green-500'}`}>
                            {variacoes.ocorrencias > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                            {Math.abs(variacoes.ocorrencias)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Eventos</p>
                      <p className="text-2xl font-bold text-pink-600">{agendaStats.eventos.total}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-pink-500">{agendaStats.eventos.proximos} próximos</span>
                        {variacoes.eventos !== 0 && (
                          <span className={`flex items-center text-xs ${variacoes.eventos > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {variacoes.eventos > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                            {Math.abs(variacoes.eventos)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Calendar className="w-8 h-8 text-pink-600/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos Consolidados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Visão Geral por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: ["Moradores", "Manutenções", "Ocorrências", "Vistorias", "Avisos", "Votações", "Eventos"],
                        datasets: [{
                          label: "Total",
                          data: [
                            moradoresStats.total,
                            operacionalStats.manutencoes.total,
                            operacionalStats.ocorrencias.total,
                            operacionalStats.vistorias.total,
                            comunicacaoStats.avisos.total,
                            comunidadeStats.votacoes.total,
                            agendaStats.eventos.total
                          ],
                          backgroundColor: [
                            "#3b82f6", "#f97316", "#ef4444", "#8b5cf6",
                            "#22c55e", "#a855f7", "#ec4899"
                          ],
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status Operacional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Doughnut
                      data={{
                        labels: ["Pendentes", "Em Andamento", "Finalizados"],
                        datasets: [{
                          data: [
                            operacionalStats.manutencoes.pendentes + operacionalStats.ocorrencias.pendentes + operacionalStats.vistorias.pendentes,
                            operacionalStats.manutencoes.realizadas + operacionalStats.ocorrencias.realizadas + operacionalStats.vistorias.realizadas,
                            operacionalStats.manutencoes.finalizadas + operacionalStats.ocorrencias.finalizadas
                          ],
                          backgroundColor: ["#f59e0b", "#3b82f6", "#22c55e"],
                          borderWidth: 0,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "bottom" } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de Comparação Histórica */}
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Evolução Histórica - Últimos 6 Meses
                </CardTitle>
                <CardDescription>Compare a evolução das atividades ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Line
                    data={{
                      labels: labelsHistorico,
                      datasets: [
                        {
                          label: "Manutenções",
                          data: dadosHistoricos.manutencoes,
                          borderColor: "#f97316",
                          backgroundColor: "rgba(249, 115, 22, 0.1)",
                          fill: true,
                          tension: 0.4,
                        },
                        {
                          label: "Ocorrências",
                          data: dadosHistoricos.ocorrencias,
                          borderColor: "#ef4444",
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                          fill: true,
                          tension: 0.4,
                        },
                        {
                          label: "Vistorias",
                          data: dadosHistoricos.vistorias,
                          borderColor: "#8b5cf6",
                          backgroundColor: "rgba(139, 92, 246, 0.1)",
                          fill: true,
                          tension: 0.4,
                        },
                        {
                          label: "Avisos",
                          data: dadosHistoricos.avisos,
                          borderColor: "#22c55e",
                          backgroundColor: "rgba(34, 197, 94, 0.1)",
                          fill: true,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "top" },
                        tooltip: {
                          mode: "index",
                          intersect: false,
                        },
                      },
                      scales: {
                        y: { beginAtZero: true },
                      },
                      interaction: {
                        mode: "nearest",
                        axis: "x",
                        intersect: false,
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cards de Variação Mensal */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden">
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <Wrench className="w-5 h-5 text-orange-600" />
                    <span className={`text-xs font-semibold ${variacoes.manutencoes >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {variacoes.manutencoes >= 0 ? "+" : ""}{variacoes.manutencoes}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Manutenções</p>
                  <p className="text-lg font-bold text-orange-700">{dadosHistoricos.manutencoes[5] || 0}</p>
                  <p className="text-[10px] text-muted-foreground">vs {dadosHistoricos.manutencoes[4] || 0} mês ant.</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className={`text-xs font-semibold ${variacoes.ocorrencias <= 0 ? "text-green-600" : "text-red-600"}`}>
                      {variacoes.ocorrencias >= 0 ? "+" : ""}{variacoes.ocorrencias}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Ocorrências</p>
                  <p className="text-lg font-bold text-red-700">{dadosHistoricos.ocorrencias[5] || 0}</p>
                  <p className="text-[10px] text-muted-foreground">vs {dadosHistoricos.ocorrencias[4] || 0} mês ant.</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <ClipboardCheck className="w-5 h-5 text-purple-600" />
                    <span className={`text-xs font-semibold ${variacoes.vistorias >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {variacoes.vistorias >= 0 ? "+" : ""}{variacoes.vistorias}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Vistorias</p>
                  <p className="text-lg font-bold text-purple-700">{dadosHistoricos.vistorias[5] || 0}</p>
                  <p className="text-[10px] text-muted-foreground">vs {dadosHistoricos.vistorias[4] || 0} mês ant.</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <Megaphone className="w-5 h-5 text-green-600" />
                    <span className={`text-xs font-semibold ${variacoes.avisos >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {variacoes.avisos >= 0 ? "+" : ""}{variacoes.avisos}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Avisos</p>
                  <p className="text-lg font-bold text-green-700">{dadosHistoricos.avisos[5] || 0}</p>
                  <p className="text-[10px] text-muted-foreground">vs {dadosHistoricos.avisos[4] || 0} mês ant.</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <Vote className="w-5 h-5 text-pink-600" />
                    <span className={`text-xs font-semibold ${variacoes.votacoes >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {variacoes.votacoes >= 0 ? "+" : ""}{variacoes.votacoes}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Votações</p>
                  <p className="text-lg font-bold text-pink-700">{dadosHistoricos.votacoes[5] || 0}</p>
                  <p className="text-[10px] text-muted-foreground">vs {dadosHistoricos.votacoes[4] || 0} mês ant.</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className={`text-xs font-semibold ${variacoes.eventos >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {variacoes.eventos >= 0 ? "+" : ""}{variacoes.eventos}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Eventos</p>
                  <p className="text-lg font-bold text-blue-700">{dadosHistoricos.eventos[5] || 0}</p>
                  <p className="text-[10px] text-muted-foreground">vs {dadosHistoricos.eventos[4] || 0} mês ant.</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Barras Comparativo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Comparação Mensal - Operacional</CardTitle>
                  <CardDescription className="text-xs">Manutenções, Ocorrências e Vistorias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: labelsHistorico,
                        datasets: [
                          {
                            label: "Manutenções",
                            data: dadosHistoricos.manutencoes,
                            backgroundColor: "rgba(249, 115, 22, 0.8)",
                          },
                          {
                            label: "Ocorrências",
                            data: dadosHistoricos.ocorrencias,
                            backgroundColor: "rgba(239, 68, 68, 0.8)",
                          },
                          {
                            label: "Vistorias",
                            data: dadosHistoricos.vistorias,
                            backgroundColor: "rgba(139, 92, 246, 0.8)",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "top" } },
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Comparação Mensal - Comunicação</CardTitle>
                  <CardDescription className="text-xs">Avisos, Votações e Eventos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: labelsHistorico,
                        datasets: [
                          {
                            label: "Avisos",
                            data: dadosHistoricos.avisos,
                            backgroundColor: "rgba(34, 197, 94, 0.8)",
                          },
                          {
                            label: "Votações",
                            data: dadosHistoricos.votacoes,
                            backgroundColor: "rgba(168, 85, 247, 0.8)",
                          },
                          {
                            label: "Eventos",
                            data: dadosHistoricos.eventos,
                            backgroundColor: "rgba(59, 130, 246, 0.8)",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "top" } },
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela Resumo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo por Área</CardTitle>
                <CardDescription>Visão consolidada de todas as áreas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">Área</th>
                        <th className="text-center py-2 px-3 font-medium">Total</th>
                        <th className="text-center py-2 px-3 font-medium">Pendentes/Ativos</th>
                        <th className="text-center py-2 px-3 font-medium">Finalizados</th>
                        <th className="text-center py-2 px-3 font-medium">Taxa</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          Moradores
                        </td>
                        <td className="text-center py-2 px-3">{moradoresStats.total}</td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700">{moradoresStats.ativos} ativos</Badge>
                        </td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-red-50 text-red-700">{moradoresStats.inativos} inativos</Badge>
                        </td>
                        <td className="text-center py-2 px-3">
                          {moradoresStats.total > 0 ? Math.round((moradoresStats.ativos / moradoresStats.total) * 100) : 0}% ativos
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3 flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-orange-600" />
                          Manutenções
                        </td>
                        <td className="text-center py-2 px-3">{operacionalStats.manutencoes.total}</td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700">{operacionalStats.manutencoes.pendentes} pendentes</Badge>
                        </td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700">{operacionalStats.manutencoes.finalizadas} finalizadas</Badge>
                        </td>
                        <td className="text-center py-2 px-3">
                          {operacionalStats.manutencoes.total > 0 ? Math.round((operacionalStats.manutencoes.finalizadas / operacionalStats.manutencoes.total) * 100) : 0}% concluído
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          Ocorrências
                        </td>
                        <td className="text-center py-2 px-3">{operacionalStats.ocorrencias.total}</td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-red-50 text-red-700">{operacionalStats.ocorrencias.pendentes} pendentes</Badge>
                        </td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700">{operacionalStats.ocorrencias.finalizadas} finalizadas</Badge>
                        </td>
                        <td className="text-center py-2 px-3">
                          {operacionalStats.ocorrencias.total > 0 ? Math.round((operacionalStats.ocorrencias.finalizadas / operacionalStats.ocorrencias.total) * 100) : 0}% resolvido
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3 flex items-center gap-2">
                          <ClipboardCheck className="w-4 h-4 text-purple-600" />
                          Vistorias
                        </td>
                        <td className="text-center py-2 px-3">{operacionalStats.vistorias.total}</td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700">{operacionalStats.vistorias.pendentes} pendentes</Badge>
                        </td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700">{operacionalStats.vistorias.realizadas} realizadas</Badge>
                        </td>
                        <td className="text-center py-2 px-3">
                          {operacionalStats.vistorias.total > 0 ? Math.round((operacionalStats.vistorias.realizadas / operacionalStats.vistorias.total) * 100) : 0}% realizado
                        </td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3 flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-green-600" />
                          Avisos
                        </td>
                        <td className="text-center py-2 px-3">{comunicacaoStats.avisos.total}</td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-red-50 text-red-700">{comunicacaoStats.avisos.urgentes} urgentes</Badge>
                        </td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">{comunicacaoStats.avisos.informativos} informativos</Badge>
                        </td>
                        <td className="text-center py-2 px-3">-</td>
                      </tr>
                      <tr className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3 flex items-center gap-2">
                          <Vote className="w-4 h-4 text-purple-600" />
                          Votações
                        </td>
                        <td className="text-center py-2 px-3">{comunidadeStats.votacoes.total}</td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700">{comunidadeStats.votacoes.ativas} ativas</Badge>
                        </td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-gray-50 text-gray-700">{comunidadeStats.votacoes.encerradas} encerradas</Badge>
                        </td>
                        <td className="text-center py-2 px-3">-</td>
                      </tr>
                      <tr className="hover:bg-muted/50">
                        <td className="py-2 px-3 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-pink-600" />
                          Eventos
                        </td>
                        <td className="text-center py-2 px-3">{agendaStats.eventos.total}</td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-pink-50 text-pink-700">{agendaStats.eventos.proximos} próximos</Badge>
                        </td>
                        <td className="text-center py-2 px-3">
                          <Badge variant="outline" className="bg-gray-50 text-gray-700">{agendaStats.eventos.realizados} realizados</Badge>
                        </td>
                        <td className="text-center py-2 px-3">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* RELATÓRIOS DE MORADORES */}
        {activeCategory === "moradores" && (
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-blue-600">{moradoresStats.total}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Ativos</p>
                      <p className="text-2xl font-bold text-green-600">{moradoresStats.ativos}</p>
                    </div>
                    <UserCheck className="w-8 h-8 text-green-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Inativos</p>
                      <p className="text-2xl font-bold text-red-600">{moradoresStats.inativos}</p>
                    </div>
                    <UserX className="w-8 h-8 text-red-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Com Email</p>
                      <p className="text-2xl font-bold text-purple-600">{moradoresStats.comEmail}</p>
                    </div>
                    <Send className="w-8 h-8 text-purple-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Com Telefone</p>
                      <p className="text-2xl font-bold text-orange-600">{moradoresStats.comTelefone}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-orange-600/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status dos Moradores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <Doughnut
                      data={{
                        labels: ["Ativos", "Inativos"],
                        datasets: [{
                          data: [moradoresStats.ativos, moradoresStats.inativos],
                          backgroundColor: ["#22c55e", "#ef4444"],
                          borderWidth: 0,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "bottom" },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Dados de Contato</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <Bar
                      data={{
                        labels: ["Com Email", "Com Telefone", "Sem Contato"],
                        datasets: [{
                          label: "Moradores",
                          data: [
                            moradoresStats.comEmail,
                            moradoresStats.comTelefone,
                            moradoresStats.total - Math.max(moradoresStats.comEmail, moradoresStats.comTelefone)
                          ],
                          backgroundColor: ["#8b5cf6", "#f97316", "#94a3b8"],
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: { beginAtZero: true },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros */}
            <Card className="print:hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="w-40">
                    <Label className="text-xs">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="ativos">Ativos</SelectItem>
                        <SelectItem value="inativos">Inativos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const filteredData = moradores?.filter(m => {
                        if (filterStatus === "ativos") return m.ativo !== false;
                        if (filterStatus === "inativos") return m.ativo === false;
                        return true;
                      }) || [];
                      exportToCSV(
                        filteredData.map(m => ({
                          nome: m.nome,
                          email: m.email || "",
                          telefone: m.telefone || "",
                          apartamento: m.apartamento || "",
                          bloco: m.bloco || "",
                          status: m.ativo !== false ? "Ativo" : "Inativo",
                        })),
                        "relatorio_moradores",
                        ["Nome", "Email", "Telefone", "Apartamento", "Bloco", "Status"]
                      );
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={async () => {
                      const filteredData = moradores?.filter(m => {
                        if (filterStatus === "ativos") return m.ativo !== false;
                        if (filterStatus === "inativos") return m.ativo === false;
                        return true;
                      }) || [];
                      toast.loading("Gerando PDF...");
                      try {
                        await exportRelatorioComEstatisticas(
                          "Relatório de Moradores",
                          filterStatus === "todos" ? "Todos a equipa" : 
                           filterStatus === "ativos" ? "Moradores ativos" : "Moradores inativos",
                          [
                            { label: "Total", valor: moradoresStats.total },
                            { label: "Ativos", valor: moradoresStats.ativos },
                            { label: "Inativos", valor: moradoresStats.inativos },
                            { label: "Com Email", valor: moradoresStats.comEmail },
                          ],
                          ["Nome", "Apartamento", "Bloco", "Email", "Telefone", "Status"],
                          filteredData.map(m => [
                            m.nome,
                            m.apartamento || "-",
                            m.bloco || "-",
                            m.email || "-",
                            m.telefone || "-",
                            m.ativo !== false ? "Ativo" : "Inativo",
                          ]),
                          selectedCondominio ? {
                            nome: selectedCondominio.nome,
                            logoUrl: selectedCondominio.logoUrl,
                            endereco: selectedCondominio.endereco,
                          } : undefined
                        );
                        toast.dismiss();
                        toast.success("PDF gerado com sucesso!");
                      } catch (error) {
                        toast.dismiss();
                        toast.error("Erro ao gerar PDF");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Moradores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lista de Moradores</CardTitle>
                <CardDescription>
                  {filterStatus === "todos" ? "Todos a equipa" : 
                   filterStatus === "ativos" ? "Moradores ativos" : "Moradores inativos"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingMoradores ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">Nome</th>
                          <th className="text-left py-2 px-2 font-medium">Apartamento</th>
                          <th className="text-left py-2 px-2 font-medium">Bloco</th>
                          <th className="text-left py-2 px-2 font-medium">Email</th>
                          <th className="text-left py-2 px-2 font-medium">Telefone</th>
                          <th className="text-left py-2 px-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {moradores
                          ?.filter(m => {
                            if (filterStatus === "ativos") return m.ativo !== false;
                            if (filterStatus === "inativos") return m.ativo === false;
                            return true;
                          })
                          .map((morador) => (
                            <tr key={morador.id} className="border-b last:border-0">
                              <td className="py-2 px-2">{morador.nome}</td>
                              <td className="py-2 px-2">{morador.apartamento || "-"}</td>
                              <td className="py-2 px-2">{morador.bloco || "-"}</td>
                              <td className="py-2 px-2">{morador.email || "-"}</td>
                              <td className="py-2 px-2">{morador.telefone || "-"}</td>
                              <td className="py-2 px-2">
                                <Badge variant={morador.ativo === false ? "destructive" : "default"} className="text-xs">
                                  {morador.ativo !== false ? "Ativo" : "Inativo"}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {(!moradores || moradores.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhum morador cadastrado
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Relatório de Vagas de Estacionamento */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Vagas de Estacionamento</CardTitle>
                  <CardDescription>Ocupação das vagas</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="print:hidden"
                  onClick={() => {
                    exportToCSV(
                      (vagas || []).map(v => ({
                        numero: v.numero,
                        apartamento: v.apartamento || "",
                        bloco: v.bloco || "",
                        tipo: v.tipo || "",
                        observacoes: v.observacoes || "",
                      })),
                      "relatorio_vagas",
                      ["Número", "Apartamento", "Bloco", "Tipo", "Observações"]
                    );
                  }}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
              </CardHeader>
              <CardContent>
                {loadingVagas ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">Vaga</th>
                          <th className="text-left py-2 px-2 font-medium">Apartamento</th>
                          <th className="text-left py-2 px-2 font-medium">Bloco</th>
                          <th className="text-left py-2 px-2 font-medium">Tipo</th>
                          <th className="text-left py-2 px-2 font-medium">Observações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vagas?.map((vaga) => (
                          <tr key={vaga.id} className="border-b last:border-0">
                            <td className="py-2 px-2 font-medium">{vaga.numero}</td>
                            <td className="py-2 px-2">{vaga.apartamento || "-"}</td>
                            <td className="py-2 px-2">{vaga.bloco || "-"}</td>
                            <td className="py-2 px-2">{vaga.tipo || "-"}</td>
                            <td className="py-2 px-2">{vaga.observacoes || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!vagas || vagas.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhuma vaga cadastrada
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* RELATÓRIOS DE ORDENS DE SERVIÇO */}
        {activeCategory === "ordens" && (
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-amber-600" />
                    <span className="text-sm text-muted-foreground">Total</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-700 mt-2">{ordensServicoStats.total}</p>
                  <p className="text-xs text-muted-foreground">ordens de serviço</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-muted-foreground">Abertas</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 mt-2">{ordensServicoStats.abertas}</p>
                  <p className="text-xs text-muted-foreground">aguardando início</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 text-orange-600" />
                    <span className="text-sm text-muted-foreground">Em Andamento</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700 mt-2">{ordensServicoStats.emAndamento}</p>
                  <p className="text-xs text-muted-foreground">em execução</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-muted-foreground">Concluídas</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700 mt-2">{ordensServicoStats.concluidas}</p>
                  <p className="text-xs text-muted-foreground">finalizadas</p>
                </CardContent>
              </Card>
            </div>

            {/* Cards Secundários */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium">Ordens Urgentes</span>
                  </div>
                  <p className="text-3xl font-bold text-red-600 mt-2">{ordensServicoStats.urgentes}</p>
                  <p className="text-xs text-muted-foreground">prioridade alta/urgente</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium">Tempo Médio de Resolução</span>
                  </div>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">
                    {ordensServicoStats.tempoMedioResolucao > 0 
                      ? `${Math.floor(ordensServicoStats.tempoMedioResolucao / 24)}d ${ordensServicoStats.tempoMedioResolucao % 24}h`
                      : "N/A"
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">para ordens concluídas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-medium">Taxa de Conclusão</span>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600 mt-2">
                    {ordensServicoStats.total > 0 
                      ? `${Math.round((ordensServicoStats.concluidas / ordensServicoStats.total) * 100)}%`
                      : "0%"
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">ordens finalizadas</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Categorias */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Ordens por Categoria</CardTitle>
                <CardDescription>Distribuição das ordens de serviço por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Doughnut
                    data={{
                      labels: Object.keys(ordensServicoStats.porCategoria).length > 0 
                        ? Object.keys(ordensServicoStats.porCategoria)
                        : ["Sem dados"],
                      datasets: [{
                        data: Object.keys(ordensServicoStats.porCategoria).length > 0
                          ? Object.values(ordensServicoStats.porCategoria)
                          : [1],
                        backgroundColor: [
                          "rgba(245, 158, 11, 0.8)",
                          "rgba(59, 130, 246, 0.8)",
                          "rgba(16, 185, 129, 0.8)",
                          "rgba(239, 68, 68, 0.8)",
                          "rgba(139, 92, 246, 0.8)",
                          "rgba(236, 72, 153, 0.8)",
                          "rgba(6, 182, 212, 0.8)",
                        ],
                        borderWidth: 0,
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "right" },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const value = context.raw as number;
                              const total = ordensServicoStats.total || 1;
                              const percentage = Math.round((value / total) * 100);
                              return `${context.label}: ${value} (${percentage}%)`;
                            }
                          }
                        }
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lista de Ordens Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Ordens de Serviço Recentes</CardTitle>
                <CardDescription>Últimas ordens registadas no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ordensServico && ordensServico.length > 0 ? (
                    ordensServico.slice(0, 10).map((os: any, index: number) => (
                      <div key={os.id || index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            os.status?.nome?.toLowerCase().includes("concluída") ? "bg-green-500" :
                            os.status?.nome?.toLowerCase().includes("andamento") ? "bg-orange-500" :
                            "bg-blue-500"
                          }`} />
                          <div>
                            <p className="font-medium text-sm">{os.titulo || os.descricao || "Ordem de Serviço"}</p>
                            <p className="text-xs text-muted-foreground">
                              {os.categoria?.nome || os.categoria || "Sem categoria"} • {os.status?.nome || "Aberta"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={os.prioridade === "urgente" || os.prioridade === "alta" ? "destructive" : "secondary"} className="text-xs">
                            {os.prioridade || "normal"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {os.createdAt ? new Date(os.createdAt).toLocaleDateString("pt-BR") : "-"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Nenhuma ordem de serviço registada</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Botão de Exportar */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const headers = ["Título", "Categoria", "Status", "Prioridade", "Data Criação"];
                  const csvData = ordensServico?.map((os: any) => ({
                    Titulo: os.titulo || os.descricao || "Ordem de Serviço",
                    Categoria: os.categoria?.nome || os.categoria || "Sem categoria",
                    Status: os.status?.nome || "Aberta",
                    Prioridade: os.prioridade || "normal",
                    DataCriacao: os.createdAt ? new Date(os.createdAt).toLocaleDateString("pt-BR") : "-",
                  })) || [];
                  
                  const csvContent = [
                    headers.join(","),
                    ...csvData.map((row: any) => `"${row.Titulo}","${row.Categoria}","${row.Status}","${row.Prioridade}","${row.DataCriacao}"`)
                  ].join("\n");
                  
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `ordens_servico_${new Date().toISOString().split("T")[0]}.csv`;
                  link.click();
                  toast.success("Relatório de Ordens de Serviço exportado!");
                }}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar Excel/CSV
              </Button>
            </div>
          </div>
        )}

        {/* RELATÓRIOS OPERACIONAIS */}
        {activeCategory === "operacional" && (
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Manutenções</p>
                      <p className="text-2xl font-bold text-orange-600">{operacionalStats.manutencoes.total}</p>
                      <p className="text-xs text-muted-foreground">
                        {operacionalStats.manutencoes.pendentes} pendentes
                      </p>
                    </div>
                    <Wrench className="w-8 h-8 text-orange-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Ocorrências</p>
                      <p className="text-2xl font-bold text-red-600">{operacionalStats.ocorrencias.total}</p>
                      <p className="text-xs text-muted-foreground">
                        {operacionalStats.ocorrencias.pendentes} pendentes
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Vistorias</p>
                      <p className="text-2xl font-bold text-blue-600">{operacionalStats.vistorias.total}</p>
                      <p className="text-xs text-muted-foreground">
                        {operacionalStats.vistorias.realizadas} realizadas
                      </p>
                    </div>
                    <ClipboardCheck className="w-8 h-8 text-blue-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Checklists</p>
                      <p className="text-2xl font-bold text-green-600">{operacionalStats.checklists.total}</p>
                    </div>
                    <ListChecks className="w-8 h-8 text-green-600/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos Operacionais */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status das Manutenções</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <Doughnut
                      data={{
                        labels: ["Pendentes", "Realizadas", "Finalizadas"],
                        datasets: [{
                          data: [
                            operacionalStats.manutencoes.pendentes,
                            operacionalStats.manutencoes.realizadas,
                            operacionalStats.manutencoes.finalizadas
                          ],
                          backgroundColor: ["#f59e0b", "#3b82f6", "#22c55e"],
                          borderWidth: 0,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "bottom" } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status das Ocorrências</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <Doughnut
                      data={{
                        labels: ["Pendentes", "Realizadas", "Finalizadas"],
                        datasets: [{
                          data: [
                            operacionalStats.ocorrencias.pendentes,
                            operacionalStats.ocorrencias.realizadas,
                            operacionalStats.ocorrencias.finalizadas
                          ],
                          backgroundColor: ["#ef4444", "#3b82f6", "#22c55e"],
                          borderWidth: 0,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "bottom" } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Comparação Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <Bar
                      data={{
                        labels: ["Manutenções", "Ocorrências", "Vistorias", "Checklists"],
                        datasets: [{
                          label: "Total",
                          data: [
                            operacionalStats.manutencoes.total,
                            operacionalStats.ocorrencias.total,
                            operacionalStats.vistorias.total,
                            operacionalStats.checklists.total
                          ],
                          backgroundColor: ["#f97316", "#ef4444", "#3b82f6", "#22c55e"],
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Manutenções */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Manutenções</CardTitle>
                  <CardDescription>Histórico de manutenções</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="print:hidden"
                    onClick={() => {
                      exportToCSV(
                        (manutencoes || []).map(m => ({
                          titulo: m.titulo,
                          descricao: m.descricao || "",
                          status: m.status,
                          prioridade: m.prioridade,
                          data: m.createdAt ? new Date(m.createdAt).toLocaleDateString("pt-BR") : "",
                        })),
                        "relatorio_manutencoes",
                        ["Título", "Descrição", "Status", "Prioridade", "Data"]
                      );
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="print:hidden"
                    onClick={async () => {
                      toast.loading("Gerando PDF...");
                      try {
                        await exportRelatorioComEstatisticas(
                          "Relatório de Manutenções",
                          "Histórico de manutenções da organização",
                          [
                            { label: "Total", valor: operacionalStats.manutencoes.total },
                            { label: "Pendentes", valor: operacionalStats.manutencoes.pendentes },
                            { label: "Realizadas", valor: operacionalStats.manutencoes.realizadas },
                            { label: "Finalizadas", valor: operacionalStats.manutencoes.finalizadas },
                          ],
                          ["Título", "Status", "Prioridade", "Data"],
                          (manutencoes || []).map(m => [
                            m.titulo,
                            m.status === "pendente" ? "Pendente" : m.status === "realizada" ? "Realizada" : m.status === "finalizada" ? "Finalizada" : m.status,
                            m.prioridade === "alta" ? "Alta" : m.prioridade === "media" ? "Média" : "Baixa",
                            m.createdAt ? new Date(m.createdAt).toLocaleDateString("pt-BR") : "-",
                          ]),
                          selectedCondominio ? {
                            nome: selectedCondominio.nome,
                            logoUrl: selectedCondominio.logoUrl,
                            endereco: selectedCondominio.endereco,
                          } : undefined
                        );
                        toast.dismiss();
                        toast.success("PDF gerado com sucesso!");
                      } catch (error) {
                        toast.dismiss();
                        toast.error("Erro ao gerar PDF");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingManutencoes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">Título</th>
                          <th className="text-left py-2 px-2 font-medium">Status</th>
                          <th className="text-left py-2 px-2 font-medium">Prioridade</th>
                          <th className="text-left py-2 px-2 font-medium">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manutencoes?.map((m) => (
                          <tr key={m.id} className="border-b last:border-0">
                            <td className="py-2 px-2">{m.titulo}</td>
                            <td className="py-2 px-2">
                              <Badge variant={
                                m.status === "finalizada" ? "default" :
                                m.status === "realizada" ? "secondary" : "outline"
                              } className="text-xs">
                                {m.status === "pendente" ? "Pendente" :
                                 m.status === "realizada" ? "Realizada" :
                                 m.status === "finalizada" ? "Finalizada" :
                                 m.status === "acao_necessaria" ? "Ação Necessária" : m.status}
                              </Badge>
                            </td>
                            <td className="py-2 px-2">
                              <Badge variant={
                                m.prioridade === "alta" ? "destructive" :
                                m.prioridade === "media" ? "secondary" : "outline"
                              } className="text-xs">
                                {m.prioridade === "alta" ? "Alta" :
                                 m.prioridade === "media" ? "Média" : "Baixa"}
                              </Badge>
                            </td>
                            <td className="py-2 px-2">
                              {m.createdAt ? new Date(m.createdAt).toLocaleDateString("pt-BR") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!manutencoes || manutencoes.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhuma manutenção registrada
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabela de Ocorrências */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Ocorrências</CardTitle>
                  <CardDescription>Histórico de ocorrências</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="print:hidden"
                    onClick={() => {
                      exportToCSV(
                        (ocorrencias || []).map(o => ({
                          titulo: o.titulo,
                          categoria: o.categoria,
                          status: o.status,
                          data: o.createdAt ? new Date(o.createdAt).toLocaleDateString("pt-BR") : "",
                        })),
                        "relatorio_ocorrencias",
                        ["Título", "Categoria", "Status", "Data"]
                      );
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="print:hidden"
                    onClick={async () => {
                      toast.loading("Gerando PDF...");
                      try {
                        await exportRelatorioComEstatisticas(
                          "Relatório de Ocorrências",
                          "Histórico de ocorrências da organização",
                          [
                            { label: "Total", valor: operacionalStats.ocorrencias.total },
                            { label: "Pendentes", valor: operacionalStats.ocorrencias.pendentes },
                            { label: "Realizadas", valor: operacionalStats.ocorrencias.realizadas },
                            { label: "Finalizadas", valor: operacionalStats.ocorrencias.finalizadas },
                          ],
                          ["Título", "Categoria", "Status", "Data"],
                          (ocorrencias || []).map(o => [
                            o.titulo || "-",
                            o.categoria || "-",
                            o.status === "pendente" ? "Pendente" : o.status === "realizada" ? "Realizada" : o.status === "finalizada" ? "Finalizada" : (o.status || "-"),
                            o.createdAt ? new Date(o.createdAt).toLocaleDateString("pt-BR") : "-",
                          ]),
                          selectedCondominio ? {
                            nome: selectedCondominio.nome,
                            logoUrl: selectedCondominio.logoUrl,
                            endereco: selectedCondominio.endereco,
                          } : undefined
                        );
                        toast.dismiss();
                        toast.success("PDF gerado com sucesso!");
                      } catch (error) {
                        toast.dismiss();
                        toast.error("Erro ao gerar PDF");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingOcorrencias ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">Título</th>
                          <th className="text-left py-2 px-2 font-medium">Categoria</th>
                          <th className="text-left py-2 px-2 font-medium">Status</th>
                          <th className="text-left py-2 px-2 font-medium">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ocorrencias?.map((o) => (
                          <tr key={o.id} className="border-b last:border-0">
                            <td className="py-2 px-2">{o.titulo}</td>
                            <td className="py-2 px-2">{o.categoria}</td>
                            <td className="py-2 px-2">
                              <Badge variant={
                                o.status === "finalizada" ? "default" :
                                o.status === "realizada" ? "secondary" : "outline"
                              } className="text-xs">
                                {o.status === "pendente" ? "Pendente" :
                                 o.status === "realizada" ? "Realizada" :
                                 o.status === "finalizada" ? "Finalizada" :
                                 o.status === "acao_necessaria" ? "Ação Necessária" : o.status}
                              </Badge>
                            </td>
                            <td className="py-2 px-2">
                              {o.createdAt ? new Date(o.createdAt).toLocaleDateString("pt-BR") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!ocorrencias || ocorrencias.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhuma ocorrência registrada
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabela de Vistorias */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Vistorias</CardTitle>
                  <CardDescription>Histórico de vistorias</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="print:hidden"
                    onClick={() => {
                      exportToCSV(
                        (vistorias || []).map(v => ({
                          titulo: v.titulo,
                          descricao: v.descricao || "",
                          status: v.status,
                          data: v.createdAt ? new Date(v.createdAt).toLocaleDateString("pt-BR") : "",
                        })),
                        "relatorio_vistorias",
                        ["Título", "Descrição", "Status", "Data"]
                      );
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="print:hidden"
                    onClick={async () => {
                      toast.loading("Gerando PDF...");
                      try {
                        await exportRelatorioComEstatisticas(
                          "Relatório de Vistorias",
                          "Histórico de vistorias da organização",
                          [
                            { label: "Total", valor: operacionalStats.vistorias.total },
                            { label: "Pendentes", valor: operacionalStats.vistorias.pendentes },
                            { label: "Realizadas", valor: operacionalStats.vistorias.realizadas },
                          ],
                          ["Título", "Descrição", "Status", "Data"],
                          (vistorias || []).map(v => [
                            v.titulo,
                            v.descricao || "-",
                            v.status === "pendente" ? "Pendente" : v.status === "realizada" ? "Realizada" : v.status,
                            v.createdAt ? new Date(v.createdAt).toLocaleDateString("pt-BR") : "-",
                          ]),
                          selectedCondominio ? {
                            nome: selectedCondominio.nome,
                            logoUrl: selectedCondominio.logoUrl,
                            endereco: selectedCondominio.endereco,
                          } : undefined
                        );
                        toast.dismiss();
                        toast.success("PDF gerado com sucesso!");
                      } catch (error) {
                        toast.dismiss();
                        toast.error("Erro ao gerar PDF");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingVistorias ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">Título</th>
                          <th className="text-left py-2 px-2 font-medium">Descrição</th>
                          <th className="text-left py-2 px-2 font-medium">Status</th>
                          <th className="text-left py-2 px-2 font-medium">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vistorias?.map((v) => (
                          <tr key={v.id} className="border-b last:border-0">
                            <td className="py-2 px-2">{v.titulo}</td>
                            <td className="py-2 px-2">{v.descricao || "-"}</td>
                            <td className="py-2 px-2">
                              <Badge variant={v.status === "realizada" ? "default" : "secondary"} className="text-xs">
                                {v.status === "pendente" ? "Pendente" : v.status === "realizada" ? "Realizada" : v.status}
                              </Badge>
                            </td>
                            <td className="py-2 px-2">
                              {v.createdAt ? new Date(v.createdAt).toLocaleDateString("pt-BR") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!vistorias || vistorias.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhuma vistoria registrada
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* RELATÓRIOS DE COMUNICAÇÃO */}
        {activeCategory === "comunicacao" && (
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Avisos</p>
                      <p className="text-2xl font-bold text-green-600">{avisos?.length || 0}</p>
                    </div>
                    <Bell className="w-8 h-8 text-green-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Eventos</p>
                      <p className="text-2xl font-bold text-blue-600">{eventos?.length || 0}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Moradores Notificáveis</p>
                      <p className="text-2xl font-bold text-purple-600">{moradoresStats.comTelefone}</p>
                    </div>
                    <Send className="w-8 h-8 text-purple-600/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Avisos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Avisos Publicados</CardTitle>
                  <CardDescription>Histórico de avisos</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="print:hidden"
                    onClick={() => {
                      exportToCSV(
                        (avisos || []).map(a => ({
                          titulo: a.titulo,
                          tipo: a.tipo,
                          data: a.createdAt ? new Date(a.createdAt).toLocaleDateString("pt-BR") : "",
                        })),
                        "relatorio_avisos",
                        ["Título", "Tipo", "Data"]
                      );
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="print:hidden"
                    onClick={async () => {
                      toast.loading("Gerando PDF...");
                      try {
                        await exportRelatorioComEstatisticas(
                          "Relatório de Avisos",
                          "Histórico de avisos publicados",
                          [
                            { label: "Total", valor: comunicacaoStats.avisos.total },
                            { label: "Urgentes", valor: comunicacaoStats.avisos.urgentes },
                            { label: "Informativos", valor: comunicacaoStats.avisos.informativos },
                          ],
                          ["Título", "Tipo", "Data"],
                          (avisos || []).map(a => [
                            a.titulo || "-",
                            a.tipo || "-",
                            a.createdAt ? new Date(a.createdAt).toLocaleDateString("pt-BR") : "-",
                          ]),
                          selectedCondominio ? {
                            nome: selectedCondominio.nome,
                            logoUrl: selectedCondominio.logoUrl,
                            endereco: selectedCondominio.endereco,
                          } : undefined
                        );
                        toast.dismiss();
                        toast.success("PDF gerado com sucesso!");
                      } catch (error) {
                        toast.dismiss();
                        toast.error("Erro ao gerar PDF");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAvisos ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">Título</th>
                          <th className="text-left py-2 px-2 font-medium">Tipo</th>
                          <th className="text-left py-2 px-2 font-medium">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {avisos?.map((a) => (
                          <tr key={a.id} className="border-b last:border-0">
                            <td className="py-2 px-2">{a.titulo}</td>
                            <td className="py-2 px-2">
                              <Badge variant="outline" className="text-xs">{a.tipo}</Badge>
                            </td>
                            <td className="py-2 px-2">
                              {a.createdAt ? new Date(a.createdAt).toLocaleDateString("pt-BR") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!avisos || avisos.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhum aviso publicado
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* RELATÓRIOS DE COMUNIDADE */}
        {activeCategory === "comunidade" && (
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Votações</p>
                      <p className="text-2xl font-bold text-purple-600">{comunidadeStats.votacoes.total}</p>
                      <p className="text-xs text-muted-foreground">
                        {comunidadeStats.votacoes.ativas} ativas
                      </p>
                    </div>
                    <Vote className="w-8 h-8 text-purple-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Classificados</p>
                      <p className="text-2xl font-bold text-green-600">{comunidadeStats.classificados.total}</p>
                      <p className="text-xs text-muted-foreground">
                        {comunidadeStats.classificados.ativos} ativos
                      </p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-green-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Achados/Perdidos</p>
                      <p className="text-2xl font-bold text-orange-600">{comunidadeStats.achados.total}</p>
                      <p className="text-xs text-muted-foreground">
                        {comunidadeStats.achados.resolvidos} resolvidos
                      </p>
                    </div>
                    <Search className="w-8 h-8 text-orange-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Caronas</p>
                      <p className="text-2xl font-bold text-blue-600">{comunidadeStats.caronas.total}</p>
                      <p className="text-xs text-muted-foreground">
                        {comunidadeStats.caronas.ofertas} ofertas
                      </p>
                    </div>
                    <CarFront className="w-8 h-8 text-blue-600/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos de Comunidade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Visão Geral da Comunidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <Bar
                      data={{
                        labels: ["Votações", "Classificados", "Achados/Perdidos", "Caronas"],
                        datasets: [{
                          label: "Total",
                          data: [
                            comunidadeStats.votacoes.total,
                            comunidadeStats.classificados.total,
                            comunidadeStats.achados.total,
                            comunidadeStats.caronas.total
                          ],
                          backgroundColor: ["#8b5cf6", "#22c55e", "#f97316", "#3b82f6"],
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Achados vs Perdidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <Pie
                      data={{
                        labels: ["Achados", "Perdidos", "Resolvidos"],
                        datasets: [{
                          data: [
                            comunidadeStats.achados.encontrados,
                            comunidadeStats.achados.perdidos,
                            comunidadeStats.achados.resolvidos
                          ],
                          backgroundColor: ["#22c55e", "#ef4444", "#3b82f6"],
                          borderWidth: 0,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: "bottom" } },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Votações */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Votações e Enquetes</CardTitle>
                  <CardDescription>Histórico de votações</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="print:hidden"
                    onClick={() => {
                      exportToCSV(
                        (votacoes || []).map(v => ({
                          titulo: v.titulo,
                          tipo: v.tipo,
                          dataFim: v.dataFim ? new Date(v.dataFim).toLocaleDateString("pt-BR") : "",
                        })),
                        "relatorio_votacoes",
                        ["Título", "Tipo", "Data Fim"]
                      );
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="print:hidden"
                    onClick={async () => {
                      toast.loading("Gerando PDF...");
                      try {
                        await exportRelatorioComEstatisticas(
                          "Relatório de Votações",
                          "Histórico de votações e enquetes",
                          [
                            { label: "Total", valor: comunidadeStats.votacoes.total },
                            { label: "Ativas", valor: comunidadeStats.votacoes.ativas },
                            { label: "Encerradas", valor: comunidadeStats.votacoes.encerradas },
                          ],
                          ["Título", "Tipo", "Data Fim"],
                          (votacoes || []).map(v => [
                            v.titulo,
                            v.tipo,
                            v.dataFim ? new Date(v.dataFim).toLocaleDateString("pt-BR") : "-",
                          ]),
                          selectedCondominio ? {
                            nome: selectedCondominio.nome,
                            logoUrl: selectedCondominio.logoUrl,
                            endereco: selectedCondominio.endereco,
                          } : undefined
                        );
                        toast.dismiss();
                        toast.success("PDF gerado com sucesso!");
                      } catch (error) {
                        toast.dismiss();
                        toast.error("Erro ao gerar PDF");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingVotacoes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">Título</th>
                          <th className="text-left py-2 px-2 font-medium">Status</th>
                          <th className="text-left py-2 px-2 font-medium">Data Fim</th>
                        </tr>
                      </thead>
                      <tbody>
                        {votacoes?.map((v) => {
                          const isAtiva = v.dataFim ? new Date(v.dataFim) > new Date() : true;
                          return (
                            <tr key={v.id} className="border-b last:border-0">
                              <td className="py-2 px-2">{v.titulo}</td>
                              <td className="py-2 px-2">
                                <Badge variant={isAtiva ? "default" : "secondary"} className="text-xs">
                                  {isAtiva ? "Ativa" : "Encerrada"}
                                </Badge>
                              </td>
                              <td className="py-2 px-2">
                                {v.dataFim ? new Date(v.dataFim).toLocaleDateString("pt-BR") : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {(!votacoes || votacoes.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhuma votação registrada
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabela de Classificados */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Classificados</CardTitle>
                  <CardDescription>Anúncios da comunidade</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="print:hidden"
                    onClick={() => {
                      exportToCSV(
                        (classificados || []).map(c => ({
                          titulo: c.titulo,
                          tipo: c.tipo,
                          preco: c.preco || "",
                          status: c.status || "pendente",
                        })),
                        "relatorio_classificados",
                        ["Título", "Tipo", "Preço", "Status"]
                      );
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="print:hidden"
                    onClick={async () => {
                      toast.loading("Gerando PDF...");
                      try {
                        await exportRelatorioComEstatisticas(
                          "Relatório de Classificados",
                          "Anúncios da comunidade",
                          [
                            { label: "Total", valor: comunidadeStats.classificados.total },
                            { label: "Ativos", valor: comunidadeStats.classificados.ativos },
                          ],
                          ["Título", "Tipo", "Preço", "Status"],
                          (classificados || []).map(c => [
                            c.titulo,
                            c.tipo,
                            c.preco || "-",
                            c.status === "aprovado" ? "Aprovado" : c.status === "pendente" ? "Pendente" : c.status || "Pendente",
                          ]),
                          selectedCondominio ? {
                            nome: selectedCondominio.nome,
                            logoUrl: selectedCondominio.logoUrl,
                            endereco: selectedCondominio.endereco,
                          } : undefined
                        );
                        toast.dismiss();
                        toast.success("PDF gerado com sucesso!");
                      } catch (error) {
                        toast.dismiss();
                        toast.error("Erro ao gerar PDF");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingClassificados ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">Título</th>
                          <th className="text-left py-2 px-2 font-medium">Tipo</th>
                          <th className="text-left py-2 px-2 font-medium">Preço</th>
                          <th className="text-left py-2 px-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classificados?.map((c) => (
                          <tr key={c.id} className="border-b last:border-0">
                            <td className="py-2 px-2">{c.titulo}</td>
                            <td className="py-2 px-2">{c.tipo}</td>
                            <td className="py-2 px-2">{c.preco || "-"}</td>
                            <td className="py-2 px-2">
                              <Badge variant={c.status === "aprovado" ? "default" : "secondary"} className="text-xs">
                                {c.status === "aprovado" ? "Aprovado" : c.status === "pendente" ? "Pendente" : c.status || "Pendente"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!classificados || classificados.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhum classificado registrado
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* RELATÓRIOS DE AGENDA/EVENTOS */}
        {activeCategory === "agenda" && (
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Eventos</p>
                      <p className="text-2xl font-bold text-pink-600">{eventos?.length || 0}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-pink-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Este Mês</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {eventos?.filter(e => {
                          if (!e.dataEvento) return false;
                          const eventDate = new Date(e.dataEvento);
                          const now = new Date();
                          return eventDate.getMonth() === now.getMonth() && 
                                 eventDate.getFullYear() === now.getFullYear();
                        }).length || 0}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Eventos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Eventos</CardTitle>
                  <CardDescription>Calendário de eventos</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="print:hidden"
                    onClick={() => {
                      exportToCSV(
                        (eventos || []).map(e => ({
                          titulo: e.titulo,
                          local: e.local || "",
                          data: e.dataEvento ? new Date(e.dataEvento).toLocaleDateString("pt-BR") : "",
                          hora: e.horaInicio || "",
                        })),
                        "relatorio_eventos",
                        ["Título", "Local", "Data", "Hora"]
                      );
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="print:hidden"
                    onClick={async () => {
                      toast.loading("Gerando PDF...");
                      try {
                        await exportRelatorioComEstatisticas(
                          "Relatório de Eventos",
                          "Calendário de eventos da organização",
                          [
                            { label: "Total", valor: agendaStats.eventos.total },
                            { label: "Próximos", valor: agendaStats.eventos.proximos },
                            { label: "Realizados", valor: agendaStats.eventos.realizados },
                          ],
                          ["Título", "Local", "Data", "Hora"],
                          (eventos || []).map(e => [
                            e.titulo,
                            e.local || "-",
                            e.dataEvento ? new Date(e.dataEvento).toLocaleDateString("pt-BR") : "-",
                            e.horaInicio || "-",
                          ]),
                          selectedCondominio ? {
                            nome: selectedCondominio.nome,
                            logoUrl: selectedCondominio.logoUrl,
                            endereco: selectedCondominio.endereco,
                          } : undefined
                        );
                        toast.dismiss();
                        toast.success("PDF gerado com sucesso!");
                      } catch (error) {
                        toast.dismiss();
                        toast.error("Erro ao gerar PDF");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingEventos ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">Título</th>
                          <th className="text-left py-2 px-2 font-medium">Local</th>
                          <th className="text-left py-2 px-2 font-medium">Data</th>
                          <th className="text-left py-2 px-2 font-medium">Hora</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventos?.map((e) => (
                          <tr key={e.id} className="border-b last:border-0">
                            <td className="py-2 px-2">{e.titulo}</td>
                            <td className="py-2 px-2">{e.local || "-"}</td>
                            <td className="py-2 px-2">
                              {e.dataEvento ? new Date(e.dataEvento).toLocaleDateString("pt-BR") : "-"}
                            </td>
                            <td className="py-2 px-2">{e.horaInicio || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!eventos || eventos.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhum evento registrado
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* RELATÓRIOS DE MÍDIA/GALERIA */}
        {activeCategory === "midia" && (
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Álbuns</p>
                      <p className="text-2xl font-bold text-cyan-600">{albuns?.length || 0}</p>
                    </div>
                    <FolderOpen className="w-8 h-8 text-cyan-600/20" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total de Álbuns</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {albuns?.length || 0}
                      </p>
                    </div>
                    <Camera className="w-8 h-8 text-purple-600/20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabela de Álbuns */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Galeria de Fotos</CardTitle>
                  <CardDescription>Álbuns e fotos</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="print:hidden"
                    onClick={() => {
                      exportToCSV(
                        (albuns || []).map(a => ({
                          titulo: a.titulo,
                          descricao: a.descricao || "",
                          categoria: a.categoria || "",
                          data: a.createdAt ? new Date(a.createdAt).toLocaleDateString("pt-BR") : "",
                        })),
                        "relatorio_albuns",
                        ["Título", "Descrição", "Categoria", "Data"]
                      );
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="print:hidden"
                    onClick={async () => {
                      toast.loading("Gerando PDF...");
                      try {
                        await exportRelatorioComEstatisticas(
                          "Relatório de Galeria",
                          "Álbuns de fotos da organização",
                          [
                            { label: "Total Álbuns", valor: midiaStats.albuns },
                          ],
                          ["Título", "Descrição", "Categoria", "Data"],
                          (albuns || []).map(a => [
                            a.titulo,
                            a.descricao || "-",
                            a.categoria || "outros",
                            a.createdAt ? new Date(a.createdAt).toLocaleDateString("pt-BR") : "-",
                          ]),
                          selectedCondominio ? {
                            nome: selectedCondominio.nome,
                            logoUrl: selectedCondominio.logoUrl,
                            endereco: selectedCondominio.endereco,
                          } : undefined
                        );
                        toast.dismiss();
                        toast.success("PDF gerado com sucesso!");
                      } catch (error) {
                        toast.dismiss();
                        toast.error("Erro ao gerar PDF");
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingAlbuns ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">Título</th>
                          <th className="text-left py-2 px-2 font-medium">Descrição</th>
                          <th className="text-left py-2 px-2 font-medium">Categoria</th>
                          <th className="text-left py-2 px-2 font-medium">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {albuns?.map((a) => (
                          <tr key={a.id} className="border-b last:border-0">
                            <td className="py-2 px-2">{a.titulo}</td>
                            <td className="py-2 px-2">{a.descricao || "-"}</td>
                            <td className="py-2 px-2">
                              <Badge variant="outline" className="text-xs">
                                {a.categoria || "outros"}
                              </Badge>
                            </td>
                            <td className="py-2 px-2">
                              {a.createdAt ? new Date(a.createdAt).toLocaleDateString("pt-BR") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!albuns || albuns.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhum álbum registrado
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Rodapé para impressão */}
      <div className="hidden print:block mt-8 pt-4 border-t text-xs text-muted-foreground text-center">
        <p>Relatório gerado em {new Date().toLocaleString("pt-BR")}</p>
        <p>{selectedCondominio?.nome || "Condomínio"}</p>
      </div>
    </div>
  );
}
