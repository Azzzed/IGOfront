import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SLIDER_COLORS: Record<number, string> = {
  1: '#EF4444',
  2: '#F97316',
  3: '#EAB308',
  4: '#84CC16',
  5: '#22C55E',
};

export function getSliderColor(value: number): string {
  return SLIDER_COLORS[value] ?? '#EAB308';
}

const LABELS_IMP: Record<number, string> = {
  1: 'No impacta en los resultados del negocio',
  2: 'Algo de impacto, pero puede esperar',
  3: 'Impacta en resultados clave del negocio',
  4: 'Alta prioridad — define el éxito de la empresa',
  5: 'Crítico — sin esto el negocio no avanza',
};

const LABELS_GOB: Record<number, string> = {
  1: 'No está en nuestras manos ejecutarlo ahora',
  2: 'Tenemos limitantes importantes para hacerlo',
  3: 'Podemos avanzar con los recursos actuales',
  4: 'Tenemos el equipo y los medios necesarios',
  5: 'Está completamente en nuestras manos ejecutarlo hoy',
};

export function getSliderLabel(value: number, tipo: 'imp' | 'gob'): string {
  return tipo === 'imp'
    ? (LABELS_IMP[value] ?? '')
    : (LABELS_GOB[value] ?? '');
}

export const CUADRANTES = {
  1: { label: '¡Hacer ya!',  color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', badgeClass: 'q1-badge' },
  2: { label: 'Estratégico', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', badgeClass: 'q2-badge' },
  3: { label: 'Rutina',      color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', badgeClass: 'q3-badge' },
  4: { label: 'Descartar',   color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB', badgeClass: 'q4-badge' },
} as const;

export type CuadranteKey = keyof typeof CUADRANTES;

export const SECTOR_OPTIONS = [
  { value: 'agro',              label: 'Agropecuario' },
  { value: 'calzado_moda',      label: 'Calzado y Moda' },
  { value: 'tecnologia',        label: 'Tecnología' },
  { value: 'servicios',         label: 'Servicios' },
  { value: 'comercio',          label: 'Comercio' },
  { value: 'salud',             label: 'Salud' },
  { value: 'turismo',           label: 'Turismo' },
  { value: 'educacion',         label: 'Educación' },
  { value: 'manufactura',       label: 'Manufactura' },
  { value: 'otro',              label: 'Otro' },
] as const;

export const TAMANO_OPTIONS = [
  { value: 'idea',    label: 'Idea / Proyecto' },
  { value: 'micro',   label: 'Micro empresa' },
  { value: 'pequena', label: 'Pequeña empresa' },
  { value: 'mediana', label: 'Mediana empresa' },
  { value: 'grande',  label: 'Gran empresa' },
] as const;

export const GENERO_OPTIONS = [
  { value: 'hombre', label: 'Hombre' },
  { value: 'mujer',  label: 'Mujer' },
  { value: 'otro',   label: 'Prefiero no decirlo' },
] as const;

export const EDAD_OPTIONS = [
  { value: '18-25', label: '18 – 25 años' },
  { value: '26-35', label: '26 – 35 años' },
  { value: '36-45', label: '36 – 45 años' },
  { value: '46-55', label: '46 – 55 años' },
  { value: '56+',   label: '56 años o más' },
] as const;

export const CATEGORIA_OPTIONS = [
  { value: 'gestion_operativa',     label: 'Gestión operativa' },
  { value: 'tecnologia_informacion',label: 'Tecnología e información' },
  { value: 'gestion_financiera',    label: 'Gestión financiera' },
  { value: 'cadena_suministro',     label: 'Cadena de suministro' },
  { value: 'talento_humano',        label: 'Talento humano' },
  { value: 'comercial_ventas',      label: 'Comercial y ventas' },
  { value: 'legal_cumplimiento',    label: 'Legal y cumplimiento' },
  { value: 'otro',                  label: 'Otro' },
] as const;

export const ESTADO_PLAN_OPTIONS = [
  { value: 'pendiente',   label: 'Pendiente',    color: '#94A3B8' },
  { value: 'en_proceso',  label: 'En proceso',   color: '#3B82F6' },
  { value: 'terminado',   label: 'Terminado',    color: '#22C55E' },
  { value: 'abortado',    label: 'Abortado',     color: '#EF4444' },
] as const;

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr));
}
