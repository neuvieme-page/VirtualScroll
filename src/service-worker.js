var version = 'v1::';
var files = [
  '/styles/main.css',
  '/scripts/main.min.js'
];

function installer(event){
  self.skipWaiting();
  function prefill(){
    return cache.addAll(files);
  }
  event.waitUntil(caches.open(version + 'files').then(prefill));
}

function activator(event){
  if('clients' in self && clients.claim){
    clients.claim();
  }
  function handleVersion(keys){
    return Promise.all(keys.filter(function(key){
      return key.indexOf(version) !== 0;
    }).map(function(key){
      return caches.delete(key);
    }))
  }
  event.waitUntil(caches.keys().then(handleVersion));
}

self.addEventListener('install', installer);
self.addEventListener('activate', activator);
