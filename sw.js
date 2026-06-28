const CACHE_NAME = 'bekir-coach-v1';
const STATIC_FILES = [
  '/Bekir-Coach/',
  '/Bekir-Coach/index.html',
  '/Bekir-Coach/intake.html',
  '/Bekir-Coach/revize.html',
  '/Bekir-Coach/kabul.html',
  '/Bekir-Coach/manifest.json',
];

// Kurulum — statik dosyaları önbelleğe al
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_FILES).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Aktivasyon — eski önbellekleri temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — önce ağdan dene, olmadıysa önbellekten sun
self.addEventListener('fetch', event => {
  // Supabase ve YouTube isteklerini caching yapma
  if (event.request.url.includes('supabase.co') ||
      event.request.url.includes('youtube.com') ||
      event.request.url.includes('emailjs.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Başarılı yanıtı önbelleğe de al
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Ağ yoksa önbellekten sun
        return caches.match(event.request).then(cached => {
          return cached || caches.match('/Bekir-Coach/');
        });
      })
  );
});
