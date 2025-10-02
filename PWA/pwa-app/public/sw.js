let cacheData = "appV1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(cacheData).then((cache) => {
      return cache.addAll([
        "/",                     // root
        "/index.html",           // main HTML
        "/static/js/bundle.js",  // your JS bundle
        "/logo192.png",          // logo
        "/ws",
        "/favicon.ico"           // favicon
      ]);
    })
  );
});

// Activate step (good practice)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== cacheData) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// Fetch step
self.addEventListener("fetch", (event) => {
  if(!navigator.onLine){
    event.respondWith(
    caches.match(event.request).then((resp) => {
      return resp || fetch(event.request).catch(() => {
        // Optional fallback (e.g. if offline and file not cached)
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    })
  );
  }
});
