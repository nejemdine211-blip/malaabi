// 🔒 تم إيقاف Service Worker نهائياً — هذا الملف فارغ عمداً.
// أي نسخة قديمة مسجَّلة عند المستخدمين سيتم إلغاؤها تلقائياً عبر index.html
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => client.navigate(client.url));
    })
  );
});