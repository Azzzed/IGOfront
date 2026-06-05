/**
 * AuthGate — rehidratación de sesión al arrancar la app
 *
 * Si existe un token al montar, llama a /auth/me antes de pintar rutas.
 * Mientras tanto muestra el loader orgánico en pantalla completa.
 */

import { useEffect, useState } from 'react';
import { OrganicLoader } from '@/components/common/OrganicLoader';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import type { ApiResponse } from '@/types/auth.types';
import type { User } from '@/types/auth.types';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const [hydrating, setHydrating] = useState(
    () => !!localStorage.getItem('igo_token'),
  );

  useEffect(() => {
    const token = localStorage.getItem('igo_token');
    if (!token) { setHydrating(false); return; }

    api
      .get<ApiResponse<{ user: User }>>('/auth/me')
      .then((res) => { useAuthStore.getState().setUser(res.data.data.user); })
      .catch(() => { /* 401 → interceptor llamó expireSession(); red → procede sin user */ })
      .finally(() => setHydrating(false));
  }, []);

  if (hydrating) {
    return (
      <OrganicLoader
        variant="dark"
        size="lg"
        fullScreen
      />
    );
  }

  return <>{children}</>;
}
