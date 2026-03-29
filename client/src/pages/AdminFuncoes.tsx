import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { 
  Settings, 
  Building2, 
  Loader2, 
  Shield,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Megaphone,
  Calendar,
  Wrench,
  Users,
  Vote,
  FileText,
  Image,
  BarChart3,
  BookOpen,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

// Ícones por categoria
const CATEGORIA_ICONS: Record<string, any> = {
  comunicacao: Megaphone,
  agenda: Calendar,
  operacional: Wrench,
  interativo: Vote,
  documentacao: FileText,
  midia: Image,
  publicidade: Building2,
  projetos: BookOpen,
  gestao: Users,
  relatorios: BarChart3,
};

// Cores por categoria
const CATEGORIA_COLORS: Record<string, string> = {
  comunicacao: "bg-blue-100 text-blue-700 border-blue-200",
  agenda: "bg-purple-100 text-purple-700 border-purple-200",
  operacional: "bg-orange-100 text-orange-700 border-orange-200",
  interativo: "bg-green-100 text-green-700 border-green-200",
  documentacao: "bg-gray-100 text-gray-700 border-gray-200",
  midia: "bg-pink-100 text-pink-700 border-pink-200",
  publicidade: "bg-yellow-100 text-yellow-700 border-yellow-200",
  projetos: "bg-indigo-100 text-indigo-700 border-indigo-200",
  gestao: "bg-teal-100 text-teal-700 border-teal-200",
  relatorios: "bg-red-100 text-red-700 border-red-200",
};

// Nomes das categorias
const CATEGORIA_NAMES: Record<string, string> = {
  comunicacao: "Comunicação",
  agenda: "Agenda e Eventos",
  operacional: "Operacional",
  interativo: "Interativo/Comunidade",
  documentacao: "Documentação",
  midia: "Galeria e Mídia",
  publicidade: "Publicidade",
  projetos: "Projetos",
  gestao: "Gestão",
  relatorios: "Relatórios",
};

export default function AdminFuncoesPage() {
  const [selectedCondominio, setSelectedCondominio] = useState<number | null>(null);
  const [localFuncoes, setLocalFuncoes] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Buscar condomínios
  const { data: condominios, isLoading: loadingCondominios } = trpc.condominio.list.useQuery();
  
  // Buscar funções disponíveis
  const { data: funcoesDisponiveis } = trpc.funcoesCondominio.listarDisponiveis.useQuery();
  
  // Buscar funções da organização selecionado
  const { data: funcoesCondominio, isLoading: loadingFuncoes, refetch: refetchFuncoes } = 
    trpc.funcoesCondominio.listar.useQuery(
      { condominioId: selectedCondominio! },
      { enabled: !!selectedCondominio }
    );

  // Mutation para atualizar múltiplas funções
  const atualizarMultiplas = trpc.funcoesCondominio.atualizarMultiplas.useMutation({
    onSuccess: () => {
      toast.success("Funções atualizadas com sucesso!");
      setHasChanges(false);
      refetchFuncoes();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar funções: " + error.message);
    },
  });

  // Mutation para inicializar funções
  const inicializar = trpc.funcoesCondominio.inicializar.useMutation({
    onSuccess: (data) => {
      if (data.initialized) {
        toast.success(`${data.count} funções inicializadas!`);
      } else {
        toast.info(data.message || "Funções já inicializadas");
      }
      refetchFuncoes();
    },
    onError: (error) => {
      toast.error("Erro ao inicializar: " + error.message);
    },
  });

  // Quando seleciona uma organização, carregar estado das funções
  const handleSelectCondominio = (value: string) => {
    const id = parseInt(value);
    setSelectedCondominio(id);
    setLocalFuncoes({});
    setHasChanges(false);
  };

  // Quando as funções da organização são carregadas, atualizar estado local
  const getFuncaoHabilitada = (funcaoId: string): boolean => {
    // Se há alteração local, usar ela
    if (localFuncoes[funcaoId] !== undefined) {
      return localFuncoes[funcaoId];
    }
    // Se há registro no banco, usar ele
    const registro = funcoesCondominio?.find(f => f.funcaoId === funcaoId);
    if (registro) {
      return registro.habilitada;
    }
    // Por padrão, todas habilitadas
    return true;
  };

  // Toggle de função
  const handleToggle = (funcaoId: string, habilitada: boolean) => {
    setLocalFuncoes(prev => ({ ...prev, [funcaoId]: habilitada }));
    setHasChanges(true);
  };

  // Salvar alterações
  const handleSave = () => {
    if (!selectedCondominio || !funcoesDisponiveis) return;
    
    const funcoes = funcoesDisponiveis.map(f => ({
      funcaoId: f.id,
      habilitada: getFuncaoHabilitada(f.id),
    }));
    
    atualizarMultiplas.mutate({
      condominioId: selectedCondominio,
      funcoes,
    });
  };

  // Habilitar todas
  const handleEnableAll = () => {
    if (!funcoesDisponiveis) return;
    const newState: Record<string, boolean> = {};
    funcoesDisponiveis.forEach(f => { newState[f.id] = true; });
    setLocalFuncoes(newState);
    setHasChanges(true);
  };

  // Desabilitar todas
  const handleDisableAll = () => {
    if (!funcoesDisponiveis) return;
    const newState: Record<string, boolean> = {};
    funcoesDisponiveis.forEach(f => { newState[f.id] = false; });
    setLocalFuncoes(newState);
    setHasChanges(true);
  };

  // Agrupar funções por categoria
  const funcoesPorCategoria = funcoesDisponiveis?.reduce((acc, funcao) => {
    const cat = funcao.categoria;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(funcao);
    return acc;
  }, {} as Record<string, Array<{ id: string; nome: string; categoria: string; descricao: string }>>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Gestão de Funções</h1>
                <p className="text-sm text-muted-foreground">Administração do Sistema</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Seletor de Condomínio */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Selecionar Condomínio
            </CardTitle>
            <CardDescription>
              Escolha a manutenção para gerenciar as funções habilitadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Campo de busca inteligente com autocomplete */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, código ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowResults(e.target.value.length > 0);
                  }}
                  onFocus={() => searchTerm.length > 0 && setShowResults(true)}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                  className="pl-10 w-full"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setShowResults(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
                
                {/* Resultados da busca em tempo real */}
                {showResults && searchTerm && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {loadingCondominios ? (
                      <div className="p-4 text-center">
                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      </div>
                    ) : (
                      <>
                        {condominios
                          ?.filter((cond) => {
                            const searchLower = searchTerm.toLowerCase();
                            const nomeMatch = cond.nome.toLowerCase().includes(searchLower);
                            const codigoMatch = cond.codigo?.toLowerCase().includes(searchLower) || false;
                            const cnpjMatch = cond.cnpj?.replace(/[^\d]/g, '').includes(searchTerm.replace(/[^\d]/g, '')) || false;
                            return nomeMatch || codigoMatch || cnpjMatch;
                          })
                          .map((cond) => {
                            const nome = cond.nome;
                            const searchLower = searchTerm.toLowerCase();
                            const nomeIndex = nome.toLowerCase().indexOf(searchLower);
                            const codigoMatch = cond.codigo?.toLowerCase().includes(searchLower);
                            const cnpjMatch = cond.cnpj?.replace(/[^\d]/g, '').includes(searchTerm.replace(/[^\d]/g, ''));
                            
                            return (
                              <button
                                key={cond.id}
                                type="button"
                                onClick={() => {
                                  setSelectedCondominio(cond.id);
                                  setSearchTerm(cond.nome);
                                  setShowResults(false);
                                  setLocalFuncoes({});
                                  setHasChanges(false);
                                }}
                                className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 flex flex-col gap-1 transition-colors ${
                                  selectedCondominio === cond.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm font-medium">
                                    {nomeIndex >= 0 ? (
                                      <>
                                        {nome.substring(0, nomeIndex)}
                                        <span className="bg-yellow-200">
                                          {nome.substring(nomeIndex, nomeIndex + searchTerm.length)}
                                        </span>
                                        {nome.substring(nomeIndex + searchTerm.length)}
                                      </>
                                    ) : (
                                      nome
                                    )}
                                  </span>
                                  {selectedCondominio === cond.id && (
                                    <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                                  )}
                                </div>
                                {(cond.codigo || cond.cnpj) && (
                                  <div className="flex items-center gap-3 ml-7 text-xs text-muted-foreground">
                                    {cond.codigo && (
                                      <span className={codigoMatch ? 'bg-yellow-100 px-1 rounded' : ''}>
                                        Cód: {cond.codigo}
                                      </span>
                                    )}
                                    {cond.cnpj && (
                                      <span className={cnpjMatch ? 'bg-yellow-100 px-1 rounded' : ''}>
                                        CNPJ: {cond.cnpj}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        {condominios?.filter((cond) => {
                          const searchLower = searchTerm.toLowerCase();
                          const nomeMatch = cond.nome.toLowerCase().includes(searchLower);
                          const codigoMatch = cond.codigo?.toLowerCase().includes(searchLower) || false;
                          const cnpjMatch = cond.cnpj?.replace(/[^\d]/g, '').includes(searchTerm.replace(/[^\d]/g, '')) || false;
                          return nomeMatch || codigoMatch || cnpjMatch;
                        }).length === 0 && (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            Nenhuma manutenção encontrada para "{searchTerm}"
                          </div>
                        )}
                        {condominios && condominios.filter((cond) => {
                          const searchLower = searchTerm.toLowerCase();
                          const nomeMatch = cond.nome.toLowerCase().includes(searchLower);
                          const codigoMatch = cond.codigo?.toLowerCase().includes(searchLower) || false;
                          const cnpjMatch = cond.cnpj?.replace(/[^\d]/g, '').includes(searchTerm.replace(/[^\d]/g, '')) || false;
                          return nomeMatch || codigoMatch || cnpjMatch;
                        }).length > 0 && (
                          <div className="px-4 py-2 bg-slate-50 text-xs text-muted-foreground border-t">
                            {condominios.filter((cond) => {
                              const searchLower = searchTerm.toLowerCase();
                              const nomeMatch = cond.nome.toLowerCase().includes(searchLower);
                              const codigoMatch = cond.codigo?.toLowerCase().includes(searchLower) || false;
                              const cnpjMatch = cond.cnpj?.replace(/[^\d]/g, '').includes(searchTerm.replace(/[^\d]/g, '')) || false;
                              return nomeMatch || codigoMatch || cnpjMatch;
                            }).length} condomínio(s) encontrado(s)
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* Condomínio selecionado */}
              {selectedCondominio && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <Building2 className="w-5 h-5 text-primary" />
                  <span className="font-medium text-sm">
                    {condominios?.find(c => c.id === selectedCondominio)?.nome}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCondominio(null);
                      setSearchTerm("");
                      setLocalFuncoes({});
                      setHasChanges(false);
                    }}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-4">

                {selectedCondominio && (
                  <Button
                    variant="outline"
                    onClick={() => inicializar.mutate({ condominioId: selectedCondominio })}
                    disabled={inicializar.isPending}
                  >
                    {inicializar.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Inicializar Funções
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Funções */}
        {selectedCondominio && (
          <>
            {/* Barra de ações */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleEnableAll}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Habilitar Todas
                </Button>
                <Button variant="outline" size="sm" onClick={handleDisableAll}>
                  <XCircle className="w-4 h-4 mr-1" />
                  Desabilitar Todas
                </Button>
              </div>
              
              {hasChanges && (
                <Button onClick={handleSave} disabled={atualizarMultiplas.isPending}>
                  {atualizarMultiplas.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Salvar Alterações
                </Button>
              )}
            </div>

            {loadingFuncoes ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-6">
                {funcoesPorCategoria && Object.entries(funcoesPorCategoria).map(([categoria, funcoes]) => {
                  const Icon = CATEGORIA_ICONS[categoria] || Settings;
                  const colorClass = CATEGORIA_COLORS[categoria] || "bg-gray-100 text-gray-700";
                  const categoryName = CATEGORIA_NAMES[categoria] || categoria;
                  
                  return (
                    <Card key={categoria}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {categoryName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {funcoes?.map((funcao) => {
                            const habilitada = getFuncaoHabilitada(funcao.id);
                            return (
                              <div
                                key={funcao.id}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                  habilitada 
                                    ? "bg-green-50 border-green-200" 
                                    : "bg-red-50 border-red-200"
                                }`}
                              >
                                <div>
                                  <p className="font-medium text-sm">{funcao.nome}</p>
                                  <p className="text-xs text-muted-foreground">{funcao.descricao}</p>
                                </div>
                                <Switch
                                  checked={habilitada}
                                  onCheckedChange={(checked) => handleToggle(funcao.id, checked)}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        {!selectedCondominio && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Selecione um Condomínio
              </h3>
              <p className="text-muted-foreground">
                Escolha uma manutenção acima para gerenciar as funções habilitadas
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
