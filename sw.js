// Service Worker - 离线缓存 v171
const CACHE_NAME='jb-salary-v175';
const urlsToCache = ['./', './index.html'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(names => Promise.all(
      names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))
    ))
  );
  self.clients.claim();
});

// v158: HTML用network-first，确保总是获取最新代码；其他资源用cache-first加速
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isHTML = event.request.mode === 'navigate' || url.pathname.endsWith('.html');
  
  if(isHTML){
    // HTML页面：网络优先，保证始终拿到最新部署版本
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // 静态资源：缓存优先
    event.respondWith(
      caches.match(event.request).then(r => r || fetch(event.request))
    );
  }
});
