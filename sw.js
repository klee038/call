const CACHE_NAME = 'umpire_v20.0'; 
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './pdf-style.css',
  './roster.js',
  './game.js',
  './setup.js',
  './toss.js',
  './role.js',
  './history.js',
  './call.js',
  './ui.js',
  './pdf.js',
  './recorder.js',
  './manifest.json',
  './icon.png',
  './html2pdf.bundle.min.js',
  './pako.min.js',
  './qrcode.min.js',
  './html5-qrcode.min.js'
];

// アプリが初めて開かれたときにファイルをキャッシュ（保存）する
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// オフラインのときは保存したファイルからアプリを動かす
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

// 古いバージョンのキャッシュを自動で消す処理（スマホの容量圧迫を防ぐため）
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});