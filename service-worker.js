const staticAssets = [
    '/index.html',
    '/styles.css',
    '/script.js',
    '/manifest.json',
    '/icon.png', // Убедитесь, что путь к иконке правильный
    '/favicon.ico'
];

// Событие установки Service Worker
self.addEventListener('install', event => {
    console.log('[Service Worker] Installed');
    event.waitUntil(
        caches.open('app-cache-v1').then(cache => cache.addAll(staticAssets))
    );
    self.skipWaiting(); // Пропускаем ожидание активации
});

// Событие активации Service Worker
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activated');
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys
                    .filter(key => key !== 'app-cache-v1') // Оставляем только актуальный кэш
                    .map(key => caches.delete(key)) // Удаляем старые кэши
            );
        })
    );
    clients.claim(); // Захватываем все клиенты для управления
});

// Событие обработки запросов
self.addEventListener('fetch', event => {
    console.log('[Service Worker] Fetching:', event.request.url);

    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                console.log('[Service Worker] Serving from cache:', event.request.url);
                return response;
            }

            // Если это HTML-запрос, перенаправляем к index.html
            if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/index.html');
            }

            // Для остальных запросов выполняем обычный fetch
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
