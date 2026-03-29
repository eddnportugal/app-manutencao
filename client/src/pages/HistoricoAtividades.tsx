import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { FunctionTutorialButton } from "@/components/FunctionTutorial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  History,
  Search,
  Filter,
  Calendar,
  ClipboardCheck,
  Wrench,
  AlertTriangle,
  ClipboardList,
  ListChecks,
  ArrowLeftRight,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  Zap,
  Eye,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface HistoricoAtividadesPageProps {
  condominioId: number;
}

// Mapeamento de tipos para ícones e cores
const tipoConfig: Record<string, { icon: any; cor: string; bgCor: string; label: string }> = {
  // Funções Completas
  vistoria: { icon: ClipboardCheck, cor: "text-blue-600", bgCor: "bg-blue-100 dark:bg-blue-900/50", label: "Vistoria Completa" },
  manutencao: { icon: Wrench, cor: "text-green-600", bgCor: "bg-green-100 dark:bg-green-900/50", label: "Manutenção Completa" },
  ocorrencia: { icon: AlertTriangle, cor: "text-yellow-600", bgCor: "bg-yellow-100 dark:bg-yellow-900/50", label: "Ocorrência Completa" },
  checklist: { icon: ListChecks, cor: "text-indigo-600", bgCor: "bg-indigo-100 dark:bg-indigo-900/50", label: "Checklist Completo" },
  antes_depois: { icon: ArrowLeftRight, cor: "text-pink-600", bgCor: "bg-pink-100 dark:bg-pink-900/50", label: "Antes e Depois Completo" },
  // Funções Rápidas
  vistoria_rapida: { icon: Zap, cor: "text-blue-500", bgCor: "bg-blue-50 dark:bg-blue-900/30", label: "Vistoria Rápida" },
  manutencao_rapida: { icon: Zap, cor: "text-green-500", bgCor: "bg-green-50 dark:bg-green-900/30", label: "Manutenção Rápida" },
  ocorrencia_rapida: { icon: Zap, cor: "text-yellow-500", bgCor: "bg-yellow-50 dark:bg-yellow-900/30", label: "Ocorrência Rápida" },
  checklist_rapido: { icon: Zap, cor: "text-indigo-500", bgCor: "bg-indigo-50 dark:bg-indigo-900/30", label: "Checklist Rápido" },
  antes_depois_rapido: { icon: Zap, cor: "text-pink-500", bgCor: "bg-pink-50 dark:bg-pink-900/30", label: "Antes/Depois Rápido" },
  // Ordem de Serviço
  ordem_servico: { icon: ClipboardList, cor: "text-purple-600", bgCor: "bg-purple-100 dark:bg-purple-900/50", label: "Ordem de Serviço" },
  // Legacy - para compatibilidade
  tarefa_simples: { icon: Zap, cor: "text-orange-600", bgCor: "bg-orange-100 dark:bg-orange-900/50", label: "Função Rápida" },
};

// Status disponíveis
const statusOptions = [
  { value: "todos", label: "Todos os status" },
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "realizada", label: "Realizada" },
  { value: "concluido", label: "Concluído" },
  { value: "finalizada", label: "Finalizada" },
  { value: "acao_necessaria", label: "Ação Necessária" },
  { value: "reaberta", label: "Reaberta" },
  { value: "rascunho", label: "Rascunho" },
  { value: "enviado", label: "Enviado" },
];

// Cores de status
const statusCores: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
  em_andamento: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  realizada: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  concluido: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  finalizada: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
  acao_necessaria: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
  reaberta: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
  rascunho: "bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300",
  enviado: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
};

export default function HistoricoAtividadesPage({ condominioId }: HistoricoAtividadesPageProps) {
  const [, setLocation] = useLocation();
  // Estados dos filtros
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState<string>("todos");
  const [status, setStatus] = useState<string>("todos");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  // Query para buscar histórico unificado
  const { data: historico, isLoading, refetch } = trpc.historicoAtividades.buscarUnificado.useQuery({
    condominioId,
    busca: busca || undefined,
    tipo: tipo as any,
    status: status !== "todos" ? status : undefined,
    dataInicio: dataInicio || undefined,
    dataFim: dataFim || undefined,
    page,
    limit: 50,
  });

  // Limpar filtros
  const limparFiltros = () => {
    setBusca("");
    setTipo("todos");
    setStatus("todos");
    setDataInicio("");
    setDataFim("");
    setPage(1);
  };

  // Navegar para a secção de detalhe do item
  const navegarParaDetalhe = (item: any) => {
    const tipoParaSecao: Record<string, string> = {
      vistoria: "vistorias",
      manutencao: "manutencoes",
      ocorrencia: "ocorrencias",
      checklist: "checklists",
      ordem_servico: "ordens-servico",
      tarefa_simples: "funcoes-simples",
    };
    const secao = tipoParaSecao[item._tipo];
    if (secao) {
      setLocation(`/dashboard/${secao}`);
    }
  };

  // Renderizar item do histórico
  const renderHistoricoItem = (item: any) => {
    const config = tipoConfig[item._tipo] || tipoConfig.tarefa_simples;
    const Icon = config.icon;

    return (
      <Card
        key={`${item._tipo}-${item.id}`}
        className="hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => navegarParaDetalhe(item)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Ícone do tipo */}
            <div className={cn("p-3 rounded-xl", config.bgCor)}>
              <Icon className={cn("w-5 h-5", config.cor)} />
            </div>

            {/* Conteúdo principal */}
            <div className="flex-1 min-w-0">
              {/* Cabeçalho */}
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Badge variant="outline" className="text-xs font-mono">
                  {item.protocolo || `#${item.id}`}
                </Badge>
                <Badge className={cn("text-xs", config.bgCor, config.cor)}>
                  {item._tipoLabel}
                </Badge>
                {item.status && (
                  <Badge className={cn("text-xs", statusCores[item.status] || "bg-gray-100 text-gray-800")}>
                    {item.status.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>

              {/* Título */}
              <h3 className="font-semibold text-base mb-1 truncate">
                {item.titulo || "Sem título"}
              </h3>

              {/* Descrição */}
              {item.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {item.descricao}
                </p>
              )}

              {/* Localização */}
              {(item.localizacao || item.local || item.endereco) && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{item.localizacao || item.local || item.endereco}</span>
                </div>
              )}

              {/* Rodapé com data e responsável */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {format(new Date(item.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                </div>
                {(item.responsavelNome || item.criadoPorNome) && (
                  <span className="truncate">
                    Por: {item.responsavelNome || item.criadoPorNome}
                  </span>
                )}
              </div>
            </div>

            {/* Botão de visualizar */}
            <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => { e.stopPropagation(); navegarParaDetalhe(item); }}>
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div data-tour="header-historico" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <History className="w-6 h-6 text-orange-500" />
            Histórico de Atividades
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualize todas as vistorias, manutenções, ocorrências, checklists e ordens de serviço
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FunctionTutorialButton tutorialId="historico" variant="compact" />
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filtros
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Search className="w-4 h-4" />
              Busca Inteligente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Busca geral */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por protocolo, título ou descrição..."
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-10"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {/* Tipo */}
              <div>
                <Label className="text-xs mb-1 block">Tipo</Label>
                <Select value={tipo} onValueChange={(v) => { setTipo(v); setPage(1); }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    {/* Funções Completas */}
                    <SelectItem value="vistoria">Vistoria Completa</SelectItem>
                    <SelectItem value="manutencao">Manutenção Completa</SelectItem>
                    <SelectItem value="ocorrencia">Ocorrência Completa</SelectItem>
                    <SelectItem value="checklist">Checklist Completo</SelectItem>
                    <SelectItem value="antes_depois">Antes e Depois Completo</SelectItem>
                    {/* Funções Rápidas */}
                    <SelectItem value="vistoria_rapida">Vistoria Rápida</SelectItem>
                    <SelectItem value="manutencao_rapida">Manutenção Rápida</SelectItem>
                    <SelectItem value="ocorrencia_rapida">Ocorrência Rápida</SelectItem>
                    <SelectItem value="checklist_rapido">Checklist Rápido</SelectItem>
                    <SelectItem value="antes_depois_rapido">Antes/Depois Rápido</SelectItem>
                    {/* Ordem de Serviço */}
                    <SelectItem value="ordem_servico">Ordem de Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label className="text-xs mb-1 block">Status</Label>
                <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data Início */}
              <div>
                <Label className="text-xs mb-1 block">De</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => { setDataInicio(e.target.value); setPage(1); }}
                    className="h-9 pl-8"
                  />
                </div>
              </div>

              {/* Data Fim */}
              <div>
                <Label className="text-xs mb-1 block">Até</Label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => { setDataFim(e.target.value); setPage(1); }}
                    className="h-9 pl-8"
                  />
                </div>
              </div>

              {/* Botão Limpar */}
              <div className="flex items-end">
                <Button variant="ghost" size="sm" onClick={limparFiltros} className="w-full h-9">
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas rápidas */}
      {historico && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>
            {historico.total} {historico.total === 1 ? "registro encontrado" : "registros encontrados"}
          </span>
        </div>
      )}

      {/* Lista de histórico */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : historico?.registros && historico.registros.length > 0 ? (
        <div className="space-y-3">
          {historico.registros.map(renderHistoricoItem)}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <History className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-semibold text-lg text-muted-foreground mb-2">
                Nenhum registro encontrado
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                {busca || tipo !== "todos" || status !== "todos" || dataInicio || dataFim
                  ? "Tente ajustar os filtros de busca para encontrar os registros desejados."
                  : "Comece criando uma nova vistoria, manutenção, ocorrência ou ordem de serviço."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Paginação */}
      {historico && historico.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Página {historico.page} de {historico.totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(historico.totalPages, p + 1))}
              disabled={page === historico.totalPages}
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
