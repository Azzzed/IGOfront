import type { ApiResponse } from './auth.types';

export type Categoria =
  | 'gestion_operativa'
  | 'tecnologia_informacion'
  | 'gestion_financiera'
  | 'cadena_suministro'
  | 'talento_humano'
  | 'comercial_ventas'
  | 'legal_cumplimiento'
  | 'otro';

export type ValorIGO = 1 | 2 | 3 | 4 | 5;
export type Cuadrante = 1 | 2 | 3 | 4;

export interface Iniciativa {
  id: number;
  empresa_id: number;
  titulo: string;
  categoria: Categoria;
  importancia: ValorIGO;
  gobernabilidad: ValorIGO;
  cuadrante: Cuadrante;
  created_at: string;
  updated_at: string;
}

export interface Asintota {
  importancia: number;
  gobernabilidad: number;
}

export interface MatrizData {
  iniciativas: Iniciativa[];
  asintotas: Asintota;
}

export interface IniciativaRequest {
  titulo: string;
  categoria: Categoria;
  importancia: number;
  gobernabilidad: number;
}

export type IniciativaResponse      = ApiResponse<{ iniciativa: Iniciativa }>;
export type IniciativasListResponse = ApiResponse<{ iniciativas: Iniciativa[] }>;
export type MatrizResponse          = ApiResponse<MatrizData>;
