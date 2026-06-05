/**
 * AuthGate — rehidratación de sesión al arrancar la app
 *
 * Problema que resuelve:
 *   El authStore inicializa user:null aunque haya un token válido en localStorage.
 *   Sin este componente, toda visita (o recarga) arranca con user:null y el
 *   UserSheet muestra "Modo exploración" mientras las empresas siguen visibles.
 *
 * Solución:
 *   Si existe un token al montar, llama a /auth/me antes de pintar cualquier ruta.
 *   - 200 → setUser() hidrata el objeto usuario en el store
 *   - 401 → el interceptor de axios ya llama expireSession() + toast
 *   - Error de red → procede sin user (la UX degradada es aceptable offline)
 *
 * Mientras se resuelve la llamada muestra un spinner de pantalla completa
 * para que el usuario nunca vea el estado inconsistente user:null con token activo.
 */

import { useEffect, useState } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import type { ApiResponse } from '@/types/auth.types';
import type { User } from '@/types/auth.types';

/* ─── Spinner de pantalla completa ─── */
function HydrationScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
      }}
    >
      {/* Brand mark — igual que LoginPage */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TrendingUp size={20} color="white" strokeWidth={2.5} />
      </div>

      <Loader2
        size={20}
        strokeWidth={1.5}
        color="#9CA3AF"
        className="animate-spin"
      />
    </div>
  );
}

/* ─── AuthGate ─── */
interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  /*
   * hydrating:
   *   true  → hay token, la verificación /auth/me está en vuelo, no pintar rutas
   *   false → sin token (nunca inició sesión) O la verificación ya resolvió
   */
  const [hydrating, setHydrating] = useState(
    () => !!localStorage.getItem('igo_token'),
  );

  useEffect(() => {
    /* Leemos localStorage directamente para evitar dependencias en el array */
    const token = localStorage.getItem('igo_token');

    if (!token) {
      /* Sin token no hay nada que verificar */
      setHydrating(false);
      return;
    }

    api
      .get<ApiResponse<{ user: User }>>('/auth/me')
      .then((res) => {
        /* Éxito: hidratamos el objeto usuario en el store */
        useAuthStore.getState().setUser(res.data.data.user);
      })
      .catch(() => {
        /*
         * 401 → el interceptor de axios ya llamó expireSession() + toast.
         *       Solo necesitamos dejar de mostrar el spinner.
         * Red  → el token podría ser válido; procedemos sin user para no
         *        bloquear al usuario sin conexión.
         */
      })
      .finally(() => setHydrating(false));
  }, []); /* Solo al montar — la hidratación es un evento de arranque */

  if (hydrating) return <HydrationScreen />;

  return <>{children}</>;
}
