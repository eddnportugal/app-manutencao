import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { Loader2, Mail, Lock, Eye, EyeOff, User, CheckCircle, Building2, Users } from "lucide-react";

export default function Registar() {
  const [, setLocation] = useLocation();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [confirmarEmail, setConfirmarEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tipoConta, setTipoConta] = useState<"sindico" | "administradora">("sindico");

  const registarMutation = trpc.auth.registar.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !email || !confirmarEmail || !senha || !confirmarSenha) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    if (email !== confirmarEmail) {
      toast.error("Os emails não coincidem");
      return;
    }
    
    if (senha !== confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    registarMutation.mutate({ nome, email, senha, tipoConta });
  };

  // Validações em tempo real
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailsCoicidem = email === confirmarEmail && confirmarEmail.length > 0;
  const senhaValida = senha.length >= 6;
  const senhasCoicidem = senha === confirmarSenha && confirmarSenha.length > 0;

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
          <p className="text-muted-foreground mt-2">Crie sua conta</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-center">Criar Conta</CardTitle>
            <CardDescription className="text-center">
              Preencha os dados abaixo para começar
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Tipo de Conta */}
              <div className="space-y-3">
                <Label>Tipo de Conta</Label>
                <RadioGroup
                  value={tipoConta}
                  onValueChange={(value) => setTipoConta(value as "sindico" | "administradora")}
                  className="grid grid-cols-2 gap-3"
                >
                  <div>
                    <RadioGroupItem
                      value="sindico"
                      id="sindico"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="sindico"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                    >
                      <Building2 className="h-6 w-6 mb-2" />
                      <span className="font-medium">Gestor</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">
                        Gerir 1 local
                      </span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="administradora"
                      id="administradora"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="administradora"
                      className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                    >
                      <Users className="h-6 w-6 mb-2" />
                      <span className="font-medium">Empresa</span>
                      <span className="text-xs text-muted-foreground text-center mt-1">
                        Gerir múltiplos locais
                      </span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nome">
                  {tipoConta === "administradora" ? "Nome da Empresa" : "Nome Completo / Empresa"}
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nome"
                    type="text"
                    placeholder={tipoConta === "administradora" ? "Nome da administradora" : "Seu nome completo"}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="pl-10"
                    disabled={registarMutation.isPending}
                  />
                </div>
              </div>

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
                    disabled={registarMutation.isPending}
                  />
                </div>
                {email.length > 0 && (
                  <div className={`flex items-center gap-1 text-xs ${emailValido ? 'text-green-600' : 'text-red-500'}`}>
                    {emailValido && <CheckCircle className="h-3 w-3" />}
                    {emailValido ? 'Email válido' : 'Digite um email válido'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarEmail">Confirmar Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmarEmail"
                    type="email"
                    placeholder="Repita o email"
                    value={confirmarEmail}
                    onChange={(e) => setConfirmarEmail(e.target.value)}
                    className="pl-10"
                    disabled={registarMutation.isPending}
                  />
                </div>
                {confirmarEmail.length > 0 && (
                  <div className={`flex items-center gap-1 text-xs ${emailsCoicidem ? 'text-green-600' : 'text-red-500'}`}>
                    {emailsCoicidem && <CheckCircle className="h-3 w-3" />}
                    {emailsCoicidem ? 'Emails coincidem' : 'Os emails não coincidem'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="pl-10 pr-10"
                    disabled={registarMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {senha.length > 0 && (
                  <div className={`flex items-center gap-1 text-xs ${senhaValida ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {senhaValida && <CheckCircle className="h-3 w-3" />}
                    {senhaValida ? 'Senha válida' : 'Mínimo 6 caracteres'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmarSenha"
                    type={mostrarSenha ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="pl-10"
                    disabled={registarMutation.isPending}
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
                disabled={registarMutation.isPending || !emailValido || !emailsCoicidem || !senhaValida || !senhasCoicidem}
              >
                {registarMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Entrar
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao criar uma conta, você concorda com nossos{" "}
          <Link href="/contrato" className="underline hover:text-foreground">
            Termos de Serviço
          </Link>
        </p>
      </div>
    </div>
  );
}
