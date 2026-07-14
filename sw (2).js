// sw.js — cache de la app y de capítulos ya leídos, para uso sin conexión en iPad
const APP_VERSION = "1.2.0";
const APP_CACHE = "biblia-app-v5";
const DATA_CACHE = "biblia-data-v4";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

// Permite que la página pida "toma control ya" (botón "Buscar actualización")
// en vez de esperar a que el usuario cierre todas las pestañas/la app.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== APP_CACHE && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Datos bíblicos (API externa): red primero (para no quedarnos con datos
  // viejos o vacíos), y solo se usa la caché si no hay conexión. Nunca se
  // guarda una respuesta vacía, para que un capítulo en blanco no quede
  // "congelado" como si fuera la versión offline válida.
  if (url.hostname.includes("bolls.life")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(DATA_CACHE);
        try {
          const res = await fetch(event.request);
          if (res.ok) {
            const bodyForCheck = await res.clone().json().catch(() => null);
            const isEmpty = Array.isArray(bodyForCheck) && bodyForCheck.length === 0;
            if (!isEmpty) cache.put(event.request, res.clone());
          }
          return res;
        } catch (e) {
          const cached = await cache.match(event.request);
          return cached || new Response(JSON.stringify({ error: "offline" }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      })()
    );
    return;
  }

  // App shell
  if (url.origin === self.location.origin) {
    const isHTML =
      event.request.mode === "navigate" ||
      url.pathname.endsWith("index.html") ||
      url.pathname.endsWith("/");

    // El HTML/JS de la app: red primero. Así, en cuanto haya internet,
    // el iPad siempre recibe la versión más nueva del código en vez de
    // quedarse pegado en una copia vieja de la caché indefinidamente.
    if (isHTML) {
      event.respondWith(
        (async () => {
          const cache = await caches.open(APP_CACHE);
          try {
            const res = await fetch(event.request);
            if (res.ok) cache.put(event.request, res.clone());
            return res;
          } catch (e) {
            return (await cache.match(event.request)) || (await cache.match("./index.html"));
          }
        })()
      );
      return;
    }

    // Íconos/manifest cambian poco: cache-first está bien para esos.
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
