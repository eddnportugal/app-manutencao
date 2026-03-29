import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/sonner";
import { Bell, MessageCircle, X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface NotificationAlertProps {
  condominioId: number | null;
  enabled?: boolean;
}

export function NotificationAlert({ condominioId, enabled = true }: NotificationAlertProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCheckedIds, setLastCheckedIds] = useState<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInteractedRef = useRef(false);

  // Query para buscar respostas não lidas
  const { data: unreadResponses, refetch } = trpc.respostasInfracao.getUnread.useQuery(
    { condominioId: condominioId! },
    { 
      enabled: enabled && !!condominioId,
      refetchInterval: 30000, // Verificar a cada 30 segundos
      refetchIntervalInBackground: true,
    }
  );

  // Mutation para marcar como lida
  const markAsReadMutation = trpc.respostasInfracao.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Criar elemento de áudio para o som de notificação
  useEffect(() => {
    // Criar um som de notificação usando Web Audio API
    const createNotificationSound = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // Nota A5
      oscillator.frequency.setValueAtTime(1046.5, audioContext.currentTime + 0.1); // Nota C6
      oscillator.frequency.setValueAtTime(1318.5, audioContext.currentTime + 0.2); // Nota E6
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    // Guardar referência para tocar depois
    (window as any).playNotificationSound = createNotificationSound;
  }, []);

  // Função para tocar o som
  const playSound = useCallback(() => {
    if (!soundEnabled || !hasInteractedRef.current) return;
    
    try {
      (window as any).playNotificationSound?.();
    } catch (error) {
      console.log("Erro ao tocar som:", error);
    }
  }, [soundEnabled]);

  // Detectar interação do utilizador para permitir áudio
  useEffect(() => {
    const handleInteraction = () => {
      hasInteractedRef.current = true;
      // Remover listeners após primeira interação
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Verificar novas respostas e mostrar alerta
  useEffect(() => {
    if (!unreadResponses || unreadResponses.length === 0) return;

    // Encontrar novas respostas que ainda não foram alertadas
    const newResponses = unreadResponses.filter(
      (r) => !lastCheckedIds.has(r.id)
    );

    if (newResponses.length > 0) {
      // Tocar som
      playSound();

      // Mostrar toast para cada nova resposta (máximo 3)
      newResponses.slice(0, 3).forEach((resposta, index) => {
        setTimeout(() => {
          toast.custom(
            (t) => (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-md">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Nova resposta de usuário
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {resposta.autorNome} respondeu à notificação
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
                      "{resposta.mensagem}"
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                      <Link href={`/dashboard/historico-infracoes`} className="w-full sm:w-auto">
                        <Button 
                          size="sm" 
                          variant="default"
                          className="h-7 text-xs w-full"
                          onClick={() => {
                            markAsReadMutation.mutate({ id: resposta.id });
                            toast.dismiss(t);
                          }}
                        >
                          Ver detalhes
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-7 text-xs w-full sm:w-auto"
                        onClick={() => {
                          markAsReadMutation.mutate({ id: resposta.id });
                          toast.dismiss(t);
                        }}
                      >
                        Marcar como lida
                      </Button>
                    </div>
                  </div>
                  <button
                    onClick={() => toast.dismiss(t)}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ),
            {
              duration: 10000, // 10 segundos
              position: "top-right",
            }
          );
        }, index * 500); // Delay entre toasts
      });

      // Atualizar IDs verificados
      setLastCheckedIds((prev) => {
        const newSet = new Set(prev);
        unreadResponses.forEach((r) => newSet.add(r.id));
        return newSet;
      });
    }
  }, [unreadResponses, lastCheckedIds, playSound, markAsReadMutation]);

  // Contador de não lidas
  const unreadCount = unreadResponses?.length || 0;

  if (!enabled || !condominioId) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Botão de toggle de som */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 relative"
        onClick={() => setSoundEnabled(!soundEnabled)}
        title={soundEnabled ? "Desativar som" : "Ativar som"}
      >
        {soundEnabled ? (
          <Volume2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        ) : (
          <VolumeX className="h-4 w-4 text-gray-400" />
        )}
      </Button>

      {/* Indicador de novas respostas */}
      {unreadCount > 0 && (
        <Link href="/dashboard/historico-infracoes">
          <Button
            variant="ghost"
            size="sm"
            className="relative h-8 px-2 text-xs gap-1 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
          >
            <Bell className="h-4 w-4" />
            <span>{unreadCount} nova{unreadCount > 1 ? 's' : ''} resposta{unreadCount > 1 ? 's' : ''}</span>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </Button>
        </Link>
      )}
    </div>
  );
}

export default NotificationAlert;
