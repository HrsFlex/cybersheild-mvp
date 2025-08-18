// TriNetra PWA Service Worker
const CACHE_NAME = 'trinetra-v1.0.0';
const STATIC_CACHE = 'trinetra-static-v1.0.0';
const DYNAMIC_CACHE = 'trinetra-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/design-system.css',
    '/css/main.css',
    '/css/chronos.css',
    '/css/components.css',
    '/css/responsive.css',
    '/css/animations.css',
    '/js/main.js',
    '/js/api.js',
    '/js/utils.js',
    '/js/chronos.js',
    '/js/hydra.js',
    '/js/autosar.js',
    '/js/pdf-generator.js',
    'https://d3js.org/d3.v7.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /\/api\/health/,
    /\/api\/chronos\/patterns/,
    /\/api\/autosar\/templates/
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('🔧 TriNetra Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('📦 TriNetra Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('✅ TriNetra Service Worker: Installation complete');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('❌ TriNetra Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('🚀 TriNetra Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('🗑️ TriNetra Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ TriNetra Service Worker: Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (url.origin === location.origin) {
        // Same origin requests
        if (isStaticAsset(request.url)) {
            event.respondWith(cacheFirstStrategy(request));
        } else if (isAPIRequest(request.url)) {
            event.respondWith(networkFirstStrategy(request));
        } else {
            event.respondWith(staleWhileRevalidateStrategy(request));
        }
    } else {
        // External requests (fonts, CDN, etc.)
        event.respondWith(cacheFirstStrategy(request));
    }
});

// Cache strategies
async function cacheFirstStrategy(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        return new Response('Offline - Resource not available', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok && shouldCacheAPIResponse(request.url)) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return new Response(JSON.stringify({
            status: 'error',
            message: 'Offline - No cached data available',
            offline: true
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => cachedResponse);
    
    return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(url) {
    return url.includes('/css/') || 
           url.includes('/js/') || 
           url.includes('/assets/') ||
           url.includes('/icons/') ||
           url.includes('.woff') ||
           url.includes('.woff2') ||
           url.includes('d3js.org') ||
           url.includes('googleapis.com');
}

function isAPIRequest(url) {
    return url.includes('/api/');
}

function shouldCacheAPIResponse(url) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url));
}

console.log('🚀 TriNetra Service Worker: Loaded and ready');