const staticAssets = [
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/icon.png',
    '/favicon.ico',
    '/icon-192x192.png',
    '/icon-512x512.png'
];

// Событие установки Service Worker
self.addEventListener('install', event => {
    console.log('[Service Worker] Installed (v1)');
    event.waitUntil(
        caches.open('app-cache-v1')
            .then(cache => cache.addAll(staticAssets))
            .catch(error => {
                console.error('[Service Worker] Cache failed:', error.message);
            })
    );
    self.skipWaiting(); // Пропускаем ожидание активации
});

// Событие активации Service Worker
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activated (v1)');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== 'app-cache-v1')
                    .map(key => {
                        console.log('[Service Worker] Deleting old cache:', key);
                        return caches.delete(key);
                    })
            );
        })
    );
    clients.claim(); // Захватываем все клиенты для управления
});

// Событие обработки запросов
self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetching (v1):', event.request.url);

    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log('[Service Worker] Serving from cache:', event.request.url);
                return response;
            }

            // Обработка HTML-запросов
            if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/index.html');
            }

            // Обработка изображений
            if (event.request.destination === 'image') {
                return fetch(event.request).catch(() => {
                    console.warn('[Service Worker] Image fallback for:', event.request.url);
                    return caches.match('/icon.png'); // Возвращаем заглушку для изображений
                });
            }

            // Обработка остальных запросов
            return fetch(event.request)
                .then(networkResponse => {
                    console.log('[Service Worker] Cached:', event.request.url);
                    return caches.open('app-cache-v1').then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    console.warn('[Service Worker] Offline fallback for:', event.request.url);
                    return caches.match('/index.html'); // Перенаправляем к index.html для SPA
                });
        })
    );
});
