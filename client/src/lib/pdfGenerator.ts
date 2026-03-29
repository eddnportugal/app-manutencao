// Utilitário para geração de PDF Premium usando a API do navegador
// Usa window.print() com layout profissional e branding do cliente

// Converte uma URL de imagem para base64 data URL (embute no HTML para funcionar no print window)
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    // Se já é base64/data URL, retorna direto
    if (url.startsWith('data:')) return url;
    
    // Para URLs relativas, converte em absolutas usando a origem atual
    const absoluteUrl = url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    
    // Tentar fetch com CORS
    try {
      const response = await fetch(absoluteUrl, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(absoluteUrl);
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      // fetch com CORS falhou, tentar via canvas
    }
    
    // Fallback: carregar via <img> + canvas (funciona sem CORS para exibição)
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(absoluteUrl);
          }
        } catch {
          resolve(absoluteUrl);
        }
      };
      img.onerror = () => resolve(absoluteUrl);
      img.src = absoluteUrl;
    });
  } catch {
    return url; // fallback para URL original em caso de erro
  }
}

// Pré-carrega todas as imagens convertendo para base64 inline
async function preloadImagesToBase64(images: { url: string; legenda?: string | null }[]): Promise<{ url: string; legenda?: string | null }[]> {
  if (!images || images.length === 0) return [];
  const results = await Promise.all(
    images.map(async (img) => ({
      ...img,
      url: await imageUrlToBase64(img.url),
    }))
  );
  return results;
}

// Pré-carrega logo convertendo para base64
async function preloadLogo(logoUrl?: string): Promise<string | undefined> {
  if (!logoUrl) return undefined;
  const base64 = await imageUrlToBase64(logoUrl);
  return base64;
}

interface PDFOptions {
  title: string;
  subtitle?: string;
  protocolo?: string;
  data?: string;
  logoUrl?: string;
  companyName?: string;
  accentColor?: string;
  icon?: string;
  reportType?: string;
}

// Cores por tipo de relatório
const REPORT_COLORS: Record<string, string> = {
  vistoria: '#0d9488',
  manutencao: '#f59e0b',
  ocorrencia: '#ef4444',
  checklist: '#7c3aed',
  antes_depois: '#3b82f6',
  default: '#0d9488',
};

const REPORT_ICONS: Record<string, string> = {
  vistoria: '📋',
  manutencao: '🔧',
  ocorrencia: '⚠️',
  checklist: '☑️',
  antes_depois: '🔄',
  default: '📄',
};

export function generatePrintableHTML(content: string, options: PDFOptions): string {
  const cor = options.accentColor || REPORT_COLORS[options.reportType || ''] || REPORT_COLORS.default;
  const icon = options.icon || REPORT_ICONS[options.reportType || ''] || REPORT_ICONS.default;
  const companyName = options.companyName || '';
  const logoUrl = options.logoUrl || '';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>${options.title}</title>
      <style>
        @page { margin: 18mm 15mm; size: A4; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
          color: #1f2937; background: #fff; font-size: 13px; line-height: 1.5;
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }

        /* ===== COMPANY HEADER (LOGO DO CLIENTE) ===== */
        .company-header {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 0; margin-bottom: 18px;
          border-bottom: 2px solid #e2e8f0;
        }
        .company-logo {
          width: 56px; height: 56px; object-fit: contain; border-radius: 8px;
          border: 1px solid #e2e8f0;
        }
        .company-name {
          font-size: 16px; font-weight: 700; color: #1e293b; letter-spacing: -0.3px;
        }
        .company-subtitle {
          font-size: 10px; color: #94a3b8; text-transform: uppercase;
          letter-spacing: 0.5px; margin-top: 2px;
        }

        /* ===== REPORT HEADER ===== */
        .report-header {
          display: flex; align-items: center; gap: 16px;
          padding: 20px 24px; margin-bottom: 24px;
          background: linear-gradient(135deg, ${cor}, ${cor}dd);
          border-radius: 12px; color: #fff;
        }
        .report-header .icon-box {
          width: 48px; height: 48px; background: rgba(255,255,255,0.2);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          font-size: 22px; flex-shrink: 0;
        }
        .report-header .header-text h1 { font-size: 18px; font-weight: 700; letter-spacing: -0.3px; }
        .report-header .header-text .proto {
          font-size: 11px; opacity: 0.85; font-family: 'Consolas', 'Courier New', monospace;
          margin-top: 2px;
        }
        .report-header .header-badge {
          margin-left: auto; background: rgba(255,255,255,0.2);
          padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 600;
          letter-spacing: 0.3px; flex-shrink: 0;
        }

        /* ===== INFO GRID ===== */
        .info-grid {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 20px;
        }
        .info-grid.cols-4 { grid-template-columns: repeat(4, 1fr); }
        .info-card {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
          padding: 12px 14px; text-align: center;
        }
        .info-label {
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.8px; color: #94a3b8; margin-bottom: 4px;
        }
        .info-value { font-size: 13px; font-weight: 600; color: #334155; }
        .info-value.mono { font-family: 'Consolas', 'Courier New', monospace; font-size: 12px; }
        .priority-dot {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%;
          margin-right: 5px; vertical-align: middle;
        }

        /* ===== FIELD SECTIONS ===== */
        .field-section { margin-bottom: 18px; }
        .field-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.6px; color: #64748b; margin-bottom: 6px;
        }
        .field-content {
          font-size: 13px; color: #374151; padding: 10px 14px;
          background: #f8fafc; border-radius: 8px;
          border-left: 3px solid ${cor};
        }
        .field-content.desc { white-space: pre-wrap; }
        .coords {
          font-size: 10px; color: #94a3b8; font-family: 'Consolas', monospace; margin-top: 4px;
        }

        /* ===== STATUS ===== */
        .status-badge {
          display: inline-block; padding: 5px 16px; border-radius: 20px;
          font-size: 12px; font-weight: 600;
        }
        .status-pendente { background: #fef3c7; color: #92400e; border: 1px solid #fbbf24; }
        .status-realizada { background: #dbeafe; color: #1e40af; border: 1px solid #93c5fd; }
        .status-em_andamento { background: #e0f2fe; color: #0369a1; border: 1px solid #7dd3fc; }
        .status-acao_necessaria { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
        .status-finalizada { background: #d1fae5; color: #065f46; border: 1px solid #6ee7b7; }
        .status-reaberta { background: #ffedd5; color: #9a3412; border: 1px solid #fdba74; }

        /* ===== SECTION ===== */
        .section { margin-bottom: 20px; }
        .section-title {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.6px; color: #64748b; margin-bottom: 8px;
          padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;
        }

        /* ===== IMAGES ===== */
        .img-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
        }
        .img-card {
          border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;
          background: #f8fafc;
        }
        .img-card img {
          width: 100%; aspect-ratio: 1 / 1; object-fit: cover; display: block;
        }
        .img-caption {
          font-size: 11px; color: #334155; padding: 8px 10px;
          text-align: left; border-top: 1px solid #e2e8f0;
          line-height: 1.4; word-break: break-word;
          background: #f8fafc;
        }

        /* ===== TIMELINE ===== */
        .timeline { margin-top: 10px; }
        .timeline-item {
          position: relative; padding-left: 25px; padding-bottom: 15px;
          border-left: 2px solid #e2e8f0;
        }
        .timeline-item:last-child { border-left: 2px solid transparent; }
        .timeline-item::before {
          content: ''; position: absolute; left: -6px; top: 0;
          width: 10px; height: 10px; border-radius: 50%; background: ${cor};
        }
        .timeline-date { font-size: 10px; color: #94a3b8; }
        .timeline-desc { font-size: 12px; margin-top: 2px; color: #334155; }

        /* ===== CHECKLIST ===== */
        .checklist-box {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 12px 14px;
        }
        .check-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 5px 0; border-bottom: 1px solid #f1f5f9;
        }
        .check-item:last-child { border-bottom: none; }
        .check-icon {
          width: 18px; height: 18px; border-radius: 4px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: #fff; font-weight: 700; margin-top: 1px;
        }
        .check-text { font-size: 12px; color: #334155; flex: 1; }
        .check-text.check-done { color: #94a3b8; text-decoration: line-through; }

        /* ===== DATES ===== */
        .dates-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
        }
        .date-card {
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
          padding: 10px 14px; text-align: center; border-top: 3px solid #e2e8f0;
        }
        .date-label {
          font-size: 9px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.5px; color: #94a3b8; margin-bottom: 3px;
        }
        .date-value { font-size: 14px; font-weight: 700; color: #1e293b; }
        .date-time { font-size: 11px; color: #64748b; margin-top: 1px; }

        /* ===== LOCATION ===== */
        .location-section {
          display: flex; gap: 20px; align-items: flex-start;
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 10px; padding: 14px;
        }
        .location-section img {
          max-width: 280px; border-radius: 8px; border: 1px solid #e2e8f0;
        }
        .location-links a {
          color: ${cor}; text-decoration: underline; font-size: 12px;
        }

        /* ===== TABLE ===== */
        table {
          width: 100%; border-collapse: collapse; margin-top: 10px;
        }
        th, td {
          padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0;
        }
        th {
          background: #f8fafc; font-weight: 700; font-size: 10px;
          text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;
        }

        /* ===== FOOTER ===== */
        .report-footer {
          margin-top: 28px; padding-top: 14px;
          border-top: 2px solid ${cor}30;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 10px; color: #94a3b8;
        }
        .report-footer .brand { font-weight: 600; color: ${cor}; }

        /* ===== PRINT TWEAKS ===== */
        @media print {
          body { padding: 0; }
          .report-header { break-inside: avoid; page-break-inside: avoid; }
          .info-grid { break-inside: avoid; page-break-inside: avoid; }
          .field-section { break-inside: avoid; page-break-inside: avoid; }
          .img-grid { break-inside: avoid; page-break-inside: avoid; }
          .img-card { break-inside: avoid; page-break-inside: avoid; }
          .img-card img { height: auto; aspect-ratio: 1 / 1; break-inside: avoid; }
          .no-print { display: none; }
          .section { break-inside: avoid; page-break-inside: avoid; }
          .section-title { break-after: avoid; page-break-after: avoid; }
          .checklist-box { break-inside: avoid; page-break-inside: avoid; }
          .check-item { break-inside: avoid; page-break-inside: avoid; }
          .timeline-item { break-inside: avoid; page-break-inside: avoid; }
          .company-header { break-inside: avoid; page-break-inside: avoid; }
          .dates-grid { break-inside: avoid; page-break-inside: avoid; }
          .date-card { break-inside: avoid; page-break-inside: avoid; }
          .location-section { break-inside: avoid; page-break-inside: avoid; }
          table { break-inside: auto; }
          tr { break-inside: avoid; page-break-inside: avoid; }
          thead { display: table-header-group; }
          h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
        }
      </style>
    </head>
    <body>
      ${logoUrl || companyName ? `
      <div class="company-header">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="company-logo" onerror="this.style.display='none'" />` : ''}
        <div>
          ${companyName ? `<div class="company-name">${companyName}</div>` : ''}
          <div class="company-subtitle">Relatório ${options.reportType ? 'de ' + (options.reportType === 'vistoria' ? 'Vistoria' : options.reportType === 'manutencao' ? 'Manutenção' : options.reportType === 'ocorrencia' ? 'Ocorrência' : options.reportType === 'checklist' ? 'Checklist' : options.reportType === 'antes_depois' ? 'Antes e Depois' : '') : ''}</div>
        </div>
      </div>
      ` : ''}
      <div class="report-header">
        <div class="icon-box">${icon}</div>
        <div class="header-text">
          <h1>${options.title}</h1>
          ${options.protocolo ? `<div class="proto">Protocolo: ${options.protocolo}</div>` : ''}
        </div>
        ${options.subtitle ? `<div class="header-badge">${options.subtitle.toUpperCase()}</div>` : ''}
      </div>
      ${content}
      <div class="report-footer">
        <span class="brand">${companyName || 'App Manutenção'}</span>
        <span>Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </body>
    </html>
  `;
}

export function openPrintWindow(html: string) {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    
    // Aguardar todas as imagens carregarem antes de imprimir
    const images = printWindow.document.querySelectorAll('img');
    if (images.length === 0) {
      setTimeout(() => printWindow.print(), 300);
      return;
    }
    
    let loaded = 0;
    const total = images.length;
    const maxWait = 15000; // máximo 15s
    
    const tryPrint = () => {
      loaded++;
      if (loaded >= total) {
        setTimeout(() => printWindow.print(), 300);
      }
    };
    
    images.forEach((img) => {
      if (img.complete && img.naturalHeight > 0) {
        tryPrint();
      } else {
        img.addEventListener('load', tryPrint);
        img.addEventListener('error', tryPrint);
      }
    });
    
    // Fallback: imprimir mesmo se imagens não carregarem a tempo
    setTimeout(() => {
      if (loaded < total) {
        printWindow.print();
      }
    }, maxWait);
  }
}

// Formatar status para exibição
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pendente: 'Pendente',
    realizada: 'Realizada',
    acao_necessaria: 'Ação Necessária',
    finalizada: 'Finalizada',
    reaberta: 'Reaberta',
    rascunho: 'Rascunho',
  };
  return statusMap[status] || status;
}

// Formatar prioridade para exibição
export function formatPrioridade(prioridade: string): string {
  const prioridadeMap: Record<string, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente',
  };
  return prioridadeMap[prioridade] || prioridade;
}

// Formatar data
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Gerar conteúdo de informações básicas (premium info cards)
export function generateInfoSection(data: Record<string, any>): string {
  const items = Object.entries(data)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `
      <div class="info-card">
        <div class="info-label">${key}</div>
        <div class="info-value">${value}</div>
      </div>
    `)
    .join('');
  
  return `<div class="info-grid">${items}</div>`;
}

// Gerar timeline HTML (premium)
export function generateTimelineHTML(events: any[]): string {
  if (events.length === 0) return '<p style="color:#94a3b8;font-size:12px;">Nenhum evento registrado</p>';
  
  return `
    <div class="timeline">
      ${events.map(event => `
        <div class="timeline-item">
          <div class="timeline-date">${formatDateTime(event.createdAt)}</div>
          <div class="timeline-desc">${event.descricao}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// Gerar galeria de imagens HTML (premium cards)
export function generateImagesHTML(images: { url: string; legenda?: string | null }[]): string {
  if (images.length === 0) return '<p style="color:#94a3b8;font-size:12px;">Nenhuma imagem</p>';
  
  return `
    <div class="img-grid">
      ${images.map((img, i) => `
        <div class="img-card">
          <img src="${img.url}" alt="Imagem ${i + 1}" crossorigin="anonymous" onerror="this.alt='Imagem ${i + 1} (não carregou)';this.style.minHeight='80px';this.style.background='#f1f5f9';this.style.display='flex';this.style.padding='20px';" />
          ${img.legenda ? `<div class="img-caption">${img.legenda}</div>` : ''}
        </div>
      `).join('')}
    </div>
  `;
}

// Gerar seção de assinaturas digitais para PDF
export function generateSignaturesHTML(data: { assinaturaTecnico?: string | null; assinaturaSolicitante?: string | null }): string {
  if (!data.assinaturaTecnico && !data.assinaturaSolicitante) return '';
  
  let html = `
    <div class="field-section" style="page-break-inside: avoid;">
      <div class="field-label">✍️ Assinaturas Digitais</div>
      <div style="display: flex; gap: 32px; justify-content: center; margin-top: 12px;">
  `;
  
  if (data.assinaturaTecnico) {
    html += `
      <div style="text-align: center; flex: 1;">
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; background: #fafafa;">
          <img src="${data.assinaturaTecnico}" style="max-width: 280px; max-height: 120px; display: block; margin: 0 auto;" />
        </div>
        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #d1d5db; font-size: 11px; color: #6b7280; font-weight: 500;">
          Assinatura do Funcionário
        </div>
      </div>
    `;
  }
  
  if (data.assinaturaSolicitante) {
    html += `
      <div style="text-align: center; flex: 1;">
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; background: #fafafa;">
          <img src="${data.assinaturaSolicitante}" style="max-width: 280px; max-height: 120px; display: block; margin: 0 auto;" />
        </div>
        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #d1d5db; font-size: 11px; color: #6b7280; font-weight: 500;">
          Assinatura do Solicitante
        </div>
      </div>
    `;
  }
  
  html += `
      </div>
    </div>
  `;
  
  return html;
}

// Gerar URL do mapa estático OpenStreetMap
export function getStaticMapUrl(latitude: number, longitude: number, zoom: number = 16): string {
  // Usa OpenStreetMap Static Maps API (gratuito)
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${latitude},${longitude}&zoom=${zoom}&size=400x200&maptype=mapnik&markers=${latitude},${longitude},red-pushpin`;
}

// Gerar seção de localização com mapa para PDF (premium)
export function generateLocationSection(data: {
  latitude?: number | null;
  longitude?: number | null;
  endereco?: string | null;
}): string {
  if (!data.latitude || !data.longitude) {
    return '';
  }
  
  const mapUrl = getStaticMapUrl(data.latitude, data.longitude);
  const googleMapsUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}#map=16/${data.latitude}/${data.longitude}`;
  
  return `
    <div class="field-section">
      <div class="field-label">🗺️ Localização GPS</div>
      <div class="location-section">
        <div style="flex: 1;">
          <img src="${mapUrl}" alt="Mapa da localização" />
        </div>
        <div style="flex: 1;">
          <div class="info-card" style="margin-bottom: 10px; text-align: left;">
            <div class="info-label">Coordenadas</div>
            <div class="info-value mono">${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}</div>
          </div>
          ${data.endereco ? `
            <div class="info-card" style="margin-bottom: 10px; text-align: left;">
              <div class="info-label">Endereço</div>
              <div class="info-value" style="font-size:12px;">${data.endereco}</div>
            </div>
          ` : ''}
          <div class="location-links" style="margin-top: 12px; font-size: 12px;">
            <p style="margin-bottom: 4px;"><strong style="color:#64748b;">Ver no mapa:</strong></p>
            <p><a href="${googleMapsUrl}" target="_blank">Abrir no Google Maps</a></p>
            <p><a href="${osmUrl}" target="_blank">Abrir no OpenStreetMap</a></p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Gerar checklist HTML (premium)
export function generateChecklistHTML(items: { descricao: string; completo: boolean | null }[]): string {
  if (items.length === 0) return '<p style="color:#94a3b8;font-size:12px;">Nenhum item</p>';
  
  const concluidos = items.filter(i => i.completo).length;
  
  return `
    <div class="checklist-box">
      ${items.map(item => {
        const icon = item.completo ? '✓' : '';
        const bgColor = item.completo ? '#22c55e' : '#d1d5db';
        const textClass = item.completo ? 'check-done' : '';
        return `
          <div class="check-item">
            <div class="check-icon" style="background:${bgColor}">${icon}</div>
            <div class="check-text ${textClass}">${item.descricao}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// Branding options for reports
interface BrandingOptions {
  logoUrl?: string;
  companyName?: string;
}

// Obter cor da prioridade
function getPrioridadeCor(prioridade: string): string {
  const cores: Record<string, string> = {
    urgente: '#EF4444', alta: '#F97316', media: '#6B7280', baixa: '#3B82F6',
  };
  return cores[prioridade] || '#6B7280';
}

// Gerar relatório completo de vistoria (PREMIUM)
export async function generateVistoriaReport(vistoria: any, timeline: any[], imagens: any[], branding?: BrandingOptions): Promise<void> {
  const cor = REPORT_COLORS.vistoria;
  const prioridadeCor = getPrioridadeCor(vistoria.prioridade || 'media');

  // Pré-carregar imagens e logo como base64 para funcionar no print window
  const imagensBase64 = await preloadImagesToBase64(imagens);
  const logoBase64 = await preloadLogo(branding?.logoUrl);

  let content = '';

  // Info grid
  content += `
    <div class="info-grid cols-4">
      <div class="info-card">
        <div class="info-label">Status</div>
        <div class="info-value"><span class="status-badge status-${vistoria.status}">${formatStatus(vistoria.status)}</span></div>
      </div>
      <div class="info-card">
        <div class="info-label">Prioridade</div>
        <div class="info-value"><span class="priority-dot" style="background:${prioridadeCor}"></span>${formatPrioridade(vistoria.prioridade || 'media')}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Responsável</div>
        <div class="info-value">${vistoria.responsavelNome || '-'}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Tipo</div>
        <div class="info-value">${vistoria.tipo || '-'}</div>
      </div>
    </div>
  `;

  // Localização
  if (vistoria.localizacao) {
    content += `
      <div class="field-section">
        <div class="field-label">📍 Local</div>
        <div class="field-content" style="border-left-color:${cor}">${vistoria.localizacao}</div>
      </div>
    `;
  }

  // Descrição
  if (vistoria.descricao) {
    content += `
      <div class="field-section">
        <div class="field-label">📝 Descrição</div>
        <div class="field-content desc" style="border-left-color:${cor}">${vistoria.descricao}</div>
      </div>
    `;
  }

  // Observações
  if (vistoria.observacoes) {
    content += `
      <div class="field-section">
        <div class="field-label">📋 Observações</div>
        <div class="field-content desc" style="border-left-color:${cor}">${vistoria.observacoes}</div>
      </div>
    `;
  }

  // Localização GPS
  content += generateLocationSection({
    latitude: vistoria.latitude,
    longitude: vistoria.longitude,
    endereco: vistoria.endereco,
  });

  // Imagens
  if (imagensBase64.length > 0) {
    content += `
      <div class="field-section">
        <div class="field-label">🖼️ Imagens (${imagensBase64.length})</div>
        ${generateImagesHTML(imagensBase64)}
      </div>
    `;
  }

  // Datas
  content += generateDatesSection(vistoria, cor);

  // Timeline
  if (timeline.length > 0) {
    content += `
      <div class="field-section">
        <div class="field-label">📅 Timeline de Eventos</div>
        ${generateTimelineHTML(timeline)}
      </div>
    `;
  }
  
  // Assinaturas digitais
  content += generateSignaturesHTML(vistoria);
  
  const html = generatePrintableHTML(content, {
    title: vistoria.titulo,
    subtitle: formatStatus(vistoria.status),
    protocolo: vistoria.protocolo,
    logoUrl: logoBase64 || branding?.logoUrl,
    companyName: branding?.companyName,
    accentColor: cor,
    reportType: 'vistoria',
  });
  
  openPrintWindow(html);
}

// Helper: Gerar seção de datas premium
function generateDatesSection(item: any, cor: string): string {
  let datasHtml = `
    <div class="date-card">
      <div class="date-label">Criado em</div>
      <div class="date-value">${formatDate(item.createdAt)}</div>
      <div class="date-time">${formatTime(item.createdAt)}</div>
    </div>
  `;
  if (item.dataAgendada) {
    datasHtml += `
      <div class="date-card" style="border-top-color:${cor}">
        <div class="date-label" style="color:${cor}">Agendado</div>
        <div class="date-value">${formatDate(item.dataAgendada)}</div>
        <div class="date-time">${formatTime(item.dataAgendada)}</div>
      </div>
    `;
  }
  if (item.dataRealizada) {
    datasHtml += `
      <div class="date-card" style="border-top-color:#22c55e">
        <div class="date-label" style="color:#22c55e">Realizado</div>
        <div class="date-value">${formatDate(item.dataRealizada)}</div>
        <div class="date-time">${formatTime(item.dataRealizada)}</div>
      </div>
    `;
  }
  return `
    <div class="field-section">
      <div class="field-label">📅 Datas</div>
      <div class="dates-grid">${datasHtml}</div>
    </div>
  `;
}

// Helper: Formatar apenas hora
function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Gerar relatório completo de manutenção (PREMIUM)
export async function generateManutencaoReport(manutencao: any, timeline: any[], imagens: any[], branding?: BrandingOptions): Promise<void> {
  const cor = REPORT_COLORS.manutencao;
  const prioridadeCor = getPrioridadeCor(manutencao.prioridade || 'media');

  // Pré-carregar imagens e logo como base64
  const imagensBase64 = await preloadImagesToBase64(imagens);
  const logoBase64 = await preloadLogo(branding?.logoUrl);
  const tipoLabels: Record<string, string> = {
    preventiva: 'Preventiva', corretiva: 'Corretiva',
    emergencial: 'Emergencial', programada: 'Programada',
  };

  let content = '';

  // Info grid
  content += `
    <div class="info-grid cols-4">
      <div class="info-card">
        <div class="info-label">Status</div>
        <div class="info-value"><span class="status-badge status-${manutencao.status}">${formatStatus(manutencao.status)}</span></div>
      </div>
      <div class="info-card">
        <div class="info-label">Tipo</div>
        <div class="info-value" style="color:${cor}">${tipoLabels[manutencao.tipo] || manutencao.tipo || '-'}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Prioridade</div>
        <div class="info-value"><span class="priority-dot" style="background:${prioridadeCor}"></span>${formatPrioridade(manutencao.prioridade || 'media')}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Responsável</div>
        <div class="info-value">${manutencao.responsavelNome || '-'}</div>
      </div>
    </div>
  `;

  // Localização
  if (manutencao.localizacao) {
    content += `
      <div class="field-section">
        <div class="field-label">📍 Local</div>
        <div class="field-content" style="border-left-color:${cor}">${manutencao.localizacao}</div>
      </div>
    `;
  }

  // Fornecedor e Custos
  if (manutencao.fornecedor || manutencao.custoEstimado || manutencao.custoReal) {
    content += `
      <div class="info-grid">
        ${manutencao.fornecedor ? `<div class="info-card"><div class="info-label">Fornecedor</div><div class="info-value">${manutencao.fornecedor}</div></div>` : ''}
        ${manutencao.custoEstimado ? `<div class="info-card"><div class="info-label">Custo Estimado</div><div class="info-value">R$ ${manutencao.custoEstimado}</div></div>` : ''}
        ${manutencao.custoReal ? `<div class="info-card"><div class="info-label">Custo Real</div><div class="info-value">R$ ${manutencao.custoReal}</div></div>` : ''}
      </div>
    `;
  }

  // Descrição
  if (manutencao.descricao) {
    content += `
      <div class="field-section">
        <div class="field-label">📝 Descrição</div>
        <div class="field-content desc" style="border-left-color:${cor}">${manutencao.descricao}</div>
      </div>
    `;
  }

  // Localização GPS
  content += generateLocationSection({
    latitude: manutencao.latitude,
    longitude: manutencao.longitude,
    endereco: manutencao.endereco,
  });

  // Imagens
  if (imagensBase64.length > 0) {
    content += `
      <div class="field-section">
        <div class="field-label">🖼️ Imagens (${imagensBase64.length})</div>
        ${generateImagesHTML(imagensBase64)}
      </div>
    `;
  }

  // Datas
  content += generateDatesSection(manutencao, cor);

  // Timeline
  if (timeline.length > 0) {
    content += `
      <div class="field-section">
        <div class="field-label">📅 Timeline de Eventos</div>
        ${generateTimelineHTML(timeline)}
      </div>
    `;
  }
  
  // Assinaturas digitais
  content += generateSignaturesHTML(manutencao);
  
  const html = generatePrintableHTML(content, {
    title: manutencao.titulo,
    subtitle: formatStatus(manutencao.status),
    protocolo: manutencao.protocolo,
    logoUrl: logoBase64 || branding?.logoUrl,
    companyName: branding?.companyName,
    accentColor: cor,
    reportType: 'manutencao',
  });
  
  openPrintWindow(html);
}

// Gerar relatório completo de ocorrência (PREMIUM)
export async function generateOcorrenciaReport(ocorrencia: any, timeline: any[], imagens: any[], branding?: BrandingOptions): Promise<void> {
  const cor = REPORT_COLORS.ocorrencia;
  const prioridadeCor = getPrioridadeCor(ocorrencia.prioridade || 'media');

  // Pré-carregar imagens e logo como base64
  const imagensBase64 = await preloadImagesToBase64(imagens);
  const logoBase64 = await preloadLogo(branding?.logoUrl);

  const categoriaLabels: Record<string, string> = {
    seguranca: 'Segurança', barulho: 'Barulho', manutencao: 'Manutenção',
    convivencia: 'Convivência', animais: 'Animais', estacionamento: 'Estacionamento',
    limpeza: 'Limpeza', outros: 'Outros',
  };

  let content = '';

  // Info grid
  content += `
    <div class="info-grid cols-4">
      <div class="info-card">
        <div class="info-label">Status</div>
        <div class="info-value"><span class="status-badge status-${ocorrencia.status}">${formatStatus(ocorrencia.status)}</span></div>
      </div>
      <div class="info-card">
        <div class="info-label">Categoria</div>
        <div class="info-value" style="color:${cor}">${categoriaLabels[ocorrencia.categoria] || ocorrencia.categoria || '-'}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Prioridade</div>
        <div class="info-value"><span class="priority-dot" style="background:${prioridadeCor}"></span>${formatPrioridade(ocorrencia.prioridade || 'media')}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Responsável</div>
        <div class="info-value">${ocorrencia.responsavelNome || '-'}</div>
      </div>
    </div>
  `;

  // Reportado por
  if (ocorrencia.reportadoPorNome) {
    content += `
      <div class="field-section">
        <div class="field-label">👤 Reportado por</div>
        <div class="field-content" style="border-left-color:${cor}">${ocorrencia.reportadoPorNome}</div>
      </div>
    `;
  }

  // Localização
  if (ocorrencia.localizacao) {
    content += `
      <div class="field-section">
        <div class="field-label">📍 Local</div>
        <div class="field-content" style="border-left-color:${cor}">${ocorrencia.localizacao}</div>
      </div>
    `;
  }

  // Descrição
  if (ocorrencia.descricao) {
    content += `
      <div class="field-section">
        <div class="field-label">📝 Descrição</div>
        <div class="field-content desc" style="border-left-color:${cor}">${ocorrencia.descricao}</div>
      </div>
    `;
  }

  // Localização GPS
  content += generateLocationSection({
    latitude: ocorrencia.latitude,
    longitude: ocorrencia.longitude,
    endereco: ocorrencia.endereco,
  });

  // Evidências
  if (imagensBase64.length > 0) {
    content += `
      <div class="field-section">
        <div class="field-label">🖼️ Evidências (${imagensBase64.length})</div>
        ${generateImagesHTML(imagensBase64)}
      </div>
    `;
  }

  // Datas
  let datasHtml = `
    <div class="date-card">
      <div class="date-label">Registrado em</div>
      <div class="date-value">${formatDate(ocorrencia.createdAt)}</div>
      <div class="date-time">${formatTime(ocorrencia.createdAt)}</div>
    </div>
  `;
  if (ocorrencia.dataOcorrencia) {
    datasHtml += `
      <div class="date-card" style="border-top-color:${cor}">
        <div class="date-label" style="color:${cor}">Data da Ocorrência</div>
        <div class="date-value">${formatDate(ocorrencia.dataOcorrencia)}</div>
        <div class="date-time">${formatTime(ocorrencia.dataOcorrencia)}</div>
      </div>
    `;
  }
  content += `
    <div class="field-section">
      <div class="field-label">📅 Datas</div>
      <div class="dates-grid">${datasHtml}</div>
    </div>
  `;

  // Timeline
  if (timeline.length > 0) {
    content += `
      <div class="field-section">
        <div class="field-label">📋 Timeline de Eventos</div>
        ${generateTimelineHTML(timeline)}
      </div>
    `;
  }
  
  // Assinaturas digitais
  content += generateSignaturesHTML(ocorrencia);
  
  const html = generatePrintableHTML(content, {
    title: ocorrencia.titulo,
    subtitle: formatStatus(ocorrencia.status),
    protocolo: ocorrencia.protocolo,
    logoUrl: logoBase64 || branding?.logoUrl,
    companyName: branding?.companyName,
    accentColor: cor,
    reportType: 'ocorrencia',
  });
  
  openPrintWindow(html);
}

// Gerar relatório completo de checklist (PREMIUM)
export async function generateChecklistReport(checklist: any, timeline: any[], imagens: any[], itens: any[], branding?: BrandingOptions): Promise<void> {
  const cor = REPORT_COLORS.checklist;
  const prioridadeCor = getPrioridadeCor(checklist.prioridade || 'media');

  // Pré-carregar imagens e logo como base64
  const imagensBase64 = await preloadImagesToBase64(imagens);
  const logoBase64 = await preloadLogo(branding?.logoUrl);

  const totalItens = itens.length;
  const itensCompletos = itens.filter((i: any) => i.completo).length;
  const progresso = totalItens > 0 ? Math.round((itensCompletos / totalItens) * 100) : 0;

  let content = '';

  // Info grid
  content += `
    <div class="info-grid cols-4">
      <div class="info-card">
        <div class="info-label">Status</div>
        <div class="info-value"><span class="status-badge status-${checklist.status}">${formatStatus(checklist.status)}</span></div>
      </div>
      <div class="info-card">
        <div class="info-label">Progresso</div>
        <div class="info-value" style="color:${cor}">${progresso}% (${itensCompletos}/${totalItens})</div>
      </div>
      <div class="info-card">
        <div class="info-label">Prioridade</div>
        <div class="info-value"><span class="priority-dot" style="background:${prioridadeCor}"></span>${formatPrioridade(checklist.prioridade || 'media')}</div>
      </div>
      <div class="info-card">
        <div class="info-label">Responsável</div>
        <div class="info-value">${checklist.responsavelNome || '-'}</div>
      </div>
    </div>
  `;

  // Localização
  if (checklist.localizacao) {
    content += `
      <div class="field-section">
        <div class="field-label">📍 Local</div>
        <div class="field-content" style="border-left-color:${cor}">${checklist.localizacao}</div>
      </div>
    `;
  }

  // Descrição
  if (checklist.descricao) {
    content += `
      <div class="field-section">
        <div class="field-label">📝 Descrição</div>
        <div class="field-content desc" style="border-left-color:${cor}">${checklist.descricao}</div>
      </div>
    `;
  }

  // Localização GPS
  content += generateLocationSection({
    latitude: checklist.latitude,
    longitude: checklist.longitude,
    endereco: checklist.endereco,
  });

  // Itens do Checklist
  if (itens.length > 0) {
    content += `
      <div class="field-section">
        <div class="field-label">✅ Checklist (${itensCompletos}/${totalItens})</div>
        ${generateChecklistHTML(itens.map((i: any) => ({ descricao: i.descricao || i.texto, completo: i.completo })))}
      </div>
    `;
  }

  // Imagens
  if (imagensBase64.length > 0) {
    content += `
      <div class="field-section">
        <div class="field-label">🖼️ Imagens (${imagensBase64.length})</div>
        ${generateImagesHTML(imagensBase64)}
      </div>
    `;
  }

  // Datas
  content += generateDatesSection(checklist, cor);

  // Timeline
  if (timeline.length > 0) {
    content += `
      <div class="field-section">
        <div class="field-label">📋 Timeline de Eventos</div>
        ${generateTimelineHTML(timeline)}
      </div>
    `;
  }
  
  // Assinaturas digitais
  content += generateSignaturesHTML(checklist);
  
  const html = generatePrintableHTML(content, {
    title: checklist.titulo,
    subtitle: formatStatus(checklist.status),
    protocolo: checklist.protocolo,
    logoUrl: logoBase64 || branding?.logoUrl,
    companyName: branding?.companyName,
    accentColor: cor,
    reportType: 'checklist',
  });
  
  openPrintWindow(html);
}

// Gerar relatório resumido (lista) - PREMIUM
export function generateListReport(
  title: string,
  items: any[],
  columns: { key: string; label: string; format?: (value: any) => string }[],
  branding?: BrandingOptions
): void {
  const tableHeaders = columns.map(col => `<th>${col.label}</th>`).join('');
  const tableRows = items.map(item => {
    const cells = columns.map(col => {
      const value = item[col.key];
      const formatted = col.format ? col.format(value) : (value || '-');
      return `<td>${formatted}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  
  const content = `
    <div class="field-section">
      <div class="field-label">📊 Resumo (${items.length} registros)</div>
      <table>
        <thead>
          <tr>${tableHeaders}</tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
  
  const html = generatePrintableHTML(content, {
    title,
    data: new Date().toLocaleDateString('pt-BR'),
    logoUrl: branding?.logoUrl,
    companyName: branding?.companyName,
  });
  
  openPrintWindow(html);
}


// Gerar relatório de Antes e Depois (PREMIUM)
export async function generateAntesDepoisReport(item: any, branding?: BrandingOptions): Promise<void> {
  const cor = REPORT_COLORS.antes_depois;

  // Pré-carregar imagens e logo como base64
  const [fotoAntesBase64, fotoDepoisBase64, logoBase64] = await Promise.all([
    item.fotoAntesUrl ? imageUrlToBase64(item.fotoAntesUrl) : Promise.resolve(null),
    item.fotoDepoisUrl ? imageUrlToBase64(item.fotoDepoisUrl) : Promise.resolve(null),
    preloadLogo(branding?.logoUrl),
  ]);

  let content = '';

  // Título e Descrição
  if (item.descricao) {
    content += `
      <div class="field-section">
        <div class="field-label">📝 Descrição</div>
        <div class="field-content desc" style="border-left-color:${cor}">${item.descricao}</div>
      </div>
    `;
  }

  // Localização GPS
  content += generateLocationSection({
    latitude: item.latitude,
    longitude: item.longitude,
    endereco: item.endereco,
  });

  // Comparativo Visual
  content += `
    <div class="field-section">
      <div class="field-label">🔄 Comparativo Visual</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="text-align: center;">
          <div style="font-size: 12px; font-weight: 700; color: #dc2626; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">ANTES</div>
          ${fotoAntesBase64 
            ? `<div class="img-card" style="border-color: #fca5a5;"><img src="${fotoAntesBase64}" alt="Antes" style="height: 180px;" /></div>`
            : '<div style="background: #f8fafc; padding: 40px; border-radius: 8px; color: #94a3b8; border: 1px solid #e2e8f0;">Sem imagem</div>'
          }
        </div>
        <div style="text-align: center;">
          <div style="font-size: 12px; font-weight: 700; color: #16a34a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">DEPOIS</div>
          ${fotoDepoisBase64 
            ? `<div class="img-card" style="border-color: #86efac;"><img src="${fotoDepoisBase64}" alt="Depois" style="height: 180px;" /></div>`
            : '<div style="background: #f8fafc; padding: 40px; border-radius: 8px; color: #94a3b8; border: 1px solid #e2e8f0;">Sem imagem</div>'
          }
        </div>
      </div>
    </div>
  `;

  // Data
  content += `
    <div class="field-section">
      <div class="field-label">📅 Data</div>
      <div class="dates-grid" style="grid-template-columns: 1fr;">
        <div class="date-card" style="border-top-color:${cor}">
          <div class="date-label" style="color:${cor}">Criado em</div>
          <div class="date-value">${formatDate(item.createdAt)}</div>
          <div class="date-time">${formatTime(item.createdAt)}</div>
        </div>
      </div>
    </div>
  `;
  
  const html = generatePrintableHTML(content, {
    title: item.titulo || 'Antes e Depois',
    subtitle: 'Registro de Transformação',
    protocolo: undefined,
    data: new Date().toLocaleDateString('pt-BR'),
    logoUrl: logoBase64 || branding?.logoUrl,
    companyName: branding?.companyName,
    accentColor: cor,
    reportType: 'antes_depois',
  });
  
  openPrintWindow(html);
}
