import { useState, useEffect } from "react";
import { Bell, BellOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  getSubscription,
  registerServiceWorker,
} from "@/lib/pushNotifications";

interface PushNotificationPromptProps {
  userId?: number;
  condominioId?: number;
}

export function PushNotificationPrompt({ userId, condominioId }: PushNotificationPromptProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      // Verificar suporte
      const supported = isPushSupported();
      setIsSupported(supported);

      if (supported) {
        // Verificar permissão atual
        const currentPermission = getNotificationPermission();
        setPermission(currentPermission);

        // Verificar se já está inscrito
        const subscription = await getSubscription();
        setIsSubscribed(!!subscription);

        // Registrar service worker
        await registerServiceWorker();
      }
    };

    checkStatus();
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const subscription = await subscribeToPush();
      if (subscription) {
        setIsSubscribed(true);
        setPermission("granted");
        localStorage.setItem('push-subscribed', 'true');
        toast.success("Notificações ativadas!", {
          description: "Você receberá alertas de vencimentos e novas OS.",
        });
      } else {
        toast.error("Não foi possível ativar as notificações", {
          description: "Verifique as permissões do navegador.",
        });
      }
    } catch (error) {
      console.error("Erro ao ativar notificações:", error);
      toast.error("Erro ao ativar notificações");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    try {
      const success = await unsubscribeFromPush();
      // Sempre marcar como desinscrito, mesmo que não tivesse subscrição ativa
      setIsSubscribed(false);
      localStorage.removeItem('push-subscribed');
      toast.success("Notificações desativadas");
    } catch (error) {
      console.error("Erro ao desativar notificações:", error);
      toast.error("Erro ao desativar notificações");
    } finally {
      setIsLoading(false);
    }
  };

  // Não mostrar se não for suportado
  if (!isSupported) {
    return null;
  }

  return (
    <Card className={`mb-6 border-l-4 ${isSubscribed ? "bg-green-50 border-green-500 border-l-green-500" : "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 border-l-orange-500"}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full shrink-0 ${isSubscribed ? "bg-green-100" : "bg-orange-100"}`}>
            {isSubscribed ? <Bell className="w-6 h-6 text-green-600" /> : <BellOff className="w-6 h-6 text-orange-600" />}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {isSubscribed ? "Notificações Ativas" : "Ativar Notificações"}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {isSubscribed 
                ? "Você está recebendo alertas de vencimentos, novas ordens de serviço e atualizações importantes."
                : "Receba alertas de vencimentos, novas ordens de serviço e atualizações importantes diretamente no seu dispositivo."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
              {!isSubscribed && (
                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
                  size="sm"
                >
                  {isLoading ? (
                    <span className="animate-spin mr-2">⏳</span>
                  ) : (
                    <Bell className="w-4 h-4 mr-2" />
                  )}
                  Ativar Notificações
                </Button>
              )}
              
              <Button
                variant={isSubscribed ? "destructive" : "ghost"}
                size="sm"
                onClick={handleUnsubscribe}
                disabled={isLoading}
                className={(!isSubscribed ? "text-gray-500 hover:text-gray-700" : "") + " w-full sm:w-auto"}
              >
                Desativar Notificações
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para gerenciar notificações nas configurações
export function NotificationSettings({ userId, condominioId }: PushNotificationPromptProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const supported = isPushSupported();
      setIsSupported(supported);

      if (supported) {
        setPermission(getNotificationPermission());
        const subscription = await getSubscription();
        setIsSubscribed(!!subscription);
      }
    };

    checkStatus();
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      if (isSubscribed) {
        const success = await unsubscribeFromPush();
        if (success) {
          setIsSubscribed(false);
          localStorage.removeItem('push-subscribed');
          toast.success("Notificações desativadas");
        }
      } else {
        const subscription = await subscribeToPush();
        if (subscription) {
          setIsSubscribed(true);
          setPermission("granted");
          localStorage.setItem('push-subscribed', 'true');
          toast.success("Notificações ativadas!");
        }
      }
    } catch (error) {
      console.error("Erro ao alterar notificações:", error);
      toast.error("Erro ao alterar configuração de notificações");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-700">Notificações Push</p>
            <p className="text-sm text-gray-500">Não suportado neste navegador</p>
          </div>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-red-400" />
          <div>
            <p className="font-medium text-gray-700">Notificações Push</p>
            <p className="text-sm text-red-600">
              Bloqueado - Altere nas configurações do navegador
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        {isSubscribed ? (
          <Bell className="w-5 h-5 text-orange-500" />
        ) : (
          <BellOff className="w-5 h-5 text-gray-400" />
        )}
        <div>
          <p className="font-medium text-gray-700">Notificações Push</p>
          <p className="text-sm text-gray-500">
            {isSubscribed
              ? "Ativado - Você receberá alertas"
              : "Desativado - Ative para receber alertas"}
          </p>
        </div>
      </div>
      <Button
        onClick={handleToggle}
        disabled={isLoading}
        variant={isSubscribed ? "outline" : "default"}
        className={isSubscribed ? "" : "bg-orange-500 hover:bg-orange-600"}
      >
        {isLoading ? (
          <span className="animate-spin">⏳</span>
        ) : isSubscribed ? (
          "Desativar"
        ) : (
          "Ativar"
        )}
      </Button>
    </div>
  );
}
