import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  Megaphone,
  Calendar,
  Vote,
  ShoppingBag,
  Car,
  Info,
  ArrowLeft,
  Filter,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

const tipoIcons: Record<string, React.ReactNode> = {
  aviso: <Megaphone className="h-5 w-5" />,
  evento: <Calendar className="h-5 w-5" />,
  votacao: <Vote className="h-5 w-5" />,
  classificado: <ShoppingBag className="h-5 w-5" />,
  carona: <Car className="h-5 w-5" />,
  geral: <Info className="h-5 w-5" />,
};

const tipoColors: Record<string, string> = {
  aviso: "bg-amber-100 text-amber-700",
  evento: "bg-blue-100 text-blue-700",
  votacao: "bg-purple-100 text-purple-700",
  classificado: "bg-green-100 text-green-700",
  carona: "bg-cyan-100 text-cyan-700",
  geral: "bg-gray-100 text-gray-700",
};

const tipoLabels: Record<string, string> = {
  aviso: "Aviso",
  evento: "Evento",
  votacao: "Votação",
  classificado: "Classificado",
  carona: "Carona",
  geral: "Geral",
};

export default function Notificacoes() {
  const { user, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("todas");
  const [filterTipo, setFilterTipo] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data: notifications = [], isLoading } = trpc.notificacao.list.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated }
  );

  const { data: unreadCount = 0 } = trpc.notificacao.countUnread.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const markAsReadMutation = trpc.notificacao.markAsRead.useMutation({
    onSuccess: () => {
      utils.notificacao.list.invalidate();
      utils.notificacao.countUnread.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notificacao.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notificacao.list.invalidate();
      utils.notificacao.countUnread.invalidate();
    },
  });

  const deleteMutation = trpc.notificacao.delete.useMutation({
    onSuccess: () => {
      utils.notificacao.list.invalidate();
      utils.notificacao.countUnread.invalidate();
    },
  });

  const deleteAllReadMutation = trpc.notificacao.deleteAllRead.useMutation({
    onSuccess: () => {
      utils.notificacao.list.invalidate();
      utils.notificacao.countUnread.invalidate();
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">Faça login para ver suas notificações</p>
            <Link href="/dashboard">
              <Button>Ir para o Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter notifications based on tab and tipo
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "nao-lidas" && n.lida) return false;
    if (activeTab === "lidas" && !n.lida) return false;
    if (filterTipo && n.tipo !== filterTipo) return false;
    return true;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = format(new Date(notification.createdAt), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as Record<string, typeof notifications>);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
      return "Hoje";
    }
    if (format(date, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd")) {
      return "Ontem";
    }
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.lida) {
      markAsReadMutation.mutate({ id: notification.id });
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-serif font-bold">Notificações</h1>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} não lidas` : "Todas lidas"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Marcar todas como lidas
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteAllReadMutation.mutate()}
                disabled={deleteAllReadMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar lidas
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Status</p>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="todas">Todas</TabsTrigger>
                      <TabsTrigger value="nao-lidas">Não lidas</TabsTrigger>
                      <TabsTrigger value="lidas">Lidas</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-2">Tipo</p>
                  <div className="space-y-1">
                    <Button
                      variant={filterTipo === null ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setFilterTipo(null)}
                    >
                      Todos os tipos
                    </Button>
                    {Object.entries(tipoLabels).map(([key, label]) => (
                      <Button
                        key={key}
                        variant={filterTipo === key ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setFilterTipo(key)}
                      >
                        <span className={cn("w-6 h-6 rounded-full flex items-center justify-center mr-2", tipoColors[key])}>
                          {tipoIcons[key]}
                        </span>
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{notifications.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Não lidas</span>
                    <span className="font-medium text-primary">{unreadCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lidas</span>
                    <span className="font-medium">{notifications.length - unreadCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - Notifications List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <Card>
                <CardContent className="pt-6 flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
              </Card>
            ) : filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center h-64 flex flex-col items-center justify-center">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {activeTab === "nao-lidas"
                      ? "Nenhuma notificação não lida"
                      : activeTab === "lidas"
                      ? "Nenhuma notificação lida"
                      : "Nenhuma notificação"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedNotifications)
                  .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                  .map(([date, items]) => (
                    <div key={date}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">
                        {formatDateHeader(date)}
                      </h3>
                      <Card>
                        <CardContent className="p-0 divide-y">
                          {items.map((notification) => (
                            <div
                              key={notification.id}
                              className={cn(
                                "p-4 hover:bg-muted/50 cursor-pointer transition-colors relative group",
                                !notification.lida && "bg-primary/5"
                              )}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex gap-4">
                                <div
                                  className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                                    tipoColors[notification.tipo] || tipoColors.geral
                                  )}
                                >
                                  {tipoIcons[notification.tipo] || tipoIcons.geral}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p
                                        className={cn(
                                          "text-sm",
                                          !notification.lida && "font-semibold"
                                        )}
                                      >
                                        {notification.titulo}
                                      </p>
                                      <span className="text-xs text-muted-foreground">
                                        {tipoLabels[notification.tipo] || "Geral"}
                                      </span>
                                    </div>
                                    {!notification.lida && (
                                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                                    )}
                                  </div>
                                  {notification.mensagem && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {notification.mensagem}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                      addSuffix: true,
                                      locale: ptBR,
                                    })}
                                  </p>
                                </div>
                              </div>

                              {/* Actions on hover */}
                              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                {!notification.lida && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      markAsReadMutation.mutate({ id: notification.id });
                                    }}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMutation.mutate({ id: notification.id });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
