const CACHE = 'masai-fahm-quran-v6';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE).map(key => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  const isAppFile = requestUrl.origin === self.location.origin;
  const isFirebaseModule = requestUrl.hostname === 'www.gstatic.com';
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && (isAppFile || isFirebaseModule)) {
          return caches.open(CACHE).then(cache =>
            cache.put(event.request, response.clone()).then(() => response).catch(() => response)
          );
        }
        return response;
      }).catch(() => {
        if (isAppFile) return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
