import { useState, useEffect } from "react";
// DashboardLayout removido - agora renderizado dentro do Dashboard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { EnvioMulticanalModal } from "@/components/EnvioMulticanalModal";
import { 
  AlertTriangle, 
  Search, 
  Filter,
  Eye,
  MessageCircle,
  Clock,
  CheckCircle,
  FileText,
  Archive,
  User,
  Building2,
  Home,
  Calendar,
  Send,
  Image as ImageIcon,
  Loader2,
  Plus,
  X,
  ExternalLink,
  MoreVertical,
  FileDown,
  Download
} from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function HistoricoInfracoesPage() {
  const [, navigate] = useLocation();
  const [condominioId, setCondominioId] = useState<number | null>(null);
  const [condominio, setCondominio] = useState<any>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Modal de detalhes
  const [selectedNotificacao, setSelectedNotificacao] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Modal de resposta
  const [showRespostaModal, setShowRespostaModal] = useState(false);
  const [resposta, setResposta] = useState("");
  const [respostaImagens, setRespostaImagens] = useState<string[]>([]);
  
  // Modal de envio
  const [showEnvioModal, setShowEnvioModal] = useState(false);
  
  // Modal de relatório
  const [showRelatorioModal, setShowRelatorioModal] = useState(false);
  const [relatorioDataInicio, setRelatorioDataInicio] = useState("");
  const [relatorioDataFim, setRelatorioDataFim] = useState("");
  const [relatorioMoradorId, setRelatorioMoradorId] = useState<number | null>(null);
  const [relatorioStatus, setRelatorioStatus] = useState<string>("all");
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);

  // Queries
  const { data: condominios } = trpc.condominio.list.useQuery();
  const { data: notificacoes, isLoading, refetch } = trpc.notificacoesInfracao.list.useQuery(
    { 
      condominioId: condominioId!,
      status: statusFilter !== "all" ? statusFilter as any : undefined,
    },
    { enabled: !!condominioId }
  );
  const { data: stats } = trpc.notificacoesInfracao.countByStatus.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );
  const { data: respostas, refetch: refetchRespostas } = trpc.respostasInfracao.list.useQuery(
    { notificacaoId: selectedNotificacao?.notificacao?.id || 0 },
    { enabled: !!selectedNotificacao?.notificacao?.id }
  );
  
  // Query para equipa do relatório
  const { data: moradoresRelatorio } = trpc.relatorioInfracoes.listarMoradores.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );
  
  // Mutation para gerar relatório
  const gerarRelatorioMutation = trpc.relatorioInfracoes.gerar.useMutation({
    onSuccess: (data) => {
      // Criar blob e fazer download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Relatório gerado com sucesso! ${data.estatisticas.total} infrações.`);
      setShowRelatorioModal(false);
      setGerandoRelatorio(false);
    },
    onError: (error) => {
      toast.error(`Erro ao gerar relatório: ${error.message}`);
      setGerandoRelatorio(false);
    },
  });

  // Mutations
  const updateStatusMutation = trpc.notificacoesInfracao.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });

  const enviarRespostaMutation = trpc.respostasInfracao.createSindico.useMutation({
    onSuccess: () => {
      toast.success("Resposta enviada com sucesso!");
      setResposta("");
      setRespostaImagens([]);
      setShowRespostaModal(false);
      refetchRespostas();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar resposta: ${error.message}`);
    },
  });

  // Selecionar primeira organização
  useEffect(() => {
    if (condominios && condominios.length > 0 && !condominioId) {
      setCondominioId(condominios[0].id);
      setCondominio(condominios[0]);
    }
  }, [condominios, condominioId]);

  // Filtrar notificações por busca
  const filteredNotificacoes = notificacoes?.filter(item => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.morador?.nome?.toLowerCase().includes(term) ||
      item.morador?.apartamento?.toLowerCase().includes(term) ||
      item.notificacao.titulo.toLowerCase().includes(term)
    );
  });

  // Formatar data
  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status config
  const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
    pendente: { label: "Pendente", className: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    respondida: { label: "Respondida", className: "bg-blue-100 text-blue-700 border-blue-200", icon: MessageCircle },
    resolvida: { label: "Resolvida", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle },
    arquivada: { label: "Arquivada", className: "bg-gray-100 text-gray-700 border-gray-200", icon: Archive },
  };

  // Abrir detalhes
  const handleOpenDetails = (item: any) => {
    setSelectedNotificacao(item);
    setShowDetailsModal(true);
  };

  // Atualizar status
  const handleUpdateStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status: status as any });
  };

  // Enviar resposta
  const handleEnviarResposta = () => {
    if (!resposta.trim() || !selectedNotificacao) return;
    enviarRespostaMutation.mutate({
      notificacaoId: selectedNotificacao.notificacao.id,
      mensagem: resposta.trim(),
      imagens: respostaImagens.length > 0 ? respostaImagens : undefined,
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-500" />
              Histórico de Notificações
            </h1>
            <p className="text-gray-500 text-sm">
              Gerencie todas as notificações de infrações enviadas
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowRelatorioModal(true)}>
              <FileDown className="h-4 w-4 mr-2" />
              Gerar Relatório PDF
            </Button>
            <Button onClick={() => navigate("/dashboard/notificar-morador")}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Notificação
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("all")}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("pendente")}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-amber-600">{stats?.pendente || 0}</p>
                  <p className="text-xs text-gray-500">Pendentes</p>
                </div>
                <Clock className="h-8 w-8 text-amber-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("respondida")}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats?.respondida || 0}</p>
                  <p className="text-xs text-gray-500">Respondidas</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("resolvida")}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats?.resolvida || 0}</p>
                  <p className="text-xs text-gray-500">Resolvidas</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter("arquivada")}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-600">{stats?.arquivada || 0}</p>
                  <p className="text-xs text-gray-500">Arquivadas</p>
                </div>
                <Archive className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Input
                  placeholder="Buscar por nome, apartamento ou título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="respondida">Respondidas</SelectItem>
                  <SelectItem value="resolvida">Resolvidas</SelectItem>
                  <SelectItem value="arquivada">Arquivadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Notificações */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredNotificacoes && filteredNotificacoes.length > 0 ? (
              <div className="space-y-4">
                {filteredNotificacoes.map((item) => {
                  const status = item.notificacao.status || "pendente";
                  const config = statusConfig[status];
                  const StatusIcon = config.icon;
                  
                  return (
                    <div
                      key={item.notificacao.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            <h3 className="font-semibold">{item.notificacao.titulo}</h3>
                            <Badge variant="outline" className={config.className}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.morador?.nome}
                            </span>
                            {item.morador?.bloco && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                Bloco {item.morador.bloco}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Home className="h-3 w-3" />
                              Apto {item.morador?.apartamento}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(item.notificacao.createdAt)}
                            </span>
                          </div>
                          {item.tipoInfracao && (
                            <p className="text-xs text-gray-400 mt-1">
                              Tipo: {item.tipoInfracao.titulo}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetails(item)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateStatus(item.notificacao.id, "resolvida")}>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                Marcar como Resolvida
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(item.notificacao.id, "arquivada")}>
                                <Archive className="h-4 w-4 mr-2 text-gray-500" />
                                Arquivar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`/notificacao/${item.notificacao.linkPublico}`, "_blank")}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Abrir Link Público
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">Nenhuma notificação encontrada</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {statusFilter !== "all" 
                    ? "Tente mudar o filtro de status" 
                    : "Crie uma nova notificação para começar"}
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => navigate("/dashboard/notificar-morador")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Notificação
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                {selectedNotificacao?.notificacao?.titulo}
              </DialogTitle>
              <DialogDescription className="text-amber-100">
                Detalhes da notificação e histórico de respostas
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
          {selectedNotificacao && (
            <div className="space-y-6 pt-4">
              {/* Dados do Usuário */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Usuário
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Nome:</span>
                    <p className="font-medium">{selectedNotificacao.morador?.nome}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Unidade:</span>
                    <p className="font-medium">
                      {selectedNotificacao.morador?.bloco ? `Bloco ${selectedNotificacao.morador.bloco} - ` : ""}
                      Apto {selectedNotificacao.morador?.apartamento}
                    </p>
                  </div>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h4 className="font-medium mb-2">Descrição</h4>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                  {selectedNotificacao.notificacao.descricao}
                </p>
              </div>

              {/* Imagens */}
              {selectedNotificacao.notificacao.imagens && 
               (selectedNotificacao.notificacao.imagens as string[]).length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Imagens
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedNotificacao.notificacao.imagens as string[]).map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Imagem ${idx + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline de Respostas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Respostas ({respostas?.length || 0})
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRespostaModal(true)}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Responder
                  </Button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {respostas && respostas.length > 0 ? (
                    respostas.map((resp) => (
                      <div
                        key={resp.id}
                        className={`p-3 rounded-lg ${
                          resp.autorTipo === 'sindico'
                            ? 'bg-blue-50 dark:bg-blue-950 ml-4'
                            : 'bg-gray-100 dark:bg-gray-800 mr-4'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium">{resp.autorNome}</span>
                          <Badge variant="outline" className="text-xs">
                            {resp.autorTipo === 'sindico' ? 'Administração' : 'Usuário'}
                          </Badge>
                          <span className="text-xs text-gray-400 ml-auto">
                            {formatDate(resp.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm">{resp.mensagem}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma resposta ainda
                    </p>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowEnvioModal(true);
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Reenviar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`/notificacao/${selectedNotificacao.notificacao.linkPublico}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Página Pública
                </Button>
                {selectedNotificacao.notificacao.status !== 'resolvida' && (
                  <Button
                    variant="default"
                    className="ml-auto"
                    onClick={() => {
                      handleUpdateStatus(selectedNotificacao.notificacao.id, "resolvida");
                      setShowDetailsModal(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marcar como Resolvida
                  </Button>
                )}
              </div>
            </div>
          )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Resposta */}
      <Dialog open={showRespostaModal} onOpenChange={setShowRespostaModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                Responder Notificação
              </DialogTitle>
              <DialogDescription className="text-blue-100">
                Envie uma resposta para o usuário
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
            <Textarea
              placeholder="Digite sua resposta..."
              value={resposta}
              onChange={(e) => setResposta(e.target.value)}
              rows={4}
            />
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowRespostaModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleEnviarResposta}
                disabled={!resposta.trim() || enviarRespostaMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
              >
                {enviarRespostaMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-1" />
                )}
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Envio Multicanal */}
      {selectedNotificacao && condominio && (
        <EnvioMulticanalModal
          open={showEnvioModal}
          onOpenChange={setShowEnvioModal}
          destinatario={{
            nome: selectedNotificacao.morador?.nome || "",
            whatsapp: selectedNotificacao.morador?.celular,
            email: selectedNotificacao.morador?.email,
            bloco: selectedNotificacao.morador?.bloco,
            apartamento: selectedNotificacao.morador?.apartamento || "",
          }}
          notificacao={{
            titulo: selectedNotificacao.notificacao.titulo,
            descricao: selectedNotificacao.notificacao.descricao,
            linkPublico: selectedNotificacao.notificacao.linkPublico,
          }}
          condominio={{
            nome: condominio.nome,
          }}
          onPrint={() => window.open(`/notificacao/${selectedNotificacao.notificacao.linkPublico}?print=true`, "_blank")}
        />
      )}
      
      {/* Modal de Gerar Relatório */}
      <Dialog open={showRelatorioModal} onOpenChange={setShowRelatorioModal}>
        <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <FileDown className="w-5 h-5 text-white" />
                </div>
                Gerar Relatório de Infrações
              </DialogTitle>
              <DialogDescription className="text-emerald-100">
                Selecione os filtros para gerar o relatório em PDF
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
            {/* Período */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={relatorioDataInicio}
                  onChange={(e) => setRelatorioDataInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={relatorioDataFim}
                  onChange={(e) => setRelatorioDataFim(e.target.value)}
                />
              </div>
            </div>
            
            {/* Usuário */}
            <div className="space-y-2">
              <Label>Filtrar por Usuário</Label>
              <Select
                value={relatorioMoradorId?.toString() || "all"}
                onValueChange={(v) => setRelatorioMoradorId(v === "all" ? null : parseInt(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os usuários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {moradoresRelatorio?.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.nome} - {m.bloco ? `Bloco ${m.bloco}, ` : ""}Apto {m.apartamento}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Status */}
            <div className="space-y-2">
              <Label>Filtrar por Status</Label>
              <Select
                value={relatorioStatus}
                onValueChange={setRelatorioStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="respondida">Respondida</SelectItem>
                  <SelectItem value="resolvida">Resolvida</SelectItem>
                  <SelectItem value="arquivada">Arquivada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Botões */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRelatorioModal(false);
                  setRelatorioDataInicio("");
                  setRelatorioDataFim("");
                  setRelatorioMoradorId(null);
                  setRelatorioStatus("all");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (!condominioId) return;
                  setGerandoRelatorio(true);
                  gerarRelatorioMutation.mutate({
                    condominioId,
                    dataInicio: relatorioDataInicio || undefined,
                    dataFim: relatorioDataFim || undefined,
                    moradorId: relatorioMoradorId || undefined,
                    status: relatorioStatus !== "all" ? relatorioStatus as any : undefined,
                  });
                }}
                disabled={gerandoRelatorio}
              >
                {gerandoRelatorio ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Gerar PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
