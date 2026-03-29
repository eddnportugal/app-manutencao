import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { QRCodeGenerator } from "@/components/QRCodeGenerator";
import {
  ArrowLeft,
  ClipboardList,
  Wrench,
  AlertTriangle,
  Camera,
  Search,
  Zap,
  Star,
  Shield,
  FileText,
  Settings2,
  ListChecks,
  MapPin,
  Users,
  DollarSign,
  Clock,
  PenTool,
  Eye,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  MapPinned,
  CalendarIcon,
  Loader2,
  CheckCircle2,
  Save,
  QrCode,
  X,
  ScanLine,
  List,
  ChevronDown,
  ChevronUp,
  Hash,
  Printer,
  Share2,
  Download,
} from "lucide-react";

// Mapeamento de icones
const ICONES_MAP: Record<string, React.ElementType> = {
  ClipboardList, Wrench, AlertTriangle, Camera, Search, Zap, Star, Shield,
  FileText, Settings2, ListChecks, MapPin, Users, DollarSign, Clock, PenTool, Eye, Sparkles,
};

function getIconComponent(key: string): React.ElementType {
  return ICONES_MAP[key] || ClipboardList;
}

// Campos disponiveis
const CAMPOS_INFO: Record<string, { label: string; tipo: string; descricao: string }> = {
  titulo: { label: "Titulo", tipo: "texto", descricao: "Nome/titulo da tarefa" },
  descricao: { label: "Descricao", tipo: "textarea", descricao: "Descricao detalhada" },
  local: { label: "Local / Item da Manutencao", tipo: "texto", descricao: "Ex: Bloco A - Elevador" },
  imagens: { label: "Fotos", tipo: "imagens", descricao: "Galeria de imagens com legenda" },
  statusPersonalizado: { label: "Status", tipo: "status_select", descricao: "Status personalizado" },
  protocolo: { label: "Protocolo", tipo: "auto_numero", descricao: "Numero de protocolo automatico" },
  localizacao: { label: "Localizacao", tipo: "gps", descricao: "Endereco via GPS" },
  prioridade: { label: "Prioridade", tipo: "select", descricao: "Baixa, Media, Alta, Urgente" },
  responsavelId: { label: "Responsavel", tipo: "select", descricao: "Membro da equipe responsavel" },
  itensChecklist: { label: "Checklist", tipo: "checklist", descricao: "Lista de itens a verificar" },
  prazoConclusao: { label: "Prazo de Conclusao", tipo: "data", descricao: "Data limite para conclusao" },
  custoEstimado: { label: "Custo Estimado", tipo: "moeda", descricao: "Valor estimado (R$)" },
  nivelUrgencia: { label: "Nivel de Urgencia", tipo: "select", descricao: "Baixo, Medio, Alto, Critico" },
  anexos: { label: "Anexos", tipo: "arquivos", descricao: "Documentos e arquivos anexos" },
  qrcode: { label: "QR Code", tipo: "qrcode", descricao: "Leitura de QR Code" },
  assinaturaTecnico: { label: "Assinatura Tecnico", tipo: "assinatura", descricao: "Assinatura digital do tecnico" },
  assinaturaSolicitante: { label: "Assinatura Solicitante", tipo: "assinatura", descricao: "Assinatura digital do solicitante" },
};

// Ordem preferida dos campos (local primeiro, titulo depois)
const ORDEM_CAMPOS = [
  "local", "titulo", "descricao", "protocolo", "statusPersonalizado",
  "localizacao", "prioridade", "nivelUrgencia", "responsavelId",
  "prazoConclusao", "custoEstimado", "imagens", "itensChecklist",
  "qrcode", "anexos", "assinaturaTecnico", "assinaturaSolicitante",
];

// ============ ASSINATURA ============
function SignaturePad({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="border-2 rounded-lg bg-white overflow-hidden" style={{ touchAction: "none" }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          className="w-full cursor-crosshair"
          style={{ height: "150px", touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={clearCanvas}>
          <Trash2 className="w-3 h-3 mr-1" /> Limpar
        </Button>
        {value && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Assinatura capturada</span>}
      </div>
    </div>
  );
}

// ============ QR CODE SCANNER ============
function QrCodeScanner({ onScan, onClose }: { onScan: (text: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval>;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (!active) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        intervalId = setInterval(async () => {
          if (!active || !videoRef.current || !canvasRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(video, 0, 0);
          if ("BarcodeDetector" in window) {
            try {
              const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
              const barcodes = await detector.detect(canvas);
              if (barcodes.length > 0) {
                clearInterval(intervalId);
                onScan(barcodes[0].rawValue);
              }
            } catch { /* continue */ }
          }
        }, 500);
      } catch {
        setError("Nao foi possivel acessar a camera");
      }
    }

    startCamera();
    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [onScan]);

  return (
    <div className="space-y-3">
      {error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <video ref={videoRef} className="w-full" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-white/60 rounded-2xl" />
          </div>
        </div>
      )}
      <p className="text-xs text-center text-muted-foreground">Aponte a camera para um QR Code</p>
      <Button variant="outline" className="w-full" onClick={onClose}>Cancelar</Button>
    </div>
  );
}

// ============ GERAR HTML DO REGISTRO PARA IMPRESSÃO ============
function gerarHtmlRegistro(dados: Record<string, any>, protocolo: string | null, status: string, createdAt: string, checklistItems: any[] | null, imagens: any[] | null, assinaturas: Record<string, string> | null, registroId?: number) {
  const statusLabel: Record<string, string> = { aberto: "Aberto", em_andamento: "Em Andamento", aguardando: "Aguardando", concluido: "Concluído", cancelado: "Cancelado", pendente: "Pendente" };
  const dataFormatada = new Date(createdAt).toLocaleDateString("pt-BR") + " às " + new Date(createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const publicUrl = registroId ? `${window.location.origin}/publico/registro/${registroId}` : null;
  
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Registro ${protocolo ? "#" + protocolo : ""}</title>
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"><\/script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
    .header { border-bottom: 3px solid #333; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-left { flex: 1; }
    .header h1 { font-size: 22px; margin-bottom: 4px; }
    .header .meta { font-size: 13px; color: #666; display: flex; gap: 16px; flex-wrap: wrap; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: #e5e7eb; color: #374151; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 4px; }
    .section-value { font-size: 14px; color: #374151; }
    .checklist-item { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 4px 0; }
    .check-yes { color: #22c55e; font-weight: bold; }
    .check-no { color: #d1d5db; }
    .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .photos img { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb; }
    .signature-section { margin-top: 12px; }
    .signature-img { max-width: 300px; height: 100px; object-fit: contain; border: 1px solid #e5e7eb; border-radius: 8px; background: #fafafa; padding: 8px; }
    .qr-section { text-align: center; margin-top: 24px; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fafafa; }
    .qr-section canvas { margin: 8px auto; display: block; }
    .qr-section .qr-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .qr-section .qr-url { font-size: 10px; color: #9ca3af; word-break: break-all; margin-top: 8px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; text-align: center; }
    @media print { body { padding: 16px; } .qr-section { break-inside: avoid; } }
  </style></head><body>`;
  
  html += `<div class="header"><div class="header-left"><h1>${dados.titulo || dados.local || "Registro"}</h1><div class="meta">`;
  if (protocolo) html += `<span><strong>Protocolo:</strong> #${protocolo}</span>`;
  html += `<span><strong>Status:</strong> <span class="badge">${statusLabel[status] || status}</span></span>`;
  html += `<span><strong>Data:</strong> ${dataFormatada}</span>`;
  html += `</div></div>`;
  // QR Code pequeno no cabeçalho
  if (publicUrl) {
    html += `<div id="qr-header" style="margin-left:16px;flex-shrink:0;text-align:center;"><canvas id="qr-canvas-header"></canvas><div style="font-size:9px;color:#9ca3af;">Acesso Público</div></div>`;
  }
  html += `</div>`;

  // Dados
  Object.entries(dados).filter(([k]) => !k.startsWith("_") && !k.startsWith("assinatura")).forEach(([key, val]) => {
    const info = CAMPOS_INFO[key];
    if (!info || !val) return;
    html += `<div class="section"><div class="section-title">${info.label}</div><div class="section-value">${String(val)}</div></div>`;
  });

  // Checklist
  if (Array.isArray(checklistItems) && checklistItems.length > 0) {
    html += `<div class="section"><div class="section-title">Checklist</div>`;
    checklistItems.forEach((it: any) => {
      html += `<div class="checklist-item"><span class="${it.checked ? 'check-yes' : 'check-no'}">${it.checked ? '✓' : '○'}</span><span${it.checked ? ' style="text-decoration:line-through;color:#9ca3af"' : ''}>${it.texto}</span></div>`;
    });
    html += `</div>`;
  }

  // Fotos
  if (Array.isArray(imagens) && imagens.length > 0) {
    html += `<div class="section"><div class="section-title">Fotos (${imagens.length})</div><div class="photos">`;
    imagens.forEach((img: any) => { html += `<img src="${img.url}" alt="${img.legenda || ''}" />`; });
    html += `</div></div>`;
  }

  // Assinaturas
  if (assinaturas && Object.keys(assinaturas).length > 0) {
    Object.entries(assinaturas).forEach(([key, val]) => {
      const label = key === "tecnico" ? "Assinatura Técnico" : key === "solicitante" ? "Assinatura Solicitante" : `Assinatura ${key}`;
      html += `<div class="section signature-section"><div class="section-title">${label}</div><img class="signature-img" src="${val}" /></div>`;
    });
  }

  // QR Code grande no rodapé
  if (publicUrl) {
    html += `<div class="qr-section"><div class="qr-label">📱 Acesso Público via QR Code</div><canvas id="qr-canvas-footer"></canvas><div class="qr-url">${publicUrl}</div></div>`;
  }

  html += `<div class="footer">Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"})}</div>`;
  
  // Script para gerar QR codes após carregar
  if (publicUrl) {
    html += `<script>
      document.addEventListener('DOMContentLoaded', function() {
        var url = "${publicUrl}";
        var headerCanvas = document.getElementById('qr-canvas-header');
        var footerCanvas = document.getElementById('qr-canvas-footer');
        if (typeof QRCode !== 'undefined') {
          if (headerCanvas) QRCode.toCanvas(headerCanvas, url, { width: 80, margin: 1, errorCorrectionLevel: 'H' });
          if (footerCanvas) QRCode.toCanvas(footerCanvas, url, { width: 180, margin: 2, errorCorrectionLevel: 'H' });
        }
      });
    <\/script>`;
  }
  
  html += `</body></html>`;
  return html;
}

// ============ DETALHES DO REGISTRO (busca completo sob demanda) ============
function RegistroDetalhes({ registroId, dadosResumo, atualizarStatusMutation, currentStatus, protocolo, createdAt }: {
  registroId: number;
  dadosResumo: Record<string, any>;
  atualizarStatusMutation: any;
  currentStatus: string;
  protocolo: string | null;
  createdAt: string;
}) {
  const { data: registroCompleto } = trpc.registrosPersonalizados.obter.useQuery(
    { id: registroId },
    { enabled: !!registroId }
  );

  const dados = dadosResumo;

  // Extrair imagens, checklist e assinaturas do registro completo (carregado sob demanda)
  const checklistItems = registroCompleto?.checklistItems 
    ? (typeof registroCompleto.checklistItems === "string" ? JSON.parse(registroCompleto.checklistItems) : registroCompleto.checklistItems)
    : null;
  const imagens = registroCompleto?.imagens
    ? (typeof registroCompleto.imagens === "string" ? JSON.parse(registroCompleto.imagens) : registroCompleto.imagens)
    : null;
  const assinaturas = registroCompleto?.assinaturas
    ? (typeof registroCompleto.assinaturas === "string" ? JSON.parse(registroCompleto.assinaturas) : registroCompleto.assinaturas)
    : null;

  // Imprimir registro
  const handlePrint = () => {
    const html = gerarHtmlRegistro(dados, protocolo, currentStatus, createdAt, checklistItems, imagens, assinaturas, registroId);
    const win = window.open("", "_blank");
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };

  // Compartilhar
  const handleShare = async () => {
    const publicUrl = `${window.location.origin}/publico/registro/${registroId}`;
    const title = dados.titulo || dados.local || "Registro";
    const text = `${title}${protocolo ? " #" + protocolo : ""}\nStatus: ${currentStatus}\nData: ${new Date(createdAt).toLocaleDateString("pt-BR")}\n\nAcesso: ${publicUrl}`;
    if (navigator.share) {
      try { await navigator.share({ title, text, url: publicUrl }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado para a área de transferência!");
    }
  };

  // Download como imagem (gera canvas -> png)
  const handleDownload = () => {
    const html = gerarHtmlRegistro(dados, protocolo, currentStatus, createdAt, checklistItems, imagens, assinaturas, registroId);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registro-${protocolo || registroId}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Arquivo baixado!");
  };

  return (
    <div className="border-t px-5 py-5 bg-gray-50/50 space-y-4">
      {/* Botões de ação: Imprimir, Compartilhar, Baixar, QR Code */}
      <div className="flex gap-2 pb-3 border-b border-gray-100 flex-wrap">
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs flex-1" onClick={handlePrint}>
          <Printer className="w-3.5 h-3.5" /> Imprimir
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs flex-1" onClick={handleShare}>
          <Share2 className="w-3.5 h-3.5" /> Compartilhar
        </Button>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs flex-1" onClick={handleDownload}>
          <Download className="w-3.5 h-3.5" /> Baixar
        </Button>
        <QRCodeGenerator
          tipo="registro"
          id={registroId}
          titulo={dados.titulo || dados.local || "Registro"}
          protocolo={protocolo || undefined}
        />
      </div>

      {/* Campos de dados (excluindo assinaturas que são renderizadas como imagem) */}
      {Object.entries(dados).filter(([k]) => !k.startsWith("_") && !k.startsWith("assinatura")).map(([key, val]) => {
        const fieldInfo = CAMPOS_INFO[key];
        if (!fieldInfo || !val) return null;
        return (
          <div key={key}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{fieldInfo.label}</p>
            <p className="text-sm text-gray-700">{String(val)}</p>
          </div>
        );
      })}

      {/* Checklist */}
      {Array.isArray(checklistItems) && checklistItems.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Checklist</p>
          <div className="space-y-1.5">
            {checklistItems.map((it: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {it.checked ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> : <div className="w-4 h-4 border-2 border-gray-300 rounded shrink-0" />}
                <span className={it.checked ? "line-through text-gray-400" : "text-gray-700"}>{it.texto}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imagens */}
      {Array.isArray(imagens) && imagens.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Fotos ({imagens.length})</p>
          <div className="grid grid-cols-4 gap-1.5">
            {imagens.map((img: any, i: number) => (
              <img key={i} src={img.url} alt="" className="w-full h-16 object-cover rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* Assinaturas como imagem */}
      {assinaturas && Object.keys(assinaturas).length > 0 && (
        <div className="space-y-3">
          {Object.entries(assinaturas).map(([key, val]) => {
            const label = key === "tecnico" ? "Assinatura Técnico" : key === "solicitante" ? "Assinatura Solicitante" : `Assinatura ${key}`;
            return (
              <div key={key}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{label}</p>
                <div className="bg-white border border-gray-200 rounded-xl p-3 inline-block">
                  <img src={val as string} alt={label} className="max-w-[250px] h-[80px] object-contain" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alterar Status */}
      <div className="pt-3 border-t">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Alterar Status</p>
        <Select
          value={currentStatus}
          onValueChange={(v: string) => atualizarStatusMutation.mutate({ id: registroId, status: v })}
        >
          <SelectTrigger className="h-9 text-xs rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="aberto">Aberto</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="aguardando">Aguardando</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function FuncaoPersonalizadaFormPage() {
  const params = useParams();
  const funcaoId = params.funcaoId ? parseInt(params.funcaoId) : null;
  const [, setLocation] = useLocation();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [checklistItems, setChecklistItems] = useState<{ texto: string; checked: boolean }[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [imagePreviews, setImagePreviews] = useState<{ url: string; legenda: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [tab, setTab] = useState<"form" | "registros">("form");
  const [busca, setBusca] = useState("");
  const [expandedRegistro, setExpandedRegistro] = useState<number | null>(null);

  const { data: funcao, isLoading, error } = trpc.funcoesPersonalizadas.obter.useQuery(
    { id: funcaoId! },
    { enabled: !!funcaoId }
  );

  const { data: condominios } = trpc.condominio.list.useQuery();
  const condominioId = funcao?.condominioId || condominios?.[0]?.id;

  const { data: registros, refetch: refetchRegistros } = trpc.registrosPersonalizados.listar.useQuery(
    { funcaoId: funcaoId!, ...(busca ? { busca } : {}) },
    { enabled: !!funcaoId && tab === "registros" }
  );

  const criarRegistroMutation = trpc.registrosPersonalizados.criar.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Registro salvo com sucesso!");
      refetchRegistros();
    },
    onError: (err: any) => {
      toast.error("Erro ao salvar: " + err.message);
      setIsSubmitting(false);
    },
  });

  const atualizarStatusMutation = trpc.registrosPersonalizados.atualizarStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      refetchRegistros();
    },
  });

  const camposAtivos: string[] = useMemo(() => {
    if (!funcao) return [];
    try {
      let raw: any = funcao.camposAtivos;
      if (typeof raw === "string") raw = JSON.parse(raw);
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === "object") {
        return Object.entries(raw).filter(([_, v]) => v === true).map(([k]) => k);
      }
      return [];
    } catch { return []; }
  }, [funcao]);

  const camposOrdenados = useMemo(() => {
    return ORDEM_CAMPOS.filter(c => camposAtivos.includes(c))
      .concat(camposAtivos.filter(c => !ORDEM_CAMPOS.includes(c)));
  }, [camposAtivos]);

  const camposObrigatorios: string[] = useMemo(() => {
    if (!funcao) return [];
    try {
      let raw: any = funcao.camposObrigatorios;
      if (typeof raw === "string") raw = JSON.parse(raw);
      if (Array.isArray(raw)) return raw;
      if (raw && typeof raw === "object") {
        return Object.entries(raw).filter(([_, v]) => v === true).map(([k]) => k);
      }
      return [];
    } catch { return []; }
  }, [funcao]);

  // Protocolo numerico automatico
  useEffect(() => {
    if (camposAtivos.includes("protocolo") && !formValues.protocolo) {
      const proto = String(Date.now()).slice(-8);
      setFormValues(prev => ({ ...prev, protocolo: proto }));
    }
  }, [camposAtivos]);

  // GPS -> Endereco (reverse geocoding)
  useEffect(() => {
    if (camposAtivos.includes("localizacao") && !formValues.localizacao && navigator.geolocation) {
      setFormValues(prev => ({ ...prev, localizacao: "Obtendo localizacao..." }));
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          try {
            const resp = await fetch(
              "/api/geocode/reverse?lat=" + lat + "&lon=" + lng
            );
            const data = await resp.json();
            const addr = data.display_name || (lat.toFixed(6) + ", " + lng.toFixed(6));
            setFormValues(prev => ({ ...prev, localizacao: addr, _coords: lat + "," + lng }));
          } catch {
            setFormValues(prev => ({ ...prev, localizacao: lat.toFixed(6) + ", " + lng.toFixed(6) }));
          }
        },
        () => {
          setFormValues(prev => ({ ...prev, localizacao: "GPS nao disponivel" }));
        }
      );
    }
  }, [camposAtivos]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreviews(prev => [...prev, { url: reader.result as string, legenda: "" }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => setImagePreviews(prev => prev.filter((_, i) => i !== index));

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setChecklistItems(prev => [...prev, { texto: newChecklistItem.trim(), checked: false }]);
    setNewChecklistItem("");
  };

  const handleSubmit = async () => {
    for (const campo of camposObrigatorios) {
      if (campo === "imagens" && imagePreviews.length === 0) {
        toast.error("O campo \"" + (CAMPOS_INFO[campo]?.label || campo) + "\" e obrigatorio");
        return;
      }
      if (campo === "itensChecklist" && checklistItems.length === 0) {
        toast.error("O campo \"" + (CAMPOS_INFO[campo]?.label || campo) + "\" e obrigatorio");
        return;
      }
      if (!["imagens", "itensChecklist", "protocolo", "localizacao"].includes(campo)) {
        if (!formValues[campo] || (typeof formValues[campo] === "string" && !formValues[campo].trim())) {
          toast.error("O campo \"" + (CAMPOS_INFO[campo]?.label || campo) + "\" e obrigatorio");
          return;
        }
      }
    }

    if (!condominioId || !funcaoId) {
      toast.error("Dados incompletos");
      return;
    }

    setIsSubmitting(true);

    const assinaturas: Record<string, string> = {};
    if (formValues.assinaturaTecnico) assinaturas.tecnico = formValues.assinaturaTecnico;
    if (formValues.assinaturaSolicitante) assinaturas.solicitante = formValues.assinaturaSolicitante;

    criarRegistroMutation.mutate({
      funcaoId,
      condominioId,
      protocolo: formValues.protocolo || undefined,
      dados: { ...formValues },
      imagens: imagePreviews.length > 0 ? imagePreviews : undefined,
      checklistItems: checklistItems.length > 0 ? checklistItems : undefined,
      assinaturas: Object.keys(assinaturas).length > 0 ? assinaturas : undefined,
      status: formValues.statusPersonalizado || "aberto",
    });
  };

  const resetForm = () => {
    setSubmitted(false);
    setFormValues({});
    setChecklistItems([]);
    setImagePreviews([]);
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50/30">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-xl shadow-orange-500/20 mb-4">
          <Loader2 className="w-7 h-7 animate-spin text-white" />
        </div>
        <p className="text-sm text-gray-400 font-medium">Carregando função...</p>
      </div>
    );
  }

  if (error || !funcao) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50/30 p-4">
        <div className="max-w-md w-full rounded-2xl border border-gray-200/60 bg-white shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Função não encontrada</h2>
          <p className="text-sm text-gray-500 mb-6">A função solicitada não existe ou foi removida.</p>
          <Button onClick={() => window.history.back()} variant="outline" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50/30 p-4">
        <div className="max-w-md w-full rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
          <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${funcao.cor}, ${funcao.cor}88)` }} />
          <div className="p-8 text-center">
            <div 
              className="w-18 h-18 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${funcao.cor}, ${funcao.cor}cc)`,
                boxShadow: `0 8px 24px ${funcao.cor}25`,
                width: 72, height: 72,
              }}
            >
              <CheckCircle2 className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-1">Registro Salvo!</h2>
            {formValues.protocolo && (
              <p className="text-sm text-gray-500 mb-1">
                Protocolo: <span className="font-mono font-bold text-gray-900">{formValues.protocolo}</span>
              </p>
            )}
            <p className="text-gray-400 mb-6">Registro de "{funcao.nome}" criado com sucesso.</p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={resetForm} 
                className="rounded-xl font-semibold text-white shadow-md gap-2"
                style={{ 
                  background: `linear-gradient(135deg, ${funcao.cor}, ${funcao.cor}cc)`,
                  boxShadow: `0 4px 14px ${funcao.cor}25`
                }}
              >
                <Plus className="w-4 h-4" /> Novo Registro
              </Button>
              <Button onClick={() => { resetForm(); setTab("registros"); }} variant="outline" className="rounded-xl gap-2">
                <List className="w-4 h-4" /> Ver Registros
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const Icon = getIconComponent(funcao.icone);

  // ============ RENDER CAMPO ============
  const renderCampo = (campoKey: string) => {
    const info = CAMPOS_INFO[campoKey];
    if (!info) return null;
    const isRequired = camposObrigatorios.includes(campoKey);
    const requiredMark = isRequired ? <span className="text-red-500">*</span> : null;

    if (info.tipo === "auto_numero") {
      return (
        <div key={campoKey} className="space-y-2">
          <Label className="flex items-center gap-1"><Hash className="w-4 h-4" /> {info.label} {requiredMark}</Label>
          <Input value={formValues[campoKey] || ""} readOnly className="bg-gray-50 font-mono text-lg font-bold" />
        </div>
      );
    }

    if (info.tipo === "gps") {
      return (
        <div key={campoKey} className="space-y-2">
          <Label className="flex items-center gap-1"><MapPinned className="w-4 h-4" /> {info.label} {requiredMark}</Label>
          <div className="p-3 bg-gray-50 border rounded-lg text-sm">
            {formValues[campoKey] === "Obtendo localizacao..." ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Obtendo endereco...
              </span>
            ) : (
              <span className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                {formValues[campoKey] || "Localizacao nao disponivel"}
              </span>
            )}
          </div>
        </div>
      );
    }

    if (info.tipo === "status_select") {
      return (
        <div key={campoKey} className="space-y-2">
          <Label className="flex items-center gap-1">{info.label} {requiredMark}</Label>
          <Select value={formValues[campoKey] || ""} onValueChange={(v: string) => setFormValues(prev => ({ ...prev, [campoKey]: v }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aberto">Aberto</SelectItem>
              <SelectItem value="em_andamento">Em Andamento</SelectItem>
              <SelectItem value="aguardando">Aguardando</SelectItem>
              <SelectItem value="concluido">Concluido</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (info.tipo === "textarea") {
      return (
        <div key={campoKey} className="space-y-2">
          <Label className="flex items-center gap-1">{info.label} {requiredMark}</Label>
          <Textarea value={formValues[campoKey] || ""} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormValues(prev => ({ ...prev, [campoKey]: e.target.value }))} placeholder={info.descricao} rows={4} />
        </div>
      );
    }

    if (info.tipo === "texto") {
      return (
        <div key={campoKey} className="space-y-2">
          <Label className="flex items-center gap-1">{info.label} {requiredMark}</Label>
          <Input value={formValues[campoKey] || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues(prev => ({ ...prev, [campoKey]: e.target.value }))} placeholder={info.descricao} />
        </div>
      );
    }

    if (info.tipo === "data") {
      return (
        <div key={campoKey} className="space-y-2">
          <Label className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {info.label} {requiredMark}</Label>
          <Input type="date" value={formValues[campoKey] || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues(prev => ({ ...prev, [campoKey]: e.target.value }))} />
        </div>
      );
    }

    if (info.tipo === "moeda") {
      return (
        <div key={campoKey} className="space-y-2">
          <Label className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {info.label} {requiredMark}</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
            <Input type="number" step="0.01" min="0" value={formValues[campoKey] || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues(prev => ({ ...prev, [campoKey]: e.target.value }))} className="pl-10" placeholder="0,00" />
          </div>
        </div>
      );
    }

    if (campoKey === "prioridade") {
      return (
        <div key={campoKey} className="space-y-2">
          <Label className="flex items-center gap-1">{info.label} {requiredMark}</Label>
          <Select value={formValues[campoKey] || ""} onValueChange={(v: string) => setFormValues(prev => ({ ...prev, [campoKey]: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione a prioridade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (campoKey === "nivelUrgencia") {
      return (
        <div key={campoKey} className="space-y-2">
          <Label className="flex items-center gap-1">{info.label} {requiredMark}</Label>
          <Select value={formValues[campoKey] || ""} onValueChange={(v: string) => setFormValues(prev => ({ ...prev, [campoKey]: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione o nivel" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="baixo">Baixo</SelectItem>
              <SelectItem value="medio">Medio</SelectItem>
              <SelectItem value="alto">Alto</SelectItem>
              <SelectItem value="critico">Critico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (campoKey === "responsavelId") {
      return (
        <div key={campoKey} className="space-y-2">
          <Label className="flex items-center gap-1"><Users className="w-4 h-4" /> {info.label} {requiredMark}</Label>
          <Input value={formValues[campoKey] || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues(prev => ({ ...prev, [campoKey]: e.target.value }))} placeholder="Nome do responsavel" />
        </div>
      );
    }

    if (info.tipo === "imagens") {
      return (
        <div key={campoKey} className="space-y-3">
          <Label className="flex items-center gap-1"><Camera className="w-4 h-4" /> {info.label} {requiredMark}</Label>
          <div className="grid grid-cols-3 gap-2">
            {imagePreviews.map((img, i) => (
              <div key={i} className="relative group">
                <img src={img.url} alt="" className="w-full h-24 object-cover rounded-lg" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <Camera className="w-6 h-6 text-gray-400" />
              <span className="text-[10px] text-gray-400 mt-1">Adicionar</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>
      );
    }

    if (info.tipo === "checklist") {
      return (
        <div key={campoKey} className="space-y-3">
          <Label className="flex items-center gap-1"><ListChecks className="w-4 h-4" /> {info.label} {requiredMark}</Label>
          <div className="space-y-2">
            {checklistItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="checkbox" checked={item.checked} onChange={() => setChecklistItems(prev => prev.map((it, idx) => idx === i ? { ...it, checked: !it.checked } : it))} className="w-4 h-4 rounded" />
                <span className={cn("flex-1 text-sm", item.checked && "line-through text-muted-foreground")}>{item.texto}</span>
                <button type="button" onClick={() => setChecklistItems(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newChecklistItem} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewChecklistItem(e.target.value)} placeholder="Novo item do checklist" onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") { e.preventDefault(); addChecklistItem(); } }} className="text-sm" />
            <Button type="button" variant="outline" size="sm" onClick={addChecklistItem}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>
      );
    }

    if (info.tipo === "qrcode") {
      return (
        <div key={campoKey} className="space-y-3">
          <Label className="flex items-center gap-1"><QrCode className="w-4 h-4" /> {info.label} {requiredMark}</Label>
          <div className="flex gap-2">
            <Input value={formValues[campoKey] || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues(prev => ({ ...prev, [campoKey]: e.target.value }))} placeholder="Codigo lido ou digitado" className="flex-1" />
            <Button type="button" variant="outline" onClick={() => setShowScanner(true)}>
              <ScanLine className="w-4 h-4 mr-1" /> Escanear
            </Button>
          </div>
          {formValues[campoKey] && (
            <div className="flex flex-col items-center gap-2 p-4 bg-white border rounded-lg">
              <QRCodeSVG value={formValues[campoKey]} size={120} />
              <p className="text-xs text-muted-foreground">QR Code gerado</p>
            </div>
          )}
          <Dialog open={showScanner} onOpenChange={setShowScanner}>
            <DialogContent className="max-w-sm">
              <DialogHeader><DialogTitle>Escanear QR Code</DialogTitle></DialogHeader>
              <QrCodeScanner
                onScan={(text: string) => {
                  setFormValues(prev => ({ ...prev, [campoKey]: text }));
                  setShowScanner(false);
                  toast.success("QR Code lido!");
                }}
                onClose={() => setShowScanner(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      );
    }

    if (info.tipo === "assinatura") {
      return (
        <SignaturePad
          key={campoKey}
          label={info.label + (isRequired ? " *" : "")}
          value={formValues[campoKey] || ""}
          onChange={(v: string) => setFormValues(prev => ({ ...prev, [campoKey]: v }))}
        />
      );
    }

    if (info.tipo === "arquivos") {
      return (
        <div key={campoKey} className="space-y-2">
          <Label className="flex items-center gap-1"><Upload className="w-4 h-4" /> {info.label} {requiredMark}</Label>
          <label className="flex items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <Upload className="w-5 h-5 text-gray-400 mx-auto" />
              <span className="text-xs text-gray-400 mt-1">Clique para anexar arquivos</span>
            </div>
            <input type="file" multiple className="hidden" />
          </label>
        </div>
      );
    }

    return (
      <div key={campoKey} className="space-y-2">
        <Label className="flex items-center gap-1">{info.label} {requiredMark}</Label>
        <Input value={formValues[campoKey] || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormValues(prev => ({ ...prev, [campoKey]: e.target.value }))} placeholder={info.descricao} />
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      aberto: { label: "Aberto", className: "bg-blue-100 text-blue-700" },
      em_andamento: { label: "Em Andamento", className: "bg-yellow-100 text-yellow-700" },
      aguardando: { label: "Aguardando", className: "bg-orange-100 text-orange-700" },
      concluido: { label: "Concluido", className: "bg-green-100 text-green-700" },
      cancelado: { label: "Cancelado", className: "bg-red-100 text-red-700" },
      pendente: { label: "Pendente", className: "bg-gray-100 text-gray-700" },
    };
    const s = map[status] || { label: status, className: "bg-gray-100 text-gray-700" };
    return <Badge className={cn("text-xs", s.className)}>{s.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50/30">
      {/* Premium Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div 
            className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg shrink-0"
            style={{ 
              background: `linear-gradient(135deg, ${funcao.cor}, ${funcao.cor}cc)`,
              boxShadow: `0 4px 14px ${funcao.cor}25`
            }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate text-gray-900">{funcao.nome}</h1>
            {funcao.descricao && <p className="text-xs text-gray-400 truncate">{funcao.descricao}</p>}
          </div>
        </div>

        {/* Premium Tabs */}
        <div className="container mx-auto px-4 pb-0">
          <div className="flex gap-1">
            <button
              onClick={() => setTab("form")}
              className={cn(
                "relative px-5 py-2.5 text-sm font-semibold transition-all rounded-t-xl",
                tab === "form" 
                  ? "text-gray-900 bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50/30" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <span className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" /> Novo Registro
              </span>
              {tab === "form" && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ backgroundColor: funcao.cor }} />
              )}
            </button>
            <button
              onClick={() => setTab("registros")}
              className={cn(
                "relative px-5 py-2.5 text-sm font-semibold transition-all rounded-t-xl",
                tab === "registros" 
                  ? "text-gray-900 bg-gradient-to-br from-slate-50 via-gray-50 to-orange-50/30" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              <span className="flex items-center gap-1.5">
                <List className="w-4 h-4" /> Registros
              </span>
              {tab === "registros" && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ backgroundColor: funcao.cor }} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TAB: FORMULARIO */}
      {tab === "form" && (
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-6 space-y-5">
            {camposOrdenados.map(renderCampo)}
          </div>

          {camposOrdenados.length > 0 && (
            <div className="mt-6 pb-8">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold text-white rounded-xl shadow-lg transition-all hover:shadow-xl"
                style={{ 
                  background: `linear-gradient(135deg, ${funcao.cor}, ${funcao.cor}cc)`,
                  boxShadow: `0 8px 24px ${funcao.cor}25`
                }}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Salvando...</>
                ) : (
                  <><Save className="w-5 h-5 mr-2" /> Salvar Registro</>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* TAB: REGISTROS */}
      {tab === "registros" && (
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Premium Busca */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <Input
              value={busca}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusca(e.target.value)}
              placeholder="Buscar por protocolo, título ou local..."
              className="pl-11 h-11 rounded-xl border-gray-200 bg-white shadow-sm"
            />
          </div>

          {/* Lista Premium */}
          {!registros || registros.length === 0 ? (
            <div className="text-center py-16 rounded-2xl bg-white border border-gray-200/60">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-medium mb-4">Nenhum registro encontrado</p>
              <Button onClick={() => setTab("form")} variant="outline" className="rounded-xl gap-2">
                <Plus className="w-4 h-4" /> Criar primeiro registro
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {registros.map((reg: any) => {
                const dados = typeof reg.dados === "string" ? JSON.parse(reg.dados) : reg.dados || {};
                const isExpanded = expandedRegistro === reg.id;
                return (
                  <div key={reg.id} className="rounded-2xl bg-white border border-gray-200/60 shadow-sm overflow-hidden transition-all hover:shadow-md">
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={() => setExpandedRegistro(isExpanded ? null : reg.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            {reg.protocolo && (
                              <span className="font-mono text-xs bg-gray-100 px-2.5 py-1 rounded-lg font-semibold">
                                #{reg.protocolo}
                              </span>
                            )}
                            {getStatusBadge(reg.status || "aberto")}
                          </div>
                          <p className="font-semibold text-gray-900 truncate">{dados.titulo || dados.local || "Sem título"}</p>
                          {dados.local && dados.titulo && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{dados.local}</p>
                          )}
                          <p className="text-xs text-gray-300 mt-1.5">
                            {new Date(reg.createdAt).toLocaleDateString("pt-BR")} às {new Date(reg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          isExpanded ? "bg-gray-100" : "bg-gray-50"
                        )}>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Detalhes expandidos - busca registro completo sob demanda */}
                    {isExpanded && (
                      <RegistroDetalhes 
                        registroId={reg.id} 
                        dadosResumo={dados}
                        atualizarStatusMutation={atualizarStatusMutation}
                        currentStatus={reg.status || "aberto"}
                        protocolo={reg.protocolo || null}
                        createdAt={reg.createdAt}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
