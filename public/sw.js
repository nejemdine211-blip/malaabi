// ✅ Service Worker آمن — يخزّن الصور فقط، ولا يتدخّل إطلاقاً في كود التطبيق (HTML/JS/CSS)
// هذا يضمن أن كود التطبيق يُحمَّل من الشبكة دائماً طازجاً وبلا أي نسخة قديمة عالقة،
// بينما تبقى الصور مخزَّنة لتسريع التحميل ودعم العمل دون إنترنت جزئياً.
const CACHE_NAME = 'malaabi-cache-v3';
const IMAGE_EXT = /\.(png|jpg|jpeg|webp|svg|gif|ico)$/i;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // 🔒 لا نلمس أي شيء غير GET، ولا أي طلب تنقّل (HTML)، ولا وحدات الجافاسكريبت — تبقى كلها طازجة من الشبكة دائماً
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') return;
  if (!IMAGE_EXT.test(new URL(req.url).pathname)) return;

  // 🖼 الصور فقط: شبكة أولاً، وتخزين فعلي عند النجاح، ونسخة مخزَّنة عند انقطاع الشبكة فقط
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        }
        return response;
      })
      .catch(() => caches.match(req))
  );
});