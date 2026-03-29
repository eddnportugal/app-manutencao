import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { prepareImageForUpload } from "@/lib/imageCompressor";
import { useLocation } from "wouter";
import { toast } from "@/components/ui/sonner";
import { motion } from "framer-motion";
import {
  CheckSquare,
  Wrench,
  AlertTriangle,
  Search,
  ClipboardList,
  Loader2,
  ImageIcon,
  X,
  MapPin,
  Clock,
  Calendar,
  FileText,
  History,
  Navigation,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { EnvioMulticanalModal } from "./EnvioMulticanalModal";

type FuncaoRapidaTipo = "checklist" | "manutencao" | "ocorrencia" | "vistoria";

interface FuncaoRapidaConfig {
  tipo: FuncaoRapidaTipo;
  label: string;
  labelSingular: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const funcoesConfig: FuncaoRapidaConfig[] = [
  {
    tipo: "checklist",
    label: "Checklists",
    labelSingular: "Checklist Rápido",
    icon: CheckSquare,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-100 dark:border-blue-800",
  },
  {
    tipo: "manutencao",
    label: "Manutenções",
    labelSingular: "Manutenção Rápida",
    icon: Wrench,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-100 dark:border-orange-800",
  },
  {
    tipo: "ocorrencia",
    label: "Ocorrências",
    labelSingular: "Ocorrência Rápida",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-100 dark:border-red-800",
  },
  {
    tipo: "vistoria",
    label: "Vistorias",
    labelSingular: "Vistoria Rápida",
    icon: Search,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-100 dark:border-emerald-800",
  },
];

interface GeoLocation {
  latitude: number;
  longitude: number;
  endereco: string;
}

interface HistoricoItem {
  id: number;
  protocolo: string;
  titulo: string;
  descricao?: string | null;
  tipo: FuncaoRapidaTipo;
  status: string;
  latitude?: string | null;
  longitude?: string | null;
  enderecoGeo?: string | null;
  createdAt: Date;
}

interface FuncoesRapidasProps {
  condominioId: number;
}

// Componente para download de PDF
function DownloadPdfButton({ tipo, id, protocolo }: { tipo: FuncaoRapidaTipo; id: number; protocolo: string }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const generateVistoriaPdf = trpc.vistoria.generatePdf.useMutation();
  const generateManutencaoPdf = trpc.manutencao.generatePdf.useMutation();
  const generateOcorrenciaPdf = trpc.ocorrencia.generatePdf.useMutation();
  const generateChecklistPdf = trpc.checklist.generatePdf.useMutation();
  
  const handleDownload = async () => {
    setIsLoading(true);
    try {
      let pdfBase64: string | undefined;
      
      switch (tipo) {
        case "vistoria":
          const vistoriaResult = await generateVistoriaPdf.mutateAsync({ id });
          pdfBase64 = vistoriaResult.pdf;
          break;
        case "manutencao":
          const manutencaoResult = await generateManutencaoPdf.mutateAsync({ id });
          pdfBase64 = manutencaoResult.pdf;
          break;
        case "ocorrencia":
          const ocorrenciaResult = await generateOcorrenciaPdf.mutateAsync({ id });
          pdfBase64 = ocorrenciaResult.pdf;
          break;
        case "checklist":
          const checklistResult = await generateChecklistPdf.mutateAsync({ id });
          pdfBase64 = checklistResult.pdf;
          break;
      }
      
      if (pdfBase64) {
        // Converter base64 para blob e fazer download
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${protocolo}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success("PDF gerado com sucesso!");
      }
    } catch (error) {
      toast.error("Erro ao gerar PDF");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      disabled={isLoading}
      title="Baixar PDF"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
    </Button>
  );
}

export default function FuncoesRapidas({ condominioId }: FuncoesRapidasProps) {
  const [, setLocation] = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [funcaoSelecionada, setFuncaoSelecionada] = useState<FuncaoRapidaConfig | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagens, setImagens] = useState<string[]>([]);
  const [itemCriado, setItemCriado] = useState<{
    id: number;
    protocolo: string;
    tipo: FuncaoRapidaTipo;
  } | null>(null);
  const [envioModalOpen, setEnvioModalOpen] = useState(false);
  
  // Geolocalização
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  
  // Histórico
  const [showHistorico, setShowHistorico] = useState(false);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [historicoFiltrado, setHistoricoFiltrado] = useState<HistoricoItem[]>([]);
  
  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroPeriodo, setFiltroPeriodo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [pesquisaTexto, setPesquisaTexto] = useState<string>("");
  
  // Ordenação
  const [ordenarPor, setOrdenarPor] = useState<string>("data");
  const [ordemCrescente, setOrdemCrescente] = useState<boolean>(false);

  const utils = trpc.useUtils();

  // Buscar histórico
  const { data: checklistsData } = trpc.checklist.list.useQuery(
    { condominioId },
    { enabled: showHistorico }
  );
  const { data: manutencoesData } = trpc.manutencao.list.useQuery(
    { condominioId },
    { enabled: showHistorico }
  );
  const { data: ocorrenciasData } = trpc.ocorrencia.list.useQuery(
    { condominioId },
    { enabled: showHistorico }
  );
  const { data: vistoriasData } = trpc.vistoria.list.useQuery(
    { condominioId },
    { enabled: showHistorico }
  );

  // Combinar e ordenar histórico
  useEffect(() => {
    if (showHistorico) {
      const items: HistoricoItem[] = [];
      
      if (checklistsData) {
        checklistsData.forEach((item) => {
          items.push({
            id: item.id,
            protocolo: item.protocolo,
            titulo: item.titulo,
            descricao: item.descricao,
            tipo: "checklist",
            status: item.status,
            latitude: item.latitude,
            longitude: item.longitude,
            enderecoGeo: item.enderecoGeo,
            createdAt: new Date(item.createdAt),
          });
        });
      }
      
      if (manutencoesData) {
        manutencoesData.forEach((item) => {
          items.push({
            id: item.id,
            protocolo: item.protocolo,
            titulo: item.titulo,
            descricao: item.descricao,
            tipo: "manutencao",
            status: item.status,
            latitude: item.latitude,
            longitude: item.longitude,
            enderecoGeo: item.enderecoGeo,
            createdAt: new Date(item.createdAt),
          });
        });
      }
      
      if (ocorrenciasData) {
        ocorrenciasData.forEach((item) => {
          items.push({
            id: item.id,
            protocolo: item.protocolo,
            titulo: item.titulo,
            descricao: item.descricao,
            tipo: "ocorrencia",
            status: item.status,
            latitude: item.latitude,
            longitude: item.longitude,
            enderecoGeo: item.enderecoGeo,
            createdAt: new Date(item.createdAt),
          });
        });
      }
      
      if (vistoriasData) {
        vistoriasData.forEach((item) => {
          items.push({
            id: item.id,
            protocolo: item.protocolo,
            titulo: item.titulo,
            descricao: item.descricao,
            tipo: "vistoria",
            status: item.status,
            latitude: item.latitude,
            longitude: item.longitude,
            enderecoGeo: item.enderecoGeo,
            createdAt: new Date(item.createdAt),
          });
        });
      }
      
      // Ordenar por data decrescente
      items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setHistorico(items); // Guardar todos os itens
    }
  }, [showHistorico, checklistsData, manutencoesData, ocorrenciasData, vistoriasData]);

  // Aplicar filtros ao histórico
  useEffect(() => {
    let filtered = [...historico];
    
    // Filtro por tipo
    if (filtroTipo !== "todos") {
      filtered = filtered.filter(item => item.tipo === filtroTipo);
    }
    
    // Filtro por período
    if (filtroPeriodo !== "todos") {
      const now = new Date();
      let dataLimite: Date;
      
      switch (filtroPeriodo) {
        case "hoje":
          dataLimite = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "semana":
          dataLimite = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "mes":
          dataLimite = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "trimestre":
          dataLimite = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dataLimite = new Date(0);
      }
      
      filtered = filtered.filter(item => item.createdAt >= dataLimite);
    }
    
    // Filtro por status
    if (filtroStatus !== "todos") {
      filtered = filtered.filter(item => item.status === filtroStatus);
    }
    
    // Pesquisa por texto (título ou protocolo)
    if (pesquisaTexto.trim()) {
      const termo = pesquisaTexto.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.titulo.toLowerCase().includes(termo) ||
        item.protocolo.toLowerCase().includes(termo) ||
        (item.descricao && item.descricao.toLowerCase().includes(termo))
      );
    }
    
    // Ordenação
    const statusOrdem: Record<string, number> = {
      "pendente": 1,
      "realizada": 2,
      "finalizada": 3,
      "acao_necessaria": 4,
      "reaberta": 5,
    };
    
    const tipoOrdem: Record<string, number> = {
      "checklist": 1,
      "manutencao": 2,
      "ocorrencia": 3,
      "vistoria": 4,
    };
    
    filtered.sort((a, b) => {
      let comparacao = 0;
      
      switch (ordenarPor) {
        case "data":
          comparacao = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case "tipo":
          comparacao = (tipoOrdem[a.tipo] || 0) - (tipoOrdem[b.tipo] || 0);
          break;
        case "status":
          comparacao = (statusOrdem[a.status] || 0) - (statusOrdem[b.status] || 0);
          break;
        case "titulo":
          comparacao = a.titulo.localeCompare(b.titulo, 'pt-BR');
          break;
        default:
          comparacao = a.createdAt.getTime() - b.createdAt.getTime();
      }
      
      return ordemCrescente ? comparacao : -comparacao;
    });
    
    setHistoricoFiltrado(filtered.slice(0, 50)); // Limitar a 50 itens
  }, [historico, filtroTipo, filtroPeriodo, filtroStatus, pesquisaTexto, ordenarPor, ordemCrescente]);

  // Capturar geolocalização
  const captureGeoLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocalização não suportada pelo navegador");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding usando API gratuita
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'pt-BR',
              },
            }
          );
          const data = await response.json();
          
          setGeoLocation({
            latitude,
            longitude,
            endereco: data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          });
        } catch {
          setGeoLocation({
            latitude,
            longitude,
            endereco: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          });
        }
        
        setGeoLoading(false);
        toast.success("Localização capturada com sucesso!");
      },
      (error) => {
        setGeoLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Permissão de localização negada");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Localização indisponível");
            break;
          case error.TIMEOUT:
            setGeoError("Tempo esgotado ao obter localização");
            break;
          default:
            setGeoError("Erro ao obter localização");
        }
        toast.error("Erro ao capturar localização");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Mutations para criar itens
  const createChecklist = trpc.checklist.create.useMutation({
    onSuccess: (data) => {
      utils.checklist.list.invalidate();
      setItemCriado({ id: data.id, protocolo: data.protocolo, tipo: "checklist" });
      setEnvioModalOpen(true);
      toast.success("Checklist criado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar checklist: " + error.message);
    },
  });
  
  const createManutencao = trpc.manutencao.create.useMutation({
    onSuccess: (data) => {
      utils.manutencao.list.invalidate();
      setItemCriado({ id: data.id, protocolo: data.protocolo, tipo: "manutencao" });
      setEnvioModalOpen(true);
      toast.success("Manutenção criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar manutenção: " + error.message);
    },
  });
  
  const createOcorrencia = trpc.ocorrencia.create.useMutation({
    onSuccess: (data) => {
      utils.ocorrencia.list.invalidate();
      setItemCriado({ id: data.id, protocolo: data.protocolo, tipo: "ocorrencia" });
      setEnvioModalOpen(true);
      toast.success("Ocorrência criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar ocorrência: " + error.message);
    },
  });
  
  const createVistoria = trpc.vistoria.create.useMutation({
    onSuccess: (data) => {
      utils.vistoria.list.invalidate();
      setItemCriado({ id: data.id, protocolo: data.protocolo, tipo: "vistoria" });
      setEnvioModalOpen(true);
      toast.success("Vistoria criada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao criar vistoria: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (!funcaoSelecionada || !titulo.trim()) {
      toast.error("Preencha o título");
      return;
    }

    const baseData = {
      condominioId,
      titulo,
      descricao: descricao || undefined,
      latitude: geoLocation?.latitude?.toString(),
      longitude: geoLocation?.longitude?.toString(),
      enderecoGeo: geoLocation?.endereco,
    };

    switch (funcaoSelecionada.tipo) {
      case "checklist":
        createChecklist.mutate({
          ...baseData,
          imagens: imagens.length > 0 ? imagens : undefined,
        });
        break;
      case "manutencao":
        createManutencao.mutate({
          ...baseData,
          prioridade: "media",
        });
        break;
      case "ocorrencia":
        createOcorrencia.mutate({
          ...baseData,
          prioridade: "media",
        });
        break;
      case "vistoria":
        createVistoria.mutate(baseData);
        break;
    }
  };

  const isLoading =
    createChecklist.isPending ||
    createManutencao.isPending ||
    createOcorrencia.isPending ||
    createVistoria.isPending;

  const openModal = (funcao: FuncaoRapidaConfig) => {
    setFuncaoSelecionada(funcao);
    setTitulo("");
    setDescricao("");
    setImagens([]);
    setItemCriado(null);
    setGeoLocation(null);
    setGeoError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setFuncaoSelecionada(null);
  };

  const getLabelSingular = () => {
    return funcaoSelecionada?.labelSingular || "";
  };

  // Upload de imagem simples
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (imagens.length >= 5) {
        toast.error("Máximo de 5 imagens");
        break;
      }

      try {
        const result = await prepareImageForUpload(file, "quarterA4");
        setImagens((prev) => [...prev, result]);
      } catch {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setImagens((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (index: number) => {
    setImagens((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "realizada":
      case "finalizada":
        return "bg-green-100 text-green-800";
      case "acao_necessaria":
        return "bg-red-100 text-red-800";
      case "reaberta":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTipoConfig = (tipo: FuncaoRapidaTipo) => {
    return funcoesConfig.find((f) => f.tipo === tipo);
  };

  const openGoogleMaps = (lat: string, lng: string) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <>
      {/* Título da Secção */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <span className="w-8 h-1 bg-yellow-400 rounded-full"></span>
          FUNÇÕES RÁPIDAS
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHistorico(!showHistorico)}
          className="text-muted-foreground hover:text-foreground"
        >
          <History className="w-4 h-4 mr-2" />
          Histórico
          {showHistorico ? (
            <ChevronUp className="w-4 h-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
          )}
        </Button>
      </div>

      {/* Cards de Funções Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {funcoesConfig.map((funcao, index) => (
          <motion.div
            key={funcao.tipo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              onClick={() => openModal(funcao)}
              className={cn(
                "group cursor-pointer flex flex-col items-center justify-center gap-3 p-4",
                "bg-white dark:bg-card rounded-2xl",
                "border border-slate-100 dark:border-slate-800",
                "shadow-sm hover:shadow-md transition-all duration-200",
                "active:scale-95"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                funcao.bgColor
              )}>
                <funcao.icon className={cn("w-6 h-6", funcao.color)} />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {funcao.label}
              </span>
            </div>
          </motion.div>
        ))}
        {/* Botão de Ordens de Serviço */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div
            onClick={() => setLocation("/dashboard/ordens-servico")}
            className={cn(
              "group cursor-pointer flex flex-col items-center justify-center gap-3 p-4",
              "bg-white dark:bg-card rounded-2xl",
              "border border-slate-100 dark:border-slate-800",
              "shadow-sm hover:shadow-md transition-all duration-200",
              "active:scale-95"
            )}
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-center">
              Ordens de Serviço
            </span>
          </div>
        </motion.div>
      </div>

      {/* Histórico */}
      {showHistorico && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Histórico de Registos
                  <Badge variant="secondary" className="ml-2">
                    {historicoFiltrado.length} de {historico.length}
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFiltroTipo("todos");
                    setFiltroPeriodo("todos");
                    setFiltroStatus("todos");
                    setPesquisaTexto("");
                    setOrdenarPor("data");
                    setOrdemCrescente(false);
                  }}
                  className="text-muted-foreground hover:text-foreground"
                  title="Limpar filtros e ordenação"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Campo de Pesquisa */}
              <div className="relative mt-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por título, protocolo ou descrição..."
                  value={pesquisaTexto}
                  onChange={(e) => setPesquisaTexto(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
                {pesquisaTexto && (
                  <button
                    onClick={() => setPesquisaTexto("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Filtros */}
              <div className="flex flex-wrap gap-2 mt-3">
                {/* Filtro por Tipo */}
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <Filter className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Tipos</SelectItem>
                    <SelectItem value="checklist">Checklists</SelectItem>
                    <SelectItem value="manutencao">Manutenções</SelectItem>
                    <SelectItem value="ocorrencia">Ocorrências</SelectItem>
                    <SelectItem value="vistoria">Vistorias</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Filtro por Período */}
                <Select value={filtroPeriodo} onValueChange={setFiltroPeriodo}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todo o Período</SelectItem>
                    <SelectItem value="hoje">Hoje</SelectItem>
                    <SelectItem value="semana">Última Semana</SelectItem>
                    <SelectItem value="mes">Último Mês</SelectItem>
                    <SelectItem value="trimestre">Últimos 3 Meses</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Filtro por Status */}
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="realizada">Realizada</SelectItem>
                    <SelectItem value="finalizada">Finalizada</SelectItem>
                    <SelectItem value="acao_necessaria">Ação Necessária</SelectItem>
                    <SelectItem value="reaberta">Reaberta</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Separador visual */}
                <div className="w-px h-6 bg-border self-center mx-1" />
                
                {/* Ordenação */}
                <Select value={ordenarPor} onValueChange={setOrdenarPor}>
                  <SelectTrigger className="w-[130px] h-8 text-xs">
                    <ArrowUpDown className="w-3 h-3 mr-1" />
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data">Por Data</SelectItem>
                    <SelectItem value="tipo">Por Tipo</SelectItem>
                    <SelectItem value="status">Por Status</SelectItem>
                    <SelectItem value="titulo">Por Título</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Botão de direção da ordenação */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => setOrdemCrescente(!ordemCrescente)}
                  title={ordemCrescente ? "Ordem Crescente" : "Ordem Decrescente"}
                >
                  {ordemCrescente ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {historicoFiltrado.length === 0 ? (
                <div className="text-center py-6">
                  <Filter className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {historico.length === 0 
                      ? "Nenhum registo encontrado" 
                      : "Nenhum registo corresponde aos filtros selecionados"}
                  </p>
                  {historico.length > 0 && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setFiltroTipo("todos");
                        setFiltroPeriodo("todos");
                        setFiltroStatus("todos");
                        setPesquisaTexto("");
                        setOrdenarPor("data");
                        setOrdemCrescente(false);
                      }}
                      className="mt-2"
                    >
                      Limpar filtros
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {historicoFiltrado.map((item) => {
                    const config = getTipoConfig(item.tipo);
                    return (
                      <div
                        key={`${item.tipo}-${item.id}`}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        {config && (
                          <div className={`p-2 rounded-lg ${config.bgColor}`}>
                            <config.icon className={`w-4 h-4 ${config.color}`} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm truncate">
                              {item.titulo}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {item.protocolo}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                              {item.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.createdAt)}
                            </span>
                            {item.enderecoGeo && (
                              <button
                                onClick={() => item.latitude && item.longitude && openGoogleMaps(item.latitude, item.longitude)}
                                className="flex items-center gap-1 hover:text-primary transition-colors"
                              >
                                <MapPin className="w-3 h-3" />
                                <span className="truncate max-w-[200px]">
                                  {item.enderecoGeo}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.open(`/compartilhado/${item.tipo}/${item.id}`, '_blank');
                            }}
                            title="Ver detalhes"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <DownloadPdfButton
                            tipo={item.tipo}
                            id={item.id}
                            protocolo={item.protocolo}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Modal de Criação Rápida */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="w-[95vw] max-w-[500px] p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-white text-lg">
                {funcaoSelecionada && (
                  <>
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                      <funcaoSelecionada.icon className="w-5 h-5 text-white" />
                    </div>
                    {getLabelSingular()}
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-blue-100">
                Preencha os dados para registar rapidamente
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 p-6">
            {/* Título */}
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                placeholder="Digite o título"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o problema ou item"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>

            {/* Geolocalização */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localização
              </Label>
              {geoLocation ? (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-800">
                        Localização capturada
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {geoLocation.endereco}
                      </p>
                      <p className="text-xs text-green-500 mt-1">
                        {geoLocation.latitude.toFixed(6)}, {geoLocation.longitude.toFixed(6)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setGeoLocation(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={captureGeoLocation}
                  disabled={geoLoading}
                >
                  {geoLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Obtendo localização...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Capturar Localização Atual
                    </>
                  )}
                </Button>
              )}
              {geoError && (
                <p className="text-xs text-red-500">{geoError}</p>
              )}
            </div>

            {/* Imagens */}
            <div className="space-y-2">
              <Label>Imagens (opcional)</Label>
              <div className="flex flex-wrap gap-2">
                {imagens.map((img, index) => (
                  <div key={index} className="relative w-16 h-16">
                    <img
                      src={img}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {imagens.length < 5 && (
                  <label className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-primary">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Data/Hora atual */}
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Registo em: {new Date().toLocaleDateString('pt-BR')} às{' '}
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

          </div>
          <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
            <Button variant="outline" onClick={closeModal} className="border-slate-300">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registando...
                </>
              ) : (
                "Registar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Envio Multicanal */}
      {itemCriado && (
        <EnvioMulticanalModal
          open={envioModalOpen}
          onOpenChange={(open: boolean) => {
            setEnvioModalOpen(open);
            if (!open) {
              closeModal();
            }
          }}
          destinatario={{
            nome: "Equipe",
            whatsapp: "",
            email: "",
            apartamento: "-",
          }}
          notificacao={{
            titulo: `${getLabelSingular()} - ${itemCriado.protocolo}`,
            descricao: descricao || titulo,
            linkPublico: `compartilhado/${itemCriado.tipo}/${itemCriado.id}`,
          }}
          condominio={{
            nome: "Condomínio",
          }}
        />
      )}
    </>
  );
}
