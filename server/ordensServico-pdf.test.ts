import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { generateOSPDF } from "./pdf-generator";

describe("PDF Generation - Ordem de Serviço", () => {
  it("should generate a valid PDF buffer", async () => {
    const pdfData = {
      protocolo: "OS-001234",
      titulo: "Manutenção Preventiva",
      descricao: "Realizar manutenção preventiva do sistema de ar condicionado",
      responsavelPrincipalNome: "João Silva",
      tempoEstimadoDias: 1,
      tempoEstimadoHoras: 2,
      tempoEstimadoMinutos: 30,
      latitude: "-23.5505",
      longitude: "-46.6333",
      localizacaoDescricao: "Sala de máquinas - Bloco A",
      materiais: [
        { nome: "Filtro de ar", quantidade: 2 },
        { nome: "Óleo lubrificante", quantidade: 1 },
      ],
      imagens: [
        { url: "https://example.com/image1.jpg" },
        { url: "https://example.com/image2.jpg" },
      ],
      dataCriacao: new Date(),
      prioridadeNome: "Alta",
      categoriaNome: "Preventiva",
      setorNome: "Infraestrutura",
    };

    const pdfBuffer = await generateOSPDF(pdfData);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    // PDF files start with %PDF
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should generate PDF without images", async () => {
    const pdfData = {
      protocolo: "OS-005678",
      titulo: "Limpeza Geral",
      descricao: "Limpeza geral das áreas comuns",
      responsavelPrincipalNome: "Maria Santos",
      tempoEstimadoDias: 0,
      tempoEstimadoHoras: 4,
      tempoEstimadoMinutos: 0,
      latitude: undefined,
      longitude: undefined,
      localizacaoDescricao: undefined,
      materiais: [{ nome: "Detergente", quantidade: 5 }],
      imagens: [],
      dataCriacao: new Date(),
      prioridadeNome: "Normal",
      categoriaNome: "Limpeza",
      setorNome: "Operacional",
    };

    const pdfBuffer = await generateOSPDF(pdfData);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should generate PDF without location", async () => {
    const pdfData = {
      protocolo: "OS-009999",
      titulo: "Reparo de Equipamento",
      descricao: "Reparo do equipamento de ar condicionado",
      responsavelPrincipalNome: "Pedro Costa",
      tempoEstimadoDias: 2,
      tempoEstimadoHoras: 0,
      tempoEstimadoMinutos: 0,
      latitude: undefined,
      longitude: undefined,
      localizacaoDescricao: undefined,
      materiais: [],
      imagens: [],
      dataCriacao: new Date(),
      prioridadeNome: "Urgente",
      categoriaNome: "Corretiva",
      setorNome: "Manutenção",
    };

    const pdfBuffer = await generateOSPDF(pdfData);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should generate PDF with many materials", async () => {
    const materials = Array.from({ length: 20 }, (_, i) => ({
      nome: `Material ${i + 1}`,
      quantidade: Math.floor(Math.random() * 10) + 1,
    }));

    const pdfData = {
      protocolo: "OS-MANY-001",
      titulo: "Projeto Grande",
      descricao: "Projeto que requer muitos materiais",
      responsavelPrincipalNome: "Ana Silva",
      tempoEstimadoDias: 5,
      tempoEstimadoHoras: 8,
      tempoEstimadoMinutos: 15,
      latitude: "-23.5505",
      longitude: "-46.6333",
      localizacaoDescricao: "Local do projeto",
      materiais: materials,
      imagens: [],
      dataCriacao: new Date(),
      prioridadeNome: "Normal",
      categoriaNome: "Projeto",
      setorNome: "Engenharia",
    };

    const pdfBuffer = await generateOSPDF(pdfData);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });

  it("should generate PDF with special characters in description", async () => {
    const pdfData = {
      protocolo: "OS-SPECIAL-001",
      titulo: "Manutenção com Caracteres Especiais",
      descricao: "Descrição com acentuação: São Paulo, Brasília, açúcar, pão, côté",
      responsavelPrincipalNome: "José Pereira",
      tempoEstimadoDias: 1,
      tempoEstimadoHoras: 0,
      tempoEstimadoMinutos: 0,
      latitude: "-23.5505",
      longitude: "-46.6333",
      localizacaoDescricao: "Rua das Flores, nº 123",
      materiais: [{ nome: "Peça de reposição", quantidade: 1 }],
      imagens: [],
      dataCriacao: new Date(),
      prioridadeNome: "Normal",
      categoriaNome: "Manutenção",
      setorNome: "Operacional",
    };

    const pdfBuffer = await generateOSPDF(pdfData);

    expect(pdfBuffer).toBeDefined();
    expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
    expect(pdfBuffer.length).toBeGreaterThan(0);
    expect(pdfBuffer.toString("utf8", 0, 4)).toBe("%PDF");
  });
});
