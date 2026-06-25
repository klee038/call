const CACHE_NAME = 'umpire_v19.0';
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
  './html2pdf.bundle.min.js'
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