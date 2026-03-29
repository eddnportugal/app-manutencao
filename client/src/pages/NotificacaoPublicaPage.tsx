import { useState, useEffect, useRef } from "react";
import { useParams, useSearch } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";
import { 
  AlertTriangle, 
  Building2, 
  Home, 
  Calendar, 
  User,
  Send,
  Image as ImageIcon,
  Plus,
  X,
  Loader2,
  MessageCircle,
  Clock,
  CheckCircle,
  FileText,
  Printer
} from "lucide-react";

export default function NotificacaoPublicaPage() {
  const params = useParams<{ token: string }>();
  const token = params.token || "";
  const searchParams = new URLSearchParams(window.location.search);
  const shouldPrint = searchParams.get("print") === "true";

  const [mensagem, setMensagem] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Query para buscar notificação
  const { data, isLoading, error, refetch } = trpc.notificacoesInfracao.getByToken.useQuery(
    { token },
    { enabled: !!token }
  );

  // Query para buscar respostas
  const { data: respostas, refetch: refetchRespostas } = trpc.respostasInfracao.list.useQuery(
    { notificacaoId: data?.notificacao?.id || 0 },
    { enabled: !!data?.notificacao?.id }
  );

  // Mutation para enviar resposta
  const enviarRespostaMutation = trpc.respostasInfracao.createMorador.useMutation({
    onSuccess: () => {
      toast.success("Resposta enviada com sucesso!");
      setMensagem("");
      setImagens([]);
      refetchRespostas();
    },
    onError: (error) => {
      toast.error(`Erro ao enviar resposta: ${error.message}`);
    },
  });

  // Auto-scroll para o final da timeline
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [respostas]);

  // Auto-print se parâmetro estiver presente
  useEffect(() => {
    if (shouldPrint && data) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [shouldPrint, data]);

  // Upload de imagem
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setImagens(prev => [...prev, base64]);
        };
        reader.readAsDataURL(file);
      }
      toast.success("Imagem(ns) adicionada(s)!");
    } catch (error) {
      toast.error("Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
  };

  // Remover imagem
  const handleRemoveImage = (index: number) => {
    setImagens(prev => prev.filter((_, i) => i !== index));
  };

  // Enviar resposta
  const handleEnviarResposta = () => {
    if (!mensagem.trim()) {
      toast.error("Digite uma mensagem");
      return;
    }

    enviarRespostaMutation.mutate({
      token,
      mensagem: mensagem.trim(),
      imagens: imagens.length > 0 ? imagens : undefined,
    });
  };

  // Formatar data
  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pendente: { label: "Pendente", className: "bg-amber-100 text-amber-700", icon: Clock },
      respondida: { label: "Respondida", className: "bg-blue-100 text-blue-700", icon: MessageCircle },
      resolvida: { label: "Resolvida", className: "bg-green-100 text-green-700", icon: CheckCircle },
      arquivada: { label: "Arquivada", className: "bg-gray-100 text-gray-700", icon: FileText },
    };
    const config = statusConfig[status] || statusConfig.pendente;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Notificação não encontrada</h2>
            <p className="text-gray-500">
              O link que você acessou é inválido ou a notificação foi removida.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { notificacao, morador, tipoInfracao, condominio } = data;

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Header */}
      <div className="bg-white border-b print:border-b-2">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {condominio?.logoUrl && (
                <img 
                  src={condominio.logoUrl} 
                  alt={condominio.nome} 
                  className="h-12 w-12 object-contain"
                />
              )}
              <div>
                <h1 className="text-xl font-bold">{condominio?.nome}</h1>
                <p className="text-sm text-gray-500">Notificação de Infração</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="print:hidden"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Card Principal */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  {notificacao.titulo}
                </CardTitle>
                {tipoInfracao && (
                  <p className="text-sm text-gray-500 mt-1">
                    Tipo: {tipoInfracao.titulo}
                  </p>
                )}
              </div>
              {getStatusBadge(notificacao.status || "pendente")}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Dados do Morador */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Destinatário
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nome:</span>
                  <p className="font-medium">{morador?.nome}</p>
                </div>
                <div>
                  <span className="text-gray-500">Unidade:</span>
                  <p className="font-medium">
                    {morador?.bloco ? `Bloco ${morador.bloco} - ` : ""}
                    Apto {morador?.apartamento}
                  </p>
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div>
              <h3 className="font-medium mb-2">Descrição</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{notificacao.descricao}</p>
            </div>

            {/* Data da Ocorrência */}
            {notificacao.dataOcorrencia && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                Data da ocorrência: {formatDate(notificacao.dataOcorrencia)}
              </div>
            )}

            {/* Imagens */}
            {notificacao.imagens && (notificacao.imagens as string[]).length > 0 && (
              <div>
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Imagens Anexadas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(notificacao.imagens as string[]).map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Imagem ${index + 1}`}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Data de Registro */}
            <div className="text-xs text-gray-400 pt-4 border-t">
              Notificação registrada em {formatDate(notificacao.createdAt)}
            </div>
          </CardContent>
        </Card>

        {/* Timeline de Respostas */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Respostas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Lista de Respostas */}
            <div 
              ref={timelineRef}
              className="space-y-4 max-h-96 overflow-y-auto mb-6"
            >
              {respostas && respostas.length > 0 ? (
                respostas.map((resposta) => (
                  <div
                    key={resposta.id}
                    className={`flex ${resposta.autorTipo === 'morador' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        resposta.autorTipo === 'morador'
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {resposta.autorNome}
                        </span>
                        <span className="text-xs text-gray-500">
                          {resposta.autorTipo === 'sindico' ? '(Administração)' : '(Morador)'}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{resposta.mensagem}</p>
                      {resposta.imagens && (resposta.imagens as string[]).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(resposta.imagens as string[]).map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Anexo ${idx + 1}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(resposta.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma resposta ainda</p>
                  <p className="text-sm">Seja o primeiro a responder</p>
                </div>
              )}
            </div>

            {/* Formulário de Resposta */}
            {notificacao.status !== 'arquivada' && notificacao.status !== 'resolvida' && (
              <div className="border-t pt-4 space-y-3">
                <Textarea
                  placeholder="Digite sua resposta..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={3}
                />
                
                {/* Preview de Imagens */}
                {imagens.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {imagens.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Anexo ${index + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                        <button
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        {uploading ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <ImageIcon className="h-4 w-4 mr-1" />
                        )}
                        Anexar Imagem
                      </span>
                    </Button>
                  </label>
                  <Button
                    className="ml-auto"
                    onClick={handleEnviarResposta}
                    disabled={!mensagem.trim() || enviarRespostaMutation.isPending}
                  >
                    {enviarRespostaMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Enviar Resposta
                  </Button>
                </div>
              </div>
            )}

            {(notificacao.status === 'arquivada' || notificacao.status === 'resolvida') && (
              <div className="text-center py-4 text-gray-500 border-t">
                <p className="text-sm">
                  Esta notificação foi {notificacao.status === 'resolvida' ? 'resolvida' : 'arquivada'} 
                  e não aceita mais respostas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Versão para Impressão */}
        <div className="hidden print:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Respostas</CardTitle>
            </CardHeader>
            <CardContent>
              {respostas && respostas.length > 0 ? (
                <div className="space-y-4">
                  {respostas.map((resposta) => (
                    <div key={resposta.id} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{resposta.autorNome}</span>
                        <span className="text-gray-500">
                          ({resposta.autorTipo === 'sindico' ? 'Administração' : 'Morador'})
                        </span>
                        <span className="text-gray-400 text-sm ml-auto">
                          {formatDate(resposta.createdAt)}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{resposta.mensagem}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma resposta registrada.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer para impressão */}
      <div className="hidden print:block mt-8 text-center text-xs text-gray-400">
        <p>Documento gerado em {new Date().toLocaleDateString("pt-BR")}</p>
        <p>{condominio?.nome}</p>
      </div>
    </div>
  );
}
