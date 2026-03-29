import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CustoFieldsProps {
  custoEstimado: string;
  custoReal: string;
  onCustoEstimadoChange: (value: string) => void;
  onCustoRealChange: (value: string) => void;
  moeda?: string;
  showEstimado?: boolean;
  showReal?: boolean;
}

const formatCurrency = (value: string): string => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");
  if (!numbers) return "";
  
  // Converte para número e formata
  const numValue = parseInt(numbers) / 100;
  return numValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const parseCurrency = (formatted: string): number => {
  if (!formatted) return 0;
  // Remove pontos de milhar e troca vírgula por ponto
  const cleaned = formatted.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
};

export default function CustoFields({
  custoEstimado,
  custoReal,
  onCustoEstimadoChange,
  onCustoRealChange,
  moeda = "R$",
  showEstimado = true,
  showReal = true
}: CustoFieldsProps) {
  const estimadoNum = parseCurrency(custoEstimado);
  const realNum = parseCurrency(custoReal);
  
  // Calcular diferença
  const diferenca = realNum - estimadoNum;
  const percentual = estimadoNum > 0 ? ((diferenca / estimadoNum) * 100) : 0;
  
  const handleCustoEstimadoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    onCustoEstimadoChange(formatted);
  };
  
  const handleCustoRealChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    onCustoRealChange(formatted);
  };

  return (
    <div className="space-y-4">
      {/* Custo Estimado */}
      {showEstimado && (
      <div>
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-blue-500" />
          Custo Estimado
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {moeda}
          </span>
          <Input
            type="text"
            value={custoEstimado}
            onChange={handleCustoEstimadoChange}
            placeholder="0,00"
            className="h-11 pl-10 text-right"
          />
        </div>
      </div>
      )}

      {/* Custo Real */}
      {showReal && (
      <div>
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-green-500" />
          Custo Real
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            {moeda}
          </span>
          <Input
            type="text"
            value={custoReal}
            onChange={handleCustoRealChange}
            placeholder="0,00"
            className="h-11 pl-10 text-right"
          />
        </div>
      </div>
      )}

      {/* Comparativo */}
      {showEstimado && showReal && (estimadoNum > 0 || realNum > 0) && (
        <div className={`p-3 rounded-lg border ${
          diferenca > 0 
            ? "bg-red-50 border-red-200" 
            : diferenca < 0 
              ? "bg-green-50 border-green-200"
              : "bg-gray-50 border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Comparativo:</span>
            <div className="flex items-center gap-2">
              {diferenca > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : diferenca < 0 ? (
                <TrendingDown className="h-4 w-4 text-green-500" />
              ) : (
                <Minus className="h-4 w-4 text-gray-500" />
              )}
              <span className={`text-sm font-semibold ${
                diferenca > 0 
                  ? "text-red-600" 
                  : diferenca < 0 
                    ? "text-green-600"
                    : "text-gray-600"
              }`}>
                {diferenca > 0 ? "+" : ""}{moeda} {diferenca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                {estimadoNum > 0 && (
                  <span className="text-xs ml-1">
                    ({diferenca > 0 ? "+" : ""}{percentual.toFixed(1)}%)
                  </span>
                )}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {diferenca > 0 
              ? "Custo real acima do estimado" 
              : diferenca < 0 
                ? "Custo real abaixo do estimado (economia)"
                : "Custo real igual ao estimado"
            }
          </p>
        </div>
      )}
    </div>
  );
}
