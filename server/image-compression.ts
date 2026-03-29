import sharp from "sharp";

/**
 * Configurações de compressão de imagem
 * Dimensões: 800x840px (1/4 de página A4 com margem)
 * Qualidade: 75% JPEG para mínimo tamanho com qualidade visual adequada
 */
const COMPRESSION_CONFIG = {
  width: 800,
  height: 840,
  quality: 75,
  maxFileSize: 100 * 1024 * 1024, // 100MB
};

/**
 * Comprime uma imagem para dimensões e qualidade otimizadas
 * @param imageBuffer Buffer da imagem original
 * @param originalMimeType Tipo MIME da imagem original
 * @returns Buffer da imagem comprimida
 */
export async function compressImage(
  imageBuffer: Buffer,
  originalMimeType: string = "image/jpeg"
): Promise<Buffer> {
  try {
    // Validar tamanho máximo
    if (imageBuffer.length > COMPRESSION_CONFIG.maxFileSize) {
      throw new Error(
        `Arquivo muito grande: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB. Máximo: 100MB`
      );
    }

    // Processar com Sharp
    let pipeline = sharp(imageBuffer);

    // Obter metadados para validação
    const metadata = await pipeline.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Não foi possível obter dimensões da imagem");
    }

    // Redimensionar mantendo proporção (fit: 'inside' não corta)
    // Depois aplicar qualidade apropriada
    pipeline = pipeline
      .resize(COMPRESSION_CONFIG.width, COMPRESSION_CONFIG.height, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toFormat("jpeg", {
        quality: COMPRESSION_CONFIG.quality,
        progressive: true,
        mozjpeg: true, // Usar mozjpeg para melhor compressão
      });

    const compressedBuffer = await pipeline.toBuffer();

    // Log de compressão
    const originalSize = imageBuffer.length;
    const compressedSize = compressedBuffer.length;
    const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

    console.log(
      `[Image Compression] Original: ${(originalSize / 1024).toFixed(2)}KB → Compressed: ${(compressedSize / 1024).toFixed(2)}KB (${reduction}% reduction)`
    );

    return compressedBuffer;
  } catch (error) {
    console.error("Erro ao comprimir imagem:", error);
    throw new Error(
      `Erro ao processar imagem: ${error instanceof Error ? error.message : "Desconhecido"}`
    );
  }
}

/**
 * Valida se uma imagem é válida antes de processar
 * @param imageBuffer Buffer da imagem
 * @returns true se válida, false caso contrário
 */
export async function validateImage(imageBuffer: Buffer): Promise<boolean> {
  try {
    if (imageBuffer.length === 0) {
      return false;
    }

    const metadata = await sharp(imageBuffer).metadata();
    return !!(metadata.width && metadata.height);
  } catch (error) {
    console.error("Erro ao validar imagem:", error);
    return false;
  }
}

/**
 * Obtém informações sobre uma imagem
 * @param imageBuffer Buffer da imagem
 * @returns Informações da imagem (dimensões, formato, tamanho)
 */
export async function getImageInfo(imageBuffer: Buffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || "unknown",
      size: imageBuffer.length,
      sizeKB: (imageBuffer.length / 1024).toFixed(2),
      sizeMB: (imageBuffer.length / 1024 / 1024).toFixed(2),
    };
  } catch (error) {
    console.error("Erro ao obter informações da imagem:", error);
    throw new Error(
      `Erro ao obter informações: ${error instanceof Error ? error.message : "Desconhecido"}`
    );
  }
}

/**
 * Comprime múltiplas imagens em paralelo
 * @param imageBuffers Array de buffers de imagens
 * @returns Array de buffers comprimidos
 */
export async function compressMultipleImages(
  imageBuffers: Buffer[]
): Promise<Buffer[]> {
  try {
    const compressionPromises = imageBuffers.map((buffer) =>
      compressImage(buffer)
    );

    return await Promise.all(compressionPromises);
  } catch (error) {
    console.error("Erro ao comprimir múltiplas imagens:", error);
    throw new Error(
      `Erro ao processar imagens: ${error instanceof Error ? error.message : "Desconhecido"}`
    );
  }
}

/**
 * Gera thumbnail de uma imagem
 * @param imageBuffer Buffer da imagem
 * @param width Largura do thumbnail
 * @param height Altura do thumbnail
 * @returns Buffer do thumbnail
 */
export async function generateThumbnail(
  imageBuffer: Buffer,
  width: number = 150,
  height: number = 150
): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .resize(width, height, {
        fit: "cover",
        position: "center",
      })
      .toFormat("jpeg", {
        quality: 80,
        progressive: true,
      })
      .toBuffer();
  } catch (error) {
    console.error("Erro ao gerar thumbnail:", error);
    throw new Error(
      `Erro ao gerar thumbnail: ${error instanceof Error ? error.message : "Desconhecido"}`
    );
  }
}
