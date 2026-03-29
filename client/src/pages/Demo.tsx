import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Info,
  Megaphone,
  MessageSquare,
  Package,
  Phone,
  Play,
  Shield,
  Star,
  Users,
  Vote,
  X,
  Building2,
  Sparkles,
  Wrench,
  ClipboardCheck,
  Image,
  ShoppingBag,
  Trophy,
  ParkingCircle,
  Bell,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";

const tourSteps = [
  {
    id: 1,
    title: "Bem-vindo à Demonstração!",
    description:
      "Esta é uma demonstração interativa da App Manutenção. Navegue pelas páginas para ver todos os recursos disponíveis.",
    position: "center",
    highlight: null,
  },
  {
    id: 2,
    title: "Navegação Intuitiva",
    description:
      "Use as setas laterais ou as teclas do teclado para navegar entre as páginas, como se estivesse folheando um projeto real.",
    position: "center",
    highlight: "navigation",
  },
  {
    id: 3,
    title: "Pronto para Começar?",
    description:
      "Explore todas as páginas e veja como seu projeto pode ficar! Crie sua conta gratuita e comece a criar projetos incríveis para sua organização!",
    position: "center",
    highlight: null,
  },
];

// Demo magazine data with all sections
const demoPages = [
  {
    id: 1,
    type: "cover",
    content: {
      titulo: "Centro de Manutenção",
      subtitulo: "Relatório Mensal",
      edicao: "Fevereiro 2026",
    },
  },
  {
    id: 2,
    type: "mensagem_sindico",
    content: {
      nome: "João Silva",
      cargo: "Gestor de Manutenção",
      titulo: "Mensagem do Gestor",
      mensagem:
        "Prezada equipe, é com grande satisfação que apresentamos mais uma edição do nosso relatório de manutenção. Neste mês, temos muitas novidades e melhorias para compartilhar com vocês! Agradeço a todos pela colaboração e participação ativa nas atividades de manutenção.",
      imagem: "/demo-images/sindico.jpg",
    },
  },
  {
    id: 3,
    type: "avisos",
    content: {
      titulo: "Avisos Importantes",
      imagem: "/demo-images/avisos.jpg",
      avisos: [
        {
          titulo: "Manutenção Preventiva",
          descricao: "Manutenção preventiva programada para os equipamentos da linha de produção.",
          tipo: "importante",
        },
        {
          titulo: "Parada Programada",
          descricao: "Parada técnica para inspeção geral no próximo final de semana.",
          tipo: "urgente",
        },
        {
          titulo: "Atualização de Procedimentos",
          descricao: "Novos procedimentos de segurança entram em vigor a partir de segunda-feira.",
          tipo: "info",
        },
      ],
    },
  },
  {
    id: 4,
    type: "eventos",
    content: {
      titulo: "Eventos do Mês",
      imagem: "/demo-images/evento.webp",
      eventos: [
        {
          titulo: "Treinamento de Segurança",
          data: "05/02/2026",
          horario: "09h",
          local: "Sala de Treinamentos",
        },
        {
          titulo: "Inspeção de Equipamentos",
          data: "10/02/2026",
          horario: "08h",
          local: "Área Técnica",
        },
        {
          titulo: "Reunião de Planejamento",
          data: "15/02/2026",
          horario: "14h",
          local: "Sala de Reuniões",
        },
      ],
    },
  },
  {
    id: 5,
    type: "manutencoes",
    content: {
      titulo: "Manutenções Realizadas",
      imagem: "/demo-images/manutencao.webp",
      manutencoes: [
        {
          titulo: "Pintura das Áreas Comuns",
          status: "Concluída",
          data: "15/12/2024",
        },
        {
          titulo: "Revisão dos Elevadores",
          status: "Em andamento",
          data: "20/12/2024",
        },
        {
          titulo: "Limpeza das Caixas d'Água",
          status: "Agendada",
          data: "05/01/2025",
        },
      ],
    },
  },
  {
    id: 6,
    type: "agenda_vencimentos",
    content: {
      titulo: "Agenda de Vencimentos",
      imagem: "/demo-images/agenda.jpg",
      vencimentos: [
        {
          titulo: "Contrato de Segurança",
          vencimento: "15/01/2025",
          valor: "R$ 8.500,00",
        },
        {
          titulo: "Manutenção Elevadores",
          vencimento: "20/01/2025",
          valor: "R$ 3.200,00",
        },
        {
          titulo: "Seguro Predial",
          vencimento: "28/02/2025",
          valor: "R$ 12.000,00",
        },
      ],
    },
  },
  {
    id: 7,
    type: "antes_depois",
    content: {
      titulo: "Antes e Depois",
      subtitulo: "Reforma do Hall de Entrada",
      imagem: "/demo-images/antes-depois.jpg",
      descricao: "Confira a transformação do hall de entrada do nossa organização após a reforma completa realizada em novembro.",
    },
  },
  {
    id: 8,
    type: "aquisicoes",
    content: {
      titulo: "Novas Aquisições",
      imagem: "/demo-images/aquisicoes.jpg",
      itens: [
        {
          titulo: "Carrinho de Limpeza",
          descricao: "Novo carrinho profissional para equipe de limpeza",
        },
        {
          titulo: "Lixeiras Seletivas",
          descricao: "5 conjuntos de lixeiras para coleta seletiva",
        },
        {
          titulo: "Câmeras de Segurança",
          descricao: "4 novas câmeras HD instaladas na garagem",
        },
      ],
    },
  },
  {
    id: 9,
    type: "realizacoes",
    content: {
      titulo: "Realizações do Mês",
      imagem: "/demo-images/realizacoes.jpg",
      realizacoes: [
        "Instalação de iluminação LED em todas as áreas comuns",
        "Implantação do sistema de controle de acesso por biometria",
        "Conclusão da reforma do playground",
        "Pintura das fachadas dos blocos A e B",
      ],
    },
  },
  {
    id: 10,
    type: "votacao",
    content: {
      titulo: "Funcionário do Mês",
      descricao: "Vote no funcionário que mais se destacou!",
      opcoes: [
        { nome: "Carlos Santos - Porteiro", votos: 45 },
        { nome: "Maria Oliveira - Zeladora", votos: 38 },
        { nome: "Pedro Lima - Segurança", votos: 22 },
      ],
      imagem: "/demo-images/votacao.png",
    },
  },
  {
    id: 11,
    type: "funcionarios",
    content: {
      titulo: "Nossa Equipe",
      imagem: "/demo-images/funcionarios.webp",
      funcionarios: [
        { nome: "Carlos Santos", cargo: "Porteiro - Turno A", telefone: "(11) 99999-1111" },
        { nome: "José Pereira", cargo: "Porteiro - Turno B", telefone: "(11) 99999-2222" },
        { nome: "Maria Oliveira", cargo: "Zeladora", telefone: "(11) 99999-3333" },
        { nome: "Pedro Lima", cargo: "Segurança", telefone: "(11) 99999-4444" },
      ],
    },
  },
  {
    id: 12,
    type: "publicidade",
    content: {
      titulo: "Parceiros e Fornecedores",
      imagem: "/demo-images/publicidade.jpg",
      anuncios: [
        {
          empresa: "Pizzaria Bella Napoli",
          descricao: "10% de desconto para a equipe",
          contato: "(11) 3333-4444",
        },
        {
          empresa: "Pet Shop Amigo Fiel",
          descricao: "Banho + Tosa com 15% OFF",
          contato: "(11) 3333-5555",
        },
      ],
    },
  },
  {
    id: 13,
    type: "classificados",
    content: {
      titulo: "Classificados",
      imagem: "/demo-images/classificados.png",
      anuncios: [
        {
          titulo: "Sofá 3 lugares",
          descricao: "Semi-novo, cor cinza. Apto 302 Bloco A",
          preco: "R$ 800,00",
        },
        {
          titulo: "Bicicleta Infantil",
          descricao: "Aro 16, pouco usada. Apto 105 Bloco B",
          preco: "R$ 250,00",
        },
        {
          titulo: "Aulas de Inglês",
          descricao: "Professora certificada. Moradora Bloco C",
          preco: "R$ 80/hora",
        },
      ],
    },
  },
  {
    id: 14,
    type: "vagas",
    content: {
      titulo: "Vagas de Estacionamento",
      imagem: "/demo-images/estacionamento.webp",
      vagas: [
        {
          numero: "Vaga 45",
          bloco: "Bloco A",
          tipo: "Aluguel",
          valor: "R$ 200/mês",
          contato: "Apto 401",
        },
        {
          numero: "Vaga 78",
          bloco: "Bloco B",
          tipo: "Venda",
          valor: "R$ 35.000",
          contato: "Apto 502",
        },
      ],
    },
  },
];

export default function Demo() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(true);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const totalPages = demoPages.length;

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages) {
      setDirection(pageIndex > currentPage ? "next" : "prev");
      setCurrentPage(pageIndex);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowTour(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    setShowTour(false);
  };

  const currentPageData = demoPages[currentPage];
  const currentTourStep = tourSteps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 py-3 px-4">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <img src="/logo-manutencao.png" alt="App Manutenção" className="w-8 h-8 object-contain" />
            <img src="/logo-manutencao.png" alt="App Manutenção" className="h-5 object-contain" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm hidden sm:inline">
              Página {currentPage + 1} de {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setShowTour(true)}
            >
              <Info className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Ver Tour</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Magazine viewer */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Navigation buttons */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-4 z-10 w-12 h-12 rounded-full bg-black/30 text-white/70 hover:text-white hover:bg-black/50 disabled:opacity-30",
            showTour && currentTourStep.highlight === "navigation" && "ring-2 ring-primary ring-offset-2 ring-offset-slate-900"
          )}
          onClick={prevPage}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-4 z-10 w-12 h-12 rounded-full bg-black/30 text-white/70 hover:text-white hover:bg-black/50 disabled:opacity-30",
            showTour && currentTourStep.highlight === "navigation" && "ring-2 ring-primary ring-offset-2 ring-offset-slate-900"
          )}
          onClick={nextPage}
          disabled={currentPage === totalPages - 1}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>

        {/* Magazine page */}
        <div className="w-full max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{
                rotateY: direction === "next" ? 90 : -90,
                opacity: 0,
              }}
              animate={{
                rotateY: 0,
                opacity: 1,
              }}
              exit={{
                rotateY: direction === "next" ? -90 : 90,
                opacity: 0,
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="magazine-page aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden"
              style={{ transformStyle: "preserve-3d" }}
            >
              <DemoPageContent page={currentPageData} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tour overlay */}
        <AnimatePresence>
          {showTour && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card rounded-2xl shadow-2xl p-6 max-w-md mx-4 pointer-events-auto border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-magazine flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Passo {currentStep + 1} de {tourSteps.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={skipTour}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <h3 className="text-xl font-bold mb-2">{currentTourStep.title}</h3>
                <p className="text-muted-foreground mb-6">{currentTourStep.description}</p>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="text-muted-foreground"
                  >
                    Anterior
                  </Button>
                  <div className="flex gap-1">
                    {tourSteps.map((_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          index === currentStep ? "bg-primary" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <Button onClick={nextStep}>
                    {currentStep === tourSteps.length - 1 ? "Começar" : "Próximo"}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer with page indicators */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-white/10 py-4 px-4">
        <div className="container flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {demoPages.map((page, index) => (
              <button
                key={index}
                onClick={() => goToPage(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-all flex-shrink-0",
                  currentPage === index
                    ? "bg-primary scale-125"
                    : "bg-white/30 hover:bg-white/50"
                )}
                title={getPageTitle(page.type)}
              />
            ))}
          </div>
        </div>
        <div className="container flex items-center justify-center mt-2">
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button className="gradient-magazine text-white">
                <Building2 className="w-4 h-4 mr-2" />
                Ir para o Painel
              </Button>
            </Link>
          ) : (
            <a href={getLoginUrl()}>
              <Button className="gradient-magazine text-white">
                <Play className="w-4 h-4 mr-2" />
                Criar Meu Projeto Grátis
              </Button>
            </a>
          )}
        </div>
      </footer>
    </div>
  );
}

function getPageTitle(type: string): string {
  const titles: Record<string, string> = {
    cover: "Capa",
    mensagem_sindico: "Mensagem do Gestor",
    avisos: "Avisos",
    eventos: "Eventos",
    manutencoes: "Manutenções",
    agenda_vencimentos: "Agenda de Vencimentos",
    antes_depois: "Antes e Depois",
    aquisicoes: "Aquisições",
    realizacoes: "Realizações",
    votacao: "Votação",
    funcionarios: "Funcionários",
    publicidade: "Publicidade",
    classificados: "Classificados",
    vagas: "Vagas de Estacionamento",
  };
  return titles[type] || type;
}

function DemoPageContent({ page }: { page: typeof demoPages[0] }) {
  switch (page.type) {
    case "cover":
      return <CoverPage content={page.content} />;
    case "mensagem_sindico":
      return <MensagemSindicoPage content={page.content} />;
    case "avisos":
      return <AvisosPage content={page.content} />;
    case "eventos":
      return <EventosPage content={page.content} />;
    case "manutencoes":
      return <ManutencoesPage content={page.content} />;
    case "agenda_vencimentos":
      return <AgendaVencimentosPage content={page.content} />;
    case "antes_depois":
      return <AntesDepoisPage content={page.content} />;
    case "aquisicoes":
      return <AquisicoesPage content={page.content} />;
    case "realizacoes":
      return <RealizacoesPage content={page.content} />;
    case "votacao":
      return <VotacaoPage content={page.content} />;
    case "funcionarios":
      return <FuncionariosPage content={page.content} />;
    case "publicidade":
      return <PublicidadePage content={page.content} />;
    case "classificados":
      return <ClassificadosPage content={page.content} />;
    case "vagas":
      return <VagasPage content={page.content} />;
    default:
      return <div className="p-8">Página não encontrada</div>;
  }
}

function CoverPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <div className="text-center">
          <p className="text-blue-200 text-sm uppercase tracking-widest mb-2">
            {content.edicao}
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {content.titulo}
          </h1>
          <div className="w-24 h-1 bg-white/50 mx-auto mb-4" />
          <p className="text-xl text-blue-100">{content.subtitulo}</p>
        </div>
      </div>
      
      <div className="p-4 text-center text-blue-200 text-sm">
        <p>— 1 —</p>
      </div>
    </div>
  );
}

function MensagemSindicoPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
            <img 
              src={content.imagem} 
              alt={content.nome}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">{content.nome}</h3>
            <p className="text-blue-600 text-sm">{content.cargo}</p>
          </div>
        </div>
        
        <div className="flex-1">
          <p className="text-slate-600 leading-relaxed text-sm">
            {content.mensagem}
          </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-slate-400 text-xs text-center">
            "Juntos construímos uma organização melhor!"
          </p>
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 2 —</p>
      </div>
    </div>
  );
}

function AvisosPage({ content }: { content: any }) {
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "urgente":
        return "bg-red-100 border-red-500 text-red-700";
      case "importante":
        return "bg-amber-100 border-amber-500 text-amber-700";
      default:
        return "bg-blue-100 border-blue-500 text-blue-700";
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <Bell className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full h-32 rounded-lg overflow-hidden mb-4">
          <img 
            src={content.imagem} 
            alt="Avisos"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-3">
          {content.avisos.map((aviso: any, index: number) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg border-l-4",
                getTipoColor(aviso.tipo)
              )}
            >
              <h3 className="font-bold text-sm">{aviso.titulo}</h3>
              <p className="text-xs mt-1 opacity-80">{aviso.descricao}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 3 —</p>
      </div>
    </div>
  );
}

function EventosPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <Calendar className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full h-32 rounded-lg overflow-hidden mb-4">
          <img 
            src={content.imagem} 
            alt="Eventos"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-3">
          {content.eventos.map((evento: any, index: number) => (
            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">{evento.titulo}</h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {evento.data}
                </span>
                <span>{evento.horario}</span>
                <span>{evento.local}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 4 —</p>
      </div>
    </div>
  );
}

function ManutencoesPage({ content }: { content: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluída":
        return "bg-green-100 text-green-700";
      case "Em andamento":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <Wrench className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full h-32 rounded-lg overflow-hidden mb-4">
          <img 
            src={content.imagem} 
            alt="Manutenções"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-3">
          {content.manutencoes.map((item: any, index: number) => (
            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">{item.titulo}</h3>
                <span className={cn("text-xs px-2 py-1 rounded-full", getStatusColor(item.status))}>
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{item.data}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 5 —</p>
      </div>
    </div>
  );
}

function AgendaVencimentosPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <FileText className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full h-28 rounded-lg overflow-hidden mb-4">
          <img 
            src={content.imagem} 
            alt="Agenda"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-3">
          {content.vencimentos.map((item: any, index: number) => (
            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">{item.titulo}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-500">Vencimento: {item.vencimento}</span>
                <span className="text-sm font-bold text-blue-600">{item.valor}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 6 —</p>
      </div>
    </div>
  );
}

function AntesDepoisPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <Image className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-4 flex flex-col">
        <h3 className="font-bold text-slate-800 text-center mb-2">{content.subtitulo}</h3>
        
        <div className="flex-1 rounded-lg overflow-hidden mb-4">
          <img 
            src={content.imagem} 
            alt="Antes e Depois"
            className="w-full h-full object-cover"
          />
        </div>
        
        <p className="text-sm text-slate-600 text-center">
          {content.descricao}
        </p>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 7 —</p>
      </div>
    </div>
  );
}

function AquisicoesPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <ShoppingBag className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full h-28 rounded-lg overflow-hidden mb-4">
          <img 
            src={content.imagem} 
            alt="Aquisições"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-3">
          {content.itens.map((item: any, index: number) => (
            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm">{item.titulo}</h3>
              <p className="text-xs text-slate-500 mt-1">{item.descricao}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 8 —</p>
      </div>
    </div>
  );
}

function RealizacoesPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <Trophy className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full h-28 rounded-lg overflow-hidden mb-4">
          <img 
            src={content.imagem} 
            alt="Realizações"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-2">
          {content.realizacoes.map((item: string, index: number) => (
            <div key={index} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">✓</span>
              </div>
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 9 —</p>
      </div>
    </div>
  );
}

function VotacaoPage({ content }: { content: any }) {
  const maxVotos = Math.max(...content.opcoes.map((o: any) => o.votos));

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <Vote className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <p className="text-sm text-slate-600 text-center mb-4">{content.descricao}</p>
        
        <div className="space-y-3">
          {content.opcoes.map((opcao: any, index: number) => (
            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm text-slate-800">{opcao.nome}</span>
                <span className="text-sm text-blue-600 font-bold">{opcao.votos} votos</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(opcao.votos / maxVotos) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
          <p className="text-xs text-blue-600">
            Votação encerra em 25/12/2024
          </p>
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 10 —</p>
      </div>
    </div>
  );
}

function FuncionariosPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <Users className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full h-28 rounded-lg overflow-hidden mb-4">
          <img 
            src={content.imagem} 
            alt="Funcionários"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-2">
          {content.funcionarios.map((func: any, index: number) => (
            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm truncate">{func.nome}</h3>
                <p className="text-xs text-slate-500">{func.cargo}</p>
              </div>
              <div className="text-xs text-blue-600 flex-shrink-0">
                {func.telefone}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 11 —</p>
      </div>
    </div>
  );
}

function PublicidadePage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <Megaphone className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full h-32 rounded-lg overflow-hidden mb-4">
          <img 
            src={content.imagem} 
            alt="Publicidade"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-3">
          {content.anuncios.map((anuncio: any, index: number) => (
            <div key={index} className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <h3 className="font-bold text-blue-800 text-sm">{anuncio.empresa}</h3>
              <p className="text-xs text-blue-600 mt-1">{anuncio.descricao}</p>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {anuncio.contato}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 12 —</p>
      </div>
    </div>
  );
}

function ClassificadosPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <Package className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full h-28 rounded-lg overflow-hidden mb-4">
          <img 
            src={content.imagem} 
            alt="Classificados"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-3">
          {content.anuncios.map((anuncio: any, index: number) => (
            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">{anuncio.titulo}</h3>
                <span className="text-sm font-bold text-green-600">{anuncio.preco}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{anuncio.descricao}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 13 —</p>
      </div>
    </div>
  );
}

function VagasPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="bg-blue-600 text-white p-4 text-center">
        <ParkingCircle className="w-6 h-6 mx-auto mb-1" />
        <h2 className="text-xl font-serif font-bold">{content.titulo}</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <div className="w-full h-32 rounded-lg overflow-hidden mb-4">
          <img 
            src={content.imagem} 
            alt="Estacionamento"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-3">
          {content.vagas.map((vaga: any, index: number) => (
            <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{vaga.numero}</h3>
                  <p className="text-xs text-slate-500">{vaga.bloco}</p>
                </div>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  vaga.tipo === "Aluguel" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                )}>
                  {vaga.tipo}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-600">{vaga.valor}</span>
                <span className="text-xs text-slate-500">Contato: {vaga.contato}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-4 text-center text-slate-400 text-sm">
        <p>— 14 —</p>
      </div>
    </div>
  );
}
