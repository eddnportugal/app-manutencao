/**
 * Utilitário de compressão de imagens no cliente
 * Reduz o tamanho dos ficheiros antes do upload para otimizar o carregamento
 * Usa WebP por padrão para máxima compressão com qualidade
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: "jpeg" | "webp" | "png";
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  width: number;
  height: number;
  format: string;
}

/**
 * Verifica se o navegador suporta WebP
 */
let webpSupportCache: boolean | null = null;

export function checkWebPSupport(): Promise<boolean> {
  if (webpSupportCache !== null) {
    return Promise.resolve(webpSupportCache);
  }

  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    
    // Tentar criar um blob WebP
    canvas.toBlob(
      (blob) => {
        webpSupportCache = blob !== null && blob.type === "image/webp";
        resolve(webpSupportCache);
      },
      "image/webp",
      0.5
    );
    
    // Timeout de segurança
    setTimeout(() => {
      if (webpSupportCache === null) {
        webpSupportCache = false;
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Verifica suporte WebP de forma síncrona (após primeira verificação)
 */
export function isWebPSupported(): boolean {
  return webpSupportCache ?? false;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.82,
  outputFormat: "webp", // WebP por padrão
};

/**
 * Carrega uma imagem a partir de um File ou Blob
 */
function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calcula as novas dimensões mantendo a proporção
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // Se a imagem já é menor que o máximo, não redimensionar
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calcular a proporção
  const aspectRatio = width / height;

  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
}

/**
 * Comprime uma imagem usando Canvas
 * Usa WebP por padrão com fallback para JPEG se não suportado
 */
export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;

  // Verificar suporte WebP e ajustar formato se necessário
  const webpSupported = await checkWebPSupport();
  let outputFormat = opts.outputFormat!;
  
  // Se WebP não é suportado e foi solicitado, usar JPEG como fallback
  if (outputFormat === "webp" && !webpSupported) {
    outputFormat = "jpeg";
  }

  // Carregar a imagem
  const img = await loadImage(file);
  const originalWidth = img.width;
  const originalHeight = img.height;

  // Calcular novas dimensões
  const { width, height } = calculateDimensions(
    originalWidth,
    originalHeight,
    opts.maxWidth!,
    opts.maxHeight!
  );

  // Criar canvas e desenhar a imagem redimensionada
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Não foi possível criar contexto do canvas");
  }

  // Usar algoritmo de suavização para melhor qualidade
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Desenhar a imagem
  ctx.drawImage(img, 0, 0, width, height);

  // Limpar URL do objeto
  URL.revokeObjectURL(img.src);

  // Converter para blob com compressão
  const mimeType = `image/${outputFormat}`;
  
  // Ajustar qualidade para WebP (pode ser um pouco menor mantendo qualidade visual)
  const quality = outputFormat === "webp" ? Math.min(opts.quality! + 0.03, 0.95) : opts.quality!;
  
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Falha ao converter canvas para blob"));
        }
      },
      mimeType,
      quality
    );
  });

  const compressedSize = blob.size;
  const compressionRatio = originalSize > 0 ? (1 - compressedSize / originalSize) * 100 : 0;

  return {
    blob,
    originalSize,
    compressedSize,
    compressionRatio,
    width,
    height,
    format: outputFormat,
  };
}

/**
 * Comprime múltiplas imagens em paralelo
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i++) {
    const result = await compressImage(files[i], options);
    results.push(result);
    onProgress?.(i + 1, total);
  }

  return results;
}

/**
 * Verifica se um ficheiro é uma imagem
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

/**
 * Formata o tamanho do ficheiro para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Configurações predefinidas para diferentes casos de uso
 * Todos usam WebP por padrão para máxima compressão
 */
export const COMPRESSION_PRESETS = {
  // Para thumbnails e miniaturas
  thumbnail: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.75,
    outputFormat: "webp" as const,
  },
  // Para imagens de galeria
  gallery: {
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.82,
    outputFormat: "webp" as const,
  },
  // Para imagens de alta qualidade
  highQuality: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.88,
    outputFormat: "webp" as const,
  },
  // Para logos e ícones (PNG para manter transparência)
  logo: {
    maxWidth: 500,
    maxHeight: 500,
    quality: 0.9,
    outputFormat: "png" as const,
  },
  // Para capas de revista
  cover: {
    maxWidth: 1200,
    maxHeight: 1600,
    quality: 0.85,
    outputFormat: "webp" as const,
  },
  // Preset JPEG para compatibilidade máxima (quando necessário)
  jpegCompatible: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    outputFormat: "jpeg" as const,
  },
  // Para visualização em 1/4 de página A4 (105mm x 148.5mm)
  // Otimizado para mínimo tamanho com qualidade suficiente para impressão/visualização
  quarterA4: {
    maxWidth: 800,
    maxHeight: 840,
    quality: 0.75,
    outputFormat: "jpeg" as const,
  },
};

/**
 * Comprime uma imagem e retorna como base64 data URL pronto para upload.
 * Pula GIFs animados para manter a animação.
 * Use este método em todos os pontos de upload de imagem do sistema.
 */
export async function prepareImageForUpload(
  file: File,
  preset: keyof typeof COMPRESSION_PRESETS = "quarterA4"
): Promise<string> {
  // Pular GIFs (podem ser animados)
  if (file.type === "image/gif") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Pular imagens muito pequenas (< 50KB) - já são leves
  if (file.size < 50 * 1024) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  try {
    const options = COMPRESSION_PRESETS[preset];
    const result = await compressImage(file, options);

    // Converter blob comprimido para base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(result.blob);
    });
  } catch (error) {
    console.warn("Compressão falhou, usando imagem original:", error);
    // Fallback: retornar original
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Obtém a extensão de ficheiro correta para o formato
 */
export function getFileExtension(format: string): string {
  switch (format) {
    case "webp":
      return ".webp";
    case "jpeg":
      return ".jpg";
    case "png":
      return ".png";
    default:
      return ".jpg";
  }
}

/**
 * Inicializa a verificação de suporte WebP
 * Chamar no início da aplicação para cache
 */
export async function initWebPSupport(): Promise<boolean> {
  return checkWebPSupport();
}
