/* Service worker de Sala Privada: hace la app instalable y muestra las notificaciones push. */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Chrome necesita un manejador de fetch para ofrecer la instalación; dejamos pasar todo a la red.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  let datos;
  try {
    datos = event.data ? event.data.json() : {};
  } catch {
    datos = { body: event.data ? event.data.text() : '' };
  }

  const titulo = datos.title || 'Sala Privada';
  const opciones = {
    body: datos.body || '',
    icon: datos.icon || '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    tag: datos.tag,
    renotify: Boolean(datos.tag),
    data: { url: datos.url || '/' }
  };

  event.waitUntil(self.registration.showNotification(titulo, opciones));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const destino = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((ventanas) => {
      for (const ventana of ventanas) {
        if (ventana.url.startsWith(self.location.origin) && 'focus' in ventana) {
          ventana.navigate(destino);
          return ventana.focus();
        }
      }
      return self.clients.openWindow(destino);
    })
  );
});
