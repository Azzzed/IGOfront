import type { ApiResponse } from './auth.types';

export type Sector =
  | 'agro'
  | 'calzado_moda'
  | 'tecnologia'
  | 'servicios'
  | 'comercio'
  | 'salud'
  | 'turismo'
  | 'educacion'
  | 'manufactura'
  | 'otro';

export type Tamano = 'idea' | 'micro' | 'pequena' | 'mediana' | 'grande';

export type GeneroEmpresario = 'hombre' | 'mujer' | 'otro';

export type RangoEdad = '18-25' | '26-35' | '36-45' | '46-55' | '56+';

export interface Empresa {
  id: number;
  user_id: number;
  nombre: string;
  sector: Sector;
  tamano: Tamano;
  genero_empresario: GeneroEmpresario;
  rango_edad: RangoEdad;
  pais: string;
  ciudad: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmpresaRequest {
  nombre: string;
  sector: Sector;
  tamano: Tamano;
  genero_empresario: GeneroEmpresario;
  rango_edad: RangoEdad;
  pais: string;
  ciudad: string;
}

export type EmpresaResponse     = ApiResponse<{ empresa: Empresa }>;
export type EmpresasListResponse = ApiResponse<{ empresas: Empresa[] }>;
