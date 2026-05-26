export interface User {
  id: number;
  tipo: 'invitado' | 'registrado';
  nombre: string | null;
  email: string | null;
  token_invitado: string | null;
  consentimiento: boolean;
  fecha_consentimiento: string | null;
  version_politica: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface InvitadoAuthData {
  token: string;
  token_invitado: string;
  user: User;
}

export type AuthResponse     = ApiResponse<AuthData>;
export type InvitadoResponse = ApiResponse<InvitadoAuthData>;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest {
  nombre: string;
  email: string;
  password: string;
  password_confirmation: string;
  consentimiento: boolean;
}

export interface InvitadoRequest {
  consentimiento: boolean;
}

export interface MigrarInvitadoRequest {
  token_invitado: string;
  nombre: string;
  email: string;
  password: string;
  password_confirmation: string;
  consentimiento: boolean;
}
