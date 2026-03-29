import { useState, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";
import {
  Megaphone,
  Calendar,
  Vote,
  ShoppingBag,
  Users,
  FileText,
  Image,
  MessageSquare,
  Bell,
  Car,
  Wrench,
  ClipboardCheck,
  AlertTriangle,
  Search,
  BookOpen,
  Building2,
  Phone,
  MapPin,
  GripVertical,
  Plus,
  Trash2,
  Eye,
  Save,
  ArrowLeft,
  Smartphone,
  Palette,
  Settings,
  Layout,
  Check,
  X,
  Shield,
  Lightbulb,
  Package,
  Hammer,
  Camera,
  Clock,
  DollarSign,
  CalendarClock,
  Video,
  HelpCircle,
  Award,
  Sparkles,
  Newspaper,
  Briefcase,
  Home,
  Key,
  Truck,
  ParkingCircle,
  Wifi,
  Zap,
  HeartHandshake,
  ClipboardList,
  FileCheck,
  BadgeCheck,
  ClipboardPen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppAcessoConfig } from "@/components/AppAcessoConfig";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Tipos
interface AppModule {
  id: string;
  key: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  enabled: boolean;
  order: number;
}

// Módulos disponíveis - Ordenados alfabeticamente
// Estilo profissional com gradientes
const availableModules: Omit<AppModule, "enabled" | "order">[] = [
  // Funções Completas (A-Z)
  { id: "vencimentos", key: "vencimentos", title: "Agenda Vencimentos", icon: CalendarClock, color: "text-white", bgColor: "bg-gradient-to-br from-fuchsia-500 to-purple-600" },
  { id: "antes_depois", key: "antes_depois", title: "Antes e Depois Completa", icon: Camera, color: "text-white", bgColor: "bg-gradient-to-br from-violet-500 to-indigo-600" },
  { id: "aquisicoes", key: "aquisicoes", title: "Aquisições", icon: Package, color: "text-white", bgColor: "bg-gradient-to-br from-green-500 to-emerald-600" },
  { id: "checklists", key: "checklists", title: "Checklists Completos", icon: ClipboardCheck, color: "text-white", bgColor: "bg-gradient-to-br from-teal-500 to-cyan-600" },
  { id: "galeria", key: "galeria", title: "Galeria de Fotos", icon: Image, color: "text-white", bgColor: "bg-gradient-to-br from-pink-500 to-rose-600" },
  { id: "manutencoes", key: "manutencoes", title: "Manutenções Completas", icon: Wrench, color: "text-white", bgColor: "bg-gradient-to-br from-slate-600 to-slate-800" },
  { id: "melhorias", key: "melhorias", title: "Melhorias", icon: Hammer, color: "text-white", bgColor: "bg-gradient-to-br from-amber-500 to-orange-600" },
  { id: "ocorrencias", key: "ocorrencias", title: "Ocorrências Completas", icon: AlertTriangle, color: "text-white", bgColor: "bg-gradient-to-br from-yellow-500 to-amber-600" },
  { id: "ordem_servico", key: "ordem_servico", title: "Ordens de Serviço", icon: ClipboardPen, color: "text-white", bgColor: "bg-gradient-to-br from-teal-600 to-emerald-700" },
  { id: "realizacoes", key: "realizacoes", title: "Realizações", icon: Award, color: "text-white", bgColor: "bg-gradient-to-br from-yellow-600 to-orange-700" },
  { id: "vistorias", key: "vistorias", title: "Vistorias Completas", icon: Search, color: "text-white", bgColor: "bg-gradient-to-br from-emerald-500 to-green-600" },
  // Funções Rápidas (A-Z)
  { id: "antes_depois_rapido", key: "antes_depois_rapido", title: "Antes/Depois Rápido", icon: Zap, color: "text-white", bgColor: "bg-gradient-to-br from-violet-400 to-purple-500" },
  { id: "checklist_rapido", key: "checklist_rapido", title: "Checklist Rápido", icon: Zap, color: "text-white", bgColor: "bg-gradient-to-br from-teal-400 to-cyan-500" },
  { id: "manutencao_rapida", key: "manutencao_rapida", title: "Manutenção Rápida", icon: Zap, color: "text-white", bgColor: "bg-gradient-to-br from-slate-500 to-slate-700" },
  { id: "ocorrencia_rapida", key: "ocorrencia_rapida", title: "Ocorrência Rápida", icon: Zap, color: "text-white", bgColor: "bg-gradient-to-br from-yellow-400 to-amber-500" },
  { id: "vistoria_rapida", key: "vistoria_rapida", title: "Vistoria Rápida", icon: Zap, color: "text-white", bgColor: "bg-gradient-to-br from-emerald-400 to-green-500" },
];

// Componente de módulo arrastável - Estilo profissional
function SortableModule({ module, onToggle, onRemove }: { 
  module: AppModule; 
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = module.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group rounded-2xl border transition-all duration-300 overflow-hidden",
        isDragging ? "opacity-50 scale-105 z-50 shadow-2xl" : "opacity-100",
        module.enabled 
          ? "border-transparent bg-white shadow-lg hover:shadow-xl" 
          : "border-dashed border-gray-300 bg-gray-50/80"
      )}
    >
      {/* Barra de gradiente no topo quando ativo */}
      {module.enabled && (
        <div className={cn("h-1.5 w-full", module.bgColor)} />
      )}

      {/* Grip handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 left-3 p-1.5 rounded-lg cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 hover:bg-gray-100/80 backdrop-blur-sm transition-colors"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(module.id)}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="p-5 pt-10">
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-all shadow-lg",
          module.enabled ? module.bgColor : "bg-gray-200"
        )}>
          <Icon className={cn("w-7 h-7", module.enabled ? module.color : "text-gray-400")} />
        </div>
        
        <h4 className={cn(
          "text-sm font-semibold text-center mb-4 line-clamp-2",
          module.enabled ? "text-gray-800" : "text-gray-400"
        )}>
          {module.title}
        </h4>

        <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-lg py-2 px-3">
          <Switch
            checked={module.enabled}
            onCheckedChange={() => onToggle(module.id)}
            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-500 data-[state=checked]:to-amber-500"
          />
          <span className={cn(
            "text-xs font-medium",
            module.enabled ? "text-orange-600" : "text-gray-400"
          )}>
            {module.enabled ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Componente de módulo para adicionar - Estilo profissional
function AddModuleCard({ module, onAdd }: { 
  module: Omit<AppModule, "enabled" | "order">; 
  onAdd: (module: Omit<AppModule, "enabled" | "order">) => void;
}) {
  const Icon = module.icon;

  return (
    <button
      onClick={() => onAdd(module)}
      className="p-4 rounded-2xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 flex flex-col items-center gap-3 group relative overflow-hidden"
    >
      {/* Efeito de hover no fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300",
          module.bgColor
        )}>
          <Icon className={cn("w-6 h-6", module.color)} />
        </div>
        <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-800 text-center line-clamp-2 leading-tight">
          {module.title}
        </span>
        <div className="w-6 h-6 rounded-full bg-orange-100 group-hover:bg-orange-500 flex items-center justify-center transition-all duration-300">
          <Plus className="w-3.5 h-3.5 text-orange-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </button>
  );
}

// Componente de preview do módulo - Estilo funções rápidas
function ModulePreview({ module }: { module: AppModule }) {
  const Icon = module.icon;
  
  return (
    <div className={cn(
      "aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all shadow-sm",
      module.bgColor
    )}>
      <Icon className={cn("w-6 h-6 mb-1", module.color)} />
      <span className="text-[10px] font-semibold text-white text-center leading-tight drop-shadow-sm">{module.title}</span>
    </div>
  );
}

export default function AppBuilder() {
  const [, setLocation] = useLocation();
  const [appName, setAppName] = useState("Meu App");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modules, setModules] = useState<AppModule[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showAcessoConfig, setShowAcessoConfig] = useState(false);
  const [savedAppId, setSavedAppId] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Buscar condomínio do usuário
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = condominios?.[0]?.id;

  // Buscar funções personalizadas
  const { data: funcoesPersonalizadas } = trpc.funcoesPersonalizadas.listar.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  // Converter funções personalizadas em módulos
  const customModules: Omit<AppModule, "enabled" | "order">[] = useMemo(() => {
    if (!funcoesPersonalizadas) return [];
    return funcoesPersonalizadas.map((fp) => ({
      id: `custom_${fp.id}`,
      key: `custom_${fp.id}`,
      title: fp.nome,
      icon: Sparkles,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-pink-500 to-rose-600",
    }));
  }, [funcoesPersonalizadas]);
  
  // Mutation para criar app
  const createApp = trpc.apps.create.useMutation({
    onSuccess: (data) => {
      toast.success("App salvo com sucesso!");
      setSavedAppId(data.id);
      setIsSaving(false);
      // Mostrar opção de configurar acesso
      setShowAcessoConfig(true);
    },
    onError: (error) => {
      toast.error(`Erro ao salvar: ${error.message}`);
      setIsSaving(false);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex).map((m, i) => ({ ...m, order: i }));
      });
      toast.success("Ordem atualizada!");
    }
  };

  const toggleModule = (id: string) => {
    setModules((items) =>
      items.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const removeModule = (id: string) => {
    setModules((items) => items.filter((m) => m.id !== id));
    toast.info("Módulo removido");
  };

  const addModule = (module: Omit<AppModule, "enabled" | "order">) => {
    if (modules.find((m) => m.id === module.id)) {
      toast.error("Este módulo já está no app");
      return;
    }
    setModules((items) => [...items, { ...module, enabled: true, order: items.length }]);
    toast.success(`${module.title} adicionado!`);
  };

  const enabledModules = modules.filter((m) => m.enabled);
  const unusedModules = availableModules.filter((m) => !modules.find((mod) => mod.id === m.id));
  const unusedCustomModules = customModules.filter((m) => !modules.find((mod) => mod.id === m.id));
  const activeModule = activeId ? modules.find((m) => m.id === activeId) : null;

  const handleSave = async () => {
    if (!condominioId) {
      toast.error("Você precisa cadastrar uma organização primeiro");
      setLocation("/dashboard/condominio");
      return;
    }
    
    if (!appName.trim()) {
      toast.error("Digite um nome para o app");
      return;
    }
    
    if (enabledModules.length === 0) {
      toast.error("Adicione pelo menos um módulo ao app");
      return;
    }
    
    setIsSaving(true);
    
    createApp.mutate({
      condominioId,
      nome: appName,
      modulos: enabledModules.map((m, index) => ({
        moduloKey: m.key,
        titulo: m.title,
        icone: m.id,
        cor: m.color,
        bgCor: m.bgColor,
        ordem: index,
        habilitado: true,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Construtor de App</h1>
                <p className="text-sm text-muted-foreground">Arraste e solte para personalizar</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={() => {
                if (enabledModules.length === 0) {
                  toast.error("Adicione pelo menos um módulo para pré-visualizar");
                  return;
                }
                setShowPreview(true);
              }}>
                <Eye className="w-4 h-4" />
                Pré-visualizar
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar App
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de configuração */}
          <div className="lg:col-span-2 space-y-6">
            {/* Nome do App */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Configurações do App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="appName">Nome do App</Label>
                    <Input
                      id="appName"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      placeholder="Ex: App Residencial Jardins"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Módulos Selecionados</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {modules.length}
                      </Badge>
                      <span className="text-sm text-muted-foreground">de {availableModules.length} disponíveis</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grid de módulos */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" />
                  Layout do App
                </CardTitle>
                <CardDescription>
                  Arraste os módulos para reorganizar. Ative ou desative conforme necessário.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <Layout className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 font-medium">Nenhum módulo selecionado</p>
                    <p className="text-sm text-gray-400 mt-1">Adicione módulos da lista abaixo para começar</p>
                  </div>
                ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={modules.map((m) => m.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {modules.map((module) => (
                        <SortableModule
                          key={module.id}
                          module={module}
                          onToggle={toggleModule}
                          onRemove={removeModule}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeModule ? (
                      <div className="rounded-xl border-2 border-primary bg-white shadow-2xl p-4 opacity-90">
                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto", activeModule.bgColor)}>
                          <activeModule.icon className={cn("w-6 h-6", activeModule.color)} />
                        </div>
                        <h4 className="text-sm font-medium text-center">{activeModule.title}</h4>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
                )}
              </CardContent>
            </Card>

            {/* Módulos disponíveis para adicionar */}
            {(unusedModules.length > 0 || unusedCustomModules.length > 0) && (
              <Card className="overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white border-b">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Plus className="w-5 h-5 text-orange-500" />
                    Adicionar Módulos
                  </CardTitle>
                  <CardDescription>
                    Clique para adicionar mais módulos ao seu app
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Funções Completas */}
                  {unusedModules.filter(m => !m.id.includes('rapido') && !m.id.includes('rapida')).length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-orange-200 to-transparent" />
                        <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider px-2">Funções Completas</span>
                        <div className="h-px flex-1 bg-gradient-to-l from-orange-200 to-transparent" />
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {unusedModules.filter(m => !m.id.includes('rapido') && !m.id.includes('rapida')).map((module) => (
                          <AddModuleCard key={module.id} module={module} onAdd={addModule} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Funções Rápidas */}
                  {unusedModules.filter(m => m.id.includes('rapido') || m.id.includes('rapida')).length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-amber-200 to-transparent" />
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider px-2 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Funções Rápidas
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-amber-200 to-transparent" />
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {unusedModules.filter(m => m.id.includes('rapido') || m.id.includes('rapida')).map((module) => (
                          <AddModuleCard key={module.id} module={module} onAdd={addModule} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Funções Personalizadas */}
                  {unusedCustomModules.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-pink-200 to-transparent" />
                        <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider px-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Funções Personalizadas
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-pink-200 to-transparent" />
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                        {unusedCustomModules.map((module) => (
                          <AddModuleCard key={module.id} module={module} onAdd={addModule} />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview do App */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 bg-gradient-to-r from-primary to-primary/80 text-white">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Preview do App
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Mockup de celular */}
                  <div className="bg-gray-900 p-4 flex justify-center">
                    <div className="w-[240px] bg-white rounded-[2rem] p-2 shadow-2xl">
                      {/* Notch */}
                      <div className="bg-gray-900 rounded-t-[1.5rem] pt-6 pb-2 px-4">
                        <div className="w-20 h-5 bg-gray-800 rounded-full mx-auto mb-2" />
                        <div className="text-white text-center">
                          <p className="text-xs text-gray-400">EDIÇÃO {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}</p>
                          <h3 className="text-sm font-bold truncate">{appName}</h3>
                        </div>
                      </div>
                      
                      {/* Grid de módulos com scroll */}
                      <div className="bg-gray-50 p-3 min-h-[300px] max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {enabledModules.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {enabledModules.map((module) => (
                              <ModulePreview key={module.id} module={module} />
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                            <Layout className="w-10 h-10 mb-2" />
                            <p className="text-xs text-center">Adicione módulos<br />para montar seu app</p>
                          </div>
                        )}
                      </div>

                      {/* Bottom bar */}
                      <div className="bg-white rounded-b-[1.5rem] py-3 px-4 border-t">
                        <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas */}
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{enabledModules.length}</p>
                      <p className="text-xs text-muted-foreground">Módulos Ativos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-600">{modules.length}</p>
                      <p className="text-xs text-muted-foreground">Total no App</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialog de Pré-visualização do App */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-sm p-0 overflow-hidden rounded-3xl border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-blue-50 to-white min-h-[520px] flex flex-col">
            {/* Status bar simulada */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 pt-8 pb-4 px-5 text-white">
              <p className="text-[10px] uppercase tracking-widest text-blue-200 mb-1">Pré-visualização</p>
              <h2 className="text-lg font-bold">{appName || "Meu App"}</h2>
              <p className="text-xs text-blue-200 mt-0.5">Edição {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Grid de módulos */}
            <div className="flex-1 p-4 overflow-y-auto">
              {enabledModules.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {enabledModules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <div
                        key={module.id}
                        className={cn(
                          "aspect-square rounded-2xl flex flex-col items-center justify-center p-2 shadow-sm",
                          module.bgColor
                        )}
                      >
                        <Icon className="w-7 h-7 mb-1.5 text-white drop-shadow-sm" />
                        <span className="text-[10px] font-semibold text-white text-center leading-tight drop-shadow-sm line-clamp-2">
                          {module.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
                  <Layout className="w-10 h-10 mb-2" />
                  <p className="text-xs text-center">Nenhum módulo ativo</p>
                </div>
              )}
            </div>

            {/* Barra inferior */}
            <div className="py-3 px-6 border-t bg-white flex items-center justify-center">
              <div className="w-28 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Configuração de Acesso */}
      <Dialog open={showAcessoConfig} onOpenChange={setShowAcessoConfig}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>App Salvo com Sucesso!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Agora configure quem pode aceder ao seu app. Pode gerar códigos de acesso rápido ou cadastrar utilizadores com email e senha.
            </p>
            {savedAppId && (
              <AppAcessoConfig appId={savedAppId} appNome={appName} />
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => {
                setShowAcessoConfig(false);
                setLocation('/dashboard');
              }}>
                Configurar Depois
              </Button>
              <Button onClick={() => {
                setShowAcessoConfig(false);
                setLocation('/dashboard');
              }}>
                Concluído
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
