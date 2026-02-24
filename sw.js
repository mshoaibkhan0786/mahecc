// Kill-switch Service Worker
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                return caches.delete(key);
            }));
        }).then(() => {
            self.registration.unregister();
        })
    );
});

self.addEventListener('fetch', (e) => {
    // Act as a transparent passthrough
    e.respondWith(fetch(e.request));
});