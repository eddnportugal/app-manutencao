/**
 * Componente de Indicador de Status Offline
 * Mostra status de conexão e operações pendentes de sincronização
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff, Check, AlertCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { useOffline } from '@/hooks/useOffline';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export function OfflineIndicator({ className, showDetails = true }: OfflineIndicatorProps) {
  const {
    isOnline,
    pendingCount,
    isSyncing,
    lastSyncTime,
    syncAll,
    stats,
    refreshStats
  } = useOffline();

  const [isOpen, setIsOpen] = useState(false);

  // Atualizar estatísticas quando abrir o popover
  useEffect(() => {
    if (isOpen) {
      refreshStats();
    }
  }, [isOpen, refreshStats]);

  // Formatar última sincronização
  const formatLastSync = () => {
    if (!lastSyncTime) return 'Nunca sincronizado';
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `Há ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Há ${hours}h`;
    return lastSyncTime.toLocaleDateString('pt-BR');
  };

  // Determinar cor do indicador
  const getStatusColor = () => {
    if (!isOnline) return 'text-red-500';
    if (pendingCount > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Determinar ícone do indicador
  const StatusIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    if (!isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    if (pendingCount > 0) {
      return <CloudOff className="h-4 w-4" />;
    }
    return <Cloud className="h-4 w-4" />;
  };

  if (!showDetails) {
    // Versão compacta - apenas ícone
    return (
      <div className={cn('flex items-center gap-1', getStatusColor(), className)}>
        <StatusIcon />
        {pendingCount > 0 && (
          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
            {pendingCount}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn('gap-2 px-2', className)}
        >
          <span className={getStatusColor()}>
            <StatusIcon />
          </span>
          {!isOnline && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Offline
            </span>
          )}
          {pendingCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {pendingCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Status de Conexão */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isOnline 
                    ? 'Conectado à internet' 
                    : 'Trabalhando localmente'}
                </p>
              </div>
            </div>
            {isOnline && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </div>

          {/* Operações Pendentes */}
          {pendingCount > 0 && (
            <div className="rounded-lg border p-3 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">
                  {pendingCount} operação(ões) pendente(s)
                </span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                {isOnline 
                  ? 'Clique para sincronizar agora'
                  : 'Será sincronizado quando voltar online'}
              </p>
              {isOnline && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={syncAll}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sincronizar Agora
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Progresso de Sincronização */}
          {isSyncing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Sincronizando...</span>
                <span className="text-muted-foreground">
                  {pendingCount} restante(s)
                </span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
          )}

          {/* Última Sincronização */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Última sincronização:</span>
            <span>{formatLastSync()}</span>
          </div>

          {/* Estatísticas de Armazenamento */}
          {stats && (
            <div className="border-t pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Dados Offline</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vistorias:</span>
                  <span>{stats.stores?.vistorias || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Manutenções:</span>
                  <span>{stats.stores?.manutencoes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ocorrências:</span>
                  <span>{stats.stores?.ocorrencias || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Checklists:</span>
                  <span>{stats.stores?.checklists || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ordens:</span>
                  <span>{stats.stores?.ordensServico || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vencimentos:</span>
                  <span>{stats.stores?.vencimentos || 0}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t flex justify-between text-sm">
                <span className="font-medium">Total:</span>
                <span className="font-medium">{stats.totalItems} itens</span>
              </div>
            </div>
          )}

          {/* Modo Offline Info */}
          {!isOnline && (
            <div className="rounded-lg border p-3 bg-blue-50 dark:bg-blue-900/20">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Modo Offline Ativo:</strong> Você pode continuar trabalhando normalmente. 
                Todas as alterações serão salvas localmente e sincronizadas automaticamente 
                quando a conexão for restaurada.
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Banner de status offline para exibir no topo da página
 */
export function OfflineBanner() {
  const { isOnline, pendingCount, isSyncing, syncAll } = useOffline();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className={cn(
      'px-4 py-2 text-sm flex items-center justify-between',
      !isOnline 
        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
    )}>
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Você está offline. As alterações serão sincronizadas quando voltar online.</span>
          </>
        ) : (
          <>
            <CloudOff className="h-4 w-4" />
            <span>{pendingCount} operação(ões) aguardando sincronização.</span>
          </>
        )}
      </div>
      {isOnline && pendingCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={syncAll}
          disabled={isSyncing}
          className="h-7"
        >
          {isSyncing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            'Sincronizar'
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * Indicador compacto para uso em listas
 */
export function OfflineItemBadge({ isOffline }: { isOffline?: boolean }) {
  if (!isOffline) return null;

  return (
    <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
      <CloudOff className="h-3 w-3 mr-1" />
      Offline
    </Badge>
  );
}

export default OfflineIndicator;
