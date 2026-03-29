import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Tipos para os dados dos gráficos
interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface BarChartData {
  label: string;
  values: { name: string; value: number; color: string }[];
}

interface LineChartData {
  labels: string[];
  datasets: {
    name: string;
    values: number[];
    color: string;
  }[];
}

// Cores padrão para os status
export const statusColors = {
  pendente: "#f59e0b", // amber
  realizada: "#3b82f6", // blue
  acao_necessaria: "#ef4444", // red
  finalizada: "#22c55e", // green
  reaberta: "#8b5cf6", // purple
};

// Cores para prioridades
export const prioridadeColors = {
  baixa: "#22c55e", // green
  media: "#3b82f6", // blue
  alta: "#f59e0b", // amber
  urgente: "#ef4444", // red
};

// Cores para tipos de manutenção
export const tipoManutencaoColors = {
  preventiva: "#22c55e", // green
  corretiva: "#f59e0b", // amber
  emergencial: "#ef4444", // red
  programada: "#3b82f6", // blue
};

// Cores para categorias de ocorrências
export const categoriaOcorrenciaColors = {
  seguranca: "#ef4444", // red
  barulho: "#f59e0b", // amber
  manutencao: "#3b82f6", // blue
  convivencia: "#8b5cf6", // purple
  animais: "#22c55e", // green
  estacionamento: "#06b6d4", // cyan
  limpeza: "#84cc16", // lime
  outros: "#6b7280", // gray
};

// Componente de Gráfico de Pizza
export function PieChart({ 
  data, 
  title,
  showLegend = true,
  size = 200 
}: { 
  data: PieChartData[]; 
  title: string;
  showLegend?: boolean;
  size?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
      // Desenhar círculo vazio
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 10, 0, 2 * Math.PI);
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.fillStyle = "#9ca3af";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sem dados", size / 2, size / 2);
      return;
    }

    let startAngle = -Math.PI / 2;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 10;

    data.forEach((item) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = item.color;
      ctx.fill();

      // Adicionar borda branca entre fatias
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle += sliceAngle;
    });

    // Desenhar círculo central (donut)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Texto central com total
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(total.toString(), centerX, centerY - 8);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#6b7280";
    ctx.fillText("Total", centerX, centerY + 12);
  }, [data, size]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <canvas ref={canvasRef} width={size} height={size} />
          {showLegend && (
            <div className="flex flex-wrap justify-center gap-2">
              {data.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-muted-foreground">
                    {item.label}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Gráfico de Barras
export function BarChart({ 
  data, 
  title,
  height = 200 
}: { 
  data: BarChartData[]; 
  title: string;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = container.clientWidth;
    canvas.width = width;
    canvas.height = height;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sem dados", width / 2, height / 2);
      return;
    }

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Encontrar valor máximo
    const maxValue = Math.max(
      ...data.flatMap(d => d.values.map(v => v.value)),
      1
    );

    // Desenhar eixo Y
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // Desenhar linhas de grade e labels do eixo Y
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartHeight / ySteps) * i;
      const value = Math.round(maxValue - (maxValue / ySteps) * i);

      ctx.strokeStyle = "#f3f4f6";
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = "#6b7280";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(value.toString(), padding.left - 8, y);
    }

    // Desenhar barras
    const groupWidth = chartWidth / data.length;
    const barCount = data[0]?.values.length || 1;
    const barWidth = Math.min(30, (groupWidth - 20) / barCount);
    const barGap = 4;

    data.forEach((group, groupIndex) => {
      const groupX = padding.left + groupWidth * groupIndex + groupWidth / 2;

      group.values.forEach((bar, barIndex) => {
        const barHeight = (bar.value / maxValue) * chartHeight;
        const x = groupX - (barCount * (barWidth + barGap)) / 2 + barIndex * (barWidth + barGap);
        const y = height - padding.bottom - barHeight;

        // Desenhar barra com cantos arredondados
        ctx.fillStyle = bar.color;
        ctx.beginPath();
        const radius = 4;
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, height - padding.bottom);
        ctx.lineTo(x, height - padding.bottom);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        // Valor acima da barra
        if (bar.value > 0) {
          ctx.fillStyle = "#374151";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(bar.value.toString(), x + barWidth / 2, y - 5);
        }
      });

      // Label do grupo
      ctx.fillStyle = "#374151";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(group.label, groupX, height - padding.bottom + 15);
    });
  }, [data, height]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="w-full">
          <canvas ref={canvasRef} />
        </div>
        {data.length > 0 && data[0].values.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            {data[0].values.map((v) => (
              <div key={v.name} className="flex items-center gap-1.5 text-xs">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: v.color }} 
                />
                <span className="text-muted-foreground">{v.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Gráfico de Linhas
export function LineChart({ 
  data, 
  title,
  height = 200 
}: { 
  data: LineChartData; 
  title: string;
  height?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = container.clientWidth;
    canvas.width = width;
    canvas.height = height;

    // Limpar canvas
    ctx.clearRect(0, 0, width, height);

    if (data.labels.length === 0) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sem dados", width / 2, height / 2);
      return;
    }

    const padding = { top: 20, right: 20, bottom: 50, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Encontrar valor máximo
    const maxValue = Math.max(
      ...data.datasets.flatMap(d => d.values),
      1
    );

    // Desenhar linhas de grade
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartHeight / ySteps) * i;
      const value = Math.round(maxValue - (maxValue / ySteps) * i);

      ctx.strokeStyle = "#f3f4f6";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = "#6b7280";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(value.toString(), padding.left - 8, y);
    }

    // Desenhar linhas de dados
    const pointGap = chartWidth / (data.labels.length - 1 || 1);

    data.datasets.forEach((dataset) => {
      ctx.strokeStyle = dataset.color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      dataset.values.forEach((value, index) => {
        const x = padding.left + pointGap * index;
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Desenhar pontos
      dataset.values.forEach((value, index) => {
        const x = padding.left + pointGap * index;
        const y = padding.top + chartHeight - (value / maxValue) * chartHeight;

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = dataset.color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    });

    // Labels do eixo X (mostrar apenas alguns para não sobrecarregar)
    const labelStep = Math.ceil(data.labels.length / 7);
    data.labels.forEach((label, index) => {
      if (index % labelStep === 0 || index === data.labels.length - 1) {
        const x = padding.left + pointGap * index;
        ctx.fillStyle = "#6b7280";
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.save();
        ctx.translate(x, height - padding.bottom + 15);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }
    });
  }, [data, height]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="w-full">
          <canvas ref={canvasRef} />
        </div>
        {data.datasets.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            {data.datasets.map((dataset) => (
              <div key={dataset.name} className="flex items-center gap-1.5 text-xs">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: dataset.color }} 
                />
                <span className="text-muted-foreground">{dataset.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Card de Estatística
export function StatCard({ 
  title, 
  value, 
  subtitle,
  icon,
  trend,
  color = "primary"
}: { 
  title: string; 
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "primary" | "success" | "warning" | "danger" | "info";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-100 text-green-600",
    warning: "bg-amber-100 text-amber-600",
    danger: "bg-red-100 text-red-600",
    info: "bg-blue-100 text-blue-600",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trend.value >= 0 ? "text-green-600" : "text-red-600"}`}>
                <span>{trend.value >= 0 ? "↑" : "↓"}</span>
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Mini Gráfico de Barras (para cards)
export function MiniBarChart({ 
  data, 
  height = 40,
  showValues = false
}: { 
  data: { value: number; color: string }[];
  height?: number;
  showValues?: boolean;
}) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          {showValues && item.value > 0 && (
            <span className="text-[10px] text-muted-foreground">{item.value}</span>
          )}
          <div
            className="w-4 rounded-t transition-all"
            style={{
              height: `${(item.value / maxValue) * (height - (showValues ? 16 : 0))}px`,
              backgroundColor: item.color,
              minHeight: item.value > 0 ? 4 : 0,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Componente de Progresso Circular
export function CircularProgress({ 
  value, 
  max = 100,
  size = 60,
  strokeWidth = 6,
  color = "#3b82f6",
  showLabel = true
}: { 
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = Math.min((value / max) * 100, 100);
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-semibold">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
