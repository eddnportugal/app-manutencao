import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  Loader2
} from "lucide-react";

interface OSComentariosProps {
  ordemServicoId: number;
  chatAtivo?: boolean;
}

interface Mensagem {
  id: number;
  ordemServicoId: number;
  remetenteId: number | null;
  remetenteNome: string;
  remetenteTipo: string | null;
  mensagem: string | null;
  anexoUrl: string | null;
  anexoNome: string | null;
  anexoTipo: string | null;
  anexoTamanho: number | null;
  createdAt: Date;
}

const tipoRemetenteConfig: Record<string, { label: string; color: string }> = {
  sindico: { label: "Gestor", color: "bg-orange-100 text-orange-700" },
  morador: { label: "Equipe", color: "bg-blue-100 text-blue-700" },
  funcionario: { label: "Funcionário", color: "bg-green-100 text-green-700" },
  visitante: { label: "Visitante", color: "bg-gray-100 text-gray-700" },
};

function formatarData(data: Date | string): string {
  const d = new Date(data);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);

  const isHoje = d.toDateString() === hoje.toDateString();
  const isOntem = d.toDateString() === ontem.toDateString();

  const hora = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (isHoje) return `Hoje às ${hora}`;
  if (isOntem) return `Ontem às ${hora}`;

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarTamanho(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getIniciais(nome: string): string {
  return nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AnexoPreview({ anexo }: { anexo: { url: string; nome: string; tipo: string | null; tamanho: number | null } }) {
  const isImage = anexo.tipo?.startsWith("image/");
  const isPdf = anexo.tipo === "application/pdf";

  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-lg border">
      {isImage ? (
        <a href={anexo.url} target="_blank" rel="noopener noreferrer" className="block">
          <img
            src={anexo.url}
            alt={anexo.nome}
            className="max-w-[200px] max-h-[150px] rounded object-cover hover:opacity-80 transition-opacity"
          />
        </a>
      ) : (
        <a
          href={anexo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          {isPdf ? <FileText className="h-4 w-4" /> : <Paperclip className="h-4 w-4" />}
          <span className="truncate max-w-[150px]">{anexo.nome}</span>
          {anexo.tamanho && <span className="text-gray-500">({formatarTamanho(anexo.tamanho)})</span>}
          <Download className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

export default function OSComentarios({ ordemServicoId, chatAtivo = true }: OSComentariosProps) {
  const [novaMensagem, setNovaMensagem] = useState("");
  const [anexo, setAnexo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();

  // Buscar mensagens
  const { data: mensagens, isLoading, error } = trpc.ordensServico.getChat.useQuery(
    { ordemServicoId },
    { 
      refetchInterval: 10000, // Atualizar a cada 10 segundos
      enabled: chatAtivo 
    }
  );

  // Enviar mensagem
  const sendMutation = trpc.ordensServico.sendMessage.useMutation({
    onSuccess: () => {
      setNovaMensagem("");
      setAnexo(null);
      utils.ordensServico.getChat.invalidate({ ordemServicoId });
      toast.success("Mensagem enviada!");
    },
    onError: (error) => {
      toast.error(`Erro ao enviar: ${error.message}`);
    },
  });

  // Scroll para o final quando novas mensagens chegarem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens]);

  // Upload de anexo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    setAnexo(file);
  };

  const handleEnviar = async () => {
    if (!novaMensagem.trim() && !anexo) {
      toast.error("Digite uma mensagem ou anexe um arquivo");
      return;
    }

    let anexoUrl: string | undefined;
    let anexoNome: string | undefined;
    let anexoTipo: string | undefined;
    let anexoTamanho: number | undefined;

    // Fazer upload do anexo se houver
    if (anexo) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", anexo);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Erro ao fazer upload");

        const data = await response.json();
        anexoUrl = data.url;
        anexoNome = anexo.name;
        anexoTipo = anexo.type;
        anexoTamanho = anexo.size;
      } catch (error) {
        toast.error("Erro ao enviar arquivo");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    sendMutation.mutate({
      ordemServicoId,
      mensagem: novaMensagem.trim() || undefined,
      anexoUrl,
      anexoNome,
      anexoTipo,
      anexoTamanho,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  if (!chatAtivo) {
    return (
      <Card className="border-orange-200">
        <CardContent className="p-6 text-center text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p>Comentários desativados para esta OS</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-orange-500" />
          Comentários e Histórico
          {mensagens && mensagens.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {mensagens.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Lista de mensagens */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto mb-4 pr-2">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">
              Erro ao carregar comentários
            </div>
          ) : mensagens && mensagens.length > 0 ? (
            mensagens.map((msg: Mensagem) => {
              const tipoConfig = tipoRemetenteConfig[msg.remetenteTipo || "visitante"];
              return (
                <div key={msg.id} className="flex gap-3">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback className="bg-orange-100 text-orange-700 text-sm">
                      {getIniciais(msg.remetenteNome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{msg.remetenteNome}</span>
                      <Badge variant="outline" className={`text-xs ${tipoConfig.color}`}>
                        {tipoConfig.label}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatarData(msg.createdAt)}
                      </span>
                    </div>
                    {msg.mensagem && (
                      <p className="mt-1 text-gray-700 whitespace-pre-wrap break-words">
                        {msg.mensagem}
                      </p>
                    )}
                    {msg.anexoUrl && msg.anexoNome && (
                      <AnexoPreview
                        anexo={{
                          url: msg.anexoUrl,
                          nome: msg.anexoNome,
                          tipo: msg.anexoTipo,
                          tamanho: msg.anexoTamanho,
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhum comentário ainda</p>
              <p className="text-sm">Seja o primeiro a comentar!</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulário de nova mensagem */}
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="Digite seu comentário..."
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[80px] resize-none"
                disabled={sendMutation.isPending || uploading}
              />
              {anexo && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                  <Paperclip className="h-4 w-4 text-orange-500" />
                  <span className="text-sm truncate flex-1">{anexo.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAnexo(null)}
                    className="h-6 px-2 text-gray-500 hover:text-red-500"
                  >
                    ✕
                  </Button>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={sendMutation.isPending || uploading}
                title="Anexar arquivo"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleEnviar}
                disabled={sendMutation.isPending || uploading || (!novaMensagem.trim() && !anexo)}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {sendMutation.isPending || uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Pressione Enter para enviar ou Shift+Enter para nova linha
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
