import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { FunctionTutorialButton } from "@/components/FunctionTutorial";
import { useCondominioAtivo } from "@/hooks/useCondominioAtivo";
import { FieldSettingsButton } from "@/components/FieldSettingsModal";
import { useFieldSettings } from "@/hooks/useFieldSettings";
import { AssinaturaDigitalSection } from "@/components/AssinaturaDigitalSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { ShareModal } from "@/components/ShareModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Plus,
  Star,
  History,
  Loader2,
  Search,
  Filter,
  ClipboardList,
  Settings,
  BarChart3,
  Clock,
  MapPin,
  Users,
  Package,
  DollarSign,
  MessageSquare,
  Image,
  Play,
  Square,
  Trash2,
  Edit,
  Eye,
  ChevronRight,
  Zap,
  Droplets,
  Building2,
  TreePine,
  Sparkles,
  Paintbrush,
  Shield,
  MoreHorizontal,
  ArrowDown,
  Minus,
  ArrowUp,
  AlertTriangle,
  FolderOpen,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Wrench,
  Tag,
  Flag,
  Circle,
  Calendar,
  FileText,
  Share2,
  Copy,
  ExternalLink,
  X,
  Paperclip,
  Download,
  File,
  ArrowUpDown,
  FileDown,
  CalendarDays,
  ClipboardList as ClipboardPlus,
  Inbox,
} from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Formata descrição em lista estruturada
function FormatDescricao({ texto, compact = false }: { texto: string; compact?: boolean }) {
  // Padrões de seções: emoji + TÍTULO EM CAPS seguido de dois-pontos
  const secaoRegex = /([\p{Emoji}\u200d\uFE0F]+\s*[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+:)/gu;
  const partes = texto.split(secaoRegex).filter(Boolean);

  if (partes.length <= 1) {
    // Sem seções detectadas, tenta separar por quebras de linha ou números
    const linhas = texto.split(/(?:\n|(?<=\.)\s+(?=\d+\.))/g).filter((l) => l.trim());
    if (linhas.length <= 1) return <span>{texto}</span>;
    return (
      <ul className={`list-disc list-inside space-y-0.5 ${compact ? 'line-clamp-3' : ''}`}>
        {linhas.map((l, i) => <li key={i} className="text-sm">{l.trim()}</li>)}
      </ul>
    );
  }

  const secoes: { titulo: string; conteudo: string }[] = [];
  for (let i = 0; i < partes.length; i++) {
    if (secaoRegex.test(partes[i]) || /^[\p{Emoji}]/u.test(partes[i].trim())) {
      secaoRegex.lastIndex = 0;
      secoes.push({ titulo: partes[i].trim(), conteudo: (partes[i + 1] || "").trim() });
      i++;
    }
  }

  if (secoes.length === 0) return <span>{texto}</span>;

  const parseItems = (txt: string) => {
    // Tenta separar por números (1. 2. 3.) ou traços (– / -)
    const numItems = txt.split(/(?:^|\s)(?=\d+\.)/).filter((s) => s.trim());
    if (numItems.length > 1) return numItems.map((s) => s.trim());
    const dashItems = txt.split(/\s*[–—-]\s+/).filter((s) => s.trim());
    if (dashItems.length > 1) return dashItems.map((s) => s.trim());
    return [txt];
  };

  if (compact) {
    return (
      <div className="space-y-1 line-clamp-3">
        {secoes.slice(0, 2).map((s, i) => (
          <div key={i}>
            <span className="font-medium text-xs">{s.titulo}</span>{" "}
            <span className="text-xs">{s.conteudo.slice(0, 120)}{s.conteudo.length > 120 ? "..." : ""}</span>
          </div>
        ))}
        {secoes.length > 2 && <span className="text-xs text-muted-foreground">+{secoes.length - 2} seções...</span>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {secoes.map((secao, i) => {
        const items = parseItems(secao.conteudo);
        return (
          <div key={i}>
            <p className="font-semibold text-sm">{secao.titulo}</p>
            {items.length > 1 ? (
              <ol className="list-decimal list-inside space-y-0.5 ml-1 mt-1">
                {items.map((item, j) => <li key={j} className="text-sm">{item}</li>)}
              </ol>
            ) : (
              <p className="text-sm ml-1 mt-0.5">{secao.conteudo}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Mapeamento de ícones
const iconMap: Record<string, any> = {
  Zap, Droplets, Building2, TreePine, Sparkles, Paintbrush, Shield, MoreHorizontal,
  ArrowDown, Minus, ArrowUp, AlertTriangle, FolderOpen, CheckCircle, CheckCircle2,
  XCircle, Wrench, Tag, Flag, Circle, Search, Package,
};

// Tipo de campo para templates de OS
type TipoCampoOS = "responsavel_os" | "titulo_os";

// Componente para botão de salvar/selecionar template de OS
interface OSTemplateSelectorProps {
  condominioId: number;
  tipoCampo: TipoCampoOS;
  valorAtual: string;
  onSelect: (valor: string) => void;
}

function OSTemplateSelector({ condominioId, tipoCampo, valorAtual, onSelect }: OSTemplateSelectorProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const utils = trpc.useUtils();

  // Buscar templates salvos
  const { data: templates, isLoading } = trpc.camposRapidosTemplates.listar.useQuery(
    { condominioId, tipoCampo },
    { enabled: popoverOpen && condominioId > 0 }
  );

  // Mutations
  const criarTemplateMutation = trpc.camposRapidosTemplates.criar.useMutation({
    onSuccess: (data) => {
      utils.camposRapidosTemplates.listar.invalidate({ condominioId, tipoCampo });
      if (data.jaExistia) {
        toast.info("Este nome já está salvo! Escolha no menu ou cadastre outro nome.");
      } else {
        toast.success("Valor salvo para reutilização!");
      }
    },
    onError: () => {
      toast.error("Erro ao salvar valor");
    }
  });

  const usarTemplateMutation = trpc.camposRapidosTemplates.usar.useMutation();
  
  const toggleFavoritoMutation = trpc.camposRapidosTemplates.toggleFavorito.useMutation({
    onSuccess: () => {
      utils.camposRapidosTemplates.listar.invalidate({ condominioId, tipoCampo });
    }
  });

  const deletarTemplateMutation = trpc.camposRapidosTemplates.deletar.useMutation({
    onSuccess: () => {
      utils.camposRapidosTemplates.listar.invalidate({ condominioId, tipoCampo });
      toast.success("Template removido");
    }
  });

  const handleSalvarAtual = () => {
    if (!valorAtual.trim()) {
      toast.error("Digite um valor antes de salvar");
      return;
    }
    criarTemplateMutation.mutate({
      condominioId,
      tipoCampo,
      valor: valorAtual.trim(),
    });
  };

  const handleSelectTemplate = (template: { id: number; valor: string }) => {
    onSelect(template.valor);
    usarTemplateMutation.mutate({ id: template.id });
    setPopoverOpen(false);
  };

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="bg-orange-500 text-white px-3 hover:bg-orange-600"
          title="Salvar ou selecionar valor frequente"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b bg-orange-50">
          <h4 className="font-semibold text-sm text-orange-800 flex items-center gap-2">
            <History className="h-4 w-4" />
            Valores Salvos
          </h4>
          <p className="text-xs text-orange-600 mt-1">
            Selecione um valor salvo ou salve o atual
          </p>
        </div>

        {/* Botão para salvar valor atual */}
        {valorAtual.trim() && (
          <div className="p-2 border-b">
            <Button
              onClick={handleSalvarAtual}
              disabled={criarTemplateMutation.isPending}
              className="w-full h-8 text-xs bg-orange-500 hover:bg-orange-600"
            >
              {criarTemplateMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Plus className="h-3 w-3 mr-1" />
              )}
              Salvar "{valorAtual.substring(0, 30)}{valorAtual.length > 30 ? '...' : ''}"
            </Button>
          </div>
        )}

        {/* Lista de templates */}
        <div className="max-h-48 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            </div>
          ) : templates && templates.length > 0 ? (
            <div className="p-1">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center gap-1 p-2 hover:bg-gray-50 rounded group"
                >
                  <button
                    onClick={() => handleSelectTemplate(template)}
                    className="flex-1 text-left text-sm text-gray-700 truncate hover:text-orange-600"
                  >
                    {template.valor}
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFavoritoMutation.mutate({ id: template.id })}
                      className={`p-1 rounded ${template.favorito ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                      title={template.favorito ? "Remover dos favoritos" : "Marcar como favorito"}
                    >
                      <Star className="h-3 w-3" fill={template.favorito ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => deletarTemplateMutation.mutate({ id: template.id })}
                      className="p-1 rounded text-gray-400 hover:text-red-500"
                      title="Remover"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  {template.vezesUsado && template.vezesUsado > 1 && (
                    <span className="text-xs text-gray-400 ml-1">
                      {template.vezesUsado}x
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              Nenhum valor salvo ainda.
              <br />
              <span className="text-xs">Digite um valor e clique em "Salvar"</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function OrdensServico() {
  const { condominioAtivo } = useCondominioAtivo();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const tab = params.get("tab") || "lista";

  // Queries
  const { data: ordensServicoData, isLoading } = trpc.ordensServico.list.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );
  const ordensServico: any[] | undefined = Array.isArray(ordensServicoData) ? ordensServicoData : (ordensServicoData as any)?.items;

  const { data: categorias } = trpc.ordensServico.getCategorias.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: prioridades } = trpc.ordensServico.getPrioridades.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: setores } = trpc.ordensServico.getSetores.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );
  
  const { data: statusList } = trpc.ordensServico.getStatus.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );
  
  // Queries de funcionarios e moradores removidas - não utilizadas nesta página

  // Mutations
  const createOS = trpc.ordensServico.create.useMutation();
  const uploadImagemMutation = trpc.ordensServico.uploadImagem.useMutation();
  const uploadAnexoMutation = trpc.ordensServico.uploadAnexo.useMutation();
  const createCategoria = trpc.ordensServico.createCategoria.useMutation();
  const createPrioridade = trpc.ordensServico.createPrioridade.useMutation();
  const createSetor = trpc.ordensServico.createSetor.useMutation();
  const updateOSStatus = trpc.ordensServico.update.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.ordensServico.list.invalidate();
    },
    onError: (error: any) => { toast.error("Erro: " + error.message); },
  });

  // Estados do modal
  const [showNovaOS, setShowNovaOS] = useState(false);
  const [showAddCategoria, setShowAddCategoria] = useState(false);
  const [showAddPrioridade, setShowAddPrioridade] = useState(false);
  const [showAddSetor, setShowAddSetor] = useState(false);

  const [novaOS, setNovaOS] = useState({
    responsavelPrincipal: "",
    protocolo: "",
    titulo: "",
    descricao: "",
    categoriaId: "",
    prioridadeId: "",
    statusId: "",
    setorId: "",
    tempoEstimadoDias: 0,
    tempoEstimadoHoras: 0,
    tempoEstimadoMinutos: 0,
    latitude: "",
    longitude: "",
    localizacaoDescricao: "",
    materiais: [] as { nome: string; quantidade: number }[],
    imagens: [] as { file: File; preview: string }[],
    anexos: [] as { file: File; preview: string; nome: string; tipo: string; tamanho: number }[],
  });

  const [novaCategoria, setNovaCategoria] = useState("");
  const [novaPrioridade, setNovaPrioridade] = useState("");
  const [novoSetor, setNovoSetor] = useState("");
  const [novoMaterial, setNovoMaterial] = useState({ nome: "", quantidade: 1 });
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategoria, setFilterCategoria] = useState<string>("all");
  const [filterPrioridade, setFilterPrioridade] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recente");
  const [osIdCriada, setOsIdCriada] = useState<number | null>(null);
  const [osProtocoloCriada, setOsProtocoloCriada] = useState<string>("");
  const [tipoOS, setTipoOS] = useState("");
  const [prazoConclusao, setPrazoConclusao] = useState("");
  const [custoEstimado, setCustoEstimado] = useState("");
  const [assinaturaTecnico, setAssinaturaTecnico] = useState("");
  const [assinaturaSolicitante, setAssinaturaSolicitante] = useState("");

  // Hook para configuração de campos
  const { isFieldEnabled } = useFieldSettings({
    condominioId: condominioAtivo?.id || 0,
    modalType: "completa",
    functionType: "ordem_servico",
    enabled: !!condominioAtivo?.id,
  });

  const handleCreateCategoria = async () => {
    if (!novaCategoria.trim()) return;
    try {
      await createCategoria.mutateAsync({
        condominioId: condominioAtivo?.id || 0,
        nome: novaCategoria,
      });
      setNovaCategoria("");
      setShowAddCategoria(false);
      toast.success("Categoria criada com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar categoria");
    }
  };

  const handleCreatePrioridade = async () => {
    if (!novaPrioridade.trim()) return;
    try {
      await createPrioridade.mutateAsync({
        condominioId: condominioAtivo?.id || 0,
        nome: novaPrioridade,
      });
      setNovaPrioridade("");
      setShowAddPrioridade(false);
      toast.success("Prioridade criada com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar prioridade");
    }
  };

  const handleCreateSetor = async () => {
    if (!novoSetor.trim()) return;
    try {
      await createSetor.mutateAsync({
        condominioId: condominioAtivo?.id || 0,
        nome: novoSetor,
      });
      setNovoSetor("");
      setShowAddSetor(false);
      toast.success("Setor criado com sucesso!");
    } catch (error) {
      toast.error("Erro ao criar setor");
    }
  };

  const handleAddMaterial = () => {
    if (novoMaterial.nome.trim()) {
      setNovaOS({
        ...novaOS,
        materiais: [...novaOS.materiais, novoMaterial],
      });
      setNovoMaterial({ nome: "", quantidade: 1 });
    }
  };

  const handleRemoveMaterial = (index: number) => {
    setNovaOS({
      ...novaOS,
      materiais: novaOS.materiais.filter((_, i) => i !== index),
    });
  };

  const handleFilesSelected = (files: File[]) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxSize = 100 * 1024 * 1024; // 100MB

    const newImagens = files
      .filter((file) => {
        if (!validTypes.includes(file.type)) {
          toast.error(`Tipo de arquivo inválido: ${file.name}`);
          return false;
        }
        if (file.size > maxSize) {
          toast.error(`Arquivo muito grande: ${file.name}`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

    setNovaOS({
      ...novaOS,
      imagens: [...(novaOS.imagens || []), ...newImagens],
    });
  };

  const handleRemoveImage = (index: number) => {
    const imagemRemovida = novaOS.imagens?.[index];
    if (imagemRemovida?.preview) {
      URL.revokeObjectURL(imagemRemovida.preview);
    }
    setNovaOS({
      ...novaOS,
      imagens: novaOS.imagens?.filter((_, i) => i !== index) || [],
    });
  };

  // Funções para anexos (PDF e documentos)
  const handleAnexosSelected = (files: File[]) => {
    const validTypes = [
      "application/pdf",
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const maxSize = 100 * 1024 * 1024; // 100MB

    const newAnexos = files
      .filter((file) => {
        if (!validTypes.includes(file.type)) {
          toast.error(`Tipo de arquivo não suportado: ${file.name}. Permitidos: PDF, imagens, Word, Excel`);
          return false;
        }
        if (file.size > maxSize) {
          toast.error(`Arquivo muito grande (máx 100MB): ${file.name}`);
          return false;
        }
        return true;
      })
      .map((file) => ({
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
        nome: file.name,
        tipo: file.type,
        tamanho: file.size,
      }));

    setNovaOS({
      ...novaOS,
      anexos: [...(novaOS.anexos || []), ...newAnexos],
    });
  };

  const handleRemoveAnexo = (index: number) => {
    const anexoRemovido = novaOS.anexos?.[index];
    if (anexoRemovido?.preview) {
      URL.revokeObjectURL(anexoRemovido.preview);
    }
    setNovaOS({
      ...novaOS,
      anexos: novaOS.anexos?.filter((_, i) => i !== index) || [],
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (tipo: string) => {
    if (tipo === "application/pdf") return "PDF";
    if (tipo.includes("word")) return "DOC";
    if (tipo.includes("excel") || tipo.includes("spreadsheet")) return "XLS";
    if (tipo.startsWith("image/")) return "IMG";
    return "FILE";
  };

  const handleCreateOS = async () => {
    if (!novaOS.titulo.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    try {
      // Gerar protocolo automático se não foi preenchido
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const rand = String(Math.floor(1000 + Math.random() * 9000));
      const protocoloFinal = novaOS.protocolo.trim() || `OS-${yy}${mm}${dd}-${rand}`;
      const tituloParaCompartilhar = novaOS.titulo;
      const result = await createOS.mutateAsync({
        condominioId: condominioAtivo?.id || 0,
        solicitanteNome: novaOS.responsavelPrincipal,
        titulo: novaOS.titulo,
        descricao: novaOS.descricao,
        categoriaId: novaOS.categoriaId ? parseInt(novaOS.categoriaId) : undefined,
        prioridadeId: novaOS.prioridadeId ? parseInt(novaOS.prioridadeId) : undefined,
        statusId: novaOS.statusId ? parseInt(novaOS.statusId) : undefined,
        setorId: novaOS.setorId ? parseInt(novaOS.setorId) : undefined,
        tempoEstimadoDias: novaOS.tempoEstimadoDias,
        tempoEstimadoHoras: novaOS.tempoEstimadoHoras,
        tempoEstimadoMinutos: novaOS.tempoEstimadoMinutos,
        localizacaoDescricao: novaOS.localizacaoDescricao || undefined,
        latitude: novaOS.latitude || undefined,
        longitude: novaOS.longitude || undefined,
        valorEstimado: custoEstimado || undefined,
      });

      // Setar osIdCriada para mostrar botão de compartilhamento
      if (result?.id) {
        setOsIdCriada(result.id);
        setOsProtocoloCriada(protocoloFinal);
        // Guardar o título no state para uso no modal de compartilhamento
        setNovaOS(prev => ({ ...prev, titulo: tituloParaCompartilhar }));
      }

      // Upload imagens após criação
      if (result?.id && novaOS.imagens && novaOS.imagens.length > 0) {
        for (const imagem of novaOS.imagens) {
          try {
            const fileData = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(imagem.file);
            });
            await uploadImagemMutation.mutateAsync({
              ordemServicoId: result.id,
              fileName: imagem.file.name,
              fileType: imagem.file.type,
              fileData,
            });
          } catch (err) {
            console.error("Erro ao enviar imagem:", err);
          }
        }
      }

      // Upload anexos após criação
      if (result?.id && novaOS.anexos && novaOS.anexos.length > 0) {
        for (const anexo of novaOS.anexos) {
          try {
            const fileData = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(anexo.file);
            });
            await uploadAnexoMutation.mutateAsync({
              ordemServicoId: result.id,
              fileName: anexo.nome,
              fileType: anexo.tipo,
              fileData,
            });
          } catch (err) {
            console.error("Erro ao enviar anexo:", err);
          }
        }
      }

      toast.success("Ordem de serviço criada com sucesso!");
      // Nao fechar modal para deixar botao de compartilhamento visivel
      setNovaOS({
        responsavelPrincipal: "",
        protocolo: "",
        titulo: "",
        descricao: "",
        categoriaId: "",
        prioridadeId: "",
        statusId: "",
        setorId: "",
        tempoEstimadoDias: 0,
        tempoEstimadoHoras: 0,
        tempoEstimadoMinutos: 0,
        latitude: "",
        longitude: "",
        localizacaoDescricao: "",
        materiais: [],
        imagens: [],
        anexos: [],
      });
    } catch (error) {
      toast.error("Erro ao criar ordem de serviço");
    }
  };

  // Contadores para resumo
  const contadores = {
    total: ordensServico?.length || 0,
    abertas: ordensServico?.filter((os: any) => {
      const st = statusList?.find((s) => s.id === os.statusId);
      return !st?.isFinal;
    }).length || 0,
    concluidas: ordensServico?.filter((os: any) => {
      const st = statusList?.find((s) => s.id === os.statusId);
      return st?.isFinal;
    }).length || 0,
  };

  // Filtrar ordens de serviço
  const filteredOrdens = (ordensServico || []).filter((os: any) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesTitulo = os.titulo?.toLowerCase().includes(term);
      const matchesDescricao = os.descricao?.toLowerCase().includes(term);
      const matchesProtocolo = os.protocolo?.toLowerCase().includes(term);
      const matchesResponsavel = os.responsavelPrincipalNome?.toLowerCase().includes(term);
      if (!matchesTitulo && !matchesDescricao && !matchesProtocolo && !matchesResponsavel) return false;
    }
    if (filterStatus !== "all" && String(os.statusId) !== filterStatus) return false;
    if (filterCategoria !== "all" && String(os.categoriaId) !== filterCategoria) return false;
    if (filterPrioridade !== "all" && String(os.prioridadeId) !== filterPrioridade) return false;
    return true;
  }).sort((a: any, b: any) => {
    switch (sortBy) {
      case "recente": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "antigo": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "titulo": return (a.titulo || "").localeCompare(b.titulo || "");
      case "prioridade": {
        const priA = prioridades?.find((p) => p.id === a.prioridadeId)?.nivel || 0;
        const priB = prioridades?.find((p) => p.id === b.prioridadeId)?.nivel || 0;
        return priB - priA;
      }
      default: return 0;
    }
  });

  // Exportar CSV
  const handleExportCSV = () => {
    if (!filteredOrdens.length) return;
    const headers = ["Protocolo", "Título", "Descrição", "Status", "Categoria", "Prioridade", "Responsável", "Criado em"];
    const rows = filteredOrdens.map((os: any) => [
      os.protocolo || "",
      os.titulo || "",
      (os.descricao || "").replace(/[\n\r]+/g, " "),
      statusList?.find((s) => s.id === os.statusId)?.nome || "",
      categorias?.find((c) => c.id === os.categoriaId)?.nome || "",
      prioridades?.find((p) => p.id === os.prioridadeId)?.nome || "",
      os.responsavelPrincipalNome || "",
      os.createdAt ? new Date(os.createdAt).toLocaleDateString("pt-BR") : "",
    ]);
    const csvContent = [headers, ...rows].map((r) => r.map((c: string) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ordens-servico-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Exportação concluída!");
  };

  if (!condominioAtivo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Selecione uma organização</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div data-tour="header-os" className="border-b border-border p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Ordens de Serviço
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerencie todas as ordens de serviço da sua organização
                </p>
              </div>
              <FunctionTutorialButton tutorialId="ordens-servico" compact />
            </div>
            <Dialog open={showNovaOS} onOpenChange={setShowNovaOS}>
              <DialogTrigger asChild>
                <Button data-dialog-trigger="create-os" className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Ordem de Serviço
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-orange-600">
                    Nova Ordem de Serviço
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Botão de Configuração de Campos - Visível no topo */}
                  <div className="flex justify-end">
                    <FieldSettingsButton
                      condominioId={condominioAtivo?.id || 0}
                      modalType="completa"
                      functionType="ordem_servico"
                      variant="full"
                    />
                  </div>
                  {/* Seção 1: Identificação */}
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-500" />
                      Identificação
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Responsável Principal</Label>
                          <div className="flex gap-2 mt-1">
                            <OSTemplateSelector
                              condominioId={condominioAtivo?.id || 0}
                              tipoCampo="responsavel_os"
                              valorAtual={novaOS.responsavelPrincipal}
                              onSelect={(valor) => setNovaOS({ ...novaOS, responsavelPrincipal: valor })}
                            />
                            <Input
                              placeholder="Nome do responsável"
                              value={novaOS.responsavelPrincipal}
                              onChange={(e) =>
                                setNovaOS({ ...novaOS, responsavelPrincipal: e.target.value })
                              }
                              className="flex-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Protocolo (Auto-gerado)</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              placeholder="Deixe em branco para auto-gerar"
                              value={novaOS.protocolo}
                              onChange={(e) =>
                                setNovaOS({ ...novaOS, protocolo: e.target.value })
                              }
                              className="mt-0"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const now = new Date();
                                const yy = String(now.getFullYear()).slice(-2);
                                const mm = String(now.getMonth() + 1).padStart(2, '0');
                                const dd = String(now.getDate()).padStart(2, '0');
                                const rand = String(Math.floor(1000 + Math.random() * 9000));
                                const novoProtocolo = `OS-${yy}${mm}${dd}-${rand}`;
                                setNovaOS({ ...novaOS, protocolo: novoProtocolo });
                              }}
                              className="whitespace-nowrap"
                            >
                              Gerar
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {novaOS.protocolo ? `Protocolo: ${novaOS.protocolo}` : "Será gerado automaticamente ao salvar"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção 2: Descrição */}
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-orange-500" />
                      Descrição
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Título *</Label>
                        <div className="flex gap-2 mt-1">
                          <OSTemplateSelector
                            condominioId={condominioAtivo?.id || 0}
                            tipoCampo="titulo_os"
                            valorAtual={novaOS.titulo}
                            onSelect={(valor) => setNovaOS({ ...novaOS, titulo: valor })}
                          />
                          <Input
                            placeholder="Ex: Reparo na bomba d'água"
                            value={novaOS.titulo}
                            onChange={(e) =>
                              setNovaOS({ ...novaOS, titulo: e.target.value })
                            }
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Descrição Detalhada</Label>
                        <Textarea
                          placeholder="Descreva detalhadamente o serviço a ser realizado..."
                          value={novaOS.descricao}
                          onChange={(e) =>
                            setNovaOS({ ...novaOS, descricao: e.target.value })
                          }
                          className="mt-1 min-h-24"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção 3: Classificação */}
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-orange-500" />
                      Classificação
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Tipo de OS */}
                      <div>
                        <Label className="text-sm font-medium">Tipo de OS</Label>
                        <Select value={tipoOS} onValueChange={setTipoOS}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="corretiva">Corretiva</SelectItem>
                            <SelectItem value="preventiva">Preventiva</SelectItem>
                            <SelectItem value="preditiva">Preditiva</SelectItem>
                            <SelectItem value="emergencial">Emergencial</SelectItem>
                            <SelectItem value="melhoria">Melhoria</SelectItem>
                            <SelectItem value="instalacao">Instalação</SelectItem>
                            <SelectItem value="inspecao">Inspeção</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Categoria</Label>
                        <div className="flex gap-2 mt-1">
                          <Select value={novaOS.categoriaId} onValueChange={(value) => setNovaOS({ ...novaOS, categoriaId: value })}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {categorias?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setShowAddCategoria(true)}
                            className="text-orange-500 hover:bg-orange-50"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Prioridade</Label>
                        <div className="flex gap-2 mt-1">
                          <Select value={novaOS.prioridadeId} onValueChange={(value) => setNovaOS({ ...novaOS, prioridadeId: value })}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {prioridades?.map((pri) => (
                                <SelectItem key={pri.id} value={pri.id.toString()}>
                                  {pri.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setShowAddPrioridade(true)}
                            className="text-orange-500 hover:bg-orange-50"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="flex gap-2 mt-1">
                          <Select value={novaOS.statusId} onValueChange={(value) => setNovaOS({ ...novaOS, statusId: value })}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusList?.map((st) => (
                                <SelectItem key={st.id} value={st.id.toString()}>
                                  {st.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Setor</Label>
                        <div className="flex gap-2 mt-1">
                          <Select value={novaOS.setorId} onValueChange={(value) => setNovaOS({ ...novaOS, setorId: value })}>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {setores?.map((set) => (
                                <SelectItem key={set.id} value={set.id.toString()}>
                                  {set.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setShowAddSetor(true)}
                            className="text-orange-500 hover:bg-orange-50"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção 4: Tempo Estimado */}
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      Tempo Estimado
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Dias</Label>
                        <Input
                          type="number"
                          min="0"
                          value={novaOS.tempoEstimadoDias}
                          onChange={(e) =>
                            setNovaOS({ ...novaOS, tempoEstimadoDias: parseInt(e.target.value) || 0 })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Horas</Label>
                        <Input
                          type="number"
                          min="0"
                          max="23"
                          value={novaOS.tempoEstimadoHoras}
                          onChange={(e) =>
                            setNovaOS({ ...novaOS, tempoEstimadoHoras: parseInt(e.target.value) || 0 })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Minutos</Label>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          value={novaOS.tempoEstimadoMinutos}
                          onChange={(e) =>
                            setNovaOS({ ...novaOS, tempoEstimadoMinutos: parseInt(e.target.value) || 0 })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção: Prazo e Custo */}
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      Prazo e Custo
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Prazo de Conclusão</Label>
                        <Input
                          type="date"
                          value={prazoConclusao}
                          onChange={(e) => setPrazoConclusao(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Custo Estimado (R$)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0,00"
                          value={custoEstimado}
                          onChange={(e) => setCustoEstimado(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção 5: Localização */}
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      Localização
                    </h3>
                    <div className="space-y-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-dashed border-orange-300 hover:bg-orange-50"
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(
                              (position) => {
                                const { latitude, longitude } = position.coords;
                                setNovaOS({
                                  ...novaOS,
                                  latitude: latitude.toString(),
                                  longitude: longitude.toString(),
                                });
                                toast.success(`Localização capturada: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                              },
                              (error) => {
                                toast.error("Erro ao capturar localização: " + error.message);
                              }
                            );
                          } else {
                            toast.error("Geolocalização não suportada no seu navegador");
                          }
                        }}
                      >
                        <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                        Capturar Localização (GPS)
                      </Button>
                      {novaOS.latitude && novaOS.longitude && (
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                            ✓ Localização capturada
                          </p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                            Latitude: {novaOS.latitude} | Longitude: {novaOS.longitude}
                          </p>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium">Descrição da Localização</Label>
                        <Input
                          placeholder="Ex: Sala de máquinas, Andar 3"
                          value={novaOS.localizacaoDescricao || ""}
                          onChange={(e) =>
                            setNovaOS({ ...novaOS, localizacaoDescricao: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seção 6: Material Necessário */}
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-500" />
                      Material Necessário
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nome do material"
                          value={novoMaterial.nome}
                          onChange={(e) =>
                            setNovoMaterial({ ...novoMaterial, nome: e.target.value })
                          }
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qtd"
                          value={novoMaterial.quantidade}
                          onChange={(e) =>
                            setNovoMaterial({ ...novoMaterial, quantidade: parseInt(e.target.value) || 1 })
                          }
                          className="w-20"
                        />
                        <Button
                          onClick={handleAddMaterial}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      {novaOS.materiais.length > 0 && (
                        <div className="space-y-2">
                          {novaOS.materiais.map((material, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-background p-2 rounded border border-border"
                            >
                              <span className="text-sm">
                                {material.nome} <Badge variant="secondary">{material.quantidade}</Badge>
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveMaterial(index)}
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seção 7: Upload de Imagens */}
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Image className="w-5 h-5 text-orange-500" />
                      Imagens da Ordem
                    </h3>
                    <div className="space-y-4">
                      {/* Drag and Drop Area */}
                      <div
                        className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center cursor-pointer hover:bg-orange-50 transition-colors"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const files = Array.from(e.dataTransfer.files);
                          handleFilesSelected(files);
                        }}
                        onClick={() => document.getElementById("file-input")?.click()}
                      >
                        <Image className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">Arraste imagens aqui ou clique para selecionar</p>
                        <p className="text-xs text-muted-foreground mt-1">Máximo 100MB por arquivo (JPEG, PNG, GIF, WebP)</p>
                        <input
                          id="file-input"
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          onChange={(e) => handleFilesSelected(Array.from(e.target.files || []))}
                        />
                      </div>
                      {novaOS.imagens && novaOS.imagens.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {novaOS.imagens.map((imagem, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imagem.preview}
                                alt={`Preview ${index}`}
                                className="w-full h-24 object-cover rounded border border-border"
                              />
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seção 8: Anexos (PDF e Documentos) */}
                  <div className="border border-border rounded-lg p-4 bg-muted/30">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Paperclip className="w-5 h-5 text-orange-500" />
                      Anexos (PDF e Documentos)
                    </h3>
                    <div className="space-y-4">
                      {/* Drag and Drop Area para Anexos */}
                      <div
                        className="border-2 border-dashed border-orange-300 rounded-lg p-6 text-center cursor-pointer hover:bg-orange-50 transition-colors"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const files = Array.from(e.dataTransfer.files);
                          handleAnexosSelected(files);
                        }}
                        onClick={() => document.getElementById("anexo-input")?.click()}
                      >
                        <Paperclip className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-foreground">Arraste documentos aqui ou clique para selecionar</p>
                        <p className="text-xs text-muted-foreground mt-1">Máximo 100MB por arquivo (PDF, Word, Excel, Imagens)</p>
                        <input
                          id="anexo-input"
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,image/gif,image/webp"
                          className="hidden"
                          onChange={(e) => handleAnexosSelected(Array.from(e.target.files || []))}
                        />
                      </div>
                      {novaOS.anexos && novaOS.anexos.length > 0 && (
                        <div className="space-y-2">
                          {novaOS.anexos.map((anexo, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-background p-3 rounded border border-border group"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded flex items-center justify-center text-xs font-bold text-white ${
                                  anexo.tipo === "application/pdf" ? "bg-red-500" :
                                  anexo.tipo.includes("word") ? "bg-blue-500" :
                                  anexo.tipo.includes("excel") || anexo.tipo.includes("spreadsheet") ? "bg-green-500" :
                                  anexo.tipo.startsWith("image/") ? "bg-purple-500" : "bg-gray-500"
                                }`}>
                                  {getFileIcon(anexo.tipo)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                                    {anexo.nome}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(anexo.tamanho)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveAnexo(index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assinatura Digital */}
                  <AssinaturaDigitalSection
                    assinaturaTecnico={assinaturaTecnico}
                    setAssinaturaTecnico={setAssinaturaTecnico}
                    assinaturaSolicitante={assinaturaSolicitante}
                    setAssinaturaSolicitante={setAssinaturaSolicitante}
                  />

                  {/* Botões de Ação */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowNovaOS(false)}
                      className="w-full sm:flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleCreateOS}
                      className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                      disabled={createOS.isPending}
                    >
                      {createOS.isPending ? "Criando..." : "Criar Ordem"}
                    </Button>
                  </div>

                  {/* Botão de Compartilhamento (aparece após criar) */}
                  {osIdCriada && (
                    <div className="pt-4 border-t border-border">
                      <Button
                        onClick={() => setShowShareModal(true)}
                        variant="outline"
                        className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Compartilhar com Equipe
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Modais de Adicionar Itens */}
        <Dialog open={showAddCategoria} onOpenChange={setShowAddCategoria}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Nome da categoria"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                autoFocus
              />
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowAddCategoria(false)} className="w-full sm:flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleCreateCategoria} className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600">
                  Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddPrioridade} onOpenChange={setShowAddPrioridade}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Prioridade</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Nome da prioridade"
                value={novaPrioridade}
                onChange={(e) => setNovaPrioridade(e.target.value)}
                autoFocus
              />
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowAddPrioridade(false)} className="w-full sm:flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleCreatePrioridade} className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600">
                  Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showAddSetor} onOpenChange={setShowAddSetor}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle>Novo Setor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Nome do setor"
                value={novoSetor}
                onChange={(e) => setNovoSetor(e.target.value)}
                autoFocus
              />
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowAddSetor(false)} className="w-full sm:flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleCreateSetor} className="w-full sm:flex-1 bg-orange-500 hover:bg-orange-600">
                  Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Barra de Busca e Filtros */}
        <div className="border-b border-border px-4 sm:px-6 py-3">
          {/* Contadores resumo */}
          <div className="flex flex-wrap gap-3 mb-3 text-sm">
            <span className="bg-muted/60 px-3 py-1 rounded-full font-medium">{contadores.total} total</span>
            <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full font-medium">{contadores.abertas} {contadores.abertas === 1 ? "aberta" : "abertas"}</span>
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full font-medium">{contadores.concluidas} {contadores.concluidas === 1 ? "concluída" : "concluídas"}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, protocolo, descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  {statusList?.map((st) => (
                    <SelectItem key={st.id} value={st.id.toString()}>{st.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Categorias</SelectItem>
                  {categorias?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Prioridades</SelectItem>
                  {prioridades?.map((pri) => (
                    <SelectItem key={pri.id} value={pri.id.toString()}>{pri.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recente">Mais Recente</SelectItem>
                  <SelectItem value="antigo">Mais Antigo</SelectItem>
                  <SelectItem value="titulo">Título (A-Z)</SelectItem>
                  <SelectItem value="prioridade">Prioridade</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || filterStatus !== "all" || filterCategoria !== "all" || filterPrioridade !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setFilterCategoria("all");
                    setFilterPrioridade("all");
                  }}
                  className="text-orange-500"
                >
                  <X className="w-4 h-4 mr-1" /> Limpar
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleExportCSV} title="Exportar CSV" disabled={!filteredOrdens.length}>
                <FileDown className="w-4 h-4 mr-1" /> CSV
              </Button>
            </div>
          </div>
          {searchTerm || filterStatus !== "all" || filterCategoria !== "all" || filterPrioridade !== "all" ? (
            <p className="text-xs text-muted-foreground mt-2">
              {filteredOrdens.length} de {ordensServico?.length || 0} ordens encontradas
            </p>
          ) : null}
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border border-border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-3/5" />
                      <Skeleton className="h-4 w-4/5" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrdens && filteredOrdens.length > 0 ? (
            <div className="grid gap-4">
              {filteredOrdens.map((os: any) => (
                <div
                  key={os.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition"
                  onClick={() => setLocation(`/dashboard/ordens-servico/${os.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{os.titulo}</h3>
                        {os.createdAt && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {new Date(os.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                      {os.descricao && (
                        <div className="text-sm text-muted-foreground mt-1">
                          <FormatDescricao texto={os.descricao} compact />
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        {os.protocolo && <Badge variant="secondary">{os.protocolo}</Badge>}
                        {os.statusId && statusList?.find((s) => s.id === os.statusId) && (
                          <Badge style={{ backgroundColor: statusList.find((s) => s.id === os.statusId)?.cor || '#6B7280', color: 'white' }}>
                            {statusList.find((s) => s.id === os.statusId)?.nome}
                          </Badge>
                        )}
                        {os.categoriaId && categorias?.find((c) => c.id === os.categoriaId) && (
                          <Badge variant="outline" style={{ borderColor: categorias.find((c) => c.id === os.categoriaId)?.cor || '#6B7280', color: categorias.find((c) => c.id === os.categoriaId)?.cor || '#6B7280' }}>
                            {categorias.find((c) => c.id === os.categoriaId)?.nome}
                          </Badge>
                        )}
                        {os.prioridadeId && prioridades?.find((p) => p.id === os.prioridadeId) && (
                          <Badge variant="outline" style={{ borderColor: prioridades.find((p) => p.id === os.prioridadeId)?.cor || '#6B7280', color: prioridades.find((p) => p.id === os.prioridadeId)?.cor || '#6B7280' }}>
                            {prioridades.find((p) => p.id === os.prioridadeId)?.nome}
                          </Badge>
                        )}
                        {os.responsavelPrincipalNome && (
                          <Badge variant="outline">{os.responsavelPrincipalNome}</Badge>
                        )}
                        {/* Atalho rápido de status */}
                        {statusList && statusList.length > 0 && (
                          <Select
                            value={String(os.statusId)}
                            onValueChange={(val) => {
                              updateOSStatus.mutate({ id: os.id, statusId: Number(val) });
                            }}
                          >
                            <SelectTrigger
                              className="h-6 w-auto min-w-[100px] text-xs border-dashed"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent onClick={(e) => e.stopPropagation()}>
                              {statusList.map((st) => (
                                <SelectItem key={st.id} value={st.id.toString()}>{st.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 ml-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <Inbox className="w-16 h-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">Nenhuma ordem de serviço</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                {searchTerm || filterStatus !== "all" || filterCategoria !== "all" || filterPrioridade !== "all"
                  ? "Nenhuma OS corresponde aos filtros aplicados. Tente limpar os filtros."
                  : "Comece criando sua primeira ordem de serviço para gerenciar as manutenções do condomínio."}
              </p>
              {!searchTerm && filterStatus === "all" && filterCategoria === "all" && filterPrioridade === "all" && (
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => {
                    const trigger = document.querySelector('[data-dialog-trigger="create-os"]');
                    if (trigger) (trigger as HTMLElement).click();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Criar Primeira OS
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Compartilhamento */}
      {osIdCriada && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          tipo="ordem-servico"
          itemId={osIdCriada}
          itemTitulo={novaOS.titulo || "Ordem de Serviço"}
          itemProtocolo={osProtocoloCriada || `OS-${osIdCriada}`}
          condominioId={condominioAtivo?.id || 0}
        />
      )}

    </div>
  );
}
