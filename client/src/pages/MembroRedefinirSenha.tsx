import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function MembroRedefinirSenhaPage() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token") || "";
  
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Validar token
  const { data: tokenValidation, isLoading: isValidating } = trpc.membroEquipe.validarTokenRecuperacao.useQuery(
    { token },
    { enabled: !!token }
  );

  const redefinirMutation = trpc.membroEquipe.redefinirSenha.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setIsLoading(false);
    },
    onError: (err: any) => {
      setError(err.message || "Erro ao redefinir senha");
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!novaSenha || !confirmarSenha) {
      setError("Preencha todos os campos");
      return;
    }

    if (novaSenha.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);
    redefinirMutation.mutate({ token, novaSenha });
  };

  // Token inválido ou expirado
  if (!isValidating && tokenValidation && !tokenValidation.valid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        {/* Background decorativo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              {/* Ícone de erro */}
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">
                Link Inválido
              </CardTitle>
              <CardDescription className="text-gray-500 mt-2">
                {tokenValidation?.message || "Este link de recuperação é inválido ou já expirou."}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium mb-1">O que fazer?</p>
                    <p>Solicite uma nova recuperação de senha na página de login.</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setLocation("/equipe/esqueci-senha")}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200"
              >
                Solicitar Nova Recuperação
              </Button>

              <button
                onClick={() => setLocation("/equipe/login")}
                className="w-full mt-3 text-sm text-gray-600 hover:text-orange-600 transition-colors"
              >
                Voltar ao login
              </button>
            </CardContent>
          </Card>

          {/* Rodapé */}
          <p className="text-center text-sm text-gray-400 mt-6">
            App Manutenção © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    );
  }

  // Sucesso na redefinição
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        {/* Background decorativo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              {/* Ícone de sucesso */}
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                Senha Redefinida!
              </CardTitle>
              <CardDescription className="text-gray-500 mt-2">
                Sua senha foi alterada com sucesso. Agora você pode fazer login com sua nova senha.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4">
              <Button
                onClick={() => setLocation("/equipe/login")}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200"
              >
                Fazer Login
              </Button>
            </CardContent>
          </Card>

          {/* Rodapé */}
          <p className="text-center text-sm text-gray-400 mt-6">
            App Manutenção © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    );
  }

  // Carregando validação
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validando link de recuperação...</p>
        </div>
      </div>
    );
  }

  // Formulário de redefinição
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Botão voltar */}
        <button
          onClick={() => setLocation("/equipe/login")}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </button>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            {/* Logo */}
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Nova Senha
            </CardTitle>
            <CardDescription className="text-gray-500">
              {tokenValidation?.nome ? (
                <>Olá <strong>{tokenValidation.nome}</strong>, crie sua nova senha</>
              ) : (
                "Crie uma nova senha para sua conta"
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mensagem de erro */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Campo Nova Senha */}
              <div className="space-y-2">
                <Label htmlFor="novaSenha" className="text-gray-700 font-medium">
                  Nova Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="novaSenha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Campo Confirmar Senha */}
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha" className="text-gray-700 font-medium">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirmarSenha"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repita a nova senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="pl-10 pr-10 h-12 rounded-xl border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Indicador de força da senha */}
              {novaSenha && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded-full ${novaSenha.length >= 6 ? 'bg-green-500' : 'bg-gray-200'}`} />
                    <div className={`h-1 flex-1 rounded-full ${novaSenha.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`} />
                    <div className={`h-1 flex-1 rounded-full ${novaSenha.length >= 10 && /[A-Z]/.test(novaSenha) ? 'bg-green-500' : 'bg-gray-200'}`} />
                    <div className={`h-1 flex-1 rounded-full ${novaSenha.length >= 10 && /[A-Z]/.test(novaSenha) && /[0-9]/.test(novaSenha) ? 'bg-green-500' : 'bg-gray-200'}`} />
                  </div>
                  <p className="text-xs text-gray-500">
                    {novaSenha.length < 6 ? 'Senha muito curta' : 
                     novaSenha.length < 8 ? 'Senha fraca' :
                     novaSenha.length < 10 ? 'Senha média' : 'Senha forte'}
                  </p>
                </div>
              )}

              {/* Botão de redefinir */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  "Redefinir Senha"
                )}
              </Button>
            </form>

            {/* Informação adicional */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-start gap-3 text-sm text-gray-500">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p>
                  Após redefinir sua senha, você será redirecionado para a página de login.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé */}
        <p className="text-center text-sm text-gray-400 mt-6">
          App Manutenção © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
