import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { FunctionTutorialButton } from "@/components/FunctionTutorial";
import { IndiceFuncoesButton } from "@/components/IndiceFuncoesButton";
import { TarefasSimplesModal } from "@/components/TarefasSimplesModal";
import { FieldSettingsButton } from "@/components/FieldSettingsModal";
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
  Wrench, 
  FileText, 
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  DollarSign,
  Printer,
  MapPin,
  Play,
  Square,
  Clock,
  ExternalLink,
  User,
  Calendar,
  Flag,
  AlignLeft,
  Image,
  CheckSquare,
  Building,
  Navigation,
  Users,
  Tag,
  X
} from "lucide-react";
// pdfGenerator loaded dynamically for code-splitting
const loadPdfGenerator = () => import("@/lib/pdfGenerator");
import { LocationMiniMap } from "@/components/LocationMiniMap";
import { ProtocolCard, StatsCards } from "@/components/ProtocolCard";
import { Timeline, StatusBadge } from "@/components/Timeline";
import MultiImageUpload, { ImageItem } from "@/components/MultiImageUpload";
import InputWithSave from "@/components/InputWithSave";
import ImageEditSection from "@/components/ImageEditSection";
import AutoLocationCapture from "@/components/AutoLocationCapture";
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

interface ManutencoesPageProps {
  condominioId: number;
}

export default function ManutencoesPage({ condominioId }: ManutencoesPageProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showManutencaoRapida, setShowManutencaoRapida] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareEquipeModal, setShowShareEquipeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedManutencao, setSelectedManutencao] = useState<any>(null);
  const [searchProtocolo, setSearchProtocolo] = useState("");
  const { filters, setFilters } = useReportFilters();
  const [newComment, setNewComment] = useState("");
  const [assinaturaTecnico, setAssinaturaTecnico] = useState("");
  const [assinaturaSolicitante, setAssinaturaSolicitante] = useState("");
  
  // Hook para verificar campos habilitados
  const { isFieldEnabled } = useFieldSettings({
    condominioId,
    modalType: "completa",
    functionType: "manutencao",
  });
  
  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    descricao: "",
    observacoes: "",
    responsavelNome: "",
    localizacao: "",
    dataAgendada: "",
    prioridade: "media" as "baixa" | "media" | "alta" | "urgente",
    status: "pendente" as "pendente" | "realizada" | "acao_necessaria" | "finalizada" | "reaberta" | "rascunho",
    tipo: "corretiva" as "preventiva" | "corretiva" | "emergencial" | "programada",
    tempoEstimadoDias: 0,
    tempoEstimadoHoras: 0,
    tempoEstimadoMinutos: 0,
    fornecedor: "",
    geoLatitude: "",
    geoLongitude: "",
    geoEndereco: "",
    // Novos campos
    qrCode: "",
    custoEstimado: "",
    custoReal: "",
    prazoConclusao: "",
    nivelUrgencia: "normal" as "baixa" | "normal" | "alta" | "urgente" | "critica",
    categoria: "",
  });
  const [imagens, setImagens] = useState<string[]>([]);
  const [imagensComLegendas, setImagensComLegendas] = useState<ImageItem[]>([]);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [manutencaoIniciada, setManutencaoIniciada] = useState(false);
  const [horaInicio, setHoraInicio] = useState<Date | null>(null);
  const [horaFim, setHoraFim] = useState<Date | null>(null);
  const [duracaoManutencao, setDuracaoManutencao] = useState("");
  const [capturandoGeo, setCapturandoGeo] = useState(false);

  const utils = trpc.useUtils();
  
  // Buscar dados da organização para obter o logo
  const { data: condominio } = trpc.condominio.get.useQuery(
    { id: condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: manutencoes = [], isLoading } = trpc.manutencao.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: stats } = trpc.manutencao.getStats.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: searchResults = [] } = trpc.manutencao.searchByProtocolo.useQuery(
    { protocolo: searchProtocolo, condominioId },
    { enabled: !!searchProtocolo && searchProtocolo.length >= 3 }
  );
  
  const { data: timeline = [] } = trpc.manutencao.getTimeline.useQuery(
    { manutencaoId: selectedManutencao?.id },
    { enabled: !!selectedManutencao?.id }
  );
  
  const { data: manutencaoImagens = [] } = trpc.manutencao.getImagens.useQuery(
    { manutencaoId: selectedManutencao?.id },
    { enabled: !!selectedManutencao?.id }
  );

  const { data: manutencaoAnexos = [] } = trpc.manutencao.getAnexos.useQuery(
    { manutencaoId: selectedManutencao?.id },
    { enabled: !!selectedManutencao?.id }
  );

  const createMutation = trpc.manutencao.create.useMutation({
    onSuccess: async (result) => {
      for (const img of imagensComLegendas) {
        await addImagemMutation.mutateAsync({ 
          manutencaoId: result.id, 
          url: img.url,
          legenda: img.legenda || undefined
        });
      }
      // Salvar anexos (PDF, documentos)
      for (const anexo of anexos) {
        await addAnexoMutation.mutateAsync({
          manutencaoId: result.id,
          nome: anexo.nome,
          url: anexo.url,
          tipo: anexo.tipo,
          tamanho: anexo.tamanho,
        });
      }
      toast.success(`Manutenção criada! Protocolo: ${result.protocolo}`);
      setShowDialog(false);
      resetForm();
      utils.manutencao.list.invalidate();
      utils.manutencao.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao criar manutenção"),
  });

  const updateMutation = trpc.manutencao.update.useMutation({
    onSuccess: () => {
      toast.success("Manutenção atualizada!");
      utils.manutencao.list.invalidate();
      utils.manutencao.getStats.invalidate();
      utils.manutencao.getTimeline.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar manutenção"),
  });

  const deleteMutation = trpc.manutencao.delete.useMutation({
    onSuccess: () => {
      toast.success("Manutenção excluída!");
      setShowDetailDialog(false);
      setSelectedManutencao(null);
      utils.manutencao.list.invalidate();
      utils.manutencao.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao excluir manutenção"),
  });

  const addImagemMutation = trpc.manutencao.addImagem.useMutation({
    onSuccess: () => {
      utils.manutencao.getImagens.invalidate();
      utils.manutencao.getTimeline.invalidate();
    },
  });

  const addAnexoMutation = trpc.manutencao.addAnexo.useMutation({
    onSuccess: () => {
      utils.manutencao.getAnexos.invalidate();
    },
  });

  const removeAnexoMutation = trpc.manutencao.removeAnexo.useMutation({
    onSuccess: () => {
      utils.manutencao.getAnexos.invalidate();
      toast.success("Anexo removido!");
    },
  });

  const addTimelineEventMutation = trpc.manutencao.addTimelineEvent.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.manutencao.getTimeline.invalidate();
      toast.success("Comentário adicionado!");
    },
  });

  // Captura automática de localização ao abrir o dialog
  useEffect(() => {
    if (showDialog && !formData.geoLatitude) {
      // Capturar localização automaticamente ao abrir o formulário
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
                if (data.display_name) {
                  endereco = data.display_name;
                }
              }
            } catch (e) {
              console.log("Erro ao obter endereço");
            }
            
            setFormData(prev => ({
              ...prev,
              geoLatitude: latitude.toString(),
              geoLongitude: longitude.toString(),
              geoEndereco: endereco,
            }));
            toast.success("Localização capturada automaticamente!");
          },
          (error) => {
            console.log("Captura automática falhou, usuário pode capturar manualmente");
          },
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
      status: "pendente",
      tipo: "corretiva",
      tempoEstimadoDias: 0,
    tempoEstimadoHoras: 0,
    tempoEstimadoMinutos: 0,
      fornecedor: "",
      geoLatitude: "",
      geoLongitude: "",
      geoEndereco: "",
      // Reset novos campos
      qrCode: "",
      custoEstimado: "",
      custoReal: "",
      prazoConclusao: "",
      nivelUrgencia: "normal",
      categoria: "",
    });([]);
    setImagensComLegendas([]);
    setAnexos([]);
    setManutencaoIniciada(false);
    setHoraInicio(null);
    setHoraFim(null);
    setDuracaoManutencao("");
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

  const iniciarManutencao = () => {
    const agora = new Date();
    setHoraInicio(agora);
    setManutencaoIniciada(true);
    capturarGeolocalizacao();
    toast.success(`Manutenção iniciada às ${agora.toLocaleTimeString("pt-BR")}`);
  };

  const terminarManutencao = () => {
    const agora = new Date();
    setHoraFim(agora);
    if (horaInicio) {
      const diff = agora.getTime() - horaInicio.getTime();
      const minutos = Math.floor(diff / 60000);
      const segundos = Math.floor((diff % 60000) / 1000);
      setDuracaoManutencao(`${minutos}min ${segundos}s`);
    }
    toast.success(`Manutenção finalizada às ${agora.toLocaleTimeString("pt-BR")}`);
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
    createMutation.mutate({ 
      ...formData, 
      condominioId, 
      status: formData.status, // Usa o status do form se não houver sobrescrita
      assinaturaTecnico,
      assinaturaSolicitante,
    });
  };

  const handleStatusChange = (manutencaoId: number, newStatus: string) => {
    updateMutation.mutate({ id: manutencaoId, status: newStatus as any });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedManutencao) return;
    addTimelineEventMutation.mutate({
      manutencaoId: selectedManutencao.id,
      tipo: "comentario",
      descricao: newComment,
    });
  };

  const handleAddImage = async (url: string) => {
    if (!selectedManutencao) return;
    await addImagemMutation.mutateAsync({
      manutencaoId: selectedManutencao.id,
      url,
    });
  };

  const filteredManutencoes = searchProtocolo.length >= 3 
    ? searchResults 
    : applyFilters(manutencoes, filters, {
        searchFields: ["protocolo", "titulo", "descricao"],
        statusField: "status",
        responsavelField: "responsavelNome",
        prioridadeField: "prioridade",
        dateField: "createdAt",
      });

  const handleGeneratePDF = async () => {
    if (selectedManutencao) {
      const { generateManutencaoReport } = await loadPdfGenerator();
      await generateManutencaoReport(selectedManutencao, timeline, manutencaoImagens, {
        logoUrl: condominio?.logoUrl || '',
        companyName: condominio?.nome || '',
      });
    } else {
      toast.info("Selecione uma manutenção para gerar o PDF");
    }
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  // Gerar relatório com configurações
  const generateReportWithConfig = (config: ReportConfig) => {
    const html = generateReportHTML(filteredManutencoes, config, condominio?.logoUrl);
    printReport(html);
    setShowReportModal(false);
  };

  // Lista de responsáveis únicos
  const responsaveisUnicos = manutencoes
    .map(m => m.responsavelNome)
    .filter((r): r is string => !!r && r.trim() !== "");

  // Campos disponíveis para relatório
  const availableFields = [
    { key: "protocolo", label: "Protocolo", included: true },
    { key: "titulo", label: "Título", included: true },
    { key: "status", label: "Status", included: true },
    { key: "tipo", label: "Tipo", included: true },
    { key: "responsavelNome", label: "Responsável", included: true },
    { key: "fornecedor", label: "Fornecedor", included: true },
    { key: "localizacao", label: "Localização", included: true },
    { key: "prioridade", label: "Prioridade", included: true },
    { key: "dataAgendada", label: "Data Agendada", included: true },
    { key: "descricao", label: "Descrição", included: false },
    { key: "createdAt", label: "Data Criação", included: true },
  ];

  const tipoLabels: Record<string, string> = {
    preventiva: "Preventiva",
    corretiva: "Corretiva",
    emergencial: "Emergencial",
    programada: "Programada",
  };

  return (
    <div className="space-y-5 pb-32">
      {/* Header Premium */}
      <div data-tour="header-manutencoes" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600 p-5 shadow-xl">
        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shrink-0">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-white truncate">Manutenções</h2>
              <p className="text-white/70 text-sm">Gerencie as manutenções da organização</p>
            </div>
            <div className="flex items-center gap-2">
              <IndiceFuncoesButton />
              <FunctionTutorialButton tutorialId="manutencoes" />
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex flex-wrap gap-2">
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
              data-tour="btn-nova-manutencao"
              size="sm" 
              onClick={() => setShowDialog(true)} 
              className="bg-white text-orange-700 hover:bg-white/90 font-semibold shadow-lg ml-auto"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Nova Manutenção
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
        totalResults={manutencoes.length}
        filteredResults={filteredManutencoes.length}
      />
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          <p className="text-sm text-slate-500 mt-2">Carregando manutenções...</p>
        </div>
      ) : filteredManutencoes.length === 0 ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100 p-10 text-center border border-slate-200/60 shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-50" />
          <Wrench className="h-16 w-16 mx-auto text-orange-300 mb-5" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Nenhuma manutenção cadastrada</h3>
          <p className="text-slate-500 mb-6 max-w-xs mx-auto">Comece criando sua primeira manutenção</p>
          <Button 
            onClick={() => setShowDialog(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-200/50 rounded-2xl h-13 px-8 text-base font-semibold transition-all duration-200 active:scale-[0.98]"
          >
            <Plus className="h-5 w-5 mr-2" />
            Adicionar o primeiro
          </Button>
        </div>
      ) : (
        <div data-tour="lista-itens" className="grid gap-3">
          {filteredManutencoes.map((manutencao) => (
            <ProtocolCard
              key={manutencao.id}
              protocolo={manutencao.protocolo}
              titulo={manutencao.titulo}
              subtitulo={manutencao.subtitulo}
              descricao={manutencao.descricao}
              observacoes={manutencao.observacoes}
              status={manutencao.status}
              prioridade={manutencao.prioridade}
              responsavelNome={manutencao.responsavelNome}
              localizacao={manutencao.localizacao}
              dataAgendada={manutencao.dataAgendada}
              dataRealizada={manutencao.dataRealizada}
              createdAt={manutencao.createdAt}
              tipo={manutencao.tipo ? tipoLabels[manutencao.tipo] : undefined}
              onView={() => {
                setSelectedManutencao(manutencao);
                setShowDetailDialog(true);
              }}
              onEdit={() => {
                setSelectedManutencao(manutencao);
                setShowDetailDialog(true);
              }}
              onDelete={() => {
                if (confirm("Tem certeza que deseja excluir esta manutenção?")) {
                  deleteMutation.mutate({ id: manutencao.id });
                }
              }}
              onShare={() => {
                setSelectedManutencao(manutencao);
                setShowShareModal(true);
              }}
              onShareEquipe={() => {
                setSelectedManutencao(manutencao);
                setShowShareEquipeModal(true);
              }}
              onPdf={async () => {
                // Buscar imagens da manutenção
                const imagens = await utils.manutencao.getImagens.fetch({ manutencaoId: manutencao.id });
                const { generateManutencaoReport } = await loadPdfGenerator();
                await generateManutencaoReport(manutencao, [], imagens || [], {
                  logoUrl: condominio?.logoUrl || '',
                  companyName: condominio?.nome || '',
                });
              }}
              extra={
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                  {(manutencao.tempoEstimadoDias || manutencao.tempoEstimadoHoras || manutencao.tempoEstimadoMinutos) && (
                    <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg px-3 py-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-700 font-medium">
                        Tempo Estimado: 
                        {manutencao.tempoEstimadoDias ? ` ${manutencao.tempoEstimadoDias}d` : ''}
                        {manutencao.tempoEstimadoHoras ? ` ${manutencao.tempoEstimadoHoras}h` : ''}
                        {manutencao.tempoEstimadoMinutos ? ` ${manutencao.tempoEstimadoMinutos}min` : ''}
                      </span>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Alterar Status:</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(manutencao.id, s)}
                          disabled={updateMutation.isPending}
                          className="cursor-pointer disabled:opacity-50 transition-transform hover:scale-105 active:scale-95"
                        >
                          <StatusBadge status={s} size="xs" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Dialog Nova Manutenção */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Nova Manutenção</DialogTitle>
          </DialogHeader>
          {/* Header Premium */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-3 sm:px-6 py-4">
            <FormModalHeader
              icon={Wrench}
              iconColor="text-orange-600"
              iconBgColor="bg-gradient-to-br from-orange-100 to-amber-100"
              title="Nova Manutenção"
              subtitle="Registre uma nova manutenção na organização"
            />
          </div>

          <div className="px-3 sm:px-6 py-5 space-y-5 overflow-x-hidden">
            {/* Botão de Configuração de Campos */}
            <div className="flex justify-end">
              <FieldSettingsButton
                condominioId={condominioId}
                modalType="completa"
                functionType="manutencao"
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
                  tipo="titulo_manutencao"
                  placeholder="Ex: Reparo no Portão Principal"
                />
                {isFieldEnabled("subtitulo") && (
                <InputWithSave
                  label="Subtítulo"
                  value={formData.subtitulo}
                  onChange={(v) => setFormData({ ...formData, subtitulo: v })}
                  condominioId={condominioId}
                  tipo="subtitulo_manutencao"
                  placeholder="Descrição breve da manutenção"
                />
                )}
              </FormFieldGroup>
            </FormSection>

            {/* Seção: Classificação */}
            {(isFieldEnabled("tipo") || isFieldEnabled("categoria") || isFieldEnabled("prioridade")) && (
            <FormSection title="Classificação" icon={Flag} iconColor="text-amber-500" variant="subtle">
              <FormFieldGroup columns={2}>
                {isFieldEnabled("tipo") && (
                <div>
                  <StyledLabel icon={Wrench}>Tipo de Manutenção</StyledLabel>
                  <Select
                    value={formData.tipo}
                    onValueChange={(v) => setFormData({ ...formData, tipo: v as any })}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventiva">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Preventiva
                        </div>
                      </SelectItem>
                      <SelectItem value="corretiva">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Corretiva
                        </div>
                      </SelectItem>
                      <SelectItem value="emergencial">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          Emergencial
                        </div>
                      </SelectItem>
                      <SelectItem value="programada">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Programada
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                )}
                {isFieldEnabled("categoria") && (
                <div>
                  <StyledLabel icon={Tag}>Categoria</StyledLabel>
                  <Select
                    value={formData.categoria || ""}
                    onValueChange={(v) => setFormData({ ...formData, categoria: v })}
                  >
                    <SelectTrigger className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eletrica">Elétrica</SelectItem>
                      <SelectItem value="hidraulica">Hidráulica</SelectItem>
                      <SelectItem value="estrutural">Estrutural</SelectItem>
                      <SelectItem value="pintura">Pintura</SelectItem>
                      <SelectItem value="climatizacao">Climatização</SelectItem>
                      <SelectItem value="elevador">Elevador</SelectItem>
                      <SelectItem value="jardinagem">Jardinagem</SelectItem>
                      <SelectItem value="limpeza">Limpeza</SelectItem>
                      <SelectItem value="seguranca">Segurança</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
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
              
              <div className="mt-4">
                <StyledLabel icon={CheckSquare}>Status Inicial</StyledLabel>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as any })}
                >
                  <SelectTrigger className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="realizada">Realizada</SelectItem>
                    <SelectItem value="acao_necessaria">Ação Necessária</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormSection>
            )}

            {/* Seção: Atribuição */}
            {(isFieldEnabled("responsavel") || isFieldEnabled("localizacao_texto") || isFieldEnabled("fornecedor")) && (
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
                  placeholder="Local da manutenção"
                />
                )}
              </FormFieldGroup>
              {isFieldEnabled("fornecedor") && (
              <div className="mt-4">
                <InputWithSave
                  label="Fornecedor"
                  value={formData.fornecedor}
                  onChange={(v) => setFormData({ ...formData, fornecedor: v })}
                  condominioId={condominioId}
                  tipo="fornecedor"
                  placeholder="Nome do fornecedor ou empresa"
                />
              </div>
              )}
            </FormSection>
            )}

            {/* Seção: Agendamento e Custo */}
            {isFieldEnabled("data_agendada") && (
            <FormSection title="Agendamento e Custo" icon={Calendar} iconColor="text-rose-500" variant="subtle">
              <FormFieldGroup columns={2}>
                <div>
                  <StyledLabel icon={Calendar}>Data Agendada</StyledLabel>
                  <Input
                    type="datetime-local"
                    value={formData.dataAgendada}
                    onChange={(e) => setFormData({ ...formData, dataAgendada: e.target.value })}
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <StyledLabel icon={Clock}>Tempo Estimado de Reparação</StyledLabel>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Dias</label>
                      <Select 
                        value={String(formData.tempoEstimadoDias)} 
                        onValueChange={(v) => setFormData({ ...formData, tempoEstimadoDias: parseInt(v) })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Horas</label>
                      <Select 
                        value={String(formData.tempoEstimadoHoras)} 
                        onValueChange={(v) => setFormData({ ...formData, tempoEstimadoHoras: parseInt(v) })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 mb-1 block">Minutos</label>
                      <Select 
                        value={String(formData.tempoEstimadoMinutos)} 
                        onValueChange={(v) => setFormData({ ...formData, tempoEstimadoMinutos: parseInt(v) })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="0" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, i) => (
                            <SelectItem key={i} value={String(i)}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </FormFieldGroup>
            </FormSection>
            )}

            {/* Seção: Galeria e Descrição */}
            {(isFieldEnabled("descricao") || isFieldEnabled("observacoes") || isFieldEnabled("imagens")) && (
            <FormSection title="Galeria e Descrição" icon={Image} iconColor="text-pink-500">
              {(isFieldEnabled("descricao") || isFieldEnabled("observacoes")) && (
              <div className="space-y-4">
                {isFieldEnabled("descricao") && (
                <InputWithSave
                  label="Descrição"
                  value={formData.descricao}
                  onChange={(v) => setFormData({ ...formData, descricao: v })}
                  condominioId={condominioId}
                  tipo="descricao_manutencao"
                  placeholder="Descreva os detalhes da manutenção..."
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
                  tipo="observacoes_manutencao"
                  placeholder="Observações adicionais..."
                  multiline
                  rows={2}
                />
                )}
              </div>
              )}

              {isFieldEnabled("imagens") && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Label className="mb-2 block text-sm font-semibold text-gray-700">Imagens</Label>
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

            {/* Seção: Controle de Manutenção */}
            {(isFieldEnabled("controle_tempo") || isFieldEnabled("geolocalizacao")) && (
            <FormSection title="Controle de Manutenção" icon={Clock} iconColor="text-orange-500" variant="highlight">
              {/* Botões Iniciar/Terminar */}
              {isFieldEnabled("controle_tempo") && (
              <>
              <div className="flex gap-3 mb-4">
                {!manutencaoIniciada ? (
                  <GradientButton type="button" onClick={iniciarManutencao} variant="success" icon={Play}>
                    Iniciar Manutenção
                  </GradientButton>
                ) : (
                  <>
                    <GradientButton type="button" onClick={terminarManutencao} variant="danger" icon={Square}>
                      Terminar Manutenção
                    </GradientButton>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-100">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Iniciada às {horaInicio?.toLocaleTimeString("pt-BR")}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Informações de tempo */}
              {duracaoManutencao && (
                <div className="bg-white p-4 rounded-lg border border-orange-100 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Duração</p>
                      <p className="font-semibold text-orange-600">{duracaoManutencao}</p>
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
              </>
              )}

              {/* Botão de Geolocalização */}
              {isFieldEnabled("geolocalizacao") && (
              <>
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

              {/* Exibir coordenadas e endereço */}
              {formData.geoLatitude && formData.geoLongitude && (
                <LocationMiniMap
                  latitude={formData.geoLatitude}
                  longitude={formData.geoLongitude}
                  endereco={formData.geoEndereco}
                  height={180}
                />
              )}
              </>
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
          <div className="bg-white border-t border-gray-100 px-4 py-4 sm:px-6 mt-4">
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDialog(false)}
                className="w-full sm:w-auto px-5 h-11 border-gray-200 hover:bg-gray-50 bg-white"
              >
                Cancelar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleSubmit("rascunho")}
                disabled={createMutation.isPending}
                className="w-full sm:w-auto px-5 h-11 border-amber-200 text-amber-700 hover:bg-amber-50 bg-white"
              >
                Salvar Rascunho
              </Button>
              <GradientButton 
                onClick={() => handleSubmit("pendente")} 
                disabled={createMutation.isPending}
                variant="warning"
                size="lg"
                icon={CheckSquare}
                loading={createMutation.isPending}
                className="w-full sm:w-auto"
              >
                {createMutation.isPending ? "Criando..." : "Criar Manutenção"}
              </GradientButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="w-[95vw] max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden gap-0">
          {/* Header Premium com decoração */}
          <div className="relative bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600 px-6 py-5 shrink-0 overflow-hidden">
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-300/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            
            <DialogHeader className="relative space-y-1">
              <DialogTitle className="flex items-center gap-3 text-white text-lg">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Detalhes da Manutenção</p>
                  <p className="text-xs text-white/70 font-normal">{selectedManutencao?.protocolo || ''}</p>
                </div>
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
          {selectedManutencao && (
            <div className="space-y-6">
              <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{selectedManutencao.titulo}</CardTitle>
                      {selectedManutencao.subtitulo && (
                        <p className="text-gray-500 mt-1">{selectedManutencao.subtitulo}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                       <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 mr-2"
                        onClick={() => {
                           setShowDetailDialog(false);
                           setShowShareEquipeModal(true);
                        }}
                      >
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Compartilhar Equipe</span>
                      </Button>
                      <StatusBadge status={selectedManutencao.status} size="md" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Seção de Descrição e Observações */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Descrição</h4>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {selectedManutencao.descricao || "Sem descrição informada."}
                      </p>
                    </div>
                    {selectedManutencao.observacoes && (
                      <div className="pt-3 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-1">Observações</h4>
                        <p className="text-gray-600 whitespace-pre-wrap">{selectedManutencao.observacoes}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2">
                    <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                      <p className="text-blue-600 font-medium text-xs mb-1">Tipo</p>
                      <p className="font-semibold capitalize text-gray-700">{selectedManutencao.tipo || "-"}</p>
                    </div>
                    <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                      <p className="text-purple-600 font-medium text-xs mb-1">Prioridade</p>
                      <p className="font-semibold capitalize text-gray-700">{selectedManutencao.prioridade || "Média"}</p>
                    </div>
                    <div className="p-3 bg-orange-50/50 rounded-lg border border-orange-100">
                      <p className="text-orange-600 font-medium text-xs mb-1">Responsável</p>
                      <p className="font-semibold text-gray-700">{selectedManutencao.responsavelNome || "-"}</p>
                    </div>
                    <div className="p-3 bg-green-50/50 rounded-lg border border-green-100">
                      <p className="text-green-600 font-medium text-xs mb-1">Fornecedor</p>
                      <p className="font-semibold text-gray-700">{selectedManutencao.fornecedor || "-"}</p>
                    </div>
                  </div>

                  {selectedManutencao.localizacao && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                      <MapPin className="h-4 w-4" />
                      Local: {selectedManutencao.localizacao}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm">Alterar Status:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            handleStatusChange(selectedManutencao.id, s);
                            setSelectedManutencao({ ...selectedManutencao, status: s });
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

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Image className="h-5 w-5 text-gray-500" />
                    Galeria de Imagens
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {manutencaoImagens.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {manutencaoImagens.map((img) => (
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

              {/* Anexos (PDF/Documentos) */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-indigo-500" />
                    Anexos (Documentos)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {manutencaoAnexos.length > 0 ? (
                    <div className="space-y-2">
                      {manutencaoAnexos.map((anexo) => {
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
          </div>
          
          <div className="p-4 border-t bg-white shrink-0">
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                   setShowDetailDialog(false);
                   setShowShareEquipeModal(true);
                }}
                className="gap-2"
              >
                <Users className="h-4 w-4" />
                Compartilhar com Equipe
              </Button>
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
        tipo="manutencao"
        itemId={selectedManutencao?.id || 0}
        itemTitulo={selectedManutencao?.titulo || ""}
        itemProtocolo={selectedManutencao?.protocolo || ""}
        condominioId={condominioId}
      />

      {/* Modal de Compartilhar com Equipe */}
      <CompartilharComEquipe
        condominioId={condominioId}
        tipo="manutencao"
        itemId={selectedManutencao?.id || 0}
        itemTitulo={selectedManutencao?.titulo || ""}
        itemDescricao={selectedManutencao?.descricao || ""}
        open={showShareEquipeModal}
        onOpenChange={setShowShareEquipeModal}
      />

      {/* Modal de Manutenção Rápida */}
      <TarefasSimplesModal
        open={showManutencaoRapida}
        onOpenChange={setShowManutencaoRapida}
        condominioId={condominioId}
        tipoInicial="manutencao"
        onSuccess={() => {
          utils.manutencao.list.invalidate();
        }}
      />

      {/* Modal de Relatório Avançado */}
      <ReportGeneratorModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        tipoFuncao="manutencao"
        filters={filters}
        items={filteredManutencoes}
        onGenerate={generateReportWithConfig}
        availableFields={availableFields}
        organizationName={condominio?.nome}
        organizationLogo={condominio?.logoUrl}
      />
    </div>
  );
}
