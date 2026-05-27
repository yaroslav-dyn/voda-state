import { precacheAndRoute } from 'workbox-precaching'
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies'
import { registerRoute } from 'workbox-routing'
import { ExpirationPlugin } from 'workbox-expiration'

// Precache all assets injected at build time by vite-plugin-pwa
precacheAndRoute(self.__WB_MANIFEST)

// Runtime caching for images
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
)

// Supabase API: network first with short cache fallback
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 hour
      }),
    ],
  })
)

// Push notifications for session reminders
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time for a focus session!',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'start-session',
        title: 'Start Session',
      },
      {
        action: 'dismiss',
        title: 'Remind Later',
      },
    ],
  }

  event.waitUntil(
    self.registration.showNotification('VodaState', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'start-session') {
    event.waitUntil(
      clients.openWindow('/?action=start-session')
    )
  } else if (event.action === 'dismiss') {
    scheduleReminder()
  } else {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

function scheduleReminder() {
  console.log('Reminder scheduled')
}

// Background sync stub for future session sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'session-sync') {
    event.waitUntil(syncSessionData())
  }
})

async function syncSessionData() {
  console.log('Syncing session data with server...')
  // Placeholder: app-side sync prompt handles the actual sync flow
}
