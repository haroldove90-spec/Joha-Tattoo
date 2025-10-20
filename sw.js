// A basic service worker for PWA functionality

const CACHE_NAME = 'joha-tattoo-cache-v1';
// Add assets that should be cached for offline use.
// This list should be expanded as the app grows.
const urlsToCache = [
  '/',
  '/index.html',
  // You would typically add your bundled JS/CSS files here
  // For this setup, we'll keep it simple.
];

self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
