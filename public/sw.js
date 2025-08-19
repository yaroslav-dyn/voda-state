const CACHE_NAME = 'vodastate-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/App.vue',
  '/src/styles/main.css',
  '/src/styles/pixel-art.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline page or fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for session data (when online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'session-sync') {
    event.waitUntil(syncSessionData());
  }
});

async function syncSessionData() {
  // This would sync session data with Supabase when back online
  console.log('Syncing session data with server...');
  
  try {
    // Get pending sessions from IndexedDB
    const pendingSessions = await getPendingSessions();
    
    // Send to server (placeholder for Supabase integration)
    for (const session of pendingSessions) {
      await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(session)
      });
    }
    
    // Clear pending sessions after successful sync
    await clearPendingSessions();
    console.log('Session sync completed');
  } catch (error) {
    console.error('Session sync failed:', error);
  }
}

// Placeholder functions for offline data management
async function getPendingSessions() {
  // Would get sessions from IndexedDB that need to be synced
  return [];
}

async function clearPendingSessions() {
  // Would clear synced sessions from IndexedDB
}

// Push notifications for session reminders
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time for a focus session!',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'start-session',
        title: '🚀 Start Session'
      },
      {
        action: 'dismiss',
        title: '⏰ Remind Later'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('VodaState', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'start-session') {
    // Open app and start a session
    event.waitUntil(
      clients.openWindow('/?action=start-session')
    );
  } else if (event.action === 'dismiss') {
    // Schedule another reminder
    scheduleReminder();
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

function scheduleReminder() {
  // Would schedule another push notification
  console.log('Reminder scheduled');
}
