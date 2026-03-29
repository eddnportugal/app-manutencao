import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  UsersRound,
  Settings,
  Share2,
  QrCode,
  Link,
  Smartphone,
  Monitor,
  Wifi,
  HelpCircle,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const TUTORIAL_STORAGE_KEY = "appmanutencao_tutorial_last_shown";
const TUTORIAL_DISABLED_KEY = "appmanutencao_tutorial_disabled";

interface TutorialPopupProps {
  onOpenChange?: (open: boolean) => void;
  forceOpen?: boolean;
}

export function TutorialPopup({ onOpenChange, forceOpen }: TutorialPopupProps) {
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      return;
    }

    // Check if tutorial is disabled
    const disabled = localStorage.getItem(TUTORIAL_DISABLED_KEY);
    if (disabled === "true") return;

    // Check if already shown today
    const lastShown = localStorage.getItem(TUTORIAL_STORAGE_KEY);
    const today = new Date().toDateString();
    
    if (lastShown !== today) {
      // Show after a small delay for better UX
      const timer = setTimeout(() => {
        setOpen(true);
        localStorage.setItem(TUTORIAL_STORAGE_KEY, today);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [forceOpen]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(TUTORIAL_DISABLED_KEY, "true");
    }
    setOpen(false);
    onOpenChange?.(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-orange-500" />
            Como Funciona
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Step 1 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-lg text-sm">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Cadastre os Locais / Máquinas / Itens
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Onde será feita a manutenção.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg text-sm">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                <UsersRound className="w-4 h-4 text-blue-600" />
                Cadastre sua Equipe
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Se tiver mais usuários.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg text-sm">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4 text-purple-600" />
                Configure as Funções
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Use o botão <span className="font-medium text-purple-600">"Configurar Funções"</span> dentro de cada função para selecionar os itens.
              </p>
            </div>
          </div>

          {/* Step 4 - Sharing */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold shadow-lg text-sm">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                <Share2 className="w-4 h-4 text-orange-600" />
                Compartilhe
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Crie um <span className="font-medium text-orange-600">app personalizado</span> para funcionários ou clientes executarem.
              </p>
              
              {/* Access methods */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-medium text-slate-700">
                  <QrCode className="w-3 h-3" /> QR Code
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-medium text-slate-700">
                  <Link className="w-3 h-3" /> Link
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-medium text-slate-700">
                  <Smartphone className="w-3 h-3" /> App
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-medium text-slate-700">
                  <Monitor className="w-3 h-3" /> Web
                </span>
              </div>
            </div>
          </div>

          {/* Final benefit */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
                <Wifi className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-orange-800 text-sm">Gestão Remota</h4>
                <p className="text-xs text-orange-700">
                  Receba tudo em tempo real, de qualquer lugar!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="dontShowAgain" 
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <label 
              htmlFor="dontShowAgain" 
              className="text-sm text-slate-600 cursor-pointer"
            >
              Não mostrar novamente
            </label>
          </div>
          
          <Button 
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            Entendi!
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Button component to trigger tutorial manually
export function TutorialButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors"
      title="Como funciona"
    >
      <HelpCircle className="w-5 h-5" />
    </button>
  );
}

// Hook to manage tutorial state
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  const openTutorial = () => setShowTutorial(true);
  const closeTutorial = () => setShowTutorial(false);

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_DISABLED_KEY);
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
  };

  return {
    showTutorial,
    openTutorial,
    closeTutorial,
    resetTutorial,
  };
}

export default TutorialPopup;
