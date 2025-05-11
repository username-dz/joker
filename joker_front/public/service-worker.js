// service-worker.js

const CACHE_NAME = "my-cache-v1";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/script.js",
  "/favicon.svg",
  "/vite.svg",
];

// Install Event: Cache essential files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    }),
  );
});

// Fetch Event: Serve files from cache or fetch from the network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached response if available, otherwise fetch from network
      return response || fetch(event.request);
    }),
  );
});

// Push Event: Handle push notifications
self.addEventListener("push", (event) => {
  let data = {};

  // Extract data from the push event
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      // Silent error
    }
  }

  // Define default options for the notification
  const options = {
    body: data.notification.body || "Default body",
    icon: data.notification.icon || "/favicon.svg",
    badge: data.notification.badge || "/favicon.svg",
  };

  // Show the notification with the title and options
  event.waitUntil(
    self.registration.showNotification(
      data.notification.title || "Default Title",
      options,
    ),
  );
});

// Notification Click Event: Handle user interactions with notifications
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Open a specific URL or focus the existing window
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's an existing window or open a new one
        for (let i = 0; i < windowClients.length; i++) {
          let client = windowClients[i];
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      }),
  );
});

// Activate Event: Manage old caches and update service worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

// Error Event: Log any unexpected errors
self.addEventListener("error", (event) => {
  // Silent error
});
