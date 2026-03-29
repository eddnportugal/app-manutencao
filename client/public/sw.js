/**
 * Service Worker - App Manutenção
 * Permite funcionamento offline completo do sistema
 */

const CACHE_NAME = 'app-manutencao-v4';
const API_CACHE_NAME = 'app-manutencao-api-v4';

// Arquivos estáticos para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/logo-manutencao.png',
  '/favicon.ico',
  '/manifest.json'
];

// Rotas da aplicação para cache
const APP_ROUTES = [
  '/dashboard',
  '/dashboard/vistorias',
  '/dashboard/manutencoes',
  '/dashboard/ocorrencias',
  '/dashboard/checklists',
  '/dashboard/antes-depois',
  '/dashboard/ordens-servico',
  '/dashboard/agenda-vencimentos',
  '/dashboard/timeline',
  '/dashboard/historico',
  '/dashboard/organizacao',
  '/dashboard/equipe',
  '/dashboard/tarefas-simples',
  '/dashboard/checklist-templates'
];

// Padrões de API para cache
const API_PATTERNS = [
  /\/api\/trpc\/vistorias/,
  /\/api\/trpc\/manutencoes/,
  /\/api\/trpc\/ocorrencias/,
  /\/api\/trpc\/checklists/,
  /\/api\/trpc\/antesDepois/,
  /\/api\/trpc\/ordensServico/,
  /\/api\/trpc\/vencimentos/,
  /\/api\/trpc\/timeline/,
  /\/api\/trpc\/organizacoes/,
  /\/api\/trpc\/tarefasSimples/,
  /\/api\/trpc\/auth\.me/
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando arquivos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service Worker instalado com sucesso');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erro na instalação:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
            .map((name) => {
              console.log('[SW] Removendo cache antigo:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker ativado');
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET para cache (exceto para fila offline)
  if (request.method !== 'GET') {
    // Para requisições POST/PUT/DELETE, tentar executar e falhar graciosamente
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Se offline, retornar resposta indicando que será sincronizado depois
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'Operação salva para sincronização quando voltar online'
            }),
            {
              status: 202,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Estratégia para APIs: Network First com fallback para cache
  if (isApiRequest(url)) {
    event.respondWith(networkFirstWithCache(request, API_CACHE_NAME));
    return;
  }

  // Estratégia para assets estáticos: Cache First com fallback para network
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstWithNetwork(request, CACHE_NAME));
    return;
  }

  // Estratégia para rotas da aplicação: Network First com fallback para cache/offline
  if (isAppRoute(url)) {
    event.respondWith(networkFirstWithOffline(request));
    return;
  }

  // Para outras requisições: tentar network primeiro
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
      .catch(() => caches.match('/offline.html'))
  );
});

// Verifica se é uma requisição de API
function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || 
         API_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Verifica se é um asset estático
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// Verifica se é uma rota da aplicação
function isAppRoute(url) {
  return url.pathname === '/' || 
         url.pathname.startsWith('/dashboard') ||
         APP_ROUTES.includes(url.pathname);
}

// Estratégia: Network First com Cache
async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Só cachear respostas bem-sucedidas
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network falhou, tentando cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retornar resposta de erro offline para APIs
    return new Response(
      JSON.stringify({
        offline: true,
        cached: false,
        message: 'Você está offline e não há dados em cache'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Estratégia: Cache First com Network
async function cacheFirstWithNetwork(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Atualizar cache em background
    fetch(request)
      .then(async (networkResponse) => {
        if (networkResponse.ok) {
          const cache = await caches.open(cacheName);
          cache.put(request, networkResponse);
        }
      })
      .catch(() => {});
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Falha ao buscar asset:', request.url);
    return new Response('Asset não disponível offline', { status: 404 });
  }
}

// Estratégia: Network First com página offline
async function networkFirstWithOffline(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cachear a página para uso offline
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Offline, tentando cache para:', request.url);
    
    // Tentar cache primeiro
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Tentar página index para rotas SPA
    const indexResponse = await caches.match('/index.html');
    if (indexResponse) {
      return indexResponse;
    }
    
    // Última opção: página offline
    return caches.match('/offline.html');
  }
}

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      // Cachear URLs específicas sob demanda
      if (payload && Array.isArray(payload.urls)) {
        caches.open(CACHE_NAME)
          .then((cache) => cache.addAll(payload.urls))
          .then(() => {
            event.ports[0]?.postMessage({ success: true });
          })
          .catch((error) => {
            event.ports[0]?.postMessage({ success: false, error: error.message });
          });
      }
      break;
      
    case 'CLEAR_CACHE':
      // Limpar cache específico ou todos
      const cacheToDelete = payload?.cacheName || CACHE_NAME;
      caches.delete(cacheToDelete)
        .then(() => {
          event.ports[0]?.postMessage({ success: true });
        })
        .catch((error) => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
        });
      break;
      
    case 'GET_CACHE_STATS':
      // Retornar estatísticas do cache
      getCacheStats()
        .then((stats) => {
          event.ports[0]?.postMessage({ success: true, stats });
        })
        .catch((error) => {
          event.ports[0]?.postMessage({ success: false, error: error.message });
        });
      break;
  }
});

// Obter estatísticas do cache
async function getCacheStats() {
  const cacheNames = await caches.keys();
  const stats = {};
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    stats[name] = keys.length;
  }
  
  return stats;
}

// Background Sync para sincronização quando voltar online
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync:', event.tag);
  
  if (event.tag === 'sync-pending-operations') {
    event.waitUntil(syncPendingOperations());
  }
});

// Sincronizar operações pendentes
async function syncPendingOperations() {
  // Notificar clientes para iniciar sincronização
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_REQUIRED',
      message: 'Conexão restaurada. Sincronizando dados...'
    });
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido:', event);
  
  let data = {
    title: 'App Manutenção',
    body: 'Nova notificação',
    icon: '/logo-manutencao.png'
  };
  
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: '/logo-manutencao.png',
      vibrate: [200, 100, 200],
      tag: data.tag || 'default',
      data: data.data || {},
      actions: [
        { action: 'open', title: 'Abrir' },
        { action: 'close', title: 'Fechar' }
      ]
    })
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event);
  
  event.notification.close();
  
  if (event.action === 'close') return;
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Tentar focar em uma janela existente
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Abrir nova janela se não houver nenhuma
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[SW] Service Worker carregado - App Manutenção v4');
