import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { prepareImageForUpload } from "@/lib/imageCompressor";
import { Loader2, Plus, Save, Star, Trash2, Vote, Image, Upload, X, Calendar } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "@/components/ui/sonner";

interface VotacaoFormProps {
  revistaId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface OpcaoForm {
  titulo: string;
  descricao: string;
  imagemUrl: string;
  imagemPreview: string;
}

export default function VotacaoForm({ revistaId, onSuccess, onCancel }: VotacaoFormProps) {
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tipo: "enquete" as "funcionario_mes" | "enquete" | "decisao",
    imagemUrl: "",
    imagemPreview: "",
    dataInicio: "",
    dataFim: "",
    opcoes: [
      { titulo: "", descricao: "", imagemUrl: "", imagemPreview: "" },
      { titulo: "", descricao: "", imagemUrl: "", imagemPreview: "" }
    ] as OpcaoForm[],
  });
  
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingOpcao, setUploadingOpcao] = useState<number | null>(null);
  const mainImageRef = useRef<HTMLInputElement>(null);
  const opcaoImageRefs = useRef<(HTMLInputElement | null)[]>([]);

  const utils = trpc.useUtils();
  const uploadMutation = trpc.upload.image.useMutation();

  const createMutation = trpc.votacao.create.useMutation({
    onSuccess: () => {
      toast.success("Votação criada com sucesso!");
      utils.votacao.list.invalidate({ revistaId });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao criar votação: " + error.message);
    },
  });

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploadingMain(true);
    
    // Preview local
    const previewReader = new FileReader();
    previewReader.onload = (event) => {
      setFormData(prev => ({ ...prev, imagemPreview: event.target?.result as string }));
    };
    previewReader.readAsDataURL(file);

    try {
      const fileData = await prepareImageForUpload(file, "quarterA4");
      const result = await uploadMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
        fileData,
        folder: 'votacoes',
      });
      setFormData(prev => ({ ...prev, imagemUrl: result.url }));
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      toast.error("Erro ao enviar imagem");
      setFormData(prev => ({ ...prev, imagemPreview: "" }));
    } finally {
      setUploadingMain(false);
    }
  };

  const handleOpcaoImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploadingOpcao(index);
    
    // Preview local
    const previewReader = new FileReader();
    previewReader.onload = (event) => {
      const newOpcoes = [...formData.opcoes];
      newOpcoes[index] = { ...newOpcoes[index], imagemPreview: event.target?.result as string };
      setFormData(prev => ({ ...prev, opcoes: newOpcoes }));
    };
    previewReader.readAsDataURL(file);

    try {
      const fileData = await prepareImageForUpload(file, "quarterA4");
      const result = await uploadMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
        fileData,
        folder: 'votacoes',
      });
      const newOpcoes = [...formData.opcoes];
      newOpcoes[index] = { ...newOpcoes[index], imagemUrl: result.url };
      setFormData(prev => ({ ...prev, opcoes: newOpcoes }));
      toast.success("Imagem da opção enviada!");
    } catch (error) {
      toast.error("Erro ao enviar imagem da opção");
      const newOpcoes = [...formData.opcoes];
      newOpcoes[index] = { ...newOpcoes[index], imagemPreview: "" };
      setFormData(prev => ({ ...prev, opcoes: newOpcoes }));
    } finally {
      setUploadingOpcao(null);
    }
  };

  const fileToBase64DataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
    });
  };

  const removeMainImage = () => {
    setFormData(prev => ({ ...prev, imagemUrl: "", imagemPreview: "" }));
    if (mainImageRef.current) mainImageRef.current.value = "";
  };

  const removeOpcaoImage = (index: number) => {
    const newOpcoes = [...formData.opcoes];
    newOpcoes[index] = { ...newOpcoes[index], imagemUrl: "", imagemPreview: "" };
    setFormData(prev => ({ ...prev, opcoes: newOpcoes }));
    if (opcaoImageRefs.current[index]) opcaoImageRefs.current[index]!.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      toast.error("O título da votação é obrigatório");
      return;
    }

    const opcoesValidas = formData.opcoes.filter(o => o.titulo.trim()).map(o => ({
      titulo: o.titulo,
      descricao: o.descricao,
      imagemUrl: o.imagemUrl || undefined,
    }));
    
    if (opcoesValidas.length < 2) {
      toast.error("Adicione pelo menos 2 opções de voto");
      return;
    }

    createMutation.mutate({
      revistaId,
      titulo: formData.titulo,
      descricao: formData.descricao,
      tipo: formData.tipo,
      imagemUrl: formData.imagemUrl || undefined,
      dataInicio: formData.dataInicio ? new Date(formData.dataInicio) : undefined,
      dataFim: formData.dataFim ? new Date(formData.dataFim) : undefined,
      opcoes: opcoesValidas,
    });
  };

  const addOpcao = () => {
    setFormData({
      ...formData,
      opcoes: [...formData.opcoes, { titulo: "", descricao: "", imagemUrl: "", imagemPreview: "" }],
    });
  };

  const removeOpcao = (index: number) => {
    if (formData.opcoes.length <= 2) {
      toast.error("Mínimo de 2 opções");
      return;
    }
    setFormData({
      ...formData,
      opcoes: formData.opcoes.filter((_, i) => i !== index),
    });
  };

  const updateOpcao = (index: number, field: keyof OpcaoForm, value: string) => {
    const newOpcoes = [...formData.opcoes];
    newOpcoes[index] = { ...newOpcoes[index], [field]: value };
    setFormData({ ...formData, opcoes: newOpcoes });
  };

  const isLoading = createMutation.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="font-serif flex items-center gap-2">
            <Vote className="w-5 h-5" />
            Nova Votação
          </CardTitle>
          <CardDescription>
            Crie uma votação ou enquete para a equipa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Tipo */}
          <div className="space-y-3">
            <Label>Tipo de Votação</Label>
            <RadioGroup
              value={formData.tipo}
              onValueChange={(value) => setFormData({ ...formData, tipo: value as any })}
              className="grid grid-cols-3 gap-3"
            >
              <div>
                <RadioGroupItem value="funcionario_mes" id="funcionario_mes" className="peer sr-only" />
                <Label
                  htmlFor="funcionario_mes"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <Star className="w-5 h-5 mb-1 text-amber-500" />
                  <span className="text-xs font-medium text-center">Funcionário do Mês</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="enquete" id="enquete" className="peer sr-only" />
                <Label
                  htmlFor="enquete"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <Vote className="w-5 h-5 mb-1 text-primary" />
                  <span className="text-xs font-medium text-center">Enquete</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="decisao" id="decisao" className="peer sr-only" />
                <Label
                  htmlFor="decisao"
                  className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer"
                >
                  <Vote className="w-5 h-5 mb-1 text-emerald-500" />
                  <span className="text-xs font-medium text-center">Decisão</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Votação *</Label>
            <Input
              id="titulo"
              placeholder={
                formData.tipo === "funcionario_mes"
                  ? "Funcionário do Mês - Dezembro"
                  : "Ex: Qual cor para o salão de festas?"
              }
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              placeholder="Explique o objetivo da votação..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={2}
            />
          </div>

          {/* Imagem Principal da Votação */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Imagem da Votação (Capa)
            </Label>
            <div className="border-2 border-dashed rounded-xl p-4 text-center">
              {formData.imagemPreview || formData.imagemUrl ? (
                <div className="relative inline-block">
                  <img 
                    src={formData.imagemPreview || formData.imagemUrl} 
                    alt="Preview" 
                    className="max-h-32 rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeMainImage}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="cursor-pointer py-4"
                  onClick={() => mainImageRef.current?.click()}
                >
                  {uploadingMain ? (
                    <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Clique para adicionar imagem</p>
                    </>
                  )}
                </div>
              )}
              <input
                ref={mainImageRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMainImageUpload}
              />
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data Início
              </Label>
              <Input
                id="dataInicio"
                type="datetime-local"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataFim" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data Fim
              </Label>
              <Input
                id="dataFim"
                type="datetime-local"
                value={formData.dataFim}
                onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
              />
            </div>
          </div>

          {/* Opções */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Opções de Voto</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOpcao}>
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-4">
              {formData.opcoes.map((opcao, index) => (
                <div key={index} className="p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-start gap-3">
                    {/* Imagem da Opção */}
                    <div className="flex-shrink-0">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden bg-background"
                        onClick={() => opcaoImageRefs.current[index]?.click()}
                      >
                        {opcao.imagemPreview || opcao.imagemUrl ? (
                          <div className="relative w-full h-full">
                            <img 
                              src={opcao.imagemPreview || opcao.imagemUrl} 
                              alt={`Opção ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-1 -right-1 h-5 w-5"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeOpcaoImage(index);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : uploadingOpcao === index ? (
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        ) : (
                          <Image className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <input
                        ref={el => { opcaoImageRefs.current[index] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleOpcaoImageUpload(index, e)}
                      />
                    </div>

                    {/* Campos da Opção */}
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder={`Opção ${index + 1}`}
                        value={opcao.titulo}
                        onChange={(e) => updateOpcao(index, "titulo", e.target.value)}
                      />
                      <Input
                        placeholder="Descrição (opcional)"
                        value={opcao.descricao}
                        onChange={(e) => updateOpcao(index, "descricao", e.target.value)}
                        className="text-sm"
                      />
                    </div>

                    {/* Botão Remover */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeOpcao(index)}
                      className="text-destructive hover:text-destructive flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {onCancel && (
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A criar...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Criar Votação
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
