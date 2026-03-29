import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  Filter,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  RotateCcw,
} from "lucide-react";

export interface ReportFilters {
  search: string;
  status: string;
  responsavel: string;
  prioridade: string;
  dataInicio: string;
  dataFim: string;
  periodoRapido: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

interface ReportFiltersPanelProps {
  filters: ReportFilters;
  onFiltersChange: (filters: ReportFilters) => void;
  statusOptions: FilterOption[];
  responsaveis?: string[];
  prioridadeOptions?: FilterOption[];
  showPrioridade?: boolean;
  searchPlaceholder?: string;
  onGenerateReport?: () => void;
  totalResults?: number;
  filteredResults?: number;
}

const periodoRapidoOptions: FilterOption[] = [
  { value: "todos", label: "Todo período" },
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Esta semana" },
  { value: "mes", label: "Este mês" },
  { value: "trimestre", label: "Último trimestre" },
  { value: "semestre", label: "Último semestre" },
  { value: "ano", label: "Este ano" },
  { value: "personalizado", label: "Personalizado" },
];

export function ReportFiltersPanel({
  filters,
  onFiltersChange,
  statusOptions,
  responsaveis = [],
  prioridadeOptions = [
    { value: "todos", label: "Todas" },
    { value: "baixa", label: "Baixa" },
    { value: "media", label: "Média" },
    { value: "alta", label: "Alta" },
    { value: "urgente", label: "Urgente" },
  ],
  showPrioridade = true,
  searchPlaceholder = "Buscar por protocolo...",
  onGenerateReport,
  totalResults,
  filteredResults,
}: ReportFiltersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Atualizar filtro individual
  const updateFilter = (key: keyof ReportFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Se selecionar período rápido, calcular datas automaticamente
    if (key === "periodoRapido" && value !== "personalizado") {
      const { dataInicio, dataFim } = calcularPeriodo(value);
      newFilters.dataInicio = dataInicio;
      newFilters.dataFim = dataFim;
    }
    
    onFiltersChange(newFilters);
  };

  // Calcular datas baseado no período rápido selecionado
  const calcularPeriodo = (periodo: string): { dataInicio: string; dataFim: string } => {
    const hoje = new Date();
    const formatDate = (d: Date) => d.toISOString().split("T")[0];
    
    switch (periodo) {
      case "hoje":
        return { dataInicio: formatDate(hoje), dataFim: formatDate(hoje) };
      case "semana": {
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        return { dataInicio: formatDate(inicioSemana), dataFim: formatDate(hoje) };
      }
      case "mes": {
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        return { dataInicio: formatDate(inicioMes), dataFim: formatDate(hoje) };
      }
      case "trimestre": {
        const inicioTrimestre = new Date(hoje);
        inicioTrimestre.setMonth(hoje.getMonth() - 3);
        return { dataInicio: formatDate(inicioTrimestre), dataFim: formatDate(hoje) };
      }
      case "semestre": {
        const inicioSemestre = new Date(hoje);
        inicioSemestre.setMonth(hoje.getMonth() - 6);
        return { dataInicio: formatDate(inicioSemestre), dataFim: formatDate(hoje) };
      }
      case "ano": {
        const inicioAno = new Date(hoje.getFullYear(), 0, 1);
        return { dataInicio: formatDate(inicioAno), dataFim: formatDate(hoje) };
      }
      default:
        return { dataInicio: "", dataFim: "" };
    }
  };

  // Limpar todos os filtros
  const limparFiltros = () => {
    onFiltersChange({
      search: "",
      status: "todos",
      responsavel: "todos",
      prioridade: "todos",
      dataInicio: "",
      dataFim: "",
      periodoRapido: "todos",
    });
  };

  // Contar filtros ativos
  const filtrosAtivos = useMemo(() => {
    let count = 0;
    if (filters.status !== "todos") count++;
    if (filters.responsavel !== "todos") count++;
    if (filters.prioridade !== "todos") count++;
    if (filters.dataInicio || filters.dataFim) count++;
    return count;
  }, [filters]);

  // Lista única de responsáveis
  const responsaveisUnicos = useMemo(() => {
    const filtrados = responsaveis.filter(r => r && r.trim());
    const setObj = new Set(filtrados);
    const unicos: string[] = [];
    setObj.forEach(item => unicos.push(item));
    return unicos.sort((a, b) => a.localeCompare(b));
  }, [responsaveis]);

  return (
    <Card className="border-dashed">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardContent className="p-4">
          {/* Linha principal - sempre visível */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={filters.search}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status - sempre visível */}
            <Select value={filters.status} onValueChange={(v) => updateFilter("status", v)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Botão expandir filtros */}
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtros
                {filtrosAtivos > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {filtrosAtivos}
                  </Badge>
                )}
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>

            {/* Botão gerar relatório */}
            {onGenerateReport && (
              <Button onClick={onGenerateReport} className="gap-2 bg-primary">
                <FileText className="h-4 w-4" />
                Gerar Relatório
              </Button>
            )}
          </div>

          {/* Filtros expandidos */}
          <CollapsibleContent className="mt-4">
            <div className="border-t pt-4 space-y-4">
              {/* Linha 1: Período e responsável */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Período rápido */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Período
                  </Label>
                  <Select
                    value={filters.periodoRapido}
                    onValueChange={(v) => updateFilter("periodoRapido", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent>
                      {periodoRapidoOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data início */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Data Início</Label>
                  <Input
                    type="date"
                    value={filters.dataInicio}
                    onChange={(e) => {
                      updateFilter("dataInicio", e.target.value);
                      updateFilter("periodoRapido", "personalizado");
                    }}
                  />
                </div>

                {/* Data fim */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Data Fim</Label>
                  <Input
                    type="date"
                    value={filters.dataFim}
                    onChange={(e) => {
                      updateFilter("dataFim", e.target.value);
                      updateFilter("periodoRapido", "personalizado");
                    }}
                  />
                </div>

                {/* Responsável */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Responsável
                  </Label>
                  <Select
                    value={filters.responsavel}
                    onValueChange={(v) => updateFilter("responsavel", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {responsaveisUnicos.map((resp) => (
                        <SelectItem key={resp} value={resp}>
                          {resp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Linha 2: Prioridade e ações */}
              <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
                {/* Prioridade */}
                {showPrioridade && (
                  <div className="space-y-2 w-full md:w-48">
                    <Label className="text-sm font-medium">Prioridade</Label>
                    <Select
                      value={filters.prioridade}
                      onValueChange={(v) => updateFilter("prioridade", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        {prioridadeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Resumo e limpar */}
                <div className="flex items-center gap-4 ml-auto">
                  {/* Contagem de resultados */}
                  {totalResults !== undefined && filteredResults !== undefined && (
                    <span className="text-sm text-muted-foreground">
                      Mostrando <strong>{filteredResults}</strong> de{" "}
                      <strong>{totalResults}</strong> registros
                    </span>
                  )}

                  {/* Botão limpar filtros */}
                  {filtrosAtivos > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={limparFiltros}
                      className="gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Limpar filtros
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}

// Hook para usar os filtros
export function useReportFilters() {
  const [filters, setFilters] = useState<ReportFilters>({
    search: "",
    status: "todos",
    responsavel: "todos",
    prioridade: "todos",
    dataInicio: "",
    dataFim: "",
    periodoRapido: "todos",
  });

  return { filters, setFilters };
}

// Função auxiliar para aplicar filtros em uma lista
export function applyFilters<T extends Record<string, any>>(
  items: T[],
  filters: ReportFilters,
  config: {
    searchFields?: (keyof T)[];
    statusField?: keyof T;
    responsavelField?: keyof T;
    prioridadeField?: keyof T;
    dateField?: keyof T;
  } = {}
): T[] {
  const {
    searchFields = ["protocolo", "titulo"],
    statusField = "status",
    responsavelField = "responsavelNome",
    prioridadeField = "prioridade",
    dateField = "createdAt",
  } = config;

  return items.filter((item) => {
    // Filtro de busca
    if (filters.search && filters.search.length >= 2) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = searchFields.some((field) => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(searchLower);
      });
      if (!matchesSearch) return false;
    }

    // Filtro de status
    if (filters.status !== "todos") {
      if (item[statusField] !== filters.status) return false;
    }

    // Filtro de responsável
    if (filters.responsavel !== "todos") {
      if (item[responsavelField] !== filters.responsavel) return false;
    }

    // Filtro de prioridade
    if (filters.prioridade !== "todos") {
      if (item[prioridadeField] !== filters.prioridade) return false;
    }

    // Filtro de data
    if (filters.dataInicio || filters.dataFim) {
      const itemDate = item[dateField];
      if (itemDate) {
        const date = new Date(itemDate as string);
        if (filters.dataInicio) {
          const startDate = new Date(filters.dataInicio);
          if (date < startDate) return false;
        }
        if (filters.dataFim) {
          const endDate = new Date(filters.dataFim + "T23:59:59");
          if (date > endDate) return false;
        }
      }
    }

    return true;
  });
}

export default ReportFiltersPanel;
