import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  Camera, 
  ArrowLeft,
  Building2,
  Users,
  Shield,
  Calendar,
  CheckCircle
} from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export default function Perfil() {
  const [activeTab, setActiveTab] = useState("dados");
  
  // Estados para edição de dados
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Estados para alteração de email
  const [novoEmail, setNovoEmail] = useState("");
  const [senhaParaEmail, setSenhaParaEmail] = useState("");
  
  // Estados para alteração de senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenhas, setMostrarSenhas] = useState(false);
  
  // Query para obter dados do perfil
  const { data: perfil, isLoading, refetch } = trpc.auth.getPerfil.useQuery();
  
  // Mutations
  const atualizarPerfilMutation = trpc.auth.atualizarPerfil.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar perfil");
    },
  });
  
  const atualizarEmailMutation = trpc.auth.atualizarEmail.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setSenhaParaEmail("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar email");
    },
  });
  
  const alterarSenhaMutation = trpc.auth.alterarSenha.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao alterar senha");
    },
  });
  
  // Preencher campos quando os dados carregarem
  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome || "");
      setTelefone(perfil.telefone || "");
      setAvatarUrl(perfil.avatarUrl || "");
      setNovoEmail(perfil.email || "");
    }
  }, [perfil]);
  
  const handleSalvarDados = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarPerfilMutation.mutate({
      nome: nome || undefined,
      telefone: telefone || null,
      avatarUrl: avatarUrl || null,
    });
  };
  
  const handleSalvarEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senhaParaEmail) {
      toast.error("Digite sua senha para confirmar a alteração");
      return;
    }
    atualizarEmailMutation.mutate({
      novoEmail,
      senha: senhaParaEmail,
    });
  };
  
  const handleAlterarSenha = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (novaSenha.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    alterarSenhaMutation.mutate({
      senhaAtual,
      novaSenha,
    });
  };
  
  // Validações em tempo real
  const senhaValida = novaSenha.length >= 6;
  const senhasCoicidem = novaSenha === confirmarSenha && confirmarSenha.length > 0;
  
  const getTipoContaLabel = (tipo: string | null) => {
    switch (tipo) {
      case "sindico": return "Gestor";
      case "administradora": return "Empresa";
      case "admin": return "Administrador";
      default: return "Usuário";
    }
  };
  
  const getTipoContaIcon = (tipo: string | null) => {
    switch (tipo) {
      case "sindico": return <Building2 className="h-4 w-4" />;
      case "administradora": return <Users className="h-4 w-4" />;
      case "admin": return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };
  
  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
          </div>
        </div>
        
        {/* Card de Informações do Usuário */}
        <Card className="mb-6 shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20">
                <AvatarImage src={perfil?.avatarUrl || undefined} />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {perfil?.nome?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold">{perfil?.nome || "Usuário"}</h2>
                <p className="text-muted-foreground">{perfil?.email}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getTipoContaIcon(perfil?.tipoConta || null)}
                    {getTipoContaLabel(perfil?.tipoConta || null)}
                  </Badge>
                  {perfil?.role === "admin" && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-center md:text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1 justify-center md:justify-end">
                  <Calendar className="h-4 w-4" />
                  <span>Membro desde</span>
                </div>
                <p className="font-medium">{formatDate(perfil?.createdAt || null)}</p>
                <p className="mt-2 text-xs">Último acesso: {formatDate(perfil?.lastSignedIn || null)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs de Configurações */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="dados" className="py-3">
              <User className="h-4 w-4 mr-2" />
              Dados Pessoais
            </TabsTrigger>
            <TabsTrigger value="email" className="py-3">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="senha" className="py-3">
              <Lock className="h-4 w-4 mr-2" />
              Senha
            </TabsTrigger>
          </TabsList>
          
          {/* Tab: Dados Pessoais */}
          <TabsContent value="dados">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>
                  Atualize suas informações de perfil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSalvarDados} className="space-y-6">
                  {/* Foto de Perfil */}
                  <div className="space-y-2">
                    <Label>Foto de Perfil</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20 border-2 border-muted">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                          {nome?.charAt(0)?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <ImageUpload
                          value={avatarUrl}
                          onChange={(url) => setAvatarUrl(url || "")}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nome"
                        type="text"
                        placeholder="Seu nome completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="pl-10"
                        disabled={atualizarPerfilMutation.isPending}
                      />
                    </div>
                  </div>
                  
                  {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telefone"
                        type="tel"
                        placeholder="(00) 00000-0000"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="pl-10"
                        disabled={atualizarPerfilMutation.isPending}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={atualizarPerfilMutation.isPending}
                  >
                    {atualizarPerfilMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Email */}
          <TabsContent value="email">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Alterar Email</CardTitle>
                <CardDescription>
                  Atualize seu endereço de email. Você precisará confirmar com sua senha.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSalvarEmail} className="space-y-6">
                  {/* Email Atual */}
                  <div className="space-y-2">
                    <Label>Email Atual</Label>
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      {perfil?.email}
                    </div>
                  </div>
                  
                  {/* Novo Email */}
                  <div className="space-y-2">
                    <Label htmlFor="novoEmail">Novo Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="novoEmail"
                        type="email"
                        placeholder="novo@email.com"
                        value={novoEmail}
                        onChange={(e) => setNovoEmail(e.target.value)}
                        className="pl-10"
                        disabled={atualizarEmailMutation.isPending}
                      />
                    </div>
                  </div>
                  
                  {/* Senha para Confirmar */}
                  <div className="space-y-2">
                    <Label htmlFor="senhaParaEmail">Sua Senha (para confirmar)</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="senhaParaEmail"
                        type="password"
                        placeholder="Digite sua senha"
                        value={senhaParaEmail}
                        onChange={(e) => setSenhaParaEmail(e.target.value)}
                        className="pl-10"
                        disabled={atualizarEmailMutation.isPending}
                      />
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={atualizarEmailMutation.isPending || novoEmail === perfil?.email}
                  >
                    {atualizarEmailMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Atualizando...
                      </>
                    ) : (
                      "Atualizar Email"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Senha */}
          <TabsContent value="senha">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>
                  Escolha uma senha forte com pelo menos 6 caracteres
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAlterarSenha} className="space-y-6">
                  {/* Senha Atual */}
                  <div className="space-y-2">
                    <Label htmlFor="senhaAtual">Senha Atual</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="senhaAtual"
                        type={mostrarSenhas ? "text" : "password"}
                        placeholder="Digite sua senha atual"
                        value={senhaAtual}
                        onChange={(e) => setSenhaAtual(e.target.value)}
                        className="pl-10 pr-10"
                        disabled={alterarSenhaMutation.isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenhas(!mostrarSenhas)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {mostrarSenhas ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Nova Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="novaSenha">Nova Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="novaSenha"
                        type={mostrarSenhas ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                        className="pl-10"
                        disabled={alterarSenhaMutation.isPending}
                      />
                    </div>
                    {novaSenha.length > 0 && (
                      <div className={`flex items-center gap-1 text-xs ${senhaValida ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {senhaValida && <CheckCircle className="h-3 w-3" />}
                        {senhaValida ? 'Senha válida' : 'Mínimo 6 caracteres'}
                      </div>
                    )}
                  </div>
                  
                  {/* Confirmar Nova Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmarSenha"
                        type={mostrarSenhas ? "text" : "password"}
                        placeholder="Repita a nova senha"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        className="pl-10"
                        disabled={alterarSenhaMutation.isPending}
                      />
                    </div>
                    {confirmarSenha.length > 0 && (
                      <div className={`flex items-center gap-1 text-xs ${senhasCoicidem ? 'text-green-600' : 'text-red-500'}`}>
                        {senhasCoicidem && <CheckCircle className="h-3 w-3" />}
                        {senhasCoicidem ? 'Senhas coincidem' : 'As senhas não coincidem'}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={alterarSenhaMutation.isPending || !senhaValida || !senhasCoicidem}
                  >
                    {alterarSenhaMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      "Alterar Senha"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
