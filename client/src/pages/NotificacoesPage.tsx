import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Send, 
  Settings, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Plus,
  Trash2,
  Calendar,
  Smartphone,
  History,
  Zap,
  FileText,
  Wrench,
  DollarSign,
  PartyPopper,
  Edit,
  Copy,
  MoreVertical,
  Video,
  Paperclip,
  Upload,
  X
} from "lucide-react";
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getSubscription,
  extractSubscriptionData,
  showLocalNotification
} from "@/lib/pushNotifications";

interface NotificacoesPageProps {
  condominioId: number;
}

export function NotificacoesPage({ condominioId }: NotificacoesPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  // Estados para envio de notificação
  const [showSendModal, setShowSendModal] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifChannel, setNotifChannel] = useState<"push" | "email" | "whatsapp">("push");
  const [notifVideoLink, setNotifVideoLink] = useState("");
  const [notifArquivo, setNotifArquivo] = useState<string | null>(null);
  const [uploadingArquivo, setUploadingArquivo] = useState(false);
  
  // Estados para lembretes
  const [showLembreteModal, setShowLembreteModal] = useState(false);
  const [lembreteTipo, setLembreteTipo] = useState<"assembleia" | "vencimento" | "evento" | "manutencao" | "custom">("custom");
  const [lembreteTitulo, setLembreteTitulo] = useState("");
  const [lembreteMensagem, setLembreteMensagem] = useState("");
  const [lembreteData, setLembreteData] = useState("");
  const [lembreteAntecedencia, setLembreteAntecedencia] = useState(24);
  
  // Queries
  // @ts-ignore - tRPC types may not be updated yet
  const { data: subscriptions } = trpc.pushNotifications.listByCondominio.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  // @ts-ignore
  const { data: lembretes, refetch: refetchLembretes } = trpc.lembretes.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  // @ts-ignore
  const { data: historico } = trpc.historicoNotificacoes.list.useQuery(
    { condominioId, limit: 20 },
    { enabled: !!condominioId }
  );
  
  // @ts-ignore
  const { data: stats } = trpc.historicoNotificacoes.getStats.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  // @ts-ignore
  const { data: emailConfig } = trpc.configEmail.get.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  // @ts-ignore
  const { data: pushConfig, refetch: refetchPushConfig } = trpc.configPush.get.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  // @ts-ignore
  const { data: templates, refetch: refetchTemplates } = trpc.templatesNotificacao.list.useQuery(
    { condominioId },
    { enabled: !!condominioId }
  );
  
  // Estados para templates
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateNome, setTemplateNome] = useState("");
  const [templateTitulo, setTemplateTitulo] = useState("");
  const [templateMensagem, setTemplateMensagem] = useState("");
  const [templateCategoria, setTemplateCategoria] = useState<string>("custom");
  const [templateUrl, setTemplateUrl] = useState("");
  
  // Mutations
  // @ts-ignore
  const subscribeMutation = trpc.pushNotifications.subscribe.useMutation({
    onSuccess: () => {
      toast.success("Notificações push ativadas!");
      setPushEnabled(true);
    },
    onError: () => {
      toast.error("Erro ao ativar notificações push");
    }
  });
  
  // @ts-ignore
  const unsubscribeMutation = trpc.pushNotifications.unsubscribe.useMutation({
    onSuccess: () => {
      toast.success("Notificações push desativadas");
      setPushEnabled(false);
    }
  });
  
  // @ts-ignore
  const createLembreteMutation = trpc.lembretes.create.useMutation({
    onSuccess: () => {
      toast.success("Lembrete criado com sucesso!");
      setShowLembreteModal(false);
      resetLembreteForm();
      refetchLembretes();
    },
    onError: () => {
      toast.error("Erro ao criar lembrete");
    }
  });
  
  // @ts-ignore
  const deleteLembreteMutation = trpc.lembretes.delete.useMutation({
    onSuccess: () => {
      toast.success("Lembrete excluído");
      refetchLembretes();
    }
  });
  
  // @ts-ignore
  const createHistoricoMutation = trpc.historicoNotificacoes.create.useMutation();
  
  // @ts-ignore
  const saveEmailConfigMutation = trpc.configEmail.save.useMutation({
    onSuccess: () => {
      toast.success("Configurações de email salvas!");
    }
  });
  
  // @ts-ignore
  const savePushConfigMutation = trpc.configPush.save.useMutation({
    onSuccess: () => {
      toast.success("Configurações VAPID salvas!");
      refetchPushConfig();
    },
    onError: () => {
      toast.error("Erro ao salvar configurações VAPID");
    }
  });
  
  // @ts-ignore
  const createTemplateMutation = trpc.templatesNotificacao.create.useMutation({
    onSuccess: () => {
      toast.success("Template criado com sucesso!");
      refetchTemplates();
      resetTemplateForm();
      setShowTemplateModal(false);
    },
    onError: () => {
      toast.error("Erro ao criar template");
    }
  });
  
  // @ts-ignore
  const updateTemplateMutation = trpc.templatesNotificacao.update.useMutation({
    onSuccess: () => {
      toast.success("Template atualizado!");
      refetchTemplates();
      resetTemplateForm();
      setShowTemplateModal(false);
    },
    onError: () => {
      toast.error("Erro ao atualizar template");
    }
  });
  
  // @ts-ignore
  const deleteTemplateMutation = trpc.templatesNotificacao.delete.useMutation({
    onSuccess: () => {
      toast.success("Template excluído!");
      refetchTemplates();
    },
    onError: () => {
      toast.error("Erro ao excluir template");
    }
  });
  
  // @ts-ignore
  const createDefaultsMutation = trpc.templatesNotificacao.createDefaults.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} templates padrão criados!`);
      refetchTemplates();
    },
    onError: () => {
      toast.error("Erro ao criar templates padrão");
    }
  });
  
  // @ts-ignore
  const incrementUsageMutation = trpc.templatesNotificacao.incrementUsage.useMutation();
  
  const resetTemplateForm = () => {
    setEditingTemplate(null);
    setTemplateNome("");
    setTemplateTitulo("");
    setTemplateMensagem("");
    setTemplateCategoria("custom");
    setTemplateUrl("");
  };
  
  const openEditTemplate = (template: any) => {
    setEditingTemplate(template);
    setTemplateNome(template.nome);
    setTemplateTitulo(template.titulo);
    setTemplateMensagem(template.mensagem);
    setTemplateCategoria(template.categoria);
    setTemplateUrl(template.urlDestino || "");
    setShowTemplateModal(true);
  };
  
  const handleSaveTemplate = () => {
    if (!templateNome || !templateTitulo || !templateMensagem) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    if (editingTemplate) {
      updateTemplateMutation.mutate({
        id: editingTemplate.id,
        nome: templateNome,
        titulo: templateTitulo,
        mensagem: templateMensagem,
        categoria: templateCategoria as any,
        urlDestino: templateUrl || undefined,
      });
    } else {
      createTemplateMutation.mutate({
        condominioId,
        nome: templateNome,
        titulo: templateTitulo,
        mensagem: templateMensagem,
        categoria: templateCategoria as any,
        urlDestino: templateUrl || undefined,
      });
    }
  };
  
  const useTemplate = (template: any) => {
    setBroadcastTitle(template.titulo);
    setBroadcastMessage(template.mensagem);
    setBroadcastUrl(template.urlDestino || "");
    incrementUsageMutation.mutate({ id: template.id });
    setShowBroadcastModal(true);
    toast.success(`Template "${template.nome}" carregado!`);
  };
  
  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      assembleia: "Assembleia",
      manutencao: "Manutenção",
      vencimento: "Vencimento",
      aviso: "Aviso",
      evento: "Evento",
      custom: "Personalizado",
    };
    return labels[categoria] || categoria;
  };
  
  const getCategoriaColor = (categoria: string) => {
    const colors: Record<string, string> = {
      assembleia: "bg-blue-100 text-blue-700",
      manutencao: "bg-amber-100 text-amber-700",
      vencimento: "bg-green-100 text-green-700",
      aviso: "bg-purple-100 text-purple-700",
      evento: "bg-pink-100 text-pink-700",
      custom: "bg-gray-100 text-gray-700",
    };
    return colors[categoria] || "bg-gray-100 text-gray-700";
  };
  
  // Estado para envio de push de teste
  const [isSendingTestPush, setIsSendingTestPush] = useState(false);
  
  // Estados para envio em massa
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastUrl, setBroadcastUrl] = useState("");
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{success: boolean; message: string; stats?: {total: number; enviados: number; falhas: number}} | null>(null);
  
  // Estados para segmentação de destinatários
  const [selectedBlocos, setSelectedBlocos] = useState<string[]>([]);
  const [selectedApartamentos, setSelectedApartamentos] = useState<string[]>([]);
  const [showSegmentacao, setShowSegmentacao] = useState(false);
  
  // @ts-ignore
  const { data: blocos } = trpc.pushNotifications.getBlocos.useQuery(
    { condominioId },
    { enabled: !!condominioId && showBroadcastModal }
  );
  
  // @ts-ignore
  const { data: apartamentos } = trpc.pushNotifications.getApartamentos.useQuery(
    { condominioId, blocos: selectedBlocos.length > 0 ? selectedBlocos : undefined },
    { enabled: !!condominioId && showBroadcastModal }
  );
  
  // @ts-ignore
  const { data: destinatariosCount } = trpc.pushNotifications.countDestinatarios.useQuery(
    { 
      condominioId, 
      blocos: selectedBlocos.length > 0 ? selectedBlocos : undefined,
      apartamentos: selectedApartamentos.length > 0 ? selectedApartamentos : undefined,
    },
    { enabled: !!condominioId && showBroadcastModal }
  );
  
  // @ts-ignore
  const sendTestPushMutation = trpc.pushNotifications.sendTest.useMutation({
    onSuccess: (data) => {
      setIsSendingTestPush(false);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      setIsSendingTestPush(false);
      toast.error("Erro ao enviar notificação de teste");
    }
  });
  
  // @ts-ignore
  const sendBroadcastMutation = trpc.pushNotifications.sendBroadcast.useMutation({
    onSuccess: (data) => {
      setIsSendingBroadcast(false);
      setBroadcastResult(data);
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      setIsSendingBroadcast(false);
      toast.error("Erro ao enviar notificações em massa");
    }
  });
  
  // Verificar status do push ao carregar
  useEffect(() => {
    if (isPushSupported()) {
      setPushPermission(getNotificationPermission());
      checkPushSubscription();
    }
  }, []);
  
  const checkPushSubscription = async () => {
    const subscription = await getSubscription();
    setPushEnabled(!!subscription);
  };
  
  const handleTogglePush = async () => {
    if (!isPushSupported()) {
      toast.error("Seu navegador não suporta notificações push");
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      if (pushEnabled) {
        // Desativar
        const subscription = await getSubscription();
        if (subscription) {
          await unsubscribeMutation.mutateAsync({ endpoint: subscription.endpoint });
          await unsubscribeFromPush();
        }
      } else {
        // Ativar
        const subscription = await subscribeToPush();
        if (subscription) {
          const data = extractSubscriptionData(subscription);
          await subscribeMutation.mutateAsync({
            condominioId,
            ...data,
            userAgent: navigator.userAgent
          });
        } else {
          toast.error("Permissão negada ou erro ao ativar notificações");
        }
      }
    } catch (error) {
      console.error("Erro ao alternar push:", error);
      toast.error("Erro ao alternar notificações push");
    } finally {
      setIsSubscribing(false);
    }
  };
  
  const handleSendNotification = async () => {
    if (!notifTitle.trim()) {
      toast.error("Digite um título para a notificação");
      return;
    }
    
    try {
      // Registrar no histórico
      await createHistoricoMutation.mutateAsync({
        condominioId,
        tipo: notifChannel,
        titulo: notifTitle,
        mensagem: notifMessage,
        destinatarios: subscriptions?.length || 0,
        sucessos: 0,
        falhas: 0
      });
      
      // Se for push local (teste)
      if (notifChannel === "push" && pushEnabled) {
        showLocalNotification(notifTitle, { body: notifMessage });
      }
      
      toast.success("Notificação enviada!");
      setShowSendModal(false);
      setNotifTitle("");
      setNotifMessage("");
    } catch (error) {
      toast.error("Erro ao enviar notificação");
    }
  };
  
  const handleCreateLembrete = async () => {
    if (!lembreteTitulo.trim() || !lembreteData) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    await createLembreteMutation.mutateAsync({
      condominioId,
      tipo: lembreteTipo,
      titulo: lembreteTitulo,
      mensagem: lembreteMensagem,
      dataAgendada: lembreteData,
      antecedenciaHoras: lembreteAntecedencia,
      canais: ["push", "email"]
    });
  };
  
  const resetLembreteForm = () => {
    setLembreteTipo("custom");
    setLembreteTitulo("");
    setLembreteMensagem("");
    setLembreteData("");
    setLembreteAntecedencia(24);
  };
  
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      assembleia: "Assembleia",
      vencimento: "Vencimento",
      evento: "Evento",
      manutencao: "Manutenção",
      custom: "Personalizado"
    };
    return labels[tipo] || tipo;
  };
  
  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      push: "bg-purple-100 text-purple-700",
      email: "bg-blue-100 text-blue-700",
      whatsapp: "bg-green-100 text-green-700",
      sistema: "bg-gray-100 text-gray-700"
    };
    return colors[tipo] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-gray-500">Gerencie notificações push, email e lembretes automáticos</p>
        </div>
        <div className="flex gap-2">
          {/* Botão Enviar Push em Massa */}
          <Dialog open={showBroadcastModal} onOpenChange={(open) => {
            setShowBroadcastModal(open);
            if (!open) {
              setBroadcastTitle("");
              setBroadcastMessage("");
              setBroadcastUrl("");
              setBroadcastResult(null);
              setSelectedBlocos([]);
              setSelectedApartamentos([]);
              setShowSegmentacao(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-purple-500 to-purple-600">
                <Send className="h-4 w-4" />
                Enviar Push em Massa
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Bell className="h-6 w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-white text-xl">Enviar Push em Massa</DialogTitle>
                      <DialogDescription className="text-purple-100">
                        Envie uma notificação para todos a equipa com push ativo
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              
              {!broadcastResult ? (
                <div className="space-y-4 p-6">
                  {/* Contador de destinatários */}
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <strong>{destinatariosCount?.comPush || subscriptions?.length || 0}</strong> dispositivos 
                        {(selectedBlocos.length > 0 || selectedApartamentos.length > 0) && (
                          <span className="text-xs">({destinatariosCount?.total || 0} moradores filtrados)</span>
                        )}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowSegmentacao(!showSegmentacao)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {showSegmentacao ? "Ocultar Filtros" : "Segmentar"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Filtros de Segmentação */}
                  {showSegmentacao && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border space-y-3">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Segmentar Destinatários
                      </p>
                      
                      {/* Filtro por Bloco */}
                      <div className="space-y-2">
                        <Label className="text-xs">Filtrar por Bloco</Label>
                        <div className="flex flex-wrap gap-2">
                          {blocos && blocos.length > 0 ? (
                            blocos.map((bloco: string) => (
                              <Button
                                key={bloco}
                                variant={selectedBlocos.includes(bloco) ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  if (selectedBlocos.includes(bloco)) {
                                    setSelectedBlocos(selectedBlocos.filter(b => b !== bloco));
                                  } else {
                                    setSelectedBlocos([...selectedBlocos, bloco]);
                                  }
                                  setSelectedApartamentos([]); // Limpar apartamentos ao mudar bloco
                                }}
                                className="text-xs"
                              >
                                Bloco {bloco}
                              </Button>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">Nenhum bloco cadastrado</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Filtro por Apartamento */}
                      <div className="space-y-2">
                        <Label className="text-xs">Filtrar por Apartamento</Label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {apartamentos && apartamentos.length > 0 ? (
                            apartamentos.map((apto: string) => (
                              <Button
                                key={apto}
                                variant={selectedApartamentos.includes(apto) ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  if (selectedApartamentos.includes(apto)) {
                                    setSelectedApartamentos(selectedApartamentos.filter(a => a !== apto));
                                  } else {
                                    setSelectedApartamentos([...selectedApartamentos, apto]);
                                  }
                                }}
                                className="text-xs"
                              >
                                {apto}
                              </Button>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">
                              {selectedBlocos.length > 0 ? "Nenhum apartamento no bloco selecionado" : "Selecione um bloco primeiro ou nenhum apartamento cadastrado"}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Botão Limpar Filtros */}
                      {(selectedBlocos.length > 0 || selectedApartamentos.length > 0) && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSelectedBlocos([]);
                            setSelectedApartamentos([]);
                          }}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Limpar Filtros
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Seletor de Templates */}
                  {templates && templates.length > 0 && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Usar Template
                      </Label>
                      <Select onValueChange={(value) => {
                        const template = templates.find((t: any) => t.id.toString() === value);
                        if (template) {
                          setBroadcastTitle(template.titulo);
                          setBroadcastMessage(template.mensagem);
                          setBroadcastUrl(template.urlDestino || "");
                          incrementUsageMutation.mutate({ id: template.id });
                          toast.success(`Template "${template.nome}" carregado!`);
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um template (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {templates.map((template: any) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              <div className="flex items-center gap-2">
                                <span>{template.nome}</span>
                                <Badge className={`${getCategoriaColor(template.categoria)} text-xs`}>
                                  {getCategoriaLabel(template.categoria)}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">Selecione um template para preencher automaticamente</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label>Título da Notificação *</Label>
                    <Input 
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="Ex: Aviso Importante"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500">{broadcastTitle.length}/50 caracteres</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Mensagem *</Label>
                    <Textarea 
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Escreva a mensagem que será enviada..."
                      rows={3}
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500">{broadcastMessage.length}/200 caracteres</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>URL de Destino (opcional)</Label>
                    <Input 
                      value={broadcastUrl}
                      onChange={(e) => setBroadcastUrl(e.target.value)}
                      placeholder="/dashboard/avisos"
                    />
                    <p className="text-xs text-gray-500">Página que abrirá ao clicar na notificação</p>
                  </div>
                  
                  {pushConfig?.vapidPrivateKey ? (
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-700 dark:text-green-300 flex items-center gap-2">
                        ✅ <strong>Configurações VAPID encontradas!</strong> Pronto para enviar.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        ⚠️ <strong>Atenção:</strong> Configure as chaves VAPID na aba "Configurações" primeiro.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setShowBroadcastModal(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600"
                      disabled={!broadcastTitle || !broadcastMessage || isSendingBroadcast || (destinatariosCount?.comPush || subscriptions?.length || 0) === 0 || !pushConfig?.vapidPrivateKey}
                      onClick={() => {
                        if (!pushConfig?.vapidPublicKey || !pushConfig?.vapidPrivateKey || !pushConfig?.vapidSubject) {
                          toast.error("Configure as chaves VAPID na aba Configurações primeiro");
                          return;
                        }
                        
                        setIsSendingBroadcast(true);
                        sendBroadcastMutation.mutate({
                          condominioId,
                          titulo: broadcastTitle,
                          mensagem: broadcastMessage,
                          url: broadcastUrl || undefined,
                          vapidPublicKey: pushConfig.vapidPublicKey,
                          vapidPrivateKey: pushConfig.vapidPrivateKey,
                          vapidSubject: pushConfig.vapidSubject,
                          blocos: selectedBlocos.length > 0 ? selectedBlocos : undefined,
                          apartamentos: selectedApartamentos.length > 0 ? selectedApartamentos : undefined,
                        });
                      }}
                    >
                      {isSendingBroadcast ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Enviar para {destinatariosCount?.comPush || subscriptions?.length || 0} dispositivos
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-4">
                  <div className={`p-4 rounded-lg border ${broadcastResult.success ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {broadcastResult.success ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className={`font-medium ${broadcastResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {broadcastResult.success ? 'Envio Concluído!' : 'Erro no Envio'}
                      </span>
                    </div>
                    <p className={`text-sm ${broadcastResult.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {broadcastResult.message}
                    </p>
                  </div>
                  
                  {broadcastResult.stats && (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{broadcastResult.stats.total}</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-600">{broadcastResult.stats.enviados}</p>
                        <p className="text-xs text-green-600">Enviados</p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-red-600">{broadcastResult.stats.falhas}</p>
                        <p className="text-xs text-red-600">Falhas</p>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full"
                    onClick={() => {
                      setShowBroadcastModal(false);
                      setBroadcastTitle("");
                      setBroadcastMessage("");
                      setBroadcastUrl("");
                      setBroadcastResult(null);
                    }}
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
          
          <Dialog open={showLembreteModal} onOpenChange={setShowLembreteModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Clock className="h-4 w-4" />
                Novo Lembrete
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-white text-xl">Criar Lembrete</DialogTitle>
                      <DialogDescription className="text-blue-100">
                        Agende um lembrete para ser enviado automaticamente
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              <div className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={lembreteTipo} onValueChange={(v: any) => setLembreteTipo(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assembleia">Assembleia</SelectItem>
                      <SelectItem value="vencimento">Vencimento</SelectItem>
                      <SelectItem value="evento">Evento</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input 
                    value={lembreteTitulo}
                    onChange={(e) => setLembreteTitulo(e.target.value)}
                    placeholder="Ex: Assembleia Geral Ordinária"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Textarea 
                    value={lembreteMensagem}
                    onChange={(e) => setLembreteMensagem(e.target.value)}
                    placeholder="Mensagem do lembrete..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Data e Hora do Evento *</Label>
                  <Input 
                    type="datetime-local"
                    value={lembreteData}
                    onChange={(e) => setLembreteData(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Enviar lembrete com antecedência de</Label>
                  <Select value={lembreteAntecedencia.toString()} onValueChange={(v) => setLembreteAntecedencia(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora antes</SelectItem>
                      <SelectItem value="2">2 horas antes</SelectItem>
                      <SelectItem value="6">6 horas antes</SelectItem>
                      <SelectItem value="12">12 horas antes</SelectItem>
                      <SelectItem value="24">24 horas antes</SelectItem>
                      <SelectItem value="48">48 horas antes</SelectItem>
                      <SelectItem value="72">72 horas antes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
              </div>
              <div className="flex justify-end gap-2 p-6 pt-0 bg-gray-50 border-t">
                <Button variant="outline" onClick={() => setShowLembreteModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateLembrete}
                  disabled={createLembreteMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-blue-600"
                >
                  {createLembreteMutation.isPending ? "Criando..." : "Criar Lembrete"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-purple-500 to-purple-600">
                <Send className="h-4 w-4" />
                Enviar Notificação
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md p-0 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Send className="h-6 w-6" />
                    </div>
                    <div>
                      <DialogTitle className="text-white text-xl">Enviar Notificação</DialogTitle>
                      <DialogDescription className="text-purple-100">
                        Envie uma notificação para a equipa da organização
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              <div className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label>Canal</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={notifChannel === "push" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotifChannel("push")}
                      className={notifChannel === "push" ? "bg-purple-500" : ""}
                    >
                      <Bell className="h-4 w-4 mr-1" />
                      Push
                    </Button>
                    <Button
                      type="button"
                      variant={notifChannel === "email" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotifChannel("email")}
                      className={notifChannel === "email" ? "bg-blue-500" : ""}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button
                      type="button"
                      variant={notifChannel === "whatsapp" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNotifChannel("whatsapp")}
                      className={notifChannel === "whatsapp" ? "bg-green-500" : ""}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input 
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="Título da notificação"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Textarea 
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    placeholder="Conteúdo da notificação..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Link de Vídeo (opcional)
                  </Label>
                  <Input 
                    value={notifVideoLink}
                    onChange={(e) => setNotifVideoLink(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Anexar Arquivo (opcional)
                  </Label>
                  {notifArquivo ? (
                    <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm flex-1 truncate">{notifArquivo.split('/').pop()}</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setNotifArquivo(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 100 * 1024 * 1024) {
                            toast.error("Arquivo muito grande. Máximo 100MB.");
                            return;
                          }
                          setUploadingArquivo(true);
                          try {
                            const formData = new FormData();
                            formData.append('file', file);
                            const response = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData,
                            });
                            const data = await response.json();
                            if (data.url) {
                              setNotifArquivo(data.url);
                              toast.success("Arquivo anexado!");
                            }
                          } catch (error) {
                            toast.error("Erro ao fazer upload do arquivo");
                          } finally {
                            setUploadingArquivo(false);
                          }
                        }}
                      />
                      <Button variant="outline" className="w-full" disabled={uploadingArquivo}>
                        {uploadingArquivo ? (
                          <span className="flex items-center gap-2">
                            <Upload className="h-4 w-4 animate-pulse" />
                            Enviando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Selecionar Arquivo (máx. 100MB)
                          </span>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {notifChannel === "push" && `${subscriptions?.length || 0} dispositivos receberão esta notificação`}
                    {notifChannel === "email" && "Será enviado para todos a equipa com email cadastrado"}
                    {notifChannel === "whatsapp" && "Abrirá o WhatsApp para envio manual"}
                  </p>
                </div>
                
              </div>
              <div className="flex justify-end gap-2 p-6 pt-0 bg-gray-50 border-t">
                <Button variant="outline" onClick={() => setShowSendModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSendNotification}
                  className="bg-gradient-to-r from-purple-500 to-purple-600"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <Zap className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="lembretes" className="gap-2">
            <Clock className="h-4 w-4" />
            Lembretes
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>
        
        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Bell className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.push || 0}</p>
                    <p className="text-sm text-gray-500">Push enviadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.email || 0}</p>
                    <p className="text-sm text-gray-500">Emails enviados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.whatsapp || 0}</p>
                    <p className="text-sm text-gray-500">WhatsApp enviados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Smartphone className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{subscriptions?.length || 0}</p>
                    <p className="text-sm text-gray-500">Dispositivos ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Status dos canais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-purple-500" />
                  Notificações Push
                </CardTitle>
                <CardDescription>
                  Notificações instantâneas no navegador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={pushEnabled ? "default" : "secondary"} className={pushEnabled ? "bg-green-500" : ""}>
                      {pushEnabled ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Permissão</span>
                    <Badge variant="outline">
                      {pushPermission === "granted" ? "Concedida" : pushPermission === "denied" ? "Negada" : "Pendente"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Ativar Push</span>
                    <Switch 
                      checked={pushEnabled}
                      onCheckedChange={handleTogglePush}
                      disabled={isSubscribing || !isPushSupported()}
                    />
                  </div>
                  
                  {!isPushSupported() && (
                    <p className="text-xs text-red-500">
                      Seu navegador não suporta notificações push
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5 text-blue-500" />
                  Email
                </CardTitle>
                <CardDescription>
                  Notificações por email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant={emailConfig?.ativo ? "default" : "secondary"} className={emailConfig?.ativo ? "bg-green-500" : ""}>
                      {emailConfig?.ativo ? "Configurado" : "Não configurado"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Provedor</span>
                    <Badge variant="outline">
                      {emailConfig?.provedor || "Nenhum"}
                    </Badge>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setActiveTab("config")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* WhatsApp */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  WhatsApp
                </CardTitle>
                <CardDescription>
                  Compartilhamento via WhatsApp
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="default" className="bg-green-500">
                      Disponível
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tipo</span>
                    <Badge variant="outline">
                      Envio manual
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    O WhatsApp abre automaticamente com a mensagem pré-configurada para envio manual.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Lembretes */}
        <TabsContent value="lembretes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Lembretes Agendados
              </CardTitle>
              <CardDescription>
                Lembretes automáticos para assembleias, vencimentos e eventos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lembretes && lembretes.length > 0 ? (
                <div className="space-y-3">
                  {lembretes.map((lembrete: any) => (
                    <div 
                      key={lembrete.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                        lembrete.tipo === 'assembleia' ? 'bg-blue-50 border-blue-500' :
                        lembrete.tipo === 'vencimento' ? 'bg-green-50 border-green-500' :
                        lembrete.tipo === 'evento' ? 'bg-pink-50 border-pink-500' :
                        lembrete.tipo === 'manutencao' ? 'bg-amber-50 border-amber-500' :
                        'bg-gray-50 border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          lembrete.enviado ? "bg-green-100" : 
                          lembrete.tipo === 'assembleia' ? 'bg-blue-100' :
                          lembrete.tipo === 'vencimento' ? 'bg-green-100' :
                          lembrete.tipo === 'evento' ? 'bg-pink-100' :
                          lembrete.tipo === 'manutencao' ? 'bg-amber-100' :
                          'bg-orange-100'
                        }`}>
                          {lembrete.enviado ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : lembrete.tipo === 'assembleia' ? (
                            <Users className="h-5 w-5 text-blue-600" />
                          ) : lembrete.tipo === 'vencimento' ? (
                            <DollarSign className="h-5 w-5 text-green-600" />
                          ) : lembrete.tipo === 'evento' ? (
                            <PartyPopper className="h-5 w-5 text-pink-600" />
                          ) : lembrete.tipo === 'manutencao' ? (
                            <Wrench className="h-5 w-5 text-amber-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-orange-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{lembrete.titulo}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline" className={`text-xs ${
                              lembrete.tipo === 'assembleia' ? 'border-blue-500 text-blue-700' :
                              lembrete.tipo === 'vencimento' ? 'border-green-500 text-green-700' :
                              lembrete.tipo === 'evento' ? 'border-pink-500 text-pink-700' :
                              lembrete.tipo === 'manutencao' ? 'border-amber-500 text-amber-700' :
                              ''
                            }`}>
                              {getTipoLabel(lembrete.tipo)}
                            </Badge>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(lembrete.dataAgendada)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={lembrete.enviado ? "default" : "secondary"} className={lembrete.enviado ? "bg-green-500" : ""}>
                          {lembrete.enviado ? "Enviado" : "Pendente"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLembreteMutation.mutate({ id: lembrete.id })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum lembrete agendado</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowLembreteModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeiro lembrete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Histórico */}
        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Notificações
              </CardTitle>
              <CardDescription>
                Últimas notificações enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historico && historico.length > 0 ? (
                <div className="space-y-3">
                  {historico.map((item: any) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${getTipoColor(item.tipo)}`}>
                          {item.tipo === "push" && <Bell className="h-5 w-5" />}
                          {item.tipo === "email" && <Mail className="h-5 w-5" />}
                          {item.tipo === "whatsapp" && <MessageSquare className="h-5 w-5" />}
                          {item.tipo === "sistema" && <Settings className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{item.titulo}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.tipo}
                            </Badge>
                            <span>•</span>
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          {item.sucessos}
                        </div>
                        {item.falhas > 0 && (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            {item.falhas}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação enviada ainda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Configurações */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configurações de Email
              </CardTitle>
              <CardDescription>
                Configure o provedor de email para envio de notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Provedor</Label>
                  <Select defaultValue={emailConfig?.provedor || "resend"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resend">Resend (Recomendado)</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="smtp">SMTP Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Resend oferece 100 emails/dia grátis
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input 
                    type="password"
                    placeholder="re_xxxxxxxxxxxx"
                    defaultValue={emailConfig?.apiKey || ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Email Remetente</Label>
                  <Input 
                    type="email"
                    placeholder="noreply@seucondominio.com"
                    defaultValue={emailConfig?.emailRemetente || ""}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Nome do Remetente</Label>
                  <Input 
                    placeholder="Condomínio Residencial"
                    defaultValue={emailConfig?.nomeRemetente || ""}
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked={emailConfig?.ativo || false} />
                    <Label>Ativar envio de emails</Label>
                  </div>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Configurações VAPID (Web Push) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações VAPID (Web Push)
                {pushConfig && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
                    Configurado
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Configure as chaves VAPID para envio de notificações push
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>O que são chaves VAPID?</strong><br/>
                    As chaves VAPID são necessárias para enviar notificações push de forma segura. 
                    Você pode gerar as suas chaves gratuitamente.
                  </p>
                  <a 
                    href="https://vapidkeys.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 underline mt-2 inline-block"
                  >
                    Gerar chaves VAPID →
                  </a>
                </div>
                
                <div className="space-y-2">
                  <Label>Chave Pública VAPID</Label>
                  <Input 
                    id="vapidPublicKey"
                    placeholder="BNnxWac2y..."
                    className="font-mono text-xs"
                    defaultValue={pushConfig?.vapidPublicKey || ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Chave Privada VAPID</Label>
                  <Input 
                    id="vapidPrivateKey"
                    type="password"
                    placeholder={pushConfig?.vapidPrivateKey ? "Chave salva (****...)" : "Sua chave privada..."}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ Mantenha a chave privada em segredo! {pushConfig?.vapidPrivateKey && "(Já salva no banco)"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Subject (Email de Contato)</Label>
                  <Input 
                    id="vapidSubject"
                    placeholder="mailto:admin@seucondominio.com"
                    defaultValue={pushConfig?.vapidSubject || ''}
                  />
                  <p className="text-xs text-gray-500">
                    Deve começar com "mailto:" ou "https://"
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="pushAtivo" 
                      defaultChecked={pushConfig?.ativo || false}
                    />
                    <Label htmlFor="pushAtivo">Ativar notificações push</Label>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600"
                    onClick={() => {
                      const publicKey = (document.getElementById('vapidPublicKey') as HTMLInputElement)?.value;
                      const privateKey = (document.getElementById('vapidPrivateKey') as HTMLInputElement)?.value;
                      const subject = (document.getElementById('vapidSubject') as HTMLInputElement)?.value;
                      const ativo = (document.getElementById('pushAtivo') as HTMLInputElement)?.checked;
                      
                      if (!publicKey || !subject) {
                        toast.error("Preencha a chave pública e o subject");
                        return;
                      }
                      
                      // Só exigir chave privada se não houver uma salva
                      if (!privateKey && !pushConfig?.vapidPrivateKey) {
                        toast.error("Preencha a chave privada");
                        return;
                      }
                      
                      if (!subject.startsWith('mailto:') && !subject.startsWith('https://')) {
                        toast.error("O Subject deve começar com 'mailto:' ou 'https://'");
                        return;
                      }
                      
                      savePushConfigMutation.mutate({
                        condominioId,
                        vapidPublicKey: publicKey,
                        vapidPrivateKey: privateKey || undefined, // Só enviar se preenchido
                        vapidSubject: subject,
                        ativo: ativo,
                      });
                    }}
                  >
                    {savePushConfigMutation.isPending ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                  <Button 
                    variant="outline"
                    disabled={isSendingTestPush || !pushEnabled || !pushConfig?.vapidPrivateKey}
                    onClick={() => {
                      if (!pushConfig?.vapidPublicKey || !pushConfig?.vapidPrivateKey || !pushConfig?.vapidSubject) {
                        toast.error("Salve as configurações VAPID primeiro");
                        return;
                      }
                      
                      setIsSendingTestPush(true);
                      sendTestPushMutation.mutate({
                        condominioId,
                        vapidPublicKey: pushConfig.vapidPublicKey,
                        vapidPrivateKey: pushConfig.vapidPrivateKey,
                        vapidSubject: pushConfig.vapidSubject,
                      });
                    }}
                  >
                    {isSendingTestPush ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Testar Push
                      </>
                    )}
                  </Button>
                </div>
                
                {!pushEnabled && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                    ⚠️ Ative as notificações push no seu navegador primeiro (na aba "Visão Geral")
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Templates de Notificação */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Templates de Notificação
                  </CardTitle>
                  <CardDescription>
                    Crie e reutilize mensagens frequentes para envio rápido
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {(!templates || templates.length === 0) && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => createDefaultsMutation.mutate({ condominioId })}
                      disabled={createDefaultsMutation.isPending}
                    >
                      {createDefaultsMutation.isPending ? "Criando..." : "Criar Templates Padrão"}
                    </Button>
                  )}
                  <Dialog open={showTemplateModal} onOpenChange={(open) => {
                    setShowTemplateModal(open);
                    if (!open) resetTemplateForm();
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="gap-1">
                        <Plus className="h-4 w-4" />
                        Novo Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTemplate ? "Editar Template" : "Novo Template"}
                        </DialogTitle>
                        <DialogDescription>
                          {editingTemplate ? "Atualize os dados do template" : "Crie um novo template de notificação"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Nome do Template *</Label>
                          <Input 
                            value={templateNome}
                            onChange={(e) => setTemplateNome(e.target.value)}
                            placeholder="Ex: Aviso de Assembleia"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <Select value={templateCategoria} onValueChange={setTemplateCategoria}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="assembleia">Assembleia</SelectItem>
                              <SelectItem value="manutencao">Manutenção</SelectItem>
                              <SelectItem value="vencimento">Vencimento</SelectItem>
                              <SelectItem value="aviso">Aviso</SelectItem>
                              <SelectItem value="evento">Evento</SelectItem>
                              <SelectItem value="custom">Personalizado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Título da Notificação *</Label>
                          <Input 
                            value={templateTitulo}
                            onChange={(e) => setTemplateTitulo(e.target.value)}
                            placeholder="Ex: 📅 Assembleia Geral"
                            maxLength={50}
                          />
                          <p className="text-xs text-gray-500">{templateTitulo.length}/50</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Mensagem *</Label>
                          <Textarea 
                            value={templateMensagem}
                            onChange={(e) => setTemplateMensagem(e.target.value)}
                            placeholder="Escreva a mensagem do template..."
                            rows={3}
                            maxLength={200}
                          />
                          <p className="text-xs text-gray-500">{templateMensagem.length}/200</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>URL de Destino (opcional)</Label>
                          <Input 
                            value={templateUrl}
                            onChange={(e) => setTemplateUrl(e.target.value)}
                            placeholder="/dashboard/avisos"
                          />
                        </div>
                        
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setShowTemplateModal(false);
                              resetTemplateForm();
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={handleSaveTemplate}
                            disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                          >
                            {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {templates && templates.length > 0 ? (
                <div className="grid gap-3">
                  {templates.map((template: any) => (
                    <div 
                      key={template.id} 
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{template.nome}</span>
                          <Badge className={getCategoriaColor(template.categoria)}>
                            {getCategoriaLabel(template.categoria)}
                          </Badge>
                          {template.usageCount > 0 && (
                            <span className="text-xs text-gray-500">
                              Usado {template.usageCount}x
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                          {template.titulo}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => useTemplate(template)}
                          title="Usar este template"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openEditTemplate(template)}
                          title="Editar template"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm("Tem certeza que deseja excluir este template?")) {
                              deleteTemplateMutation.mutate({ id: template.id });
                            }
                          }}
                          title="Excluir template"
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum template criado ainda.</p>
                  <p className="text-sm">Clique em "Criar Templates Padrão" para começar rapidamente.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default NotificacoesPage;
