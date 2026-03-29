import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TransitionSelector, { TransitionPreview } from "@/components/TransitionSelector";
import { transitions, TransitionEffect, getTransitionById } from "@/lib/pageTransitions";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Eye,
  Play,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function TransitionEffects() {
  const [selectedTransition, setSelectedTransition] = useState<TransitionEffect>("flip");
  const [currentPage, setCurrentPage] = useState(1);
  const [direction, setDirection] = useState(1);
  const transition = getTransitionById(selectedTransition);

  const totalPages = 5;

  const goToPage = (newDirection: number) => {
    setDirection(newDirection);
    if (newDirection > 0) {
      setCurrentPage((prev) => (prev % totalPages) + 1);
    } else {
      setCurrentPage((prev) => (prev === 1 ? totalPages : prev - 1));
    }
  };

  const pageContents = [
    {
      title: "Capa",
      color: "from-primary to-accent",
      content: "Residencial Jardins",
    },
    {
      title: "Mensagem",
      color: "from-blue-500 to-indigo-600",
      content: "Mensagem do Gestor",
    },
    {
      title: "Avisos",
      color: "from-amber-500 to-orange-600",
      content: "Avisos Importantes",
    },
    {
      title: "Eventos",
      color: "from-emerald-500 to-teal-600",
      content: "Agenda de Eventos",
    },
    {
      title: "Votações",
      color: "from-purple-500 to-pink-600",
      content: "Votações Ativas",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/templates">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-serif text-xl font-bold">Efeitos de Transição</h1>
                  <p className="text-sm text-muted-foreground">
                    Escolha como as páginas mudam
                  </p>
                </div>
              </div>
            </div>
            <Link href="/dashboard">
              <Button className="btn-magazine">
                Aplicar Efeito
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Seletor de Efeitos */}
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-2">
                Escolha um Efeito
              </h2>
              <p className="text-muted-foreground">
                Defina como as páginas da sua revista irão transicionar.
                Cada efeito oferece uma experiência visual única para a equipa.
              </p>
            </div>

            {/* Grid de Efeitos */}
            <div className="grid grid-cols-2 gap-4">
              {transitions.map((t) => (
                <motion.button
                  key={t.id}
                  onClick={() => setSelectedTransition(t.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTransition === t.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{t.icon}</span>
                    {selectedTransition === t.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm">{t.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {t.description}
                  </p>
                  <div className="mt-2 text-xs text-primary">
                    {t.duration}s de duração
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Detalhes do efeito selecionado */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif flex items-center gap-2">
                  <span className="text-2xl">{transition.icon}</span>
                  {transition.name}
                </CardTitle>
                <CardDescription>{transition.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="ml-2 font-medium">{transition.duration}s</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="ml-2 font-medium capitalize">
                      {transition.id === "flip" || transition.id === "cube" || transition.id === "swing"
                        ? "3D"
                        : "2D"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Interativo */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Pré-visualização
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Play className="w-4 h-4" />
                Use as setas para navegar
              </div>
            </div>

            {/* Preview da revista */}
            <div
              className="relative aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden bg-muted shadow-2xl"
              style={{ perspective: 1500 }}
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentPage}
                  custom={direction}
                  initial={transition.variants.enter(direction) as any}
                  animate={transition.variants.center as any}
                  exit={transition.variants.exit(direction) as any}
                  transition={{
                    duration: transition.duration,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="absolute inset-0"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Conteúdo da página */}
                  <div
                    className={`h-full flex flex-col bg-gradient-to-br ${pageContents[currentPage - 1].color}`}
                  >
                    {/* Header da página */}
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-white">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                      >
                        <span className="text-xs uppercase tracking-widest opacity-80">
                          {pageContents[currentPage - 1].title}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-serif font-bold mt-2">
                          {pageContents[currentPage - 1].content}
                        </h3>
                        <div className="w-16 h-1 bg-white/50 mx-auto mt-4 rounded-full" />
                      </motion.div>
                    </div>

                    {/* Footer da página */}
                    <div className="p-4 bg-black/20 text-white/80 text-center text-sm">
                      Página {currentPage} de {totalPages}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controles de navegação */}
              <div className="absolute bottom-20 left-0 right-0 flex items-center justify-center gap-4 z-10">
                <button
                  onClick={() => goToPage(-1)}
                  className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div className="px-4 py-2 rounded-full bg-white/90 shadow-lg">
                  <span className="text-sm font-medium text-gray-700">
                    {currentPage} / {totalPages}
                  </span>
                </div>
                <button
                  onClick={() => goToPage(1)}
                  className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ArrowRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Clique nas setas ou use o teclado para navegar entre as páginas
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container text-center">
          <p className="text-muted-foreground">
            Escolha o efeito que melhor representa a experiência da sua revista
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Link href="/templates">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Templates
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
