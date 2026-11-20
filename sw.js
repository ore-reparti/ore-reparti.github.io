// Conserva la pagina sul telefono: si apre subito con la copia salvata e intanto scarica quella nuova,
// che si vede dall'apertura successiva. I dati arrivano sempre dal server, mai dalla copia.
var CACHE = 'ld-montaggi-04534cda82';
var FILE = ['./index.html', './manifest.webmanifest', './icona-180.png', './icona-192.png', './icona-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (chiavi) {
    return Promise.all(chiavi.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  var pagina = req.mode === 'navigate';
  if (pagina && !/\/(index\.html)?$/.test(new URL(req.url).pathname)) return;
  var chiave = pagina ? './index.html' : req;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(chiave, { ignoreSearch: pagina }).then(function (salvata) {
      var rete = fetch(req).then(function (r) {
        if (r.ok) c.put(chiave, r.clone());
        return r;
      });
      if (salvata) {
        e.waitUntil(rete.catch(function () {}));
        return salvata;
      }
      return rete;
    });
  }));
});
