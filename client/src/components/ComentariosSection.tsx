import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { prepareImageForUpload } from "@/lib/imageCompressor";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { 
  MessageSquare, 
  Paperclip, 
  Send, 
  Image as ImageIcon, 
  FileText, 
  Download,
  Reply,
  Trash2,
  Check,
  Clock,
  X,
  Upload
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface ComentariosSectionProps {
  itemId: number;
  itemTipo: "vistoria" | "manutencao" | "ocorrencia" | "checklist";
  condominioId: number;
  editavel?: boolean;
  autorPadrao?: {
    nome: string;
    whatsapp?: string;
    email?: string;
    foto?: string;
  };
}

interface Anexo {
  url: string;
  nome: string;
  tipo: string;
  tamanho?: number;
}

export function ComentariosSection({ 
  itemId, 
  itemTipo, 
  condominioId, 
  editavel = true,
  autorPadrao 
}: ComentariosSectionProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [novoComentario, setNovoComentario] = useState("");
  const [autorNome, setAutorNome] = useState(autorPadrao?.nome || "");
  const [autorWhatsapp, setAutorWhatsapp] = useState(autorPadrao?.whatsapp || "");
  const [autorEmail, setAutorEmail] = useState(autorPadrao?.email || "");
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [respondendoA, setRespondendoA] = useState<number | null>(null);
  const [respostaTexto, setRespostaTexto] = useState("");

  const { data: comentarios, refetch } = trpc.comentario.list.useQuery({
    itemId,
    itemTipo,
  });

  const criarComentario = trpc.comentario.create.useMutation({
    onSuccess: () => {
      toast.success("Comentário adicionado com sucesso!");
      setNovoComentario("");
      setAnexos([]);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao adicionar comentário: " + error.message);
    },
  });

  const responderComentario = trpc.comentario.responder.useMutation({
    onSuccess: () => {
      toast.success("Resposta adicionada com sucesso!");
      setRespondendoA(null);
      setRespostaTexto("");
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao responder: " + error.message);
    },
  });

  const excluirComentario = trpc.comentario.delete.useMutation({
    onSuccess: () => {
      // Comentário excluído
      refetch();
    },
  });

  const marcarLido = trpc.comentario.marcarLido.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const uploadFileMutation = trpc.upload.file.useMutation();
  const uploadImageMutation = trpc.upload.image.useMutation();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        // Comprimir imagens antes do upload
        const isImage = file.type.startsWith('image/');
        const base64 = isImage
          ? await prepareImageForUpload(file, "quarterA4")
          : await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            });

        try {
          const result = isImage
            ? await uploadImageMutation.mutateAsync({
                fileName: file.name,
                fileType: file.type,
                fileData: base64,
                folder: "comentarios",
              })
            : await uploadFileMutation.mutateAsync({
                fileName: file.name,
                fileType: file.type,
                fileData: base64,
                folder: "comentarios",
              });

          setAnexos(prev => [...prev, {
            url: result.url,
            nome: file.name,
            tipo: file.type,
            tamanho: file.size,
          }]);
        } catch (err) {
          console.error(`Erro ao enviar ${file.name}:`, err);
          toast.error(`Erro ao enviar ${file.name}`);
        }
      }
    } catch (error) {
      toast.error("Erro ao carregar ficheiro");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removerAnexo = (index: number) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!novoComentario.trim() || !autorNome.trim()) {
      toast.error("Preencha o nome e o comentário");
      return;
    }

    criarComentario.mutate({
      itemId,
      itemTipo,
      condominioId,
      autorNome,
      autorWhatsapp: autorWhatsapp || undefined,
      autorEmail: autorEmail || undefined,
      autorFoto: autorPadrao?.foto,
      texto: novoComentario,
      anexos: anexos.length > 0 ? anexos : undefined,
    });
  };

  const handleResponder = (comentarioId: number) => {
    if (!respostaTexto.trim() || !autorNome.trim()) {
      toast.error("Preencha o nome e a resposta");
      return;
    }

    responderComentario.mutate({
      comentarioId,
      autorNome,
      autorFoto: autorPadrao?.foto,
      texto: respostaTexto,
    });
  };

  const formatarTamanho = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIconeAnexo = (tipo: string) => {
    if (tipo.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (tipo === "application/pdf") return <FileText className="h-4 w-4 text-red-500" />;
    return <FileText className="h-4 w-4" />;
  };

  const getInitials = (nome: string) => {
    return nome.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Comentários</h3>
        {comentarios && comentarios.length > 0 && (
          <Badge variant="secondary">{comentarios.length}</Badge>
        )}
      </div>

      {/* Formulário de novo comentário */}
      {editavel && (
        <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4 space-y-4">
            {/* Dados do autor */}
            {!autorPadrao?.nome && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="autorNome">Seu Nome *</Label>
                  <Input
                    id="autorNome"
                    value={autorNome}
                    onChange={(e) => setAutorNome(e.target.value)}
                    placeholder="Digite seu nome"
                  />
                </div>
                <div>
                  <Label htmlFor="autorWhatsapp">WhatsApp</Label>
                  <Input
                    id="autorWhatsapp"
                    value={autorWhatsapp}
                    onChange={(e) => setAutorWhatsapp(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <Label htmlFor="autorEmail">Email</Label>
                  <Input
                    id="autorEmail"
                    type="email"
                    value={autorEmail}
                    onChange={(e) => setAutorEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
            )}

            {/* Textarea do comentário */}
            <div>
              <Label htmlFor="comentario">Comentário *</Label>
              <Textarea
                id="comentario"
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                placeholder="Escreva seu comentário aqui..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Anexos selecionados */}
            {anexos.length > 0 && (
              <div className="space-y-2">
                <Label>Anexos ({anexos.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {anexos.map((anexo, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border"
                    >
                      {getIconeAnexo(anexo.tipo)}
                      <span className="text-sm truncate max-w-[150px]">{anexo.nome}</span>
                      <span className="text-xs text-gray-500">{formatarTamanho(anexo.tamanho)}</span>
                      <button
                        onClick={() => removerAnexo(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Upload className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Paperclip className="h-4 w-4 mr-2" />
                  )}
                  Anexar Ficheiro
                </Button>
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={criarComentario.isPending || !novoComentario.trim() || !autorNome.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {criarComentario.isPending ? (
                  <Upload className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Enviar Comentário
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de comentários */}
      <div className="space-y-4">
        {comentarios?.map((comentario) => (
          <Card key={comentario.id} className={`${!comentario.lido ? "border-l-4 border-l-blue-500" : ""}`}>
            <CardContent className="pt-4">
              {/* Header do comentário */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {comentario.autorFoto ? (
                      <AvatarImage src={comentario.autorFoto} />
                    ) : null}
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getInitials(comentario.autorNome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{comentario.autorNome}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      {format(new Date(comentario.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: pt })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {!comentario.lido && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      Novo
                    </Badge>
                  )}
                  {comentario.isInterno && (
                    <Badge variant="outline">Interno</Badge>
                  )}
                </div>
              </div>

              {/* Texto do comentário */}
              <p className="text-gray-700 whitespace-pre-wrap mb-3">{comentario.texto}</p>

              {/* Anexos */}
              {comentario.anexos && comentario.anexos.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-600 mb-2">Anexos:</p>
                  <div className="flex flex-wrap gap-2">
                    {comentario.anexos.map((anexo) => (
                      <a
                        key={anexo.id}
                        href={anexo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors"
                      >
                        {getIconeAnexo(anexo.tipo)}
                        <span className="text-sm">{anexo.nome}</span>
                        <Download className="h-3 w-3 text-gray-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Pré-visualização de imagens */}
              {comentario.anexos && comentario.anexos.filter(a => a.tipo.startsWith("image/")).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  {comentario.anexos.filter(a => a.tipo.startsWith("image/")).map((anexo) => (
                    <a
                      key={anexo.id}
                      href={anexo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={anexo.url}
                        alt={anexo.nome}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </a>
                  ))}
                </div>
              )}

              {/* Respostas */}
              {comentario.respostas && comentario.respostas.length > 0 && (
                <div className="ml-8 mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
                  {comentario.respostas.map((resposta) => (
                    <div key={resposta.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          {resposta.autorFoto ? (
                            <AvatarImage src={resposta.autorFoto} />
                          ) : null}
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {getInitials(resposta.autorNome)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{resposta.autorNome}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(resposta.createdAt), "dd/MM 'às' HH:mm", { locale: pt })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{resposta.texto}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                {editavel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRespondendoA(respondendoA === comentario.id ? null : comentario.id)}
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Responder
                  </Button>
                )}
                
                {!comentario.lido && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => marcarLido.mutate({ id: comentario.id })}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Marcar como lido
                  </Button>
                )}
              </div>

              {/* Formulário de resposta */}
              {respondendoA === comentario.id && editavel && (
                <div className="mt-4 ml-8 p-3 bg-gray-50 rounded-lg">
                  <Textarea
                    value={respostaTexto}
                    onChange={(e) => setRespostaTexto(e.target.value)}
                    placeholder="Escreva sua resposta..."
                    rows={2}
                    className="resize-none mb-2"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setRespondendoA(null);
                        setRespostaTexto("");
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResponder(comentario.id)}
                      disabled={responderComentario.isPending || !respostaTexto.trim()}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Enviar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Estado vazio */}
        {(!comentarios || comentarios.length === 0) && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhum comentário ainda</p>
            {editavel && (
              <p className="text-sm text-gray-400 mt-1">
                Seja o primeiro a comentar!
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
