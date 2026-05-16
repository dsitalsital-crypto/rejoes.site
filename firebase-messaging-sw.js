// Firebase Messaging Service Worker
// Must be at the root to receive push notifications
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBI2teHmn00s6KvrmMWRhOpi3Jfa27K_xo",
  authDomain: "rijnstockmanagement.firebaseapp.com",
  projectId: "rijnstockmanagement",
  storageBucket: "rijnstockmanagement.firebasestorage.app",
  messagingSenderId: "179354843916",
  appId: "1:179354843916:web:c6137cca4caa060146e729"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);
  const title = payload.notification?.title || 'Rejoes Stock';
  const body = payload.notification?.body || 'Nieuwe melding';
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'rejoes-push',
    requireInteraction: false,
    data: { url: '/application/' }
  });
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/application/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('/application/');
    })
  );
});
