self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    return self.clients.claim();
});

// A simple fetch handler to bypass network issues and satisfy Chrome PWA requirements
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => new Response('Sie sind offline. / You are offline.'))
    );
});
