import React, { useState } from "react";
import { Link } from "wouter";
import { FunctionTutorialButton } from "@/components/FunctionTutorial";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  LayoutDashboard, 
  FolderOpen, 
  Building2, 
  UsersRound, 
  Share2, 
  Wrench, 
  History, 
  ClipboardCheck, 
  Zap, 
  AlertTriangle, 
  ListChecks, 
  ClipboardList, 
  ArrowLeftRight, 
  CalendarClock, 
  Clock, 
  BarChart3, 
  Settings, 
  Image as ImageIcon, 
  Award, 
  TrendingUp, 
  Package, 
  Download, 
  Sparkles,
  Shield,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

// Definição das funções do sistema
const SYSTEM_FUNCTIONS = [
  {
    id: 1,
    name: "Visão Geral",
    description: "Dashboard principal com métricas, gráficos e resumo das atividades recentes do condomínio.",
    icon: LayoutDashboard,
    path: "/dashboard/overview",
    category: "Geral"
  },
  {
    id: 2,
    name: "Meus Projetos",
    description: "Gerenciamento de projetos digitais, revistas e publicações do condomínio.",
    icon: FolderOpen,
    path: "/dashboard/revistas",
    category: "Geral"
  },
  {
    id: 3,
    name: "Cadastro da Manutenção",
    description: "Configurações gerais do condomínio e dados cadastrais para o sistema de manutenção.",
    icon: Building2,
    path: "/dashboard/condominio",
    category: "Gestão"
  },
  {
    id: 4,
    name: "Equipe de Gestão",
    description: "Gerenciamento de membros da equipe, cargos e permissões de acesso ao sistema.",
    icon: UsersRound,
    path: "/dashboard/equipe",
    category: "Gestão"
  },
  {
    id: 5,
    name: "Compartilhamentos",
    description: "Gerencie links públicos e compartilhamentos de informações com moradores e terceiros.",
    icon: Share2,
    path: "/dashboard/compartilhamentos",
    category: "Gestão"
  },
  {
    id: 6,
    name: "Histórico das Funções",
    description: "Log completo de todas as alterações, manutenções e atividades realizadas no sistema.",
    icon: History,
    path: "/dashboard/historico",
    category: "Operacional"
  },
  {
    id: 7,
    name: "Vistoria Completa",
    description: "Realize vistorias detalhadas com fotos, agendamento e relatórios completos.",
    icon: ClipboardCheck,
    path: "/dashboard/funcoes-completas?tipo=vistoria",
    category: "Operacional"
  },
  {
    id: 8,
    name: "Vistoria Rápida",
    description: "Registro ágil de vistorias simplificadas para o dia a dia.",
    icon: Zap,
    path: "/dashboard/funcoes-simples?tipo=vistoria",
    category: "Operacional"
  },
  {
    id: 9,
    name: "Manutenção Completa",
    description: "Controle total de manutenções preventivas e corretivas com status e custos.",
    icon: Wrench,
    path: "/dashboard/funcoes-completas?tipo=manutencao",
    category: "Operacional"
  },
  {
    id: 10,
    name: "Manutenção Rápida",
    description: "Lançamento rápido de atividades de manutenção rotineiras.",
    icon: Zap,
    path: "/dashboard/funcoes-simples?tipo=manutencao",
    category: "Operacional"
  },
  {
    id: 11,
    name: "Ocorrência Completa",
    description: "Registro detalhado de ocorrências, infrações e problemas reportados.",
    icon: AlertTriangle,
    path: "/dashboard/funcoes-completas?tipo=ocorrencia",
    category: "Operacional"
  },
  {
    id: 12,
    name: "Ocorrência Rápida",
    description: "Reporte incidentes rapidamente diretamente do pátio ou áreas comuns.",
    icon: Zap,
    path: "/dashboard/funcoes-simples?tipo=ocorrencia",
    category: "Operacional"
  },
  {
    id: 13,
    name: "Checklist Completo",
    description: "Execute listas de verificação detalhadas para processos e rotinas.",
    icon: ListChecks,
    path: "/dashboard/funcoes-completas?tipo=checklist",
    category: "Operacional"
  },
  {
    id: 14,
    name: "Checklist Rápido",
    description: "Verificações rápidas de itens essenciais do dia a dia.",
    icon: Zap,
    path: "/dashboard/funcoes-simples?tipo=checklist",
    category: "Operacional"
  },
  {
    id: 15,
    name: "Templates de Checklist",
    description: "Crie e gerencie modelos padronizados para suas listas de verificação.",
    icon: ClipboardList,
    path: "/dashboard/checklist-templates",
    category: "Operacional"
  },
  {
    id: 16,
    name: "Antes e Depois Completo",
    description: "Documentação visual de trabalhos realizados comparando estado inicial e final.",
    icon: ArrowLeftRight,
    path: "/dashboard/antes-depois",
    category: "Operacional"
  },
  {
    id: 17,
    name: "Antes/Depois Rápido",
    description: "Captura rápida de fotos para comparação visual de tarefas.",
    icon: Zap,
    path: "/dashboard/funcoes-simples?tipo=antes_depois",
    category: "Operacional"
  },
  {
    id: 18,
    name: "Agenda de Vencimentos",
    description: "Controle de garantias, contratos e manutenções programadas.",
    icon: CalendarClock,
    path: "/dashboard/vencimentos",
    category: "Operacional"
  },
  {
    id: 19,
    name: "Timeline",
    description: "Visualização cronológica interativa de todos os eventos do condomínio.",
    icon: Clock,
    path: "/dashboard/timeline",
    category: "Operacional"
  },
  {
    id: 20,
    name: "Ordens de Serviço",
    description: "Gestão completa de OS e chamados técnicos.",
    icon: ClipboardList,
    path: "/dashboard/ordens-servico",
    category: "Serviços"
  },
  {
    id: 21,
    name: "Galeria de Fotos",
    description: "Acervo visual centralizado de imagens do condomínio.",
    icon: ImageIcon,
    path: "/dashboard/galeria",
    category: "Mídia"
  },
  {
    id: 22,
    name: "Realizações",
    description: "Vitrine de projetos concluídos e melhorias entregues.",
    icon: Award,
    path: "/dashboard/realizacoes",
    category: "Mídia"
  },
  {
    id: 23,
    name: "Melhorias",
    description: "Acompanhamento de benfeitorias e valorização do patrimônio.",
    icon: TrendingUp,
    path: "/dashboard/melhorias",
    category: "Mídia"
  },
  {
    id: 24,
    name: "Aquisições",
    description: "Registro de compras de equipamentos e ativos para o condomínio.",
    icon: Package,
    path: "/dashboard/aquisicoes",
    category: "Mídia"
  },
  {
    id: 25,
    name: "Backup em Nuvem",
    description: "Ferramentas para backup seguro dos dados do sistema.",
    icon: Download,
    path: "/dashboard/backup",
    category: "Dados"
  },
  {
    id: 26,
    name: "Exportar para Nuvem",
    description: "Exporte dados e relatórios para armazenamento externo.",
    icon: Download,
    path: "/dashboard/exportar-nuvem",
    category: "Dados"
  },
  {
    id: 27,
    name: "Personalizar Layout",
    description: "Ajuste a aparência e cores do sistema conforme sua identidade visual.",
    icon: Sparkles,
    path: "/dashboard/personalizar-layout",
    category: "Personalização"
  },
  {
    id: 28,
    name: "Funções Personalizadas",
    description: "Crie formulários e funções customizadas com campos livres, assinaturas, fotos e QR Code público.",
    icon: ClipboardList,
    path: "/dashboard/funcoes-personalizadas",
    category: "Personalização"
  }
];

export function IndiceFuncoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchNumber, setSearchNumber] = useState("");

  const filteredFunctions = SYSTEM_FUNCTIONS.filter((func) => {
    const matchesName = func.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       func.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesNumber = searchNumber === "" || func.id.toString() === searchNumber;
    
    return matchesName && matchesNumber;
  });

  return (
    <div className="space-y-6">
      <div data-tour="header-indice" className="flex flex-col md:flex-row gap-4 justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Todas as Funções
          </h2>
          <p className="text-muted-foreground mt-1">
            Catálogo completo de recursos do sistema. Utilize os filtros para encontrar rapidamente o que precisa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <FunctionTutorialButton tutorialId="indice-funcoes" variant="compact" />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-24">
            <div className="absolute left-2.5 top-2.5 text-gray-400">
              <span className="text-xs font-bold">#</span>
            </div>
            <Input
              type="number"
              placeholder="Nº"
              value={searchNumber}
              onChange={(e) => setSearchNumber(e.target.value)}
              className="pl-8"
              min="1"
            />
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar função por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFunctions.map((func) => (
          <Link key={func.id} href={func.path} className="block group h-full">
            <Card className="h-full hover:shadow-lg transition-all duration-300 border border-orange-200 dark:border-orange-800 hover:border-orange-500 overflow-hidden relative">
              <div className="absolute top-2 right-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transform scale-150 group-hover:scale-125 duration-500">
                <func.icon size={120} className="text-orange-500" />
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <func.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="font-mono text-xs text-orange-600 border-orange-200 bg-orange-50">
                    #{func.id.toString().padStart(2, '0')}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-orange-600 transition-colors">
                  {func.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="text-sm line-clamp-3 mb-4">
                  {func.description}
                </CardDescription>
                
                <div className="mt-auto pt-2 flex items-center text-sm font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                  Acessar Função <ExternalLink className="ml-1.5 h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredFunctions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Nenhuma função encontrada</h3>
          <p className="text-gray-500 dark:text-gray-400">Tente buscar por outro termo ou número.</p>
          <Button 
            variant="link" 
            onClick={() => {setSearchTerm(""); setSearchNumber("");}}
            className="mt-2"
          >
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
}
