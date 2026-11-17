// CineCircle Service Worker – Offline App-Shell, TMDB Poster Caching & Offline Fallback
const CACHE_NAME_STATIC = "cinecircle-static-v1";
const CACHE_NAME_PAGES = "cinecircle-pages-v1";
const CACHE_NAME_IMAGES = "cinecircle-images-v1";

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
  "/favicon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

const MAX_CACHED_IMAGES = 120;

// Helper: Trim cache to max items
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]);
      trimCache(cacheName, maxItems);
    }
  } catch {
    // ignore
  }
}

// 1. Install Event – Precache essential shell & offline fallback
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME_STATIC)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn("SW precache error:", err))
  );
});

// 2. Activate Event – Clean up legacy caches & take immediate control
self.addEventListener("activate", (event) => {
  const currentCaches = [CACHE_NAME_STATIC, CACHE_NAME_PAGES, CACHE_NAME_IMAGES];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (!currentCaches.includes(name)) {
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // A. Next.js Static Chunks & Fonts (Immutable hashes -> Cache First)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(woff2?|ttf|otf|svg|png|jpg|webp|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME_STATIC).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // B. TMDB Images (image.tmdb.org -> Cache First / Stale While Revalidate)
  if (url.hostname === "image.tmdb.org") {
    event.respondWith(
      caches.open(CACHE_NAME_IMAGES).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
            trimCache(CACHE_NAME_IMAGES, MAX_CACHED_IMAGES);
          }
          return networkResponse;
        } catch {
          return cached || new Response("", { status: 408, statusText: "Offline" });
        }
      })
    );
    return;
  }

  // C. HTML Navigation Requests (Pages like /, /feed, /my-list)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME_PAGES).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // If offline, check if this page was visited before
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          // Otherwise, serve dedicated offline fallback page
          const offlinePage = await caches.match("/offline");
          if (offlinePage) return offlinePage;

          return new Response("Offline – Bitte prüfe deine Internetverbindung.", {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        })
    );
    return;
  }

  // D. API Routes (/api/...) – Network first, graceful error on offline
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ offline: true, error: "Keine Internetverbindung verfügbar." }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
    return;
  }
});
