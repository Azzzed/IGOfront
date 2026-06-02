/**
 * IGO Manager — usePushNotifications
 *
 * Gestiona el ciclo completo de suscripción a Web Push:
 *  - Detecta soporte / permiso
 *  - activar():    requestPermission → VAPID key → subscribe → POST /push/suscribir
 *  - desactivar(): DELETE /push/desuscribir + unsubscribe local
 *  - probar():     POST /push/probar (envía una notificación de prueba al dispositivo)
 *
 * Al montar verifica si ya existe suscripción activa para reflejar el estado real.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import {
  isPushSupported,
  getNotificationPermission,
  urlBase64ToUint8Array,
} from '@/lib/push';

/* ─── Types ─── */

export type PushEstado =
  | 'no-soportado'   // browser sin APIs de push
  | 'sin-permiso'    // permiso denegado por el usuario
  | 'activado'       // suscripción activa en backend
  | 'desactivado'    // soportado y con permiso, pero sin suscripción
  | 'cargando';      // operación en curso o verificación inicial

export interface UsePushNotificationsResult {
  estado:     PushEstado;
  activar:    () => Promise<void>;
  desactivar: () => Promise<void>;
  probar:     () => Promise<void>;
}

/* ─── Internal helper ─── */

interface ApiError {
  response?: { data?: { message?: string }; status?: number };
}

function extractMsg(err: unknown): string | undefined {
  return (err as ApiError).response?.data?.message;
}

/* ─── Hook ─── */

export function usePushNotifications(): UsePushNotificationsResult {
  const [estado, setEstado] = useState<PushEstado>(() => {
    if (!isPushSupported())                          return 'no-soportado';
    if (getNotificationPermission() === 'denied')    return 'sin-permiso';
    return 'cargando'; // mount effect resolves actual state
  });

  /* Verificar suscripción existente al montar */
  useEffect(() => {
    if (!isPushSupported()) return;
    if (getNotificationPermission() === 'denied') {
      setEstado('sin-permiso');
      return;
    }
    navigator.serviceWorker.ready
      .then(async (reg) => {
        const sub = await reg.pushManager.getSubscription();
        setEstado(sub ? 'activado' : 'desactivado');
      })
      .catch(() => setEstado('desactivado'));
  }, []);

  /* ── activar ────────────────────────────────────────────────────── */
  const activar = useCallback(async () => {
    if (!isPushSupported()) return;
    setEstado('cargando');

    try {
      /* 1. Pedir permiso */
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setEstado('sin-permiso');
        toast.error('Notificaciones bloqueadas. Habilítalas en la configuración del navegador.');
        return;
      }

      /* 2. Obtener VAPID public key del backend */
      const keyRes = await api.get<{ success: boolean; data: { public_key: string } }>(
        '/push/vapid-public-key',
      );
      const vapidKey = keyRes.data.data.public_key;

      /* 3. Suscribir en el pushManager del SW */
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      /* 4. Extraer endpoint y keys */
      const json   = sub.toJSON();
      const p256dh = (json.keys ?? {})['p256dh'] ?? '';
      const auth   = (json.keys ?? {})['auth']   ?? '';

      if (!json.endpoint || !p256dh || !auth) {
        throw new Error('Suscripción inválida: faltan datos de cifrado');
      }

      /* 5. Registrar en el backend */
      await api.post('/push/suscribir', {
        endpoint:        json.endpoint,
        keys:            { p256dh, auth },
        contentEncoding: 'aes128gcm',
      });

      setEstado('activado');
      toast.success('Notificaciones activadas ✓');
    } catch (err: unknown) {
      /* Restaurar estado correcto según permiso actual */
      setEstado(getNotificationPermission() === 'denied' ? 'sin-permiso' : 'desactivado');
      toast.error(extractMsg(err) ?? 'No se pudieron activar las notificaciones');
    }
  }, []);

  /* ── desactivar ─────────────────────────────────────────────────── */
  const desactivar = useCallback(async () => {
    if (!isPushSupported()) return;
    setEstado('cargando');

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        /* 1. Eliminar en el backend */
        await api.delete('/push/desuscribir', {
          data: { endpoint: sub.endpoint },
        });
        /* 2. Desuscribir localmente */
        await sub.unsubscribe();
      }

      setEstado('desactivado');
      toast.success('Notificaciones desactivadas');
    } catch (err: unknown) {
      setEstado('activado'); // revertir optimista
      toast.error(extractMsg(err) ?? 'Error al desactivar notificaciones');
    }
  }, []);

  /* ── probar ─────────────────────────────────────────────────────── */
  const probar = useCallback(async () => {
    try {
      await api.post('/push/probar');
      toast.success('Notificación de prueba enviada — revisa tus notificaciones del sistema', {
        duration: 5000,
      });
    } catch (err: unknown) {
      toast.error(extractMsg(err) ?? 'Error al enviar notificación de prueba');
    }
  }, []);

  return { estado, activar, desactivar, probar };
}
