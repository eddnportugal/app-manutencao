import { useEffect, useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import {
  Download,
  Share2,
  Clock,
  MapPin,
  User,
  Calendar,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  Printer,
  Copy,
  ExternalLink,
  Plus,
  Send,
  MessageSquare,
  Upload,
  Edit3,
  Eye,
  Tag,
  Activity,
  Users,
} from "lucide-react";
import { Link } from "wouter";

interface TimelineVisualizarPageProps {
  token: string;
}

export default function TimelineVisualizarPage({ token }: TimelineVisualizarPageProps) {
  const [copied, setCopied] = useState(false);
  const [novaLegenda, setNovaLegenda] = useState("");
  const [editandoDescricao, setEditandoDescricao] = useState(false);
  const [descricaoEditada, setDescricaoEditada] = useState("");
  const [novoStatusId, setNovoStatusId] = useState<string>("");
  const [mensagemChat, setMensagemChat] = useState("");
  const [membroSelecionadoId, setMembroSelecionadoId] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  // Buscar timeline pelo token
  const { data: timeline, isLoading, error } = trpc.timeline.obterPorToken.useQuery(
    { token },
    { enabled: !!token }
  );

  // Mutation para registar visualização
  const registarVisualizacaoMutation = trpc.timeline.registarVisualizacao.useMutation();

  // Mutation para adicionar comentário público
  const adicionarEventoMutation = trpc.timeline.adicionarEventoPublico.useMutation({
    onSuccess: () => {
      toast.success("Comentário adicionado!");
      utils.timeline.obterPorToken.invalidate({ token });
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation para adicionar imagem pública
  const adicionarImagemMutation = trpc.timeline.adicionarImagemPublica.useMutation({
    onSuccess: () => {
      toast.success("Imagem adicionada!");
      setNovaLegenda("");
      utils.timeline.obterPorToken.invalidate({ token });
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation para atualizar via link público (edição)
  const atualizarPublicoMutation = trpc.timeline.atualizarPublico.useMutation({
    onSuccess: () => {
      toast.success("Timeline atualizada!");
      setEditandoDescricao(false);
      utils.timeline.obterPorToken.invalidate({ token });
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation para alterar categorização
  const alterarCategorizacaoMutation = trpc.timeline.alterarCategorizacao.useMutation({
    onSuccess: () => {
      toast.success("Categorização atualizada!");
      utils.timeline.obterPorToken.invalidate({ token });
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation para enviar mensagem no chat
  const enviarMensagemChatMutation = trpc.timeline.enviarMensagemChat.useMutation({
    onSuccess: () => {
      setMensagemChat("");
      utils.timeline.obterPorToken.invalidate({ token });
      // Scroll to bottom of chat
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation para associar/desassociar membro
  const toggleMembroMutation = trpc.timeline.toggleMembroAssociado.useMutation({
    onSuccess: () => {
      utils.timeline.obterPorToken.invalidate({ token });
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation para gerar PDF (público)
  const gerarPdfMutation = trpc.timeline.gerarPdfPublico.useMutation({
    onSuccess: (data) => {
      // Criar blob e fazer download
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
      a.download = `timeline-${timeline?.protocolo || token}.pdf`;
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

  // Registar visualização ao carregar
  useEffect(() => {
    if (timeline && token) {
      registarVisualizacaoMutation.mutate({
        token,
      });
    }
  }, [timeline?.id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (token) {
      gerarPdfMutation.mutate({ token });
    }
  };

  const permissao = timeline?.permissao || "visualizar";
  const podeAdicionar = permissao === "adicionar" || permissao === "editar";
  const podeEditar = permissao === "editar";

  // Derived: membro selecionado pelo dropdown
  const membroSelecionado = timeline?.membrosEquipe?.find((m: any) => m.id === membroSelecionadoId);
  const membroSelecionadoNome = membroSelecionado?.nome || "";
  // Membros disponíveis para seleção no dropdown (associados, ou todos se nenhum associado ainda)
  const membrosParaSelecao = (timeline?.membrosAssociadosIds?.length ?? 0) > 0
    ? timeline?.membrosEquipe?.filter((m: any) => timeline.membrosAssociadosIds?.includes(m.id)) || []
    : timeline?.membrosEquipe || [];

  const handleUploadImagem = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      adicionarImagemMutation.mutate({
        token,
        url: base64,
        legenda: novaLegenda || undefined,
      });
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAdicionarDescricao = () => {
    if (!descricaoEditada.trim()) return;
    const autorNome = membroSelecionadoNome || "";
    atualizarPublicoMutation.mutate({
      token,
      descricao: descricaoEditada,
      autorNome: autorNome || undefined,
    });
    setDescricaoEditada("");
    setEditandoDescricao(false);
  };

  const handleAlterarStatus = (statusId: string) => {
    setNovoStatusId(statusId);
    atualizarPublicoMutation.mutate({
      token,
      statusId: Number(statusId),
    });
  };

  const handleAlterarCategorizacao = (categorizacao: string) => {
    if (!membroSelecionadoNome) {
      toast.error("Selecione seu nome na seção de Informações");
      return;
    }
    alterarCategorizacaoMutation.mutate({
      token,
      categorizacao: categorizacao as any,
      autorNome: membroSelecionadoNome,
    });
  };

  const handleEnviarMensagemChat = () => {
    if (!mensagemChat.trim() || !membroSelecionadoNome) {
      toast.error("Selecione seu nome e preencha a mensagem");
      return;
    }
    enviarMensagemChatMutation.mutate({
      token,
      autorNome: membroSelecionadoNome,
      mensagem: mensagemChat,
    });
  };

  const CATEGORIAS = [
    { value: "recebido", label: "Recebido", color: "bg-gray-100 text-gray-700 border-gray-300", dot: "bg-gray-500" },
    { value: "encaminhado", label: "Encaminhado", color: "bg-blue-100 text-blue-700 border-blue-300", dot: "bg-blue-500" },
    { value: "em_analise", label: "Em Análise", color: "bg-purple-100 text-purple-700 border-purple-300", dot: "bg-purple-500" },
    { value: "em_execucao", label: "Em Execução", color: "bg-amber-100 text-amber-700 border-amber-300", dot: "bg-amber-500" },
    { value: "aguardando_resposta", label: "Aguardando Resposta", color: "bg-orange-100 text-orange-700 border-orange-300", dot: "bg-orange-500" },
    { value: "finalizado", label: "Finalizado", color: "bg-green-100 text-green-700 border-green-300", dot: "bg-green-500" },
    { value: "reaberto", label: "Reaberto", color: "bg-red-100 text-red-700 border-red-300", dot: "bg-red-500" },
  ];

  const getCategoriaInfo = (value?: string | null) => {
    return CATEGORIAS.find(c => c.value === value) || CATEGORIAS[0];
  };

  const getPrioridadeColor = (prioridade?: string) => {
    switch (prioridade?.toLowerCase()) {
      case "alta":
      case "urgente":
        return "bg-red-100 text-red-800 border-red-200";
      case "média":
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "baixa":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "concluído":
      case "concluido":
      case "finalizado":
        return "bg-green-100 text-green-800 border-green-200";
      case "em andamento":
      case "em_andamento":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pendente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">A carregar timeline...</p>
        </div>
      </div>
    );
  }

  if (error || !timeline) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Timeline não encontrada</h2>
            <p className="text-gray-600 mb-6">
              O link pode ter expirado ou a timeline foi removida.
            </p>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 print:bg-white" id="timeline-print-root">
      {/* ====== Cabeçalho de Impressão (visível apenas no print) ====== */}
      <div className="hidden print:block" id="print-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: '3px solid #f97316', marginBottom: '8px' }}>
          {timeline.condominio?.logoUrl && (
            <img
              src={timeline.condominio.logoUrl}
              alt="Logo"
              style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '6px' }}
            />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
              {timeline.condominio?.nome || 'Organização'}
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>
              Timeline: {timeline.protocolo}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10px', color: '#9ca3af' }}>
            Gerado em {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Header Premium */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleCopyLink}
              >
                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handlePrint}
              >
                <Printer className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleDownloadPdf}
                disabled={gerarPdfMutation.isPending}
              >
                {gerarPdfMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Timeline</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{timeline.titulo}</h1>
            <p className="text-white/90 text-lg">
              Protocolo: <span className="font-mono font-semibold">{timeline.protocolo}</span>
            </p>
            {/* Badge de Permissão */}
            <div className="mt-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                permissao === "editar" 
                  ? "bg-green-500/30 text-green-100" 
                  : permissao === "adicionar" 
                  ? "bg-blue-500/30 text-blue-100" 
                  : "bg-white/20 text-white/80"
              }`}>
                {permissao === "editar" ? <Edit3 className="w-3 h-3" /> : 
                 permissao === "adicionar" ? <Plus className="w-3 h-3" /> : 
                 <Eye className="w-3 h-3" />}
                {permissao === "editar" ? "Edição Completa" : 
                 permissao === "adicionar" ? "Pode Adicionar" : 
                 "Apenas Visualização"}
              </span>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="relative h-16 -mb-1">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute bottom-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Título para impressão (visível só no print) */}
      <div className="hidden print:block" style={{ padding: '0 20px', marginBottom: '8px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>{timeline.titulo}</h1>
        <p style={{ fontSize: '12px', color: '#6b7280' }}>
          Protocolo: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{timeline.protocolo}</span>
        </p>
      </div>

      {/* Barra de Ações (Imprimir / PDF) - visível apenas na tela */}
      <div className="max-w-4xl mx-auto px-4 -mt-2 mb-4 print:hidden">
        <div className="flex flex-wrap gap-3 justify-center bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-3 shadow-sm">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Button
            onClick={handleDownloadPdf}
            disabled={gerarPdfMutation.isPending}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow"
          >
            {gerarPdfMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Baixar PDF
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
            {copied ? "Copiado!" : "Copiar Link"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 -mt-4 print:py-0 print:px-5" id="timeline-content">
        {/* Status e Prioridade */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center print:justify-start print:mb-4 print:gap-2">
          {timeline.status?.nome && (
            <Badge className={`px-4 py-2 text-sm font-medium ${getStatusColor(timeline.status?.nome)} print:px-2 print:py-1 print:text-xs`}>
              {timeline.status?.nome}
            </Badge>
          )}
          {timeline.prioridade?.nome && (
            <Badge className={`px-4 py-2 text-sm font-medium ${getPrioridadeColor(timeline.prioridade?.nome)} print:px-2 print:py-1 print:text-xs`}>
              Prioridade: {timeline.prioridade?.nome}
            </Badge>
          )}
          <Badge className="px-4 py-2 text-sm font-medium bg-orange-100 text-orange-800 border-orange-200 print:px-2 print:py-1 print:text-xs">
            {timeline.estado === "rascunho" ? "Rascunho" : timeline.estado === "enviado" ? "Enviado" : "Registado"}
          </Badge>
          {(() => {
            const catInfo = getCategoriaInfo(timeline.categorizacao);
            return (
              <Badge className={`px-4 py-2 text-sm font-medium ${catInfo.color}`}>
                <div className={`w-2 h-2 rounded-full ${catInfo.dot} mr-2`} />
                {catInfo.label}
              </Badge>
            );
          })()}
        </div>

        {/* Informações Principais + Membros da Equipe */}
        <Card className="mb-6 shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-500" />
              Informações
            </h2>
          </div>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <User className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Responsável</p>
                    <p className="font-medium text-gray-900">{timeline.responsavel?.nome || "-"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Local / Item</p>
                    <p className="font-medium text-gray-900">{timeline.local?.nome || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Data e Hora</p>
                    <p className="font-medium text-gray-900">
                      {new Date(timeline.dataRegistro).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                      {timeline.horaRegistro && ` às ${timeline.horaRegistro}`}
                    </p>
                  </div>
                </div>

                {timeline.localizacaoGps && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Localização GPS</p>
                      <p className="font-medium text-gray-900 text-sm">{timeline.localizacaoGps}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Membros da Equipe - checkboxes para associar */}
            {timeline.membrosEquipe && timeline.membrosEquipe.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  Membros da Equipe
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    (marque quem participa desta timeline)
                  </span>
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {timeline.membrosEquipe.map((membro: any) => {
                    const isAssociado = timeline.membrosAssociadosIds?.includes(membro.id);
                    return (
                      <button
                        key={membro.id}
                        type="button"
                        onClick={() => podeAdicionar && toggleMembroMutation.mutate({ token, membroId: membro.id, associar: !isAssociado })}
                        disabled={!podeAdicionar || toggleMembroMutation.isPending}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                          isAssociado
                            ? "border-orange-300 bg-orange-50 shadow-sm"
                            : podeAdicionar
                            ? "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                            : "border-gray-100 bg-gray-50 cursor-default"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isAssociado ? "border-orange-500 bg-orange-500" : "border-gray-300 bg-white"
                        }`}>
                          {isAssociado && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{membro.nome}</p>
                          {membro.cargo && <p className="text-xs text-gray-500 truncate">{membro.cargo}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {toggleMembroMutation.isPending && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-orange-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Atualizando...
                  </div>
                )}

                {/* Seletor: Eu sou... */}
                {podeAdicionar && membrosParaSelecao.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-dashed border-orange-200">
                    <Label className="text-xs font-semibold text-gray-600 mb-2 block">
                      Eu sou:
                    </Label>
                    {!membroSelecionadoId ? (
                      <Select onValueChange={(val) => setMembroSelecionadoId(Number(val))}>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Selecione seu nome para interagir" />
                        </SelectTrigger>
                        <SelectContent>
                          {membrosParaSelecao.map((m: any) => (
                            <SelectItem key={m.id} value={String(m.id)}>
                              {m.nome} {m.cargo ? `(${m.cargo})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{membroSelecionadoNome.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800 flex-1">{membroSelecionadoNome}</span>
                        <button
                          onClick={() => setMembroSelecionadoId(null)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          Alterar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Chat da Equipe */}
        <Card className="mb-6 shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-500" />
              Chat da Equipe
            </h2>
          </div>
          <CardContent className="p-0">
            {/* Mensagens */}
            <div className="max-h-[400px] overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {(!timeline.chatMessages || timeline.chatMessages.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Nenhuma mensagem ainda. Inicie a conversa!</p>
                </div>
              )}
              {timeline.chatMessages?.map((msg: any) => {
                const catInfo = getCategoriaInfo(msg.categorizacaoNoMomento);
                return (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">
                        {msg.autorNome?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-800">{msg.autorNome}</span>
                          <Badge className={`text-[10px] px-1.5 py-0 h-4 ${catInfo.color}`}>
                            {catInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{msg.mensagem}</p>
                      </div>
                      <span className="text-[11px] text-gray-400 mt-1 inline-block ml-1">
                        {new Date(msg.createdAt).toLocaleString("pt-BR", {
                          day: "2-digit", month: "2-digit", year: "2-digit",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input de mensagem */}
            {podeAdicionar ? (
              <div className="p-4 border-t bg-white">
                {!membroSelecionadoId && (
                  <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <p className="text-sm text-amber-700">
                      Selecione seu nome na seção <strong>Informações</strong> acima para enviar mensagens.
                    </p>
                  </div>
                )}
                {membroSelecionadoId && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">{membroSelecionadoNome.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{membroSelecionadoNome}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Textarea
                    placeholder={membroSelecionadoId ? "Digite sua mensagem..." : "Selecione seu nome primeiro..."}
                    value={mensagemChat}
                    onChange={(e) => setMensagemChat(e.target.value)}
                    rows={2}
                    className="resize-none flex-1 text-sm"
                    disabled={!membroSelecionadoId}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleEnviarMensagemChat();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={handleEnviarMensagemChat}
                    disabled={enviarMensagemChatMutation.isPending || !mensagemChat.trim() || !membroSelecionadoId}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-auto self-end mb-0"
                  >
                    {enviarMensagemChatMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t bg-gray-50 text-center">
                <p className="text-xs text-gray-400">Chat disponível apenas com permissão de adicionar ou editar.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seletor de Categorização */}
        <Card className="mb-6 shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-500" />
              Categorização
            </h2>
          </div>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {CATEGORIAS.map((cat) => {
                const isActive = (timeline.categorizacao || "recebido") === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => podeAdicionar ? handleAlterarCategorizacao(cat.value) : null}
                    disabled={!podeAdicionar || alterarCategorizacaoMutation.isPending}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                      isActive
                        ? `${cat.color} border-current shadow-sm scale-[1.02]`
                        : podeAdicionar
                        ? "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
                        : "border-gray-100 bg-gray-50 text-gray-400 cursor-default"
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isActive ? cat.dot : "bg-gray-300"}`} />
                    {cat.label}
                    {isActive && <CheckCircle className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            {alterarCategorizacaoMutation.isPending && (
              <div className="flex items-center gap-2 mt-3 text-sm text-indigo-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Atualizando categorização...
              </div>
            )}
            {!podeAdicionar && (
              <p className="text-xs text-gray-400 mt-3">Você tem permissão apenas para visualizar.</p>
            )}
          </CardContent>
        </Card>

        {/* Descrições */}
        <Card className="mb-6 shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Descrições
            </h2>
            {podeAdicionar && !editandoDescricao && (
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-600 hover:bg-blue-100"
                onClick={() => setEditandoDescricao(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Descrição
              </Button>
            )}
          </div>
          <CardContent className="p-6 space-y-4">
            {/* Formulário para adicionar nova descrição */}
            {editandoDescricao && (
              <div className="space-y-3 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                {!membroSelecionadoId && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                    <p className="text-sm text-amber-700">
                      Selecione seu nome na seção <strong>Informações</strong> acima para adicionar descrições.
                    </p>
                  </div>
                )}
                {membroSelecionadoId && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">{membroSelecionadoNome.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="font-medium">{membroSelecionadoNome}</span>
                  </div>
                )}
                <Textarea
                  value={descricaoEditada}
                  onChange={(e) => setDescricaoEditada(e.target.value)}
                  rows={3}
                  placeholder="Descreva os detalhes..."
                  className="resize-none text-sm"
                  disabled={!membroSelecionadoId}
                />
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => { setEditandoDescricao(false); setDescricaoEditada(""); }}>
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAdicionarDescricao}
                    disabled={atualizarPublicoMutation.isPending || !descricaoEditada.trim() || !membroSelecionadoId}
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {atualizarPublicoMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Plus className="w-4 h-4 mr-1" />
                    )}
                    Adicionar
                  </Button>
                </div>
              </div>
            )}

            {/* Histórico de descrições */}
            {timeline.descricao ? (
              <div className="space-y-3">
                {timeline.descricao.split("\n\n---\n\n").map((bloco: string, index: number) => {
                  const match = bloco.match(/^\[(.+?)\]\s+(.+?):\n([\s\S]*)$/);
                  if (match) {
                    const [, data, autor, texto] = match;
                    return (
                      <div key={index} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-[9px] font-bold">{autor.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{autor}</span>
                          <span className="text-[11px] text-gray-400 ml-auto">{data}</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pl-8">{texto}</p>
                      </div>
                    );
                  }
                  // Bloco sem formato (descrição original)
                  return (
                    <div key={index} className="p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[9px] font-bold">?</span>
                        </div>
                        <span className="text-sm font-medium text-gray-500">Descrição inicial</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed pl-8">{bloco}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              !editandoDescricao && (
                <p className="text-gray-400 text-sm text-center py-4">Nenhuma descrição adicionada ainda.</p>
              )
            )}
          </CardContent>
        </Card>

        {/* Editar Status (somente para permissão editar) */}
        {podeEditar && timeline.statusList && timeline.statusList.length > 0 && (
          <Card className="mb-6 shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-green-500" />
                Alterar Status
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Select
                  value={novoStatusId || String(timeline.statusId || "")}
                  onValueChange={handleAlterarStatus}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeline.statusList.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        <div className="flex items-center gap-2">
                          {s.cor && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.cor }} />}
                          {s.nome}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {atualizarPublicoMutation.isPending && (
                  <Loader2 className="w-5 h-5 animate-spin text-green-500" />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Imagens */}
        {timeline.imagens && timeline.imagens.length > 0 && (
          <Card className="mb-6 shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                Imagens ({timeline.imagens.length})
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {timeline.imagens.map((img: any, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.url}
                      alt={img.legenda || `Imagem ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md transition-transform group-hover:scale-105"
                    />
                    {img.legenda && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
                        <p className="text-white text-sm">{img.legenda}</p>
                      </div>
                    )}
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-700" />
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Adicionar Imagem (permissão adicionar ou editar) */}
        {podeAdicionar && (
          <Card className="mb-6 shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-500" />
                Adicionar Imagem
              </h2>
            </div>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Input
                  placeholder="Legenda da imagem (opcional)"
                  value={novaLegenda}
                  onChange={(e) => setNovaLegenda(e.target.value)}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleUploadImagem}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={adicionarImagemMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {adicionarImagemMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Selecionar e Enviar Imagem
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registro de Atividades - Quem visualizou + Ações */}
        {timeline.eventos && timeline.eventos.length > 0 && (
          <Card className="mb-6 shadow-lg border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-500" />
                Registro de Atividades
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2.5">
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center"><Clock className="w-2.5 h-2.5 text-gray-600" /></span>
                  Criação
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center"><Edit3 className="w-2.5 h-2.5 text-blue-600" /></span>
                  Edição
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-cyan-100 flex items-center justify-center"><Eye className="w-2.5 h-2.5 text-cyan-600" /></span>
                  Visualização
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center"><ImageIcon className="w-2.5 h-2.5 text-purple-600" /></span>
                  Imagem
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center"><Share2 className="w-2.5 h-2.5 text-orange-600" /></span>
                  Compartilhamento
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center"><Tag className="w-2.5 h-2.5 text-indigo-600" /></span>
                  Categorização
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center"><MessageSquare className="w-2.5 h-2.5 text-teal-600" /></span>
                  Chat
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center"><Download className="w-2.5 h-2.5 text-red-600" /></span>
                  PDF
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center"><Activity className="w-2.5 h-2.5 text-green-600" /></span>
                  Registro
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center"><MessageSquare className="w-2.5 h-2.5 text-yellow-600" /></span>
                  Comentário
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-gray-500">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center"><Activity className="w-2.5 h-2.5 text-emerald-600" /></span>
                  Status
                </span>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="space-y-2">
                {timeline.eventos.map((evento: any) => {
                  const isVisualizacao = evento.tipo === "visualizacao";
                  const isCategorizacao = evento.tipo === "categorizacao";
                  const isChat = evento.tipo === "chat";
                  const isImagem = evento.tipo === "imagem";
                  const isCompartilhamento = evento.tipo === "compartilhamento";
                  const isEdicao = evento.tipo === "edicao";

                  const getEventIcon = () => {
                    if (isVisualizacao) return <Eye className="w-3.5 h-3.5 text-cyan-600" />;
                    if (isCategorizacao) return <Tag className="w-3.5 h-3.5 text-indigo-600" />;
                    if (isChat) return <MessageSquare className="w-3.5 h-3.5 text-teal-600" />;
                    if (isImagem) return <ImageIcon className="w-3.5 h-3.5 text-purple-600" />;
                    if (isCompartilhamento) return <Share2 className="w-3.5 h-3.5 text-orange-600" />;
                    if (isEdicao) return <Edit3 className="w-3.5 h-3.5 text-blue-600" />;
                    return <Clock className="w-3.5 h-3.5 text-gray-600" />;
                  };

                  const getEventBg = () => {
                    if (isVisualizacao) return "bg-cyan-50 border-cyan-100";
                    if (isCategorizacao) return "bg-indigo-50 border-indigo-100";
                    if (isChat) return "bg-teal-50 border-teal-100";
                    if (isImagem) return "bg-purple-50 border-purple-100";
                    if (isCompartilhamento) return "bg-orange-50 border-orange-100";
                    if (isEdicao) return "bg-blue-50 border-blue-100";
                    return "bg-gray-50 border-gray-100";
                  };

                  const getIconBg = () => {
                    if (isVisualizacao) return "bg-cyan-100";
                    if (isCategorizacao) return "bg-indigo-100";
                    if (isChat) return "bg-teal-100";
                    if (isImagem) return "bg-purple-100";
                    if (isCompartilhamento) return "bg-orange-100";
                    if (isEdicao) return "bg-blue-100";
                    return "bg-gray-100";
                  };

                  return (
                    <div key={evento.id} className={`flex items-start gap-3 p-3 rounded-lg border ${getEventBg()}`}>
                      <div className={`p-1.5 rounded-full flex-shrink-0 ${getIconBg()}`}>
                        {getEventIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{evento.descricao}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {evento.usuarioNome && (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600 font-medium bg-white/80 px-1.5 py-0.5 rounded">
                              <User className="w-3 h-3" />
                              {evento.usuarioNome}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {new Date(evento.createdAt).toLocaleString("pt-BR", {
                              day: "2-digit", month: "2-digit", year: "2-digit",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                          {isCategorizacao && evento.dadosNovos && (() => {
                            try {
                              const dados = JSON.parse(evento.dadosNovos);
                              const catInfo = getCategoriaInfo(dados.categorizacao);
                              return (
                                <Badge className={`text-[10px] px-1.5 py-0 h-4 ${catInfo.color}`}>
                                  {catInfo.label}
                                </Badge>
                              );
                            } catch { return null; }
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center py-8 print:hidden">
          <Separator className="mb-8" />
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100 shadow"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button
              onClick={handleDownloadPdf}
              disabled={gerarPdfMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg"
            >
              {gerarPdfMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Baixar PDF
            </Button>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <Share2 className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copiado!" : "Copiar Link"}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            Gerado por <span className="font-semibold text-orange-600">App Manutenção</span>
          </p>
        </div>

        {/* QR Code de Acesso - visível na tela e na impressão */}
        <Card className="mb-6 shadow-lg border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <QRCodeSVG
                  value={`${window.location.origin}/timeline/${token}`}
                  size={120}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#1f2937"
                  includeMargin={false}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 mb-1">Acesse esta Timeline</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Escaneie o QR Code com a câmera do celular para visualizar, editar ou adicionar ações a este documento.
                </p>
                <p className="text-xs text-gray-400 mt-2 font-mono truncate">
                  {`${window.location.origin}/timeline/${token}`}
                </p>
                <p className="text-xs font-semibold text-orange-500 mt-1">
                  Protocolo: {timeline.protocolo}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé de Impressão */}
        <div className="hidden print:block" style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
          <p style={{ fontSize: '9px', color: '#9ca3af' }}>
            {timeline.condominio?.nome || 'Organização'} | Timeline {timeline.protocolo} | Gerado em {new Date().toLocaleString('pt-BR')} | App Manutenção
          </p>
          {timeline.condominio?.rodapeContato && (
            <p style={{ fontSize: '9px', color: '#9ca3af' }}>
              Contato: {timeline.condominio.rodapeContato}
            </p>
          )}
        </div>
      </div>

      {/* Print Styles - Layout completo igual ao visual */}
      <style>{`
        @media print {
          /* Reset geral */
          * { box-shadow: none !important; }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0;
            padding: 0;
          }
          @page {
            size: A4 portrait;
            margin: 10mm 8mm;
          }
          /* Esconder tudo que não é conteúdo */
          .print\\:hidden,
          #timeline-print-root > .print\\:hidden,
          button,
          textarea,
          input,
          select {
            display: none !important;
          }
          /* Forçar exibição do cabeçalho de impressão */
          #print-header,
          .hidden.print\\:block {
            display: block !important;
          }
          /* Background branco no root */
          #timeline-print-root {
            background: white !important;
            min-height: auto !important;
          }
          /* Cards: manter bordas e cores de fundo, evitar quebra */
          #timeline-content .mb-6 {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 10px !important;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          /* Seções de conteúdo: evitar quebra dentro de blocos */
          .CardContent, [class*="CardContent"], [class*="p-6"] {
            break-inside: auto;
            page-break-inside: auto;
          }
          /* Cada evento individual pode quebrar, mas card completo fica junto */
          .space-y-2 > div {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          /* Info cards e grids */
          .grid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          /* Badges com cores */
          .inline-flex, [class*="Badge"], [class*="badge"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Gradientes e backgrounds dos headers de seção */
          [class*="bg-gradient-to-r"],
          [class*="bg-orange-50"],
          [class*="bg-teal-50"],
          [class*="bg-indigo-50"],
          [class*="bg-blue-50"],
          [class*="bg-green-50"],
          [class*="bg-purple-50"],
          [class*="bg-slate-50"],
          [class*="bg-gray-50"],
          [class*="bg-amber-50"],
          [class*="bg-cyan-50"],
          [class*="bg-violet-50"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Imagens */
          img {
            max-width: 100% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          /* Galeria de imagens: cada imagem com legenda fica junta */
          .grid.grid-cols-2 > div,
          .grid.grid-cols-3 > div {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          /* Chat messages - expandir e evitar quebra por mensagem */
          .max-h-\\[400px\\] {
            max-height: none !important;
            overflow: visible !important;
          }
          .max-h-\\[400px\\] > div {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          /* Membros checkboxes - mostrar status */
          #timeline-content button[type="button"] {
            display: flex !important;
            pointer-events: none;
            border: 1px solid #d1d5db !important;
          }
          /* Resetar content padding */
          #timeline-content {
            padding: 0 5px !important;
            margin-top: 0 !important;
          }
          /* Títulos de seção nunca ficam sozinhos no final da página (orphans) */
          h2, h3, .font-semibold {
            break-after: avoid;
            page-break-after: avoid;
          }
          /* Cabeçalho de card com gradiente fica junto com conteúdo */
          .border-b {
            break-after: avoid;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
