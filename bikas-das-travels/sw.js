/* Bikas Das Travels — offline schedule service worker.
   Deploy this file in the SAME folder as your HTML, at your site root.
   It caches the page + fonts so the routes/schedule stay visible
   even with no signal (e.g. at a boarding point in Upper Assam). */

const CACHE = 'bikasdas-v4';

// Add every page/asset you want available offline.
// If your main file isn't named index.html, change it here.
const ASSETS = [
  './',
  './index.html',
  './images/background.png',
  './images/hero-rangghar.png',
  './images/hero-bihu.png',
  './images/destination-kaziranga.png',
  './images/destination-teagarden.png',
  './images/luggage.jpg',
  './images/saved-passengers.jpg',
  './images/trust.png',
  './images/about-us.png',
  './images/qa.jpg',
  './images/brand-bus.png',
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=Manrope:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@500;600&display=swap'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for pages (so passengers see fresh times when online),
// falling back to cache when offline. Cache-first for fonts.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const isFont = req.url.includes('fonts.googleapis') || req.url.includes('fonts.gstatic');

  if (isFont) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => hit))
    );
    return;
  }

  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match('./index.html')))
  );
});
