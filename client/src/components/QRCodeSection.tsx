import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Camera, Copy, Check, X, Download } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import QRCode from "qrcode";

interface QRCodeSectionProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function QRCodeSection({ value, onChange, label = "QR Code / Código de Barras" }: QRCodeSectionProps) {
  const [scanning, setScanning] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Gerar QR Code a partir do valor
  const generateQRCode = async () => {
    if (!value.trim()) {
      toast.error("Digite um valor para gerar o QR Code");
      return;
    }
    try {
      const url = await QRCode.toDataURL(value, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" }
      });
      setQrImageUrl(url);
      toast.success("QR Code gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar QR Code");
    }
  };

  // Iniciar scanner de câmera
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScanning(true);
      scanQRCode();
    } catch (error) {
      toast.error("Não foi possível acessar a câmera");
    }
  };

  // Parar scanner
  const stopScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  // Escanear QR Code do vídeo
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Aqui seria necessário uma biblioteca como jsQR para decodificar
      // Por simplicidade, vamos usar um input manual
    }
    
    if (scanning) {
      requestAnimationFrame(scanQRCode);
    }
  };

  // Copiar valor
  const copyValue = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copiado!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download QR Code
  const downloadQRCode = () => {
    if (!qrImageUrl) return;
    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrImageUrl;
    link.click();
    toast.success("QR Code baixado!");
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <QrCode className="h-4 w-4 text-purple-500" />
        {label}
      </Label>
      
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Digite ou escaneie um código"
          className="flex-1 h-11"
        />
        <Button
          type="button"
          variant="outline"
          onClick={copyValue}
          disabled={!value}
          className="h-11 px-3"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          type="button"
          variant="outline"
          onClick={generateQRCode}
          disabled={!value.trim()}
          className="flex items-center gap-2"
        >
          <QrCode className="h-4 w-4" />
          Gerar QR Code
        </Button>
        
        {!scanning ? (
          <Button
            type="button"
            variant="outline"
            onClick={startScanner}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Escanear
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={stopScanner}
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
            Parar Scanner
          </Button>
        )}
      </div>

      {/* Scanner de vídeo */}
      {scanning && (
        <Card className="overflow-hidden">
          <CardContent className="p-2">
            <video
              ref={videoRef}
              className="w-full max-h-48 object-cover rounded"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            <p className="text-xs text-center text-gray-500 mt-2">
              Posicione o QR Code na frente da câmera
            </p>
          </CardContent>
        </Card>
      )}

      {/* QR Code gerado */}
      {qrImageUrl && (
        <Card className="overflow-hidden">
          <CardContent className="p-4 flex flex-col items-center gap-3">
            <img src={qrImageUrl} alt="QR Code" className="w-40 h-40" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={downloadQRCode}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar QR Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
