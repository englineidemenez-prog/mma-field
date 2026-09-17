/* Service worker do Pequenos da Fé Kids — cache offline (escopo: /pequenos-da-fe/app/) */
var CACHE_NAME = "pequenos-da-fe-v1";
var PRECACHE_URLS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/hero.webp",
  "./assets/sounds/cachorro.mp3",
  "./assets/sounds/cavalo.mp3",
  "./assets/sounds/elefante.mp3",
  "./assets/sounds/galinha.mp3",
  "./assets/sounds/gato.mp3",
  "./assets/sounds/leao.mp3",
  "./assets/sounds/macaco.mp3",
  "./assets/sounds/ovelha.mp3",
  "./assets/sounds/passaro.mp3",
  "./assets/sounds/pato.mp3",
  "./assets/sounds/porco.mp3",
  "./assets/sounds/sapo.mp3",
  "./assets/sounds/vaca.mp3",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) { return cache.addAll(PRECACHE_URLS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== CACHE_NAME; }).map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  if (event.request.method !== "GET") return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // não intercepta recursos de outra origem (ex: fontes do Google)

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var network = fetch(event.request).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
