import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { FunctionTutorialButton } from "@/components/FunctionTutorial";
import { IndiceFuncoesButton } from "@/components/IndiceFuncoesButton";
import { FieldSettingsButton } from "@/components/FieldSettingsModal";
import { useFieldSettings } from "@/hooks/useFieldSettings";
import { AssinaturaDigitalSection } from "@/components/AssinaturaDigitalSection";
import { LocationMiniMap } from "@/components/LocationMiniMap";
import { ShareModal } from "@/components/ShareModal";
import { CompartilharComEquipe } from "@/components/CompartilharComEquipe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  ListChecks, 
  FileText, 
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  CheckSquare,
  Square,
  Trash2,
  Printer,
  AlertTriangle,
  Camera,
  X,
  Save,
  BookTemplate,
  FileCheck,
  User,
  MapPin,
  Calendar,
  Flag,
  AlignLeft,
  Image,
  Sparkles,
  ClipboardList
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
  InfoCard,
} from "@/components/ui/form-modal";
import QRCodeSection from "@/components/QRCodeSection";
import AnexosSection, { Anexo } from "@/components/AnexosSection";
import PrazoConclusaoField from "@/components/PrazoConclusaoField";
import { QrCode, CalendarClock, Paperclip } from "lucide-react";

interface ChecklistsPageProps {
  condominioId: number;
}

export default function ChecklistsPage({ condominioId }: ChecklistsPageProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showShareEquipeModal, setShowShareEquipeModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [searchProtocolo, setSearchProtocolo] = useState("");
  const { filters, setFilters } = useReportFilters();
  const [newComment, setNewComment] = useState("");
  const [newItemTexto, setNewItemTexto] = useState("");
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [selectedItemForProblem, setSelectedItemForProblem] = useState<any>(null);
  const [problemData, setProblemData] = useState({
    titulo: "",
    descricao: "",
    imagens: [] as string[]
  });
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [saveTemplateData, setSaveTemplateData] = useState({
    nome: "",
    descricao: "",
    categoria: ""
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
  const [itens, setItens] = useState<{ texto: string; completo: boolean }[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [assinaturaTecnico, setAssinaturaTecnico] = useState("");
  const [assinaturaSolicitante, setAssinaturaSolicitante] = useState("");

  const utils = trpc.useUtils();

  // Hook para configuração de campos - determina quais campos mostrar
  const { isFieldEnabled, refetch: refetchFieldSettings } = useFieldSettings({
    condominioId,
    modalType: "completa",
    functionType: "checklist",
    enabled: showDialog && condominioId > 0,
  });

  // Buscar dados da organização para obter o logo
  const { data: condominio } = trpc.condominio.get.useQuery(
    { id: condominioId },
    { enabled: !!condominioId }
  );

  // Query de templates
  const { data: templates = [] } = trpc.checklist.listTemplates.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: checklists = [], isLoading } = trpc.checklist.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: stats } = trpc.checklist.getStats.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  const { data: searchResults = [] } = trpc.checklist.searchByProtocolo.useQuery(
    { protocolo: searchProtocolo, condominioId },
    { enabled: !!searchProtocolo && searchProtocolo.length >= 3 }
  );
  
  const { data: timeline = [] } = trpc.checklist.getTimeline.useQuery(
    { checklistId: selectedChecklist?.id },
    { enabled: !!selectedChecklist?.id }
  );
  
  const { data: checklistImagens = [] } = trpc.checklist.getImagens.useQuery(
    { checklistId: selectedChecklist?.id },
    { enabled: !!selectedChecklist?.id }
  );

  const { data: checklistAnexos = [] } = trpc.checklist.getAnexos.useQuery(
    { checklistId: selectedChecklist?.id },
    { enabled: !!selectedChecklist?.id }
  );

  const { data: checklistItens = [] } = trpc.checklist.getItens.useQuery(
    { checklistId: selectedChecklist?.id },
    { enabled: !!selectedChecklist?.id }
  );

  const createMutation = trpc.checklist.create.useMutation({
    onSuccess: async (result) => {
      // Adicionar itens
      for (const item of itens) {
        await addItemMutation.mutateAsync({ 
          checklistId: result.id, 
          descricao: item.texto
        });
      }
      // Adicionar imagens com legendas
      for (const img of imagensComLegendas) {
        await addImagemMutation.mutateAsync({ checklistId: result.id, url: img.url, legenda: img.legenda });
      }
      // Salvar anexos (PDF, documentos)
      for (const anexo of anexos) {
        await addAnexoMutation.mutateAsync({
          checklistId: result.id,
          nome: anexo.nome,
          url: anexo.url,
          tipo: anexo.tipo,
          tamanho: anexo.tamanho,
        });
      }
      toast.success(`Checklist criado! Protocolo: ${result.protocolo}`);
      setShowDialog(false);
      resetForm();
      utils.checklist.list.invalidate();
      utils.checklist.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao criar checklist"),
  });

  const updateMutation = trpc.checklist.update.useMutation({
    onSuccess: () => {
      toast.success("Checklist atualizado!");
      utils.checklist.list.invalidate();
      utils.checklist.getStats.invalidate();
      utils.checklist.getTimeline.invalidate();
    },
    onError: () => toast.error("Erro ao atualizar checklist"),
  });

  const deleteMutation = trpc.checklist.delete.useMutation({
    onSuccess: () => {
      toast.success("Checklist excluído!");
      setShowDetailDialog(false);
      setSelectedChecklist(null);
      utils.checklist.list.invalidate();
      utils.checklist.getStats.invalidate();
    },
    onError: () => toast.error("Erro ao excluir checklist"),
  });

  const addImagemMutation = trpc.checklist.addImagem.useMutation({
    onSuccess: () => {
      utils.checklist.getImagens.invalidate();
      utils.checklist.getTimeline.invalidate();
    },
  });

  const addAnexoMutation = trpc.checklist.addAnexo.useMutation({
    onSuccess: () => {
      utils.checklist.getAnexos.invalidate();
    },
  });

  const removeAnexoMutation = trpc.checklist.removeAnexo.useMutation({
    onSuccess: () => {
      utils.checklist.getAnexos.invalidate();
      toast.success("Anexo removido!");
    },
  });

  const addItemMutation = trpc.checklist.addItem.useMutation({
    onSuccess: () => {
      utils.checklist.getItens.invalidate();
      utils.checklist.getTimeline.invalidate();
      setNewItemTexto("");
    },
  });

  const updateItemMutation = trpc.checklist.updateItem.useMutation({
    onSuccess: () => {
      utils.checklist.getItens.invalidate();
      utils.checklist.getTimeline.invalidate();
    },
  });

  // deleteItem mutation removido - usar updateItem com flag deleted

  const addTimelineEventMutation = trpc.checklist.addTimelineEvent.useMutation({
    onSuccess: () => {
      setNewComment("");
      utils.checklist.getTimeline.invalidate();
      toast.success("Comentário adicionado!");
    },
  });

  const createTemplateMutation = trpc.checklist.createTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template salvo com sucesso! Agora você pode reutilizá-lo em novos checklists.");
      setShowSaveTemplateModal(false);
      setSaveTemplateData({ nome: "", descricao: "", categoria: "" });
      utils.checklist.listTemplates.invalidate();
    },
    onError: () => toast.error("Erro ao salvar template"),
  });

  const deleteTemplateMutation = trpc.checklist.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template excluído!");
      utils.checklist.listTemplates.invalidate();
    },
    onError: () => toast.error("Erro ao excluir template"),
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
    setItens([]);
    setSelectedTemplateId(null);
  };

  // Função para aplicar template selecionado
  const handleTemplateSelect = (templateId: string) => {
    if (templateId === "none") {
      setSelectedTemplateId(null);
      setItens([]);
      return;
    }
    const id = parseInt(templateId);
    setSelectedTemplateId(id);
    const template = templates.find((t: any) => t.id === id);
    if (template && template.itens) {
      setItens(template.itens.map((item: any) => ({ texto: item.descricao, completo: false })));
      if (template.nome && !formData.titulo) {
        setFormData(prev => ({ ...prev, titulo: template.nome }));
      }
      if (template.categoria && !formData.categoria) {
        setFormData(prev => ({ ...prev, categoria: template.categoria || "" }));
      }
    }
  };

  const handleSubmit = (customStatus: string = "pendente") => {
    if (!formData.titulo) {
      toast.error("Título é obrigatório");
      return;
    }
    // @ts-ignore
    createMutation.mutate({ ...formData, condominioId, status: customStatus, assinaturaTecnico, assinaturaSolicitante });
  };

  const handleStatusChange = (checklistId: number, newStatus: string) => {
    updateMutation.mutate({ id: checklistId, status: newStatus as any });
  };

  const handleSaveAsTemplate = () => {
    if (!selectedChecklist) return;
    // Preencher dados do modal com informações do checklist
    setSaveTemplateData({
      nome: selectedChecklist.titulo || "",
      descricao: selectedChecklist.descricao || "",
      categoria: selectedChecklist.categoria || ""
    });
    setShowSaveTemplateModal(true);
  };

  const handleConfirmSaveTemplate = async () => {
    if (!saveTemplateData.nome.trim()) {
      toast.error("Nome do template é obrigatório");
      return;
    }
    if (!selectedChecklist) return;
    
    // Buscar itens do checklist atual
    const itensDoChecklist = checklistItens.map(item => item.descricao);
    
    if (itensDoChecklist.length === 0) {
      toast.error("O checklist precisa ter pelo menos um item para salvar como template");
      return;
    }
    
    createTemplateMutation.mutate({
      condominioId,
      nome: saveTemplateData.nome,
      descricao: saveTemplateData.descricao || undefined,
      categoria: saveTemplateData.categoria || undefined,
      isPadrao: false,
      itens: itensDoChecklist
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedChecklist) return;
    addTimelineEventMutation.mutate({
      checklistId: selectedChecklist.id,
      tipo: "comentario",
      descricao: newComment,
    });
  };

  const handleAddImage = async (url: string) => {
    if (!selectedChecklist) return;
    await addImagemMutation.mutateAsync({
      checklistId: selectedChecklist.id,
      url,
    });
  };

  const handleAddItem = () => {
    if (!newItemTexto.trim()) return;
    if (selectedChecklist) {
      addItemMutation.mutate({
        checklistId: selectedChecklist.id,
        descricao: newItemTexto,
      });
    } else {
      setItens([...itens, { texto: newItemTexto, completo: false }]);
      setNewItemTexto("");
    }
  };

  const handleToggleItem = (itemId: number, completo: boolean) => {
    updateItemMutation.mutate({ id: itemId, completo: !completo });
  };

  const filteredChecklists = searchProtocolo.length >= 3 
    ? searchResults 
    : applyFilters(checklists, filters, {
        searchFields: ["protocolo", "titulo", "descricao"],
        statusField: "status",
        responsavelField: "responsavelNome",
        prioridadeField: "prioridade",
        dateField: "createdAt",
      });

  const getProgress = (checklist: any) => {
    if (!checklist.totalItens || checklist.totalItens === 0) return 0;
    return Math.round((checklist.itensCompletos / checklist.totalItens) * 100);
  };

  const handleGeneratePDF = async () => {
    if (selectedChecklist) {
      const { generateChecklistReport } = await loadPdfGenerator();
      await generateChecklistReport(selectedChecklist, timeline, checklistImagens, checklistItens, {
        logoUrl: condominio?.logoUrl || '',
        companyName: condominio?.nome || '',
      });
    } else {
      toast.info("Selecione um checklist para gerar o PDF");
    }
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  // Gerar relatório com configurações
  const generateReportWithConfig = (config: ReportConfig) => {
    const html = generateReportHTML(filteredChecklists, config, condominio?.logoUrl);
    printReport(html);
    setShowReportModal(false);
  };

  // Lista de responsáveis únicos
  const responsaveisUnicos = checklists
    .map(c => c.responsavelNome)
    .filter((r): r is string => !!r && r.trim() !== "");

  // Campos disponíveis para relatório
  const availableFields = [
    { key: "protocolo", label: "Protocolo", included: true },
    { key: "titulo", label: "Título", included: true },
    { key: "status", label: "Status", included: true },
    { key: "responsavelNome", label: "Responsável", included: true },
    { key: "localizacao", label: "Localização", included: true },
    { key: "prioridade", label: "Prioridade", included: true },
    { key: "categoria", label: "Categoria", included: true },
    { key: "dataAgendada", label: "Data Agendada", included: true },
    { key: "itensCompletos", label: "Itens Completos", included: true },
    { key: "totalItens", label: "Total de Itens", included: true },
    { key: "createdAt", label: "Data Criação", included: true },
  ];

  return (
    <div className="space-y-5 pb-32">
      {/* Header Premium */}
      <div data-tour="header-checklists" className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 p-5 shadow-xl">
        {/* Decoração de fundo */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl">
              <ListChecks className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">Checklists</h2>
              <p className="text-white/70 text-sm">Gerencie checklists e listas de verificação</p>
            </div>
            <div className="flex items-center gap-2">
              <IndiceFuncoesButton />
              <FunctionTutorialButton tutorialId="checklists" />
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
              data-tour="btn-novo-checklist"
              size="sm" 
              onClick={() => setShowDialog(true)} 
              className="bg-white text-purple-700 hover:bg-white/90 font-semibold shadow-lg"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Novo Checklist
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
        totalResults={checklists.length}
        filteredResults={filteredChecklists.length}
      />
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-500" />
          <p className="text-sm text-slate-500 mt-2">Carregando checklists...</p>
        </div>
      ) : filteredChecklists.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center border border-slate-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-50" />
          <ListChecks className="h-16 w-16 mx-auto text-purple-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhum checklist encontrado</h3>
          <p className="text-slate-500 mb-4">Comece criando seu primeiro checklist de verificação</p>
          <Button 
            onClick={() => setShowDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-1" />
            Criar primeiro checklist
          </Button>
        </div>
      ) : (
        <div data-tour="lista-itens" className="grid gap-3">
          {filteredChecklists.map((checklist) => (
            <ProtocolCard
              key={checklist.id}
              protocolo={checklist.protocolo}
              titulo={checklist.titulo}
              subtitulo={checklist.subtitulo}
              descricao={checklist.descricao}
              observacoes={checklist.observacoes}
              status={checklist.status}
              prioridade={checklist.prioridade}
              responsavelNome={checklist.responsavelNome}
              localizacao={checklist.localizacao}
              dataAgendada={checklist.dataAgendada}
              dataRealizada={checklist.dataRealizada}
              createdAt={checklist.createdAt}
              
              onView={() => {
                setSelectedChecklist(checklist);
                setShowDetailDialog(true);
              }}
              onEdit={() => {
                setSelectedChecklist(checklist);
                setShowDetailDialog(true);
              }}
              onDelete={() => {
                if (confirm("Tem certeza que deseja excluir este checklist?")) {
                  deleteMutation.mutate({ id: checklist.id });
                }
              }}
              onShare={() => {
                setSelectedChecklist(checklist);
                setShowShareModal(true);
              }}
              onShareEquipe={() => {
                setSelectedChecklist(checklist);
                setShowShareEquipeModal(true);
              }}
              onPdf={async () => {
                const imagens = await utils.checklist.getImagens.fetch({ checklistId: checklist.id });
                const itens = await utils.checklist.getItens.fetch({ checklistId: checklist.id });
                const { generateChecklistReport } = await loadPdfGenerator();
                await generateChecklistReport(checklist, [], imagens || [], itens || [], {
                  logoUrl: condominio?.logoUrl || '',
                  companyName: condominio?.nome || '',
                });
              }}
              extra={
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                  {/* Barra de progresso moderna */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-600">Progresso</span>
                      <span className="text-purple-600 font-semibold">{checklist.itensCompletos || 0}/{checklist.totalItens || 0} itens</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all rounded-full"
                        style={{ width: `${getProgress(checklist)}%` }}
                      />
                    </div>
                  </div>
                  {/* Status rápido */}
                  <div>
                    <Label className="text-xs font-medium text-slate-500 mb-1.5 block">Alterar Status:</Label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(checklist.id, s)}
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

      {/* Dialog Novo Checklist */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Novo Checklist</DialogTitle>
          </DialogHeader>
          {/* Header Premium */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-3 sm:px-6 py-4">
            <FormModalHeader
              icon={ClipboardList}
              iconColor="text-emerald-600"
              iconBgColor="bg-gradient-to-br from-emerald-100 to-teal-100"
              title="Novo Checklist"
              subtitle="Crie uma lista de verificações para a manutenção"
            />
          </div>

          <div className="px-3 sm:px-6 py-5 space-y-5 overflow-x-hidden">
            {/* Botão de Configuração de Campos */}
            <div className="flex justify-end">
              <FieldSettingsButton
                condominioId={condominioId}
                modalType="completa"
                functionType="checklist"
                variant="full"
              />
            </div>

            {/* Seletor de Template */}
            {templates.length > 0 && (
              <InfoCard
                icon={Sparkles}
                iconColor="text-blue-600"
                bgColor="bg-gradient-to-br from-blue-50 to-indigo-50"
                borderColor="border-blue-200"
                title="Usar Template Pré-definido"
                description="Selecione um template para preencher automaticamente os itens"
              >
                <Select
                  value={selectedTemplateId?.toString() || "none"}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger className="bg-white border-blue-200 focus:ring-blue-500">
                    <SelectValue placeholder="Selecione um template..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum (criar do zero)</SelectItem>
                    {templates.map((template: any) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{template.nome}</span>
                          {template.isPadrao ? (
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Padrão</span>
                          ) : (
                            <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-medium">Personalizado</span>
                          )}
                          <span className="text-xs text-gray-500">({template.itens?.length || 0} itens)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Lista de templates personalizados com opção de excluir */}
                {templates.filter((t: any) => !t.isPadrao).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200/50">
                    <p className="text-xs text-blue-700 font-medium mb-2">Seus templates personalizados:</p>
                    <div className="space-y-1">
                      {templates.filter((t: any) => !t.isPadrao).map((template: any) => (
                        <div key={template.id} className="flex items-center justify-between bg-white/80 rounded-lg px-3 py-2 text-sm shadow-sm">
                          <span className="text-gray-700 font-medium">{template.nome}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Excluir template "${template.nome}"?`)) {
                                deleteTemplateMutation.mutate({ id: template.id });
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </InfoCard>
            )}

            {/* Seção: Informações Básicas */}
            <FormSection title="Informações Básicas" icon={FileText} iconColor="text-blue-500">
              <FormFieldGroup columns={1}>
                <div>
                  <StyledLabel required icon={FileCheck}>Título</StyledLabel>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Checklist de Abertura da Piscina"
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                {isFieldEnabled("subtitulo") && (
                <div>
                  <StyledLabel>Subtítulo</StyledLabel>
                  <Input
                    value={formData.subtitulo}
                    onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                    placeholder="Descrição breve do checklist"
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                )}
              </FormFieldGroup>
            </FormSection>

            {/* Seção: Classificação */}
            {(isFieldEnabled("tipo") || isFieldEnabled("categoria")) && (
            <FormSection title="Classificação" icon={Flag} iconColor="text-amber-500" variant="subtle">
              <FormFieldGroup columns={2}>
                {isFieldEnabled("tipo") && (
                <InputWithSave
                  label="Tipo"
                  value={formData.tipo}
                  onChange={(v) => setFormData({ ...formData, tipo: v })}
                  condominioId={condominioId}
                  tipo="tipo_checklist"
                  placeholder="Ex: Diário, Semanal"
                />
                )}
                {isFieldEnabled("categoria") && (
                <InputWithSave
                  label="Categoria"
                  value={formData.categoria}
                  onChange={(v) => setFormData({ ...formData, categoria: v })}
                  condominioId={condominioId}
                  tipo="categoria_checklist"
                  placeholder="Ex: Segurança, Limpeza"
                />
                )}
              </FormFieldGroup>
            </FormSection>
            )}

            {/* Seção: Atribuição */}
            {(isFieldEnabled("responsavel") || isFieldEnabled("localizacao") || isFieldEnabled("geolocalizacao")) && (
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
                {isFieldEnabled("localizacao") && (
                <InputWithSave
                  label="Localização"
                  value={formData.localizacao}
                  onChange={(v) => setFormData({ ...formData, localizacao: v })}
                  condominioId={condominioId}
                  tipo="localizacao"
                  placeholder="Local da verificação"
                />
                )}
              </FormFieldGroup>
              
              {/* Mini-mapa de localização */}
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

            {/* Seção: Agendamento */}
            {(isFieldEnabled("data_agendada") || isFieldEnabled("prioridade") || isFieldEnabled("descricao")) && (
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
              {isFieldEnabled("descricao") && (
              <div>
                <StyledLabel icon={AlignLeft}>Descrição</StyledLabel>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={2}
                  placeholder="Descreva os detalhes do checklist..."
                  className="border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>
              )}
            </FormSection>
            )}

            {/* Seção: Itens do Checklist */}
            {isFieldEnabled("itensChecklist") && (
            <FormSection title="Itens do Checklist" icon={ListChecks} iconColor="text-emerald-500" variant="highlight">
              <div className="space-y-2">
                {itens.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <ListChecks className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Nenhum item adicionado</p>
                    <p className="text-xs text-gray-400">Adicione itens usando o campo abaixo</p>
                  </div>
                ) : (
                  itens.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <Checkbox
                        checked={item.completo ?? false}
                        onCheckedChange={(checked) => {
                          const newItens = [...itens];
                          newItens[index].completo = !!checked;
                          setItens(newItens);
                        }}
                        className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <span className={`flex-1 ${item.completo ? "line-through text-gray-400" : "text-gray-700"}`}>
                        {item.texto}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                        onClick={() => setItens(itens.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
                <div className="flex gap-2 mt-3">
                  <Input
                    value={newItemTexto}
                    onChange={(e) => setNewItemTexto(e.target.value)}
                    placeholder="Digite um item e pressione Enter..."
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                    className="h-11 border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                  <GradientButton onClick={handleAddItem} variant="success" size="md">
                    <Plus className="h-4 w-4" />
                  </GradientButton>
                </div>
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
                showLegendas={true}
                maxImages={10}
              />
              
              {/* Seção dedicada para edição de imagens */}
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
                variant="success"
                size="lg"
                icon={CheckSquare}
                loading={createMutation.isPending}
              >
                {createMutation.isPending ? "Criando..." : "Criar Checklist"}
              </GradientButton>
            </FormActions>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Detalhes */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                Detalhes do Checklist
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
          {selectedChecklist && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono text-muted-foreground">
                        {selectedChecklist.protocolo}
                      </p>
                      <CardTitle>{selectedChecklist.titulo}</CardTitle>
                    </div>
                    <StatusBadge status={selectedChecklist.status} size="md" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tipo</p>
                      <p className="font-medium">{selectedChecklist.tipo || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Categoria</p>
                      <p className="font-medium">{selectedChecklist.categoria || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Responsável</p>
                      <p className="font-medium">{selectedChecklist.responsavelNome || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Localização</p>
                      <p className="font-medium">{selectedChecklist.localizacao || "-"}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <Label className="text-sm font-semibold text-slate-700 mb-2 block">Alterar Status:</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {["pendente", "realizada", "acao_necessaria", "finalizada", "reaberta"].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            handleStatusChange(selectedChecklist.id, s);
                            setSelectedChecklist({ ...selectedChecklist, status: s });
                          }}
                          className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        >
                          <StatusBadge status={s} size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Itens do Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    Itens do Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {checklistItens.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors border-l-4 border-l-blue-500"
                      >
                        {/* Área clicável - checkbox e texto */}
                        <div 
                          className="flex items-center gap-3 flex-1 cursor-pointer p-2 -m-2 rounded-lg hover:bg-blue-50 border-2 border-dashed border-transparent hover:border-blue-300 transition-all min-w-0"
                          onClick={() => handleToggleItem(item.id, item.completo ?? false)}
                          title="Clique para marcar/desmarcar"
                        >
                          <Checkbox
                            checked={item.completo ?? false}
                            onCheckedChange={() => handleToggleItem(item.id, item.completo ?? false)}
                            className="pointer-events-none shrink-0"
                          />
                          <span className={`flex-1 text-sm break-words ${item.completo ? "line-through text-muted-foreground" : ""}`}>
                            {item.descricao}
                          </span>
                          {item.completo ? (
                            <CheckSquare className="h-4 w-4 text-green-500 shrink-0 hidden sm:block" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                          )}
                        </div>
                        {/* Botões de ação - linha separada no mobile */}
                        <div className="flex items-center gap-2 ml-auto sm:ml-0 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1 text-orange-600 border-orange-300 hover:bg-orange-50 hover:text-orange-700 px-2 sm:px-3"
                            onClick={() => {
                              setSelectedItemForProblem(item);
                              setProblemData({ titulo: "", descricao: "", imagens: [] });
                              setShowProblemModal(true);
                            }}
                            title="Reportar problema"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs hidden sm:inline">Problema</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => toast.info("Item removido")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {checklistItens.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum item no checklist
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Input
                      value={newItemTexto}
                      onChange={(e) => setNewItemTexto(e.target.value)}
                      placeholder="Adicionar novo item..."
                      onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                    />
                    <Button onClick={handleAddItem} disabled={!newItemTexto.trim()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Imagens</CardTitle>
                </CardHeader>
                <CardContent>
                  {checklistImagens.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {checklistImagens.map((img) => (
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
                  {checklistAnexos.length > 0 ? (
                    <div className="space-y-2">
                      {checklistAnexos.map((anexo) => {
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
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              className="gap-2 text-purple-600 border-purple-300 hover:bg-purple-50"
              onClick={handleSaveAsTemplate}
              disabled={checklistItens.length === 0}
            >
              <BookTemplate className="h-4 w-4" />
              Salvar como Template
            </Button>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Compartilhamento */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        tipo="checklist"
        itemId={selectedChecklist?.id || 0}
        itemTitulo={selectedChecklist?.titulo || ""}
        itemProtocolo={selectedChecklist?.protocolo || ""}
        condominioId={condominioId}
      />

      {/* Modal de Compartilhar com Equipe */}
      <CompartilharComEquipe
        condominioId={condominioId}
        tipo="checklist"
        itemId={selectedChecklist?.id || 0}
        itemTitulo={selectedChecklist?.titulo || ""}
        itemDescricao={selectedChecklist?.descricao || ""}
        open={showShareEquipeModal}
        onOpenChange={setShowShareEquipeModal}
      />

      {/* Modal de Reportar Problema */}
      <Dialog open={showProblemModal} onOpenChange={setShowProblemModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                Reportar Problema
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh]">
          {selectedItemForProblem && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Item do checklist:</p>
                <p className="font-medium">{selectedItemForProblem.descricao}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="problemTitulo">Título do Problema *</Label>
                <Input
                  id="problemTitulo"
                  value={problemData.titulo}
                  onChange={(e) => setProblemData({ ...problemData, titulo: e.target.value })}
                  placeholder="Ex: Equipamento danificado"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="problemDescricao">Descrição do Problema *</Label>
                <Textarea
                  id="problemDescricao"
                  value={problemData.descricao}
                  onChange={(e) => setProblemData({ ...problemData, descricao: e.target.value })}
                  placeholder="Descreva o problema encontrado..."
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Fotos do Problema
                </Label>
                <MultiImageUpload
                  value={problemData.imagens}
                  onChange={(imgs: string[]) => setProblemData({ ...problemData, imagens: imgs })}
                  maxImages={5}
                />
              </div>
            </div>
          )}
          
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProblemModal(false)}>
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                onClick={() => {
                  if (!problemData.titulo.trim() || !problemData.descricao.trim()) {
                    toast.error("Preencha o título e a descrição do problema");
                    return;
                  }
                  // Aqui poderia salvar no banco de dados
                  toast.success("Problema reportado com sucesso!");
                  setShowProblemModal(false);
                  setProblemData({ titulo: "", descricao: "", imagens: [] });
                  setSelectedItemForProblem(null);
                }}
                disabled={!problemData.titulo.trim() || !problemData.descricao.trim()}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reportar Problema
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Salvar como Template */}
      <Dialog open={showSaveTemplateModal} onOpenChange={setShowSaveTemplateModal}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
          <div className="bg-gradient-to-r from-purple-500 to-violet-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <BookTemplate className="w-5 h-5 text-white" />
                </div>
                Salvar como Template Personalizado
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-700">
                <strong>Dica:</strong> Ao salvar este checklist como template, você poderá reutilizá-lo 
                rapidamente na criação de novos checklists. Os {checklistItens.length} itens serão salvos.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="templateNome">Nome do Template *</Label>
              <Input
                id="templateNome"
                value={saveTemplateData.nome}
                onChange={(e) => setSaveTemplateData({ ...saveTemplateData, nome: e.target.value })}
                placeholder="Ex: Checklist de Abertura da Piscina"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="templateDescricao">Descrição (opcional)</Label>
              <Textarea
                id="templateDescricao"
                value={saveTemplateData.descricao}
                onChange={(e) => setSaveTemplateData({ ...saveTemplateData, descricao: e.target.value })}
                placeholder="Descreva quando usar este template..."
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="templateCategoria">Categoria (opcional)</Label>
              <Input
                id="templateCategoria"
                value={saveTemplateData.categoria}
                onChange={(e) => setSaveTemplateData({ ...saveTemplateData, categoria: e.target.value })}
                placeholder="Ex: Segurança, Limpeza, Manutenção"
              />
            </div>

            {/* Preview dos itens */}
            <div className="space-y-2">
              <Label>Itens que serão salvos ({checklistItens.length}):</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 bg-muted/50">
                {checklistItens.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-2 py-1 text-sm">
                    <span className="text-muted-foreground">{index + 1}.</span>
                    <span>{item.descricao}</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveTemplateModal(false)}>
                Cancelar
              </Button>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 gap-2"
                onClick={handleConfirmSaveTemplate}
                disabled={!saveTemplateData.nome.trim() || createTemplateMutation.isPending}
              >
                <Save className="h-4 w-4" />
                {createTemplateMutation.isPending ? "Salvando..." : "Salvar Template"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Relatório Avançado */}
      <ReportGeneratorModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        tipoFuncao="checklist"
        filters={filters}
        items={filteredChecklists}
        onGenerate={generateReportWithConfig}
        availableFields={availableFields}
        organizationName={condominio?.nome}
        organizationLogo={condominio?.logoUrl}
      />
    </div>
  );
}
