import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);

  const recuperarMutation = trpc.auth.solicitarRecuperacao.useMutation({
    onSuccess: (data) => {
      setEnviado(true);
      toast.success("Verifique seu email para redefinir a senha");
      // Em desenvolvimento, mostrar o token para testes
      if (import.meta.env.DEV && data._debug_token) {
        console.log("Token de recuperação (dev):", data._debug_token);
        toast.info(`Link: /redefinir-senha/${data._debug_token}`, { duration: 10000 });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao solicitar recuperação");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite seu email");
      return;
    }
    recuperarMutation.mutate({ email });
  };

  if (enviado) {
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
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4 text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Email Enviado!</CardTitle>
              <CardDescription>
                Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-medium mb-2">Não recebeu o email?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Verifique sua pasta de spam</li>
                  <li>Aguarde alguns minutos</li>
                  <li>Confirme se o email está correto</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setEnviado(false)}
              >
                Tentar outro email
              </Button>
              
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
              src="/logo-login.png" 
              alt="App Manutenção" 
              className="h-24 mx-auto"
            />
          </Link>
          <p className="text-muted-foreground mt-2">Recupere sua senha</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Esqueceu a Senha?</CardTitle>
            <CardDescription className="text-center">
              Digite seu email e enviaremos um link para redefinir sua senha
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
                    disabled={recuperarMutation.isPending}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={recuperarMutation.isPending}
              >
                {recuperarMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Link de Recuperação"
                )}
              </Button>

              <Link href="/login" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao login
                </Button>
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
