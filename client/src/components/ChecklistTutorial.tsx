import { useState, useEffect } from "react";
import { CheckCircle2, Circle, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface ChecklistItem {
  id: string;
  /** Title of the task */
  title: string;
  /** Detailed description */
  description: string;
  /** Optional: CSS selector to scroll to when clicked */
  scrollTarget?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional: link/action to go to */
  actionLabel?: string;
  onAction?: () => void;
}

interface ChecklistTutorialProps {
  items: ChecklistItem[];
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  tutorialId: string;
  /** Icon for the header */
  headerIcon?: React.ReactNode;
}

export function ChecklistTutorial({
  items,
  isOpen,
  onClose,
  title,
  subtitle,
  tutorialId,
  headerIcon,
}: ChecklistTutorialProps) {
  const [checked, setChecked] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(`checklist_${tutorialId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  useEffect(() => {
    localStorage.setItem(`checklist_${tutorialId}`, JSON.stringify(Array.from(checked)));
  }, [checked, tutorialId]);

  const toggleItem = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleScrollTo = (target?: string) => {
    if (!target) return;
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Flash highlight
      el.classList.add("ring-2", "ring-orange-400", "ring-offset-2");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-orange-400", "ring-offset-2");
      }, 2000);
    }
  };

  const handleReset = () => {
    setChecked(new Set());
    localStorage.removeItem(`checklist_${tutorialId}`);
  };

  const progress = items.length > 0 ? (checked.size / items.length) * 100 : 0;
  const isComplete = checked.size === items.length;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer lateral */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[9999] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {headerIcon && (
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  {headerIcon}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-white">{title}</h2>
                {subtitle && (
                  <p className="text-white/80 text-xs mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors text-sm font-medium px-2 py-1 rounded-lg hover:bg-white/10"
            >
              ✕
            </button>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-white/90">
              <span>{checked.size} de {items.length} concluídos</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20 [&>div]:bg-white" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {isComplete && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-4 text-center">
              <Trophy className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <h3 className="font-bold text-green-800 text-base">
                Parabéns! Tutorial concluído! 🎉
              </h3>
              <p className="text-green-600 text-xs mt-1">
                Você completou todos os passos deste tutorial.
              </p>
            </div>
          )}

          {items.map((item, index) => {
            const isChecked = checked.has(item.id);
            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all duration-200 ${
                  isChecked
                    ? "bg-green-50/50 border-green-200"
                    : "bg-white border-slate-200 hover:border-orange-200 hover:shadow-sm"
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 hover:text-orange-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        {item.icon && (
                          <span className="text-orange-500">{item.icon}</span>
                        )}
                        <h4
                          className={`font-semibold text-sm leading-tight ${
                            isChecked ? "text-green-700 line-through" : "text-slate-800"
                          }`}
                        >
                          {item.title}
                        </h4>
                      </div>
                      <p
                        className={`text-xs leading-relaxed mt-1 ${
                          isChecked ? "text-green-600/70" : "text-slate-500"
                        }`}
                      >
                        {item.description}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-2">
                        {item.scrollTarget && (
                          <button
                            onClick={() => {
                              handleScrollTo(item.scrollTarget);
                              onClose();
                            }}
                            className="text-[10px] font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-1 rounded-md transition-colors"
                          >
                            📍 Mostrar na tela
                          </button>
                        )}
                        {item.actionLabel && item.onAction && (
                          <button
                            onClick={() => {
                              item.onAction?.();
                              onClose();
                            }}
                            className="text-[10px] font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md transition-colors"
                          >
                            {item.actionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reiniciar
          </button>
          <Button
            onClick={onClose}
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 text-xs h-8"
          >
            Fechar
          </Button>
        </div>
      </div>
    </>
  );
}
