// Service Worker for MIT CSE Section CC Website - FIXED VERSION
const CACHE_NAME = 'mit-cse-v2.3';
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/offline.html',
    '/login.html',
    
    // Cache main subpages - use absolute paths
    '/calendar/',
    '/calendar/index.html',
    '/circute/',
    '/circute/index.html',
    '/faculty/',
    '/faculty/index.html',
    '/gallery/',
    '/gallery/index.html',
    '/restaurants/',
    '/restaurants/index.html',
    '/studymaterial/',
    '/studymaterial/index.html',
    '/timetable/',
    '/timetable/index.html'
];

const EXTERNAL_CACHE_URLS = [
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(CACHE_NAME)
                .then((cache) => {
                    console.log('Caching static assets');
                    return cache.addAll(STATIC_CACHE_URLS).catch(error => {
                        console.log('Failed to cache some static assets:', error);
                    });
                }),
            
            // Cache external assets
            caches.open(CACHE_NAME + '-external')
                .then((cache) => {
                    console.log('Caching external assets');
                    return cache.addAll(EXTERNAL_CACHE_URLS).catch(error => {
                        console.log('Failed to cache some external assets:', error);
                    });
                })
        ]).then(() => {
            console.log('All assets cached successfully');
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== CACHE_NAME + '-external') {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker now ready');
            return self.clients.claim();
        })
    );
});

// Enhanced fetch handler with better offline support
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // ALWAYS ALLOW Supabase API calls and external APIs to go through
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    // Handle navigation requests (HTML pages)
    if (request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    // First try network
                    const networkResponse = await fetch(request);
                    
                    // If successful, cache and return
                    if (networkResponse.ok) {
                        const cache = await caches.open(CACHE_NAME);
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    }
                    // If network fails, throw to trigger catch block
                    throw new Error('Network response not ok');
                } catch (error) {
                    console.log('Navigation failed, serving from cache or offline page:', request.url);
                    
                    // Try to serve from cache first
                    const cachedResponse = await caches.match(request);
                    if (cachedResponse) {
                        console.log('Serving cached page:', request.url);
                        return cachedResponse;
                    }
                    
                    // Try alternative URL patterns
                    const altUrls = [
                        request.url,
                        url.pathname,
                        url.pathname + '/',
                        url.pathname + '/index.html'
                    ];
                    
                    for (const altUrl of altUrls) {
                        const cachedAlt = await caches.match(altUrl);
                        if (cachedAlt) {
                            console.log('Serving cached alternative:', altUrl);
                            return cachedAlt;
                        }
                    }
                    
                    // If no cached version, serve offline page
                    console.log('No cached version found, serving offline page');
                    const offlineResponse = await caches.match('/offline.html');
                    if (offlineResponse) {
                        return offlineResponse;
                    }
                    
                    // Ultimate fallback
                    return new Response(
                        '<h1>Offline</h1><p>Please check your internet connection.</p>',
                        { 
                            headers: { 
                                'Content-Type': 'text/html',
                                'Cache-Control': 'no-cache'
                            } 
                        }
                    );
                }
            })()
        );
        return;
    }

    // For static assets (CSS, JS, images) - allow network first for dynamic content
    event.respondWith(
        (async () => {
            // For same-origin requests, try cache first
            if (url.origin === self.location.origin) {
                const cachedResponse = await caches.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }
            }

            try {
                // Try network
                const networkResponse = await fetch(request);
                
                // Cache successful responses (same origin only)
                if (networkResponse.ok && url.origin === self.location.origin) {
                    const cache = await caches.open(CACHE_NAME);
                    cache.put(request, networkResponse.clone());
                }
                
                return networkResponse;
            } catch (error) {
                // Network failed - try cache as fallback
                const cachedResponse = await caches.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // For CSS/JS, return empty rather than error
                if (request.destination === 'style') {
                    return new Response('/* Offline */', { 
                        status: 200,
                        headers: { 'Content-Type': 'text/css' }
                    });
                }
                if (request.destination === 'script') {
                    return new Response('// Offline', { 
                        status: 200,
                        headers: { 'Content-Type': 'application/javascript' }
                    });
                }
                
                // For other assets, return appropriate fallback
                return new Response('', { status: 408 });
            }
        })()
    );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});