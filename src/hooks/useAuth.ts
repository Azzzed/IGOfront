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

  return {
    login,
    registro,
    logout,
    fetchMe,
    crearInvitado,
    migrarInvitado,
    isAuthenticated,
    user,
  };
}
