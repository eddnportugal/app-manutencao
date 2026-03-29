import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  LayoutGrid, 
  BookOpen, 
  ScrollText, 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight,
  ClipboardCheck,
  Wrench,
  AlertTriangle,
  ListChecks,
  ArrowLeftRight,
  CalendarClock,
  History,
  Image,
  Award,
  Building2,
  Users,
  Clock,
  Zap,
  ClipboardList,
  TrendingUp,
  Package,
  Download,
  Sparkles,
  Share2,
  BarChart3,
  Settings
} from "lucide-react";
import { Link } from "wouter";

// Dados de exemplo para demonstração - TODAS as Funções reais do sistema de manutenção
const demoContent = [
  // GESTÃO DA MANUTENÇÃO
  { 
    id: 1, 
    title: "Cadastro da Manutenção", 
    description: "Configure os dados da sua organização",
    icon: Building2,
    color: "from-blue-600 to-blue-700",
    content: "Nome da organização | Endereço | CNPJ | Responsável técnico | Contatos de emergência"
  },
  { 
    id: 2, 
    title: "Equipe de Gestão", 
    description: "Gerencie sua equipe técnica",
    icon: Users,
    color: "from-indigo-500 to-indigo-600",
    content: "12 técnicos cadastrados | 3 supervisores | Permissões personalizadas por função"
  },
  { 
    id: 3, 
    title: "Compartilhamentos", 
    description: "Compartilhe dados com parceiros e clientes",
    icon: Share2,
    color: "from-violet-500 to-violet-600",
    content: "Links de acesso | Relatórios compartilhados | Níveis de permissão"
  },

  // OPERACIONAL / MANUTENÇÃO
  { 
    id: 4, 
    title: "Histórico das Funções", 
    description: "Visualize todo o histórico de atividades",
    icon: History,
    color: "from-amber-500 to-amber-600",
    content: "254 registros este mês | 89 manutenções | 45 vistorias | 32 ocorrências resolvidas"
  },
  { 
    id: 5, 
    title: "Vistoria Completa", 
    description: "Realize vistorias detalhadas com fotos e relatórios",
    icon: ClipboardCheck,
    color: "from-blue-500 to-indigo-600",
    content: "Vistoria técnica programada para equipamentos da linha A. Status: 3 concluídas, 2 em andamento, 1 pendente."
  },
  { 
    id: 6, 
    title: "Vistoria Rápida", 
    description: "Registros ágeis para inspeções do dia a dia",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
    content: "Registro em 30 segundos | Foto + descrição | Ideal para rondas diárias"
  },
  { 
    id: 7, 
    title: "Manutenção Completa", 
    description: "Gestão completa de manutenções preventivas e corretivas",
    icon: Wrench,
    color: "from-orange-500 to-orange-600",
    content: "Manutenção preventiva - Motor 01 | Manutenção corretiva - Bomba hidráulica | Troca de filtros - Compressor"
  },
  { 
    id: 8, 
    title: "Manutenção Rápida", 
    description: "Registre manutenções simples rapidamente",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
    content: "Registro express | Peças utilizadas | Tempo de execução"
  },
  { 
    id: 9, 
    title: "Ocorrência Completa", 
    description: "Registre e acompanhe todas as ocorrências",
    icon: AlertTriangle,
    color: "from-red-500 to-rose-600",
    content: "Nova ocorrência: Vazamento no setor B - Prioridade alta | Ruído anormal no motor 03 - Em análise"
  },
  { 
    id: 10, 
    title: "Ocorrência Rápida", 
    description: "Reporte problemas imediatamente",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
    content: "Alerta rápido | Foto do problema | Notificação automática"
  },
  { 
    id: 11, 
    title: "Checklist Completo", 
    description: "Checklists detalhados para inspeções",
    icon: ListChecks,
    color: "from-emerald-500 to-teal-600",
    content: "Checklist diário - 15 itens | Checklist semanal - 28 itens | Checklist mensal - 45 itens verificados"
  },
  { 
    id: 12, 
    title: "Checklist Rápido", 
    description: "Verificações ágeis do dia a dia",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
    content: "5 itens essenciais | Conclusão em 2 minutos | Ideal para turnos"
  },
  { 
    id: 13, 
    title: "Templates de Checklist", 
    description: "Modelos prontos e personalizáveis",
    icon: ClipboardList,
    color: "from-teal-500 to-cyan-600",
    content: "Checklist NR-12 | Inspeção de Elevadores | Verificação de Extintores | Crie seus próprios modelos"
  },
  { 
    id: 14, 
    title: "Antes e Depois Completo", 
    description: "Documente visualmente as melhorias realizadas",
    icon: ArrowLeftRight,
    color: "from-purple-500 to-pink-600",
    content: "Reforma do setor de pintura - Concluída | Organização do almoxarifado - Em progresso"
  },
  { 
    id: 15, 
    title: "Antes/Depois Rápido", 
    description: "Compare resultados rapidamente",
    icon: Zap,
    color: "from-yellow-500 to-amber-500",
    content: "2 fotos | Descrição breve | Registro instantâneo"
  },
  { 
    id: 16, 
    title: "Agenda de Vencimentos", 
    description: "Controle de prazos e vencimentos",
    icon: CalendarClock,
    color: "from-cyan-500 to-blue-600",
    content: "Calibração de instrumentos - Vence 15/02 | Licença ambiental - Vence 28/02 | Contrato - Vence 10/03"
  },
  { 
    id: 17, 
    title: "Timeline", 
    description: "Visualize eventos em linha do tempo",
    icon: Clock,
    color: "from-slate-500 to-gray-600",
    content: "Eventos cronológicos | Marcos importantes | Histórico visual"
  },
  { 
    id: 18, 
    title: "Dashboard Timeline", 
    description: "Métricas e análises da timeline",
    icon: BarChart3,
    color: "from-indigo-500 to-purple-600",
    content: "Gráficos de desempenho | Indicadores KPI | Relatórios analíticos"
  },

  // ORDENS DE SERVIÇO
  { 
    id: 19, 
    title: "Ordens de Serviço", 
    description: "Gerencie todas as OS da sua organização",
    icon: ClipboardList,
    color: "from-blue-600 to-blue-700",
    content: "OS #1234 - Manutenção preventiva | OS #1235 - Troca de peça | OS #1236 - Instalação"
  },
  { 
    id: 20, 
    title: "Configurações de OS", 
    description: "Personalize suas ordens de serviço",
    icon: Settings,
    color: "from-gray-500 to-gray-600",
    content: "Campos personalizados | Fluxo de aprovação | Numeração automática"
  },

  // GALERIA E MÍDIA
  { 
    id: 21, 
    title: "Galeria de Fotos", 
    description: "Acervo visual de todas as atividades",
    icon: Image,
    color: "from-pink-500 to-rose-600",
    content: "1.250 fotos catalogadas | Filtros por data, setor e tipo de atividade"
  },
  { 
    id: 22, 
    title: "Realizações", 
    description: "Registre as conquistas da equipe",
    icon: Award,
    color: "from-amber-500 to-yellow-600",
    content: "Meta de manutenções preventivas: 95% atingida | Certificação ISO renovada"
  },
  { 
    id: 23, 
    title: "Melhorias", 
    description: "Acompanhe projetos de melhoria contínua",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-600",
    content: "Redução de paradas: 40% | Economia de energia: 25% | Satisfação: 98%"
  },
  { 
    id: 24, 
    title: "Aquisições", 
    description: "Controle de compras e aquisições",
    icon: Package,
    color: "from-orange-500 to-red-500",
    content: "Novo compressor - Aprovado | Ferramentas especiais - Em cotação | EPI's - Entregue"
  },

  // BACKUP E DADOS
  { 
    id: 25, 
    title: "Backup em Nuvem", 
    description: "Seus dados sempre seguros",
    icon: Download,
    color: "from-blue-500 to-cyan-600",
    content: "Último backup: Hoje 08:00 | 2.5GB de dados | Restauração em 1 clique"
  },

  // PERSONALIZAÇÃO
  { 
    id: 26, 
    title: "Personalizar Layout", 
    description: "Customize a aparência do seu sistema",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    content: "Cores da marca | Logo personalizado | Temas claro/escuro"
  },
];

// Layout Grid
function GridLayout() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {demoContent.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

// Layout Páginas (Flip)
function PagesLayout() {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = demoContent.length;

  const nextPage = () => setCurrentPage((prev) => (prev + 1) % totalPages);
  const prevPage = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

  const item = demoContent[currentPage];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center"
    >
      <div className="relative w-full max-w-2xl">
        {/* Navegação */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevPage}
            className="rounded-full shadow-lg bg-white hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextPage}
            className="rounded-full shadow-lg bg-white hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Página */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="perspective-1000"
          >
            <Card className="min-h-[400px] shadow-2xl border-2">
              <CardHeader className="text-center border-b bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-serif">{item.title}</CardTitle>
                <CardDescription className="text-base">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-lg text-center leading-relaxed">{item.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Indicador de página */}
        <div className="flex justify-center gap-2 mt-6">
          {demoContent.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentPage 
                  ? "bg-primary w-8" 
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Página {currentPage + 1} de {totalPages}
        </p>
      </div>
    </motion.div>
  );
}

// Layout Scroll
function ScrollLayout() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="space-y-8">
        {demoContent.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex gap-6 items-start">
              {/* Linha do tempo */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                {index < demoContent.length - 1 && (
                  <div className="w-0.5 h-full min-h-[60px] bg-gradient-to-b from-gray-300 to-transparent mt-2" />
                )}
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 pb-8">
                <h3 className="text-xl font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <p className="text-foreground">{item.content}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function DemoLayouts() {
  const [activeLayout, setActiveLayout] = useState<"grid" | "pages" | "scroll">("grid");

  const layouts = [
    { 
      id: "grid" as const, 
      name: "Painel de Gestão", 
      icon: LayoutGrid, 
      color: "bg-blue-600 hover:bg-blue-700",
      description: "Visão geral com cards de manutenção"
    },
    { 
      id: "pages" as const, 
      name: "Livro de Manutenção", 
      icon: BookOpen, 
      color: "bg-emerald-600 hover:bg-emerald-700",
      description: "Relatório em páginas estilo livro técnico"
    },
    { 
      id: "scroll" as const, 
      name: "Relatório Contínuo", 
      icon: ScrollText, 
      color: "bg-purple-600 hover:bg-purple-700",
      description: "Documento técnico com rolagem"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
            <h1 className="text-xl font-serif font-bold">
              Livro de Manutenção - Exemplos
            </h1>
            <div className="w-24" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Seletor de Layout */}
      <section className="py-8 border-b bg-secondary/30">
        <div className="container">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
              Livro de Manutenção - Escolha o Formato
            </h2>
            <p className="text-muted-foreground">
              Veja como seu livro de manutenção pode ser apresentado em diferentes formatos
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {layouts.map((layout) => (
              <Button
                key={layout.id}
                onClick={() => setActiveLayout(layout.id)}
                className={`h-auto py-4 px-6 flex-col gap-2 min-w-[180px] transition-all ${
                  activeLayout === layout.id 
                    ? `${layout.color} text-white shadow-lg scale-105` 
                    : "bg-white text-foreground border-2 hover:border-primary"
                }`}
                variant={activeLayout === layout.id ? "default" : "outline"}
              >
                <layout.icon className="w-8 h-8" />
                <span className="font-semibold">{layout.name}</span>
                <span className={`text-xs ${activeLayout === layout.id ? "text-white/80" : "text-muted-foreground"}`}>
                  {layout.description}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Área de Demonstração */}
      <section className="py-12">
        <div className="container">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              {layouts.find(l => l.id === activeLayout)?.icon && (
                <span className="w-5 h-5">
                  {(() => {
                    const Icon = layouts.find(l => l.id === activeLayout)!.icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </span>
              )}
              <span className="font-medium">
                Visualizando: {layouts.find(l => l.id === activeLayout)?.name}
              </span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeLayout === "grid" && <GridLayout key="grid" />}
            {activeLayout === "pages" && <PagesLayout key="pages" />}
            {activeLayout === "scroll" && <ScrollLayout key="scroll" />}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary/5 border-t">
        <div className="container text-center">
          <h3 className="text-2xl font-serif font-bold text-foreground mb-4">
            Crie seu Livro de Manutenção
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Documente toda a história da sua manutenção em um livro profissional. Registre vistorias, manutenções, ocorrências e muito mais.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <LayoutGrid className="w-5 h-5 mr-2" />
                Criar Painel de Gestão
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                <BookOpen className="w-5 h-5 mr-2" />
                Criar Livro de Manutenção
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                <ScrollText className="w-5 h-5 mr-2" />
                Criar Relatório Técnico
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
