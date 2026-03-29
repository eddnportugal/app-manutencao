import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { FunctionTutorialButton } from "@/components/FunctionTutorial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import {
  Share2,
  Eye,
  EyeOff,
  Clock,
  User,
  Mail,
  Phone,
  MessageCircle,
  FileText,
  Wrench,
  AlertTriangle,
  ClipboardCheck,
  ArrowLeftRight,
  Briefcase,
  ListTodo,
  Calendar,
  Monitor,
  Smartphone,
  Globe,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Send,
  ExternalLink,
  Download,
  FileSpreadsheet
} from "lucide-react";

interface Compartilhamento {
  id: number;
  condominioId: number;
  remetenteId: number | null;
  remetenteNome: string | null;
  destinatarioId: number | null;
  destinatarioNome: string | null;
  destinatarioEmail: string | null;
  destinatarioTelefone: string | null;
  tipoItem: string;
  itemId: number;
  itemProtocolo: string | null;
  itemTitulo: string | null;
  token: string;
  canalEnvio: string | null;
  mensagem: string | null;
  emailEnviado: boolean | null;
  ativo: boolean | null;
  expiraEm: Date | null;
  createdAt: Date;
  visualizacoes: Visualizacao[];
  totalVisualizacoes: number;
  primeiraVisualizacao: Date | null;
  ultimaVisualizacao: Date | null;
}

interface Visualizacao {
  id: number;
  compartilhamentoId: number;
  dataVisualizacao: Date;
  ip: string | null;
  userAgent: string | null;
  dispositivo: string | null;
  navegador: string | null;
  sistemaOperacional: string | null;
}

export default function CompartilhamentosPage() {
  const [pagina, setPagina] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [busca, setBusca] = useState("");
  const [compartilhamentoSelecionado, setCompartilhamentoSelecionado] = useState<Compartilhamento | null>(null);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [exportandoPdf, setExportandoPdf] = useState(false);
  const [exportandoExcel, setExportandoExcel] = useState(false);

  // Mutations para exportação
  const exportarExcelMutation = trpc.membroEquipe.exportarExcel.useMutation({
    onSuccess: (result) => {
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${result.data}`;
      link.download = result.filename;
      link.click();
      toast.success("Excel exportado com sucesso!");
      setExportandoExcel(false);
    },
    onError: () => {
      toast.error("Erro ao exportar Excel");
      setExportandoExcel(false);
    },
  });

  const exportarPdfMutation = trpc.membroEquipe.exportarPdf.useMutation({
    onSuccess: (result) => {
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${result.data}`;
      link.download = result.filename;
      link.click();
      toast.success("PDF exportado com sucesso!");
      setExportandoPdf(false);
    },
    onError: () => {
      toast.error("Erro ao exportar PDF");
      setExportandoPdf(false);
    },
  });

  // Buscar condomínio ativo do usuário
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioAtivo = condominios?.[0];

  // Buscar compartilhamentos
  const { data: compartilhamentosData, isLoading, refetch } = trpc.membroEquipe.listarCompartilhamentos.useQuery(
    { condominioId: condominioAtivo?.id || 0, pagina, porPagina: 20 },
    { enabled: !!condominioAtivo?.id }
  );

  const compartilhamentos = compartilhamentosData?.compartilhamentos || [];
  const totalCompartilhamentos = compartilhamentosData?.total || 0;
  const totalPaginas = Math.ceil(totalCompartilhamentos / 20);

  // Filtrar compartilhamentos
  const compartilhamentosFiltrados = compartilhamentos.filter((c) => {
    // Filtro por tipo
    if (filtroTipo !== "todos" && c.tipoItem !== filtroTipo) return false;
    
    // Filtro por status
    if (filtroStatus === "visualizado" && c.totalVisualizacoes === 0) return false;
    if (filtroStatus === "pendente" && c.totalVisualizacoes > 0) return false;
    
    // Filtro por busca
    if (busca) {
      const termoBusca = busca.toLowerCase();
      const matchTitulo = c.itemTitulo?.toLowerCase().includes(termoBusca);
      const matchProtocolo = c.itemProtocolo?.toLowerCase().includes(termoBusca);
      const matchDestinatario = c.destinatarioNome?.toLowerCase().includes(termoBusca);
      if (!matchTitulo && !matchProtocolo && !matchDestinatario) return false;
    }
    
    return true;
  });

  // Estatísticas
  const totalEnviados = compartilhamentos.length;
  const totalVisualizados = compartilhamentos.filter(c => c.totalVisualizacoes > 0).length;
  const totalPendentes = totalEnviados - totalVisualizados;
  const taxaVisualizacao = totalEnviados > 0 ? Math.round((totalVisualizados / totalEnviados) * 100) : 0;

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "vistoria": return <FileText className="h-4 w-4" />;
      case "manutencao": return <Wrench className="h-4 w-4" />;
      case "ocorrencia": return <AlertTriangle className="h-4 w-4" />;
      case "checklist": return <ClipboardCheck className="h-4 w-4" />;
      case "antes_depois": return <ArrowLeftRight className="h-4 w-4" />;
      case "ordem_servico": return <Briefcase className="h-4 w-4" />;
      case "tarefa_simples": return <ListTodo className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "vistoria": return "Vistoria";
      case "manutencao": return "Manutenção";
      case "ocorrencia": return "Ocorrência";
      case "checklist": return "Checklist";
      case "antes_depois": return "Antes e Depois";
      case "ordem_servico": return "Ordem de Serviço";
      case "tarefa_simples": return "Tarefa";
      default: return "Item";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "vistoria": return "bg-blue-100 text-blue-700 border-blue-200";
      case "manutencao": return "bg-orange-100 text-orange-700 border-orange-200";
      case "ocorrencia": return "bg-red-100 text-red-700 border-red-200";
      case "checklist": return "bg-green-100 text-green-700 border-green-200";
      case "antes_depois": return "bg-purple-100 text-purple-700 border-purple-200";
      case "ordem_servico": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "tarefa_simples": return "bg-teal-100 text-teal-700 border-teal-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case "email": return <Mail className="h-4 w-4" />;
      case "whatsapp": return <MessageCircle className="h-4 w-4" />;
      case "ambos": return <Send className="h-4 w-4" />;
      default: return <Send className="h-4 w-4" />;
    }
  };

  const getDispositivoIcon = (dispositivo: string | null) => {
    if (!dispositivo) return <Monitor className="h-4 w-4" />;
    if (dispositivo.toLowerCase().includes("mobile") || dispositivo.toLowerCase().includes("android") || dispositivo.toLowerCase().includes("ios")) {
      return <Smartphone className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const formatarData = (data: Date | string | null) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const abrirDetalhes = (compartilhamento: Compartilhamento) => {
    setCompartilhamentoSelecionado(compartilhamento);
    setModalDetalhesAberto(true);
  };

  if (!condominioAtivo) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma manutenção selecionada</h3>
          <p className="text-gray-500">Selecione uma manutenção para ver os compartilhamentos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div data-tour="header-compartilhamentos" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            Compartilhamentos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Acompanhe todos os itens compartilhados com a equipe
          </p>
        </div>
        <div className="flex gap-2">
          <FunctionTutorialButton tutorialId="compartilhamentos" variant="compact" />
          <Button
            onClick={() => {
              if (!condominioAtivo?.id) return;
              setExportandoExcel(true);
              exportarExcelMutation.mutate({ condominioId: condominioAtivo.id });
            }}
            disabled={exportandoExcel || compartilhamentos.length === 0}
            className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {exportandoExcel ? "Exportando..." : "Excel"}
          </Button>
          <Button
            onClick={() => {
              if (!condominioAtivo?.id) return;
              setExportandoPdf(true);
              exportarPdfMutation.mutate({ condominioId: condominioAtivo.id });
            }}
            disabled={exportandoPdf || compartilhamentos.length === 0}
            className="gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white border-0"
          >
            <Download className="h-4 w-4" />
            {exportandoPdf ? "Exportando..." : "PDF"}
          </Button>
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Enviados</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalEnviados}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                <Send className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Visualizados</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{totalVisualizados}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400">Pendentes</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{totalPendentes}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Taxa de Visualização</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{taxaVisualizacao}%</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título, protocolo ou destinatário..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="vistoria">Vistoria</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="ocorrencia">Ocorrência</SelectItem>
                <SelectItem value="checklist">Checklist</SelectItem>
                <SelectItem value="antes_depois">Antes e Depois</SelectItem>
                <SelectItem value="ordem_servico">Ordem de Serviço</SelectItem>
                <SelectItem value="tarefa_simples">Tarefa</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="visualizado">Visualizados</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Compartilhamentos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-500" />
            Compartilhamentos ({compartilhamentosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
            </div>
          ) : compartilhamentosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Share2 className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nenhum compartilhamento encontrado
              </h3>
              <p className="text-gray-500">
                {busca || filtroTipo !== "todos" || filtroStatus !== "todos"
                  ? "Tente ajustar os filtros de busca."
                  : "Compartilhe itens com a equipe para vê-los aqui."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {compartilhamentosFiltrados.map((compartilhamento) => (
                <div
                  key={compartilhamento.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-700 transition-all cursor-pointer bg-white dark:bg-gray-800"
                  onClick={() => abrirDetalhes(compartilhamento)}
                >
                  <div className="flex items-start gap-4">
                    {/* Ícone do tipo */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTipoColor(compartilhamento.tipoItem)}`}>
                      {getTipoIcon(compartilhamento.tipoItem)}
                    </div>

                    {/* Info principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={`text-xs ${getTipoColor(compartilhamento.tipoItem)}`}>
                          {getTipoLabel(compartilhamento.tipoItem)}
                        </Badge>
                        {compartilhamento.itemProtocolo && (
                          <span className="text-xs text-gray-500">#{compartilhamento.itemProtocolo}</span>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {compartilhamento.itemTitulo || "Sem título"}
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {compartilhamento.destinatarioNome || "Sem nome"}
                        </span>
                        <span className="flex items-center gap-1">
                          {getCanalIcon(compartilhamento.canalEnvio || "email")}
                          {(compartilhamento.canalEnvio || "email") === "email" ? "Email" : compartilhamento.canalEnvio === "whatsapp" ? "WhatsApp" : "Ambos"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatarData(compartilhamento.createdAt as unknown as Date)}
                        </span>
                      </div>
                    </div>

                    {/* Status de visualização */}
                    <div className="text-right">
                      {compartilhamento.totalVisualizacoes > 0 ? (
                        <div className="flex flex-col items-end gap-1">
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <Eye className="h-3 w-3 mr-1" />
                            Visualizado
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {compartilhamento.totalVisualizacoes}x • {formatarData(compartilhamento.ultimaVisualizacao)}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-500">
                Página {pagina} de {totalPaginas}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-hidden p-0 rounded-2xl">
          {compartilhamentoSelecionado && (
            <>
              {/* Header */}
              <div className={`p-6 ${compartilhamentoSelecionado.totalVisualizacoes > 0 ? "bg-gradient-to-br from-green-500 to-emerald-600" : "bg-gradient-to-br from-amber-500 to-orange-600"}`}>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-white">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      {getTipoIcon(compartilhamentoSelecionado.tipoItem)}
                    </div>
                    <div>
                      <span className="text-xl font-bold block">
                        {compartilhamentoSelecionado.itemTitulo || "Sem título"}
                      </span>
                      <span className="text-sm text-white/80 font-normal">
                        {getTipoLabel(compartilhamentoSelecionado.tipoItem)}
                        {compartilhamentoSelecionado.itemProtocolo && ` • #${compartilhamentoSelecionado.itemProtocolo}`}
                      </span>
                    </div>
                  </DialogTitle>
                </DialogHeader>
              </div>

              {/* Conteúdo */}
              <div className="overflow-y-auto max-h-[60vh] p-6 space-y-6">
                {/* Info do Destinatário */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-500" />
                    Destinatário
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">{compartilhamentoSelecionado.destinatarioNome || "Sem nome"}</p>
                    {compartilhamentoSelecionado.destinatarioEmail && (
                      <p className="text-gray-500 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {compartilhamentoSelecionado.destinatarioEmail}
                      </p>
                    )}
                    {compartilhamentoSelecionado.destinatarioTelefone && (
                      <p className="text-gray-500 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {compartilhamentoSelecionado.destinatarioTelefone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Info do Envio */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Send className="h-4 w-4 text-orange-500" />
                    Detalhes do Envio
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Canal</p>
                      <p className="font-medium flex items-center gap-1">
                        {getCanalIcon(compartilhamentoSelecionado.canalEnvio || "email")}
                        {(compartilhamentoSelecionado.canalEnvio || "email") === "email" ? "Email" : compartilhamentoSelecionado.canalEnvio === "whatsapp" ? "WhatsApp" : "Ambos"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Data de Envio</p>
                      <p className="font-medium">{formatarData(compartilhamentoSelecionado.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email Enviado</p>
                      <p className="font-medium flex items-center gap-1">
                        {compartilhamentoSelecionado.emailEnviado ? (
                          <><CheckCircle2 className="h-4 w-4 text-green-500" /> Sim</>
                        ) : (
                          <><XCircle className="h-4 w-4 text-gray-400" /> Não</>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Expira em</p>
                      <p className="font-medium">
                        {compartilhamentoSelecionado.expiraEm 
                          ? formatarData(compartilhamentoSelecionado.expiraEm)
                          : "Sem expiração"}
                      </p>
                    </div>
                  </div>
                  {compartilhamentoSelecionado.mensagem && (
                    <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-500 text-xs mb-1">Mensagem</p>
                      <p className="text-sm italic">"{compartilhamentoSelecionado.mensagem}"</p>
                    </div>
                  )}
                </div>

                {/* Histórico de Visualizações */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-orange-500" />
                    Histórico de Visualizações ({compartilhamentoSelecionado.totalVisualizacoes})
                  </h3>
                  
                  {compartilhamentoSelecionado.visualizacoes.length === 0 ? (
                    <div className="text-center py-6">
                      <EyeOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Ainda não foi visualizado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {compartilhamentoSelecionado.visualizacoes.map((visualizacao, index) => (
                        <div
                          key={visualizacao.id}
                          className="p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">Visualização #{index + 1}</span>
                            <span className="text-xs font-medium text-green-600">
                              {formatarData(visualizacao.dataVisualizacao)}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              {getDispositivoIcon(visualizacao.dispositivo)}
                              {visualizacao.dispositivo || "Desktop"}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <Globe className="h-3.5 w-3.5" />
                              {visualizacao.navegador || "Desconhecido"}
                            </div>
                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                              <Monitor className="h-3.5 w-3.5" />
                              {visualizacao.sistemaOperacional || "Desconhecido"}
                            </div>
                          </div>
                          {visualizacao.ip && (
                            <p className="text-xs text-gray-400 mt-2">IP: {visualizacao.ip}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <a
                    href={`/compartilhado/${compartilhamentoSelecionado.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver link público
                  </a>
                  <Button variant="outline" onClick={() => setModalDetalhesAberto(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
