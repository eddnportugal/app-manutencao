import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { QrCode, Download, Copy, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  tipo: 'os' | 'vistoria' | 'manutencao' | 'ocorrencia' | 'checklist' | 'registro';
  id: number;
  titulo: string;
  protocolo?: string;
}

export function QRCodeGenerator({ tipo, id, titulo, protocolo }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Gerar URL pública para acesso via QR Code
  const publicUrl = `${window.location.origin}/publico/${tipo}/${id}`;

  useEffect(() => {
    if (isOpen) {
      generateQRCode();
    }
  }, [isOpen, publicUrl]);

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(publicUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast.error('Erro ao gerar QR Code');
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${tipo}-${protocolo || id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code baixado com sucesso!');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Link copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };

  const handleShare = async () => {
    const text = `${getTipoLabel(tipo)} - ${titulo}\nAcesse: ${publicUrl}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
    } catch { /* clipboard not available */ }
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Link copiado! WhatsApp aberto para envio.');
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      os: 'Ordem de Serviço',
      vistoria: 'Vistoria',
      manutencao: 'Manutenção',
      ocorrencia: 'Ocorrência',
      checklist: 'Checklist',
      registro: 'Registro',
    };
    return labels[tipo] || tipo;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <QrCode className="h-4 w-4" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-orange-500" />
            QR Code - {getTipoLabel(tipo)}
          </DialogTitle>
        </DialogHeader>
        
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {titulo}
              {protocolo && (
                <span className="ml-2 text-orange-500">#{protocolo}</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {qrCodeUrl ? (
              <div className="bg-white p-4 rounded-lg shadow-inner">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-64 h-64"
                />
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Gerando QR Code...</span>
              </div>
            )}
            
            <p className="text-xs text-gray-500 text-center break-all px-4">
              {publicUrl}
            </p>
            
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Copiado!' : 'Copiar Link'}
              </Button>
              
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                Baixar
              </Button>

              <Button 
                variant="default" 
                className="gap-2 bg-orange-500 hover:bg-orange-600 col-span-2"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-xs text-gray-500 text-center">
          Escaneie o QR Code para acessar rapidamente esta {getTipoLabel(tipo).toLowerCase()} pelo celular
        </p>
      </DialogContent>
    </Dialog>
  );
}

// Componente para exibir QR Code em miniatura
export function QRCodeMini({ tipo, id, protocolo }: { tipo: string; id: number; protocolo?: string }) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const publicUrl = `${window.location.origin}/publico/${tipo}/${id}`;

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(publicUrl, {
          width: 80,
          margin: 1,
          errorCorrectionLevel: 'M',
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Erro ao gerar QR Code:', error);
      }
    };
    generateQR();
  }, [publicUrl]);

  if (!qrCodeUrl) return null;

  return (
    <div className="flex flex-col items-center">
      <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16" />
      <span className="text-[10px] text-gray-400">#{protocolo || id}</span>
    </div>
  );
}
