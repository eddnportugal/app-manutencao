import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Building2, Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function MoradorRecuperarSenha() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  const solicitarRecuperacao = (trpc.morador as any).solicitarRecuperacaoSenha.useMutation({
    onSuccess: (data: any) => {
      setEnviado(true);
      toast.success("Solicitação enviada!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao solicitar recuperação");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Digite seu e-mail");
      return;
    }
    solicitarRecuperacao.mutate({ email: email.trim() });
  };

  if (enviado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">E-mail Enviado!</CardTitle>
            <CardDescription>
              Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <p className="font-medium mb-1">Não recebeu o e-mail?</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700">
                <li>Verifique sua caixa de spam</li>
                <li>Confirme se digitou o e-mail correto</li>
                <li>Aguarde alguns minutos e tente novamente</li>
              </ul>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => setEnviado(false)}
                className="w-full"
              >
                Tentar outro e-mail
              </Button>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
          <CardDescription>
            Digite seu e-mail para receber um link de recuperação de senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10"
                  disabled={solicitarRecuperacao.isPending}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={solicitarRecuperacao.isPending}
            >
              {solicitarRecuperacao.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Link de Recuperação"
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
