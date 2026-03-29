import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "./Timeline";
import ImageGallery from "./ImageGallery";
import { 
  MapPin, 
  Calendar, 
  User, 
  Clock, 
  FileText, 
  Eye, 
  Edit, 
  Trash2,
  ChevronDown,
  ChevronUp,
  Hash,
  Share2,
  FileDown,
  Users
} from "lucide-react";
import { useState } from "react";

interface ProtocolCardProps {
  protocolo: string;
  titulo: string;
  subtitulo?: string | null;
  descricao?: string | null;
  observacoes?: string | null;
  status: string;
  prioridade?: string | null;
  responsavelNome?: string | null;
  localizacao?: string | null;
  dataAgendada?: Date | string | null;
  dataRealizada?: Date | string | null;
  createdAt: Date | string;
  imagens?: { id: number; url: string; legenda?: string | null }[];
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onShareEquipe?: () => void;
  onPdf?: () => void;
  tipo?: string | null;
  categoria?: string | null;
  extra?: React.ReactNode;
}

const formatDate = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (date: Date | string | null | undefined) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function ProtocolCard({
  protocolo,
  titulo,
  subtitulo,
  descricao,
  observacoes,
  status,
  prioridade,
  responsavelNome,
  localizacao,
  dataAgendada,
  dataRealizada,
  createdAt,
  imagens = [],
  onView,
  onEdit,
  onDelete,
  onShare,
  onShareEquipe,
  onPdf,
  tipo,
  categoria,
  extra,
}: ProtocolCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-white border-l-4 border-l-purple-500 rounded-xl">
      <CardHeader className="pb-2 bg-gradient-to-r from-slate-50/80 to-white">
        <div className="space-y-2">
          {/* Linha do protocolo, status e ações */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-mono bg-muted px-2 py-0.5 rounded">
                <Hash className="h-3 w-3" />
                {protocolo}
              </span>
              {onShareEquipe && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onShareEquipe} 
                  title="Compartilhar com Equipe" 
                  className="gap-1 text-orange-600 border-orange-200 hover:bg-orange-50 h-6 rounded-full px-2"
                >
                  <Users className="h-3 w-3" />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-0.5">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onView}
                  title="Ver detalhes"
                  className="gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 font-semibold px-3 h-7 mr-1"
                >
                  <Eye className="h-3.5 w-3.5" />
                  VER
                </Button>
              )}
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={onEdit} title="Editar" className="h-7 w-7">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
              )}
              {onDelete && (
                <Button variant="ghost" size="icon" onClick={onDelete} title="Excluir" className="text-destructive h-7 w-7">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
              {onShare && (
                <Button variant="ghost" size="icon" onClick={onShare} title="Compartilhar via WhatsApp" className="text-green-600 hover:text-green-700 hover:bg-green-50 h-7 w-7">
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
              )}
              {onPdf && (
                <Button variant="ghost" size="sm" onClick={onPdf} title="Gerar PDF" className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-0.5 h-7 px-1.5">
                  <FileDown className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">PDF</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Linha do status e prioridade */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={status} />
            {prioridade && <PriorityBadge priority={prioridade} />}
          </div>
          
          {/* Título e subtítulo */}
          <div className="cursor-pointer" onClick={onView}>
            <CardTitle className="text-base line-clamp-2 hover:text-blue-600 transition-colors">{titulo}</CardTitle>
            {subtitulo && (
              <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{subtitulo}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Informações principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
          {responsavelNome && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{responsavelNome}</span>
            </div>
          )}
          {localizacao && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{localizacao}</span>
            </div>
          )}
          {dataAgendada && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{formatDate(dataAgendada)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>

        {/* Tags de tipo/categoria */}
        {(tipo || categoria) && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {tipo && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                {tipo}
              </span>
            )}
            {categoria && (
              <span className="text-xs bg-secondary/50 text-secondary-foreground px-2 py-0.5 rounded">
                {categoria}
              </span>
            )}
          </div>
        )}

        {/* Galeria de imagens */}
        {imagens.length > 0 && (
          <div className="mb-3">
            <ImageGallery
              images={imagens.map((img) => ({ id: img.id, url: img.url, legenda: img.legenda || undefined }))}
              columns={4}
            />
          </div>
        )}

        {/* Descrição expandível */}
        {(descricao || observacoes) && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
              onClick={() => setExpanded(!expanded)}
            >
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {expanded ? "Ocultar detalhes" : "Ver detalhes"}
              </span>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {expanded && (
              <div className="mt-2 space-y-2 text-sm border-t pt-2">
                {descricao && (
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1">
                      Descrição
                    </p>
                    <p className="whitespace-pre-wrap">{descricao}</p>
                  </div>
                )}
                {observacoes && (
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1">
                      Observações
                    </p>
                    <p className="whitespace-pre-wrap">{observacoes}</p>
                  </div>
                )}
                {dataRealizada && (
                  <div>
                    <p className="font-medium text-xs text-muted-foreground mb-1">
                      Data Realizada
                    </p>
                    <p>{formatDateTime(dataRealizada)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Conteúdo extra */}
        {extra}
      </CardContent>
    </Card>
  );
}

// Componente de estatísticas
interface StatsCardsProps {
  stats: {
    total: number;
    pendentes: number;
    realizadas: number;
    finalizadas: number;
    requerAcao: number;
    reabertas?: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 p-3 shadow-lg">
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-2xl font-bold text-white">{stats.total}</p>
        <p className="text-xs text-slate-300">Total</p>
      </div>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 p-3 shadow-lg">
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-2xl font-bold text-white">{stats.pendentes}</p>
        <p className="text-xs text-amber-100">Pendentes</p>
      </div>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-3 shadow-lg">
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-2xl font-bold text-white">{stats.realizadas}</p>
        <p className="text-xs text-blue-100">Realizadas</p>
      </div>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-3 shadow-lg">
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-2xl font-bold text-white">{stats.finalizadas}</p>
        <p className="text-xs text-emerald-100">Finalizadas</p>
      </div>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-500 to-rose-600 p-3 shadow-lg">
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <p className="text-2xl font-bold text-white">{stats.requerAcao}</p>
        <p className="text-xs text-red-100">Ação Necessária</p>
      </div>
      {stats.reabertas !== undefined && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-3 shadow-lg">
          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <p className="text-2xl font-bold text-white">{stats.reabertas}</p>
          <p className="text-xs text-orange-100">Reabertas</p>
        </div>
      )}
    </div>
  );
}
