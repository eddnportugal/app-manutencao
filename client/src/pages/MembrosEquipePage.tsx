import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { Plus, Edit, Trash2, Phone, User, Briefcase, MessageCircle, Shield, Key, Mail, Eye, EyeOff, Lock, Unlock, History } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import { MembroHistoricoAcessos } from "@/components/MembroHistoricoAcessos";
import { FunctionTutorialButton } from "@/components/FunctionTutorial";

interface MembrosEquipePageProps {
  condominioId: number;
}

// Lista de módulos disponíveis para permissões
const MODULOS_DISPONIVEIS = [
  { id: "vistorias", nome: "Vistorias Completas", categoria: "completas" },
  { id: "vistorias_rapidas", nome: "Vistorias Rápidas", categoria: "rapidas" },
  { id: "manutencoes", nome: "Manutenções Completas", categoria: "completas" },
  { id: "manutencoes_rapidas", nome: "Manutenções Rápidas", categoria: "rapidas" },
  { id: "ocorrencias", nome: "Ocorrências Completas", categoria: "completas" },
  { id: "ocorrencias_rapidas", nome: "Ocorrências Rápidas", categoria: "rapidas" },
  { id: "checklists", nome: "Checklists Completos", categoria: "completas" },
  { id: "checklists_rapidos", nome: "Checklists Rápidos", categoria: "rapidas" },
  { id: "antes_depois", nome: "Antes e Depois Completo", categoria: "completas" },
  { id: "antes_depois_rapido", nome: "Antes/Depois Rápido", categoria: "rapidas" },
  { id: "ordens_servico", nome: "Ordens de Serviço", categoria: "outros" },
  { id: "agenda_vencimentos", nome: "Agenda de Vencimentos", categoria: "outros" },
  { id: "historico", nome: "Histórico das Funções", categoria: "outros" },
  { id: "gestao_organizacao", nome: "Gestão da Organização", categoria: "admin" },
  { id: "equipe_gestao", nome: "Equipe de Gestão", categoria: "admin" },
];

export function MembrosEquipePage({ condominioId }: MembrosEquipePageProps) {
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [historicoMembroId, setHistoricoMembroId] = useState<number | null>(null);
  const [historicoMembroNome, setHistoricoMembroNome] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    descricao: "",
    cargo: "",
    fotoUrl: "",
    // Novos campos de permissões
    acessoTotal: false,
    email: "",
    confirmaEmail: "",
    senha: "",
    confirmaSenha: "",
    permissoes: [] as string[],
  });

  const { data: membros, refetch } = trpc.membroEquipe.list.useQuery({ condominioId });
  const createMutation = trpc.membroEquipe.create.useMutation({
    onSuccess: () => {
      toast.success("Membro adicionado com sucesso!");
      refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message || "Erro ao adicionar membro"),
  });
  const updateMutation = trpc.membroEquipe.update.useMutation({
    onSuccess: () => {
      toast.success("Membro atualizado com sucesso!");
      refetch();
      resetForm();
    },
    onError: (err) => toast.error(err.message || "Erro ao atualizar membro"),
  });
  const deleteMutation = trpc.membroEquipe.delete.useMutation({
    onSuccess: () => {
      toast.success("Membro removido com sucesso!");
      refetch();
    },
    onError: () => toast.error("Erro ao remover membro"),
  });

  const resetForm = () => {
    setFormData({ 
      nome: "", 
      whatsapp: "", 
      descricao: "", 
      cargo: "", 
      fotoUrl: "",
      acessoTotal: false,
      email: "",
      confirmaEmail: "",
      senha: "",
      confirmaSenha: "",
      permissoes: [],
    });
    setEditingId(null);
    setIsOpen(false);
    setShowPassword(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se tem acesso total, precisa de email e senha
    if (formData.acessoTotal && (!formData.email || (!editingId && !formData.senha))) {
      toast.error("Para acesso total, é necessário informar email e senha");
      return;
    }
    
    // Validar se tem permissões específicas, precisa de email e senha
    if (!formData.acessoTotal && formData.permissoes.length > 0 && (!formData.email || (!editingId && !formData.senha))) {
      toast.error("Para acesso com permissões, é necessário informar email e senha");
      return;
    }

    // Validar confirmação de senha
    if (!editingId && formData.senha && formData.senha !== formData.confirmaSenha) {
      toast.error("A senha e a confirmação de senha não conferem");
      return;
    }
    
    // Validar confirmação de senha na edição se houver senha
    if (editingId && formData.senha && formData.senha !== formData.confirmaSenha) {
      toast.error("A nova senha e a confirmação não conferem");
      return;
    }

    // Validar confirmação de email
    if (formData.email && formData.email !== formData.confirmaEmail) {
      toast.error("O email e a confirmação de email não conferem");
      return;
    }
    
    const submitData = {
      condominioId,
      nome: formData.nome,
      whatsapp: formData.whatsapp,
      descricao: formData.descricao || undefined,
      cargo: formData.cargo || undefined,
      fotoUrl: formData.fotoUrl || undefined,
      acessoTotal: formData.acessoTotal,
      email: formData.email || undefined,
      senha: formData.senha || undefined,
      permissoes: formData.permissoes,
    };
    
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (membro: NonNullable<typeof membros>[0]) => {
    // Parse permissões se for string JSON
    let permissoes: string[] = [];
    if (membro.permissoes) {
      if (typeof membro.permissoes === 'string') {
        try {
          permissoes = JSON.parse(membro.permissoes);
        } catch {
          permissoes = [];
        }
      } else if (Array.isArray(membro.permissoes)) {
        permissoes = membro.permissoes;
      }
    }
    
    setFormData({
      nome: membro.nome,
      whatsapp: maskPhone(membro.whatsapp),
      descricao: membro.descricao || "",
      cargo: membro.cargo || "",
      fotoUrl: membro.fotoUrl || "",
      acessoTotal: membro.acessoTotal || false,
      email: membro.email || "",
      confirmaEmail: membro.email || "",
      senha: "", 
      confirmaSenha: "",
      permissoes,
    });
    setEditingId(membro.id);
    setIsOpen(true);
  };

  const togglePermissao = (moduloId: string) => {
    setFormData(prev => ({
      ...prev,
      permissoes: prev.permissoes.includes(moduloId)
        ? prev.permissoes.filter(p => p !== moduloId)
        : [...prev.permissoes, moduloId]
    }));
  };

  const selecionarTodosCategoria = (categoria: string) => {
    const modulosCategoria = MODULOS_DISPONIVEIS.filter(m => m.categoria === categoria).map(m => m.id);
    const todosJaSelecionados = modulosCategoria.every(id => formData.permissoes.includes(id));
    
    if (todosJaSelecionados) {
      setFormData(prev => ({
        ...prev,
        permissoes: prev.permissoes.filter(p => !modulosCategoria.includes(p))
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissoes: Array.from(new Set([...prev.permissoes, ...modulosCategoria]))
      }));
    }
  };

  const formatWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d)(\d{4})$/, "$1-$2")
      .slice(0, 15);
  };

  // Função para obter permissões do membro
  const getMembroPermissoes = (membro: NonNullable<typeof membros>[0]) => {
    if (membro.acessoTotal) return "Acesso Total";
    if (!membro.permissoes) return "Sem acesso ao sistema";
    
    let permissoes: string[] = [];
    if (typeof membro.permissoes === 'string') {
      try {
        permissoes = JSON.parse(membro.permissoes);
      } catch {
        return "Sem acesso ao sistema";
      }
    } else if (Array.isArray(membro.permissoes)) {
      permissoes = membro.permissoes;
    }
    
    if (permissoes.length === 0) return "Sem acesso ao sistema";
    if (permissoes.length <= 3) {
      return permissoes.map(p => MODULOS_DISPONIVEIS.find(m => m.id === p)?.nome || p).join(", ");
    }
    return `${permissoes.length} módulos`;
  };

  return (
    <div className="space-y-6">
      <div data-tour="header-equipe" className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Equipe de Gestão
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie os membros da equipe e suas permissões de acesso
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FunctionTutorialButton tutorialId="equipe" variant="compact" />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => resetForm()}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/25 rounded-xl h-10 px-5 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] sm:max-w-lg overflow-y-auto max-h-[90vh] p-0 rounded-2xl border-0 shadow-2xl">
            {/* Header Premium com Gradiente Laranja */}
            <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 px-6 py-5 overflow-hidden">
              {/* Efeito de brilho */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <DialogHeader className="relative z-10">
                <DialogTitle className="flex items-center gap-3 text-white">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold block">
                      {editingId ? "Editar Membro" : "Novo Membro"}
                    </span>
                    <span className="text-orange-100 text-sm font-normal">
                      Equipe de Gestão
                    </span>
                  </div>
                </DialogTitle>
              </DialogHeader>
            </div>
            
            {/* Formulário Premium */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-gradient-to-b from-white to-orange-50/30 dark:from-gray-900 dark:to-gray-900">
              {/* Upload de Foto com estilo premium */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur opacity-30" />
                  <ImageUpload
                    value={formData.fotoUrl}
                    onChange={(url: string | undefined) => setFormData({ ...formData, fotoUrl: url || "" })}
                    className="relative w-24 h-24 rounded-full ring-4 ring-white shadow-xl"
                    placeholder="Foto"
                    compact
                  />
                </div>
              </div>
              
              {/* Campo Nome */}
              <div className="space-y-1.5">
                <Label htmlFor="nome" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  Nome <span className="text-orange-500">*</span>
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                  required
                  className="h-11 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                />
              </div>
              
              {/* Campo WhatsApp */}
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-orange-500" />
                  WhatsApp <span className="text-orange-500">*</span>
                </Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: maskPhone(e.target.value) })}
                  placeholder="(11) 99999-9999"
                  required
                  maxLength={15}
                  className="h-11 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                />
              </div>
              
              {/* Campo Cargo */}
              <div className="space-y-1.5">
                <Label htmlFor="cargo" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-orange-500" />
                  Cargo
                </Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  placeholder="Ex: Zelador, Porteiro, Técnico"
                  className="h-11 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-all"
                />
              </div>
              
              {/* Campo Descrição */}
              <div className="space-y-1.5">
                <Label htmlFor="descricao" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Responsabilidades e observações"
                  rows={2}
                  className="rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 transition-all resize-none"
                />
              </div>

              {/* Separador de Permissões */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-orange-200 dark:border-orange-900/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-gray-900 px-4 text-sm font-semibold text-orange-600 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Permissões de Acesso
                  </span>
                </div>
              </div>

              {/* Toggle Acesso Total */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    {formData.acessoTotal ? (
                      <Unlock className="w-5 h-5 text-white" />
                    ) : (
                      <Lock className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Acesso Total</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Mesmas permissões do gestor principal
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.acessoTotal}
                  onCheckedChange={(checked) => setFormData({ ...formData, acessoTotal: checked, permissoes: [] })}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>

              {/* Campos de Email e Senha (aparecem quando tem acesso) */}
              {(formData.acessoTotal || formData.permissoes.length > 0) && (
                <div className="space-y-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Credenciais de Acesso
                    </p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 leading-relaxed">
                      Ao criar as credenciais da sua equipe, os membros utilizarão estes dados (e-mail e senha) para acessar tanto o aplicativo quanto o sistema no computador.
                    </p>
                  </div>
                  
                  {/* Campo Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      Email <span className="text-orange-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                      className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                    />
                  </div>

                  {/* Campo Confirmação Email */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmaEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      Confirmar Email <span className="text-orange-500">*</span>
                    </Label>
                    <Input
                      id="confirmaEmail"
                      type="email"
                      value={formData.confirmaEmail}
                      onChange={(e) => setFormData({ ...formData, confirmaEmail: e.target.value })}
                      placeholder="Confirme o email"
                      className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                  
                  {/* Campo Senha */}
                  <div className="space-y-1.5">
                    <Label htmlFor="senha" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-blue-500" />
                      Senha {!editingId && <span className="text-orange-500">*</span>}
                      {editingId && <span className="text-xs text-gray-400">(deixe vazio para manter)</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id="senha"
                        type={showPassword ? "text" : "password"}
                        value={formData.senha}
                        onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                        placeholder={editingId ? "Nova senha (opcional)" : "Mínimo 6 caracteres"}
                        className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Campo Confirmação Senha */}
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmaSenha" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-blue-500" />
                      Confirmar Senha {!editingId && <span className="text-orange-500">*</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmaSenha"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmaSenha}
                        onChange={(e) => setFormData({ ...formData, confirmaSenha: e.target.value })}
                        placeholder="Confirme a senha"
                        className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all pr-10"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de Permissões (apenas se não tem acesso total) */}
              {!formData.acessoTotal && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Selecione os módulos que este membro pode acessar:
                  </p>
                  
                  {/* Funções Completas */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => selecionarTodosCategoria("completas")}
                      className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      Funções Completas
                      <span className="text-gray-400">(selecionar todos)</span>
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      {MODULOS_DISPONIVEIS.filter(m => m.categoria === "completas").map((modulo) => (
                        <label
                          key={modulo.id}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            formData.permissoes.includes(modulo.id)
                              ? "bg-orange-50 border-orange-300 dark:bg-orange-900/20 dark:border-orange-700"
                              : "bg-white border-gray-200 hover:border-orange-200 dark:bg-gray-800 dark:border-gray-700"
                          }`}
                        >
                          <Checkbox
                            checked={formData.permissoes.includes(modulo.id)}
                            onCheckedChange={() => togglePermissao(modulo.id)}
                            className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                          />
                          <span className="text-xs font-medium">{modulo.nome}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Funções Rápidas */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => selecionarTodosCategoria("rapidas")}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      Funções Rápidas
                      <span className="text-gray-400">(selecionar todos)</span>
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      {MODULOS_DISPONIVEIS.filter(m => m.categoria === "rapidas").map((modulo) => (
                        <label
                          key={modulo.id}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            formData.permissoes.includes(modulo.id)
                              ? "bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700"
                              : "bg-white border-gray-200 hover:border-amber-200 dark:bg-gray-800 dark:border-gray-700"
                          }`}
                        >
                          <Checkbox
                            checked={formData.permissoes.includes(modulo.id)}
                            onCheckedChange={() => togglePermissao(modulo.id)}
                            className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                          />
                          <span className="text-xs font-medium">{modulo.nome}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Outros Módulos */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => selecionarTodosCategoria("outros")}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      Outros Módulos
                      <span className="text-gray-400">(selecionar todos)</span>
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      {MODULOS_DISPONIVEIS.filter(m => m.categoria === "outros").map((modulo) => (
                        <label
                          key={modulo.id}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            formData.permissoes.includes(modulo.id)
                              ? "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700"
                              : "bg-white border-gray-200 hover:border-blue-200 dark:bg-gray-800 dark:border-gray-700"
                          }`}
                        >
                          <Checkbox
                            checked={formData.permissoes.includes(modulo.id)}
                            onCheckedChange={() => togglePermissao(modulo.id)}
                            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />
                          <span className="text-xs font-medium">{modulo.nome}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Módulos Admin */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => selecionarTodosCategoria("admin")}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      Administração
                      <span className="text-gray-400">(selecionar todos)</span>
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      {MODULOS_DISPONIVEIS.filter(m => m.categoria === "admin").map((modulo) => (
                        <label
                          key={modulo.id}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                            formData.permissoes.includes(modulo.id)
                              ? "bg-purple-50 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700"
                              : "bg-white border-gray-200 hover:border-purple-200 dark:bg-gray-800 dark:border-gray-700"
                          }`}
                        >
                          <Checkbox
                            checked={formData.permissoes.includes(modulo.id)}
                            onCheckedChange={() => togglePermissao(modulo.id)}
                            className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          />
                          <span className="text-xs font-medium">{modulo.nome}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>
            
            {/* Botões Premium */}
            <div className="flex gap-3 px-6 py-4 bg-gray-50/80 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800">
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm} 
                className="flex-1 h-11 rounded-xl border-gray-200 hover:bg-gray-100 transition-all"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  editingId ? "Salvar Alterações" : "Adicionar Membro"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Lista de Membros */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {membros?.map((membro) => (
          <Card key={membro.id} className="group hover:shadow-xl transition-all duration-300 border border-orange-100 dark:border-orange-900/30 bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-900 dark:to-slate-800 rounded-xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {membro.fotoUrl ? (
                    <img
                      src={membro.fotoUrl}
                      alt={membro.nome}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg shadow-orange-500/20">
                      {membro.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-base font-semibold">{membro.nome}</CardTitle>
                    {membro.cargo && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {membro.cargo}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {membro.email && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setHistoricoMembroId(membro.id);
                        setHistoricoMembroNome(membro.nome);
                      }}
                      title="Ver histórico de acessos"
                    >
                      <History className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(membro)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => deleteMutation.mutate({ id: membro.id })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Badge de Permissões */}
              <div className="mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  membro.acessoTotal 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : membro.email
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {membro.acessoTotal ? (
                    <Unlock className="w-3 h-3" />
                  ) : membro.email ? (
                    <Shield className="w-3 h-3" />
                  ) : (
                    <Lock className="w-3 h-3" />
                  )}
                  {getMembroPermissoes(membro)}
                </span>
              </div>
              
              {membro.descricao && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {membro.descricao}
                </p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {membro.whatsapp}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50 rounded-lg"
                  onClick={() => {
                    const whatsappNumber = formatWhatsApp(membro.whatsapp);
                    window.open(`https://wa.me/${whatsappNumber}`, "_blank");
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vazio */}
      {membros?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <User className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Nenhum membro cadastrado</h3>
          <p className="text-muted-foreground mb-4">
            Adicione membros da equipe para compartilhar vistorias e manutenções
          </p>
          <Button 
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Membro
          </Button>
        </div>
      )}

      {/* Modal de Histórico de Acessos */}
      {historicoMembroId && (
        <MembroHistoricoAcessos
          membroId={historicoMembroId}
          membroNome={historicoMembroNome}
          condominioId={condominioId}
          open={!!historicoMembroId}
          onOpenChange={(open) => {
            if (!open) {
              setHistoricoMembroId(null);
              setHistoricoMembroNome("");
            }
          }}
        />
      )}
    </div>
  );
}
