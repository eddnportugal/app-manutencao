import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bell, BellOff, Mail, User, UserCheck, Plus, X, Save, History, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface TimelineNotificacoesConfigProps {
  timelineId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TimelineNotificacoesConfig({ timelineId, open, onOpenChange }: TimelineNotificacoesConfigProps) {
  const [notificarResponsavel, setNotificarResponsavel] = useState(true);
  const [notificarCriador, setNotificarCriador] = useState(true);
  const [emailsAdicionais, setEmailsAdicionais] = useState<string[]>([]);
  const [novoEmail, setNovoEmail] = useState("");
  const [notificarMudancaStatus, setNotificarMudancaStatus] = useState(true);
  const [notificarAtualizacao, setNotificarAtualizacao] = useState(true);
  const [notificarNovaImagem, setNotificarNovaImagem] = useState(false);
  const [notificarComentario, setNotificarComentario] = useState(true);
  const [notificarCompartilhamento, setNotificarCompartilhamento] = useState(false);
  const [ativo, setAtivo] = useState(true);

  const { data: config, isLoading } = trpc.timeline.obterConfigNotificacoes.useQuery(
    { timelineId },
    { enabled: open }
  );

  const { data: historico = [] } = trpc.timeline.listarHistoricoNotificacoes.useQuery(
    { timelineId, limite: 20 },
    { enabled: open }
  );

  const salvarMutation = trpc.timeline.salvarConfigNotificacoes.useMutation({
    onSuccess: () => {
      toast.success("Configurações de notificação salvas com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao salvar configurações: " + error.message);
    },
  });

  useEffect(() => {
    if (config) {
      setNotificarResponsavel(config.notificarResponsavel ?? true);
      setNotificarCriador(config.notificarCriador ?? true);
      setNotificarMudancaStatus(config.notificarMudancaStatus ?? true);
      setNotificarAtualizacao(config.notificarAtualizacao ?? true);
      setNotificarNovaImagem(config.notificarNovaImagem ?? false);
      setNotificarComentario(config.notificarComentario ?? true);
      setNotificarCompartilhamento(config.notificarCompartilhamento ?? false);
      setAtivo(config.ativo ?? true);
      if (config.emailsAdicionais) {
        try {
          setEmailsAdicionais(JSON.parse(config.emailsAdicionais));
        } catch (e) {
          setEmailsAdicionais([]);
        }
      }
    }
  }, [config]);

  const handleAddEmail = () => {
    if (novoEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) {
      if (!emailsAdicionais.includes(novoEmail)) {
        setEmailsAdicionais([...emailsAdicionais, novoEmail]);
        setNovoEmail("");
      } else {
        toast.error("Este email já está na lista");
      }
    } else {
      toast.error("Por favor, insira um email válido");
    }
  };

  const handleRemoveEmail = (email: string) => {
    setEmailsAdicionais(emailsAdicionais.filter(e => e !== email));
  };

  const handleSalvar = () => {
    salvarMutation.mutate({
      timelineId,
      notificarResponsavel,
      notificarCriador,
      emailsAdicionais: JSON.stringify(emailsAdicionais),
      notificarMudancaStatus,
      notificarAtualizacao,
      notificarNovaImagem,
      notificarComentario,
      notificarCompartilhamento,
      ativo,
    });
  };

  const tipoEventoLabels: Record<string, { label: string; cor: string }> = {
    mudanca_status: { label: "Mudança de Status", cor: "bg-blue-500" },
    atualizacao: { label: "Atualização", cor: "bg-orange-500" },
    nova_imagem: { label: "Nova Imagem", cor: "bg-green-500" },
    comentario: { label: "Comentário", cor: "bg-purple-500" },
    compartilhamento: { label: "Compartilhamento", cor: "bg-cyan-500" },
    criacao: { label: "Criação", cor: "bg-emerald-500" },
    finalizacao: { label: "Finalização", cor: "bg-indigo-500" },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            Configurações de Notificações
          </DialogTitle>
          <DialogDescription>
            Configure quando e para quem enviar notificações sobre esta timeline.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ativar/Desativar Notificações */}
            <Card className={ativo ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ativo ? (
                      <Bell className="h-5 w-5 text-green-600" />
                    ) : (
                      <BellOff className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <Label className="text-base font-medium">
                        Notificações {ativo ? "Ativadas" : "Desativadas"}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {ativo ? "Emails serão enviados conforme configurado" : "Nenhum email será enviado"}
                      </p>
                    </div>
                  </div>
                  <Switch checked={ativo} onCheckedChange={setAtivo} />
                </div>
              </CardContent>
            </Card>

            <Accordion type="single" collapsible defaultValue="destinatarios" className="w-full">
              {/* Destinatários */}
              <AccordionItem value="destinatarios">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-orange-500" />
                    Destinatários
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <Label>Notificar Responsável</Label>
                    </div>
                    <Switch checked={notificarResponsavel} onCheckedChange={setNotificarResponsavel} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <Label>Notificar Criador</Label>
                    </div>
                    <Switch checked={notificarCriador} onCheckedChange={setNotificarCriador} />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Emails Adicionais
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="email@exemplo.com"
                        value={novoEmail}
                        onChange={(e) => setNovoEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                      />
                      <Button type="button" size="icon" onClick={handleAddEmail}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {emailsAdicionais.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {emailsAdicionais.map((email) => (
                          <Badge key={email} variant="secondary" className="flex items-center gap-1">
                            {email}
                            <button
                              type="button"
                              onClick={() => handleRemoveEmail(email)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Eventos */}
              <AccordionItem value="eventos">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-orange-500" />
                    Eventos que Disparam Notificação
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mudança de Status</Label>
                      <p className="text-xs text-muted-foreground">Quando o status da timeline mudar</p>
                    </div>
                    <Switch checked={notificarMudancaStatus} onCheckedChange={setNotificarMudancaStatus} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Atualizações Gerais</Label>
                      <p className="text-xs text-muted-foreground">Quando houver edições na timeline</p>
                    </div>
                    <Switch checked={notificarAtualizacao} onCheckedChange={setNotificarAtualizacao} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Nova Imagem</Label>
                      <p className="text-xs text-muted-foreground">Quando uma imagem for adicionada</p>
                    </div>
                    <Switch checked={notificarNovaImagem} onCheckedChange={setNotificarNovaImagem} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Comentários</Label>
                      <p className="text-xs text-muted-foreground">Quando houver novos comentários</p>
                    </div>
                    <Switch checked={notificarComentario} onCheckedChange={setNotificarComentario} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compartilhamentos</Label>
                      <p className="text-xs text-muted-foreground">Quando a timeline for compartilhada</p>
                    </div>
                    <Switch checked={notificarCompartilhamento} onCheckedChange={setNotificarCompartilhamento} />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Histórico */}
              <AccordionItem value="historico">
                <AccordionTrigger className="text-base font-medium">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-orange-500" />
                    Histórico de Notificações
                    {historico.length > 0 && (
                      <Badge variant="secondary" className="ml-2">{historico.length}</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {historico.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma notificação enviada ainda.
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {historico.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border"
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 ${tipoEventoLabels[item.tipoEvento]?.cor || "bg-gray-500"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm">
                                {tipoEventoLabels[item.tipoEvento]?.label || item.tipoEvento}
                              </span>
                              {item.enviado ? (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Enviado ({item.totalEnviados})
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Falhou
                                </Badge>
                              )}
                            </div>
                            {item.statusAnterior && item.statusNovo && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.statusAnterior} → {item.statusNovo}
                              </p>
                            )}
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              {new Date(item.createdAt).toLocaleString("pt-BR")}
                              {item.usuarioNome && ` • ${item.usuarioNome}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Botão Salvar */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleSalvar}
                disabled={salvarMutation.isPending}
                className="bg-gradient-to-r from-orange-500 to-orange-600"
              >
                {salvarMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
