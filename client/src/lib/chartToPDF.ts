import { Chart, ChartConfiguration, registerables } from "chart.js";

// Registrar todos os componentes do Chart.js
Chart.register(...registerables);

/**
 * Gera um gráfico de pizza como imagem base64
 */
export async function generatePieChartImage(
  data: { label: string; value: number; color: string }[],
  title: string
): Promise<string> {
  return new Promise((resolve) => {
    // Criar canvas temporário
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve("");
      return;
    }

    // Configuração do gráfico
    const config: ChartConfiguration = {
      type: "pie",
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            data: data.map((d) => d.value),
            backgroundColor: data.map((d) => d.color),
            borderWidth: 1,
            borderColor: "#fff",
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            position: "bottom",
            labels: {
              font: {
                size: 12,
              },
            },
          },
        },
      },
    };

    // Criar e renderizar o gráfico
    const chart = new Chart(ctx, config);

    // Aguardar renderização e converter para base64
    setTimeout(() => {
      const imageData = canvas.toDataURL("image/png");
      chart.destroy();
      resolve(imageData);
    }, 100);
  });
}

/**
 * Gera um gráfico de barras como imagem base64
 */
export async function generateBarChartImage(
  data: { label: string; value: number }[],
  title: string,
  color: string = "#FF8C00"
): Promise<string> {
  return new Promise((resolve) => {
    // Criar canvas temporário
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 300;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve("");
      return;
    }

    // Configuração do gráfico
    const config: ChartConfiguration = {
      type: "bar",
      data: {
        labels: data.map((d) => d.label),
        datasets: [
          {
            label: "Quantidade",
            data: data.map((d) => d.value),
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    };

    // Criar e renderizar o gráfico
    const chart = new Chart(ctx, config);

    // Aguardar renderização e converter para base64
    setTimeout(() => {
      const imageData = canvas.toDataURL("image/png");
      chart.destroy();
      resolve(imageData);
    }, 100);
  });
}

/**
 * Calcula distribuição por status
 */
export function calculateStatusDistribution(
  items: Array<{ status?: string }>
): { label: string; value: number; color: string }[] {
  const statusCount: Record<string, number> = {};
  
  items.forEach((item) => {
    const status = item.status || "Sem Status";
    statusCount[status] = (statusCount[status] || 0) + 1;
  });

  const colors: Record<string, string> = {
    "Pendente": "#FFA500",
    "Em Andamento": "#4169E1",
    "Concluído": "#32CD32",
    "Cancelado": "#DC143C",
    "Sem Status": "#808080",
  };

  return Object.entries(statusCount).map(([label, value]) => ({
    label,
    value,
    color: colors[label] || "#808080",
  }));
}

/**
 * Calcula distribuição por responsável
 */
export function calculateResponsavelDistribution(
  items: Array<{ responsavelNome?: string | null; reportadoPorNome?: string | null }>
): { label: string; value: number }[] {
  const responsavelCount: Record<string, number> = {};
  
  items.forEach((item) => {
    const responsavel = item.responsavelNome || item.reportadoPorNome || "Sem Responsável";
    responsavelCount[responsavel] = (responsavelCount[responsavel] || 0) + 1;
  });

  return Object.entries(responsavelCount)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10
}

/**
 * Calcula distribuição por prioridade
 */
export function calculatePrioridadeDistribution(
  items: Array<{ prioridade?: string | null }>
): { label: string; value: number; color: string }[] {
  const prioridadeCount: Record<string, number> = {};
  
  items.forEach((item) => {
    const prioridade = item.prioridade || "Sem Prioridade";
    prioridadeCount[prioridade] = (prioridadeCount[prioridade] || 0) + 1;
  });

  const colors: Record<string, string> = {
    "Baixa": "#32CD32",
    "Média": "#FFA500",
    "Alta": "#FF4500",
    "Urgente": "#DC143C",
    "Sem Prioridade": "#808080",
  };

  return Object.entries(prioridadeCount).map(([label, value]) => ({
    label,
    value,
    color: colors[label] || "#808080",
  }));
}
