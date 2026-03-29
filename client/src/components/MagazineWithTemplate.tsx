import { cn } from "@/lib/utils";
import { TemplateConfig, getTemplateById } from "@/lib/templates";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Search,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { useState } from "react";

interface MagazineWithTemplateProps {
  templateId: string;
  revista: {
    titulo: string;
    edicao?: string;
    condominioNome?: string;
  };
  conteudo?: {
    estatisticas?: {
      totalManutencoes: number;
      manutencoesConcluidas: number;
      totalVistorias: number;
      vistoriasAprovadas: number;
      totalOcorrencias: number;
      ocorrenciasResolvidas: number;
      totalChecklists: number;
      checklistsConcluidos: number;
      totalAntesDepois: number;
    };
    manutencoes?: Array<{ protocolo: string; titulo: string; status: string; data?: string }>;
    vistorias?: Array<{ protocolo: string; titulo: string; status: string; data?: string }>;
    ocorrencias?: Array<{ protocolo: string; titulo: string; status: string; data?: string }>;
    checklists?: Array<{ protocolo: string; titulo: string; status: string; data?: string }>;
    antesDepois?: Array<{ titulo: string; fotoAntesUrl?: string; fotoDepoisUrl?: string }>;
  };
  className?: string;
}

export default function MagazineWithTemplate({
  templateId,
  revista,
  conteudo = {},
  className,
}: MagazineWithTemplateProps) {
  const template = getTemplateById(templateId);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");

  const pages = [
    { id: "capa", title: "Capa" },
    { id: "resumo", title: "Resumo do Período" },
    { id: "manutencoes", title: "Manutenções" },
    { id: "vistorias", title: "Vistorias" },
    { id: "ocorrencias", title: "Ocorrências" },
    { id: "checklists", title: "Checklists" },
    { id: "antes_depois", title: "Antes e Depois" },
  ];

  const goToPage = (direction: "next" | "prev") => {
    if (isFlipping) return;
    
    const newPage = direction === "next" 
      ? Math.min(currentPage + 1, pages.length - 1)
      : Math.max(currentPage - 1, 0);
    
    if (newPage !== currentPage) {
      setFlipDirection(direction);
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(newPage);
        setIsFlipping(false);
      }, 300);
    }
  };

  return (
    <div
      className={cn("relative", className)}
      style={{
        fontFamily: template.typography.fontFamily,
        ["--template-heading-font" as string]: template.typography.headingFont,
      }}
    >
      {/* Container da revista */}
      <div
        className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl relative"
        style={{ background: template.effects.pageBackground }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ 
              rotateY: flipDirection === "next" ? -90 : 90,
              opacity: 0 
            }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ 
              rotateY: flipDirection === "next" ? 90 : -90,
              opacity: 0 
            }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Renderizar página atual */}
            {currentPage === 0 && (
              <CoverPage template={template} revista={revista} />
            )}
            {currentPage === 1 && (
              <ResumoPage template={template} estatisticas={conteudo.estatisticas} />
            )}
            {currentPage === 2 && (
              <ManutencoesPage template={template} manutencoes={conteudo.manutencoes} />
            )}
            {currentPage === 3 && (
              <VistoriasPage template={template} vistorias={conteudo.vistorias} />
            )}
            {currentPage === 4 && (
              <OcorrenciasPage template={template} ocorrencias={conteudo.ocorrencias} />
            )}
            {currentPage === 5 && (
              <ChecklistsPage template={template} checklists={conteudo.checklists} />
            )}
            {currentPage === 6 && (
              <AntesDepoisPage template={template} antesDepois={conteudo.antesDepois} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navegação */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-10">
          <button
            onClick={() => goToPage("prev")}
            disabled={currentPage === 0}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              currentPage === 0 ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
            )}
            style={{ 
              background: template.colors.primary,
              color: template.colors.primaryForeground,
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span
            className="text-sm font-medium px-4"
            style={{ color: template.colors.mutedForeground }}
          >
            {currentPage + 1} / {pages.length}
          </span>
          
          <button
            onClick={() => goToPage("next")}
            disabled={currentPage === pages.length - 1}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center transition-all",
              currentPage === pages.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
            )}
            style={{ 
              background: template.colors.primary,
              color: template.colors.primaryForeground,
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Página de Capa
function CoverPage({ template, revista }: { template: TemplateConfig; revista: any }) {
  return (
    <div className="h-full flex flex-col">
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
            {revista.edicao || "Edição Atual"}
          </span>
          <h1
            className="text-3xl md:text-4xl font-bold mt-3"
            style={{
              color: template.colors.primaryForeground,
              fontFamily: template.typography.headingFont,
            }}
          >
            {revista.condominioNome || revista.titulo}
          </h1>
          <div
            className="w-20 h-1 mt-4 rounded-full"
            style={{ background: template.colors.accent }}
          />
        </div>
      </div>
      
      {/* Conteúdo da capa - Seções de Manutenção */}
      <div
        className="flex-1 p-6 space-y-4"
        style={{ background: template.colors.card }}
      >
        {/* Grid de seções de manutenção */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Wrench, name: "Manutenções", color: template.colors.primary },
            { icon: Search, name: "Vistorias", color: template.colors.accent },
            { icon: AlertTriangle, name: "Ocorrências", color: "#EAB308" },
            { icon: ClipboardCheck, name: "Checklists", color: "#14B8A6" },
          ].map((section, i) => (
            <div
              key={i}
              className="p-4 flex flex-col items-start"
              style={{
                background: i % 2 === 0 ? template.colors.secondary : template.colors.muted,
                borderRadius: template.components.borderRadius,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                style={{ background: section.color, opacity: 0.9 }}
              >
                <section.icon className="w-5 h-5" style={{ color: template.colors.primaryForeground }} />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: template.colors.foreground }}
              >
                {section.name}
              </span>
            </div>
          ))}
        </div>
        
        {/* Rodapé */}
        <div className="flex items-center justify-center pt-4">
          <BookOpen className="w-5 h-5 mr-2" style={{ color: template.colors.mutedForeground }} />
          <span
            className="text-sm"
            style={{ color: template.colors.mutedForeground }}
          >
            Livro de Manutenção
          </span>
        </div>
      </div>
    </div>
  );
}

// Página de Resumo do Período
function ResumoPage({ template, estatisticas }: { template: TemplateConfig; estatisticas?: any }) {
  const stats = estatisticas || {
    totalManutencoes: 0,
    manutencoesConcluidas: 0,
    totalVistorias: 0,
    vistoriasAprovadas: 0,
    totalOcorrencias: 0,
    ocorrenciasResolvidas: 0,
    totalChecklists: 0,
    checklistsConcluidos: 0,
    totalAntesDepois: 0,
  };

  return (
    <div
      className="h-full p-6 flex flex-col"
      style={{ background: template.colors.background }}
    >
      <div
        className="text-center mb-6 pb-4"
        style={{ borderBottom: template.effects.sectionDivider }}
      >
        <TrendingUp
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: template.colors.primary }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            color: template.colors.foreground,
            fontFamily: template.typography.headingFont,
          }}
        >
          Resumo do Período
        </h2>
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-3">
        {[
          { label: "Manutenções", value: stats.totalManutencoes, sub: `${stats.manutencoesConcluidas} concluídas`, icon: Wrench, color: "#64748B" },
          { label: "Vistorias", value: stats.totalVistorias, sub: `${stats.vistoriasAprovadas} aprovadas`, icon: Search, color: "#10B981" },
          { label: "Ocorrências", value: stats.totalOcorrencias, sub: `${stats.ocorrenciasResolvidas} resolvidas`, icon: AlertTriangle, color: "#EAB308" },
          { label: "Checklists", value: stats.totalChecklists, sub: `${stats.checklistsConcluidos} concluídos`, icon: ClipboardCheck, color: "#14B8A6" },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-4 rounded-xl text-center"
            style={{
              background: template.colors.secondary,
              borderRadius: template.components.borderRadius,
            }}
          >
            <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
            <div
              className="text-2xl font-bold"
              style={{ color: template.colors.foreground }}
            >
              {stat.value}
            </div>
            <div
              className="text-sm font-medium"
              style={{ color: template.colors.foreground }}
            >
              {stat.label}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: template.colors.mutedForeground }}
            >
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-4 p-3 rounded-xl text-center"
        style={{
          background: `linear-gradient(135deg, ${template.colors.primary}15, ${template.colors.accent}15)`,
          borderRadius: template.components.borderRadius,
        }}
      >
        <ArrowLeftRight className="w-5 h-5 mx-auto mb-1" style={{ color: template.colors.primary }} />
        <div className="text-lg font-bold" style={{ color: template.colors.foreground }}>
          {stats.totalAntesDepois}
        </div>
        <div className="text-xs" style={{ color: template.colors.mutedForeground }}>
          Comparativos Antes/Depois
        </div>
      </div>
    </div>
  );
}

// Página de Manutenções
function ManutencoesPage({ template, manutencoes }: { template: TemplateConfig; manutencoes?: any[] }) {
  const items = manutencoes || [
    { protocolo: "MAN-001", titulo: "Manutenção preventiva", status: "realizada" },
    { protocolo: "MAN-002", titulo: "Troca de filtros", status: "pendente" },
    { protocolo: "MAN-003", titulo: "Revisão elétrica", status: "realizada" },
  ];

  return (
    <div
      className="h-full p-6 flex flex-col"
      style={{ background: template.colors.background }}
    >
      <div
        className="text-center mb-6 pb-4"
        style={{ borderBottom: template.effects.sectionDivider }}
      >
        <Wrench
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: "#64748B" }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            color: template.colors.foreground,
            fontFamily: template.typography.headingFont,
          }}
        >
          Manutenções
        </h2>
      </div>
      
      <div className="flex-1 space-y-3 overflow-auto">
        {items.slice(0, 5).map((item, i) => (
          <div
            key={i}
            className="p-3 rounded-lg border-l-4"
            style={{
              background: template.colors.card,
              borderLeftColor: item.status === "realizada" || item.status === "finalizada" 
                ? "#10B981" 
                : item.status === "pendente" 
                ? "#EAB308" 
                : template.colors.primary,
              boxShadow: template.components.cardShadow,
              borderRadius: template.components.borderRadius,
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <span
                  className="text-xs font-mono"
                  style={{ color: template.colors.mutedForeground }}
                >
                  {item.protocolo}
                </span>
                <h4
                  className="font-medium text-sm"
                  style={{ color: template.colors.foreground }}
                >
                  {item.titulo}
                </h4>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full capitalize"
                style={{
                  background: item.status === "realizada" || item.status === "finalizada"
                    ? "#10B98120"
                    : item.status === "pendente"
                    ? "#EAB30820"
                    : `${template.colors.primary}20`,
                  color: item.status === "realizada" || item.status === "finalizada"
                    ? "#10B981"
                    : item.status === "pendente"
                    ? "#EAB308"
                    : template.colors.primary,
                }}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Página de Vistorias
function VistoriasPage({ template, vistorias }: { template: TemplateConfig; vistorias?: any[] }) {
  const items = vistorias || [
    { protocolo: "VIS-001", titulo: "Vistoria técnica", status: "realizada" },
    { protocolo: "VIS-002", titulo: "Inspeção de segurança", status: "pendente" },
  ];

  return (
    <div
      className="h-full p-6 flex flex-col"
      style={{ background: template.colors.background }}
    >
      <div
        className="text-center mb-6 pb-4"
        style={{ borderBottom: template.effects.sectionDivider }}
      >
        <Search
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: "#10B981" }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            color: template.colors.foreground,
            fontFamily: template.typography.headingFont,
          }}
        >
          Vistorias
        </h2>
      </div>
      
      <div className="flex-1 space-y-3 overflow-auto">
        {items.slice(0, 5).map((item, i) => (
          <div
            key={i}
            className="p-3 rounded-lg border-l-4"
            style={{
              background: template.colors.card,
              borderLeftColor: item.status === "realizada" || item.status === "finalizada" 
                ? "#10B981" 
                : "#EAB308",
              boxShadow: template.components.cardShadow,
              borderRadius: template.components.borderRadius,
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <span
                  className="text-xs font-mono"
                  style={{ color: template.colors.mutedForeground }}
                >
                  {item.protocolo}
                </span>
                <h4
                  className="font-medium text-sm"
                  style={{ color: template.colors.foreground }}
                >
                  {item.titulo}
                </h4>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full capitalize"
                style={{
                  background: item.status === "realizada" || item.status === "finalizada"
                    ? "#10B98120"
                    : "#EAB30820",
                  color: item.status === "realizada" || item.status === "finalizada"
                    ? "#10B981"
                    : "#EAB308",
                }}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Página de Ocorrências
function OcorrenciasPage({ template, ocorrencias }: { template: TemplateConfig; ocorrencias?: any[] }) {
  const items = ocorrencias || [
    { protocolo: "OCO-001", titulo: "Vazamento identificado", status: "finalizada" },
    { protocolo: "OCO-002", titulo: "Ruído excessivo", status: "pendente" },
  ];

  return (
    <div
      className="h-full p-6 flex flex-col"
      style={{ background: template.colors.background }}
    >
      <div
        className="text-center mb-6 pb-4"
        style={{ borderBottom: template.effects.sectionDivider }}
      >
        <AlertTriangle
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: "#EAB308" }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            color: template.colors.foreground,
            fontFamily: template.typography.headingFont,
          }}
        >
          Ocorrências
        </h2>
      </div>
      
      <div className="flex-1 space-y-3 overflow-auto">
        {items.slice(0, 5).map((item, i) => (
          <div
            key={i}
            className="p-3 rounded-lg border-l-4"
            style={{
              background: template.colors.card,
              borderLeftColor: item.status === "finalizada" || item.status === "realizada"
                ? "#10B981" 
                : "#EAB308",
              boxShadow: template.components.cardShadow,
              borderRadius: template.components.borderRadius,
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <span
                  className="text-xs font-mono"
                  style={{ color: template.colors.mutedForeground }}
                >
                  {item.protocolo}
                </span>
                <h4
                  className="font-medium text-sm"
                  style={{ color: template.colors.foreground }}
                >
                  {item.titulo}
                </h4>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full capitalize"
                style={{
                  background: item.status === "finalizada" || item.status === "realizada"
                    ? "#10B98120"
                    : "#EAB30820",
                  color: item.status === "finalizada" || item.status === "realizada"
                    ? "#10B981"
                    : "#EAB308",
                }}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Página de Checklists
function ChecklistsPage({ template, checklists }: { template: TemplateConfig; checklists?: any[] }) {
  const items = checklists || [
    { protocolo: "CHK-001", titulo: "Checklist diário", status: "realizada" },
    { protocolo: "CHK-002", titulo: "Verificação semanal", status: "pendente" },
  ];

  return (
    <div
      className="h-full p-6 flex flex-col"
      style={{ background: template.colors.background }}
    >
      <div
        className="text-center mb-6 pb-4"
        style={{ borderBottom: template.effects.sectionDivider }}
      >
        <ClipboardCheck
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: "#14B8A6" }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            color: template.colors.foreground,
            fontFamily: template.typography.headingFont,
          }}
        >
          Checklists
        </h2>
      </div>
      
      <div className="flex-1 space-y-3 overflow-auto">
        {items.slice(0, 5).map((item, i) => (
          <div
            key={i}
            className="p-3 rounded-lg border-l-4"
            style={{
              background: template.colors.card,
              borderLeftColor: item.status === "realizada" || item.status === "finalizada"
                ? "#14B8A6" 
                : "#EAB308",
              boxShadow: template.components.cardShadow,
              borderRadius: template.components.borderRadius,
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <span
                  className="text-xs font-mono"
                  style={{ color: template.colors.mutedForeground }}
                >
                  {item.protocolo}
                </span>
                <h4
                  className="font-medium text-sm"
                  style={{ color: template.colors.foreground }}
                >
                  {item.titulo}
                </h4>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full capitalize"
                style={{
                  background: item.status === "realizada" || item.status === "finalizada"
                    ? "#14B8A620"
                    : "#EAB30820",
                  color: item.status === "realizada" || item.status === "finalizada"
                    ? "#14B8A6"
                    : "#EAB308",
                }}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Página de Antes e Depois
function AntesDepoisPage({ template, antesDepois }: { template: TemplateConfig; antesDepois?: any[] }) {
  const items = antesDepois || [
    { titulo: "Reforma do hall", fotoAntesUrl: null, fotoDepoisUrl: null },
    { titulo: "Pintura externa", fotoAntesUrl: null, fotoDepoisUrl: null },
  ];

  return (
    <div
      className="h-full p-6 flex flex-col"
      style={{ background: template.colors.background }}
    >
      <div
        className="text-center mb-6 pb-4"
        style={{ borderBottom: template.effects.sectionDivider }}
      >
        <ArrowLeftRight
          className="w-8 h-8 mx-auto mb-2"
          style={{ color: "#8B5CF6" }}
        />
        <h2
          className="text-xl font-bold"
          style={{
            color: template.colors.foreground,
            fontFamily: template.typography.headingFont,
          }}
        >
          Antes e Depois
        </h2>
      </div>
      
      <div className="flex-1 space-y-4 overflow-auto">
        {items.slice(0, 3).map((item, i) => (
          <div
            key={i}
            className="p-3 rounded-xl"
            style={{
              background: template.colors.secondary,
              borderRadius: template.components.borderRadius,
            }}
          >
            <h4
              className="font-medium text-sm mb-2 text-center"
              style={{ color: template.colors.foreground }}
            >
              {item.titulo}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div
                className="aspect-video rounded-lg flex items-center justify-center"
                style={{ background: template.colors.muted }}
              >
                {item.fotoAntesUrl ? (
                  <img src={item.fotoAntesUrl} alt="Antes" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-xs" style={{ color: template.colors.mutedForeground }}>Antes</span>
                )}
              </div>
              <div
                className="aspect-video rounded-lg flex items-center justify-center"
                style={{ background: template.colors.muted }}
              >
                {item.fotoDepoisUrl ? (
                  <img src={item.fotoDepoisUrl} alt="Depois" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-xs" style={{ color: template.colors.mutedForeground }}>Depois</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
