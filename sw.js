// AI 윤리 어드벤처 — 오프라인 서비스워커
// 모든 정적 자원을 처음 방문 때 캐시해, 이후 네트워크 없이도 실행되게 한다.
// 게임 코드/콘텐츠가 바뀌면 CACHE 버전을 올리면 된다.
const CACHE = 'ai-ethics-adventure-v22';
const CACHE_PREFIX = 'ai-ethics-adventure-';
const ASSETS = [
  './',
  './index.html',
  './src/sprites.js',
  './src/audio.js',
  './src/data.js',
  './src/game.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE)
        .map((k) => caches.delete(k))))
      .then(() => caches.open(CACHE))
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  let shouldRefreshClients = false;
  e.waitUntil(
    caches.keys()
      .then((keys) => {
        const staleCaches = keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE);
        shouldRefreshClients = staleCaches.length > 0;
        return Promise.all(staleCaches.map((k) => caches.delete(k)));
      })
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then((clients) => (shouldRefreshClients ? Promise.all(clients
        .filter((client) => client.url.startsWith(self.registration.scope))
        .map((client) => client.navigate(client.url))) : undefined))
  );
});

function shouldPreferNetwork(request) {
  const url = new URL(request.url);
  return request.mode === 'navigate'
    || url.pathname.endsWith('/index.html')
    || /\/src\/.*\.js$/.test(url.pathname)
    || url.pathname.endsWith('/sw.js');
}

function remember(request, response) {
  if (response && response.status === 200 && response.type === 'basic') {
    const copy = response.clone();
    caches.open(CACHE).then((c) => c.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (shouldPreferNetwork(e.request)) {
    e.respondWith(
      fetch(e.request)
        .then((res) => remember(e.request, res))
        .catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request)
        .then((res) => remember(e.request, res))
        .catch(() => hit);
    })
  );
});
