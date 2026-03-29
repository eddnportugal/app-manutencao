/**
 * Service Worker Minimalista - Push Notifications Only
 * NÃO faz cache de assets (evita conflitos com main.tsx que limpa caches)
 */

// Instalação rápida sem cache
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Ativação rápida
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Push notification handler
self.addEventListener('push', (event) => {
  let data = { title: 'App Manutenção', body: 'Nova notificação' };
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: data,
    actions: data.actions || [],
    tag: data.tag || 'default'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'App Manutenção', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        return self.clients.openWindow(urlToOpen);
      })
  );
});
