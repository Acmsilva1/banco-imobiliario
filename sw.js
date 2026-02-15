const CACHE_NAME = 'banco-it-v3';
// Lista de arquivos para salvar no cache do celular
const assets = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './logo.png'
];

// Instalação: Salva os arquivos no cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache aberto: salvando assets');
      return cache.addAll(assets);
    })
  );
});

// Intercepta as chamadas para permitir funcionamento offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Retorna o arquivo do cache ou busca na rede
      return response || fetch(event.request);
    })
  );
});