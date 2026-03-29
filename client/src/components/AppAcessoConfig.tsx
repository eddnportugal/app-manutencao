import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { 
  Key, 
  Users, 
  Plus, 
  Copy, 
  Trash2, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3
} from "lucide-react";

interface AppAcessoConfigProps {
  appId: number;
  appNome: string;
}

export function AppAcessoConfig({ appId, appNome }: AppAcessoConfigProps) {
  const [showNovoUsuario, setShowNovoUsuario] = useState(false);
  const [showNovoCodigo, setShowNovoCodigo] = useState(false);
  const [novoUsuario, setNovoUsuario] = useState({ nome: "", email: "", senha: "", permissao: "visualizar" as const });
  const [novoCodigo, setNovoCodigo] = useState({ descricao: "", permissao: "visualizar" as const });
  const [mostrarSenha, setMostrarSenha] = useState(false);
  
  // Queries
  const { data: codigos, refetch: refetchCodigos } = trpc.appAcesso.listarCodigos.useQuery({ appId });
  const { data: usuarios, refetch: refetchUsuarios } = trpc.appAcesso.listarUsuarios.useQuery({ appId });
  
  // Mutations
  const gerarCodigoMutation = trpc.appAcesso.gerarCodigo.useMutation({
    onSuccess: (data) => {
      toast.success(`Código gerado: ${data.codigo}`);
      navigator.clipboard.writeText(data.codigo);
      setShowNovoCodigo(false);
      setNovoCodigo({ descricao: "", permissao: "visualizar" });
      refetchCodigos();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const cadastrarUsuarioMutation = trpc.appAcesso.cadastrarUsuario.useMutation({
    onSuccess: () => {
      toast.success("Utilizador cadastrado com sucesso");
      setShowNovoUsuario(false);
      setNovoUsuario({ nome: "", email: "", senha: "", permissao: "visualizar" });
      refetchUsuarios();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const desativarCodigoMutation = trpc.appAcesso.desativarCodigo.useMutation({
    onSuccess: () => {
      toast.success("Código desativado");
      refetchCodigos();
    },
  });
  
  const reativarCodigoMutation = trpc.appAcesso.reativarCodigo.useMutation({
    onSuccess: () => {
      toast.success("Código reativado");
      refetchCodigos();
    },
  });
  
  const removerUsuarioMutation = trpc.appAcesso.removerUsuario.useMutation({
    onSuccess: () => {
      toast.success("Utilizador removido");
      refetchUsuarios();
    },
  });
  
  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    toast.success("Código copiado para a área de transferência");
  };
  
  const getPermissaoBadge = (permissao: string) => {
    switch (permissao) {
      case "administrar":
        return <Badge className="bg-red-500">Administrador</Badge>;
      case "editar":
        return <Badge className="bg-blue-500">Editor</Badge>;
      default:
        return <Badge className="bg-gray-500">Visualizador</Badge>;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Configurar Acesso ao App
        </CardTitle>
        <CardDescription>
          Configure quem pode aceder ao app "{appNome}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="codigos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="codigos" className="flex items-center gap-1 text-[10px] sm:text-xs px-1 sm:px-2 py-2 min-w-0">
              <Key className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Códigos</span>
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex items-center gap-1 text-[10px] sm:text-xs px-1 sm:px-2 py-2 min-w-0">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Utilizadores</span>
            </TabsTrigger>
            <TabsTrigger value="estatisticas" className="flex items-center gap-1 text-[10px] sm:text-xs px-1 sm:px-2 py-2 min-w-0">
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="truncate">Estatísticas</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Tab: Códigos de Acesso */}
          <TabsContent value="codigos" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Códigos permitem acesso rápido sem necessidade de email/senha
              </p>
              <Dialog open={showNovoCodigo} onOpenChange={setShowNovoCodigo}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto flex-shrink-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Gerar Código
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Gerar Novo Código de Acesso</DialogTitle>
                    <DialogDescription>
                      O código será gerado automaticamente e copiado para a área de transferência
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Descrição (opcional)</Label>
                      <Input
                        placeholder="Ex: Acesso para técnicos"
                        value={novoCodigo.descricao}
                        onChange={(e) => setNovoCodigo({ ...novoCodigo, descricao: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Permissão</Label>
                      <Select
                        value={novoCodigo.permissao}
                        onValueChange={(v) => setNovoCodigo({ ...novoCodigo, permissao: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visualizar">Visualizar</SelectItem>
                          <SelectItem value="editar">Editar</SelectItem>
                          <SelectItem value="administrar">Administrar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNovoCodigo(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => gerarCodigoMutation.mutate({ appId, ...novoCodigo })}
                      disabled={gerarCodigoMutation.isPending}
                    >
                      {gerarCodigoMutation.isPending ? "A gerar..." : "Gerar Código"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-2">
              {codigos?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum código de acesso gerado</p>
                  <p className="text-sm">Clique em "Gerar Código" para criar um</p>
                </div>
              )}
              
              {codigos?.map((codigo) => (
                <div
                  key={codigo.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border ${
                    codigo.ativo ? "bg-card" : "bg-muted opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-full flex-shrink-0 ${codigo.ativo ? "bg-green-100" : "bg-gray-100"}`}>
                      <Key className={`h-4 w-4 ${codigo.ativo ? "text-green-600" : "text-gray-400"}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="font-mono font-bold text-sm">{codigo.codigo}</code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => copiarCodigo(codigo.codigo)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {!codigo.ativo && <Badge variant="secondary">Inativo</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        {codigo.descricao && <span>{codigo.descricao}</span>}
                        {getPermissaoBadge(codigo.permissao || "visualizar")}
                        <span>• {codigo.vezesUsado} usos</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-end sm:flex-shrink-0">
                    {codigo.ativo ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => desativarCodigoMutation.mutate({ id: codigo.id })}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Desativar
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => reativarCodigoMutation.mutate({ id: codigo.id })}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Reativar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Tab: Utilizadores */}
          <TabsContent value="usuarios" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <p className="text-sm text-muted-foreground">
                Utilizadores acedem com email e senha
              </p>
              <Dialog open={showNovoUsuario} onOpenChange={setShowNovoUsuario}>
                <DialogTrigger asChild>
                  <Button size="sm" className="w-full sm:w-auto flex-shrink-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Utilizador
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Utilizador</DialogTitle>
                    <DialogDescription>
                      O utilizador receberá as credenciais para aceder ao app
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Nome</Label>
                      <Input
                        placeholder="Nome completo"
                        value={novoUsuario.nome}
                        onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          className="pl-10"
                          value={novoUsuario.email}
                          onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={mostrarSenha ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          className="pl-10 pr-10"
                          value={novoUsuario.senha}
                          onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                        >
                          {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Permissão</Label>
                      <Select
                        value={novoUsuario.permissao}
                        onValueChange={(v) => setNovoUsuario({ ...novoUsuario, permissao: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visualizar">Visualizar</SelectItem>
                          <SelectItem value="editar">Editar</SelectItem>
                          <SelectItem value="administrar">Administrar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNovoUsuario(false)}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={() => cadastrarUsuarioMutation.mutate({ appId, ...novoUsuario })}
                      disabled={cadastrarUsuarioMutation.isPending || !novoUsuario.nome || !novoUsuario.email || novoUsuario.senha.length < 6}
                    >
                      {cadastrarUsuarioMutation.isPending ? "A cadastrar..." : "Cadastrar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-2">
              {usuarios?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum utilizador cadastrado</p>
                  <p className="text-sm">Clique em "Adicionar Utilizador" para criar um</p>
                </div>
              )}
              
              {usuarios?.map((usuario) => (
                <div
                  key={usuario.id}
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border ${
                    usuario.ativo ? "bg-card" : "bg-muted opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-full flex-shrink-0 ${usuario.ativo ? "bg-blue-100" : "bg-gray-100"}`}>
                      <Users className={`h-4 w-4 ${usuario.ativo ? "text-blue-600" : "text-gray-400"}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{usuario.nome}</span>
                        {!usuario.ativo && <Badge variant="secondary">Inativo</Badge>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate max-w-[180px]">{usuario.email}</span>
                        {getPermissaoBadge(usuario.permissao || "visualizar")}
                        <span>• {usuario.vezesAcesso} acessos</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 justify-end sm:flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja remover este utilizador?")) {
                          removerUsuarioMutation.mutate({ id: usuario.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Tab: Estatísticas */}
          <TabsContent value="estatisticas" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-green-100">
                      <Key className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{codigos?.filter(c => c.ativo).length || 0}</p>
                      <p className="text-sm text-muted-foreground">Códigos Ativos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-100">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{usuarios?.filter(u => u.ativo).length || 0}</p>
                      <p className="text-sm text-muted-foreground">Utilizadores Ativos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-purple-100">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {(codigos?.reduce((acc, c) => acc + (c.vezesUsado || 0), 0) || 0) + 
                         (usuarios?.reduce((acc, u) => acc + (u.vezesAcesso || 0), 0) || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Total de Acessos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-orange-100">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {usuarios?.filter(u => u.ultimoAcesso && 
                          new Date(u.ultimoAcesso) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        ).length || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Ativos esta semana</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
