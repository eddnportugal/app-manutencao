import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, X, Megaphone, Calendar, Vote, ShoppingBag, Car, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const tipoIcons: Record<string, React.ReactNode> = {
  aviso: <Megaphone className="h-4 w-4" />,
  evento: <Calendar className="h-4 w-4" />,
  votacao: <Vote className="h-4 w-4" />,
  classificado: <ShoppingBag className="h-4 w-4" />,
  carona: <Car className="h-4 w-4" />,
  geral: <Info className="h-4 w-4" />,
};

const tipoColors: Record<string, string> = {
  aviso: "bg-amber-100 text-amber-700",
  evento: "bg-blue-100 text-blue-700",
  votacao: "bg-purple-100 text-purple-700",
  classificado: "bg-green-100 text-green-700",
  carona: "bg-cyan-100 text-cyan-700",
  geral: "bg-gray-100 text-gray-700",
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const utils = trpc.useUtils();

  const { data: notifications = [], isLoading } = trpc.notificacao.list.useQuery(
    { limit: 20 },
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );

  const { data: unreadCount = 0 } = trpc.notificacao.countUnread.useQuery(
    undefined,
    { refetchInterval: 30000 }
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

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (!notification.lida) {
      markAsReadMutation.mutate({ id: notification.id });
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notificações</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-50" />
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 cursor-pointer transition-colors relative group",
                    !notification.lida && "bg-primary/5"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        tipoColors[notification.tipo] || tipoColors.geral
                      )}
                    >
                      {tipoIcons[notification.tipo] || tipoIcons.geral}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm line-clamp-1",
                          !notification.lida && "font-semibold"
                        )}>
                          {notification.titulo}
                        </p>
                        {!notification.lida && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                        )}
                      </div>
                      {notification.mensagem && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.mensagem}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions on hover */}
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {!notification.lida && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsReadMutation.mutate({ id: notification.id });
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate({ id: notification.id });
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => deleteAllReadMutation.mutate()}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Limpar lidas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = "/dashboard/notificacoes";
                }}
              >
                Ver todas
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
