// Service Worker Registration Component
import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      })
      .then((registration) => {
        console.log('Service Worker registered:', registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
    }
  }, []);

  return null;
}

// Service Worker Script Content (copy this to public/service-worker.js)
export const SERVICE_WORKER_SCRIPT = `
// Service Worker for Push Notifications
const CACHE_NAME = 'groupy-loopy-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event);
  
  if (!event.data) return;

  const data = event.data.json();
  
  // Urgent messages get special treatment
  const isUrgent = data.isUrgent || false;
  const title = isUrgent ? \`🚨 אזהרה חריגה: \${data.title}\` : data.title;
  
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    tag: isUrgent ? 'urgent-alert' : (data.tag || 'notification'),
    data: data.data,
    requireInteraction: isUrgent ? true : (data.requireInteraction || false),
    vibrate: isUrgent ? [300, 100, 300, 100, 300] : [200, 100, 200],
    silent: false, // Never silent - always play default sound
    renotify: isUrgent, // Re-notify if urgent
    actions: data.actions || [
      { action: 'open', title: 'פתח' },
      { action: 'close', title: 'סגור' }
    ],
    // Priority hint for urgent messages
    ...(isUrgent && {
      urgency: 'high'
    })
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event);
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

async function syncNotifications() {
  console.log('Syncing notifications...');
}

// Fetch event
self.addEventListener('fetch', (event) => {
  // Let the browser handle all requests normally
});
`;