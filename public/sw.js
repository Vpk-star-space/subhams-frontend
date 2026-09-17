/* eslint-disable no-restricted-globals */

self.addEventListener('install', (e) => {
  console.log('[Service Worker] Installed properly');
  self.skipWaiting(); 
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => {
      console.log('[Service Worker] Network request failed (Offline)');
    })
  );
});

// ==========================================
// 🟢 PUSH NOTIFICATION (TRUECALLER STYLE MOBILE FIX)
// ==========================================
self.addEventListener('push', function(event) {
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (err) {
            data = { body: event.data.text() };
        }
    }
    
    const title = data.title || "Subhams PMMS";
    
    const options = {
        body: data.body || "New financial update available.",
        icon: "/logo192.png", 
        badge: "/logo192.png",
        // 🔥 The SOS pattern: Forces Android to recognize it as an alarm
        vibrate: [500, 250, 500, 250, 500, 250, 500, 250, 500], 
        requireInteraction: true, 
        priority: "high", 
        // 🟢 THESE TWO LINES FORCE ANDROID TO POP IT ON SCREEN INSTEAD OF TRAY
        tag: "pmms-urgent-alert-" + Date.now(), // Unique tag prevents grouping
        renotify: true, // Forces Android to alert again even if a previous one exists
        silent: data.silent || false,
        data: {
            url: data.url || "/" 
        }
    };

    // If the user enabled silent mode in their profile, mute it
    if (data.silent) {
        options.vibrate = [];
        options.silent = true;
    }

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close(); 

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