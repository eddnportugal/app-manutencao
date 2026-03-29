import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { 
  Key, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  LogIn,
  Smartphone,
  ArrowRight
} from "lucide-react";

interface AppLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess?: (appId: number, token: string) => void;
}

export function AppLoginModal({ open, onOpenChange, onLoginSuccess }: AppLoginModalProps) {
  const [activeTab, setActiveTab] = useState<"codigo" | "email">("codigo");
  const [codigo, setCodigo] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrouRecuperacao, setMostrouRecuperacao] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [appIdRecuperacao, setAppIdRecuperacao] = useState("");
  
  const loginComCodigoMutation = trpc.appAcesso.loginComCodigo.useMutation({
    onSuccess: (data) => {
      toast.success(`Bem-vindo ao ${data.app.nome}!`);
      // Guardar token na sessão
      sessionStorage.setItem("app_token", data.token);
      sessionStorage.setItem("app_id", data.app.id.toString());
      sessionStorage.setItem("app_nome", data.app.nome);
      sessionStorage.setItem("app_permissao", data.permissao || "visualizar");
      onLoginSuccess?.(data.app.id, data.token);
      onOpenChange(false);
      // Redirecionar para o app
      window.location.href = `/meuapp/${data.app.id}`;
    },
    onError: (error) => {
      toast.error(error.message);
      setIsLoading(false);
    },
  });
  
  const loginComEmailMutation = trpc.appAcesso.loginComEmail.useMutation({
    onSuccess: (data) => {
      toast.success(`Bem-vindo, ${data.usuario.nome}!`);
      // Guardar token na sessão
      sessionStorage.setItem("app_token", data.token);
      sessionStorage.setItem("app_id", data.app.id.toString());
      sessionStorage.setItem("app_nome", data.app.nome);
      sessionStorage.setItem("app_permissao", data.permissao || "visualizar");
      sessionStorage.setItem("app_usuario_nome", data.usuario.nome);
      onLoginSuccess?.(data.app.id, data.token);
      onOpenChange(false);
      // Redirecionar para o app
      window.location.href = `/meuapp/${data.app.id}`;
    },
    onError: (error) => {
      toast.error(error.message);
      setIsLoading(false);
    },
  });
  
  const handleLoginCodigo = () => {
    if (!codigo.trim()) {
      toast.error("Digite o código do app");
      return;
    }
    setIsLoading(true);
    loginComCodigoMutation.mutate({ codigo: codigo.toUpperCase().trim() });
  };
  
  const handleLoginEmail = () => {
    if (!email.trim()) {
      toast.error("Digite o email");
      return;
    }
    if (!senha) {
      toast.error("Digite a senha");
      return;
    }
    setIsLoading(true);
    loginComEmailMutation.mutate({ email: email.trim(), senha });
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (activeTab === "codigo") {
        handleLoginCodigo();
      } else {
        handleLoginEmail();
      }
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="h-5 w-5 text-primary" />
            ACESSO EXCLUSIVO DA EQUIPE
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <span>Entre com o código do app ou suas credenciais</span>
            <p className="text-xs text-orange-600 font-medium mt-2">
              Para cadastrar a equipe cadastre sua manutenção em ACESSAR PLATAFORMA.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="codigo" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Código do App
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email e Senha
            </TabsTrigger>
          </TabsList>
          
          {/* Login com Código */}
          <TabsContent value="codigo" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="codigo">Código do App</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="codigo"
                  placeholder="Ex: MANUT-2026"
                  className="pl-10 uppercase font-mono text-lg tracking-wider"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  onKeyPress={handleKeyPress}
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                O código foi fornecido pelo gestor do app
              </p>
            </div>
            
            <Button 
              className="w-full gap-2" 
              onClick={handleLoginCodigo}
              disabled={isLoading || !codigo.trim()}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  A entrar...
                </>
              ) : (
                <>
                  Entrar no App
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </TabsContent>
          
          {/* Login com Email */}
          <TabsContent value="email" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <Button 
              className="w-full gap-2" 
              onClick={handleLoginEmail}
              disabled={isLoading || !email.trim() || !senha}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  A entrar...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Entrar
                </>
              )}
            </Button>
            
            <div className="text-center">
              <button 
                type="button"
                onClick={() => setMostrouRecuperacao(true)}
                className="text-sm text-primary hover:underline"
              >
                Esqueceu a senha?
              </button>
            </div>

            {mostrouRecuperacao && (
              <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200 space-y-3">
                <div>
                  <Label htmlFor="appIdRecuperacao" className="text-sm">ID do App</Label>
                  <Input
                    id="appIdRecuperacao"
                    placeholder="Digite o ID do seu app"
                    value={appIdRecuperacao}
                    onChange={(e) => setAppIdRecuperacao(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="emailRecuperacao" className="text-sm">Email</Label>
                  <Input
                    id="emailRecuperacao"
                    type="email"
                    placeholder="Digite seu email"
                    value={emailRecuperacao}
                    onChange={(e) => setEmailRecuperacao(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      if (!appIdRecuperacao || !emailRecuperacao) {
                        toast.error("Preencha todos os campos");
                        return;
                      }
                      toast.success("Link de recuperacao enviado para seu email!");
                      setMostrouRecuperacao(false);
                      setEmailRecuperacao("");
                      setAppIdRecuperacao("");
                    }}
                  >
                    Enviar Link
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMostrouRecuperacao(false);
                      setEmailRecuperacao("");
                      setAppIdRecuperacao("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Não tem acesso? Contacte o gestor da sua organização.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
