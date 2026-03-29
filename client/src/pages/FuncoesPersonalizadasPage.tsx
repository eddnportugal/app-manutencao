import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
  Edit,
  Trash2,
  Copy,
  Eye,
  Loader2,
  Sparkles,
  Palette,
  Settings2,
  ListChecks,
  FileText,
  MapPin,
  Image as ImageIcon,
  Tag,
  Navigation,
  Shield,
  Clock,
  DollarSign,
  Paperclip,
  QrCode,
  PenTool,
  Users,
  AlertTriangle,
  ClipboardList,
  Wrench,
  Camera,
  Search,
  Zap,
  Star,
  CheckCircle2,
  ChevronRight,
  GripVertical,
  ToggleLeft,
  X,
  ExternalLink,
  Share2,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { IndiceFuncoesButton } from "@/components/IndiceFuncoesButton";
import { QRCodeSVG } from "qrcode.react";

// Mapeamento de ícones disponíveis
const ICONES_DISPONIVEIS = [
  { key: "ClipboardList", icon: ClipboardList, label: "Checklist" },
  { key: "Wrench", icon: Wrench, label: "Manutenção" },
  { key: "AlertTriangle", icon: AlertTriangle, label: "Alerta" },
  { key: "Camera", icon: Camera, label: "Câmera" },
  { key: "Search", icon: Search, label: "Busca" },
  { key: "Zap", icon: Zap, label: "Rápido" },
  { key: "Star", icon: Star, label: "Estrela" },
  { key: "Shield", icon: Shield, label: "Segurança" },
  { key: "FileText", icon: FileText, label: "Documento" },
  { key: "Settings2", icon: Settings2, label: "Configuração" },
  { key: "ListChecks", icon: ListChecks, label: "Lista" },
  { key: "MapPin", icon: MapPin, label: "Localização" },
  { key: "Users", icon: Users, label: "Equipe" },
  { key: "DollarSign", icon: DollarSign, label: "Financeiro" },
  { key: "Clock", icon: Clock, label: "Agenda" },
  { key: "PenTool", icon: PenTool, label: "Assinatura" },
  { key: "Eye", icon: Eye, label: "Vistoria" },
  { key: "Sparkles", icon: Sparkles, label: "Especial" },
];

// Cores disponíveis  
const CORES_DISPONIVEIS = [
  { hex: "#3B82F6", label: "Azul" },
  { hex: "#F97316", label: "Laranja" },
  { hex: "#EF4444", label: "Vermelho" },
  { hex: "#10B981", label: "Verde" },
  { hex: "#8B5CF6", label: "Roxo" },
  { hex: "#EC4899", label: "Rosa" },
  { hex: "#14B8A6", label: "Teal" },
  { hex: "#F59E0B", label: "Amarelo" },
  { hex: "#6366F1", label: "Índigo" },
  { hex: "#64748B", label: "Cinza" },
  { hex: "#DC2626", label: "Vermelho Escuro" },
  { hex: "#059669", label: "Esmeralda" },
];

// Obtém ícone por key
function getIconComponent(key: string) {
  return ICONES_DISPONIVEIS.find(i => i.key === key)?.icon || ClipboardList;
}

// Tipo de campo disponível do servidor
type CampoDisponivel = { key: string; label: string; descricao: string; tipo: string };

// Interface de campo
interface CampoConfig {
  key: string;
  label: string;
  descricao: string;
  tipo: string;
  ativo: boolean;
  obrigatorio: boolean;
}

export default function FuncoesPersonalizadasPage() {
  const [, setLocation] = useLocation();
  const [condominioId, setCondominioId] = useState<number | null>(null);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [funcaoEditandoId, setFuncaoEditandoId] = useState<number | null>(null);
  const [modalPreviewAberto, setModalPreviewAberto] = useState(false);
  const [funcaoPreview, setFuncaoPreview] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [qrModalFuncao, setQrModalFuncao] = useState<any>(null);
  const [generatingToken, setGeneratingToken] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // Buscar organizações
  const { data: condominios } = trpc.condominio.list.useQuery();

  // Selecionar primeiro condomínio
  useMemo(() => {
    if (condominios && condominios.length > 0 && !condominioId) {
      setCondominioId(condominios[0].id);
    }
  }, [condominios, condominioId]);

  // Listar funções personalizadas
  const { data: funcoes, isLoading } = trpc.funcoesPersonalizadas.listarTodas.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  // Campos disponíveis
  const { data: camposDisponiveis } = trpc.funcoesPersonalizadas.camposDisponiveis.useQuery();

  // Mutations
  const deletarMutation = trpc.funcoesPersonalizadas.deletar.useMutation({
    onSuccess: () => {
      toast.success("Função excluída com sucesso!");
      utils.funcoesPersonalizadas.listarTodas.invalidate({ condominioId: condominioId! });
      setConfirmDeleteId(null);
    },
    onError: () => toast.error("Erro ao excluir função"),
  });

  const duplicarMutation = trpc.funcoesPersonalizadas.duplicar.useMutation({
    onSuccess: () => {
      toast.success("Função duplicada com sucesso!");
      utils.funcoesPersonalizadas.listarTodas.invalidate({ condominioId: condominioId! });
    },
    onError: () => toast.error("Erro ao duplicar função"),
  });

  const toggleAtivoMutation = trpc.funcoesPersonalizadas.atualizar.useMutation({
    onSuccess: () => {
      utils.funcoesPersonalizadas.listarTodas.invalidate({ condominioId: condominioId! });
    },
  });

  const gerarTokenMutation = trpc.funcoesPersonalizadas.gerarShareToken.useMutation({
    onSuccess: (data, variables) => {
      setGeneratingToken(null);
      utils.funcoesPersonalizadas.listarTodas.invalidate({ condominioId: condominioId! });
      // Abrir modal com QR code
      const funcao = funcoes?.find((f: any) => f.id === variables.id);
      if (funcao) {
        setQrModalFuncao({ ...funcao, shareToken: data.shareToken });
      }
    },
    onError: () => {
      setGeneratingToken(null);
      toast.error("Erro ao gerar link de compartilhamento");
    },
  });

  const getPublicUrl = (token: string) => {
    return `${window.location.origin}/manutencao/${token}`;
  };

  const handleShare = async (funcao: any) => {
    if (!funcao.shareToken) {
      setGeneratingToken(funcao.id);
      gerarTokenMutation.mutate({ id: funcao.id });
      return;
    }
    setQrModalFuncao(funcao);
  };

  const handleCopyLink = async (token: string) => {
    const url = getPublicUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    } catch {
      toast.error("Erro ao copiar link");
    }
  };

  const handleNativeShare = async (funcao: any) => {
    const url = getPublicUrl(funcao.shareToken);
    if (navigator.share) {
      try {
        await navigator.share({
          title: funcao.nome,
          text: `Preencha o formulário de manutenção: ${funcao.nome}`,
          url,
        });
      } catch { /* user cancelled */ }
    } else {
      handleCopyLink(funcao.shareToken);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50/30">
      {/* Header Premium */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Background decorativo */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-50" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/dashboard")}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl -ml-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <Sparkles className="h-4.5 w-4.5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Funções Personalizadas
                  </h1>
                </div>
                <p className="text-sm text-white/50 ml-[46px]">
                  Crie e gerencie funções customizadas para seu fluxo de manutenção
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IndiceFuncoesButton />
              <Button
                onClick={() => {
                  setFuncaoEditandoId(null);
                  setModalCriarAberto(true);
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 rounded-xl gap-2 px-5 h-11 font-semibold"
              >
                <Plus className="h-4.5 w-4.5" />
                <span className="hidden sm:inline">Nova Função</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Seleção de condomínio */}
        {condominios && condominios.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {condominios.map((c) => (
              <Button
                key={c.id}
                variant={condominioId === c.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCondominioId(c.id)}
                className={cn(
                  "rounded-xl transition-all",
                  condominioId === c.id 
                    ? "bg-slate-900 hover:bg-slate-800 text-white shadow-md" 
                    : "bg-white hover:bg-gray-50 border-gray-200"
                )}
              >
                {c.nome}
              </Button>
            ))}
          </div>
        )}

        {/* Contador de funções */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200/80 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              {funcoes?.length || 0} {funcoes?.length === 1 ? "função criada" : "funções criadas"} 
            </span>
          </div>
        </div>

        {/* Lista de funções */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
            <p className="text-sm text-gray-400">Carregando funções...</p>
          </div>
        ) : !funcoes || funcoes.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-transparent to-amber-50/30" />
            <div className="relative flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-500/20">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-white">
                  <Plus className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Comece a personalizar
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm leading-relaxed">
                Crie funções personalizadas com campos, ícones e cores customizados. 
                Cada função gera um formulário único para sua equipe.
              </p>
              <Button
                onClick={() => {
                  setFuncaoEditandoId(null);
                  setModalCriarAberto(true);
                }}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/20 rounded-xl gap-2 px-6 h-11 font-semibold"
              >
                <Plus className="h-4.5 w-4.5" />
                Criar Primeira Função
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {funcoes.map((funcao) => {
              const Icon = getIconComponent(funcao.icone);
              const camposAtivos = funcao.camposAtivos as Record<string, boolean>;
              const qtdCampos = Object.values(camposAtivos).filter(Boolean).length;
              
              return (
                <div 
                  key={funcao.id} 
                  className={cn(
                    "group relative rounded-2xl bg-white border border-gray-200/60 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 overflow-hidden",
                    !funcao.ativo && "opacity-50 grayscale-[30%]"
                  )}
                >
                  {/* Accent gradient top */}
                  <div 
                    className="h-1 w-full"
                    style={{ background: `linear-gradient(90deg, ${funcao.cor}, ${funcao.cor}88)` }}
                  />

                  {/* Content */}
                  <div className="p-5">
                    {/* Header do card */}
                    <div className="flex items-start gap-4 mb-4">
                      {/* Ícone grande premium */}
                      <div 
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-105"
                        style={{ 
                          background: `linear-gradient(135deg, ${funcao.cor}, ${funcao.cor}cc)`,
                          boxShadow: `0 8px 24px ${funcao.cor}30`
                        }}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate text-lg leading-tight">
                            {funcao.nome}
                          </h3>
                          {!funcao.ativo && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                              Inativa
                            </span>
                          )}
                        </div>
                        {funcao.descricao && (
                          <p className="text-sm text-gray-500 truncate">
                            {funcao.descricao}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span 
                            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg"
                            style={{ 
                              backgroundColor: `${funcao.cor}12`, 
                              color: funcao.cor 
                            }}
                          >
                            <ListChecks className="h-3 w-3" />
                            {qtdCampos} campos
                          </span>
                          {funcao.shareToken && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-green-50 text-green-600">
                              <QrCode className="h-3 w-3" />
                              QR ativo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ações rápidas em linha */}
                    <div className="flex items-center gap-1.5 mb-4">
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 px-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        onClick={() => {
                          setFuncaoEditandoId(funcao.id);
                          setModalCriarAberto(true);
                        }}
                        title="Editar"
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Editar</span>
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 px-2.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                        onClick={() => duplicarMutation.mutate({ id: funcao.id })}
                        title="Duplicar"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Duplicar</span>
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 px-2.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        onClick={() => {
                          setFuncaoPreview(funcao);
                          setModalPreviewAberto(true);
                        }}
                        title="Preview"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Preview</span>
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 px-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg ml-auto"
                        onClick={() => setConfirmDeleteId(funcao.id)}
                        title="Excluir"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    
                    {/* Toggle ativo */}
                    <div className="flex items-center justify-between py-3 px-3 -mx-1 rounded-xl bg-gray-50/80 border border-gray-100 mb-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          funcao.ativo ? "bg-green-500" : "bg-gray-300"
                        )} />
                        <Label className="text-xs font-medium text-gray-600">
                          {funcao.ativo ? "Função ativa" : "Função desativada"}
                        </Label>
                      </div>
                      <Switch
                        checked={funcao.ativo ?? true}
                        onCheckedChange={(checked) => {
                          toggleAtivoMutation.mutate({ id: funcao.id, ativo: checked });
                        }}
                      />
                    </div>

                    {/* Botões de ação principais */}
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 h-10 gap-2 rounded-xl font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg"
                        style={{ 
                          background: `linear-gradient(135deg, ${funcao.cor}, ${funcao.cor}dd)`,
                          boxShadow: `0 4px 14px ${funcao.cor}25`
                        }}
                        onClick={() => setLocation(`/dashboard/funcao-personalizada/${funcao.id}`)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Abrir
                      </Button>
                      <Button
                        className="h-10 px-4 gap-2 rounded-xl border-gray-200 hover:bg-gray-50"
                        variant="outline"
                        onClick={() => handleShare(funcao)}
                        disabled={generatingToken === funcao.id}
                      >
                        {generatingToken === funcao.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <QrCode className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="hidden sm:inline text-sm">QR Code</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {modalCriarAberto && condominioId && (
        <CriarEditarFuncaoModal
          open={modalCriarAberto}
          onClose={() => {
            setModalCriarAberto(false);
            setFuncaoEditandoId(null);
          }}
          condominioId={condominioId}
          funcaoId={funcaoEditandoId}
          camposDisponiveis={camposDisponiveis ? [...camposDisponiveis] : []}
        />
      )}

      {/* Modal Preview */}
      <PreviewModal
        open={modalPreviewAberto}
        onClose={() => setModalPreviewAberto(false)}
        funcao={funcaoPreview}
        camposDisponiveis={camposDisponiveis ? [...camposDisponiveis] : []}
      />

      {/* Dialog Confirmar Delete */}
      <Dialog open={confirmDeleteId !== null} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Confirmar Exclusão
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 leading-relaxed">
            Tem certeza que deseja excluir esta função? Todos os registros associados serão perdidos. Esta ação não pode ser desfeita.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)} className="rounded-xl">
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              onClick={() => confirmDeleteId && deletarMutation.mutate({ id: confirmDeleteId })}
              disabled={deletarMutation.isPending}
            >
              {deletarMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Excluir Função
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal QR Code / Compartilhar - Premium */}
      <Dialog open={qrModalFuncao !== null} onOpenChange={() => setQrModalFuncao(null)}>
        <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
          {qrModalFuncao && qrModalFuncao.shareToken && (
            <>
              {/* Header com cor da função */}
              <div 
                className="p-6 pb-4 text-white text-center"
                style={{ background: `linear-gradient(135deg, ${qrModalFuncao.cor}, ${qrModalFuncao.cor}cc)` }}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-lg">{qrModalFuncao.nome}</h3>
                <p className="text-white/70 text-sm mt-1">Compartilhe com QR Code</p>
              </div>

              <div className="p-6 space-y-5">
                {/* QR Code centralizado */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
                    <QRCodeSVG 
                      value={getPublicUrl(qrModalFuncao.shareToken)} 
                      size={180}
                      level="M"
                      includeMargin={false}
                      fgColor="#1e293b"
                    />
                  </div>
                </div>

                <p className="text-xs text-center text-gray-400">
                  Escaneie para abrir o formulário de manutenção
                </p>

                {/* Link */}
                <div className="flex items-center gap-2">
                  <Input 
                    value={getPublicUrl(qrModalFuncao.shareToken)} 
                    readOnly 
                    className="text-xs bg-gray-50 rounded-xl border-gray-200 font-mono"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="shrink-0 rounded-xl"
                    onClick={() => handleCopyLink(qrModalFuncao.shareToken)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Botões */}
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 gap-2 rounded-xl h-11 font-semibold" 
                    variant="outline"
                    onClick={() => handleCopyLink(qrModalFuncao.shareToken)}
                  >
                    <Copy className="h-4 w-4" /> Copiar Link
                  </Button>
                  <Button 
                    className="flex-1 gap-2 rounded-xl h-11 font-semibold text-white shadow-md"
                    style={{ 
                      background: `linear-gradient(135deg, ${qrModalFuncao.cor}, ${qrModalFuncao.cor}cc)`,
                      boxShadow: `0 4px 14px ${qrModalFuncao.cor}30`
                    }}
                    onClick={() => handleNativeShare(qrModalFuncao)}
                  >
                    <Share2 className="h-4 w-4" />
                    Enviar
                  </Button>
                </div>

                <div className="flex items-center gap-2 justify-center pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <p className="text-[11px] text-gray-400">
                    Link público — qualquer pessoa pode enviar registros
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ========================================
// MODAL CRIAR/EDITAR FUNÇÃO
// ========================================
function CriarEditarFuncaoModal({
  open,
  onClose,
  condominioId,
  funcaoId,
  camposDisponiveis,
}: {
  open: boolean;
  onClose: () => void;
  condominioId: number;
  funcaoId: number | null;
  camposDisponiveis: CampoDisponivel[];
}) {
  const utils = trpc.useUtils();
  const isEdit = funcaoId !== null;

  // Estado do wizard
  const [step, setStep] = useState(1); // 1: Info  2: Campos  3: Revisão
  
  // Dados da função
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [icone, setIcone] = useState("ClipboardList");
  const [cor, setCor] = useState("#3B82F6");
  const [campos, setCampos] = useState<CampoConfig[]>([]);

  // Carregar dados da função existente
  const { data: funcaoExistente } = trpc.funcoesPersonalizadas.obter.useQuery(
    { id: funcaoId! },
    { enabled: isEdit }
  );

  useEffect(() => {
    if (funcaoExistente) {
      setNome(funcaoExistente.nome);
      setDescricao(funcaoExistente.descricao || "");
      setIcone(funcaoExistente.icone);
      setCor(funcaoExistente.cor);
      
      const ativos = funcaoExistente.camposAtivos as Record<string, boolean>;
      const obrigatorios = funcaoExistente.camposObrigatorios as Record<string, boolean>;
      
      setCampos(
        camposDisponiveis.map(c => ({
          ...c,
          ativo: ativos[c.key] || false,
          obrigatorio: obrigatorios[c.key] || false,
        }))
      );
    } else if (!isEdit && camposDisponiveis.length > 0) {
      // Default: titulo ativo e obrigatório
      setCampos(
        camposDisponiveis.map(c => ({
          ...c,
          ativo: c.key === "titulo",
          obrigatorio: c.key === "titulo",
        }))
      );
    }
  }, [funcaoExistente, camposDisponiveis, isEdit]);

  const criarMutation = trpc.funcoesPersonalizadas.criar.useMutation({
    onSuccess: () => {
      toast.success("Função criada com sucesso!");
      utils.funcoesPersonalizadas.listarTodas.invalidate({ condominioId });
      onClose();
    },
    onError: (err) => toast.error(err.message || "Erro ao criar função"),
  });

  const atualizarMutation = trpc.funcoesPersonalizadas.atualizar.useMutation({
    onSuccess: () => {
      toast.success("Função atualizada com sucesso!");
      utils.funcoesPersonalizadas.listarTodas.invalidate({ condominioId });
      onClose();
    },
    onError: (err) => toast.error(err.message || "Erro ao atualizar função"),
  });

  const camposAtivos = campos.filter(c => c.ativo);
  const isStep1Valid = nome.trim().length > 0;
  const isStep2Valid = camposAtivos.length > 0;

  const handleSalvar = () => {
    const camposAtivosObj: Record<string, boolean> = {};
    const camposObrigatoriosObj: Record<string, boolean> = {};
    
    campos.forEach(c => {
      camposAtivosObj[c.key] = c.ativo;
      camposObrigatoriosObj[c.key] = c.obrigatorio;
    });

    const data = {
      condominioId,
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      icone,
      cor,
      camposAtivos: camposAtivosObj,
      camposObrigatorios: camposObrigatoriosObj,
    };

    if (isEdit && funcaoId) {
      atualizarMutation.mutate({ id: funcaoId, ...data });
    } else {
      criarMutation.mutate(data);
    }
  };

  const isSaving = criarMutation.isPending || atualizarMutation.isPending;
  const SelectedIcon = getIconComponent(icone);

  // Ícone de campo por tipo
  const getCampoIcon = (tipo: string) => {
    switch (tipo) {
      case "texto": return FileText;
      case "textarea": return FileText;
      case "imagens": return ImageIcon;
      case "auto": return Tag;
      case "gps": return Navigation;
      case "select": return ListChecks;
      case "checklist": return ListChecks;
      case "data": return Clock;
      case "moeda": return DollarSign;
      case "arquivos": return Paperclip;
      case "qrcode": return QrCode;
      case "assinatura": return PenTool;
      default: return FileText;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
        {/* Header com steps */}
        <div className="sticky top-0 z-10 bg-white border-b">
          <DialogHeader className="p-5 pb-3">
            <DialogTitle className="flex items-center gap-3 text-lg">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20">
                {isEdit ? (
                  <Edit className="h-5 w-5 text-white" />
                ) : (
                  <Plus className="h-5 w-5 text-white" />
                )}
              </div>
              {isEdit ? "Editar Função" : "Nova Função Personalizada"}
            </DialogTitle>
          </DialogHeader>
          
          {/* Premium steps indicator */}
          <div className="px-5 pb-4">
            <div className="flex items-center gap-1">
              {[
                { num: 1, label: "Identificação", icon: Palette },
                { num: 2, label: "Campos", icon: ListChecks },
                { num: 3, label: "Revisão", icon: CheckCircle2 },
              ].map((s, i) => {
                const StepIcon = s.icon;
                return (
                <div key={s.num} className="flex items-center gap-1 flex-1">
                  <button
                    onClick={() => {
                      if (s.num === 1 || (s.num === 2 && isStep1Valid) || (s.num === 3 && isStep1Valid && isStep2Valid)) {
                        setStep(s.num);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-2 text-xs font-semibold transition-all rounded-lg px-2 py-1.5",
                      step === s.num ? "text-orange-600 bg-orange-50" : step > s.num ? "text-green-600" : "text-gray-400"
                    )}
                  >
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all",
                      step === s.num ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20" :
                      step > s.num ? "bg-green-500 text-white" :
                      "bg-gray-100 text-gray-400"
                    )}>
                      {step > s.num ? <Check className="h-3.5 w-3.5" /> : <StepIcon className="h-3.5 w-3.5" />}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < 2 && (
                    <div className={cn(
                      "flex-1 h-0.5 rounded-full mx-1",
                      step > s.num ? "bg-green-500" : "bg-gray-100"
                    )} />
                  )}
                </div>
              )})}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* ============ STEP 1: Identificação ============ */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Preview Card Premium */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gray-50 to-gray-50/50 border border-gray-100">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ 
                    background: `linear-gradient(135deg, ${cor}, ${cor}cc)`,
                    boxShadow: `0 8px 24px ${cor}25`
                  }}
                >
                  <SelectedIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">
                    {nome || "Nome da Função"}
                  </p>
                  <p className="text-sm text-gray-400">
                    {descricao || "Descrição opcional"}
                  </p>
                </div>
              </div>

              {/* Nome */}
              <div>
                <Label className="text-sm font-medium">Nome da Função *</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Inspeção de Elevadores"
                  className="mt-1"
                  autoFocus
                />
              </div>

              {/* Descrição */}
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <Textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Breve descrição do que esta função faz..."
                  className="mt-1 resize-none"
                  rows={2}
                />
              </div>

              {/* Ícone */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Ícone</Label>
                <div className="grid grid-cols-6 gap-2 mt-2.5">
                  {ICONES_DISPONIVEIS.map(({ key, icon: Ic, label }) => (
                    <button
                      key={key}
                      onClick={() => setIcone(key)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all duration-200",
                        icone === key 
                          ? "border-orange-400 bg-orange-50 ring-2 ring-orange-400/20 scale-105" 
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                      )}
                      title={label}
                    >
                      <Ic className="h-5 w-5" style={{ color: icone === key ? cor : "#9CA3AF" }} />
                      <span className="text-[10px] font-medium text-gray-400 leading-none">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor */}
              <div>
                <Label className="text-sm font-semibold text-gray-700">Cor</Label>
                <div className="grid grid-cols-6 gap-2.5 mt-2.5">
                  {CORES_DISPONIVEIS.map(({ hex, label }) => (
                    <button
                      key={hex}
                      onClick={() => setCor(hex)}
                      className={cn(
                        "relative w-full aspect-square rounded-xl transition-all duration-200",
                        cor === hex 
                          ? "ring-3 ring-offset-2 scale-110 shadow-lg" 
                          : "hover:scale-105 hover:shadow-md"
                      )}
                      style={{ 
                        backgroundColor: hex,
                        boxShadow: cor === hex ? `0 4px 14px ${hex}40, 0 0 0 3px ${hex}40` : undefined
                      }}
                      title={label}
                    >
                      {cor === hex && (
                        <Check className="h-4 w-4 text-white absolute inset-0 m-auto drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============ STEP 2: Campos ============ */}
          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Selecione os campos que aparecerão no formulário
                </p>
                <Badge variant="outline">
                  {camposAtivos.length} selecionados
                </Badge>
              </div>

              <div className="space-y-2">
                {campos.map((campo, idx) => {
                  const CampoIcon = getCampoIcon(campo.tipo);
                  return (
                    <div
                      key={campo.key}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                        campo.ativo 
                          ? "border-orange-200 bg-orange-50/50" 
                          : "border-gray-200 bg-white"
                      )}
                    >
                      {/* Toggle ativo */}
                      <Switch
                        checked={campo.ativo}
                        onCheckedChange={(checked) => {
                          const updated = [...campos];
                          updated[idx] = { ...campo, ativo: checked, obrigatorio: checked ? campo.obrigatorio : false };
                          setCampos(updated);
                        }}
                      />
                      
                      {/* Ícone */}
                      <CampoIcon className={cn(
                        "h-4 w-4 shrink-0",
                        campo.ativo ? "text-orange-500" : "text-gray-400"
                      )} />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          campo.ativo ? "text-gray-900" : "text-gray-500"
                        )}>
                          {campo.label}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{campo.descricao}</p>
                      </div>

                      {/* Obrigatório */}
                      {campo.ativo && (
                        <button
                          onClick={() => {
                            const updated = [...campos];
                            updated[idx] = { ...campo, obrigatorio: !campo.obrigatorio };
                            setCampos(updated);
                          }}
                          className={cn(
                            "text-xs px-2 py-1 rounded-md border transition-colors whitespace-nowrap",
                            campo.obrigatorio 
                              ? "border-red-200 bg-red-50 text-red-600" 
                              : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
                          )}
                        >
                          {campo.obrigatorio ? "Obrigatório" : "Opcional"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ STEP 3: Revisão ============ */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Preview Card Premium */}
              <div className="overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                <div className="h-2" style={{ background: `linear-gradient(90deg, ${cor}, ${cor}88)` }} />
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-5">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ 
                        background: `linear-gradient(135deg, ${cor}, ${cor}cc)`,
                        boxShadow: `0 8px 24px ${cor}25`
                      }}
                    >
                      <SelectedIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{nome}</h3>
                      {descricao && <p className="text-sm text-gray-500">{descricao}</p>}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Campos do formulário ({camposAtivos.length})
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {camposAtivos.map((campo) => {
                        const CampoIcon = getCampoIcon(campo.tipo);
                        return (
                          <div key={campo.key} className="flex items-center gap-2.5 text-sm p-2 rounded-lg bg-gray-50">
                            <CampoIcon className="h-4 w-4 text-gray-400 shrink-0" />
                            <span className="text-gray-700 font-medium">{campo.label}</span>
                            {campo.obrigatorio && (
                              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md ml-auto">
                                Obrigatório
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumo premium */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-900 mb-0.5">Tudo pronto!</p>
                    <p className="text-sm text-blue-700/70">
                      Função "<strong>{nome}</strong>" com {camposAtivos.length} campos
                      ({camposAtivos.filter(c => c.obrigatorio).length} obrigatórios). 
                      Aparecerá no menu Funções Personalizadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer com navegação premium */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t p-4 flex items-center justify-between">
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => step === 1 ? onClose() : setStep(step - 1)}
          >
            {step === 1 ? "Cancelar" : (
              <>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Voltar
              </>
            )}
          </Button>

          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md shadow-orange-500/20 font-semibold"
            >
              Próximo
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSalvar}
              disabled={isSaving}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl shadow-md shadow-green-500/20 font-semibold"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {isEdit ? "Salvar Alterações" : "Criar Função"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ========================================
// MODAL DE PREVIEW
// ========================================
function PreviewModal({
  open,
  onClose,
  funcao,
  camposDisponiveis,
}: {
  open: boolean;
  onClose: () => void;
  funcao: any;
  camposDisponiveis: CampoDisponivel[];
}) {
  if (!funcao) return null;
  
  const Icon = getIconComponent(funcao.icone);
  const camposAtivos = funcao.camposAtivos as Record<string, boolean>;
  const camposObrigatorios = funcao.camposObrigatorios as Record<string, boolean>;
  const camposFiltrados = camposDisponiveis.filter(c => camposAtivos[c.key]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-0 rounded-2xl">
        {/* Header simulando a execução - Premium */}
        <div 
          className="p-5 text-white relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${funcao.cor}, ${funcao.cor}bb)` }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjZykiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-50" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{funcao.nome}</h2>
              {funcao.descricao && (
                <p className="text-white/70 text-sm mt-0.5">{funcao.descricao}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Preview do Formulário
          </p>

          {camposFiltrados.map((campo) => {
            const isRequired = camposObrigatorios[campo.key];
            
            return (
              <div key={campo.key} className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  {campo.label}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {/* Simular tipo de campo */}
                {campo.tipo === "textarea" ? (
                  <div className="h-16 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50" />
                ) : campo.tipo === "imagens" ? (
                  <div className="flex gap-2">
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-gray-300" />
                    </div>
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                      <Plus className="h-6 w-6 text-gray-300" />
                    </div>
                  </div>
                ) : campo.tipo === "checklist" ? (
                  <div className="space-y-1.5">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border-2 border-gray-300" />
                        <div className="h-3 bg-gray-200 rounded flex-1" />
                      </div>
                    ))}
                  </div>
                ) : campo.tipo === "assinatura" ? (
                  <div className="h-20 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                    <PenTool className="h-6 w-6 text-gray-300" />
                  </div>
                ) : (
                  <div className="h-10 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50" />
                )}
              </div>
            );
          })}

          {camposFiltrados.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-8">
              Nenhum campo selecionado
            </p>
          )}
        </div>

        <div className="p-5 border-t">
          <Button onClick={onClose} className="w-full rounded-xl h-11" variant="outline">
            Fechar Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
