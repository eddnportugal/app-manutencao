import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { FieldSettingsButton } from "@/components/FieldSettingsModal";
import { useFieldSettings } from "@/hooks/useFieldSettings";
import { AssinaturaDigitalSection } from "@/components/AssinaturaDigitalSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import {
  Plus,
  Save,
  Send,
  Share2,
  Upload,
  X,
  Clock,
  MapPin,
  User,
  FileText,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
  Trash2,
  Link2,
  Copy,
  ExternalLink,
  MessageCircle,
  Phone,
} from "lucide-react";


interface TimelinePageProps {
  condominioId: number;
}

export default function TimelinePage({ condominioId }: TimelinePageProps) {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  // Estados do formulário
  const [responsavelId, setResponsavelId] = useState<string>("");
  const [localId, setLocalId] = useState<string>("");
  const [statusId, setStatusId] = useState<string>("");
  const [prioridadeId, setPrioridadeId] = useState<string>("");
  const [tituloPredefId, setTituloPredefId] = useState<string>("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagens, setImagens] = useState<Array<{ url: string; legenda: string; file?: File }>>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Estados dos modais de adicionar
  const [showAddResponsavel, setShowAddResponsavel] = useState(false);
  const [showAddLocal, setShowAddLocal] = useState(false);
  const [showAddStatus, setShowAddStatus] = useState(false);
  const [showAddPrioridade, setShowAddPrioridade] = useState(false);
  const [showAddTitulo, setShowAddTitulo] = useState(false);
  const [showCompartilhar, setShowCompartilhar] = useState(false);

  // Estados dos formulários de adicionar
  const [novoResponsavel, setNovoResponsavel] = useState({ nome: "", cargo: "", email: "", telefone: "" });
  const [novoLocal, setNovoLocal] = useState({ nome: "", descricao: "" });
  const [novoStatus, setNovoStatus] = useState({ nome: "", cor: "#f97316", icone: "" });
  const [novaPrioridade, setNovaPrioridade] = useState({ nome: "", cor: "#f97316", nivel: 1 });
  const [novoTitulo, setNovoTitulo] = useState({ titulo: "", descricaoPadrao: "" });

  // Timeline criada para compartilhar
  const [timelineCriada, setTimelineCriada] = useState<{ id: number; protocolo: string; tokenPublico: string } | null>(null);
  const [permissaoCompartilhamento, setPermissaoCompartilhamento] = useState<"visualizar" | "adicionar" | "editar">("visualizar");
  const [linkCopiado, setLinkCopiado] = useState(false);
  const [assinaturaTecnico, setAssinaturaTecnico] = useState("");
  const [assinaturaSolicitante, setAssinaturaSolicitante] = useState("");

  // Hook para configuração de campos
  const { isFieldEnabled } = useFieldSettings({
    condominioId,
    modalType: "completa",
    functionType: "timeline",
    enabled: !!condominioId,
  });

  // Queries para listas
  const { data: responsaveis = [] } = trpc.timeline.listarResponsaveis.useQuery({ condominioId });
  const { data: locais = [] } = trpc.timeline.listarLocais.useQuery({ condominioId });
  const { data: statusList = [] } = trpc.timeline.listarStatus.useQuery({ condominioId });
  const { data: prioridades = [] } = trpc.timeline.listarPrioridades.useQuery({ condominioId });
  const { data: titulos = [] } = trpc.timeline.listarTitulos.useQuery({ condominioId });
  const { data: membrosEquipe = [] } = trpc.membroEquipe.list.useQuery({ condominioId });

  // Mutations para criar configurações
  const criarResponsavelMutation = trpc.timeline.criarResponsavel.useMutation({
    onSuccess: () => {
      utils.timeline.listarResponsaveis.invalidate();
      setShowAddResponsavel(false);
      setNovoResponsavel({ nome: "", cargo: "", email: "", telefone: "" });
      toast.success("Responsável adicionado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const criarLocalMutation = trpc.timeline.criarLocal.useMutation({
    onSuccess: () => {
      utils.timeline.listarLocais.invalidate();
      setShowAddLocal(false);
      setNovoLocal({ nome: "", descricao: "" });
      toast.success("Local adicionado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const criarStatusMutation = trpc.timeline.criarStatus.useMutation({
    onSuccess: () => {
      utils.timeline.listarStatus.invalidate();
      setShowAddStatus(false);
      setNovoStatus({ nome: "", cor: "#f97316", icone: "" });
      toast.success("Status adicionado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const criarPrioridadeMutation = trpc.timeline.criarPrioridade.useMutation({
    onSuccess: () => {
      utils.timeline.listarPrioridades.invalidate();
      setShowAddPrioridade(false);
      setNovaPrioridade({ nome: "", cor: "#f97316", nivel: 1 });
      toast.success("Prioridade adicionada com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  const criarTituloMutation = trpc.timeline.criarTitulo.useMutation({
    onSuccess: () => {
      utils.timeline.listarTitulos.invalidate();
      setShowAddTitulo(false);
      setNovoTitulo({ titulo: "", descricaoPadrao: "" });
      toast.success("Título adicionado com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation para criar timeline
  const criarTimelineMutation = trpc.timeline.criar.useMutation({
    onSuccess: (data) => {
      setTimelineCriada(data);
      toast.success(`Timeline criada! Protocolo: ${data.protocolo}`);
    },
    onError: (error) => toast.error(error.message),
  });

  // Mutation para compartilhar
  const compartilharMutation = trpc.timeline.compartilhar.useMutation({
    onSuccess: () => {
      toast.success("Timeline compartilhada com sucesso!");
    },
    onError: (error) => toast.error(error.message),
  });

  // Atualizar título quando selecionar título predefinido
  useEffect(() => {
    if (tituloPredefId) {
      const tituloSelecionado = titulos.find(t => t.id === Number(tituloPredefId));
      if (tituloSelecionado) {
        setTitulo(tituloSelecionado.titulo);
        if (tituloSelecionado.descricaoPadrao) {
          setDescricao(tituloSelecionado.descricaoPadrao);
        }
      }
    }
  }, [tituloPredefId, titulos]);

  // Upload de imagens
  const uploadImageMutation = trpc.upload.image.useMutation();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const newImages: Array<{ url: string; legenda: string }> = [];
      
      for (const file of Array.from(files)) {
        // Verificar se é imagem
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} não é uma imagem válida`);
          continue;
        }

        // Verificar tamanho (máx 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} excede o limite de 10MB`);
          continue;
        }

        // Comprimir se necessário
        let fileToUpload: Blob = file;
        if (file.size > 2 * 1024 * 1024) {
          fileToUpload = await compressImage(file);
        }

        // Converter para base64 e enviar ao servidor
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(fileToUpload);
        });
        
        try {
          const result = await uploadImageMutation.mutateAsync({
            fileName: file.name,
            fileType: file.type,
            fileData: base64,
            folder: "timeline",
          });
          newImages.push({ url: result.url, legenda: "" });
        } catch (err) {
          console.error(`Erro ao enviar ${file.name}:`, err);
          toast.error(`Erro ao enviar ${file.name}`);
        }
      }

      setImagens([...imagens, ...newImages]);
      toast.success(`${newImages.length} imagem(ns) carregada(s)`);
    } catch (error) {
      toast.error("Erro ao carregar imagens");
    } finally {
      setUploadingImages(false);
    }
  };

  // Comprimir imagem
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      img.onload = () => {
        const maxSize = 1920;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.8
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Remover imagem
  const handleRemoveImage = (index: number) => {
    setImagens(imagens.filter((_, i) => i !== index));
  };

  // Salvar rascunho
  const handleSalvarRascunho = async () => {
    if (!responsavelId || !titulo.trim()) {
      toast.error("Responsável e Título são obrigatórios");
      return;
    }

    criarTimelineMutation.mutate({
      condominioId,
      responsavelId: Number(responsavelId),
      titulo: titulo.trim(),
      localId: localId ? Number(localId) : undefined,
      statusId: statusId ? Number(statusId) : undefined,
      prioridadeId: prioridadeId ? Number(prioridadeId) : undefined,
      tituloPredefId: tituloPredefId ? Number(tituloPredefId) : undefined,
      descricao: descricao.trim() || undefined,
      estado: "rascunho",
      imagens: imagens.map(img => ({ url: img.url, legenda: img.legenda })),
    });
  };

  // Enviar timeline
  const handleEnviar = async () => {
    if (!responsavelId || !titulo.trim()) {
      toast.error("Responsável e Título são obrigatórios");
      return;
    }

    criarTimelineMutation.mutate({
      condominioId,
      responsavelId: Number(responsavelId),
      titulo: titulo.trim(),
      localId: localId ? Number(localId) : undefined,
      statusId: statusId ? Number(statusId) : undefined,
      prioridadeId: prioridadeId ? Number(prioridadeId) : undefined,
      tituloPredefId: tituloPredefId ? Number(tituloPredefId) : undefined,
      descricao: descricao.trim() || undefined,
      estado: "enviado",
      imagens: imagens.map(img => ({ url: img.url, legenda: img.legenda })),
    });
  };

  // Compartilhar com equipe
  const handleCompartilhar = () => {
    if (!timelineCriada) {
      // Primeiro criar a timeline
      handleEnviar();
    }
    setShowCompartilhar(true);
  };

  // Enviar compartilhamento
  const handleEnviarCompartilhamento = async (membro: any, canal: "email" | "whatsapp" | "ambos") => {
    if (!timelineCriada) return;

    const permLabel = permissaoCompartilhamento === "visualizar" ? "Apenas Visualizar" :
                      permissaoCompartilhamento === "adicionar" ? "Adicionar Conteúdo" : "Edição Completa";

    if (canal === "whatsapp" || canal === "ambos") {
      const linkVisualizacao = `${window.location.origin}/timeline/${timelineCriada.tokenPublico}`;
      const mensagem = encodeURIComponent(
        `*Timeline Compartilhada*\n\n` +
        `Protocolo: ${timelineCriada.protocolo}\n` +
        `Título: ${titulo}\n` +
        `Permissão: ${permLabel}\n\n` +
        `Visualize em: ${linkVisualizacao}`
      );
      const telefone = membro.telefone?.replace(/\D/g, "") || "";
      window.open(`https://wa.me/${telefone}?text=${mensagem}`, "_blank");
    }

    if (canal === "email" || canal === "ambos") {
      compartilharMutation.mutate({
        timelineId: timelineCriada.id,
        membroEquipeId: membro.id,
        membroNome: membro.nome,
        membroEmail: membro.email,
        membroTelefone: membro.telefone,
        canalEnvio: canal,
        permissao: permissaoCompartilhamento,
      });
    }
  };

  // Limpar formulário
  const handleLimpar = () => {
    setResponsavelId("");
    setLocalId("");
    setStatusId("");
    setPrioridadeId("");
    setTituloPredefId("");
    setTitulo("");
    setDescricao("");
    setImagens([]);
    setTimelineCriada(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova Timeline</h1>
          <p className="text-gray-500 mt-1">Registre atividades e eventos de manutenção</p>
        </div>
        {timelineCriada && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
            <CheckCircle className="w-4 h-4 mr-1" />
            Protocolo: {timelineCriada.protocolo}
          </Badge>
        )}
      </div>

      {/* Formulário */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Dados da Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Botão de Configuração de Campos - Visível no topo */}
          <div className="flex justify-end -mt-2 mb-2">
            <FieldSettingsButton
              condominioId={condominioId}
              modalType="completa"
              functionType="timeline"
              variant="full"
            />
          </div>

          {/* Responsável (obrigatório) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              Responsável <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Select value={responsavelId} onValueChange={setResponsavelId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveis.map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.nome} {r.cargo && `(${r.cargo})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowAddResponsavel(true)}
                className="border-orange-200 text-orange-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Local/Item */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              Local/Item
            </Label>
            <div className="flex gap-2">
              <Select value={localId} onValueChange={setLocalId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione o local" />
                </SelectTrigger>
                <SelectContent>
                  {locais.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      {l.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowAddLocal(true)}
                className="border-orange-200 text-orange-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Status
            </Label>
            <div className="flex gap-2">
              <Select value={statusId} onValueChange={setStatusId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {statusList.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: s.cor || "#f97316" }}
                        />
                        {s.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowAddStatus(true)}
                className="border-orange-200 text-orange-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Prioridade */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Prioridade
            </Label>
            <div className="flex gap-2">
              <Select value={prioridadeId} onValueChange={setPrioridadeId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione a prioridade" />
                </SelectTrigger>
                <SelectContent>
                  {prioridades.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: p.cor || "#f97316" }}
                        />
                        {p.nome}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowAddPrioridade(true)}
                className="border-orange-200 text-orange-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Título (obrigatório) */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-500" />
              Título <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Select value={tituloPredefId} onValueChange={setTituloPredefId}>
                <SelectTrigger className="w-1/3">
                  <SelectValue placeholder="Título predefinido" />
                </SelectTrigger>
                <SelectContent>
                  {titulos.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Digite o título"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowAddTitulo(true)}
                className="border-orange-200 text-orange-600"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Imagens */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-orange-500" />
              Imagens
            </Label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploadingImages}
              />
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center cursor-pointer py-4"
              >
                {uploadingImages ? (
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      Clique para adicionar imagens
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Máximo 100MB por arquivo
                    </span>
                  </>
                )}
              </label>
              
              {imagens.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {imagens.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva os detalhes da atividade..."
              rows={4}
            />
          </div>

          {/* Informações automáticas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-2">Informações registadas automaticamente:</p>
            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
              <div className="flex items-center">
                <span className="text-gray-400 w-20 sm:w-auto">Data:</span>
                <span className="ml-2 font-medium">{new Date().toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 w-20 sm:w-auto">Hora:</span>
                <span className="ml-2 font-medium">{new Date().toLocaleTimeString("pt-BR")}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 w-20 sm:w-auto">Criado por:</span>
                <span className="ml-2 font-medium">{user?.name || "Sistema"}</span>
              </div>
            </div>
          </div>

          {/* Assinatura Digital */}
          {isFieldEnabled("assinatura_digital") && (
          <AssinaturaDigitalSection
            assinaturaTecnico={assinaturaTecnico}
            setAssinaturaTecnico={setAssinaturaTecnico}
            assinaturaSolicitante={assinaturaSolicitante}
            setAssinaturaSolicitante={setAssinaturaSolicitante}
          />
          )}

          {/* Botões de ação */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleSalvarRascunho}
              disabled={criarTimelineMutation.isPending}
              className="flex-1 min-w-[150px]"
            >
              {criarTimelineMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar e Continuar Depois
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCompartilhar}
              disabled={criarTimelineMutation.isPending}
              className="flex-1 min-w-[150px] border-blue-200 text-blue-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar com Equipe
            </Button>
            
            <Button
              onClick={handleEnviar}
              disabled={criarTimelineMutation.isPending}
              className="flex-1 min-w-[150px] bg-gradient-to-r from-orange-500 to-orange-600 text-white"
            >
              {criarTimelineMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar
            </Button>
          </div>

          {/* Link da Timeline criada */}
          {timelineCriada && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 space-y-4">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Timeline Criada com Sucesso!
              </h4>
              <p className="text-sm text-green-600">
                Protocolo: <strong>{timelineCriada.protocolo}</strong>
              </p>

              {/* Link copiável */}
              <div className="bg-white rounded-lg border border-green-200 p-3">
                <Label className="text-xs font-semibold text-gray-500 mb-1.5 block">Link de compartilhamento</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-700 font-mono truncate border">
                    {`${window.location.origin}/timeline/${timelineCriada.tokenPublico}`}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/timeline/${timelineCriada.tokenPublico}`);
                      setLinkCopiado(true);
                      toast.success("Link copiado!");
                      setTimeout(() => setLinkCopiado(false), 2000);
                    }}
                    className={`shrink-0 ${linkCopiado ? 'bg-green-100 border-green-400 text-green-700' : 'border-green-300 text-green-700'}`}
                  >
                    {linkCopiado ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Botões de ação rápida */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/timeline/${timelineCriada.tokenPublico}`);
                    setLinkCopiado(true);
                    toast.success("Link copiado!");
                    setTimeout(() => setLinkCopiado(false), 2000);
                  }}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copiar Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/timeline/${timelineCriada.tokenPublico}`, "_blank")}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  Abrir Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCompartilhar}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Share2 className="w-4 h-4 mr-1.5" />
                  Compartilhar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLimpar}
                  className="border-gray-300 text-gray-600"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Nova Timeline
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Adicionar Responsável */}
      <Dialog open={showAddResponsavel} onOpenChange={setShowAddResponsavel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Responsável</DialogTitle>
            <DialogDescription>
              Cadastre um novo responsável para as timelines
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={novoResponsavel.nome}
                onChange={(e) => setNovoResponsavel({ ...novoResponsavel, nome: e.target.value })}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label>Cargo</Label>
              <Input
                value={novoResponsavel.cargo}
                onChange={(e) => setNovoResponsavel({ ...novoResponsavel, cargo: e.target.value })}
                placeholder="Ex: Zelador, Síndico"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={novoResponsavel.email}
                onChange={(e) => setNovoResponsavel({ ...novoResponsavel, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={novoResponsavel.telefone}
                onChange={(e) => setNovoResponsavel({ ...novoResponsavel, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddResponsavel(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => criarResponsavelMutation.mutate({ condominioId, ...novoResponsavel })}
              disabled={!novoResponsavel.nome || criarResponsavelMutation.isPending}
              className="bg-orange-500"
            >
              {criarResponsavelMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Local */}
      <Dialog open={showAddLocal} onOpenChange={setShowAddLocal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Local/Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={novoLocal.nome}
                onChange={(e) => setNovoLocal({ ...novoLocal, nome: e.target.value })}
                placeholder="Ex: Hall de Entrada, Piscina"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={novoLocal.descricao}
                onChange={(e) => setNovoLocal({ ...novoLocal, descricao: e.target.value })}
                placeholder="Descrição do local"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLocal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => criarLocalMutation.mutate({ condominioId, ...novoLocal })}
              disabled={!novoLocal.nome || criarLocalMutation.isPending}
              className="bg-orange-500"
            >
              {criarLocalMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Status */}
      <Dialog open={showAddStatus} onOpenChange={setShowAddStatus}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={novoStatus.nome}
                onChange={(e) => setNovoStatus({ ...novoStatus, nome: e.target.value })}
                placeholder="Ex: Em Andamento, Concluído"
              />
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={novoStatus.cor}
                  onChange={(e) => setNovoStatus({ ...novoStatus, cor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={novoStatus.cor}
                  onChange={(e) => setNovoStatus({ ...novoStatus, cor: e.target.value })}
                  placeholder="#f97316"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStatus(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => criarStatusMutation.mutate({ condominioId, ...novoStatus })}
              disabled={!novoStatus.nome || criarStatusMutation.isPending}
              className="bg-orange-500"
            >
              {criarStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Prioridade */}
      <Dialog open={showAddPrioridade} onOpenChange={setShowAddPrioridade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Prioridade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome *</Label>
              <Input
                value={novaPrioridade.nome}
                onChange={(e) => setNovaPrioridade({ ...novaPrioridade, nome: e.target.value })}
                placeholder="Ex: Urgente, Normal, Baixa"
              />
            </div>
            <div>
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={novaPrioridade.cor}
                  onChange={(e) => setNovaPrioridade({ ...novaPrioridade, cor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={novaPrioridade.cor}
                  onChange={(e) => setNovaPrioridade({ ...novaPrioridade, cor: e.target.value })}
                  placeholder="#f97316"
                />
              </div>
            </div>
            <div>
              <Label>Nível (1 = mais urgente)</Label>
              <Input
                type="number"
                min={1}
                value={novaPrioridade.nivel}
                onChange={(e) => setNovaPrioridade({ ...novaPrioridade, nivel: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPrioridade(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => criarPrioridadeMutation.mutate({ condominioId, ...novaPrioridade })}
              disabled={!novaPrioridade.nome || criarPrioridadeMutation.isPending}
              className="bg-orange-500"
            >
              {criarPrioridadeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Título */}
      <Dialog open={showAddTitulo} onOpenChange={setShowAddTitulo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Título Predefinido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={novoTitulo.titulo}
                onChange={(e) => setNovoTitulo({ ...novoTitulo, titulo: e.target.value })}
                placeholder="Ex: Manutenção Preventiva, Limpeza"
              />
            </div>
            <div>
              <Label>Descrição Padrão</Label>
              <Textarea
                value={novoTitulo.descricaoPadrao}
                onChange={(e) => setNovoTitulo({ ...novoTitulo, descricaoPadrao: e.target.value })}
                placeholder="Descrição que será preenchida automaticamente"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTitulo(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => criarTituloMutation.mutate({ condominioId, ...novoTitulo })}
              disabled={!novoTitulo.titulo || criarTituloMutation.isPending}
              className="bg-orange-500"
            >
              {criarTituloMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Compartilhar com Equipe */}
      <Dialog open={showCompartilhar} onOpenChange={setShowCompartilhar}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-orange-500" />
              Compartilhar Timeline
            </DialogTitle>
            <DialogDescription>
              Copie o link, envie pelo WhatsApp ou compartilhe com a equipe
            </DialogDescription>
          </DialogHeader>

          {/* Seção 1: Link Direto */}
          {timelineCriada && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Link de Compartilhamento
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white rounded-md px-3 py-2 text-sm text-gray-700 font-mono truncate border border-blue-200">
                  {`${window.location.origin}/timeline/${timelineCriada.tokenPublico}`}
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/timeline/${timelineCriada.tokenPublico}`);
                    setLinkCopiado(true);
                    toast.success("Link copiado para a área de transferência!");
                    setTimeout(() => setLinkCopiado(false), 2000);
                  }}
                  className={`shrink-0 ${linkCopiado ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                >
                  {linkCopiado ? (
                    <><CheckCircle className="w-4 h-4 mr-1.5" /> Copiado!</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-1.5" /> Copiar Link</>
                  )}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/timeline/${timelineCriada.tokenPublico}`, "_blank")}
                  className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  Abrir no Navegador
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const linkVisualizacao = `${window.location.origin}/timeline/${timelineCriada.tokenPublico}`;
                    const mensagem = encodeURIComponent(
                      `*Timeline - ${timelineCriada.protocolo}*\n\n` +
                      `Título: ${titulo}\n\n` +
                      `Visualize em: ${linkVisualizacao}`
                    );
                    window.open(`https://wa.me/?text=${mensagem}`, "_blank");
                  }}
                  className="flex-1 border-green-200 text-green-700 hover:bg-green-100"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  Enviar via WhatsApp
                </Button>
              </div>
            </div>
          )}

          {/* Seção 2: Permissão */}
          <div className="space-y-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Label className="text-sm font-semibold text-gray-700">Permissão do destinatário</Label>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => setPermissaoCompartilhamento("visualizar")}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  permissaoCompartilhamento === "visualizar"
                    ? "border-orange-500 bg-orange-100"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  permissaoCompartilhamento === "visualizar" ? "border-orange-500" : "border-gray-300"
                }`}>
                  {permissaoCompartilhamento === "visualizar" && (
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">👁️ Apenas Visualizar</p>
                  <p className="text-xs text-gray-500">Pode ver a timeline, mas não pode fazer alterações</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPermissaoCompartilhamento("adicionar")}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  permissaoCompartilhamento === "adicionar"
                    ? "border-blue-500 bg-blue-100"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  permissaoCompartilhamento === "adicionar" ? "border-blue-500" : "border-gray-300"
                }`}>
                  {permissaoCompartilhamento === "adicionar" && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">➕ Adicionar Conteúdo</p>
                  <p className="text-xs text-gray-500">Pode adicionar comentários e imagens à timeline</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPermissaoCompartilhamento("editar")}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  permissaoCompartilhamento === "editar"
                    ? "border-green-500 bg-green-100"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  permissaoCompartilhamento === "editar" ? "border-green-500" : "border-gray-300"
                }`}>
                  {permissaoCompartilhamento === "editar" && (
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">✏️ Edição Completa</p>
                  <p className="text-xs text-gray-500">Pode editar descrição, status, adicionar comentários e imagens</p>
                </div>
              </button>
            </div>
          </div>

          {/* Seção 3: Membros da Equipe */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-orange-500" />
              Encaminhar para Membro da Equipe
            </Label>
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {membrosEquipe.filter((m: any) => m.email || m.telefone).map((membro: any) => (
                <div
                  key={membro.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {membro.nome?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{membro.nome}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {membro.cargo && <span>{membro.cargo}</span>}
                        {membro.cargo && membro.telefone && <span> • </span>}
                        {membro.telefone && <span>{membro.telefone}</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {membro.telefone && (
                      <Button
                        size="sm"
                        onClick={() => handleEnviarCompartilhamento(membro, "whatsapp")}
                        className="bg-green-500 hover:bg-green-600 text-white h-8 px-3"
                        title={`Enviar via WhatsApp para ${membro.telefone}`}
                      >
                        <MessageCircle className="w-3.5 h-3.5 mr-1" />
                        WhatsApp
                      </Button>
                    )}
                    {membro.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEnviarCompartilhamento(membro, "email")}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 h-8 px-3"
                        title={`Enviar por email para ${membro.email}`}
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Email
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {membrosEquipe.filter((m: any) => m.email || m.telefone).length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nenhum membro com email ou telefone cadastrado</p>
                  <p className="text-xs mt-1">Cadastre membros da equipe com dados de contato</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowCompartilhar(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
