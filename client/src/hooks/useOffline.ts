/**
 * Hooks para funcionalidades offline
 * Gerencia status de conexão, sincronização e armazenamento local
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import SyncSounds from '@/lib/notificationSounds';
import {
  initOfflineDB,
  saveItem,
  getItem,
  getAllItems,
  getItemsByIndex,
  deleteItem,
  addToSyncQueue,
  getPendingSyncOperations,
  updateSyncOperationStatus,
  clearCompletedSyncOperations,
  cacheData,
  getCachedData,
  getOfflineStats,
  StoreName,
  SyncOperation
} from '@/lib/offlineStorage';

/**
 * Hook para monitorar status de conexão online/offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Tocar som de conexão restaurada
        SyncSounds.online();
        // Trigger sync quando voltar online
        window.dispatchEvent(new CustomEvent('app:back-online'));
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      // Tocar som de conexão perdida
      SyncSounds.offline();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listener para mensagens do Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SYNC_REQUIRED') {
          window.dispatchEvent(new CustomEvent('app:sync-required'));
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
}

/**
 * Hook para gerenciar dados offline de um store específico
 */
export function useOfflineData<T extends { id?: number | string }>(storeName: StoreName) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useOnlineStatus();
  

  // Carregar dados do IndexedDB
  const loadFromOffline = useCallback(async () => {
    try {
      setIsLoading(true);
      await initOfflineDB();
      const items = await getAllItems<T>(storeName);
      setData(items);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error(`Erro ao carregar ${storeName} offline:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [storeName]);

  // Salvar item offline
  const saveOffline = useCallback(async (item: T): Promise<T> => {
    try {
      const savedItem = await saveItem(storeName, item);
      
      // Adicionar à fila de sincronização se for novo item
      if (!item.id || String(item.id).startsWith('offline_')) {
        await addToSyncQueue({
          type: 'create',
          storeName,
          data: savedItem,
          endpoint: `/api/trpc/${storeName}.create`,
          method: 'POST'
        });
      } else {
        await addToSyncQueue({
          type: 'update',
          storeName,
          data: savedItem,
          endpoint: `/api/trpc/${storeName}.update`,
          method: 'PUT'
        });
      }

      // Atualizar estado local
      setData(prev => {
        const index = prev.findIndex(i => i.id === savedItem.id);
        if (index >= 0) {
          const newData = [...prev];
          newData[index] = savedItem;
          return newData;
        }
        return [...prev, savedItem];
      });

      if (!isOnline) {
        // Tocar som de operação pendente
        SyncSounds.pending();
        toast.info('Salvo offline - Os dados serão sincronizados quando você voltar online.');
      }

      return savedItem;
    } catch (err) {
      console.error(`Erro ao salvar ${storeName} offline:`, err);
      throw err;
    }
  }, [storeName, isOnline, toast]);

  // Remover item offline
  const removeOffline = useCallback(async (id: string | number): Promise<void> => {
    try {
      await deleteItem(storeName, id);
      
      // Adicionar à fila de sincronização
      await addToSyncQueue({
        type: 'delete',
        storeName,
        data: { id },
        endpoint: `/api/trpc/${storeName}.delete`,
        method: 'DELETE'
      });

      // Atualizar estado local
      setData(prev => prev.filter(i => i.id !== id));

      if (!isOnline) {
        toast.info('Removido offline - A remoção será sincronizada quando você voltar online.');
      }
    } catch (err) {
      console.error(`Erro ao remover ${storeName} offline:`, err);
      throw err;
    }
  }, [storeName, isOnline, toast]);

  // Buscar por índice
  const findByIndex = useCallback(async (indexName: string, value: any): Promise<T[]> => {
    try {
      return await getItemsByIndex<T>(storeName, indexName, value);
    } catch (err) {
      console.error(`Erro ao buscar ${storeName} por ${indexName}:`, err);
      return [];
    }
  }, [storeName]);

  // Carregar dados iniciais
  useEffect(() => {
    loadFromOffline();
  }, [loadFromOffline]);

  return {
    data,
    isLoading,
    error,
    saveOffline,
    removeOffline,
    findByIndex,
    refresh: loadFromOffline
  };
}

/**
 * Hook para gerenciar a fila de sincronização
 */
export function useSyncQueue() {
  const [pendingOperations, setPendingOperations] = useState<SyncOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { isOnline } = useOnlineStatus();
  
  const syncInProgress = useRef(false);

  // Carregar operações pendentes
  const loadPendingOperations = useCallback(async () => {
    try {
      const ops = await getPendingSyncOperations();
      setPendingOperations(ops);
    } catch (err) {
      console.error('Erro ao carregar operações pendentes:', err);
    }
  }, []);

  // Sincronizar uma operação
  const syncOperation = useCallback(async (operation: SyncOperation): Promise<boolean> => {
    try {
      await updateSyncOperationStatus(operation.id, 'syncing');

      const response = await fetch(operation.endpoint, {
        method: operation.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(operation.data),
        credentials: 'include'
      });

      if (response.ok) {
        await updateSyncOperationStatus(operation.id, 'completed');
        return true;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('Erro ao sincronizar operação:', err);
      const newRetryCount = operation.retryCount + 1;
      
      if (newRetryCount >= 3) {
        await updateSyncOperationStatus(operation.id, 'failed', newRetryCount);
      } else {
        await updateSyncOperationStatus(operation.id, 'pending', newRetryCount);
      }
      
      return false;
    }
  }, []);

  // Sincronizar todas as operações pendentes
  const syncAll = useCallback(async () => {
    if (syncInProgress.current || !isOnline) return;
    
    syncInProgress.current = true;
    setIsSyncing(true);

    try {
      const operations = await getPendingSyncOperations();
      let successCount = 0;
      let failCount = 0;

      for (const op of operations) {
        const success = await syncOperation(op);
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      // Limpar operações concluídas
      await clearCompletedSyncOperations();
      
      // Recarregar lista
      await loadPendingOperations();
      
      setLastSyncTime(new Date());

      if (successCount > 0) {
        // Tocar som de sucesso
        SyncSounds.success();
        toast.success(`Sincronização concluída - ${successCount} operação(ões) sincronizada(s) com sucesso.`);
      }

      if (failCount > 0) {
        // Tocar som de erro
        SyncSounds.error();
        toast.error(`Algumas operações falharam - ${failCount} operação(ões) não puderam ser sincronizadas.`);
      }
    } catch (err) {
      console.error('Erro na sincronização:', err);
      toast.error('Erro na sincronização - Não foi possível sincronizar os dados.');
    } finally {
      setIsSyncing(false);
      syncInProgress.current = false;
    }
  }, [isOnline, syncOperation, loadPendingOperations, toast]);

  // Carregar operações ao montar
  useEffect(() => {
    loadPendingOperations();
  }, [loadPendingOperations]);

  // Sincronizar automaticamente quando voltar online
  useEffect(() => {
    const handleBackOnline = () => {
      syncAll();
    };

    const handleSyncRequired = () => {
      syncAll();
    };

    window.addEventListener('app:back-online', handleBackOnline);
    window.addEventListener('app:sync-required', handleSyncRequired);

    return () => {
      window.removeEventListener('app:back-online', handleBackOnline);
      window.removeEventListener('app:sync-required', handleSyncRequired);
    };
  }, [syncAll]);

  return {
    pendingOperations,
    pendingCount: pendingOperations.length,
    isSyncing,
    lastSyncTime,
    syncAll,
    refresh: loadPendingOperations
  };
}

/**
 * Hook para cache de dados com expiração
 */
export function useOfflineCache<T>(key: string, ttlMinutes: number = 60) {
  const [cachedValue, setCachedValue] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar do cache
  const loadFromCache = useCallback(async () => {
    try {
      setIsLoading(true);
      const value = await getCachedData<T>(key);
      setCachedValue(value);
    } catch (err) {
      console.error('Erro ao carregar cache:', err);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  // Salvar no cache
  const saveToCache = useCallback(async (value: T) => {
    try {
      await cacheData(key, value, ttlMinutes);
      setCachedValue(value);
    } catch (err) {
      console.error('Erro ao salvar cache:', err);
    }
  }, [key, ttlMinutes]);

  useEffect(() => {
    loadFromCache();
  }, [loadFromCache]);

  return {
    cachedValue,
    isLoading,
    saveToCache,
    refresh: loadFromCache
  };
}

/**
 * Hook para estatísticas do armazenamento offline
 */
export function useOfflineStats() {
  const [stats, setStats] = useState<{
    totalItems: number;
    pendingSync: number;
    stores: Record<string, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const offlineStats = await getOfflineStats();
      setStats(offlineStats);
    } catch (err) {
      console.error('Erro ao carregar estatísticas offline:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, isLoading, refresh: loadStats };
}

/**
 * Hook combinado para funcionalidades offline completas
 */
export function useOffline() {
  const onlineStatus = useOnlineStatus();
  const syncQueue = useSyncQueue();
  const offlineStats = useOfflineStats();

  return {
    ...onlineStatus,
    ...syncQueue,
    stats: offlineStats.stats,
    refreshStats: offlineStats.refresh
  };
}
