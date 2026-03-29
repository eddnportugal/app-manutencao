import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  AlertTriangle,
  ListChecks,
  Image,
  Camera,
  Clock,
  CalendarClock,
  History,
  Building2,
  UsersRound,
  Share2,
  Download,
  Settings,
  Sparkles,
  BarChart3,
  Zap,
  BookOpen,
  Award,
  TrendingUp,
  Package,
  FolderOpen,
  ClipboardCheck,
  Palette,
  ArrowRightLeft,
  Gauge,
  Bug,
  TreeDeciduous,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  FolderClosed,
  Briefcase,
  Layers,
  ImageIcon,
  Cog,
  QrCode,
  Star,
  Shield,
  FileText,
  MapPin,
  Users,
  DollarSign,
  Search,
  Eye,
  Plus,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { allQuickFunctions, getSelectedQuickFunctions, CORES_FUNCOES_RAPIDAS } from "@/components/QuickFunctionsEditor";
import { 
  IconButton, IconButtonContainer, IconStyleSelector, IconBackgroundSelector, IconShapeSelector,
  type IconButtonStyle, type IconBackgroundMode, type IconShape, ICON_BUTTON_STYLES
} from "@/components/IconButtonStyles";

// Mapeamento de gradiente para cor hex (para uso com IconButton)
const gradientToHex: Record<string, string> = {
  "from-blue-400 to-indigo-500": "#3B82F6",
  "from-orange-400 to-amber-500": "#F97316",
  "from-red-400 to-rose-500": "#EF4444",
  "from-purple-400 to-violet-500": "#A855F7",
  "from-teal-400 to-cyan-500": "#14B8A6",
  "from-purple-400 to-pink-500": "#A855F7",
  "from-emerald-400 to-teal-500": "#10B981",
  "from-cyan-400 to-blue-500": "#06B6D4",
  "from-violet-400 to-purple-500": "#8B5CF6",
  "from-slate-400 to-gray-500": "#64748B",
  "from-orange-400 to-red-500": "#F97316",
  "from-pink-400 to-rose-500": "#EC4899",
  "from-rose-400 to-pink-500": "#FB7185",
  "from-yellow-400 to-amber-500": "#F59E0B",
  "from-green-400 to-teal-500": "#22C55E",
  "from-gray-400 to-slate-500": "#9CA3AF",
  "from-fuchsia-400 to-pink-500": "#D946EF",
  "from-amber-400 to-orange-500": "#F59E0B",
};

function getHexColor(gradient: string): string {
  return gradientToHex[gradient] || "#3B82F6";
}

interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  color: string;
  bgColor: string;
  gradient: string;
  category?: string;
  hidden?: boolean;
}

// Mapa de ícones para referência por string
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, ClipboardList, Wrench, AlertTriangle, ListChecks,
  Image, Camera, Clock, CalendarClock, History, Building2, UsersRound,
  Share2, Download, Settings, Sparkles, BarChart3, Zap, BookOpen,
  Award, TrendingUp, Package, FolderOpen, ClipboardCheck, ArrowRightLeft,
  Gauge, Bug, TreeDeciduous,
};

// Definição de todos os itens do menu com ícones e cores
const mobileMenuItems: MenuItem[] = [
  // Funções Operacionais
  { id: "vistorias", label: "Vistorias", icon: ClipboardCheck, path: "/dashboard/vistorias", color: "text-blue-600", bgColor: "bg-blue-100", gradient: "from-blue-400 to-indigo-500", category: "operacional" },
  { id: "manutencoes", label: "Manutenções", icon: Wrench, path: "/dashboard/manutencoes", color: "text-orange-600", bgColor: "bg-orange-100", gradient: "from-orange-400 to-amber-500", category: "operacional" },
  { id: "ocorrencias", label: "Ocorrências", icon: AlertTriangle, path: "/dashboard/ocorrencias", color: "text-red-600", bgColor: "bg-red-100", gradient: "from-red-400 to-rose-500", category: "operacional" },
  { id: "checklists", label: "Checklists", icon: ListChecks, path: "/dashboard/checklists", color: "text-purple-600", bgColor: "bg-purple-100", gradient: "from-purple-400 to-violet-500", category: "operacional" },
  { id: "antes-depois", label: "Antes e Depois", icon: ArrowRightLeft, path: "/dashboard/antes-depois", color: "text-teal-600", bgColor: "bg-teal-100", gradient: "from-teal-400 to-cyan-500", category: "operacional" },
  { id: "ordens-servico", label: "Ordens de Serviço", icon: ClipboardList, path: "/dashboard/ordens-servico", color: "text-emerald-600", bgColor: "bg-emerald-100", gradient: "from-emerald-400 to-teal-500", category: "principal" },
  { id: "timeline-unificada", label: "Timeline", icon: Clock, path: "/dashboard/timeline-unificada", color: "text-cyan-600", bgColor: "bg-cyan-100", gradient: "from-cyan-400 to-blue-500", category: "principal" },
  { id: "agenda-vencimentos-page", label: "Vencimentos", icon: CalendarClock, path: "/dashboard/agenda-vencimentos-page", color: "text-violet-600", bgColor: "bg-violet-100", gradient: "from-violet-400 to-purple-500", category: "principal" },
  { id: "historico-geral-page", label: "Histórico", icon: History, path: "/dashboard/historico-geral-page", color: "text-slate-600", bgColor: "bg-slate-100", gradient: "from-slate-400 to-gray-500", category: "principal" },
  { id: "indice-funcoes", label: "Todas as Funções", icon: BookOpen, path: "/dashboard/indice-funcoes", color: "text-purple-600", bgColor: "bg-purple-100", gradient: "from-purple-400 to-pink-500", category: "sistema" },
  // Leitura de Medidores, Controle de Pragas, Jardinagem
  { id: "leitura-medidores", label: "Medidores", icon: Gauge, path: "/dashboard/leitura-medidores", color: "text-cyan-600", bgColor: "bg-cyan-100", gradient: "from-cyan-400 to-blue-500", category: "operacional", hidden: true },
  { id: "controle-pragas", label: "Pragas", icon: Bug, path: "/dashboard/controle-pragas", color: "text-red-600", bgColor: "bg-red-100", gradient: "from-red-400 to-rose-500", category: "operacional", hidden: true },
  { id: "jardinagem", label: "Jardinagem", icon: TreeDeciduous, path: "/dashboard/jardinagem", color: "text-green-600", bgColor: "bg-green-100", gradient: "from-green-400 to-teal-500", category: "operacional", hidden: true },

  // Cadastro
  { id: "condominio", label: "Cadastro de Manutenções", icon: Building2, path: "/dashboard/condominio", color: "text-teal-600", bgColor: "bg-teal-100", gradient: "from-teal-400 to-cyan-500", category: "cadastro" },
  { id: "equipe", label: "Cadastro de Equipe", icon: UsersRound, path: "/dashboard/equipe", color: "text-orange-600", bgColor: "bg-orange-100", gradient: "from-orange-400 to-red-500", category: "cadastro" },
  { id: "compartilhamentos", label: "Compartilhar", icon: Share2, path: "/dashboard/compartilhamentos", color: "text-pink-600", bgColor: "bg-pink-100", gradient: "from-pink-400 to-rose-500", category: "cadastro" },

  // Galeria
  { id: "galeria", label: "Galeria", icon: Image, path: "/dashboard/galeria", color: "text-rose-600", bgColor: "bg-rose-100", gradient: "from-rose-400 to-pink-500", category: "galeria" },
  { id: "realizacoes", label: "Realizações", icon: Award, path: "/dashboard/realizacoes", color: "text-yellow-600", bgColor: "bg-yellow-100", gradient: "from-yellow-400 to-amber-500", category: "galeria" },
  { id: "melhorias", label: "Melhorias", icon: TrendingUp, path: "/dashboard/melhorias", color: "text-green-600", bgColor: "bg-green-100", gradient: "from-green-400 to-teal-500", category: "galeria" },
  { id: "aquisicoes", label: "Aquisições", icon: Package, path: "/dashboard/aquisicoes", color: "text-blue-600", bgColor: "bg-blue-100", gradient: "from-blue-400 to-indigo-500", category: "galeria" },
  { id: "revistas", label: "Meus Projetos", icon: FolderOpen, path: "/dashboard/revistas", color: "text-purple-600", bgColor: "bg-purple-100", gradient: "from-purple-400 to-violet-500", category: "principal" },

  // Sistema
  { id: "backup", label: "Backup", icon: Download, path: "/dashboard/backup", color: "text-gray-600", bgColor: "bg-gray-100", gradient: "from-gray-400 to-slate-500", category: "sistema" },
  { id: "personalizar-layout", label: "Personalizar", icon: Sparkles, path: "/dashboard/personalizar-layout", color: "text-fuchsia-600", bgColor: "bg-fuchsia-100", gradient: "from-fuchsia-400 to-pink-500", category: "sistema" },
  { id: "branding-relatorios", label: "Logo e Relatórios", icon: Camera, path: "/dashboard/branding-relatorios", color: "text-amber-600", bgColor: "bg-amber-100", gradient: "from-amber-400 to-orange-500", category: "sistema" },
];

// ===== DEFINIÇÃO DOS GRUPOS (ÍCONES-MÃE) =====
interface ParentGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;       // cor hex para o ícone-mãe
  categoryFilter: string; // filtra mobileMenuItems por category
}

const parentGroups: ParentGroup[] = [
  { id: "cadastro", label: "Cadastros", icon: Briefcase, color: "#14B8A6", categoryFilter: "cadastro" },
  { id: "funcoes-completas", label: "Funções Completas", icon: Layers, color: "#3B82F6", categoryFilter: "operacional" },
  { id: "funcoes-rapidas", label: "Funções Rápidas", icon: Zap, color: "#F59E0B", categoryFilter: "rapidas" },
  { id: "funcoes-personalizadas", label: "Funções Personalizadas", icon: ClipboardList, color: "#EC4899", categoryFilter: "personalizar" },
  { id: "galeria-midia", label: "Galeria & Mídia", icon: ImageIcon, color: "#EC4899", categoryFilter: "galeria" },
  // Sistema sempre por último
  { id: "sistema", label: "Sistema", icon: Cog, color: "#64748B", categoryFilter: "sistema" },
];

interface MobileHomeDashboardProps {
  onNavigate?: () => void;
  condominioId?: number;
}

// Componente de item de menu usando IconButton do sistema unificado
function MobileIconItem({ item, onNavigate, iconStyle, iconBgMode, iconShape }: { 
  item: MenuItem; onNavigate?: () => void; iconStyle: IconButtonStyle; iconBgMode: IconBackgroundMode; iconShape: IconShape 
}) {
  return (
    <Link href={item.path}>
      <div onClick={onNavigate}>
        <IconButton
          icon={item.icon}
          label={item.label}
          color={getHexColor(item.gradient)}
          style={iconStyle}
          backgroundMode={iconBgMode}
          shape={iconShape}
        />
      </div>
    </Link>
  );
}

// Painel de estilos expansível para mobile
function MobileStylePanel({ 
  iconStyle, onStyleChange, iconBgMode, onBgModeChange, iconShape, onShapeChange 
}: { 
  iconStyle: IconButtonStyle; onStyleChange: (s: IconButtonStyle) => void;
  iconBgMode: IconBackgroundMode; onBgModeChange: (m: IconBackgroundMode) => void;
  iconShape: IconShape; onShapeChange: (sh: IconShape) => void;
}) {
  const [open, setOpen] = useState(false);
  const currentLabel = ICON_BUTTON_STYLES.find(s => s.id === iconStyle)?.label || "Sólido";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
      >
        <Palette className="w-3.5 h-3.5" />
        <span className="max-w-[80px] truncate">{currentLabel}</span>
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Estilo dos botões</p>
          <IconStyleSelector value={iconStyle} onChange={(v) => { onStyleChange(v); }} />
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Fundo dos botões</p>
            <IconBackgroundSelector value={iconBgMode} onChange={(v) => { onBgModeChange(v); }} />
          </div>
          <div className="mt-3">
            <IconShapeSelector value={iconShape} onChange={(v) => { onShapeChange(v); }} />
          </div>
          <button
            onClick={() => setOpen(false)}
            className="mt-3 w-full py-2 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            Confirmar
          </button>
        </div>
      )}
    </div>
  );
}

export function MobileHomeDashboard({ onNavigate, condominioId }: MobileHomeDashboardProps) {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  
  // Query para funções rápidas
  const { data: funcoesRapidas } = trpc.funcoesRapidas.listar.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  // Query para funções personalizadas (todas ativas do usuário)
  const { data: funcoesPersonalizadas } = trpc.funcoesPersonalizadas.listarParaHome.useQuery();

  // Qual grupo está aberto (null = tela principal com ícones-mãe)
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  // Estado do estilo de ícone (6 estilos - mesmo do desktop)
  const [iconStyle, setIconStyle] = useState<IconButtonStyle>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mobile-icon-style");
      if (saved) return saved as IconButtonStyle;
      return "minimal-line";
    }
    return "minimal-line";
  });

  // Estado do modo de fundo (original / branco)
  const [iconBgMode, setIconBgMode] = useState<IconBackgroundMode>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mobile-icon-bg-mode");
      if (saved === "original" || saved === "branco") return saved;
      return "original";
    }
    return "original";
  });

  // Estado do formato do ícone (quadrado / retangulo / circulo)
  const [iconShape, setIconShape] = useState<IconShape>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mobile-icon-shape");
      if (saved === "quadrado" || saved === "circulo") return saved;
      return "quadrado";
    }
    return "quadrado";
  });

  // Salvar preferências no localStorage
  useEffect(() => {
    localStorage.setItem("mobile-icon-style", iconStyle);
  }, [iconStyle]);

  useEffect(() => {
    localStorage.setItem("mobile-icon-bg-mode", iconBgMode);
  }, [iconBgMode]);

  useEffect(() => {
    localStorage.setItem("mobile-icon-shape", iconShape);
  }, [iconShape]);

  // Background do container baseado no estilo
  const containerBg = iconStyle === "neumorphic-dark" && iconBgMode === "original"
    ? "bg-slate-900" 
    : "bg-gradient-to-b from-slate-50 to-white";

  // Renderizar item usando o sistema unificado de ícones
  const renderMenuItem = (item: MenuItem) => (
    <MobileIconItem key={item.id} item={item} onNavigate={onNavigate} iconStyle={iconStyle} iconBgMode={iconBgMode} iconShape={iconShape} />
  );

  // Mapeamento de funcaoId → tipo para funcoes-simples
  const tipoByFuncaoId: Record<string, string> = {
    "checklists": "checklist",
    "manutencoes": "manutencao",
    "ocorrencias": "ocorrencia",
    "vistorias": "vistoria",
    "antes-depois": "antes_depois",
  };

  // === Itens de funções rápidas (do DB ou fallback) ===
  const quickFunctionItems = (() => {
    if (funcoesRapidas && funcoesRapidas.length > 0) {
      return funcoesRapidas.map((funcao, index) => {
        const Icon = iconMap[funcao.icone] || Zap;
        const cor = funcao.cor || CORES_FUNCOES_RAPIDAS[index % CORES_FUNCOES_RAPIDAS.length];
        return { id: `qf-${funcao.id}`, label: funcao.nome, icon: Icon, path: funcao.path, funcaoId: funcao.funcaoId, color: "", bgColor: "", gradient: "", hexColor: cor };
      });
    }
    const selectedIds = getSelectedQuickFunctions();
    const fallbackIds = selectedIds.length > 0 ? selectedIds : ["checklists", "manutencoes", "ocorrencias", "vistorias"];
    return fallbackIds.map((funcId, index) => {
      const func = allQuickFunctions.find(f => f.id === funcId);
      if (!func) return null;
      const cor = CORES_FUNCOES_RAPIDAS[index % CORES_FUNCOES_RAPIDAS.length];
      return { id: `qf-${func.id}`, label: func.label, icon: func.icon, path: func.path, funcaoId: funcId, color: "", bgColor: "", gradient: "", hexColor: cor };
    }).filter(Boolean) as { id: string; label: string; icon: LucideIcon; path: string; funcaoId: string; color: string; bgColor: string; gradient: string; hexColor: string }[];
  })();

  // === Renderizar sub-view de um grupo ===
  const renderGroupContent = (groupId: string) => {
    const group = parentGroups.find(g => g.id === groupId);
    if (!group) return null;

    // Funções rápidas: ícones fixos da página funcoes-rapidas-page
    if (groupId === "funcoes-rapidas") {
      const funcoesRapidasFixas = [
        { id: "fr-vistoria", label: "Vistoria", icon: ClipboardList, cor: "#3B82F6" },
        { id: "fr-manutencao", label: "Manutenção", icon: Wrench, cor: "#F97316" },
        { id: "fr-ocorrencia", label: "Ocorrência", icon: AlertTriangle, cor: "#EF4444" },
        { id: "fr-antes-depois", label: "Antes/Depois", icon: ArrowRightLeft, cor: "#10B981" },
        { id: "fr-checklist", label: "Checklist", icon: ListChecks, cor: "#8B5CF6" },
      ];
      return (
        <div className="px-3 py-3">
          <IconButtonContainer style={iconStyle} backgroundMode={iconBgMode} className="grid grid-cols-1 gap-3">
            {funcoesRapidasFixas.map((item) => (
              <div key={item.id} onClick={() => {
                navigate("/dashboard/funcoes-rapidas-page");
                onNavigate?.();
              }} className="cursor-pointer">
                <IconButton
                  icon={item.icon}
                  label={item.label}
                  color={item.cor}
                  style={iconStyle}
                  backgroundMode={iconBgMode}
                  shape={iconShape}
                />
              </div>
            ))}
          </IconButtonContainer>
        </div>
      );
    }

    // Demais grupos: filtrar mobileMenuItems por category (excluindo ocultos)
    const items = mobileMenuItems.filter(i => i.category === group.categoryFilter && !i.hidden);
    return (
      <div className="px-3 py-3">
        <IconButtonContainer style={iconStyle} backgroundMode={iconBgMode} className={`grid ${iconStyle === "pill" ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
          {items.map(renderMenuItem)}
        </IconButtonContainer>
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen pb-24", containerBg)}>

      {/* Header */}
      <div className="sticky top-0 z-10 px-2 py-3 border-b flex items-center justify-between bg-white/80 backdrop-blur-sm border-slate-100">
        <div className="flex items-center gap-2">
          {openGroup && (
            <button
              onClick={() => setOpenGroup(null)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              {openGroup 
                ? parentGroups.find(g => g.id === openGroup)?.label || "Menu"
                : "Menu Principal"
              }
            </h1>
            <p className="text-xs text-slate-500">
              {openGroup ? "Toque para acessar" : "Toque em um grupo para abrir"}
            </p>
          </div>
        </div>
        <MobileStylePanel 
          iconStyle={iconStyle} 
          onStyleChange={setIconStyle}
          iconBgMode={iconBgMode}
          onBgModeChange={setIconBgMode}
          iconShape={iconShape}
          onShapeChange={setIconShape}
        />
      </div>

      {/* Conteúdo: sub-view de grupo OU tela principal */}
      {openGroup ? (
        renderGroupContent(openGroup)
      ) : (
        <div className="px-3 py-3">
          {/* Ordem: Cadastros, Vencimentos, Funções Completas, Funções Rápidas, Timeline, Ordens de Serviço, Galeria & Mídia, Sistema */}
          <IconButtonContainer style={iconStyle} backgroundMode={iconBgMode} className={`grid ${iconStyle === "pill" ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
            {/* 1. Cadastros (pasta) */}
            {(() => { const g = parentGroups.find(g => g.id === "cadastro"); return g ? (
              <div key={g.id} onClick={() => setOpenGroup(g.id)}>
                <IconButton icon={g.icon} label={g.label} color={g.color} style={iconStyle} backgroundMode={iconBgMode} shape={iconShape} />
              </div>
            ) : null; })()}
            {/* 2. Meus Projetos (avulso) */}
            {mobileMenuItems.filter(i => i.id === "revistas").map(renderMenuItem)}
            {/* 3. Vencimentos (avulso) */}
            {mobileMenuItems.filter(i => i.id === "agenda-vencimentos-page").map(renderMenuItem)}
            {/* 3. Funções Completas (pasta) */}
            {(() => { const g = parentGroups.find(g => g.id === "funcoes-completas"); return g ? (
              <div key={g.id} onClick={() => setOpenGroup(g.id)}>
                <IconButton icon={g.icon} label={g.label} color={g.color} style={iconStyle} backgroundMode={iconBgMode} shape={iconShape} />
              </div>
            ) : null; })()}
            {/* 4. Funções Rápidas (navega direto para a página) */}
            {(() => { const g = parentGroups.find(g => g.id === "funcoes-rapidas"); return g ? (
              <Link key={g.id} href="/dashboard/funcoes-rapidas-page">
                <div onClick={onNavigate}>
                  <IconButton icon={g.icon} label={g.label} color={g.color} style={iconStyle} backgroundMode={iconBgMode} shape={iconShape} />
                </div>
              </Link>
            ) : null; })()}
            {/* 4b. Funções Personalizadas (navega direto para a página) */}
            {(() => { const g = parentGroups.find(g => g.id === "funcoes-personalizadas"); return g ? (
              <Link key={g.id} href="/dashboard/funcoes-personalizadas">
                <div onClick={onNavigate}>
                  <IconButton icon={g.icon} label={g.label} color={g.color} style={iconStyle} backgroundMode={iconBgMode} shape={iconShape} />
                </div>
              </Link>
            ) : null; })()}
            {/* 5. Timeline (avulso) */}
            {mobileMenuItems.filter(i => i.id === "timeline-unificada").map(renderMenuItem)}
            {/* 6. Ordens de Serviço (avulso) */}
            {mobileMenuItems.filter(i => i.id === "ordens-servico").map(renderMenuItem)}
            {/* 6b. Histórico (avulso) */}
            {mobileMenuItems.filter(i => i.id === "historico-geral-page").map(renderMenuItem)}
            {/* 7. Galeria & Mídia (pasta) */}
            {(() => { const g = parentGroups.find(g => g.id === "galeria-midia"); return g ? (
              <div key={g.id} onClick={() => setOpenGroup(g.id)}>
                <IconButton icon={g.icon} label={g.label} color={g.color} style={iconStyle} backgroundMode={iconBgMode} shape={iconShape} />
              </div>
            ) : null; })()}
            {/* 8. Sistema (pasta) */}
            {(() => { const g = parentGroups.find(g => g.id === "sistema"); return g ? (
              <div key={g.id} onClick={() => setOpenGroup(g.id)}>
                <IconButton icon={g.icon} label={g.label} color={g.color} style={iconStyle} backgroundMode={iconBgMode} shape={iconShape} />
              </div>
            ) : null; })()}
          </IconButtonContainer>

          {/* Seção de Funções Personalizadas */}
          {funcoesPersonalizadas && funcoesPersonalizadas.length > 0 && (
            <div className="mt-5 bg-gradient-to-br from-pink-50 via-fuchsia-50 to-purple-50 rounded-2xl p-4 border border-pink-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-pink-500 to-fuchsia-600 rounded-xl shadow-md shadow-pink-500/25">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Funções Personalizadas</h2>
                    <p className="text-[10px] text-slate-500">{funcoesPersonalizadas.length} {funcoesPersonalizadas.length === 1 ? 'função' : 'funções'}</p>
                  </div>
                </div>
                <Link href="/dashboard/funcoes-personalizadas">
                  <button className="text-[10px] font-semibold text-pink-600 bg-pink-100 px-2.5 py-1 rounded-lg hover:bg-pink-200 transition-colors">
                    Ver todas
                  </button>
                </Link>
              </div>
              <div className="space-y-2">
                {funcoesPersonalizadas.slice(0, 4).map((funcao: any) => {
                  const ICONES_MAP: Record<string, any> = { ClipboardList, Wrench, AlertTriangle, ListChecks, Eye, Sparkles, Star, Shield, FileText, MapPin, Users, DollarSign, Clock, Zap, Search, QrCode, Camera };
                  const Icon = ICONES_MAP[funcao.icone] || ClipboardList;
                  const camposAtivos = typeof funcao.camposAtivos === 'string' ? JSON.parse(funcao.camposAtivos) : funcao.camposAtivos || {};
                  const qtdCampos = typeof camposAtivos === 'object' && !Array.isArray(camposAtivos)
                    ? Object.values(camposAtivos).filter(Boolean).length
                    : Array.isArray(camposAtivos) ? camposAtivos.length : 0;
                  return (
                    <Link key={funcao.id} href={`/dashboard/funcao-personalizada/${funcao.id}`}>
                      <div
                        className={cn(
                          "flex items-center gap-3 bg-white rounded-xl p-3 border border-pink-100 hover:border-pink-300 active:scale-[0.98] transition-all",
                          !funcao.ativo && "opacity-50"
                        )}
                        onClick={onNavigate}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                          style={{
                            background: `linear-gradient(135deg, ${funcao.cor}, ${funcao.cor}cc)`,
                            boxShadow: `0 4px 14px ${funcao.cor}30`
                          }}
                        >
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{funcao.nome}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: `${funcao.cor}12`, color: funcao.cor }}
                            >
                              <ListChecks className="h-2.5 w-2.5" />
                              {qtdCampos} campos
                            </span>
                            {funcao.shareToken && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-50 text-green-600">
                                <QrCode className="h-2.5 w-2.5" /> QR
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Versão compacta para uso como widget
export function MobileQuickAccess({ items, onNavigate }: { items?: MenuItem[], onNavigate?: () => void }) {
  const displayItems = items || mobileMenuItems.slice(0, 8);

  return (
    <div className="grid grid-cols-4 gap-2 p-4">
      {displayItems.map((item) => (
        <Link key={item.id} href={item.path}>
          <button
            onClick={onNavigate}
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all"
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              item.bgColor
            )}>
              <item.icon className={cn("w-4 h-4", item.color)} />
            </div>
            <span className="text-[9px] font-medium text-slate-600 text-center leading-tight line-clamp-1">
              {item.label}
            </span>
          </button>
        </Link>
      ))}
    </div>
  );
}

export default MobileHomeDashboard;
