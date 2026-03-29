import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";
import { 
  Building2, 
  Mail, 
  Lock, 
  LogIn, 
  Wand2, 
  Loader2,
  Home,
  ArrowLeft,
  KeyRound
} from "lucide-react";
import { Link } from "wouter";

// Hook para gerenciar sessão do morador
export function useMoradorAuth() {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("morador_token");
  });
  
  const { data: sessao, isLoading } = trpc.morador.verificarSessao.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );
  
  const login = (novoToken: string) => {
    localStorage.setItem("morador_token", novoToken);
    setToken(novoToken);
  };
  
  const logout = () => {
    localStorage.removeItem("morador_token");
    setToken(null);
  };
  
  return {
    token,
    morador: sessao?.valido ? sessao.morador : null,
    condominio: sessao?.valido ? sessao.condominio : null,
    isLoading,
    isLoggedIn: sessao?.valido || false,
    login,
    logout,
  };
}

export default function MoradorLogin() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const tokenParam = searchParams.get("token");
  
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [activeTab, setActiveTab] = useState("senha");
  const [tokenRecebido, setTokenRecebido] = useState<string | null>(tokenParam);
  const [mostrarDefinirSenha, setMostrarDefinirSenha] = useState(false);
  
  const { login, isLoggedIn } = useMoradorAuth();
  
  // Mutations
  const loginMutation = trpc.morador.login.useMutation({
    onSuccess: (data) => {
      login(data.token);
      toast.success(`Bem-vindo(a), ${data.morador.nome}!`);
      navigate("/morador");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const linkMagicoMutation = trpc.morador.solicitarLinkMagico.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      // Em modo debug, mostrar o token (apenas em desenvolvimento)
      if (import.meta.env.DEV && data._debug_token) {
        setTokenRecebido(data._debug_token);
        setMostrarDefinirSenha(true);
        toast.info("Token de teste: " + data._debug_token.substring(0, 10) + "...");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const loginComTokenMutation = trpc.morador.loginComToken.useMutation({
    onSuccess: (data) => {
      login(data.token);
      toast.success(`Bem-vindo(a), ${data.morador.nome}!`);
      navigate("/morador");
    },
    onError: (error) => {
      toast.error(error.message);
      setTokenRecebido(null);
    },
  });
  
  const definirSenhaMutation = trpc.morador.definirSenha.useMutation({
    onSuccess: (data) => {
      login(data.token);
      toast.success("Senha definida com sucesso!");
      navigate("/morador");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Se já está logado, redirecionar
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/morador");
    }
  }, [isLoggedIn, navigate]);
  
  // Se tem token na URL, tentar login automático
  useEffect(() => {
    if (tokenParam && !isLoggedIn) {
      loginComTokenMutation.mutate({ token: tokenParam });
    }
  }, [tokenParam]);
  
  const handleLoginSenha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !senha.trim()) {
      toast.error("Preencha email e senha");
      return;
    }
    loginMutation.mutate({ email, senha });
  };
  
  const handleSolicitarLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Preencha o email");
      return;
    }
    linkMagicoMutation.mutate({ email });
  };
  
  const handleDefinirSenha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenRecebido) {
      toast.error("Token não encontrado");
      return;
    }
    if (novaSenha.length < 4) {
      toast.error("A senha deve ter pelo menos 4 caracteres");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    definirSenhaMutation.mutate({ token: tokenRecebido, senha: novaSenha });
  };
  
  // Tela de definir senha
  if (mostrarDefinirSenha && tokenRecebido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Definir Senha</CardTitle>
            <CardDescription>
              Crie uma senha para acessar o portal do morador
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDefinirSenha} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <Input
                  id="novaSenha"
                  type="password"
                  placeholder="Mínimo 4 caracteres"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  placeholder="Repita a senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={definirSenhaMutation.isPending}
              >
                {definirSenhaMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
                ) : (
                  <><KeyRound className="w-4 h-4 mr-2" /> Definir Senha e Entrar</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Link para voltar */}
        <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao início
        </Link>
        
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Portal do Morador</CardTitle>
            <CardDescription>
              Acesse sua área exclusiva para criar classificados, caronas e muito mais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="senha">
                  <Lock className="w-4 h-4 mr-2" />
                  Com Senha
                </TabsTrigger>
                <TabsTrigger value="link">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Link Mágico
                </TabsTrigger>
              </TabsList>
              
              {/* Login com senha */}
              <TabsContent value="senha">
                <form onSubmit={handleLoginSenha} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="senha"
                        type="password"
                        placeholder="Sua senha"
                        className="pl-10"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</>
                    ) : (
                      <><LogIn className="w-4 h-4 mr-2" /> Entrar</>
                    )}
                  </Button>
                  <div className="text-center mt-3">
                    <Link href="/morador/recuperar-senha">
                      <Button variant="link" size="sm" className="text-emerald-600 hover:text-emerald-700">
                        Esqueci minha senha
                      </Button>
                    </Link>
                  </div>
                </form>
              </TabsContent>
              
              {/* Login com link mágico */}
              <TabsContent value="link">
                <form onSubmit={handleSolicitarLink} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailLink">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="emailLink"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enviaremos um link de acesso para o seu email. Não precisa de senha!
                  </p>
                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={linkMagicoMutation.isPending}
                  >
                    {linkMagicoMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
                    ) : (
                      <><Wand2 className="w-4 h-4 mr-2" /> Enviar Link Mágico</>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            {/* Informação adicional */}
            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Primeiro acesso? Use o <strong>Link Mágico</strong> para criar sua senha.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Seu email deve estar cadastrado pelo gestor da organização.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Link para gestor */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            É gestor?{" "}
            <Link href="/dashboard" className="text-emerald-600 hover:underline">
              Acesse o painel administrativo
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
