import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { FunctionTutorialButton } from "@/components/FunctionTutorial";
import { IndiceFuncoesButton } from "@/components/IndiceFuncoesButton";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TarefasSimplesModal } from "@/components/TarefasSimplesModal";
import { ReportGeneratorModal, ReportConfig, generateReportHTML, printReport } from "@/components/ReportGeneratorModal";
import {
  Plus,
  Search,
  Filter,
  ClipboardList,
  Wrench,
  AlertTriangle,
  ArrowLeftRight,
  FileText,
  Eye,
  Edit,
  Send,
  CheckCircle2,
  Clock,
  RefreshCw,
  Loader2,
  ListChecks,
  Calendar,
  Zap,
  Trash2,
  Printer,
  Share2,
  Copy,
  MapPin,
  Image as ImageIcon,
  Tag,
  Hash,
  Expand,
  ExternalLink,
  HelpCircle,
  Settings,
  ToggleLeft,
  Info,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type TipoTarefa = "vistoria" | "manutencao" | "ocorrencia" | "antes_depois" | "checklist";
type StatusTarefa = "rascunho" | "enviado" | "concluido";

const tipoConfig = {
  vistoria: {
    label: "Vistoria",
    icon: ClipboardList,
    cor: "#3B82F6",
    corClara: "#EFF6FF",
  },
  manutencao: {
    label: "Manutenção",
    icon: Wrench,
    cor: "#F97316",
    corClara: "#FFF7ED",
  },
  ocorrencia: {
    label: "Ocorrência",
    icon: AlertTriangle,
    cor: "#EF4444",
    corClara: "#FEF2F2",
  },
  antes_depois: {
    label: "Antes/Depois",
    icon: ArrowLeftRight,
    cor: "#10B981",
    corClara: "#ECFDF5",
  },
  checklist: {
    label: "Checklist",
    icon: ListChecks,
    cor: "#8B5CF6",
    corClara: "#F5F3FF",
  },
};

const statusConfig = {
  rascunho: {
    label: "Rascunho",
    icon: Edit,
    cor: "#6B7280",
    corClara: "#F3F4F6",
  },
  enviado: {
    label: "Enviado",
    icon: Send,
    cor: "#F97316",
    corClara: "#FFF7ED",
  },
  concluido: {
    label: "Concluído",
    icon: CheckCircle2,
    cor: "#10B981",
    corClara: "#ECFDF5",
  },
};

export default function FuncoesRapidasPage() {
  const [, setLocation] = useLocation();
  const [condominioId, setCondominioId] = useState<number | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<TipoTarefa | "todos">("todos");
  const [filtroStatus, setFiltroStatus] = useState<StatusTarefa | "todos">("todos");
  const [busca, setBusca] = useState("");
  const [modalNovaAberto, setModalNovaAberto] = useState(false);
  const [tipoModalNova, setTipoModalNova] = useState<TipoTarefa>("vistoria");
  const [tarefaSelecionada, setTarefaSelecionada] = useState<any>(null);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [tarefaParaEditar, setTarefaParaEditar] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [novoStatus, setNovoStatus] = useState("");

  const utils = trpc.useUtils();

  // Buscar organizações do usuário
  const { data: condominios } = trpc.condominio.list.useQuery();

  // Selecionar primeiro condomínio automaticamente
  useMemo(() => {
    if (condominios && condominios.length > 0 && !condominioId) {
      setCondominioId(condominios[0].id);
    }
  }, [condominios, condominioId]);

  // Buscar tarefas simples
  const { data: tarefas, isLoading } = trpc.tarefasSimples.listar.useQuery(
    {
      condominioId: condominioId!,
      tipo: filtroTipo !== "todos" ? (filtroTipo as any) : undefined,
      status: filtroStatus !== "todos" ? filtroStatus : undefined,
      limite: 100,
    },
    { enabled: !!condominioId }
  );

  // Mutations
  const enviarMutation = trpc.tarefasSimples.enviar.useMutation({
    onSuccess: () => {
      toast.success("Tarefa enviada com sucesso!");
      utils.tarefasSimples.listar.invalidate({ condominioId: condominioId! });
    },
  });

  const concluirMutation = trpc.tarefasSimples.concluir.useMutation({
    onSuccess: () => {
      toast.success("Tarefa concluída com sucesso!");
      utils.tarefasSimples.listar.invalidate({ condominioId: condominioId! });
    },
  });

  const reabrirMutation = trpc.tarefasSimples.reabrir.useMutation({
    onSuccess: () => {
      toast.success("Tarefa reaberta com sucesso!");
      utils.tarefasSimples.listar.invalidate({ condominioId: condominioId! });
    },
  });

  const deletarMutation = trpc.tarefasSimples.deletar.useMutation({
    onSuccess: () => {
      toast.success("Tarefa excluída com sucesso!");
      utils.tarefasSimples.listar.invalidate({ condominioId: condominioId! });
      setModalDetalhesAberto(false);
      setTarefaSelecionada(null);
    },
  });

  const atualizarMutation = trpc.tarefasSimples.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      utils.tarefasSimples.listar.invalidate({ condominioId: condominioId! });
    },
  });

  const criarStatusMutation = trpc.statusPersonalizados.criar.useMutation();

  // Buscar status personalizados do condomínio
  const { data: statusList } = trpc.statusPersonalizados.listar.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  // Status fixos pré-definidos
  const statusFixos = [
    { nome: "Pendente", cor: "#EAB308" },
    { nome: "Em Andamento", cor: "#3B82F6" },
    { nome: "Realizada", cor: "#22C55E" },
    { nome: "Ação Necessária", cor: "#EF4444" },
    { nome: "Finalizada", cor: "#10B981" },
    { nome: "Reaberta", cor: "#8B5CF6" },
  ];

  const alterarStatusPersonalizado = (nomeStatus: string) => {
    if (!tarefaSelecionada) return;
    // Se já é o mesmo status, remover
    const novoValor = tarefaSelecionada.statusPersonalizado === nomeStatus ? "" : nomeStatus;
    atualizarMutation.mutate(
      { id: tarefaSelecionada.id, statusPersonalizado: novoValor || undefined },
      {
        onSuccess: () => {
          setTarefaSelecionada({ ...tarefaSelecionada, statusPersonalizado: novoValor });
        },
      }
    );
  };

  const criarNovoStatus = async () => {
    if (!novoStatus.trim() || !condominioId) return;
    try {
      await criarStatusMutation.mutateAsync({
        condominioId,
        nome: novoStatus.trim(),
      });
      // Aplicar o novo status à tarefa
      alterarStatusPersonalizado(novoStatus.trim());
      setNovoStatus("");
      utils.statusPersonalizados.listar.invalidate({ condominioId });
      toast.success("Status criado com sucesso!");
    } catch {
      toast.error("Erro ao criar status");
    }
  };

  // Filtrar tarefas
  const tarefasFiltradas = useMemo(() => {
    if (!tarefas) return [];
    return tarefas.filter((tarefa) => {
      if (busca) {
        const termoBusca = busca.toLowerCase();
        const matchTitulo = tarefa.titulo?.toLowerCase().includes(termoBusca);
        const matchDescricao = tarefa.descricao?.toLowerCase().includes(termoBusca);
        const matchProtocolo = tarefa.protocolo?.toLowerCase().includes(termoBusca);
        if (!matchTitulo && !matchDescricao && !matchProtocolo) return false;
      }
      return true;
    });
  }, [tarefas, busca]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const total = tarefas?.length || 0;
    const rascunhos = tarefas?.filter((t) => t.status === "rascunho").length || 0;
    const enviados = tarefas?.filter((t) => t.status === "enviado").length || 0;
    const concluidos = tarefas?.filter((t) => t.status === "concluido").length || 0;
    return { total, rascunhos, enviados, concluidos };
  }, [tarefas]);

  const abrirNovaComTipo = (tipo: TipoTarefa) => {
    setTipoModalNova(tipo);
    setTarefaParaEditar(null);
    setModalNovaAberto(true);
  };

  const verDetalhes = (tarefa: any) => {
    setTarefaSelecionada(tarefa);
    setModalDetalhesAberto(true);
  };

  const editarTarefa = (tarefa: any) => {
    setTarefaParaEditar(tarefa);
    setTipoModalNova(tarefa.tipo);
    setModalNovaAberto(true);
    setModalDetalhesAberto(false);
  };

  // Estado do popup de ajuda
  const [mostrarAjuda, setMostrarAjuda] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header simples */}
      <div data-tour="header-funcoes-rapidas" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Funções Rápidas
              </h1>
              <p className="text-gray-500 text-xs mt-0.5">
                Registre em segundos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <IndiceFuncoesButton variant="default" />
            <FunctionTutorialButton tutorialId="funcoes-rapidas" />
          </div>
        </div>

        {/* Seletor de Organização */}
        {condominios && condominios.length > 1 && (
          <Select
            value={condominioId?.toString()}
            onValueChange={(v) => setCondominioId(Number(v))}
          >
            <SelectTrigger className="w-full bg-white border-gray-200 text-gray-700">
              <SelectValue placeholder="Selecione a organização" />
            </SelectTrigger>
            <SelectContent>
              {condominios.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Botões de Ação Rápida - Grid 2 colunas */}
      <div data-tour="botoes-rapidos" className="grid grid-cols-2 gap-3">
        {(Object.keys(tipoConfig) as TipoTarefa[]).map((tipo) => {
          const config = tipoConfig[tipo];
          const Icon = config.icon;
          return (
            <button
              key={tipo}
              onClick={() => abrirNovaComTipo(tipo)}
              className="group bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:border-gray-300 active:scale-[0.97]"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-xl transition-colors" style={{ backgroundColor: config.corClara }}>
                  <Icon className="h-7 w-7" style={{ color: config.cor }} />
                </div>
                <span className="text-sm font-semibold text-gray-800">{config.label}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Nova
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Popup de Ajuda - Configurar Funções */}
      <Dialog open={mostrarAjuda} onOpenChange={setMostrarAjuda}>
        <DialogContent className="w-[92vw] max-w-md max-h-[85vh] overflow-y-auto p-0 gap-0 border-0 shadow-2xl">
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Configurar Funções</h2>
                <p className="text-white/80 text-xs">Personalize os campos de cada função</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* Passo 1 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h3 className="font-semibold text-gray-900">Abra uma função</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Toque em qualquer botão de função (Vistoria, Manutenção, Ocorrência, etc.) para abrir o formulário.
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h3 className="font-semibold text-gray-900">Encontre o ícone de engrenagem</h3>
                <p className="text-sm text-gray-600 mt-1">
                  No canto superior direito do formulário, toque no ícone <Settings className="h-4 w-4 inline text-orange-500" /> (engrenagem) ao lado do nome da função.
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h3 className="font-semibold text-gray-900">Ative ou desative campos</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Uma lista de campos aparecerá com toggles <ToggleLeft className="h-4 w-4 inline text-orange-500" />. Ative os que deseja usar e desative os que não precisa.
                </p>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h3 className="font-semibold text-gray-900">Salve as configurações</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Toque em <span className="font-semibold text-orange-600">"Salvar Configuração"</span>. As alterações valem para todos os novos registros dessa função.
                </p>
              </div>
            </div>

            {/* Dica */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-orange-700">Dica</p>
                  <p className="text-xs text-orange-600 mt-1">
                    Cada função tem sua própria configuração. Por exemplo, você pode mostrar "Nível de Urgência" na Vistoria mas escondê-lo na Ocorrência. As configurações são salvas por organização.
                  </p>
                </div>
              </div>
            </div>

            {/* Campos disponíveis */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm">Campos disponíveis:</h4>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600">
                <span>• Título (obrigatório)</span>
                <span>• Descrição</span>
                <span>• Local</span>
                <span>• Fotos / Galeria</span>
                <span>• GPS + Mapa</span>
                <span>• Status</span>
                <span>• Prioridade</span>
                <span>• Responsável</span>
                <span>• Prazo de Conclusão</span>
                <span>• Custo Estimado</span>
                <span>• Nível de Urgência</span>
                <span>• Anexos (PDF/Doc)</span>
                <span>• QR Code</span>
                <span>• Assinatura Digital</span>
              </div>
            </div>

            <Button
              onClick={() => setMostrarAjuda(false)}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
            >
              Entendi!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-900">{estatisticas.total}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-inner opacity-80">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-gray-500 font-medium">Rascunhos</p>
              <p className="text-3xl font-bold text-gray-600">{estatisticas.rascunhos}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-inner opacity-80">
              <Edit className="h-5 w-5 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-orange-600 font-medium">Enviados</p>
              <p className="text-3xl font-bold text-orange-600">{estatisticas.enviados}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-inner opacity-80">
              <Send className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-white hover:shadow-xl transition-shadow overflow-hidden relative">
          <CardContent className="p-4 min-h-[100px]">
            <div>
              <p className="text-sm text-green-600 font-medium">Concluídos</p>
              <p className="text-3xl font-bold text-green-600">{estatisticas.concluidos}</p>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-inner opacity-80">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por protocolo, título ou descrição..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro por Tipo */}
            <Select value={filtroTipo} onValueChange={(v) => setFiltroTipo(v as any)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {(Object.keys(tipoConfig) as TipoTarefa[]).map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipoConfig[tipo].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por Status */}
            <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as any)}>
              <SelectTrigger className="w-[180px]">
                <Clock className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {(Object.keys(statusConfig) as StatusTarefa[]).map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusConfig[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Botão Atualizar */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => utils.tarefasSimples.listar.invalidate({ condominioId: condominioId! })}
              className="shrink-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            {/* Botão Relatório */}
            <Button
              variant="outline"
              onClick={() => setShowReportModal(true)}
              className="shrink-0 gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Relatório</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tarefas */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : tarefasFiltradas.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum registro encontrado
            </h3>
            <p className="text-gray-500">
              Comece criando uma nova vistoria, manutenção, ocorrência ou antes/depois usando os botões acima.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tarefasFiltradas.map((tarefa) => {
            const configTipo = tipoConfig[tarefa.tipo as TipoTarefa];
            const configStatus = statusConfig[tarefa.status as StatusTarefa];
            const IconTipo = configTipo?.icon || FileText;
            const IconStatus = configStatus?.icon || Clock;

            return (
              <Card
                key={tarefa.id}
                className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => verDetalhes(tarefa)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Ícone do Tipo */}
                    <div
                      className="p-3 rounded-xl shrink-0"
                      style={{ backgroundColor: configTipo?.corClara || "#F3F4F6" }}
                    >
                      <IconTipo
                        className="h-6 w-6"
                        style={{ color: configTipo?.cor || "#6B7280" }}
                      />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      {/* Título + Badge tipo + Ação - sem sobreposição */}
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate flex-1 min-w-0">
                          {tarefa.titulo || `${configTipo?.label} #${tarefa.id}`}
                        </h3>
                        <Badge
                          variant="outline"
                          className="shrink-0 text-xs"
                          style={{
                            borderColor: configTipo?.cor,
                            color: configTipo?.cor,
                          }}
                        >
                          {configTipo?.label}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 -mr-2 gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold px-3 h-8"
                          onClick={(e) => { e.stopPropagation(); verDetalhes(tarefa); }}
                        >
                          <Eye className="h-4 w-4" />
                          VER
                        </Button>
                      </div>

                      {tarefa.descricao && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {tarefa.descricao}
                        </p>
                      )}

                      {/* Protocolo */}
                      <div className="mb-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {tarefa.protocolo}
                        </Badge>
                      </div>

                      {/* Meta informações - cada item em sua linha */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {format(new Date(tarefa.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-xs"
                          style={{
                            backgroundColor: configStatus?.corClara,
                            color: configStatus?.cor,
                          }}
                        >
                          <IconStatus className="h-3 w-3 mr-1" />
                          {configStatus?.label}
                        </Badge>
                        {/* Contador de itens do checklist */}
                        {tarefa.tipo === "checklist" && tarefa.itensChecklist && tarefa.itensChecklist.length > 0 && (
                          <span className="flex items-center gap-1 text-purple-600">
                            <ListChecks className="h-3.5 w-3.5" />
                            {(tarefa.itensChecklist as any[]).filter(i => i.concluido).length}/{tarefa.itensChecklist.length}
                            {(tarefa.itensChecklist as any[]).filter(i => i.temProblema).length > 0 && (
                              <span className="text-red-500 ml-1">
                                ({(tarefa.itensChecklist as any[]).filter(i => i.temProblema).length} ⚠️)
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Nova Tarefa */}
      {condominioId && (
        <TarefasSimplesModal
          open={modalNovaAberto}
          onOpenChange={setModalNovaAberto}
          condominioId={condominioId}
          tipoInicial={tipoModalNova}
          tarefaParaEditar={tarefaParaEditar}
          onSuccess={() => {
            setModalNovaAberto(false);
            setTarefaParaEditar(null);
            utils.tarefasSimples.listar.invalidate({ condominioId: condominioId! });
          }}
        />
      )}

      {/* Modal de Detalhes - Relatório Completo */}
      <Dialog open={modalDetalhesAberto} onOpenChange={setModalDetalhesAberto}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          {tarefaSelecionada && (() => {
            const tipoConf = tipoConfig[tarefaSelecionada.tipo as TipoTarefa];
            const statusConf = statusConfig[tarefaSelecionada.status as StatusTarefa];
            const TipoIcon = tipoConf?.icon || FileText;
            const StatusIcon = statusConf?.icon || Clock;

            // Parse imagens com safety
            let imagensArr: any[] = [];
            const rawImgs = tarefaSelecionada.imagens;
            if (rawImgs) {
              if (Array.isArray(rawImgs)) imagensArr = rawImgs;
              else if (typeof rawImgs === 'string') {
                try { imagensArr = JSON.parse(rawImgs); } catch { imagensArr = []; }
              }
            }

            // Parse checklist com safety
            let checklistArr: any[] = [];
            const rawCheck = tarefaSelecionada.itensChecklist;
            if (rawCheck) {
              if (Array.isArray(rawCheck)) checklistArr = rawCheck;
              else if (typeof rawCheck === 'string') {
                try { checklistArr = JSON.parse(rawCheck); } catch { checklistArr = []; }
              }
            }

            // Imprimir - Relatório Premium
            const handlePrint = () => {
              const cor = tipoConf?.cor || '#f97316';
              const corClara = tipoConf?.corClara || '#FFF7ED';
              const prioridadeLabel = (tarefaSelecionada.prioridade || 'media').charAt(0).toUpperCase() + (tarefaSelecionada.prioridade || 'media').slice(1);
              const prioridadeCor = tarefaSelecionada.prioridade === 'urgente' ? '#EF4444' : tarefaSelecionada.prioridade === 'alta' ? '#F97316' : tarefaSelecionada.prioridade === 'baixa' ? '#3B82F6' : '#6B7280';

              // Logo e nome da empresa do cliente
              const condominio = condominios?.find(c => c.id === condominioId);
              const clienteLogoUrl = condominio?.logoUrl || '';
              const clienteNome = condominio?.nome || '';

              // Build sections
              let htmlSections = '';

              // Info grid
              htmlSections += `
                <div class="info-grid">
                  <div class="info-card">
                    <div class="info-label">Protocolo</div>
                    <div class="info-value mono">${tarefaSelecionada.protocolo}</div>
                  </div>
                  <div class="info-card">
                    <div class="info-label">Tipo</div>
                    <div class="info-value" style="color:${cor}">${tipoConf?.label}</div>
                  </div>
                  <div class="info-card">
                    <div class="info-label">Status</div>
                    <div class="info-value" style="color:${statusConf?.cor}">${statusConf?.label}</div>
                  </div>
                  <div class="info-card">
                    <div class="info-label">Prioridade</div>
                    <div class="info-value"><span class="priority-dot" style="background:${prioridadeCor}"></span>${prioridadeLabel}</div>
                  </div>
                </div>
              `;

              // Status personalizado
              if (tarefaSelecionada.statusPersonalizado) {
                htmlSections += `
                  <div class="field-section">
                    <div class="field-label">Status Personalizado</div>
                    <div class="status-badge">${tarefaSelecionada.statusPersonalizado}</div>
                  </div>
                `;
              }

              // Titulo
              if (tarefaSelecionada.titulo) {
                htmlSections += `
                  <div class="field-section">
                    <div class="field-label">Título</div>
                    <div class="field-content" style="border-left-color:${cor}">${tarefaSelecionada.titulo}</div>
                  </div>
                `;
              }

              // Local
              if (tarefaSelecionada.local) {
                htmlSections += `
                  <div class="field-section">
                    <div class="field-label">📍 Local</div>
                    <div class="field-content" style="border-left-color:${cor}">${tarefaSelecionada.local}</div>
                  </div>
                `;
              }

              // Descrição
              if (tarefaSelecionada.descricao) {
                htmlSections += `
                  <div class="field-section">
                    <div class="field-label">📝 Descrição</div>
                    <div class="field-content desc" style="border-left-color:${cor}">${tarefaSelecionada.descricao}</div>
                  </div>
                `;
              }

              // Imagens - tamanho controlado
              if (imagensArr.length > 0) {
                let imgHtml = imagensArr.map((img: any, i: number) => {
                  const url = typeof img === 'string' ? img : img?.url;
                  const legenda = typeof img === 'object' ? img?.legenda : '';
                  if (!url) return '';
                  return `
                    <div class="img-card">
                      <img src="${url}" alt="${legenda || 'Imagem ' + (i+1)}" onerror="this.parentElement.style.display='none'" />
                      ${legenda ? '<div class="img-caption">' + legenda + '</div>' : ''}
                    </div>
                  `;
                }).join('');
                htmlSections += `
                  <div class="field-section">
                    <div class="field-label">🖼️ Imagens (${imagensArr.length})</div>
                    <div class="img-grid">${imgHtml}</div>
                  </div>
                `;
              }

              // Checklist
              if (checklistArr.length > 0) {
                const concluidos = checklistArr.filter((i: any) => i.concluido).length;
                let checkHtml = checklistArr.map((item: any) => {
                  const icon = item.concluido ? '✓' : item.temProblema ? '!' : '';
                  const bgColor = item.concluido ? '#22c55e' : item.temProblema ? '#ef4444' : '#d1d5db';
                  const textClass = item.concluido ? 'check-done' : '';
                  let problemHtml = '';
                  if (item.temProblema && item.problema) {
                    problemHtml = `<div class="problem-box">
                      <strong>${item.problema.titulo || ''}</strong>
                      ${item.problema.descricao ? '<p>' + item.problema.descricao + '</p>' : ''}
                    </div>`;
                  }
                  return `
                    <div class="check-item">
                      <div class="check-icon" style="background:${bgColor}">${icon}</div>
                      <div class="check-text ${textClass}">${item.titulo}${problemHtml}</div>
                    </div>
                  `;
                }).join('');
                htmlSections += `
                  <div class="field-section">
                    <div class="field-label">✅ Checklist (${concluidos}/${checklistArr.length})</div>
                    <div class="checklist-box">${checkHtml}</div>
                  </div>
                `;
              }

              // Localização GPS
              if (tarefaSelecionada.endereco) {
                htmlSections += `
                  <div class="field-section">
                    <div class="field-label">🗺️ Localização GPS</div>
                    <div class="field-content" style="border-left-color:${cor}">
                      ${tarefaSelecionada.endereco}
                      ${tarefaSelecionada.latitude && tarefaSelecionada.longitude ? '<div class="coords">' + tarefaSelecionada.latitude + ', ' + tarefaSelecionada.longitude + '</div>' : ''}
                    </div>
                  </div>
                `;
              }

              // Datas
              let datasHtml = `
                <div class="date-card">
                  <div class="date-label">Criado em</div>
                  <div class="date-value">${format(new Date(tarefaSelecionada.createdAt!), "dd/MM/yyyy", { locale: ptBR })}</div>
                  <div class="date-time">${format(new Date(tarefaSelecionada.createdAt!), "HH:mm", { locale: ptBR })}</div>
                </div>
              `;
              if (tarefaSelecionada.enviadoEm) {
                datasHtml += `
                  <div class="date-card" style="border-top-color:${cor}">
                    <div class="date-label" style="color:${cor}">Enviado em</div>
                    <div class="date-value">${format(new Date(tarefaSelecionada.enviadoEm), "dd/MM/yyyy", { locale: ptBR })}</div>
                    <div class="date-time">${format(new Date(tarefaSelecionada.enviadoEm), "HH:mm", { locale: ptBR })}</div>
                  </div>
                `;
              }
              if (tarefaSelecionada.concluidoEm) {
                datasHtml += `
                  <div class="date-card" style="border-top-color:#22c55e">
                    <div class="date-label" style="color:#22c55e">Concluído em</div>
                    <div class="date-value">${format(new Date(tarefaSelecionada.concluidoEm), "dd/MM/yyyy", { locale: ptBR })}</div>
                    <div class="date-time">${format(new Date(tarefaSelecionada.concluidoEm), "HH:mm", { locale: ptBR })}</div>
                  </div>
                `;
              }
              htmlSections += `
                <div class="field-section">
                  <div class="field-label">📅 Datas</div>
                  <div class="dates-grid">${datasHtml}</div>
                </div>
              `;

              const win = window.open('', '_blank');
              if (!win) return;
              win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${tipoConf?.label} - ${tarefaSelecionada.protocolo}</title>
  <style>
    @page { margin: 18mm 15mm; size: A4; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
      color: #1f2937; background: #fff; font-size: 13px; line-height: 1.5;
      -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }

    /* ===== COMPANY HEADER (LOGO DO CLIENTE) ===== */
    .company-header {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 0; margin-bottom: 18px;
      border-bottom: 2px solid #e2e8f0;
    }
    .company-logo {
      width: 56px; height: 56px; object-fit: contain; border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .company-name {
      font-size: 16px; font-weight: 700; color: #1e293b; letter-spacing: -0.3px;
    }
    .company-subtitle {
      font-size: 10px; color: #94a3b8; text-transform: uppercase;
      letter-spacing: 0.5px; margin-top: 2px;
    }

    /* ===== HEADER ===== */
    .report-header {
      display: flex; align-items: center; gap: 16px;
      padding: 20px 24px; margin-bottom: 24px;
      background: linear-gradient(135deg, ${cor}, ${cor}dd);
      border-radius: 12px; color: #fff;
    }
    .report-header .icon-box {
      width: 48px; height: 48px; background: rgba(255,255,255,0.2);
      border-radius: 12px; display: flex; align-items: center; justify-content: center;
      font-size: 22px; flex-shrink: 0;
    }
    .report-header .header-text h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
    .report-header .header-text .proto {
      font-size: 11px; opacity: 0.85; font-family: 'Consolas', 'Courier New', monospace;
      margin-top: 2px;
    }
    .report-header .header-badge {
      margin-left: auto; background: rgba(255,255,255,0.2);
      padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 600;
      letter-spacing: 0.3px; flex-shrink: 0;
    }

    /* ===== INFO GRID ===== */
    .info-grid {
      display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px;
    }
    .info-card {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 12px 14px; text-align: center;
    }
    .info-label {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 4px;
    }
    .info-value { font-size: 13px; font-weight: 600; color: #334155; }
    .info-value.mono { font-family: 'Consolas', 'Courier New', monospace; font-size: 12px; }
    .priority-dot {
      display: inline-block; width: 8px; height: 8px; border-radius: 50%;
      margin-right: 5px; vertical-align: middle;
    }

    /* ===== FIELD SECTIONS ===== */
    .field-section { margin-bottom: 18px; }
    .field-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.6px; color: #64748b; margin-bottom: 6px;
    }
    .field-content {
      font-size: 13px; color: #374151; padding: 10px 14px;
      background: #f8fafc; border-radius: 8px;
      border-left: 3px solid #e2e8f0;
    }
    .field-content.desc { white-space: pre-wrap; }
    .coords {
      font-size: 10px; color: #94a3b8; font-family: 'Consolas', monospace; margin-top: 4px;
    }
    .status-badge {
      display: inline-block; padding: 5px 16px; border-radius: 20px;
      font-size: 12px; font-weight: 600;
      background: #fef3c7; color: #92400e; border: 1px solid #fbbf24;
    }

    /* ===== IMAGES ===== */
    .img-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    }
    .img-card {
      border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;
      background: #f8fafc;
    }
    .img-card img {
      width: 100%; height: 110px; object-fit: cover; display: block;
    }
    .img-caption {
      font-size: 10px; color: #64748b; padding: 5px 8px;
      text-align: center; border-top: 1px solid #e2e8f0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }

    /* ===== CHECKLIST ===== */
    .checklist-box {
      background: #f8fafc; border: 1px solid #e2e8f0;
      border-radius: 10px; padding: 12px 14px;
    }
    .check-item {
      display: flex; align-items: flex-start; gap: 10px;
      padding: 5px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .check-item:last-child { border-bottom: none; }
    .check-icon {
      width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; color: #fff; font-weight: 700; margin-top: 1px;
    }
    .check-text { font-size: 12px; color: #334155; flex: 1; }
    .check-text.check-done { color: #94a3b8; text-decoration: line-through; }
    .problem-box {
      margin-top: 4px; padding: 6px 10px; background: #fef2f2;
      border: 1px solid #fecaca; border-radius: 6px; font-size: 11px; color: #991b1b;
    }
    .problem-box strong { display: block; margin-bottom: 2px; }

    /* ===== DATES ===== */
    .dates-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
    }
    .date-card {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 10px 14px; text-align: center; border-top: 3px solid #e2e8f0;
    }
    .date-label {
      font-size: 9px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 3px;
    }
    .date-value { font-size: 14px; font-weight: 700; color: #1e293b; }
    .date-time { font-size: 11px; color: #64748b; margin-top: 1px; }

    /* ===== FOOTER ===== */
    .report-footer {
      margin-top: 28px; padding-top: 14px;
      border-top: 2px solid ${cor}30;
      display: flex; justify-content: space-between; align-items: center;
      font-size: 10px; color: #94a3b8;
    }
    .report-footer .brand { font-weight: 600; color: ${cor}; }

    /* ===== PRINT TWEAKS ===== */
    @media print {
      body { padding: 0; }
      .report-header { break-inside: avoid; }
      .info-grid { break-inside: avoid; }
      .field-section { break-inside: avoid; }
      .img-grid { break-inside: avoid; }
      .img-card img { height: 100px; }
    }
  </style>
</head>
<body>
  ${clienteLogoUrl || clienteNome ? `
  <div class="company-header">
    ${clienteLogoUrl ? `<img src="${clienteLogoUrl}" alt="Logo" class="company-logo" onerror="this.style.display='none'" />` : ''}
    <div>
      ${clienteNome ? `<div class="company-name">${clienteNome}</div>` : ''}
      <div class="company-subtitle">Relatório de ${tipoConf?.label}</div>
    </div>
  </div>
  ` : ''}
  <div class="report-header">
    <div class="icon-box">${
      tarefaSelecionada.tipo === 'vistoria' ? '📋' :
      tarefaSelecionada.tipo === 'manutencao' ? '🔧' :
      tarefaSelecionada.tipo === 'ocorrencia' ? '⚠️' :
      tarefaSelecionada.tipo === 'antes_depois' ? '🔄' :
      tarefaSelecionada.tipo === 'checklist' ? '☑️' : '📄'
    }</div>
    <div class="header-text">
      <h1>${tarefaSelecionada.titulo || tipoConf?.label}</h1>
      <div class="proto">${tarefaSelecionada.protocolo}</div>
    </div>
    <div class="header-badge">${statusConf?.label?.toUpperCase()}</div>
  </div>

  ${htmlSections}

  <div class="report-footer">
    <span class="brand">${clienteNome || 'App Manutenção'}</span>
    <span>Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
  </div>
</body>
</html>`);
              win.document.close();
              setTimeout(() => win.print(), 300);
            };

            // Copiar texto
            const handleCopyLink = async () => {
              const text = [
                `📋 ${tipoConf?.label}: ${tarefaSelecionada.titulo || '(Sem título)'}`,
                `📌 Protocolo: ${tarefaSelecionada.protocolo}`,
                `📊 Status: ${statusConf?.label}`,
                tarefaSelecionada.descricao ? `📝 Descrição: ${tarefaSelecionada.descricao}` : '',
                tarefaSelecionada.local ? `📍 Local: ${tarefaSelecionada.local}` : '',
                tarefaSelecionada.endereco ? `🗺️ Endereço: ${tarefaSelecionada.endereco}` : '',
                `📅 Criado: ${format(new Date(tarefaSelecionada.createdAt!), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
              ].filter(Boolean).join('\n');
              try {
                await navigator.clipboard.writeText(text);
                toast.success("Texto copiado para a área de transferência!");
              } catch {
                toast.error("Não foi possível copiar o texto.");
              }
            };

            // Compartilhar via WhatsApp
            const handleShare = async () => {
              const text = [
                `📋 ${tipoConf?.label}: ${tarefaSelecionada.titulo || '(Sem título)'}`,
                `📌 Protocolo: ${tarefaSelecionada.protocolo}`,
                `📊 Status: ${statusConf?.label}`,
                tarefaSelecionada.descricao ? `📝 Descrição: ${tarefaSelecionada.descricao}` : '',
                tarefaSelecionada.local ? `📍 Local: ${tarefaSelecionada.local}` : '',
                tarefaSelecionada.endereco ? `🗺️ Endereço: ${tarefaSelecionada.endereco}` : '',
                tarefaSelecionada.statusPersonalizado ? `🏷️ Status: ${tarefaSelecionada.statusPersonalizado}` : '',
                tarefaSelecionada.prioridade && tarefaSelecionada.prioridade !== 'media' ? `⚡ Prioridade: ${tarefaSelecionada.prioridade}` : '',
                imagensArr.length > 0 ? `🖼️ ${imagensArr.length} imagem(ns)` : '',
                checklistArr.length > 0 ? `✅ Checklist: ${checklistArr.filter((i: any) => i.concluido).length}/${checklistArr.length} concluídos` : '',
                `📅 Criado: ${format(new Date(tarefaSelecionada.createdAt!), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
              ].filter(Boolean).join('\n');

              try {
                await navigator.clipboard.writeText(text);
              } catch { /* clipboard not available */ }
              const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
              window.open(whatsappUrl, '_blank');
              toast.success("Texto copiado! WhatsApp aberto para envio.");
            };

            return (
              <>
                {/* Header colorido por tipo */}
                <div
                  className="px-6 pt-6 pb-4 rounded-t-lg"
                  style={{ background: `linear-gradient(135deg, ${tipoConf?.cor}15, ${tipoConf?.cor}08)` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="p-2.5 rounded-xl shadow-sm flex-shrink-0"
                        style={{ backgroundColor: tipoConf?.cor, color: '#fff' }}
                      >
                        <TipoIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-gray-900 truncate">
                          {tarefaSelecionada.titulo || tipoConf?.label}
                        </h2>
                        <p className="text-xs font-mono text-gray-500 mt-0.5 flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {tarefaSelecionada.protocolo}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botões Imprimir / Copiar / Compartilhar */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors border border-blue-200"
                      title="Imprimir relatório"
                    >
                      <Printer className="h-8 w-8" />
                      <span className="text-xs font-semibold">Imprimir</span>
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border border-gray-200"
                      title="Copiar texto"
                    >
                      <Copy className="h-8 w-8" />
                      <span className="text-xs font-semibold">Copiar</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-600 transition-colors border border-green-200"
                      title="Compartilhar via WhatsApp"
                    >
                      <Share2 className="h-8 w-8" />
                      <span className="text-xs font-semibold">Compartilhar</span>
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge
                      className="text-xs px-2.5 py-0.5 font-semibold"
                      style={{ backgroundColor: statusConf?.corClara, color: statusConf?.cor, border: `1px solid ${statusConf?.cor}40` }}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConf?.label}
                    </Badge>
                    <Badge
                      className="text-xs px-2.5 py-0.5 font-semibold"
                      style={{ backgroundColor: tipoConf?.corClara, color: tipoConf?.cor, border: `1px solid ${tipoConf?.cor}40` }}
                    >
                      <TipoIcon className="h-3 w-3 mr-1" />
                      {tipoConf?.label}
                    </Badge>
                    {tarefaSelecionada.prioridade && tarefaSelecionada.prioridade !== "media" && (
                      <Badge className={`text-xs px-2.5 py-0.5 font-semibold ${
                        tarefaSelecionada.prioridade === 'urgente' ? 'bg-red-100 text-red-700 border-red-200' :
                        tarefaSelecionada.prioridade === 'alta' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-blue-100 text-blue-700 border-blue-200'
                      }`}>
                        ⚡ {tarefaSelecionada.prioridade.charAt(0).toUpperCase() + tarefaSelecionada.prioridade.slice(1)}
                      </Badge>
                    )}
                    {tarefaSelecionada.statusPersonalizado && (
                      <Badge className="text-xs px-2.5 py-0.5 font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                        <Tag className="h-3 w-3 mr-1" />
                        {tarefaSelecionada.statusPersonalizado}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Corpo do relatório */}
                <div id="relatorio-funcao-rapida" className="px-6 pb-2 space-y-4">
                  {/* Grid de informações */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Protocolo</p>
                      <p className="text-sm font-mono font-medium text-gray-800">{tarefaSelecionada.protocolo}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Tipo</p>
                      <p className="text-sm font-medium" style={{ color: tipoConf?.cor }}>{tipoConf?.label}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Status</p>
                      <p className="text-sm font-medium" style={{ color: statusConf?.cor }}>{statusConf?.label}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Prioridade</p>
                      <p className="text-sm font-medium text-gray-800">
                        {(tarefaSelecionada.prioridade || 'media').charAt(0).toUpperCase() + (tarefaSelecionada.prioridade || 'media').slice(1)}
                      </p>
                    </div>
                  </div>

                  {/* Título */}
                  {tarefaSelecionada.titulo && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Título</p>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg"
                         style={{ borderLeft: `3px solid ${tipoConf?.cor}` }}>
                        {tarefaSelecionada.titulo}
                      </p>
                    </div>
                  )}

                  {/* Local */}
                  {tarefaSelecionada.local && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Local
                      </p>
                      <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg"
                         style={{ borderLeft: `3px solid ${tipoConf?.cor}` }}>
                        {tarefaSelecionada.local}
                      </p>
                    </div>
                  )}

                  {/* Descrição */}
                  {tarefaSelecionada.descricao && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Descrição
                      </p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap"
                         style={{ borderLeft: `3px solid ${tipoConf?.cor}` }}>
                        {tarefaSelecionada.descricao}
                      </p>
                    </div>
                  )}

                  {/* Status Personalizado - Seletor Interativo */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                      <Tag className="h-3 w-3" /> Alterar Status
                    </p>

                    {/* Status fixos pré-definidos */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {statusFixos.map((st) => {
                        const isActive = tarefaSelecionada.statusPersonalizado === st.nome;
                        return (
                          <button
                            key={st.nome}
                            onClick={() => alterarStatusPersonalizado(st.nome)}
                            disabled={atualizarMutation.isPending}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                              isActive
                                ? 'ring-2 ring-offset-1 shadow-sm scale-105'
                                : 'opacity-70 hover:opacity-100 hover:scale-105'
                            }`}
                            style={{
                              backgroundColor: isActive ? st.cor : `${st.cor}18`,
                              color: isActive ? '#fff' : st.cor,
                              borderColor: `${st.cor}50`,
                            }}
                          >
                            {st.nome}
                          </button>
                        );
                      })}
                    </div>

                    {/* Status criados pelo usuário */}
                    {statusList && statusList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {statusList
                          .filter((st) => !statusFixos.some((f) => f.nome === st.nome))
                          .map((st) => {
                            const isActive = tarefaSelecionada.statusPersonalizado === st.nome;
                            const cor = st.cor || "#F97316";
                            return (
                              <button
                                key={st.id}
                                onClick={() => alterarStatusPersonalizado(st.nome)}
                                disabled={atualizarMutation.isPending}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${
                                  isActive
                                    ? 'ring-2 ring-offset-1 shadow-sm scale-105'
                                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                                }`}
                                style={{
                                  backgroundColor: isActive ? cor : `${cor}18`,
                                  color: isActive ? '#fff' : cor,
                                  borderColor: `${cor}50`,
                                }}
                              >
                                <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: isActive ? '#fff' : cor }} />
                                {st.nome}
                              </button>
                            );
                          })}
                      </div>
                    )}

                    {/* Criar novo status personalizado */}
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Criar novo status..."
                        value={novoStatus}
                        onChange={(e) => setNovoStatus(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && criarNovoStatus()}
                        className="flex-1 h-8 text-xs border-gray-200"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={criarNovoStatus}
                        disabled={!novoStatus.trim() || criarStatusMutation.isPending}
                        className="h-8 border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Imagens */}
                  {imagensArr.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" /> Imagens ({imagensArr.length})
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {imagensArr.map((img: any, index: number) => {
                          const url = typeof img === 'string' ? img : img?.url;
                          const legenda = typeof img === 'object' ? img?.legenda : '';
                          if (!url) return null;
                          return (
                            <div key={index} className="group relative">
                              <div className="relative cursor-pointer" onClick={() => window.open(url, '_blank')}>
                                <img
                                  src={url}
                                  alt={legenda || `Imagem ${index + 1}`}
                                  className="w-full h-28 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                                  onError={(e) => (e.target as HTMLImageElement).parentElement!.style.display = 'none'}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                                  <Expand className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                                </div>
                              </div>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 hover:underline mt-1"
                              >
                                <ExternalLink className="h-3 w-3" /> Ver tamanho real
                              </a>
                              {legenda && (
                                <p className="text-[10px] text-gray-500 text-center truncate">{legenda}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Checklist */}
                  {checklistArr.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                        <ListChecks className="h-3 w-3" /> Checklist ({checklistArr.filter((i: any) => i.concluido).length}/{checklistArr.length})
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                        {checklistArr.map((item: any, index: number) => (
                          <div key={item.id || index} className="flex items-start gap-2">
                            <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 ${
                              item.concluido ? 'bg-green-500 text-white' : item.temProblema ? 'bg-red-500 text-white' : 'bg-gray-300 text-white'
                            }`}>
                              {item.concluido ? '✓' : item.temProblema ? '!' : ''}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className={`text-sm ${item.concluido ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                {item.titulo}
                              </span>
                              {item.temProblema && item.problema && (
                                <div className="mt-1 text-xs bg-red-50 border border-red-200 rounded p-2">
                                  <p className="font-medium text-red-700">{item.problema.titulo}</p>
                                  {item.problema.descricao && <p className="text-red-600 mt-0.5">{item.problema.descricao}</p>}
                                  {item.problema.imagens?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {item.problema.imagens.map((img: string, idx: number) => (
                                        <img key={idx} src={img} alt={`Problema ${idx + 1}`} className="w-10 h-10 object-cover rounded border" />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Localização GPS */}
                  {tarefaSelecionada.endereco && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Localização GPS
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg flex items-start gap-2">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" style={{ color: tipoConf?.cor }} />
                        <div>
                          <p className="text-sm text-gray-700">{tarefaSelecionada.endereco}</p>
                          {tarefaSelecionada.latitude && tarefaSelecionada.longitude && (
                            <p className="text-[10px] text-gray-400 mt-1 font-mono">
                              {tarefaSelecionada.latitude}, {tarefaSelecionada.longitude}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Datas */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Datas
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div className="bg-gray-50 rounded-lg p-2.5 text-center">
                        <p className="text-[10px] text-gray-400 font-medium">Criado</p>
                        <p className="text-xs font-semibold text-gray-800 mt-0.5">
                          {format(new Date(tarefaSelecionada.createdAt!), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {format(new Date(tarefaSelecionada.createdAt!), "HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      {tarefaSelecionada.enviadoEm && (
                        <div className="rounded-lg p-2.5 text-center" style={{ backgroundColor: `${tipoConf?.cor}10` }}>
                          <p className="text-[10px] font-medium" style={{ color: tipoConf?.cor }}>Enviado</p>
                          <p className="text-xs font-semibold text-gray-800 mt-0.5">
                            {format(new Date(tarefaSelecionada.enviadoEm), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {format(new Date(tarefaSelecionada.enviadoEm), "HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      )}
                      {tarefaSelecionada.concluidoEm && (
                        <div className="bg-green-50 rounded-lg p-2.5 text-center">
                          <p className="text-[10px] text-green-600 font-medium">Concluído</p>
                          <p className="text-xs font-semibold text-gray-800 mt-0.5">
                            {format(new Date(tarefaSelecionada.concluidoEm), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {format(new Date(tarefaSelecionada.concluidoEm), "HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ações no rodapé */}
                <div className="px-6 py-4 border-t bg-gray-50/80 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {tarefaSelecionada.status === "rascunho" && (
                      <>
                        <Button
                          onClick={() => editarTarefa(tarefaSelecionada)}
                          variant="outline"
                          className="h-9 text-sm"
                        >
                          <Edit className="h-4 w-4 mr-1.5" />
                          Editar
                        </Button>
                        <Button
                          onClick={() => enviarMutation.mutate({ id: tarefaSelecionada.id })}
                          disabled={enviarMutation.isPending}
                          className="h-9 text-sm bg-orange-500 hover:bg-orange-600"
                        >
                          <Send className="h-4 w-4 mr-1.5" />
                          Enviar
                        </Button>
                      </>
                    )}
                    {tarefaSelecionada.status === "enviado" && (
                      <Button
                        onClick={() => concluirMutation.mutate({ id: tarefaSelecionada.id })}
                        disabled={concluirMutation.isPending}
                        className="flex-1 h-9 text-sm bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        Concluir
                      </Button>
                    )}
                    {tarefaSelecionada.status === "concluido" && (
                      <Button
                        onClick={() => reabrirMutation.mutate({ id: tarefaSelecionada.id })}
                        disabled={reabrirMutation.isPending}
                        variant="outline"
                        className="h-9 text-sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-1.5" />
                        Reabrir
                      </Button>
                    )}
                    <Button
                      onClick={() => { if (confirm("Tem certeza que deseja excluir esta tarefa?")) { deletarMutation.mutate({ id: tarefaSelecionada.id }); } }}
                      disabled={deletarMutation.isPending}
                      variant="destructive"
                      className="h-9 text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Modal de Relatório Avançado */}
      <ReportGeneratorModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        tipoFuncao="tarefa_simples"
        filters={{
          search: busca,
          status: filtroStatus === "todos" ? "todos" : filtroStatus,
          responsavel: "todos",
          prioridade: "todos",
          dataInicio: "",
          dataFim: "",
          periodoRapido: "todos",
        }}
        items={tarefasFiltradas}
        onGenerate={(config) => {
          const condominio = condominios?.find(c => c.id === condominioId);
          const logoUrl: string | undefined = condominio?.logoUrl ? condominio.logoUrl : undefined;
          const html = generateReportHTML(tarefasFiltradas, config, logoUrl);
          printReport(html);
          setShowReportModal(false);
        }}
        availableFields={[
          { key: "protocolo", label: "Protocolo", included: true },
          { key: "titulo", label: "Título", included: true },
          { key: "tipo", label: "Tipo", included: true },
          { key: "status", label: "Status", included: true },
          { key: "descricao", label: "Descrição", included: false },
          { key: "createdAt", label: "Data Criação", included: true },
        ]}
        organizationName={condominios?.find(c => c.id === condominioId)?.nome}
        organizationLogo={condominios?.find(c => c.id === condominioId)?.logoUrl}
      />
    </div>
  );
}

export { FuncoesRapidasPage };
