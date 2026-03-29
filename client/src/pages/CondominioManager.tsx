import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Calendar,
  Car,
  ChevronRight,
  Edit,
  Eye,
  Heart,
  Loader2,
  Package,
  Plus,
  Settings,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "@/components/ui/sonner";
import RevistaForm from "@/components/forms/RevistaForm";
import FuncionarioForm from "@/components/forms/FuncionarioForm";

export default function CondominioManager() {
  const params = useParams<{ id: string }>();
  const condominioId = parseInt(params.id || "0");
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState("revistas");
  const [showRevistaForm, setShowRevistaForm] = useState(false);
  const [showFuncionarioForm, setShowFuncionarioForm] = useState(false);

  const { data: condominio, isLoading: condominioLoading } = trpc.condominio.get.useQuery(
    { id: condominioId },
    { enabled: condominioId > 0 }
  );

  const { data: revistas, isLoading: revistasLoading } = trpc.revista.list.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );

  const { data: funcionarios, isLoading: funcionariosLoading } = trpc.funcionario.list.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );

  const { data: classificados } = trpc.classificado.list.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );

  const { data: caronas } = trpc.carona.list.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );

  const { data: achadosPerdidos } = trpc.achadoPerdido.list.useQuery(
    { condominioId },
    { enabled: condominioId > 0 }
  );

  const utils = trpc.useUtils();

  const deleteRevistaMutation = trpc.revista.delete.useMutation({
    onSuccess: () => {
      toast.success("Revista removida!");
      utils.revista.list.invalidate({ condominioId });
    },
  });

  const deleteFuncionarioMutation = trpc.funcionario.delete.useMutation({
    onSuccess: () => {
      toast.success("Funcionário removido!");
      utils.funcionario.list.invalidate({ condominioId });
    },
  });

  if (authLoading || condominioLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">A carregar...</p>
        </div>
      </div>
    );
  }

  if (!condominio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Condomínio não encontrado</h2>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Painel
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: condominio.corPrimaria || "#4F46E5" }}
                >
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-serif text-xl font-bold">{condominio.nome}</h1>
                  <p className="text-sm text-muted-foreground">
                    {condominio.cidade && condominio.estado
                      ? `${condominio.cidade}, ${condominio.estado}`
                      : "Gestão da Manutenção"}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="revistas">
              <BookOpen className="w-4 h-4 mr-2" />
              Livro de Manutenções
            </TabsTrigger>
            <TabsTrigger value="funcionarios">
              <Users className="w-4 h-4 mr-2" />
              Funcionários
            </TabsTrigger>
            <TabsTrigger value="estatisticas">
              <Calendar className="w-4 h-4 mr-2" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          {/* Revistas Tab */}
          <TabsContent value="revistas" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold">Livro de Manutenções</h2>
                <p className="text-muted-foreground">Gerencie seus apps, livros de manutenções e relatórios</p>
              </div>
              <Dialog open={showRevistaForm} onOpenChange={setShowRevistaForm}>
                <DialogTrigger asChild>
                  <Button className="btn-magazine">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Livro
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden p-0">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
                    <DialogHeader className="space-y-1">
                      <DialogTitle className="flex items-center gap-2 text-white text-lg">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        Novo Livro de Manutenções
                      </DialogTitle>
                      <DialogDescription className="text-blue-100">
                        Configure os detalhes do seu novo livro de manutenções
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <RevistaForm
                    condominioId={condominioId}
                    onSuccess={(id, shareLink) => {
                      setShowRevistaForm(false);
                      navigate(`/revista/editor/${id}`);
                    }}
                  />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {revistasLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : revistas && revistas.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {revistas.map((revista) => (
                  <Card key={revista.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                        <BookOpen className="w-12 h-12 text-primary/50" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <CardTitle className="font-serif">{revista.titulo}</CardTitle>
                      <CardDescription>{revista.edicao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <span className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          revista.status === "publicada" ? "bg-emerald-100 text-emerald-700" :
                          revista.status === "rascunho" ? "bg-amber-100 text-amber-700" :
                          "bg-gray-100 text-gray-700"
                        )}>
                          {revista.status === "publicada" ? "Publicada" :
                           revista.status === "rascunho" ? "Rascunho" : "Arquivada"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(revista.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/revista/editor/${revista.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                        </Link>
                        <Link href={`/revista/${revista.shareLink}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja remover este projeto?")) {
                              deleteRevistaMutation.mutate({ id: revista.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-12">
                <CardContent className="text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-lg font-semibold mb-2">Nenhum livro criado</h3>
                  <p className="text-muted-foreground mb-4">
                    Crie seu primeiro livro para esta manutenção
                  </p>
                  <Button className="btn-magazine" onClick={() => setShowRevistaForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Livro
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Funcionários Tab */}
          <TabsContent value="funcionarios" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold">Funcionários</h2>
                <p className="text-muted-foreground">Gerencie a equipe da manutenção</p>
              </div>
              <Dialog open={showFuncionarioForm} onOpenChange={setShowFuncionarioForm}>
                <DialogTrigger asChild>
                  <Button className="btn-magazine">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Funcionário
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4">
                    <DialogHeader className="space-y-1">
                      <DialogTitle className="flex items-center gap-2 text-white text-lg">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        Novo Funcionário
                      </DialogTitle>
                      <DialogDescription className="text-teal-100">
                        Adicione um novo funcionário à manutenção
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[70vh]">
                  <FuncionarioForm
                    condominioId={condominioId}
                    onSuccess={() => setShowFuncionarioForm(false)}
                    onCancel={() => setShowFuncionarioForm(false)}
                  />
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {funcionariosLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : funcionarios && funcionarios.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {funcionarios.map((func) => (
                  <Card key={func.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{func.nome}</h4>
                          <p className="text-sm text-muted-foreground">{func.cargo}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Remover este funcionário?")) {
                              deleteFuncionarioMutation.mutate({ id: func.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="py-12">
                <CardContent className="text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-lg font-semibold mb-2">Nenhum funcionário cadastrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Cadastre os funcionários da manutenção
                  </p>
                  <Button className="btn-magazine" onClick={() => setShowFuncionarioForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Funcionário
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Estatísticas Tab */}
          <TabsContent value="estatisticas" className="space-y-6">
            <h2 className="font-serif text-2xl font-bold">Estatísticas</h2>
            
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-primary">{revistas?.length || 0}</div>
                  <p className="text-sm text-muted-foreground">Projetos Criados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-emerald-500">
                    {revistas?.filter(r => r.status === "publicada").length || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Publicadas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-purple-500">{funcionarios?.length || 0}</div>
                  <p className="text-sm text-muted-foreground">Funcionários</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold text-amber-500">0</div>
                  <p className="text-sm text-muted-foreground">Moradores</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
