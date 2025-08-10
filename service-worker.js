// Simple cache-first service worker for offline use
const CACHE_NAME = "pyodide-pwa-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./py-worker.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/favicon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Cache-first for same-origin resources; network for others (like Pyodide CDN)
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
  } else {
    e.respondWith(fetch(e.request).catch(() => caches.match("./index.html")));
  }
});
