import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Save,
  Settings,
  Share2,
  Trash2,
  Send,
  Wrench,
  Search,
  AlertTriangle,
  ClipboardCheck,
  Camera,
  FileCheck,
  CalendarClock,
  Award,
  TrendingUp,
  Package,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeftRight,
  Download,
  ScrollText,
  Check,
  Info,
  ListChecks,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "@/components/ui/sonner";

// Tipos de seções disponíveis para o Livro de Manutenção - TODAS as funções do sistema
const sectionTypes = [
  // RESUMO
  { id: "resumo", name: "Resumo do Período", icon: BarChart3, color: "text-blue-500", bgGradient: "from-blue-50 via-indigo-50 to-violet-50", borderColor: "border-blue-100", barGradient: "from-blue-400 via-indigo-500 to-violet-500", categoria: "Resumo" },
  
  // GESTÃO DA MANUTENÇÃO
  { id: "cadastro", name: "Cadastro da Manutenção", icon: FileText, color: "text-blue-600", bgGradient: "from-blue-50 via-blue-100 to-indigo-50", borderColor: "border-blue-200", barGradient: "from-blue-500 via-blue-600 to-indigo-600", categoria: "Gestão" },
  { id: "equipe", name: "Equipe de Gestão", icon: Settings, color: "text-indigo-500", bgGradient: "from-indigo-50 via-purple-50 to-violet-50", borderColor: "border-indigo-100", barGradient: "from-indigo-400 via-purple-500 to-violet-500", categoria: "Gestão" },
  { id: "compartilhamentos", name: "Compartilhamentos", icon: Share2, color: "text-violet-500", bgGradient: "from-violet-50 via-purple-50 to-fuchsia-50", borderColor: "border-violet-100", barGradient: "from-violet-400 via-purple-500 to-fuchsia-500", categoria: "Gestão" },
  
  // OPERACIONAL / MANUTENÇÃO
  { id: "historico", name: "Histórico das Funções", icon: ScrollText, color: "text-amber-500", bgGradient: "from-amber-50 via-yellow-50 to-orange-50", borderColor: "border-amber-100", barGradient: "from-amber-400 via-yellow-500 to-orange-500", categoria: "Operacional" },
  { id: "vistorias", name: "Vistorias Completas", icon: Search, color: "text-emerald-500", bgGradient: "from-emerald-50 via-green-50 to-teal-50", borderColor: "border-emerald-100", barGradient: "from-emerald-400 via-green-500 to-teal-500", categoria: "Operacional" },
  { id: "vistorias_rapidas", name: "Vistorias Rápidas", icon: Search, color: "text-green-400", bgGradient: "from-green-50 via-emerald-50 to-teal-50", borderColor: "border-green-100", barGradient: "from-green-300 via-emerald-400 to-teal-400", categoria: "Operacional" },
  { id: "manutencoes", name: "Manutenções Completas", icon: Wrench, color: "text-slate-600", bgGradient: "from-slate-50 via-gray-50 to-zinc-50", borderColor: "border-slate-200", barGradient: "from-slate-400 via-gray-500 to-zinc-500", categoria: "Operacional" },
  { id: "manutencoes_rapidas", name: "Manutenções Rápidas", icon: Wrench, color: "text-gray-500", bgGradient: "from-gray-50 via-slate-50 to-zinc-50", borderColor: "border-gray-200", barGradient: "from-gray-400 via-slate-400 to-zinc-400", categoria: "Operacional" },
  { id: "ocorrencias", name: "Ocorrências Completas", icon: AlertTriangle, color: "text-yellow-500", bgGradient: "from-yellow-50 via-amber-50 to-orange-50", borderColor: "border-yellow-100", barGradient: "from-yellow-400 via-amber-500 to-orange-500", categoria: "Operacional" },
  { id: "ocorrencias_rapidas", name: "Ocorrências Rápidas", icon: AlertTriangle, color: "text-orange-400", bgGradient: "from-orange-50 via-amber-50 to-yellow-50", borderColor: "border-orange-100", barGradient: "from-orange-300 via-amber-400 to-yellow-400", categoria: "Operacional" },
  { id: "checklists", name: "Checklists Completos", icon: ClipboardCheck, color: "text-teal-500", bgGradient: "from-teal-50 via-cyan-50 to-sky-50", borderColor: "border-teal-100", barGradient: "from-teal-400 via-cyan-500 to-sky-500", categoria: "Operacional" },
  { id: "checklists_rapidos", name: "Checklists Rápidos", icon: ClipboardCheck, color: "text-cyan-400", bgGradient: "from-cyan-50 via-sky-50 to-blue-50", borderColor: "border-cyan-100", barGradient: "from-cyan-300 via-sky-400 to-blue-400", categoria: "Operacional" },
  { id: "templates_checklist", name: "Templates de Checklist", icon: ListChecks, color: "text-sky-500", bgGradient: "from-sky-50 via-blue-50 to-indigo-50", borderColor: "border-sky-100", barGradient: "from-sky-400 via-blue-500 to-indigo-500", categoria: "Operacional" },
  { id: "antes_depois", name: "Antes e Depois Completo", icon: ArrowLeftRight, color: "text-violet-500", bgGradient: "from-violet-50 via-purple-50 to-fuchsia-50", borderColor: "border-violet-100", barGradient: "from-violet-400 via-purple-500 to-fuchsia-500", categoria: "Operacional" },
  { id: "antes_depois_rapido", name: "Antes/Depois Rápido", icon: ArrowLeftRight, color: "text-purple-400", bgGradient: "from-purple-50 via-fuchsia-50 to-pink-50", borderColor: "border-purple-100", barGradient: "from-purple-300 via-fuchsia-400 to-pink-400", categoria: "Operacional" },
  { id: "vencimentos", name: "Agenda de Vencimentos", icon: CalendarClock, color: "text-fuchsia-500", bgGradient: "from-fuchsia-50 via-pink-50 to-rose-50", borderColor: "border-fuchsia-100", barGradient: "from-fuchsia-400 via-pink-500 to-rose-500", categoria: "Operacional" },
  { id: "timeline", name: "Timeline", icon: Clock, color: "text-slate-500", bgGradient: "from-slate-50 via-gray-50 to-zinc-50", borderColor: "border-slate-100", barGradient: "from-slate-400 via-gray-500 to-zinc-500", categoria: "Operacional" },
  { id: "dashboard_timeline", name: "Dashboard Timeline", icon: BarChart3, color: "text-indigo-500", bgGradient: "from-indigo-50 via-purple-50 to-violet-50", borderColor: "border-indigo-100", barGradient: "from-indigo-400 via-purple-500 to-violet-500", categoria: "Operacional" },
  
  // ORDENS DE SERVIÇO
  { id: "ordens_servico", name: "Ordens de Serviço", icon: FileCheck, color: "text-blue-600", bgGradient: "from-blue-50 via-indigo-50 to-violet-50", borderColor: "border-blue-200", barGradient: "from-blue-500 via-indigo-500 to-violet-500", categoria: "OS" },
  { id: "config_os", name: "Configurações de OS", icon: Settings, color: "text-gray-500", bgGradient: "from-gray-50 via-slate-50 to-zinc-50", borderColor: "border-gray-200", barGradient: "from-gray-400 via-slate-500 to-zinc-500", categoria: "OS" },
  
  // GALERIA E MÍDIA
  { id: "galeria", name: "Galeria de Fotos", icon: Camera, color: "text-pink-500", bgGradient: "from-pink-50 via-rose-50 to-red-50", borderColor: "border-pink-100", barGradient: "from-pink-400 via-rose-500 to-red-500", categoria: "Galeria" },
  { id: "realizacoes", name: "Realizações", icon: Award, color: "text-yellow-600", bgGradient: "from-yellow-50 via-amber-50 to-orange-50", borderColor: "border-yellow-200", barGradient: "from-yellow-500 via-amber-500 to-orange-500", categoria: "Galeria" },
  { id: "melhorias", name: "Melhorias", icon: TrendingUp, color: "text-amber-500", bgGradient: "from-amber-50 via-yellow-50 to-lime-50", borderColor: "border-amber-100", barGradient: "from-amber-400 via-yellow-500 to-lime-500", categoria: "Galeria" },
  { id: "aquisicoes", name: "Aquisições", icon: Package, color: "text-green-500", bgGradient: "from-green-50 via-emerald-50 to-teal-50", borderColor: "border-green-100", barGradient: "from-green-400 via-emerald-500 to-teal-500", categoria: "Galeria" },
  
  // BACKUP E DADOS
  { id: "backup", name: "Backup em Nuvem", icon: Download, color: "text-cyan-500", bgGradient: "from-cyan-50 via-sky-50 to-blue-50", borderColor: "border-cyan-100", barGradient: "from-cyan-400 via-sky-500 to-blue-500", categoria: "Dados" },
];

export default function RevistaEditor() {
  const params = useParams<{ id: string }>();
  const revistaId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState("secoes");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  // Estado para secções ocultas
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  
  // Função para alternar visibilidade de uma secção
  const toggleSectionVisibility = (sectionId: string) => {
    setHiddenSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
        toast.success("Seção reativada");
      } else {
        newSet.add(sectionId);
        toast.info("Seção ocultada do livro");
      }
      return newSet;
    });
  };

  // Query para dados da revista
  const { data: revista, isLoading: revistaLoading } = trpc.revista.get.useQuery(
    { id: revistaId },
    { enabled: revistaId > 0 }
  );

  // Query para organização (condomínio)
  const { data: condominios } = trpc.condominio.list.useQuery();
  const selectedCondominio = condominios?.[0];
  const condominioId = selectedCondominio?.id || 0;

  // Queries para dados de manutenção
  const { data: manutencoes, isLoading: manutencoesLoading } = trpc.manutencao.listWithDetails.useQuery(
    { condominioId },
    { enabled: !!selectedCondominio }
  );

  const { data: vistorias, isLoading: vistoriasLoading } = trpc.vistoria.listWithDetails.useQuery(
    { condominioId },
    { enabled: !!selectedCondominio }
  );

  const { data: ocorrencias, isLoading: ocorrenciasLoading } = trpc.ocorrencia.listWithDetails.useQuery(
    { condominioId },
    { enabled: !!selectedCondominio }
  );

  const { data: checklists, isLoading: checklistsLoading } = trpc.checklist.listWithDetails.useQuery(
    { condominioId },
    { enabled: !!selectedCondominio }
  );

  const { data: antesDepois, isLoading: antesDepoisLoading } = trpc.antesDepois.list.useQuery(
    { revistaId },
    { enabled: revistaId > 0 }
  );

  // Queries adicionais para novas seções
  const { data: vencimentos, isLoading: vencimentosLoading } = trpc.vencimentos.proximos.useQuery(
    { condominioId, dias: 90, limite: 20 },
    { enabled: !!selectedCondominio }
  );

  const { data: realizacoes, isLoading: realizacoesLoading } = trpc.realizacao.list.useQuery(
    { revistaId },
    { enabled: revistaId > 0 }
  );

  const { data: melhorias, isLoading: melhoriasLoading } = trpc.melhoria.list.useQuery(
    { revistaId },
    { enabled: revistaId > 0 }
  );

  const { data: aquisicoes, isLoading: aquisicoesLoading } = trpc.aquisicao.list.useQuery(
    { revistaId },
    { enabled: revistaId > 0 }
  );

  const utils = trpc.useUtils();

  const publishMutation = trpc.revista.update.useMutation({
    onSuccess: () => {
      toast.success("Livro de Manutenção publicado com sucesso!");
      utils.revista.get.invalidate({ id: revistaId });
    },
    onError: (error) => {
      toast.error("Erro ao publicar: " + error.message);
    },
  });

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = trpc.revista.generatePDF.useMutation({
    onSuccess: (data) => {
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
      
      toast.success('PDF gerado com sucesso!');
      setIsGeneratingPDF(false);
    },
    onError: (error) => {
      toast.error('Erro ao gerar PDF: ' + error.message);
      setIsGeneratingPDF(false);
    },
  });

  const handleDownloadPDF = () => {
    setIsGeneratingPDF(true);
    generatePDF.mutate({ id: revistaId });
  };


  // Calcular estatísticas
  // Status disponíveis: pendente, realizada, acao_necessaria, finalizada, reaberta
  const estatisticas = useMemo(() => {
    return {
      totalManutencoes: manutencoes?.length || 0,
      manutencoesAtivas: manutencoes?.filter(m => m.status === "pendente" || m.status === "acao_necessaria" || m.status === "reaberta").length || 0,
      manutencoesConcluidas: manutencoes?.filter(m => m.status === "realizada" || m.status === "finalizada").length || 0,
      totalVistorias: vistorias?.length || 0,
      vistoriasAprovadas: vistorias?.filter(v => v.status === "realizada" || v.status === "finalizada").length || 0,
      totalOcorrencias: ocorrencias?.length || 0,
      ocorrenciasAbertas: ocorrencias?.filter(o => o.status === "pendente" || o.status === "acao_necessaria" || o.status === "reaberta").length || 0,
      totalChecklists: checklists?.length || 0,
      checklistsConcluidos: checklists?.filter(c => c.status === "realizada" || c.status === "finalizada").length || 0,
      totalAntesDepois: antesDepois?.length || 0,
    };
  }, [manutencoes, vistorias, ocorrencias, checklists, antesDepois]);

  if (authLoading || revistaLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">A carregar editor...</p>
        </div>
      </div>
    );
  }

  if (!revista) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Livro não encontrado</h2>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Painel
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePublish = () => {
    publishMutation.mutate({ id: revistaId, status: "publicada" });
  };

  const shareUrl = `${window.location.origin}/revista/${revista.shareLink}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copiado!");
  };

  // Função para formatar data
  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluida":
      case "concluido":
      case "aprovada":
      case "resolvida":
        return "bg-emerald-100 text-emerald-700";
      case "em_andamento":
      case "em_analise":
        return "bg-blue-100 text-blue-700";
      case "pendente":
      case "aberta":
        return "bg-amber-100 text-amber-700";
      case "cancelada":
      case "rejeitada":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Função para formatar status
  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex-shrink-0">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-base sm:text-lg font-bold flex items-center gap-2 truncate">
                <Wrench className="w-5 h-5 text-orange-500 flex-shrink-0" />
                <span className="truncate">Livro de Manutenção</span>
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{revista.edicao}</p>
            </div>
          </div>
          {/* Botões de ação - linha separada com scroll horizontal no mobile */}
          <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1 -mb-1 scrollbar-none">
            <Link href={`/revista/${revista.shareLink}?mode=scroll`} className="flex-shrink-0">
              <Button variant="outline" size="sm" title="Visualizar em modo Scroll" className="text-xs px-2.5 h-8">
                <ScrollText className="w-4 h-4 mr-1" />
                Scroll
              </Button>
            </Link>
            <Link href={`/revista/${revista.shareLink}`} className="flex-shrink-0">
              <Button variant="outline" size="sm" title="Visualizar como Livro" className="text-xs px-2.5 h-8">
                <BookOpen className="w-4 h-4 mr-1" />
                Livro
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="text-xs px-2.5 h-8 flex-shrink-0"
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-1" />
              )}
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={copyShareLink} className="text-xs px-2.5 h-8 flex-shrink-0">
              <Share2 className="w-4 h-4 mr-1" />
              Compartilhar
            </Button>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-2.5 h-8 flex-shrink-0"
              onClick={handlePublish}
              disabled={publishMutation.isPending || revista.status === "publicada"}
            >
              {publishMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-1" />
              )}
              {revista.status === "publicada" ? "Publicado" : "Publicar"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 pb-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="secoes">
              <BookOpen className="w-4 h-4 mr-2" />
              Seções
            </TabsTrigger>
            <TabsTrigger value="conteudo">
              <FileText className="w-4 h-4 mr-2" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="config">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo Tab */}
          <TabsContent value="conteudo" className="space-y-6">
            {/* Secções Ocultas - Painel para reativar */}
            {hiddenSections.size > 0 && (
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <EyeOff className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Seções Ocultas ({hiddenSections.size})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(hiddenSections).map((sectionId) => {
                    const section = sectionTypes.find(s => s.id === sectionId);
                    return (
                      <Button
                        key={sectionId}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSectionVisibility(sectionId)}
                        className="bg-white hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        Mostrar {section?.name || sectionId}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Resumo do Período */}
            {!hiddenSections.has("resumo") && (
              <SectionCard
                section={sectionTypes.find(s => s.id === "resumo")!}
                onToggleVisibility={() => toggleSectionVisibility("resumo")}
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <StatCard
                    icon={Wrench}
                    label="Manutenções"
                    value={estatisticas.totalManutencoes}
                    subValue={`${estatisticas.manutencoesConcluidas} concluídas`}
                    color="text-slate-600"
                    bgColor="bg-slate-100"
                  />
                  <StatCard
                    icon={Search}
                    label="Vistorias"
                    value={estatisticas.totalVistorias}
                    subValue={`${estatisticas.vistoriasAprovadas} aprovadas`}
                    color="text-emerald-600"
                    bgColor="bg-emerald-100"
                  />
                  <StatCard
                    icon={AlertTriangle}
                    label="Ocorrências"
                    value={estatisticas.totalOcorrencias}
                    subValue={`${estatisticas.ocorrenciasAbertas} abertas`}
                    color="text-yellow-600"
                    bgColor="bg-yellow-100"
                  />
                  <StatCard
                    icon={ClipboardCheck}
                    label="Checklists"
                    value={estatisticas.totalChecklists}
                    subValue={`${estatisticas.checklistsConcluidos} concluídos`}
                    color="text-teal-600"
                    bgColor="bg-teal-100"
                  />
                  <StatCard
                    icon={ArrowLeftRight}
                    label="Antes/Depois"
                    value={estatisticas.totalAntesDepois}
                    subValue="comparativos"
                    color="text-violet-600"
                    bgColor="bg-violet-100"
                  />
                </div>
              </SectionCard>
            )}

            {/* Manutenções */}
            {!hiddenSections.has("manutencoes") && (
              <SectionCard
                section={sectionTypes.find(s => s.id === "manutencoes")!}
                onToggleVisibility={() => toggleSectionVisibility("manutencoes")}
              >
                {manutencoesLoading ? (
                  <LoadingState />
                ) : manutencoes && manutencoes.length > 0 ? (
                  <div className="space-y-3">
                    {manutencoes.slice(0, 10).map((item) => (
                      <ItemCard
                        key={item.id}
                        protocolo={item.protocolo}
                        titulo={item.titulo}
                        status={item.status}
                        data={formatDate(item.dataAgendada || item.dataRealizada || item.createdAt)}
                        getStatusColor={getStatusColor}
                        formatStatus={formatStatus}
                      />
                    ))}
                    {manutencoes.length > 10 && (
                      <p className="text-sm text-center text-muted-foreground py-2">
                        E mais {manutencoes.length - 10} manutenções...
                      </p>
                    )}
                  </div>
                ) : (
                  <EmptyState icon={Wrench} message="Nenhuma manutenção registrada" />
                )}
              </SectionCard>
            )}

            {/* Vistorias */}
            {!hiddenSections.has("vistorias") && (
              <SectionCard
                section={sectionTypes.find(s => s.id === "vistorias")!}
                onToggleVisibility={() => toggleSectionVisibility("vistorias")}
              >
                {vistoriasLoading ? (
                  <LoadingState />
                ) : vistorias && vistorias.length > 0 ? (
                  <div className="space-y-3">
                    {vistorias.slice(0, 10).map((item) => (
                      <ItemCard
                        key={item.id}
                        protocolo={item.protocolo}
                        titulo={item.titulo || item.localizacao}
                        status={item.status}
                        data={formatDate(item.dataAgendada || item.dataRealizada || item.createdAt)}
                        getStatusColor={getStatusColor}
                        formatStatus={formatStatus}
                      />
                    ))}
                    {vistorias.length > 10 && (
                      <p className="text-sm text-center text-muted-foreground py-2">
                        E mais {vistorias.length - 10} vistorias...
                      </p>
                    )}
                  </div>
                ) : (
                  <EmptyState icon={Search} message="Nenhuma vistoria registrada" />
                )}
              </SectionCard>
            )}

            {/* Ocorrências */}
            {!hiddenSections.has("ocorrencias") && (
              <SectionCard
                section={sectionTypes.find(s => s.id === "ocorrencias")!}
                onToggleVisibility={() => toggleSectionVisibility("ocorrencias")}
              >
                {ocorrenciasLoading ? (
                  <LoadingState />
                ) : ocorrencias && ocorrencias.length > 0 ? (
                  <div className="space-y-3">
                    {ocorrencias.slice(0, 10).map((item) => (
                      <ItemCard
                        key={item.id}
                        protocolo={item.protocolo}
                        titulo={item.titulo || item.categoria}
                        status={item.status}
                        data={formatDate(item.dataOcorrencia)}
                        getStatusColor={getStatusColor}
                        formatStatus={formatStatus}
                      />
                    ))}
                    {ocorrencias.length > 10 && (
                      <p className="text-sm text-center text-muted-foreground py-2">
                        E mais {ocorrencias.length - 10} ocorrências...
                      </p>
                    )}
                  </div>
                ) : (
                  <EmptyState icon={AlertTriangle} message="Nenhuma ocorrência registrada" />
                )}
              </SectionCard>
            )}

            {/* Checklists */}
            {!hiddenSections.has("checklists") && (
              <SectionCard
                section={sectionTypes.find(s => s.id === "checklists")!}
                onToggleVisibility={() => toggleSectionVisibility("checklists")}
              >
                {checklistsLoading ? (
                  <LoadingState />
                ) : checklists && checklists.length > 0 ? (
                  <div className="space-y-3">
                    {checklists.slice(0, 10).map((item) => (
                      <ItemCard
                        key={item.id}
                        protocolo={item.protocolo}
                        titulo={item.titulo}
                        status={item.status}
                        data={formatDate(item.dataAgendada || item.dataRealizada || item.createdAt)}
                        getStatusColor={getStatusColor}
                        formatStatus={formatStatus}
                      />
                    ))}
                    {checklists.length > 10 && (
                      <p className="text-sm text-center text-muted-foreground py-2">
                        E mais {checklists.length - 10} checklists...
                      </p>
                    )}
                  </div>
                ) : (
                  <EmptyState icon={ClipboardCheck} message="Nenhum checklist registrado" />
                )}
              </SectionCard>
            )}

            {/* Antes e Depois */}
            {!hiddenSections.has("antes_depois") && (
              <SectionCard
                section={sectionTypes.find(s => s.id === "antes_depois")!}
                onToggleVisibility={() => toggleSectionVisibility("antes_depois")}
              >
                {antesDepoisLoading ? (
                  <LoadingState />
                ) : antesDepois && antesDepois.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {antesDepois.slice(0, 6).map((item) => (
                      <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-violet-100">
                        <h4 className="font-medium text-slate-800 mb-2">{item.titulo}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {item.fotoAntesUrl && (
                            <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                              <img src={item.fotoAntesUrl} alt="Antes" className="w-full h-full object-cover" />
                              <span className="text-xs text-slate-500">Antes</span>
                            </div>
                          )}
                          {item.fotoDepoisUrl && (
                            <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                              <img src={item.fotoDepoisUrl} alt="Depois" className="w-full h-full object-cover" />
                              <span className="text-xs text-slate-500">Depois</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={ArrowLeftRight} message="Nenhum comparativo registrado" />
                )}
              </SectionCard>
            )}

            {/* Agenda de Vencimentos */}
            {!hiddenSections.has("vencimentos") && (
              <SectionCard
                section={sectionTypes.find(s => s.id === "vencimentos")!}
                onToggleVisibility={() => toggleSectionVisibility("vencimentos")}
              >
                {vencimentosLoading ? (
                  <LoadingState />
                ) : vencimentos && vencimentos.length > 0 ? (
                  <div className="space-y-3">
                    {vencimentos.slice(0, 10).map((item: any) => (
                      <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-fuchsia-100 flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800">{item.titulo}</h4>
                          <p className="text-sm text-slate-500">{item.categoria} • {item.tipo}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-fuchsia-600">
                            {formatDate(item.dataVencimento)}
                          </p>
                          {item.valor && (
                            <p className="text-xs text-slate-500">
                              R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                    {vencimentos.length > 10 && (
                      <p className="text-sm text-center text-muted-foreground py-2">
                        E mais {vencimentos.length - 10} vencimentos...
                      </p>
                    )}
                  </div>
                ) : (
                  <EmptyState icon={CalendarClock} message="Nenhum vencimento próximo" />
                )}
              </SectionCard>
            )}

            {/* Realizações */}
            {!hiddenSections.has("realizacoes") && (
              <SectionCard
                section={sectionTypes.find(s => s.id === "realizacoes")!}
                onToggleVisibility={() => toggleSectionVisibility("realizacoes")}
              >
                {realizacoesLoading ? (
                  <LoadingState />
                ) : realizacoes && realizacoes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {realizacoes.slice(0, 8).map((item: any) => (
                      <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-yellow-200">
                        <div className="flex items-start gap-3">
                          <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800">{item.titulo}</h4>
                            <p className="text-sm text-slate-500 mt-1">{item.descricao}</p>
                            {item.data && (
                              <p className="text-xs text-slate-400 mt-2">{formatDate(item.data)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Award} message="Nenhuma realização registrada" />
                )}
              </SectionCard>
            )}

            {/* Melhorias */}
            {!hiddenSections.has("melhorias") && (
              <SectionCard
                section={sectionTypes.find(s => s.id === "melhorias")!}
                onToggleVisibility={() => toggleSectionVisibility("melhorias")}
              >
                {melhoriasLoading ? (
                  <LoadingState />
                ) : melhorias && melhorias.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {melhorias.slice(0, 8).map((item: any) => (
                      <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-amber-100">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800">{item.titulo}</h4>
                            <p className="text-sm text-slate-500 mt-1">{item.descricao}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                item.status === "concluida" ? "bg-green-100 text-green-700" :
                                item.status === "em_andamento" ? "bg-blue-100 text-blue-700" :
                                "bg-slate-100 text-slate-700"
                              )}>
                                {item.status === "concluida" ? "Concluída" :
                                 item.status === "em_andamento" ? "Em Andamento" : "Planejada"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={TrendingUp} message="Nenhuma melhoria registrada" />
                )}
              </SectionCard>
            )}

            {/* Aquisições */}
            {!hiddenSections.has("aquisicoes") && (
              <SectionCard
                section={sectionTypes.find(s => s.id === "aquisicoes")!}
                onToggleVisibility={() => toggleSectionVisibility("aquisicoes")}
              >
                {aquisicoesLoading ? (
                  <LoadingState />
                ) : aquisicoes && aquisicoes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aquisicoes.slice(0, 8).map((item: any) => (
                      <div key={item.id} className="bg-white/60 rounded-xl p-4 border border-green-100">
                        <div className="flex items-start gap-3">
                          <Package className="w-5 h-5 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-800">{item.titulo}</h4>
                            <p className="text-sm text-slate-500 mt-1">{item.descricao}</p>
                            <div className="flex items-center justify-between mt-2">
                              {item.valor && (
                                <p className="text-sm font-medium text-green-600">
                                  R$ {Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              )}
                              {item.dataAquisicao && (
                                <p className="text-xs text-slate-400">{formatDate(item.dataAquisicao)}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={Package} message="Nenhuma aquisição registrada" />
                )}
              </SectionCard>
            )}
          </TabsContent>

          {/* Secções Tab */}
          <TabsContent value="secoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex flex-col sm:flex-row items-center gap-2">
                  <span className="flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-orange-500 shrink-0" />
                    Selecione as Funções do Livro
                  </span>
                </CardTitle>
                <CardDescription>
                  Marque as funções que deseja incluir no seu Livro de Manutenção. Apenas as funções selecionadas serão exibidas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Contador de selecionados */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 overflow-hidden">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shrink-0">
                      {sectionTypes.length - hiddenSections.size}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800">Funções Selecionadas</p>
                      <p className="text-sm text-slate-500">de {sectionTypes.length} disponíveis</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHiddenSections(new Set())}
                      className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 flex-1 text-xs sm:text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1 shrink-0" />
                      Selecionar Todas
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHiddenSections(new Set(sectionTypes.map(s => s.id)))}
                      className="text-slate-600 border-slate-300 hover:bg-slate-50 flex-1 text-xs sm:text-sm"
                    >
                      <EyeOff className="w-4 h-4 mr-1 shrink-0" />
                      Desmarcar Todas
                    </Button>
                  </div>
                </div>

                {/* Lista de funções com checkbox - Agrupado por categoria */}
                <div className="space-y-6">
                  {/* Agrupar por categoria */}
                  {["Resumo", "Gestão", "Operacional", "OS", "Galeria", "Dados"].map(categoria => {
                    const sectionsInCategoria = sectionTypes.filter(s => s.categoria === categoria);
                    if (sectionsInCategoria.length === 0) return null;
                    
                    const categoriaLabels: Record<string, { label: string; color: string; bgColor: string }> = {
                      "Resumo": { label: "📊 Resumo", color: "text-blue-700", bgColor: "bg-blue-100" },
                      "Gestão": { label: "🏢 Gestão da Manutenção", color: "text-indigo-700", bgColor: "bg-indigo-100" },
                      "Operacional": { label: "🔧 Operacional", color: "text-amber-700", bgColor: "bg-amber-100" },
                      "OS": { label: "📋 Ordens de Serviço", color: "text-blue-700", bgColor: "bg-blue-100" },
                      "Galeria": { label: "📸 Galeria e Mídia", color: "text-pink-700", bgColor: "bg-pink-100" },
                      "Dados": { label: "☁️ Backup e Dados", color: "text-cyan-700", bgColor: "bg-cyan-100" },
                    };
                    
                    const catInfo = categoriaLabels[categoria];
                    
                    return (
                      <div key={categoria} className="space-y-3">
                        {/* Título da categoria */}
                        <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold", catInfo.bgColor, catInfo.color)}>
                          {catInfo.label}
                          <span className="px-1.5 py-0.5 bg-white/50 rounded-full text-xs">
                            {sectionsInCategoria.filter(s => !hiddenSections.has(s.id)).length}/{sectionsInCategoria.length}
                          </span>
                        </div>
                        
                        {/* Funções da categoria */}
                        <div className="grid md:grid-cols-2 gap-3">
                          {sectionsInCategoria.map((section) => {
                            const Icon = section.icon;
                            const isSelected = !hiddenSections.has(section.id);
                            return (
                              <div
                                key={section.id}
                                className={cn(
                                  "p-3 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                                  isSelected
                                    ? "border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                                )}
                                onClick={() => toggleSectionVisibility(section.id)}
                              >
                                <div className="flex items-center gap-3">
                                  {/* Checkbox visual */}
                                  <div className={cn(
                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0",
                                    isSelected
                                      ? "bg-emerald-500 border-emerald-500"
                                      : "bg-white border-slate-300"
                                  )}>
                                    {isSelected && (
                                      <Check className="w-3 h-3 text-white" />
                                    )}
                                  </div>

                                  {/* Ícone da função */}
                                  <div className={cn(
                                    "p-2 rounded-lg flex-shrink-0",
                                    isSelected ? `bg-gradient-to-br ${section.bgGradient}` : "bg-slate-100"
                                  )}>
                                    <Icon className={cn("w-4 h-4", isSelected ? section.color : "text-slate-400")} />
                                  </div>

                                  {/* Nome */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className={cn(
                                      "font-medium text-sm truncate",
                                      isSelected ? "text-slate-800" : "text-slate-500"
                                    )}>
                                      {section.name}
                                    </h4>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Dica */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Dica</p>
                    <p className="text-sm text-blue-600">
                      As funções selecionadas aparecerão no seu Livro de Manutenção. Você pode alterar esta seleção a qualquer momento.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações Tab */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Informações do Livro</CardTitle>
                <CardDescription>
                  Configure os detalhes desta edição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={revista.titulo} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Edição</Label>
                    <Input value={revista.edicao || ""} readOnly />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Link de Compartilhamento</Label>
                  <div className="flex gap-2">
                    <Input value={shareUrl} readOnly />
                    <Button variant="outline" onClick={copyShareLink}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                    revista.status === "publicada" ? "bg-emerald-100 text-emerald-700" :
                    revista.status === "rascunho" ? "bg-amber-100 text-amber-700" :
                    "bg-gray-100 text-gray-700"
                  )}>
                    {revista.status === "publicada" ? "Publicado" :
                     revista.status === "rascunho" ? "Rascunho" : "Arquivado"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Componentes auxiliares

interface SectionCardProps {
  section: typeof sectionTypes[0];
  onToggleVisibility: () => void;
  children: React.ReactNode;
}

function SectionCard({ section, onToggleVisibility, children }: SectionCardProps) {
  const Icon = section.icon;
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300",
      `bg-gradient-to-br ${section.bgGradient}`,
      section.borderColor
    )}>
      {/* Barra decorativa superior */}
      <div className={cn("absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r", section.barGradient)} />
      
      {/* Elementos decorativos */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      
      <div className="relative p-6">
        {/* Header da seção */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-xl shadow-lg", `bg-gradient-to-br ${section.barGradient}`)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{section.name}</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVisibility}
            className="text-slate-500 hover:text-red-500 hover:bg-red-50"
            title="Ocultar esta seção"
          >
            <EyeOff className="w-4 h-4 mr-1" />
            Ocultar
          </Button>
        </div>
        
        {children}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  subValue: string;
  color: string;
  bgColor: string;
}

function StatCard({ icon: Icon, label, value, subValue, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-white/60 rounded-xl p-4 text-center">
      <div className={cn("w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center", bgColor)}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="text-xs text-slate-500">{subValue}</p>
    </div>
  );
}

interface ItemCardProps {
  protocolo: string | null;
  titulo: string | null;
  status: string | null;
  data: string;
  getStatusColor: (status: string) => string;
  formatStatus: (status: string) => string;
}

function ItemCard({ protocolo, titulo, status, data, getStatusColor, formatStatus }: ItemCardProps) {
  return (
    <div className="group relative p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-100 hover:bg-white/80 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-slate-500">{protocolo || "-"}</span>
            {status && (
              <span className={cn("px-2 py-0.5 text-xs font-medium rounded-full", getStatusColor(status))}>
                {formatStatus(status)}
              </span>
            )}
          </div>
          <h4 className="font-medium text-slate-800">{titulo || "-"}</h4>
          <p className="text-xs text-slate-500 mt-1">{data}</p>
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Carregando dados...</p>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="text-center py-12 bg-white/40 rounded-xl border border-dashed border-slate-200">
      <div className="p-3 bg-slate-100 rounded-full w-fit mx-auto mb-3">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="font-medium text-slate-600">{message}</p>
      <p className="text-sm text-slate-500 mt-1">Os dados aparecerão aqui quando disponíveis</p>
    </div>
  );
}
