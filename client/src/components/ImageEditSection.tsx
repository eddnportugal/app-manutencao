import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Edit3, 
  Upload, 
  Type, 
  ArrowRight, 
  Minus, 
  Square, 
  Circle, 
  Undo2, 
  Redo2, 
  Save, 
  X,
  Pencil,
  MousePointer2,
  Palette,
  ImagePlus,
  Stamp,
  Eye,
  Loader2
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import * as fabric from "fabric";
import { trpc } from "@/lib/trpc";
import { prepareImageForUpload } from "@/lib/imageCompressor";

interface ImageEditSectionProps {
  onSaveEditedImage: (imageUrl: string) => void;
  label?: string;
  logoUrl?: string; // URL do logo da organização
  folder?: string; // Pasta para upload no servidor
}

type Tool = "select" | "text" | "arrow" | "line" | "rect" | "circle" | "draw";
type WatermarkPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";

const COLORS = [
  "#FF0000", // Vermelho
  "#FF6B00", // Laranja
  "#FFD700", // Amarelo
  "#00FF00", // Verde
  "#00BFFF", // Azul claro
  "#0000FF", // Azul
  "#8B00FF", // Roxo
  "#FF1493", // Rosa
  "#FFFFFF", // Branco
  "#000000", // Preto
];

const POSITION_LABELS: Record<WatermarkPosition, string> = {
  "bottom-right": "Inferior Direito",
  "bottom-left": "Inferior Esquerdo",
  "top-right": "Superior Direito",
  "top-left": "Superior Esquerdo",
  "center": "Centro",
};

export default function ImageEditSection({ 
  onSaveEditedImage, 
  label = "Editar Imagem",
  logoUrl,
  folder = "uploads"
}: ImageEditSectionProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [activeColor, setActiveColor] = useState("#FF0000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Estados para marca d'água
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>("bottom-right");
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [watermarkSize, setWatermarkSize] = useState(100);
  const watermarkRef = useRef<fabric.FabricImage | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentShapeRef = useRef<fabric.Object | null>(null);

  // Mutation para upload de imagens ao servidor
  const uploadMutation = trpc.upload.image.useMutation();
  const [isSaving, setIsSaving] = useState(false);

  // Limpar canvas ao desmontar
  useEffect(() => {
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Inicializar canvas quando imagem é carregada
  useEffect(() => {
    if (!imageBase64 || !canvasRef.current) return;

    // Limpar canvas anterior se existir
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
      fabricCanvasRef.current = null;
    }

    // Criar imagem HTML primeiro para obter dimensões
    const htmlImg = document.createElement('img');
    
    htmlImg.onload = () => {
      if (!canvasRef.current) return;
      
      const imgWidth = htmlImg.naturalWidth || 800;
      const imgHeight = htmlImg.naturalHeight || 500;
      
      // Canvas usa o tamanho real da imagem (sem escala)
      // O container terá scroll se a imagem for maior que a área visível
      const canvasWidth = imgWidth;
      const canvasHeight = imgHeight;
      
      // Criar canvas com tamanho da imagem
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: "#ffffff",
      });

      fabricCanvasRef.current = canvas;
      
      // Criar FabricImage - sem escala, tamanho original
      const fabricImg = new fabric.FabricImage(htmlImg);
      
      fabricImg.set({
        left: 0,
        top: 0,
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top',
      });
      
      canvas.add(fabricImg);
      canvas.sendObjectToBack(fabricImg);
      canvas.renderAll();
      
      setImageLoaded(true);
      saveToHistory();
    };
    
    htmlImg.onerror = () => {
      toast.error("Erro ao carregar imagem");
    };
    
    htmlImg.src = imageBase64;
  }, [imageBase64]);

  // Função para calcular posição da marca d'água
  const getWatermarkPosition = useCallback((imgWidth: number, imgHeight: number, position: WatermarkPosition) => {
    const padding = 20;
    const canvasWidth = fabricCanvasRef.current?.width || 800;
    const canvasHeight = fabricCanvasRef.current?.height || 600;
    
    switch (position) {
      case "bottom-right":
        return { left: canvasWidth - imgWidth - padding, top: canvasHeight - imgHeight - padding };
      case "bottom-left":
        return { left: padding, top: canvasHeight - imgHeight - padding };
      case "top-right":
        return { left: canvasWidth - imgWidth - padding, top: padding };
      case "top-left":
        return { left: padding, top: padding };
      case "center":
        return { left: (canvasWidth - imgWidth) / 2, top: (canvasHeight - imgHeight) / 2 };
      default:
        return { left: canvasWidth - imgWidth - padding, top: canvasHeight - imgHeight - padding };
    }
  }, []);

  // Adicionar/atualizar marca d'água
  const updateWatermark = useCallback(async () => {
    if (!fabricCanvasRef.current || !imageLoaded) return;
    
    // Remover marca d'água existente
    if (watermarkRef.current) {
      fabricCanvasRef.current.remove(watermarkRef.current);
      watermarkRef.current = null;
    }
    
    if (!watermarkEnabled || !logoUrl) return;
    
    try {
      // Carregar logo
      const logoImg = document.createElement('img');
      logoImg.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => reject(new Error("Erro ao carregar logo"));
        logoImg.src = logoUrl;
      });
      
      const fabricLogo = new fabric.FabricImage(logoImg);
      
      // Calcular tamanho baseado no slider (50-200px de largura)
      const targetWidth = watermarkSize;
      const scale = targetWidth / (logoImg.naturalWidth || 100);
      const scaledHeight = (logoImg.naturalHeight || 100) * scale;
      
      fabricLogo.scale(scale);
      
      // Calcular posição
      const pos = getWatermarkPosition(targetWidth, scaledHeight, watermarkPosition);
      
      fabricLogo.set({
        left: pos.left,
        top: pos.top,
        opacity: watermarkOpacity / 100,
        selectable: false,
        evented: false,
        originX: 'left',
        originY: 'top',
      });
      
      fabricCanvasRef.current.add(fabricLogo);
      fabricCanvasRef.current.bringObjectToFront(fabricLogo);
      fabricCanvasRef.current.renderAll();
      
      watermarkRef.current = fabricLogo;
    } catch (err) {
      console.error("Erro ao adicionar marca d'água:", err);
    }
  }, [watermarkEnabled, logoUrl, watermarkPosition, watermarkOpacity, watermarkSize, imageLoaded, getWatermarkPosition]);

  // Atualizar marca d'água quando configurações mudam
  useEffect(() => {
    updateWatermark();
  }, [updateWatermark]);

  // Salvar estado no histórico
  const saveToHistory = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      return newHistory.slice(-50);
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Desfazer
  const handleUndo = useCallback(() => {
    if (historyIndex <= 0 || !fabricCanvasRef.current) return;
    
    const newIndex = historyIndex - 1;
    fabricCanvasRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricCanvasRef.current?.renderAll();
      setHistoryIndex(newIndex);
      // Reaplicar marca d'água após desfazer
      setTimeout(() => updateWatermark(), 100);
    });
  }, [history, historyIndex, updateWatermark]);

  // Refazer
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !fabricCanvasRef.current) return;
    
    const newIndex = historyIndex + 1;
    fabricCanvasRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricCanvasRef.current?.renderAll();
      setHistoryIndex(newIndex);
      // Reaplicar marca d'água após refazer
      setTimeout(() => updateWatermark(), 100);
    });
  }, [history, historyIndex, updateWatermark]);

  // Configurar ferramenta ativa
  useEffect(() => {
    if (!fabricCanvasRef.current || !imageLoaded) return;
    const canvas = fabricCanvasRef.current;

    // Resetar configurações
    canvas.isDrawingMode = false;
    canvas.selection = activeTool === "select";
    canvas.defaultCursor = "default";

    // Remover event listeners anteriores
    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");

    if (activeTool === "draw") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = activeColor;
      canvas.freeDrawingBrush.width = strokeWidth;
    } else if (activeTool === "text") {
      canvas.defaultCursor = "text";
      canvas.on("mouse:down", (e) => {
        const pointer = canvas.getScenePoint(e.e);
        if (!pointer) return;
        const text = new fabric.IText("Texto", {
          left: pointer.x,
          top: pointer.y,
          fontSize: 24,
          fill: activeColor,
          fontFamily: "Arial",
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
        saveToHistory();
      });
    } else if (["arrow", "line", "rect", "circle"].includes(activeTool)) {
      canvas.defaultCursor = "crosshair";
      
      canvas.on("mouse:down", (e) => {
        const pointer = canvas.getScenePoint(e.e);
        if (!pointer) return;
        setIsDrawing(true);
        startPointRef.current = { x: pointer.x, y: pointer.y };

        let shape: fabric.Object | null = null;

        if (activeTool === "line" || activeTool === "arrow") {
          shape = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            stroke: activeColor,
            strokeWidth: strokeWidth,
            selectable: true,
          });
        } else if (activeTool === "rect") {
          shape = new fabric.Rect({
            left: pointer.x,
            top: pointer.y,
            width: 0,
            height: 0,
            fill: "transparent",
            stroke: activeColor,
            strokeWidth: strokeWidth,
          });
        } else if (activeTool === "circle") {
          shape = new fabric.Circle({
            left: pointer.x,
            top: pointer.y,
            radius: 0,
            fill: "transparent",
            stroke: activeColor,
            strokeWidth: strokeWidth,
          });
        }

        if (shape) {
          canvas.add(shape);
          currentShapeRef.current = shape;
        }
      });

      canvas.on("mouse:move", (e) => {
        if (!isDrawing || !startPointRef.current || !currentShapeRef.current) return;
        const pointer = canvas.getScenePoint(e.e);
        if (!pointer) return;

        const startX = startPointRef.current.x;
        const startY = startPointRef.current.y;

        if (activeTool === "line" || activeTool === "arrow") {
          (currentShapeRef.current as fabric.Line).set({
            x2: pointer.x,
            y2: pointer.y,
          });
        } else if (activeTool === "rect") {
          const width = Math.abs(pointer.x - startX);
          const height = Math.abs(pointer.y - startY);
          (currentShapeRef.current as fabric.Rect).set({
            left: Math.min(startX, pointer.x),
            top: Math.min(startY, pointer.y),
            width: width,
            height: height,
          });
        } else if (activeTool === "circle") {
          const radius = Math.sqrt(
            Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)
          ) / 2;
          const centerX = (startX + pointer.x) / 2;
          const centerY = (startY + pointer.y) / 2;
          (currentShapeRef.current as fabric.Circle).set({
            left: centerX - radius,
            top: centerY - radius,
            radius: radius,
          });
        }

        canvas.renderAll();
      });

      canvas.on("mouse:up", () => {
        if (activeTool === "arrow" && currentShapeRef.current) {
          // Adicionar ponta da seta
          const line = currentShapeRef.current as fabric.Line;
          const x1 = line.x1 || 0;
          const y1 = line.y1 || 0;
          const x2 = line.x2 || 0;
          const y2 = line.y2 || 0;
          
          const angle = Math.atan2(y2 - y1, x2 - x1);
          const headLength = 15;
          
          const arrowHead = new fabric.Triangle({
            left: x2,
            top: y2,
            width: headLength,
            height: headLength,
            fill: activeColor,
            angle: (angle * 180 / Math.PI) + 90,
            originX: 'center',
            originY: 'center',
          });
          
          canvas.add(arrowHead);
        }
        
        setIsDrawing(false);
        startPointRef.current = null;
        currentShapeRef.current = null;
        saveToHistory();
      });
    }
  }, [activeTool, activeColor, strokeWidth, imageLoaded, isDrawing, saveToHistory]);

  // Handler para upload de arquivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB");
      return;
    }

    // Comprimir e converter para base64
    try {
      const base64 = await prepareImageForUpload(file, "quarterA4");
      setImageBase64(base64);
      setImageLoaded(false);
      setHistory([]);
      setHistoryIndex(-1);
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImageBase64(base64);
        setImageLoaded(false);
        setHistory([]);
        setHistoryIndex(-1);
      };
      reader.readAsDataURL(file);
    }
  };

  // Salvar imagem editada
  const handleSave = async () => {
    if (!fabricCanvasRef.current) return;

    const dataUrl = fabricCanvasRef.current.toDataURL({
      format: "jpeg",
      quality: 0.75,
      multiplier: 1,
    });

    // Upload ao servidor para obter URL real
    setIsSaving(true);
    try {
      const result = await uploadMutation.mutateAsync({
        fileName: "edited-image.jpg",
        fileType: "image/jpeg",
        fileData: dataUrl,
        folder,
      });

      onSaveEditedImage(result.url);
      toast.success("Imagem editada salva com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar imagem editada:", error);
      toast.error("Erro ao salvar imagem editada");
      setIsSaving(false);
      return;
    }
    setIsSaving(false);
    
    // Resetar estado
    setImageBase64(null);
    setImageLoaded(false);
    setHistory([]);
    setHistoryIndex(-1);
    setWatermarkEnabled(false);
    watermarkRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    setImageBase64(null);
    setImageLoaded(false);
    setHistory([]);
    setHistoryIndex(-1);
    setWatermarkEnabled(false);
    watermarkRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Cabeçalho com informações - Compacto */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <div className="p-1.5 bg-red-100 rounded-lg shrink-0">
            <Edit3 className="h-4 w-4 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-red-800 text-sm flex items-center gap-1">
              <span>✏️ {label}</span>
            </h3>
            <p className="text-xs text-red-700 mt-0.5">
              Carregue uma imagem para adicionar anotações visuais.
            </p>
            {/* Pills ocultadas no mobile para economizar espaço */}
            <div className="mt-2 hidden sm:flex flex-wrap gap-1">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/80 rounded-full text-[10px] font-medium text-gray-600 border border-red-200">
                <Type className="h-2.5 w-2.5" /> Textos
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/80 rounded-full text-[10px] font-medium text-gray-600 border border-red-200">
                <ArrowRight className="h-2.5 w-2.5" /> Setas
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/80 rounded-full text-[10px] font-medium text-gray-600 border border-red-200">
                <Circle className="h-2.5 w-2.5" /> Círculos
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/80 rounded-full text-[10px] font-medium text-gray-600 border border-red-200">
                <Square className="h-2.5 w-2.5" /> Retângulos
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/80 rounded-full text-[10px] font-medium text-gray-600 border border-red-200">
                <Minus className="h-2.5 w-2.5" /> Linhas
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/80 rounded-full text-[10px] font-medium text-gray-600 border border-red-200">
                <Pencil className="h-2.5 w-2.5" /> Desenho
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/80 rounded-full text-[10px] font-medium text-gray-600 border border-red-200">
                <Palette className="h-2.5 w-2.5" /> Cores
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/80 rounded-full text-[10px] font-medium text-gray-600 border border-red-200">
                <Stamp className="h-2.5 w-2.5" /> Marca d'Água
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Área de upload ou editor */}
      {!imageBase64 ? (
        <div 
          className="border-2 border-dashed border-red-300 rounded-xl p-4 sm:p-6 text-center hover:border-red-400 hover:bg-red-50/50 transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-red-100 rounded-full">
              <ImagePlus className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-700 text-sm">Clique para carregar uma imagem</p>
              <p className="text-xs text-gray-500 mt-0.5">PNG, JPG, GIF ou WebP (máx. 10MB)</p>
            </div>
            <Button variant="outline" size="sm" className="mt-1 border-red-300 text-red-600 hover:bg-red-50">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Selecionar Imagem
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Barra de ferramentas - Compacta */}
          <div className="bg-gray-100 rounded-lg p-1.5 space-y-1.5">
            {/* Ferramentas */}
            <div className="flex flex-wrap items-center gap-1">
              <Label className="text-[10px] font-medium text-gray-500 mr-1 hidden sm:block">Ferramentas:</Label>
              
              <Button
                variant={activeTool === "select" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("select")}
                title="Selecionar"
                className="h-7 w-7 p-0"
              >
                <MousePointer2 className="h-3.5 w-3.5" />
              </Button>
              
              <Button
                variant={activeTool === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("text")}
                title="Texto"
                className="h-7 w-7 p-0"
              >
                <Type className="h-3.5 w-3.5" />
              </Button>
              
              <Button
                variant={activeTool === "arrow" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("arrow")}
                title="Seta"
                className="h-7 w-7 p-0"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
              
              <Button
                variant={activeTool === "line" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("line")}
                title="Linha"
                className="h-7 w-7 p-0"
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              
              <Button
                variant={activeTool === "rect" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("rect")}
                title="Retângulo"
                className="h-7 w-7 p-0"
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
              
              <Button
                variant={activeTool === "circle" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("circle")}
                title="Círculo"
                className="h-7 w-7 p-0"
              >
                <Circle className="h-3.5 w-3.5" />
              </Button>
              
              <Button
                variant={activeTool === "draw" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTool("draw")}
                title="Desenho Livre"
                className="h-7 w-7 p-0"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>

              <div className="h-5 w-px bg-gray-300 mx-1" />

              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                title="Desfazer"
                className="h-7 w-7 p-0"
              >
                <Undo2 className="h-3.5 w-3.5" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                title="Refazer"
                className="h-7 w-7 p-0"
              >
                <Redo2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Cores e espessura */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1">
                <Label className="text-[10px] font-medium text-gray-500 hidden sm:block">Cor:</Label>
                <div className="flex gap-0.5">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${
                        activeColor === color ? "border-gray-800 scale-110" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setActiveColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Label className="text-[10px] font-medium text-gray-500 hidden sm:block">Espessura:</Label>
                <Slider
                  value={[strokeWidth]}
                  onValueChange={(v) => setStrokeWidth(v[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-16 sm:w-20"
                />
                <span className="text-[10px] text-gray-500 w-3">{strokeWidth}</span>
              </div>
            </div>
          </div>

          {/* Opções de Marca d'Água */}
          {logoUrl && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Stamp className="h-5 w-5 text-blue-600" />
                  <Label className="font-medium text-blue-800">Marca d'Água (Logo do Condomínio)</Label>
                </div>
                <Switch
                  checked={watermarkEnabled}
                  onCheckedChange={setWatermarkEnabled}
                />
              </div>
              
              {watermarkEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-blue-200">
                  {/* Posição */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-blue-700">Posição</Label>
                    <Select value={watermarkPosition} onValueChange={(v) => setWatermarkPosition(v as WatermarkPosition)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(POSITION_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Opacidade */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-blue-700 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Opacidade: {watermarkOpacity}%
                    </Label>
                    <Slider
                      value={[watermarkOpacity]}
                      onValueChange={(v) => setWatermarkOpacity(v[0])}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Tamanho */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-blue-700">Tamanho: {watermarkSize}px</Label>
                    <Slider
                      value={[watermarkSize]}
                      onValueChange={(v) => setWatermarkSize(v[0])}
                      min={50}
                      max={200}
                      step={10}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Aviso se não tem logo */}
          {!logoUrl && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-2">
              <Stamp className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Para usar marca d'água, configure o logo da organização nas configurações.
              </p>
            </div>
          )}

          {/* Canvas - Container quadrado com scroll */}
          <div 
            className="border-2 border-gray-300 rounded-lg bg-gray-50 shadow-inner"
            style={{ 
              width: '100%',
              maxWidth: '500px',
              height: '400px',
              overflow: 'auto',
              margin: '0 auto'
            }}
          >
            <canvas ref={canvasRef} style={{ display: 'block' }} />
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? "A enviar..." : "Salvar Imagem Editada"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
