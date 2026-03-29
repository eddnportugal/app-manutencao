import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { Loader2, Mail, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagemBloqueio, setMensagemBloqueio] = useState<string | null>(null);
  const utils = trpc.useUtils();

  // Verificar se usuário foi redirecionado por bloqueio
  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const bloqueado = params.get("bloqueado");
    const mensagem = params.get("mensagem");
    if (bloqueado === "true" && mensagem) {
      setMensagemBloqueio(decodeURIComponent(mensagem));
    }
  }, [searchString]);

  const loginMutation = trpc.auth.loginLocal.useMutation({
    onSuccess: async (data) => {
      toast.success(data.message);
      // Salvar token no localStorage para WebViews que não persistem cookies
      if (data.token) {
        localStorage.setItem("app_session_token", data.token);
      }
      try {
        // Recarregar dados do utilizador para atualizar cache
        await utils.auth.me.invalidate();
        // Forçar busca imediata para garantir que o cache tenha os dados
        await utils.auth.me.fetch();
      } catch (e) {
        console.warn("[Login] Erro ao buscar dados do usuário após login:", e);
      }
      // Navegação SPA — preserva o cache React Query
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Preencha todos os campos");
      return;
    }
    loginMutation.mutate({ email, senha });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img 
              src="/logo-login.png" 
              alt="App Manutenção" 
              className="h-24 mx-auto"
            />
          </Link>
          <p className="text-muted-foreground mt-2">Acesse sua conta</p>
        </div>

        {/* Alerta de Bloqueio */}
        {mensagemBloqueio && (
          <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Acesso Bloqueado</AlertTitle>
            <AlertDescription>
              {mensagemBloqueio}
            </AlertDescription>
          </Alert>
        )}

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Digite seu email e senha para acessar o painel
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loginMutation.isPending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="senha">Senha</Label>
                  <Link 
                    href="/recuperar-senha" 
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueci minha senha
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="••••••••"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={loginMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-8 mt-4">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/registar" className="text-primary hover:underline font-medium">
                  Criar conta
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao entrar, você concorda com nossos{" "}
          <Link href="/contrato" className="underline hover:text-foreground">
            Termos de Serviço
          </Link>
        </p>
      </div>
    </div>
  );
}
