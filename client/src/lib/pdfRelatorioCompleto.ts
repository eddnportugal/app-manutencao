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
  incluirGraficos?: boolean;
  incluirEstatisticas?: boolean;
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

// Função para gerar URL do mapa estático
function getStaticMapUrl(lat: number, lng: number, zoom: number = 15): string {
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=400x200&markers=${lat},${lng},red`;
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

// Função para formatar status com cores
function getStatusColor(status: string): number[] {
  const statusColors: Record<string, number[]> = {
    "pendente": [234, 179, 8],
    "em_andamento": [59, 130, 246],
    "concluido": [34, 197, 94],
    "concluida": [34, 197, 94],
    "cancelado": [239, 68, 68],
    "cancelada": [239, 68, 68],
    "aberto": [234, 179, 8],
    "fechado": [34, 197, 94],
    "ativo": [34, 197, 94],
    "inativo": [156, 163, 175],
    "realizada": [34, 197, 94],
    "acao_necessaria": [239, 68, 68],
    "finalizada": [34, 197, 94],
    "reaberta": [234, 179, 8],
  };
  return statusColors[status?.toLowerCase()] || [156, 163, 175];
}

// Função principal para gerar o relatório PDF profissional
export async function gerarRelatorioProfissional(
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
  let pageNumber = 1;

  // Cores do tema
  const corPrimaria = [37, 99, 235]; // Azul
  const corSecundaria = [100, 116, 139]; // Cinza
  const corVerde = [34, 197, 94];
  const corVermelho = [239, 68, 68];
  const corAmarelo = [234, 179, 8];

  // Função para adicionar rodapé
  const addFooter = () => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    
    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);
    
    // Texto do rodapé
    const rodapeTexto = config.rodapeTexto || "App Manutenção - Sistema Universal de Manutenção";
    doc.text(rodapeTexto, margin, pageHeight - 12);
    
    if (config.rodapeContato) {
      doc.text(config.rodapeContato, margin, pageHeight - 8);
    }
    
    // Número da página
    doc.text(`Página ${pageNumber}`, pageWidth - margin, pageHeight - 12, { align: "right" });
  };

  // Função para verificar e adicionar nova página
  const checkNewPage = (requiredSpace: number): boolean => {
    if (yPosition + requiredSpace > pageHeight - 25) {
      addFooter();
      doc.addPage();
      pageNumber++;
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Função para adicionar título de secção
  const addSectionTitle = (titulo: string, icone?: string) => {
    checkNewPage(20);
    
    doc.setFillColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 10, 2, 2, "F");
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(titulo.toUpperCase(), margin + 5, yPosition + 7);
    
    yPosition += 15;
  };

  // Função para adicionar subtítulo
  const addSubtitle = (texto: string) => {
    checkNewPage(10);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    doc.text(texto, margin, yPosition);
    yPosition += 6;
  };

  // Função para adicionar texto normal
  const addText = (texto: string, indent: number = 0) => {
    checkNewPage(8);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    
    const maxWidth = pageWidth - margin * 2 - indent;
    const lines = doc.splitTextToSize(texto, maxWidth);
    doc.text(lines, margin + indent, yPosition);
    yPosition += lines.length * 4 + 2;
  };

  // Função para adicionar campo com label
  const addField = (label: string, valor: string, inline: boolean = false) => {
    if (!inline) checkNewPage(8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    doc.text(label + ":", margin + 5, yPosition);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(valor || "-", margin + 35, yPosition);
    
    if (!inline) yPosition += 5;
  };

  // Função para adicionar imagem
  const addImage = async (url: string, width: number = 60, height: number = 40) => {
    if (!url) return;
    
    checkNewPage(height + 5);
    
    try {
      const base64 = await imageUrlToBase64(url);
      if (base64) {
        doc.addImage(base64, "JPEG", margin + 5, yPosition, width, height);
        yPosition += height + 5;
      }
    } catch (e) {
      console.error("Erro ao adicionar imagem:", e);
    }
  };

  // Função para adicionar mapa
  const addMap = async (lat: number | null, lng: number | null, endereco?: string) => {
    if (!lat || !lng) return;
    
    checkNewPage(55);
    
    addSubtitle("Localizacao");
    
    try {
      const mapUrl = getStaticMapUrl(lat, lng);
      const base64 = await imageUrlToBase64(mapUrl);
      if (base64) {
        doc.addImage(base64, "PNG", margin + 5, yPosition, 80, 40);
      }
    } catch (e) {
      console.error("Erro ao adicionar mapa:", e);
    }
    
    // Informações de localização ao lado do mapa
    const xInfo = margin + 90;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    
    doc.text(`Latitude: ${lat.toFixed(6)}`, xInfo, yPosition + 10);
    doc.text(`Longitude: ${lng.toFixed(6)}`, xInfo, yPosition + 16);
    
    if (endereco) {
      const enderecoLines = doc.splitTextToSize(endereco, 80);
      doc.text(enderecoLines, xInfo, yPosition + 24);
    }
    
    // Links para mapas
    doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
    doc.textWithLink("Abrir no Google Maps", xInfo, yPosition + 36, {
      url: `https://www.google.com/maps?q=${lat},${lng}`
    });
    
    yPosition += 45;
  };

  // Função para adicionar galeria de imagens
  const addImageGallery = async (imagens: any[], titulo: string = "Fotos") => {
    if (!imagens || imagens.length === 0) return;
    
    checkNewPage(50);
    addSubtitle(`Fotos: ${titulo} (${imagens.length})`);
    
    const imgWidth = 40;
    const imgHeight = 30;
    const spacing = 5;
    const imgsPerRow = Math.floor((pageWidth - margin * 2) / (imgWidth + spacing));
    
    let xPos = margin + 5;
    let imgCount = 0;
    
    for (const img of imagens.slice(0, 6)) { // Máximo 6 imagens
      if (imgCount > 0 && imgCount % imgsPerRow === 0) {
        yPosition += imgHeight + spacing;
        xPos = margin + 5;
        checkNewPage(imgHeight + 10);
      }
      
      try {
        const url = img.url || img.imagemUrl || img;
        if (typeof url === "string") {
          const base64 = await imageUrlToBase64(url);
          if (base64) {
            doc.addImage(base64, "JPEG", xPos, yPosition, imgWidth, imgHeight);
          }
        }
      } catch (e) {
        console.error("Erro ao adicionar imagem da galeria:", e);
      }
      
      xPos += imgWidth + spacing;
      imgCount++;
    }
    
    yPosition += imgHeight + 10;
  };

  // Função para adicionar timeline
  const addTimeline = (timeline: any[]) => {
    if (!timeline || timeline.length === 0) return;
    
    checkNewPage(30);
    addSubtitle("Historico de Atualizacoes");
    
    for (const item of timeline.slice(0, 5)) { // Máximo 5 itens
      checkNewPage(15);
      
      // Círculo da timeline
      doc.setFillColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
      doc.circle(margin + 8, yPosition + 2, 2, "F");
      
      // Linha vertical
      if (timeline.indexOf(item) < timeline.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin + 8, yPosition + 4, margin + 8, yPosition + 12);
      }
      
      // Data e descrição
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
      doc.text(formatarDataHora(item.criadoEm), margin + 15, yPosition + 2);
      
      doc.setFontSize(8);
      doc.setTextColor(60, 60, 60);
      const descricao = item.descricao || item.acao || "-";
      const lines = doc.splitTextToSize(descricao, pageWidth - margin * 2 - 20);
      doc.text(lines, margin + 15, yPosition + 6);
      
      yPosition += Math.max(12, lines.length * 4 + 8);
    }
    
    yPosition += 5;
  };

  // ==================== CAPA DO RELATÓRIO ====================
  
  // Logo da organização
  if (config.cabecalhoLogoUrl) {
    try {
      const logoBase64 = await imageUrlToBase64(config.cabecalhoLogoUrl);
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", pageWidth / 2 - 20, yPosition, 40, 40);
        yPosition += 50;
      }
    } catch (e) {
      yPosition += 10;
    }
  } else {
    yPosition += 20;
  }

  // Nome da organização
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
  const nomeCondominio = config.cabecalhoNomeCondominio || dados.condominio?.nome || "Condomínio";
  doc.text(nomeCondominio, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Endereço
  if (dados.condominio?.endereco) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
    doc.text(dados.condominio.endereco, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;
  }

  // Linha decorativa
  doc.setDrawColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
  doc.setLineWidth(1);
  doc.line(margin + 30, yPosition, pageWidth - margin - 30, yPosition);
  yPosition += 15;

  // Título do relatório
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 33, 33);
  doc.text(config.nomeRelatorio || "Relatório Consolidado", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 12;

  // Período
  const periodoTexto = `Período: ${formatarData(dados.periodo.inicio)} a ${formatarData(dados.periodo.fim)}`;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
  doc.text(periodoTexto, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 20;

  // Nome do gestor
  if (config.cabecalhoNomeSindico) {
    doc.setFontSize(10);
    doc.text(`Gestor: ${config.cabecalhoNomeSindico}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;
  }

  // Data de geração
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(`Gerado em: ${formatarDataHora(dados.geradoEm)}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 25;

  // ==================== RESUMO EXECUTIVO ====================
  
  if (config.incluirEstatisticas !== false) {
    addSectionTitle("Resumo Executivo");
    
    // Cards de estatísticas
    const totais = Object.entries(dados.totais);
    const cardWidth = (pageWidth - margin * 2 - 15) / 4;
    const cardHeight = 20;
    
    let xPos = margin;
    let cardCount = 0;
    
    for (const [key, value] of totais.slice(0, 8)) {
      if (cardCount > 0 && cardCount % 4 === 0) {
        yPosition += cardHeight + 5;
        xPos = margin;
        checkNewPage(cardHeight + 10);
      }
      
      // Fundo do card
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(xPos, yPosition, cardWidth, cardHeight, 2, 2, "F");
      
      // Valor
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
      doc.text(String(value), xPos + cardWidth / 2, yPosition + 9, { align: "center" });
      
      // Label
      const labelMap: Record<string, string> = {
        manutencoes: "Manutenções",
        ocorrencias: "Ocorrências",
        vistorias: "Vistorias",
        checklists: "Checklists",
        eventos: "Eventos",
        avisos: "Avisos",
        votacoes: "Votações",
        moradores: "Usuários",
        funcionarios: "Funcionários",
        realizacoes: "Realizações",
        melhorias: "Melhorias",
        aquisicoes: "Aquisições",
        antesDepois: "Antes/Depois",
        comunicados: "Comunicados",
        classificados: "Classificados",
        achadosPerdidos: "Achados/Perdidos",
        caronas: "Caronas",
        estacionamento: "Vagas",
        albuns: "Álbuns",
        telefonesUteis: "Telefones",
        linksUteis: "Links",
        publicidades: "Publicidades",
        anunciantes: "Anunciantes",
        dicasSeguranca: "Dicas Segurança",
        regrasNormas: "Regras",
        infracoes: "Infrações",
        destaques: "Destaques",
        vencimentos: "Vencimentos",
        mensagensSindico: "Mensagens",
        condominio: "Condomínio",
      };
      
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(corSecundaria[0], corSecundaria[1], corSecundaria[2]);
      doc.text(labelMap[key] || key, xPos + cardWidth / 2, yPosition + 16, { align: "center" });
      
      xPos += cardWidth + 5;
      cardCount++;
    }
    
    yPosition += cardHeight + 15;
  }

  // ==================== SECÇÕES DE DADOS ====================

  // MANUTENÇÕES
  if (dados.secoes.manutencoes && dados.secoes.manutencoes.length > 0) {
    addSectionTitle(`Manutenções (${dados.secoes.manutencoes.length})`);
    
    for (const item of dados.secoes.manutencoes) {
      checkNewPage(80);
      
      // Card do item
      doc.setFillColor(255, 247, 237);
      doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 8, 1, 1, "F");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text(item.titulo || "Sem título", margin + 3, yPosition + 5.5);
      
      // Status badge
      const statusColor = getStatusColor(item.status);
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(pageWidth - margin - 25, yPosition + 1.5, 22, 5, 1, 1, "F");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(item.status || "-", pageWidth - margin - 14, yPosition + 5, { align: "center" });
      
      yPosition += 12;
      
      // Protocolo e datas
      addField("Protocolo", item.protocolo || "-");
      addField("Data Abertura", formatarData(item.criadoEm));
      if (item.dataPrevisao) addField("Previsão", formatarData(item.dataPrevisao));
      if (item.dataConclusao) addField("Conclusão", formatarData(item.dataConclusao));
      addField("Prioridade", item.prioridade || "-");
      addField("Responsável", item.responsavel || "-");
      if (item.categoria) addField("Categoria", item.categoria);
      if (item.fornecedor) addField("Fornecedor", item.fornecedor);
      if (item.custoEstimado) addField("Custo Estimado", `R$ ${item.custoEstimado}`);
      if (item.custoReal) addField("Custo Real", `R$ ${item.custoReal}`);
      
      // Descrição
      if (item.descricao) {
        yPosition += 3;
        addSubtitle("Descrição");
        addText(item.descricao, 5);
      }
      
      // Localização com mapa
      if (item.latitude && item.longitude) {
        await addMap(parseFloat(item.latitude), parseFloat(item.longitude), item.enderecoGeo || item.localizacao);
      }
      
      // Galeria de imagens
      if (item.imagens && item.imagens.length > 0) {
        await addImageGallery(item.imagens);
      }
      
      // Timeline
      if (item.timeline && item.timeline.length > 0) {
        addTimeline(item.timeline);
      }
      
      // Separador
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    }
  }

  // OCORRÊNCIAS
  if (dados.secoes.ocorrencias && dados.secoes.ocorrencias.length > 0) {
    addSectionTitle(`Ocorrências (${dados.secoes.ocorrencias.length})`);
    
    for (const item of dados.secoes.ocorrencias) {
      checkNewPage(80);
      
      doc.setFillColor(254, 242, 242);
      doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 8, 1, 1, "F");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text(item.titulo || "Sem título", margin + 3, yPosition + 5.5);
      
      const statusColor = getStatusColor(item.status);
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(pageWidth - margin - 25, yPosition + 1.5, 22, 5, 1, 1, "F");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(item.status || "-", pageWidth - margin - 14, yPosition + 5, { align: "center" });
      
      yPosition += 12;
      
      addField("Protocolo", item.protocolo || "-");
      addField("Data", formatarDataHora(item.criadoEm));
      addField("Tipo", item.tipo || "-");
      addField("Prioridade", item.prioridade || "-");
      addField("Responsável", item.responsavel || "-");
      if (item.reportadoPor) addField("Reportado por", item.reportadoPor);
      if (item.unidade) addField("Unidade", item.unidade);
      
      if (item.descricao) {
        yPosition += 3;
        addSubtitle("Descrição");
        addText(item.descricao, 5);
      }
      
      if (item.latitude && item.longitude) {
        await addMap(parseFloat(item.latitude), parseFloat(item.longitude), item.enderecoGeo || item.localizacao);
      }
      
      if (item.imagens && item.imagens.length > 0) {
        await addImageGallery(item.imagens);
      }
      
      if (item.timeline && item.timeline.length > 0) {
        addTimeline(item.timeline);
      }
      
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    }
  }

  // VISTORIAS
  if (dados.secoes.vistorias && dados.secoes.vistorias.length > 0) {
    addSectionTitle(`Vistorias (${dados.secoes.vistorias.length})`);
    
    for (const item of dados.secoes.vistorias) {
      checkNewPage(80);
      
      doc.setFillColor(250, 245, 255);
      doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 8, 1, 1, "F");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text(item.titulo || "Sem título", margin + 3, yPosition + 5.5);
      
      const statusColor = getStatusColor(item.status);
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(pageWidth - margin - 25, yPosition + 1.5, 22, 5, 1, 1, "F");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(item.status || "-", pageWidth - margin - 14, yPosition + 5, { align: "center" });
      
      yPosition += 12;
      
      addField("Protocolo", item.protocolo || "-");
      addField("Data", formatarData(item.dataVistoria || item.criadoEm));
      addField("Área", item.area || "-");
      addField("Responsável", item.responsavel || "-");
      if (item.tipo) addField("Tipo", item.tipo);
      
      if (item.descricao) {
        yPosition += 3;
        addSubtitle("Descrição");
        addText(item.descricao, 5);
      }
      
      if (item.observacoes) {
        addSubtitle("Observações");
        addText(item.observacoes, 5);
      }
      
      if (item.latitude && item.longitude) {
        await addMap(parseFloat(item.latitude), parseFloat(item.longitude), item.enderecoGeo || item.localizacao);
      }
      
      if (item.imagens && item.imagens.length > 0) {
        await addImageGallery(item.imagens);
      }
      
      if (item.timeline && item.timeline.length > 0) {
        addTimeline(item.timeline);
      }
      
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    }
  }

  // CHECKLISTS
  if (dados.secoes.checklists && dados.secoes.checklists.length > 0) {
    addSectionTitle(`Checklists (${dados.secoes.checklists.length})`);
    
    for (const item of dados.secoes.checklists) {
      checkNewPage(80);
      
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 8, 1, 1, "F");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text(item.titulo || "Sem título", margin + 3, yPosition + 5.5);
      
      const statusColor = getStatusColor(item.status);
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.roundedRect(pageWidth - margin - 25, yPosition + 1.5, 22, 5, 1, 1, "F");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(item.status || "-", pageWidth - margin - 14, yPosition + 5, { align: "center" });
      
      yPosition += 12;
      
      addField("Protocolo", item.protocolo || "-");
      addField("Data", formatarData(item.criadoEm));
      addField("Responsável", item.responsavel || "-");
      if (item.tipo) addField("Tipo", item.tipo);
      
      // Itens do checklist
      if (item.itens && item.itens.length > 0) {
        yPosition += 3;
        addSubtitle(`Itens Verificados (${item.itens.length})`);
        
        for (const checkItem of item.itens) {
          checkNewPage(8);
          
          const isOk = checkItem.status === "ok" || checkItem.concluido;
          doc.setFillColor(isOk ? corVerde[0] : corVermelho[0], isOk ? corVerde[1] : corVermelho[1], isOk ? corVerde[2] : corVermelho[2]);
          doc.circle(margin + 8, yPosition + 1, 2, "F");
          
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(60, 60, 60);
          doc.text(checkItem.descricao || checkItem.titulo || "-", margin + 15, yPosition + 2);
          
          yPosition += 6;
        }
      }
      
      if (item.latitude && item.longitude) {
        await addMap(parseFloat(item.latitude), parseFloat(item.longitude), item.enderecoGeo || item.localizacao);
      }
      
      if (item.imagens && item.imagens.length > 0) {
        await addImageGallery(item.imagens);
      }
      
      if (item.timeline && item.timeline.length > 0) {
        addTimeline(item.timeline);
      }
      
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    }
  }

  // ANTES E DEPOIS
  if (dados.secoes.antesDepois && dados.secoes.antesDepois.length > 0) {
    addSectionTitle(`Antes e Depois (${dados.secoes.antesDepois.length})`);
    
    for (const item of dados.secoes.antesDepois) {
      checkNewPage(70);
      
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 8, 1, 1, "F");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text(item.titulo || "Sem título", margin + 3, yPosition + 5.5);
      
      yPosition += 12;
      
      addField("Data", formatarData(item.criadoEm));
      if (item.descricao) {
        addSubtitle("Descrição");
        addText(item.descricao, 5);
      }
      
      // Fotos antes e depois lado a lado
      checkNewPage(50);
      const imgWidth = (pageWidth - margin * 2 - 10) / 2;
      const imgHeight = 40;
      
      // Label ANTES
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(corVermelho[0], corVermelho[1], corVermelho[2]);
      doc.text("ANTES", margin + imgWidth / 2, yPosition, { align: "center" });
      
      // Label DEPOIS
      doc.setTextColor(corVerde[0], corVerde[1], corVerde[2]);
      doc.text("DEPOIS", margin + imgWidth + 10 + imgWidth / 2, yPosition, { align: "center" });
      
      yPosition += 5;
      
      // Imagem ANTES
      if (item.imagemAntes || item.fotoAntes) {
        try {
          const base64 = await imageUrlToBase64(item.imagemAntes || item.fotoAntes);
          if (base64) {
            doc.addImage(base64, "JPEG", margin, yPosition, imgWidth, imgHeight);
          }
        } catch (e) {}
      }
      
      // Imagem DEPOIS
      if (item.imagemDepois || item.fotoDepois) {
        try {
          const base64 = await imageUrlToBase64(item.imagemDepois || item.fotoDepois);
          if (base64) {
            doc.addImage(base64, "JPEG", margin + imgWidth + 10, yPosition, imgWidth, imgHeight);
          }
        } catch (e) {}
      }
      
      yPosition += imgHeight + 5;
      
      if (item.latitude && item.longitude) {
        await addMap(item.latitude, item.longitude, item.endereco);
      }
      
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    }
  }

  // EVENTOS
  if (dados.secoes.eventos && dados.secoes.eventos.length > 0) {
    addSectionTitle(`Eventos (${dados.secoes.eventos.length})`);
    
    for (const item of dados.secoes.eventos) {
      checkNewPage(50);
      
      doc.setFillColor(253, 242, 248);
      doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 8, 1, 1, "F");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text(item.titulo || item.nome || "Sem título", margin + 3, yPosition + 5.5);
      
      yPosition += 12;
      
      addField("Data", formatarData(item.dataEvento || item.data));
      if (item.horaInicio) addField("Horário", `${item.horaInicio}${item.horaFim ? ` - ${item.horaFim}` : ""}`);
      if (item.local) addField("Local", item.local);
      if (item.organizador) addField("Organizador", item.organizador);
      
      if (item.descricao) {
        addSubtitle("Descrição");
        addText(item.descricao, 5);
      }
      
      if (item.imagemUrl || item.fotoUrl) {
        await addImage(item.imagemUrl || item.fotoUrl, 80, 50);
      }
      
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    }
  }

  // AVISOS
  if (dados.secoes.avisos && dados.secoes.avisos.length > 0) {
    addSectionTitle(`Avisos (${dados.secoes.avisos.length})`);
    
    const tableData = dados.secoes.avisos.map((item: any) => [
      formatarData(item.criadoEm),
      item.titulo || "-",
      item.conteudo?.substring(0, 100) + (item.conteudo?.length > 100 ? "..." : "") || "-",
      item.autor || "-",
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [["Data", "Título", "Conteúdo", "Autor"]],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [corPrimaria[0], corPrimaria[1], corPrimaria[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 40 },
        2: { cellWidth: "auto" },
        3: { cellWidth: 30 },
      },
    });
    
    // @ts-ignore
    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // VOTAÇÕES
  if (dados.secoes.votacoes && dados.secoes.votacoes.length > 0) {
    addSectionTitle(`Votações (${dados.secoes.votacoes.length})`);
    
    for (const item of dados.secoes.votacoes) {
      checkNewPage(60);
      
      doc.setFillColor(254, 249, 195);
      doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 8, 1, 1, "F");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text(item.titulo || "Sem título", margin + 3, yPosition + 5.5);
      
      // Status
      const isAtiva = item.status === "ativa" || item.ativa;
      doc.setFillColor(isAtiva ? corVerde[0] : corSecundaria[0], isAtiva ? corVerde[1] : corSecundaria[1], isAtiva ? corVerde[2] : corSecundaria[2]);
      doc.roundedRect(pageWidth - margin - 20, yPosition + 1.5, 17, 5, 1, 1, "F");
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(isAtiva ? "Ativa" : "Encerrada", pageWidth - margin - 11.5, yPosition + 5, { align: "center" });
      
      yPosition += 12;
      
      addField("Data", formatarData(item.criadoEm));
      addField("Total de Votos", String(item.totalVotos || 0));
      
      if (item.descricao) {
        addSubtitle("Descrição");
        addText(item.descricao, 5);
      }
      
      // Opções de voto com barras de progresso
      if (item.opcoes && item.opcoes.length > 0) {
        addSubtitle("Resultados");
        
        const totalVotos = item.opcoes.reduce((sum: number, op: any) => sum + (op.votos || 0), 0);
        
        for (const opcao of item.opcoes) {
          checkNewPage(12);
          
          const percentual = totalVotos > 0 ? ((opcao.votos || 0) / totalVotos) * 100 : 0;
          const barWidth = (pageWidth - margin * 2 - 50) * (percentual / 100);
          
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(60, 60, 60);
          doc.text(opcao.texto || opcao.opcao || "-", margin + 5, yPosition + 3);
          
          // Barra de fundo
          doc.setFillColor(230, 230, 230);
          doc.roundedRect(margin + 50, yPosition, pageWidth - margin * 2 - 70, 5, 1, 1, "F");
          
          // Barra de progresso
          if (barWidth > 0) {
            doc.setFillColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
            doc.roundedRect(margin + 50, yPosition, Math.max(barWidth, 2), 5, 1, 1, "F");
          }
          
          // Percentual
          doc.text(`${percentual.toFixed(1)}% (${opcao.votos || 0})`, pageWidth - margin - 15, yPosition + 3, { align: "right" });
          
          yPosition += 8;
        }
      }
      
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    }
  }

  // USUÁRIOS
  if (dados.secoes.moradores && dados.secoes.moradores.length > 0) {
    addSectionTitle(`Usuários (${dados.secoes.moradores.length})`);
    
    const tableData = dados.secoes.moradores.map((item: any) => [
      item.nome || "-",
      item.bloco ? `${item.bloco}/${item.apartamento}` : item.apartamento || "-",
      item.tipo || "-",
      item.telefone || "-",
      item.email || "-",
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [["Nome", "Unidade", "Tipo", "Telefone", "Email"]],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [corPrimaria[0], corPrimaria[1], corPrimaria[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    
    // @ts-ignore
    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // FUNCIONÁRIOS
  if (dados.secoes.funcionarios && dados.secoes.funcionarios.length > 0) {
    addSectionTitle(`Funcionários (${dados.secoes.funcionarios.length})`);
    
    const tableData = dados.secoes.funcionarios.map((item: any) => [
      item.nome || "-",
      item.cargo || "-",
      item.departamento || "-",
      item.telefone || "-",
      item.email || "-",
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [["Nome", "Cargo", "Departamento", "Telefone", "Email"]],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [corPrimaria[0], corPrimaria[1], corPrimaria[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    
    // @ts-ignore
    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // COMUNICADOS
  if (dados.secoes.comunicados && dados.secoes.comunicados.length > 0) {
    addSectionTitle(`Comunicados (${dados.secoes.comunicados.length})`);
    
    for (const item of dados.secoes.comunicados) {
      checkNewPage(40);
      
      doc.setFillColor(240, 249, 255);
      doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 8, 1, 1, "F");
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(33, 33, 33);
      doc.text(item.titulo || "Sem título", margin + 3, yPosition + 5.5);
      
      yPosition += 12;
      
      addField("Data", formatarData(item.criadoEm));
      if (item.autor) addField("Autor", item.autor);
      
      if (item.descricao || item.conteudo) {
        addSubtitle("Conteúdo");
        addText(item.descricao || item.conteudo, 5);
      }
      
      if (item.anexoUrl) {
        doc.setFontSize(8);
        doc.setTextColor(corPrimaria[0], corPrimaria[1], corPrimaria[2]);
        doc.text(`📎 Anexo: ${item.anexoNome || "Documento"}`, margin + 5, yPosition);
        yPosition += 6;
      }
      
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 8;
    }
  }

  // REALIZAÇÕES, MELHORIAS, AQUISIÇÕES (formato similar)
  const secoesGaleria = [
    { key: "realizacoes", titulo: "Realizações", cor: [240, 253, 244] },
    { key: "melhorias", titulo: "Melhorias", cor: [254, 249, 195] },
    { key: "aquisicoes", titulo: "Aquisições", cor: [239, 246, 255] },
  ];

  for (const secao of secoesGaleria) {
    if (dados.secoes[secao.key] && dados.secoes[secao.key].length > 0) {
      addSectionTitle(`${secao.titulo} (${dados.secoes[secao.key].length})`);
      
      for (const item of dados.secoes[secao.key]) {
        checkNewPage(50);
        
        doc.setFillColor(secao.cor[0], secao.cor[1], secao.cor[2]);
        doc.roundedRect(margin, yPosition, pageWidth - margin * 2, 8, 1, 1, "F");
        
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(33, 33, 33);
        doc.text(item.titulo || "Sem título", margin + 3, yPosition + 5.5);
        
        yPosition += 12;
        
        addField("Data", formatarData(item.data || item.criadoEm));
        if (item.valor) addField("Valor", `R$ ${item.valor}`);
        
        if (item.descricao) {
          addSubtitle("Descrição");
          addText(item.descricao, 5);
        }
        
        if (item.imagens && item.imagens.length > 0) {
          await addImageGallery(item.imagens);
        } else if (item.imagemUrl) {
          await addImage(item.imagemUrl, 80, 50);
        }
        
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      }
    }
  }

  // TELEFONES ÚTEIS
  if (dados.secoes.telefonesUteis && dados.secoes.telefonesUteis.length > 0) {
    addSectionTitle(`Telefones Úteis (${dados.secoes.telefonesUteis.length})`);
    
    const tableData = dados.secoes.telefonesUteis.map((item: any) => [
      item.nome || "-",
      item.telefone || "-",
      item.categoria || "-",
      item.observacao || "-",
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [["Nome", "Telefone", "Categoria", "Observação"]],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [corPrimaria[0], corPrimaria[1], corPrimaria[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    
    // @ts-ignore
    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // LINKS ÚTEIS
  if (dados.secoes.linksUteis && dados.secoes.linksUteis.length > 0) {
    addSectionTitle(`Links Úteis (${dados.secoes.linksUteis.length})`);
    
    const tableData = dados.secoes.linksUteis.map((item: any) => [
      item.titulo || "-",
      item.url || "-",
      item.categoria || "-",
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [["Título", "URL", "Categoria"]],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [corPrimaria[0], corPrimaria[1], corPrimaria[2]],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
    
    // @ts-ignore
    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // Adicionar rodapé na última página
  addFooter();

  // Salvar o PDF
  const nomeArquivo = `${config.nomeRelatorio?.toLowerCase().replace(/\s+/g, "_") || "relatorio"}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(nomeArquivo);
}
