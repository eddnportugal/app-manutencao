import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { exportRelatorioComEstatisticas } from "@/lib/pdfExport";
import { gerarRelatorioProfissional } from "@/lib/pdfRelatorioCompleto";
import { gerarRelatorioSimplificado } from "@/lib/pdfRelatorioSimplificado";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";
import {
  FileText,
  ArrowLeft,
  Download,
  Eye,
  Users,
  Building2,
  Calendar,
  Wrench,
  AlertTriangle,
  ClipboardCheck,
  Vote,
  ShoppingBag,
  Car,
  Bell,
  Image,
  Award,
  TrendingUp,
  Package,
  BarChart3,
  Loader2,
  CheckCircle,
  Settings,
  FileSpreadsheet,
  Printer,
  Megaphone,
  MessageSquare,
  Phone,
  Link,
  Shield,
  Lightbulb,
  DollarSign,
  Camera,
  HelpCircle,
  Newspaper,
  Home,
  Key,
  Truck,
  ParkingCircle,
  HeartHandshake,
  ClipboardList,
  FileCheck,
  BadgeCheck,
  BookOpen,
  MapPin,
  Sparkles,
  CalendarClock,
  Search,
  Mail,
  CreditCard,
  Receipt,
  Wallet,
  PiggyBank,
  Calculator,
  FileBarChart,
  Gavel,
  Scale,
  FileSignature,
  FolderOpen,
  Archive,
  History,
  Activity,
  Lock,
  QrCode,
  Fingerprint,
  UserCheck,
  UserPlus,
  UsersRound,
  Dog,
  Bike,
  Dumbbell,
  Trophy,
  Target,
  Gift,
  PartyPopper,
  Heart,
  Star,
  ThumbsUp,
  MessageCircle,
  Send,
  Inbox,
  Bookmark,
  Tag,
  Folder,
  File,
  Clipboard,
  Table,
  Layout,
  Database,
  Clock,
  Globe,
  Map,
  Gauge,
  Timer,
  Upload,
  X,
  Sun,
  Moon,
  Zap,
  ArrowLeftRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tipos de seções disponíveis para o relatório
interface ReportSection {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  category: string;
}

// Seções disponíveis para relatórios - APENAS FUNÇÕES DE MANUTENÇÃO
const availableSections: Omit<ReportSection, "enabled">[] = [
  // OPERACIONAL E MANUTENÇÃO
  { id: "vencimentos", key: "vencimentos", title: "Agenda de Vencimentos", description: "Agenda de vencimentos e prazos", icon: CalendarClock, category: "operacional" },
  { id: "manutencoes", key: "manutencoes", title: "Manutenções", description: "Histórico de manutenções", icon: Wrench, category: "operacional" },
  { id: "ocorrencias", key: "ocorrencias", title: "Ocorrências", description: "Registro de ocorrências", icon: AlertTriangle, category: "operacional" },
  { id: "vistorias", key: "vistorias", title: "Vistorias", description: "Vistorias realizadas", icon: ClipboardCheck, category: "operacional" },
  { id: "checklists", key: "checklists", title: "Checklists", description: "Checklists completados", icon: ClipboardList, category: "operacional" },
  { id: "antes_depois", key: "antes_depois", title: "Antes e Depois", description: "Comparativos visuais", icon: Image, category: "operacional" },
  { id: "ordens_servico", key: "ordens_servico", title: "Ordens de Serviço", description: "Ordens de serviço emitidas", icon: FileCheck, category: "operacional" },
  
  // FUNÇÕES RÁPIDAS
  { id: "funcoes_rapidas", key: "funcoes_rapidas", title: "Funções Rápidas", description: "Todos os registros rápidos", icon: Zap, category: "funcoes_rapidas" },
  { id: "vistorias_rapidas", key: "vistorias_rapidas", title: "Vistorias Rápidas", description: "Vistorias rápidas registradas", icon: ClipboardCheck, category: "funcoes_rapidas" },
  { id: "manutencoes_rapidas", key: "manutencoes_rapidas", title: "Manutenções Rápidas", description: "Manutenções rápidas registradas", icon: Wrench, category: "funcoes_rapidas" },
  { id: "ocorrencias_rapidas", key: "ocorrencias_rapidas", title: "Ocorrências Rápidas", description: "Ocorrências rápidas registradas", icon: AlertTriangle, category: "funcoes_rapidas" },
  { id: "antes_depois_rapido", key: "antes_depois_rapido", title: "Antes/Depois Rápido", description: "Comparações rápidas registradas", icon: ArrowLeftRight, category: "funcoes_rapidas" },
  
  // GALERIA E MÍDIA
  { id: "albuns", key: "albuns", title: "Álbuns de Fotos", description: "Galeria de imagens", icon: Image, category: "galeria" },
  { id: "realizacoes", key: "realizacoes", title: "Realizações", description: "Conquistas da organização", icon: Award, category: "galeria" },
  { id: "melhorias", key: "melhorias", title: "Melhorias", description: "Melhorias implementadas", icon: TrendingUp, category: "galeria" },
  { id: "aquisicoes", key: "aquisicoes", title: "Aquisições", description: "Aquisições da organização", icon: Package, category: "galeria" },
];

// Categorias (apenas funções de manutenção)
const categories = [
  { id: "operacional", title: "Operacional / Manutenção", icon: Wrench },
  { id: "funcoes_rapidas", title: "Funções Rápidas", icon: Zap },
  { id: "galeria", title: "Galeria e Mídia", icon: Image },
];

export default function RelatorioBuilder() {
  const [, setLocation] = useLocation();
  const [reportName, setReportName] = useState("Relatório Mensal");
  const [reportPeriod, setReportPeriod] = useState("mensal");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeStats, setIncludeStats] = useState(true);
  const [selectedSections, setSelectedSections] = useState<string[]>([
    "manutencoes", "ocorrencias", "vistorias", "checklists", "ordens_servico"
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tipoRelatorio, setTipoRelatorio] = useState<"completo" | "simplificado">("completo");
  const [activeTab, setActiveTab] = useState("secoes");
  const [showHeaderConfig, setShowHeaderConfig] = useState(false);
  const [filtroProtocolo, setFiltroProtocolo] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  
  // Estados para cabeçalho/rodapé
  const [cabecalhoLogoUrl, setCabecalhoLogoUrl] = useState("");
  const [cabecalhoNomeCondominio, setCabecalhoNomeCondominio] = useState("");
  const [cabecalhoNomeSindico, setCabecalhoNomeSindico] = useState("");
  const [rodapeTexto, setRodapeTexto] = useState("");
  const [rodapeContato, setRodapeContato] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const { data: condominios, refetch: refetchCondominios } = trpc.condominio.list.useQuery();
  const selectedCondominio = condominios?.[0];

  // Queries para buscar dados das seções de manutenção (usando condominio ID quando disponível)
  const condominioId = selectedCondominio?.id || 0;
  const manutencoesQuery = trpc.manutencao.listWithDetails.useQuery({ condominioId }, { enabled: !!selectedCondominio && selectedSections.includes("manutencoes") });
  const ocorrenciasQuery = trpc.ocorrencia.listWithDetails.useQuery({ condominioId }, { enabled: !!selectedCondominio && selectedSections.includes("ocorrencias") });
  const vistoriasQuery = trpc.vistoria.listWithDetails.useQuery({ condominioId }, { enabled: !!selectedCondominio && selectedSections.includes("vistorias") });
  const checklistsQuery = trpc.checklist.listWithDetails.useQuery({ condominioId }, { enabled: !!selectedCondominio && selectedSections.includes("checklists") });
  
  // Queries adicionais para seções que faltavam
  const ordensServicoQuery = trpc.ordensServico.list.useQuery({ condominioId }, { enabled: !!selectedCondominio && selectedSections.includes("ordens_servico") });
  const vencimentosQuery = trpc.vencimentos.proximos.useQuery({ condominioId, dias: 365, limite: 100 }, { enabled: !!selectedCondominio && selectedSections.includes("vencimentos") });
  const funcoesRapidasQuery = trpc.funcoesRapidas.listar.useQuery({ condominioId }, { enabled: !!selectedCondominio && (selectedSections.includes("funcoes_rapidas") || selectedSections.includes("vistorias_rapidas") || selectedSections.includes("manutencoes_rapidas") || selectedSections.includes("ocorrencias_rapidas") || selectedSections.includes("antes_depois_rapido")) });
  
  // Queries de galeria (usando revista se disponível)
  const revistasQuery = trpc.revista.list.useQuery({ condominioId }, { enabled: !!selectedCondominio });
  const activeRevista = revistasQuery.data?.[0];
  const revistaId = activeRevista?.id || 0;
  const realizacoesQuery = trpc.realizacao.list.useQuery({ revistaId }, { enabled: revistaId > 0 && selectedSections.includes("realizacoes") });
  const melhoriasQuery = trpc.melhoria.list.useQuery({ revistaId }, { enabled: revistaId > 0 && selectedSections.includes("melhorias") });
  const aquisicoesQuery = trpc.aquisicao.list.useQuery({ revistaId }, { enabled: revistaId > 0 && selectedSections.includes("aquisicoes") });
  const antesDepoisQuery = trpc.antesDepois.list.useQuery({ revistaId }, { enabled: revistaId > 0 && selectedSections.includes("antes_depois") });
  
  const updateCondominio = trpc.condominio.update.useMutation({
    onSuccess: () => {
      refetchCondominios();
      toast.success("Configurações de cabeçalho/rodapé salvas!");
      setShowHeaderConfig(false);
    },
    onError: () => {
      toast.error("Erro ao salvar configurações");
    },
  });

  // Carregar dados da organização
  useEffect(() => {
    if (selectedCondominio) {
      setCabecalhoLogoUrl((selectedCondominio as any).cabecalhoLogoUrl || "");
      setCabecalhoNomeCondominio((selectedCondominio as any).cabecalhoNomeCondominio || selectedCondominio.nome || "");
      setCabecalhoNomeSindico((selectedCondominio as any).cabecalhoNomeSindico || "");
      setRodapeTexto((selectedCondominio as any).rodapeTexto || "");
      setRodapeContato((selectedCondominio as any).rodapeContato || "");
    }
  }, [selectedCondominio]);

  // Definir datas padrão baseadas no período
  useEffect(() => {
    const now = new Date();
    const endDate = now.toISOString().split("T")[0];
    let startDate = "";

    switch (reportPeriod) {
      case "semanal":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split("T")[0];
        break;
      case "mensal":
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        startDate = monthAgo.toISOString().split("T")[0];
        break;
      case "trimestral":
        const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        startDate = quarterAgo.toISOString().split("T")[0];
        break;
      case "semestral":
        const semesterAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        startDate = semesterAgo.toISOString().split("T")[0];
        break;
      case "anual":
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        startDate = yearAgo.toISOString().split("T")[0];
        break;
      default:
        startDate = endDate;
    }

    setDateStart(startDate);
    setDateEnd(endDate);
  }, [reportPeriod]);

  const toggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const selectAllInCategory = (categoryId: string) => {
    const categoryItems = availableSections
      .filter((s) => s.category === categoryId)
      .map((s) => s.id);
    
    const allSelected = categoryItems.every((id) => selectedSections.includes(id));
    
    if (allSelected) {
      setSelectedSections((prev) => prev.filter((id) => !categoryItems.includes(id)));
    } else {
      setSelectedSections((prev) => Array.from(new Set([...prev, ...categoryItems])));
    }
  };

  const handleGenerateReport = async () => {
    if (selectedSections.length === 0) {
      toast.error("Selecione pelo menos uma seção para o relatório");
      return;
    }

    if (!selectedCondominio) {
      toast.error("Nenhuma organização selecionado");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Função para filtrar itens por protocolo
      const filtrarPorProtocolo = <T extends { protocolo?: string | null }>(items: T[]): T[] => {
        if (!filtroProtocolo.trim()) return items;
        const filtros = filtroProtocolo.split(",").map(f => f.trim().toLowerCase()).filter(f => f);
        if (filtros.length === 0) return items;
        return items.filter(item => {
          if (!item.protocolo) return false;
          const protocoloLower = item.protocolo.toLowerCase();
          return filtros.some(filtro => protocoloLower.includes(filtro));
        });
      };

      // Função para filtrar itens por período de datas
      const filtrarPorPeriodo = <T extends Record<string, any>>(items: T[], camposData: string[]): T[] => {
        if (!dateStart || !dateEnd) return items;
        const inicio = new Date(dateStart);
        inicio.setHours(0, 0, 0, 0);
        const fim = new Date(dateEnd);
        fim.setHours(23, 59, 59, 999);
        return items.filter(item => {
          for (const campo of camposData) {
            const valor = item[campo];
            if (valor) {
              const data = new Date(valor);
              if (!isNaN(data.getTime()) && data >= inicio && data <= fim) return true;
            }
          }
          // Se nenhum campo de data encontrado, incluir o item
          return camposData.every(c => !item[c]);
        });
      };

      // Buscar dados de cada seção selecionada
      const dadosSecoes: Record<string, any[]> = {};
      const totais: Record<string, number> = {};

      // Manutenções
      if (selectedSections.includes("manutencoes")) {
        let data = filtrarPorProtocolo(manutencoesQuery.data || []);
        data = filtrarPorPeriodo(data, ["createdAt", "dataAgendada", "dataRealizada"]);
        dadosSecoes.manutencoes = data;
        totais.manutencoes = data.length;
      }

      // Ocorrências
      if (selectedSections.includes("ocorrencias")) {
        let data = filtrarPorProtocolo(ocorrenciasQuery.data || []);
        data = filtrarPorPeriodo(data, ["createdAt", "dataOcorrencia"]);
        dadosSecoes.ocorrencias = data;
        totais.ocorrencias = data.length;
      }

      // Vistorias
      if (selectedSections.includes("vistorias")) {
        let data = filtrarPorProtocolo(vistoriasQuery.data || []);
        data = filtrarPorPeriodo(data, ["createdAt", "dataAgendada", "dataRealizada"]);
        dadosSecoes.vistorias = data;
        totais.vistorias = data.length;
      }

      // Checklists
      if (selectedSections.includes("checklists")) {
        let data = filtrarPorProtocolo(checklistsQuery.data || []);
        data = filtrarPorPeriodo(data, ["createdAt", "dataAgendada", "dataRealizada"]);
        dadosSecoes.checklists = data;
        totais.checklists = data.length;
      }

      // Antes/Depois (Completo - vinculado a revista)
      if (selectedSections.includes("antes_depois")) {
        const data = antesDepoisQuery.data || [];
        dadosSecoes.antesDepois = data;
        totais.antesDepois = data.length;
      }

      // Ordens de Serviço
      if (selectedSections.includes("ordens_servico")) {
        let data = filtrarPorProtocolo((ordensServicoQuery.data as any)?.items || ordensServicoQuery.data || []);
        data = filtrarPorPeriodo(data, ["createdAt", "dataAbertura"]);
        dadosSecoes.ordensServico = data;
        totais.ordensServico = data.length;
      }

      // Vencimentos
      if (selectedSections.includes("vencimentos")) {
        let data = (vencimentosQuery.data || []) as any[];
        data = filtrarPorPeriodo(data, ["dataVencimento"]);
        dadosSecoes.vencimentos = data;
        totais.vencimentos = data.length;
      }

      // Funções Rápidas (todas ou por tipo)
      const allFuncoesRapidas = (funcoesRapidasQuery.data || []) as any[];
      if (selectedSections.includes("funcoes_rapidas")) {
        const data = filtrarPorPeriodo(allFuncoesRapidas, ["createdAt"]);
        dadosSecoes.funcoesRapidas = data;
        totais.funcoesRapidas = data.length;
      }
      if (selectedSections.includes("vistorias_rapidas")) {
        const data = filtrarPorPeriodo(allFuncoesRapidas.filter((f: any) => f.tipo === "vistoria" || f.funcaoId?.includes("vistoria")), ["createdAt"]);
        dadosSecoes.vistoriasRapidas = data;
        totais.vistoriasRapidas = data.length;
      }
      if (selectedSections.includes("manutencoes_rapidas")) {
        const data = filtrarPorPeriodo(allFuncoesRapidas.filter((f: any) => f.tipo === "manutencao" || f.funcaoId?.includes("manutencao")), ["createdAt"]);
        dadosSecoes.manutencoesRapidas = data;
        totais.manutencoesRapidas = data.length;
      }
      if (selectedSections.includes("ocorrencias_rapidas")) {
        const data = filtrarPorPeriodo(allFuncoesRapidas.filter((f: any) => f.tipo === "ocorrencia" || f.funcaoId?.includes("ocorrencia")), ["createdAt"]);
        dadosSecoes.ocorrenciasRapidas = data;
        totais.ocorrenciasRapidas = data.length;
      }
      if (selectedSections.includes("antes_depois_rapido")) {
        const data = filtrarPorPeriodo(allFuncoesRapidas.filter((f: any) => f.tipo === "antes_depois" || f.funcaoId?.includes("antes_depois")), ["createdAt"]);
        dadosSecoes.antesDepoisRapido = data;
        totais.antesDepoisRapido = data.length;
      }

      // Realizações
      if (selectedSections.includes("realizacoes")) {
        const data = realizacoesQuery.data || [];
        dadosSecoes.realizacoes = data;
        totais.realizacoes = data.length;
      }

      // Melhorias
      if (selectedSections.includes("melhorias")) {
        const data = melhoriasQuery.data || [];
        dadosSecoes.melhorias = data;
        totais.melhorias = data.length;
      }

      // Aquisições
      if (selectedSections.includes("aquisicoes")) {
        const data = aquisicoesQuery.data || [];
        dadosSecoes.aquisicoes = data;
        totais.aquisicoes = data.length;
      }

      // Gerar o PDF baseado no tipo selecionado
      const dadosRelatorio = {
        condominio: selectedCondominio,
        periodo: { inicio: dateStart, fim: dateEnd },
        secoes: dadosSecoes,
        totais: totais,
        geradoEm: new Date().toISOString(),
      };

      const configRelatorio = {
        nomeRelatorio: reportName,
        cabecalhoLogoUrl: cabecalhoLogoUrl || undefined,
        cabecalhoNomeCondominio: cabecalhoNomeCondominio || selectedCondominio?.nome,
        cabecalhoNomeSindico: cabecalhoNomeSindico || undefined,
        rodapeTexto: rodapeTexto || undefined,
        rodapeContato: rodapeContato || undefined,
        incluirGraficos: includeCharts,
        incluirEstatisticas: includeStats,
        baseUrl: window.location.origin,
      };

      if (tipoRelatorio === "simplificado") {
        await gerarRelatorioSimplificado(dadosRelatorio, configRelatorio);
      } else {
        await gerarRelatorioProfissional(dadosRelatorio, configRelatorio);
      }
      
      // Mensagem de sucesso com informação sobre filtro
      if (filtroProtocolo.trim()) {
        toast.success(`Relatório gerado com filtro de protocolo: ${filtroProtocolo}`);
      } else {
        toast.success("Relatório gerado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error("Erro ao gerar relatório");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSimpleReport = async () => {
    const sectionTitles = selectedSections.map(id => {
      const section = availableSections.find(s => s.id === id);
      return section?.title || id;
    });

    const periodoTexto = `${new Date(dateStart).toLocaleDateString("pt-BR")} a ${new Date(dateEnd).toLocaleDateString("pt-BR")}`;

    await exportRelatorioComEstatisticas(
      reportName,
      `Período: ${periodoTexto}`,
      [
        { label: "Seções", valor: selectedSections.length },
        { label: "Período", valor: reportPeriod },
      ],
      ["Seção", "Descrição", "Status"],
      sectionTitles.map(title => {
        const section = availableSections.find(s => s.title === title);
        return [title, section?.description || "-", "Incluído"];
      }),
      {
        nome: cabecalhoNomeCondominio || selectedCondominio?.nome || "Condomínio",
        logoUrl: cabecalhoLogoUrl || null,
        endereco: selectedCondominio?.endereco || null,
      }
    );
    toast.success("Relatório gerado com sucesso!");
  };

  const generatePDFFromData = async (data: any) => {
    const periodoTexto = `${new Date(dateStart).toLocaleDateString("pt-BR")} a ${new Date(dateEnd).toLocaleDateString("pt-BR")}`;
    
    const estatisticas = Object.entries(data.totais || {}).map(([key, value]) => ({
      label: key.charAt(0).toUpperCase() + key.slice(1),
      valor: value as number,
    }));

    const colunas = ["Item", "Quantidade", "Status"];
    const dados = Object.entries(data.totais || {}).map(([key, value]) => [
      key.charAt(0).toUpperCase() + key.slice(1),
      value as number,
      "Ativo"
    ]);

    await exportRelatorioComEstatisticas(
      reportName,
      `Período: ${periodoTexto}`,
      estatisticas.slice(0, 4),
      colunas,
      dados,
      {
        nome: cabecalhoNomeCondominio || selectedCondominio?.nome || "Condomínio",
        logoUrl: cabecalhoLogoUrl || null,
        endereco: selectedCondominio?.endereco || null,
      }
    );
  };

  const handleSaveHeaderConfig = () => {
    if (!selectedCondominio) return;
    
    updateCondominio.mutate({
      id: selectedCondominio.id,
      cabecalhoLogoUrl,
      cabecalhoNomeCondominio,
      cabecalhoNomeSindico,
      rodapeTexto,
      rodapeContato,
    } as any);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro no upload");

      const data = await response.json();
      setCabecalhoLogoUrl(data.url);
      toast.success("Logo enviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar logo");
    } finally {
      setIsUploading(false);
    }
  };

  const getSectionsByCategory = (categoryId: string) => {
    return availableSections.filter((s) => s.category === categoryId);
  };

  const isCategoryFullySelected = (categoryId: string) => {
    const categoryItems = getSectionsByCategory(categoryId);
    return categoryItems.every((item) => selectedSections.includes(item.id));
  };

  const isCategoryPartiallySelected = (categoryId: string) => {
    const categoryItems = getSectionsByCategory(categoryId);
    const selectedCount = categoryItems.filter((item) => selectedSections.includes(item.id)).length;
    return selectedCount > 0 && selectedCount < categoryItems.length;
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500",
      isDarkTheme 
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" 
        : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
    )}>
      {/* Header Premium */}
      <div className="relative overflow-hidden">
        {/* Background decorativo */}
        <div className={cn(
          "absolute inset-0 transition-colors duration-500",
          isDarkTheme 
            ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10" 
            : "bg-gradient-to-r from-emerald-500/5 via-teal-500/3 to-cyan-500/5"
        )} />
        <div className={cn(
          "absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl transition-colors duration-500",
          isDarkTheme 
            ? "bg-gradient-to-br from-emerald-500/20 to-transparent" 
            : "bg-gradient-to-br from-emerald-400/15 to-transparent"
        )} />
        <div className={cn(
          "absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl transition-colors duration-500",
          isDarkTheme 
            ? "bg-gradient-to-tr from-cyan-500/20 to-transparent" 
            : "bg-gradient-to-tr from-cyan-400/15 to-transparent"
        )} />
        
        <div className={cn(
          "relative border-b backdrop-blur-xl transition-colors duration-500",
          isDarkTheme 
            ? "border-white/10 bg-slate-900/50" 
            : "border-slate-200 bg-white/70"
        )}>
          <div className="container py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLocation("/dashboard")}
                  className={cn(
                    "rounded-xl transition-all duration-300",
                    isDarkTheme 
                      ? "text-white/70 hover:text-white hover:bg-white/10" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                      <FileBarChart className="h-5 w-5 text-white" />
                    </div>
                    <h1 className={cn(
                      "text-2xl font-bold bg-clip-text text-transparent",
                      isDarkTheme 
                        ? "bg-gradient-to-r from-white via-emerald-100 to-teal-200" 
                        : "bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-600"
                    )}>
                      Construtor de Relatórios
                    </h1>
                  </div>
                  <p className={cn(
                    "text-sm ml-12 transition-colors duration-500",
                    isDarkTheme ? "text-slate-400" : "text-slate-500"
                  )}>Monte relatórios profissionais personalizados</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Botão de Toggle de Tema */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsDarkTheme(!isDarkTheme)}
                  className={cn(
                    "rounded-xl transition-all duration-300",
                    isDarkTheme 
                      ? "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30" 
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  )}
                  title={isDarkTheme ? "Mudar para tema claro" : "Mudar para tema escuro"}
                >
                  {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowHeaderConfig(true)}
                  className={cn(
                    "rounded-xl transition-all duration-300",
                    isDarkTheme 
                      ? "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30" 
                      : "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600"
                  )}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Personalizar
                </Button>
                <Button
                  onClick={handleGenerateReport}
                  disabled={isGenerating || selectedSections.length === 0}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configurações do Relatório - Premium */}
          <div className="lg:col-span-1 space-y-6">
            <div className={cn(
              "rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden transition-colors duration-500",
              isDarkTheme 
                ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-white/10 shadow-black/20" 
                : "bg-white/80 border-slate-200 shadow-slate-200/50"
            )}>
              <div className={cn(
                "p-6 border-b transition-colors duration-500",
                isDarkTheme ? "border-white/10" : "border-slate-100"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-lg font-semibold transition-colors duration-500",
                      isDarkTheme ? "text-white" : "text-slate-800"
                    )}>Configurações</h3>
                    <p className={cn(
                      "text-xs transition-colors duration-500",
                      isDarkTheme ? "text-slate-400" : "text-slate-500"
                    )}>Parâmetros do relatório</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reportName" className={cn(
                    "text-sm font-medium transition-colors duration-500",
                    isDarkTheme ? "text-slate-300" : "text-slate-700"
                  )}>Nome do Relatório</Label>
                  <Input
                    id="reportName"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    placeholder="Ex: Relatório Mensal Janeiro"
                    className={cn(
                      "rounded-xl transition-colors duration-500",
                      isDarkTheme 
                        ? "bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20" 
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportPeriod" className={cn(
                    "text-sm font-medium transition-colors duration-500",
                    isDarkTheme ? "text-slate-300" : "text-slate-700"
                  )}>Período</Label>
                  <Select value={reportPeriod} onValueChange={setReportPeriod}>
                    <SelectTrigger className={cn(
                      "rounded-xl transition-colors duration-500",
                      isDarkTheme 
                        ? "bg-slate-800/50 border-white/10 text-white" 
                        : "bg-slate-50 border-slate-200 text-slate-900"
                    )}>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                    <SelectContent className={cn(
                      isDarkTheme ? "bg-slate-800 border-white/10" : "bg-white border-slate-200"
                    )}>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="semestral">Semestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="dateStart" className={cn(
                      "text-sm font-medium transition-colors duration-500",
                      isDarkTheme ? "text-slate-300" : "text-slate-700"
                    )}>Data Início</Label>
                    <Input
                      id="dateStart"
                      type="date"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className={cn(
                        "rounded-xl transition-colors duration-500",
                        isDarkTheme 
                          ? "bg-slate-800/50 border-white/10 text-white [color-scheme:dark]" 
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateEnd" className={cn(
                      "text-sm font-medium transition-colors duration-500",
                      isDarkTheme ? "text-slate-300" : "text-slate-700"
                    )}>Data Fim</Label>
                    <Input
                      id="dateEnd"
                      type="date"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className={cn(
                        "rounded-xl transition-colors duration-500",
                        isDarkTheme 
                          ? "bg-slate-800/50 border-white/10 text-white [color-scheme:dark]" 
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                </div>

                {/* Tipo de Relatório - Premium */}
                <div className="pt-4 space-y-3">
                  <Label className={cn(
                    "text-sm font-medium transition-colors duration-500",
                    isDarkTheme ? "text-slate-300" : "text-slate-700"
                  )}>Tipo de Relatório</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTipoRelatorio("completo")}
                      className={cn(
                        "relative h-auto py-4 px-3 flex flex-col items-center gap-2 rounded-xl border transition-all duration-300",
                        tipoRelatorio === "completo" 
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500 border-emerald-500 shadow-lg shadow-emerald-500/25" 
                          : isDarkTheme 
                            ? "bg-slate-800/30 border-white/10 hover:border-white/20 hover:bg-slate-800/50" 
                            : "bg-slate-100 border-slate-300 hover:border-slate-400 hover:bg-slate-200"
                      )}
                    >
                      {tipoRelatorio === "completo" && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className={cn(
                        "p-2 rounded-lg",
                        tipoRelatorio === "completo" ? "bg-white/20" : isDarkTheme ? "bg-slate-700/50" : "bg-slate-200"
                      )}>
                        <FileText className={cn("h-5 w-5", tipoRelatorio === "completo" ? "text-white" : isDarkTheme ? "text-slate-400" : "text-slate-500")} />
                      </div>
                      <span className={cn("text-sm font-medium", tipoRelatorio === "completo" ? "text-white" : isDarkTheme ? "text-slate-300" : "text-slate-700")}>Completo</span>
                      <span className={cn("text-[10px]", tipoRelatorio === "completo" ? "text-white/80" : isDarkTheme ? "text-slate-500" : "text-slate-400")}>Com imagens e mapas</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoRelatorio("simplificado")}
                      className={cn(
                        "relative h-auto py-4 px-3 flex flex-col items-center gap-2 rounded-xl border transition-all duration-300",
                        tipoRelatorio === "simplificado" 
                          ? "bg-gradient-to-br from-amber-500 to-orange-500 border-amber-500 shadow-lg shadow-amber-500/25" 
                          : isDarkTheme 
                            ? "bg-slate-800/30 border-white/10 hover:border-white/20 hover:bg-slate-800/50" 
                            : "bg-slate-100 border-slate-300 hover:border-slate-400 hover:bg-slate-200"
                      )}
                    >
                      {tipoRelatorio === "simplificado" && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className={cn(
                        "p-2 rounded-lg",
                        tipoRelatorio === "simplificado" ? "bg-white/20" : isDarkTheme ? "bg-slate-700/50" : "bg-slate-200"
                      )}>
                        <Link className={cn("h-5 w-5", tipoRelatorio === "simplificado" ? "text-white" : isDarkTheme ? "text-slate-400" : "text-slate-500")} />
                      </div>
                      <span className={cn("text-sm font-medium", tipoRelatorio === "simplificado" ? "text-white" : isDarkTheme ? "text-slate-300" : "text-slate-700")}>Simplificado</span>
                      <span className={cn("text-[10px]", tipoRelatorio === "simplificado" ? "text-white/80" : isDarkTheme ? "text-slate-500" : "text-slate-400")}>Com links clicáveis</span>
                    </button>
                  </div>
                  {tipoRelatorio === "simplificado" && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs text-amber-300/80">
                        O relatório simplificado mostra informações resumidas. Clique nos títulos para ver detalhes no sistema.
                      </p>
                    </div>
                  )}
                </div>

                {/* Filtro por Protocolo - Premium */}
                <div className="pt-4 space-y-2">
                  <Label htmlFor="filtroProtocolo" className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors duration-500",
                    isDarkTheme ? "text-slate-300" : "text-slate-700"
                  )}>
                    <Search className={cn("h-4 w-4", isDarkTheme ? "text-slate-500" : "text-slate-400")} />
                    Filtrar por Protocolo
                  </Label>
                  <Input
                    id="filtroProtocolo"
                    value={filtroProtocolo}
                    onChange={(e) => setFiltroProtocolo(e.target.value)}
                    placeholder="Ex: 123456, 789012"
                    className={cn(
                      "rounded-xl text-sm transition-colors duration-500",
                      isDarkTheme 
                        ? "bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50" 
                        : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500"
                    )}
                  />
                  <p className={cn(
                    "text-xs transition-colors duration-500",
                    isDarkTheme ? "text-slate-500" : "text-slate-400"
                  )}>
                    Filtra por número de protocolo (6 dígitos). Deixe vazio para incluir todos.
                  </p>
                </div>

                <div className="pt-4 space-y-4">
                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-colors duration-500",
                    isDarkTheme ? "bg-slate-800/30 border-white/5" : "bg-slate-50 border-slate-200"
                  )}>
                    <Label htmlFor="includeCharts" className={cn(
                      "cursor-pointer text-sm transition-colors duration-500",
                      isDarkTheme ? "text-slate-300" : "text-slate-700"
                    )}>
                      Incluir Gráficos
                    </Label>
                    <Switch
                      id="includeCharts"
                      checked={includeCharts}
                      onCheckedChange={setIncludeCharts}
                      disabled={tipoRelatorio === "simplificado"}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-xl border transition-colors duration-500",
                    isDarkTheme ? "bg-slate-800/30 border-white/5" : "bg-slate-50 border-slate-200"
                  )}>
                    <Label htmlFor="includeStats" className={cn(
                      "cursor-pointer text-sm transition-colors duration-500",
                      isDarkTheme ? "text-slate-300" : "text-slate-700"
                    )}>
                      Incluir Estatísticas
                    </Label>
                    <Switch
                      id="includeStats"
                      checked={includeStats}
                      onCheckedChange={setIncludeStats}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo das Seções Selecionadas - Premium */}
            <div className={cn(
              "rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden transition-colors duration-500",
              isDarkTheme 
                ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-white/10 shadow-black/20" 
                : "bg-white/80 border-slate-200 shadow-slate-200/50"
            )}>
              <div className={cn(
                "p-6 border-b transition-colors duration-500",
                isDarkTheme ? "border-white/10" : "border-slate-100"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className={cn(
                        "text-lg font-semibold transition-colors duration-500",
                        isDarkTheme ? "text-white" : "text-slate-800"
                      )}>Selecionadas</h3>
                      <p className={cn(
                        "text-xs transition-colors duration-500",
                        isDarkTheme ? "text-slate-400" : "text-slate-500"
                      )}>{selectedSections.length} de {availableSections.length} seções</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-500">{selectedSections.length}</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {selectedSections.length === 0 ? (
                  <div className="text-center py-6">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-500",
                      isDarkTheme ? "bg-slate-800/50" : "bg-slate-100"
                    )}>
                      <FileText className={cn("h-6 w-6", isDarkTheme ? "text-slate-600" : "text-slate-400")} />
                    </div>
                    <p className={cn("text-sm", isDarkTheme ? "text-slate-500" : "text-slate-500")}>Nenhuma seção selecionada</p>
                    <p className={cn("text-xs mt-1", isDarkTheme ? "text-slate-600" : "text-slate-400")}>Selecione seções ao lado</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSections.map((sectionId) => {
                      const section = availableSections.find((s) => s.id === sectionId);
                      if (!section) return null;
                      return (
                        <Badge
                          key={sectionId}
                          className={cn(
                            "cursor-pointer border transition-all duration-300 rounded-lg px-3 py-1",
                            isDarkTheme 
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30" 
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                          )}
                          onClick={() => toggleSection(sectionId)}
                        >
                          {section.title}
                          <X className="h-3 w-3 ml-1.5" />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Seleção de Seções - Premium */}
          <div className="lg:col-span-2">
            <div className={cn(
              "rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden transition-colors duration-500",
              isDarkTheme 
                ? "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-white/10 shadow-black/20" 
                : "bg-white/80 border-slate-200 shadow-slate-200/50"
            )}>
              <div className={cn(
                "p-6 border-b transition-colors duration-500",
                isDarkTheme ? "border-white/10" : "border-slate-100"
              )}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25">
                    <ClipboardList className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className={cn(
                      "text-lg font-semibold transition-colors duration-500",
                      isDarkTheme ? "text-white" : "text-slate-800"
                    )}>Seções do Relatório</h3>
                    <p className={cn(
                      "text-xs transition-colors duration-500",
                      isDarkTheme ? "text-slate-400" : "text-slate-500"
                    )}>Selecione o conteúdo a incluir</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className={cn(
                    "grid grid-cols-4 mb-6 p-1 rounded-xl border transition-colors duration-500",
                    isDarkTheme ? "bg-slate-800/50 border-white/5" : "bg-slate-100 border-slate-200"
                  )}>
                    <TabsTrigger value="secoes" className={cn(
                      "rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-colors duration-500",
                      isDarkTheme ? "text-slate-400" : "text-slate-600"
                    )}>Por Seção</TabsTrigger>
                    <TabsTrigger value="categorias" className={cn(
                      "rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-colors duration-500",
                      isDarkTheme ? "text-slate-400" : "text-slate-600"
                    )}>Categorias</TabsTrigger>
                    <TabsTrigger value="preview" className={cn(
                      "rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-colors duration-500",
                      isDarkTheme ? "text-slate-400" : "text-slate-600"
                    )}>Preview</TabsTrigger>
                    <TabsTrigger value="modelos" className={cn(
                      "rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-colors duration-500",
                      isDarkTheme ? "text-slate-400" : "text-slate-600"
                    )}>Modelos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="secoes" className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {categories.map((category) => {
                      const categoryItems = getSectionsByCategory(category.id);
                      if (categoryItems.length === 0) return null;
                      
                      const CategoryIcon = category.icon;
                      const isFullySelected = isCategoryFullySelected(category.id);
                      const isPartiallySelected = isCategoryPartiallySelected(category.id);

                      return (
                        <div key={category.id} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-1.5 rounded-lg",
                                isFullySelected ? "bg-emerald-500/20" : isDarkTheme ? "bg-slate-700/50" : "bg-slate-200"
                              )}>
                                <CategoryIcon className={cn(
                                  "h-4 w-4",
                                  isFullySelected ? "text-emerald-500" : isDarkTheme ? "text-slate-400" : "text-slate-500"
                                )} />
                              </div>
                              <h3 className={cn(
                                "font-semibold transition-colors duration-500",
                                isDarkTheme ? "text-white" : "text-slate-800"
                              )}>{category.title}</h3>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                isFullySelected 
                                  ? "bg-emerald-500/20 text-emerald-600" 
                                  : isDarkTheme ? "bg-slate-700/50 text-slate-400" : "bg-slate-200 text-slate-500"
                              )}>
                                {categoryItems.filter((i) => selectedSections.includes(i.id)).length}/{categoryItems.length}
                              </span>
                            </div>
                            <button
                              onClick={() => selectAllInCategory(category.id)}
                              className={cn(
                                "text-xs px-3 py-1.5 rounded-lg transition-all duration-300",
                                isFullySelected 
                                  ? "bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30" 
                                  : isDarkTheme 
                                    ? "bg-slate-700/30 text-slate-400 hover:bg-slate-700/50 hover:text-white" 
                                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                              )}
                            >
                              {isFullySelected ? "Desmarcar" : "Selecionar Todos"}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {categoryItems.map((section) => {
                              const SectionIcon = section.icon;
                              const isSelected = selectedSections.includes(section.id);

                              return (
                                <div
                                  key={section.id}
                                  onClick={() => toggleSection(section.id)}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-300 group",
                                    isSelected
                                      ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 shadow-lg shadow-emerald-500/5"
                                      : isDarkTheme 
                                        ? "border-white/10 bg-slate-800/30 hover:border-white/20 hover:bg-slate-800/50" 
                                        : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                                  )}
                                >
                                  <div className={cn(
                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300",
                                    isSelected 
                                      ? "border-emerald-500 bg-emerald-500" 
                                      : isDarkTheme 
                                        ? "border-slate-600 group-hover:border-slate-500" 
                                        : "border-slate-300 group-hover:border-slate-400"
                                  )}>
                                    {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                                  </div>
                                  <div className={cn(
                                    "p-1.5 rounded-lg transition-all duration-300",
                                    isSelected ? "bg-emerald-500/20" : isDarkTheme ? "bg-slate-700/30 group-hover:bg-slate-700/50" : "bg-slate-200 group-hover:bg-slate-300"
                                  )}>
                                    <SectionIcon className={cn(
                                      "h-4 w-4 transition-colors duration-300",
                                      isSelected ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-400"
                                    )} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "text-sm font-medium truncate transition-colors duration-300",
                                      isSelected 
                                        ? "text-emerald-600" 
                                        : isDarkTheme 
                                          ? "text-slate-300 group-hover:text-white" 
                                          : "text-slate-700 group-hover:text-slate-900"
                                    )}>
                                      {section.title}
                                    </p>
                                    <p className={cn(
                                      "text-xs truncate transition-colors duration-500",
                                      isDarkTheme ? "text-slate-500" : "text-slate-400"
                                    )}>
                                      {section.description}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  <TabsContent value="categorias" className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {categories.map((category) => {
                        const categoryItems = getSectionsByCategory(category.id);
                        if (categoryItems.length === 0) return null;
                        
                        const CategoryIcon = category.icon;
                        const selectedCount = categoryItems.filter((i) => selectedSections.includes(i.id)).length;
                        const isFullySelected = selectedCount === categoryItems.length;

                        return (
                          <div
                            key={category.id}
                            className={cn(
                              "cursor-pointer rounded-xl border p-5 text-center transition-all duration-300 group",
                              isFullySelected 
                                ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 shadow-lg shadow-emerald-500/10" 
                                : isDarkTheme 
                                  ? "border-white/10 bg-slate-800/30 hover:border-white/20 hover:bg-slate-800/50" 
                                  : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                            )}
                            onClick={() => selectAllInCategory(category.id)}
                          >
                            <div className={cn(
                              "w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-all duration-300",
                              isFullySelected ? "bg-emerald-500/20" : isDarkTheme ? "bg-slate-700/30 group-hover:bg-slate-700/50" : "bg-slate-200 group-hover:bg-slate-300"
                            )}>
                              <CategoryIcon className={cn(
                                "h-6 w-6 transition-colors duration-300",
                                isFullySelected ? "text-emerald-500" : isDarkTheme ? "text-slate-500 group-hover:text-slate-400" : "text-slate-500 group-hover:text-slate-600"
                              )} />
                            </div>
                            <h3 className={cn(
                              "font-medium text-sm transition-colors duration-300",
                              isFullySelected 
                                ? "text-emerald-600" 
                                : isDarkTheme 
                                  ? "text-slate-300 group-hover:text-white" 
                                  : "text-slate-700 group-hover:text-slate-900"
                            )}>{category.title}</h3>
                            <p className={cn(
                              "text-xs mt-1 transition-colors duration-500",
                              isDarkTheme ? "text-slate-500" : "text-slate-400"
                            )}>
                              {selectedCount}/{categoryItems.length} selecionadas
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    <div className={cn(
                      "border rounded-xl p-6 min-h-[400px] transition-colors duration-500",
                      isDarkTheme 
                        ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-white/10" 
                        : "bg-slate-50 border-slate-200"
                    )}>
                      <div className={cn(
                        "text-center mb-6 pb-4 border-b transition-colors duration-500",
                        isDarkTheme ? "border-white/10" : "border-slate-200"
                      )}>
                        <h2 className={cn(
                          "text-xl font-bold transition-colors duration-500",
                          isDarkTheme ? "text-white" : "text-slate-800"
                        )}>{reportName}</h2>
                        <p className={cn(
                          "text-sm mt-1 transition-colors duration-500",
                          isDarkTheme ? "text-slate-400" : "text-slate-500"
                        )}>
                          Período: {dateStart} a {dateEnd}
                        </p>
                      </div>

                      {selectedSections.length === 0 ? (
                        <div className="text-center py-12">
                          <div className={cn(
                            "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-500",
                            isDarkTheme ? "bg-slate-800/50" : "bg-slate-200"
                          )}>
                            <FileText className={cn("h-8 w-8", isDarkTheme ? "text-slate-600" : "text-slate-400")} />
                          </div>
                          <p className={cn("transition-colors duration-500", isDarkTheme ? "text-slate-500" : "text-slate-400")}>Selecione seções para visualizar o preview</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-emerald-500 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Índice do Relatório
                          </h3>
                          <ol className="space-y-2">
                            {selectedSections.map((sectionId, index) => {
                              const section = availableSections.find((s) => s.id === sectionId);
                              return section ? (
                                <li key={sectionId} className={cn(
                                  "flex items-center gap-3 text-sm p-2 rounded-lg transition-colors duration-500",
                                  isDarkTheme ? "text-slate-300 bg-slate-800/30" : "text-slate-700 bg-slate-100"
                                )}>
                                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                  </span>
                                  {section.title}
                                </li>
                              ) : null;
                            })}
                          </ol>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="modelos" className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          name: "Relatório Completo",
                          description: "Todas as seções disponíveis",
                          icon: FileText,
                          sections: availableSections.map((s) => s.id),
                        },
                        {
                          name: "Operacional",
                          description: "Manutenções, vistorias, ocorrências e checklists",
                          icon: Wrench,
                          sections: ["manutencoes", "vistorias", "ocorrencias", "checklists", "ordens_servico", "vencimentos"],
                        },
                        {
                          name: "Funções Rápidas",
                          description: "Todas as funções rápidas registradas",
                          icon: Zap,
                          sections: ["funcoes_rapidas", "vistorias_rapidas", "manutencoes_rapidas", "ocorrencias_rapidas", "antes_depois_rapido"],
                        },
                        {
                          name: "Galeria e Mídia",
                          description: "Fotos, realizações, melhorias e aquisições",
                          icon: Image,
                          sections: ["albuns", "realizacoes", "melhorias", "aquisicoes", "antes_depois"],
                        },
                        {
                          name: "Resumo Executivo",
                          description: "Manutenções, vistorias e ordens de serviço",
                          icon: BarChart3,
                          sections: ["manutencoes", "vistorias", "ordens_servico", "vencimentos"],
                        },
                        {
                          name: "Completo + Rápidas",
                          description: "Operacional completo com funções rápidas",
                          icon: ClipboardList,
                          sections: ["manutencoes", "ocorrencias", "vistorias", "checklists", "ordens_servico", "funcoes_rapidas"],
                        },
                      ].map((model) => {
                        const ModelIcon = model.icon;
                        return (
                          <div
                            key={model.name}
                            className={cn(
                              "cursor-pointer rounded-xl border p-5 transition-all duration-300 group",
                              isDarkTheme 
                                ? "border-white/10 bg-slate-800/30 hover:border-white/20 hover:bg-slate-800/50" 
                                : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100"
                            )}
                            onClick={() => setSelectedSections(model.sections)}
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className={cn(
                                "p-2 rounded-lg transition-all duration-300",
                                isDarkTheme 
                                  ? "bg-slate-700/30 group-hover:bg-slate-700/50" 
                                  : "bg-slate-200 group-hover:bg-slate-300"
                              )}>
                                <ModelIcon className={cn(
                                  "h-5 w-5 transition-colors duration-300",
                                  isDarkTheme 
                                    ? "text-slate-400 group-hover:text-emerald-400" 
                                    : "text-slate-500 group-hover:text-emerald-500"
                                )} />
                              </div>
                              <h3 className={cn(
                                "font-semibold transition-colors duration-300",
                                isDarkTheme 
                                  ? "text-slate-300 group-hover:text-white" 
                                  : "text-slate-700 group-hover:text-slate-900"
                              )}>{model.name}</h3>
                            </div>
                            <p className={cn(
                              "text-sm mb-3 transition-colors duration-500",
                              isDarkTheme ? "text-slate-500" : "text-slate-400"
                            )}>{model.description}</p>
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full transition-colors duration-500",
                              isDarkTheme ? "bg-slate-700/50 text-slate-400" : "bg-slate-200 text-slate-500"
                            )}>
                              {model.sections.length} seções
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Configuração de Cabeçalho/Rodapé - Premium */}
      <Dialog open={showHeaderConfig} onOpenChange={setShowHeaderConfig}>
        <DialogContent className="w-[95vw] max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10 shadow-2xl shadow-black/50">
          <DialogHeader className="pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">Configurações de Cabeçalho e Rodapé</DialogTitle>
                <DialogDescription className="text-slate-400 mt-0.5">
                  Personalize o cabeçalho e rodapé dos seus relatórios
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-6 max-h-[60vh] overflow-y-auto pr-2">
            {/* Cabeçalho */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-white text-lg">Cabeçalho</h3>
              </div>
              
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-slate-300 text-sm font-medium">Logo do Condomínio</Label>
                  <div className="flex items-center gap-5">
                    {cabecalhoLogoUrl ? (
                      <div className="relative group">
                        <img
                          src={cabecalhoLogoUrl}
                          alt="Logo"
                          className="h-20 w-20 object-contain rounded-xl border-2 border-white/20 shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-20 w-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
                        <Image className="h-8 w-8 text-slate-500" />
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="relative cursor-pointer">
                        <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 border border-white/10 hover:border-white/20 transition-all duration-300 text-sm text-white font-medium inline-flex items-center gap-2 shadow-lg">
                          <Camera className="h-4 w-4" />
                          {isUploading ? "Enviando..." : "Escolher Imagem"}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={isUploading}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </label>
                      <p className="text-xs text-slate-500 mt-2">PNG, JPG ou WebP até 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nomeCondominio" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5 text-slate-500" />
                      Nome do Condomínio
                    </Label>
                    <Input
                      id="nomeCondominio"
                      value={cabecalhoNomeCondominio}
                      onChange={(e) => setCabecalhoNomeCondominio(e.target.value)}
                      placeholder="Ex: Residencial Jardins"
                      className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nomeSindico" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      Nome do Gestor
                    </Label>
                    <Input
                      id="nomeSindico"
                      value={cabecalhoNomeSindico}
                      onChange={(e) => setCabecalhoNomeSindico(e.target.value)}
                      placeholder="Ex: João Silva"
                      className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
                  <FileSpreadsheet className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-white text-lg">Rodapé</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="rodapeTexto" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                    Texto do Rodapé
                  </Label>
                  <Textarea
                    id="rodapeTexto"
                    value={rodapeTexto}
                    onChange={(e) => setRodapeTexto(e.target.value)}
                    placeholder="Ex: Documento gerado automaticamente pelo sistema"
                    rows={2}
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rodapeContato" className="text-slate-300 text-sm font-medium flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    Informações de Contato
                  </Label>
                  <Input
                    id="rodapeContato"
                    value={rodapeContato}
                    onChange={(e) => setRodapeContato(e.target.value)}
                    placeholder="Ex: Tel: (11) 1234-5678 | email@condominio.com"
                    className="bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-white/10 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-cyan-400" />
                <p className="text-sm font-medium text-slate-300">Pré-visualização do Cabeçalho</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-4">
                  {cabecalhoLogoUrl ? (
                    <img src={cabecalhoLogoUrl} alt="Logo" className="h-12 w-12 object-contain rounded-lg" />
                  ) : (
                    <div className="h-12 w-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-slate-400" />
                    </div>
                  )}
                  <div className="border-l-2 border-emerald-500 pl-4">
                    <p className="font-bold text-slate-800">{cabecalhoNomeCondominio || "Nome do Condomínio"}</p>
                    <p className="text-sm text-slate-500">{cabecalhoNomeSindico || "Nome do Gestor"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button 
              variant="outline" 
              onClick={() => setShowHeaderConfig(false)}
              className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveHeaderConfig} 
              disabled={updateCondominio.isPending}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:shadow-emerald-500/40"
            >
              {updateCondominio.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
