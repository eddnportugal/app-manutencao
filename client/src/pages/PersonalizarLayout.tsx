import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { useLocation } from "wouter";
import {
  Palette,
  Layout,
  Sun,
  Moon,
  Type,
  Check,
  ArrowLeft,
  Loader2,
  Sparkles,
  Download,
  Upload,
  Building2,
  Share2,
  History,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
} from "lucide-react";

type Tema = "laranja" | "azul" | "verde" | "roxo" | "vermelho" | "marrom" | "cinza";
type LayoutType = "classico" | "compacto" | "moderno";
type TamanhoFonte = "pequeno" | "medio" | "grande";

const TEMAS = [
  {
    id: "laranja" as Tema,
    nome: "Laranja (Padrão)",
    descricao: "Tema vibrante e energético",
    cor: "#F97316",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    id: "azul" as Tema,
    nome: "Azul Corporativo",
    descricao: "Profissional e confiável",
    cor: "#3B82F6",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "verde" as Tema,
    nome: "Verde Natureza",
    descricao: "Fresco e sustentável",
    cor: "#22C55E",
    gradient: "from-green-500 to-green-600",
  },
  {
    id: "roxo" as Tema,
    nome: "Roxo Elegante",
    descricao: "Sofisticado e moderno",
    cor: "#8B5CF6",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    id: "vermelho" as Tema,
    nome: "Vermelho Intenso",
    descricao: "Ousado e impactante",
    cor: "#EF4444",
    gradient: "from-red-500 to-red-600",
  },
  {
    id: "marrom" as Tema,
    nome: "Marrom Terra",
    descricao: "Natural e acolhedor",
    cor: "#92400E",
    gradient: "from-amber-700 to-amber-800",
  },
  {
    id: "cinza" as Tema,
    nome: "Cinza Profissional",
    descricao: "Neutro e elegante",
    cor: "#6B7280",
    gradient: "from-gray-500 to-gray-600",
  },
];

const LAYOUTS = [
  {
    id: "classico" as LayoutType,
    nome: "Clássico (Padrão)",
    descricao: "Layout equilibrado para uso geral",
    icone: "📐",
  },
  {
    id: "compacto" as LayoutType,
    nome: "Compacto",
    descricao: "Mais informações por tela",
    icone: "📊",
  },
  {
    id: "moderno" as LayoutType,
    nome: "Moderno",
    descricao: "Cards maiores, mais espaçamento",
    icone: "✨",
  },
];

const TAMANHOS_FONTE = [
  { id: "pequeno" as TamanhoFonte, nome: "Pequeno", tamanho: "14px" },
  { id: "medio" as TamanhoFonte, nome: "Médio (Padrão)", tamanho: "16px" },
  { id: "grande" as TamanhoFonte, nome: "Grande", tamanho: "18px" },
];

export default function PersonalizarLayout() {
  const [, navigate] = useLocation();
  const [tema, setTema] = useState<Tema>("laranja");
  const [layout, setLayout] = useState<LayoutType>("classico");
  const [modoEscuro, setModoEscuro] = useState(false);
  const [tamanhoFonte, setTamanhoFonte] = useState<TamanhoFonte>("medio");
  const [sidebarExpandida, setSidebarExpandida] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [usarTemaPersonalizado, setUsarTemaPersonalizado] = useState(false);
  const [temaPersonalizadoId, setTemaPersonalizadoId] = useState<number | null>(null);

  // Buscar preferências salvas
  const { data: preferencias, isLoading } = trpc.preferenciasLayout.get.useQuery();
  const { data: temasPersonalizadosList } = trpc.temasPersonalizados.list.useQuery();
  const saveHistoricoMutation = trpc.historicoTemas.save.useMutation();
  const saveMutation = trpc.preferenciasLayout.save.useMutation({
    onSuccess: () => {
      toast.success("Preferências salvas com sucesso!");
      setHasChanges(false);
      // Aplicar tema imediatamente
      applyTheme();
      // Salvar no histórico
      saveHistoricoMutation.mutate({
        tema: usarTemaPersonalizado ? "personalizado" : tema,
        layout,
        modoEscuro,
        tamanhoFonte,
        descricao: usarTemaPersonalizado ? `Tema personalizado com layout ${layout}` : `Tema ${tema} com layout ${layout}`,
      });
    },
    onError: () => {
      toast.error("Erro ao salvar preferências");
    },
  });

  // Carregar preferências quando disponíveis
  useEffect(() => {
    if (preferencias) {
      setTema(preferencias.tema as Tema);
      setLayout(preferencias.layout as LayoutType);
      setModoEscuro(preferencias.modoEscuro || false);
      setTamanhoFonte((preferencias.tamanhoFonte as TamanhoFonte) || "medio");
      setSidebarExpandida(preferencias.sidebarExpandida !== false);
      setUsarTemaPersonalizado(preferencias.usarTemaPersonalizado || false);
      setTemaPersonalizadoId(preferencias.temaPersonalizadoId || null);
    }
  }, [preferencias]);

  // Aplicar tema ao documento
  const applyTheme = () => {
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
    
    // Se usar tema personalizado
    if (usarTemaPersonalizado && temaPersonalizadoId && temasPersonalizadosList) {
      const temaPersonalizado = temasPersonalizadosList.find(t => t.id === temaPersonalizadoId);
      if (temaPersonalizado) {
        root.classList.add("tema-personalizado");
        
        // Converter hex para HSL e aplicar
        const hexToHsl = (hex: string): string => {
          hex = hex.replace(/^#/, "");
          const r = parseInt(hex.substring(0, 2), 16) / 255;
          const g = parseInt(hex.substring(2, 4), 16) / 255;
          const b = parseInt(hex.substring(4, 6), 16) / 255;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          let h = 0, s = 0;
          const l = (max + min) / 2;
          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
              case g: h = ((b - r) / d + 2) / 6; break;
              case b: h = ((r - g) / d + 4) / 6; break;
            }
          }
          return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
        };
        
        root.style.setProperty("--custom-primary", hexToHsl(temaPersonalizado.corPrimaria));
        root.style.setProperty("--custom-primary-foreground", "0 0% 100%");
        if (temaPersonalizado.corSecundaria) {
          root.style.setProperty("--custom-secondary", hexToHsl(temaPersonalizado.corSecundaria));
        }
        if (temaPersonalizado.corFundo) {
          root.style.setProperty("--custom-background", hexToHsl(temaPersonalizado.corFundo));
        }
        if (temaPersonalizado.corTexto) {
          root.style.setProperty("--custom-foreground", hexToHsl(temaPersonalizado.corTexto));
        }
      }
    } else {
      // Aplicar tema padrão
      if (tema !== "laranja") {
        root.classList.add(`tema-${tema}`);
      }
    }
    
    // Aplicar layout
    if (layout !== "classico") {
      root.classList.add(`layout-${layout}`);
    }
    
    // Aplicar tamanho de fonte
    if (tamanhoFonte === "pequeno") {
      root.classList.add("fonte-pequeno");
    } else if (tamanhoFonte === "grande") {
      root.classList.add("fonte-grande");
    }
    
    // Aplicar modo escuro
    if (modoEscuro) {
      root.classList.add("dark");
    }
    
    // Salvar no localStorage para persistência
    localStorage.setItem("app-tema", tema);
    localStorage.setItem("app-layout", layout);
    localStorage.setItem("app-modo-escuro", String(modoEscuro));
    localStorage.setItem("app-tamanho-fonte", tamanhoFonte);
    localStorage.setItem("app-sidebar-expandida", String(sidebarExpandida));
  };

  // Aplicar preview em tempo real
  useEffect(() => {
    applyTheme();
  }, [tema, layout, modoEscuro, tamanhoFonte, usarTemaPersonalizado, temaPersonalizadoId, temasPersonalizadosList]);

  const handleSave = () => {
    saveMutation.mutate({
      tema,
      layout,
      modoEscuro,
      tamanhoFonte,
      sidebarExpandida,
      usarTemaPersonalizado,
      temaPersonalizadoId,
    });
  };

  const handleReset = () => {
    setTema("laranja");
    setLayout("classico");
    setModoEscuro(false);
    setTamanhoFonte("medio");
    setSidebarExpandida(true);
    setUsarTemaPersonalizado(false);
    setTemaPersonalizadoId(null);
    setHasChanges(true);
  };

  // Função para aplicar tema personalizado
  const handleApplyCustomTheme = (id: number) => {
    setUsarTemaPersonalizado(true);
    setTemaPersonalizadoId(id);
    setHasChanges(true);
  };

  // Função para voltar ao tema padrão
  const handleUseDefaultTheme = () => {
    setUsarTemaPersonalizado(false);
    setTemaPersonalizadoId(null);
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Personalizar Layout
              </h1>
              <p className="text-muted-foreground">
                Personalize a aparência do sistema de acordo com suas preferências
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Coluna de Configurações */}
          <div className="space-y-6">
            {/* Tema de Cores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Tema de Cores
                </CardTitle>
                <CardDescription>
                  Escolha a paleta de cores principal do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={tema}
                  onValueChange={(value) => {
                    setTema(value as Tema);
                    setHasChanges(true);
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  {TEMAS.map((t) => (
                    <div key={t.id} className="relative group">
                      <RadioGroupItem
                        value={t.id}
                        id={`tema-${t.id}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`tema-${t.id}`}
                        className="flex flex-col gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:scale-[1.02] peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-md"
                      >
                        {/* Preview Visual do Tema */}
                        <div className="relative w-full h-24 rounded-lg overflow-hidden border bg-card">
                          {/* Header do preview */}
                          <div
                            className="h-6 w-full flex items-center px-2 gap-1"
                            style={{ backgroundColor: t.cor }}
                          >
                            <div className="w-2 h-2 rounded-full bg-white/30" />
                            <div className="w-2 h-2 rounded-full bg-white/30" />
                            <div className="w-2 h-2 rounded-full bg-white/30" />
                          </div>
                          {/* Conteúdo do preview */}
                          <div className="p-2 flex gap-2">
                            {/* Sidebar mini */}
                            <div
                              className="w-6 h-14 rounded"
                              style={{ backgroundColor: `${t.cor}20` }}
                            >
                              <div
                                className="w-4 h-1.5 rounded mx-auto mt-1"
                                style={{ backgroundColor: t.cor }}
                              />
                              <div className="w-4 h-1 rounded mx-auto mt-1 bg-muted" />
                              <div className="w-4 h-1 rounded mx-auto mt-1 bg-muted" />
                            </div>
                            {/* Conteúdo mini */}
                            <div className="flex-1 space-y-1">
                              <div
                                className="h-2 w-16 rounded"
                                style={{ backgroundColor: t.cor }}
                              />
                              <div className="h-1.5 w-full rounded bg-muted" />
                              <div className="h-1.5 w-3/4 rounded bg-muted" />
                              <div className="flex gap-1 mt-2">
                                <div
                                  className="h-3 w-8 rounded text-[6px] flex items-center justify-center text-white"
                                  style={{ backgroundColor: t.cor }}
                                >
                                  Botão
                                </div>
                                <div className="h-3 w-8 rounded border text-[6px] flex items-center justify-center text-muted-foreground">
                                  Botão
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* Badge de seleção */}
                          {tema === t.id && (
                            <div
                              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: t.cor }}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        {/* Nome e descrição */}
                        <div className="text-center">
                          <p className="font-medium flex items-center justify-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: t.cor }}
                            />
                            {t.nome}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.descricao}
                          </p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Tipo de Layout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5 text-primary" />
                  Tipo de Layout
                </CardTitle>
                <CardDescription>
                  Escolha como as informações são organizadas na tela
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={layout}
                  onValueChange={(value) => {
                    setLayout(value as LayoutType);
                    setHasChanges(true);
                  }}
                  className="space-y-3"
                >
                  {LAYOUTS.map((l) => (
                    <div key={l.id} className="relative">
                      <RadioGroupItem
                        value={l.id}
                        id={`layout-${l.id}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`layout-${l.id}`}
                        className="flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <span className="text-2xl">{l.icone}</span>
                        <div className="flex-1">
                          <p className="font-medium">{l.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {l.descricao}
                          </p>
                        </div>
                        {layout === l.id && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Tamanho da Fonte */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary" />
                  Tamanho da Fonte
                </CardTitle>
                <CardDescription>
                  Ajuste o tamanho do texto para melhor leitura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={tamanhoFonte}
                  onValueChange={(value) => {
                    setTamanhoFonte(value as TamanhoFonte);
                    setHasChanges(true);
                  }}
                  className="flex gap-4"
                >
                  {TAMANHOS_FONTE.map((t) => (
                    <div key={t.id} className="flex-1">
                      <RadioGroupItem
                        value={t.id}
                        id={`fonte-${t.id}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`fonte-${t.id}`}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <span
                          className="font-medium"
                          style={{ fontSize: t.tamanho }}
                        >
                          Aa
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t.nome}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Modo Escuro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {modoEscuro ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                  Modo de Exibição
                </CardTitle>
                <CardDescription>
                  Alterne entre modo claro e escuro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <Sun className="w-5 h-5 text-amber-500" />
                    <span>Modo Claro</span>
                  </div>
                  <Switch
                    checked={modoEscuro}
                    onCheckedChange={(checked) => {
                      setModoEscuro(checked);
                      setHasChanges(true);
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <span>Modo Escuro</span>
                    <Moon className="w-5 h-5 text-indigo-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna de Preview */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Preview em Tempo Real</CardTitle>
                <CardDescription>
                  Veja como suas escolhas afetam a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Preview Card */}
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">Card de Exemplo</p>
                        <p className="text-sm text-muted-foreground">
                          Visualize as cores aplicadas
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Botão Primário</Button>
                      <Button size="sm" variant="outline">
                        Secundário
                      </Button>
                    </div>
                  </div>

                  {/* Preview Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-card border">
                      <p className="text-2xl font-bold text-primary">42</p>
                      <p className="text-sm text-muted-foreground">Vistorias</p>
                    </div>
                    <div className="p-4 rounded-xl bg-card border">
                      <p className="text-2xl font-bold text-primary">18</p>
                      <p className="text-sm text-muted-foreground">Pendentes</p>
                    </div>
                  </div>

                  {/* Preview Text */}
                  <div className="p-4 rounded-xl bg-muted/50">
                    <h3 className="font-semibold mb-2">Título de Exemplo</h3>
                    <p className="text-sm text-muted-foreground">
                      Este é um texto de exemplo para você visualizar como o
                      tamanho da fonte e as cores afetam a legibilidade do
                      conteúdo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões de Ação */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleReset}
              >
                Restaurar Padrão
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Salvar Preferências
                  </>
                )}
              </Button>
            </div>

            {hasChanges && (
              <p className="text-sm text-center text-amber-600">
                Você tem alterações não salvas
              </p>
            )}

            {/* Exportar/Importar Configurações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  Exportar / Importar
                </CardTitle>
                <CardDescription>
                  Salve ou carregue suas configurações de personalização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const config = {
                        tema,
                        layout,
                        modoEscuro,
                        tamanhoFonte,
                        sidebarExpandida,
                        exportadoEm: new Date().toISOString(),
                        versao: "1.0",
                      };
                      const blob = new Blob([JSON.stringify(config, null, 2)], {
                        type: "application/json",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `app-manutencao-tema-${new Date().toISOString().split("T")[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("Configurações exportadas com sucesso!");
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".json";
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const config = JSON.parse(
                                event.target?.result as string
                              );
                              if (config.tema) setTema(config.tema);
                              if (config.layout) setLayout(config.layout);
                              if (typeof config.modoEscuro === "boolean")
                                setModoEscuro(config.modoEscuro);
                              if (config.tamanhoFonte)
                                setTamanhoFonte(config.tamanhoFonte);
                              if (typeof config.sidebarExpandida === "boolean")
                                setSidebarExpandida(config.sidebarExpandida);
                              setHasChanges(true);
                              toast.success(
                                "Configurações importadas! Clique em Salvar para aplicar."
                              );
                            } catch {
                              toast.error(
                                "Arquivo inválido. Verifique o formato JSON."
                              );
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Importar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tema Padrão da Organização */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Tema da Organização
                </CardTitle>
                <CardDescription>
                  Defina o tema padrão para todos os membros da sua organização
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Como gestor, você pode definir um tema padrão que será aplicado
                  automaticamente para novos membros da equipe. Acesse as
                  configurações da organização para definir o tema padrão.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/dashboard/organizacao")}
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Configurar Tema da Organização
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção de Histórico e Temas Personalizados */}
        <div className="container py-8 border-t">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Histórico de Temas */}
            <HistoricoTemasSection 
              onRestaurar={(config) => {
                setTema(config.tema as Tema);
                setLayout(config.layout as LayoutType);
                setModoEscuro(config.modoEscuro);
                setTamanhoFonte(config.tamanhoFonte as TamanhoFonte);
                setHasChanges(true);
              }}
            />

            {/* Temas Personalizados */}
            <TemasPersonalizadosSection 
              onApplyTheme={handleApplyCustomTheme}
              onUseDefault={handleUseDefaultTheme}
              activeThemeId={usarTemaPersonalizado ? temaPersonalizadoId : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Histórico de Temas
function HistoricoTemasSection({ onRestaurar }: { onRestaurar: (config: { tema: string; layout: string; modoEscuro: boolean; tamanhoFonte: string }) => void }) {
  const { data: historico, isLoading } = trpc.historicoTemas.list.useQuery();
  const restaurarMutation = trpc.historicoTemas.restaurar.useMutation({
    onSuccess: () => {
      toast.success("Tema restaurado com sucesso!");
    },
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTemaCor = (tema: string) => {
    const cores: Record<string, string> = {
      laranja: "#F97316",
      azul: "#3B82F6",
      verde: "#22C55E",
      roxo: "#8B5CF6",
      vermelho: "#EF4444",
      marrom: "#92400E",
      cinza: "#6B7280",
    };
    return cores[tema] || "#F97316";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Histórico de Temas
        </CardTitle>
        <CardDescription>
          Restaure configurações anteriores com um clique
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !historico || historico.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum histórico ainda</p>
            <p className="text-sm">Suas alterações de tema aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {historico.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getTemaCor(item.tema) }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate capitalize">
                    {item.tema} - {item.layout}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onRestaurar({
                      tema: item.tema,
                      layout: item.layout,
                      modoEscuro: item.modoEscuro || false,
                      tamanhoFonte: item.tamanhoFonte || "medio",
                    });
                    restaurarMutation.mutate({ id: item.id });
                  }}
                  disabled={restaurarMutation.isPending}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de Temas Personalizados
interface TemasPersonalizadosSectionProps {
  onApplyTheme: (id: number) => void;
  onUseDefault: () => void;
  activeThemeId: number | null;
}

function TemasPersonalizadosSection({ onApplyTheme, onUseDefault, activeThemeId }: TemasPersonalizadosSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [corPrimaria, setCorPrimaria] = useState("#F97316");
  const [corSecundaria, setCorSecundaria] = useState("#10B981");
  const [corFundo, setCorFundo] = useState("#FFFFFF");
  const [corTexto, setCorTexto] = useState("#1F2937");

  const utils = trpc.useUtils();
  const { data: temas, isLoading } = trpc.temasPersonalizados.list.useQuery();
  
  const createMutation = trpc.temasPersonalizados.create.useMutation({
    onSuccess: () => {
      toast.success("Tema criado com sucesso!");
      resetForm();
      utils.temasPersonalizados.list.invalidate();
    },
  });

  const updateMutation = trpc.temasPersonalizados.update.useMutation({
    onSuccess: () => {
      toast.success("Tema atualizado com sucesso!");
      resetForm();
      utils.temasPersonalizados.list.invalidate();
    },
  });

  const deleteMutation = trpc.temasPersonalizados.delete.useMutation({
    onSuccess: () => {
      toast.success("Tema excluído com sucesso!");
      utils.temasPersonalizados.list.invalidate();
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setNome("");
    setCorPrimaria("#F97316");
    setCorSecundaria("#10B981");
    setCorFundo("#FFFFFF");
    setCorTexto("#1F2937");
  };

  const handleEdit = (tema: { id: number; nome: string; corPrimaria: string; corSecundaria: string | null; corFundo: string | null; corTexto: string | null }) => {
    setEditingId(tema.id);
    setNome(tema.nome);
    setCorPrimaria(tema.corPrimaria);
    setCorSecundaria(tema.corSecundaria || "#10B981");
    setCorFundo(tema.corFundo || "#FFFFFF");
    setCorTexto(tema.corTexto || "#1F2937");
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!nome.trim()) {
      toast.error("Digite um nome para o tema");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        nome,
        corPrimaria,
        corSecundaria,
        corFundo,
        corTexto,
      });
    } else {
      createMutation.mutate({
        nome,
        corPrimaria,
        corSecundaria,
        corFundo,
        corTexto,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Temas Personalizados
        </CardTitle>
        <CardDescription>
          Crie seus próprios temas com cores customizadas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome-tema">Nome do Tema</Label>
              <input
                id="nome-tema"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Meu Tema Personalizado"
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cor Primária</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={corPrimaria}
                    onChange={(e) => setCorPrimaria(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
              <div>
                <Label>Cor Secundária</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={corSecundaria}
                    onChange={(e) => setCorSecundaria(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={corSecundaria}
                    onChange={(e) => setCorSecundaria(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
              <div>
                <Label>Cor de Fundo</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={corFundo}
                    onChange={(e) => setCorFundo(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={corFundo}
                    onChange={(e) => setCorFundo(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
              <div>
                <Label>Cor do Texto</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={corTexto}
                    onChange={(e) => setCorTexto(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={corTexto}
                    onChange={(e) => setCorTexto(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Preview do tema */}
            <div className="p-4 rounded-lg border" style={{ backgroundColor: corFundo }}>
              <p className="font-semibold mb-2" style={{ color: corTexto }}>
                Preview do Tema
              </p>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: corPrimaria }}
                >
                  Botão Primário
                </button>
                <button
                  className="px-3 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: corSecundaria }}
                >
                  Botão Secundário
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetForm}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingId ? (
                  "Atualizar"
                ) : (
                  "Criar Tema"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button
              variant="outline"
              className="w-full mb-4"
              onClick={() => setShowForm(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Tema
            </Button>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !temas || temas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum tema personalizado</p>
                <p className="text-sm">Crie seu primeiro tema customizado</p>
              </div>
            ) : (
              <>
              {/* Botão para voltar ao tema padrão */}
              {activeThemeId && (
                <Button
                  variant="outline"
                  className="w-full mb-4 border-primary text-primary hover:bg-primary/10"
                  onClick={onUseDefault}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Voltar ao Tema Padrão
                </Button>
              )}

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {temas.map((tema) => (
                  <div
                    key={tema.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors ${activeThemeId === tema.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                  >
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: tema.corPrimaria }}
                      />
                      {tema.corSecundaria && (
                        <div
                          className="w-6 h-6 rounded-full -ml-2"
                          style={{ backgroundColor: tema.corSecundaria }}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{tema.nome}</p>
                        {activeThemeId === tema.id && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Ativo</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tema.corPrimaria}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {activeThemeId !== tema.id && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => onApplyTheme(tema.id)}
                          title="Aplicar tema"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(tema)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate({ id: tema.id })}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
