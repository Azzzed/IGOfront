import axios from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  withCredentials: true,
});

/* ── Request: inyectar Bearer token ─────────────────────────────── */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('igo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ── Response: token refresh + manejo de 401 ────────────────────── */

api.interceptors.response.use(
  (response) => {
    /*
     * Renovación transparente de token.
     * El backend envía X-Refreshed-Token cuando está a punto de expirar.
     * Lo reemplazamos sin interrumpir al usuario.
     */
    const refreshed = response.headers['x-refreshed-token'];
    if (typeof refreshed === 'string' && refreshed.length > 0) {
      useAuthStore.getState().refreshToken(refreshed);
    }

    return response;
  },

  (error: unknown) => {
    const status = (error as { response?: { status?: number } }).response?.status;

    if (status === 401) {
      const { isAuthenticated, expireSession } = useAuthStore.getState();

      /*
       * Solo actuamos si había una sesión activa.
       * Esto evita loops cuando el propio /login o un endpoint público
       * devuelve 401 mientras el usuario no está autenticado.
       */
      if (isAuthenticated) {
        expireSession();          // limpia store + localStorage, sessionStatus → 'expired'
        toast.error(             // Sonner sobrevive a los cambios de ruta
          'Tu sesión expiró. Inicia sesión de nuevo.',
          { id: 'session-expired', duration: 5000 },
        );
        /*
         * NO hacemos window.location.href aquí.
         * ProtectedRoute suscribe a isAuthenticated: en cuanto el store
         * lo pone a false, React Router redirige a /login sin full-reload,
         * manteniendo el estado de Zustand (incluido sessionStatus:'expired').
         */
      }
    }

    return Promise.reject(error);
  },
);

export default api;
