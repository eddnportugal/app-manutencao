import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { trpc } from "@/lib/trpc";
import { prepareImageForUpload } from "@/lib/imageCompressor";
import { toast } from "@/components/ui/sonner";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Star, 
  Image as ImageIcon,
  Upload,
  X,
  GripVertical,
  ExternalLink,
  FileText,
  Play,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import DestaqueCard from "@/components/DestaqueCard";

interface DestaqueImage {
  url: string;
  legenda?: string | null;
  ordem?: number | null;
}

interface DestaqueFormData {
  titulo: string;
  subtitulo: string;
  descricao: string;
  link: string;
  arquivoUrl: string;
  arquivoNome: string;
  videoUrl: string;
  ativo: boolean;
  imagens: DestaqueImage[];
}

const initialFormData: DestaqueFormData = {
  titulo: "",
  subtitulo: "",
  descricao: "",
  link: "",
  arquivoUrl: "",
  arquivoNome: "",
  videoUrl: "",
  ativo: true,
  imagens: [],
};

export default function Destaques() {
  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioAtivo = condominios?.[0] || null;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<DestaqueFormData>(initialFormData);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  const { data: destaques, isLoading } = trpc.destaque.list.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const createMutation = trpc.destaque.create.useMutation({
    onSuccess: () => {
      toast.success("Destaque criado com sucesso!");
      utils.destaque.list.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error("Erro ao criar destaque: " + error.message);
    },
  });

  const updateMutation = trpc.destaque.update.useMutation({
    onSuccess: () => {
      toast.success("Destaque atualizado com sucesso!");
      utils.destaque.list.invalidate();
      closeDialog();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar destaque: " + error.message);
    },
  });

  const deleteMutation = trpc.destaque.delete.useMutation({
    onSuccess: () => {
      toast.success("Destaque excluído com sucesso!");
      utils.destaque.list.invalidate();
      setIsDeleteDialogOpen(false);
      setDeletingId(null);
    },
    onError: (error) => {
      toast.error("Erro ao excluir destaque: " + error.message);
    },
  });

  const toggleAtivoMutation = trpc.destaque.toggleAtivo.useMutation({
    onSuccess: (data) => {
      toast.success(data.ativo ? "Destaque ativado!" : "Destaque desativado!");
      utils.destaque.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao alterar status: " + error.message);
    },
  });

  const uploadImageMutation = trpc.upload.image.useMutation();
  const uploadFileMutation = trpc.upload.file.useMutation();

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  };

  const openCreateDialog = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (destaque: any) => {
    setFormData({
      titulo: destaque.titulo,
      subtitulo: destaque.subtitulo || "",
      descricao: destaque.descricao || "",
      link: destaque.link || "",
      arquivoUrl: destaque.arquivoUrl || "",
      arquivoNome: destaque.arquivoNome || "",
      videoUrl: destaque.videoUrl || "",
      ativo: destaque.ativo,
      imagens: destaque.imagens?.map((img: any) => ({
        url: img.url,
        legenda: img.legenda || "",
        ordem: img.ordem,
      })) || [],
    });
    setEditingId(destaque.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.titulo.trim()) {
      toast.error("O título é obrigatório");
      return;
    }

    if (!condominioAtivo?.id) {
      toast.error("Selecione uma organização");
      return;
    }

    const payload = {
      condominioId: condominioAtivo.id,
      titulo: formData.titulo,
      subtitulo: formData.subtitulo || undefined,
      descricao: formData.descricao || undefined,
      link: formData.link || undefined,
      arquivoUrl: formData.arquivoUrl || undefined,
      arquivoNome: formData.arquivoNome || undefined,
      videoUrl: formData.videoUrl || undefined,
      ativo: formData.ativo,
      imagens: formData.imagens.map((img, index) => ({
        url: img.url,
        legenda: img.legenda || undefined,
        ordem: index,
      })),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newImages: DestaqueImage[] = [];
      
      for (const file of Array.from(files)) {
        const base64 = await prepareImageForUpload(file, "quarterA4");

        const result = await uploadImageMutation.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileData: base64,
        });

        newImages.push({
          url: result.url,
          legenda: "",
          ordem: formData.imagens.length + newImages.length,
        });
      }

      setFormData((prev) => ({
        ...prev,
        imagens: [...prev.imagens, ...newImages],
      }));
      toast.success(`${newImages.length} imagem(ns) adicionada(s)`);
    } catch (error) {
      toast.error("Erro ao fazer upload das imagens");
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const result = await uploadFileMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
        fileData: base64,
      });

      setFormData((prev) => ({
        ...prev,
        arquivoUrl: result.url,
        arquivoNome: file.name,
      }));
      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer upload do arquivo");
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index),
    }));
  };

  const updateImageLegenda = (index: number, legenda: string) => {
    setFormData((prev) => ({
      ...prev,
      imagens: prev.imagens.map((img, i) => 
        i === index ? { ...img, legenda } : img
      ),
    }));
  };

  if (!condominioAtivo) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Selecione uma organização para gerenciar os destaques.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Star className="w-6 h-6 text-amber-500" />
              Destaques
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os destaques exibidos na página inicial e visão geral
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Destaque
          </Button>
        </div>

        {/* Lista de Destaques */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-16 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : destaques && destaques.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {destaques.map((destaque) => (
              <div key={destaque.id} className="relative group">
                {/* Badge de status */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge 
                    variant={destaque.ativo ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => toggleAtivoMutation.mutate({ id: destaque.id })}
                  >
                    {destaque.ativo ? (
                      <><Eye className="w-3 h-3 mr-1" /> Ativo</>
                    ) : (
                      <><EyeOff className="w-3 h-3 mr-1" /> Inativo</>
                    )}
                  </Badge>
                </div>

                <DestaqueCard
                  id={destaque.id}
                  titulo={destaque.titulo}
                  subtitulo={destaque.subtitulo}
                  descricao={destaque.descricao}
                  link={destaque.link}
                  arquivoUrl={destaque.arquivoUrl}
                  arquivoNome={destaque.arquivoNome}
                  videoUrl={destaque.videoUrl}
                  imagens={destaque.imagens}
                  showActions
                  onEdit={() => openEditDialog(destaque)}
                  onDelete={() => {
                    setDeletingId(destaque.id);
                    setIsDeleteDialogOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Star className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum destaque cadastrado
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                Crie destaques para exibir informações importantes na página inicial.
              </p>
              <Button onClick={openCreateDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeiro Destaque
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Criação/Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar Destaque" : "Novo Destaque"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Título do destaque"
              />
            </div>

            {/* Subtítulo */}
            <div className="space-y-2">
              <Label htmlFor="subtitulo">Subtítulo</Label>
              <Input
                id="subtitulo"
                value={formData.subtitulo}
                onChange={(e) => setFormData({ ...formData, subtitulo: e.target.value })}
                placeholder="Subtítulo opcional"
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição detalhada do destaque"
                rows={3}
              />
            </div>

            {/* Galeria de Imagens */}
            <div className="space-y-2">
              <Label>Galeria de Imagens</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                {formData.imagens.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {formData.imagens.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.url}
                          alt={`Imagem ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <Input
                          value={img.legenda || ""}
                          onChange={(e) => updateImageLegenda(index, e.target.value)}
                          placeholder="Legenda"
                          className="mt-2 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-center">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploading}
                    className="gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ImageIcon className="w-4 h-4" />
                    )}
                    {isUploading ? "Enviando..." : "Adicionar Imagens"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Link */}
            <div className="space-y-2">
              <Label htmlFor="link">Link Externo</Label>
              <div className="flex gap-2">
                <ExternalLink className="w-5 h-5 text-muted-foreground mt-2" />
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://exemplo.com"
                />
              </div>
            </div>

            {/* Arquivo */}
            <div className="space-y-2">
              <Label>Arquivo para Download</Label>
              <div className="flex gap-2 items-center">
                <FileText className="w-5 h-5 text-muted-foreground" />
                {formData.arquivoUrl ? (
                  <div className="flex-1 flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <span className="text-sm truncate flex-1">{formData.arquivoNome}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({ ...formData, arquivoUrl: "", arquivoNome: "" })}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingFile}
                      className="gap-2"
                    >
                      {isUploadingFile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {isUploadingFile ? "Enviando..." : "Enviar Arquivo"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Vídeo */}
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Link do Vídeo (YouTube)</Label>
              <div className="flex gap-2">
                <Play className="w-5 h-5 text-muted-foreground mt-2" />
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            {/* Ativo */}
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <Label htmlFor="ativo" className="font-medium">Destaque Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Destaques ativos aparecem na página inicial
                </p>
              </div>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingId ? "Salvar Alterações" : "Criar Destaque"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Destaque</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este destaque? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate({ id: deletingId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
