import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, X, Download, Eye, File, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";
import { prepareImageForUpload } from "@/lib/imageCompressor";

export interface Anexo {
  nome: string;
  url: string;
  tipo: string;
  tamanho: number;
}

interface AnexosSectionProps {
  value: Anexo[];
  onChange: (anexos: Anexo[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  label?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getFileIcon = (tipo: string) => {
  if (tipo.includes("pdf")) return "📄";
  if (tipo.includes("word") || tipo.includes("document")) return "📝";
  if (tipo.includes("excel") || tipo.includes("spreadsheet")) return "📊";
  if (tipo.includes("image")) return "🖼️";
  return "📎";
};

export default function AnexosSection({ 
  value = [], 
  onChange, 
  maxFiles = 10,
  acceptedTypes = ".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv",
  label = "Anexos (PDF/Documentos)"
}: AnexosSectionProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFileMutation = trpc.upload.file.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (value.length + files.length > maxFiles) {
      toast.error(`Máximo de ${maxFiles} anexos permitidos`);
      return;
    }

    setUploading(true);

    try {
      const novosAnexos: Anexo[] = [];

      for (const file of Array.from(files)) {
        // Verificar tamanho (máximo 20MB)
        if (file.size > 20 * 1024 * 1024) {
          toast.error(`Arquivo ${file.name} excede o limite de 20MB`);
          continue;
        }

        // Converter para base64 e fazer upload ao servidor
        try {
          const isImage = file.type.startsWith('image/');
          const base64 = isImage
            ? await prepareImageForUpload(file, "quarterA4")
            : await fileToBase64(file);
          const result = await uploadFileMutation.mutateAsync({
            fileName: file.name,
            fileType: file.type,
            fileData: base64,
            folder: "anexos",
          });
          
          novosAnexos.push({
            nome: file.name,
            url: result.url,
            tipo: file.type,
            tamanho: file.size
          });
        } catch (err) {
          console.error(`Erro ao enviar ${file.name}:`, err);
          toast.error(`Erro ao enviar ${file.name}`);
        }
      }

      if (novosAnexos.length > 0) {
        onChange([...value, ...novosAnexos]);
        toast.success(`${novosAnexos.length} arquivo(s) adicionado(s)`);
      }
    } catch (error) {
      toast.error("Erro ao processar arquivos");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const removeAnexo = (index: number) => {
    const novosAnexos = value.filter((_, i) => i !== index);
    onChange(novosAnexos);
    toast.success("Anexo removido");
  };

  const downloadAnexo = (anexo: Anexo) => {
    const link = document.createElement("a");
    link.href = anexo.url;
    link.download = anexo.nome;
    link.click();
  };

  const openAnexo = (anexo: Anexo) => {
    // Se for PDF ou imagem, abre em nova aba
    if (anexo.tipo.includes("pdf") || anexo.tipo.includes("image")) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${anexo.nome}</title></head>
            <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f5f5f5;">
              ${anexo.tipo.includes("pdf") 
                ? `<iframe src="${anexo.url}" style="width:100%;height:100vh;border:none;"></iframe>`
                : `<img src="${anexo.url}" style="max-width:100%;max-height:100vh;" />`
              }
            </body>
          </html>
        `);
      }
    } else {
      downloadAnexo(anexo);
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <FileText className="h-4 w-4 text-blue-500" />
        {label}
      </Label>

      {/* Área de upload */}
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          {uploading ? "Processando..." : "Clique para adicionar arquivos"}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PDF, DOC, XLS, TXT (máx. 20MB cada)
        </p>
      </div>

      {/* Lista de anexos */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((anexo, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-3 flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(anexo.tipo)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {anexo.nome}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(anexo.tamanho)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openAnexo(anexo)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadAnexo(anexo)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAnexo(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contador */}
      <p className="text-xs text-gray-400 text-right">
        {value.length} de {maxFiles} anexos
      </p>
    </div>
  );
}
