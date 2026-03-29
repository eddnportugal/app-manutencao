import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { FunctionTutorialButton } from "@/components/FunctionTutorial";
import { IndiceFuncoesButton } from "@/components/IndiceFuncoesButton";
import { TarefasSimplesModal } from "@/components/TarefasSimplesModal";
import { LocationMiniMap } from "@/components/LocationMiniMap";
import { ShareModal } from "@/components/ShareModal";
import { CompartilharComEquipe } from "@/components/CompartilharComEquipe";
import { FieldSettingsButton } from "@/components/FieldSettingsModal";
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
  ClipboardCheck, 
  FileText, 
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  Printer,
  Share2,
  MapPin,
  Play,
  Square,
  Clock,
  Navigation,
  ExternalLink,
  User,
  Calendar,
  Flag,
  AlignLeft,
  Image,
  CheckSquare,
  Clipboard,
  X
} from "lucide-react";
// pdfGenerator loaded dynamically for code-splitting
const loadPdfGenerator = () => import("@/lib/pdfGenerator");
import { ProtocolCard, StatsCards } from "@/components/ProtocolCard";
import { Timeline, StatusBadge } from "@/components/Timeline";
import MultiImageUpload, { ImageItem } from "@/components/MultiImageUpload";
import InputWithSave from "@/components/InputWithSave";
import ImageEditSection from "@/components/ImageEditSection";
import { ReportFiltersPanel, useReportFilters, applyFilters, ReportFilters } from "@/components/ReportFiltersPanel";
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
import PrazoConclusaoField from "@/components/PrazoConclusaoField";
import { QrCode, Paperclip, CalendarClock } from "lucide-react";

interface VistoriasPageProps {
  condominioId: number;
}

export default function VistoriasPage({ condominioId }: VistoriasPageProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showVistoriaRapida, setShowVistoriaRapida] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareEquipeModal, setShowShareEquipeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedVistoria, setSelectedVistoria] = useState<any>(null);
  const [searchProtocolo, setSearchProtocolo] = useState("");
  const { filters, setFilters } = useReportFilters();
  const [newComment, setNewComment] = useState("");
  
  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    descricao: "",
    observacoes: "",
    responsavelNome: "",
    localizacao: "",
    dataAgendada: "",
    prioridade: "media" as "baixa" | "media" | "alta" | "urgente",
    tipo: "",
    categoria: "",
    geoLatitude: "",
    geoLongitude: "",
    geoEndereco: "",
    // Novos campos
    qrCode: "",
    prazoConclusao: "",
  });
  const [imagens, setImagens] = useState<string[]>([]);
  const [imagensComLegendas, setImagensComLegendas] = useState<ImageItem[]>([]);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [vistoriaIniciada, setVistoriaIniciada] = useState(false);
  const [horaInicio, setHoraInicio] = useState<Date | null>(null);
  const [horaFim, setHoraFim] = useState<Date | null>(null);
  const [duracaoVistoria, setDuracaoVistoria] = useState("");
  const [capturandoGeo, setCapturandoGeo] = useState(false);
  const [assinaturaTecnico, setAssinaturaTecnico] = useState("");
  const [assinaturaSolicitante, setAssinaturaSolicitante] = useState("");

  const utils = trpc.useUtils();

  // Hook para configuração de campos - determina quais campos mostrar no formulário
  const { isFieldEnabled } = useFieldSettings({
    condominioId,
    modalType: "completa",
    functionType: "vistoria",
    enabled: showDialog && condominioId > 0,
  });
  
  // Buscar dados da organização para obter o logo
  const { data: condominio } = trpc.condominio.get.useQuery(
    { id: condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: vistorias = [], isLoading } = trpc.vistoria.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: stats } = trpc.vistoria.getStats.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: searchResults = [] } = trpc.vistoria.searchByProtocolo.useQuery(
    { protocolo: searchProtocolo, condominioId },
    { enabled: !!searchProtocolo && searchProtocolo.length >= 3 }
  );
  
  const { data: timeline = [] } = trpc.vistoria.getTimeline.useQuery(
    { vistoriaId: selectedVistoria?.id },
    { enabled: !!selectedVistoria?.id }
  );
  
  const { data: vistoriaImagens = [] } = trpc.vistoria.getImagens.useQuery(
    { vistoriaId: selectedVistoria?.id },
    { enabled: !!selectedVistoria?.id }
  );

  const { data: vistoriaAnexos = [] } = trpc.vistoria.getAnexos.useQuery(
    { vistoriaId: selectedVistoria?.id },
    { enabled: !!selectedVistoria?.id }
  );

  const createMutation = trpc.vistoria.create.useMutation({
    onSuccess: async (result) => {
      // Adicionar imagens com legendas
      for (const img of imagensComLegendas) {
        await addImagemMutation.mutateAsync({ 
          vistoriaId: result.id, 
          url: img.url,
          legenda: img.legenda || undefined
        });
      }
      // Salvar anexos (PDF, documentos)
      for (const anexo of anexos) {
        await addAnexoMutation.mutateAsync({
          vistoriaId: result.id,
          nome: anexo.nome,
          url: anexo.url,
          tipo: anexo.tipo,
          tamanho: anexo.tamanho,
        });
      }
      toast.success(`Vistoria criada! Protocolo: ${result.protocolo}`);
      setShowDialog(false);
      resetForm();
      utils.vistoria.list.invalidate();
      utils.vistoria.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao criar vistoria"),
  });

  const updateMutation = trpc.vistoria.update.useMutation({
    onSuccess: () => {
      toast.success("Vistoria atualizada!");
      utils.vistoria.list.invalidate();
      utils.vistoria.getStats.invalidate();
      utils.vistoria.getTimeline.invalidate();
      if (selectedVistoria) {
        utils.vistoria.getById.invalidate({ id: selectedVistoria.id });
      }
    },
    onError: () => toast.error("Erro ao atualizar vistoria"),
  });

  const deleteMutation = trpc.vistoria.delete.useMutation({
    onSuccess: () => {
      toast.success("Vistoria excluída!");
      setShowDetailDialog(false);
      setSelectedVistoria(null);
      utils.vistoria.list.invalidate();
      utils.vistoria.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao excluir vistoria"),
  });

  const addImagemMutation = trpc.vistoria.addImagem.useMutation({
    onSuccess: () => {
      utils.vistoria.getImagens.invalidate();
      utils.vistoria.getTimeline.invalidate();
    },
  });

  const addAnexoMutation = trpc.vistoria.addAnexo.useMutation({
    onSuccess: () => {
      utils.vistoria.getAnexos.invalidate();
    },
  });

  const removeAnexoMutation = trpc.vistoria.removeAnexo.useMutation({
    onSuccess: () => {
      utils.vistoria.getAnexos.invalidate();
      toast.success("Anexo removido!");
    },
  });

  const addTimelineEventMutation = trpc.vistoria.addTimelineEvent.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.vistoria.getTimeline.invalidate();
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
      responsavelNome: "",
      localizacao: "",
      dataAgendada: "",
      prioridade: "media",
      tipo: "",
      categoria: "",
      geoLatitude: "",
      geoLongitude: "",
      geoEndereco: "",
      // Reset novos campos
      qrCode: "",
      prazoConclusao: "",
    });
    setImagens([]);
    setImagensComLegendas([]);
    setAnexos([]);
    setVistoriaIniciada(false);
    setHoraInicio(null);
    setHoraFim(null);
    setDuracaoVistoria("");
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
        // Tentar obter endereço via API reversa
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

  const iniciarVistoria = () => {
    const agora = new Date();
    setHoraInicio(agora);
    setVistoriaIniciada(true);
    capturarGeolocalizacao();
    toast.success(`Vistoria iniciada às ${agora.toLocaleTimeString("pt-BR")}`);
  };

  const terminarVistoria = () => {
    const agora = new Date();
    setHoraFim(agora);
    if (horaInicio) {
      const diff = agora.getTime() - horaInicio.getTime();
      const minutos = Math.floor(diff / 60000);
      const segundos = Math.floor((diff % 60000) / 1000);
      setDuracaoVistoria(`${minutos}min ${segundos}s`);
    }
    toast.success(`Vistoria finalizada às ${agora.toLocaleTimeString("pt-BR")}`);
  };

  const abrirMapa = (lat: string, lng: string) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const handleSubmit = (customStatus: string = "pendente") => {
    if (!formData.titulo) {
      toast.error("Título é obrigatório");
      return;
    }
    // @ts-ignore
    createMutation.mutate({ ...formData, condominioId, status: customStatus, assinaturaTecnico, assinaturaSolicitante });
  };

  const handleStatusChange = (vistoriaId: number, newStatus: string) => {
    updateMutation.mutate({ 
      id: vistoriaId, 
      status: newStatus as any 
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedVistoria) return;
    addTimelineEventMutation.mutate({
      vistoriaId: selectedVistoria.id,
      tipo: "comentario",
      descricao: newComment,
    });
  };

  const handleAddImage = async (url: string) => {
    if (!selectedVistoria) return;
    await addImagemMutation.mutateAsync({
      vistoriaId: selectedVistoria.id,
      url,
    });
  };

  const filteredVistorias = searchProtocolo.length >= 3 
    ? searchResults 
    : applyFilters(vistorias, filters, {
        searchFields: ["protocolo", "titulo", "descricao"],
        statusField: "status",
        responsavelField: "responsavelNome",
        prioridadeField: "prioridade",
        dateField: "createdAt",
      });

  const generatePDF = async () => {
    if (selectedVistoria) {
      const { generateVistoriaReport } = await loadPdfGenerator();
      await generateVistoriaReport(selectedVistoria, timeline, vistoriaImagens, {
        logoUrl: condominio?.logoUrl || '',
        companyName: condominio?.nome || '',
      });
    } else {
      toast.info("Selecione uma vistoria para gerar o PDF");
    }
  };

  const generateReport = () => {
    setShowReportModal(true);
  };

  // Gerar relatório com configurações
  const handleGenerateReport = (config: ReportConfig) => {
    const html = generateReportHTML(filteredVistorias, config, condominio?.logoUrl);
    printReport(html);
    setShowReportModal(false);
  };

  // Lista de responsáveis únicos
  const responsaveisUnicos = vistorias
    .map(v => v.responsavelNome)
    .filter((r): r is string => !!r && r.trim() !== "");

  // Campos disponíveis para relatório
  const availableFields = [
    { key: "protocolo", label: "Protocolo", included: true },
    { key: "titulo", label: "Título", included: true },
    { key: "status", label: "Status", included: true },
    { key: "responsavelNome", label: "Responsável", included: true },
    { key: "localizacao", label: "Localização", included: true },
    { key: "prioridade", label: "Prioridade", included: true },
    { key: "dataAgendada", label: "Data Agendada", included: true },
    { key: "descricao", label: "Descrição", included: false },
    { key: "observacoes", label: "Observações", included: false },
    { key: "createdAt", label: "Data Criação", included: true },
  ];

  return (
    <div className="space-y-5 pb-32">
      {/* Header Premium */}
      <div data-tour="header-vistorias" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-5 shadow-xl">
        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <ClipboardCheck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Vistorias</h2>
              <p className="text-white/70 text-sm">Gerencie as vistorias da organização</p>
            </div>
            <div className="flex items-center gap-2">
              <IndiceFuncoesButton />
              <FunctionTutorialButton tutorialId="vistorias" />
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={generatePDF}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <Download className="h-4 w-4 mr-1.5" />
              PDF
            </Button>
            <Button 
              data-tour="btn-relatorio"
              variant="secondary" 
              size="sm" 
              onClick={generateReport}
              className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Relatório
            </Button>
            <Button 
              data-tour="btn-nova-vistoria"
              size="sm" 
              onClick={() => setShowDialog(true)} 
              className="bg-white text-blue-700 hover:bg-white/90 font-semibold shadow-lg"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Nova Vistoria
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
        onGenerateReport={generateReport}
        totalResults={vistorias.length}
        filteredResults={filteredVistorias.length}
      />
      </div>

      {/* Lista de Vistorias */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="text-sm text-slate-500 mt-2">Carregando vistorias...</p>
        </div>
      ) : filteredVistorias.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center border border-slate-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-50" />
          <ClipboardCheck className="h-16 w-16 mx-auto text-blue-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {searchProtocolo ? "Nenhuma vistoria encontrada" : "Nenhuma vistoria cadastrada"}
          </h3>
          <p className="text-slate-500 mb-4">Comece criando sua primeira vistoria</p>
          <Button 
            onClick={() => setShowDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-1" />
            Criar primeira vistoria
          </Button>
        </div>
      ) : (
        <div data-tour="lista-itens" className="grid gap-3">
          {filteredVistorias.map((vistoria) => (
            <ProtocolCard
              key={vistoria.id}
              protocolo={vistoria.protocolo}
              titulo={vistoria.titulo}
              subtitulo={vistoria.subtitulo}
              descricao={vistoria.descricao}
              observacoes={vistoria.observacoes}
              status={vistoria.status}
              prioridade={vistoria.prioridade}
              responsavelNome={vistoria.responsavelNome}
              localizacao={vistoria.localizacao}
              dataAgendada={vistoria.dataAgendada}
              dataRealizada={vistoria.dataRealizada}
              createdAt={vistoria.createdAt}
              tipo={vistoria.tipo}
              onView={() => {
                setSelectedVistoria(vistoria);
                setShowDetailDialog(true);
              }}
              onEdit={() => {
                setSelectedVistoria(vistoria);
                setShowDetailDialog(true);
              }}
              onDelete={() => {
                if (confirm("Tem certeza que deseja excluir esta vistoria?")) {
                  deleteMutation.mutate({ id: vistoria.id });
                }
              }}
              onShare={() => {
                setSelectedVistoria(vistoria);
                setShowShareModal(true);
              }}
              onShareEquipe={() => {
                setSelectedVistoria(vistoria);
                setShowShareEquipeModal(true);
              }}
              onPdf={async () => {
                const imagens = await utils.vistoria.getImagens.fetch({ vistoriaId: vistoria.id });
                const { generateVistoriaReport } = await loadPdfGenerator();
                await generateVistoriaReport(vistoria, [], imagens || [], {
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
                        onClick={() => handleStatusChange(vistoria.id, s)}
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

      {/* Dialog Nova Vistoria */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Nova Vistoria</DialogTitle>
          </DialogHeader>
          {/* Header Premium */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-3 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <FormModalHeader
                icon={ClipboardCheck}
                iconColor="text-blue-600"
                iconBgColor="bg-gradient-to-br from-blue-100 to-indigo-100"
                title="Nova Vistoria"
                subtitle="Registre uma nova vistoria na organização"
              />
            </div>
          </div>

          <div className="px-3 sm:px-6 py-5 space-y-5 overflow-x-hidden">
            {/* Botão de Configuração de Campos - Visível no topo */}
            <div className="flex justify-end">
              <FieldSettingsButton
                condominioId={condominioId}
                modalType="completa"
                functionType="vistoria"
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
                  tipo="titulo_vistoria"
                  placeholder="Ex: Vistoria de Elevadores"
                />
                {isFieldEnabled("subtitulo") && (
                <InputWithSave
                  label="Subtítulo"
                  value={formData.subtitulo}
                  onChange={(v) => setFormData({ ...formData, subtitulo: v })}
                  condominioId={condominioId}
                  tipo="subtitulo_vistoria"
                  placeholder="Ex: Manutenção preventiva mensal"
                />
                )}
              </FormFieldGroup>
            </FormSection>

            {/* Seção: Classificação */}
            {(isFieldEnabled("tipo") || isFieldEnabled("categoria")) && (
            <FormSection title="Classificação" icon={Flag} iconColor="text-amber-500" variant="subtle">
              <FormFieldGroup columns={2}>
                {isFieldEnabled("tipo") && (
                <InputWithSave
                  label="Tipo de Vistoria"
                  value={formData.tipo}
                  onChange={(v) => setFormData({ ...formData, tipo: v })}
                  condominioId={condominioId}
                  tipo="tipo_vistoria"
                  placeholder="Ex: Elétrica, Hidráulica"
                />
                )}
                {isFieldEnabled("categoria") && (
                <InputWithSave
                  label="Categoria"
                  value={formData.categoria || ""}
                  onChange={(v) => setFormData({ ...formData, categoria: v })}
                  condominioId={condominioId}
                  tipo="categoria_vistoria"
                  placeholder="Ex: Preventiva, Corretiva"
                />
                )}
              </FormFieldGroup>
            </FormSection>
            )}

            {/* Seção: Atribuição */}
            {(isFieldEnabled("responsavel") || isFieldEnabled("localizacao_texto")) && (
            <FormSection title="Atribuição" icon={User} iconColor="text-violet-500">
              <FormFieldGroup columns={2}>
                {isFieldEnabled("responsavel") && (
                <InputWithSave
                  label="Responsável"
                  value={formData.responsavelNome}
                  onChange={(v) => setFormData({ ...formData, responsavelNome: v })}
                  condominioId={condominioId}
                  tipo="responsavel"
                  placeholder="Nome do responsável"
                />
                )}
                {isFieldEnabled("localizacao_texto") && (
                <InputWithSave
                  label="Localização"
                  value={formData.localizacao}
                  onChange={(v) => setFormData({ ...formData, localizacao: v })}
                  condominioId={condominioId}
                  tipo="localizacao"
                  placeholder="Ex: Bloco A - Térreo"
                />
                )}
              </FormFieldGroup>
            </FormSection>
            )}

            {/* Seção: Agendamento */}
            {(isFieldEnabled("data_agendada") || isFieldEnabled("prioridade")) && (
            <FormSection title="Agendamento" icon={Calendar} iconColor="text-rose-500" variant="subtle">
              <FormFieldGroup columns={2}>
                {isFieldEnabled("data_agendada") && (
                <div>
                  <StyledLabel icon={Calendar}>Data Agendada</StyledLabel>
                  <Input
                    type="datetime-local"
                    value={formData.dataAgendada}
                    onChange={(e) => setFormData({ ...formData, dataAgendada: e.target.value })}
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
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
                  tipo="descricao_vistoria"
                  placeholder="Descreva os detalhes da vistoria..."
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
                  tipo="observacoes_vistoria"
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
            <FormSection title="Imagens" icon={Image} iconColor="text-pink-500">
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

            {/* Seção: Prazo de Conclusão */}
            {isFieldEnabled("prazo_conclusao") && (
            <FormSection title="Prazo de Conclusão" icon={CalendarClock} iconColor="text-rose-500">
              <PrazoConclusaoField
                value={formData.prazoConclusao}
                onChange={(v) => setFormData({ ...formData, prazoConclusao: v })}
              />
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

            {/* Seção: Controle de Vistoria */}
            {isFieldEnabled("controle_tempo") && (
            <FormSection title="Controle de Vistoria" icon={Clock} iconColor="text-emerald-500" variant="highlight">
              {/* Botões Iniciar/Terminar */}
              <div className="flex gap-3 mb-4">
                {!vistoriaIniciada ? (
                  <GradientButton type="button" onClick={iniciarVistoria} variant="success" icon={Play}>
                    Iniciar Vistoria
                  </GradientButton>
                ) : (
                  <>
                    <GradientButton type="button" onClick={terminarVistoria} variant="danger" icon={Square}>
                      Terminar Vistoria
                    </GradientButton>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-100">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      <span>Iniciada às {horaInicio?.toLocaleTimeString("pt-BR")}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Informações de tempo */}
              {duracaoVistoria && (
                <div className="bg-white p-4 rounded-lg border border-emerald-100 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Duração</p>
                      <p className="font-semibold text-emerald-600">{duracaoVistoria}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Início</p>
                      <p className="font-medium">{horaInicio?.toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fim</p>
                      <p className="font-medium">{horaFim?.toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botão de Geolocalização */}
              {isFieldEnabled("geolocalizacao") && (
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
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
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
              )}

              {/* Exibir coordenadas e endereço */}
              {isFieldEnabled("geolocalizacao") && formData.geoLatitude && formData.geoLongitude && (
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
              <Button 
                variant="outline" 
                onClick={() => handleSubmit("rascunho")}
                disabled={createMutation.isPending}
                className="px-5 h-11 border-amber-200 text-amber-700 hover:bg-amber-50 mr-2"
              >
                Salvar Rascunho
              </Button>
              <GradientButton 
                onClick={() => handleSubmit("pendente")} 
                disabled={createMutation.isPending}
                variant="primary"
                size="lg"
                icon={CheckSquare}
                loading={createMutation.isPending}
              >
                {createMutation.isPending ? "Criando..." : "Criar Vistoria"}
              </GradientButton>
            </FormActions>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-0">
          {/* Header Premium com decoração */}
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 px-6 py-5 overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <DialogHeader className="relative space-y-1">
              <DialogTitle className="flex items-center gap-3 text-white text-lg">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Detalhes da Vistoria</p>
                  <p className="text-xs text-white/70 font-normal">{selectedVistoria?.protocolo || ''}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
          {selectedVistoria && (
            <div className="space-y-6">
              {/* Info Card Premium */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedVistoria.titulo}</CardTitle>
                      {selectedVistoria.subtitulo && (
                        <p className="text-gray-500 mt-1">{selectedVistoria.subtitulo}</p>
                      )}
                    </div>
                    <StatusBadge status={selectedVistoria.status} size="md" />
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Grid de informações com estilo moderno */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <p className="text-blue-600 font-medium text-xs mb-1">Responsável</p>
                      <p className="font-semibold text-gray-700">{selectedVistoria.responsavelNome || "-"}</p>
                    </div>
                    <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-100">
                      <p className="text-violet-600 font-medium text-xs mb-1">Localização</p>
                      <p className="font-semibold text-gray-700">{selectedVistoria.localizacao || "-"}</p>
                    </div>
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <p className="text-amber-600 font-medium text-xs mb-1">Data Agendada</p>
                      <p className="font-semibold text-gray-700">
                        {selectedVistoria.dataAgendada 
                          ? new Date(selectedVistoria.dataAgendada).toLocaleDateString("pt-BR")
                          : "-"}
                      </p>
                    </div>
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                      <p className="text-rose-600 font-medium text-xs mb-1">Prioridade</p>
                      <p className="font-semibold capitalize text-gray-700">{selectedVistoria.prioridade || "Média"}</p>
                    </div>
                  </div>
                  
                  {/* Descrição e Observações */}
                  {(selectedVistoria.descricao || selectedVistoria.observacoes) && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                      {selectedVistoria.descricao && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Descrição</p>
                          <p className="text-gray-600 whitespace-pre-wrap">{selectedVistoria.descricao}</p>
                        </div>
                      )}
                      {selectedVistoria.observacoes && (
                        <div className={selectedVistoria.descricao ? "pt-3 border-t border-gray-200" : ""}>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Observações</p>
                          <p className="text-gray-600 whitespace-pre-wrap">{selectedVistoria.observacoes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Alterar Status */}
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <Label className="text-sm font-semibold text-gray-700">Alterar Status:</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            handleStatusChange(selectedVistoria.id, s);
                            setSelectedVistoria({ ...selectedVistoria, status: s });
                          }}
                          className="cursor-pointer"
                        >
                          <StatusBadge status={s} size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Imagens */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Galeria de Imagens</CardTitle>
                </CardHeader>
                <CardContent>
                  {vistoriaImagens.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vistoriaImagens.map((img) => (
                        <div key={img.id} className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={img.url}
                              alt={img.legenda || "Imagem"}
                              className="w-full h-full object-cover"
                            />
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
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma imagem adicionada
                    </p>
                  )}
                  <div className="mt-4">
                    <MultiImageUpload
                      value={[]}
                      onChange={(urls) => {
                        urls.forEach(url => handleAddImage(url));
                      }}
                      maxImages={10}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Anexos (PDF/Documentos) */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-indigo-500" />
                    Anexos (Documentos)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vistoriaAnexos.length > 0 ? (
                    <div className="space-y-2">
                      {vistoriaAnexos.map((anexo) => {
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
                              {anexo.tamanho ? <p className="text-xs text-gray-400">{formatSize(anexo.tamanho)}</p> : null}
                            </div>
                            <div className="flex gap-1">
                              <Button type="button" variant="ghost" size="sm" onClick={() => {
                                if (anexo.tipo.includes("pdf") || anexo.tipo.includes("image")) {
                                  const w = window.open();
                                  if (w) w.document.write(`<html><head><title>${anexo.nome}</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;">${anexo.tipo.includes("pdf") ? `<iframe src="${anexo.url}" style="width:100%;height:100vh;border:none;"></iframe>` : `<img src="${anexo.url}" style="max-width:100%;max-height:100vh;" />`}</body></html>`);
                                } else { const link = document.createElement("a"); link.href = anexo.url; link.download = anexo.nome; link.click(); }
                              }} className="h-8 w-8 p-0" title="Visualizar"><Eye className="h-4 w-4 text-blue-500" /></Button>
                              <Button type="button" variant="ghost" size="sm" onClick={() => { const link = document.createElement("a"); link.href = anexo.url; link.download = anexo.nome; link.click(); }} className="h-8 w-8 p-0" title="Download"><Download className="h-4 w-4 text-green-500" /></Button>
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeAnexoMutation.mutate({ id: anexo.id })} className="h-8 w-8 p-0" title="Remover"><X className="h-4 w-4 text-red-500" /></Button>
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

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Timeline de Eventos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline events={timeline} />
                  
                  {/* Adicionar comentário */}
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      Adicionar Comentário
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Digite um comentário..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || addTimelineEventMutation.isPending}
                      >
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
              <Button variant="outline" onClick={generatePDF}>
                <Download className="h-4 w-4 mr-1" />
                Gerar PDF
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        tipo="vistoria"
        itemId={selectedVistoria?.id || 0}
        itemTitulo={selectedVistoria?.titulo || ""}
        itemProtocolo={selectedVistoria?.protocolo || ""}
        condominioId={condominioId}
      />

      {/* Modal de Compartilhar com Equipe */}
      <CompartilharComEquipe
        condominioId={condominioId}
        tipo="vistoria"
        itemId={selectedVistoria?.id || 0}
        itemTitulo={selectedVistoria?.titulo || ""}
        itemDescricao={selectedVistoria?.descricao || ""}
        open={showShareEquipeModal}
        onOpenChange={setShowShareEquipeModal}
      />

      {/* Modal de Vistoria Rápida */}
      <TarefasSimplesModal
        open={showVistoriaRapida}
        onOpenChange={setShowVistoriaRapida}
        condominioId={condominioId}
        tipoInicial="vistoria"
        onSuccess={() => {
          utils.vistoria.list.invalidate();
          utils.vistoria.getStats.invalidate();
        }}
      />

      {/* Modal de Relatório Avançado */}
      <ReportGeneratorModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        tipoFuncao="vistoria"
        filters={filters}
        items={filteredVistorias}
        onGenerate={handleGenerateReport}
        availableFields={availableFields}
        organizationName={condominio?.nome}
        organizationLogo={condominio?.logoUrl}
      />
    </div>
  );
}
