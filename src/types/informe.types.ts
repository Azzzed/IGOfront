import type { ApiResponse } from './auth.types';
import type { Cuadrante, Categoria, Asintota } from './iniciativa.types';

export interface AccionInforme {
  titulo: string;
  descripcion: string;
}

export interface IniciativaInforme {
  id: number;
  titulo: string;
  cuadrante: Cuadrante;
  etiqueta: string;
  categoria: Categoria;
  importancia: number;
  gobernabilidad: number;
  acciones: AccionInforme[];
}

export interface InformeTotales {
  evaluadas: number;
  hacer_ya: number;
  estrategico: number;
  rutina: number;
  descartar: number;
}

export interface InformeContenido {
  empresa?: string;
  sector?: string;
  fecha?: string;
  resumen: string;
  asintotas: Asintota;
  totales?: InformeTotales;
  iniciativas: IniciativaInforme[];
}

export interface InformeDB {
  id: number;
  empresa_id: number;
  contenido: InformeContenido;   // InformeResource devuelve "contenido", no "contenido_json"
  asintotas: Asintota;           // InformeResource devuelve "asintotas", no "asintotas_json"
  created_at: string;
}

export type InformeResponse = ApiResponse<{ informe: InformeDB }>;
