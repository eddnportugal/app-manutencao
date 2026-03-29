import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import {
  exportManutencoesPDF,
  exportOcorrenciasPDF,
  exportVistoriasPDF,
  exportChecklistsPDF,
} from "@/lib/pdfRelatoriosManutencao";
import {
  exportManutencoesExcel,
  exportOcorrenciasExcel,
  exportVistoriasExcel,
  exportChecklistsExcel,
} from "@/lib/excelExport";
import {
  Download,
  Wrench,
  AlertTriangle,
  ClipboardCheck,
  ListChecks,
  Filter,
  RefreshCw,
  Loader2,
  BarChart3,
  User,
  AlertCircle,
  Package,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function RelatoriosManutencaoPage() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [filterResponsavel, setFilterResponsavel] = useState("");
  const [filterPrioridade, setFilterPrioridade] = useState("");
  const [filterProtocolo, setFilterProtocolo] = useState("");
  const [selectedCondominioFilter, setSelectedCondominioFilter] = useState<number | null>(null);
  
  const { data: condominios } = trpc.condominio.list.useQuery();
  const selectedCondominioId = selectedCondominioFilter || condominios?.[0]?.id;

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

  const filterByDateRange = (items: any[] | undefined) => {
    if (!items) return [];
    return items.filter((item) => {
      const itemDate = new Date(item.data || item.dataEvento || item.dataCriacao || 0);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    });
  };

  const filterByResponsavel = (items: any[] | undefined) => {
    if (!items || !filterResponsavel) return items || [];
    return items.filter((item) => 
      item.responsavelNome?.toLowerCase().includes(filterResponsavel.toLowerCase()) ||
      item.reportadoPorNome?.toLowerCase().includes(filterResponsavel.toLowerCase())
    );
  };

  const filterByPrioridade = (items: any[] | undefined) => {
    if (!items || !filterPrioridade) return items || [];
    return items.filter((item) => item.prioridade === filterPrioridade);
  };

  const filterByProtocolo = (items: any[] | undefined) => {
    if (!items || !filterProtocolo) return items || [];
    return items.filter((item) => 
      item.id?.toString().includes(filterProtocolo) ||
      item.protocolo?.toString().includes(filterProtocolo)
    );
  };

  const applyAllFilters = (items: any[] | undefined) => {
    let filtered = filterByDateRange(items);
    filtered = filterByResponsavel(filtered);
    filtered = filterByPrioridade(filtered);
    filtered = filterByProtocolo(filtered);
    return filtered;
  };

  const filteredManutencoes = applyAllFilters(manutencoes);
  const filteredOcorrencias = applyAllFilters(ocorrencias);
  const filteredVistorias = applyAllFilters(vistorias);
  const filteredChecklists = applyAllFilters(checklists);

  const clearFilters = () => {
    setDateRange({ start: "", end: "" });
    setFilterResponsavel("");
    setFilterPrioridade("");
    setFilterProtocolo("");
  };

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
      total: filteredChecklists?.length || 0,
    },
  };

  const responsaveisUnicos = Array.from(
    new Set([
      ...(manutencoes?.map(m => m.responsavelNome) || []),
      ...(ocorrencias?.map(o => o.reportadoPorNome) || []),
      ...(vistorias?.map(v => v.responsavelNome) || []),
    ].filter(Boolean))
  ) as string[];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Relatórios de Manutenção</h1>
          <p className="text-muted-foreground">
            Análise completa de manutenções, ocorrências, vistorias e checklists
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtros Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="condominio">Condomínio/Organização</Label>
                <Select 
                  value={String(selectedCondominioId || "")} 
                  onValueChange={(v) => setSelectedCondominioFilter(parseInt(v))}
                >
                  <SelectTrigger id="condominio">
                    <SelectValue placeholder="Selecione um condomínio" />
                  </SelectTrigger>
                  <SelectContent>
                    {condominios?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros Avançados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="data-inicio">Data Inicial</Label>
                <Input
                  id="data-inicio"
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="data-fim">Data Final</Label>
                <Input
                  id="data-fim"
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="responsavel">Responsável</Label>
                <Select value={filterResponsavel} onValueChange={setFilterResponsavel}>
                  <SelectTrigger id="responsavel">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {responsaveisUnicos.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
                  <SelectTrigger id="prioridade">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="protocolo">Protocolo</Label>
                <Input
                  id="protocolo"
                  placeholder="Buscar protocolo..."
                  value={filterProtocolo}
                  onChange={(e) => setFilterProtocolo(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={clearFilters} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-600" />
                Manutenções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-orange-600">{operacionalStats.manutencoes.total}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {operacionalStats.manutencoes.pendentes} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Ocorrências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">{operacionalStats.ocorrencias.total}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {operacionalStats.ocorrencias.pendentes} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-purple-600" />
                Vistorias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-purple-600">{operacionalStats.vistorias.total}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {operacionalStats.vistorias.pendentes} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-green-600" />
                Checklists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{operacionalStats.checklists.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Registros</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="distribuicao" className="space-y-4">
          <TabsList>
            <TabsTrigger value="distribuicao">Distribuição</TabsTrigger>
            <TabsTrigger value="responsavel">Por Responsável</TabsTrigger>
            <TabsTrigger value="prioridade">Por Prioridade</TabsTrigger>
          </TabsList>

          <TabsContent value="distribuicao">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Distribuição por Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Bar
                    data={{
                      labels: ["Manutenções", "Ocorrências", "Vistorias"],
                      datasets: [
                        {
                          label: "Pendentes",
                          data: [
                            operacionalStats.manutencoes.pendentes,
                            operacionalStats.ocorrencias.pendentes,
                            operacionalStats.vistorias.pendentes,
                          ],
                          backgroundColor: "rgba(255, 193, 7, 0.8)",
                        },
                        {
                          label: "Realizadas",
                          data: [
                            operacionalStats.manutencoes.realizadas,
                            operacionalStats.ocorrencias.realizadas,
                            operacionalStats.vistorias.realizadas,
                          ],
                          backgroundColor: "rgba(76, 175, 80, 0.8)",
                        },
                        {
                          label: "Finalizadas",
                          data: [
                            operacionalStats.manutencoes.finalizadas,
                            operacionalStats.ocorrencias.finalizadas,
                            0,
                          ],
                          backgroundColor: "rgba(33, 150, 243, 0.8)",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "top" as const } },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="responsavel">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Atividades por Responsável
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Pie
                    data={{
                      labels: responsaveisUnicos.length > 0 ? responsaveisUnicos : ["Sem dados"],
                      datasets: [
                        {
                          data: responsaveisUnicos.length > 0 
                            ? responsaveisUnicos.map((r) => {
                                const mCount = filteredManutencoes?.filter(m => m.responsavelNome === r).length || 0;
                                const oCount = filteredOcorrencias?.filter(o => o.reportadoPorNome === r).length || 0;
                                const vCount = filteredVistorias?.filter(v => v.responsavelNome === r).length || 0;
                                return mCount + oCount + vCount;
                              })
                            : [1],
                          backgroundColor: [
                            "rgba(255, 107, 107, 0.8)",
                            "rgba(255, 159, 64, 0.8)",
                            "rgba(255, 193, 7, 0.8)",
                            "rgba(76, 175, 80, 0.8)",
                            "rgba(33, 150, 243, 0.8)",
                            "rgba(156, 39, 176, 0.8)",
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom" as const } },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prioridade">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Distribuição por Prioridade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Doughnut
                    data={{
                      labels: ["Baixa", "Média", "Alta", "Urgente"],
                      datasets: [
                        {
                          data: [
                            [...(filteredManutencoes || []), ...(filteredOcorrencias || []), ...(filteredVistorias || [])].filter(
                              (i) => i.prioridade === "baixa"
                            ).length,
                            [...(filteredManutencoes || []), ...(filteredOcorrencias || []), ...(filteredVistorias || [])].filter(
                              (i) => i.prioridade === "media"
                            ).length,
                            [...(filteredManutencoes || []), ...(filteredOcorrencias || []), ...(filteredVistorias || [])].filter(
                              (i) => i.prioridade === "alta"
                            ).length,
                            [...(filteredManutencoes || []), ...(filteredOcorrencias || []), ...(filteredVistorias || [])].filter(
                              (i) => i.prioridade === "urgente"
                            ).length,
                          ],
                          backgroundColor: [
                            "rgba(76, 175, 80, 0.8)",
                            "rgba(255, 193, 7, 0.8)",
                            "rgba(255, 107, 107, 0.8)",
                            "rgba(244, 67, 54, 0.8)",
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom" as const } },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Tabs defaultValue="manutencoes" className="space-y-4">
          <TabsList>
            <TabsTrigger value="manutencoes">Manutenções ({filteredManutencoes?.length || 0})</TabsTrigger>
            <TabsTrigger value="ocorrencias">Ocorrências ({filteredOcorrencias?.length || 0})</TabsTrigger>
            <TabsTrigger value="vistorias">Vistorias ({filteredVistorias?.length || 0})</TabsTrigger>
            <TabsTrigger value="checklists">Checklists ({filteredChecklists?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="manutencoes">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">Manutenções</CardTitle>
                    <CardDescription>Histórico de manutenções</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const org = condominios?.find(c => c.id === selectedCondominioId);
                          await exportManutencoesPDF(filteredManutencoes || [], org ? { nome: org.nome } : undefined);
                          toast.success("Relatório exportado com sucesso!");
                        } catch (error) {
                          toast.error("Erro ao exportar relatório");
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        try {
                          const org = condominios?.find(c => c.id === selectedCondominioId);
                          exportManutencoesExcel(filteredManutencoes || [], org ? { nome: org.nome } : undefined);
                          toast.success("Exportado para Excel com sucesso!");
                        } catch (error) {
                          toast.error("Erro ao exportar para Excel");
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                  </div>
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
                          <th className="text-left py-2 px-2 font-medium">Protocolo</th>
                          <th className="text-left py-2 px-2 font-medium">Data</th>
                          <th className="text-left py-2 px-2 font-medium">Responsável</th>
                          <th className="text-left py-2 px-2 font-medium">Status</th>
                          <th className="text-left py-2 px-2 font-medium">Prioridade</th>
                          <th className="text-left py-2 px-2 font-medium">Descrição</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredManutencoes?.map((manutencao) => (
                          <tr key={manutencao.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-2 px-2 font-mono text-xs">{manutencao.protocolo || manutencao.id}</td>
                            <td className="py-2 px-2">
                              {manutencao.data ? new Date(manutencao.data).toLocaleDateString("pt-BR") : "-"}
                            </td>
                            <td className="py-2 px-2">{manutencao.responsavelNome || "-"}</td>
                            <td className="py-2 px-2">
                              <Badge
                                variant={
                                  manutencao.status === "pendente" ? "secondary" :
                                  manutencao.status === "realizada" ? "default" : "outline"
                                }
                                className="text-xs"
                              >
                                {manutencao.status}
                              </Badge>
                            </td>
                            <td className="py-2 px-2">
                              <Badge
                                variant={
                                  manutencao.prioridade === "urgente" ? "destructive" :
                                  manutencao.prioridade === "alta" ? "secondary" : "outline"
                                }
                                className="text-xs"
                              >
                                {manutencao.prioridade || "-"}
                              </Badge>
                            </td>
                            <td className="py-2 px-2 text-muted-foreground truncate max-w-xs">
                              {manutencao.descricao || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!filteredManutencoes || filteredManutencoes.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhuma manutenção encontrada
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ocorrencias">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">Ocorrências</CardTitle>
                    <CardDescription>Histórico de ocorrências</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const org = condominios?.find(c => c.id === selectedCondominioId);
                          await exportOcorrenciasPDF(filteredOcorrencias || [], org ? { nome: org.nome } : undefined);
                          toast.success("Relatório exportado com sucesso!");
                        } catch (error) {
                          toast.error("Erro ao exportar relatório");
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        try {
                          const org = condominios?.find(c => c.id === selectedCondominioId);
                          exportOcorrenciasExcel(filteredOcorrencias || [], org ? { nome: org.nome } : undefined);
                          toast.success("Exportado para Excel com sucesso!");
                        } catch (error) {
                          toast.error("Erro ao exportar para Excel");
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                  </div>
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
                          <th className="text-left py-2 px-2 font-medium">Protocolo</th>
                          <th className="text-left py-2 px-2 font-medium">Data</th>
                          <th className="text-left py-2 px-2 font-medium">Reportado Por</th>
                          <th className="text-left py-2 px-2 font-medium">Status</th>
                          <th className="text-left py-2 px-2 font-medium">Descrição</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOcorrencias?.map((ocorrencia) => (
                          <tr key={ocorrencia.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-2 px-2 font-mono text-xs">{ocorrencia.protocolo || ocorrencia.id}</td>
                            <td className="py-2 px-2">
                              {ocorrencia.data ? new Date(ocorrencia.data).toLocaleDateString("pt-BR") : "-"}
                            </td>
                            <td className="py-2 px-2">{ocorrencia.reportadoPorNome || "-"}</td>
                            <td className="py-2 px-2">
                              <Badge
                                variant={
                                  ocorrencia.status === "pendente" ? "secondary" :
                                  ocorrencia.status === "realizada" ? "default" : "outline"
                                }
                                className="text-xs"
                              >
                                {ocorrencia.status}
                              </Badge>
                            </td>
                            <td className="py-2 px-2 text-muted-foreground truncate max-w-xs">
                              {ocorrencia.descricao || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!filteredOcorrencias || filteredOcorrencias.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhuma ocorrência encontrada
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vistorias">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">Vistorias</CardTitle>
                    <CardDescription>Histórico de vistorias</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const org = condominios?.find(c => c.id === selectedCondominioId);
                          await exportVistoriasPDF(filteredVistorias || [], org ? { nome: org.nome } : undefined);
                          toast.success("Relatório exportado com sucesso!");
                        } catch (error) {
                          toast.error("Erro ao exportar relatório");
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        try {
                          const org = condominios?.find(c => c.id === selectedCondominioId);
                          exportVistoriasExcel(filteredVistorias || [], org ? { nome: org.nome } : undefined);
                          toast.success("Exportado para Excel com sucesso!");
                        } catch (error) {
                          toast.error("Erro ao exportar para Excel");
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                  </div>
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
                          <th className="text-left py-2 px-2 font-medium">Protocolo</th>
                          <th className="text-left py-2 px-2 font-medium">Data</th>
                          <th className="text-left py-2 px-2 font-medium">Responsável</th>
                          <th className="text-left py-2 px-2 font-medium">Status</th>
                          <th className="text-left py-2 px-2 font-medium">Descrição</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVistorias?.map((vistoria) => (
                          <tr key={vistoria.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-2 px-2 font-mono text-xs">{vistoria.protocolo || vistoria.id}</td>
                            <td className="py-2 px-2">
                              {vistoria.data ? new Date(vistoria.data).toLocaleDateString("pt-BR") : "-"}
                            </td>
                            <td className="py-2 px-2">{vistoria.responsavelNome || "-"}</td>
                            <td className="py-2 px-2">
                              <Badge
                                variant={
                                  vistoria.status === "pendente" ? "secondary" :
                                  vistoria.status === "realizada" ? "default" : "outline"
                                }
                                className="text-xs"
                              >
                                {vistoria.status}
                              </Badge>
                            </td>
                            <td className="py-2 px-2 text-muted-foreground truncate max-w-xs">
                              {vistoria.descricao || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!filteredVistorias || filteredVistorias.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhuma vistoria encontrada
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checklists">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">Checklists</CardTitle>
                    <CardDescription>Histórico de checklists</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const org = condominios?.find(c => c.id === selectedCondominioId);
                          await exportChecklistsPDF(filteredChecklists || [], org ? { nome: org.nome } : undefined);
                          toast.success("Relatório exportado com sucesso!");
                        } catch (error) {
                          toast.error("Erro ao exportar relatório");
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        try {
                          const org = condominios?.find(c => c.id === selectedCondominioId);
                          exportChecklistsExcel(filteredChecklists || [], org ? { nome: org.nome } : undefined);
                          toast.success("Exportado para Excel com sucesso!");
                        } catch (error) {
                          toast.error("Erro ao exportar para Excel");
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingChecklists ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2 font-medium">ID</th>
                          <th className="text-left py-2 px-2 font-medium">Data</th>
                          <th className="text-left py-2 px-2 font-medium">Título</th>
                          <th className="text-left py-2 px-2 font-medium">Itens</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredChecklists?.map((checklist) => (
                          <tr key={checklist.id} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="py-2 px-2 font-mono text-xs">{checklist.id}</td>
                            <td className="py-2 px-2">
                              {checklist.dataCriacao ? new Date(checklist.dataCriacao).toLocaleDateString("pt-BR") : "-"}
                            </td>
                            <td className="py-2 px-2">{checklist.titulo || "-"}</td>
                            <td className="py-2 px-2 text-muted-foreground">
                              {checklist.itens?.length || 0} itens
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {(!filteredChecklists || filteredChecklists.length === 0) && (
                      <p className="text-center py-8 text-muted-foreground">
                        Nenhum checklist encontrado
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
