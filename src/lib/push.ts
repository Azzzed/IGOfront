/**
 * IGO Manager — Push notification helpers
 *
 * Funciones preparatorias para el sistema de notificaciones web push.
 * La suscripción real del usuario se implementa en el siguiente prompt.
 */

/**
 * Verifica si el navegador soporta todas las APIs necesarias para
 * web push: Service Worker, PushManager y la Notification API.
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Devuelve el estado actual del permiso de notificaciones.
 * Retorna 'default' si la API no está disponible.
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'default';
  }
  return Notification.permission;
}

/**
 * Convierte la VAPID public key en base64url a un Uint8Array.
 * Necesario para suscribir al usuario en pushManager.subscribe().
 *
 * @example
 *   const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
 *   await registration.pushManager.subscribe({ applicationServerKey, userVisibleOnly: true });
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  // Restaurar el padding que la codificación base64url omite
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData  = window.atob(base64);
  // Usar new Uint8Array(n) garantiza ArrayBuffer (no SharedArrayBuffer),
  // requerido por applicationServerKey en TypeScript 6.
  const result   = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    result[i] = rawData.charCodeAt(i);
  }
  return result;
}
