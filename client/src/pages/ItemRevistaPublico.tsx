import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Wrench,
  Search,
  AlertTriangle,
  ClipboardCheck,
  ArrowLeftRight,
  Calendar,
  MapPin,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ShieldAlert,
  Image as ImageIcon,
  BookOpen,
} from "lucide-react";

export default function ItemRevistaPublico() {
  const params = useParams<{ shareLink: string; tipo: string; itemId: string }>();
  const tipo = params.tipo as "manutencao" | "vistoria" | "ocorrencia" | "checklist" | "antes_depois";
  const itemId = parseInt(params.itemId || "0");

  const { data, isLoading, error } = trpc.revista.getPublicItem.useQuery(
    { shareLink: params.shareLink || "", tipo, itemId },
    { enabled: !!params.shareLink && !!tipo && itemId > 0 }
  );

  const getTipoConfig = () => {
    switch (tipo) {
      case "manutencao":
        return {
          icon: <Wrench className="w-6 h-6" />,
          label: "Manutenção",
          color: "from-slate-500 to-slate-700",
          borderColor: "border-slate-500",
          bgLight: "bg-slate-50",
          textColor: "text-slate-700",
        };
      case "vistoria":
        return {
          icon: <Search className="w-6 h-6" />,
          label: "Vistoria",
          color: "from-emerald-500 to-emerald-700",
          borderColor: "border-emerald-500",
          bgLight: "bg-emerald-50",
          textColor: "text-emerald-700",
        };
      case "ocorrencia":
        return {
          icon: <AlertTriangle className="w-6 h-6" />,
          label: "Ocorrência",
          color: "from-amber-500 to-amber-700",
          borderColor: "border-amber-500",
          bgLight: "bg-amber-50",
          textColor: "text-amber-700",
        };
      case "checklist":
        return {
          icon: <ClipboardCheck className="w-6 h-6" />,
          label: "Checklist",
          color: "from-teal-500 to-teal-700",
          borderColor: "border-teal-500",
          bgLight: "bg-teal-50",
          textColor: "text-teal-700",
        };
      case "antes_depois":
        return {
          icon: <ArrowLeftRight className="w-6 h-6" />,
          label: "Antes e Depois",
          color: "from-purple-500 to-pink-600",
          borderColor: "border-purple-500",
          bgLight: "bg-purple-50",
          textColor: "text-purple-700",
        };
      default:
        return {
          icon: <FileText className="w-6 h-6" />,
          label: "Registro",
          color: "from-gray-500 to-gray-700",
          borderColor: "border-gray-500",
          bgLight: "bg-gray-50",
          textColor: "text-gray-700",
        };
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("conclu") || s.includes("finaliz") || s.includes("realizada") || s.includes("aprovada") || s.includes("resolvida")) {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />{formatStatus(status)}</Badge>;
    }
    if (s.includes("andamento") || s.includes("analise") || s.includes("pendente")) {
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />{formatStatus(status)}</Badge>;
    }
    if (s.includes("cancel") || s.includes("reprovad")) {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />{formatStatus(status)}</Badge>;
    }
    return <Badge variant="secondary">{formatStatus(status)}</Badge>;
  };

  const formatStatus = (status: string) => {
    return status?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "—";
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };

  const config = getTipoConfig();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!data || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold text-foreground mb-2">Item não encontrado</h2>
            <p className="text-muted-foreground mb-1">
              Este link pode ter expirado ou o item não está disponível.
            </p>
            <p className="text-sm text-muted-foreground">
              Se acredita que isto é um erro, entre em contato com o administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const item = data.item;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.color} text-white`}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              {config.icon}
            </div>
            <div>
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">{config.label}</span>
              <p className="text-xs text-white/60 font-mono">{item.protocolo}</p>
            </div>
          </div>
          <h1 className="text-xl font-bold mt-3">{item.titulo}</h1>
          {data.condominio && (
            <p className="text-sm text-white/70 mt-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {data.condominio.nome} — {data.revista?.titulo}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Status card */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Status</span>
                <div className="mt-1">{getStatusBadge(item.status)}</div>
              </div>
              {item.prioridade && (
                <div className="text-right">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Prioridade</span>
                  <p className={`font-semibold capitalize mt-1 ${
                    item.prioridade === "alta" || item.prioridade === "urgente" ? "text-red-600" :
                    item.prioridade === "media" ? "text-yellow-600" : "text-blue-600"
                  }`}>{item.prioridade}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details card */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            {item.descricao && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Descrição</h3>
                <p className="text-foreground whitespace-pre-wrap">{item.descricao}</p>
              </div>
            )}
            
            {item.observacoes && (
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Observações</h3>
                <p className="text-foreground whitespace-pre-wrap">{item.observacoes}</p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              {item.localizacao && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground">Local</span>
                    <p className="text-sm font-medium">{item.localizacao}</p>
                  </div>
                </div>
              )}
              {item.responsavelNome && (
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground">Responsável</span>
                    <p className="text-sm font-medium">{item.responsavelNome}</p>
                  </div>
                </div>
              )}
              {(item.tipo || item.categoria) && (
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground">Tipo</span>
                    <p className="text-sm font-medium capitalize">{item.tipo || item.categoria}</p>
                  </div>
                </div>
              )}
              {(item.createdAt || item.dataAgendada || item.dataOcorrencia) && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground">Data</span>
                    <p className="text-sm font-medium">{formatDate(item.dataAgendada || item.dataOcorrencia || item.createdAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Antes e Depois photos */}
        {tipo === "antes_depois" && (item.fotoAntesUrl || item.fotoDepoisUrl) && (
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Comparativo
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-xs text-center text-muted-foreground uppercase tracking-wider font-medium">Antes</div>
                  {item.fotoAntesUrl ? (
                    <img
                      src={item.fotoAntesUrl}
                      alt={`${item.titulo} - Antes`}
                      className="w-full aspect-square object-cover rounded-lg border-2 border-red-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-red-100 to-red-50 rounded-lg border-2 border-red-200 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-red-300" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-center text-muted-foreground uppercase tracking-wider font-medium">Depois</div>
                  {item.fotoDepoisUrl ? (
                    <img
                      src={item.fotoDepoisUrl}
                      alt={`${item.titulo} - Depois`}
                      className="w-full aspect-square object-cover rounded-lg border-2 border-emerald-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg border-2 border-emerald-200 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-emerald-300" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Checklist items */}
        {tipo === "checklist" && data.checklistItens && data.checklistItens.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Itens do Checklist ({data.checklistItens.filter((i: any) => i.completo).length}/{data.checklistItens.length})
              </h3>
              <div className="space-y-2">
                {data.checklistItens.map((ci: any) => (
                  <div key={ci.id} className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      ci.completo ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                    }`}>
                      {ci.completo ? <CheckCircle className="w-3.5 h-3.5" /> : <div className="w-3 h-3 rounded-sm border-2 border-gray-300" />}
                    </div>
                    <div>
                      <p className={`text-sm ${ci.completo ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {ci.descricao}
                      </p>
                      {ci.observacao && (
                        <p className="text-xs text-muted-foreground mt-0.5">{ci.observacao}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progresso</span>
                  <span>{Math.round((data.checklistItens.filter((i: any) => i.completo).length / data.checklistItens.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${(data.checklistItens.filter((i: any) => i.completo).length / data.checklistItens.length) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Images */}
        {data.imagens && data.imagens.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" />
                Imagens ({data.imagens.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {data.imagens.map((img: any) => (
                  <div key={img.id} className="relative rounded-lg overflow-hidden aspect-square bg-gray-100">
                    <img
                      src={img.url}
                      alt={img.legenda || "Imagem"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {img.legenda && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1.5 truncate">
                        {img.legenda}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {data.timeline && data.timeline.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Histórico
              </h3>
              <div className="space-y-3">
                {data.timeline.slice(0, 10).map((event: any) => (
                  <div key={event.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="w-px flex-1 bg-border" />
                    </div>
                    <div className="pb-3">
                      <p className="text-sm text-foreground">{event.descricao}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {event.userNome && <span className="text-xs text-muted-foreground">{event.userNome}</span>}
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer notice */}
        <div className="text-center py-6 text-xs text-muted-foreground">
          <p>Este é um link de visualização restrita.</p>
          <p>Apenas este item está disponível para consulta.</p>
        </div>
      </div>
    </div>
  );
}
