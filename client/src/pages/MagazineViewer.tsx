import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  Building2,
  Calendar,
  Car,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileDown,
  FileText,
  Grid3X3,
  Hand,
  Heart,
  Home,
  Image,
  Layers,
  Link as LinkIcon,
  Loader2,
  Maximize,
  Megaphone,
  MessageSquare,
  Minimize,
  Package,
  Phone,
  Play,
  ScrollText,
  Search,
  Share2,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  Users,
  Vote,
  Wrench,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useParams, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import ImageGallery from "@/components/ImageGallery";
import { QRCodeSVG } from "qrcode.react";

// Demo magazine data - Focado em Manutenção
const demoMagazine = {
  titulo: "Livro de Manutenção",
  subtitulo: "Relatório Mensal",
  edicao: "Janeiro 2026",
  pages: [
    {
      id: 1,
      type: "cover",
      content: {
        titulo: "Livro de Manutenção",
        subtitulo: "Relatório Mensal",
        edicao: "Janeiro 2026",
        imagem: null,
        logoUrl: null,
        capaUrl: null,
      },
    },
    {
      id: 2,
      type: "resumo_periodo",
      content: {
        titulo: "Resumo do Período",
        periodo: "Janeiro 2026",
        estatisticas: {
          manutencoes: { total: 12, concluidas: 8 },
          vistorias: { total: 15, aprovadas: 12 },
          ocorrencias: { total: 7, abertas: 2 },
          checklists: { total: 20, concluidos: 18 },
          antesDepois: { total: 5 },
        },
      },
    },
    {
      id: 3,
      type: "manutencoes",
      content: {
        titulo: "Manutenções Realizadas",
        manutencoes: [
          {
            protocolo: "MAN-2026-001",
            titulo: "Revisão do Sistema Elétrico",
            local: "Quadro Geral - Bloco A",
            status: "concluida",
            data: "05/01/2026",
            tipo: "preventiva",
          },
          {
            protocolo: "MAN-2026-002",
            titulo: "Troca de Rolamentos",
            local: "Motor da Bomba D'Água",
            status: "concluida",
            data: "08/01/2026",
            tipo: "corretiva",
          },
          {
            protocolo: "MAN-2026-003",
            titulo: "Lubrificação de Equipamentos",
            local: "Casa de Máquinas",
            status: "em_andamento",
            data: "12/01/2026",
            tipo: "preventiva",
          },
        ],
      },
    },
    {
      id: 4,
      type: "vistorias",
      content: {
        titulo: "Vistorias Realizadas",
        vistorias: [
          {
            protocolo: "VIS-2026-001",
            titulo: "Vistoria Técnica Mensal",
            local: "Elevadores 1 e 2",
            status: "aprovada",
            data: "03/01/2026",
          },
          {
            protocolo: "VIS-2026-002",
            titulo: "Inspeção de Segurança",
            local: "Sistema de Incêndio",
            status: "aprovada",
            data: "07/01/2026",
          },
          {
            protocolo: "VIS-2026-003",
            titulo: "Vistoria Estrutural",
            local: "Cobertura e Laje",
            status: "pendente",
            data: "15/01/2026",
          },
        ],
      },
    },
    {
      id: 5,
      type: "ocorrencias",
      content: {
        titulo: "Ocorrências Registradas",
        ocorrencias: [
          {
            protocolo: "OCO-2026-001",
            titulo: "Vazamento na Tubulação",
            local: "Banheiro - 3º Andar",
            status: "resolvida",
            data: "02/01/2026",
            prioridade: "alta",
          },
          {
            protocolo: "OCO-2026-002",
            titulo: "Lâmpada Queimada",
            local: "Corredor - Térreo",
            status: "resolvida",
            data: "04/01/2026",
            prioridade: "baixa",
          },
          {
            protocolo: "OCO-2026-003",
            titulo: "Ruído no Ar Condicionado",
            local: "Sala de Reuniões",
            status: "em_analise",
            data: "10/01/2026",
            prioridade: "media",
          },
        ],
      },
    },
    {
      id: 6,
      type: "checklists",
      content: {
        titulo: "Checklists Completados",
        checklists: [
          {
            titulo: "Checklist Diário - Portaria",
            itensTotal: 15,
            itensConcluidos: 15,
            data: "13/01/2026",
            responsavel: "Carlos Silva",
          },
          {
            titulo: "Checklist Semanal - Limpeza",
            itensTotal: 25,
            itensConcluidos: 23,
            data: "12/01/2026",
            responsavel: "Maria Santos",
          },
          {
            titulo: "Checklist Mensal - Equipamentos",
            itensTotal: 40,
            itensConcluidos: 38,
            data: "10/01/2026",
            responsavel: "João Oliveira",
          },
        ],
      },
    },
    {
      id: 7,
      type: "antes_depois",
      content: {
        titulo: "Antes e Depois",
        itens: [
          {
            titulo: "Pintura da Fachada",
            descricao: "Revitalização completa da fachada principal.",
            fotoAntesUrl: null,
            fotoDepoisUrl: null,
          },
          {
            titulo: "Reforma do Hall de Entrada",
            descricao: "Modernização com novo piso e iluminação LED.",
            fotoAntesUrl: null,
            fotoDepoisUrl: null,
          },
        ],
      },
    },
    {
      id: 8,
      type: "realizacoes",
      content: {
        titulo: "Realizações do Período",
        realizacoes: [
          {
            titulo: "Modernização do Sistema de Iluminação",
            descricao: "Substituição de todas as lâmpadas por LED, gerando economia de 40%.",
            data: "Janeiro 2026",
            status: "concluido",
          },
          {
            titulo: "Instalação de Sensores de Presença",
            descricao: "Automação da iluminação em áreas comuns.",
            data: "Janeiro 2026",
            status: "concluido",
          },
        ],
      },
    },
    {
      id: 9,
      type: "melhorias",
      content: {
        titulo: "Melhorias Implementadas",
        melhorias: [
          {
            titulo: "Sistema de Monitoramento",
            descricao: "Instalação de 12 novas câmeras de segurança.",
            status: "concluido",
            previsao: null,
          },
          {
            titulo: "Impermeabilização da Cobertura",
            descricao: "Tratamento preventivo contra infiltrações.",
            status: "em_andamento",
            previsao: "Fevereiro 2026",
          },
        ],
      },
    },
    {
      id: 10,
      type: "aquisicoes",
      content: {
        titulo: "Aquisições Realizadas",
        aquisicoes: [
          {
            titulo: "Ferramentas de Manutenção",
            descricao: "Kit completo de ferramentas para a equipe técnica.",
            valor: "R$ 3.500,00",
            data: "Janeiro 2026",
          },
          {
            titulo: "EPIs - Equipamentos de Proteção",
            descricao: "Capacetes, luvas e óculos de segurança.",
            valor: "R$ 1.200,00",
            data: "Janeiro 2026",
          },
        ],
      },
    },
    {
      id: 11,
      type: "galeria",
      content: {
        titulo: "Galeria de Fotos",
        albuns: [
          {
            titulo: "Manutenções Realizadas",
            categoria: "manutencao",
            fotos: [],
          },
          {
            titulo: "Vistorias Técnicas",
            categoria: "vistoria",
            fotos: [],
          },
        ],
      },
    },
    {
      id: 12,
      type: "back_cover",
      content: {
        titulo: "Livro de Manutenção",
        mensagem: "Documentação técnica completa do período",
      },
    },
  ],
};

// Transforma dados reais da API em páginas do viewer
function buildPagesFromData(data: any): any[] {
  const pages: any[] = [];
  let pageId = 1;

  // 1. Capa
  pages.push({
    id: pageId++,
    type: "cover",
    content: {
      titulo: data.revista.titulo || "Livro de Manutenção",
      subtitulo: data.revista.subtitulo || "Relatório",
      edicao: data.revista.edicao || "",
      imagem: null,
      logoUrl: data.condominio?.logoUrl || null,
      capaUrl: data.revista.capaUrl || null,
    },
  });

  // 2. Resumo do Período (sempre incluir) - agora com estatísticas reais
  const manutencoesTotal = data.manutencoes?.length || 0;
  const manutencoesConcluidas = data.manutencoes?.filter((m: any) => m.status === 'finalizada' || m.status === 'realizada').length || 0;
  const vistoriasTotal = data.vistorias?.length || 0;
  const vistoriasAprovadas = data.vistorias?.filter((v: any) => v.status === 'finalizada' || v.status === 'realizada').length || 0;
  const ocorrenciasTotal = data.ocorrencias?.length || 0;
  const ocorrenciasAbertas = data.ocorrencias?.filter((o: any) => o.status === 'pendente' || o.status === 'acao_necessaria').length || 0;
  const checklistsTotal = data.checklists?.length || 0;
  const checklistsConcluidos = data.checklists?.filter((c: any) => c.status === 'finalizada' || c.status === 'realizada').length || 0;

  pages.push({
    id: pageId++,
    type: "resumo_periodo",
    content: {
      titulo: "Resumo do Período",
      periodo: data.revista.edicao || "",
      estatisticas: {
        manutencoes: { total: manutencoesTotal, concluidas: manutencoesConcluidas },
        vistorias: { total: vistoriasTotal, aprovadas: vistoriasAprovadas },
        ocorrencias: { total: ocorrenciasTotal, abertas: ocorrenciasAbertas },
        checklists: { total: checklistsTotal, concluidos: checklistsConcluidos },
        antesDepois: { total: 0 },
      },
    },
  });

  // 3. Manutenções
  if (data.manutencoes && data.manutencoes.length > 0) {
    pages.push({
      id: pageId++,
      type: "manutencoes",
      content: {
        titulo: "Manutenções",
        manutencoes: data.manutencoes.map((m: any) => ({
          id: m.id,
          titulo: m.titulo,
          descricao: m.descricao || "",
          protocolo: m.protocolo,
          status: m.status,
          prioridade: m.prioridade || "media",
          tipo: m.tipo || "corretiva",
          responsavel: m.responsavelNome || "",
          localizacao: m.localizacao || "",
          local: m.localizacao || "",
          imagens: (m.imagens || []).map((img: any) => ({ id: img.id, url: img.url, legenda: img.legenda })),
          data: m.dataRealizada ? new Date(m.dataRealizada).toLocaleDateString('pt-BR') : 
                m.dataAgendada ? new Date(m.dataAgendada).toLocaleDateString('pt-BR') : 
                new Date(m.createdAt).toLocaleDateString('pt-BR'),
        })),
      },
    });
  }

  // 4. Vistorias
  if (data.vistorias && data.vistorias.length > 0) {
    pages.push({
      id: pageId++,
      type: "vistorias",
      content: {
        titulo: "Vistorias Realizadas",
        vistorias: data.vistorias.map((v: any) => ({
          id: v.id,
          titulo: v.titulo,
          descricao: v.descricao || "",
          protocolo: v.protocolo,
          status: v.status,
          prioridade: v.prioridade || "media",
          tipo: v.tipo || "",
          responsavel: v.responsavelNome || "",
          localizacao: v.localizacao || "",
          local: v.localizacao || "",
          imagens: (v.imagens || []).map((img: any) => ({ id: img.id, url: img.url, legenda: img.legenda })),
          data: v.dataRealizada ? new Date(v.dataRealizada).toLocaleDateString('pt-BR') :
                v.dataAgendada ? new Date(v.dataAgendada).toLocaleDateString('pt-BR') :
                new Date(v.createdAt).toLocaleDateString('pt-BR'),
        })),
      },
    });
  }

  // 5. Ocorrências
  if (data.ocorrencias && data.ocorrencias.length > 0) {
    pages.push({
      id: pageId++,
      type: "ocorrencias",
      content: {
        titulo: "Ocorrências Registradas",
        ocorrencias: data.ocorrencias.map((o: any) => ({
          id: o.id,
          titulo: o.titulo,
          descricao: o.descricao || "",
          protocolo: o.protocolo,
          status: o.status,
          prioridade: o.prioridade || "media",
          categoria: o.categoria || "outros",
          responsavel: o.responsavelNome || o.reportadoPorNome || "",
          localizacao: o.localizacao || "",
          local: o.localizacao || "",
          imagens: (o.imagens || []).map((img: any) => ({ id: img.id, url: img.url, legenda: img.legenda })),
          data: o.dataOcorrencia ? new Date(o.dataOcorrencia).toLocaleDateString('pt-BR') :
                new Date(o.createdAt).toLocaleDateString('pt-BR'),
        })),
      },
    });
  }

  // 6. Checklists
  if (data.checklists && data.checklists.length > 0) {
    pages.push({
      id: pageId++,
      type: "checklists",
      content: {
        titulo: "Checklists Completados",
        checklists: data.checklists.map((c: any) => ({
          id: c.id,
          titulo: c.titulo,
          descricao: c.descricao || "",
          protocolo: c.protocolo,
          status: c.status,
          prioridade: c.prioridade || "media",
          categoria: c.categoria || "",
          responsavel: c.responsavelNome || "",
          totalItens: c.totalItens || 0,
          itensCompletos: c.itensCompletos || 0,
          imagens: (c.imagens || []).map((img: any) => ({ id: img.id, url: img.url, legenda: img.legenda })),
          data: c.dataRealizada ? new Date(c.dataRealizada).toLocaleDateString('pt-BR') :
                c.dataAgendada ? new Date(c.dataAgendada).toLocaleDateString('pt-BR') :
                new Date(c.createdAt).toLocaleDateString('pt-BR'),
        })),
      },
    });
  }

  // 7. Realizações
  if (data.realizacoes && data.realizacoes.length > 0) {
    pages.push({
      id: pageId++,
      type: "realizacoes",
      content: {
        titulo: "Realizações do Período",
        realizacoes: data.realizacoes.map((r: any) => ({
          titulo: r.titulo,
          descricao: r.descricao,
          data: r.data ? new Date(r.data).toLocaleDateString('pt-BR') : "",
          status: r.status || "concluido",
        })),
      },
    });
  }

  // 4. Melhorias
  if (data.melhorias && data.melhorias.length > 0) {
    pages.push({
      id: pageId++,
      type: "melhorias",
      content: {
        titulo: "Melhorias Implementadas",
        melhorias: data.melhorias.map((m: any) => ({
          titulo: m.titulo,
          descricao: m.descricao,
          status: m.status || "planejada",
          previsao: m.previsao || null,
        })),
      },
    });
  }

  // 5. Aquisições
  if (data.aquisicoes && data.aquisicoes.length > 0) {
    pages.push({
      id: pageId++,
      type: "aquisicoes",
      content: {
        titulo: "Aquisições Realizadas",
        aquisicoes: data.aquisicoes.map((a: any) => ({
          titulo: a.titulo,
          descricao: a.descricao,
          valor: a.valor ? `R$ ${Number(a.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : null,
          data: a.dataAquisicao ? new Date(a.dataAquisicao).toLocaleDateString('pt-BR') : "",
        })),
      },
    });
  }

  // 6. Avisos
  if (data.avisos && data.avisos.length > 0) {
    pages.push({
      id: pageId++,
      type: "avisos",
      content: {
        titulo: "Avisos",
        avisos: data.avisos.map((a: any) => ({
          titulo: a.titulo,
          descricao: a.descricao || a.conteudo || "",
          data: a.createdAt ? new Date(a.createdAt).toLocaleDateString('pt-BR') : "",
          prioridade: a.prioridade || "normal",
        })),
      },
    });
  }

  // 7. Eventos
  if (data.eventos && data.eventos.length > 0) {
    pages.push({
      id: pageId++,
      type: "eventos",
      content: {
        titulo: "Eventos",
        eventos: data.eventos.map((e: any) => ({
          titulo: e.titulo,
          descricao: e.descricao || "",
          data: e.dataEvento ? new Date(e.dataEvento).toLocaleDateString('pt-BR') : "",
          local: e.local || "",
        })),
      },
    });
  }

  // 8. Funcionários
  if (data.funcionarios && data.funcionarios.length > 0) {
    pages.push({
      id: pageId++,
      type: "funcionarios",
      content: {
        titulo: "Equipe",
        funcionarios: data.funcionarios.map((f: any) => ({
          nome: f.nome,
          cargo: f.cargo || "",
          foto: f.fotoUrl || null,
          contato: f.telefone || "",
        })),
      },
    });
  }

  // 9. Telefones úteis
  if (data.telefones && data.telefones.length > 0) {
    pages.push({
      id: pageId++,
      type: "telefones",
      content: {
        titulo: "Telefones Úteis",
        telefones: data.telefones.map((t: any) => ({
          nome: t.nome,
          telefone: t.telefone,
          categoria: t.categoria || "",
        })),
      },
    });
  }

  // 10. Galeria
  if (data.albuns && data.albuns.length > 0) {
    pages.push({
      id: pageId++,
      type: "galeria",
      content: {
        titulo: "Galeria de Fotos",
        albuns: data.albuns.map((a: any) => ({
          titulo: a.titulo,
          categoria: a.categoria || "",
          fotos: (data.fotos || []).filter((f: any) => f.albumId === a.id).map((f: any) => ({
            id: f.id,
            url: f.url,
            legenda: f.legenda || "",
          })),
        })),
      },
    });
  }

  // 11. Votações
  if (data.votacoes && data.votacoes.length > 0) {
    pages.push({
      id: pageId++,
      type: "votacao",
      content: {
        titulo: "Votações",
        votacoes: data.votacoes.map((v: any) => ({
          titulo: v.titulo,
          descricao: v.descricao || "",
          status: v.status || "ativa",
        })),
      },
    });
  }

  // 12. Comunicados
  if (data.comunicados && data.comunicados.length > 0) {
    pages.push({
      id: pageId++,
      type: "avisos",
      content: {
        titulo: "Comunicados",
        avisos: data.comunicados.map((c: any) => ({
          titulo: c.titulo,
          descricao: c.conteudo || c.descricao || "",
          data: c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : "",
          prioridade: c.prioridade || "normal",
        })),
      },
    });
  }

  // 13. Publicidade / Anunciantes
  if (data.anunciantes && data.anunciantes.length > 0) {
    pages.push({
      id: pageId++,
      type: "publicidade",
      content: {
        titulo: "Parceiros",
        anunciantes: data.anunciantes.map((a: any) => ({
          nome: a.nome,
          descricao: a.descricao || "",
          logo: a.logoUrl || null,
          link: a.link || null,
        })),
      },
    });
  }

  // 14. Contracapa
  pages.push({
    id: pageId++,
    type: "back_cover",
    content: {
      titulo: data.revista.titulo || "Livro de Manutenção",
      mensagem: "Documentação técnica completa do período",
    },
  });

  return pages;
}

export default function MagazineViewer() {
  const params = useParams<{ shareLink: string }>();
  const searchString = useSearch();
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [showToc, setShowToc] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Swipe/drag state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  
  // New navigation features
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Zoom state
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialZoom, setInitialZoom] = useState(100);
  const pageRef = useRef<HTMLDivElement>(null);
  const MIN_ZOOM = 50;
  const MAX_ZOOM = 200;
  const ZOOM_STEP = 25;
  
  // Reading mode state (page or continuous)
  const [readingMode, setReadingMode] = useState<'page' | 'continuous'>(() => {
    const searchParams = new URLSearchParams(searchString);
    return searchParams.get('mode') === 'scroll' ? 'continuous' : 'page';
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Interactivity state
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('todos');
  const [filterPeriod, setFilterPeriod] = useState<string>('todos');

  // Query real data from API
  const { data: revistaData, isLoading: revistaLoading } = trpc.revista.getPublicFull.useQuery(
    { shareLink: params.shareLink || "" },
    { enabled: !!params.shareLink }
  );

  const generatePDF = trpc.revista.generatePDF.useMutation({
    onSuccess: (data) => {
      // Converter base64 para blob e fazer download
      const byteCharacters = atob(data.pdf);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF gerado com sucesso!');
      setIsGeneratingPDF(false);
    },
    onError: (error) => {
      toast.error('Erro ao gerar PDF: ' + error.message);
      setIsGeneratingPDF(false);
    },
  });

  const handleDownloadPDF = () => {
    const realRevistaId = revistaData?.revista?.id;
    if (!realRevistaId) {
      toast.error('Revista não encontrada para gerar PDF');
      return;
    }
    setIsGeneratingPDF(true);
    generatePDF.mutate({ id: realRevistaId });
  };

  // Usar dados reais se disponíveis, senão fallback para demo
  const realPages = revistaData ? buildPagesFromData(revistaData) : null;
  const magazine = realPages 
    ? { 
        titulo: revistaData!.revista.titulo, 
        subtitulo: revistaData!.revista.subtitulo || "", 
        edicao: revistaData!.revista.edicao || "", 
        pages: realPages 
      } 
    : demoMagazine;
  const totalPages = magazine.pages.length;

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < totalPages && !isFlipping) {
      setDirection(pageIndex > currentPage ? "next" : "prev");
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentPage(pageIndex);
        setIsFlipping(false);
      }, 400);
    }
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && zoomLevel === 100) nextPage();
      if (e.key === "ArrowLeft" && zoomLevel === 100) prevPage();
      if (e.key === "Escape") {
        if (zoomLevel !== 100) resetZoom();
        else if (isFullscreen) toggleFullscreen();
        else if (showThumbnails) setShowThumbnails(false);
      }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "t" || e.key === "T") setShowThumbnails(prev => !prev);
      if (e.key === "c" || e.key === "C") setReadingMode(prev => prev === 'page' ? 'continuous' : 'page');
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetZoom();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, isFlipping, isFullscreen, showThumbnails, zoomLevel, readingMode]);

  // Show swipe hint on first visit
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('revista-swipe-hint-seen');
    if (!hasSeenHint) {
      setShowSwipeHint(true);
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
        localStorage.setItem('revista-swipe-hint-seen', 'true');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      toast.error('Não foi possível ativar o modo ecrã inteiro');
    }
  };

  // Zoom functions
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  };

  const resetZoom = () => {
    setZoomLevel(100);
  };

  // Pinch-to-zoom handlers
  const getDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Swipe handlers for mobile
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    // Check for pinch gesture
    if (e.touches.length === 2) {
      setIsPinching(true);
      setInitialPinchDistance(getDistance(e.touches));
      setInitialZoom(zoomLevel);
      return;
    }
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Handle pinch-to-zoom
    if (isPinching && e.touches.length === 2 && initialPinchDistance) {
      const currentDistance = getDistance(e.touches);
      const scale = currentDistance / initialPinchDistance;
      const newZoom = Math.min(Math.max(initialZoom * scale, MIN_ZOOM), MAX_ZOOM);
      setZoomLevel(Math.round(newZoom));
      return;
    }
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (isPinching) {
      setIsPinching(false);
      setInitialPinchDistance(null);
      return;
    }
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe && zoomLevel === 100) nextPage();
    if (isRightSwipe && zoomLevel === 100) prevPage();
  };

  // Mouse drag handlers for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || dragStart === null) return;
    const distance = dragStart - e.clientX;
    const isLeftDrag = distance > minSwipeDistance;
    const isRightDrag = distance < -minSwipeDistance;
    if (isLeftDrag) nextPage();
    if (isRightDrag) prevPage();
    setIsDragging(false);
    setDragStart(null);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const currentPageData = magazine.pages[currentPage];

  // Loading state when fetching real data
  if (params.shareLink && revistaLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-lg">Carregando Livro de Manutenção...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col"
    >
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10 py-3 px-4">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setShowToc(!showToc)}
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Índice</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copiado para a área de transferência!');
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Partilhar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline">{isGeneratingPDF ? 'A gerar...' : 'PDF'}</span>
            </Button>
            {/* Zoom controls */}
            <div className="flex items-center gap-1 border-l border-white/20 pl-2 ml-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 px-2"
                onClick={zoomOut}
                disabled={zoomLevel <= MIN_ZOOM}
                title="Diminuir zoom (-)"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <button
                onClick={resetZoom}
                className="text-white/70 hover:text-white text-xs font-medium min-w-[48px] py-1 px-2 rounded hover:bg-white/10 transition-colors"
                title="Repor zoom (0)"
              >
                {zoomLevel}%
              </button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 px-2"
                onClick={zoomIn}
                disabled={zoomLevel >= MAX_ZOOM}
                title="Aumentar zoom (+)"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            {/* Reading mode toggle */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-white/70 hover:text-white hover:bg-white/10",
                readingMode === 'continuous' && "bg-white/20 text-white"
              )}
              onClick={() => setReadingMode(readingMode === 'page' ? 'continuous' : 'page')}
              title={readingMode === 'page' ? "Modo contínuo (C)" : "Modo página (C)"}
            >
              {readingMode === 'page' ? <ScrollText className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setShowThumbnails(!showThumbnails)}
              title="Miniaturas (T)"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={toggleFullscreen}
              title="Ecrã inteiro (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Magazine viewer */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Table of contents sidebar */}
        <AnimatePresence>
          {showToc && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="absolute left-4 top-4 bottom-4 w-64 bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-20 overflow-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-white">Índice</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white"
                  onClick={() => setShowToc(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {magazine.pages.map((page, index) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      goToPage(index);
                      setShowToc(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      currentPage === index
                        ? "bg-primary text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span className="text-xs text-white/50 mr-2">{index + 1}.</span>
                    {getPageTitle(page)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Thumbnails panel */}
        <AnimatePresence>
          {showThumbnails && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute right-4 top-4 bottom-4 w-72 bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-20 overflow-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif font-bold text-white">Miniaturas</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/70 hover:text-white"
                  onClick={() => setShowThumbnails(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {magazine.pages.map((page, index) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      goToPage(index);
                      setShowThumbnails(false);
                    }}
                    className={cn(
                      "relative aspect-[3/4] rounded-lg overflow-hidden transition-all duration-200",
                      "border-2",
                      currentPage === index
                        ? "border-primary ring-2 ring-primary/30 scale-105"
                        : "border-white/20 hover:border-white/40 hover:scale-102"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                      <span className="text-white/60 text-xs font-medium text-center px-2">
                        {getPageTitle(page)}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page mode - single page with flip animation */}
        {readingMode === 'page' && (
          <>
            {/* Magazine container with navigation */}
            <div className="w-full max-w-2xl mx-auto relative">
              {/* Navigation buttons - positioned at magazine margins with glow animation */}
              <button
                className="magazine-nav-arrow magazine-nav-arrow-left -left-20 md:-left-24"
                onClick={prevPage}
                disabled={currentPage === 0 || isFlipping}
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>

              <button
                className="magazine-nav-arrow magazine-nav-arrow-right -right-20 md:-right-24"
                onClick={nextPage}
                disabled={currentPage === totalPages - 1 || isFlipping}
                aria-label="Próxima página"
              >
                <ChevronRight className="w-7 h-7" />
              </button>

              {/* Magazine page with swipe/drag support and zoom */}
              <div 
                ref={pageRef}
                className={cn(
                  "perspective-1000 select-none transition-all duration-200",
                  zoomLevel > 100 ? "overflow-auto cursor-move" : "cursor-grab active:cursor-grabbing",
                  zoomLevel > 100 && "max-h-[70vh] rounded-lg"
                )}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                style={{
                  touchAction: zoomLevel > 100 ? 'pan-x pan-y' : 'none',
                }}
              >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{
                    rotateY: direction === "next" ? 90 : -90,
                    opacity: 0,
                  }}
                  animate={{
                    rotateY: 0,
                    opacity: 1,
                  }}
                  exit={{
                    rotateY: direction === "next" ? -90 : 90,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="magazine-page aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden origin-center"
                  style={{ 
                    transformStyle: "preserve-3d",
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: zoomLevel > 100 ? 'top left' : 'center',
                  }}
                >
                  <PageContent 
                  page={currentPageData} 
                  onItemClick={(item, type) => {
                    setSelectedItem({ ...item, itemType: type });
                    setShowDetailModal(true);
                  }}
                  onNavigateToSection={(section) => {
                    const pageIndex = magazine.pages.findIndex(p => p.type === section);
                    if (pageIndex >= 0) {
                      goToPage(pageIndex);
                    }
                  }}
                  shareLink={params.shareLink}
                />
                </motion.div>
              </AnimatePresence>
              </div>
            </div>

            {/* Swipe hint for new users */}
            <AnimatePresence>
              {showSwipeHint && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
                >
                  <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-black/70 backdrop-blur-sm border border-white/20">
                    <Hand className="w-5 h-5 text-white animate-bounce" />
                    <span className="text-white text-sm font-medium">
                      Arraste para navegar entre páginas
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Continuous mode - vertical scroll */}
        {readingMode === 'continuous' && (
          <div 
            ref={scrollContainerRef}
            className="w-full h-full overflow-y-auto scroll-smooth px-4"
            onScroll={(e) => {
              const container = e.currentTarget;
              const scrollTop = container.scrollTop;
              const pageHeight = container.scrollHeight / totalPages;
              const newPage = Math.round(scrollTop / pageHeight);
              if (newPage !== currentPage && newPage >= 0 && newPage < totalPages) {
                setCurrentPage(newPage);
              }
            }}
          >
            <div className="max-w-2xl mx-auto py-8 space-y-8">
              {magazine.pages.map((page, index) => (
                <motion.div
                  key={index}
                  ref={(el) => { pageRefs.current[index] = el; }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "magazine-page aspect-[3/4] bg-white rounded-lg shadow-2xl overflow-hidden scroll-mt-8",
                    currentPage === index && "ring-4 ring-primary/50"
                  )}
                  style={{ 
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                  }}
                  onClick={() => setCurrentPage(index)}
                >
                  <PageContent 
                    page={page} 
                    onItemClick={(item, type) => {
                      setSelectedItem({ ...item, itemType: type });
                      setShowDetailModal(true);
                    }}
                    onNavigateToSection={(section) => {
                      const pageIndex = magazine.pages.findIndex(p => p.type === section);
                      if (pageIndex >= 0) {
                        pageRefs.current[pageIndex]?.scrollIntoView({ behavior: 'smooth' });
                        setCurrentPage(pageIndex);
                      }
                    }}
                    shareLink={params.shareLink}
                  />
                </motion.div>
              ))}
            </div>
            
            {/* Floating page indicator */}
            <div className="fixed bottom-24 right-8 z-30">
              <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <span className="text-white text-sm font-medium">
                  {currentPage + 1} / {totalPages}
                </span>
              </div>
            </div>
            
            {/* Quick navigation buttons */}
            <div className="fixed bottom-24 left-8 z-30 flex flex-col gap-2">
              <button
                onClick={() => {
                  pageRefs.current[0]?.scrollIntoView({ behavior: 'smooth' });
                  setCurrentPage(0);
                }}
                className="bg-black/70 backdrop-blur-sm rounded-full p-2 border border-white/20 text-white/70 hover:text-white hover:bg-black/90 transition-colors"
                title="Ir para o início"
              >
                <ChevronLeft className="w-5 h-5 rotate-90" />
              </button>
              <button
                onClick={() => {
                  pageRefs.current[totalPages - 1]?.scrollIntoView({ behavior: 'smooth' });
                  setCurrentPage(totalPages - 1);
                }}
                className="bg-black/70 backdrop-blur-sm rounded-full p-2 border border-white/20 text-white/70 hover:text-white hover:bg-black/90 transition-colors"
                title="Ir para o fim"
              >
                <ChevronRight className="w-5 h-5 rotate-90" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer with page indicator */}
      <footer className="bg-black/30 backdrop-blur-lg border-t border-white/10 py-3 px-4">
        <div className="container flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            {magazine.pages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (readingMode === 'continuous') {
                    pageRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
                  }
                  goToPage(index);
                }}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentPage === index
                    ? "bg-primary w-6"
                    : "bg-white/30 hover:bg-white/50"
                )}
              />
            ))}
          </div>
          <span className="text-white/50 text-sm">
            Página {currentPage + 1} de {totalPages}
          </span>
          {readingMode === 'continuous' && (
            <span className="text-white/30 text-xs ml-2">
              (Modo contínuo)
            </span>
          )}
        </div>
      </footer>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {showDetailModal && selectedItem && (
          <DetailModal
            item={selectedItem}
            type={selectedItem.itemType}
            shareLink={params.shareLink}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedItem(null);
            }}
            onNavigate={(type, id) => {
              // Navegar para a página correspondente
              const pageIndex = magazine.pages.findIndex(p => p.type === type + 's' || p.type === type);
              if (pageIndex >= 0) {
                goToPage(pageIndex);
              }
              setShowDetailModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function getPageTitle(page: any): string {
  switch (page.type) {
    case "cover":
      return "Capa";
    case "resumo_periodo":
      return "Resumo do Período";
    case "manutencoes":
      return "Manutenções";
    case "vistorias":
      return "Vistorias";
    case "ocorrencias":
      return "Ocorrências";
    case "checklists":
      return "Checklists";
    case "mensagem_sindico":
      return "Mensagem do Gestor";
    case "avisos":
      return "Avisos";
    case "eventos":
      return "Eventos";
    case "funcionarios":
      return "Funcionários";
    case "votacao":
      return "Votação";
    case "telefones":
      return "Telefones Úteis";
    case "realizacoes":
      return "Realizações";
    case "antes_depois":
      return "Antes e Depois";
    case "melhorias":
      return "Melhorias";
    case "aquisicoes":
      return "Aquisições";
    case "galeria":
      return "Galeria de Fotos";
    case "publicidade":
      return "Parceiros";
    case "personalizado":
      return "100% Personalizado";
    case "back_cover":
      return "Contracapa";
    default:
      return "Página";
  }
}

function PageContent({ page, onItemClick, onNavigateToSection, shareLink }: { page: any; onItemClick?: (item: any, type: string) => void; onNavigateToSection?: (section: string) => void; shareLink?: string }) {
  switch (page.type) {
    case "cover":
      return <CoverPage content={page.content} />;
    case "resumo_periodo":
      return <ResumoPeriodoPage content={page.content} onNavigateToSection={onNavigateToSection} />;
    case "manutencoes":
      return <ManutencoesPage content={page.content} onItemClick={onItemClick} shareLink={shareLink} />;
    case "vistorias":
      return <VistoriasPage content={page.content} onItemClick={onItemClick} shareLink={shareLink} />;
    case "ocorrencias":
      return <OcorrenciasPage content={page.content} onItemClick={onItemClick} shareLink={shareLink} />;
    case "checklists":
      return <ChecklistsPage content={page.content} onItemClick={onItemClick} shareLink={shareLink} />;
    case "mensagem_sindico":
      return <MensagemSindicoPage content={page.content} />;
    case "avisos":
      return <AvisosPage content={page.content} />;
    case "eventos":
      return <EventosPage content={page.content} />;
    case "funcionarios":
      return <FuncionariosPage content={page.content} />;
    case "votacao":
      return <VotacaoPage content={page.content} />;
    case "telefones":
      return <TelefonesPage content={page.content} />;
    case "realizacoes":
      return <RealizacoesPage content={page.content} />;
    case "antes_depois":
      return <AntesDepoisPage content={page.content} onItemClick={onItemClick} shareLink={shareLink} />;
    case "melhorias":
      return <MelhoriasPage content={page.content} />;
    case "aquisicoes":
      return <AquisicoesPage content={page.content} />;
    case "galeria":
      return <GaleriaPage content={page.content} />;
    case "publicidade":
      return <PublicidadePage content={page.content} />;
    case "personalizado":
      return <PersonalizadoPage content={page.content} />;
    case "back_cover":
      return <BackCoverPage content={page.content} />;
    default:
      return <div className="p-8">Conteúdo não disponível</div>;
  }
}

function CoverPage({ content }: { content: any }) {
  const hasBackgroundImage = content.capaUrl || content.imagem;
  
  return (
    <div 
      className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
      style={{
        backgroundImage: hasBackgroundImage 
          ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url(${content.capaUrl || content.imagem})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Gradient fallback quando não há imagem */}
      {!hasBackgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-white to-accent/20" />
      )}
      
      <div className="relative z-10">
        {/* Logo do condomínio ou ícone padrão */}
        {content.logoUrl ? (
          <div className="w-24 h-24 rounded-2xl overflow-hidden mb-6 mx-auto shadow-lg border-2 border-white/20">
            <img 
              src={content.logoUrl} 
              alt="Logo do Condomínio" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-2xl gradient-magazine flex items-center justify-center mb-6 mx-auto">
            <Building2 className="w-10 h-10 text-white" />
          </div>
        )}
        
        <div className={cn(
          "text-xs uppercase tracking-[0.3em] mb-2",
          hasBackgroundImage ? "text-white/80" : "text-muted-foreground"
        )}>
          {content.edicao}
        </div>
        
        <h1 className={cn(
          "font-serif text-4xl font-bold mb-2",
          hasBackgroundImage ? "text-white drop-shadow-lg" : "text-foreground"
        )}>
          {content.titulo}
        </h1>
        
        <p className={cn(
          "text-lg mb-8",
          hasBackgroundImage ? "text-white/90" : "text-muted-foreground"
        )}>
          {content.subtitulo}
        </p>
        
        <div className={cn(
          "section-divider",
          hasBackgroundImage && "bg-white/50"
        )} />
        
        <p className={cn(
          "text-sm mt-8",
          hasBackgroundImage ? "text-white/70" : "text-muted-foreground"
        )}>
        </p>
      </div>
    </div>
  );
}

function MensagemSindicoPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo || "Mensagem do Responsável"}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Foto do Responsável */}
        {content.foto ? (
          <div className="w-28 h-28 rounded-full overflow-hidden mb-4 ring-4 ring-primary/20 shadow-lg">
            <img
              src={content.foto}
              alt={content.nome || "Responsável"}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center mb-4 ring-4 ring-primary/10">
            <MessageSquare className="w-12 h-12 text-primary" />
          </div>
        )}
        
        <h3 className="font-serif text-xl font-semibold text-foreground">
          {content.nome || "Responsável"}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">{content.cargo || "Responsável"}</p>

        <blockquote className="text-center italic text-muted-foreground leading-relaxed max-w-md px-4">
          "{content.mensagem}"
        </blockquote>
        
        {content.assinatura && (
          <p className="mt-4 text-sm font-medium text-primary">
            — {content.assinatura}
          </p>
        )}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 2 —</div>
    </div>
  );
}

function AvisosPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4">
        {content.avisos.map((aviso: any, index: number) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-xl border-l-4",
              aviso.tipo === "urgente"
                ? "bg-red-50 border-red-500"
                : aviso.tipo === "importante"
                ? "bg-amber-50 border-amber-500"
                : "bg-blue-50 border-blue-500"
            )}
          >
            <div className="flex items-start gap-3">
              <Megaphone
                className={cn(
                  "w-5 h-5 mt-0.5",
                  aviso.tipo === "urgente"
                    ? "text-red-500"
                    : aviso.tipo === "importante"
                    ? "text-amber-500"
                    : "text-blue-500"
                )}
              />
              <div>
                <h3 className="font-semibold text-foreground">{aviso.titulo}</h3>
                <p className="text-sm text-muted-foreground">{aviso.descricao}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 3 —</div>
    </div>
  );
}

function EventosPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4">
        {content.eventos.map((evento: any, index: number) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{evento.titulo}</h3>
                <p className="text-sm text-muted-foreground">
                  {evento.data} às {evento.horario}
                </p>
                <p className="text-sm text-primary">{evento.local}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 4 —</div>
    </div>
  );
}

function FuncionariosPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 grid grid-cols-1 gap-4">
        {content.funcionarios.map((func: any, index: number) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-secondary/50 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{func.nome}</h3>
              <p className="text-sm text-muted-foreground">{func.cargo}</p>
              <p className="text-xs text-primary">{func.turno}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 5 —</div>
    </div>
  );
}

function VotacaoPage({ content }: { content: any }) {
  const totalVotos = content.opcoes.reduce((acc: number, opt: any) => acc + opt.votos, 0);

  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">{content.descricao}</p>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4">
        {content.opcoes.map((opcao: any, index: number) => {
          const percentage = Math.round((opcao.votos / totalVotos) * 100);
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{opcao.nome}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {opcao.votos} votos ({percentage}%)
                </span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full gradient-magazine rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Total de votos: {totalVotos}
        </p>
        <div className="text-xs text-muted-foreground">— 6 —</div>
      </div>
    </div>
  );
}

function TelefonesPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-3">
        {content.telefones.map((tel: any, index: number) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-secondary/50 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">{tel.nome}</span>
            </div>
            <span className="text-primary font-semibold">{tel.numero}</span>
          </div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 7 —</div>
    </div>
  );
}

function PublicidadePage({ content }: { content: any }) {
  const categoriaColors: Record<string, string> = {
    comercio: "bg-blue-100 text-blue-800 border-blue-200",
    servicos: "bg-green-100 text-green-800 border-green-200",
    profissionais: "bg-purple-100 text-purple-800 border-purple-200",
    alimentacao: "bg-orange-100 text-orange-800 border-orange-200",
    saude: "bg-red-100 text-red-800 border-red-200",
    educacao: "bg-yellow-100 text-yellow-800 border-yellow-200",
    outros: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const categoriaLabels: Record<string, string> = {
    comercio: "Comércio",
    servicos: "Serviços",
    profissionais: "Profissionais",
    alimentacao: "Alimentação",
    saude: "Saúde",
    educacao: "Educação",
    outros: "Outros",
  };

  return (
    <div className="h-full flex flex-col pt-10 px-6 pb-6 overflow-auto">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-sm font-medium mb-3">
          <Star className="w-4 h-4" />
          Parceiros Recomendados
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Apoie os comércios e profissionais da nossa comunidade
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {content.anunciantes?.map((anunciante: any, index: number) => (
          <div
            key={index}
            className={cn(
              "rounded-xl border-2 p-4 transition-all hover:shadow-lg hover:scale-[1.02]",
              categoriaColors[anunciante.categoria] || categoriaColors.outros
            )}
          >
            <div className="flex items-start gap-3">
              {anunciante.logoUrl ? (
                <img
                  src={anunciante.logoUrl}
                  alt={anunciante.nome}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/50 flex items-center justify-center">
                  <span className="text-xl font-bold">
                    {anunciante.nome.charAt(0)}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">
                  {anunciante.nome}
                </h3>
                <span className="text-xs opacity-75">
                  {categoriaLabels[anunciante.categoria] || "Outros"}
                </span>
              </div>
            </div>
            <p className="text-xs mt-2 line-clamp-2 opacity-90">
              {anunciante.descricao}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {anunciante.telefone && (
                <a
                  href={`tel:${anunciante.telefone}`}
                  className="inline-flex items-center gap-1 text-xs bg-white/50 px-2 py-1 rounded-full hover:bg-white/80 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  {anunciante.telefone}
                </a>
              )}
              {anunciante.whatsapp && (
                <a
                  href={`https://wa.me/${anunciante.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-800 px-2 py-1 rounded-full hover:bg-green-500/30 transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-4 pt-4 border-t border-dashed">
        <p className="text-xs text-muted-foreground">
          Quer anunciar aqui? Entre em contato com a administração
        </p>
      </div>
    </div>
  );
}

function RealizacaoItem({ item, statusColors, statusLabels }: { item: any; statusColors: Record<string, string>; statusLabels: Record<string, string> }) {
  const [showGallery, setShowGallery] = useState(false);
  
  // Combinar imagem principal com imagens adicionais
  const todasImagens = [
    ...(item.imagemUrl ? [{ url: item.imagemUrl, id: 0 }] : []),
    ...(item.imagens?.map((img: any, idx: number) => ({ url: img.imagemUrl || img.url, id: idx + 1 })) || []),
  ];

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
      <div className="flex items-start gap-4">
        {todasImagens.length > 0 ? (
          <div 
            className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer relative flex-shrink-0"
            onClick={() => setShowGallery(true)}
          >
            <img src={todasImagens[0].url} alt={item.titulo} className="w-full h-full object-cover" />
            {todasImagens.length > 1 && (
              <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                +{todasImagens.length - 1}
              </div>
            )}
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h3 className="font-semibold text-foreground truncate">{item.titulo}</h3>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full border flex-shrink-0",
              statusColors[item.status] || statusColors.concluido
            )}>
              {statusLabels[item.status] || "Concluído"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
          {item.data && <p className="text-xs text-emerald-600 mt-1">{item.data}</p>}
          {todasImagens.length > 1 && (
            <button 
              onClick={() => setShowGallery(true)}
              className="text-xs text-emerald-600 hover:underline mt-1"
            >
              Ver {todasImagens.length} fotos
            </button>
          )}
        </div>
      </div>
      
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowGallery(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{item.titulo}</h3>
              <button onClick={() => setShowGallery(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ImageGallery images={todasImagens} columns={2} aspectRatio="video" />
          </div>
        </div>
      )}
    </div>
  );
}

function RealizacoesPage({ content }: { content: any }) {
  const statusColors: Record<string, string> = {
    concluido: "bg-emerald-100 text-emerald-800 border-emerald-200",
    em_andamento: "bg-blue-100 text-blue-800 border-blue-200",
    planejado: "bg-amber-100 text-amber-800 border-amber-200",
  };

  const statusLabels: Record<string, string> = {
    concluido: "Concluído",
    em_andamento: "Em Andamento",
    planejado: "Planejado",
  };

  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-sm font-medium mb-3">
          <Trophy className="w-4 h-4" />
          Conquistas da Gestão
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {content.realizacoes?.map((item: any, index: number) => (
          <RealizacaoItem key={index} item={item} statusColors={statusColors} statusLabels={statusLabels} />
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 8 —</div>
    </div>
  );
}

function AntesDepoisPage({ content, onItemClick, shareLink }: { content: any; onItemClick?: (item: any, type: string) => void; shareLink?: string; }) {
  return (
    <div className="h-full flex flex-col pt-12 px-8 pb-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-3">
          <ArrowLeftRight className="w-4 h-4" />
          Transformações
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-6">
        {content.itens?.map((item: any, index: number) => (
          <motion.div 
            key={index} 
            className="space-y-3 p-3 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all"
            onClick={() => onItemClick?.(item, 'antes_depois')}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-foreground">{item.titulo}</h3>
              {shareLink && item.id && (
                <div 
                  className="ml-2 flex-shrink-0 p-1 bg-white rounded border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={(e) => { e.stopPropagation(); onItemClick?.(item, 'antes_depois'); }}
                  title="QR Code - Escaneie para ver este item"
                >
                  <QRCodeSVG 
                    value={`${window.location.origin}/revista/${shareLink}/item/antes_depois/${item.id}`}
                    size={40}
                    level="M"
                  />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-xs text-center text-muted-foreground uppercase tracking-wider">Antes</div>
                {item.fotoAntesUrl ? (
                  <img
                    src={item.fotoAntesUrl}
                    alt={`${item.titulo} - Antes`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-red-200"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-red-100 to-red-50 rounded-lg border-2 border-red-200 flex items-center justify-center">
                    <Image className="w-8 h-8 text-red-300" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="text-xs text-center text-muted-foreground uppercase tracking-wider">Depois</div>
                {item.fotoDepoisUrl ? (
                  <img
                    src={item.fotoDepoisUrl}
                    alt={`${item.titulo} - Depois`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-emerald-200"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg border-2 border-emerald-200 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-emerald-300" />
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-center text-muted-foreground">{item.descricao}</p>
            {item.status && (
              <div className="flex justify-between items-center text-xs">
                <span className={cn(
                  "px-2 py-0.5 rounded-full",
                  item.status === "concluido" ? "bg-green-100 text-green-700" :
                  item.status === "em_andamento" ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-700"
                )}>
                  {item.status === "concluido" ? "Concluído" : item.status === "em_andamento" ? "Em Andamento" : "Pendente"}
                </span>
                {item.responsavel && <span className="text-muted-foreground">{item.responsavel}</span>}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 9 —</div>
    </div>
  );
}

function MelhoriaItem({ item, statusColors, statusLabels, statusIcons }: { item: any; statusColors: Record<string, string>; statusLabels: Record<string, string>; statusIcons: Record<string, any> }) {
  const [showGallery, setShowGallery] = useState(false);
  const StatusIcon = statusIcons[item.status] || Wrench;
  
  const todasImagens = [
    ...(item.imagemUrl ? [{ url: item.imagemUrl, id: 0 }] : []),
    ...(item.imagens?.map((img: any, idx: number) => ({ url: img.imagemUrl || img.url, id: idx + 1 })) || []),
  ];

  return (
    <div className="p-4 rounded-xl bg-secondary/50 border border-border">
      <div className="flex items-start gap-4">
        {todasImagens.length > 0 ? (
          <div 
            className="w-14 h-14 rounded-lg overflow-hidden cursor-pointer relative flex-shrink-0"
            onClick={() => setShowGallery(true)}
          >
            <img src={todasImagens[0].url} alt={item.titulo} className="w-full h-full object-cover" />
            {todasImagens.length > 1 && (
              <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                +{todasImagens.length - 1}
              </div>
            )}
          </div>
        ) : (
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", statusColors[item.status] || "bg-gray-100")}>
            <StatusIcon className="w-5 h-5" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h3 className="font-semibold text-foreground truncate">{item.titulo}</h3>
            <span className={cn("text-xs px-2 py-1 rounded-full flex-shrink-0", statusColors[item.status] || "bg-gray-100 text-gray-800")}>
              {statusLabels[item.status] || item.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
          {item.previsao && <p className="text-xs text-primary mt-1">Previsão: {item.previsao}</p>}
          {todasImagens.length > 1 && (
            <button onClick={() => setShowGallery(true)} className="text-xs text-blue-600 hover:underline mt-1">
              Ver {todasImagens.length} fotos
            </button>
          )}
        </div>
      </div>
      
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowGallery(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{item.titulo}</h3>
              <button onClick={() => setShowGallery(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ImageGallery images={todasImagens} columns={2} aspectRatio="video" />
          </div>
        </div>
      )}
    </div>
  );
}

function MelhoriasPage({ content }: { content: any }) {
  const statusColors: Record<string, string> = {
    concluido: "bg-emerald-100 text-emerald-800",
    em_andamento: "bg-blue-100 text-blue-800",
    planejado: "bg-amber-100 text-amber-800",
  };

  const statusLabels: Record<string, string> = {
    concluido: "Concluído",
    em_andamento: "Em Andamento",
    planejado: "Planejado",
  };

  const statusIcons: Record<string, any> = {
    concluido: CheckCircle,
    em_andamento: Wrench,
    planejado: Calendar,
  };

  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-sm font-medium mb-3">
          <Wrench className="w-4 h-4" />
          Obras e Manutenções
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {content.melhorias?.map((item: any, index: number) => (
          <MelhoriaItem key={index} item={item} statusColors={statusColors} statusLabels={statusLabels} statusIcons={statusIcons} />
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 10 —</div>
    </div>
  );
}

function AquisicaoItem({ item }: { item: any }) {
  const [showGallery, setShowGallery] = useState(false);
  
  const todasImagens = [
    ...(item.imagemUrl ? [{ url: item.imagemUrl, id: 0 }] : []),
    ...(item.imagens?.map((img: any, idx: number) => ({ url: img.imagemUrl || img.url, id: idx + 1 })) || []),
  ];

  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200">
      <div className="flex items-start gap-4">
        {todasImagens.length > 0 ? (
          <div 
            className="w-14 h-14 rounded-lg overflow-hidden cursor-pointer relative flex-shrink-0"
            onClick={() => setShowGallery(true)}
          >
            <img src={todasImagens[0].url} alt={item.titulo} className="w-full h-full object-cover" />
            {todasImagens.length > 1 && (
              <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1 rounded-tl">
                +{todasImagens.length - 1}
              </div>
            )}
          </div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-amber-600" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h3 className="font-semibold text-foreground truncate">{item.titulo}</h3>
            <span className="text-sm font-bold text-amber-700 flex-shrink-0">{item.valor}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.descricao}</p>
          {item.data && <p className="text-xs text-amber-600 mt-1">{item.data}</p>}
          {todasImagens.length > 1 && (
            <button onClick={() => setShowGallery(true)} className="text-xs text-amber-600 hover:underline mt-1">
              Ver {todasImagens.length} fotos
            </button>
          )}
        </div>
      </div>
      
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setShowGallery(false)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{item.titulo}</h3>
              <button onClick={() => setShowGallery(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ImageGallery images={todasImagens} columns={2} aspectRatio="video" />
          </div>
        </div>
      )}
    </div>
  );
}

function AquisicoesPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col p-8">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 text-sm font-medium mb-3">
          <ShoppingBag className="w-4 h-4" />
          Novos Equipamentos
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo}
        </h2>
        <div className="section-divider mt-3" />
      </div>

      <div className="flex-1 space-y-4 overflow-auto">
        {content.aquisicoes?.map((item: any, index: number) => (
          <AquisicaoItem key={index} item={item} />
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">— 11 —</div>
    </div>
  );
}

function BackCoverPage({ content }: { content: any }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary/20 via-white to-accent/20 text-center">
      <div className="w-16 h-16 rounded-2xl gradient-magazine flex items-center justify-center mb-6">
        <BookOpen className="w-8 h-8 text-white" />
      </div>
      <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
        {content.titulo}
      </h2>
      <p className="text-muted-foreground mb-8">{content.mensagem}</p>
      <div className="section-divider" />
      <p className="text-sm text-muted-foreground mt-8">
      </p>
    </div>
  );
}


function GaleriaPage({ content }: { content: any }) {
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; legenda: string } | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<number>(0);
  
  const categoriaColors: Record<string, string> = {
    eventos: "bg-purple-100 text-purple-800",
    obras: "bg-orange-100 text-orange-800",
    areas_comuns: "bg-blue-100 text-blue-800",
    melhorias: "bg-emerald-100 text-emerald-800",
    outros: "bg-gray-100 text-gray-800",
  };
  
  const categoriaLabels: Record<string, string> = {
    eventos: "Eventos",
    obras: "Obras",
    areas_comuns: "Áreas Comuns",
    melhorias: "Melhorias",
    outros: "Outros",
  };

  const currentAlbum = content.albuns?.[selectedAlbum];

  return (
    <div className="h-full flex flex-col pt-10 px-6 pb-6 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="font-serif text-xl font-bold text-foreground">
          {content.titulo}
        </h2>
      </div>

      {/* Album selector */}
      {content.albuns && content.albuns.length > 1 && (
        <div className="flex gap-2 justify-center mb-4 flex-wrap">
          {content.albuns.map((album: any, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedAlbum(index)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                selectedAlbum === index
                  ? "bg-primary text-white"
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              {album.titulo}
            </button>
          ))}
        </div>
      )}

      {/* Current album */}
      {currentAlbum && (
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">{currentAlbum.titulo}</h3>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              categoriaColors[currentAlbum.categoria] || categoriaColors.outros
            )}>
              {categoriaLabels[currentAlbum.categoria] || "Outros"}
            </span>
          </div>

          {/* Photo grid */}
          {(!currentAlbum.fotos || currentAlbum.fotos.length === 0) && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Image className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">Nenhuma foto neste álbum</p>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-[calc(100%-80px)]">
            {currentAlbum.fotos?.map((foto: any, index: number) => (
              <div
                key={index}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setSelectedPhoto(foto)}
              >
                <img
                  src={foto.url}
                  alt={foto.legenda || `Foto ${index + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {foto.legenda && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs truncate">{foto.legenda}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-white/80"
              onClick={() => setSelectedPhoto(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-4xl max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.legenda}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              {selectedPhoto.legenda && (
                <p className="text-white text-center mt-4 text-lg">
                  {selectedPhoto.legenda}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {(!content.albuns || content.albuns.length === 0) && (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Image className="w-12 h-12 mb-4 opacity-50" />
          <p>Nenhum álbum disponível</p>
        </div>
      )}
    </div>
  );
}


function PersonalizadoPage({ content }: { content: any }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const nextImage = () => {
    if (content.imagens && content.imagens.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % content.imagens.length);
    }
  };
  
  const prevImage = () => {
    if (content.imagens && content.imagens.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + content.imagens.length) % content.imagens.length);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-sm font-medium mb-3">
          <Sparkles className="w-4 h-4" />
          100% Personalizado
        </div>
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {content.titulo || "Página Personalizada"}
        </h2>
        {content.subtitulo && (
          <p className="text-muted-foreground mt-1">{content.subtitulo}</p>
        )}
      </div>

      {/* Galeria de Imagens */}
      {content.imagens && content.imagens.length > 0 && (
        <div className="relative mb-6 rounded-xl overflow-hidden bg-muted/30">
          <div className="aspect-video relative">
            <img
              src={content.imagens[currentImageIndex]?.url}
              alt={content.imagens[currentImageIndex]?.legenda || "Imagem"}
              className="w-full h-full object-cover"
            />
            {content.imagens.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {content.imagens.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all",
                        currentImageIndex === index ? "bg-white w-4" : "bg-white/50"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {content.imagens[currentImageIndex]?.legenda && (
            <p className="text-center text-sm text-muted-foreground py-2">
              {content.imagens[currentImageIndex].legenda}
            </p>
          )}
        </div>
      )}

      {/* Descrição */}
      {content.descricao && (
        <div className="mb-6">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {content.descricao}
          </p>
        </div>
      )}

      {/* Links e Ações */}
      <div className="flex flex-wrap gap-3 mt-auto">
        {content.link && (
          <a
            href={content.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir Link
          </a>
        )}
        {content.videoUrl && (
          <a
            href={content.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
          >
            <Play className="w-4 h-4" />
            Ver Vídeo
          </a>
        )}
        {content.arquivoUrl && (
          <a
            href={content.arquivoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Baixar Arquivo
          </a>
        )}
      </div>

      {/* Empty state */}
      {!content.descricao && (!content.imagens || content.imagens.length === 0) && (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
          <Sparkles className="w-12 h-12 mb-4 opacity-50" />
          <p>Esta página pode ser personalizada pelo gestor</p>
          <p className="text-sm">Adicione título, descrição, imagens, links e muito mais!</p>
        </div>
      )}
    </div>
  );
}


// ========== PÁGINAS DE MANUTENÇÃO ==========

function ResumoPeriodoPage({ content, onNavigateToSection }: { content: any; onNavigateToSection?: (section: string) => void }) {
  const stats = content.estatisticas || {};
  
  // Dados para o gráfico de pizza simples
  const total = (stats.manutencoes?.total || 0) + (stats.vistorias?.total || 0) + (stats.ocorrencias?.total || 0) + (stats.checklists?.total || 0);
  
  return (
    <div className="h-full flex flex-col pt-10 px-6 pb-6 overflow-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">{content.titulo}</h2>
        <p className="text-muted-foreground">{content.periodo}</p>
        <div className="w-16 h-1 bg-primary mx-auto mt-3" />
      </div>

      {/* Cards Interativos */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        <motion.div 
          className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 text-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
          onClick={() => onNavigateToSection?.('manutencoes')}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Wrench className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <div className="text-3xl font-bold text-foreground">{stats.manutencoes?.total || 0}</div>
          <div className="text-sm text-muted-foreground">Manutenções</div>
          <div className="text-xs text-green-600 mt-1">{stats.manutencoes?.concluidas || 0} concluídas</div>
          {/* Mini barra de progresso */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${stats.manutencoes?.total ? ((stats.manutencoes?.concluidas || 0) / stats.manutencoes.total) * 100 : 0}%` }}
            />
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-emerald-100 dark:bg-emerald-900/30 rounded-xl p-4 text-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
          onClick={() => onNavigateToSection?.('vistorias')}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Search className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
          <div className="text-3xl font-bold text-foreground">{stats.vistorias?.total || 0}</div>
          <div className="text-sm text-muted-foreground">Vistorias</div>
          <div className="text-xs text-green-600 mt-1">{stats.vistorias?.aprovadas || 0} aprovadas</div>
          {/* Mini barra de progresso */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all"
              style={{ width: `${stats.vistorias?.total ? ((stats.vistorias?.aprovadas || 0) / stats.vistorias.total) * 100 : 0}%` }}
            />
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-4 text-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
          onClick={() => onNavigateToSection?.('ocorrencias')}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
          <div className="text-3xl font-bold text-foreground">{stats.ocorrencias?.total || 0}</div>
          <div className="text-sm text-muted-foreground">Ocorrências</div>
          <div className="text-xs text-orange-600 mt-1">{stats.ocorrencias?.abertas || 0} abertas</div>
          {/* Mini barra de progresso (invertida - menos abertas é melhor) */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-orange-500 h-1.5 rounded-full transition-all"
              style={{ width: `${stats.ocorrencias?.total ? ((stats.ocorrencias?.abertas || 0) / stats.ocorrencias.total) * 100 : 0}%` }}
            />
          </div>
        </motion.div>
        
        <motion.div 
          className="bg-teal-100 dark:bg-teal-900/30 rounded-xl p-4 text-center cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
          onClick={() => onNavigateToSection?.('checklists')}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-teal-600" />
          <div className="text-3xl font-bold text-foreground">{stats.checklists?.total || 0}</div>
          <div className="text-sm text-muted-foreground">Checklists</div>
          <div className="text-xs text-green-600 mt-1">{stats.checklists?.concluidos || 0} concluídos</div>
          {/* Mini barra de progresso */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-teal-500 h-1.5 rounded-full transition-all"
              style={{ width: `${stats.checklists?.total ? ((stats.checklists?.concluidos || 0) / stats.checklists.total) * 100 : 0}%` }}
            />
          </div>
        </motion.div>
      </div>

      {/* Legenda interativa */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span> Concluído/Aprovado
        </span>
        <span className="mx-3">|</span>
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span> Pendente/Aberto
        </span>
      </div>
      <p className="text-center text-xs text-muted-foreground mt-2">Clique num card para ver detalhes</p>
    </div>
  );
}

function ManutencoesPage({ content, onItemClick, activeFilter, onFilterChange, shareLink }: { 
  content: any; 
  onItemClick?: (item: any, type: string) => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  shareLink?: string;
}) {
  const [localFilter, setLocalFilter] = useState('todos');
  const filter = activeFilter || localFilter;
  const setFilter = onFilterChange || setLocalFilter;
  
  const filteredItems = content.manutencoes?.filter((item: any) => {
    if (filter === 'todos') return true;
    return item.status === filter;
  }) || [];

  return (
    <div className="h-full flex flex-col pt-10 px-6 pb-6 overflow-auto">
      <div className="text-center mb-6">
        <Wrench className="w-10 h-10 mx-auto mb-2 text-slate-600" />
        <h2 className="text-2xl font-bold text-foreground">{content.titulo}</h2>
        <div className="w-16 h-1 bg-slate-600 mx-auto mt-3" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-1 mb-6 justify-center">
        {['todos', 'concluida', 'em_andamento', 'pendente'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium transition-all",
              filter === status
                ? "bg-slate-600 text-white shadow-md"
                : "bg-white dark:bg-slate-700 text-muted-foreground hover:bg-gray-100"
            )}
          >
            {status === 'todos' ? 'Todos' : status === 'concluida' ? 'Concluídas' : status === 'em_andamento' ? 'Em Andamento' : 'Pendentes'}
          </button>
        ))}
      </div>

      <div className="space-y-3 flex-1">
        {filteredItems.map((item: any, index: number) => (
          <motion.div 
            key={index} 
            className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border-l-4 border-slate-600 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
            onClick={() => onItemClick?.(item, 'manutencao')}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-mono text-muted-foreground">{item.protocolo}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                item.status === "concluida" ? "bg-green-100 text-green-700" :
                item.status === "em_andamento" ? "bg-yellow-100 text-yellow-700" :
                "bg-gray-100 text-gray-700"
              )}>
                {item.status === "concluida" ? "Concluída" : item.status === "em_andamento" ? "Em Andamento" : item.status}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{item.titulo}</h3>
                <p className="text-sm text-muted-foreground">{item.local}</p>
              </div>
              {shareLink && item.id && (
                <div 
                  className="ml-2 flex-shrink-0 p-1 bg-white rounded border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={(e) => { e.stopPropagation(); onItemClick?.(item, 'manutencao'); }}
                  title="QR Code - Escaneie para ver este item"
                >
                  <QRCodeSVG 
                    value={`${window.location.origin}/revista/${shareLink}/item/manutencao/${item.id}`}
                    size={40}
                    level="M"
                  />
                </div>
              )}
            </div>
            {/* Imagens */}
            {item.imagens && item.imagens.length > 0 && (
              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                <ImageGallery 
                  images={item.imagens.map((img: any) => ({ id: img.id, url: img.url, legenda: img.legenda }))} 
                  columns={3} 
                  aspectRatio="video"
                />
              </div>
            )}
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{item.tipo === "preventiva" ? "Preventiva" : "Corretiva"}</span>
              <span>{item.data}</span>
            </div>
          </motion.div>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Wrench className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nenhuma manutenção encontrada com este filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}

function VistoriasPage({ content, onItemClick, shareLink }: { content: any; onItemClick?: (item: any, type: string) => void; shareLink?: string; }) {
  const [filter, setFilter] = useState('todos');
  
  const filteredItems = content.vistorias?.filter((item: any) => {
    if (filter === 'todos') return true;
    return item.status === filter;
  }) || [];

  return (
    <div className="h-full flex flex-col pt-10 px-6 pb-6 overflow-auto">
      <div className="text-center mb-6">
        <Search className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
        <h2 className="text-2xl font-bold text-foreground">{content.titulo}</h2>
        <div className="w-16 h-1 bg-emerald-600 mx-auto mt-3" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-1 mb-6 justify-center">
        {['todos', 'aprovada', 'pendente', 'reprovada'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium transition-all",
              filter === status
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-white dark:bg-slate-700 text-muted-foreground hover:bg-gray-100"
            )}
          >
            {status === 'todos' ? 'Todas' : status === 'aprovada' ? 'Aprovadas' : status === 'pendente' ? 'Pendentes' : 'Reprovadas'}
          </button>
        ))}
      </div>

      <div className="space-y-3 flex-1">
        {filteredItems.map((item: any, index: number) => (
          <motion.div 
            key={index} 
            className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border-l-4 border-emerald-600 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
            onClick={() => onItemClick?.(item, 'vistoria')}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-mono text-muted-foreground">{item.protocolo}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                item.status === "aprovada" ? "bg-green-100 text-green-700" :
                item.status === "pendente" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              )}>
                {item.status === "aprovada" ? "Aprovada" : item.status === "pendente" ? "Pendente" : item.status}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{item.titulo}</h3>
                <p className="text-sm text-muted-foreground">{item.local}</p>
              </div>
              {shareLink && item.id && (
                <div 
                  className="ml-2 flex-shrink-0 p-1 bg-white rounded border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={(e) => { e.stopPropagation(); onItemClick?.(item, 'vistoria'); }}
                  title="QR Code - Escaneie para ver este item"
                >
                  <QRCodeSVG 
                    value={`${window.location.origin}/revista/${shareLink}/item/vistoria/${item.id}`}
                    size={40}
                    level="M"
                  />
                </div>
              )}
            </div>
            {/* Imagens */}
            {item.imagens && item.imagens.length > 0 && (
              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                <ImageGallery 
                  images={item.imagens.map((img: any) => ({ id: img.id, url: img.url, legenda: img.legenda }))} 
                  columns={3} 
                  aspectRatio="video"
                />
              </div>
            )}
            <div className="text-right mt-2 text-xs text-muted-foreground">{item.data}</div>
          </motion.div>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nenhuma vistoria encontrada com este filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OcorrenciasPage({ content, onItemClick, shareLink }: { content: any; onItemClick?: (item: any, type: string) => void; shareLink?: string; }) {
  const [filter, setFilter] = useState('todos');
  
  const filteredItems = content.ocorrencias?.filter((item: any) => {
    if (filter === 'todos') return true;
    return item.status === filter;
  }) || [];
  return (
    <div className="h-full flex flex-col pt-10 px-6 pb-6 overflow-auto">
      <div className="text-center mb-6">
        <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-yellow-600" />
        <h2 className="text-2xl font-bold text-foreground">{content.titulo}</h2>
        <div className="w-16 h-1 bg-yellow-600 mx-auto mt-3" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-1 mb-6 justify-center">
        {['todos', 'resolvida', 'em_analise', 'aberta'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium transition-all",
              filter === status
                ? "bg-yellow-600 text-white shadow-md"
                : "bg-white dark:bg-slate-700 text-muted-foreground hover:bg-gray-100"
            )}
          >
            {status === 'todos' ? 'Todas' : status === 'resolvida' ? 'Resolvidas' : status === 'em_analise' ? 'Em Análise' : 'Abertas'}
          </button>
        ))}
      </div>

      <div className="space-y-3 flex-1">
        {filteredItems.map((item: any, index: number) => (
          <motion.div 
            key={index} 
            className={cn(
              "rounded-lg p-3 border-l-4 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all",
              item.prioridade === "alta" ? "bg-red-50 dark:bg-red-900/20 border-red-600" :
              item.prioridade === "media" ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-600" :
              "bg-blue-50 dark:bg-blue-900/20 border-blue-600"
            )}
            onClick={() => onItemClick?.(item, 'ocorrencia')}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-mono text-muted-foreground">{item.protocolo}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                item.status === "resolvida" ? "bg-green-100 text-green-700" :
                item.status === "em_analise" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              )}>
                {item.status === "resolvida" ? "Resolvida" : item.status === "em_analise" ? "Em Análise" : item.status}
              </span>
            </div>
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{item.titulo}</h3>
                <p className="text-sm text-muted-foreground">{item.local}</p>
              </div>
              {shareLink && item.id && (
                <div 
                  className="ml-2 flex-shrink-0 p-1 bg-white rounded border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={(e) => { e.stopPropagation(); onItemClick?.(item, 'ocorrencia'); }}
                  title="QR Code - Escaneie para ver este item"
                >
                  <QRCodeSVG 
                    value={`${window.location.origin}/revista/${shareLink}/item/ocorrencia/${item.id}`}
                    size={40}
                    level="M"
                  />
                </div>
              )}
            </div>
            {/* Imagens */}
            {item.imagens && item.imagens.length > 0 && (
              <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                <ImageGallery 
                  images={item.imagens.map((img: any) => ({ id: img.id, url: img.url, legenda: img.legenda }))} 
                  columns={3} 
                  aspectRatio="video"
                />
              </div>
            )}
            <div className="text-right mt-2 text-xs text-muted-foreground">{item.data}</div>
          </motion.div>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Nenhuma ocorrência encontrada com este filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistsPage({ content, onItemClick, shareLink }: { content: any; onItemClick?: (item: any, type: string) => void; shareLink?: string; }) {
  return (
    <div className="h-full flex flex-col pt-10 px-6 pb-6 overflow-auto">
      <div className="text-center mb-6">
        <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-teal-600" />
        <h2 className="text-2xl font-bold text-foreground">{content.titulo}</h2>
        <div className="w-16 h-1 bg-teal-600 mx-auto mt-3" />
      </div>

      <div className="space-y-3 flex-1">
        {content.checklists?.map((item: any, index: number) => {
          const percentual = Math.round((item.itensConcluidos / item.itensTotal) * 100);
          return (
            <motion.div 
              key={index} 
              className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-3 border-l-4 border-teal-600 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all"
              onClick={() => onItemClick?.(item, 'checklist')}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{item.titulo}</h3>
                  <p className="text-sm text-muted-foreground">Responsável: {item.responsavel}</p>
                </div>
                {shareLink && item.id && (
                  <div 
                    className="ml-2 flex-shrink-0 p-1 bg-white rounded border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={(e) => { e.stopPropagation(); onItemClick?.(item, 'checklist'); }}
                    title="QR Code - Escaneie para ver este item"
                  >
                    <QRCodeSVG 
                      value={`${window.location.origin}/revista/${shareLink}/item/checklist/${item.id}`}
                      size={40}
                      level="M"
                    />
                  </div>
                )}
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{item.itensConcluidos}/{item.itensTotal} itens</span>
                  <span>{percentual}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentual}%` }}
                  />
                </div>
              </div>
              {/* Imagens */}
              {item.imagens && item.imagens.length > 0 && (
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <ImageGallery 
                    images={item.imagens.map((img: any) => ({ id: img.id, url: img.url, legenda: img.legenda }))} 
                    columns={3} 
                    aspectRatio="video"
                  />
                </div>
              )}
              <div className="text-right mt-2 text-xs text-muted-foreground">{item.data}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


// ========== COMPONENTES INTERATIVOS ==========

// Modal de Detalhes
function DetailModal({ 
  item, 
  type, 
  onClose, 
  onNavigate,
  shareLink 
}: { 
  item: any; 
  type: string; 
  onClose: () => void;
  onNavigate: (type: string, id: string) => void;
  shareLink?: string;
}) {
  if (!item) return null;

  const getTypeIcon = () => {
    switch (type) {
      case 'manutencao': return <Wrench className="w-6 h-6 text-slate-600" />;
      case 'vistoria': return <Search className="w-6 h-6 text-emerald-600" />;
      case 'ocorrencia': return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'checklist': return <ClipboardCheck className="w-6 h-6 text-teal-600" />;
      case 'antes_depois': return <ArrowLeftRight className="w-6 h-6 text-purple-600" />;
      default: return null;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'manutencao': return 'bg-slate-100 border-slate-600';
      case 'vistoria': return 'bg-emerald-100 border-emerald-600';
      case 'ocorrencia': return 'bg-yellow-100 border-yellow-600';
      case 'checklist': return 'bg-teal-100 border-teal-600';
      case 'antes_depois': return 'bg-purple-100 border-purple-600';
      default: return 'bg-gray-100 border-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={cn("bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-auto shadow-2xl border-l-4", getTypeColor())}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon()}
            <div>
              <span className="text-xs font-mono text-muted-foreground">{item.protocolo}</span>
              <h3 className="font-bold text-lg text-foreground">{item.titulo}</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status e Data */}
          <div className="flex justify-between items-center">
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              item.status === "concluida" || item.status === "aprovada" || item.status === "resolvida" 
                ? "bg-green-100 text-green-700" 
                : item.status === "em_andamento" || item.status === "pendente" || item.status === "em_analise"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            )}>
              {item.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </span>
            <span className="text-sm text-muted-foreground">{item.data}</span>
          </div>

          {/* Informações */}
          <div className="space-y-3">
            {item.local && (
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">Local</span>
                  <p className="text-foreground">{item.local}</p>
                </div>
              </div>
            )}

            {item.tipo && (
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">Tipo</span>
                  <p className="text-foreground capitalize">{item.tipo}</p>
                </div>
              </div>
            )}

            {item.prioridade && (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">Prioridade</span>
                  <p className={cn(
                    "font-medium capitalize",
                    item.prioridade === "alta" ? "text-red-600" :
                    item.prioridade === "media" ? "text-yellow-600" : "text-blue-600"
                  )}>{item.prioridade}</p>
                </div>
              </div>
            )}

            {item.responsavel && (
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">Responsável</span>
                  <p className="text-foreground">{item.responsavel}</p>
                </div>
              </div>
            )}

            {item.descricao && (
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground">Descrição</span>
                  <p className="text-foreground">{item.descricao}</p>
                </div>
              </div>
            )}
          </div>

          {/* Ações Rápidas */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {item.id && (
              <a
                href={`/dashboard/${type === 'manutencao' ? 'manutencoes' : type === 'vistoria' ? 'vistorias' : type === 'ocorrencia' ? 'ocorrencias' : type === 'checklist' ? 'checklists' : ''}?item=${item.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Ver no Sistema
              </a>
            )}
            <Button size="sm" variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <Share2 className="w-4 h-4" />
              Partilhar
            </Button>
            <Button size="sm" variant="outline" className="gap-2">
              <FileDown className="w-4 h-4" />
              Exportar
            </Button>
          </div>

          {/* QR Code para acesso público */}
          {shareLink && item.id && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3">QR Code de Acesso</h4>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <QRCodeSVG 
                    value={`${window.location.origin}/revista/${shareLink}/item/${type}/${item.id}`}
                    size={100}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground font-medium mb-1">Escaneie para compartilhar</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Este QR Code leva diretamente a este item. Ideal para compartilhar com pessoas externas — o acesso é restrito somente a este registro.
                  </p>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/revista/${shareLink}/item/${type}/${item.id}`;
                      navigator.clipboard.writeText(url);
                      toast?.("Link copiado!", { description: "O link público do item foi copiado." });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Copiar Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Links Relacionados */}
          {type === 'vistoria' && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Registros Relacionados</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => onNavigate('ocorrencia', 'OCO-2026-001')}
                  className="w-full text-left p-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Ver ocorrências geradas</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
                <button 
                  onClick={() => onNavigate('manutencao', 'MAN-2026-001')}
                  className="w-full text-left p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4 text-slate-600" />
                  <span className="text-sm">Ver manutenções relacionadas</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              </div>
            </div>
          )}

          {type === 'ocorrencia' && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-2">Resolução</h4>
              <button 
                onClick={() => onNavigate('manutencao', 'MAN-2026-002')}
                className="w-full text-left p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Ver manutenção que resolveu</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Barra de Filtros
function FilterBar({ 
  activeFilter, 
  onFilterChange,
  filterPeriod,
  onPeriodChange,
  type 
}: { 
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filterPeriod: string;
  onPeriodChange: (period: string) => void;
  type: string;
}) {
  const statusOptions = type === 'manutencao' 
    ? ['todos', 'concluida', 'em_andamento', 'pendente']
    : type === 'vistoria'
    ? ['todos', 'aprovada', 'pendente', 'reprovada']
    : type === 'ocorrencia'
    ? ['todos', 'resolvida', 'em_analise', 'aberta']
    : ['todos'];

  const statusLabels: Record<string, string> = {
    todos: 'Todos',
    concluida: 'Concluída',
    em_andamento: 'Em Andamento',
    pendente: 'Pendente',
    aprovada: 'Aprovada',
    reprovada: 'Reprovada',
    resolvida: 'Resolvida',
    em_analise: 'Em Análise',
    aberta: 'Aberta',
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-2 bg-white/50 dark:bg-slate-800/50 rounded-lg">
      <div className="flex gap-1">
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => onFilterChange(status)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-all",
              activeFilter === status
                ? "bg-primary text-white shadow-md"
                : "bg-white dark:bg-slate-700 text-muted-foreground hover:bg-gray-100"
            )}
          >
            {statusLabels[status] || status}
          </button>
        ))}
      </div>
      <div className="flex gap-1 ml-auto">
        <select
          value={filterPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          className="px-2 py-1 rounded-lg text-xs bg-white dark:bg-slate-700 border-0 focus:ring-2 focus:ring-primary"
        >
          <option value="todos">Todo Período</option>
          <option value="semana">Última Semana</option>
          <option value="mes">Último Mês</option>
          <option value="trimestre">Último Trimestre</option>
        </select>
      </div>
    </div>
  );
}

// Gráfico de Pizza Interativo (simples, sem dependências)
function InteractivePieChart({ 
  data, 
  onSegmentClick 
}: { 
  data: { label: string; value: number; color: string }[];
  onSegmentClick: (label: string) => void;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        {data.map((item, index) => {
          const angle = (item.value / total) * 360;
          const startAngle = currentAngle;
          currentAngle += angle;
          
          const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = 50 + 40 * Math.cos((startAngle + angle - 90) * Math.PI / 180);
          const y2 = 50 + 40 * Math.sin((startAngle + angle - 90) * Math.PI / 180);
          
          const largeArc = angle > 180 ? 1 : 0;
          
          return (
            <path
              key={index}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={item.color}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onSegmentClick(item.label)}
            />
          );
        })}
      </svg>
      <div className="space-y-1">
        {data.map((item, index) => (
          <button
            key={index}
            onClick={() => onSegmentClick(item.label)}
            className="flex items-center gap-2 text-xs hover:bg-gray-100 p-1 rounded transition-colors w-full text-left"
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.label}: {item.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Botões de Ação Rápida
function QuickActions({ onExportPDF, onShare, onExportExcel, onPrint }: {
  onExportPDF: () => void;
  onShare: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
}) {
  return (
    <div className="flex gap-2 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg shadow-sm">
      <Button size="sm" variant="ghost" onClick={onExportPDF} className="gap-1 text-xs">
        <Download className="w-3 h-3" />
        PDF
      </Button>
      <Button size="sm" variant="ghost" onClick={onShare} className="gap-1 text-xs">
        <Share2 className="w-3 h-3" />
        Partilhar
      </Button>
      <Button size="sm" variant="ghost" onClick={onExportExcel} className="gap-1 text-xs">
        <FileDown className="w-3 h-3" />
        Excel
      </Button>
      <Button size="sm" variant="ghost" onClick={onPrint} className="gap-1 text-xs">
        <FileText className="w-3 h-3" />
        Imprimir
      </Button>
    </div>
  );
}
