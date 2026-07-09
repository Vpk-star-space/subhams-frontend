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