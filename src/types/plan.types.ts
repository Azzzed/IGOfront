import type { ApiResponse } from './auth.types';

export type EstadoPlan = 'pendiente' | 'en_proceso' | 'terminado' | 'abortado';

export interface PlanAccion {
  id: number;
  iniciativa_id: number;
  deadline: string | null;
  presupuesto: number | null;
  aliados: string | null;
  estado: EstadoPlan;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanAccionRequest {
  deadline?: string;
  presupuesto?: number;
  aliados?: string;
  estado: EstadoPlan;
  notas?: string;
}

export type PlanResponse = ApiResponse<{ plan: PlanAccion }>;
