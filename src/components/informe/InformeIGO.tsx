import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChecklistAccion } from './ChecklistAccion';
import { CUADRANTES, CATEGORIA_OPTIONS } from '@/lib/utils';
import type { InformeDB, IniciativaInforme, InformeTotales } from '@/types/informe.types';
import type { Cuadrante } from '@/types/iniciativa.types';

/* ─── Constants ─── */

const BADGE_STYLES: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
  2: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
  3: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  4: { bg: '#F9FAFB', text: '#4B5563', border: '#E5E7EB' },
};

const NIVEL_LABELS: Record<number, string> = {
  1: '1° NIVEL · ARRANCA ESTA SEMANA',
  2: '2° NIVEL · PLANIFICA RECURSOS',
  3: '3° NIVEL · DELEGA O SISTEMATIZA',
  4: '4° NIVEL · DESCARTA POR AHORA',
};

const METRICA_CONFIG: {
  key: keyof InformeTotales;
  label: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  { key: 'evaluadas',   label: 'Total',       color: '#0A0A0A', bg: 'rgba(0,0,0,0.03)', border: 'rgba(0,0,0,0.08)' },
  { key: 'hacer_ya',    label: 'Hacer ya',    color: '#16A34A', bg: '#F0FDF4',           border: '#BBF7D0' },
  { key: 'estrategico', label: 'Estratégico', color: '#2563EB', bg: '#EFF6FF',           border: '#BFDBFE' },
  { key: 'rutina',      label: 'Rutina',      color: '#D97706', bg: '#FFFBEB',           border: '#FDE68A' },
  { key: 'descartar',   label: 'Descartar',   color: '#6B7280', bg: '#F9FAFB',           border: '#E5E7EB' },
];

/* ─── Helpers ─── */

function getCatLabel(value: string): string {
  return CATEGORIA_OPTIONS.find((c) => c.value === value)?.label ?? value;
}

function ValueDots({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: i <= value ? color : 'rgba(0,0,0,0.10)',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Initiative card ─── */

function IniciativaCard({ ini }: { ini: IniciativaInforme }) {
  const q     = CUADRANTES[ini.cuadrante as Cuadrante];
  const badge = BADGE_STYLES[ini.cuadrante] ?? BADGE_STYLES[4];

  return (
    <div
      className="inf-card"
      style={{
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 14,
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* Card header */}
      <div style={{ padding: '1rem 1rem 0.875rem', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        {/* Badges row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              color: badge.text,
              background: badge.bg,
              border: `1px solid ${badge.border}`,
              borderRadius: 6,
              padding: '2px 8px',
            }}
          >
            {ini.etiqueta}
          </span>
          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
              color: '#6B7280',
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 6,
              padding: '2px 7px',
            }}
          >
            {getCatLabel(ini.categoria)}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: '#0A0A0A',
            letterSpacing: '-0.01em',
            lineHeight: 1.35,
            margin: '0 0 12px',
          }}
        >
          {ini.titulo}
        </h3>

        {/* IGO values */}
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>
              IMP
            </span>
            <ValueDots value={ini.importancia} color={q.color} />
            <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>{ini.importancia}/5</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>
              GOB
            </span>
            <ValueDots value={ini.gobernabilidad} color={q.color} />
            <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>{ini.gobernabilidad}/5</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '0 1rem' }}>
        <div style={{ paddingTop: '0.625rem', marginBottom: 2 }}>
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#9CA3AF',
            }}
          >
            Plan de acción
          </span>
        </div>

        {ini.acciones.length === 0 ? (
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', padding: '0.5rem 0 0.875rem' }}>
            Sin acciones definidas
          </p>
        ) : (
          <>
            {ini.acciones.map((accion, i) => (
              <ChecklistAccion key={i} accion={accion} index={i} />
            ))}
            <div style={{ height: 6 }} />
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main component ─── */

interface Props {
  informe: InformeDB;
}

export function InformeIGO({ informe }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Guard — contenido puede no haberse hidratado aún
  const c = informe.contenido;
  if (!c || !c.iniciativas) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9CA3AF', fontSize: '0.875rem' }}>
        Procesando informe…
      </div>
    );
  }

  /* Group by cuadrante */
  const grouped: Record<number, IniciativaInforme[]> = { 1: [], 2: [], 3: [], 4: [] };
  c.iniciativas.forEach((ini) => {
    if (grouped[ini.cuadrante] !== undefined) grouped[ini.cuadrante].push(ini);
  });

  /* Totales — fallback to counting from array */
  const totales: InformeTotales = c.totales ?? {
    evaluadas:   c.iniciativas.length,
    hacer_ya:    grouped[1].length,
    estrategico: grouped[2].length,
    rutina:      grouped[3].length,
    descartar:   grouped[4].length,
  };

  useGSAP(
    () => {
      gsap.fromTo(
        '.inf-resumen',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: 0.1 },
      );
      gsap.fromTo(
        '.inf-metrica',
        { opacity: 0, y: 8, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.35, stagger: 0.05, ease: 'power2.out', delay: 0.18 },
      );
      gsap.fromTo(
        '.inf-card',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', delay: 0.25 },
      );
    },
    { scope: containerRef, dependencies: [informe.id] },
  );

  return (
    <div ref={containerRef} style={{ paddingBottom: '2rem' }}>

      {/* ── Resumen block ── */}
      <div
        className="inf-resumen"
        style={{
          border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: 16,
          background: '#FAFAFA',
          padding: '1.25rem',
          marginBottom: '1rem',
        }}
      >
        {/* Meta pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          {c.sector && (
            <span
              style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#6B7280',
                background: 'rgba(0,0,0,0.05)',
                borderRadius: 6,
                padding: '2px 8px',
              }}
            >
              {c.sector}
            </span>
          )}
          {c.fecha && (
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
              {c.fecha}
            </span>
          )}
        </div>

        {/* Resumen text */}
        <p
          style={{
            fontSize: '0.9375rem',
            color: '#374151',
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {c.resumen}
        </p>
      </div>

      {/* ── Métricas row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.4rem',
          marginBottom: '0.875rem',
        }}
      >
        {METRICA_CONFIG.map((m) => {
          const value = totales[m.key];
          return (
            <div
              key={m.key}
              className="inf-metrica"
              style={{
                border: `1px solid ${m.border}`,
                borderRadius: 12,
                background: m.bg,
                padding: '0.625rem 0.375rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 800,
                  color: m.color,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: '0.5rem',
                  fontWeight: 700,
                  color: '#9CA3AF',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginTop: 4,
                  lineHeight: 1.2,
                }}
              >
                {m.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Asíntotas row ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Imp. promedio', value: c.asintotas.importancia },
          { label: 'Gob. promedio', value: c.asintotas.gobernabilidad },
        ].map((a) => (
          <div
            key={a.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              background: 'rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 8,
              padding: '4px 10px',
            }}
          >
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: '#9CA3AF',
                letterSpacing: '0.04em',
              }}
            >
              {a.label}
            </span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#374151' }}>
              {Number(a.value).toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* ── Quadrant sections ── */}
      {([1, 2, 3, 4] as const).map((q) => {
        const items  = grouped[q];
        const qStyle = CUADRANTES[q];
        if (items.length === 0) return null;

        return (
          <div key={q} style={{ marginBottom: '1.75rem' }}>
            {/* Level separator label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.875rem' }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: qStyle.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  color: qStyle.color,
                  whiteSpace: 'nowrap',
                }}
              >
                {NIVEL_LABELS[q]}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: `${qStyle.color}20`,
                  minWidth: 20,
                }}
              />
            </div>

            {/* Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((ini) => (
                <IniciativaCard key={ini.id} ini={ini} />
              ))}
            </div>
          </div>
        );
      })}

      {/* ── Footer ── */}
      <div
        style={{
          borderTop: '1px solid rgba(0,0,0,0.07)',
          paddingTop: '1.25rem',
          textAlign: 'center',
        }}
      >
        <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>
          Generado por{' '}
          <span style={{ fontWeight: 600, color: '#6B7280' }}>IGO Manager</span>
          {c.fecha && ` · ${c.fecha}`}
        </p>
      </div>
    </div>
  );
}
