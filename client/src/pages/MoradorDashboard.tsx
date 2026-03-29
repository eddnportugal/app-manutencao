import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";
import { useMoradorAuth } from "./MoradorLogin";
import { 
  Building2, 
  LogOut, 
  ShoppingBag, 
  Car, 
  Plus,
  Loader2,
  Home,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Trash2,
  Edit,
  Eye,
  MessageCircle,
  Bell,
  Vote,
  FileText
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MoradorDashboard() {
  const [, navigate] = useLocation();
  const { token, morador, condominio, isLoading, isLoggedIn, logout } = useMoradorAuth();
  const [activeTab, setActiveTab] = useState("inicio");
  
  // Estados para criação de classificado
  const [novoClassificado, setNovoClassificado] = useState({
    titulo: "",
    descricao: "",
    preco: "",
    categoria: "venda",
    contato: "",
    imagemUrl: "",
  });
  const [dialogClassificadoAberto, setDialogClassificadoAberto] = useState(false);
  
  // Estados para criação de carona
  const [novaCarona, setNovaCarona] = useState({
    origem: "",
    destino: "",
    data: "",
    horario: "",
    vagas: "1",
    tipo: "ofereco" as "ofereco" | "procuro",
    observacoes: "",
    contato: "",
  });
  const [dialogCaronaAberto, setDialogCaronaAberto] = useState(false);
  
  // Queries
  const { data: meusClassificados, refetch: refetchClassificados } = trpc.classificado.listByMorador.useQuery(
    { moradorId: morador?.id || 0 },
    { enabled: !!morador?.id }
  );
  
  const { data: minhasCaronas, refetch: refetchCaronas } = trpc.carona.listByMorador.useQuery(
    { moradorId: morador?.id || 0 },
    { enabled: !!morador?.id }
  );
  
  // Mutations
  const criarClassificadoMutation = trpc.classificado.createByMorador.useMutation({
    onSuccess: () => {
      toast.success("Classificado criado com sucesso!");
      setDialogClassificadoAberto(false);
      setNovoClassificado({
        titulo: "",
        descricao: "",
        preco: "",
        categoria: "venda",
        contato: "",
        imagemUrl: "",
      });
      refetchClassificados();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const excluirClassificadoMutation = trpc.classificado.deleteByMorador.useMutation({
    onSuccess: () => {
      toast.success("Classificado excluído!");
      refetchClassificados();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const criarCaronaMutation = trpc.carona.createByMorador.useMutation({
    onSuccess: () => {
      toast.success("Carona publicada com sucesso!");
      setDialogCaronaAberto(false);
      setNovaCarona({
        origem: "",
        destino: "",
        data: "",
        horario: "",
        vagas: "1",
        tipo: "ofereco",
        observacoes: "",
        contato: "",
      });
      refetchCaronas();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const excluirCaronaMutation = trpc.carona.deleteByMorador.useMutation({
    onSuccess: () => {
      toast.success("Carona excluída!");
      refetchCaronas();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const logoutMutation = trpc.morador.logout.useMutation({
    onSuccess: () => {
      logout();
      navigate("/morador/login");
    },
  });
  
  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/morador/login");
    }
  }, [isLoading, isLoggedIn, navigate]);
  
  const handleLogout = () => {
    if (token) {
      logoutMutation.mutate({ token });
    }
  };
  
  const handleCriarClassificado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !morador) return;
    
    if (!novoClassificado.titulo.trim()) {
      toast.error("Preencha o título");
      return;
    }
    
    criarClassificadoMutation.mutate({
      token,
      titulo: novoClassificado.titulo,
      descricao: novoClassificado.descricao || undefined,
      preco: novoClassificado.preco ? parseFloat(novoClassificado.preco) : undefined,
      categoria: novoClassificado.categoria,
      contato: novoClassificado.contato || morador.email || undefined,
      imagemUrl: novoClassificado.imagemUrl || undefined,
    });
  };
  
  const handleCriarCarona = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !morador) return;
    
    if (!novaCarona.origem.trim() || !novaCarona.destino.trim()) {
      toast.error("Preencha origem e destino");
      return;
    }
    
    criarCaronaMutation.mutate({
      token,
      origem: novaCarona.origem,
      destino: novaCarona.destino,
      data: novaCarona.data ? new Date(novaCarona.data) : undefined,
      horario: novaCarona.horario || undefined,
      vagas: parseInt(novaCarona.vagas) || 1,
      tipo: novaCarona.tipo,
      observacoes: novaCarona.observacoes || undefined,
      contato: novaCarona.contato || morador.email || undefined,
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-emerald-600 animate-spin" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!morador || !condominio) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {condominio.logoUrl ? (
                <img src={condominio.logoUrl} alt={condominio.nome} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-600" />
                </div>
              )}
              <div>
                <h1 className="font-semibold text-gray-900">{condominio.nome}</h1>
                <p className="text-sm text-gray-500">Portal do Morador</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-gray-900">{morador.nome}</p>
                <p className="text-sm text-gray-500">
                  {morador.bloco ? `Bloco ${morador.bloco} - ` : ""}Apt {morador.apartamento}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="inicio">
              <Home className="w-4 h-4 mr-2" />
              Início
            </TabsTrigger>
            <TabsTrigger value="classificados">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Classificados
            </TabsTrigger>
            <TabsTrigger value="caronas">
              <Car className="w-4 h-4 mr-2" />
              Caronas
            </TabsTrigger>
          </TabsList>
          
          {/* Tab Início */}
          <TabsContent value="inicio">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Card de boas-vindas */}
              <Card className="md:col-span-2 lg:col-span-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Olá, {morador.nome?.split(" ")[0]}!</h2>
                      <p className="text-emerald-100">
                        Bem-vindo ao portal do morador do {condominio.nome}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Meus dados */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-emerald-600" />
                    Meus Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Home className="w-4 h-4 text-gray-400" />
                    <span>{morador.bloco ? `Bloco ${morador.bloco} - ` : ""}Apt {morador.apartamento}</span>
                  </div>
                  {morador.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{morador.email}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Atalhos rápidos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-emerald-600" />
                    Criar Novo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      setActiveTab("classificados");
                      setDialogClassificadoAberto(true);
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Novo Classificado
                  </Button>
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => {
                      setActiveTab("caronas");
                      setDialogCaronaAberto(true);
                    }}
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Nova Carona
                  </Button>
                </CardContent>
              </Card>
              
              {/* Estatísticas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Minhas Publicações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-600">{meusClassificados?.length || 0}</p>
                      <p className="text-sm text-gray-600">Classificados</p>
                    </div>
                    <div className="text-center p-3 bg-teal-50 rounded-lg">
                      <p className="text-2xl font-bold text-teal-600">{minhasCaronas?.length || 0}</p>
                      <p className="text-sm text-gray-600">Caronas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Tab Classificados */}
          <TabsContent value="classificados">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Meus Classificados</h2>
              <Dialog open={dialogClassificadoAberto} onOpenChange={setDialogClassificadoAberto}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Classificado
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-hidden p-0">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                    <DialogHeader className="space-y-1">
                      <DialogTitle className="flex items-center gap-2 text-white text-lg">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <Tag className="w-5 h-5 text-white" />
                        </div>
                        Criar Classificado
                      </DialogTitle>
                      <DialogDescription className="text-emerald-100">
                        Publique um anúncio para a equipa da organização
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <form onSubmit={handleCriarClassificado} className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        placeholder="Ex: Bicicleta infantil"
                        value={novoClassificado.titulo}
                        onChange={(e) => setNovoClassificado({...novoClassificado, titulo: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria</Label>
                      <Select 
                        value={novoClassificado.categoria}
                        onValueChange={(v) => setNovoClassificado({...novoClassificado, categoria: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="venda">Venda</SelectItem>
                          <SelectItem value="doacao">Doação</SelectItem>
                          <SelectItem value="troca">Troca</SelectItem>
                          <SelectItem value="servico">Serviço</SelectItem>
                          <SelectItem value="procura">Procura</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        placeholder="Descreva o item ou serviço..."
                        value={novoClassificado.descricao}
                        onChange={(e) => setNovoClassificado({...novoClassificado, descricao: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="preco">Preço (R$)</Label>
                        <Input
                          id="preco"
                          type="number"
                          placeholder="0,00"
                          value={novoClassificado.preco}
                          onChange={(e) => setNovoClassificado({...novoClassificado, preco: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contato">Contato</Label>
                        <Input
                          id="contato"
                          placeholder="Telefone ou email"
                          value={novoClassificado.contato}
                          onChange={(e) => setNovoClassificado({...novoClassificado, contato: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="imagemUrl">URL da Imagem</Label>
                      <Input
                        id="imagemUrl"
                        placeholder="https://..."
                        value={novoClassificado.imagemUrl}
                        onChange={(e) => setNovoClassificado({...novoClassificado, imagemUrl: e.target.value})}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      disabled={criarClassificadoMutation.isPending}
                    >
                      {criarClassificadoMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publicando...</>
                      ) : (
                        <><Plus className="w-4 h-4 mr-2" /> Publicar Classificado</>
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            {meusClassificados && meusClassificados.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {meusClassificados.map((item: any) => (
                  <Card key={item.id}>
                    {item.imagemUrl && (
                      <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                        <img src={item.imagemUrl} alt={item.titulo} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{item.titulo}</h3>
                        <Badge variant="outline">{item.categoria}</Badge>
                      </div>
                      {item.descricao && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.descricao}</p>
                      )}
                      {item.preco && (
                        <p className="text-lg font-bold text-emerald-600 mb-2">
                          R$ {Number(item.preco).toFixed(2)}
                        </p>
                      )}
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (token && confirm("Excluir este classificado?")) {
                              excluirClassificadoMutation.mutate({ token, id: item.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum classificado</h3>
                  <p className="text-gray-500 mb-4">Você ainda não publicou nenhum classificado</p>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setDialogClassificadoAberto(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Classificado
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Tab Caronas */}
          <TabsContent value="caronas">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Minhas Caronas</h2>
              <Dialog open={dialogCaronaAberto} onOpenChange={setDialogCaronaAberto}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Carona
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-hidden p-0">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                    <DialogHeader className="space-y-1">
                      <DialogTitle className="flex items-center gap-2 text-white text-lg">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <Car className="w-5 h-5 text-white" />
                        </div>
                        Publicar Carona
                      </DialogTitle>
                      <DialogDescription className="text-blue-100">
                        Ofereça ou procure uma carona com outra equipa
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                  <form onSubmit={handleCriarCarona} className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
                    <div className="space-y-2">
                      <Label>Tipo</Label>
                      <Select 
                        value={novaCarona.tipo}
                        onValueChange={(v: "ofereco" | "procuro") => setNovaCarona({...novaCarona, tipo: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ofereco">Ofereço Carona</SelectItem>
                          <SelectItem value="procuro">Procuro Carona</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="origem">Origem *</Label>
                      <Input
                        id="origem"
                        placeholder="Ex: Condomínio"
                        value={novaCarona.origem}
                        onChange={(e) => setNovaCarona({...novaCarona, origem: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destino">Destino *</Label>
                      <Input
                        id="destino"
                        placeholder="Ex: Centro"
                        value={novaCarona.destino}
                        onChange={(e) => setNovaCarona({...novaCarona, destino: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="data">Data</Label>
                        <Input
                          id="data"
                          type="date"
                          value={novaCarona.data}
                          onChange={(e) => setNovaCarona({...novaCarona, data: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="horario">Horário</Label>
                        <Input
                          id="horario"
                          type="time"
                          value={novaCarona.horario}
                          onChange={(e) => setNovaCarona({...novaCarona, horario: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vagas">Vagas</Label>
                        <Input
                          id="vagas"
                          type="number"
                          min="1"
                          max="10"
                          value={novaCarona.vagas}
                          onChange={(e) => setNovaCarona({...novaCarona, vagas: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contatoCarona">Contato</Label>
                        <Input
                          id="contatoCarona"
                          placeholder="Telefone"
                          value={novaCarona.contato}
                          onChange={(e) => setNovaCarona({...novaCarona, contato: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        placeholder="Informações adicionais..."
                        value={novaCarona.observacoes}
                        onChange={(e) => setNovaCarona({...novaCarona, observacoes: e.target.value})}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                      disabled={criarCaronaMutation.isPending}
                    >
                      {criarCaronaMutation.isPending ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publicando...</>
                      ) : (
                        <><Plus className="w-4 h-4 mr-2" /> Publicar Carona</>
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            {minhasCaronas && minhasCaronas.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {minhasCaronas.map((item: any) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <Badge className={item.tipo === "ofereco" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}>
                          {item.tipo === "ofereco" ? "Ofereço" : "Procuro"}
                        </Badge>
                        {item.vagas && (
                          <span className="text-sm text-gray-500">{item.vagas} vaga(s)</span>
                        )}
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm">{item.origem}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-500" />
                          <span className="text-sm">{item.destino}</span>
                        </div>
                      </div>
                      {(item.data || item.horario) && (
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          {item.data && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(item.data), "dd/MM", { locale: ptBR })}
                            </span>
                          )}
                          {item.horario && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.horario}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            if (token && confirm("Excluir esta carona?")) {
                              excluirCaronaMutation.mutate({ token, id: item.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Car className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma carona</h3>
                  <p className="text-gray-500 mb-4">Você ainda não publicou nenhuma carona</p>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setDialogCaronaAberto(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Publicar Primeira Carona
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
