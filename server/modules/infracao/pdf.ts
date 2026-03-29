
export async function generateInfracoesPDF(htmlContent: string): Promise<Buffer> {
  try {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    // @ts-ignore
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    
    // Header
    doc.setFillColor(239, 68, 68);
    doc.rect(0, 0, pageWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Infrações', margin, 13);
    
    // Conteúdo simplificado - extrair texto do HTML
    const textContent = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const lines = doc.splitTextToSize(textContent, contentWidth);
    let yPos = 30;
    
    for (const line of lines) {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    }
    
    const pdfOutput = doc.output('arraybuffer');
    return Buffer.from(pdfOutput);
  } catch (error) {
    console.error('Erro ao gerar PDF de infrações:', error);
    return Buffer.from(htmlContent, 'utf-8');
  }
}
