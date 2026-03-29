import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TourStep {
  /** CSS selector to highlight */
  target: string;
  /** Title of the step */
  title: string;
  /** Description text */
  description: string;
  /** Position of the tooltip relative to the target */
  position?: "top" | "bottom" | "left" | "right" | "center";
  /** Optional icon component */
  icon?: React.ReactNode;
}

interface TourGuideProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  tourId: string;
}

export function TourGuide({ steps, isOpen, onClose, onComplete, tourId }: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const [arrowPosition, setArrowPosition] = useState<"top" | "bottom" | "left" | "right">("bottom");
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];

  const positionTooltip = useCallback(() => {
    if (!step || !isOpen) return;

    const target = document.querySelector(step.target);
    
    if (!target) {
      // If target not found, show tooltip in center
      setHighlightStyle({ display: "none" });
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 10002,
      });
      setArrowPosition("bottom");
      return;
    }

    const rect = target.getBoundingClientRect();
    const padding = 8;

    // Highlight the target element
    setHighlightStyle({
      position: "fixed",
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
      borderRadius: "12px",
      zIndex: 10001,
      pointerEvents: "none",
    });

    // Calculate tooltip position
    const tooltipWidth = 360;
    const tooltipHeight = 220;
    const margin = 16;
    const pos = step.position || "bottom";

    let top = 0;
    let left = 0;
    let arrow: "top" | "bottom" | "left" | "right" = "top";

    switch (pos) {
      case "bottom":
        top = rect.bottom + padding + margin;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrow = "top";
        break;
      case "top":
        top = rect.top - padding - margin - tooltipHeight;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrow = "bottom";
        break;
      case "left":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - padding - margin - tooltipWidth;
        arrow = "right";
        break;
      case "right":
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + padding + margin;
        arrow = "left";
        break;
      case "center":
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
        arrow = "top";
        break;
    }

    // Keep tooltip within viewport
    if (left < margin) left = margin;
    if (left + tooltipWidth > window.innerWidth - margin) left = window.innerWidth - margin - tooltipWidth;
    if (top < margin) {
      top = rect.bottom + padding + margin;
      arrow = "top";
    }
    if (top + tooltipHeight > window.innerHeight - margin) {
      top = rect.top - padding - margin - tooltipHeight;
      arrow = "bottom";
    }

    setArrowPosition(arrow);
    setTooltipStyle({
      position: "fixed",
      top,
      left,
      width: tooltipWidth,
      zIndex: 10002,
    });
  }, [step, isOpen, currentStep]);

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStep(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Scroll target into view
    const target = document.querySelector(step?.target || "");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(positionTooltip, 400);
    } else {
      positionTooltip();
    }

    const handleResize = () => positionTooltip();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleResize, true);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleResize, true);
    };
  }, [currentStep, isOpen, positionTooltip, step]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem(`tour_completed_${tourId}`, "true");
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen || !step) return null;

  return (
    <>
      {/* Overlay escuro */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-300"
        style={{ zIndex: 10000 }}
        onClick={handleSkip}
      />

      {/* Highlight do elemento */}
      <div
        style={highlightStyle}
        className="transition-all duration-300 ease-in-out"
      >
        <div className="absolute inset-0 rounded-xl border-2 border-orange-400 shadow-[0_0_0_4px_rgba(249,115,22,0.3)] animate-pulse" />
      </div>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className="transition-all duration-300 ease-in-out"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden">
          {/* Arrow */}
          {arrowPosition === "top" && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-orange-100 rotate-45" />
          )}
          {arrowPosition === "bottom" && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-orange-100 rotate-45" />
          )}
          {arrowPosition === "left" && (
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-orange-100 rotate-45" />
          )}
          {arrowPosition === "right" && (
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-r border-t border-orange-100 rotate-45" />
          )}

          {/* Header com progresso */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-white" />
              <span className="text-white font-semibold text-sm">
                Passo {currentStep + 1} de {steps.length}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-orange-100">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start gap-3 mb-3">
              {step.icon && (
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-orange-600">
                  {step.icon}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-base leading-tight">
                  {step.title}
                </h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Footer */}
          <div className="px-5 pb-4 flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              Pular tour
            </button>
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  className="gap-1 text-xs h-8"
                >
                  <ChevronLeft className="w-3 h-3" />
                  Anterior
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1 text-xs h-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0"
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Próximo
                    <ChevronRight className="w-3 h-3" />
                  </>
                ) : (
                  "Concluir ✓"
                )}
              </Button>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 pb-3">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "bg-orange-500 w-6"
                    : i < currentStep
                    ? "bg-orange-300"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
