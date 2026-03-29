import { cn } from "@/lib/utils";
import { LucideIcon, Palette, Square, Circle } from "lucide-react";

// Estilo do formato dos botões
export type IconButtonStyle = 
  | "solido"           // Sólido com sombra
  | "neumorphic"       // Neumorfismo Claro
  | "neumorphic-dark"  // Neumorfismo Escuro
  | "card-badge"       // Card com Badge
  | "minimal-line"     // Minimalista com Linha
  | "pill"             // Cápsula (Pill)
  | "laranja-degrade"  // Degradê Laranja
  | "azul-degrade"     // Degradê Azul
  | "colorido-degrade"; // Degradê Colorido Individual

// Modo de fundo: original do estilo ou branco (apenas muda o fundo, mantém layout)
export type IconBackgroundMode = "original" | "branco";

// Formato do ícone/botão
export type IconShape = "quadrado" | "circulo";

export const ICON_BUTTON_STYLES: { id: IconButtonStyle; label: string; description: string }[] = [
  { id: "solido", label: "Sólido", description: "Botões coloridos com sombra" },
  { id: "neumorphic", label: "Neumorfismo Claro", description: "Efeito 3D suave em fundo claro" },
  { id: "neumorphic-dark", label: "Neumorfismo Escuro", description: "Efeito 3D em fundo escuro" },
  { id: "card-badge", label: "Card com Badge", description: "Cards com contador" },
  { id: "minimal-line", label: "Minimalista", description: "Design limpo com linha colorida" },
  { id: "pill", label: "Cápsula", description: "Formato horizontal arredondado" },
  { id: "laranja-degrade", label: "Degradê Laranja", description: "Todos laranja degradê com ícones brancos" },
  { id: "azul-degrade", label: "Degradê Azul", description: "Todos azul degradê com ícones brancos" },
  { id: "colorido-degrade", label: "Colorido Degradê", description: "Degradê individual por cor do ícone" },
];

export const ICON_SHAPES: { id: IconShape; label: string; icon: LucideIcon }[] = [
  { id: "quadrado", label: "Quadrado", icon: Square },
  { id: "circulo", label: "Círculo", icon: Circle },
];

// Classes de forma do container do botão
function getShapeClasses(shape: IconShape, style: IconButtonStyle): string {
  // Pill sempre mantém formato pill
  if (style === "pill") return "rounded-full";
  // Degradê laranja e azul usam shape normalmente
  switch (shape) {
    case "circulo": return "rounded-full aspect-square";
    case "quadrado": return "rounded-xl aspect-square";
    default: return "rounded-xl aspect-square";
  }
}

/**
 * Converte cor hex para HSL e gera um gradiente com variações
 * Produz cores mais claras (topo) e mais escuras/saturadas (base)
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) / 255;
    g = parseInt(clean[1] + clean[1], 16) / 255;
    b = parseInt(clean[2] + clean[2], 16) / 255;
  } else {
    r = parseInt(clean.substring(0, 2), 16) / 255;
    g = parseInt(clean.substring(2, 4), 16) / 255;
    b = parseInt(clean.substring(4, 6), 16) / 255;
  }

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function getColorGradient(color: string): { from: string; via: string; to: string; shadow: string } {
  const { h, s, l } = hexToHSL(color);
  // Cores do gradiente: claro → médio → escuro+saturado
  const from = `hsl(${(h - 8 + 360) % 360}, ${Math.min(s + 10, 100)}%, ${Math.min(l + 12, 75)}%)`;
  const via = `hsl(${h}, ${Math.min(s + 5, 100)}%, ${l}%)`;
  const to = `hsl(${(h + 12) % 360}, ${Math.min(s + 15, 100)}%, ${Math.max(l - 15, 25)}%)`;
  const shadow = `hsl(${h}, ${Math.min(s + 10, 100)}%, ${Math.max(l - 10, 20)}%)`;
  return { from, via, to, shadow };
}

interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  color: string;
  style: IconButtonStyle;
  backgroundMode?: IconBackgroundMode;
  shape?: IconShape;
  onClick?: () => void;
  badge?: number;
  className?: string;
}

// Badge component reutilizável
function BadgeIndicator({ badge }: { badge?: number }) {
  if (badge === undefined || badge <= 0) return null;
  return (
    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold shadow-sm">
      {badge > 99 ? '99+' : badge}
    </div>
  );
}

export function IconButton(props: IconButtonProps) {
  const { icon: Icon, label, color, style, backgroundMode = "original", shape = "quadrado", onClick, badge, className } = props;
  const shapeClass = getShapeClasses(shape, style);
  const isWhiteBg = backgroundMode === "branco";

  // === ESTILO 9: Degradê Colorido Individual ===
  if (style === "colorido-degrade") {
    const grad = getColorGradient(color);
    return (
      <button 
        onClick={onClick}
        className={cn(
          "relative w-full flex flex-col items-center justify-center gap-0.5 p-1 hover:scale-[1.05] transition-all duration-200 shadow-lg hover:shadow-xl",
          shapeClass,
          className
        )}
        style={{
          background: `linear-gradient(135deg, ${grad.from} 0%, ${grad.via} 50%, ${grad.to} 100%)`,
          boxShadow: `0 4px 15px ${grad.shadow}40`,
        }}
      >
        <BadgeIndicator badge={badge} />
        <Icon className="w-12 h-12 flex-shrink-0 text-white drop-shadow-sm" />
        <span className="text-[15px] font-bold text-center leading-tight line-clamp-2 text-white drop-shadow-sm">{label}</span>
      </button>
    );
  }

  // === ESTILO 7: Degradê Laranja ===
  if (style === "laranja-degrade") {
    return (
      <button 
        onClick={onClick}
        className={cn(
          "relative w-full flex flex-col items-center justify-center gap-0.5 p-1 hover:scale-[1.02] transition-all duration-200 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600",
          shapeClass,
          className
        )}
      >
        <BadgeIndicator badge={badge} />
        <Icon className="w-12 h-12 flex-shrink-0 text-white" />
        <span className="text-[15px] font-bold text-center leading-tight line-clamp-2 text-white">{label}</span>
      </button>
    );
  }

  // === ESTILO 8: Degradê Azul ===
  if (style === "azul-degrade") {
    return (
      <button 
        onClick={onClick}
        className={cn(
          "relative w-full flex flex-col items-center justify-center gap-0.5 p-1 hover:scale-[1.02] transition-all duration-200 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600",
          shapeClass,
          className
        )}
      >
        <BadgeIndicator badge={badge} />
        <Icon className="w-12 h-12 flex-shrink-0 text-white" />
        <span className="text-[15px] font-bold text-center leading-tight line-clamp-2 text-white">{label}</span>
      </button>
    );
  }

  // === ESTILO 6: Cápsula (Pill) - sempre horizontal ===
  if (style === "pill") {
    return (
      <button 
        onClick={onClick}
        className={cn(
          "relative w-full flex items-center gap-2.5 p-2 rounded-full hover:scale-[1.02] transition-all duration-200",
          isWhiteBg ? "bg-white border border-slate-200" : "",
          className
        )}
        style={isWhiteBg ? undefined : { backgroundColor: color }}
      >
        <BadgeIndicator badge={badge} />
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={isWhiteBg ? { backgroundColor: `${color}15` } : undefined}
        >
          <Icon className={cn("w-5 h-5", isWhiteBg ? "" : "text-white")} style={isWhiteBg ? { color } : undefined} />
        </div>
        <span className={cn("text-[15px] font-bold leading-tight line-clamp-1 flex-1 text-left", isWhiteBg ? "text-slate-900" : "text-white")}>{label}</span>
      </button>
    );
  }

  // === ESTILO 1: Sólido ===
  if (style === "solido") {
    return (
      <button 
        onClick={onClick}
        className={cn(
          "relative w-full flex flex-col items-center justify-center gap-0.5 p-1 hover:scale-[1.02] transition-all duration-200",
          shapeClass,
          isWhiteBg ? "bg-white border border-slate-200" : "",
          className
        )}
        style={isWhiteBg ? undefined : { backgroundColor: color }}
      >
        <BadgeIndicator badge={badge} />
        <Icon className={cn("w-12 h-12 flex-shrink-0", isWhiteBg ? "" : "text-white")} style={isWhiteBg ? { color } : undefined} />
        <span className={cn("text-[15px] font-bold text-center leading-tight line-clamp-2", isWhiteBg ? "text-slate-900" : "text-white")}>{label}</span>
      </button>
    );
  }

  // === ESTILO 2: Neumorfismo Claro ===
  if (style === "neumorphic") {
    return (
      <button 
        onClick={onClick}
        className={cn(
          "relative w-full flex flex-col items-center justify-center gap-0.5 p-1 hover:scale-[1.02] transition-all duration-200",
          shapeClass,
          isWhiteBg 
            ? "bg-white border border-slate-200" 
            : "bg-[#e8ecf1] [box-shadow:4px_4px_8px_#c5c9cd,-4px_-4px_8px_#ffffff]",
          className
        )}
      >
        <BadgeIndicator badge={badge} />
        <Icon className="w-12 h-12 flex-shrink-0" style={{ color }} />
        <span className={cn("text-[15px] font-bold text-center leading-tight line-clamp-2", isWhiteBg ? "text-slate-900" : "text-gray-700")}>{label}</span>
      </button>
    );
  }

  // === ESTILO 3: Neumorfismo Escuro ===
  if (style === "neumorphic-dark") {
    return (
      <button 
        onClick={onClick}
        className={cn(
          "relative w-full flex flex-col items-center justify-center gap-0.5 p-1 hover:scale-[1.02] transition-all duration-200",
          shapeClass,
          isWhiteBg
            ? "bg-white border border-slate-200"
            : "bg-slate-800 border border-slate-600/50",
          className
        )}
      >
        <BadgeIndicator badge={badge} />
        <Icon className="w-12 h-12 flex-shrink-0" style={{ color }} />
        <span className={cn("text-[15px] font-bold text-center leading-tight line-clamp-2", isWhiteBg ? "text-slate-900" : "text-gray-300")}>{label}</span>
      </button>
    );
  }

  // === ESTILO 4: Card com Badge ===
  if (style === "card-badge") {
    return (
      <button 
        onClick={onClick}
        className={cn(
          "relative w-full flex flex-col items-center justify-center gap-0.5 p-1",
          shapeClass,
          isWhiteBg
            ? "bg-white border border-slate-200"
            : "bg-gray-50 border border-gray-200",
          "hover:scale-[1.02] transition-all duration-200",
          className
        )}
        style={isWhiteBg ? undefined : { borderColor: `${color}40` }}
      >
        <BadgeIndicator badge={badge} />
        <Icon className="w-12 h-12 flex-shrink-0" style={{ color }} />
        <span className={cn("text-[15px] font-bold text-center leading-tight line-clamp-2", isWhiteBg ? "text-slate-900" : "text-gray-700")}>{label}</span>
      </button>
    );
  }

  // === ESTILO 5: Minimalista com Linha ===
  if (style === "minimal-line") {
    return (
      <button 
        onClick={onClick}
        className={cn(
          "relative w-full flex flex-col items-center justify-center gap-0.5 p-1",
          shapeClass,
          isWhiteBg
            ? "bg-white border border-slate-200 border-b-4"
            : "bg-gray-50 border-b-4 hover:bg-gray-100",
          "hover:scale-[1.02] transition-all duration-200",
          className
        )}
        style={{ borderBottomColor: color }}
      >
        <BadgeIndicator badge={badge} />
        <Icon className={cn("w-12 h-12 flex-shrink-0", isWhiteBg ? "" : "text-gray-700")} style={isWhiteBg ? { color } : undefined} />
        <span className={cn("text-[15px] font-bold text-center leading-tight line-clamp-2", isWhiteBg ? "text-slate-900" : "text-gray-700")}>{label}</span>
      </button>
    );
  }

  // Fallback: sólido
  return (
    <button 
      onClick={onClick}
      className={cn(
        "relative w-full flex flex-col items-center justify-center gap-0.5 p-1 hover:scale-[1.02] transition-all duration-200",
        shapeClass,
        isWhiteBg ? "bg-white border border-slate-200" : "",
        className
      )}
      style={isWhiteBg ? undefined : { backgroundColor: color }}
    >
      <BadgeIndicator badge={badge} />
      <Icon className={cn("w-12 h-12 flex-shrink-0", isWhiteBg ? "" : "text-white")} style={isWhiteBg ? { color } : undefined} />
      <span className={cn("text-[15px] font-bold text-center leading-tight line-clamp-2", isWhiteBg ? "text-slate-900" : "text-white")}>{label}</span>
    </button>
  );
}

// Seletor de estilo de formato (grid de 6 opções)
interface IconStyleSelectorProps {
  value: IconButtonStyle;
  onChange: (style: IconButtonStyle) => void;
}

export function IconStyleSelector({ value, onChange }: IconStyleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {ICON_BUTTON_STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => onChange(style.id)}
          className={cn(
            "p-3 rounded-lg border-2 text-left transition-all",
            value === style.id 
              ? "border-primary bg-primary/10" 
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          )}
        >
          <p className="font-medium text-sm">{style.label}</p>
          <p className="text-xs text-muted-foreground">{style.description}</p>
        </button>
      ))}
    </div>
  );
}

// Toggle pill para escolher fundo: Original ou Branco
interface IconBackgroundSelectorProps {
  value: IconBackgroundMode;
  onChange: (mode: IconBackgroundMode) => void;
}

export function IconBackgroundSelector({ value, onChange }: IconBackgroundSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 bg-slate-100 rounded-full p-1">
      <button
        onClick={() => onChange("original")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          value === "original"
            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        <Palette className="w-3.5 h-3.5" />
        Original
      </button>
      <button
        onClick={() => onChange("branco")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
          value === "branco"
            ? "bg-white text-slate-900 shadow-sm border border-slate-200"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        <span className="w-3.5 h-3.5 rounded-full border-2 border-current inline-block" />
        Branco
      </button>
    </div>
  );
}

// Seletor de formato do ícone (quadrado, retângulo, círculo)
interface IconShapeSelectorProps {
  value: IconShape;
  onChange: (shape: IconShape) => void;
}

export function IconShapeSelector({ value, onChange }: IconShapeSelectorProps) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-600 mb-1.5">Formato</p>
      <div className="flex items-center gap-1.5 bg-slate-100 rounded-full p-1">
        {ICON_SHAPES.map((s) => {
          const ShapeIcon = s.icon;
          return (
            <button
              key={s.id}
              onClick={() => onChange(s.id)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all flex-1 justify-center",
                value === s.id
                  ? "bg-blue-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ShapeIcon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Container de fundo para estilos que precisam de fundo específico
interface IconButtonContainerProps {
  style: IconButtonStyle;
  backgroundMode?: IconBackgroundMode;
  children: React.ReactNode;
  className?: string;
}

export function IconButtonContainer({ style, backgroundMode = "original", children, className }: IconButtonContainerProps) {
  // Se modo branco, sem fundo especial
  if (backgroundMode === "branco") {
    return <div className={cn(className)}>{children}</div>;
  }

  const bgClasses: Record<IconButtonStyle, string> = {
    "solido": "",
    "neumorphic": "bg-[#e8ecf1] dark:bg-slate-200 rounded-xl p-2",
    "neumorphic-dark": "bg-slate-800 rounded-xl p-2",
    "card-badge": "",
    "minimal-line": "",
    "pill": "",
    "laranja-degrade": "",
    "azul-degrade": "",
    "colorido-degrade": "",
  };

  return (
    <div className={cn(bgClasses[style], className)}>
      {children}
    </div>
  );
}
