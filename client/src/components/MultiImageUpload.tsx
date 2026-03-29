import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, X, GripVertical, Image as ImageIcon, Zap, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { compressImage, formatFileSize, COMPRESSION_PRESETS, getFileExtension, initWebPSupport } from "@/lib/imageCompressor";
import { useEffect } from "react";
import FabricImageEditor from "./FabricImageEditor";
import { trpc } from "@/lib/trpc";

// Tipo exportado para uso em outros componentes
export interface ImageItem {
  id?: number;
  url: string;
  legenda?: string;
  isNew?: boolean;
}

interface MultiImageUploadProps {
  value?: string[];
  images?: ImageItem[];
  onChange: (images: string[]) => void;
  onChangeWithLegendas?: (images: ImageItem[]) => void; // Nova prop para suportar legendas
  maxImages?: number;
  label?: string;
  enableCompression?: boolean;
  compressionPreset?: keyof typeof COMPRESSION_PRESETS;
  enableEditor?: boolean;
  showLegendas?: boolean; // Mostrar campos de legenda
  folder?: string; // Pasta para upload no servidor
}

interface CompressionStats {
  totalOriginal: number;
  totalCompressed: number;
  filesProcessed: number;
  totalFiles: number;
}

export default function MultiImageUpload({
  value,
  images: imagesProp,
  onChange,
  onChangeWithLegendas,
  maxImages = 10,
  label = "Imagens",
  enableCompression = true,
  compressionPreset = "quarterA4",
  enableEditor = true,
  showLegendas = true,
  folder = "uploads",
}: MultiImageUploadProps) {
  // Suportar tanto value (array de strings) quanto images (array de ImageItem)
  // Usar ref para preservar legendas entre re-renders (value é string[] e perde legendas)
  const legendasRef = useRef<Record<string, string>>({});
  
  const normalizedImages: ImageItem[] = (value || imagesProp || []).map((item) => {
    if (typeof item === "string") {
      return { url: item, legenda: legendasRef.current[item] || "" };
    }
    // Preservar legenda do ref se existir, senão usar do item
    if (legendasRef.current[item.url]) {
      return { ...item, legenda: legendasRef.current[item.url] };
    }
    if (item.legenda) {
      legendasRef.current[item.url] = item.legenda;
    }
    return item;
  });
  const images = normalizedImages;
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<CompressionStats | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("webp");
  
  // Estado do editor de imagem
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const [editingImageUrl, setEditingImageUrl] = useState<string>("");

  // Mutation para upload de imagens ao servidor
  const uploadMutation = trpc.upload.image.useMutation();

  // Inicializar verificação de suporte WebP
  useEffect(() => {
    initWebPSupport();
  }, []);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        toast.error(`Máximo de ${maxImages} imagens permitidas`);
        return;
      }

      const filesToUpload = Array.from(files).slice(0, remainingSlots);
      setUploading(true);
      setCompressionStats(null);

      try {
        const newImages: ImageItem[] = [];
        let totalOriginal = 0;
        let totalCompressed = 0;

        // Inicializar estatísticas
        if (enableCompression) {
          setCompressing(true);
          setCompressionStats({
            totalOriginal: 0,
            totalCompressed: 0,
            filesProcessed: 0,
            totalFiles: filesToUpload.length,
          });
        }

        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i];
          
          if (!file.type.startsWith("image/")) {
            toast.error(`${file.name} não é uma imagem válida`);
            continue;
          }

          // Limite aumentado para 10MB (antes da compressão)
          if (file.size > 10 * 1024 * 1024) {
            toast.error(`${file.name} excede o limite de 10MB`);
            continue;
          }

          let fileToUpload: Blob = file;
          let fileType = file.type;

          // Comprimir imagem se habilitado (exceto GIFs)
          if (enableCompression && file.type !== "image/gif") {
            try {
              const compressionOptions = COMPRESSION_PRESETS[compressionPreset];
              const result = await compressImage(file, compressionOptions);
              
              fileToUpload = result.blob;
              fileType = `image/${result.format}`;
              setOutputFormat(result.format);
              totalOriginal += result.originalSize;
              totalCompressed += result.compressedSize;

              // Atualizar estatísticas
              setCompressionStats({
                totalOriginal,
                totalCompressed,
                filesProcessed: i + 1,
                totalFiles: filesToUpload.length,
              });
            } catch (compressionError) {
              console.warn("Erro na compressão, usando original:", compressionError);
              totalOriginal += file.size;
              totalCompressed += file.size;
            }
          } else {
            totalOriginal += file.size;
            totalCompressed += file.size;
          }

          // Converter para base64 e fazer upload ao servidor
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(fileToUpload);
          });

          // Upload ao servidor para obter URL real
          try {
            const ext = file.name.split(".").pop() || "jpg";
            const uploadResult = await uploadMutation.mutateAsync({
              fileName: file.name,
              fileType: fileType,
              fileData: base64,
              folder,
            });
            newImages.push({ url: uploadResult.url, isNew: true });
          } catch (uploadError: any) {
            console.error(`Erro no upload de ${file.name}:`, uploadError);
            const errorMsg = uploadError?.message || uploadError?.data?.message || "Erro desconhecido";
            if (errorMsg.includes("grande") || errorMsg.includes("large") || errorMsg.includes("limit")) {
              toast.error(`${file.name}: Imagem muito grande. Tente reduzir o tamanho.`);
            } else if (errorMsg.includes("suportado") || errorMsg.includes("supported")) {
              toast.error(`${file.name}: Formato não suportado. Use JPEG, PNG, GIF ou WebP.`);
            } else {
              toast.error(`Erro ao enviar ${file.name}: ${errorMsg.substring(0, 100)}`);
            }
          }
        }

        setCompressing(false);

        if (newImages.length > 0) {
          // Combinar imagens existentes com novas
          const allImages = [...images, ...newImages.map(img => ({ url: img.url, legenda: '' }))];
          notifyChange(allImages);
          
          // Mostrar estatísticas de compressão
          if (enableCompression && totalOriginal > 0) {
            const savedBytes = totalOriginal - totalCompressed;
            const savedPercent = ((savedBytes / totalOriginal) * 100).toFixed(0);
            
            if (savedBytes > 1024) {
              const formatLabel = outputFormat === "webp" ? " (WebP)" : "";
              toast.success(
                `${newImages.length} imagem(ns) otimizada(s)${formatLabel}: ${formatFileSize(totalOriginal)} → ${formatFileSize(totalCompressed)} (-${savedPercent}%)`,
                { duration: 4000 }
              );
            } else {
              toast.success(`${newImages.length} imagem(ns) adicionada(s)`);
            }
          } else {
            toast.success(`${newImages.length} imagem(ns) adicionada(s)`);
          }
        }
      } catch (error) {
        console.error("Erro no upload:", error);
        toast.error("Erro ao fazer upload das imagens");
      } finally {
        setUploading(false);
        setCompressing(false);
        setCompressionStats(null);
        e.target.value = "";
      }
    },
    [images, maxImages, onChange, value, enableCompression, compressionPreset]
  );

  // Função auxiliar para notificar mudanças
  const notifyChange = (newImages: ImageItem[]) => {
    onChange(newImages.map(img => img.url));
    if (onChangeWithLegendas) {
      onChangeWithLegendas(newImages);
    }
  };

  const handleRemove = (index: number) => {
    const removed = images[index];
    if (removed?.url) delete legendasRef.current[removed.url];
    const newImages = images.filter((_, i) => i !== index);
    notifyChange(newImages);
  };

  const handleLegendaChange = (index: number, legenda: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], legenda };
    // Salvar no ref para preservar entre re-renders
    legendasRef.current[newImages[index].url] = legenda;
    notifyChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    notifyChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Funções do editor de imagem
  const handleOpenEditor = (index: number) => {
    setEditingImageIndex(index);
    setEditingImageUrl(images[index].url);
    setEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditingImageIndex(null);
    setEditingImageUrl("");
  };

  const handleSaveEditedImage = async (editedImageBase64: string) => {
    if (editingImageIndex === null) return;
    
    // Upload da imagem editada ao servidor
    try {
      const mimeMatch = editedImageBase64.match(/^data:(image\/\w+);base64,/);
      const fileType = mimeMatch ? mimeMatch[1] : "image/png";
      const ext = fileType.split("/")[1] || "png";
      
      const uploadResult = await uploadMutation.mutateAsync({
        fileName: `edited-image.${ext}`,
        fileType,
        fileData: editedImageBase64,
        folder,
      });
      
      const newImages = [...images];
      newImages[editingImageIndex] = { 
        ...newImages[editingImageIndex], 
        url: uploadResult.url 
      };
      notifyChange(newImages);
      toast.success("Imagem editada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar imagem editada:", error);
      toast.error("Erro ao salvar imagem editada");
    }
    handleCloseEditor();
  };

  // Estado colapsável
  const [expanded, setExpanded] = useState(images.length > 0);

  // Auto-expandir quando imagens são adicionadas
  useEffect(() => {
    if (images.length > 0) setExpanded(true);
  }, [images.length]);

  const progressPercent = compressionStats
    ? (compressionStats.filesProcessed / compressionStats.totalFiles) * 100
    : 0;

  return (
    <div className="w-full max-w-full overflow-hidden space-y-0">
      {/* Header colapsável */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-100 rounded-lg">
            <ImageIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium text-blue-900">{label}</span>
            {images.length > 0 && (
              <span className="ml-2 text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                {images.length}/{maxImages}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {enableCompression && (
            <span className="text-[10px] text-emerald-600 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" />
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-blue-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-500" />
          )}
        </div>
      </button>

      {/* Conteúdo colapsável */}
      {expanded && (
        <div className="pt-3 space-y-3 w-full max-w-full overflow-hidden">
          {/* Barra de progresso de compressão */}
          {compressing && compressionStats && (
            <div className="space-y-1.5 p-2 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-primary">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Otimizando...
                </span>
                <span className="text-muted-foreground">
                  {compressionStats.filesProcessed}/{compressionStats.totalFiles}
                </span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
              {compressionStats.totalOriginal > 0 && (
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{formatFileSize(compressionStats.totalOriginal)}</span>
                  <span className="text-primary font-medium">
                    → {formatFileSize(compressionStats.totalCompressed)}
                  </span>
                </div>
              )}
            </div>
          )}

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-full overflow-hidden">
              {images.map((img, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`relative group border rounded-lg overflow-hidden bg-muted ${
                    draggedIndex === index ? "opacity-50" : ""
                  }`}
                >
                  <div className="aspect-square">
                    <img
                      src={img.url}
                      alt={img.legenda || `Imagem ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-1 left-1 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-4 h-4 text-white drop-shadow-lg" />
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1 bg-gray-800/80 text-white rounded-full hover:bg-gray-900 transition-colors"
                      title="Remover imagem"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="p-1.5">
                    {showLegendas && (
                    <Input
                      placeholder="Legenda"
                      value={img.legenda || ""}
                      onChange={(e) => handleLegendaChange(index, e.target.value)}
                      className="text-sm h-8"
                    />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {images.length < maxImages && (
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading || compressing}
                className="hidden"
                id="multi-image-upload"
              />
              <label htmlFor="multi-image-upload" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={uploading || compressing}
                  asChild
                >
                  <span>
                    {uploading || compressing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {compressing ? "A otimizar..." : "A carregar..."}
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Imagens
                      </>
                    )}
                  </span>
                </Button>
              </label>
            </div>
          )}

          {images.length === 0 && !compressing && (
            <div className="border-2 border-dashed border-blue-300 rounded-xl p-4 text-center bg-gradient-to-b from-blue-50/50 to-white">
              <p className="text-xs text-blue-700">
                Carregue uma ou várias imagens
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Máximo {maxImages} imagens, 10MB cada
              </p>
            </div>
          )}
        </div>
      )}

      {/* Indicador visual quando colapsado com imagens */}
      {!expanded && images.length > 0 && (
        <div className="flex gap-1 mt-2 overflow-hidden">
          {images.slice(0, 4).map((img, i) => (
            <div key={i} className="w-10 h-10 rounded border overflow-hidden flex-shrink-0">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {images.length > 4 && (
            <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-[10px] text-muted-foreground">+{images.length - 4}</span>
            </div>
          )}
        </div>
      )}

      {/* Modal do Editor de Imagem com Fabric.js */}
      {enableEditor && (
        <FabricImageEditor
          isOpen={editorOpen}
          onClose={handleCloseEditor}
          imageUrl={editingImageUrl}
          onSave={handleSaveEditedImage}
        />
      )}
    </div>
  );
}
