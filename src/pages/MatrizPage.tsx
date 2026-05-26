import { useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import type { ScatterShapeProps } from 'recharts';
import { RefreshCw, Loader2, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmpresaStore } from '@/store/empresaStore';
import { useMatriz } from '@/hooks/useMatriz';
import { CUADRANTES } from '@/lib/utils';
import type { Iniciativa, Cuadrante } from '@/types/iniciativa.types';

type ChartPoint = Iniciativa & { x: number; y: number };

/* ─── Quadrant count pill ─── */
function QuadrantPill({ qKey, count }: { qKey: Cuadrante; count: number }) {
  const q = CUADRANTES[qKey];
  return (
    <div
      className="card-item"
      style={{
        background: q.bg,
        border: `1px solid ${q.border}`,
        borderRadius: 10,
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: q.color, lineHeight: 1 }}>
        {count}
      </span>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: q.color, lineHeight: 1.2 }}>
        {q.label}
      </span>
    </div>
  );
}

/* ─── Page ─── */
export default function MatrizPage() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const empresaActiva = useEmpresaStore((s) => s.empresaActiva);
  const { matrizData, loading, error, fetchMatriz } = useMatriz(empresaActiva?.id ?? null);

  const asintota = matrizData?.asintotas ?? { importancia: 3, gobernabilidad: 3 };

  const chartData = useMemo<ChartPoint[]>(
    () => (matrizData?.iniciativas ?? []).map((ini) => ({ ...ini, x: ini.gobernabilidad, y: ini.importancia })),
    [matrizData],
  );

  const counts = useMemo(() => {
    const c: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    chartData.forEach((d) => { c[d.cuadrante] = (c[d.cuadrante] ?? 0) + 1; });
    return c;
  }, [chartData]);

  useGSAP(
    () => {
      gsap.fromTo('.mz-header',  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      gsap.fromTo('.card-item',  { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.12 });
      gsap.fromTo('.mz-chart',   { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: 0.22 });
    },
    { scope: containerRef, dependencies: [!!matrizData] },
  );

  const hasData = !loading && !error && chartData.length > 0;

  return (
    <div ref={containerRef} style={{ paddingBottom: '2rem' }}>

      {/* ── Header ── */}
      <div className="mz-header" style={{ padding: '1.75rem 1.25rem 0', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: '0.2rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <TrendingUp size={16} color="white" strokeWidth={2.5} />
              </div>
              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.75rem', fontWeight: 400, fontStyle: 'italic', color: '#0A0A0A', letterSpacing: '-0.01em', margin: 0 }}>
                Matriz IGO
              </h1>
            </div>
            {empresaActiva && (
              <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', marginLeft: 43, marginTop: 1 }}>
                {empresaActiva.nombre}
              </p>
            )}
          </div>
          <button
            onClick={() => void fetchMatriz()}
            disabled={loading}
            title="Actualizar"
            style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6B7280', transition: 'background 0.15s',
            }}
          >
            <RefreshCw size={14} strokeWidth={2} className={cn(loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.25rem 1.25rem 0' }}>

        {/* ── Quadrant counts ── */}
        {hasData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {([1, 2, 3, 4] as Cuadrante[]).map((k) => (
              <QuadrantPill key={k} qKey={k} count={counts[k] ?? 0} />
            ))}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 10, color: '#9CA3AF' }}>
            <Loader2 size={18} strokeWidth={2} className="animate-spin" />
            <span style={{ fontSize: '0.875rem' }}>Cargando matriz...</span>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: '#DC2626', fontSize: '0.875rem', marginBottom: 12 }}>{error}</p>
            <button
              onClick={() => void fetchMatriz()}
              style={{ background: '#0A0A0A', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && !error && chartData.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#F8F8F8', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <TrendingUp size={24} color="#9CA3AF" />
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0A0A0A', marginBottom: 4 }}>Todavía sin iniciativas</p>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Agrega iniciativas en la sección Tareas para ver la matriz</p>
          </div>
        )}

        {/* ── Scatter chart ── */}
        {hasData && (
          <div
            className="mz-chart"
            style={{ border: '1px solid rgba(0,0,0,0.07)', borderRadius: 16, background: '#FAFAFA', overflow: 'hidden' }}
          >
            <ResponsiveContainer width="100%" aspect={1.05}>
              <ScatterChart margin={{ top: 16, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="2 5" stroke="rgba(0,0,0,0.05)" />

                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[0.5, 5.5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
                  tickLine={false}
                  label={{
                    value: 'Gobernabilidad →',
                    position: 'insideBottom',
                    offset: -12,
                    style: { fontSize: 10, fill: '#9CA3AF', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' },
                  }}
                />

                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0.5, 5.5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={{ stroke: 'rgba(0,0,0,0.08)' }}
                  tickLine={false}
                  label={{
                    value: '↑ Importancia',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 14,
                    style: { fontSize: 10, fill: '#9CA3AF', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' },
                  }}
                />

                {/* Quadrant background areas */}
                <ReferenceArea
                  x1={asintota.gobernabilidad} x2={5.5} y1={asintota.importancia} y2={5.5}
                  fill="rgba(22,163,74,0.07)"
                  label={{ value: '¡Hacer ya!', position: 'insideTopRight', fill: '#16A34A', fontSize: 10, fontWeight: 700 }}
                />
                <ReferenceArea
                  x1={0.5} x2={asintota.gobernabilidad} y1={asintota.importancia} y2={5.5}
                  fill="rgba(37,99,235,0.06)"
                  label={{ value: 'Estratégico', position: 'insideTopLeft', fill: '#2563EB', fontSize: 10, fontWeight: 700 }}
                />
                <ReferenceArea
                  x1={asintota.gobernabilidad} x2={5.5} y1={0.5} y2={asintota.importancia}
                  fill="rgba(217,119,6,0.06)"
                  label={{ value: 'Rutina', position: 'insideBottomRight', fill: '#D97706', fontSize: 10, fontWeight: 700 }}
                />
                <ReferenceArea
                  x1={0.5} x2={asintota.gobernabilidad} y1={0.5} y2={asintota.importancia}
                  fill="rgba(107,114,128,0.05)"
                  label={{ value: 'Descartar', position: 'insideBottomLeft', fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                />

                {/* Asíntota divider lines */}
                <ReferenceLine x={asintota.gobernabilidad} stroke="rgba(0,0,0,0.2)"  strokeDasharray="4 3" strokeWidth={1.5} />
                <ReferenceLine y={asintota.importancia}   stroke="rgba(0,0,0,0.2)"  strokeDasharray="4 3" strokeWidth={1.5} />

                {/* Data dots */}
                <Scatter
                  data={chartData}
                  shape={(p: ScatterShapeProps) => {
                    const cx  = p.cx as number;
                    const cy  = p.cy as number;
                    const dot = p.payload as ChartPoint;
                    if (typeof cx !== 'number' || typeof cy !== 'number' || !dot) return <g />;
                    const q = CUADRANTES[dot.cuadrante as Cuadrante];
                    return (
                      <g key={dot.id}>
                        {/* Glow halo */}
                        <circle cx={cx} cy={cy} r={16} fill={q.color} opacity={0.09} />
                        {/* Main dot */}
                        <circle cx={cx} cy={cy} r={7} fill={q.color} />
                        {/* White border ring */}
                        <circle cx={cx} cy={cy} r={7} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
                      </g>
                    );
                  }}
                />

                {/* Tooltip */}
                <RTooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = (payload[0] as unknown as { payload: ChartPoint }).payload;
                    const q = CUADRANTES[d.cuadrante as Cuadrante];
                    return (
                      <div style={{
                        background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: 12, padding: '10px 14px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.10)', maxWidth: 220,
                      }}>
                        <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0A0A0A', marginBottom: 6, lineHeight: 1.3 }}>
                          {d.titulo}
                        </p>
                        <span style={{
                          display: 'inline-block', background: q.bg, color: q.color,
                          border: `1px solid ${q.border}`, borderRadius: 999,
                          padding: '2px 9px', fontSize: '0.6875rem', fontWeight: 700,
                          letterSpacing: '0.03em', marginBottom: 6,
                        }}>
                          {q.label}
                        </span>
                        <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: '#6B7280' }}>
                          <span>I:&nbsp;<strong style={{ color: '#0A0A0A' }}>{d.importancia}/5</strong></span>
                          <span>G:&nbsp;<strong style={{ color: '#0A0A0A' }}>{d.gobernabilidad}/5</strong></span>
                        </div>
                      </div>
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Asíntota info + legend ── */}
        {hasData && (
          <div style={{ marginTop: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Info size={11} color="#9CA3AF" />
              <span style={{ fontSize: '0.6875rem', color: '#9CA3AF', fontWeight: 500 }}>
                Asíntota — I:&nbsp;{asintota.importancia}&nbsp;·&nbsp;G:&nbsp;{asintota.gobernabilidad}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {([1, 2, 3, 4] as Cuadrante[]).map((k) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: CUADRANTES[k].color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.6875rem', color: '#9CA3AF', fontWeight: 500 }}>{CUADRANTES[k].label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
