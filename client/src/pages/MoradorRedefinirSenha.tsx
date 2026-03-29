import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Building2, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function MoradorRedefinirSenha() {
  const { token } = useParams<{ token: string }>();
  const [, setLocation] = useLocation();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Validar token
  const { data: validacao, isLoading: validando } = (trpc.morador as any).validarTokenRecuperacao.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  // Redefinir senha
  const redefinirSenha = (trpc.morador as any).redefinirSenha.useMutation({
    onSuccess: (data: any) => {
      setSucesso(true);
      toast.success("Senha redefinida com sucesso!");
      
      // Salvar token de sessão
      if (data.token) {
        localStorage.setItem("moradorToken", data.token);
        localStorage.setItem("moradorData", JSON.stringify(data.morador));
        if (data.condominio) {
          localStorage.setItem("moradorCondominio", JSON.stringify(data.condominio));
        }
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao redefinir senha");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    redefinirSenha.mutate({ token: token || "", novaSenha });
  };

  // Token inválido ou expirado
  if (!validando && validacao && !validacao.valido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Link Inválido</CardTitle>
            <CardDescription>
              {validacao.mensagem || "Este link de recuperação é inválido ou expirou."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Os links de recuperação expiram após 1 hora por motivos de segurança.
            </p>
            
            <div className="flex flex-col gap-2">
              <Link href="/morador/recuperar-senha">
                <Button className="w-full">
                  Solicitar Novo Link
                </Button>
              </Link>
              <Link href="/morador/login">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sucesso
  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Senha Redefinida!</CardTitle>
            <CardDescription>
              Sua senha foi alterada com sucesso. Você já está logado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/morador">
              <Button className="w-full">
                Acessar Portal do Morador
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Carregando validação
  if (validando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Validando link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
          <CardDescription>
            {validacao?.nome ? (
              <>Olá, <strong>{validacao.nome}</strong>! Digite sua nova senha.</>
            ) : (
              "Digite sua nova senha abaixo."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="novaSenha"
                  type={mostrarSenha ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="pl-10 pr-10"
                  disabled={redefinirSenha.isPending}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmarSenha"
                  type={mostrarSenha ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha"
                  className="pl-10"
                  disabled={redefinirSenha.isPending}
                />
              </div>
              {confirmarSenha && novaSenha !== confirmarSenha && (
                <p className="text-sm text-red-500">As senhas não coincidem</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={redefinirSenha.isPending || novaSenha.length < 6 || novaSenha !== confirmarSenha}
            >
              {redefinirSenha.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir Senha"
              )}
            </Button>

            <div className="text-center">
              <Link href="/morador/login">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
