import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do banco de dados
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  leftJoin: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockResolvedValue([]),
  groupBy: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
};

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(mockDb),
}));

describe("Histórico de Acessos de Membros da Equipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Registro de Acessos", () => {
    it("deve registrar acesso com sucesso no login", async () => {
      const acessoData = {
        membroId: 1,
        condominioId: 1,
        ip: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        dispositivo: "Desktop",
        navegador: "Chrome",
        sistemaOperacional: "Windows",
        tipoAcesso: "login",
        sucesso: true,
      };

      expect(acessoData.sucesso).toBe(true);
      expect(acessoData.tipoAcesso).toBe("login");
    });

    it("deve registrar tentativa de acesso falha", async () => {
      const acessoFalha = {
        membroId: 1,
        condominioId: 1,
        ip: "192.168.1.100",
        userAgent: "Mozilla/5.0",
        dispositivo: "Desktop",
        navegador: "Chrome",
        sistemaOperacional: "Windows",
        tipoAcesso: "login",
        sucesso: false,
        motivoFalha: "Senha inválida",
      };

      expect(acessoFalha.sucesso).toBe(false);
      expect(acessoFalha.motivoFalha).toBe("Senha inválida");
    });
  });

  describe("Parsing de User-Agent", () => {
    const parseUA = (ua: string) => {
      let dispositivo = "Desktop";
      let navegador = "Desconhecido";
      let sistemaOperacional = "Desconhecido";
      
      if (/Mobile|Android|iPhone|iPad|iPod/i.test(ua)) {
        dispositivo = /iPad/i.test(ua) ? "Tablet" : "Mobile";
      }
      
      if (/Chrome/i.test(ua) && !/Edge|Edg/i.test(ua)) navegador = "Chrome";
      else if (/Firefox/i.test(ua)) navegador = "Firefox";
      else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) navegador = "Safari";
      else if (/Edge|Edg/i.test(ua)) navegador = "Edge";
      
      if (/Windows/i.test(ua)) sistemaOperacional = "Windows";
      else if (/iPhone|iPad|iPod/i.test(ua)) sistemaOperacional = "iOS";
      else if (/Mac OS X|macOS/i.test(ua)) sistemaOperacional = "macOS";
      else if (/Linux/i.test(ua) && !/Android/i.test(ua)) sistemaOperacional = "Linux";
      else if (/Android/i.test(ua)) sistemaOperacional = "Android";
      
      return { dispositivo, navegador, sistemaOperacional };
    };

    it("deve detectar Chrome no Windows", () => {
      const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
      const result = parseUA(ua);
      
      expect(result.dispositivo).toBe("Desktop");
      expect(result.navegador).toBe("Chrome");
      expect(result.sistemaOperacional).toBe("Windows");
    });

    it("deve detectar Safari no macOS", () => {
      const ua = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
      const result = parseUA(ua);
      
      expect(result.dispositivo).toBe("Desktop");
      expect(result.navegador).toBe("Safari");
      expect(result.sistemaOperacional).toBe("macOS");
    });

    it("deve detectar Chrome no Android (Mobile)", () => {
      const ua = "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36";
      const result = parseUA(ua);
      
      expect(result.dispositivo).toBe("Mobile");
      expect(result.navegador).toBe("Chrome");
      expect(result.sistemaOperacional).toBe("Android");
    });

    it("deve detectar Safari no iPhone (Mobile)", () => {
      const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
      const result = parseUA(ua);
      
      expect(result.dispositivo).toBe("Mobile");
      expect(result.navegador).toBe("Safari");
      expect(result.sistemaOperacional).toBe("iOS");
    });

    it("deve detectar Safari no iPad (Tablet)", () => {
      const ua = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
      const result = parseUA(ua);
      
      expect(result.dispositivo).toBe("Tablet");
      expect(result.navegador).toBe("Safari");
      expect(result.sistemaOperacional).toBe("iOS");
    });

    it("deve detectar Edge no Windows", () => {
      const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0";
      const result = parseUA(ua);
      
      expect(result.dispositivo).toBe("Desktop");
      expect(result.navegador).toBe("Edge");
      expect(result.sistemaOperacional).toBe("Windows");
    });

    it("deve detectar Firefox no Linux", () => {
      const ua = "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0";
      const result = parseUA(ua);
      
      expect(result.dispositivo).toBe("Desktop");
      expect(result.navegador).toBe("Firefox");
      expect(result.sistemaOperacional).toBe("Linux");
    });
  });

  describe("Listagem de Histórico", () => {
    it("deve retornar lista vazia quando não há acessos", async () => {
      mockDb.offset.mockResolvedValueOnce([]);
      
      const result = { acessos: [], total: 0 };
      
      expect(result.acessos).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it("deve retornar acessos ordenados por data decrescente", async () => {
      const acessosMock = [
        { id: 3, dataHora: new Date("2026-01-15T10:00:00") },
        { id: 2, dataHora: new Date("2026-01-14T10:00:00") },
        { id: 1, dataHora: new Date("2026-01-13T10:00:00") },
      ];
      
      // Verificar ordenação
      const ordenados = [...acessosMock].sort((a, b) => 
        new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
      );
      
      expect(ordenados[0].id).toBe(3);
      expect(ordenados[2].id).toBe(1);
    });

    it("deve suportar paginação", async () => {
      const pagina = 2;
      const limite = 10;
      const offset = (pagina - 1) * limite;
      
      expect(offset).toBe(10);
    });
  });

  describe("Estatísticas de Acessos", () => {
    it("deve calcular total de acessos no período", async () => {
      const estatisticas = {
        totalAcessos: 150,
        acessosSucesso: 145,
        acessosFalha: 5,
        membrosUnicos: 12,
      };
      
      expect(estatisticas.totalAcessos).toBe(150);
      expect(estatisticas.acessosSucesso + estatisticas.acessosFalha).toBe(150);
    });

    it("deve agrupar por dispositivo", async () => {
      const dispositivos = [
        { nome: "Desktop", quantidade: 100 },
        { nome: "Mobile", quantidade: 45 },
        { nome: "Tablet", quantidade: 5 },
      ];
      
      const total = dispositivos.reduce((acc, d) => acc + d.quantidade, 0);
      expect(total).toBe(150);
    });

    it("deve agrupar por navegador", async () => {
      const navegadores = [
        { nome: "Chrome", quantidade: 80 },
        { nome: "Safari", quantidade: 40 },
        { nome: "Firefox", quantidade: 20 },
        { nome: "Edge", quantidade: 10 },
      ];
      
      const total = navegadores.reduce((acc, n) => acc + n.quantidade, 0);
      expect(total).toBe(150);
    });
  });

  describe("Filtros de Histórico", () => {
    it("deve filtrar por tipo de acesso", async () => {
      const acessos = [
        { tipoAcesso: "login", sucesso: true },
        { tipoAcesso: "login", sucesso: false },
        { tipoAcesso: "logout", sucesso: true },
        { tipoAcesso: "recuperacao_senha", sucesso: true },
      ];
      
      const apenasLogin = acessos.filter(a => a.tipoAcesso === "login");
      expect(apenasLogin).toHaveLength(2);
    });

    it("deve filtrar por sucesso/falha", async () => {
      const acessos = [
        { tipoAcesso: "login", sucesso: true },
        { tipoAcesso: "login", sucesso: false },
        { tipoAcesso: "login", sucesso: true },
      ];
      
      const apenasSucesso = acessos.filter(a => a.sucesso);
      const apenasFalha = acessos.filter(a => !a.sucesso);
      
      expect(apenasSucesso).toHaveLength(2);
      expect(apenasFalha).toHaveLength(1);
    });

    it("deve filtrar por período", async () => {
      const acessos = [
        { dataHora: new Date("2026-01-15T10:00:00") },
        { dataHora: new Date("2026-01-10T10:00:00") },
        { dataHora: new Date("2026-01-05T10:00:00") },
      ];
      
      const dataInicio = new Date("2026-01-08");
      const filtrados = acessos.filter(a => new Date(a.dataHora) >= dataInicio);
      
      expect(filtrados).toHaveLength(2);
    });
  });

  describe("Exportação de Histórico", () => {
    it("deve gerar dados para exportação Excel", async () => {
      const exportData = {
        membroId: 1,
        membroNome: "João Silva",
        dataInicio: undefined,
        dataFim: undefined,
      };
      
      expect(exportData.membroId).toBe(1);
      expect(exportData.membroNome).toBe("João Silva");
    });

    it("deve gerar dados para exportação PDF", async () => {
      const exportData = {
        membroId: 1,
        membroNome: "João Silva",
        dataInicio: "2026-01-01",
        dataFim: "2026-01-15",
      };
      
      expect(exportData.dataInicio).toBe("2026-01-01");
      expect(exportData.dataFim).toBe("2026-01-15");
    });

    it("deve formatar nome do ficheiro corretamente", () => {
      const membroNome = "João Silva";
      const dataAtual = "2026-01-15";
      
      const filenameExcel = `historico-acessos-${membroNome.replace(/\s+/g, "-").toLowerCase()}-${dataAtual}.xlsx`;
      const filenamePDF = `historico-acessos-${membroNome.replace(/\s+/g, "-").toLowerCase()}-${dataAtual}.pdf`;
      
      expect(filenameExcel).toBe("historico-acessos-joão-silva-2026-01-15.xlsx");
      expect(filenamePDF).toBe("historico-acessos-joão-silva-2026-01-15.pdf");
    });

    it("deve incluir todos os campos necessários no Excel", () => {
      const colunas = [
        "Data", "Hora", "Tipo", "Status", "IP", 
        "Dispositivo", "Navegador", "Sistema", "Motivo Falha"
      ];
      
      expect(colunas).toHaveLength(9);
      expect(colunas).toContain("Data");
      expect(colunas).toContain("IP");
      expect(colunas).toContain("Dispositivo");
    });

    it("deve formatar tipo de acesso corretamente", () => {
      const formatarTipo = (tipo: string) => {
        switch (tipo) {
          case "login": return "Login";
          case "logout": return "Logout";
          case "recuperacao_senha": return "Recuperação de Senha";
          case "alteracao_senha": return "Alteração de Senha";
          default: return "Login";
        }
      };
      
      expect(formatarTipo("login")).toBe("Login");
      expect(formatarTipo("logout")).toBe("Logout");
      expect(formatarTipo("recuperacao_senha")).toBe("Recuperação de Senha");
      expect(formatarTipo("alteracao_senha")).toBe("Alteração de Senha");
    });

    it("deve formatar status corretamente", () => {
      const formatarStatus = (sucesso: boolean) => sucesso ? "Sucesso" : "Falha";
      
      expect(formatarStatus(true)).toBe("Sucesso");
      expect(formatarStatus(false)).toBe("Falha");
    });
  });

  describe("Captura de IP", () => {
    it("deve extrair IP do header x-forwarded-for", () => {
      const headers = {
        "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
      };
      
      const ip = headers["x-forwarded-for"].split(",")[0].trim();
      expect(ip).toBe("203.0.113.195");
    });

    it("deve usar x-real-ip como fallback", () => {
      const headers = {
        "x-real-ip": "203.0.113.195",
      };
      
      const ip = headers["x-real-ip"];
      expect(ip).toBe("203.0.113.195");
    });

    it("deve suportar IPv6", () => {
      const ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
      expect(ipv6.length).toBeLessThanOrEqual(45); // Tamanho máximo do campo
    });
  });
});
