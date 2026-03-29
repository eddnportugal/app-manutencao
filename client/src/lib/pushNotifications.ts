// Utilitário para Web Push Notifications
// Revista Digital para Condomínios

const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';

// Converter base64 para Uint8Array (necessário para VAPID)
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Verificar se o navegador suporta Push Notifications
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Verificar o status atual da permissão
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

// Solicitar permissão para notificações
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.error('Este navegador não suporta notificações');
    return 'denied';
  }
  
  const permission = await Notification.requestPermission();
  console.log('[Push] Permissão:', permission);
  return permission;
}

// Obter ou registrar Service Worker para push notifications
// Nota: main.tsx desregistra o SW pesado (sw.js) com cache.
// Para push, usamos um SW minimalista dedicado.
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.error('Service Worker não suportado');
    return null;
  }
  
  try {
    // Verificar se já existe um SW registrado
    const existingRegs = await navigator.serviceWorker.getRegistrations();
    if (existingRegs.length > 0) {
      console.log('[Push] Usando Service Worker existente');
      return existingRegs[0];
    }
    
    // Registrar SW minimalista para push (não o sw.js pesado com cache)
    const registration = await navigator.serviceWorker.register('/sw-push.js', {
      scope: '/'
    });
    console.log('[Push] Service Worker de push registrado:', registration);
    return registration;
  } catch (error) {
    console.error('[Push] Erro ao registrar Service Worker:', error);
    return null;
  }
}

// Obter a subscription atual
export async function getSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator)) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription;
  } catch (error) {
    console.error('[Push] Erro ao obter subscription:', error);
    return null;
  }
}

// Criar nova subscription
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.error('Push notifications não suportadas');
    return null;
  }
  
  try {
    // Solicitar permissão
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('[Push] Permissão negada');
      return null;
    }
    
    // Registrar Service Worker
    const registration = await registerServiceWorker();
    if (!registration) {
      return null;
    }
    
    // Aguardar o Service Worker estar pronto
    await navigator.serviceWorker.ready;
    
    // Criar subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    
    console.log('[Push] Subscription criada:', subscription);
    return subscription;
  } catch (error) {
    console.error('[Push] Erro ao criar subscription:', error);
    return null;
  }
}

// Cancelar subscription
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const subscription = await getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('[Push] Subscription cancelada');
      return true;
    }
    return false;
  } catch (error) {
    console.error('[Push] Erro ao cancelar subscription:', error);
    return false;
  }
}

// Enviar notificação local (para testes)
export function showLocalNotification(title: string, options?: NotificationOptions): void {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/logo.png',
      badge: '/badge.png',
      ...options
    });
  }
}

// Extrair dados da subscription para enviar ao servidor
export function extractSubscriptionData(subscription: PushSubscription): {
  endpoint: string;
  p256dh: string;
  auth: string;
} {
  const key = subscription.getKey('p256dh');
  const auth = subscription.getKey('auth');
  
  const arrayToBase64 = (buffer: ArrayBuffer | null): string => {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };
  
  return {
    endpoint: subscription.endpoint,
    p256dh: arrayToBase64(key),
    auth: arrayToBase64(auth)
  };
}
