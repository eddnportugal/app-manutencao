import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { FunctionTutorialButton } from "@/components/FunctionTutorial";
import { IndiceFuncoesButton } from "@/components/IndiceFuncoesButton";
import { TarefasSimplesModal } from "@/components/TarefasSimplesModal";
import { FieldSettingsButton } from "@/components/FieldSettingsModal";
import { LocationMiniMap } from "@/components/LocationMiniMap";
import { ShareModal } from "@/components/ShareModal";
import { CompartilharComEquipe } from "@/components/CompartilharComEquipe";
import { useFieldSettings } from "@/hooks/useFieldSettings";
import { AssinaturaDigitalSection } from "@/components/AssinaturaDigitalSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  FileText, 
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  Printer,
  MapPin,
  ExternalLink,
  User,
  Calendar,
  Flag,
  AlignLeft,
  Image,
  CheckSquare,
  Navigation,
  Tag,
  X
} from "lucide-react";
// pdfGenerator loaded dynamically for code-splitting
const loadPdfGenerator = () => import("@/lib/pdfGenerator");
import { ProtocolCard, StatsCards } from "@/components/ProtocolCard";
import { Timeline, StatusBadge } from "@/components/Timeline";
import MultiImageUpload, { ImageItem } from "@/components/MultiImageUpload";
import InputWithSave from "@/components/InputWithSave";
import ImageEditSection from "@/components/ImageEditSection";
import { ReportFiltersPanel, useReportFilters, applyFilters } from "@/components/ReportFiltersPanel";
import { ReportGeneratorModal, ReportConfig, generateReportHTML, printReport } from "@/components/ReportGeneratorModal";
import {
  FormModalHeader,
  FormSection,
  FormFieldGroup,
  StyledLabel,
  FormActions,
  GradientButton,
} from "@/components/ui/form-modal";
import QRCodeSection from "@/components/QRCodeSection";
import AnexosSection, { Anexo } from "@/components/AnexosSection";
import CustoFields from "@/components/CustoFields";
import PrazoConclusaoField from "@/components/PrazoConclusaoField";
import NivelUrgenciaSelect from "@/components/NivelUrgenciaSelect";
import { QrCode, Paperclip, DollarSign as DollarIcon, CalendarClock, AlertTriangle as UrgencyIcon } from "lucide-react";

interface OcorrenciasPageProps {
  condominioId: number;
}

const categoriaLabels: Record<string, string> = {
  seguranca: "Segurança",
  barulho: "Barulho",
  manutencao: "Manutenção",
  convivencia: "Convivência",
  animais: "Animais",
  estacionamento: "Estacionamento",
  limpeza: "Limpeza",
  outros: "Outros",
};

export default function OcorrenciasPage({ condominioId }: OcorrenciasPageProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showOcorrenciaRapida, setShowOcorrenciaRapida] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareEquipeModal, setShowShareEquipeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<any>(null);
  const [searchProtocolo, setSearchProtocolo] = useState("");
  const { filters, setFilters } = useReportFilters();
  const [newComment, setNewComment] = useState("");
  const [assinaturaTecnico, setAssinaturaTecnico] = useState("");
  const [assinaturaSolicitante, setAssinaturaSolicitante] = useState("");
  
  // Hook para verificar campos habilitados
  const { isFieldEnabled } = useFieldSettings({
    condominioId,
    modalType: "completa",
    functionType: "ocorrencia",
  });
  
  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    descricao: "",
    observacoes: "",
    reportadoPorNome: "",
    responsavelNome: "",
    localizacao: "",
    dataOcorrencia: "",
    prioridade: "media" as "baixa" | "media" | "alta" | "urgente",
    categoria: "outros" as "seguranca" | "barulho" | "manutencao" | "convivencia" | "animais" | "estacionamento" | "limpeza" | "outros",
    geoLatitude: "",
    geoLongitude: "",
    geoEndereco: "",
    // Novos campos
    qrCode: "",
    custoEstimado: "",
    custoReal: "",
    prazoConclusao: "",
    nivelUrgencia: "normal" as "baixa" | "normal" | "alta" | "urgente" | "critica",
    tipo: "",
  });
  const [imagens, setImagens] = useState<string[]>([]);
  const [imagensComLegendas, setImagensComLegendas] = useState<ImageItem[]>([]);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [capturandoGeo, setCapturandoGeo] = useState(false);

  const utils = trpc.useUtils();
  
  // Buscar dados da organização para obter o logo
  const { data: condominio } = trpc.condominio.get.useQuery(
    { id: condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: ocorrencias = [], isLoading } = trpc.ocorrencia.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: stats } = trpc.ocorrencia.getStats.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: searchResults = [] } = trpc.ocorrencia.searchByProtocolo.useQuery(
    { protocolo: searchProtocolo, condominioId },
    { enabled: !!searchProtocolo && searchProtocolo.length >= 3 }
  );
  
  const { data: timeline = [] } = trpc.ocorrencia.getTimeline.useQuery(
    { ocorrenciaId: selectedOcorrencia?.id },
    { enabled: !!selectedOcorrencia?.id }
  );
  
  const { data: ocorrenciaImagens = [] } = trpc.ocorrencia.getImagens.useQuery(
    { ocorrenciaId: selectedOcorrencia?.id },
    { enabled: !!selectedOcorrencia?.id }
  );

  const { data: ocorrenciaAnexos = [] } = trpc.ocorrencia.getAnexos.useQuery(
    { ocorrenciaId: selectedOcorrencia?.id },
    { enabled: !!selectedOcorrencia?.id }
  );

  const createMutation = trpc.ocorrencia.create.useMutation({
    onSuccess: async (result) => {
      for (const img of imagensComLegendas) {
        await addImagemMutation.mutateAsync({ 
          ocorrenciaId: result.id, 
          url: img.url,
          legenda: img.legenda || undefined
        });
      }
      // Salvar anexos (PDF, documentos)
      for (const anexo of anexos) {
        await addAnexoMutation.mutateAsync({
          ocorrenciaId: result.id,
          nome: anexo.nome,
          url: anexo.url,
          tipo: anexo.tipo,
          tamanho: anexo.tamanho,
        });
      }
      toast.success(`Ocorrência registrada! Protocolo: ${result.protocolo}`);
      setShowDialog(false);
      resetForm();
      utils.ocorrencia.list.invalidate();
      utils.ocorrencia.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao registrar ocorrência"),
  });

  const updateMutation = trpc.ocorrencia.update.useMutation({
    onSuccess: () => {
      toast.success("Ocorrência atualizada!");
      utils.ocorrencia.list.invalidate();
      utils.ocorrencia.getStats.invalidate();
      utils.ocorrencia.getTimeline.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar ocorrência"),
  });

  const deleteMutation = trpc.ocorrencia.delete.useMutation({
    onSuccess: () => {
      toast.success("Ocorrência excluída!");
      setShowDetailDialog(false);
      setSelectedOcorrencia(null);
      utils.ocorrencia.list.invalidate();
      utils.ocorrencia.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao excluir ocorrência"),
  });

  const addImagemMutation = trpc.ocorrencia.addImagem.useMutation({
    onSuccess: () => {
      utils.ocorrencia.getImagens.invalidate();
      utils.ocorrencia.getTimeline.invalidate();
    },
  });

  const addAnexoMutation = trpc.ocorrencia.addAnexo.useMutation({
    onSuccess: () => {
      utils.ocorrencia.getAnexos.invalidate();
    },
  });

  const removeAnexoMutation = trpc.ocorrencia.removeAnexo.useMutation({
    onSuccess: () => {
      utils.ocorrencia.getAnexos.invalidate();
      toast.success("Anexo removido!");
    },
  });

  const addTimelineEventMutation = trpc.ocorrencia.addTimelineEvent.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.ocorrencia.getTimeline.invalidate();
      toast.success("Comentário adicionado!");
    },
  });

  // Captura automática de localização ao abrir o dialog
  useEffect(() => {
    if (showDialog && !formData.geoLatitude) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            let endereco = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            try {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                { headers: { 'Accept-Language': 'pt-BR' } }
              );
              if (response.ok) {
                const data = await response.json();
                if (data.display_name) endereco = data.display_name;
              }
            } catch (e) { console.log("Erro ao obter endereço"); }
            setFormData(prev => ({ ...prev, geoLatitude: latitude.toString(), geoLongitude: longitude.toString(), geoEndereco: endereco }));
            toast.success("Localização capturada automaticamente!");
          },
          () => { console.log("Captura automática falhou"); },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
  }, [showDialog]);

  const resetForm = () => {
    setFormData({
      titulo: "",
      subtitulo: "",
      descricao: "",
      observacoes: "",
      reportadoPorNome: "",
      responsavelNome: "",
      localizacao: "",
      dataOcorrencia: "",
      prioridade: "media",
      categoria: "outros",
      geoLatitude: "",
      geoLongitude: "",
      geoEndereco: "",
      // Reset novos campos
      qrCode: "",
      custoEstimado: "",
      custoReal: "",
      prazoConclusao: "",
      nivelUrgencia: "normal",
      tipo: "",
    });([]);
    setImagensComLegendas([]);
    setAnexos([]);
  };

  const capturarGeolocalizacao = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada pelo navegador");
      return;
    }
    setCapturandoGeo(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          geoLatitude: latitude.toString(),
          geoLongitude: longitude.toString(),
        }));
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          if (data.display_name) {
            setFormData(prev => ({ ...prev, geoEndereco: data.display_name }));
          }
        } catch (e) {
          console.log("Erro ao obter endereço:", e);
        }
        setCapturandoGeo(false);
        toast.success("Localização capturada!");
      },
      (error) => {
        setCapturandoGeo(false);
        toast.error("Erro ao capturar localização: " + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  const abrirMapa = (lat: string, lng: string) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const handleSubmit = () => {
    if (!formData.titulo) {
      toast.error("Título é obrigatório");
      return;
    }
    createMutation.mutate({ ...formData, condominioId, assinaturaTecnico, assinaturaSolicitante });
  };

  const handleStatusChange = (ocorrenciaId: number, newStatus: string) => {
    updateMutation.mutate({ id: ocorrenciaId, status: newStatus as any });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedOcorrencia) return;
    addTimelineEventMutation.mutate({
      ocorrenciaId: selectedOcorrencia.id,
      tipo: "comentario",
      descricao: newComment,
    });
  };

  const handleAddImage = async (url: string) => {
    if (!selectedOcorrencia) return;
    await addImagemMutation.mutateAsync({
      ocorrenciaId: selectedOcorrencia.id,
      url,
    });
  };

  const filteredOcorrencias = searchProtocolo.length >= 3 
    ? searchResults 
    : applyFilters(ocorrencias, filters, {
        searchFields: ["protocolo", "titulo", "descricao"],
        statusField: "status",
        responsavelField: "reportadoPorNome",
        prioridadeField: "prioridade",
        dateField: "createdAt",
      });

  const handleGeneratePDF = async () => {
    if (selectedOcorrencia) {
      const { generateOcorrenciaReport } = await loadPdfGenerator();
      await generateOcorrenciaReport(selectedOcorrencia, timeline, ocorrenciaImagens, {
        logoUrl: condominio?.logoUrl || '',
        companyName: condominio?.nome || '',
      });
    } else {
      toast.info("Selecione uma ocorrência para gerar o PDF");
    }
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  // Gerar relatório com configurações
  const generateReportWithConfig = (config: ReportConfig) => {
    const logoUrl = condominio?.logoUrl ? condominio.logoUrl : undefined;
    const html = generateReportHTML(filteredOcorrencias, config, logoUrl);
    printReport(html);
    setShowReportModal(false);
  };

  // Lista de responsáveis únicos (reportadoPorNome)
  const responsaveisUnicos = ocorrencias
    .map(o => o.reportadoPorNome)
    .filter((r): r is string => !!r && r.trim() !== "");

  // Campos disponíveis para relatório
  const availableFields = [
    { key: "protocolo", label: "Protocolo", included: true },
    { key: "titulo", label: "Título", included: true },
    { key: "status", label: "Status", included: true },
    { key: "categoria", label: "Categoria", included: true },
    { key: "reportadoPorNome", label: "Reportado por", included: true },
    { key: "localizacao", label: "Localização", included: true },
    { key: "prioridade", label: "Prioridade", included: true },
    { key: "dataOcorrencia", label: "Data Ocorrência", included: true },
    { key: "descricao", label: "Descrição", included: false },
    { key: "createdAt", label: "Data Criação", included: true },
  ];

  return (
    <div className="space-y-5 pb-32">
      {/* Header Premium */}
      <div data-tour="header-ocorrencias" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-5 shadow-xl">
        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Ocorrências</h2>
              <p className="text-white/70 text-sm">Registre e acompanhe ocorrências da organização</p>
            </div>
            <div className="flex items-center gap-2">
              <IndiceFuncoesButton />
              <FunctionTutorialButton tutorialId="ocorrencias" />
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleGeneratePDF}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <Download className="h-4 w-4 mr-1.5" />
              PDF
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleGenerateReport}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Relatório
            </Button>
            <Button 
              data-tour="btn-nova-ocorrencia"
              size="sm" 
              onClick={() => setShowDialog(true)} 
              className="bg-white text-red-700 hover:bg-white/90 font-semibold shadow-lg"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Nova Ocorrência
            </Button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div data-tour="stats-cards">
        {stats && <StatsCards stats={stats} />}
      </div>

      {/* Filtros Avançados */}
      <div data-tour="filtros">
      <ReportFiltersPanel
        filters={filters}
        onFiltersChange={setFilters}
        statusOptions={[
          { value: "todos", label: "Todos" },
          { value: "pendente", label: "Pendente" },
          { value: "realizada", label: "Realizada" },
          { value: "acao_necessaria", label: "Ação Necessária" },
          { value: "finalizada", label: "Finalizada" },
          { value: "reaberta", label: "Reaberta" },
        ]}
        responsaveis={responsaveisUnicos}
        showPrioridade={true}
        searchPlaceholder="Buscar por protocolo ou título..."
        onGenerateReport={handleGenerateReport}
        totalResults={ocorrencias.length}
        filteredResults={filteredOcorrencias.length}
      />
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-red-500" />
          <p className="text-sm text-slate-500 mt-2">Carregando ocorrências...</p>
        </div>
      ) : filteredOcorrencias.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center border border-slate-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-50" />
          <AlertTriangle className="h-16 w-16 mx-auto text-red-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma ocorrência registrada</h3>
          <p className="text-slate-500 mb-4">Comece registrando sua primeira ocorrência</p>
          <Button 
            onClick={() => setShowDialog(true)}
            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-1" />
            Registrar primeira ocorrência
          </Button>
        </div>
      ) : (
        <div data-tour="lista-itens" className="grid gap-3">
          {filteredOcorrencias.map((ocorrencia) => (
            <ProtocolCard
              key={ocorrencia.id}
              protocolo={ocorrencia.protocolo}
              titulo={ocorrencia.titulo}
              subtitulo={ocorrencia.subtitulo}
              descricao={ocorrencia.descricao}
              observacoes={ocorrencia.observacoes}
              status={ocorrencia.status}
              prioridade={ocorrencia.prioridade}
              responsavelNome={ocorrencia.responsavelNome}
              localizacao={ocorrencia.localizacao}
              createdAt={ocorrencia.createdAt}
              categoria={ocorrencia.categoria ? categoriaLabels[ocorrencia.categoria] : undefined}
              onView={() => {
                setSelectedOcorrencia(ocorrencia);
                setShowDetailDialog(true);
              }}
              onEdit={() => {
                setSelectedOcorrencia(ocorrencia);
                setShowDetailDialog(true);
              }}
              onDelete={() => {
                if (confirm("Tem certeza que deseja excluir esta ocorrência?")) {
                  deleteMutation.mutate({ id: ocorrencia.id });
                }
              }}
              onShare={() => {
                setSelectedOcorrencia(ocorrencia);
                setShowShareModal(true);
              }}
              onShareEquipe={() => {
                setSelectedOcorrencia(ocorrencia);
                setShowShareEquipeModal(true);
              }}
              onPdf={async () => {
                const imagens = await utils.ocorrencia.getImagens.fetch({ ocorrenciaId: ocorrencia.id });
                const { generateOcorrenciaReport } = await loadPdfGenerator();
                await generateOcorrenciaReport(ocorrencia, [], imagens || [], {
                  logoUrl: condominio?.logoUrl || '',
                  companyName: condominio?.nome || '',
                });
              }}
              extra={
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Alterar Status:</Label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(ocorrencia.id, s)}
                        disabled={updateMutation.isPending}
                        className="cursor-pointer disabled:opacity-50 transition-transform hover:scale-105 active:scale-95"
                      >
                        <StatusBadge status={s} size="xs" />
                      </button>
                    ))}
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Dialog Nova Ocorrência */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Nova Ocorrência</DialogTitle>
          </DialogHeader>
          {/* Header Premium */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-3 sm:px-6 py-4">
            <FormModalHeader
              icon={AlertTriangle}
              iconColor="text-red-600"
              iconBgColor="bg-gradient-to-br from-red-100 to-rose-100"
              title="Nova Ocorrência"
              subtitle="Registre uma nova ocorrência na organização"
            />
          </div>

          <div className="px-3 sm:px-6 py-5 space-y-5 overflow-x-hidden">
            {/* Botão de Configuração de Campos */}
            <div className="flex justify-end">
              <FieldSettingsButton
                condominioId={condominioId}
                modalType="completa"
                functionType="ocorrencia"
                variant="full"
              />
            </div>

            {/* Seção: Informações Básicas */}
            <FormSection title="Informações Básicas" icon={FileText} iconColor="text-blue-500">
              <FormFieldGroup columns={1}>
                <InputWithSave
                  label="Título *"
                  value={formData.titulo}
                  onChange={(v) => setFormData({ ...formData, titulo: v })}
                  condominioId={condominioId}
                  tipo="titulo_ocorrencia"
                  placeholder="Ex: Barulho excessivo no Bloco B"
                />
                {isFieldEnabled("subtitulo") && (
                <InputWithSave
                  label="Subtítulo"
                  value={formData.subtitulo}
                  onChange={(v) => setFormData({ ...formData, subtitulo: v })}
                  condominioId={condominioId}
                  tipo="subtitulo_ocorrencia"
                  placeholder="Descrição breve da ocorrência"
                />
                )}
              </FormFieldGroup>
            </FormSection>

            {/* Seção: Classificação */}
            {(isFieldEnabled("tipo") || isFieldEnabled("categoria") || isFieldEnabled("prioridade")) && (
            <FormSection title="Classificação" icon={Tag} iconColor="text-amber-500" variant="subtle">
              <FormFieldGroup columns={2}>
                {isFieldEnabled("tipo") && (
                <div>
                  <StyledLabel icon={Tag}>Tipo de Ocorrência</StyledLabel>
                  <Select
                    value={formData.tipo || ""}
                    onValueChange={(v) => setFormData({ ...formData, tipo: v })}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incidente">Incidente</SelectItem>
                      <SelectItem value="reclamacao">Reclamação</SelectItem>
                      <SelectItem value="sugestao">Sugestão</SelectItem>
                      <SelectItem value="denuncia">Denúncia</SelectItem>
                      <SelectItem value="solicitacao">Solicitação</SelectItem>
                      <SelectItem value="emergencia">Emergência</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                )}
                {isFieldEnabled("categoria") && (
                <div>
                  <StyledLabel icon={Tag}>Categoria</StyledLabel>
                  <Select
                    value={formData.categoria}
                    onValueChange={(v) => setFormData({ ...formData, categoria: v as any })}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seguranca">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Segurança
                        </div>
                      </SelectItem>
                      <SelectItem value="barulho">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          Barulho
                        </div>
                      </SelectItem>
                      <SelectItem value="manutencao">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          Manutenção
                        </div>
                      </SelectItem>
                      <SelectItem value="convivencia">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Convivência
                        </div>
                      </SelectItem>
                      <SelectItem value="animais">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Animais
                        </div>
                      </SelectItem>
                      <SelectItem value="estacionamento">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                          Estacionamento
                        </div>
                      </SelectItem>
                      <SelectItem value="limpeza">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                          Limpeza
                        </div>
                      </SelectItem>
                      <SelectItem value="outros">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          Outros
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                )}
                {isFieldEnabled("prioridade") && (
                <div>
                  <StyledLabel icon={Flag}>Prioridade</StyledLabel>
                  <Select
                    value={formData.prioridade}
                    onValueChange={(v) => setFormData({ ...formData, prioridade: v as any })}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          Baixa
                        </div>
                      </SelectItem>
                      <SelectItem value="media">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Média
                        </div>
                      </SelectItem>
                      <SelectItem value="alta">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Alta
                        </div>
                      </SelectItem>
                      <SelectItem value="urgente">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Urgente
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                )}
              </FormFieldGroup>
            </FormSection>
            )}

            {/* Seção: Envolvidos */}
            {isFieldEnabled("responsavel") && (
            <FormSection title="Envolvidos" icon={User} iconColor="text-violet-500">
              <FormFieldGroup columns={2}>
                <div>
                  <StyledLabel icon={User}>Reportado por</StyledLabel>
                  <Input
                    value={formData.reportadoPorNome}
                    onChange={(e) => setFormData({ ...formData, reportadoPorNome: e.target.value })}
                    placeholder="Nome de quem reportou"
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <InputWithSave
                  label="Responsável pelo atendimento"
                  value={formData.responsavelNome}
                  onChange={(v) => setFormData({ ...formData, responsavelNome: v })}
                  condominioId={condominioId}
                  tipo="responsavel"
                  placeholder="Nome do responsável"
                />
              </FormFieldGroup>
            </FormSection>
            )}

            {/* Seção: Local e Data */}
            {(isFieldEnabled("localizacao_texto") || isFieldEnabled("data_agendada")) && (
            <FormSection title="Local e Data" icon={Calendar} iconColor="text-rose-500" variant="subtle">
              <FormFieldGroup columns={2}>
                {isFieldEnabled("localizacao_texto") && (
                <InputWithSave
                  label="Localização"
                  value={formData.localizacao}
                  onChange={(v) => setFormData({ ...formData, localizacao: v })}
                  condominioId={condominioId}
                  tipo="localizacao"
                  placeholder="Ex: Bloco B - Apto 302"
                />
                )}
                {isFieldEnabled("data_agendada") && (
                <div>
                  <StyledLabel icon={Calendar}>Data da Ocorrência</StyledLabel>
                  <Input
                    type="datetime-local"
                    value={formData.dataOcorrencia}
                    onChange={(e) => setFormData({ ...formData, dataOcorrencia: e.target.value })}
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                )}
              </FormFieldGroup>
            </FormSection>
            )}

            {/* Seção: Detalhes */}
            {(isFieldEnabled("descricao") || isFieldEnabled("observacoes")) && (
            <FormSection title="Detalhes" icon={AlignLeft} iconColor="text-gray-500">
              <div className="space-y-4">
                {isFieldEnabled("descricao") && (
                <InputWithSave
                  label="Descrição"
                  value={formData.descricao}
                  onChange={(v) => setFormData({ ...formData, descricao: v })}
                  condominioId={condominioId}
                  tipo="descricao_ocorrencia"
                  placeholder="Descreva a ocorrência em detalhes..."
                  multiline
                  rows={3}
                />
                )}
                {isFieldEnabled("observacoes") && (
                <InputWithSave
                  label="Observações"
                  value={formData.observacoes}
                  onChange={(v) => setFormData({ ...formData, observacoes: v })}
                  condominioId={condominioId}
                  tipo="observacoes_ocorrencia"
                  placeholder="Observações adicionais..."
                  multiline
                  rows={2}
                />
                )}
              </div>
            </FormSection>
            )}

            {/* Seção: Imagens */}
            {isFieldEnabled("imagens") && (
            <FormSection title="Imagens/Evidências" icon={Image} iconColor="text-pink-500">
              <MultiImageUpload
                value={imagens}
                onChange={setImagens}
                onChangeWithLegendas={setImagensComLegendas}
                maxImages={10}
                showLegendas={true}
              />
              
              {/* Seção dedicada para edição de imagens */}
              {isFieldEnabled("edicao_imagem") && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <ImageEditSection
                  label="Editar Imagem com Anotações"
                  logoUrl={condominio?.logoUrl || undefined}
                  onSaveEditedImage={(editedImage) => {
                    setImagens(prev => [...prev, editedImage]);
                    setImagensComLegendas(prev => [...prev, { url: editedImage, legenda: '' }]);
                    toast.success("Imagem editada adicionada à galeria!");
                  }}
                />
              </div>
              )}
            </FormSection>
            )}

            {/* Seção: Custos */}
            {(isFieldEnabled("custo_estimado") || isFieldEnabled("custo_real")) && (
            <FormSection title="Custos" icon={DollarIcon} iconColor="text-emerald-500" variant="subtle">
              <CustoFields
                custoEstimado={formData.custoEstimado}
                custoReal={formData.custoReal}
                onCustoEstimadoChange={(v) => setFormData({ ...formData, custoEstimado: v })}
                onCustoRealChange={(v) => setFormData({ ...formData, custoReal: v })}
                showEstimado={isFieldEnabled("custo_estimado")}
                showReal={isFieldEnabled("custo_real")}
              />
            </FormSection>
            )}

            {/* Seção: Prazo e Urgência */}
            {(isFieldEnabled("prazo_conclusao") || isFieldEnabled("nivel_urgencia")) && (
            <FormSection title="Prazo e Urgência" icon={CalendarClock} iconColor="text-rose-500">
              <div className="space-y-4">
                {isFieldEnabled("prazo_conclusao") && (
                  <PrazoConclusaoField
                    value={formData.prazoConclusao}
                    onChange={(v) => setFormData({ ...formData, prazoConclusao: v })}
                  />
                )}
                {isFieldEnabled("nivel_urgencia") && (
                  <NivelUrgenciaSelect
                    value={formData.nivelUrgencia}
                    onChange={(v) => setFormData({ ...formData, nivelUrgencia: v })}
                  />
                )}
              </div>
            </FormSection>
            )}

            {/* Seção: QR Code e Anexos */}
            {(isFieldEnabled("qrcode") || isFieldEnabled("anexos")) && (
            <FormSection title="QR Code e Anexos" icon={QrCode} iconColor="text-indigo-500" variant="subtle">
              <div className="space-y-6">
                {isFieldEnabled("qrcode") && (
                  <QRCodeSection
                    value={formData.qrCode}
                    onChange={(v) => setFormData({ ...formData, qrCode: v })}
                    label="QR Code / Código de Barras"
                  />
                )}
                {isFieldEnabled("anexos") && (
                  <AnexosSection
                    value={anexos}
                    onChange={setAnexos}
                    maxFiles={10}
                    label="Anexos (PDF, Documentos)"
                  />
                )}
              </div>
            </FormSection>
            )}

            {/* Seção: Geolocalização */}
            {isFieldEnabled("geolocalizacao") && (
            <FormSection title="Localização GPS" icon={MapPin} iconColor="text-emerald-500" variant="highlight">
              <div className="flex gap-3 items-center">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={capturarGeolocalizacao}
                  disabled={capturandoGeo}
                  className="border-gray-200 hover:bg-gray-50"
                >
                  {capturandoGeo ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
                  )}
                  {capturandoGeo ? "Capturando..." : "Capturar Localização"}
                </Button>
                
                {formData.geoLatitude && formData.geoLongitude && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => abrirMapa(formData.geoLatitude, formData.geoLongitude)}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2 text-blue-500" />
                    Ver no Mapa
                  </Button>
                )}
              </div>

              {formData.geoLatitude && formData.geoLongitude && (
                <LocationMiniMap
                  latitude={formData.geoLatitude}
                  longitude={formData.geoLongitude}
                  endereco={formData.geoEndereco}
                  height={180}
                />
              )}
            </FormSection>
            )}

            {/* Assinatura Digital */}
            {isFieldEnabled("assinatura_digital") && (
            <AssinaturaDigitalSection
              assinaturaTecnico={assinaturaTecnico}
              setAssinaturaTecnico={setAssinaturaTecnico}
              assinaturaSolicitante={assinaturaSolicitante}
              setAssinaturaSolicitante={setAssinaturaSolicitante}
            />
            )}
          </div>

          {/* Footer Premium */}
          <div className="bg-white border-t border-gray-100 px-6 py-4 mt-4">
            <FormActions>
              <Button 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                className="px-5 h-11 border-gray-200 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <GradientButton 
                onClick={handleSubmit} 
                disabled={createMutation.isPending}
                variant="danger"
                size="lg"
                icon={CheckSquare}
                loading={createMutation.isPending}
              >
                {createMutation.isPending ? "Registrando..." : "Registrar Ocorrência"}
              </GradientButton>
            </FormActions>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {/* Header Premium com decoração */}
          <div className="relative bg-gradient-to-br from-red-500 via-rose-500 to-pink-600 px-6 py-5 overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <DialogHeader className="relative space-y-1">
              <DialogTitle className="flex items-center gap-3 text-white text-lg">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Detalhes da Ocorrência</p>
                  <p className="text-xs text-white/70 font-normal">{selectedOcorrencia?.protocolo || ''}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
          {selectedOcorrencia && (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedOcorrencia.titulo}</CardTitle>
                      {selectedOcorrencia.subtitulo && (
                        <p className="text-gray-500 mt-1">{selectedOcorrencia.subtitulo}</p>
                      )}
                    </div>
                    <StatusBadge status={selectedOcorrencia.status} size="md" />
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Grid de informações com estilo moderno */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                      <p className="text-rose-600 font-medium text-xs mb-1">Categoria</p>
                      <p className="font-semibold text-gray-700">{selectedOcorrencia.categoria ? categoriaLabels[selectedOcorrencia.categoria] : "-"}</p>
                    </div>
                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                      <p className="text-purple-600 font-medium text-xs mb-1">Reportado por</p>
                      <p className="font-semibold text-gray-700">{selectedOcorrencia.reportadoPorNome || "-"}</p>
                    </div>
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <p className="text-blue-600 font-medium text-xs mb-1">Localização</p>
                      <p className="font-semibold text-gray-700">{selectedOcorrencia.localizacao || "-"}</p>
                    </div>
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <p className="text-amber-600 font-medium text-xs mb-1">Responsável</p>
                      <p className="font-semibold text-gray-700">{selectedOcorrencia.responsavelNome || "-"}</p>
                    </div>
                  </div>

                  {/* Alterar Status */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <Label className="text-sm font-semibold text-gray-700">Alterar Status:</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            handleStatusChange(selectedOcorrencia.id, s);
                            setSelectedOcorrencia({ ...selectedOcorrencia, status: s });
                          }}
                          className="cursor-pointer transition-transform hover:scale-105"
                        >
                          <StatusBadge status={s} size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Image className="w-5 h-5 text-rose-500" />
                    Imagens/Evidências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ocorrenciaImagens.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ocorrenciaImagens.map((img) => (
                        <div key={img.id} className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                          <div className="aspect-square overflow-hidden">
                            <img src={img.url} alt={img.legenda || "Imagem"} className="w-full h-full object-cover" />
                          </div>
                          {img.legenda && (
                            <div className="px-2.5 py-2 border-t border-gray-100">
                              <p className="text-sm text-gray-700 leading-snug">{img.legenda}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Nenhuma imagem</p>
                  )}
                  <div className="mt-4">
                    <MultiImageUpload
                      value={[]}
                      onChange={(urls) => urls.forEach(url => handleAddImage(url))}
                      maxImages={10}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Seção Anexos (PDF/Documentos) */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-indigo-500" />
                    Anexos (Documentos)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ocorrenciaAnexos.length > 0 ? (
                    <div className="space-y-2">
                      {ocorrenciaAnexos.map((anexo) => {
                        const getIcon = (tipo: string) => {
                          if (tipo.includes("pdf")) return "📄";
                          if (tipo.includes("word") || tipo.includes("document")) return "📝";
                          if (tipo.includes("excel") || tipo.includes("spreadsheet")) return "📊";
                          if (tipo.includes("image")) return "🖼️";
                          return "📎";
                        };
                        const formatSize = (bytes: number) => {
                          if (!bytes) return "";
                          const k = 1024;
                          const sizes = ["Bytes", "KB", "MB"];
                          const i = Math.floor(Math.log(bytes) / Math.log(k));
                          return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
                        };
                        return (
                          <div key={anexo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="text-2xl">{getIcon(anexo.tipo)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-700 truncate">{anexo.nome}</p>
                              {anexo.tamanho ? (
                                <p className="text-xs text-gray-400">{formatSize(anexo.tamanho)}</p>
                              ) : null}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  if (anexo.tipo.includes("pdf") || anexo.tipo.includes("image")) {
                                    const w = window.open();
                                    if (w) {
                                      w.document.write(`<html><head><title>${anexo.nome}</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;">${
                                        anexo.tipo.includes("pdf")
                                          ? `<iframe src="${anexo.url}" style="width:100%;height:100vh;border:none;"></iframe>`
                                          : `<img src="${anexo.url}" style="max-width:100%;max-height:100vh;" />`
                                      }</body></html>`);
                                    }
                                  } else {
                                    const link = document.createElement("a");
                                    link.href = anexo.url;
                                    link.download = anexo.nome;
                                    link.click();
                                  }
                                }}
                                className="h-8 w-8 p-0"
                                title="Visualizar"
                              >
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement("a");
                                  link.href = anexo.url;
                                  link.download = anexo.nome;
                                  link.click();
                                }}
                                className="h-8 w-8 p-0"
                                title="Download"
                              >
                                <Download className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeAnexoMutation.mutate({ id: anexo.id })}
                                className="h-8 w-8 p-0"
                                title="Remover"
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Nenhum anexo</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline events={timeline} />
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Adicionar Comentário
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        className="flex-1"
                      />
                      <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                        Enviar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        tipo="ocorrencia"
        itemId={selectedOcorrencia?.id || 0}
        itemTitulo={selectedOcorrencia?.titulo || ""}
        itemProtocolo={selectedOcorrencia?.protocolo || ""}
        condominioId={condominioId}
      />

      {/* Modal de Compartilhar com Equipe */}
      <CompartilharComEquipe
        condominioId={condominioId}
        tipo="ocorrencia"
        itemId={selectedOcorrencia?.id || 0}
        itemTitulo={selectedOcorrencia?.titulo || ""}
        itemDescricao={selectedOcorrencia?.descricao || ""}
        open={showShareEquipeModal}
        onOpenChange={setShowShareEquipeModal}
      />

      {/* Modal de Ocorrência Rápida */}
      <TarefasSimplesModal
        open={showOcorrenciaRapida}
        onOpenChange={setShowOcorrenciaRapida}
        condominioId={condominioId}
        tipoInicial="ocorrencia"
        onSuccess={() => {
          utils.ocorrencia.list.invalidate();
        }}
      />

      {/* Modal de Relatório Avançado */}
      <ReportGeneratorModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        tipoFuncao="ocorrencia"
        filters={filters}
        items={filteredOcorrencias}
        onGenerate={generateReportWithConfig}
        availableFields={availableFields}
        organizationName={condominio?.nome || undefined}
        organizationLogo={condominio?.logoUrl || undefined}
      />
    </div>
  );
}
