import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { 
  LogOut, 
  Wrench, 
  Search, 
  AlertTriangle, 
  ClipboardCheck, 
  Camera,
  Calendar,
  Award,
  TrendingUp,
  Package,
  Image,
  FileCheck,
  Home,
  Settings,
  User,
  Sparkles
} from "lucide-react";

// Mapeamento de ícones para módulos
const moduleIcons: Record<string, any> = {
  manutencoes: Wrench,
  vistorias: Search,
  ocorrencias: AlertTriangle,
  checklists: ClipboardCheck,
  antes_depois: Camera,
  agenda_vencimentos: Calendar,
  realizacoes: Award,
  melhorias: TrendingUp,
  aquisicoes: Package,
  galeria_fotos: Image,
  ordens_servico: FileCheck,
};

// Cores para módulos
const moduleColors: Record<string, string> = {
  manutencoes: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  vistorias: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  ocorrencias: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  checklists: "bg-teal-100 text-teal-700 hover:bg-teal-200",
  antes_depois: "bg-violet-100 text-violet-700 hover:bg-violet-200",
  agenda_vencimentos: "bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-200",
  realizacoes: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  melhorias: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  aquisicoes: "bg-green-100 text-green-700 hover:bg-green-200",
  galeria_fotos: "bg-pink-100 text-pink-700 hover:bg-pink-200",
  ordens_servico: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
};

// Nomes amigáveis para módulos
const moduleNames: Record<string, string> = {
  manutencoes: "Manutenções",
  vistorias: "Vistorias",
  ocorrencias: "Ocorrências",
  checklists: "Checklists",
  antes_depois: "Antes e Depois",
  agenda_vencimentos: "Agenda de Vencimentos",
  realizacoes: "Realizações",
  melhorias: "Melhorias",
  aquisicoes: "Aquisições",
  galeria_fotos: "Galeria de Fotos",
  ordens_servico: "Ordens de Serviço",
  ordem_servico: "Ordens de Serviço",
  vencimentos: "Agenda de Vencimentos",
  galeria: "Galeria de Fotos",
};

// Mapeamento de módulos para rotas
const moduleRoutes: Record<string, string> = {
  manutencoes: "/dashboard/manutencoes",
  vistorias: "/dashboard/vistorias",
  ocorrencias: "/dashboard/ocorrencias",
  checklists: "/dashboard/checklists",
  antes_depois: "/dashboard/antes-depois",
  agenda_vencimentos: "/dashboard/vencimentos",
  vencimentos: "/dashboard/vencimentos",
  realizacoes: "/dashboard/realizacoes",
  melhorias: "/dashboard/melhorias",
  aquisicoes: "/dashboard/aquisicoes",
  galeria_fotos: "/dashboard/galeria",
  galeria: "/dashboard/galeria",
  ordens_servico: "/dashboard/ordens-servico",
  ordem_servico: "/dashboard/ordens-servico",
  // Funções rápidas
  antes_depois_rapido: "/dashboard/funcoes-rapidas-page",
  checklist_rapido: "/dashboard/funcoes-rapidas-page",
  manutencao_rapida: "/dashboard/funcoes-rapidas-page",
  ocorrencia_rapida: "/dashboard/funcoes-rapidas-page",
  vistoria_rapida: "/dashboard/funcoes-rapidas-page",
};

export default function AppView() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [appInfo, setAppInfo] = useState<{
    nome: string;
    modulos: any[];
    permissao: string;
    usuarioNome?: string;
  } | null>(null);
  
  // Verificar sessão ao carregar
  useEffect(() => {
    const token = sessionStorage.getItem("app_token");
    const appId = sessionStorage.getItem("app_id");
    const appNome = sessionStorage.getItem("app_nome");
    const permissao = sessionStorage.getItem("app_permissao");
    const usuarioNome = sessionStorage.getItem("app_usuario_nome");
    
    if (!token || !appId || appId !== id) {
      toast.error("Sessão inválida. Faça login novamente.");
      setLocation("/");
      return;
    }
    
    // Carregar informações do app da sessão
    setAppInfo({
      nome: appNome || "Meu App",
      modulos: [], // Será carregado via API
      permissao: permissao || "visualizar",
      usuarioNome: usuarioNome || undefined,
    });
  }, [id, setLocation]);
  
  // Buscar detalhes do app
  const { data: appData, isLoading } = trpc.apps.getById.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id && !!appInfo }
  );
  
  // Atualizar módulos quando os dados do app carregarem
  useEffect(() => {
    if (appData && appInfo) {
      setAppInfo(prev => prev ? {
        ...prev,
        nome: appData.nome,
        modulos: appData.modulos || [],
      } : null);
    }
  }, [appData]);
  
  const handleLogout = () => {
    sessionStorage.removeItem("app_token");
    sessionStorage.removeItem("app_id");
    sessionStorage.removeItem("app_nome");
    sessionStorage.removeItem("app_permissao");
    sessionStorage.removeItem("app_usuario_nome");
    toast.success("Sessão encerrada");
    setLocation("/");
  };
  
  const handleModuleClick = (moduleId: string) => {
    // Funções personalizadas (custom_123)
    if (moduleId.startsWith("custom_")) {
      const funcaoId = moduleId.replace("custom_", "");
      setLocation(`/dashboard/funcao-personalizada/${funcaoId}`);
      return;
    }
    const route = moduleRoutes[moduleId];
    if (route) {
      setLocation(route);
    } else {
      toast.info(`Módulo ${moduleNames[moduleId] || moduleId} - Em desenvolvimento`);
    }
  };
  
  if (!appInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">A carregar...</p>
        </div>
      </div>
    );
  }
  
  const modulos = appData?.modulos || [];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{appInfo.nome}</h1>
              <p className="text-xs text-gray-500">
                {appInfo.usuarioNome ? `Olá, ${appInfo.usuarioNome}` : "Bem-vindo"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex">
              {appInfo.permissao === "administrar" ? "Administrador" : 
               appInfo.permissao === "editar" ? "Editor" : "Visualizador"}
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Boas-vindas */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo ao {appInfo.nome}
          </h2>
          <p className="text-gray-600">
            Selecione um módulo para começar
          </p>
        </div>
        
        {/* Grid de Módulos */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : modulos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {modulos.map((modulo: any) => {
              const moduleId = typeof modulo === 'string' ? modulo : modulo.moduloKey;
              const isCustom = moduleId?.startsWith("custom_");
              const Icon = isCustom ? Sparkles : (moduleIcons[moduleId] || Wrench);
              const colorClass = isCustom ? "bg-pink-100 text-pink-700 hover:bg-pink-200" : (moduleColors[moduleId] || "bg-gray-100 text-gray-700 hover:bg-gray-200");
              const name = typeof modulo === 'string' ? (moduleNames[moduleId] || moduleId) : (modulo.titulo || moduleNames[moduleId] || moduleId);
              
              return (
                <Card 
                  key={moduleId}
                  className={`cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${colorClass}`}
                  onClick={() => handleModuleClick(moduleId)}
                >
                  <CardContent className="p-6 flex flex-col items-center justify-center text-center h-32">
                    <Icon className="w-10 h-10 mb-3" />
                    <span className="font-medium text-sm">{name}</span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum módulo configurado
              </h3>
              <p className="text-gray-500">
                O gestor ainda não adicionou módulos a este app.
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Ações Rápidas */}
        {modulos.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="gap-2">
                <Wrench className="w-4 h-4" />
                Nova Manutenção
              </Button>
              <Button variant="outline" className="gap-2">
                <Search className="w-4 h-4" />
                Nova Vistoria
              </Button>
              <Button variant="outline" className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                Nova Ocorrência
              </Button>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-4">
        <div className="container mx-auto flex items-center justify-center gap-8">
          <button className="flex flex-col items-center gap-1 text-orange-500">
            <Home className="w-5 h-5" />
            <span className="text-xs">Início</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-xs">Tarefas</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600">
            <User className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
