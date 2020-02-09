const cacheName = 'actsv1';
const staticAssets = [
  './',
  './index.html',
  './assets/styles.css',
  './assets/img'
];

self.addEventListener('install', async e => {
  const cache = await caches.open(cacheName);
  await cache.addAll(staticAssets);
  return self.skipWaiting();
});

self.addEventListener('activate', e => {
  self.clients.claim();
});

self.addEventListener('fetch', async e => {
  const req = e.request;
  const url = new URL(req.url);
  console.log(url.origin, location.origin);
  if (url.origin === location.origin) {
    e.respondWith(cacheFirst(req));
  } else {
    console.log(req);
    e.respondWith(networkAndCache(req));
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  return cached || fetch(req);
}

async function networkAndCache(req) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    console.log(fresh);
    await cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    console.log('error occurred with the request or caching', e);
    const cached = await cache.match(req);
    return cached;
  }
}