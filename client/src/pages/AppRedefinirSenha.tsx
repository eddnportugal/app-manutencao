import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "@/components/ui/sonner";

export default function AppRedefinirSenha() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  // Extrair token da URL
  useEffect(() => {
    const path = window.location.pathname;
    const tokenFromUrl = path.split("/").pop();
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, []);

  // Validar token
  const { data: validacaoToken, isLoading: validando } = trpc.recuperacaoSenha.app.validarToken.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  // Redefinir senha
  const redefinirMutation = trpc.recuperacaoSenha.app.redefinirSenha.useMutation({
    onSuccess: () => {
      toast.success("Senha redefinida com sucesso!");
      setTimeout(() => {
        setLocation("/app");
      }, 3000);
    },
    onError: (error: any) => {
      setMensagemErro(error.message || "Erro ao redefinir senha. Tente novamente.");
      toast.error(error.message || "Erro ao redefinir senha");
    },
  });

  const handleRedefinir = (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (novaSenha.length < 8) {
      setMensagemErro("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setMensagemErro("As senhas não coincidem");
      return;
    }

    if (!token) {
      setMensagemErro("Token inválido");
      return;
    }

    // Chamar mutação
    redefinirMutation.mutate({
      token,
      novaSenha,
    });
  };

  // Determinar etapa
  let etapa: "validando" | "formulario" | "sucesso" | "erro" = "validando";
  
  if (!validando && validacaoToken) {
    if (redefinirMutation.isSuccess) {
      etapa = "sucesso";
    } else if (validacaoToken.valido) {
      etapa = "formulario";
    } else {
      etapa = "erro";
      if (!mensagemErro) {
        setMensagemErro("Link expirado ou inválido. Solicite uma nova recuperação de senha.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-xl">
        {(validando || !validacaoToken) && (
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Validando link...</p>
          </CardContent>
        )}

        {etapa === "formulario" && (
          <>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-blue-100">
                  <Lock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
              <CardDescription>Digite sua nova senha</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleRedefinir} className="space-y-4">
                {/* Campo Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="novaSenha"
                      type={mostrarSenha ? "text" : "password"}
                      placeholder="Digite sua nova senha"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                      className="pr-10"
                      disabled={redefinirMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={redefinirMutation.isPending}
                    >
                      {mostrarSenha ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
                </div>

                {/* Campo Confirmar Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={mostrarConfirmar ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="pr-10"
                      disabled={redefinirMutation.isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={redefinirMutation.isPending}
                    >
                      {mostrarConfirmar ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Mensagem de Erro */}
                {mensagemErro && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{mensagemErro}</p>
                  </div>
                )}

                {/* Botão Redefinir */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={redefinirMutation.isPending || !novaSenha || !confirmarSenha}
                >
                  {redefinirMutation.isPending ? "Redefinindo..." : "Redefinir Senha"}
                </Button>
              </form>
            </CardContent>
          </>
        )}

        {etapa === "sucesso" && (
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sucesso!</h3>
            <p className="text-gray-600 mb-4">Sua senha foi redefinida com sucesso.</p>
            <p className="text-sm text-gray-500">Redirecionando para login...</p>
          </CardContent>
        )}

        {etapa === "erro" && (
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Erro</h3>
            <p className="text-gray-600 mb-6">{mensagemErro || "Link expirado ou inválido"}</p>
            <Button
              onClick={() => setLocation("/app")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
