import { create } from 'zustand';
import type { User } from '@/types/auth.types';
import { useEmpresaStore } from '@/store/empresaStore';

/**
 * sessionStatus distingue tres situaciones distintas:
 *   'idle'    — nunca hubo sesión en este browser (o fue cerrada limpiamente)
 *   'active'  — sesión activa con token válido
 *   'expired' — había sesión pero el token expiró (el backend devolvió 401)
 *
 * Esto evita que "sesión expirada" se confunda con "modo invitado":
 * la UI de cuenta exploratoria solo debe mostrarse cuando sessionStatus === 'idle'.
 */
export type SessionStatus = 'idle' | 'active' | 'expired';

interface AuthState {
  user:            User | null;
  token:           string | null;
  isAuthenticated: boolean;
  sessionStatus:   SessionStatus;

  /** Login exitoso / registro / invitado creado */
  setAuth: (user: User, token: string) => void;
  /** Actualizar solo el objeto usuario (sin cambiar token) */
  setUser: (user: User) => void;
  /** Logout limpio iniciado por el propio usuario */
  clearAuth: () => void;
  /**
   * Llamado por el interceptor 401.
   * Limpia credenciales y marca la sesión como EXPIRADA (no como invitado).
   */
  expireSession: () => void;
  /**
   * Actualiza el token en memoria y localStorage cuando el backend devuelve
   * X-Refreshed-Token, sin interrumpir al usuario.
   */
  refreshToken: (newToken: string) => void;
  /** Vuelve a 'idle' una vez que LoginPage mostró el toast de sesión expirada */
  resetSessionStatus: () => void;
}

/** Limpia empresa en memoria + localStorage persistido */
function clearEmpresaStore() {
  const s = useEmpresaStore.getState();
  s.setEmpresaActiva(null);
  s.setEmpresas([]);
}

export const useAuthStore = create<AuthState>((set) => ({
  user:            null,
  token:           localStorage.getItem('igo_token'),
  /* Si ya hay token asumimos 'active'; el primer 401 lo corregirá a 'expired' */
  isAuthenticated: !!localStorage.getItem('igo_token'),
  sessionStatus:   localStorage.getItem('igo_token') ? 'active' : 'idle',

  setAuth: (user, token) => {
    localStorage.setItem('igo_token', token);
    set({ user, token, isAuthenticated: true, sessionStatus: 'active' });
  },

  setUser: (user) => set({ user }),

  clearAuth: () => {
    localStorage.removeItem('igo_token');
    clearEmpresaStore();
    set({ user: null, token: null, isAuthenticated: false, sessionStatus: 'idle' });
  },

  expireSession: () => {
    localStorage.removeItem('igo_token');
    clearEmpresaStore();
    set({ user: null, token: null, isAuthenticated: false, sessionStatus: 'expired' });
  },

  refreshToken: (newToken) => {
    localStorage.setItem('igo_token', newToken);
    set({ token: newToken });
  },

  resetSessionStatus: () => set({ sessionStatus: 'idle' }),
}));
