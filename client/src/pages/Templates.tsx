import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TemplateSelector, { TemplatePreview } from "@/components/TemplateSelector";
import MagazineWithTemplate from "@/components/MagazineWithTemplate";
import { templates, getTemplateById } from "@/lib/templates";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  Palette,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState("moderno");
  const [showPreview, setShowPreview] = useState(false);
  const template = getTemplateById(selectedTemplate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-serif text-xl font-bold">Templates</h1>
                  <p className="text-sm text-muted-foreground">
                    Escolha o estilo da sua revista
                  </p>
                </div>
              </div>
            </div>
            <Link href="/dashboard">
              <Button className="btn-magazine">
                Usar Template
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Seletor de Templates */}
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">
                Escolha um Template
              </h2>
              <p className="text-muted-foreground">
                Cada template oferece um visual único para sua revista digital.
                Selecione o que melhor representa o estilo da sua organização.
              </p>
            </div>

            {/* Cards de Templates */}
            <div className="space-y-4">
              {templates.map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTemplate === t.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-start gap-4">
                    {/* Mini preview */}
                    <div
                      className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-md"
                      style={{ background: t.effects.pageBackground }}
                    >
                      <div
                        className="h-2/5"
                        style={{ background: t.colors.gradient }}
                      />
                      <div
                        className="h-3/5 p-2"
                        style={{ background: t.colors.card }}
                      >
                        <div className="grid grid-cols-2 gap-1">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="aspect-square rounded"
                              style={{
                                background: i % 2 === 0 ? t.colors.muted : t.colors.secondary,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{t.name}</h3>
                        {selectedTemplate === t.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t.description}
                      </p>

                      {/* Paleta de cores */}
                      <div className="flex gap-2 mt-3">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ background: t.colors.primary }}
                          title="Cor primária"
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ background: t.colors.accent }}
                          title="Cor de destaque"
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ background: t.colors.secondary }}
                          title="Cor secundária"
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ background: t.colors.muted }}
                          title="Cor neutra"
                        />
                      </div>

                      {/* Características */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                          {t.typography.fontFamily.split(",")[0].replace(/'/g, "")}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                          {t.components.buttonStyle === "gradient" ? "Gradientes" : "Sólido"}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                          Bordas {t.components.borderRadius}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Detalhes do template selecionado */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Detalhes do Template
                </CardTitle>
                <CardDescription>
                  Características do template "{template.name}"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Tipografia</h4>
                    <p className="text-sm text-muted-foreground">
                      Títulos: {template.typography.headingFont.split(",")[0].replace(/'/g, "")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Corpo: {template.typography.fontFamily.split(",")[0].replace(/'/g, "")}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Estilo</h4>
                    <p className="text-sm text-muted-foreground">
                      Bordas: {template.components.borderRadius}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Botões: {template.components.buttonStyle}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Paleta Completa</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(template.colors).slice(0, 8).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border border-border"
                          style={{ background: value }}
                        />
                        <span className="text-xs text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview da Revista */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Pré-visualização
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? "Ver Estático" : "Ver Interativo"}
              </Button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedTemplate + showPreview}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {showPreview ? (
                  <MagazineWithTemplate
                    templateId={selectedTemplate}
                    revista={{
                      titulo: "Revista Digital",
                      edicao: "Edição Dezembro 2024",
                      condominioNome: "Residencial Jardins",
                    }}
                    className="max-w-md mx-auto"
                  />
                ) : (
                  <TemplatePreview
                    template={template}
                    className="max-w-md mx-auto"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <p className="text-center text-sm text-muted-foreground">
              {showPreview
                ? "Use as setas para navegar entre as páginas"
                : "Clique em 'Ver Interativo' para navegar na revista"}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container text-center">
          <p className="text-muted-foreground">
            Escolha o template perfeito para comunicar com a equipa da sua organização
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </Button>
            </Link>
            <Link href="/transicoes">
              <Button variant="outline">
                <Sparkles className="w-4 h-4 mr-2" />
                Efeitos de Transição
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="btn-magazine">
                Criar Minha Revista
                <BookOpen className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
