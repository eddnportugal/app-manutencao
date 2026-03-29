import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { compressImage, formatFileSize, COMPRESSION_PRESETS, getFileExtension, initWebPSupport } from "@/lib/imageCompressor";
import { useEffect } from "react";
import { Camera, ImageIcon, Loader2, Trash2, Upload, X, Zap, Pencil } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "@/components/ui/sonner";
import FabricImageEditor from "./FabricImageEditor";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  folder?: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "banner" | "video";
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxSizeMB?: number;
  enableCompression?: boolean;
  compressionPreset?: keyof typeof COMPRESSION_PRESETS;
  compact?: boolean;
  enableEditor?: boolean;
  hideFormats?: boolean;
}

const aspectRatioClasses = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  banner: "aspect-[3/1]",
  video: "aspect-video",
};

export default function ImageUpload({
  value,
  onChange,
  folder = "uploads",
  aspectRatio = "square",
  placeholder = "Clique para carregar imagem",
  className,
  disabled = false,
  maxSizeMB = 10,
  enableCompression = true,
  compressionPreset = "quarterA4",
  compact = false,
  enableEditor = true,
  hideFormats = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{ original: number; compressed: number; format?: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Estado do editor de imagem
  const [editorOpen, setEditorOpen] = useState(false);

  // Inicializar verificação de suporte WebP
  useEffect(() => {
    initWebPSupport();
  }, []);

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data) => {
      onChange(data.url);
      toast.success("Imagem carregada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao carregar imagem");
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFileSelect = useCallback(
    async (file: File) => {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de ficheiro não suportado. Use JPEG, PNG, GIF ou WebP.");
        return;
      }

      // Validate file size (before compression)
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error(`Ficheiro muito grande. Máximo ${maxSizeMB}MB.`);
        return;
      }

      setIsUploading(true);
      setCompressionInfo(null);

      try {
        let fileToUpload: Blob = file;
        let fileType = file.type;
        let fileName = file.name;

        // Compress image if enabled
        if (enableCompression && file.type !== "image/gif") {
          setIsCompressing(true);
          const compressionOptions = COMPRESSION_PRESETS[compressionPreset];
          const result = await compressImage(file, compressionOptions);
          
          fileToUpload = result.blob;
          fileType = `image/${result.format}`;
          fileName = file.name.replace(/\.[^.]+$/, getFileExtension(result.format));
          
          setCompressionInfo({
            original: result.originalSize,
            compressed: result.compressedSize,
            format: result.format,
          });
          
          if (result.compressionRatio > 10) {
            const formatLabel = result.format === "webp" ? " (WebP)" : "";
            toast.success(
              `Imagem otimizada${formatLabel}: ${formatFileSize(result.originalSize)} → ${formatFileSize(result.compressedSize)} (-${result.compressionRatio.toFixed(0)}%)`,
              { duration: 3000 }
            );
          }
          setIsCompressing(false);
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          uploadMutation.mutate({
            fileName,
            fileType,
            fileData: base64,
            folder,
          });
        };
        reader.onerror = () => {
          toast.error("Erro ao ler ficheiro");
          setIsUploading(false);
        };
        reader.readAsDataURL(fileToUpload);
      } catch (error) {
        console.error("Erro na compressão:", error);
        toast.error("Erro ao processar imagem");
        setIsUploading(false);
        setIsCompressing(false);
      }
    },
    [folder, maxSizeMB, uploadMutation, enableCompression, compressionPreset]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
  };

  // Funções do editor
  const handleOpenEditor = () => {
    if (value) {
      setEditorOpen(true);
    }
  };

  const handleSaveEditedImage = (editedImageBase64: string) => {
    // A imagem editada já vem em base64, podemos fazer upload ou usar diretamente
    setIsUploading(true);
    
    // Fazer upload da imagem editada
    const fileName = `edited-${Date.now()}.png`;
    uploadMutation.mutate({
      fileName,
      fileType: "image/png",
      fileData: editedImageBase64,
      folder,
    });
    
    setEditorOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-dashed transition-all",
          aspectRatioClasses[aspectRatio],
          dragActive ? "border-primary bg-primary/5" : "border-border",
          !disabled && !value && "hover:border-primary/50 hover:bg-secondary/50 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={!disabled ? handleDrop : undefined}
      >
        {value ? (
          // Image preview
          <div className="relative w-full h-full group">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {enableEditor && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleOpenEditor}
                    title="Adicionar textos, setas e anotações"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={disabled || isUploading}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="pointer-events-none"
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Alterar
                  </Button>
                </label>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Upload placeholder
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleInputChange}
              className="hidden"
              disabled={disabled || isUploading}
            />
            {isUploading || isCompressing ? (
              <>
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin mb-2" />
                <span className="text-sm text-muted-foreground">
                  {isCompressing ? "A otimizar..." : "A carregar..."}
                </span>
                {isCompressing && (
                  <span className="text-xs text-primary mt-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Comprimindo imagem
                  </span>
                )}
              </>
            ) : (
              <>
                {compact || placeholder.length <= 3 ? (
                  // Modo compacto - centralizado
                  <div className="flex flex-col items-center justify-center w-full h-full p-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200 mb-2">
                      <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <span className="text-xs text-slate-500 text-center leading-tight max-w-full break-words">
                      {placeholder}
                    </span>
                  </div>
                ) : (
                                // Modo completo para placeholders longos
                  <>
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <span className="text-sm text-muted-foreground text-center px-4">
                      {placeholder}
                    </span>
                    {!hideFormats && (
                      <span className="text-xs text-muted-foreground mt-1">
                        JPEG, PNG, GIF ou WebP (máx. {maxSizeMB}MB)
                      </span>
                    )}
                    {enableCompression && !hideFormats && !hideFormats && (
                      <span className="text-xs text-primary mt-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> Compressão automática
                      </span>
                    )}
                    {enableEditor && !hideFormats && (
                      <span className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                        <Pencil className="w-3 h-3" /> Clique em "Editar" para adicionar textos e setas
                      </span>
                    )}
                  </>
                )}
              </>
            )}
          </label>
        )}
      </div>

      {/* Loading overlay */}
      {isUploading && value && (
        <div className="absolute inset-0 bg-background/80 rounded-xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {/* Modal do Editor de Imagem com Fabric.js */}
      {enableEditor && value && (
        <FabricImageEditor
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          imageUrl={value}
          onSave={handleSaveEditedImage}
        />
      )}
    </div>
  );
}

// Compact version for forms
export function ImageUploadCompact({
  value,
  onChange,
  folder = "uploads",
  placeholder = "Carregar imagem",
  className,
  disabled = false,
  enableCompression = true,
  compressionPreset = "thumbnail",
  enableEditor = true,
}: Omit<ImageUploadProps, "aspectRatio">) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  // Inicializar verificação de suporte WebP
  useEffect(() => {
    initWebPSupport();
  }, []);

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data) => {
      onChange(data.url);
      toast.success("Imagem carregada!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao carregar");
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFileSelect = useCallback(
    async (file: File) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo não suportado");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Máximo 10MB");
        return;
      }

      setIsUploading(true);

      try {
        let fileToUpload: Blob = file;
        let fileType = file.type;
        let fileName = file.name;

        if (enableCompression && file.type !== "image/gif") {
          setIsCompressing(true);
          const compressionOptions = COMPRESSION_PRESETS[compressionPreset];
          const result = await compressImage(file, compressionOptions);
          
          fileToUpload = result.blob;
          fileType = `image/${result.format}`;
          fileName = file.name.replace(/\.[^.]+$/, getFileExtension(result.format));
          setIsCompressing(false);
        }

        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          uploadMutation.mutate({
            fileName,
            fileType,
            fileData: base64,
            folder,
          });
        };
        reader.onerror = () => {
          toast.error("Erro ao ler ficheiro");
          setIsUploading(false);
        };
        reader.readAsDataURL(fileToUpload);
      } catch (error) {
        toast.error("Erro ao processar");
        setIsUploading(false);
        setIsCompressing(false);
      }
    },
    [folder, uploadMutation, enableCompression, compressionPreset]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSaveEditedImage = (editedImageBase64: string) => {
    setIsUploading(true);
    const fileName = `edited-${Date.now()}.png`;
    uploadMutation.mutate({
      fileName,
      fileType: "image/png",
      fileData: editedImageBase64,
      folder,
    });
    setEditorOpen(false);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Preview"
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
            {enableEditor && (
              <button
                type="button"
                onClick={() => setEditorOpen(true)}
                className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                title="Editar"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="p-1 bg-destructive text-white rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || isUploading}
            className="pointer-events-none"
          >
            {isUploading || isCompressing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-4 h-4 mr-1" />
                {placeholder}
              </>
            )}
          </Button>
        </label>
      )}

      {/* Modal do Editor de Imagem com Fabric.js */}
      {enableEditor && value && (
        <FabricImageEditor
          isOpen={editorOpen}
          onClose={() => setEditorOpen(false)}
          imageUrl={value}
          onSave={handleSaveEditedImage}
        />
      )}
    </div>
  );
}
