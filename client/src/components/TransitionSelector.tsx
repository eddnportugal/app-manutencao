import { cn } from "@/lib/utils";
import {
  transitions,
  TransitionConfig,
  TransitionEffect,
  getTransitionById,
} from "@/lib/pageTransitions";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Play, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TransitionSelectorProps {
  selectedTransition: TransitionEffect;
  onSelect: (transitionId: TransitionEffect) => void;
  className?: string;
}

export default function TransitionSelector({
  selectedTransition,
  onSelect,
  className,
}: TransitionSelectorProps) {
  const [previewingTransition, setPreviewingTransition] = useState<string | null>(null);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-serif text-lg font-semibold">Efeito de Transição</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Escolha como as páginas do seu projeto irão mudar. Clique em "Testar" para ver o efeito em ação.
      </p>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {transitions.map((transition) => (
          <TransitionCard
            key={transition.id}
            transition={transition}
            isSelected={selectedTransition === transition.id}
            isPreviewing={previewingTransition === transition.id}
            onSelect={() => onSelect(transition.id)}
            onPreview={() => {
              setPreviewingTransition(transition.id);
              setTimeout(() => setPreviewingTransition(null), transition.duration * 1000 + 500);
            }}
          />
        ))}
      </div>
    </div>
  );
}

interface TransitionCardProps {
  transition: TransitionConfig;
  isSelected: boolean;
  isPreviewing: boolean;
  onSelect: () => void;
  onPreview: () => void;
}

function TransitionCard({
  transition,
  isSelected,
  isPreviewing,
  onSelect,
  onPreview,
}: TransitionCardProps) {
  const [showDemo, setShowDemo] = useState(false);

  const handlePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDemo(true);
    onPreview();
    setTimeout(() => setShowDemo(false), transition.duration * 1000 + 500);
  };

  return (
    <motion.button
      onClick={onSelect}
      className={cn(
        "relative p-4 rounded-xl border-2 transition-all text-left",
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border hover:border-primary/50 bg-card"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Ícone e nome */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{transition.icon}</span>
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-primary-foreground" />
          </motion.div>
        )}
      </div>
      
      <h4 className="font-semibold text-sm mb-1">{transition.name}</h4>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
        {transition.description}
      </p>
      
      {/* Mini preview */}
      <div className="relative h-16 bg-muted rounded-lg overflow-hidden mb-2">
        <AnimatePresence mode="wait">
          {showDemo ? (
            <motion.div
              key="demo"
              initial={transition.variants.enter(1) as any}
              animate={transition.variants.center as any}
              exit={transition.variants.exit(1) as any}
              transition={{ duration: transition.duration }}
              className="absolute inset-1 bg-gradient-to-br from-primary/30 to-accent/30 rounded flex items-center justify-center"
              style={{ perspective: 1000 }}
            >
              <span className="text-xs font-medium">Página 2</span>
            </motion.div>
          ) : (
            <motion.div
              key="static"
              className="absolute inset-1 bg-gradient-to-br from-secondary to-muted rounded flex items-center justify-center"
            >
              <span className="text-xs font-medium text-muted-foreground">Página 1</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Botão de preview */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full h-7 text-xs"
        onClick={handlePreview}
        disabled={isPreviewing}
      >
        <Play className="w-3 h-3 mr-1" />
        {isPreviewing ? "A mostrar..." : "Testar"}
      </Button>
    </motion.button>
  );
}

// Componente de pré-visualização grande
interface TransitionPreviewProps {
  transitionId: TransitionEffect;
  className?: string;
}

export function TransitionPreview({ transitionId, className }: TransitionPreviewProps) {
  const transition = getTransitionById(transitionId);
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(1);

  const nextPage = () => {
    setDirection(1);
    setCurrentPage((prev) => (prev % 3) + 1);
  };

  const prevPage = () => {
    setDirection(-1);
    setCurrentPage((prev) => (prev === 1 ? 3 : prev - 1));
  };

  const pageColors = [
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center mb-4">
        <h4 className="font-semibold">{transition.name}</h4>
        <p className="text-sm text-muted-foreground">{transition.description}</p>
      </div>
      
      {/* Preview container */}
      <div 
        className="relative aspect-[3/4] max-w-xs mx-auto rounded-xl overflow-hidden bg-muted shadow-lg"
        style={{ perspective: 1200 }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage}
            custom={direction}
            initial={transition.variants.enter(direction) as any}
            animate={transition.variants.center as any}
            exit={transition.variants.exit(direction) as any}
            transition={{ 
              duration: transition.duration,
              ease: [0.4, 0, 0.2, 1],
            }}
            className={cn(
              "absolute inset-0 flex flex-col items-center justify-center",
              `bg-gradient-to-br ${pageColors[currentPage - 1]}`
            )}
            style={{ transformStyle: "preserve-3d" }}
          >
            <span className="text-white text-6xl font-bold drop-shadow-lg">
              {currentPage}
            </span>
            <span className="text-white/80 text-sm mt-2">
              Página {currentPage} de 3
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Controles */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="sm" onClick={prevPage}>
          ← Anterior
        </Button>
        <span className="text-sm text-muted-foreground">
          {currentPage} / 3
        </span>
        <Button variant="outline" size="sm" onClick={nextPage}>
          Próxima →
        </Button>
      </div>
    </div>
  );
}

// Componente compacto para uso no editor
interface TransitionPickerProps {
  value: TransitionEffect;
  onChange: (value: TransitionEffect) => void;
}

export function TransitionPicker({ value, onChange }: TransitionPickerProps) {
  const selected = getTransitionById(value);
  
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
      <span className="text-xl">{selected.icon}</span>
      <div className="flex-1">
        <p className="text-sm font-medium">{selected.name}</p>
        <p className="text-xs text-muted-foreground">{selected.description}</p>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as TransitionEffect)}
        className="px-3 py-1.5 rounded-md border border-border bg-background text-sm"
      >
        {transitions.map((t) => (
          <option key={t.id} value={t.id}>
            {t.icon} {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}
