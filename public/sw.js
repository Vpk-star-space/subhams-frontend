/* eslint-disable no-restricted-globals */

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Installed properly');
  self.skipWaiting(); // Forces Chrome to activate it immediately
});

self.addEventListener('fetch', (e) => {
  // This satisfies Chrome's PWA requirement by actually handling the fetch
  e.respondWith(
    fetch(e.request).catch(() => {
      console.log('[Service Worker] Network request failed (Offline)');
    })
  );
});

// ==========================================
// 🟢 NEW: PUSH NOTIFICATION LISTENERS
// ==========================================
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    
    const title = data.title || "Subhams PMMS";
    const options = {
        body: data.body || "New financial update available.",
        icon: "/logo192.png", 
        badge: "/logo192.png",
        vibrate: [200, 100, 200], 
        requireInteraction: false, 
        data: {
            url: data.url || "/" 
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // Dismiss notification on click

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});