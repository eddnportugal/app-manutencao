import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Video, 
  FileDown, 
  Eye, 
  EyeOff,
  Sparkles,
  X,
  Upload,
  ExternalLink,
  Play
} from "lucide-react";

interface PaginaCustom {
  id: number;
  condominioId: number;
  titulo: string;
  subtitulo: string | null;
  descricao: string | null;
  link: string | null;
  videoUrl: string | null;
  arquivoUrl: string | null;
  arquivoNome: string | null;
  imagens: Array<{url: string, legenda?: string}> | null;
  ativo: boolean | null;
  ordem: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginasCustomSectionProps {
  condominioId: number | undefined;
}

export default function PaginasCustomSection({ condominioId }: PaginasCustomSectionProps) {
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPagina, setEditingPagina] = useState<PaginaCustom | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    subtitulo: "",
    descricao: "",
    link: "",
    videoUrl: "",
    arquivoUrl: "",
    arquivoNome: "",
  });
  const [imagens, setImagens] = useState<Array<{url: string, legenda?: string}>>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: paginas, refetch } = trpc.paginaCustom.list.useQuery(
    { condominioId: condominioId! },
    { enabled: !!condominioId }
  );

  const createMutation = trpc.paginaCustom.create.useMutation({
    onSuccess: () => {
      toast.success("Página criada com sucesso!");
      refetch();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao criar página: ${error.message}`);
    },
  });

  const updateMutation = trpc.paginaCustom.update.useMutation({
    onSuccess: () => {
      toast.success("Página atualizada com sucesso!");
      refetch();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar página: ${error.message}`);
    },
  });

  const deleteMutation = trpc.paginaCustom.delete.useMutation({
    onSuccess: () => {
      toast.success("Página excluída com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir página: ${error.message}`);
    },
  });

  const toggleAtivoMutation = trpc.paginaCustom.toggleAtivo.useMutation({
    onSuccess: (data) => {
      toast.success(data.ativo ? "Página ativada" : "Página desativada");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao alterar status: ${error.message}`);
    },
  });

  const uploadMutation = trpc.upload.image.useMutation();
  const uploadFileMutation = trpc.upload.file.useMutation();

  const resetForm = () => {
    setFormData({
      titulo: "",
      subtitulo: "",
      descricao: "",
      link: "",
      videoUrl: "",
      arquivoUrl: "",
      arquivoNome: "",
    });
    setImagens([]);
    setEditingPagina(null);
  };

  const handleEdit = (pagina: PaginaCustom) => {
    setEditingPagina(pagina);
    setFormData({
      titulo: pagina.titulo,
      subtitulo: pagina.subtitulo || "",
      descricao: pagina.descricao || "",
      link: pagina.link || "",
      videoUrl: pagina.videoUrl || "",
      arquivoUrl: pagina.arquivoUrl || "",
      arquivoNome: pagina.arquivoNome || "",
    });
    setImagens(pagina.imagens || []);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!condominioId) return;

    const data = {
      ...formData,
      imagens,
    };

    if (editingPagina) {
      updateMutation.mutate({ id: editingPagina.id, ...data });
    } else {
      createMutation.mutate({ condominioId, ...data });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          const result = await uploadMutation.mutateAsync({
            fileData: base64,
            fileName: file.name,
            fileType: file.type,
          });
          setImagens(prev => [...prev, { url: result.url }]);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      toast.error("Erro ao fazer upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const result = await uploadFileMutation.mutateAsync({
          fileData: base64,
          fileName: file.name,
          fileType: file.type,
        });
        setFormData(prev => ({
          ...prev,
          arquivoUrl: result.url,
          arquivoNome: file.name,
        }));
        toast.success("Arquivo enviado com sucesso!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Erro ao fazer upload do arquivo");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImagem = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
  };

  if (!condominioId) {
    return (
      <div className="text-center py-12">
        <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Selecione uma organização para gerenciar páginas personalizadas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            100% Personalizado
          </h2>
          <p className="text-muted-foreground">
            Crie páginas totalmente personalizadas para sua revista
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Página
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  {editingPagina ? "Editar Página" : "Nova Página Personalizada"}
                </DialogTitle>
                <DialogDescription className="text-violet-100">
                  Crie uma página com conteúdo totalmente personalizado
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Título da página"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitulo">Subtítulo</Label>
                  <Input
                    id="subtitulo"
                    value={formData.subtitulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitulo: e.target.value }))}
                    placeholder="Subtítulo opcional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição detalhada do conteúdo"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="link">Link Externo</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="link"
                      value={formData.link}
                      onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                      placeholder="https://..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Link do Vídeo (YouTube)</Label>
                  <div className="relative">
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Arquivo para Download</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    className="flex-1"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                  />
                  {formData.arquivoUrl && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <FileDown className="w-3 h-3" />
                      {formData.arquivoNome || "Arquivo"}
                      <button onClick={() => setFormData(prev => ({ ...prev, arquivoUrl: "", arquivoNome: "" }))}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Galeria de Imagens</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="galeria-upload"
                  />
                  <label
                    htmlFor="galeria-upload"
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      {isUploading ? "Enviando..." : "Clique para adicionar imagens"}
                    </span>
                  </label>
                  
                  {imagens.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {imagens.map((img, index) => (
                        <div key={index} className="relative group aspect-square">
                          <img
                            src={img.url}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          <button
                            onClick={() => removeImagem(index)}
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
              <DialogFooter className="pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!formData.titulo || createMutation.isPending || updateMutation.isPending}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                >
                  {editingPagina ? "Salvar Alterações" : "Criar Página"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!paginas || paginas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma página personalizada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira página 100% personalizada para a revista
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Página
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginas.map((pagina) => {
            const paginaImagens = (pagina.imagens as Array<{url: string, legenda?: string}>) || [];
            const primeiraImagem = paginaImagens[0]?.url;
            
            return (
              <Card key={pagina.id} className={`overflow-hidden ${!pagina.ativo ? 'opacity-60' : ''}`}>
                <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                  {primeiraImagem ? (
                    <img
                      src={primeiraImagem}
                      alt={pagina.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-primary/30" />
                    </div>
                  )}
                  {paginaImagens.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      +{paginaImagens.length - 1} fotos
                    </div>
                  )}
                  <Badge 
                    className="absolute top-2 right-2"
                    variant={pagina.ativo ? "default" : "secondary"}
                  >
                    {pagina.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{pagina.titulo}</CardTitle>
                  {pagina.subtitulo && (
                    <CardDescription className="text-primary font-medium line-clamp-1">
                      {pagina.subtitulo}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {pagina.descricao && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {pagina.descricao}
                    </p>
                  )}
                  
                  {(pagina.link || pagina.arquivoUrl || pagina.videoUrl) && (
                    <div className="flex flex-wrap gap-1.5">
                      {pagina.link && (
                        <a
                          href={pagina.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded-full"
                        >
                          <ExternalLink className="w-3 h-3" /> Link
                        </a>
                      )}
                      {pagina.arquivoUrl && (
                        <a
                          href={pagina.arquivoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full"
                        >
                          <FileDown className="w-3 h-3" /> {pagina.arquivoNome || "Arquivo"}
                        </a>
                      )}
                      {pagina.videoUrl && (
                        <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                          <Play className="w-3 h-3" /> Vídeo
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(pagina)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAtivoMutation.mutate({ id: pagina.id })}
                    >
                      {pagina.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir esta página?")) {
                          deleteMutation.mutate({ id: pagina.id });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
