import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  generatePieChartImage,
  generateBarChartImage,
  calculateStatusDistribution,
  calculateResponsavelDistribution,
  calculatePrioridadeDistribution,
} from "./chartToPDF";

interface Manutencao {
  id: number;
  protocolo?: string;
  data?: Date;
  responsavelNome?: string | null;
  status?: string;
  prioridade?: string | null;
  descricao?: string | null;
  titulo?: string;
}

interface Ocorrencia {
  id: number;
  protocolo?: string;
  data?: Date;
  reportadoPorNome?: string | null;
  status?: string;
  descricao?: string | null;
  titulo?: string;
}

interface Vistoria {
  id: number;
  protocolo?: string;
  data?: Date;
  responsavelNome?: string | null;
  status?: string;
  descricao?: string | null;
  titulo?: string;
}

interface Checklist {
  id: number;
  dataCriacao?: Date;
  titulo?: string | null;
  itens?: any[];
}

export async function exportManutencoesPDF(
  manutencoes: Manutencao[],
  organizacao?: { nome: string }
): Promise<void> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  let yPosition = 20;

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Manutenções", 14, yPosition);
  yPosition += 8;

  if (organizacao) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(organizacao.nome, 14, yPosition);
    yPosition += 6;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Data de Geração: ${new Date().toLocaleDateString("pt-BR")}`, 14, yPosition);
  yPosition += 10;

  // Gerar gráficos
  const statusData = calculateStatusDistribution(manutencoes);
  const responsavelData = calculateResponsavelDistribution(manutencoes);
  const prioridadeData = calculatePrioridadeDistribution(manutencoes);

  try {
    // Gráfico de Status
    const statusChart = await generatePieChartImage(statusData, "Distribuição por Status");
    if (statusChart) {
      doc.addImage(statusChart, "PNG", 14, yPosition, 80, 60);
    }

    // Gráfico de Prioridade
    const prioridadeChart = await generatePieChartImage(prioridadeData, "Distribuição por Prioridade");
    if (prioridadeChart) {
      doc.addImage(prioridadeChart, "PNG", 104, yPosition, 80, 60);
    }

    yPosition += 70;

    // Gráfico de Responsáveis
    if (responsavelData.length > 0) {
      const responsavelChart = await generateBarChartImage(
        responsavelData,
        "Top 10 Responsáveis",
        "#FF8C00"
      );
      if (responsavelChart) {
        doc.addImage(responsavelChart, "PNG", 14, yPosition, 120, 60);
      }
      yPosition += 70;
    }
  } catch (error) {
    console.error("Erro ao gerar gráficos:", error);
  }

  // Preparar dados da tabela
  const tableData = manutencoes.map((m) => [
    m.protocolo || m.id.toString(),
    m.data ? new Date(m.data).toLocaleDateString("pt-BR") : "-",
    m.titulo || "-",
    m.responsavelNome || "-",
    m.status || "-",
    m.prioridade || "-",
    m.descricao?.substring(0, 50) || "-",
  ]);

  // Gerar tabela
  autoTable(doc, {
    head: [["Protocolo", "Data", "Título", "Responsável", "Status", "Prioridade", "Descrição"]],
    body: tableData,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [255, 140, 0], // Laranja
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Salvar PDF
  doc.save(`relatorio-manutencoes-${new Date().getTime()}.pdf`);
}

export async function exportOcorrenciasPDF(
  ocorrencias: Ocorrencia[],
  organizacao?: { nome: string }
): Promise<void> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  let yPosition = 20;

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Ocorrências", 14, yPosition);
  yPosition += 8;

  if (organizacao) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(organizacao.nome, 14, yPosition);
    yPosition += 6;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Data de Geração: ${new Date().toLocaleDateString("pt-BR")}`, 14, yPosition);
  yPosition += 10;

  // Gerar gráficos
  const statusData = calculateStatusDistribution(ocorrencias);
  const responsavelData = calculateResponsavelDistribution(ocorrencias);

  try {
    // Gráfico de Status
    const statusChart = await generatePieChartImage(statusData, "Distribuição por Status");
    if (statusChart) {
      doc.addImage(statusChart, "PNG", 14, yPosition, 80, 60);
    }

    yPosition += 70;

    // Gráfico de Responsáveis
    if (responsavelData.length > 0) {
      const responsavelChart = await generateBarChartImage(
        responsavelData,
        "Top 10 Reportadores",
        "#FF8C00"
      );
      if (responsavelChart) {
        doc.addImage(responsavelChart, "PNG", 14, yPosition, 120, 60);
      }
      yPosition += 70;
    }
  } catch (error) {
    console.error("Erro ao gerar gráficos:", error);
  }

  // Preparar dados da tabela
  const tableData = ocorrencias.map((o) => [
    o.protocolo || o.id.toString(),
    o.data ? new Date(o.data).toLocaleDateString("pt-BR") : "-",
    o.titulo || "-",
    o.reportadoPorNome || "-",
    o.status || "-",
    o.descricao?.substring(0, 50) || "-",
  ]);

  // Gerar tabela
  autoTable(doc, {
    head: [["Protocolo", "Data", "Título", "Reportado Por", "Status", "Descrição"]],
    body: tableData,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [255, 140, 0], // Laranja
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Salvar PDF
  doc.save(`relatorio-ocorrencias-${new Date().getTime()}.pdf`);
}

export async function exportVistoriasPDF(
  vistorias: Vistoria[],
  organizacao?: { nome: string }
): Promise<void> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  let yPosition = 20;

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Vistorias", 14, yPosition);
  yPosition += 8;

  if (organizacao) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(organizacao.nome, 14, yPosition);
    yPosition += 6;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Data de Geração: ${new Date().toLocaleDateString("pt-BR")}`, 14, yPosition);
  yPosition += 10;

  // Gerar gráficos
  const statusData = calculateStatusDistribution(vistorias);
  const responsavelData = calculateResponsavelDistribution(vistorias);

  try {
    // Gráfico de Status
    const statusChart = await generatePieChartImage(statusData, "Distribuição por Status");
    if (statusChart) {
      doc.addImage(statusChart, "PNG", 14, yPosition, 80, 60);
    }

    yPosition += 70;

    // Gráfico de Responsáveis
    if (responsavelData.length > 0) {
      const responsavelChart = await generateBarChartImage(
        responsavelData,
        "Top 10 Responsáveis",
        "#FF8C00"
      );
      if (responsavelChart) {
        doc.addImage(responsavelChart, "PNG", 14, yPosition, 120, 60);
      }
      yPosition += 70;
    }
  } catch (error) {
    console.error("Erro ao gerar gráficos:", error);
  }

  // Preparar dados da tabela
  const tableData = vistorias.map((v) => [
    v.protocolo || v.id.toString(),
    v.data ? new Date(v.data).toLocaleDateString("pt-BR") : "-",
    v.titulo || "-",
    v.responsavelNome || "-",
    v.status || "-",
    v.descricao?.substring(0, 50) || "-",
  ]);

  // Gerar tabela
  autoTable(doc, {
    head: [["Protocolo", "Data", "Título", "Responsável", "Status", "Descrição"]],
    body: tableData,
    startY: yPosition,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [255, 140, 0], // Laranja
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Salvar PDF
  doc.save(`relatorio-vistorias-${new Date().getTime()}.pdf`);
}

export async function exportChecklistsPDF(
  checklists: Checklist[],
  organizacao?: { nome: string }
): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  let yPosition = 20;

  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Checklists", 14, yPosition);
  yPosition += 8;

  if (organizacao) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(organizacao.nome, 14, yPosition);
    yPosition += 6;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Data de Geração: ${new Date().toLocaleDateString("pt-BR")}`, 14, yPosition);
  yPosition += 10;

  // Preparar dados da tabela
  const tableData = checklists.map((c) => [
    c.id.toString(),
    c.dataCriacao ? new Date(c.dataCriacao).toLocaleDateString("pt-BR") : "-",
    c.titulo || "-",
    c.itens?.length?.toString() || "0",
  ]);

  // Gerar tabela
  autoTable(doc, {
    head: [["ID", "Data", "Título", "Itens"]],
    body: tableData,
    startY: yPosition,
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [255, 140, 0], // Laranja
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Salvar PDF
  doc.save(`relatorio-checklists-${new Date().getTime()}.pdf`);
}
