import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { Loader2, Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

export default function RedefinirSenha() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Validar token
  const { data: validacao, isLoading: validandoToken } = trpc.auth.validarTokenRecuperacao.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  const redefinirMutation = trpc.auth.redefinirSenha.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao redefinir senha");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaSenha || !confirmarSenha) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    redefinirMutation.mutate({ token: token || "", novaSenha });
  };

  // Validações em tempo real
  const senhaValida = novaSenha.length >= 6;
  const senhasCoicidem = novaSenha === confirmarSenha && confirmarSenha.length > 0;

  // Loading state
  if (validandoToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Validando link...</p>
        </div>
      </div>
    );
  }

  // Token inválido ou expirado
  if (!validacao?.valido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <img 
                src="/logo-appsindico-horizontal.png" 
                alt="App Manutenção" 
                className="h-16 mx-auto"
              />
            </Link>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Link Inválido</CardTitle>
              <CardDescription>
                {validacao?.mensagem || "Este link de recuperação é inválido ou expirou."}
              </CardDescription>
            </CardHeader>
            
            <CardFooter className="flex flex-col gap-4">
              <Link href="/recuperar-senha" className="w-full">
                <Button className="w-full">
                  Solicitar Novo Link
                </Button>
              </Link>
              
              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img 
              src="/logo-appsindico-horizontal.png" 
              alt="App Manutenção" 
              className="h-16 mx-auto"
            />
          </Link>
          <p className="text-muted-foreground mt-2">Defina sua nova senha</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Nova Senha</CardTitle>
            <CardDescription className="text-center">
              Olá, <strong>{validacao.nome || validacao.email}</strong>! Digite sua nova senha abaixo.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="novaSenha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={redefinirMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {novaSenha.length > 0 && (
                  <div className={`flex items-center gap-1 text-xs ${senhaValida ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {senhaValida && <CheckCircle className="h-3 w-3" />}
                    {senhaValida ? 'Senha válida' : 'Mínimo 6 caracteres'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmarSenha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Repita a nova senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="pl-10"
                    disabled={redefinirMutation.isPending}
                  />
                </div>
                {confirmarSenha.length > 0 && (
                  <div className={`flex items-center gap-1 text-xs ${senhasCoicidem ? 'text-green-600' : 'text-red-500'}`}>
                    {senhasCoicidem && <CheckCircle className="h-3 w-3" />}
                    {senhasCoicidem ? 'Senhas coincidem' : 'As senhas não coincidem'}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={redefinirMutation.isPending || !senhaValida || !senhasCoicidem}
              >
                {redefinirMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  "Redefinir Senha"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
