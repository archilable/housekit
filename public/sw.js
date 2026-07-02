const CACHE_NAME = 'housekit-v5';
const OFFLINE_URL = '/offline';

// 캐시할 정적 자산 패턴
const STATIC_PATTERNS = [
  /\/_next\/static\//,
  /\/icons\//,
  /\.css$/,
  /\.woff2?$/,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // HTML 페이지: 네트워크 우선, 실패 시 오프라인 페이지
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // API 요청은 캐시 안 함
  if (url.pathname.startsWith('/api/')) return;

  // 정적 자산: 캐시 우선 (cache-first)
  const isStatic = STATIC_PATTERNS.some(p => p.test(url.pathname));
  if (isStatic) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      }).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // 나머지: 네트워크 우선
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
