/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching'
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies'
import { registerRoute } from 'workbox-routing'
import { ExpirationPlugin } from 'workbox-expiration'
import { NotificationOptionsWithActions, SyncEvent } from './types/worker-types'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision: string }>
  clients: Clients
  registration: ServiceWorkerRegistration
}


precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30
      })
    ]
  })
)

registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkFirst({
    cacheName: 'supabase-api',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60
      })
    ]
  })
)

self.addEventListener('push', (event: PushEvent) => {
  const options: NotificationOptionsWithActions = {
    body: event.data ? event.data.text() : 'Time for a focus session!',
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'start-session', title: 'Start Session' },
      { action: 'dismiss', title: 'Remind Later' }
    ]
  }

  event.waitUntil(self.registration.showNotification('VodaState', options))
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  if (event.action === 'start-session') {
    event.waitUntil(self.clients.openWindow('/?action=start-session'))
  } else if (event.action === 'dismiss') {
    scheduleReminder()
  } else {
    event.waitUntil(self.clients.openWindow('/'))
  }
})

function scheduleReminder(): void {
  console.log('Reminder scheduled')
}

self.addEventListener('sync', ((event: SyncEvent) => {
  if (event.tag === 'session-sync') {
    event.waitUntil(syncSessionData())
  }
}) as EventListener)

async function syncSessionData(): Promise<void> {
  console.log('Syncing session data with server...')
}