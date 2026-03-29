import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import {
  Search,
  Filter,
  Clock,
  Eye,
  Edit,
  Trash2,
  Download,
  Share2,
  ExternalLink,
  Calendar,
  User,
  MapPin,
  FileText,
  Loader2,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertTriangle,
  Image as ImageIcon,
  Copy,
  Send,
  Bell,
} from "lucide-react";
import { TimelineNotificacoesConfig } from "@/components/TimelineNotificacoesConfig";
import { Link } from "wouter";

interface TimelineHistoricoPageProps {
  condominioId: number;
}

export default function TimelineHistoricoPage({ condominioId }: TimelineHistoricoPageProps) {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>("todos");
  const [timelineSelecionada, setTimelineSelecionada] = useState<any>(null);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalExcluir, setModalExcluir] = useState(false);
  const [modalNotificacoes, setModalNotificacoes] = useState(false);

  // Queries
  const { data: timelinesData, isLoading, refetch } = trpc.timeline.listar.useQuery({
    condominioId,
    busca: busca || undefined,
    statusId: filtroStatus !== "todos" ? parseInt(filtroStatus) : undefined,
    estado: filtroEstado !== "todos" ? filtroEstado as "rascunho" | "enviado" | "registado" : undefined,
    prioridadeId: filtroPrioridade !== "todos" ? parseInt(filtroPrioridade) : undefined,
  });

  const { data: statusList = [] } = trpc.timeline.listarStatus.useQuery({ condominioId });
  const { data: prioridades = [] } = trpc.timeline.listarPrioridades.useQuery({ condominioId });

  // Mutations
  const excluirMutation = trpc.timeline.excluir.useMutation({
    onSuccess: () => {
      toast.success("Timeline excluída com sucesso!");
      refetch();
      setModalExcluir(false);
      setTimelineSelecionada(null);
    },
    onError: () => {
      toast.error("Erro ao excluir timeline");
    },
  });

  const gerarPdfMutation = trpc.timeline.gerarPdf.useMutation({
    onSuccess: (data) => {
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `timeline-${timelineSelecionada?.protocolo || "export"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("PDF gerado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao gerar PDF");
    },
  });

  const handleCopyLink = (timeline: any) => {
    const url = `${window.location.origin}/timeline/${timeline.tokenPublico}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  const handleOpenLink = (timeline: any) => {
    const url = `${window.location.origin}/timeline/${timeline.tokenPublico}`;
    window.open(url, "_blank");
  };

  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade?.toLowerCase()) {
      case "alta":
      case "urgente":
        return "bg-red-100 text-red-800";
      case "média":
      case "media":
        return "bg-yellow-100 text-yellow-800";
      case "baixa":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "concluído":
      case "concluido":
      case "finalizado":
        return "bg-green-100 text-green-800";
      case "em andamento":
      case "em_andamento":
        return "bg-blue-100 text-blue-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "rascunho":
        return "bg-gray-100 text-gray-800";
      case "enviado":
        return "bg-blue-100 text-blue-800";
      case "registado":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case "rascunho":
        return "Rascunho";
      case "enviado":
        return "Enviado";
      case "registado":
        return "Registado";
      default:
        return estado;
    }
  };

  const timelines = timelinesData?.items || [];

  // Estatísticas
  const stats = {
    total: timelines.length,
    rascunhos: timelines.filter((t: any) => t.estado === "rascunho").length,
    enviados: timelines.filter((t: any) => t.estado === "enviado").length,
    registados: timelines.filter((t: any) => t.estado === "registado").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-orange-500" />
            Histórico de Timelines
          </h1>
          <p className="text-gray-600 mt-1">
            Visualize e gerencie todas as timelines registadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Link href="/dashboard/timeline">
            <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Nova Timeline
            </Button>
          </Link>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-slate-200 rounded-xl">
                <Clock className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-700">{stats.rascunhos}</p>
              </div>
              <div className="p-3 bg-gray-200 rounded-xl">
                <Edit className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Enviados</p>
                <p className="text-2xl font-bold text-blue-700">{stats.enviados}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-xl">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Registados</p>
                <p className="text-2xl font-bold text-green-700">{stats.registados}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por título, protocolo ou responsável..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os estados</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="registado">Registado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {statusList.map((s: any) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroPrioridade} onValueChange={setFiltroPrioridade}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as prioridades</SelectItem>
                {prioridades.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Timelines */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : timelines.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhuma timeline encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Crie sua primeira timeline para começar a registar atividades.
            </p>
            <Link href="/dashboard/timeline">
              <Button className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Criar Timeline
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {timelines.map((timeline: any) => (
            <Card
              key={timeline.id}
              className="border-0 shadow-md hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Info Principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getEstadoColor(timeline.estado)}>
                        {getEstadoLabel(timeline.estado)}
                      </Badge>
                      {timeline.status?.nome && (
                        <Badge className={getStatusColor(timeline.status?.nome)}>
                          {timeline.status?.nome}
                        </Badge>
                      )}
                      {timeline.prioridade?.nome && (
                        <Badge className={getPrioridadeColor(timeline.prioridade?.nome)}>
                          {timeline.prioridade?.nome}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {timeline.titulo}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                      {timeline.protocolo}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                      {timeline.responsavel?.nome && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {timeline.responsavel?.nome}
                        </span>
                      )}
                      {timeline.local?.nome && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {timeline.local?.nome}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(timeline.dataRegistro).toLocaleDateString("pt-BR")}
                      </span>
                      {timeline.imagens && timeline.imagens.length > 0 && (
                        <span className="flex items-center gap-1">
                          <ImageIcon className="w-4 h-4" />
                          {timeline.imagens.length} imagem(ns)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTimelineSelecionada(timeline);
                        setModalDetalhes(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenLink(timeline)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Abrir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(timeline)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTimelineSelecionada(timeline);
                        gerarPdfMutation.mutate({ id: timeline.id });
                      }}
                      disabled={gerarPdfMutation.isPending}
                    >
                      {gerarPdfMutation.isPending && timelineSelecionada?.id === timeline.id ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-1" />
                      )}
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      onClick={() => {
                        setTimelineSelecionada(timeline);
                        setModalNotificacoes(true);
                      }}
                    >
                      <Bell className="w-4 h-4 mr-1" />
                      Notificações
                    </Button>
                    {timeline.estado === "rascunho" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setTimelineSelecionada(timeline);
                          setModalExcluir(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={modalDetalhes} onOpenChange={setModalDetalhes}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Detalhes da Timeline
            </DialogTitle>
            <DialogDescription>
              {timelineSelecionada?.protocolo}
            </DialogDescription>
          </DialogHeader>

          {timelineSelecionada && (
            <div className="space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getEstadoColor(timelineSelecionada.estado)}>
                  {getEstadoLabel(timelineSelecionada.estado)}
                </Badge>
                {timelineSelecionada.statusNome && (
                  <Badge className={getStatusColor(timelineSelecionada.statusNome)}>
                    {timelineSelecionada.statusNome}
                  </Badge>
                )}
                {timelineSelecionada.prioridadeNome && (
                  <Badge className={getPrioridadeColor(timelineSelecionada.prioridadeNome)}>
                    {timelineSelecionada.prioridadeNome}
                  </Badge>
                )}
              </div>

              {/* Título */}
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {timelineSelecionada.titulo}
                </h3>
              </div>

              {/* Informações */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Responsável</p>
                  <p className="font-medium">{timelineSelecionada.responsavelNome || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Local / Item</p>
                  <p className="font-medium">{timelineSelecionada.localNome || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Data</p>
                  <p className="font-medium">
                    {new Date(timelineSelecionada.dataRegistro).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Hora</p>
                  <p className="font-medium">{timelineSelecionada.horaRegistro || "-"}</p>
                </div>
              </div>

              {/* Descrição */}
              {timelineSelecionada.descricao && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Descrição</p>
                  <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {timelineSelecionada.descricao}
                  </p>
                </div>
              )}

              {/* Imagens */}
              {timelineSelecionada.imagens && timelineSelecionada.imagens.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">
                    Imagens ({timelineSelecionada.imagens.length})
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {timelineSelecionada.imagens.map((img: any, index: number) => (
                      <a
                        key={index}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={img.url}
                          alt={img.legenda || `Imagem ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  onClick={() => handleOpenLink(timelineSelecionada)}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir Link Premium
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCopyLink(timelineSelecionada)}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => gerarPdfMutation.mutate({ id: timelineSelecionada.id })}
                  disabled={gerarPdfMutation.isPending}
                >
                  {gerarPdfMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Baixar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={modalExcluir} onOpenChange={setModalExcluir}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta timeline? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {timelineSelecionada && (
            <div className="py-4">
              <p className="font-medium text-gray-900">{timelineSelecionada.titulo}</p>
              <p className="text-sm text-gray-500">{timelineSelecionada.protocolo}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalExcluir(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (timelineSelecionada) {
                  excluirMutation.mutate({ id: timelineSelecionada.id });
                }
              }}
              disabled={excluirMutation.isPending}
            >
              {excluirMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações de Notificações */}
      {timelineSelecionada && (
        <TimelineNotificacoesConfig
          timelineId={timelineSelecionada.id}
          open={modalNotificacoes}
          onOpenChange={setModalNotificacoes}
        />
      )}
    </div>
  );
}
