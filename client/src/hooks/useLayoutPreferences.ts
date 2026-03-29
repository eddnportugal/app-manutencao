import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

type Tema = "laranja" | "azul" | "verde" | "roxo" | "vermelho" | "marrom" | "cinza";
type LayoutType = "classico" | "compacto" | "moderno";
type TamanhoFonte = "pequeno" | "medio" | "grande";

interface TemaPersonalizado {
  id: number;
  corPrimaria: string;
  corSecundaria: string | null;
  corFundo: string | null;
  corTexto: string | null;
  corAcento: string | null;
}

// Páginas públicas que não precisam de autenticação
const publicPaths = ['/login', '/registar', '/recuperar-senha', '/redefinir-senha', '/', '/demo', '/contrato', '/apresentacao'];

function isPublicPage() {
  if (typeof window === "undefined") return true;
  const currentPath = window.location.pathname;
  return publicPaths.some(path => {
    if (path === "/") return currentPath === "/";
    return currentPath === path || currentPath.startsWith(`${path}/`);
  });
}

export function useLayoutPreferences() {
  // Não fazer a chamada de API em páginas públicas
  const isPublic = isPublicPage();
  
  const { data: preferencias, isLoading } = trpc.preferenciasLayout.get.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: false,
    enabled: !isPublic, // Desabilita a query em páginas públicas
  });

  useEffect(() => {
    // Primeiro, tentar carregar do localStorage para aplicação imediata
    const savedTema = localStorage.getItem("app-tema") as Tema | null;
    const savedLayout = localStorage.getItem("app-layout") as LayoutType | null;
    const savedModoEscuro = localStorage.getItem("app-modo-escuro");
    const savedTamanhoFonte = localStorage.getItem("app-tamanho-fonte") as TamanhoFonte | null;
    const savedTemaPersonalizado = localStorage.getItem("app-tema-personalizado");

    if (savedTema || savedLayout || savedModoEscuro || savedTamanhoFonte) {
      applyPreferences({
        tema: savedTema || "laranja",
        layout: savedLayout || "classico",
        modoEscuro: savedModoEscuro === "true",
        tamanhoFonte: savedTamanhoFonte || "medio",
        temaPersonalizado: savedTemaPersonalizado ? JSON.parse(savedTemaPersonalizado) : null,
        usarTemaPersonalizado: localStorage.getItem("app-usar-tema-personalizado") === "true",
      });
    }
  }, []);

  useEffect(() => {
    if (preferencias && !isLoading) {
      const temaPersonalizado = preferencias.temaPersonalizado as TemaPersonalizado | null;
      
      applyPreferences({
        tema: preferencias.tema as Tema,
        layout: preferencias.layout as LayoutType,
        modoEscuro: preferencias.modoEscuro || false,
        tamanhoFonte: (preferencias.tamanhoFonte as TamanhoFonte) || "medio",
        temaPersonalizado,
        usarTemaPersonalizado: preferencias.usarTemaPersonalizado || false,
      });

      // Salvar no localStorage para carregamento rápido
      localStorage.setItem("app-tema", preferencias.tema);
      localStorage.setItem("app-layout", preferencias.layout);
      localStorage.setItem("app-modo-escuro", String(preferencias.modoEscuro || false));
      localStorage.setItem("app-tamanho-fonte", preferencias.tamanhoFonte || "medio");
      localStorage.setItem("app-usar-tema-personalizado", String(preferencias.usarTemaPersonalizado || false));
      if (temaPersonalizado) {
        localStorage.setItem("app-tema-personalizado", JSON.stringify(temaPersonalizado));
      } else {
        localStorage.removeItem("app-tema-personalizado");
      }
    }
  }, [preferencias, isLoading]);

  return { preferencias, isLoading };
}

function applyPreferences(prefs: {
  tema: Tema;
  layout: LayoutType;
  modoEscuro: boolean;
  tamanhoFonte: TamanhoFonte;
  temaPersonalizado?: TemaPersonalizado | null;
  usarTemaPersonalizado?: boolean;
}) {
  const root = document.documentElement;

  // Remover classes de tema anteriores
  root.classList.remove("tema-azul", "tema-verde", "tema-roxo", "tema-vermelho", "tema-marrom", "tema-cinza", "tema-personalizado");
  root.classList.remove("layout-compacto", "layout-moderno");
  root.classList.remove("fonte-pequeno", "fonte-grande");
  root.classList.remove("dark");

  // Limpar variáveis CSS de tema personalizado
  root.style.removeProperty("--custom-primary");
  root.style.removeProperty("--custom-primary-foreground");
  root.style.removeProperty("--custom-secondary");
  root.style.removeProperty("--custom-background");
  root.style.removeProperty("--custom-foreground");
  root.style.removeProperty("--custom-accent");

  // Se usar tema personalizado, aplicar cores customizadas
  if (prefs.usarTemaPersonalizado && prefs.temaPersonalizado) {
    root.classList.add("tema-personalizado");
    
    // Converter hex para HSL e aplicar variáveis CSS
    const primary = hexToHsl(prefs.temaPersonalizado.corPrimaria);
    root.style.setProperty("--custom-primary", primary);
    root.style.setProperty("--custom-primary-foreground", "0 0% 100%");
    
    if (prefs.temaPersonalizado.corSecundaria) {
      const secondary = hexToHsl(prefs.temaPersonalizado.corSecundaria);
      root.style.setProperty("--custom-secondary", secondary);
    }
    
    if (prefs.temaPersonalizado.corFundo) {
      const background = hexToHsl(prefs.temaPersonalizado.corFundo);
      root.style.setProperty("--custom-background", background);
    }
    
    if (prefs.temaPersonalizado.corTexto) {
      const foreground = hexToHsl(prefs.temaPersonalizado.corTexto);
      root.style.setProperty("--custom-foreground", foreground);
    }
    
    if (prefs.temaPersonalizado.corAcento) {
      const accent = hexToHsl(prefs.temaPersonalizado.corAcento);
      root.style.setProperty("--custom-accent", accent);
    }
  } else {
    // Aplicar tema padrão
    if (prefs.tema !== "laranja") {
      root.classList.add(`tema-${prefs.tema}`);
    }
  }

  // Aplicar layout
  if (prefs.layout !== "classico") {
    root.classList.add(`layout-${prefs.layout}`);
  }

  // Aplicar tamanho de fonte
  if (prefs.tamanhoFonte === "pequeno") {
    root.classList.add("fonte-pequeno");
  } else if (prefs.tamanhoFonte === "grande") {
    root.classList.add("fonte-grande");
  }

  // Aplicar modo escuro
  if (prefs.modoEscuro) {
    root.classList.add("dark");
  }
}

// Converter hex para HSL string (formato: "h s% l%")
function hexToHsl(hex: string): string {
  // Remover # se presente
  hex = hex.replace(/^#/, "");
  
  // Converter para RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Função para aplicar preferências do localStorage imediatamente (antes do React)
export function applyStoredPreferences() {
  const savedTema = localStorage.getItem("app-tema");
  const savedLayout = localStorage.getItem("app-layout");
  const savedModoEscuro = localStorage.getItem("app-modo-escuro");
  const savedTamanhoFonte = localStorage.getItem("app-tamanho-fonte");
  const savedUsarTemaPersonalizado = localStorage.getItem("app-usar-tema-personalizado");
  const savedTemaPersonalizado = localStorage.getItem("app-tema-personalizado");

  const root = document.documentElement;

  // Se usar tema personalizado
  if (savedUsarTemaPersonalizado === "true" && savedTemaPersonalizado) {
    try {
      const temaPersonalizado = JSON.parse(savedTemaPersonalizado);
      root.classList.add("tema-personalizado");
      
      const primary = hexToHsl(temaPersonalizado.corPrimaria);
      root.style.setProperty("--custom-primary", primary);
      root.style.setProperty("--custom-primary-foreground", "0 0% 100%");
      
      if (temaPersonalizado.corSecundaria) {
        const secondary = hexToHsl(temaPersonalizado.corSecundaria);
        root.style.setProperty("--custom-secondary", secondary);
      }
      
      if (temaPersonalizado.corFundo) {
        const background = hexToHsl(temaPersonalizado.corFundo);
        root.style.setProperty("--custom-background", background);
      }
      
      if (temaPersonalizado.corTexto) {
        const foreground = hexToHsl(temaPersonalizado.corTexto);
        root.style.setProperty("--custom-foreground", foreground);
      }
    } catch {
      // Ignorar erro de parse
    }
  } else {
    // Aplicar tema padrão
    if (savedTema && savedTema !== "laranja") {
      root.classList.add(`tema-${savedTema}`);
    }
  }

  // Aplicar layout
  if (savedLayout && savedLayout !== "classico") {
    root.classList.add(`layout-${savedLayout}`);
  }

  // Aplicar tamanho de fonte
  if (savedTamanhoFonte === "pequeno") {
    root.classList.add("fonte-pequeno");
  } else if (savedTamanhoFonte === "grande") {
    root.classList.add("fonte-grande");
  }

  // Aplicar modo escuro
  if (savedModoEscuro === "true") {
    root.classList.add("dark");
  }
}
