const STATIC_CACHE = "milliy-static-v1";
const RUNTIME_CACHE = "milliy-runtime-v1";
const APP_SHELL_ASSETS = [
    "/",
    "/index.html",
    "/css/styles.css",
    "/js/platform.js",
    "/manifest.webmanifest",
    "/assets/favicon.svg",
    "/assets/icon-192.svg",
    "/assets/icon-512.svg",
    "/assets/icon-maskable.svg",
    "/assets/social-preview.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
                .map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;

    if (request.method !== "GET") {
        return;
    }

    const requestUrl = new URL(request.url);
    const isSameOrigin = requestUrl.origin === self.location.origin;
    const isApiRequest = isSameOrigin && requestUrl.pathname.startsWith("/api/");

    if (isApiRequest) {
        return;
    }

    if (request.mode === "navigate") {
        event.respondWith(networkFirst(request, "/index.html"));
        return;
    }

    if (isSameOrigin) {
        event.respondWith(staleWhileRevalidate(request));
    }
});

async function networkFirst(request, fallbackPath) {
    const cache = await caches.open(RUNTIME_CACHE);

    try {
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
    } catch {
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        return caches.match(fallbackPath);
    }
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    const networkResponsePromise = fetch(request)
        .then((response) => {
            cache.put(request, response.clone());
            return response;
        })
        .catch(() => null);

    if (cachedResponse) {
        eventWaitUntil(networkResponsePromise);
        return cachedResponse;
    }

    const networkResponse = await networkResponsePromise;
    return networkResponse || caches.match("/index.html");
}

function eventWaitUntil(promise) {
    if (!promise || typeof promise.then !== "function") {
        return;
    }

    promise.catch(() => null);
}
