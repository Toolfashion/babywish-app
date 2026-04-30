/**
 * A BabyWish PWA Service Worker
 * ===========================
 * SINGLE CODEBASE - Αλλαγές εμφανίζονται αυτόματα σε iOS & Android
 * 
 * Strategy: Network First with Cache Fallback
 * - Πάντα παίρνει fresh content από server
 * - Cache μόνο για offline fallback
 */

const CACHE_VERSION = 'v2.2.0';
const CACHE_NAME = `babywish-${CACHE_VERSION}`;

// Minimal static files to cache for offline
const OFFLINE_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install - Cache minimal files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_FILES))
      .then(() => {
        console.log('[SW] Install complete, skipping wait');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// Activate - Clean old caches and take control
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('babywish-') && name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Taking control of clients');
        return self.clients.claim(); // Take control immediately
      })
      .then(() => {
        // Notify all clients about update
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'SW_UPDATED', version: CACHE_VERSION });
          });
        });
      })
  );
});

// Fetch - Network First Strategy (Always fresh content)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip non-http requests
  if (!url.protocol.startsWith('http')) return;

  // Skip external resources (like fonts, analytics)
  if (!url.hostname.includes('getbabywish.com') && 
      !url.hostname.includes('preview.emergentagent.com') &&
      !url.hostname.includes('localhost')) {
    return;
  }

  // API calls - Always network, no cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // HTML/JS/CSS - Network First with Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for offline
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline - try cache
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Return offline page for navigation
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// Handle messages from client
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data === 'GET_VERSION') {
    event.source.postMessage({ type: 'VERSION', version: CACHE_VERSION });
  }
});

// Push notifications (future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update from A BabyWish!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    tag: 'babywish-notification'
  };

  event.waitUntil(
    self.registration.showNotification('A BabyWish', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

console.log('[SW] Service Worker loaded, version:', CACHE_VERSION);
