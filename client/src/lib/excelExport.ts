import * as XLSX from "xlsx";

interface Manutencao {
  id: number;
  protocolo?: string;
  data?: Date;
  responsavelNome?: string | null;
  status?: string;
  prioridade?: string | null;
  descricao?: string | null;
  titulo?: string;
  local?: string | null;
}

interface Ocorrencia {
  id: number;
  protocolo?: string;
  data?: Date;
  reportadoPorNome?: string | null;
  status?: string;
  descricao?: string | null;
  titulo?: string;
  local?: string | null;
}

interface Vistoria {
  id: number;
  protocolo?: string;
  data?: Date;
  responsavelNome?: string | null;
  status?: string;
  descricao?: string | null;
  titulo?: string;
  local?: string | null;
}

interface Checklist {
  id: number;
  dataCriacao?: Date;
  titulo?: string | null;
  itens?: any[];
  responsavelNome?: string | null;
}

/**
 * Exporta manutenções para Excel
 */
export function exportManutencoesExcel(
  manutencoes: Manutencao[],
  organizacao?: { nome: string }
): void {
  // Preparar dados
  const data = manutencoes.map((m) => ({
    Protocolo: m.protocolo || m.id.toString(),
    Data: m.data ? new Date(m.data).toLocaleDateString("pt-BR") : "-",
    Título: m.titulo || "-",
    Responsável: m.responsavelNome || "-",
    Status: m.status || "-",
    Prioridade: m.prioridade || "-",
    Local: m.local || "-",
    Descrição: m.descricao || "-",
  }));

  // Criar workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 12 }, // Protocolo
    { wch: 12 }, // Data
    { wch: 30 }, // Título
    { wch: 20 }, // Responsável
    { wch: 15 }, // Status
    { wch: 12 }, // Prioridade
    { wch: 20 }, // Local
    { wch: 50 }, // Descrição
  ];
  ws["!cols"] = colWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, "Manutenções");

  // Adicionar informações de cabeçalho
  if (organizacao) {
    XLSX.utils.sheet_add_aoa(ws, [[organizacao.nome]], { origin: "A1" });
    XLSX.utils.sheet_add_aoa(
      ws,
      [[`Data de Geração: ${new Date().toLocaleDateString("pt-BR")}`]],
      { origin: "A2" }
    );
  }

  // Salvar arquivo
  const fileName = `manutencoes-${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exporta ocorrências para Excel
 */
export function exportOcorrenciasExcel(
  ocorrencias: Ocorrencia[],
  organizacao?: { nome: string }
): void {
  // Preparar dados
  const data = ocorrencias.map((o) => ({
    Protocolo: o.protocolo || o.id.toString(),
    Data: o.data ? new Date(o.data).toLocaleDateString("pt-BR") : "-",
    Título: o.titulo || "-",
    "Reportado Por": o.reportadoPorNome || "-",
    Status: o.status || "-",
    Local: o.local || "-",
    Descrição: o.descricao || "-",
  }));

  // Criar workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 12 }, // Protocolo
    { wch: 12 }, // Data
    { wch: 30 }, // Título
    { wch: 20 }, // Reportado Por
    { wch: 15 }, // Status
    { wch: 20 }, // Local
    { wch: 50 }, // Descrição
  ];
  ws["!cols"] = colWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, "Ocorrências");

  // Salvar arquivo
  const fileName = `ocorrencias-${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exporta vistorias para Excel
 */
export function exportVistoriasExcel(
  vistorias: Vistoria[],
  organizacao?: { nome: string }
): void {
  // Preparar dados
  const data = vistorias.map((v) => ({
    Protocolo: v.protocolo || v.id.toString(),
    Data: v.data ? new Date(v.data).toLocaleDateString("pt-BR") : "-",
    Título: v.titulo || "-",
    Responsável: v.responsavelNome || "-",
    Status: v.status || "-",
    Local: v.local || "-",
    Descrição: v.descricao || "-",
  }));

  // Criar workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 12 }, // Protocolo
    { wch: 12 }, // Data
    { wch: 30 }, // Título
    { wch: 20 }, // Responsável
    { wch: 15 }, // Status
    { wch: 20 }, // Local
    { wch: 50 }, // Descrição
  ];
  ws["!cols"] = colWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, "Vistorias");

  // Salvar arquivo
  const fileName = `vistorias-${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exporta checklists para Excel
 */
export function exportChecklistsExcel(
  checklists: Checklist[],
  organizacao?: { nome: string }
): void {
  // Preparar dados
  const data = checklists.map((c) => ({
    ID: c.id.toString(),
    Data: c.dataCriacao ? new Date(c.dataCriacao).toLocaleDateString("pt-BR") : "-",
    Título: c.titulo || "-",
    Responsável: c.responsavelNome || "-",
    "Qtd Itens": c.itens?.length?.toString() || "0",
  }));

  // Criar workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Ajustar largura das colunas
  const colWidths = [
    { wch: 10 }, // ID
    { wch: 12 }, // Data
    { wch: 40 }, // Título
    { wch: 20 }, // Responsável
    { wch: 12 }, // Qtd Itens
  ];
  ws["!cols"] = colWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, "Checklists");

  // Salvar arquivo
  const fileName = `checklists-${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Exporta dados consolidados para Excel (múltiplas abas)
 */
export function exportConsolidadoExcel(data: {
  manutencoes?: Manutencao[];
  ocorrencias?: Ocorrencia[];
  vistorias?: Vistoria[];
  checklists?: Checklist[];
  organizacao?: { nome: string };
}): void {
  const wb = XLSX.utils.book_new();

  // Adicionar aba de Manutenções
  if (data.manutencoes && data.manutencoes.length > 0) {
    const manutencoesData = data.manutencoes.map((m) => ({
      Protocolo: m.protocolo || m.id.toString(),
      Data: m.data ? new Date(m.data).toLocaleDateString("pt-BR") : "-",
      Título: m.titulo || "-",
      Responsável: m.responsavelNome || "-",
      Status: m.status || "-",
      Prioridade: m.prioridade || "-",
      Local: m.local || "-",
      Descrição: m.descricao || "-",
    }));
    const wsManutencoes = XLSX.utils.json_to_sheet(manutencoesData);
    XLSX.utils.book_append_sheet(wb, wsManutencoes, "Manutenções");
  }

  // Adicionar aba de Ocorrências
  if (data.ocorrencias && data.ocorrencias.length > 0) {
    const ocorrenciasData = data.ocorrencias.map((o) => ({
      Protocolo: o.protocolo || o.id.toString(),
      Data: o.data ? new Date(o.data).toLocaleDateString("pt-BR") : "-",
      Título: o.titulo || "-",
      "Reportado Por": o.reportadoPorNome || "-",
      Status: o.status || "-",
      Local: o.local || "-",
      Descrição: o.descricao || "-",
    }));
    const wsOcorrencias = XLSX.utils.json_to_sheet(ocorrenciasData);
    XLSX.utils.book_append_sheet(wb, wsOcorrencias, "Ocorrências");
  }

  // Adicionar aba de Vistorias
  if (data.vistorias && data.vistorias.length > 0) {
    const vistoriasData = data.vistorias.map((v) => ({
      Protocolo: v.protocolo || v.id.toString(),
      Data: v.data ? new Date(v.data).toLocaleDateString("pt-BR") : "-",
      Título: v.titulo || "-",
      Responsável: v.responsavelNome || "-",
      Status: v.status || "-",
      Local: v.local || "-",
      Descrição: v.descricao || "-",
    }));
    const wsVistorias = XLSX.utils.json_to_sheet(vistoriasData);
    XLSX.utils.book_append_sheet(wb, wsVistorias, "Vistorias");
  }

  // Adicionar aba de Checklists
  if (data.checklists && data.checklists.length > 0) {
    const checklistsData = data.checklists.map((c) => ({
      ID: c.id.toString(),
      Data: c.dataCriacao ? new Date(c.dataCriacao).toLocaleDateString("pt-BR") : "-",
      Título: c.titulo || "-",
      Responsável: c.responsavelNome || "-",
      "Qtd Itens": c.itens?.length?.toString() || "0",
    }));
    const wsChecklists = XLSX.utils.json_to_sheet(checklistsData);
    XLSX.utils.book_append_sheet(wb, wsChecklists, "Checklists");
  }

  // Salvar arquivo
  const fileName = `relatorio-consolidado-${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

// ==================== EXPORTAÇÃO DE VENCIMENTOS ====================

export interface VencimentoExport {
  id: number;
  tipo: string;
  titulo: string;
  descricao?: string | null;
  fornecedor?: string | null;
  valor?: string | null;
  dataInicio?: Date | string | null;
  dataVencimento: Date | string;
  ultimaRealizacao?: Date | string | null;
  proximaRealizacao?: Date | string | null;
  periodicidade?: string | null;
  status: string;
  observacoes?: string | null;
  arquivoUrl?: string | null;
  arquivoNome?: string | null;
}

export function exportVencimentosExcel(
  vencimentos: VencimentoExport[],
  titulo: string = 'Vencimentos'
): void {
  try {
    const tipoLabels: Record<string, string> = {
      contrato: 'Contrato',
      servico: 'Serviço',
      manutencao: 'Manutenção',
    };

    const periodicidadeLabels: Record<string, string> = {
      unico: 'Único',
      mensal: 'Mensal',
      bimestral: 'Bimestral',
      trimestral: 'Trimestral',
      semestral: 'Semestral',
      anual: 'Anual',
    };

    const statusLabels: Record<string, string> = {
      ativo: 'Ativo',
      vencido: 'Vencido',
      renovado: 'Renovado',
      cancelado: 'Cancelado',
    };

    // Preparar dados para Excel
    const data = vencimentos.map((v) => ({
      'ID': v.id,
      'Tipo': tipoLabels[v.tipo] || v.tipo,
      'Título': v.titulo,
      'Descrição': v.descricao || '',
      'Fornecedor': v.fornecedor || '',
      'Valor (R$)': v.valor || '',
      'Data Início': v.dataInicio ? new Date(v.dataInicio).toLocaleDateString('pt-BR') : '',
      'Data Vencimento': new Date(v.dataVencimento).toLocaleDateString('pt-BR'),
      'Última Realização': v.ultimaRealizacao ? new Date(v.ultimaRealizacao).toLocaleDateString('pt-BR') : '',
      'Próxima Realização': v.proximaRealizacao ? new Date(v.proximaRealizacao).toLocaleDateString('pt-BR') : '',
      'Periodicidade': periodicidadeLabels[v.periodicidade || ''] || v.periodicidade || '',
      'Status': statusLabels[v.status] || v.status,
      'Observações': v.observacoes || '',
      'Arquivo Anexo': v.arquivoNome || '',
    }));

    // Criar workbook e worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vencimentos');

    // Ajustar largura das colunas
    ws['!cols'] = [
      { wch: 8 },   // ID
      { wch: 12 },  // Tipo
      { wch: 30 },  // Título
      { wch: 40 },  // Descrição
      { wch: 25 },  // Fornecedor
      { wch: 12 },  // Valor
      { wch: 14 },  // Data Início
      { wch: 16 },  // Data Vencimento
      { wch: 18 },  // Última Realização
      { wch: 18 },  // Próxima Realização
      { wch: 14 },  // Periodicidade
      { wch: 12 },  // Status
      { wch: 40 },  // Observações
      { wch: 30 },  // Arquivo Anexo
    ];

    // Gerar nome do arquivo
    const dataAtual = new Date().toISOString().split('T')[0];
    const nomeArquivo = `${titulo.replace(/\s+/g, '_')}_${dataAtual}.xlsx`;

    // Fazer download
    XLSX.writeFile(wb, nomeArquivo);
  } catch (error) {
    console.error('Erro ao exportar vencimentos para Excel:', error);
    throw error;
  }
}
