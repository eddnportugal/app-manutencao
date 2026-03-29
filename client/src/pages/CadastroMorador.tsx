import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { Building2, User, Mail, Phone, Home, CheckCircle2, Loader2, Lock, Eye, EyeOff } from "lucide-react";

export default function CadastroMorador() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    celular: "",
    apartamento: "",
    bloco: "",
    andar: "",
    tipo: "proprietario" as "proprietario" | "inquilino" | "familiar" | "funcionario",
    cpf: "",
    observacoes: "",
    senha: "",
    confirmarSenha: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Buscar informações da organização pelo token
  // @ts-ignore - Método existe no backend
  const { data: condominio, isLoading: condominioLoading, error: condominioError } = (trpc.condominio as any).getByToken.useQuery(
    { token: token || "" },
    { enabled: !!token }
  );

  // @ts-ignore - Método existe no backend
  const createMorador = (trpc.morador as any).createPublic.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Cadastro realizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao realizar cadastro: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.nome.trim()) {
      toast.error("O nome é obrigatório");
      return;
    }
    if (!form.apartamento.trim()) {
      toast.error("O apartamento é obrigatório");
      return;
    }
    if (!form.email.trim()) {
      toast.error("O e-mail é obrigatório para acesso ao portal");
      return;
    }
    if (!form.senha.trim()) {
      toast.error("A senha é obrigatória");
      return;
    }
    if (form.senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (!token) {
      toast.error("Token inválido");
      return;
    }

    createMorador.mutate({
      token,
      nome: form.nome,
      email: form.email,
      telefone: form.telefone || undefined,
      celular: form.celular || undefined,
      apartamento: form.apartamento,
      bloco: form.bloco || undefined,
      andar: form.andar || undefined,
      tipo: form.tipo,
      cpf: form.cpf || undefined,
      observacoes: form.observacoes || undefined,
      senha: form.senha,
    });
  };

  if (condominioLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (condominioError || !condominio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Link Inválido</h2>
            <p className="text-muted-foreground">
              Este link de cadastro não é válido ou expirou. Entre em contato com a administração da sua manutenção.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Cadastro Realizado!</h2>
            <p className="text-muted-foreground mb-6">
              Seu cadastro foi enviado com sucesso. A administração da manutenção irá validar suas informações.
            </p>
            <div className="p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Você receberá uma notificação quando seu cadastro for aprovado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header com logo da organização */}
        <div className="text-center mb-8">
          {condominio.logoUrl ? (
            <img 
              src={condominio.logoUrl} 
              alt={condominio.nome}
              className="w-24 h-24 object-contain mx-auto mb-4 rounded-xl shadow-md"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <Building2 className="w-12 h-12 text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground">{condominio.nome}</h1>
          <p className="text-muted-foreground">Cadastro de Morador</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Formulário de Cadastro
            </CardTitle>
            <CardDescription className="text-blue-100">
              Preencha seus dados para se cadastrar como morador
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Dados Pessoais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={form.nome}
                      onChange={(e) => setForm({ ...form, nome: e.target.value })}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={form.cpf}
                      onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Morador *</Label>
                    <Select
                      value={form.tipo}
                      onValueChange={(value: any) => setForm({ ...form, tipo: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="proprietario">Proprietário</SelectItem>
                        <SelectItem value="inquilino">Inquilino</SelectItem>
                        <SelectItem value="familiar">Familiar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-500" />
                  Contato
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="seu@email.com"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Será usado para acessar o Portal do Morador</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone Fixo</Label>
                    <Input
                      id="telefone"
                      value={form.telefone}
                      onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="celular">Celular / WhatsApp</Label>
                    <Input
                      id="celular"
                      value={form.celular}
                      onChange={(e) => setForm({ ...form, celular: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              {/* Senha de Acesso */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4 text-purple-500" />
                  Senha de Acesso ao Portal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="senha"
                        type={showPassword ? "text" : "password"}
                        value={form.senha}
                        onChange={(e) => setForm({ ...form, senha: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                    <div className="relative">
                      <Input
                        id="confirmarSenha"
                        type={showConfirmPassword ? "text" : "password"}
                        value={form.confirmarSenha}
                        onChange={(e) => setForm({ ...form, confirmarSenha: e.target.value })}
                        placeholder="Repita a senha"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Esta senha será usada para acessar o Portal do Morador onde você pode criar classificados e caronas.
                </p>
              </div>

              {/* Endereço no Condomínio */}
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Home className="w-4 h-4 text-amber-500" />
                  Endereço no Condomínio
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloco">Bloco / Torre</Label>
                    <Input
                      id="bloco"
                      value={form.bloco}
                      onChange={(e) => setForm({ ...form, bloco: e.target.value })}
                      placeholder="Ex: A, B, Torre 1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="andar">Andar</Label>
                    <Input
                      id="andar"
                      value={form.andar}
                      onChange={(e) => setForm({ ...form, andar: e.target.value })}
                      placeholder="Ex: 5º"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apartamento">Apartamento *</Label>
                    <Input
                      id="apartamento"
                      value={form.apartamento}
                      onChange={(e) => setForm({ ...form, apartamento: e.target.value })}
                      placeholder="Ex: 501"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={form.observacoes}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  placeholder="Informações adicionais (opcional)"
                  rows={3}
                />
              </div>

              {/* Botão de envio */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-6 text-lg"
                disabled={createMorador.isPending}
              >
                {createMorador.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Enviar Cadastro
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Ao enviar, você concorda com os termos de uso e política de privacidade do local de manutenção.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Powered by <span className="font-semibold text-blue-600">App Manutenção</span></p>
        </div>
      </div>
    </div>
  );
}
