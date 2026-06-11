/**
 * IGO Manager — usePushNotifications
 *
 * Gestiona el ciclo completo de suscripción a Web Push:
 *  - Detecta soporte / permiso
 *  - activar():    requestPermission → VAPID key → subscribe → POST /push/suscribir
 *  - desactivar(): DELETE /push/desuscribir + unsubscribe local
 *  - probar():     POST /push/probar (envía una notificación de prueba al dispositivo)
 *
 * Preferencia por usuario:
 *  - La preferencia se guarda en localStorage con key `igo_push_pref_<userId>`.
 *  - Al montar, si existe preferencia + permiso granted + suscripción SW activa → 'activado'.
 *  - Al desactivar, se elimina la preferencia.
 *  - Esto evita que sesiones de otros usuarios hereden el estado de push.
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import {
  isPushSupported,
  getNotificationPermission,
  urlBase64ToUint8Array,
} from '@/lib/push';

/* ─── Types ─── */

export type PushEstado =
  | 'no-soportado'
  | 'sin-permiso'
  | 'activado'
  | 'desactivado'
  | 'cargando';

export interface UsePushNotificationsResult {
  estado:     PushEstado;
  activar:    () => Promise<void>;
  desactivar: () => Promise<void>;
  probar:     () => Promise<void>;
}

interface ApiError {
  response?: { data?: { message?: string }; status?: number };
}

function extractMsg(err: unknown): string | undefined {
  return (err as ApiError).response?.data?.message;
}

/* ─── Hook ─── */

export function usePushNotifications(): UsePushNotificationsResult {
  const userId  = useAuthStore((s) => s.user?.id ?? null);
  const prefKey = userId !== null ? `igo_push_pref_${userId}` : null;

  const [estado, setEstado] = useState<PushEstado>(() => {
    if (!isPushSupported())                          return 'no-soportado';
    if (getNotificationPermission() === 'denied')    return 'sin-permiso';
    return 'desactivado';
  });

  /* Restaurar estado si el usuario ya activó notificaciones antes */
  useEffect(() => {
    if (!isPushSupported()) return;

    if (getNotificationPermission() === 'denied') {
      setEstado('sin-permiso');
      return;
    }

    if (!prefKey || !localStorage.getItem(prefKey)) return;
    if (getNotificationPermission() !== 'granted') return;

    void navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => { if (sub) setEstado('activado'); })
      .catch(() => { /* suscripción inaccesible — dejamos en desactivado */ });
  }, [prefKey]);

  /* ── activar ── */
  const activar = useCallback(async () => {
    if (!isPushSupported()) return;
    setEstado('cargando');

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setEstado('sin-permiso');
        toast.error('Notificaciones bloqueadas. Habilítalas en la configuración del navegador.');
        return;
      }

      const keyRes = await api.get<{ success: boolean; data: { public_key: string } }>(
        '/push/vapid-public-key',
      );
      const vapidKey = keyRes.data.data.public_key;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json   = sub.toJSON();
      const p256dh = (json.keys ?? {})['p256dh'] ?? '';
      const auth   = (json.keys ?? {})['auth']   ?? '';

      if (!json.endpoint || !p256dh || !auth) {
        throw new Error('Suscripción inválida: faltan datos de cifrado');
      }

      await api.post('/push/suscribir', {
        endpoint:        json.endpoint,
        keys:            { p256dh, auth },
        contentEncoding: 'aes128gcm',
      });

      /* Guardar preferencia para este usuario */
      if (prefKey) localStorage.setItem(prefKey, '1');

      setEstado('activado');
      toast.success('Notificaciones activadas ✓');
    } catch (err: unknown) {
      setEstado(getNotificationPermission() === 'denied' ? 'sin-permiso' : 'desactivado');
      toast.error(extractMsg(err) ?? 'No se pudieron activar las notificaciones');
    }
  }, [prefKey]);

  /* ── desactivar ── */
  const desactivar = useCallback(async () => {
    if (!isPushSupported()) return;
    setEstado('cargando');

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        await api.delete('/push/desuscribir', {
          data: { endpoint: sub.endpoint },
        });
        await sub.unsubscribe();
      }

      /* Limpiar preferencia guardada */
      if (prefKey) localStorage.removeItem(prefKey);

      setEstado('desactivado');
      toast.success('Notificaciones desactivadas');
    } catch (err: unknown) {
      setEstado('activado');
      toast.error(extractMsg(err) ?? 'Error al desactivar notificaciones');
    }
  }, [prefKey]);

  /* ── probar ── */
  const probar = useCallback(async () => {
    interface ProbarPreview { title: string; body: string; url: string; icon?: string }
    interface ProbarResponse {
      success: boolean;
      data?:   { enviadas: number; preview?: ProbarPreview | null };
      message?: string;
    }

    try {
      const res = await api.post<ProbarResponse>('/push/probar');
      const preview = res.data.data?.preview ?? null;

      if (preview) {
        toast.success(`✓ Enviada: "${preview.title}"`, { description: preview.body, duration: 6000 });
      } else {
        toast.success('Notificación de prueba enviada ✓', {
          description: 'Revisa las notificaciones de tu sistema operativo',
          duration: 5000,
        });
      }
    } catch (err: unknown) {
      const msg = extractMsg(err);
      if (msg?.toLowerCase().includes('notificaciones activadas') || msg?.toLowerCase().includes('suscripci')) {
        toast.error('Activa las notificaciones primero para enviar una prueba');
      } else {
        toast.error(msg ?? 'Error al enviar notificación de prueba');
      }
    }
  }, []);

  return { estado, activar, desactivar, probar };
}
