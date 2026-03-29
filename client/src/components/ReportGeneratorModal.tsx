import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  Settings2,
  Image,
  List,
  BarChart3,
  CheckSquare,
  Loader2,
  Table,
  FileSpreadsheet,
} from "lucide-react";
import { ReportFilters } from "./ReportFiltersPanel";

export interface ReportField {
  key: string;
  label: string;
  included: boolean;
  format?: (value: any) => string;
}

export interface ReportConfig {
  titulo: string;
  subtitulo?: string;
  incluirLogo: boolean;
  incluirImagens: boolean;
  incluirEstatisticas: boolean;
  incluirGraficos: boolean;
  agruparPor: "nenhum" | "status" | "responsavel" | "prioridade" | "mes";
  ordenarPor: "data_desc" | "data_asc" | "protocolo" | "status";
  campos: ReportField[];
}

interface ReportGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipoFuncao: "vistoria" | "manutencao" | "ocorrencia" | "checklist" | "tarefa_simples";
  filters: ReportFilters;
  items: any[];
  onGenerate: (config: ReportConfig) => void;
  availableFields: ReportField[];
  organizationName?: string | null;
  organizationLogo?: string | null;
}

const tipoLabels: Record<string, string> = {
  vistoria: "Vistorias",
  manutencao: "Manutenções",
  ocorrencia: "Ocorrências",
  checklist: "Checklists",
  tarefa_simples: "Tarefas Rápidas",
};

export function ReportGeneratorModal({
  open,
  onOpenChange,
  tipoFuncao,
  filters,
  items,
  onGenerate,
  availableFields,
  organizationName,
  organizationLogo,
}: ReportGeneratorModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("campos");
  
  const [config, setConfig] = useState<ReportConfig>({
    titulo: `Relatório de ${tipoLabels[tipoFuncao]}`,
    subtitulo: organizationName || "",
    incluirLogo: true,
    incluirImagens: false,
    incluirEstatisticas: true,
    incluirGraficos: false,
    agruparPor: "nenhum",
    ordenarPor: "data_desc",
    campos: availableFields.map(f => ({ ...f, included: true })),
  });

  // Atualizar campos quando availableFields mudar
  useMemo(() => {
    setConfig(prev => ({
      ...prev,
      campos: availableFields.map(f => ({
        ...f,
        included: prev.campos.find(c => c.key === f.key)?.included ?? true,
      })),
    }));
  }, [availableFields]);

  // Estatísticas dos itens
  const stats = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    const responsavelCounts: Record<string, number> = {};
    const prioridadeCounts: Record<string, number> = {};

    items.forEach((item) => {
      // Status
      const status = item.status || "sem_status";
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      // Responsável
      const resp = item.responsavelNome || "Não informado";
      responsavelCounts[resp] = (responsavelCounts[resp] || 0) + 1;

      // Prioridade
      const prio = item.prioridade || "nao_informada";
      prioridadeCounts[prio] = (prioridadeCounts[prio] || 0) + 1;
    });

    return { statusCounts, responsavelCounts, prioridadeCounts };
  }, [items]);

  // Toggle campo
  const toggleCampo = (key: string) => {
    setConfig((prev) => ({
      ...prev,
      campos: prev.campos.map((c) =>
        c.key === key ? { ...c, included: !c.included } : c
      ),
    }));
  };

  // Selecionar/desselecionar todos
  const toggleAllCampos = (selected: boolean) => {
    setConfig((prev) => ({
      ...prev,
      campos: prev.campos.map((c) => ({ ...c, included: selected })),
    }));
  };

  // Gerar relatório
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(config);
    } finally {
      setIsGenerating(false);
    }
  };

  // Contagem de campos selecionados
  const camposSelecionados = config.campos.filter((c) => c.included).length;

  // Resumo dos filtros aplicados
  const filtrosAplicados = useMemo(() => {
    const lista: string[] = [];
    if (filters.status !== "todos") lista.push(`Status: ${filters.status}`);
    if (filters.responsavel !== "todos") lista.push(`Responsável: ${filters.responsavel}`);
    if (filters.prioridade !== "todos") lista.push(`Prioridade: ${filters.prioridade}`);
    if (filters.dataInicio || filters.dataFim) {
      const periodo = filters.dataInicio && filters.dataFim
        ? `${filters.dataInicio} a ${filters.dataFim}`
        : filters.dataInicio || filters.dataFim;
      lista.push(`Período: ${periodo}`);
    }
    return lista;
  }, [filters]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Gerar Relatório de {tipoLabels[tipoFuncao]}
          </DialogTitle>
          <DialogDescription>
            Configure as opções do relatório antes de gerar
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campos" className="gap-2">
              <CheckSquare className="h-4 w-4" />
              Campos
            </TabsTrigger>
            <TabsTrigger value="opcoes" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Opções
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Tab Campos */}
          <TabsContent value="campos" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Cabeçalho */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {camposSelecionados} de {config.campos.length} campos selecionados
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAllCampos(true)}
                    >
                      Selecionar todos
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAllCampos(false)}
                    >
                      Desmarcar todos
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Lista de campos */}
                <div className="grid grid-cols-2 gap-3">
                  {config.campos.map((campo) => (
                    <div
                      key={campo.key}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        campo.included
                          ? "bg-primary/5 border-primary/20"
                          : "bg-muted/30 border-transparent"
                      }`}
                    >
                      <Checkbox
                        id={campo.key}
                        checked={campo.included}
                        onCheckedChange={() => toggleCampo(campo.key)}
                      />
                      <Label
                        htmlFor={campo.key}
                        className="flex-1 cursor-pointer font-normal"
                      >
                        {campo.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Tab Opções */}
          <TabsContent value="opcoes" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {/* Título e subtítulo */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Informações do Relatório
                  </h4>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título do Relatório</Label>
                      <Input
                        id="titulo"
                        value={config.titulo}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, titulo: e.target.value }))
                        }
                        placeholder="Ex: Relatório de Vistorias"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtitulo">Subtítulo (opcional)</Label>
                      <Input
                        id="subtitulo"
                        value={config.subtitulo}
                        onChange={(e) =>
                          setConfig((prev) => ({ ...prev, subtitulo: e.target.value }))
                        }
                        placeholder="Ex: Nome da organização"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Conteúdo adicional */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Conteúdo Adicional
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="logo"
                        checked={config.incluirLogo}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({
                            ...prev,
                            incluirLogo: checked === true,
                          }))
                        }
                      />
                      <Label htmlFor="logo" className="font-normal cursor-pointer">
                        Incluir logo da organização
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="estatisticas"
                        checked={config.incluirEstatisticas}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({
                            ...prev,
                            incluirEstatisticas: checked === true,
                          }))
                        }
                      />
                      <Label htmlFor="estatisticas" className="font-normal cursor-pointer">
                        Incluir resumo estatístico
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="imagens"
                        checked={config.incluirImagens}
                        onCheckedChange={(checked) =>
                          setConfig((prev) => ({
                            ...prev,
                            incluirImagens: checked === true,
                          }))
                        }
                      />
                      <Label htmlFor="imagens" className="font-normal cursor-pointer">
                        Incluir imagens dos registros
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Agrupamento e ordenação */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Organização
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Agrupar por</Label>
                      <Select
                        value={config.agruparPor}
                        onValueChange={(v: any) =>
                          setConfig((prev) => ({ ...prev, agruparPor: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nenhum">Sem agrupamento</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="responsavel">Responsável</SelectItem>
                          <SelectItem value="prioridade">Prioridade</SelectItem>
                          <SelectItem value="mes">Mês</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Ordenar por</Label>
                      <Select
                        value={config.ordenarPor}
                        onValueChange={(v: any) =>
                          setConfig((prev) => ({ ...prev, ordenarPor: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="data_desc">Data (mais recentes)</SelectItem>
                          <SelectItem value="data_asc">Data (mais antigos)</SelectItem>
                          <SelectItem value="protocolo">Protocolo</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Tab Preview */}
          <TabsContent value="preview" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Info do relatório */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total de registros</span>
                    <Badge variant="secondary" className="text-lg px-3">
                      {items.length}
                    </Badge>
                  </div>
                  
                  {/* Filtros aplicados */}
                  {filtrosAplicados.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Filtros aplicados:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {filtrosAplicados.map((f, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Campos selecionados */}
                  <div>
                    <span className="text-sm text-muted-foreground">Campos incluídos:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {config.campos
                        .filter((c) => c.included)
                        .map((c) => (
                          <Badge key={c.key} variant="outline" className="text-xs">
                            {c.label}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Estatísticas preview */}
                {config.incluirEstatisticas && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Resumo por Status</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(stats.statusCounts).map(([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded"
                        >
                          <span className="text-sm capitalize">
                            {status.replace("_", " ")}
                          </span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview da tabela */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <Table className="h-4 w-4" />
                    Preview dos dados (primeiros 3 registros)
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          {config.campos
                            .filter((c) => c.included)
                            .slice(0, 4)
                            .map((campo) => (
                              <th
                                key={campo.key}
                                className="px-3 py-2 text-left font-medium"
                              >
                                {campo.label}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.slice(0, 3).map((item, idx) => (
                          <tr key={idx} className="border-t">
                            {config.campos
                              .filter((c) => c.included)
                              .slice(0, 4)
                              .map((campo) => (
                                <td key={campo.key} className="px-3 py-2">
                                  {campo.format
                                    ? campo.format(item[campo.key])
                                    : item[campo.key] || "-"}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || camposSelecionados === 0}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Gerar PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Função utilitária para gerar o HTML do relatório
export function generateReportHTML(
  items: any[],
  config: ReportConfig,
  logoUrl?: string | null
): string {
  const formatDate = (date: any) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      pendente: "Pendente",
      realizada: "Realizada",
      acao_necessaria: "Ação Necessária",
      finalizada: "Finalizada",
      reaberta: "Reaberta",
      em_andamento: "Em Andamento",
      concluida: "Concluída",
      cancelada: "Cancelada",
    };
    return statusMap[status] || status;
  };

  // Ordenar itens
  const sortedItems = [...items].sort((a, b) => {
    switch (config.ordenarPor) {
      case "data_desc":
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      case "data_asc":
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      case "protocolo":
        return (a.protocolo || "").localeCompare(b.protocolo || "");
      case "status":
        return (a.status || "").localeCompare(b.status || "");
      default:
        return 0;
    }
  });

  // Agrupar itens se necessário
  const groupedItems: Record<string, any[]> = {};
  if (config.agruparPor !== "nenhum") {
    sortedItems.forEach((item) => {
      let groupKey: string;
      switch (config.agruparPor) {
        case "status":
          groupKey = formatStatus(item.status || "Sem status");
          break;
        case "responsavel":
          groupKey = item.responsavelNome || "Não informado";
          break;
        case "prioridade":
          groupKey = item.prioridade?.charAt(0).toUpperCase() + item.prioridade?.slice(1) || "Não informada";
          break;
        case "mes":
          groupKey = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
            : "Sem data";
          break;
        default:
          groupKey = "Todos";
      }
      if (!groupedItems[groupKey]) groupedItems[groupKey] = [];
      groupedItems[groupKey].push(item);
    });
  } else {
    groupedItems["Todos"] = sortedItems;
  }

  // Estatísticas
  const statusCounts: Record<string, number> = {};
  items.forEach((item) => {
    const status = formatStatus(item.status || "sem_status");
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  // Campos selecionados
  const selectedFields = config.campos.filter((c) => c.included);

  // Gerar HTML
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${config.titulo}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #0d9488;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header-info h1 {
          color: #0d9488;
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header-info .subtitle {
          color: #666;
          font-size: 14px;
        }
        .header-info .meta {
          font-size: 12px;
          color: #888;
          margin-top: 5px;
        }
        .logo {
          max-height: 60px;
          max-width: 150px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        .stat-card {
          padding: 15px;
          background: #f8fafc;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #e2e8f0;
        }
        .stat-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #0d9488;
        }
        .stat-card .label {
          font-size: 12px;
          color: #64748b;
          margin-top: 5px;
        }
        .group-header {
          background: #f1f5f9;
          padding: 10px 15px;
          margin: 25px 0 15px;
          border-radius: 6px;
          font-weight: 600;
          color: #334155;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .group-header .count {
          background: #0d9488;
          color: white;
          padding: 2px 10px;
          border-radius: 12px;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 12px;
        }
        th {
          background: #0d9488;
          color: white;
          padding: 10px 8px;
          text-align: left;
          font-weight: 500;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        tr:nth-child(even) {
          background: #f8fafc;
        }
        .status-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }
        .status-pendente { background: #fef3c7; color: #92400e; }
        .status-realizada { background: #dbeafe; color: #1e40af; }
        .status-acao_necessaria { background: #fee2e2; color: #991b1b; }
        .status-finalizada { background: #d1fae5; color: #065f46; }
        .status-em_andamento { background: #e0e7ff; color: #3730a3; }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-info">
          <h1>${config.titulo}</h1>
          ${config.subtitulo ? `<p class="subtitle">${config.subtitulo}</p>` : ""}
          <p class="meta">Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
          <p class="meta">Total de registros: ${items.length}</p>
        </div>
        ${config.incluirLogo && logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo" />` : ""}
      </div>

      ${config.incluirEstatisticas ? `
        <div class="stats-grid">
          ${Object.entries(statusCounts)
            .map(([status, count]) => `
              <div class="stat-card">
                <div class="value">${count}</div>
                <div class="label">${status}</div>
              </div>
            `)
            .join("")}
        </div>
      ` : ""}

      ${Object.entries(groupedItems)
        .map(([group, groupItems]) => `
          ${config.agruparPor !== "nenhum" ? `
            <div class="group-header">
              <span>${group}</span>
              <span class="count">${groupItems.length} registro${groupItems.length !== 1 ? "s" : ""}</span>
            </div>
          ` : ""}
          <table>
            <thead>
              <tr>
                ${selectedFields.map((f) => `<th>${f.label}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${groupItems
                .map((item) => `
                  <tr>
                    ${selectedFields
                      .map((f) => {
                        let value = item[f.key];
                        if (f.key === "status") {
                          const statusClass = `status-${(value || "").toLowerCase().replace(" ", "_")}`;
                          return `<td><span class="status-badge ${statusClass}">${formatStatus(value)}</span></td>`;
                        }
                        if (f.key === "createdAt" || f.key === "dataAgendada" || f.key === "updatedAt") {
                          return `<td>${formatDate(value)}</td>`;
                        }
                        return `<td>${value || "-"}</td>`;
                      })
                      .join("")}
                  </tr>
                `)
                .join("")}
            </tbody>
          </table>
        `)
        .join("")}

      <div class="footer">
        <p>Relatório gerado automaticamente pelo Sistema de Manutenção</p>
      </div>
    </body>
    </html>
  `;

  return html;
}

// Função para abrir janela de impressão com o relatório
export function printReport(html: string) {
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

export default ReportGeneratorModal;
