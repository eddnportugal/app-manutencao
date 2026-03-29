import { useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
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
  Eraser,
  Palette,
  MousePointer2
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import * as fabric from "fabric";

interface FabricImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  onSave: (editedImageBase64: string) => void;
}

type Tool = "select" | "text" | "arrow" | "line" | "rect" | "circle" | "draw" | "eraser";

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

export default function FabricImageEditor({ isOpen, onClose, imageUrl, onSave }: FabricImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>("select");
  const [activeColor, setActiveColor] = useState("#FF0000");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isDrawing, setIsDrawing] = useState(false);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentShapeRef = useRef<fabric.Object | null>(null);

  const [isLoadingImage, setIsLoadingImage] = useState(false);

  // Inicializar canvas quando o modal abre
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !imageUrl) return;

    console.log("[ImageEditor] Iniciando com imageUrl:", imageUrl);
    setIsLoadingImage(true);

    // Pequeno delay para garantir que o DOM está pronto
    const timer = setTimeout(() => {
      // Limpar canvas anterior se existir
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }

      // Criar novo canvas
      if (!canvasRef.current) return;
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff",
      });

      fabricCanvasRef.current = canvas;
      console.log("[ImageEditor] Canvas criado");

      // Carregar imagem diretamente via fetch para evitar CORS
      const loadImageViaFetch = async () => {
        try {
          console.log("[ImageEditor] Carregando imagem via fetch:", imageUrl);
          
          // Usar proxy ou carregar diretamente
          const response = await fetch(imageUrl, {
            mode: 'cors',
            credentials: 'omit'
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const blob = await response.blob();
          console.log("[ImageEditor] Blob recebido, tamanho:", blob.size);
          
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          
          console.log("[ImageEditor] Base64 gerado, comprimento:", base64.length);
          
          // Criar imagem HTML a partir do base64
          const htmlImg = document.createElement('img');
          
          await new Promise<void>((resolve, reject) => {
            htmlImg.onload = () => {
              console.log("[ImageEditor] Imagem HTML carregada:", htmlImg.naturalWidth, "x", htmlImg.naturalHeight);
              resolve();
            };
            htmlImg.onerror = (e) => {
              console.error("[ImageEditor] Erro ao carregar imagem HTML", e);
              reject(e);
            };
            htmlImg.src = base64;
          });
          
          if (!fabricCanvasRef.current) {
            console.error("[ImageEditor] Canvas não disponível após carregar imagem");
            return;
          }
          
          // Criar FabricImage
          const fabricImg = new fabric.FabricImage(htmlImg);
          
          const canvasWidth = 800;
          const canvasHeight = 600;
          const imgWidth = htmlImg.naturalWidth || 800;
          const imgHeight = htmlImg.naturalHeight || 600;
          
          console.log("[ImageEditor] Dimensões:", imgWidth, "x", imgHeight);
          
          const scaleX = canvasWidth / imgWidth;
          const scaleY = canvasHeight / imgHeight;
          const scale = Math.min(scaleX, scaleY, 1);
          
          console.log("[ImageEditor] Escala:", scale);
          
          fabricImg.scale(scale);
          fabricImg.set({
            left: (canvasWidth - imgWidth * scale) / 2,
            top: (canvasHeight - imgHeight * scale) / 2,
            selectable: false,
            evented: false,
            originX: 'left',
            originY: 'top',
          });
          
          // Adicionar como objeto em vez de backgroundImage para melhor compatibilidade
          fabricCanvasRef.current.add(fabricImg);
          // Mover para trás usando sendObjectToBack do canvas
          fabricCanvasRef.current.sendObjectToBack(fabricImg);
          fabricCanvasRef.current.renderAll();
          
          console.log("[ImageEditor] Imagem adicionada ao canvas");
          setIsLoadingImage(false);
          saveToHistory();
          
        } catch (err) {
          console.error("[ImageEditor] Erro ao carregar imagem:", err);
          toast.error("Erro ao carregar imagem para edição");
          setIsLoadingImage(false);
        }
      };
      
      loadImageViaFetch();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, [isOpen, imageUrl]);

  // Salvar estado no histórico
  const saveToHistory = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    
    const json = JSON.stringify(fabricCanvasRef.current.toJSON());
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      return newHistory.slice(-50); // Manter últimos 50 estados
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
    });
  }, [history, historyIndex]);

  // Refazer
  const handleRedo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !fabricCanvasRef.current) return;
    
    const newIndex = historyIndex + 1;
    fabricCanvasRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricCanvasRef.current?.renderAll();
      setHistoryIndex(newIndex);
    });
  }, [history, historyIndex]);

  // Configurar ferramenta ativa
  useEffect(() => {
    if (!fabricCanvasRef.current) return;
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
    } else if (activeTool === "eraser") {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = "#f0f0f0";
      canvas.freeDrawingBrush.width = strokeWidth * 3;
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

        const shape = currentShapeRef.current;
        const startX = startPointRef.current.x;
        const startY = startPointRef.current.y;
        const currentX = pointer.x;
        const currentY = pointer.y;

        if (activeTool === "line" || activeTool === "arrow") {
          (shape as fabric.Line).set({ x2: currentX, y2: currentY });
        } else if (activeTool === "rect") {
          const width = Math.abs(currentX - startX);
          const height = Math.abs(currentY - startY);
          (shape as fabric.Rect).set({
            left: Math.min(startX, currentX),
            top: Math.min(startY, currentY),
            width,
            height,
          });
        } else if (activeTool === "circle") {
          const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)) / 2;
          (shape as fabric.Circle).set({
            left: (startX + currentX) / 2 - radius,
            top: (startY + currentY) / 2 - radius,
            radius,
          });
        }

        canvas.renderAll();
      });

      canvas.on("mouse:up", (e) => {
        if (!isDrawing || !currentShapeRef.current) return;
        setIsDrawing(false);
        const pointer = canvas.getScenePoint(e.e);

        // Adicionar ponta de seta se for ferramenta arrow
        if (activeTool === "arrow" && startPointRef.current && pointer) {
          const line = currentShapeRef.current as fabric.Line;
          const angle = Math.atan2(
            (pointer.y || 0) - startPointRef.current.y,
            (pointer.x || 0) - startPointRef.current.x
          );
          
          const arrowSize = 15;
          const arrowHead = new fabric.Triangle({
            left: pointer.x,
            top: pointer.y,
            width: arrowSize,
            height: arrowSize,
            fill: activeColor,
            angle: (angle * 180) / Math.PI + 90,
            originX: "center",
            originY: "center",
          });
          
          // Agrupar linha e ponta
          const group = new fabric.Group([line, arrowHead], {
            selectable: true,
          });
          
          canvas.remove(line);
          canvas.add(group);
        }

        currentShapeRef.current = null;
        startPointRef.current = null;
        saveToHistory();
      });
    }
  }, [activeTool, activeColor, strokeWidth, isDrawing, saveToHistory]);

  // Salvar imagem
  const handleSave = useCallback(() => {
    if (!fabricCanvasRef.current) return;

    try {
      const dataUrl = fabricCanvasRef.current.toDataURL({
        format: "png",
        quality: 1,
        multiplier: 1,
      });
      
      onSave(dataUrl);
      toast.success("Imagem editada salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar imagem:", error);
      toast.error("Erro ao salvar imagem editada");
    }
  }, [onSave]);

  // Deletar objeto selecionado
  const handleDelete = useCallback(() => {
    if (!fabricCanvasRef.current) return;
    const activeObject = fabricCanvasRef.current.getActiveObject();
    if (activeObject) {
      fabricCanvasRef.current.remove(activeObject);
      saveToHistory();
    }
  }, [saveToHistory]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "Delete" || e.key === "Backspace") {
        handleDelete();
      } else if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
      } else if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleDelete, handleUndo, handleRedo]);

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: "select", icon: <MousePointer2 className="w-4 h-4" />, label: "Selecionar" },
    { id: "text", icon: <Type className="w-4 h-4" />, label: "Texto" },
    { id: "arrow", icon: <ArrowRight className="w-4 h-4" />, label: "Seta" },
    { id: "line", icon: <Minus className="w-4 h-4" />, label: "Linha" },
    { id: "rect", icon: <Square className="w-4 h-4" />, label: "Retângulo" },
    { id: "circle", icon: <Circle className="w-4 h-4" />, label: "Círculo" },
    { id: "draw", icon: <Pencil className="w-4 h-4" />, label: "Desenho livre" },
    { id: "eraser", icon: <Eraser className="w-4 h-4" />, label: "Borracha" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-[95vw] w-[950px] max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="px-4 py-3 border-b bg-gradient-to-r from-red-500 to-red-600">
          <DialogTitle className="text-white flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Editor de Imagem
          </DialogTitle>
          <DialogDescription className="text-red-100 text-sm">
            Adicione textos, setas, formas e anotações à sua imagem
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row h-[calc(95vh-140px)]">
          {/* Barra de ferramentas lateral */}
          <div className="w-full md:w-16 bg-gray-100 border-b md:border-b-0 md:border-r p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
            {tools.map((tool) => (
              <Button
                key={tool.id}
                variant={activeTool === tool.id ? "default" : "ghost"}
                size="sm"
                className={`p-2 ${activeTool === tool.id ? "bg-red-500 hover:bg-red-600 text-white" : ""}`}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
              >
                {tool.icon}
              </Button>
            ))}
            
            <div className="hidden md:block border-t my-2" />
            
            {/* Cores */}
            <div className="flex md:flex-col gap-1 ml-2 md:ml-0">
              {COLORS.slice(0, 5).map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    activeColor === color ? "border-gray-800 scale-110" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setActiveColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Área do canvas */}
          <div className="flex-1 overflow-auto bg-gray-200 flex items-center justify-center p-4 relative">
            {isLoadingImage && (
              <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Carregando imagem...</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="shadow-lg bg-white" />
          </div>

          {/* Painel de configurações */}
          <div className="w-full md:w-48 bg-gray-50 border-t md:border-t-0 md:border-l p-3 space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-600">Cor</Label>
              <div className="grid grid-cols-5 gap-1 mt-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      activeColor === color ? "border-gray-800 ring-2 ring-red-300" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setActiveColor(color)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-gray-600">Espessura: {strokeWidth}px</Label>
              <Slider
                value={[strokeWidth]}
                onValueChange={(value) => setStrokeWidth(value[0])}
                min={1}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="border-t pt-3">
              <Label className="text-xs font-medium text-gray-600">Ações</Label>
              <div className="flex gap-1 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  title="Desfazer (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  title="Refazer (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  title="Excluir selecionado (Delete)"
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-gray-500 mb-2">
                <strong>Dica:</strong> Use Delete para remover objetos selecionados
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="px-4 py-3 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
