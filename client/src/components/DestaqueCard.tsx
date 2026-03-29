import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  FileText, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight,
  X,
  Download,
  Image as ImageIcon
} from "lucide-react";

interface DestaqueImage {
  url: string;
  legenda?: string | null;
  ordem?: number | null;
}

interface DestaqueCardProps {
  id: number;
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  link?: string | null;
  arquivoUrl?: string | null;
  arquivoNome?: string | null;
  videoUrl?: string | null;
  imagens?: DestaqueImage[];
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export function DestaqueCard({
  titulo,
  subtitulo,
  descricao,
  link,
  arquivoUrl,
  arquivoNome,
  videoUrl,
  imagens = [],
  onEdit,
  onDelete,
  showActions = false,
}: DestaqueCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const hasImages = imagens.length > 0;
  const hasMultipleImages = imagens.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imagens.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imagens.length) % imagens.length);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url;
  };

  return (
    <>
      <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
        {/* Galeria de Imagens */}
        {hasImages && (
          <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img
              src={imagens[currentImageIndex].url}
              alt={imagens[currentImageIndex].legenda || titulo}
              className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
              onClick={() => setLightboxOpen(true)}
            />
            
            {/* Navegação de imagens */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Indicadores */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {imagens.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex 
                          ? "bg-white w-4" 
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Badge de quantidade de imagens */}
            {hasMultipleImages && (
              <Badge className="absolute top-3 right-3 bg-black/60 text-white border-0">
                <ImageIcon className="w-3 h-3 mr-1" />
                {imagens.length}
              </Badge>
            )}

            {/* Legenda da imagem */}
            {imagens[currentImageIndex].legenda && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-sm truncate">{imagens[currentImageIndex].legenda}</p>
              </div>
            )}
          </div>
        )}

        {/* Vídeo se não houver imagens */}
        {!hasImages && videoUrl && (
          <div className="relative aspect-video overflow-hidden bg-slate-900">
            <iframe
              src={getYouTubeEmbedUrl(videoUrl)}
              title={titulo}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Placeholder se não houver mídia */}
        {!hasImages && !videoUrl && (
          <div className="aspect-video bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <div className="text-center text-white">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm opacity-75">Sem imagem</p>
            </div>
          </div>
        )}

        <CardContent className="p-5">
          {/* Título e Subtítulo */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-foreground line-clamp-2">{titulo}</h3>
            {subtitulo && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{subtitulo}</p>
            )}
          </div>

          {/* Descrição */}
          {descricao && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{descricao}</p>
          )}

          {/* Links e Ações */}
          <div className="flex flex-wrap gap-2">
            {link && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => window.open(link, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                Acessar
              </Button>
            )}

            {arquivoUrl && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => window.open(arquivoUrl, "_blank")}
              >
                <Download className="w-4 h-4" />
                {arquivoNome || "Baixar"}
              </Button>
            )}

            {videoUrl && hasImages && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => window.open(videoUrl, "_blank")}
              >
                <Play className="w-4 h-4" />
                Vídeo
              </Button>
            )}
          </div>

          {/* Ações de edição */}
          {showActions && (onEdit || onDelete) && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" size="sm" onClick={onDelete} className="flex-1">
                  Excluir
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      {lightboxOpen && hasImages && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative max-w-5xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={imagens[currentImageIndex].url}
              alt={imagens[currentImageIndex].legenda || titulo}
              className="w-full h-full object-contain"
            />

            {hasMultipleImages && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Contador e legenda */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
              {hasMultipleImages && (
                <p className="text-white/80 text-sm mb-1">
                  {currentImageIndex + 1} / {imagens.length}
                </p>
              )}
              {imagens[currentImageIndex].legenda && (
                <p className="text-white text-base">{imagens[currentImageIndex].legenda}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DestaqueCard;
