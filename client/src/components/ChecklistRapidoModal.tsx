import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Send, 
  Camera, 
  MapPin, 
  FileText, 
  X, 
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  User,
  Clock,
  Trash2,
  AlertCircle
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";
import { prepareImageForUpload } from "@/lib/imageCompressor";

interface ChecklistRapidoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  condominioId: number;
  onSuccess?: () => void;
}

interface ItemChecklist {
  id: string;
  titulo: string;
  concluido: boolean;
  temProblema: boolean;
  problema?: {
    titulo: string;
    descricao: string;
    imagens: string[];
    status: string;
    prioridade: string;
    responsavel: string;
  };
}

interface ChecklistRapido {
  id: string;
  titulo: string;
  responsavel: string;
  localizacao: { lat: string; lng: string; endereco: string } | null;
  dataCriacao: string;
  horaCriacao: string;
  itens: ItemChecklist[];
}

export function ChecklistRapidoModal({
  open,
  onOpenChange,
  condominioId,
  onSuccess,
}: ChecklistRapidoModalProps) {
  const [checklists, setChecklists] = useState<ChecklistRapido[]>([]);
  const [checklistAtual, setChecklistAtual] = useState<ChecklistRapido | null>(null);
  const [novoItemTitulo, setNovoItemTitulo] = useState("");
  const [modalProblemaAberto, setModalProblemaAberto] = useState(false);
  const [itemProblemaId, setItemProblemaId] = useState<string | null>(null);
  const [problemaTitulo, setProblemaTitle] = useState("");
  const [problemaDescricao, setProblemaDescricao] = useState("");
  const [problemaImagens, setProblemaImagens] = useState<string[]>([]);
  const [problemaStatus, setProblemaStatus] = useState("pendente");
  const [problemaPrioridade, setProblemaPrioridade] = useState("media");
  const [localizacao, setLocalizacao] = useState<{ lat: string; lng: string; endereco: string } | null>(null);
  const [carregandoLocalizacao, setCarregandoLocalizacao] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = trpc.upload.image.useMutation();

  useEffect(() => {
    if (open && !checklistAtual) {
      capturarLocalizacao();
      criarNovoChecklist();
    }
  }, [open]);

  const capturarLocalizacao = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocalização não suportada");
      return;
    }

    setCarregandoLocalizacao(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toString();
        const lng = position.coords.longitude.toString();
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          setLocalizacao({
            lat,
            lng,
            endereco: data.display_name || `${lat}, ${lng}`,
          });
        } catch {
          setLocalizacao({ lat, lng, endereco: `${lat}, ${lng}` });
        }
        setCarregandoLocalizacao(false);
      },
      (error) => {
        console.warn("Erro ao obter localização:", error);
        setCarregandoLocalizacao(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const criarNovoChecklist = () => {
    const agora = new Date();
    const novoChecklist: ChecklistRapido = {
      id: `checklist-${Date.now()}`,
      titulo: "",
      responsavel: "",
      localizacao,
      dataCriacao: agora.toLocaleDateString("pt-BR"),
      horaCriacao: agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      itens: [],
    };
    setChecklistAtual(novoChecklist);
  };

  const adicionarItem = () => {
    if (!novoItemTitulo.trim()) {
      toast.error("Digite um título para o item");
      return;
    }

    if (!checklistAtual) return;

    const novoItem: ItemChecklist = {
      id: `item-${Date.now()}`,
      titulo: novoItemTitulo,
      concluido: false,
      temProblema: false,
    };

    setChecklistAtual({
      ...checklistAtual,
      itens: [...checklistAtual.itens, novoItem],
    });

    setNovoItemTitulo("");
  };

  const toggleItemConcluido = (itemId: string) => {
    if (!checklistAtual) return;

    setChecklistAtual({
      ...checklistAtual,
      itens: checklistAtual.itens.map((item) =>
        item.id === itemId ? { ...item, concluido: !item.concluido } : item
      ),
    });
  };

  const abrirModalProblema = (itemId: string) => {
    const item = checklistAtual?.itens.find((i) => i.id === itemId);
    if (!item) return;

    setItemProblemaId(itemId);
    setProblemaTitle(item.problema?.titulo || "");
    setProblemaDescricao(item.problema?.descricao || "");
    setProblemaImagens(item.problema?.imagens || []);
    setProblemaStatus(item.problema?.status || "pendente");
    setProblemaPrioridade(item.problema?.prioridade || "media");
    setModalProblemaAberto(true);
  };

  const salvarProblema = () => {
    if (!problemaTitulo.trim()) {
      toast.error("Digite um título para o problema");
      return;
    }

    if (!checklistAtual || !itemProblemaId) return;

    setChecklistAtual({
      ...checklistAtual,
      itens: checklistAtual.itens.map((item) =>
        item.id === itemProblemaId
          ? {
              ...item,
              temProblema: true,
              problema: {
                titulo: problemaTitulo,
                descricao: problemaDescricao,
                imagens: problemaImagens,
                status: problemaStatus,
                prioridade: problemaPrioridade,
                responsavel: checklistAtual.responsavel,
              },
            }
          : item
      ),
    });

    setModalProblemaAberto(false);
    setProblemaTitle("");
    setProblemaDescricao("");
    setProblemaImagens([]);
    setProblemaStatus("pendente");
    setProblemaPrioridade("media");
    setItemProblemaId(null);
    toast.success("Problema reportado!");
  };

  const removerItem = (itemId: string) => {
    if (!checklistAtual) return;

    setChecklistAtual({
      ...checklistAtual,
      itens: checklistAtual.itens.filter((item) => item.id !== itemId),
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const base64 = await prepareImageForUpload(file, "quarterA4");
        const result = await uploadImageMutation.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileData: base64,
          folder: "checklists",
        });
        setProblemaImagens((prev) => [...prev, result.url]);
      } catch (err) {
        console.error("Erro no upload:", err);
        toast.error(`Erro ao enviar ${file.name}`);
      }
    }
  };

  const removerImagem = (index: number) => {
    setProblemaImagens((prev) => prev.filter((_, i) => i !== index));
  };

  const salvarEReiniciar = async () => {
    if (!checklistAtual?.titulo.trim()) {
      toast.error("Digite um título para o checklist");
      return;
    }

    setSalvando(true);
    try {
      toast.success("Checklist salvo! Crie outro.", {
        description: `Checklist: ${checklistAtual.titulo}`,
      });

      setChecklists([...checklists, checklistAtual]);
      criarNovoChecklist();
    } catch (error) {
      toast.error("Erro ao salvar checklist");
    } finally {
      setSalvando(false);
    }
  };

  const enviarTodos = async () => {
    if (checklistAtual?.titulo.trim() || checklistAtual?.itens.length) {
      await salvarEReiniciar();
    }

    setEnviando(true);
    try {
      toast.success("Todos os checklists foram enviados!", {
        description: "Os checklists foram salvos com sucesso.",
      });

      setChecklists([]);
      criarNovoChecklist();
      onSuccess?.();
    } catch (error) {
      toast.error("Erro ao enviar checklists");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[92vw] max-w-md max-h-[85vh] overflow-y-auto p-0 gap-0 border-0 shadow-2xl">
          <div className="p-4 rounded-t-lg" style={{ background: "linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)" }}>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-white">Checklist Rápido</DialogTitle>
                    <p className="text-white/80 text-sm mt-1">Crie e gerencie checklists com problemas</p>
                  </div>
                </div>
                {checklists.length > 0 && (
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {checklists.length} pendente{checklists.length > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            </DialogHeader>
          </div>

          <div className="p-4 space-y-4 bg-white">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-500" />
                Título do Checklist
              </Label>
              <Input
                placeholder="Ex: Inspeção do Elevador"
                value={checklistAtual?.titulo || ""}
                onChange={(e) => {
                  if (checklistAtual) {
                    setChecklistAtual({ ...checklistAtual, titulo: e.target.value });
                  }
                }}
                className="border-gray-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-purple-500" />
                Responsável
              </Label>
              <Input
                placeholder="Nome do responsável"
                value={checklistAtual?.responsavel || ""}
                onChange={(e) => {
                  if (checklistAtual) {
                    setChecklistAtual({ ...checklistAtual, responsavel: e.target.value });
                  }
                }}
                className="border-gray-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  Data
                </Label>
                <Input
                  type="text"
                  disabled
                  value={checklistAtual?.dataCriacao || ""}
                  className="bg-gray-50 border-gray-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Hora</Label>
                <Input
                  type="text"
                  disabled
                  value={checklistAtual?.horaCriacao || ""}
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-500" />
                Localização (Automática)
              </Label>
              <Input
                type="text"
                disabled
                value={localizacao?.endereco || (carregandoLocalizacao ? "Obtendo localização..." : "Localização não disponível")}
                className="bg-gray-50 border-gray-200"
              />
            </div>

            <div className="space-y-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <Label className="text-gray-700 font-medium">Adicionar Item</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: Verificar cabos"
                  value={novoItemTitulo}
                  onChange={(e) => setNovoItemTitulo(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && adicionarItem()}
                  className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                />
                <Button
                  onClick={adicionarItem}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {checklistAtual?.itens.map((item) => (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg border transition-all ${
                    item.temProblema
                      ? "bg-red-50 border-red-300"
                      : "bg-gray-50 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {/* Checkbox e título */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={item.concluido}
                      onCheckedChange={() => toggleItemConcluido(item.id)}
                      className="h-5 w-5 shrink-0"
                    />
                    <span className={`flex-1 text-sm break-words ${item.concluido ? "line-through text-gray-400" : ""}`}>
                      {item.titulo}
                    </span>
                    {/* Badge no mobile */}
                    {item.temProblema && (
                      <span className="sm:hidden text-[10px] px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">
                        Problema
                      </span>
                    )}
                  </div>

                  {/* Botões de ação */}
                  <div className="flex items-center gap-1 ml-auto sm:ml-0 shrink-0">
                    <button
                      onClick={() => abrirModalProblema(item.id)}
                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                      title="Reportar problema"
                    >
                      <AlertTriangle className={`h-5 w-5 ${item.temProblema ? "text-red-500" : "text-yellow-500"}`} />
                    </button>

                    <button
                      onClick={() => removerItem(item.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-3">
              <Button
                onClick={salvarEReiniciar}
                disabled={salvando || !checklistAtual?.titulo.trim()}
                size="sm"
                className="flex-1 h-10 text-sm bg-purple-600 hover:bg-purple-700 text-white"
              >
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Outro
                  </>
                )}
              </Button>

              <Button
                onClick={enviarTodos}
                disabled={enviando || (checklists.length === 0 && !checklistAtual?.titulo.trim())}
                size="sm"
                className="flex-1 h-10 text-sm bg-green-600 hover:bg-green-700 text-white"
              >
                {enviando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Tudo
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modalProblemaAberto} onOpenChange={setModalProblemaAberto}>
        <DialogContent className="w-[92vw] max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-red-600">REPORTAR PROBLEMA</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Título do Problema</Label>
              <Input
                placeholder="Ex: Elevador quebrado"
                value={problemaTitulo}
                onChange={(e) => setProblemaTitle(e.target.value)}
                className="border-gray-200 focus:border-red-400 focus:ring-red-400"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Descrição</Label>
              <Textarea
                placeholder="Descreva o problema em detalhes..."
                value={problemaDescricao}
                onChange={(e) => setProblemaDescricao(e.target.value)}
                className="border-gray-200 focus:border-red-400 focus:ring-red-400 min-h-24"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium flex items-center gap-2">
                <Camera className="h-4 w-4 text-red-500" />
                Galeria de Imagens
              </Label>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-red-200 text-red-600 hover:bg-red-50"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Adicionar Imagens
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {problemaImagens.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {problemaImagens.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img}
                        alt={`Problema ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removerImagem(idx)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Status</Label>
              <Select value={problemaStatus} onValueChange={setProblemaStatus}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em-andamento">Em Andamento</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Prioridade</Label>
              <Select value={problemaPrioridade} onValueChange={setProblemaPrioridade}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setModalProblemaAberto(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={salvarProblema}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reportar Problema
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
