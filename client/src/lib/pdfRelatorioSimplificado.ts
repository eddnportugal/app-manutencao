import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Tipos para os dados do relatório
interface DadosRelatorio {
  condominio: any;
  periodo: { inicio: string; fim: string };
  secoes: Record<string, any[]>;
  totais: Record<string, number>;
  geradoEm: string;
}

interface ConfiguracaoRelatorio {
  nomeRelatorio: string;
  cabecalhoLogoUrl?: string;
  cabecalhoNomeCondominio?: string;
  cabecalhoNomeSindico?: string;
  rodapeTexto?: string;
  rodapeContato?: string;
  baseUrl?: string; // URL base para os links
}

// Função para formatar data
function formatarData(data: string | Date | null): string {
  if (!data) return "-";
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Função para formatar data e hora
function formatarDataHora(data: string | Date | null): string {
  if (!data) return "-";
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Função para obter cor do status
function getStatusColor(status: string | null): [number, number, number] {
  switch (status?.toLowerCase()) {
    case "concluido":
    case "concluída":
    case "finalizado":
    case "finalizada":
    case "realizada":
    case "ok":
      return [34, 197, 94]; // Verde
    case "pendente":
    case "aberto":
    case "aberta":
      return [234, 179, 8]; // Amarelo
    case "em_andamento":
    case "em andamento":
      return [59, 130, 246]; // Azul
    case "acao_necessaria":
    case "ação necessária":
    case "urgente":
      return [239, 68, 68]; // Vermelho
    case "cancelado":
    case "cancelada":
      return [156, 163, 175]; // Cinza
    default:
      return [107, 114, 128]; // Cinza escuro
  }
}

// Gerar relatório simplificado com links
export async function gerarRelatorioSimplificado(
  dados: DadosRelatorio,
  config: ConfiguracaoRelatorio
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

  // Cores
  const corPrimaria: [number, number, number] = [59, 130, 246];
  const corSecundaria: [number, number, number] = [100, 116, 139];

  // Obter URL base
  const baseUrl = config.baseUrl || window.location.origin;

  // Função para adicionar nova página
  const addNewPage = () => {
    doc.addPage();
    yPosition = margin;
    addFooter();
  };

  // Função para verificar se precisa nova página
  const checkNewPage = (height: number) => {
    if (yPosition + height > pageHeight - 25) {
      addNewPage();
    }
  };

  // Função para adicionar rodapé
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      config.rodapeTexto || "App Manutenção - Sistema Universal de Manutenção",
      margin,
      pageHeight - 10
    );
    doc.text(
      `Página ${pageCount}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: "right" }
    );
  };

  // Função para adicionar título de seção
  const addSectionTitle = (title: string) => {
    checkNewPage(15);
    doc.setFillColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 10, 2, 2, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), margin + 5, yPosition + 7);
    yPosition += 15;
  };

  // ========== CAPA ==========
  // Nome da organização
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
  const nomeCondominio = config.cabecalhoNomeCondominio || dados.condominio?.nome || "Condomínio";
  doc.text(nomeCondominio, pageWidth / 2, 40, { align: "center" });

  // Endereço
  if (dados.condominio?.endereco) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    doc.text(dados.condominio.endereco, pageWidth / 2, 50, { align: "center" });
  }

  // Linha decorativa
  doc.setDrawColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 40, 58, pageWidth / 2 + 40, 58);

  // Título do relatório
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text(config.nomeRelatorio || "Relatório", pageWidth / 2, 75, { align: "center" });

  // Período
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
  const periodoTexto = `Período: ${formatarData(dados.periodo.inicio)} a ${formatarData(dados.periodo.fim)}`;
  doc.text(periodoTexto, pageWidth / 2, 85, { align: "center" });

  // Data de geração
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Gerado em: ${formatarDataHora(dados.geradoEm)}`,
    pageWidth / 2,
    95,
    { align: "center" }
  );

  // Nota sobre links
  doc.setFontSize(9);
  doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
  doc.text(
    "* Clique nos links para acessar a secção correspondente no sistema",
    pageWidth / 2,
    105,
    { align: "center" }
  );

  yPosition = 120;

  // ========== RESUMO EXECUTIVO ==========
  addSectionTitle("Resumo Executivo");

  // Cards de estatísticas
  const stats = [
    { label: "Usuários", value: dados.totais.moradores || 0 },
    { label: "Manutenções", value: dados.totais.manutencoes || 0 },
    { label: "Ocorrências", value: dados.totais.ocorrencias || 0 },
    { label: "Votações", value: dados.totais.votacoes || 0 },
    { label: "Avisos", value: dados.totais.avisos || 0 },
  ];

  const cardWidth = (pageWidth - margin * 2 - 15) / 4;
  let xPos = margin;
  let cardCount = 0;

  for (const stat of stats) {
    if (cardCount > 0 && cardCount % 4 === 0) {
      yPosition += 25;
      xPos = margin;
    }

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(xPos, yPosition, cardWidth, 20, 2, 2, "F");

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    doc.text(String(stat.value), xPos + cardWidth / 2, yPosition + 10, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    doc.text(stat.label, xPos + cardWidth / 2, yPosition + 16, { align: "center" });

    xPos += cardWidth + 5;
    cardCount++;
  }

  yPosition += 35;

  // ========== MANUTENÇÕES ==========
  if (dados.secoes.manutencoes && dados.secoes.manutencoes.length > 0) {
    addSectionTitle(`Manutenções (${dados.secoes.manutencoes.length})`);

    const tableData = dados.secoes.manutencoes.map((item) => [
      item.titulo || "-",
      item.protocolo || "-",
      formatarData(item.createdAt || item.criadoEm),
      item.status || "-",
      item.prioridade || "-",
      item.responsavel || "-",
    ]);

    // Link para a secção de manutenções no dashboard
    const sectionLink = `${baseUrl}/dashboard/manutencoes`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Título", "Protocolo", "Data", "Status", "Prioridade", "Responsável"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: corPrimaria,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 22 },
        3: { cellWidth: 22 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        // Adicionar link clicável na célula do título - vai para a secção
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Adicionar nota sobre links
    doc.setFontSize(7);
    doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    doc.text("Clique no título para acessar a secção de Manutenções", margin, yPosition);
    yPosition += 8;
  }

  // ========== OCORRÊNCIAS ==========
  if (dados.secoes.ocorrencias && dados.secoes.ocorrencias.length > 0) {
    checkNewPage(50);
    addSectionTitle(`Ocorrências (${dados.secoes.ocorrencias.length})`);

    const tableData = dados.secoes.ocorrencias.map((item) => [
      item.titulo || "-",
      item.protocolo || "-",
      formatarData(item.createdAt || item.criadoEm),
      item.status || "-",
      item.tipo || "-",
      item.prioridade || "-",
    ]);

    const sectionLink = `${baseUrl}/dashboard/ocorrencias`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Título", "Protocolo", "Data", "Status", "Tipo", "Prioridade"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [239, 68, 68],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 22 },
        3: { cellWidth: 22 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(7);
    doc.setTextColor([239, 68, 68][0], [239, 68, 68][1], [239, 68, 68][2]);
    doc.text("Clique no título para acessar a secção de Ocorrências", margin, yPosition);
    yPosition += 8;
  }

  // ========== VISTORIAS ==========
  if (dados.secoes.vistorias && dados.secoes.vistorias.length > 0) {
    checkNewPage(50);
    addSectionTitle(`Vistorias (${dados.secoes.vistorias.length})`);

    const tableData = dados.secoes.vistorias.map((item) => [
      item.titulo || "-",
      item.protocolo || "-",
      formatarData(item.dataVistoria || item.createdAt || item.criadoEm),
      item.status || "-",
      item.area || "-",
      item.responsavel || "-",
    ]);

    const sectionLink = `${baseUrl}/dashboard/vistorias`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Título", "Protocolo", "Data", "Status", "Área", "Responsável"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [139, 92, 246],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(7);
    doc.setTextColor(139, 92, 246);
    doc.text("Clique no título para acessar a secção de Vistorias", margin, yPosition);
    yPosition += 8;
  }

  // ========== CHECKLISTS ==========
  if (dados.secoes.checklists && dados.secoes.checklists.length > 0) {
    checkNewPage(50);
    addSectionTitle(`Checklists (${dados.secoes.checklists.length})`);

    const tableData = dados.secoes.checklists.map((item) => [
      item.titulo || "-",
      item.protocolo || "-",
      formatarData(item.createdAt || item.criadoEm),
      item.status || "-",
      item.tipo || "-",
      item.responsavel || "-",
    ]);

    const sectionLink = `${baseUrl}/dashboard/checklists`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Título", "Protocolo", "Data", "Status", "Tipo", "Responsável"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(7);
    doc.setTextColor(34, 197, 94);
    doc.text("Clique no título para acessar a secção de Checklists", margin, yPosition);
    yPosition += 8;
  }

  // ========== USUÁRIOS ==========
  if (dados.secoes.moradores && dados.secoes.moradores.length > 0) {
    checkNewPage(50);
    addSectionTitle(`Usuários (${dados.secoes.moradores.length})`);

    const tableData = dados.secoes.moradores.map((item) => [
      item.nome || "-",
      item.unidade || `${item.bloco || ""}/${item.apartamento || ""}`,
      item.tipo || "-",
      item.telefone || "-",
      item.email || "-",
    ]);

    const sectionLink = `${baseUrl}/dashboard/moradores`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Nome", "Unidade", "Tipo", "Telefone", "Email"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: corPrimaria,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== VOTAÇÕES ==========
  if (dados.secoes.votacoes && dados.secoes.votacoes.length > 0) {
    checkNewPage(50);
    addSectionTitle(`Votações (${dados.secoes.votacoes.length})`);

    const tableData = dados.secoes.votacoes.map((item) => [
      item.titulo || "-",
      formatarData(item.dataInicio),
      formatarData(item.dataFim),
      item.status || "-",
      String(item.totalVotos || 0),
    ]);

    const sectionLink = `${baseUrl}/dashboard/votacoes`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Título", "Início", "Fim", "Status", "Votos"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [234, 179, 8],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(7);
    doc.setTextColor(234, 179, 8);
    doc.text("Clique no título para acessar a secção de Votações", margin, yPosition);
    yPosition += 8;
  }

  // ========== AVISOS ==========
  if (dados.secoes.avisos && dados.secoes.avisos.length > 0) {
    checkNewPage(50);
    addSectionTitle(`Avisos (${dados.secoes.avisos.length})`);

    const tableData = dados.secoes.avisos.map((item) => [
      item.titulo || "-",
      formatarData(item.createdAt || item.criadoEm),
      item.tipo || "-",
      (item.descricao || "").substring(0, 50) + (item.descricao?.length > 50 ? "..." : ""),
    ]);

    const sectionLink = `${baseUrl}/dashboard/avisos`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Título", "Data", "Tipo", "Descrição"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== EVENTOS ==========
  if (dados.secoes.eventos && dados.secoes.eventos.length > 0) {
    checkNewPage(50);
    addSectionTitle(`Eventos (${dados.secoes.eventos.length})`);

    const tableData = dados.secoes.eventos.map((item) => [
      item.titulo || "-",
      formatarData(item.dataEvento || item.data),
      item.horario || "-",
      item.local || "-",
      item.responsavel || "-",
    ]);

    const sectionLink = `${baseUrl}/dashboard/eventos`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Título", "Data", "Horário", "Local", "Responsável"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== ANTES E DEPOIS ==========
  if (dados.secoes.antesDepois && dados.secoes.antesDepois.length > 0) {
    checkNewPage(50);
    addSectionTitle(`Antes e Depois (${dados.secoes.antesDepois.length})`);

    const tableData = dados.secoes.antesDepois.map((item) => [
      item.titulo || "-",
      formatarData(item.createdAt || item.criadoEm),
      (item.descricao || "").substring(0, 60) + (item.descricao?.length > 60 ? "..." : ""),
    ]);

    const sectionLink = `${baseUrl}/dashboard/antes-depois`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Título", "Data", "Descrição"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [99, 102, 241],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(7);
    doc.setTextColor(99, 102, 241);
    doc.text("Clique no título para acessar a secção Antes e Depois", margin, yPosition);
    yPosition += 8;
  }

  // ========== FUNCIONÁRIOS ==========
  if (dados.secoes.funcionarios && dados.secoes.funcionarios.length > 0) {
    checkNewPage(50);
    addSectionTitle(`Funcionários (${dados.secoes.funcionarios.length})`);

    const tableData = dados.secoes.funcionarios.map((item) => [
      item.nome || "-",
      item.cargo || "-",
      item.departamento || "-",
      item.telefone || "-",
      item.email || "-",
    ]);

    const sectionLink = `${baseUrl}/dashboard/funcionarios`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Nome", "Cargo", "Departamento", "Telefone", "Email"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [107, 114, 128],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== CLASSIFICADOS ==========
  if (dados.secoes.classificados && dados.secoes.classificados.length > 0) {
    checkNewPage(50);
    addSectionTitle(`Classificados (${dados.secoes.classificados.length})`);

    const tableData = dados.secoes.classificados.map((item) => [
      item.titulo || "-",
      formatarData(item.createdAt || item.criadoEm),
      item.categoria || "-",
      item.preco ? `R$ ${item.preco}` : "-",
      item.status || "-",
    ]);

    const sectionLink = `${baseUrl}/dashboard/classificados`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Título", "Data", "Categoria", "Preço", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [249, 115, 22],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== ACHADOS E PERDIDOS ==========
  if (dados.secoes.achadosPerdidos && dados.secoes.achadosPerdidos.length > 0) {
    checkNewPage(50);
    addSectionTitle(`Achados e Perdidos (${dados.secoes.achadosPerdidos.length})`);

    const tableData = dados.secoes.achadosPerdidos.map((item) => [
      item.titulo || "-",
      formatarData(item.createdAt || item.criadoEm),
      item.tipo || "-",
      item.local || "-",
      item.status || "-",
    ]);

    const sectionLink = `${baseUrl}/dashboard/achados-perdidos`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Título", "Data", "Tipo", "Local", "Status"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [168, 85, 247],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // ========== CARONAS ==========
  if (dados.secoes.caronas && dados.secoes.caronas.length > 0) {
    checkNewPage(50);
    addSectionTitle(`Caronas (${dados.secoes.caronas.length})`);

    const tableData = dados.secoes.caronas.map((item) => [
      item.origem || "-",
      item.destino || "-",
      formatarData(item.data),
      item.horario || "-",
      item.tipo || "-",
    ]);

    const sectionLink = `${baseUrl}/dashboard/caronas`;

    autoTable(doc, {
      startY: yPosition,
      head: [["Origem", "Destino", "Data", "Horário", "Tipo"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [6, 182, 212],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [60, 60, 60],
      },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 0) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: sectionLink });
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Adicionar rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();
  }

  // Salvar o PDF
  const fileName = `${config.nomeRelatorio?.toLowerCase().replace(/\s+/g, "_") || "relatorio"}_simplificado_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
