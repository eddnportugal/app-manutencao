/**
 * Sistema de Armazenamento Offline com IndexedDB
 * Permite que o App Manutenção funcione completamente offline
 */

const DB_NAME = 'AppManutencaoOffline';
const DB_VERSION = 1;

// Tipos de stores disponíveis
export type StoreName = 
  | 'vistorias'
  | 'manutencoes'
  | 'ocorrencias'
  | 'checklists'
  | 'antesDepois'
  | 'ordensServico'
  | 'vencimentos'
  | 'timeline'
  | 'organizacoes'
  | 'tarefasSimples'
  | 'syncQueue'
  | 'cachedData';

// Interface para operações pendentes de sincronização
export interface SyncOperation {
  id: string;
  timestamp: number;
  type: 'create' | 'update' | 'delete';
  storeName: StoreName;
  data: any;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

// Interface para dados em cache
export interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt: number;
}

let db: IDBDatabase | null = null;

/**
 * Inicializa o banco de dados IndexedDB
 */
export async function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Erro ao abrir IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('IndexedDB inicializado com sucesso');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Store para Vistorias
      if (!database.objectStoreNames.contains('vistorias')) {
        const store = database.createObjectStore('vistorias', { keyPath: 'id' });
        store.createIndex('organizacaoId', 'organizacaoId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('offlineId', 'offlineId', { unique: false });
      }

      // Store para Manutenções
      if (!database.objectStoreNames.contains('manutencoes')) {
        const store = database.createObjectStore('manutencoes', { keyPath: 'id' });
        store.createIndex('organizacaoId', 'organizacaoId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('tipo', 'tipo', { unique: false });
        store.createIndex('offlineId', 'offlineId', { unique: false });
      }

      // Store para Ocorrências
      if (!database.objectStoreNames.contains('ocorrencias')) {
        const store = database.createObjectStore('ocorrencias', { keyPath: 'id' });
        store.createIndex('organizacaoId', 'organizacaoId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('offlineId', 'offlineId', { unique: false });
      }

      // Store para Checklists
      if (!database.objectStoreNames.contains('checklists')) {
        const store = database.createObjectStore('checklists', { keyPath: 'id' });
        store.createIndex('organizacaoId', 'organizacaoId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('offlineId', 'offlineId', { unique: false });
      }

      // Store para Antes e Depois
      if (!database.objectStoreNames.contains('antesDepois')) {
        const store = database.createObjectStore('antesDepois', { keyPath: 'id' });
        store.createIndex('organizacaoId', 'organizacaoId', { unique: false });
        store.createIndex('offlineId', 'offlineId', { unique: false });
      }

      // Store para Ordens de Serviço
      if (!database.objectStoreNames.contains('ordensServico')) {
        const store = database.createObjectStore('ordensServico', { keyPath: 'id' });
        store.createIndex('organizacaoId', 'organizacaoId', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('prioridade', 'prioridade', { unique: false });
        store.createIndex('offlineId', 'offlineId', { unique: false });
      }

      // Store para Vencimentos
      if (!database.objectStoreNames.contains('vencimentos')) {
        const store = database.createObjectStore('vencimentos', { keyPath: 'id' });
        store.createIndex('organizacaoId', 'organizacaoId', { unique: false });
        store.createIndex('tipo', 'tipo', { unique: false });
        store.createIndex('dataVencimento', 'dataVencimento', { unique: false });
        store.createIndex('offlineId', 'offlineId', { unique: false });
      }

      // Store para Timeline
      if (!database.objectStoreNames.contains('timeline')) {
        const store = database.createObjectStore('timeline', { keyPath: 'id' });
        store.createIndex('organizacaoId', 'organizacaoId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('offlineId', 'offlineId', { unique: false });
      }

      // Store para Organizações
      if (!database.objectStoreNames.contains('organizacoes')) {
        const store = database.createObjectStore('organizacoes', { keyPath: 'id' });
        store.createIndex('userId', 'userId', { unique: false });
      }

      // Store para Tarefas Simples (Funções Rápidas)
      if (!database.objectStoreNames.contains('tarefasSimples')) {
        const store = database.createObjectStore('tarefasSimples', { keyPath: 'id' });
        store.createIndex('organizacaoId', 'organizacaoId', { unique: false });
        store.createIndex('tipo', 'tipo', { unique: false });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('offlineId', 'offlineId', { unique: false });
      }

      // Store para Fila de Sincronização
      if (!database.objectStoreNames.contains('syncQueue')) {
        const store = database.createObjectStore('syncQueue', { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('storeName', 'storeName', { unique: false });
      }

      // Store para Cache de Dados
      if (!database.objectStoreNames.contains('cachedData')) {
        const store = database.createObjectStore('cachedData', { keyPath: 'key' });
        store.createIndex('expiresAt', 'expiresAt', { unique: false });
      }

      console.log('Stores do IndexedDB criados com sucesso');
    };
  });
}

/**
 * Obtém uma transação para um store específico
 */
function getTransaction(storeName: StoreName, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
  if (!db) {
    throw new Error('IndexedDB não inicializado. Chame initOfflineDB() primeiro.');
  }
  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

/**
 * Gera um ID único para operações offline
 */
export function generateOfflineId(): string {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Salva um item no store
 */
export async function saveItem<T extends { id?: number | string }>(
  storeName: StoreName,
  item: T
): Promise<T> {
  await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const store = getTransaction(storeName, 'readwrite');
    
    // Se não tem ID, gera um ID offline
    const itemToSave = {
      ...item,
      id: item.id || generateOfflineId(),
      offlineId: item.id ? undefined : generateOfflineId(),
      updatedAt: Date.now(),
      isOffline: true
    };

    const request = store.put(itemToSave);

    request.onsuccess = () => {
      console.log(`Item salvo em ${storeName}:`, itemToSave.id);
      resolve(itemToSave as T);
    };

    request.onerror = () => {
      console.error(`Erro ao salvar em ${storeName}:`, request.error);
      reject(request.error);
    };
  });
}

/**
 * Obtém um item por ID
 */
export async function getItem<T>(storeName: StoreName, id: string | number): Promise<T | undefined> {
  await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const store = getTransaction(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result as T | undefined);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Obtém todos os itens de um store
 */
export async function getAllItems<T>(storeName: StoreName): Promise<T[]> {
  await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const store = getTransaction(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Obtém itens por índice
 */
export async function getItemsByIndex<T>(
  storeName: StoreName,
  indexName: string,
  value: any
): Promise<T[]> {
  await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const store = getTransaction(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => {
      resolve(request.result as T[]);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Remove um item por ID
 */
export async function deleteItem(storeName: StoreName, id: string | number): Promise<void> {
  await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const store = getTransaction(storeName, 'readwrite');
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log(`Item removido de ${storeName}:`, id);
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Limpa todos os itens de um store
 */
export async function clearStore(storeName: StoreName): Promise<void> {
  await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const store = getTransaction(storeName, 'readwrite');
    const request = store.clear();

    request.onsuccess = () => {
      console.log(`Store ${storeName} limpo`);
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Adiciona uma operação à fila de sincronização
 */
export async function addToSyncQueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<SyncOperation> {
  const syncOp: SyncOperation = {
    ...operation,
    id: generateOfflineId(),
    timestamp: Date.now(),
    retryCount: 0,
    status: 'pending'
  };

  await saveItem('syncQueue', syncOp);
  return syncOp;
}

/**
 * Obtém todas as operações pendentes de sincronização
 */
export async function getPendingSyncOperations(): Promise<SyncOperation[]> {
  const allOps = await getAllItems<SyncOperation>('syncQueue');
  return allOps.filter(op => op.status === 'pending' || op.status === 'failed');
}

/**
 * Atualiza o status de uma operação de sincronização
 */
export async function updateSyncOperationStatus(
  id: string,
  status: SyncOperation['status'],
  retryCount?: number
): Promise<void> {
  const op = await getItem<SyncOperation>('syncQueue', id);
  if (op) {
    await saveItem('syncQueue', {
      ...op,
      status,
      retryCount: retryCount ?? op.retryCount
    });
  }
}

/**
 * Remove operações concluídas da fila
 */
export async function clearCompletedSyncOperations(): Promise<void> {
  const allOps = await getAllItems<SyncOperation>('syncQueue');
  const completedOps = allOps.filter(op => op.status === 'completed');
  
  for (const op of completedOps) {
    await deleteItem('syncQueue', op.id);
  }
}

/**
 * Salva dados em cache com expiração
 */
export async function cacheData(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
  await initOfflineDB();
  
  return new Promise((resolve, reject) => {
    const store = getTransaction('cachedData', 'readwrite');
    const cached: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + (ttlMinutes * 60 * 1000)
    };
    
    const request = store.put(cached);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Obtém dados do cache se não expirados
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  const cached = await getItem<CachedData>('cachedData', key);
  
  if (!cached) return null;
  
  if (Date.now() > cached.expiresAt) {
    await deleteItem('cachedData', key);
    return null;
  }
  
  return cached.data as T;
}

/**
 * Limpa cache expirado
 */
export async function clearExpiredCache(): Promise<void> {
  const allCached = await getAllItems<CachedData>('cachedData');
  const now = Date.now();
  
  for (const cached of allCached) {
    if (now > cached.expiresAt) {
      await deleteItem('cachedData', cached.key);
    }
  }
}

/**
 * Obtém estatísticas do armazenamento offline
 */
export async function getOfflineStats(): Promise<{
  totalItems: number;
  pendingSync: number;
  stores: Record<string, number>;
}> {
  await initOfflineDB();
  
  const storeNames: StoreName[] = [
    'vistorias', 'manutencoes', 'ocorrencias', 'checklists',
    'antesDepois', 'ordensServico', 'vencimentos', 'timeline',
    'organizacoes', 'tarefasSimples'
  ];

  const stores: Record<string, number> = {};
  let totalItems = 0;

  for (const storeName of storeNames) {
    const items = await getAllItems(storeName);
    stores[storeName] = items.length;
    totalItems += items.length;
  }

  const pendingOps = await getPendingSyncOperations();

  return {
    totalItems,
    pendingSync: pendingOps.length,
    stores
  };
}

/**
 * Exporta todos os dados offline (para backup)
 */
export async function exportOfflineData(): Promise<Record<string, any[]>> {
  const storeNames: StoreName[] = [
    'vistorias', 'manutencoes', 'ocorrencias', 'checklists',
    'antesDepois', 'ordensServico', 'vencimentos', 'timeline',
    'organizacoes', 'tarefasSimples', 'syncQueue'
  ];

  const data: Record<string, any[]> = {};

  for (const storeName of storeNames) {
    data[storeName] = await getAllItems(storeName);
  }

  return data;
}

/**
 * Importa dados offline (para restauração)
 */
export async function importOfflineData(data: Record<string, any[]>): Promise<void> {
  for (const [storeName, items] of Object.entries(data)) {
    for (const item of items) {
      await saveItem(storeName as StoreName, item);
    }
  }
}

// Inicializa o banco de dados automaticamente
if (typeof window !== 'undefined') {
  initOfflineDB().catch(console.error);
}
