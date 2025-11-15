/* eslint-env serviceworker */
/* global self, caches, clients, Response, fetch, URL, console */
/**
 * Service Worker for Field Operations PWA
 * Offline-capable with sync queue
 */

const CACHE_NAME = 'constructai-v1'
const OFFLINE_QUEUE_KEY = 'offline-queue'
const SYNC_TAG = 'field-data-sync'

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/offline.html',
      ])
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
  })
  )
  return self.clients.claim()
})

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests for API calls (they go to sync queue)
  if (request.method !== 'GET' && url.pathname.startsWith('/api/')) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Return cached version if available
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline.html')
          }
        })
      })
  )
})

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncOfflineQueue())
  }
})

// Push notifications for emergency alerts
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || 'New notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'notification',
    requireInteraction: data.urgent || false,
    data: data,
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'ConstructAI', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  )
})

// Sync offline queue
async function syncOfflineQueue() {
  try {
    const queue = await getOfflineQueue()
    if (queue.length === 0) return

    const results = {
      synced: 0,
      failed: 0,
      errors: [],
    }

    for (const item of queue) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body ? JSON.stringify(item.body) : undefined,
        })

        if (response.ok) {
          results.synced++
          await removeFromQueue(item.id)
        } else {
          results.failed++
          results.errors.push({ id: item.id, status: response.status })
        }
      } catch (error) {
        results.failed++
        results.errors.push({ id: item.id, error: error.message })
      }
    }

    // Notify clients of sync results
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        results,
      })
    })

    return results
  } catch (error) {
    console.error('Sync failed:', error)
    throw error
  }
}

// Queue management
async function getOfflineQueue() {
  const cache = await caches.open(OFFLINE_QUEUE_KEY)
  const response = await cache.match('/queue')
  if (response) {
    return response.json()
  }
  return []
}

async function addToQueue(item) {
  const queue = await getOfflineQueue()
  queue.push({
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...item,
  })
  const cache = await caches.open(OFFLINE_QUEUE_KEY)
  await cache.put('/queue', new Response(JSON.stringify(queue)))
}

async function removeFromQueue(id) {
  const queue = await getOfflineQueue()
  const filtered = queue.filter((item) => item.id !== id)
  const cache = await caches.open(OFFLINE_QUEUE_KEY)
  await cache.put('/queue', new Response(JSON.stringify(filtered)))
}

// Message handler for queue operations
self.addEventListener('message', (event) => {
  if (event.data.type === 'QUEUE_REQUEST') {
    addToQueue(event.data.item).then(() => {
      event.ports[0].postMessage({ success: true })
    })
  } else if (event.data.type === 'GET_QUEUE') {
    getOfflineQueue().then((queue) => {
      event.ports[0].postMessage({ queue })
    })
  } else if (event.data.type === 'TRIGGER_SYNC') {
    self.registration.sync.register(SYNC_TAG).then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
})
