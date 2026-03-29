import { Label } from "@/components/ui/label";
import { AlertTriangle, AlertCircle, AlertOctagon, Info, Zap } from "lucide-react";

type NivelUrgencia = "baixa" | "normal" | "alta" | "urgente" | "critica";

interface NivelUrgenciaSelectProps {
  value: NivelUrgencia;
  onChange: (value: NivelUrgencia) => void;
  label?: string;
}

const niveis: { value: NivelUrgencia; label: string; icon: React.ReactNode; color: string; bgColor: string; borderColor: string; description: string }[] = [
  { 
    value: "baixa", 
    label: "Baixa", 
    icon: <Info className="h-4 w-4" />,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    description: "Pode aguardar"
  },
  { 
    value: "normal", 
    label: "Normal", 
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
    description: "Prazo regular"
  },
  { 
    value: "alta", 
    label: "Alta", 
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-300",
    description: "Prioridade alta"
  },
  { 
    value: "urgente", 
    label: "Urgente", 
    icon: <AlertOctagon className="h-4 w-4" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
    description: "Resolver em breve"
  },
  { 
    value: "critica", 
    label: "Crítica", 
    icon: <Zap className="h-4 w-4" />,
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    description: "Ação imediata"
  },
];

export default function NivelUrgenciaSelect({
  value,
  onChange,
  label = "Nível de Urgência"
}: NivelUrgenciaSelectProps) {
  const selectedNivel = niveis.find(n => n.value === value) || niveis[1];

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-orange-500" />
        {label}
      </Label>

      {/* Seletor visual */}
      <div className="grid grid-cols-5 gap-2">
        {niveis.map((nivel) => (
          <button
            key={nivel.value}
            type="button"
            onClick={() => onChange(nivel.value)}
            className={`
              flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all
              ${value === nivel.value 
                ? `${nivel.bgColor} ${nivel.borderColor} ${nivel.color} ring-2 ring-offset-1 ring-${nivel.color.split('-')[1]}-300` 
                : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
              }
            `}
          >
            <span className={value === nivel.value ? nivel.color : "text-gray-400"}>
              {nivel.icon}
            </span>
            <span className="text-xs font-medium mt-1 truncate w-full text-center">
              {nivel.label}
            </span>
          </button>
        ))}
      </div>

      {/* Descrição do nível selecionado */}
      <div className={`p-3 rounded-lg border ${selectedNivel.bgColor} ${selectedNivel.borderColor}`}>
        <div className="flex items-center gap-2">
          <span className={selectedNivel.color}>{selectedNivel.icon}</span>
          <span className={`text-sm font-semibold ${selectedNivel.color}`}>
            {selectedNivel.label}
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {selectedNivel.description}
        </p>
      </div>

      {/* Barra de urgência visual */}
      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            value === "baixa" ? "w-1/5 bg-gray-400" :
            value === "normal" ? "w-2/5 bg-blue-500" :
            value === "alta" ? "w-3/5 bg-amber-500" :
            value === "urgente" ? "w-4/5 bg-orange-500" :
            "w-full bg-red-500"
          }`}
        />
      </div>
    </div>
  );
}
