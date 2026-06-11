/// <reference lib="webworker" />

/**
 * IGO Manager — Service Worker
 *
 * Estrategia: injectManifest (vite-plugin-pwa)
 *  • Workbox precachea todos los assets estáticos (JS, CSS, HTML, imágenes, fuentes).
 *  • Las llamadas a la API (Railway) van cross-origin → el SW nunca las intercepta.
 *  • En dev el proxy Vite mapea /api → localhost, lo excluimos del fallback de nav.
 *  • Manejamos eventos push y notificationclick para notificaciones web push.
 */

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import type { PrecacheEntry } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

/* ── Tipos globales del SW ──────────────────────────────────────── */

declare const self: ServiceWorkerGlobalScope & {
  /** Inyectado por vite-plugin-pwa en build time */
  __WB_MANIFEST: ReadonlyArray<PrecacheEntry | string>;
};

/* ── Precaché de assets estáticos ───────────────────────────────── */

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

/* ── SPA Navigation fallback: sirve index.html para todas las rutas
      excepto /api (en dev) y dominios externos (automático, cross-origin) ── */

registerRoute(
  new NavigationRoute(
    async () => {
      const cached = await caches.match('/index.html');
      return cached ?? fetch('/index.html');
    },
    {
      // Excluye rutas que empiezan con /api del fallback SPA
      denylist: [/^\/api/],
    },
  ),
);

/* ── Activar inmediatamente sin esperar reload ──────────────────── */

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

/* ── Push notification recibida ─────────────────────────────────── */

self.addEventListener('push', (event) => {
  interface PushPayload {
    title?: string;
    body?:  string;
    icon?:  string;
    url?:   string;
  }

  const data: PushPayload = (event.data?.json() as PushPayload | undefined) ?? {};

  const title   = data.title ?? 'IGO Manager';
  /* Todas las notificaciones llevan al usuario a la Matriz IGO por defecto.
     El backend puede enviar una url específica y esa tendrá prioridad. */
  const targetUrl = (data.url && data.url !== '/') ? data.url : '/matriz';
  const options: NotificationOptions = {
    body:    data.body    ?? '',
    icon:    data.icon    ?? '/icons/icon-192.png',
    badge:   '/icons/icon-192.png',
    data:    { url: targetUrl },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(title, options),
  );
});

/* ── Notificación tocada / clic ─────────────────────────────────── */

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  interface NotifData { url?: string }
  const url = (event.notification.data as NotifData | null)?.url ?? '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Si la app ya está abierta, enfócala
        for (const client of clients) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus();
          }
        }
        // Si no, abre una nueva ventana
        return self.clients.openWindow(url);
      }),
  );
});
