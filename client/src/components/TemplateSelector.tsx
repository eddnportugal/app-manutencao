import { cn } from "@/lib/utils";
import { templates, TemplateConfig } from "@/lib/templates";
import { motion } from "framer-motion";
import { Check, Palette, Sparkles } from "lucide-react";
import { useState } from "react";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
  className?: string;
}

export default function TemplateSelector({
  selectedTemplate,
  onSelect,
  className,
}: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="font-serif text-lg font-semibold">Escolha um Template</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
            isHovered={hoveredTemplate === template.id}
            onSelect={() => onSelect(template.id)}
            onHover={() => setHoveredTemplate(template.id)}
            onLeave={() => setHoveredTemplate(null)}
          />
        ))}
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: TemplateConfig;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function TemplateCard({
  template,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onLeave,
}: TemplateCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "relative rounded-xl overflow-hidden border-2 transition-all duration-300 text-left",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-border hover:border-primary/50"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Preview da revista com o template */}
      <div
        className="aspect-[3/4] relative"
        style={{ background: template.effects.pageBackground }}
      >
        {/* Capa simulada */}
        <div className="absolute inset-4 rounded-lg overflow-hidden shadow-lg">
          {/* Header */}
          <div
            className="h-1/3 relative"
            style={{ background: template.colors.gradient }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
              <span
                className="text-[8px] uppercase tracking-wider opacity-80"
                style={{ color: template.colors.primaryForeground }}
              >
                Edição Dezembro 2024
              </span>
              <span
                className="text-sm font-bold mt-1"
                style={{
                  color: template.colors.primaryForeground,
                  fontFamily: template.typography.headingFont,
                }}
              >
                Residencial
              </span>
            </div>
          </div>
          
          {/* Conteúdo */}
          <div
            className="h-2/3 p-3 space-y-2"
            style={{ background: template.colors.card }}
          >
            {/* Seção Resumo */}
            <div
              className="flex items-center gap-2 p-2 rounded"
              style={{ background: template.colors.secondary }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: template.colors.primary }}
              >
                <div className="w-3 h-3 rounded-sm" style={{ background: template.colors.primaryForeground, opacity: 0.8 }} />
              </div>
              <div className="flex-1">
                <div
                  className="h-1.5 rounded w-3/4"
                  style={{ background: template.colors.mutedForeground, opacity: 0.3 }}
                />
                <div
                  className="h-1 rounded w-1/2 mt-1"
                  style={{ background: template.colors.mutedForeground, opacity: 0.2 }}
                />
              </div>
            </div>
            
            {/* Cards de seções de manutenção */}
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { color: "#64748B", label: "Manutenções" },
                { color: "#10B981", label: "Vistorias" },
                { color: "#EAB308", label: "Ocorrências" },
                { color: "#14B8A6", label: "Checklists" },
              ].map((section, i) => (
                <div
                  key={i}
                  className="aspect-square rounded p-1.5"
                  style={{
                    background: i % 2 === 0 ? template.colors.muted : template.colors.secondary,
                    borderRadius: template.components.borderRadius,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded mb-1"
                    style={{
                      background: section.color,
                      opacity: 0.8,
                    }}
                  />
                  <div
                    className="h-1 rounded w-full"
                    style={{ background: template.colors.mutedForeground, opacity: 0.2 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Badge de seleção */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center"
          >
            <Check className="w-4 h-4 text-primary-foreground" />
          </motion.div>
        )}
        
        {/* Efeito de hover */}
        {isHovered && !isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-primary/10 flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
        )}
      </div>
      
      {/* Info do template */}
      <div className="p-3 bg-background">
        <h4 className="font-semibold text-sm">{template.name}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
        
        {/* Paleta de cores */}
        <div className="flex gap-1 mt-2">
          <div
            className="w-4 h-4 rounded-full border border-border"
            style={{ background: template.colors.primary }}
            title="Cor primária"
          />
          <div
            className="w-4 h-4 rounded-full border border-border"
            style={{ background: template.colors.accent }}
            title="Cor de destaque"
          />
          <div
            className="w-4 h-4 rounded-full border border-border"
            style={{ background: template.colors.secondary }}
            title="Cor secundária"
          />
          <div
            className="w-4 h-4 rounded-full border border-border"
            style={{ background: template.colors.muted }}
            title="Cor neutra"
          />
        </div>
      </div>
    </motion.button>
  );
}

// Componente de pré-visualização em tamanho maior
interface TemplatePreviewProps {
  template: TemplateConfig;
  className?: string;
}

export function TemplatePreview({ template, className }: TemplatePreviewProps) {
  return (
    <div
      className={cn("rounded-2xl overflow-hidden shadow-2xl", className)}
      style={{ background: template.effects.pageBackground }}
    >
      {/* Simulação de página de revista */}
      <div className="aspect-[3/4] p-6">
        {/* Capa */}
        <div className="h-full rounded-xl overflow-hidden shadow-lg">
          {/* Header com gradiente */}
          <div
            className="h-2/5 relative"
            style={{ background: template.colors.gradient }}
          >
            <div
              className="absolute inset-0"
              style={{ background: template.effects.coverOverlay }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <span
                className="text-xs uppercase tracking-[0.2em] opacity-90"
                style={{ color: template.colors.primaryForeground }}
              >
                Edição Dezembro 2024
              </span>
              <h1
                className="text-2xl md:text-3xl font-bold mt-2"
                style={{
                  color: template.colors.primaryForeground,
                  fontFamily: template.typography.headingFont,
                }}
              >
                Residencial Jardins
              </h1>
              <div
                className="w-16 h-1 mt-3 rounded-full"
                style={{ background: template.colors.accent }}
              />
            </div>
          </div>
          
          {/* Conteúdo */}
          <div
            className="h-3/5 p-4 space-y-3"
            style={{ background: template.colors.card }}
          >
            {/* Mensagem do Gestor */}
            <div
              className="flex items-center gap-3 p-3 rounded-lg"
              style={{
                background: template.colors.secondary,
                borderRadius: template.components.borderRadius,
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: template.colors.primary,
                  color: template.colors.primaryForeground,
                }}
              >
                JS
              </div>
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{
                    color: template.colors.foreground,
                    fontFamily: template.typography.headingFont,
                  }}
                >
                  Mensagem do Gestor
                </p>
                <p
                  className="text-xs"
                  style={{ color: template.colors.mutedForeground }}
                >
                  João Silva
                </p>
              </div>
            </div>
            
            {/* Grid de seções */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "Avisos", color: template.colors.accent },
                { name: "Eventos", color: template.colors.primary },
                { name: "Votações", color: template.colors.accent },
                { name: "Classificados", color: template.colors.primary },
              ].map((section, i) => (
                <div
                  key={i}
                  className="p-3"
                  style={{
                    background: template.colors.muted,
                    borderRadius: template.components.borderRadius,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-lg mb-2 flex items-center justify-center"
                    style={{ background: section.color, opacity: 0.8 }}
                  >
                    <div className="w-3 h-3 bg-white/50 rounded" />
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: template.colors.foreground }}
                  >
                    {section.name}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Indicador de página */}
            <div className="flex items-center justify-center gap-1 pt-2">
              <span
                className="text-xs"
                style={{ color: template.colors.mutedForeground }}
              >
                — 1 —
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
