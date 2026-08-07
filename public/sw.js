// ✅ Service Worker صحيح — يخزّن الملفات فعلياً عند النجاح، ويُستعمل كنسخة احتياطية عند انقطاع الشبكة فقط
const CACHE_NAME = 'malaabi-cache-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // 🧹 يحذف أي نسخة كاش قديمة من إصدار سابق تلقائياً
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // 🔒 لا نتدخّل إطلاقاً في طلبات غير GET (مثل الكتابة في Supabase) — أمان وسلامة البيانات
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // ✅ عند نجاح الشبكة: نخزّن نسخة فعلية في الكاش (بخلاف النسخة القديمة المعطوبة)
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      // 📴 عند انقطاع الشبكة فقط: نستعمل النسخة المخزَّنة فعلياً كبديل حقيقي
      .catch(() => caches.match(event.request))
  );
});