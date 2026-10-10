/* Service worker: la PWA funziona offline. A OGNI modifica ai file in cache incrementa VERSION. */
const VERSION = 'dp-v40'; // cache: 685945dcb6
const FILES = ['./', 'index.html', 'manifest.json', 'css/style.css', 'icon-192.png', 'icon-512.png',
  'js/cards.js', 'js/data.js', 'js/engine.js', 'js/ai.js', 'js/rulebook.js',
  'js/ui/sprites.js', 'js/ui/common.js', 'js/ui/board.js', 'js/sim.js', 'js/ui/play.js', 'js/ui/simui.js', 'js/ui/rules.js', 'js/ui/main.js',
  // kit stampabile (pagine HTML e PDF), per scaricarlo anche offline
  'stampa/index.html', 'stampa/carte-fronte-retro.html', 'stampa/carte-solo-fronti.html', 'stampa/plancia-centrale.html', 'stampa/plance-giocatori.html', 'stampa/plancia-italia.html', 'stampa/foglio-punti.html',
  'stampa/carte-fronte-retro.pdf', 'stampa/carte-solo-fronti.pdf', 'stampa/plancia-centrale.pdf', 'stampa/plance-giocatori.pdf', 'stampa/plancia-italia.pdf', 'stampa/foglio-punti.pdf', 'stampa/regolamento.pdf'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, cp)); return r; }).catch(() => caches.match('index.html'))));
});
