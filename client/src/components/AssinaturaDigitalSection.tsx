import React, { useRef, useState } from "react";
import { PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AssinaturaDigitalSectionProps {
  assinaturaTecnico: string;
  setAssinaturaTecnico: (v: string) => void;
  assinaturaSolicitante: string;
  setAssinaturaSolicitante: (v: string) => void;
  labelTecnico?: string;
  labelSolicitante?: string;
}

export function AssinaturaDigitalSection({
  assinaturaTecnico,
  setAssinaturaTecnico,
  assinaturaSolicitante,
  setAssinaturaSolicitante,
  labelTecnico = "Assinatura do Funcionário",
  labelSolicitante = "Assinatura do Solicitante",
}: AssinaturaDigitalSectionProps) {
  const canvasTecnicoRef = useRef<HTMLCanvasElement>(null);
  const canvasSolicitanteRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingTecnico, setIsDrawingTecnico] = useState(false);
  const [isDrawingSolicitante, setIsDrawingSolicitante] = useState(false);

  const initCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const getCanvasPos = (canvas: HTMLCanvasElement, e: React.TouchEvent | React.MouseEvent) => {
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
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (canvas: HTMLCanvasElement | null, e: React.TouchEvent | React.MouseEvent) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getCanvasPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (canvas: HTMLCanvasElement | null, drawing: boolean, e: React.TouchEvent | React.MouseEvent) => {
    if (!canvas || !drawing) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getCanvasPos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = (canvas: HTMLCanvasElement | null, setter: (v: string) => void) => {
    if (!canvas) return;
    setter(canvas.toDataURL("image/png"));
  };

  const clearCanvas = (canvas: HTMLCanvasElement | null, setter: (v: string) => void) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setter("");
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 space-y-4">
      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
        <PenTool className="h-4 w-4 text-indigo-500" />
        Assinatura Digital
      </h4>
      
      {/* Assinatura Funcionário/Técnico */}
      <div className="space-y-2">
        <Label className="text-gray-700 font-medium text-sm">{labelTecnico}</Label>
        <div className="relative bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
          <canvas
            ref={canvasTecnicoRef}
            width={320}
            height={120}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={(e) => { setIsDrawingTecnico(true); initCanvas(canvasTecnicoRef.current); startDraw(canvasTecnicoRef.current, e); }}
            onMouseMove={(e) => draw(canvasTecnicoRef.current, isDrawingTecnico, e)}
            onMouseUp={() => { setIsDrawingTecnico(false); endDraw(canvasTecnicoRef.current, setAssinaturaTecnico); }}
            onMouseLeave={() => { setIsDrawingTecnico(false); endDraw(canvasTecnicoRef.current, setAssinaturaTecnico); }}
            onTouchStart={(e) => { e.preventDefault(); setIsDrawingTecnico(true); initCanvas(canvasTecnicoRef.current); startDraw(canvasTecnicoRef.current, e); }}
            onTouchMove={(e) => { e.preventDefault(); draw(canvasTecnicoRef.current, isDrawingTecnico, e); }}
            onTouchEnd={() => { setIsDrawingTecnico(false); endDraw(canvasTecnicoRef.current, setAssinaturaTecnico); }}
          />
          {!assinaturaTecnico && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-gray-300 text-sm">Assine aqui (Funcionário)</span>
            </div>
          )}
        </div>
        <Button type="button" variant="ghost" size="sm" className="text-xs text-gray-500" onClick={() => clearCanvas(canvasTecnicoRef.current, setAssinaturaTecnico)}>
          Limpar assinatura
        </Button>
      </div>

      {/* Assinatura Solicitante */}
      <div className="space-y-2">
        <Label className="text-gray-700 font-medium text-sm">{labelSolicitante}</Label>
        <div className="relative bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
          <canvas
            ref={canvasSolicitanteRef}
            width={320}
            height={120}
            className="w-full touch-none cursor-crosshair"
            onMouseDown={(e) => { setIsDrawingSolicitante(true); initCanvas(canvasSolicitanteRef.current); startDraw(canvasSolicitanteRef.current, e); }}
            onMouseMove={(e) => draw(canvasSolicitanteRef.current, isDrawingSolicitante, e)}
            onMouseUp={() => { setIsDrawingSolicitante(false); endDraw(canvasSolicitanteRef.current, setAssinaturaSolicitante); }}
            onMouseLeave={() => { setIsDrawingSolicitante(false); endDraw(canvasSolicitanteRef.current, setAssinaturaSolicitante); }}
            onTouchStart={(e) => { e.preventDefault(); setIsDrawingSolicitante(true); initCanvas(canvasSolicitanteRef.current); startDraw(canvasSolicitanteRef.current, e); }}
            onTouchMove={(e) => { e.preventDefault(); draw(canvasSolicitanteRef.current, isDrawingSolicitante, e); }}
            onTouchEnd={() => { setIsDrawingSolicitante(false); endDraw(canvasSolicitanteRef.current, setAssinaturaSolicitante); }}
          />
          {!assinaturaSolicitante && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-gray-300 text-sm">Assine aqui (Solicitante)</span>
            </div>
          )}
        </div>
        <Button type="button" variant="ghost" size="sm" className="text-xs text-gray-500" onClick={() => clearCanvas(canvasSolicitanteRef.current, setAssinaturaSolicitante)}>
          Limpar assinatura
        </Button>
      </div>
    </div>
  );
}
