import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  FileBarChart,
  BookOpen,
  Wrench,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Settings,
  Palette,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OrientacaoStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
}

interface OrientacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo?: "geral" | "app" | "livro" | "relatorio" | "configuracoes";
}

const passos: Record<string, OrientacaoStep[]> = {
  geral: [
    {
      icon: <Wrench className="w-12 h-12 text-orange-500" />,
      title: "Bem-vindo ao Sistema de Manutenção",
      description: "Este é o seu sistema completo para gerenciar manutenções. Aqui você pode criar apps personalizados, registrar manutenções em livros digitais e gerar relatórios profissionais.",
    },
    {
      icon: <Smartphone className="w-12 h-12 text-blue-500" />,
      title: "Crie Seu App de Manutenção",
      description: "Com apenas alguns cliques, você pode criar um app personalizado com sua logo e cores. O app fica disponível via link, sem precisar instalar pela loja.",
    },
    {
      icon: <BookOpen className="w-12 h-12 text-purple-500" />,
      title: "Livro de Manutenções",
      description: "Registre todas as manutenções realizadas. Ideal para apresentar aos seus clientes e gestores, mostrando o histórico completo de serviços.",
    },
    {
      icon: <FileBarChart className="w-12 h-12 text-emerald-500" />,
      title: "Relatórios Profissionais",
      description: "Gere relatórios detalhados com gráficos e informações completas. Personalize com sua marca e exporte em PDF.",
    },
    {
      icon: <Palette className="w-12 h-12 text-pink-500" />,
      title: "Personalize o Visual",
      description: "Escolha entre 9 estilos de ícones diferentes no menu principal. Acesse o botão 'Tema' no canto superior direito para trocar o visual.",
    },
  ],
  app: [
    {
      icon: <Smartphone className="w-12 h-12 text-blue-500" />,
      title: "Como Criar Seu App",
      description: "Clique no botão 'Criar Meu App' para iniciar. Você pode personalizar o nome, logo, cores e os menus que aparecerão no app.",
    },
    {
      icon: <Settings className="w-12 h-12 text-gray-500" />,
      title: "Configurações do App",
      description: "Defina o nome do condomínio/empresa, adicione sua logo e escolha as cores principais. Todas as alterações são aplicadas em tempo real.",
    },
    {
      icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
      title: "Compartilhe Seu App",
      description: "Após criar, você receberá um link único. Compartilhe via WhatsApp ou copie o link para enviar aos usuários do seu app.",
    },
  ],
  livro: [
    {
      icon: <BookOpen className="w-12 h-12 text-purple-500" />,
      title: "O que é o Livro de Manutenções",
      description: "É um registro digital de todas as manutenções realizadas, organizado em formato de revista/livro digital navegável.",
    },
    {
      icon: <FileBarChart className="w-12 h-12" style={{ color: "#8B5CF6" }} />,
      title: "Adicione Seções",
      description: "Crie seções para diferentes tipos de manutenção: preventiva, corretiva, preditiva. Adicione textos, fotos e comentários.",
    },
    {
      icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
      title: "Publique e Compartilhe",
      description: "Depois de adicionar as seções, publique seu livro. Ele ficará disponível para visualização online e pode ser exportado em PDF.",
    },
  ],
  configuracoes: [
    {
      icon: <Settings className="w-12 h-12 text-gray-500" />,
      title: "Configurações do Sistema",
      description: "Aqui você pode personalizar várias opções do sistema como tema, idioma, notificações e preferências pessoais.",
    },
    {
      icon: <Palette className="w-12 h-12 text-pink-500" />,
      title: "Tema Visual",
      description: "Alterne entre tema claro e escuro, e escolha efeitos de transição para a navegação entre páginas.",
    },
    {
      icon: <Bell className="w-12 h-12 text-yellow-500" />,
      title: "Notificações",
      description: "Ative ou desative notificações push para receber alertas de novas ordens de serviço, vencimentos e outras atualizações.",
    },
  ],
};

export function OrientacaoModal({ isOpen, onClose, tipo = "geral" }: OrientacaoModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = passos[tipo] || passos.geral;

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark as seen and close
      localStorage.setItem(`orientacao-${tipo}-vista`, "true");
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(`orientacao-${tipo}-vista`, "true");
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-lg p-0 overflow-hidden rounded-2xl">
        {/* Header com gradiente */}
        <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 px-6 pt-6 pb-12">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              Orientações
            </DialogTitle>
            <DialogDescription className="text-white/80">
              Passo {currentStep + 1} de {steps.length}
            </DialogDescription>
          </DialogHeader>
          
          {/* Indicadores de progresso */}
          <div className="flex gap-1.5 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 rounded-full flex-1 transition-all duration-300",
                  index === currentStep
                    ? "bg-white"
                    : index < currentStep
                    ? "bg-white/60"
                    : "bg-white/30"
                )}
              />
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-8 -mt-6 bg-white rounded-t-3xl">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 p-4 bg-slate-50 rounded-2xl">
              {currentStepData.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">
              {currentStepData.title}
            </h3>
            <p className="text-slate-600 leading-relaxed mb-8">
              {currentStepData.description}
            </p>
          </div>

          {/* Botões de navegação */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={cn(
                "flex-1 bg-orange-500 hover:bg-orange-600 text-white",
                currentStep === 0 && "w-full"
              )}
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Entendi
                </>
              )}
            </Button>
          </div>

          {currentStep === 0 && (
            <button
              onClick={handleSkip}
              className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Pular orientações
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook para verificar se deve mostrar orientação
export function useOrientacao(tipo: string = "geral") {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const hasSeenOrientation = localStorage.getItem(`orientacao-${tipo}-vista`);
    if (!hasSeenOrientation) {
      // Delay para não mostrar imediatamente ao abrir a página
      const timer = setTimeout(() => {
        setShouldShow(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [tipo]);

  const resetOrientation = () => {
    localStorage.removeItem(`orientacao-${tipo}-vista`);
    setShouldShow(true);
  };

  const closeOrientation = () => {
    setShouldShow(false);
  };

  return { shouldShow, resetOrientation, closeOrientation };
}

export default OrientacaoModal;
