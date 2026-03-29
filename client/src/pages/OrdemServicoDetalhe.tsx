import { useState, useEffect, useRef, ChangeEvent } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useCondominioAtivo } from "@/hooks/useCondominioAtivo";
import { ShareModal } from "@/components/ShareModal";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
// DashboardLayout removido - agora renderizado dentro do Dashboard.tsx
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
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Save,
  Clock,
  MapPin,
  Users,
  Package,
  DollarSign,
  MessageSquare,
  Image,
  Play,
  Square,
  Settings,
  Tag,
  Flag,
  Circle,
  Calendar,
  FileText,
  Share2,
  Copy,
  ExternalLink,
  Send,
  Paperclip,
  CheckCircle,
  XCircle,
  AlertTriangle,
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
  FolderOpen,
  CheckCircle2,
  Wrench,
  Navigation,
  Map,
  Link2,
  Download,
  File,
  ImageIcon,
  X,
  Loader2,
  CopyPlus,
  Menu,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Formata descrição em lista estruturada com checkboxes e botão de reportar
interface FormatDescricaoProps {
  texto: string;
  interactive?: boolean;
  checkedItems?: Record<string, boolean>;
  onCheck?: (key: string, checked: boolean) => void;
  onReport?: (itemText: string) => void;
}

function FormatDescricao({ texto, interactive = false, checkedItems = {}, onCheck, onReport }: FormatDescricaoProps) {
  const secaoRegex = /([\p{Emoji}\u200d\uFE0F]+\s*[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s]+:)/gu;
  const partes = texto.split(secaoRegex).filter(Boolean);

  const ItemRow = ({ itemKey, children }: { itemKey: string; children: React.ReactNode }) => {
    if (!interactive) return <>{children}</>;
    const isChecked = !!checkedItems[itemKey];
    return (
      <div className="flex items-start gap-2 group/item">
        <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
          <Checkbox
            checked={isChecked}
            onCheckedChange={(v) => onCheck?.(itemKey, !!v)}
            className="border-amber-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
          />
          <button
            type="button"
            onClick={() => onReport?.(typeof children === 'string' ? children : itemKey)}
            className="opacity-60 hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
            title="Reportar problema neste item"
          >
            <AlertTriangle className="w-4 h-4" />
          </button>
        </div>
        <span className={isChecked ? "line-through text-gray-400" : ""}>{children}</span>
      </div>
    );
  };

  if (partes.length <= 1) {
    const linhas = texto.split(/(?:\n|(?<=\.)\s+(?=\d+\.))/g).filter((l) => l.trim());
    if (linhas.length <= 1) {
      return interactive ? <ItemRow itemKey="item-0">{texto}</ItemRow> : <span>{texto}</span>;
    }
    return (
      <div className="space-y-1.5">
        {linhas.map((l, i) => (
          <ItemRow key={i} itemKey={`item-${i}`}>{l.trim()}</ItemRow>
        ))}
      </div>
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
    const numItems = txt.split(/(?:^|\s)(?=\d+\.)/).filter((s) => s.trim());
    if (numItems.length > 1) return numItems.map((s) => s.trim());
    const dashItems = txt.split(/\s*[–—-]\s+/).filter((s) => s.trim());
    if (dashItems.length > 1) return dashItems.map((s) => s.trim());
    return [txt];
  };

  return (
    <div className="space-y-3 mt-2">
      {secoes.map((secao, idx) => {
        const items = parseItems(secao.conteudo);
        return (
          <div key={idx}>
            <p className="font-semibold text-gray-700">{secao.titulo}</p>
            {items.length > 1 ? (
              <div className="space-y-1.5 ml-2 mt-1 text-gray-600">
                {items.map((item, j) => (
                  <ItemRow key={j} itemKey={`s${idx}-${j}`}>{item}</ItemRow>
                ))}
              </div>
            ) : (
              <div className="ml-2 mt-1 text-gray-600">
                <ItemRow itemKey={`s${idx}-0`}>{secao.conteudo}</ItemRow>
              </div>
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
  XCircle, Wrench, Tag, Flag, Circle, Package,
};

const iconOptions = [
  { value: "Zap", label: "Elétrica", icon: Zap },
  { value: "Droplets", label: "Hidráulica", icon: Droplets },
  { value: "Building2", label: "Estrutural", icon: Building2 },
  { value: "TreePine", label: "Jardinagem", icon: TreePine },
  { value: "Sparkles", label: "Limpeza", icon: Sparkles },
  { value: "Paintbrush", label: "Pintura", icon: Paintbrush },
  { value: "Shield", label: "Segurança", icon: Shield },
  { value: "MoreHorizontal", label: "Outros", icon: MoreHorizontal },
  { value: "Wrench", label: "Manutenção", icon: Wrench },
  { value: "Package", label: "Material", icon: Package },
];

const prioridadeIconOptions = [
  { value: "ArrowDown", label: "Baixa", icon: ArrowDown },
  { value: "Minus", label: "Normal", icon: Minus },
  { value: "ArrowUp", label: "Alta", icon: ArrowUp },
  { value: "AlertTriangle", label: "Urgente", icon: AlertTriangle },
];

const statusIconOptions = [
  { value: "FolderOpen", label: "Aberta", icon: FolderOpen },
  { value: "Circle", label: "Em Análise", icon: Circle },
  { value: "CheckCircle", label: "Aprovada", icon: CheckCircle },
  { value: "Wrench", label: "Em Execução", icon: Wrench },
  { value: "Package", label: "Aguardando Material", icon: Package },
  { value: "CheckCircle2", label: "Concluída", icon: CheckCircle2 },
  { value: "XCircle", label: "Cancelada", icon: XCircle },
];

export default function OrdemServicoDetalhe() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const { condominioAtivo } = useCondominioAtivo();
  const [activeTab, setActiveTab] = useState("detalhes");
  const [isEditing, setIsEditing] = useState(false);
  const [showGerenciarCategorias, setShowGerenciarCategorias] = useState(false);
  const [showGerenciarPrioridades, setShowGerenciarPrioridades] = useState(false);
  const [showGerenciarStatus, setShowGerenciarStatus] = useState(false);
  const [showGerenciarSetores, setShowGerenciarSetores] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddOrcamento, setShowAddOrcamento] = useState(false);
  const [showAddResponsavel, setShowAddResponsavel] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImagem, setUploadingImagem] = useState(false);
  const [chatAnexo, setChatAnexo] = useState<{
    file: File | null;
    preview: string | null;
    uploading: boolean;
  }>({ file: null, preview: null, uploading: false });
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Estado dos checkboxes da descrição (persistido no localStorage)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`os-checklist-${params.id}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const handleCheckItem = (key: string, checked: boolean) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [key]: checked };
      try { localStorage.setItem(`os-checklist-${params.id}`, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Estado do modal de reportar problema
  const [reportModal, setReportModal] = useState<{
    open: boolean;
    itemText: string;
    descricao: string;
    foto: File | null;
    fotoPreview: string | null;
    enviando: boolean;
  }>({ open: false, itemText: "", descricao: "", foto: null, fotoPreview: null, enviando: false });
  const reportFileRef = useRef<HTMLInputElement>(null);

  const handleOpenReport = (itemText: string) => {
    setReportModal({ open: true, itemText, descricao: "", foto: null, fotoPreview: null, enviando: false });
  };

  const handleReportFotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Imagem muito grande. Máximo 10MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setReportModal((prev) => ({ ...prev, foto: file, fotoPreview: reader.result as string }));
    reader.readAsDataURL(file);
  };

  // Mapa de humanização de eventos da timeline
  const tipoEventoMap: Record<string, string> = {
    "criacao": "OS Criada",
    "atualizacao": "OS Atualizada",
    "status_alterado": "Status Alterado",
    "material_adicionado": "Material Adicionado",
    "material_removido": "Material Removido",
    "orcamento_adicionado": "Orçamento Adicionado",
    "orcamento_aprovado": "Orçamento Aprovado",
    "orcamento_rejeitado": "Orçamento Rejeitado",
    "orcamento_removido": "Orçamento Removido",
    "responsavel_adicionado": "Responsável Adicionado",
    "responsavel_removido": "Responsável Removido",
    "anexo_adicionado": "Anexo Adicionado",
    "anexo_removido": "Anexo Removido",
    "imagem_adicionada": "Imagem Adicionada",
    "imagem_removida": "Imagem Removida",
    "localizacao_atualizada": "Localização Atualizada",
    "inicio_servico": "Serviço Iniciado",
    "fim_servico": "Serviço Finalizado",
    "mensagem_chat": "Mensagem no Chat",
    "observacao": "Observação Adicionada",
    "campo_atualizado": "Campo Atualizado",
  };

  const humanizeTipoEvento = (tipo: string) => {
    return tipoEventoMap[tipo] || tipo.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const osId = params.id && params.id !== 'nova' ? parseInt(params.id) : 0;
  const isNovaOrdem = params.id === 'nova';

  // Queries
  const { data: ordem, refetch: refetchOrdem, isLoading: isLoadingOrdem, error: errorOrdem } = trpc.ordensServico.getById.useQuery(
    { id: osId },
    { enabled: !!osId && !isNovaOrdem, retry: 1 }
  );

  const { data: categorias, refetch: refetchCategorias } = trpc.ordensServico.getCategorias.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: prioridades, refetch: refetchPrioridades } = trpc.ordensServico.getPrioridades.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: statusList, refetch: refetchStatus } = trpc.ordensServico.getStatus.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  const { data: setores, refetch: refetchSetores } = trpc.ordensServico.getSetores.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  // Materiais, orcamentos, responsaveis e timeline já vêm no getById
  const materiais = ordem?.materiais || [];
  const orcamentos = ordem?.orcamentos || [];
  const responsaveis = ordem?.responsaveis || [];
  const timeline = ordem?.timeline || [];
  
  const refetchMateriais = refetchOrdem;
  const refetchOrcamentos = refetchOrdem;
  const refetchResponsaveis = refetchOrdem;
  const refetchTimeline = refetchOrdem;

  const { data: chat, refetch: refetchChat } = trpc.ordensServico.getChat.useQuery(
    { ordemServicoId: osId },
    { enabled: !!osId }
  );

  const { data: configuracoes } = trpc.ordensServico.getConfiguracoes.useQuery(
    { condominioId: condominioAtivo?.id || 0 },
    { enabled: !!condominioAtivo?.id }
  );

  // Query para anexos
  const { data: anexos, refetch: refetchAnexos } = trpc.ordensServico.listarAnexos.useQuery(
    { ordemServicoId: osId },
    { enabled: !!osId }
  );

  // Mutations
  const createOSMutation = trpc.ordensServico.create.useMutation({
    onSuccess: () => {
      toast.success("Ordem de Serviço criada com sucesso!");
      refetchOrdem();
    },
    onError: (error: any) => {
      toast.error("Erro ao criar OS: " + error.message);
    },
  });

  const updateOS = trpc.ordensServico.update.useMutation({
    onSuccess: () => {
      toast.success("Ordem de serviço atualizada!");
      refetchOrdem();
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar OS: " + error.message);
    },
  });

  const iniciarOS = trpc.ordensServico.iniciarServico.useMutation({
    onSuccess: () => {
      toast.success("Ordem de serviço iniciada!");
      refetchOrdem();
      refetchTimeline();
    },
    onError: (error: any) => {
      toast.error("Erro ao iniciar OS: " + error.message);
    },
  });

  const finalizarOS = trpc.ordensServico.finalizarServico.useMutation({
    onSuccess: () => {
      toast.success("Ordem de serviço finalizada!");
      refetchOrdem();
      refetchTimeline();
    },
    onError: (error: any) => {
      toast.error("Erro ao finalizar OS: " + error.message);
    },
  });

  // Categoria mutations
  const createCategoria = trpc.ordensServico.createCategoria.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada!");
      refetchCategorias();
    },
  });

  const deleteCategoria = trpc.ordensServico.deleteCategoria.useMutation({
    onSuccess: () => {
      toast.success("Categoria excluída!");
      refetchCategorias();
    },
  });

  // Prioridade mutations
  const createPrioridade = trpc.ordensServico.createPrioridade.useMutation({
    onSuccess: () => {
      toast.success("Prioridade criada!");
      refetchPrioridades();
    },
  });

  const deletePrioridade = trpc.ordensServico.deletePrioridade.useMutation({
    onSuccess: () => {
      toast.success("Prioridade excluída!");
      refetchPrioridades();
    },
  });

  // Status mutations
  const createStatus = trpc.ordensServico.createStatus.useMutation({
    onSuccess: () => {
      toast.success("Status criado!");
      refetchStatus();
    },
  });

  const deleteStatus = trpc.ordensServico.deleteStatus.useMutation({
    onSuccess: () => {
      toast.success("Status excluído!");
      refetchStatus();
    },
  });

  // Setor mutations
  const createSetor = trpc.ordensServico.createSetor.useMutation({
    onSuccess: () => {
      toast.success("Setor criado!");
      refetchSetores();
    },
  });

  const deleteSetor = trpc.ordensServico.deleteSetor.useMutation({
    onSuccess: () => {
      toast.success("Setor excluído!");
      refetchSetores();
    },
  });

  // Material mutations
  const addMaterial = trpc.ordensServico.addMaterial.useMutation({
    onSuccess: () => {
      toast.success("Material adicionado!");
      refetchMateriais();
      setShowAddMaterial(false);
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar material: " + error.message);
    },
  });

  const deleteMaterial = trpc.ordensServico.removeMaterial.useMutation({
    onSuccess: () => {
      toast.success("Material removido!");
      refetchMateriais();
    },
    onError: (error: any) => {
      toast.error("Erro ao remover material: " + error.message);
    },
  });

  // Orçamento mutations
  const addOrcamento = trpc.ordensServico.addOrcamento.useMutation({
    onSuccess: () => {
      toast.success("Orçamento adicionado!");
      refetchOrcamentos();
      setShowAddOrcamento(false);
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar orçamento: " + error.message);
    },
  });

  const aprovarOrcamento = trpc.ordensServico.aprovarOrcamento.useMutation({
    onSuccess: () => {
      toast.success("Orçamento aprovado!");
      refetchOrcamentos();
    },
    onError: (error: any) => {
      toast.error("Erro ao aprovar orçamento: " + error.message);
    },
  });

  const rejeitarOrcamento = trpc.ordensServico.rejeitarOrcamento.useMutation({
    onSuccess: () => {
      toast.success("Orçamento rejeitado!");
      refetchOrcamentos();
    },
    onError: (error: any) => {
      toast.error("Erro ao rejeitar orçamento: " + error.message);
    },
  });

  const deleteOrcamento = trpc.ordensServico.removeOrcamento.useMutation({
    onSuccess: () => {
      toast.success("Orçamento removido!");
      refetchOrcamentos();
    },
  });

  // Responsável mutations
  const addResponsavel = trpc.ordensServico.addResponsavel.useMutation({
    onSuccess: () => {
      toast.success("Responsável adicionado!");
      refetchResponsaveis();
      setShowAddResponsavel(false);
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar responsável: " + error.message);
    },
  });

  const deleteResponsavel = trpc.ordensServico.removeResponsavel.useMutation({
    onSuccess: () => {
      toast.success("Responsável removido!");
      refetchResponsaveis();
    },
  });

  // Chat mutation
  const sendChatMessage = trpc.ordensServico.sendMessage.useMutation({
    onSuccess: () => {
      setChatMessage("");
      refetchChat();
    },
    onError: (error: any) => {
      toast.error("Erro ao enviar mensagem: " + error.message);
    },
  });

  // Anexos mutations
  const uploadAnexo = trpc.ordensServico.uploadAnexo.useMutation({
    onSuccess: () => {
      toast.success("Anexo enviado com sucesso!");
      refetchAnexos();
    },
    onError: (error) => {
      toast.error("Erro ao enviar anexo: " + error.message);
    },
  });

  const deleteAnexo = trpc.ordensServico.deletarAnexo.useMutation({
    onSuccess: () => {
      toast.success("Anexo removido!");
      refetchAnexos();
    },
    onError: (error) => {
      toast.error("Erro ao remover anexo: " + error.message);
    },
  });

  const deleteOS = trpc.ordensServico.delete.useMutation({
    onSuccess: () => {
      toast.success("Ordem de serviço excluída!");
      navigate("/dashboard/ordens-servico");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir OS: " + error.message);
    },
  });

  // Imagens mutations
  const uploadImagemOS = trpc.ordensServico.uploadImagem.useMutation({
    onSuccess: () => {
      toast.success("Imagem adicionada!");
      refetchOrdem();
      setUploadingImagem(false);
    },
    onError: (error: any) => {
      toast.error("Erro ao adicionar imagem: " + error.message);
      setUploadingImagem(false);
    },
  });

  const deletarImagemOS = trpc.ordensServico.deletarImagem.useMutation({
    onSuccess: () => {
      toast.success("Imagem removida!");
      refetchOrdem();
    },
    onError: (error: any) => {
      toast.error("Erro ao remover imagem: " + error.message);
    },
  });

  const handleImagemUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !osId) return;
    setUploadingImagem(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast.error(`Ficheiro "${file.name}" não é uma imagem.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Imagem "${file.name}" muito grande (máx. 10MB).`);
        continue;
      }
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        await uploadImagemOS.mutateAsync({
          ordemServicoId: osId,
          fileName: file.name,
          fileType: file.type,
          fileData: base64,
        });
      } catch {}
    }
    setUploadingImagem(false);
    if (imageFileInputRef.current) imageFileInputRef.current.value = '';
  };

  // Localização mutation
  const updateLocalizacao = trpc.ordensServico.updateLocalizacao.useMutation({
    onSuccess: () => {
      toast.success("Localização atualizada!");
      refetchOrdem();
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar localização: " + error.message);
    },
  });

  // Form states
  const [editForm, setEditForm] = useState({
    titulo: "",
    descricao: "",
    categoriaId: "",
    prioridadeId: "",
    statusId: "",
    setorId: "",
    responsavelPrincipalNome: "",
    protocolo: "",
    tempoEstimadoDias: 0,
    tempoEstimadoHoras: 0,
    tempoEstimadoMinutos: 0,
    valorEstimado: "",
    valorReal: "",
  });

  const [novaCategoria, setNovaCategoria] = useState({ nome: "", cor: "#EAB308", icone: "Tag" });
  const [novaPrioridade, setNovaPrioridade] = useState({ nome: "", cor: "#EAB308", icone: "Minus", ordem: 1 });
  const [novoStatus, setNovoStatus] = useState({ nome: "", cor: "#EAB308", icone: "Circle", ordem: 1 });
  const [novoSetor, setNovoSetor] = useState({ nome: "" });
  const [novoMaterial, setNovoMaterial] = useState({ nome: "", quantidade: 1, unidade: "un", emEstoque: true, precisaPedir: false, observacao: "" });
  const [novoOrcamento, setNovoOrcamento] = useState({ descricao: "", valor: "", fornecedor: "" });
  const [novoResponsavel, setNovoResponsavel] = useState({ nome: "", cargo: "", telefone: "", setorId: "" });

  useEffect(() => {
    if (ordem) {
      setEditForm({
        titulo: ordemAtual.titulo,
        descricao: ordemAtual.descricao || "",
        categoriaId: ordemAtual.categoriaId ? String(ordemAtual.categoriaId) : "",
        prioridadeId: ordemAtual.prioridadeId ? String(ordemAtual.prioridadeId) : "",
        statusId: ordemAtual.statusId ? String(ordemAtual.statusId) : "",
        setorId: ordemAtual.setorId ? String(ordemAtual.setorId) : "",
        responsavelPrincipalNome: ordemAtual.responsavelPrincipalNome || "",
        protocolo: ordemAtual.protocolo || "",
        tempoEstimadoDias: ordemAtual.tempoEstimadoDias || 0,
        tempoEstimadoHoras: ordemAtual.tempoEstimadoHoras || 0,
        tempoEstimadoMinutos: ordemAtual.tempoEstimadoMinutos || 0,
        valorEstimado: ordemAtual.valorEstimado || "",
        valorReal: ordemAtual.valorReal || "",
      });
    }
  }, [ordem]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSaveEdit = () => {
    if (!ordem) return;
    updateOS.mutate({
      id: ordemAtual.id,
      titulo: editForm.titulo,
      descricao: editForm.descricao || undefined,
      categoriaId: editForm.categoriaId ? parseInt(editForm.categoriaId) : undefined,
      prioridadeId: editForm.prioridadeId ? parseInt(editForm.prioridadeId) : undefined,
      statusId: editForm.statusId ? parseInt(editForm.statusId) : undefined,
      setorId: editForm.setorId ? parseInt(editForm.setorId) : undefined,
      tempoEstimadoDias: editForm.tempoEstimadoDias,
      tempoEstimadoHoras: editForm.tempoEstimadoHoras,
      tempoEstimadoMinutos: editForm.tempoEstimadoMinutos,
      valorEstimado: editForm.valorEstimado || undefined,
      valorReal: editForm.valorReal || undefined,
    });
  };

  const handleGetLocation = () => {
    if (!ordem) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Tentar obter endereço via API de geocoding reverso
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const endereco = data.display_name || "";
            
            updateLocalizacao.mutate({
              ordemServicoId: ordemAtual.id,
              latitude: latitude,
              longitude: longitude,
              endereco,
            });
          } catch (error) {
            updateLocalizacao.mutate({
              ordemServicoId: ordemAtual.id,
              latitude: latitude,
              longitude: longitude,
              endereco: null,
            });
          }
        },
        (error) => {
          toast.error("Erro ao obter localização: " + error.message);
        }
      );
    } else {
      toast.error("Geolocalização não suportada pelo navegador");
    }
  };

  // Upload de ficheiros para o chat
  const uploadFileMutation = trpc.upload.file.useMutation();
  const uploadImageMutation = trpc.upload.image.useMutation();

  const handleChatFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ficheiro muito grande. Máximo 10MB.");
      return;
    }

    // Criar preview para imagens
    const isImage = file.type.startsWith('image/');
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setChatAnexo({ file, preview: event.target?.result as string, uploading: false });
      };
      reader.readAsDataURL(file);
    } else {
      setChatAnexo({ file, preview: null, uploading: false });
    }
  };

  const removeChatAnexo = () => {
    setChatAnexo({ file: null, preview: null, uploading: false });
    if (chatFileInputRef.current) chatFileInputRef.current.value = "";
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };

  const handleSendChat = async () => {
    if ((!chatMessage.trim() && !chatAnexo.file) || !ordem) return;

    try {
      let anexoUrl: string | undefined;
      let anexoNome: string | undefined;
      let anexoTipo: string | undefined;
      let anexoTamanho: number | undefined;

      // Se tem anexo, fazer upload primeiro
      if (chatAnexo.file) {
        setChatAnexo(prev => ({ ...prev, uploading: true }));
        const fileData = await fileToBase64(chatAnexo.file);
        const isImage = chatAnexo.file.type.startsWith('image/');

        if (isImage) {
          const result = await uploadImageMutation.mutateAsync({
            fileName: chatAnexo.file.name,
            fileType: chatAnexo.file.type,
            fileData,
            folder: 'os-chat',
          });
          anexoUrl = result.url;
        } else {
          const result = await uploadFileMutation.mutateAsync({
            fileName: chatAnexo.file.name,
            fileType: chatAnexo.file.type,
            fileData,
            folder: 'os-chat',
          });
          anexoUrl = result.url;
        }

        anexoNome = chatAnexo.file.name;
        anexoTipo = chatAnexo.file.type;
        anexoTamanho = chatAnexo.file.size;
      }

      // Enviar mensagem
      await sendChatMessage.mutateAsync({
        ordemServicoId: ordemAtual.id,
        mensagem: chatMessage || undefined,
        anexoUrl,
        anexoNome,
        anexoTipo,
        anexoTamanho,
      });

      // Limpar campos
      setChatMessage("");
      removeChatAnexo();
      toast.success("Mensagem enviada!");
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setChatAnexo(prev => ({ ...prev, uploading: false }));
    }
  };

  const formatTempo = (dias: number, horas: number, minutos: number) => {
    const parts = [];
    if (dias > 0) parts.push(`${dias}d`);
    if (horas > 0) parts.push(`${horas}h`);
    if (minutos > 0) parts.push(`${minutos}min`);
    return parts.length > 0 ? parts.join(" ") : "-";
  };

  const calcularTempoDecorrido = () => {
    if (!ordem?.dataInicio) return "-";
    const inicio = new Date(ordemAtual.dataInicio);
    const fim = ordemAtual.dataFim ? new Date(ordemAtual.dataFim) : new Date();
    const diff = fim.getTime() - inicio.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return formatTempo(dias, horas, minutos);
  };

  const getIconComponent = (iconName: string) => {
    return iconMap[iconName] || Circle;
  };

  const copyShareLink = () => {
    if (!ordem) return;
    const link = `${window.location.origin}/compartilhado/os/${ordemAtual.protocolo}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  if (isLoadingOrdem) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (errorOrdem) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-red-500">Erro ao carregar ordem de serviço</p>
          <p className="text-gray-400 text-sm">{errorOrdem.message}</p>
          <Button onClick={() => navigate("/dashboard/ordens-servico")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
      </div>
    );
  }

  if (!ordem && !isNovaOrdem) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-500">Ordem de serviço não encontrada</p>
          <Button onClick={() => navigate("/dashboard/ordens-servico")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
      </div>
    );
  }

  // Renderizar formulário de criação para nova ordem
  if (isNovaOrdem && !ordem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Nova Ordem de Serviço</h1>
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/ordens-servico")}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Responsável */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <Label className="text-gray-700 font-semibold">Responsável *</Label>
                  <Input
                    value={editForm.responsavelPrincipalNome || ''}
                    onChange={(e) => setEditForm({ ...editForm, responsavelPrincipalNome: e.target.value })}
                    className="mt-2 border-amber-200"
                    placeholder="Nome do responsável"
                  />
                </div>
                <div>
                  <Label className="text-gray-700 font-semibold">Protocolo</Label>
                  <Input
                    value={editForm.protocolo || ''}
                    onChange={(e) => setEditForm({ ...editForm, protocolo: e.target.value })}
                    className="mt-2 border-amber-200"
                    placeholder="Número do protocolo"
                  />
                </div>
              </div>

              {/* Título */}
              <div>
                <Label className="text-gray-700 font-semibold">Título *</Label>
                <Input
                  value={editForm.titulo}
                  onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                  className="mt-2 border-amber-200"
                  placeholder="Ex: Reparo na bomba d'água"
                />
              </div>

              {/* Descrição */}
              <div>
                <Label className="text-gray-700 font-semibold">Descrição</Label>
                <Textarea
                  value={editForm.descricao}
                  onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                  className="mt-2 border-amber-200 min-h-[100px]"
                  placeholder="Descreva detalhadamente o serviço a ser realizado..."
                />
              </div>

              {/* Categoria, Prioridade, Setor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700 font-semibold">Categoria</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowGerenciarCategorias(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Select
                    value={editForm.categoriaId}
                    onValueChange={(v) => setEditForm({ ...editForm, categoriaId: v })}
                  >
                    <SelectTrigger className="mt-2 border-amber-200">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700 font-semibold">Prioridade</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowGerenciarPrioridades(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Select
                    value={editForm.prioridadeId}
                    onValueChange={(v) => setEditForm({ ...editForm, prioridadeId: v })}
                  >
                    <SelectTrigger className="mt-2 border-amber-200">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades?.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-700 font-semibold">Setor</Label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowGerenciarSetores(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <Select
                    value={editForm.setorId}
                    onValueChange={(v) => setEditForm({ ...editForm, setorId: v })}
                  >
                    <SelectTrigger className="mt-2 border-amber-200">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {setores?.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tempo Estimado */}
              <div>
                <Label className="text-gray-700 font-semibold">Tempo Estimado</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div>
                    <Label className="text-xs text-gray-500">Dias</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.tempoEstimadoDias}
                      onChange={(e) => setEditForm({ ...editForm, tempoEstimadoDias: parseInt(e.target.value) || 0 })}
                      className="border-amber-200"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Horas</Label>
                    <Input
                      type="number"
                      min="0"
                      max="23"
                      value={editForm.tempoEstimadoHoras}
                      onChange={(e) => setEditForm({ ...editForm, tempoEstimadoHoras: parseInt(e.target.value) || 0 })}
                      className="border-amber-200"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Minutos</Label>
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={editForm.tempoEstimadoMinutos}
                      onChange={(e) => setEditForm({ ...editForm, tempoEstimadoMinutos: parseInt(e.target.value) || 0 })}
                      className="border-amber-200"
                    />
                  </div>
                </div>
              </div>

              {/* Material Necessário */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-gray-700 font-semibold">Material Necessário</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAddMaterial(true)}
                    className="h-6 w-6 p-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {materiais && materiais.length > 0 ? (
                  <div className="space-y-2">
                    {materiais.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-amber-50 p-3 rounded-lg">
                        <span className="text-sm text-gray-700">{m.nome} - Qtd: {m.quantidade} {m.unidade}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            const newMateriais = materiais.filter((_, i) => i !== idx);
                            refetchMateriais();
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhum material adicionado</p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-white hover:from-amber-500 hover:to-yellow-500"
                  onClick={() => {
                    if (!editForm.titulo) {
                      alert('Por favor, preencha o título');
                      return;
                    }
                    if (!condominioAtivo?.id) {
                      alert('Nenhum condomínio selecionado');
                      return;
                    }
                    createOSMutation.mutate({
                      condominioId: condominioAtivo.id,
                      titulo: editForm.titulo,
                      descricao: editForm.descricao || undefined,
                      categoriaId: editForm.categoriaId ? parseInt(editForm.categoriaId) : undefined,
                      prioridadeId: editForm.prioridadeId ? parseInt(editForm.prioridadeId) : undefined,
                      setorId: editForm.setorId ? parseInt(editForm.setorId) : undefined,
                      tempoEstimadoDias: editForm.tempoEstimadoDias,
                      tempoEstimadoHoras: editForm.tempoEstimadoHoras,
                      tempoEstimadoMinutos: editForm.tempoEstimadoMinutos,
                    });
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Criar Ordem de Serviço
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/dashboard/ordens-servico")}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usar ordem ou objeto vazio para nova ordem
  const ordemAtual = ordem || {} as any;
  
  // Calcular progresso e ícones
  const StatusIcon = ordemAtual.status?.icone ? getIconComponent(ordemAtual.status.icone) : Circle;
  const CategoriaIcon = ordemAtual.categoria?.icone ? getIconComponent(ordemAtual.categoria.icone) : Tag;
  const PrioridadeIcon = ordemAtual.prioridade?.icone ? getIconComponent(ordemAtual.prioridade.icone) : Flag;

  return (
    <div className="min-h-screen bg-white">
        {/* Lightbox para imagens */}
        {lightboxUrl && (
          <div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
              onClick={() => setLightboxUrl(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <img
              src={lightboxUrl}
              alt="Visualização"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-2 border-amber-400 p-4 sm:p-6 rounded-b-3xl shadow-lg">
          <div className="flex items-center justify-between mb-4 gap-2">
            <Button
              variant="ghost"
              className="text-amber-600 hover:bg-amber-50"
              onClick={() => navigate("/dashboard/ordens-servico")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>

            {/* Botões visíveis em desktop */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-500 border-blue-600 text-white hover:bg-blue-600"
                onClick={copyShareLink}
              >
                <Share2 className="w-4 h-4 mr-1" />
                Compartilhar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-green-500 border-green-600 text-white hover:bg-green-600"
                onClick={() => {
                  const texto = `*Ordem de Serviço #${ordemAtual.protocolo}*%0A%0A` +
                    `*Título:* ${ordemAtual.titulo}%0A` +
                    `*Status:* ${ordemAtual.status?.nome || 'Sem status'}%0A` +
                    `*Prioridade:* ${ordemAtual.prioridade?.nome || 'Normal'}%0A` +
                    `*Categoria:* ${ordemAtual.categoria?.nome || 'Sem categoria'}%0A` +
                    (ordemAtual.descricao ? `*Descrição:* ${ordemAtual.descricao}%0A` : '') +
                    `%0A*Link:* ${window.location.origin}/os/${ordemAtual.shareToken}`;
                  window.open(`https://wa.me/?text=${texto}`, '_blank');
                }}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-500 border-red-600 text-white hover:bg-red-600"
                onClick={() => window.open(`/api/ordens-servico/${ordemAtual.id}/pdf`, '_blank')}
              >
                <FileText className="w-4 h-4 mr-1" />
                PDF
              </Button>
              <QRCodeGenerator
                tipo="os"
                id={ordemAtual.id}
                titulo={ordemAtual.titulo}
                protocolo={ordemAtual.protocolo}
              />
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-amber-400 text-amber-600 hover:bg-amber-50"
                onClick={() => setShowShareModal(true)}
              >
                <Users className="w-4 h-4 mr-1" />
                Equipe
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white border-blue-300 text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  navigate(`/dashboard/ordens-servico/nova?duplicar=${ordemAtual.id}`);
                }}
              >
                <CopyPlus className="w-4 h-4 mr-1" />
                Duplicar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-900 border-gray-900 text-white hover:bg-black"
                disabled={deleteOS.isPending}
                onClick={() => {
                  if (confirm("Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.")) {
                    deleteOS.mutate({ id: ordemAtual.id });
                  }
                }}
              >
                {deleteOS.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
                Excluir
              </Button>
              {!ordemAtual.dataInicio && (
                <Button
                  className="bg-green-500 text-white hover:bg-green-600"
                  size="sm"
                  disabled={iniciarOS.isPending}
                  onClick={() => iniciarOS.mutate({ id: ordemAtual.id })}
                >
                  {iniciarOS.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                  Iniciar
                </Button>
              )}
              {ordemAtual.dataInicio && !ordemAtual.dataFim && (
                <Button
                  className="bg-red-500 text-white hover:bg-red-600"
                  size="sm"
                  disabled={finalizarOS.isPending}
                  onClick={() => finalizarOS.mutate({ id: ordemAtual.id })}
                >
                  {finalizarOS.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Square className="w-4 h-4 mr-2" />}
                  Finalizar
                </Button>
              )}
            </div>

            {/* Menu dropdown para mobile/tablet */}
            <div className="flex lg:hidden items-center gap-2">
              {!ordemAtual.dataInicio && (
                <Button
                  className="bg-green-500 text-white hover:bg-green-600"
                  size="sm"
                  disabled={iniciarOS.isPending}
                  onClick={() => iniciarOS.mutate({ id: ordemAtual.id })}
                >
                  {iniciarOS.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                </Button>
              )}
              {ordemAtual.dataInicio && !ordemAtual.dataFim && (
                <Button
                  className="bg-red-500 text-white hover:bg-red-600"
                  size="sm"
                  disabled={finalizarOS.isPending}
                  onClick={() => finalizarOS.mutate({ id: ordemAtual.id })}
                >
                  {finalizarOS.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-amber-400 text-amber-600">
                    <Menu className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={copyShareLink}>
                    <Share2 className="w-4 h-4 mr-2" /> Compartilhar Link
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-green-600" onClick={() => {
                    const texto = `*Ordem de Serviço #${ordemAtual.protocolo}*%0A%0A` +
                      `*Título:* ${ordemAtual.titulo}%0A` +
                      `*Status:* ${ordemAtual.status?.nome || 'Sem status'}%0A` +
                      `*Prioridade:* ${ordemAtual.prioridade?.nome || 'Normal'}%0A` +
                      `*Categoria:* ${ordemAtual.categoria?.nome || 'Sem categoria'}%0A` +
                      (ordemAtual.descricao ? `*Descrição:* ${ordemAtual.descricao}%0A` : '') +
                      `%0A*Link:* ${window.location.origin}/os/${ordemAtual.shareToken}`;
                    window.open(`https://wa.me/?text=${texto}`, '_blank');
                  }}>
                    <MessageSquare className="w-4 h-4 mr-2" /> WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => window.open(`/api/ordens-servico/${ordemAtual.id}/pdf`, '_blank')}>
                    <FileText className="w-4 h-4 mr-2" /> Gerar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowShareModal(true)}>
                    <Users className="w-4 h-4 mr-2" /> Compartilhar com Equipe
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/dashboard/ordens-servico/nova?duplicar=${ordemAtual.id}`)}>
                    <CopyPlus className="w-4 h-4 mr-2" /> Duplicar OS
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-gray-900 font-medium"
                    onClick={() => {
                      if (confirm("Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.")) {
                        deleteOS.mutate({ id: ordemAtual.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-amber-50 border-2 border-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
              <CategoriaIcon className="w-8 h-8 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono bg-amber-50 border border-amber-400 text-amber-700 px-3 py-1 rounded-full">
                  #{ordemAtual.protocolo}
                </span>
                <Badge
                  style={{ backgroundColor: ordemAtual.status?.cor || "#EAB308" }}
                  className="text-white"
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {ordemAtual.status?.nome || "Sem status"}
                </Badge>
                <Badge
                  className="bg-amber-50 text-amber-700 border border-amber-400"
                  style={{ borderColor: ordemAtual.prioridade?.cor || undefined }}
                >
                  <PrioridadeIcon className="w-3 h-3 mr-1" />
                  {ordemAtual.prioridade?.nome || "Normal"}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                {ordemAtual.titulo}
              </h1>
              {ordemAtual.descricao && (
                <div className="text-gray-600 mt-1">
                  <FormatDescricao
                    texto={ordemAtual.descricao}
                    interactive
                    checkedItems={checkedItems}
                    onCheck={handleCheckItem}
                    onReport={handleOpenReport}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white border-2 border-amber-400 rounded-xl p-4">
              <div className="text-amber-600 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Tempo Estimado
              </div>
              <div className="text-lg font-bold text-gray-800">
                {formatTempo(ordemAtual.tempoEstimadoDias || 0, ordemAtual.tempoEstimadoHoras || 0, ordemAtual.tempoEstimadoMinutos || 0)}
              </div>
            </div>
            <div className="bg-white border-2 border-amber-400 rounded-xl p-4">
              <div className="text-amber-600 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Tempo Decorrido
              </div>
              <div className="text-lg font-bold text-gray-800">
                {calcularTempoDecorrido()}
              </div>
            </div>
            {configuracoes?.habilitarGestaoFinanceira && (
              <>
                <div className="bg-white border-2 border-amber-400 rounded-xl p-4">
                  <div className="text-amber-600 text-sm flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Valor estimado
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    {ordemAtual.valorEstimado ? `R$ ${parseFloat(ordemAtual.valorEstimado).toFixed(2)}` : "-"}
                  </div>
                </div>
                <div className="bg-white border-2 border-amber-400 rounded-xl p-4">
                  <div className="text-amber-600 text-sm flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    Valor Real
                  </div>
                  <div className="text-lg font-bold text-gray-800">
                    {ordemAtual.valorReal ? `R$ ${parseFloat(ordemAtual.valorReal).toFixed(2)}` : "-"}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white shadow-md rounded-xl p-1.5 mb-6 flex-wrap gap-1.5">
              <TabsTrigger 
                value="detalhes" 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white data-[state=inactive]:opacity-60 data-[state=active]:opacity-100 data-[state=active]:shadow-lg rounded-lg transition-all"
              >
                <FileText className="w-4 h-4 mr-2" />
                Detalhes
              </TabsTrigger>
              <TabsTrigger 
                value="materiais"
                className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white data-[state=inactive]:opacity-60 data-[state=active]:opacity-100 data-[state=active]:shadow-lg rounded-lg transition-all"
              >
                <Package className="w-4 h-4 mr-2" />
                Materiais
              </TabsTrigger>
              {configuracoes?.habilitarOrcamentos && (
                <TabsTrigger 
                  value="orcamentos"
                  className="bg-gradient-to-r from-emerald-500 to-green-400 text-white data-[state=inactive]:opacity-60 data-[state=active]:opacity-100 data-[state=active]:shadow-lg rounded-lg transition-all"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Orçamentos
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="responsaveis"
                className="bg-gradient-to-r from-violet-500 to-purple-400 text-white data-[state=inactive]:opacity-60 data-[state=active]:opacity-100 data-[state=active]:shadow-lg rounded-lg transition-all"
              >
                <Users className="w-4 h-4 mr-2" />
                Responsáveis
              </TabsTrigger>
              <TabsTrigger 
                value="localizacao"
                className="bg-gradient-to-r from-rose-500 to-pink-400 text-white data-[state=inactive]:opacity-60 data-[state=active]:opacity-100 data-[state=active]:shadow-lg rounded-lg transition-all"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Localização
              </TabsTrigger>
              <TabsTrigger 
                value="chat"
                className="bg-gradient-to-r from-indigo-500 to-blue-400 text-white data-[state=inactive]:opacity-60 data-[state=active]:opacity-100 data-[state=active]:shadow-lg rounded-lg transition-all relative"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Bater papo
                {chat && chat.length > 0 && activeTab !== "chat" && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-orange-500 text-white rounded-full">
                    {chat.length > 99 ? "99+" : chat.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="anexos"
                className="bg-gradient-to-r from-orange-500 to-amber-400 text-white data-[state=inactive]:opacity-60 data-[state=active]:opacity-100 data-[state=active]:shadow-lg rounded-lg transition-all"
              >
                <Paperclip className="w-4 h-4 mr-2" />
                Anexos
              </TabsTrigger>
              <TabsTrigger 
                value="timeline"
                className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white data-[state=inactive]:opacity-60 data-[state=active]:opacity-100 data-[state=active]:shadow-lg rounded-lg transition-all"
              >
                <Clock className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger 
                value="configurar"
                className="bg-gradient-to-r from-gray-600 to-slate-400 text-white data-[state=inactive]:opacity-60 data-[state=active]:opacity-100 data-[state=active]:shadow-lg rounded-lg transition-all"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </TabsTrigger>
            </TabsList>

            {/* Tab Detalhes */}
            <TabsContent value="detalhes">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Informações da OS</h2>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? handleSaveEdit() : setIsEditing(true)}
                    className={isEditing ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-white" : ""}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-gray-700">Responsável</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.responsavelPrincipalNome || ''}
                        onChange={(e) => setEditForm({ ...editForm, responsavelPrincipalNome: e.target.value })}
                        className="mt-1 border-amber-200"
                        placeholder="Nome do responsável"
                      />
                    ) : (
                      <p className="mt-1 text-gray-800">{ordemAtual.responsavelPrincipalNome || "-"}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-700">Protocolo</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.protocolo || ''}
                        onChange={(e) => setEditForm({ ...editForm, protocolo: e.target.value })}
                        className="mt-1 border-amber-200"
                        placeholder="Número do protocolo"
                      />
                    ) : (
                      <p className="mt-1 text-gray-800">{ordemAtual.protocolo || "-"}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div>
                    <Label className="text-gray-700">Título</Label>
                    {isEditing ? (
                      <Input
                        value={editForm.titulo}
                        onChange={(e) => setEditForm({ ...editForm, titulo: e.target.value })}
                        className="mt-1 border-amber-200"
                      />
                    ) : (
                      <p className="mt-1 text-gray-800">{ordemAtual.titulo}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-700">Status</Label>
                    {isEditing ? (
                      <Select
                        value={editForm.statusId}
                        onValueChange={(v) => setEditForm({ ...editForm, statusId: v })}
                      >
                        <SelectTrigger className="mt-1 border-amber-200">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusList?.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <Badge style={{ backgroundColor: ordemAtual.status?.cor || "#EAB308" }} className="text-white">
                          {ordemAtual.status?.nome || "Sem status"}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label className="text-gray-700">Descrição</Label>
                    {isEditing ? (
                      <Textarea
                        value={editForm.descricao}
                        onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                        className="mt-1 border-amber-200 min-h-[100px]"
                      />
                    ) : (
                      <div className="mt-1 text-gray-800">
                        {ordemAtual.descricao ? (
                          <FormatDescricao
                            texto={ordemAtual.descricao}
                            interactive
                            checkedItems={checkedItems}
                            onCheck={handleCheckItem}
                            onReport={handleOpenReport}
                          />
                        ) : "-"}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700">Categoria</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowGerenciarCategorias(true)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {isEditing ? (
                      <Select
                        value={editForm.categoriaId}
                        onValueChange={(v) => setEditForm({ ...editForm, categoriaId: v })}
                      >
                        <SelectTrigger className="mt-1 border-amber-200">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias?.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-gray-800">{ordemAtual.categoria?.nome || "-"}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700">Prioridade</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowGerenciarPrioridades(true)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {isEditing ? (
                      <Select
                        value={editForm.prioridadeId}
                        onValueChange={(v) => setEditForm({ ...editForm, prioridadeId: v })}
                      >
                        <SelectTrigger className="mt-1 border-amber-200">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {prioridades?.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-gray-800">{ordemAtual.prioridade?.nome || "-"}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700">Setor</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowGerenciarSetores(true)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {isEditing ? (
                      <Select
                        value={editForm.setorId}
                        onValueChange={(v) => setEditForm({ ...editForm, setorId: v })}
                      >
                        <SelectTrigger className="mt-1 border-amber-200">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {setores?.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="mt-1 text-gray-800">{ordemAtual.setor?.nome || "-"}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-gray-700">Tempo Estimado</Label>
                    {isEditing ? (
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div>
                          <Label className="text-xs text-gray-500">Dias</Label>
                          <Input
                            type="number"
                            min="0"
                            value={editForm.tempoEstimadoDias}
                            onChange={(e) => setEditForm({ ...editForm, tempoEstimadoDias: parseInt(e.target.value) || 0 })}
                            className="border-amber-200"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Horas</Label>
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={editForm.tempoEstimadoHoras}
                            onChange={(e) => setEditForm({ ...editForm, tempoEstimadoHoras: parseInt(e.target.value) || 0 })}
                            className="border-amber-200"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Minutos</Label>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={editForm.tempoEstimadoMinutos}
                            onChange={(e) => setEditForm({ ...editForm, tempoEstimadoMinutos: parseInt(e.target.value) || 0 })}
                            className="border-amber-200"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-1 text-gray-800">
                        {formatTempo(ordemAtual.tempoEstimadoDias || 0, ordemAtual.tempoEstimadoHoras || 0, ordemAtual.tempoEstimadoMinutos || 0)}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-700">Material Necessário</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAddMaterial(true)}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {!isEditing && materiais && materiais.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {materiais.map((m, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-amber-50 p-2 rounded">
                            <span className="text-sm text-gray-700">{m.nome} - Qtd: {m.quantidade}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newMateriais = materiais.filter((_, i) => i !== idx);
                                refetchMateriais();
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-gray-800">-</p>
                    )}
                  </div>

                  {configuracoes?.habilitarGestaoFinanceira && (
                    <>
                      <div>
                        <Label className="text-gray-700">Valor Estimado (R$)</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editForm.valorEstimado}
                            onChange={(e) => setEditForm({ ...editForm, valorEstimado: e.target.value })}
                            className="mt-1 border-amber-200"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">
                            {ordemAtual.valorEstimado ? `R$ ${parseFloat(ordemAtual.valorEstimado).toFixed(2)}` : "-"}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-700">Valor Real (R$)</Label>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={editForm.valorReal}
                            onChange={(e) => setEditForm({ ...editForm, valorReal: e.target.value })}
                            className="mt-1 border-amber-200"
                          />
                        ) : (
                          <p className="mt-1 text-gray-800">
                            {ordemAtual.valorReal ? `R$ ${parseFloat(ordemAtual.valorReal).toFixed(2)}` : "-"}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div>
                    <Label className="text-gray-700">Data de Criação</Label>
                    <p className="mt-1 text-gray-800">
                      {new Date(ordemAtual.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-700">Solicitante</Label>
                    <p className="mt-1 text-gray-800">{ordemAtual.solicitanteNome || "-"}</p>
                  </div>
                </div>

                {/* ===== GALERIA DE IMAGENS ===== */}
                <div className="mt-8 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-semibold text-gray-800">Imagens / Fotos</h3>
                      {ordem?.imagens && ordem.imagens.length > 0 && (
                        <Badge variant="secondary" className="ml-1">{ordem.imagens.length}</Badge>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        ref={imageFileInputRef}
                        onChange={handleImagemUpload}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        multiple
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white gap-1"
                        onClick={() => imageFileInputRef.current?.click()}
                        disabled={uploadingImagem}
                      >
                        {uploadingImagem ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> A enviar...</>
                        ) : (
                          <><Plus className="w-4 h-4" /> Adicionar Foto</>
                        )}
                      </Button>
                    </div>
                  </div>

                  {(!ordem?.imagens || ordem.imagens.length === 0) ? (
                    <div
                      className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-amber-300 hover:bg-amber-50/30 transition-all"
                      onClick={() => imageFileInputRef.current?.click()}
                    >
                      <Image className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-500 text-sm">Nenhuma imagem adicionada</p>
                      <p className="text-gray-400 text-xs mt-1">Clique aqui ou no botão acima para adicionar fotos</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {ordem.imagens.map((img: any) => (
                        <div key={img.id} className="group relative rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all aspect-square bg-gray-100">
                          <img
                            src={img.url}
                            alt={img.descricao || 'Imagem da OS'}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setLightboxUrl(img.url)}
                            loading="lazy"
                          />
                          {/* Overlay com ações */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white"
                              onClick={() => setLightboxUrl(img.url)}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0 rounded-full"
                              onClick={() => {
                                if (confirm('Remover esta imagem?')) {
                                  deletarImagemOS.mutate({ imagemId: img.id });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          {/* Label de tipo */}
                          {img.tipo && img.tipo !== 'outro' && (
                            <div className="absolute top-2 left-2">
                              <Badge className="text-[10px] px-1.5 py-0.5 bg-black/50 text-white border-0">
                                {img.tipo}
                              </Badge>
                            </div>
                          )}
                          {/* Descrição */}
                          {img.descricao && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                              <p className="text-white text-xs truncate">{img.descricao}</p>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Card para adicionar mais */}
                      <div
                        className="rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center aspect-square cursor-pointer hover:border-amber-300 hover:bg-amber-50/30 transition-all"
                        onClick={() => imageFileInputRef.current?.click()}
                      >
                        <Plus className="w-8 h-8 text-gray-300" />
                        <span className="text-xs text-gray-400 mt-1">Adicionar</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Tab Materiais */}
            <TabsContent value="materiais">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Materiais Necessários</h2>
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                    onClick={() => setShowAddMaterial(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Material
                  </Button>
                </div>

                {materiais?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 text-amber-300" />
                    <p>Nenhum material cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materiais?.map((material: any) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 bg-amber-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <Package className="w-5 h-5 text-amber-600" />
                          <div>
                            <p className="font-medium text-gray-800">{material.nome}</p>
                            <p className="text-sm text-gray-500">
                              Quantidade: {material.quantidade} {material.unidade}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {material.emEstoque ? (
                            <Badge className="bg-green-100 text-green-700">Em Estoque</Badge>
                          ) : material.precisaPedir ? (
                            <Badge className="bg-red-100 text-red-700">Precisa Pedir</Badge>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteMaterial.mutate({ id: material.id, ordemServicoId: ordem?.id || 0 })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Orçamentos */}
            {configuracoes?.habilitarOrcamentos && (
              <TabsContent value="orcamentos">
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-800">Orçamentos</h2>
                    <Button
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                      onClick={() => setShowAddOrcamento(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Orçamento
                    </Button>
                  </div>

                  {orcamentos?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <DollarSign className="w-12 h-12 mx-auto mb-2 text-amber-300" />
                      <p>Nenhum orçamento cadastrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orcamentos?.map((orcamento: any) => (
                        <div
                          key={orcamento.id}
                          className="flex items-center justify-between p-4 bg-amber-50 rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{orcamento.descricao}</p>
                            <p className="text-sm text-gray-500">
                              Fornecedor: {orcamento.fornecedor || "-"}
                            </p>
                            <p className="text-lg font-bold text-amber-600">
                              R$ {parseFloat(orcamento.valor).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {orcamento.aprovado ? (
                              <Badge className="bg-green-100 text-green-700">Aprovado</Badge>
                            ) : orcamento.rejeitado ? (
                              <Badge className="bg-red-100 text-red-700">Rejeitado</Badge>
                            ) : configuracoes?.habilitarAprovacaoOrcamento ? (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-500 text-white hover:bg-green-600"
                                  onClick={() => aprovarOrcamento.mutate({ id: orcamento.id, ordemServicoId: ordem?.id || 0 })}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                  onClick={() => rejeitarOrcamento.mutate({ id: orcamento.id, ordemServicoId: ordem?.id || 0 })}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            ) : null}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => deleteOrcamento.mutate({ id: orcamento.id, ordemServicoId: ordem?.id || 0 })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            )}

            {/* Tab Responsáveis */}
            <TabsContent value="responsaveis">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Responsáveis</h2>
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                    onClick={() => setShowAddResponsavel(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Responsável
                  </Button>
                </div>

                {responsaveis?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-amber-300" />
                    <p>Nenhum responsável cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {responsaveis?.map((resp: any) => (
                      <div
                        key={resp.id}
                        className="flex items-center justify-between p-4 bg-amber-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-amber-700" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{resp.nome}</p>
                            <p className="text-sm text-gray-500">
                              {resp.cargo || "-"} {resp.setor ? `• ${resp.setor.nome}` : ""}
                            </p>
                            {resp.telefone && (
                              <p className="text-sm text-amber-600">{resp.telefone}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteResponsavel.mutate({ id: resp.id, ordemServicoId: ordem?.id || 0 })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Localização */}
            <TabsContent value="localizacao">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Localização</h2>
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                    onClick={handleGetLocation}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Obter Localização
                  </Button>
                </div>

                {ordemAtual.latitude && ordemAtual.longitude ? (
                  <div className="space-y-4">
                    <div className="bg-amber-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-amber-600" />
                        <span className="font-medium text-gray-800">Coordenadas</span>
                      </div>
                      <p className="text-gray-600">
                        Latitude: {ordemAtual.latitude}
                        <br />
                        Longitude: {ordemAtual.longitude}
                      </p>
                      {ordemAtual.endereco && (
                        <p className="mt-2 text-gray-800">{ordemAtual.endereco}</p>
                      )}
                    </div>

                    {/* Mapa OpenStreetMap */}
                    <div className="rounded-xl overflow-hidden h-[400px]">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(ordemAtual.longitude) - 0.01},${parseFloat(ordemAtual.latitude) - 0.01},${parseFloat(ordemAtual.longitude) + 0.01},${parseFloat(ordemAtual.latitude) + 0.01}&layer=mapnik&marker=${ordemAtual.latitude},${ordemAtual.longitude}`}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`https://www.google.com/maps?q=${ordemAtual.latitude},${ordemAtual.longitude}`, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir no Google Maps
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`https://waze.com/ul?ll=${ordemAtual.latitude},${ordemAtual.longitude}&navigate=yes`, "_blank")}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Abrir no Waze
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-amber-300" />
                    <p>Nenhuma localização definida</p>
                    <p className="text-sm mt-1">Clique em "Obter Localização" para capturar automaticamente</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Chat */}
            <TabsContent value="chat">
              <div className="bg-white rounded-2xl shadow-md p-6">
                {/* Header do Chat com membros da equipe */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Bater papo</h2>
                  
                  {/* Membros da equipe */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Equipe:</span>
                    {responsaveis?.length === 0 ? (
                      <span className="text-sm text-amber-600 italic">Nenhum membro atribuído</span>
                    ) : (
                      <div className="flex -space-x-2">
                        {responsaveis?.slice(0, 5).map((resp: any) => (
                          <div
                            key={resp.id}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm"
                            title={resp.membro?.nome || 'Membro'}
                          >
                            {(resp.membro?.nome || 'M').charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {responsaveis && responsaveis.length > 5 && (
                          <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                            +{responsaveis.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Aviso se não houver membros */}
                {responsaveis?.length === 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Nenhum membro na equipe</p>
                        <p className="text-xs text-amber-600 mt-1">
                          Adicione membros na aba "Responsáveis" para facilitar a comunicação da equipe.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  ref={chatContainerRef}
                  className="h-[400px] overflow-y-auto bg-gray-50 rounded-xl p-4 mb-4 space-y-3"
                >
                  {chat?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-amber-300" />
                      <p>Nenhuma mensagem ainda</p>
                      <p className="text-sm mt-1">Inicie uma conversa com a equipe!</p>
                    </div>
                  ) : (
                    chat?.map((msg) => (
                      <div
                        key={msg.id}
                        className="flex gap-3"
                      >
                        {/* Avatar do remetente */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                          {(msg.remetenteNome || 'U').charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Conteúdo da mensagem */}
                        <div className="flex-1 bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800">{msg.remetenteNome}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(msg.createdAt).toLocaleString("pt-BR")}
                            </span>
                          </div>
                          {msg.mensagem && <p className="text-gray-600">{msg.mensagem}</p>}
                        
                        {/* Mostrar anexo se existir */}
                        {msg.anexoUrl && (
                          <div className="mt-2">
                            {msg.anexoTipo?.startsWith('image/') ? (
                              <div className="relative group">
                                <img
                                  src={msg.anexoUrl}
                                  alt={msg.anexoNome || 'Imagem'}
                                  className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => setLightboxUrl(msg.anexoUrl!)}
                                />
                                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-white/90 hover:bg-white"
                                    onClick={() => setLightboxUrl(msg.anexoUrl!)}
                                  >
                                    <Image className="w-3 h-3 mr-1" />
                                    Ampliar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <a
                                href={msg.anexoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors max-w-xs"
                              >
                                <File className="w-8 h-8 text-amber-500 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-gray-700 truncate">
                                    {msg.anexoNome || 'Ficheiro'}
                                  </p>
                                  {msg.anexoTamanho && (
                                    <p className="text-xs text-gray-500">
                                      {(msg.anexoTamanho / 1024).toFixed(1)} KB
                                    </p>
                                  )}
                                </div>
                                <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              </a>
                            )}
                          </div>
                        )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Preview do anexo selecionado */}
                {chatAnexo.file && (
                  <div className="mb-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3">
                      {chatAnexo.preview ? (
                        <img
                          src={chatAnexo.preview}
                          alt="Preview"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-amber-100 rounded-lg flex items-center justify-center">
                          <File className="w-8 h-8 text-amber-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 truncate">{chatAnexo.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(chatAnexo.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeChatAnexo}
                        disabled={chatAnexo.uploading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {/* Input de ficheiro oculto */}
                  <input
                    ref={chatFileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleChatFileSelect}
                  />
                  
                  {/* Botão de anexar */}
                  <Button
                    variant="outline"
                    className="border-amber-200 hover:bg-amber-50"
                    onClick={() => chatFileInputRef.current?.click()}
                    disabled={chatAnexo.uploading}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendChat()}
                    className="flex-1 border-amber-200"
                    disabled={chatAnexo.uploading}
                  />
                  <Button
                    className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                    onClick={handleSendChat}
                    disabled={(!chatMessage.trim() && !chatAnexo.file) || chatAnexo.uploading}
                  >
                    {chatAnexo.uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-gray-400 mt-2">
                  Formatos aceites: Imagens, PDF, Word, Excel, TXT (máx. 10MB)
                </p>
              </div>
            </TabsContent>

            {/* Tab Anexos */}
            <TabsContent value="anexos">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">Anexos</h2>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        for (const file of files) {
                          if (file.size > 100 * 1024 * 1024) {
                            toast.error(`Arquivo muito grande (máx 100MB): ${file.name}`);
                            continue;
                          }
                          try {
                            const reader = new FileReader();
                            reader.onload = async () => {
                              const base64 = (reader.result as string).split(",")[1];
                              await uploadAnexo.mutateAsync({
                                ordemServicoId: osId,
                                fileName: file.name,
                                fileType: file.type,
                                fileData: base64,
                              });
                            };
                            reader.readAsDataURL(file);
                          } catch (error) {
                            toast.error(`Erro ao enviar ${file.name}`);
                          }
                        }
                      }}
                    />
                    <Button className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white" asChild>
                      <span>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Anexo
                      </span>
                    </Button>
                  </label>
                </div>

                {!anexos || anexos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Paperclip className="w-16 h-16 mx-auto mb-4 text-amber-200" />
                    <p className="text-lg font-medium">Nenhum anexo</p>
                    <p className="text-sm mt-1">Clique em "Adicionar Anexo" para enviar documentos</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {anexos.map((anexo: any) => (
                      <div
                        key={anexo.id}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                            anexo.tipo === "application/pdf" ? "bg-red-500" :
                            anexo.tipo?.includes("word") ? "bg-blue-500" :
                            anexo.tipo?.includes("excel") || anexo.tipo?.includes("spreadsheet") ? "bg-green-500" :
                            anexo.tipo?.startsWith("image/") ? "bg-purple-500" : "bg-gray-500"
                          }`}>
                            {anexo.tipo === "application/pdf" ? "PDF" :
                             anexo.tipo?.includes("word") ? "DOC" :
                             anexo.tipo?.includes("excel") || anexo.tipo?.includes("spreadsheet") ? "XLS" :
                             anexo.tipo?.startsWith("image/") ? "IMG" : "FILE"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 truncate max-w-[300px]">
                              {anexo.nome}
                            </p>
                            <p className="text-sm text-gray-500">
                              {anexo.tamanho < 1024 ? anexo.tamanho + " B" :
                               anexo.tamanho < 1024 * 1024 ? (anexo.tamanho / 1024).toFixed(1) + " KB" :
                               (anexo.tamanho / (1024 * 1024)).toFixed(1) + " MB"}
                              {" • "}
                              {new Date(anexo.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {anexo.tipo?.startsWith("image/") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-purple-300 text-purple-600 hover:bg-purple-50"
                              onClick={() => setLightboxUrl(anexo.url)}
                            >
                              <Image className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-amber-300 text-amber-600 hover:bg-amber-50"
                            onClick={() => window.open(anexo.url, "_blank")}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Baixar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={async () => {
                              if (confirm("Tem certeza que deseja remover este anexo?")) {
                                await deleteAnexo.mutateAsync({ anexoId: anexo.id });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Timeline */}
            <TabsContent value="timeline">
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Histórico</h2>

                {timeline?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-2 text-amber-300" />
                    <p>Nenhum evento registrado</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-amber-200" />
                    <div className="space-y-6">
                      {timeline?.map((evento: any) => (
                        <div key={evento.id} className="relative pl-10">
                          <div className="absolute left-2 w-5 h-5 bg-amber-400 rounded-full border-4 border-white" />
                          <div className="bg-amber-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-800">{humanizeTipoEvento(evento.tipo)}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(evento.createdAt).toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <p className="text-gray-600">{evento.descricao}</p>
                            {(evento.usuarioNome || evento.autorNome) && (
                              <p className="text-sm text-amber-600 mt-1">Por: {evento.usuarioNome || evento.autorNome}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tab Configurar */}
            <TabsContent value="configurar">
              <div className="grid grid-cols-2 gap-6">
                {/* Categorias */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-amber-500" />
                      Categorias
                    </h3>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                      onClick={() => setShowGerenciarCategorias(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {categorias?.map((cat) => {
                      const Icon = cat.icone ? getIconComponent(cat.icone) : Tag;
                      return (
                        <div
                          key={cat.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: cat.cor || undefined }} />
                            <span>{cat.nome}</span>
                          </div>
                          {!cat.isPadrao && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500"
                              onClick={() => deleteCategoria.mutate({ id: cat.id })}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Prioridades */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Flag className="w-5 h-5 text-amber-500" />
                      Prioridades
                    </h3>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                      onClick={() => setShowGerenciarPrioridades(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {prioridades?.map((pri) => {
                      const Icon = pri.icone ? getIconComponent(pri.icone) : Flag;
                      return (
                        <div
                          key={pri.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: pri.cor || undefined }} />
                            <span>{pri.nome}</span>
                          </div>
                          {!pri.isPadrao && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500"
                              onClick={() => deletePrioridade.mutate({ id: pri.id })}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Circle className="w-5 h-5 text-amber-500" />
                      Status
                    </h3>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                      onClick={() => setShowGerenciarStatus(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {statusList?.map((st) => {
                      const Icon = st.icone ? getIconComponent(st.icone) : Circle;
                      return (
                        <div
                          key={st.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: st.cor || undefined }} />
                            <span>{st.nome}</span>
                          </div>
                          {!st.isPadrao && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500"
                              onClick={() => deleteStatus.mutate({ id: st.id })}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Setores */}
                <div className="bg-white rounded-2xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-500" />
                      Setores
                    </h3>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                      onClick={() => setShowGerenciarSetores(true)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {setores?.map((setor) => (
                      <div
                        key={setor.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <span>{setor.nome}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={() => deleteSetor.mutate({ id: setor.id })}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal Adicionar Categoria */}
        <Dialog open={showGerenciarCategorias} onOpenChange={setShowGerenciarCategorias}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-white" />
                  </div>
                  Nova Categoria
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={novaCategoria.nome}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Cor</Label>
                <Input
                  type="color"
                  value={novaCategoria.cor}
                  onChange={(e) => setNovaCategoria({ ...novaCategoria, cor: e.target.value })}
                  className="mt-1 h-10 border-amber-200"
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <Select
                  value={novaCategoria.icone}
                  onValueChange={(v) => setNovaCategoria({ ...novaCategoria, icone: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!condominioAtivo?.id || !novaCategoria.nome) return;
                  createCategoria.mutate({
                    condominioId: condominioAtivo.id,
                    nome: novaCategoria.nome,
                    cor: novaCategoria.cor,
                    icone: novaCategoria.icone,
                  });
                  setNovaCategoria({ nome: "", cor: "#EAB308", icone: "Tag" });
                  setShowGerenciarCategorias(false);
                }}
              >
                Criar Categoria
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Prioridade */}
        <Dialog open={showGerenciarPrioridades} onOpenChange={setShowGerenciarPrioridades}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Flag className="w-5 h-5 text-white" />
                  </div>
                  Nova Prioridade
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={novaPrioridade.nome}
                  onChange={(e) => setNovaPrioridade({ ...novaPrioridade, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Cor</Label>
                <Input
                  type="color"
                  value={novaPrioridade.cor}
                  onChange={(e) => setNovaPrioridade({ ...novaPrioridade, cor: e.target.value })}
                  className="mt-1 h-10 border-amber-200"
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <Select
                  value={novaPrioridade.icone}
                  onValueChange={(v) => setNovaPrioridade({ ...novaPrioridade, icone: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridadeIconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ordem</Label>
                <Input
                  type="number"
                  min="1"
                  value={novaPrioridade.ordem}
                  onChange={(e) => setNovaPrioridade({ ...novaPrioridade, ordem: parseInt(e.target.value) || 1 })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!condominioAtivo?.id || !novaPrioridade.nome) return;
                  createPrioridade.mutate({
                    condominioId: condominioAtivo.id,
                    nome: novaPrioridade.nome,
                    cor: novaPrioridade.cor,
                    icone: novaPrioridade.icone,
                    
                  });
                  setNovaPrioridade({ nome: "", cor: "#EAB308", icone: "Minus", ordem: 1 });
                  setShowGerenciarPrioridades(false);
                }}
              >
                Criar Prioridade
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Status */}
        <Dialog open={showGerenciarStatus} onOpenChange={setShowGerenciarStatus}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Circle className="w-5 h-5 text-white" />
                  </div>
                  Novo Status
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={novoStatus.nome}
                  onChange={(e) => setNovoStatus({ ...novoStatus, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Cor</Label>
                <Input
                  type="color"
                  value={novoStatus.cor}
                  onChange={(e) => setNovoStatus({ ...novoStatus, cor: e.target.value })}
                  className="mt-1 h-10 border-amber-200"
                />
              </div>
              <div>
                <Label>Ícone</Label>
                <Select
                  value={novoStatus.icone}
                  onValueChange={(v) => setNovoStatus({ ...novoStatus, icone: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusIconOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="w-4 h-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ordem</Label>
                <Input
                  type="number"
                  min="1"
                  value={novoStatus.ordem}
                  onChange={(e) => setNovoStatus({ ...novoStatus, ordem: parseInt(e.target.value) || 1 })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!condominioAtivo?.id || !novoStatus.nome) return;
                  createStatus.mutate({
                    condominioId: condominioAtivo.id,
                    nome: novoStatus.nome,
                    cor: novoStatus.cor,
                    icone: novoStatus.icone,
                    
                  });
                  setNovoStatus({ nome: "", cor: "#EAB308", icone: "Circle", ordem: 1 });
                  setShowGerenciarStatus(false);
                }}
              >
                Criar Status
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Setor */}
        <Dialog open={showGerenciarSetores} onOpenChange={setShowGerenciarSetores}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  Novo Setor
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={novoSetor.nome}
                  onChange={(e) => setNovoSetor({ ...novoSetor, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!condominioAtivo?.id || !novoSetor.nome) return;
                  createSetor.mutate({
                    condominioId: condominioAtivo.id,
                    nome: novoSetor.nome,
                  });
                  setNovoSetor({ nome: "" });
                  setShowGerenciarSetores(false);
                }}
              >
                Criar Setor
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Material */}
        <Dialog open={showAddMaterial} onOpenChange={setShowAddMaterial}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  Adicionar Material
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome do Material</Label>
                <Input
                  value={novoMaterial.nome}
                  onChange={(e) => setNovoMaterial({ ...novoMaterial, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={novoMaterial.quantidade}
                    onChange={(e) => setNovoMaterial({ ...novoMaterial, quantidade: parseInt(e.target.value) || 1 })}
                    className="mt-1 border-amber-200"
                  />
                </div>
                <div>
                  <Label>Unidade</Label>
                  <Select
                    value={novoMaterial.unidade}
                    onValueChange={(v) => setNovoMaterial({ ...novoMaterial, unidade: v })}
                  >
                    <SelectTrigger className="mt-1 border-amber-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="un">Unidade</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="m">Metro</SelectItem>
                      <SelectItem value="m2">m²</SelectItem>
                      <SelectItem value="l">Litro</SelectItem>
                      <SelectItem value="cx">Caixa</SelectItem>
                      <SelectItem value="pc">Peça</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={novoMaterial.emEstoque}
                    onCheckedChange={(checked) => setNovoMaterial({ ...novoMaterial, emEstoque: checked, precisaPedir: checked ? false : novoMaterial.precisaPedir })}
                  />
                  <Label>Em Estoque</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={novoMaterial.precisaPedir}
                    onCheckedChange={(checked) => setNovoMaterial({ ...novoMaterial, precisaPedir: checked, emEstoque: checked ? false : novoMaterial.emEstoque })}
                  />
                  <Label>Precisa Pedir</Label>
                </div>
              </div>
              <div>
                <Label>Observação</Label>
                <Textarea
                  value={novoMaterial.observacao}
                  onChange={(e) => setNovoMaterial({ ...novoMaterial, observacao: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!novoMaterial.nome) return;
                  addMaterial.mutate({
                    ordemServicoId: ordemAtual.id,
                    nome: novoMaterial.nome,
                    quantidade: novoMaterial.quantidade,
                    unidade: novoMaterial.unidade,
                    emEstoque: novoMaterial.emEstoque,
                    precisaPedir: novoMaterial.precisaPedir,
                    pedidoDescricao: novoMaterial.observacao || undefined,
                  });
                  setNovoMaterial({ nome: "", quantidade: 1, unidade: "un", emEstoque: true, precisaPedir: false, observacao: "" });
                }}
              >
                Adicionar Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Orçamento */}
        <Dialog open={showAddOrcamento} onOpenChange={setShowAddOrcamento}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  Adicionar Orçamento
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Descrição</Label>
                <Input
                  value={novoOrcamento.descricao}
                  onChange={(e) => setNovoOrcamento({ ...novoOrcamento, descricao: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={novoOrcamento.valor}
                  onChange={(e) => setNovoOrcamento({ ...novoOrcamento, valor: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Fornecedor</Label>
                <Input
                  value={novoOrcamento.fornecedor}
                  onChange={(e) => setNovoOrcamento({ ...novoOrcamento, fornecedor: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!novoOrcamento.descricao || !novoOrcamento.valor) return;
                  addOrcamento.mutate({
                    ordemServicoId: ordemAtual.id,
                    descricao: novoOrcamento.descricao,
                    valor: novoOrcamento.valor,
                    fornecedor: novoOrcamento.fornecedor || undefined,
                  });
                  setNovoOrcamento({ descricao: "", valor: "", fornecedor: "" });
                }}
              >
                Adicionar Orçamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal Adicionar Responsável */}
        <Dialog open={showAddResponsavel} onOpenChange={setShowAddResponsavel}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-hidden p-0">
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4">
              <DialogHeader className="space-y-1">
                <DialogTitle className="flex items-center gap-2 text-white text-lg">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Adicionar Responsável
                </DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-4">
              <div>
                <Label>Nome</Label>
                <Input
                  value={novoResponsavel.nome}
                  onChange={(e) => setNovoResponsavel({ ...novoResponsavel, nome: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Cargo</Label>
                <Input
                  value={novoResponsavel.cargo}
                  onChange={(e) => setNovoResponsavel({ ...novoResponsavel, cargo: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  value={novoResponsavel.telefone}
                  onChange={(e) => setNovoResponsavel({ ...novoResponsavel, telefone: e.target.value })}
                  className="mt-1 border-amber-200"
                />
              </div>
              <div>
                <Label>Setor</Label>
                <Select
                  value={novoResponsavel.setorId}
                  onValueChange={(v) => setNovoResponsavel({ ...novoResponsavel, setorId: v })}
                >
                  <SelectTrigger className="mt-1 border-amber-200">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {setores?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-gradient-to-r from-amber-400 to-yellow-400 text-white"
                onClick={() => {
                  if (!novoResponsavel.nome) return;
                  addResponsavel.mutate({
                    ordemServicoId: ordemAtual.id,
                    nome: novoResponsavel.nome,
                    cargo: novoResponsavel.cargo || undefined,
                    telefone: novoResponsavel.telefone || undefined,
                  });
                  setNovoResponsavel({ nome: "", cargo: "", telefone: "", setorId: "" });
                }}
              >
                Adicionar Responsável
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Reportar Problema */}
        <Dialog open={reportModal.open} onOpenChange={(open) => !open && setReportModal((prev) => ({ ...prev, open: false }))}>
          <DialogContent className="w-[95vw] max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Reportar Problema
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Item referenciado */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <Label className="text-xs text-red-500 font-medium">Item com problema:</Label>
                <p className="text-sm text-gray-800 mt-1">{reportModal.itemText}</p>
              </div>

              {/* Descrição do problema */}
              <div>
                <Label className="text-gray-700">Descrição do Problema</Label>
                <Textarea
                  placeholder="Descreva o problema encontrado..."
                  value={reportModal.descricao}
                  onChange={(e) => setReportModal((prev) => ({ ...prev, descricao: e.target.value }))}
                  className="mt-1 min-h-[100px] border-red-200 focus:border-red-400"
                />
              </div>

              {/* Upload de foto */}
              <div>
                <Label className="text-gray-700">Foto (opcional)</Label>
                <input
                  ref={reportFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleReportFotoSelect}
                />
                {reportModal.fotoPreview ? (
                  <div className="relative mt-2">
                    <img
                      src={reportModal.fotoPreview}
                      alt="Preview"
                      className="w-full max-h-48 object-cover rounded-lg border border-red-200"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={() => setReportModal((prev) => ({ ...prev, foto: null, fotoPreview: null }))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="mt-1 w-full border-dashed border-red-300 text-red-500 hover:bg-red-50"
                    onClick={() => reportFileRef.current?.click()}
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Adicionar Foto
                  </Button>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setReportModal((prev) => ({ ...prev, open: false }))}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  disabled={!reportModal.descricao.trim() || reportModal.enviando}
                  onClick={async () => {
                    if (!reportModal.descricao.trim() || !ordem) return;
                    setReportModal((prev) => ({ ...prev, enviando: true }));
                    try {
                      let anexoUrl: string | undefined;
                      let anexoNome: string | undefined;
                      let anexoTipo: string | undefined;
                      let anexoTamanho: number | undefined;

                      if (reportModal.foto) {
                        const fileData = await fileToBase64(reportModal.foto);
                        const result = await uploadImageMutation.mutateAsync({
                          fileName: reportModal.foto.name,
                          fileType: reportModal.foto.type,
                          fileData,
                          folder: 'os-reports',
                        });
                        anexoUrl = result.url;
                        anexoNome = reportModal.foto.name;
                        anexoTipo = reportModal.foto.type;
                        anexoTamanho = reportModal.foto.size;
                      }

                      await sendChatMessage.mutateAsync({
                        ordemServicoId: osId,
                        mensagem: `⚠️ *PROBLEMA REPORTADO*\n📌 Item: ${reportModal.itemText}\n📝 ${reportModal.descricao}`,
                        ...(anexoUrl ? { anexoUrl, anexoNome, anexoTipo, anexoTamanho } : {}),
                      });

                      toast.success("Problema reportado com sucesso!");
                      setReportModal({ open: false, itemText: "", descricao: "", foto: null, fotoPreview: null, enviando: false });
                      refetchChat();
                    } catch (err: any) {
                      toast.error("Erro ao reportar: " + err.message);
                      setReportModal((prev) => ({ ...prev, enviando: false }));
                    }
                  }}
                >
                  {reportModal.enviando ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</>
                  ) : (
                    <><AlertTriangle className="w-4 h-4 mr-2" /> Enviar Relatório</>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ShareModal para compartilhamento com equipe */}
        {showShareModal && ordem && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            tipo="ordem-servico"
            itemId={ordem.id}
            itemTitulo={ordem.titulo || "Ordem de Serviço"}
            itemProtocolo={ordem.protocolo || ""}
            condominioId={ordem.condominioId || 0}
          />
        )}
    </div>
  );
}
