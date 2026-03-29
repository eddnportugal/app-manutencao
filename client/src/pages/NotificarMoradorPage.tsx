import { useState, useEffect, useMemo } from "react";
// DashboardLayout removido - agora renderizado dentro do Dashboard.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { EnvioMulticanalModal } from "@/components/EnvioMulticanalModal";
import { 
  AlertTriangle, 
  Search, 
  User, 
  Building2, 
  Home, 
  Phone, 
  Mail, 
  Plus,
  FileText,
  Image as ImageIcon,
  Calendar,
  Send,
  Edit3,
  X,
  Loader2,
  CheckCircle,
  Trash2
} from "lucide-react";

export default function NotificarMoradorPage() {
  const { user } = useAuth();
  const [condominioId, setCondominioId] = useState<number | null>(null);
  const [condominio, setCondominio] = useState<any>(null);

  // Estados de busca de morador
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMorador, setSelectedMorador] = useState<any>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Estados de tipo de infração
  const [selectedTipoId, setSelectedTipoId] = useState<number | null>(null);
  const [showAddTipoModal, setShowAddTipoModal] = useState(false);
  const [novoTipoTitulo, setNovoTipoTitulo] = useState("");
  const [novoTipoDescricao, setNovoTipoDescricao] = useState("");
  const [deletingTipoId, setDeletingTipoId] = useState<number | null>(null);

  // Estados do formulário
  const [titulo, setTitulo] = useState("");
  const [tituloManual, setTituloManual] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [descricaoManual, setDescricaoManual] = useState(false);
  const [dataOcorrencia, setDataOcorrencia] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Estados do modal de envio
  const [showEnvioModal, setShowEnvioModal] = useState(false);
  const [notificacaoCriada, setNotificacaoCriada] = useState<{ id: number; linkPublico: string } | null>(null);

  // Queries
  const { data: condominios } = trpc.condominio.list.useQuery();
  const { data: moradores } = trpc.morador.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );
  const { data: tiposInfracao, refetch: refetchTipos } = trpc.tiposInfracao.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  // Mutations
  const createTipoMutation = trpc.tiposInfracao.create.useMutation({
    onSuccess: () => {
      toast.success("Tipo de infração criado com sucesso!");
      setShowAddTipoModal(false);
      setNovoTipoTitulo("");
      setNovoTipoDescricao("");
      refetchTipos();
    },
    onError: (error) => {
      toast.error(`Erro ao criar tipo: ${error.message}`);
    },
  });

  const createDefaultsTiposMutation = trpc.tiposInfracao.createDefaults.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} tipos padrão criados com sucesso!`);
      refetchTipos();
    },
    onError: (error) => {
      toast.error(`Erro ao criar tipos padrão: ${error.message}`);
    },
  });

  const deleteTipoMutation = trpc.tiposInfracao.delete.useMutation({
    onSuccess: () => {
      toast.success("Tipo de infração excluído com sucesso!");
      refetchTipos();
      // Se o tipo excluído estava selecionado, limpar seleção
      if (selectedTipoId && deletingTipoId === selectedTipoId) {
        setSelectedTipoId(null);
        setTitulo("");
        setDescricao("");
      }
      setDeletingTipoId(null);
    },
    onError: (error) => {
      toast.error(`Erro ao excluir tipo: ${error.message}`);
      setDeletingTipoId(null);
    },
  });

  const createNotificacaoMutation = trpc.notificacoesInfracao.create.useMutation({
    onSuccess: (data) => {
      toast.success("Notificação registrada com sucesso!");
      setNotificacaoCriada({ id: data.id, linkPublico: data.linkPublico });
      setShowEnvioModal(true);
      // Limpar formulário
      setSelectedMorador(null);
      setSelectedTipoId(null);
      setTitulo("");
      setDescricao("");
      setDataOcorrencia("");
      setImagens([]);
      setTituloManual(false);
      setDescricaoManual(false);
      setSearchTerm("");
    },
    onError: (error) => {
      toast.error(`Erro ao registrar notificação: ${error.message}`);
    },
  });

  // Selecionar primeira organização
  useEffect(() => {
    if (condominios && condominios.length > 0 && !condominioId) {
      setCondominioId(condominios[0].id);
      setCondominio(condominios[0]);
    }
  }, [condominios, condominioId]);

  // Filtrar moradores pela busca
  const filteredMoradores = useMemo(() => {
    if (!moradores || !searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return moradores.filter(m => 
      m.nome.toLowerCase().includes(term) ||
      m.apartamento.toLowerCase().includes(term) ||
      (m.bloco && m.bloco.toLowerCase().includes(term))
    ).slice(0, 10);
  }, [moradores, searchTerm]);

  // Atualizar título e descrição quando selecionar tipo
  useEffect(() => {
    if (selectedTipoId && tiposInfracao) {
      const tipo = tiposInfracao.find(t => t.id === selectedTipoId);
      if (tipo) {
        if (!tituloManual) {
          setTitulo(tipo.titulo);
        }
        if (!descricaoManual && tipo.descricaoPadrao) {
          setDescricao(tipo.descricaoPadrao);
        }
      }
    }
  }, [selectedTipoId, tiposInfracao, tituloManual, descricaoManual]);

  // Selecionar morador
  const handleSelectMorador = (morador: any) => {
    setSelectedMorador(morador);
    setSearchTerm("");
    setShowSearchResults(false);
  };

  // Criar tipo de infração
  const handleCreateTipo = () => {
    if (!condominioId || !novoTipoTitulo.trim()) return;
    createTipoMutation.mutate({
      condominioId,
      titulo: novoTipoTitulo.trim(),
      descricaoPadrao: novoTipoDescricao.trim() || undefined,
    });
  };

  // Upload de imagem
  const uploadImageMutation = trpc.upload.image.useMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Converter para base64 e enviar ao servidor
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        try {
          const result = await uploadImageMutation.mutateAsync({
            fileName: file.name,
            fileType: file.type,
            fileData: base64,
            folder: "notificacoes",
          });
          setImagens(prev => [...prev, result.url]);
        } catch (err) {
          console.error(`Erro ao enviar ${file.name}:`, err);
          toast.error(`Erro ao enviar ${file.name}`);
        }
      }
      toast.success("Imagem(ns) adicionada(s)!");
    } catch (error) {
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
  };

  // Remover imagem
  const handleRemoveImage = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
  };

  // Registrar notificação
  const handleSubmit = () => {
    if (!condominioId || !selectedMorador || !titulo.trim() || !descricao.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createNotificacaoMutation.mutate({
      condominioId,
      moradorId: selectedMorador.id,
      tipoInfracaoId: selectedTipoId || undefined,
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      imagens: imagens.length > 0 ? imagens : undefined,
      dataOcorrencia: dataOcorrencia || undefined,
    });
  };

  // Imprimir PDF
  const handlePrint = () => {
    // Abrir página de impressão em nova aba
    if (notificacaoCriada) {
      window.open(`/notificacao/${notificacaoCriada.linkPublico}?print=true`, "_blank");
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              Notificar Morador
            </h1>
            <p className="text-gray-500 text-sm">
              Registre e envie notificações de infrações para a equipa
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card de Busca de Morador */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Buscar Morador
                </CardTitle>
                <CardDescription>
                  Busque por nome ou número do apartamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Digite o nome ou número do apartamento..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => setShowSearchResults(true)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  
                  {/* Resultados da busca */}
                  {showSearchResults && filteredMoradores.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredMoradores.map((morador) => (
                        <button
                          key={morador.id}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-3"
                          onClick={() => handleSelectMorador(morador)}
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{morador.nome}</p>
                            <p className="text-xs text-gray-500">
                              {morador.bloco ? `Bloco ${morador.bloco} - ` : ""}
                              Apto {morador.apartamento}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card do morador selecionado */}
                {selectedMorador && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                          <User className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{selectedMorador.nome}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {selectedMorador.bloco && (
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                Bloco {selectedMorador.bloco}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Home className="h-3 w-3" />
                              Apto {selectedMorador.apartamento}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {selectedMorador.celular && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {selectedMorador.celular}
                              </span>
                            )}
                            {selectedMorador.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {selectedMorador.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedMorador(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card de Tipo de Infração */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Tipo de Infração
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select
                    value={selectedTipoId?.toString() || ""}
                    onValueChange={(value) => setSelectedTipoId(value ? parseInt(value) : null)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione o tipo de infração" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposInfracao?.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id.toString()}>
                          {tipo.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddTipoModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Tipo
                  </Button>
                </div>

                {tiposInfracao?.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-2">
                      Nenhum tipo de infração cadastrado
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => condominioId && createDefaultsTiposMutation.mutate({ condominioId })}
                      disabled={createDefaultsTiposMutation.isPending}
                    >
                      {createDefaultsTiposMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 mr-1" />
                      )}
                      Criar Tipos Padrão
                    </Button>
                  </div>
                )}

                {/* Lista de tipos cadastrados com opção de excluir */}
                {tiposInfracao && tiposInfracao.length > 0 && (
                  <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                    {tiposInfracao.map((tipo) => (
                      <div 
                        key={tipo.id} 
                        className={`flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          selectedTipoId === tipo.id ? 'bg-blue-50 dark:bg-blue-950' : ''
                        }`}
                      >
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => setSelectedTipoId(tipo.id)}
                        >
                          <p className="text-sm font-medium">{tipo.titulo}</p>
                          {tipo.descricaoPadrao && (
                            <p className="text-xs text-gray-500 truncate">{tipo.descricaoPadrao}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Tem certeza que deseja excluir o tipo "${tipo.titulo}"?`)) {
                              setDeletingTipoId(tipo.id);
                              deleteTipoMutation.mutate({ id: tipo.id });
                            }
                          }}
                          disabled={deleteTipoMutation.isPending && deletingTipoId === tipo.id}
                        >
                          {deleteTipoMutation.isPending && deletingTipoId === tipo.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card de Detalhes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Detalhes da Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Título */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="titulo">Título *</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTituloManual(!tituloManual)}
                      className="text-xs"
                    >
                      {tituloManual ? "Usar Automático" : "Preencher Manualmente"}
                    </Button>
                  </div>
                  <Input
                    id="titulo"
                    placeholder="Título da notificação"
                    value={titulo}
                    onChange={(e) => {
                      setTitulo(e.target.value);
                      setTituloManual(true);
                    }}
                    disabled={!tituloManual && !!selectedTipoId}
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDescricaoManual(!descricaoManual)}
                      className="text-xs"
                    >
                      {descricaoManual ? "Usar Automático" : "Preencher Manualmente"}
                    </Button>
                  </div>
                  <Textarea
                    id="descricao"
                    placeholder="Descreva a infração detalhadamente..."
                    value={descricao}
                    onChange={(e) => {
                      setDescricao(e.target.value);
                      setDescricaoManual(true);
                    }}
                    rows={5}
                    disabled={!descricaoManual && !!selectedTipoId}
                  />
                </div>

                {/* Data da Ocorrência */}
                <div className="space-y-2">
                  <Label htmlFor="dataOcorrencia" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data da Ocorrência
                  </Label>
                  <Input
                    id="dataOcorrencia"
                    type="datetime-local"
                    value={dataOcorrencia}
                    onChange={(e) => setDataOcorrencia(e.target.value)}
                  />
                </div>

                {/* Upload de Imagens */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Imagens (opcional)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {imagens.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Imagem ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <button
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                      ) : (
                        <Plus className="h-6 w-6 text-gray-400" />
                      )}
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botão de Registrar */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={!selectedMorador || !titulo.trim() || !descricao.trim() || createNotificacaoMutation.isPending}
            >
              {createNotificacaoMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Registrar Notificação
                </>
              )}
            </Button>
          </div>

          {/* Coluna Lateral - Resumo */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {selectedMorador ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={selectedMorador ? "text-green-700" : "text-gray-500"}>
                      Morador selecionado
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTipoId ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={selectedTipoId ? "text-green-700" : "text-gray-500"}>
                      Tipo de infração
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {titulo.trim() ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={titulo.trim() ? "text-green-700" : "text-gray-500"}>
                      Título preenchido
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {descricao.trim() ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={descricao.trim() ? "text-green-700" : "text-gray-500"}>
                      Descrição preenchida
                    </span>
                  </div>
                </div>

                {imagens.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-gray-500">
                      {imagens.length} imagem(ns) anexada(s)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Importante
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Ao registrar a notificação, um email será enviado automaticamente 
                      para o morador. Você também poderá enviar via WhatsApp.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Adicionar Tipo de Infração */}
      <Dialog open={showAddTipoModal} onOpenChange={setShowAddTipoModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Tipo de Infração</DialogTitle>
            <DialogDescription>
              Crie um novo tipo de infração para usar nas notificações
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="novoTipoTitulo">Título *</Label>
              <Input
                id="novoTipoTitulo"
                placeholder="Ex: Barulho Excessivo"
                value={novoTipoTitulo}
                onChange={(e) => setNovoTipoTitulo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="novoTipoDescricao">Descrição Padrão</Label>
              <Textarea
                id="novoTipoDescricao"
                placeholder="Descrição que será preenchida automaticamente..."
                value={novoTipoDescricao}
                onChange={(e) => setNovoTipoDescricao(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTipoModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTipo}
              disabled={!novoTipoTitulo.trim() || createTipoMutation.isPending}
            >
              {createTipoMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
              )}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Envio Multicanal */}
      {selectedMorador && notificacaoCriada && condominio && (
        <EnvioMulticanalModal
          open={showEnvioModal}
          onOpenChange={setShowEnvioModal}
          destinatario={{
            nome: selectedMorador.nome,
            whatsapp: selectedMorador.celular,
            email: selectedMorador.email,
            bloco: selectedMorador.bloco,
            apartamento: selectedMorador.apartamento,
          }}
          notificacao={{
            titulo: titulo,
            descricao: descricao,
            linkPublico: notificacaoCriada.linkPublico,
          }}
          condominio={{
            nome: condominio.nome,
          }}
          onPrint={handlePrint}
      />
    )}
    </>
  );
}
