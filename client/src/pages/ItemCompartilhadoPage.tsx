import { useState } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Loader2, Calendar, MapPin, User, AlertTriangle, CheckCircle, Clock, FileText, Image as ImageIcon, Lock, Unlock, Share2, Copy, Check, MessageCircle } from "lucide-react";
import { Timeline } from "@/components/Timeline";
import ImageGallery from "@/components/ImageGallery";
import { ComentariosSection } from "@/components/ComentariosSection";

export function ItemCompartilhadoPage() {
  const params = useParams<{ tipo: string; token: string }>();
  const { tipo, token } = params;
  const [copied, setCopied] = useState(false);
  
  // Função para copiar link
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Função para compartilhar via WhatsApp
  const handleShareWhatsApp = () => {
    const url = window.location.href;
    const message = encodeURIComponent(
      `*${getTipoLabel()}*\n\n` +
      `${(data?.item as { titulo?: string })?.titulo || "Item"}\n\n` +
      `Acesse: ${url}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  // Buscar dados baseado no tipo
  const vistoriaQuery = trpc.itemCompartilhado.getVistoria.useQuery(
    { token: token || "" },
    { enabled: tipo === "vistoria" && !!token }
  );
  const manutencaoQuery = trpc.itemCompartilhado.getManutencao.useQuery(
    { token: token || "" },
    { enabled: tipo === "manutencao" && !!token }
  );
  const ocorrenciaQuery = trpc.itemCompartilhado.getOcorrencia.useQuery(
    { token: token || "" },
    { enabled: tipo === "ocorrencia" && !!token }
  );
  const checklistQuery = trpc.itemCompartilhado.getChecklist.useQuery(
    { token: token || "" },
    { enabled: tipo === "checklist" && !!token }
  );

  const isLoading = vistoriaQuery.isLoading || manutencaoQuery.isLoading || ocorrenciaQuery.isLoading || checklistQuery.isLoading;
  
  const data = tipo === "vistoria" ? vistoriaQuery.data
    : tipo === "manutencao" ? manutencaoQuery.data
    : tipo === "ocorrencia" ? ocorrenciaQuery.data
    : tipo === "checklist" ? checklistQuery.data
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!data || !data.item) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h2 className="text-xl font-semibold mb-2">Link Inválido ou Expirado</h2>
            <p className="text-muted-foreground">
              Este link de compartilhamento não existe ou já expirou.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const item = data.item;
  const imagens = data.imagens || [];
  const timeline = data.timeline || [];
  const editavel = data.editavel;

  const getTipoLabel = () => {
    const labels: Record<string, string> = {
      vistoria: "Vistoria",
      manutencao: "Manutenção",
      ocorrencia: "Ocorrência",
      checklist: "Checklist",
    };
    return labels[tipo || ""] || "Item";
  };

  const getTipoColor = () => {
    const colors: Record<string, string> = {
      vistoria: "from-blue-500 to-indigo-500",
      manutencao: "from-amber-500 to-orange-500",
      ocorrencia: "from-red-500 to-rose-500",
      checklist: "from-emerald-500 to-teal-500",
    };
    return colors[tipo || ""] || "from-gray-500 to-slate-500";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: "bg-yellow-100 text-yellow-800 border-yellow-200",
      realizada: "bg-blue-100 text-blue-800 border-blue-200",
      acao_necessaria: "bg-red-100 text-red-800 border-red-200",
      finalizada: "bg-green-100 text-green-800 border-green-200",
      reaberta: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getTipoColor()} text-white py-8 px-4`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {getTipoLabel()}
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 flex items-center gap-1">
              {editavel ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {editavel ? "Editável" : "Visualização"}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {(item as { titulo?: string }).titulo || "Sem título"}
          </h1>
          {(item as { subtitulo?: string }).subtitulo && (
            <p className="text-white/80">{(item as { subtitulo?: string }).subtitulo}</p>
          )}
          {/* Botões de Compartilhamento */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              onClick={handleCopyLink}
              className="bg-white/20 hover:bg-white/30 text-white border-0 gap-2 backdrop-blur-sm"
              size="sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Link
                </>
              )}
            </Button>
            <Button
              onClick={handleShareWhatsApp}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 gap-2 shadow-lg"
              size="sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/80">
            {(item as { protocolo?: string }).protocolo && (
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {(item as { protocolo?: string }).protocolo}
              </span>
            )}
            {(item as { responsavel?: string }).responsavel && (
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {(item as { responsavel?: string }).responsavel}
              </span>
            )}
            {(item as { localizacao?: string }).localizacao && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {(item as { localizacao?: string }).localizacao}
              </span>
            )}
            {(item as { dataAgendada?: Date }).dataAgendada && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate((item as { dataAgendada?: Date }).dataAgendada!)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 -mt-4 space-y-6">
        {/* Status e Prioridade */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              {(item as { status?: string }).status && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Status</span>
                  <Badge className={getStatusColor((item as { status?: string }).status || "")}>
                    {((item as { status?: string }).status || "").replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              )}
              {(item as { prioridade?: string }).prioridade && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Prioridade</span>
                  <Badge variant="outline">
                    {(item as { prioridade?: string }).prioridade}
                  </Badge>
                </div>
              )}
              {(item as { categoria?: string }).categoria && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">Categoria</span>
                  <Badge variant="outline">
                    {(item as { categoria?: string }).categoria}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Observações */}
        {(item as { observacoes?: string }).observacoes && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {(item as { observacoes?: string }).observacoes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Itens do Checklist */}
        {tipo === "checklist" && (data as { itens?: Array<{ id: number; descricao: string; completo: boolean }> }).itens && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Itens do Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {((data as { itens?: Array<{ id: number; descricao: string; completo: boolean }> }).itens || []).map((checkItem) => (
                  <div
                    key={checkItem.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      checkItem.completo
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-slate-50 dark:bg-slate-800"
                    }`}
                  >
                    {checkItem.completo ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-slate-400" />
                    )}
                    <span className={checkItem.completo ? "line-through text-muted-foreground" : ""}>
                      {checkItem.descricao}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Galeria de Imagens */}
        {imagens.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Imagens ({imagens.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageGallery
                images={imagens.map((img: { url: string; legenda?: string | null }) => ({
                  url: img.url,
                  legenda: img.legenda || undefined,
                }))}
              />
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {timeline.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline
                events={timeline.map((evento: { id?: number; tipo: string; descricao: string; createdAt: Date; userNome?: string | null }, index: number) => ({
                  id: evento.id || index,
                  tipo: evento.tipo,
                  descricao: evento.descricao,
                  createdAt: evento.createdAt,
                  userNome: evento.userNome,
                }))}
              />
            </CardContent>
          </Card>
        )}

        {/* Secção de Comentários */}
        <Card>
          <CardContent className="pt-6">
            <ComentariosSection
              itemId={item.id}
              itemTipo={tipo as "vistoria" | "manutencao" | "ocorrencia" | "checklist"}
              condominioId={item.condominioId}
              editavel={editavel}
            />
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-muted-foreground">
        <p>Compartilhado via App Manutenção</p>
      </div>
    </div>
  );
}
