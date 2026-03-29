import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCondominioAtivo } from "@/hooks/useCondominioAtivo";
// DashboardLayout removido - agora renderizado dentro do Dashboard.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import SyncSoundSettings from "@/components/SyncSoundSettings";
import {
  Settings,
  Plus,
  Trash2,
  Edit,
  ArrowLeft,
  Tag,
  Flag,
  Circle,
  Building2,
  Zap,
  Droplets,
  TreePine,
  Sparkles,
  Paintbrush,
  Shield,
  MoreHorizontal,
  ArrowDown,
  Minus,
  ArrowUp,
  AlertTriangle,
  FolderOpen,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Wrench,
  Package,
  Save,
} from "lucide-react";

// Lista de ícones disponíveis
const iconOptions = [
  { name: "Zap", icon: Zap, label: "Elétrica" },
  { name: "Droplets", icon: Droplets, label: "Hidráulica" },
  { name: "Building2", icon: Building2, label: "Estrutural" },
  { name: "TreePine", icon: TreePine, label: "Jardinagem" },
  { name: "Sparkles", icon: Sparkles, label: "Limpeza" },
  { name: "Paintbrush", icon: Paintbrush, label: "Pintura" },
  { name: "Shield", icon: Shield, label: "Segurança" },
  { name: "Wrench", icon: Wrench, label: "Manutenção" },
  { name: "Package", icon: Package, label: "Material" },
  { name: "MoreHorizontal", icon: MoreHorizontal, label: "Outros" },
  { name: "Tag", icon: Tag, label: "Tag" },
  { name: "Flag", icon: Flag, label: "Bandeira" },
  { name: "Circle", icon: Circle, label: "Círculo" },
];

const prioridadeIconOptions = [
  { name: "ArrowDown", icon: ArrowDown, label: "Baixa" },
  { name: "Minus", icon: Minus, label: "Normal" },
  { name: "ArrowUp", icon: ArrowUp, label: "Alta" },
  { name: "AlertTriangle", icon: AlertTriangle, label: "Urgente" },
];

const statusIconOptions = [
  { name: "FolderOpen", icon: FolderOpen, label: "Aberta" },
  { name: "Circle", icon: Circle, label: "Em Análise" },
  { name: "CheckCircle", icon: CheckCircle, label: "Aprovada" },
  { name: "Wrench", icon: Wrench, label: "Em Execução" },
  { name: "Package", icon: Package, label: "Aguardando" },
  { name: "CheckCircle2", icon: CheckCircle2, label: "Concluída" },
  { name: "XCircle", icon: XCircle, label: "Cancelada" },
];

const corOptions = [
  { value: "#22c55e", label: "Verde" },
  { value: "#eab308", label: "Amarelo" },
  { value: "#a855f7", label: "Roxo" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#f97316", label: "Laranja" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#6b7280", label: "Cinza" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#ec4899", label: "Rosa" },
];

export default function OrdensServicoConfig() {
  const [, navigate] = useLocation();
  const { condominioAtivo } = useCondominioAtivo();
  const [activeTab, setActiveTab] = useState("categorias");
  
  // Modal states
  const [showAddCategoria, setShowAddCategoria] = useState(false);
  const [showAddPrioridade, setShowAddPrioridade] = useState(false);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [showAddSetor, setShowAddSetor] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [novaCategoria, setNovaCategoria] = useState({ nome: "", icone: "Zap", cor: "#22c55e" });
  const [novaPrioridade, setNovaPrioridade] = useState({ nome: "", icone: "Minus", cor: "#6b7280", nivel: 0 });
  const [novoStatus, setNovoStatus] = useState({ nome: "", icone: "Circle", cor: "#6b7280", isFinal: false });
  const [novoSetor, setNovoSetor] = useState({ nome: "", descricao: "" });

  // Queries
  const { data: categorias, refetch: refetchCategorias } = trpc.ordensServico.getCategorias.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: prioridades, refetch: refetchPrioridades } = trpc.ordensServico.getPrioridades.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: statusList, refetch: refetchStatus } = trpc.ordensServico.getStatus.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: setores, refetch: refetchSetores } = trpc.ordensServico.getSetores.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: configuracoes, refetch: refetchConfiguracoes } = trpc.ordensServico.getConfiguracoes.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  // Mutations
  const createCategoria = trpc.ordensServico.createCategoria.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!");
      setShowAddCategoria(false);
      setNovaCategoria({ nome: "", icone: "Zap", cor: "#22c55e" });
      refetchCategorias();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateCategoria = trpc.ordensServico.updateCategoria.useMutation({
    onSuccess: () => {
      toast.success("Categoria atualizada!");
      setEditingItem(null);
      refetchCategorias();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteCategoria = trpc.ordensServico.deleteCategoria.useMutation({
    onSuccess: () => {
      toast.success("Categoria excluída!");
      refetchCategorias();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const createPrioridade = trpc.ordensServico.createPrioridade.useMutation({
    onSuccess: () => {
      toast.success("Prioridade criada com sucesso!");
      setShowAddPrioridade(false);
      setNovaPrioridade({ nome: "", icone: "Minus", cor: "#6b7280", nivel: 0 });
      refetchPrioridades();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updatePrioridade = trpc.ordensServico.updatePrioridade.useMutation({
    onSuccess: () => {
      toast.success("Prioridade atualizada!");
      setEditingItem(null);
      refetchPrioridades();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deletePrioridade = trpc.ordensServico.deletePrioridade.useMutation({
    onSuccess: () => {
      toast.success("Prioridade excluída!");
      refetchPrioridades();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const createStatus = trpc.ordensServico.createStatus.useMutation({
    onSuccess: () => {
      toast.success("Status criado com sucesso!");
      setShowAddStatus(false);
      setNovoStatus({ nome: "", icone: "Circle", cor: "#6b7280", isFinal: false });
      refetchStatus();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateStatus = trpc.ordensServico.updateOsStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      setEditingItem(null);
      refetchStatus();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteStatus = trpc.ordensServico.deleteStatus.useMutation({
    onSuccess: () => {
      toast.success("Status excluído!");
      refetchStatus();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const createSetor = trpc.ordensServico.createSetor.useMutation({
    onSuccess: () => {
      toast.success("Setor criado com sucesso!");
      setShowAddSetor(false);
      setNovoSetor({ nome: "", descricao: "" });
      refetchSetores();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateSetor = trpc.ordensServico.updateSetor.useMutation({
    onSuccess: () => {
      toast.success("Setor atualizado!");
      setEditingItem(null);
      refetchSetores();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteSetor = trpc.ordensServico.deleteSetor.useMutation({
    onSuccess: () => {
      toast.success("Setor excluído!");
      refetchSetores();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateConfiguracoes = trpc.ordensServico.updateConfiguracoes.useMutation({
    onSuccess: () => {
      toast.success("Configurações atualizadas!");
      refetchConfiguracoes();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const getIconComponent = (iconName: string) => {
    const allIcons = [...iconOptions, ...prioridadeIconOptions, ...statusIconOptions];
    const found = allIcons.find(i => i.name === iconName);
    return found?.icon || Circle;
  };

  if (!condominioAtivo) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Selecione uma organização para continuar</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => navigate("/dashboard/ordens-servico")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <Settings className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white drop-shadow-sm truncate">
                Configurações de OS
              </h1>
              <p className="text-white/80 text-sm line-clamp-2">
                Personalize categorias, prioridades, status e setores
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 pb-24">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <ScrollArea className="w-full pb-4">
              <TabsList className="bg-white shadow-md rounded-xl p-1 mb-2 inline-flex min-w-full sm:grid sm:grid-cols-5 h-auto">
                <TabsTrigger 
                  value="categorias"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg flex-1 min-w-[120px] py-3"
                >
                  <Tag className="w-4 h-4 mr-2" />
                  Categorias
                </TabsTrigger>
                <TabsTrigger 
                  value="prioridades"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg flex-1 min-w-[120px] py-3"
                >
                  <Flag className="w-4 h-4 mr-2" />
                  Prioridades
                </TabsTrigger>
                <TabsTrigger 
                  value="status"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg flex-1 min-w-[100px] py-3"
                >
                  <Circle className="w-4 h-4 mr-2" />
                  Status
                </TabsTrigger>
                <TabsTrigger 
                  value="setores"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg flex-1 min-w-[100px] py-3"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Setores
                </TabsTrigger>
                <TabsTrigger 
                  value="geral"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-yellow-400 data-[state=active]:text-white rounded-lg flex-1 min-w-[100px] py-3"
                >
                <Settings className="w-4 h-4 mr-2" />
                Geral
              </TabsTrigger>
            </TabsList>
          </ScrollArea>

            {/* Tab Categorias */}
            <TabsContent value="categorias">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 w-full sm:w-auto text-left">Categorias de OS</h2>
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white w-full sm:w-auto"
                    onClick={() => setShowAddCategoria(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Categoria
                  </Button>
                </div>
                <div className="space-y-3">
                  {categorias?.map((cat) => {
                    const IconComp = getIconComponent(cat.icone || "Circle");
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: cat.cor || "#6b7280" }}
                          >
                            <IconComp className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-700">{cat.nome}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingItem({ type: "categoria", ...cat })}
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir esta categoria?")) {
                                deleteCategoria.mutate({ id: cat.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {(!categorias || categorias.length === 0) && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhuma categoria cadastrada. Clique em "Nova Categoria" para adicionar.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab Prioridades */}
            <TabsContent value="prioridades">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Prioridades de OS</h2>
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                    onClick={() => setShowAddPrioridade(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Prioridade
                  </Button>
                </div>
                <div className="space-y-3">
                  {prioridades?.map((pri) => {
                    const IconComp = getIconComponent(pri.icone || "Minus");
                    return (
                      <div
                        key={pri.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: pri.cor || "#6b7280" }}
                          >
                            <IconComp className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{pri.nome}</span>
                            <span className="ml-2 text-sm text-gray-400">Nível: {pri.nivel}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingItem({ type: "prioridade", ...pri })}
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir esta prioridade?")) {
                                deletePrioridade.mutate({ id: pri.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {(!prioridades || prioridades.length === 0) && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhuma prioridade cadastrada. Clique em "Nova Prioridade" para adicionar.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab Status */}
            <TabsContent value="status">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Status de OS</h2>
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                    onClick={() => setShowAddStatus(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Status
                  </Button>
                </div>
                <div className="space-y-3">
                  {statusList?.map((st) => {
                    const IconComp = getIconComponent(st.icone || "Circle");
                    return (
                      <div
                        key={st.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: st.cor || "#6b7280" }}
                          >
                            <IconComp className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">{st.nome}</span>
                            
                            {st.isFinal && (
                              <Badge className="ml-2 bg-green-100 text-green-700">Final</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingItem({ type: "status", ...st })}
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Tem certeza que deseja excluir este status?")) {
                                deleteStatus.mutate({ id: st.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {(!statusList || statusList.length === 0) && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum status cadastrado. Clique em "Novo Status" para adicionar.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab Setores */}
            <TabsContent value="setores">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Setores</h2>
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                    onClick={() => setShowAddSetor(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Setor
                  </Button>
                </div>
                <div className="space-y-3">
                  {setores?.map((setor) => (
                    <div
                      key={setor.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">{setor.nome}</span>
                          {setor.descricao && (
                            <p className="text-sm text-gray-500">{setor.descricao}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingItem({ type: "setor", ...setor })}
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este setor?")) {
                              deleteSetor.mutate({ id: setor.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!setores || setores.length === 0) && (
                    <p className="text-center text-gray-500 py-8">
                      Nenhum setor cadastrado. Clique em "Novo Setor" para adicionar.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab Geral */}
            <TabsContent value="geral">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Configurações Gerais</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <Label className="text-gray-700 font-medium">Orçamentos</Label>
                      <p className="text-sm text-gray-500">Habilitar gestão de orçamentos nas OS</p>
                    </div>
                    <Switch
                      checked={configuracoes?.habilitarOrcamentos || false}
                      onCheckedChange={(checked) => {
                        updateConfiguracoes.mutate({
                          condominioId: condominioAtivo.id,
                          habilitarOrcamentos: checked,
                        });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <Label className="text-gray-700 font-medium">Aprovação de Orçamento</Label>
                      <p className="text-sm text-gray-500">Exigir aprovação do gestor para orçamentos</p>
                    </div>
                    <Switch
                      checked={configuracoes?.habilitarAprovacaoOrcamento || false}
                      onCheckedChange={(checked) => {
                        updateConfiguracoes.mutate({
                          condominioId: condominioAtivo.id,
                          habilitarAprovacaoOrcamento: checked,
                        });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <Label className="text-gray-700 font-medium">Gestão Financeira</Label>
                      <p className="text-sm text-gray-500">Controle de valores estimados e reais</p>
                    </div>
                    <Switch
                      checked={configuracoes?.habilitarGestaoFinanceira || false}
                      onCheckedChange={(checked) => {
                        updateConfiguracoes.mutate({
                          condominioId: condominioAtivo.id,
                          habilitarGestaoFinanceira: checked,
                        });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <Label className="text-gray-700 font-medium">Relatórios de Gastos</Label>
                      <p className="text-sm text-gray-500">Gerar relatórios mensais de gastos</p>
                    </div>
                    <Switch
                      checked={configuracoes?.habilitarRelatoriosGastos || false}
                      onCheckedChange={(checked) => {
                        updateConfiguracoes.mutate({
                          condominioId: condominioAtivo.id,
                          habilitarRelatoriosGastos: checked,
                        });
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <Label className="text-gray-700 font-medium">Vínculo com Manutenção</Label>
                      <p className="text-sm text-gray-500">Permitir vincular OS a manutenções existentes</p>
                    </div>
                    <Switch
                      checked={configuracoes?.habilitarVinculoManutencao || false}
                      onCheckedChange={(checked) => {
                        updateConfiguracoes.mutate({
                          condominioId: condominioAtivo.id,
                          habilitarVinculoManutencao: checked,
                        });
                      }}
                    />
                  </div>
                </div>

                {/* Sons de Sincronização */}
                <div className="mt-8">
                  <SyncSoundSettings />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal Nova Categoria */}
        <Dialog open={showAddCategoria} onOpenChange={setShowAddCategoria}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  Nova Categoria
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  placeholder="Ex: Elétrica"
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <Select
                  value={novaCategoria.icone}
                  onValueChange={(v) => setNovaCategoria({ ...novaCategoria, icone: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((opt) => (
                      <SelectItem key={opt.name} value={opt.name}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cor</Label>
                <Select
                  value={novaCategoria.cor}
                  onValueChange={(v) => setNovaCategoria({ ...novaCategoria, cor: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {corOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: opt.value }} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddCategoria(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                  onClick={() => {
                    if (!novaCategoria.nome.trim()) {
                      toast.error("Nome é obrigatório");
                      return;
                    }
                    createCategoria.mutate({
                      condominioId: condominioAtivo.id,
                      nome: novaCategoria.nome,
                      icone: novaCategoria.icone,
                      cor: novaCategoria.cor,
                    });
                  }}
                  disabled={createCategoria.isPending}
                >
                  {createCategoria.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Nova Prioridade */}
        <Dialog open={showAddPrioridade} onOpenChange={setShowAddPrioridade}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  Nova Prioridade
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  placeholder="Ex: Urgente"
                  value={novaPrioridade.nome}
                  onChange={(e) => setNovaPrioridade({ ...novaPrioridade, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <Select
                  value={novaPrioridade.icone}
                  onValueChange={(v) => setNovaPrioridade({ ...novaPrioridade, icone: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridadeIconOptions.map((opt) => (
                      <SelectItem key={opt.name} value={opt.name}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cor</Label>
                <Select
                  value={novaPrioridade.cor}
                  onValueChange={(v) => setNovaPrioridade({ ...novaPrioridade, cor: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {corOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: opt.value }} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nível</Label>
                <Input
                  type="number"
                  min="1"
                  value={novaPrioridade.nivel}
                  onChange={(e) => setNovaPrioridade({ ...novaPrioridade, nivel: parseInt(e.target.value) || 1 })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddPrioridade(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                  onClick={() => {
                    if (!novaPrioridade.nome.trim()) {
                      toast.error("Nome é obrigatório");
                      return;
                    }
                    createPrioridade.mutate({
                      condominioId: condominioAtivo.id,
                      nome: novaPrioridade.nome,
                      icone: novaPrioridade.icone,
                      cor: novaPrioridade.cor,
                      nivel: novaPrioridade.nivel,
                    });
                  }}
                  disabled={createPrioridade.isPending}
                >
                  {createPrioridade.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Novo Status */}
        <Dialog open={showAddStatus} onOpenChange={setShowAddStatus}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  Novo Status
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  placeholder="Ex: Em Execução"
                  value={novoStatus.nome}
                  onChange={(e) => setNovoStatus({ ...novoStatus, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <Select
                  value={novoStatus.icone}
                  onValueChange={(v) => setNovoStatus({ ...novoStatus, icone: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusIconOptions.map((opt) => (
                      <SelectItem key={opt.name} value={opt.name}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cor</Label>
                <Select
                  value={novoStatus.cor}
                  onValueChange={(v) => setNovoStatus({ ...novoStatus, cor: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {corOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: opt.value }} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={novoStatus.isFinal}
                  onCheckedChange={(checked) => setNovoStatus({ ...novoStatus, isFinal: checked })}
                />
                <Label>Status Final (encerra a OS)</Label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddStatus(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                  onClick={() => {
                    if (!novoStatus.nome.trim()) {
                      toast.error("Nome é obrigatório");
                      return;
                    }
                    createStatus.mutate({
                      condominioId: condominioAtivo.id,
                      nome: novoStatus.nome,
                      icone: novoStatus.icone,
                      cor: novoStatus.cor,
                      isFinal: novoStatus.isFinal,
                    });
                  }}
                  disabled={createStatus.isPending}
                >
                  {createStatus.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Novo Setor */}
        <Dialog open={showAddSetor} onOpenChange={setShowAddSetor}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  Novo Setor
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome *</Label>
                <Input
                  placeholder="Ex: Portaria"
                  value={novoSetor.nome}
                  onChange={(e) => setNovoSetor({ ...novoSetor, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  placeholder="Descrição opcional"
                  value={novoSetor.descricao}
                  onChange={(e) => setNovoSetor({ ...novoSetor, descricao: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddSetor(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                  onClick={() => {
                    if (!novoSetor.nome.trim()) {
                      toast.error("Nome é obrigatório");
                      return;
                    }
                    createSetor.mutate({
                      condominioId: condominioAtivo.id,
                      nome: novoSetor.nome,
                      descricao: novoSetor.descricao || undefined,
                    });
                  }}
                  disabled={createSetor.isPending}
                >
                  {createSetor.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Item */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  Editar {editingItem?.type === "categoria" ? "Categoria" : 
                        editingItem?.type === "prioridade" ? "Prioridade" :
                        editingItem?.type === "status" ? "Status" : "Setor"}
                </DialogTitle>
              </DialogHeader>
            </div>
            {editingItem && (
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={editingItem.nome}
                    onChange={(e) => setEditingItem({ ...editingItem, nome: e.target.value })}
                    className="mt-1 border-amber-200"
                  />
                </div>
                
                {editingItem.type !== "setor" && (
                  <>
                    <div>
                      <Label>Ícone</Label>
                      <Select
                        value={editingItem.icone || "Circle"}
                        onValueChange={(v) => setEditingItem({ ...editingItem, icone: v })}
                      >
                        <SelectTrigger className="mt-1 border-amber-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(editingItem.type === "categoria" ? iconOptions :
                            editingItem.type === "prioridade" ? prioridadeIconOptions :
                            statusIconOptions).map((opt) => (
                            <SelectItem key={opt.name} value={opt.name}>
                              <div className="flex items-center gap-2">
                                <opt.icon className="w-4 h-4" />
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Cor</Label>
                      <Select
                        value={editingItem.cor || "#6b7280"}
                        onValueChange={(v) => setEditingItem({ ...editingItem, cor: v })}
                      >
                        <SelectTrigger className="mt-1 border-amber-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {corOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded" style={{ backgroundColor: opt.value }} />
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {editingItem.type === "prioridade" && (
                  <div>
                    <Label>Nível</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editingItem.nivel || 1}
                      onChange={(e) => setEditingItem({ ...editingItem, nivel: parseInt(e.target.value) || 1 })}
                      className="mt-1 border-amber-200"
                    />
                  </div>
                )}

                {editingItem.type === "status" && (
                  <div>
                    <Label>Ordem</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editingItem.ordem || 0}
                      onChange={(e) => setEditingItem({ ...editingItem, ordem: parseInt(e.target.value) || 0 })}
                      className="mt-1 border-amber-200"
                    />
                  </div>
                )}

                {editingItem.type === "status" && (
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingItem.isFinal || false}
                      onCheckedChange={(checked) => setEditingItem({ ...editingItem, isFinal: checked })}
                    />
                    <Label>Status Final (encerra a OS)</Label>
                  </div>
                )}

                {editingItem.type === "setor" && (
                  <div>
                    <Label>Descrição</Label>
                    <Input
                      value={editingItem.descricao || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, descricao: e.target.value })}
                      className="mt-1 border-amber-200"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setEditingItem(null)}>
                    Cancelar
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                    onClick={() => {
                      if (!editingItem.nome.trim()) {
                        toast.error("Nome é obrigatório");
                        return;
                      }
                      
                      if (editingItem.type === "categoria") {
                        updateCategoria.mutate({
                          id: editingItem.id,
                          nome: editingItem.nome,
                          icone: editingItem.icone,
                          cor: editingItem.cor,
                        });
                      } else if (editingItem.type === "prioridade") {
                        updatePrioridade.mutate({
                          id: editingItem.id,
                          nome: editingItem.nome,
                          icone: editingItem.icone,
                          cor: editingItem.cor,
                          nivel: editingItem.nivel || 1,
                        });
                      } else if (editingItem.type === "status") {
                        updateStatus.mutate({
                          id: editingItem.id,
                          nome: editingItem.nome,
                          icone: editingItem.icone,
                          cor: editingItem.cor,
                          ordem: editingItem.ordem,
                          isFinal: editingItem.isFinal,
                        });
                      } else if (editingItem.type === "setor") {
                        updateSetor.mutate({
                          id: editingItem.id,
                          nome: editingItem.nome,
                          descricao: editingItem.descricao || undefined,
                        });
                      }
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
}
