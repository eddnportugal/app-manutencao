import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface PrazoConclusaoFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  showStatus?: boolean;
}

export default function PrazoConclusaoField({
  value,
  onChange,
  label = "Prazo de Conclusão",
  showStatus = true
}: PrazoConclusaoFieldProps) {
  const [diasRestantes, setDiasRestantes] = useState<number | null>(null);
  const [status, setStatus] = useState<"ok" | "atencao" | "atrasado" | "neutro">("neutro");

  useEffect(() => {
    if (value) {
      const prazo = new Date(value);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      prazo.setHours(0, 0, 0, 0);
      
      const diffTime = prazo.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      setDiasRestantes(diffDays);
      
      if (diffDays < 0) {
        setStatus("atrasado");
      } else if (diffDays <= 3) {
        setStatus("atencao");
      } else {
        setStatus("ok");
      }
    } else {
      setDiasRestantes(null);
      setStatus("neutro");
    }
  }, [value]);

  const getStatusColor = () => {
    switch (status) {
      case "atrasado": return "text-red-600 bg-red-50 border-red-200";
      case "atencao": return "text-amber-600 bg-amber-50 border-amber-200";
      case "ok": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "atrasado": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "atencao": return <Clock className="h-4 w-4 text-amber-500" />;
      case "ok": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (diasRestantes === null) return "";
    if (diasRestantes < 0) {
      return `Atrasado há ${Math.abs(diasRestantes)} dia(s)`;
    } else if (diasRestantes === 0) {
      return "Vence hoje!";
    } else if (diasRestantes === 1) {
      return "Vence amanhã";
    } else {
      return `${diasRestantes} dias restantes`;
    }
  };

  // Definir data mínima como hoje
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-indigo-500" />
        {label}
      </Label>
      
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={minDate}
        className="h-11"
      />

      {/* Status do prazo */}
      {showStatus && value && (
        <div className={`p-3 rounded-lg border flex items-center gap-3 ${getStatusColor()}`}>
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">{getStatusText()}</p>
            <p className="text-xs opacity-75">
              {new Date(value).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </p>
          </div>
        </div>
      )}

      {/* Atalhos rápidos */}
      <div className="flex gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            onChange(date.toISOString().split("T")[0]);
          }}
          className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          +7 dias
        </button>
        <button
          type="button"
          onClick={() => {
            const date = new Date();
            date.setDate(date.getDate() + 15);
            onChange(date.toISOString().split("T")[0]);
          }}
          className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          +15 dias
        </button>
        <button
          type="button"
          onClick={() => {
            const date = new Date();
            date.setMonth(date.getMonth() + 1);
            onChange(date.toISOString().split("T")[0]);
          }}
          className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          +1 mês
        </button>
        <button
          type="button"
          onClick={() => {
            const date = new Date();
            date.setMonth(date.getMonth() + 3);
            onChange(date.toISOString().split("T")[0]);
          }}
          className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          +3 meses
        </button>
      </div>
    </div>
  );
}
