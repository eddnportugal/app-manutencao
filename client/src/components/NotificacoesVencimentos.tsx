import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { trpc } from "@/lib/trpc";
import { Mail, Bell, Calendar, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface NotificacoesVencimentosProps {
  condominioId: number;
  emailPadrao?: string;
}

export default function NotificacoesVencimentos({ condominioId, emailPadrao }: NotificacoesVencimentosProps) {
  const [email, setEmail] = useState(emailPadrao || "");
  const [diasAntecedencia, setDiasAntecedencia] = useState("7");
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(true);

  // @ts-ignore - rota existe no backend
  const enviarResumo = trpc.vencimentos.enviarResumoPorEmail.useMutation({
    onSuccess: (data: { success: boolean; message: string; totais: { atrasados: number; hoje: number; proximos: number } }) => {
      if (data.success) {
        toast.success(data.message, {
          description: `Atrasados: ${data.totais.atrasados} | Hoje: ${data.totais.hoje} | Próximos: ${data.totais.proximos}`,
        });
      } else {
        toast.error("Erro ao enviar", { description: data.message });
      }
    },
    onError: (error: Error) => {
      toast.error("Erro ao enviar email", { description: error.message });
    },
  });

  const handleEnviarResumo = () => {
    if (!email) {
      toast.error("Informe um email válido");
      return;
    }

    enviarResumo.mutate({
      condominioId,
      email,
      diasAntecedencia: parseInt(diasAntecedencia),
    });
  };

  return (
    <Card className="w-full rounded-2xl shadow-sm border-0 bg-white">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl shrink-0">
              <Mail className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                Notificações por Email
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-gray-500">
                Configure alertas automáticos de vencimentos
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <Label htmlFor="notificacoes-ativas" className="text-sm font-medium text-gray-600">
              Ativar alertas
            </Label>
            <Switch
              id="notificacoes-ativas"
              checked={notificacoesAtivas}
              onCheckedChange={setNotificacoesAtivas}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        {/* Configurações */}
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email para notificações</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-gray-200 focus:border-orange-400 focus:ring-orange-400/20"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="dias" className="text-sm font-medium text-gray-700">Antecedência dos alertas</Label>
            <Select value={diasAntecedencia} onValueChange={setDiasAntecedencia}>
              <SelectTrigger className="h-12 rounded-xl border-gray-200">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 dias antes</SelectItem>
                <SelectItem value="7">7 dias antes</SelectItem>
                <SelectItem value="15">15 dias antes</SelectItem>
                <SelectItem value="30">30 dias antes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tipos de alerta */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Tipos de alerta incluídos</Label>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3.5 py-2 rounded-xl text-sm font-medium">
              <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
              Vencidos
            </Badge>
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3.5 py-2 rounded-xl text-sm font-medium">
              <Bell className="h-3.5 w-3.5 mr-1.5" />
              Vencem hoje
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3.5 py-2 rounded-xl text-sm font-medium">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Próximos vencimentos
            </Badge>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 pt-5 border-t border-gray-100">
          <Button
            onClick={handleEnviarResumo}
            disabled={enviarResumo.isPending || !email}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl h-13 text-base font-semibold shadow-lg shadow-orange-200/50 transition-all duration-200 active:scale-[0.98]"
          >
            {enviarResumo.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Resumo Agora
              </>
            )}
          </Button>
          <Button variant="outline" className="flex-1 rounded-2xl h-13 text-base border-gray-200" disabled>
            <Bell className="h-4 w-4 mr-2" />
            Configurar Automático (em breve)
          </Button>
        </div>

        {/* Status */}
        {enviarResumo.isSuccess && enviarResumo.data.success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span>Email enviado com sucesso!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
