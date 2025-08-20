const VERSION = "1.0.0"
const CACHE_VERSION = `${VERSION}-${Date.now()}`
const CACHE_NAME = `personal-project-manager-${CACHE_VERSION}`
const STATIC_CACHE = `static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`

const STATIC_ASSETS = ["/", "/manifest.json", "/offline.html"]

self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker version:", VERSION)
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
      .then(() => {
        return notifyClientsAboutUpdate()
      })
      .catch((error) => {
        console.error("[SW] Error caching static assets:", error)
      }),
  )
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker version:", VERSION)
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("[SW] Service worker activated, claiming clients")
        return self.clients.claim()
      })
      .then(() => {
        return notifyClientsUpdateComplete()
      }),
  )
})

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CHECK_FOR_UPDATES") {
    checkForUpdates()
  }

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

async function checkForUpdates() {
  try {
    const registration = await self.registration.update()
    if (registration.waiting) {
      console.log("[SW] New version available")
      notifyClientsAboutUpdate()
    }
  } catch (error) {
    console.error("[SW] Error checking for updates:", error)
  }
}

async function notifyClientsAboutUpdate() {
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({
      type: "UPDATE_AVAILABLE",
      version: VERSION,
    })
  })
}

async function notifyClientsUpdateComplete() {
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({
      type: "UPDATE_COMPLETE",
      version: VERSION,
    })
  })
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== "GET") {
    return
  }

  if (url.origin !== location.origin) {
    return
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone()

          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone)
            })
          }

          return response
        })
        .catch(() => {
          return caches.match(request)
        }),
    )
    return
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          const responseClone = response.clone()

          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })

          return response
        })
        .catch(() => {
          if (request.mode === "navigate") {
            return caches.match("/offline.html")
          }
        })
    }),
  )
})

self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag)

  if (event.tag === "sync-projects") {
    event.waitUntil(syncProjects())
  }
})

async function syncProjects() {
  try {
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

      await clearPendingSyncData()
      console.log("[SW] Projects synced successfully")
    }
  } catch (error) {
    console.error("[SW] Error syncing projects:", error)
  }
}

async function getPendingSyncData() {
  return []
}

async function clearPendingSyncData() {}

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

  event.waitUntil(self.registration.showNotification("", options))
})

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action)

  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  }
})
