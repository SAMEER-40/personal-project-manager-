const CACHE_NAME = "personal-project-manager-v1"
const STATIC_CACHE = "static-v1"
const DYNAMIC_CACHE = "dynamic-v1"

// Assets to cache on install
const STATIC_ASSETS = ["/", "/manifest.json", "/offline.html"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker")
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("[SW] Static assets cached")
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error("[SW] Error caching static assets:", error)
      }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service worker activated")
        return self.clients.claim()
      }),
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response for caching
          const responseClone = response.clone()

          // Cache successful responses
          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }

          return response
        })
        .catch(() => {
          // Fallback to cache for API requests
          return caches.match(request)
        }),
    )
    return
  }

  // Handle page requests with cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone response for caching
          const responseClone = response.clone()

          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })

          return response
        })
        .catch(() => {
          // Fallback to offline page for navigation requests
          if (request.mode === "navigate") {
            return caches.match("/offline.html")
          }
        })
    }),
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "sync-projects") {
    event.waitUntil(syncProjects())
  }
})

// Sync projects when back online
async function syncProjects() {
  try {
    // Get pending sync data from IndexedDB or localStorage
    const pendingData = await getPendingSyncData()

    if (pendingData && pendingData.length > 0) {
      for (const data of pendingData) {
        await fetch("/api/sync-project", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
      }

      // Clear pending sync data
      await clearPendingSyncData()
      console.log("[SW] Projects synced successfully")
    }
  } catch (error) {
    console.error("[SW] Error syncing projects:", error)
  }
}

// Helper functions for sync data management
async function getPendingSyncData() {
  // Implementation would depend on your data storage strategy
  return []
}

async function clearPendingSyncData() {
  // Implementation would depend on your data storage strategy
}

// Push notification handling
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received")

  const options = {
    body: event.data ? event.data.text() : "New update available!",
    icon: "/notification-icon.png",
    badge: "/notification-badge.png",
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "Open App",
        icon: "/open-icon.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/close-icon.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Personal Project Manager", options))
})

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  }
})
