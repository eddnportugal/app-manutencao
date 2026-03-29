import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ZoomIn, Download, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageItem {
  id?: number;
  url: string;
  imagemUrl?: string;
  legenda?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
  className?: string;
  columns?: 2 | 3 | 4;
  aspectRatio?: "square" | "video" | "auto";
  showLightbox?: boolean;
}

export default function ImageGallery({
  images,
  className,
  columns = 3,
  aspectRatio = "square",
  showLightbox = true,
}: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getImageUrl = (img: ImageItem) => img.url || img.imagemUrl || "";

  const openLightbox = (index: number) => {
    if (showLightbox) {
      setCurrentIndex(index);
      setLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          closeLightbox();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goToPrevious, goToNext]);

  const downloadImage = async (url: string, filename?: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename || `imagem-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      // Fallback: open in new tab
      window.open(url, "_blank");
    }
  };

  if (!images || images.length === 0) {
    return null;
  }

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  };

  const aspectRatioClass = {
    square: "aspect-square",
    video: "aspect-video",
    auto: "",
  };

  return (
    <>
      {/* Grid de imagens */}
      <div className={cn("grid gap-2", gridCols[columns], className)}>
        {images.map((image, index) => (
          <div
            key={image.id || index}
            className={cn(
              "relative group overflow-hidden rounded-lg bg-muted cursor-pointer",
              aspectRatioClass[aspectRatio]
            )}
            onClick={() => openLightbox(index)}
          >
            <img
              src={getImageUrl(image)}
              alt={image.legenda || `Imagem ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {showLightbox && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            {image.legenda && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-xs text-white truncate">{image.legenda}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            {/* Botão fechar */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Botões de ação */}
            <div className="absolute top-4 left-4 z-50 flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => downloadImage(getImageUrl(images[currentIndex]), images[currentIndex].legenda)}
                title="Descarregar"
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => window.open(getImageUrl(images[currentIndex]), "_blank")}
                title="Abrir em nova aba"
              >
                <Maximize2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Navegação anterior */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}

            {/* Imagem principal */}
            <div className="relative max-w-full max-h-full p-8">
              <img
                src={getImageUrl(images[currentIndex])}
                alt={images[currentIndex]?.legenda || `Imagem ${currentIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
            </div>

            {/* Navegação próxima */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
                onClick={goToNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}

            {/* Legenda e contador */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              {images[currentIndex]?.legenda && (
                <p className="text-white text-sm mb-2 px-4">{images[currentIndex].legenda}</p>
              )}
              <p className="text-white/70 text-sm">
                {currentIndex + 1} / {images.length}
              </p>
            </div>

            {/* Miniaturas */}
            {images.length > 1 && images.length <= 10 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id || index}
                    className={cn(
                      "w-12 h-12 rounded overflow-hidden border-2 transition-all",
                      index === currentIndex
                        ? "border-white scale-110"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Componente simplificado para exibição inline (sem lightbox)
export function ImageThumbnails({
  images,
  maxVisible = 4,
  onViewAll,
}: {
  images: ImageItem[];
  maxVisible?: number;
  onViewAll?: () => void;
}) {
  if (!images || images.length === 0) return null;

  const visibleImages = images.slice(0, maxVisible);
  const remainingCount = images.length - maxVisible;

  return (
    <div className="flex gap-1">
      {visibleImages.map((image, index) => (
        <div
          key={image.id || index}
          className="w-12 h-12 rounded overflow-hidden bg-muted"
        >
          <img
            src={image.url || image.imagemUrl || ""}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <button
          className="w-12 h-12 rounded bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground hover:bg-muted/80"
          onClick={onViewAll}
        >
          +{remainingCount}
        </button>
      )}
    </div>
  );
}
