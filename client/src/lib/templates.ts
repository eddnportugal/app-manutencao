// Sistema de Templates para Revista Digital
// Cada template define cores, tipografia, estilos de componentes e efeitos visuais

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  preview: string;
  
  // Cores principais
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    card: string;
    cardForeground: string;
    border: string;
    gradient: string;
  };
  
  // Tipografia
  typography: {
    fontFamily: string;
    headingFont: string;
    titleSize: string;
    subtitleSize: string;
    bodySize: string;
    captionSize: string;
  };
  
  // Estilos de componentes
  components: {
    borderRadius: string;
    cardShadow: string;
    buttonStyle: string;
    dividerStyle: string;
  };
  
  // Efeitos visuais
  effects: {
    pageBackground: string;
    coverOverlay: string;
    sectionDivider: string;
    highlightStyle: string;
  };
}

// Template Moderno - Minimalista e Clean
export const templateModerno: TemplateConfig = {
  id: "moderno",
  name: "Moderno",
  description: "Design minimalista com tons neutros e tipografia elegante",
  preview: "/templates/moderno-preview.png",
  
  colors: {
    primary: "#18181B",
    primaryForeground: "#FAFAFA",
    secondary: "#F4F4F5",
    secondaryForeground: "#18181B",
    accent: "#A1A1AA",
    accentForeground: "#18181B",
    background: "#FFFFFF",
    foreground: "#18181B",
    muted: "#F4F4F5",
    mutedForeground: "#71717A",
    card: "#FFFFFF",
    cardForeground: "#18181B",
    border: "#E4E4E7",
    gradient: "linear-gradient(135deg, #18181B 0%, #3F3F46 100%)",
  },
  
  typography: {
    fontFamily: "'Inter', sans-serif",
    headingFont: "'Playfair Display', serif",
    titleSize: "2.5rem",
    subtitleSize: "1.25rem",
    bodySize: "1rem",
    captionSize: "0.875rem",
  },
  
  components: {
    borderRadius: "0.5rem",
    cardShadow: "0 1px 3px rgba(0,0,0,0.08)",
    buttonStyle: "solid",
    dividerStyle: "thin",
  },
  
  effects: {
    pageBackground: "#FAFAFA",
    coverOverlay: "linear-gradient(180deg, transparent 0%, rgba(24,24,27,0.6) 100%)",
    sectionDivider: "1px solid #E4E4E7",
    highlightStyle: "border-left: 3px solid #18181B",
  },
};

// Template Corporativo - Profissional e Formal
export const templateCorporativo: TemplateConfig = {
  id: "corporativo",
  name: "Corporativo",
  description: "Estilo profissional com tons de azul e cinza",
  preview: "/templates/corporativo-preview.png",
  
  colors: {
    primary: "#1E3A5F",
    primaryForeground: "#FFFFFF",
    secondary: "#F1F5F9",
    secondaryForeground: "#1E3A5F",
    accent: "#2563EB",
    accentForeground: "#FFFFFF",
    background: "#FFFFFF",
    foreground: "#1E293B",
    muted: "#F8FAFC",
    mutedForeground: "#64748B",
    card: "#FFFFFF",
    cardForeground: "#1E293B",
    border: "#CBD5E1",
    gradient: "linear-gradient(135deg, #1E3A5F 0%, #2563EB 100%)",
  },
  
  typography: {
    fontFamily: "'Source Sans Pro', sans-serif",
    headingFont: "'Merriweather', serif",
    titleSize: "2.25rem",
    subtitleSize: "1.125rem",
    bodySize: "1rem",
    captionSize: "0.875rem",
  },
  
  components: {
    borderRadius: "0.375rem",
    cardShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
    buttonStyle: "solid",
    dividerStyle: "double",
  },
  
  effects: {
    pageBackground: "#F8FAFC",
    coverOverlay: "linear-gradient(180deg, transparent 0%, rgba(30,58,95,0.7) 100%)",
    sectionDivider: "2px double #CBD5E1",
    highlightStyle: "background: linear-gradient(90deg, #1E3A5F 0%, transparent 100%); padding-left: 1rem;",
  },
};

// Template Colorido - Vibrante e Divertido
export const templateColorido: TemplateConfig = {
  id: "colorido",
  name: "Colorido",
  description: "Design vibrante com gradientes e cores alegres",
  preview: "/templates/colorido-preview.png",
  
  colors: {
    primary: "#7C3AED",
    primaryForeground: "#FFFFFF",
    secondary: "#FDF4FF",
    secondaryForeground: "#7C3AED",
    accent: "#F59E0B",
    accentForeground: "#FFFFFF",
    background: "#FFFFFF",
    foreground: "#1F2937",
    muted: "#FEF3C7",
    mutedForeground: "#92400E",
    card: "#FFFFFF",
    cardForeground: "#1F2937",
    border: "#E9D5FF",
    gradient: "linear-gradient(135deg, #7C3AED 0%, #EC4899 50%, #F59E0B 100%)",
  },
  
  typography: {
    fontFamily: "'Nunito', sans-serif",
    headingFont: "'Poppins', sans-serif",
    titleSize: "2.75rem",
    subtitleSize: "1.375rem",
    bodySize: "1rem",
    captionSize: "0.875rem",
  },
  
  components: {
    borderRadius: "1rem",
    cardShadow: "0 10px 25px -5px rgba(124,58,237,0.15), 0 8px 10px -6px rgba(236,72,153,0.1)",
    buttonStyle: "gradient",
    dividerStyle: "gradient",
  },
  
  effects: {
    pageBackground: "linear-gradient(135deg, #FDF4FF 0%, #FEF3C7 50%, #ECFDF5 100%)",
    coverOverlay: "linear-gradient(180deg, rgba(124,58,237,0.2) 0%, rgba(236,72,153,0.6) 100%)",
    sectionDivider: "linear-gradient(90deg, #7C3AED, #EC4899, #F59E0B)",
    highlightStyle: "background: linear-gradient(90deg, rgba(124,58,237,0.1), rgba(236,72,153,0.1)); border-radius: 0.5rem; padding: 1rem;",
  },
};

// Lista de todos os templates disponíveis
export const templates: TemplateConfig[] = [
  templateModerno,
  templateCorporativo,
  templateColorido,
];

// Função para obter template por ID
export function getTemplateById(id: string): TemplateConfig {
  return templates.find(t => t.id === id) || templateModerno;
}

// Função para gerar CSS variables a partir do template
export function generateTemplateCSS(template: TemplateConfig): string {
  return `
    --template-primary: ${template.colors.primary};
    --template-primary-foreground: ${template.colors.primaryForeground};
    --template-secondary: ${template.colors.secondary};
    --template-secondary-foreground: ${template.colors.secondaryForeground};
    --template-accent: ${template.colors.accent};
    --template-accent-foreground: ${template.colors.accentForeground};
    --template-background: ${template.colors.background};
    --template-foreground: ${template.colors.foreground};
    --template-muted: ${template.colors.muted};
    --template-muted-foreground: ${template.colors.mutedForeground};
    --template-card: ${template.colors.card};
    --template-card-foreground: ${template.colors.cardForeground};
    --template-border: ${template.colors.border};
    --template-gradient: ${template.colors.gradient};
    --template-font-family: ${template.typography.fontFamily};
    --template-heading-font: ${template.typography.headingFont};
    --template-title-size: ${template.typography.titleSize};
    --template-subtitle-size: ${template.typography.subtitleSize};
    --template-body-size: ${template.typography.bodySize};
    --template-caption-size: ${template.typography.captionSize};
    --template-border-radius: ${template.components.borderRadius};
    --template-card-shadow: ${template.components.cardShadow};
    --template-page-background: ${template.effects.pageBackground};
  `;
}

// Função para aplicar template ao documento
export function applyTemplate(template: TemplateConfig): void {
  const root = document.documentElement;
  const css = generateTemplateCSS(template);
  root.style.cssText += css;
}
