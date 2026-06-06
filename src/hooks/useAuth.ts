import { useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';
import type {
  LoginRequest,
  RegistroRequest,
  AuthResponse,
  InvitadoResponse,
  MigrarInvitadoRequest,
  User,
} from '@/types/auth.types';
import type { ApiResponse } from '@/types/auth.types';

export function useAuth() {
  const { setAuth, setUser, clearAuth, isAuthenticated, user } = useAuthStore();

  const login = useCallback(
    async (data: LoginRequest): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/login', data);
      const { token, user: u } = response.data.data;
      setAuth(u, token);
      return response.data;
    },
    [setAuth],
  );

  const registro = useCallback(
    async (data: RegistroRequest): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>('/auth/registro', data);
      const { token, user: u } = response.data.data;
      setAuth(u, token);
      return response.data;
    },
    [setAuth],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch {
      // token might already be expired
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const fetchMe = useCallback(async (): Promise<User> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    const u = response.data.data.user;
    setUser(u);
    return u;
  }, [setUser]);

  const crearInvitado = useCallback(async (): Promise<InvitadoResponse> => {
    const response = await api.post<InvitadoResponse>('/auth/invitado', {
      consentimiento: true,
    });
    const { token, user: u } = response.data.data;
    setAuth(u, token);
    return response.data;
  }, [setAuth]);

  const migrarInvitado = useCallback(
    async (data: MigrarInvitadoRequest): Promise<AuthResponse> => {
      const response = await api.post<AuthResponse>(
        '/auth/invitado/migrar',
        data,
      );
      const { token, user: u } = response.data.data;
      setAuth(u, token);
      toast.success('Cuenta creada. Tus datos han sido transferidos.');
      return response.data;
    },
    [setAuth],
  );

  /**
   * upgrade — convierte la sesión de exploración (invitado) en cuenta registrada
   * IN-PLACE, sin crear un usuario nuevo ni mover datos.
   *
   * El backend identifica al invitado por el Bearer token (que el interceptor de
   * axios ya adjunta automáticamente), actualiza la MISMA fila y conserva todas
   * sus empresas. Esto reemplaza el flujo frágil que llamaba a /auth/registro
   * (creaba cuenta nueva vacía y dejaba la empresa huérfana en el invitado).
   *
   * Respuesta tolerante: si devuelve token nuevo → rota sesión; si solo devuelve
   * user → conserva el token actual; si no devuelve user → re-consulta /auth/me.
   */
  const upgrade = useCallback(
    async (data: RegistroRequest): Promise<void> => {
      const response = await api.post<AuthResponse>('/auth/upgrade', data);
      const payload = response.data?.data as Partial<{ token: string; user: User }> | undefined;

      if (payload?.token && payload?.user) {
        setAuth(payload.user, payload.token);
      } else if (payload?.user) {
        setUser(payload.user);
      } else {
        await fetchMe();
      }
    },
    [setAuth, setUser, fetchMe],
  );

  return {
    login,
    registro,
    logout,
    fetchMe,
    crearInvitado,
    migrarInvitado,
    upgrade,
    isAuthenticated,
    user,
  };
}
