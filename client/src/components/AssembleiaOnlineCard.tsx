import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Video, 
  Users, 
  Calendar as CalendarIcon, 
  MessageCircle, 
  Copy, 
  ExternalLink,
  Info,
  Clock,
  Save,
  Play,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

interface AssembleiaOnlineCardProps {
  condominioId?: number;
  linkAssembleia?: string;
  dataAssembleia?: Date | null;
  onLinkChange?: (link: string) => void;
  onDateSelect?: (date: Date) => void;
  compact?: boolean;
  readOnly?: boolean;
}

export default function AssembleiaOnlineCard({ 
  condominioId,
  linkAssembleia = "", 
  dataAssembleia,
  onLinkChange,
  onDateSelect,
  compact = false,
  readOnly = false
}: AssembleiaOnlineCardProps) {
  const [link, setLink] = useState(linkAssembleia);
  const [date, setDate] = useState<Date | undefined>(dataAssembleia ? new Date(dataAssembleia) : undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(!!linkAssembleia);

  // @ts-ignore - TypeScript não reconhece o método ainda
  const saveAssembleiaLink = trpc.condominio.saveAssembleiaLink.useMutation({
    onSuccess: () => {
      toast.success("Link da assembleia salvo com sucesso!");
      setIsSaved(true);
    },
    onError: () => {
      toast.error("Erro ao salvar link da assembleia");
    }
  });

  useEffect(() => {
    setLink(linkAssembleia);
    setIsSaved(!!linkAssembleia);
  }, [linkAssembleia]);

  useEffect(() => {
    if (dataAssembleia) {
      setDate(new Date(dataAssembleia));
    }
  }, [dataAssembleia]);

  const whatsappNumber = "5581999618516";
  const whatsappMessage = date 
    ? `Olá! Gostaria de agendar uma assembleia online para o dia ${format(date, "dd/MM/yyyy", { locale: ptBR })}. Poderia me ajudar?`
    : "Olá! Gostaria de agendar uma assembleia online. Poderia me ajudar?";

  const handleCopyLink = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success("Link copiado para a área de transferência!");
    } else {
      toast.error("Nenhum link para copiar");
    }
  };

  const handleOpenLink = () => {
    if (link) {
      window.open(link, '_blank');
    } else {
      toast.error("Nenhum link configurado");
    }
  };

  const handleWhatsAppClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setCalendarOpen(false);
    setIsSaved(false);
    if (selectedDate && onDateSelect) {
      onDateSelect(selectedDate);
    }
  };

  const handleLinkChange = (newLink: string) => {
    setLink(newLink);
    setIsSaved(false);
    if (onLinkChange) {
      onLinkChange(newLink);
    }
  };

  const handleSaveLink = () => {
    if (!condominioId) {
      toast.error("Condomínio não identificado");
      return;
    }
    if (!link) {
      toast.error("Por favor, insira um link válido");
      return;
    }
    saveAssembleiaLink.mutate({
      id: condominioId,
      assembleiaLink: link,
      assembleiaData: date?.toISOString(),
    });
  };

  if (compact) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        <CardContent className="p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Video className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="font-medium text-sm text-gray-900">Assembleia Online</h3>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header com Gradiente */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Assembleia Online</h2>
              <p className="text-white/80 text-sm flex items-center gap-2 mt-1">
                <Users className="w-4 h-4" />
                Com gravação e até 500 participantes
              </p>
            </div>
          </div>
          <Badge className="bg-white/20 text-white border-0 hover:bg-white/30">
            Premium
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Botão de Acessar Assembleia em Destaque */}
        {link && isSaved && (
          <Button
            onClick={handleOpenLink}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
          >
            <Play className="w-6 h-6 mr-3" />
            Acessar Assembleia Online
          </Button>
        )}

        {/* Link da Assembleia */}
        {!readOnly && (
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-purple-600" />
              Link da Assembleia
              {isSaved && link && (
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Salvo
                </Badge>
              )}
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="Cole aqui o link da sua assembleia..."
                value={link}
                onChange={(e) => handleLinkChange(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                title="Copiar link"
                disabled={!link}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleOpenLink}
                title="Abrir link"
                disabled={!link}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Calendário de Agendamento */}
        {!readOnly && (
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-purple-600" />
              Agendar Data da Assembleia
            </Label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: ptBR }) : "Selecione a data desejada"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Botão Salvar Link */}
        {!readOnly && condominioId && (
          <Button
            onClick={handleSaveLink}
            disabled={!link || saveAssembleiaLink.isPending}
            className={cn(
              "w-full h-12 text-base font-semibold transition-all",
              isSaved && link
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            )}
          >
            {saveAssembleiaLink.isPending ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Salvando...
              </>
            ) : isSaved && link ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Link Salvo - Clique para Atualizar
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Salvar Link para Equipe
              </>
            )}
          </Button>
        )}

        {/* Botão WhatsApp em Destaque */}
        <Button
          onClick={handleWhatsAppClick}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white h-12 text-base font-semibold"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Agendar pelo WhatsApp
        </Button>

        {/* Informações de Limites */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-2">Limites de Assembleias</h4>
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-purple-700">Gestores</span>
                  <Badge variant="outline" className="bg-white border-purple-200 text-purple-700">
                    <Clock className="w-3 h-3 mr-1" />
                    1 por mês
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-700">Organizações</span>
                  <Badge variant="outline" className="bg-white border-purple-200 text-purple-700">
                    <Clock className="w-3 h-3 mr-1" />
                    2 por mês
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-700">Administradores</span>
                  <Badge variant="outline" className="bg-white border-purple-200 text-purple-700">
                    <Clock className="w-3 h-3 mr-1" />
                    3 por mês
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
