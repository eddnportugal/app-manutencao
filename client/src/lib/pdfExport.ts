import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PDFExportOptions {
  titulo: string;
  subtitulo?: string;
  condominio?: {
    nome: string;
    logoUrl?: string | null;
    endereco?: string | null;
  };
  colunas: string[];
  dados: (string | number)[][];
  orientacao?: "portrait" | "landscape";
  dataGeracao?: boolean;
}

// Função para converter imagem URL para base64
async function imageUrlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportToPDF(options: PDFExportOptions): Promise<void> {
  const {
    titulo,
    subtitulo,
    condominio,
    colunas,
    dados,
    orientacao = "portrait",
    dataGeracao = true,
  } = options;

  const doc = new jsPDF({
    orientation: orientacao,
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Cores do tema
  const corPrimaria = [37, 99, 235]; // Azul
  const corSecundaria = [100, 116, 139]; // Cinza

  // Cabeçalho com logo da organização
  if (condominio?.logoUrl) {
    try {
      const logoBase64 = await imageUrlToBase64(condominio.logoUrl);
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", margin, yPosition, 25, 25);
        yPosition += 5;
      }
    } catch {
      // Se não conseguir carregar o logo, continua sem ele
    }
  }

  // Nome da organização
  if (condominio?.nome) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    const xNome = condominio?.logoUrl ? margin + 30 : margin;
    doc.text(condominio.nome, xNome, yPosition + 8);
    
    if (condominio.endereco) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
      doc.text(condominio.endereco, xNome, yPosition + 14);
    }
  }

  yPosition = condominio?.logoUrl ? yPosition + 30 : yPosition + 5;

  // Linha separadora
  doc.setDrawColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Título do relatório
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text(titulo, margin, yPosition);
  yPosition += 8;

  // Subtítulo
  if (subtitulo) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    doc.text(subtitulo, margin, yPosition);
    yPosition += 6;
  }

  // Data de geração
  if (dataGeracao) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    const dataAtual = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    doc.text(`Gerado em: ${dataAtual}`, margin, yPosition);
    yPosition += 10;
  }

  // Tabela com autoTable
  autoTable(doc, {
    startY: yPosition,
    head: [colunas],
    body: dados,
    margin: { left: margin, right: margin, top: margin, bottom: 20 },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak",
      halign: "left",
    },
    headStyles: {
      fillColor: [corPrimaria[0], corPrimaria[1], corPrimaria[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: "auto" },
    },
    // Evitar quebra de linha no meio de células
    rowPageBreak: "avoid",
    // Manter cabeçalho em todas as páginas
    showHead: "everyPage",
    didDrawPage: (data) => {
      // Rodapé em cada página
      const pageNumber = doc.internal.pages.length - 1;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
      
      // Número da página
      doc.text(
        `Página ${pageNumber}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
      
      // Nome do sistema
      doc.text(
        "App Manutenção - Sistema Universal de Manutenção",
        margin,
        pageHeight - 10
      );
    },
  });

  // Salvar o PDF
  const nomeArquivo = `${titulo.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(nomeArquivo);
}

// Função auxiliar para exportar relatório simples
export async function exportRelatorioPDF(
  titulo: string,
  colunas: string[],
  dados: (string | number)[][],
  condominio?: {
    nome: string;
    logoUrl?: string | null;
    endereco?: string | null;
  }
): Promise<void> {
  await exportToPDF({
    titulo,
    condominio,
    colunas,
    dados,
    dataGeracao: true,
  });
}

// Função para exportar relatório com estatísticas
export async function exportRelatorioComEstatisticas(
  titulo: string,
  subtitulo: string,
  estatisticas: { label: string; valor: string | number }[],
  colunas: string[],
  dados: (string | number)[][],
  condominio?: {
    nome: string;
    logoUrl?: string | null;
    endereco?: string | null;
  }
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Cores do tema
  const corPrimaria = [37, 99, 235];
  const corSecundaria = [100, 116, 139];

  // Cabeçalho com logo da organização
  if (condominio?.logoUrl) {
    try {
      const logoBase64 = await imageUrlToBase64(condominio.logoUrl);
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", margin, yPosition, 25, 25);
        yPosition += 5;
      }
    } catch {
      // Se não conseguir carregar o logo, continua sem ele
    }
  }

  // Nome da organização
  if (condominio?.nome) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    const xNome = condominio?.logoUrl ? margin + 30 : margin;
    doc.text(condominio.nome, xNome, yPosition + 8);
    
    if (condominio.endereco) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
      doc.text(condominio.endereco, xNome, yPosition + 14);
    }
  }

  yPosition = condominio?.logoUrl ? yPosition + 30 : yPosition + 5;

  // Linha separadora
  doc.setDrawColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Título do relatório
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text(titulo, margin, yPosition);
  yPosition += 8;

  // Subtítulo
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
  doc.text(subtitulo, margin, yPosition);
  yPosition += 10;

  // Cards de estatísticas
  const cardWidth = (pageWidth - margin * 2 - 10 * (estatisticas.length - 1)) / estatisticas.length;
  const cardHeight = 20;
  
  estatisticas.forEach((stat, index) => {
    const x = margin + index * (cardWidth + 10);
    
    // Fundo do card
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, yPosition, cardWidth, cardHeight, 2, 2, "F");
    
    // Valor
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    doc.text(String(stat.valor), x + cardWidth / 2, yPosition + 8, { align: "center" });
    
    // Label
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    doc.text(stat.label, x + cardWidth / 2, yPosition + 15, { align: "center" });
  });

  yPosition += cardHeight + 10;

  // Data de geração
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Gerado em: ${dataAtual}`, margin, yPosition);
  yPosition += 10;

  // Tabela com autoTable
  autoTable(doc, {
    startY: yPosition,
    head: [colunas],
    body: dados,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak",
      halign: "left",
    },
    headStyles: {
      fillColor: [corPrimaria[0], corPrimaria[1], corPrimaria[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: () => {
      // Rodapé em cada página
      const pageNumber = doc.internal.pages.length - 1;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
      
      doc.text(
        `Página ${pageNumber}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
      
      doc.text(
        "App Manutenção - Sistema Universal de Manutenção",
        margin,
        pageHeight - 10
      );
    },
  });

  // Salvar o PDF
  const nomeArquivo = `${titulo.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(nomeArquivo);
}


// Interface para dados históricos
interface DadosHistoricos {
  labels: string[];
  manutencoes: number[];
  ocorrencias: number[];
  vistorias: number[];
  avisos: number[];
  votacoes: number[];
  eventos: number[];
}

interface VariacaoMensal {
  categoria: string;
  mesAtual: number;
  mesAnterior: number;
  variacao: number;
}

// Função para exportar relatório consolidado com gráficos históricos
export async function exportRelatorioConsolidadoComGraficos(
  titulo: string,
  subtitulo: string,
  estatisticas: { label: string; valor: string | number }[],
  dadosHistoricos: DadosHistoricos,
  variacoes: VariacaoMensal[],
  tabelaResumo: { colunas: string[]; dados: (string | number)[][] },
  condominio?: {
    nome: string;
    logoUrl?: string | null;
    endereco?: string | null;
  },
  chartImages?: {
    evolucaoHistorica?: string;
    comparativoOperacional?: string;
    comparativoComunicacao?: string;
  }
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Cores do tema
  const corPrimaria = [37, 99, 235];
  const corSecundaria = [100, 116, 139];
  const corVerde = [34, 197, 94];
  const corVermelho = [239, 68, 68];

  // Função auxiliar para adicionar rodapé
  const addFooter = () => {
    const pageNumber = doc.internal.pages.length - 1;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    doc.text(`Página ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text("App Manutenção - Sistema Universal de Manutenção", margin, pageHeight - 10);
  };

  // Função para verificar e adicionar nova página se necessário
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      addFooter();
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // ===== PÁGINA 1: CABEÇALHO E ESTATÍSTICAS =====
  
  // Cabeçalho com logo da organização
  if (condominio?.logoUrl) {
    try {
      const logoBase64 = await imageUrlToBase64(condominio.logoUrl);
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", margin, yPosition, 25, 25);
        yPosition += 5;
      }
    } catch {
      // Se não conseguir carregar o logo, continua sem ele
    }
  }

  // Nome da organização
  if (condominio?.nome) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    const xNome = condominio?.logoUrl ? margin + 30 : margin;
    doc.text(condominio.nome, xNome, yPosition + 8);
    
    if (condominio.endereco) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
      doc.text(condominio.endereco, xNome, yPosition + 14);
    }
  }

  yPosition = condominio?.logoUrl ? yPosition + 30 : yPosition + 5;

  // Linha separadora
  doc.setDrawColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Título do relatório
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text(titulo, margin, yPosition);
  yPosition += 8;

  // Subtítulo
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
  doc.text(subtitulo, margin, yPosition);
  yPosition += 6;

  // Data de geração
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const dataAtual = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Gerado em: ${dataAtual}`, margin, yPosition);
  yPosition += 12;

  // Cards de estatísticas gerais
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text("Resumo Geral", margin, yPosition);
  yPosition += 8;

  const cardWidth = (pageWidth - margin * 2 - 10 * (Math.min(estatisticas.length, 4) - 1)) / Math.min(estatisticas.length, 4);
  const cardHeight = 20;
  
  estatisticas.slice(0, 4).forEach((stat, index) => {
    const x = margin + index * (cardWidth + 10);
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, yPosition, cardWidth, cardHeight, 2, 2, "F");
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    doc.text(String(stat.valor), x + cardWidth / 2, yPosition + 8, { align: "center" });
    
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    doc.text(stat.label, x + cardWidth / 2, yPosition + 15, { align: "center" });
  });

  yPosition += cardHeight + 15;

  // ===== SEÇÃO DE VARIAÇÃO MENSAL =====
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text("Variação Mensal (vs. Mês Anterior)", margin, yPosition);
  yPosition += 8;

  // Cards de variação
  const varCardWidth = (pageWidth - margin * 2 - 8 * 2) / 3;
  const varCardHeight = 22;
  
  variacoes.slice(0, 6).forEach((v, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = margin + col * (varCardWidth + 8);
    const y = yPosition + row * (varCardHeight + 5);
    
    // Cor de fundo baseada na categoria
    const bgColors: { [key: string]: number[] } = {
      "Manutenções": [255, 247, 237],
      "Ocorrências": [254, 242, 242],
      "Vistorias": [250, 245, 255],
      "Avisos": [240, 253, 244],
      "Votações": [253, 242, 248],
      "Eventos": [239, 246, 255],
    };
    const bgColor = bgColors[v.categoria] || [248, 250, 252];
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(x, y, varCardWidth, varCardHeight, 2, 2, "F");
    
    // Categoria
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    doc.text(v.categoria, x + 4, y + 6);
    
    // Valor atual
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    doc.text(String(v.mesAtual), x + 4, y + 15);
    
    // Variação percentual
    const varColor = v.variacao >= 0 ? corVerde : corVermelho;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(varColor[0], varColor[1], varColor[2]);
    const sinal = v.variacao >= 0 ? "+" : "";
    doc.text(`${sinal}${v.variacao}%`, x + varCardWidth - 4, y + 10, { align: "right" });
    
    // Valor anterior
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    doc.text(`vs ${v.mesAnterior}`, x + varCardWidth - 4, y + 17, { align: "right" });
  });

  yPosition += Math.ceil(variacoes.length / 3) * (varCardHeight + 5) + 10;

  // ===== GRÁFICO DE EVOLUÇÃO HISTÓRICA (se fornecido como imagem) =====
  if (chartImages?.evolucaoHistorica) {
    checkNewPage(80);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    doc.text("Evolução Histórica - Últimos 6 Meses", margin, yPosition);
    yPosition += 5;
    
    try {
      doc.addImage(chartImages.evolucaoHistorica, "PNG", margin, yPosition, pageWidth - margin * 2, 60);
      yPosition += 65;
    } catch {
      // Se não conseguir adicionar o gráfico, mostra tabela alternativa
    }
  }

  // ===== TABELA DE DADOS HISTÓRICOS =====
  checkNewPage(60);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text("Dados Históricos por Mês", margin, yPosition);
  yPosition += 8;

  // Tabela com dados históricos
  const historicoHeaders = ["Categoria", ...dadosHistoricos.labels];
  const historicoData = [
    ["Manutenções", ...dadosHistoricos.manutencoes.map(String)],
    ["Ocorrências", ...dadosHistoricos.ocorrencias.map(String)],
    ["Vistorias", ...dadosHistoricos.vistorias.map(String)],
    ["Avisos", ...dadosHistoricos.avisos.map(String)],
    ["Votações", ...dadosHistoricos.votacoes.map(String)],
    ["Eventos", ...dadosHistoricos.eventos.map(String)],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [historicoHeaders],
    body: historicoData,
    margin: { left: margin, right: margin, top: margin, bottom: 20 },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      halign: "center",
    },
    headStyles: {
      fillColor: [corPrimaria[0], corPrimaria[1], corPrimaria[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { halign: "left", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    // Evitar quebra de linha no meio de células
    rowPageBreak: "avoid",
    showHead: "everyPage",
  });

  // @ts-ignore - autoTable adiciona finalY ao doc
  yPosition = doc.lastAutoTable.finalY + 15;

  // ===== GRÁFICOS COMPARATIVOS (se fornecidos como imagens) =====
  if (chartImages?.comparativoOperacional || chartImages?.comparativoComunicacao) {
    checkNewPage(70);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(33, 33, 33);
    doc.text("Gráficos Comparativos", margin, yPosition);
    yPosition += 8;

    const chartWidth = (pageWidth - margin * 2 - 10) / 2;
    
    if (chartImages.comparativoOperacional) {
      try {
        doc.addImage(chartImages.comparativoOperacional, "PNG", margin, yPosition, chartWidth, 50);
      } catch {}
    }
    
    if (chartImages.comparativoComunicacao) {
      try {
        doc.addImage(chartImages.comparativoComunicacao, "PNG", margin + chartWidth + 10, yPosition, chartWidth, 50);
      } catch {}
    }
    
    yPosition += 55;
  }

  // ===== TABELA RESUMO POR ÁREA =====
  checkNewPage(80);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text("Resumo por Área", margin, yPosition);
  yPosition += 8;

  autoTable(doc, {
    startY: yPosition,
    head: [tabelaResumo.colunas],
    body: tabelaResumo.dados,
    margin: { left: margin, right: margin, top: margin, bottom: 20 },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: "linebreak",
      halign: "center",
    },
    headStyles: {
      fillColor: [corPrimaria[0], corPrimaria[1], corPrimaria[2]],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    columnStyles: {
      0: { halign: "left" },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    // Evitar quebra de linha no meio de células
    rowPageBreak: "avoid",
    showHead: "everyPage",
  });

  // Adicionar rodapé na última página
  addFooter();

  // Salvar o PDF
  const nomeArquivo = `relatorio_consolidado_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(nomeArquivo);
}
