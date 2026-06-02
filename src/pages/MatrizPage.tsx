import { useRef, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer,
} from 'recharts';
import type { ScatterShapeProps } from 'recharts';
import { RefreshCw, Loader2, TrendingUp, Info, LayoutGrid, Bell, X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmpresaStore } from '@/store/empresaStore';
import { useMatrizConInforme } from '@/hooks/useMatrizConInforme';
import { IniciativaDetailPanel } from '@/components/matriz/IniciativaDetailPanel';
import { CalendarioPlanAccion } from '@/components/matriz/CalendarioPlanAccion';
import { CUADRANTES } from '@/lib/utils';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import type { Iniciativa, Cuadrante } from '@/types/iniciativa.types';
import type { IniciativaInforme } from '@/types/informe.types';

/* ─── Push onboarding card (shown once after first informe) ─── */

const ONBOARDING_KEY = 'push_onboarding_visto';

function PushOnboardingCard() {
  const cardRef = useRef<HTMLDivElement>(null);
  const { estado, activar } = usePushNotifications();
  const [visible, setVisible] = useState(
    () => localStorage.getItem(ONBOARDING_KEY) === null && estado !== 'no-soportado',
  );

  /* Dismiss and mark as seen */
  const dismiss = (doActivate = false) => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setVisible(false);
    if (doActivate) void activar();
  };

  /* GSAP entrance */
  useGSAP(() => {
    if (!visible || !cardRef.current) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.3 },
    );
  }, { scope: cardRef, dependencies: [visible] });

  /* Already activated or dismissed */
  if (!visible || estado === 'activado') return null;

  return (
    <div
      ref={cardRef}
      style={{
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 16,
        background: '#FFFFFF',
        padding: '1.25rem',
        marginBottom: '1.25rem',
        position: 'relative',
      }}
    >
      {/* Dismiss X */}
      <button
        onClick={() => dismiss(false)}
        aria-label="Cerrar"
        style={{
          position: 'absolute', top: 10, right: 10,
          width: 28, height: 28, borderRadius: 8, border: 'none',
          background: 'rgba(0,0,0,0.05)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <XIcon size={13} color="#9CA3AF" strokeWidth={2} />
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Bell icon */}
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: '#0A0A0A', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bell size={16} color="#FFFFFF" strokeWidth={2.5} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: '0.9375rem', fontWeight: 700,
            color: '#0A0A0A', margin: '0 0 4px',
            letterSpacing: '-0.01em',
          }}>
            ¿Quieres recordatorios de tu plan?
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#6B7280', margin: '0 0 1rem', lineHeight: 1.5 }}>
            Te avisamos cada mañana lo que toca hacer hoy,
            sin tener que abrir la app.
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => dismiss(true)}
              style={{
                flex: 1, height: 38, borderRadius: 10,
                background: '#0A0A0A', color: '#FFFFFF', border: 'none',
                fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                letterSpacing: '-0.01em',
              }}
            >
              <Bell size={13} strokeWidth={2.5} />
              Activar
            </button>
            <button
              onClick={() => dismiss(false)}
              style={{
                flex: 1, height: 38, borderRadius: 10,
                background: 'rgba(0,0,0,0.04)', color: '#6B7280',
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type ChartPoint = Iniciativa & { x: number; y: number };

/* ─── Quadrant count pill ─── */
function QuadrantPill({ qKey, count }: { qKey: Cuadrante; count: number }) {
  const q = CUADRANTES[qKey];
  return (
    <div
      className="card-item"
      style={{
        background: q.bg, border: `1px solid ${q.border}`,
        borderRadius: 10, padding: '8px 14px',
        display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
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
  const navigate       = useNavigate();
  const containerRef   = useRef<HTMLDivElement>(null);
  const empresaActiva  = useEmpresaStore((s) => s.empresaActiva);

  const {
    matrizData,
    informe,
    loadingMatriz,
    loadingInforme,
    generating,
    error,
    regenerar,
  } = useMatrizConInforme(empresaActiva?.id ?? null);

  /* Selected dot → detail panel */
  const [selectedId, setSelectedId] = useState<number | null>(null);

  /* Map informe.iniciativas by id for O(1) lookup */
  const informeMap = useMemo(() => {
    const map = new Map<number, IniciativaInforme>();
    informe?.contenido.iniciativas.forEach((ini) => map.set(ini.id, ini));
    return map;
  }, [informe]);

  const selectedIniciativa: IniciativaInforme | null =
    selectedId != null ? (informeMap.get(selectedId) ?? null) : null;

  /* Clear selection when informe resets (e.g. regenerar) */
  useEffect(() => {
    if (selectedId !== null && informe === null) setSelectedId(null);
  }, [informe, selectedId]);

  /* Chart data */
  const chartData = useMemo<ChartPoint[]>(
    () => (matrizData?.iniciativas ?? []).map((ini) => ({ ...ini, x: ini.gobernabilidad, y: ini.importancia })),
    [matrizData],
  );

  const asintota = matrizData?.asintotas ?? { importancia: 3, gobernabilidad: 3 };

  const counts = useMemo(() => {
    const c: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    chartData.forEach((d) => { c[d.cuadrante] = (c[d.cuadrante] ?? 0) + 1; });
    return c;
  }, [chartData]);

  /* Derived booleans */
  const isLoading        = loadingMatriz || loadingInforme || generating;
  const hasFewData       = !loadingMatriz && matrizData !== null && chartData.length < 2;
  const hasData          = !isLoading && !error && chartData.length >= 2;
  const showAnalysis     = hasData && !!informe;

  const loadingMessage =
    generating     ? 'Generando tu matriz IGO…'   :
    loadingInforme ? 'Cargando análisis…'          :
    loadingMatriz  ? 'Cargando matriz…'            : null;

  /* Handle regenerar + clear selection */
  const handleRegenerar = () => {
    setSelectedId(null);
    void regenerar();
  };

  /* GSAP entrance */
  useGSAP(
    () => {
      gsap.fromTo('.mz-header',  { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      gsap.fromTo('.card-item',  { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out', delay: 0.12 });
      gsap.fromTo('.mz-chart',   { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', delay: 0.22 });
    },
    { scope: containerRef, dependencies: [hasData] },
  );

  return (
    <div ref={containerRef} style={{ paddingBottom: '2rem' }}>

      {/* ── Header ── */}
      <div className="mz-header" style={{ padding: '1.75rem 1.25rem 0', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: '0.2rem' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, background: '#0A0A0A',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <TrendingUp size={16} color="white" strokeWidth={2.5} />
              </div>
              <h1 style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: '1.75rem', fontWeight: 400, fontStyle: 'italic',
                color: '#0A0A0A', letterSpacing: '-0.01em', margin: 0,
              }}>
                Matriz IGO
              </h1>
            </div>
            {empresaActiva && (
              <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', marginLeft: 43, marginTop: 1 }}>
                {empresaActiva.nombre}
              </p>
            )}
          </div>

          {/* Regenerar button — discrete, only when there's data */}
          {(hasData || showAnalysis) && (
            <button
              onClick={handleRegenerar}
              disabled={isLoading}
              title="Regenerar análisis"
              style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#6B7280', transition: 'background 0.15s',
              }}
            >
              <RefreshCw
                size={14}
                strokeWidth={2}
                className={cn((loadingMatriz || generating) && 'animate-spin')}
              />
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.25rem 1.25rem 0' }}>

        {/* ── Loading ── */}
        {isLoading && (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 300, gap: 14,
          }}>
            <Loader2 size={28} strokeWidth={1.5} color="#0A0A0A" className="animate-spin" />
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0A0A0A', margin: 0, letterSpacing: '-0.01em' }}>
              {loadingMessage}
            </p>
            {generating && (
              <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', margin: 0, maxWidth: 260, textAlign: 'center', lineHeight: 1.5 }}>
                Estamos analizando tus iniciativas con IA.<br />Esto puede tomar hasta 30 segundos.
              </p>
            )}
          </div>
        )}

        {/* ── Error ── */}
        {error && !isLoading && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: '#DC2626', fontSize: '0.875rem', marginBottom: 12 }}>{error}</p>
            <button
              onClick={handleRegenerar}
              style={{
                background: '#0A0A0A', color: '#FFFFFF', border: 'none',
                borderRadius: 8, padding: '8px 16px',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* ── < 2 initiatives — friendly empty state ── */}
        {hasFewData && !isLoading && !error && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: '#F8F8F8', border: '1px solid rgba(0,0,0,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <TrendingUp size={24} color="#9CA3AF" />
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0A0A0A', marginBottom: 6, letterSpacing: '-0.01em' }}>
              Necesitas al menos 2 iniciativas
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Agrega al menos 2 iniciativas para generar<br />tu Matriz IGO con análisis estratégico
            </p>
            <button
              onClick={() => navigate('/iniciativas/nueva')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: '#0A0A0A', color: '#FFFFFF', border: 'none',
                borderRadius: 10, padding: '10px 20px',
                cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 600,
              }}
            >
              <LayoutGrid size={15} strokeWidth={2.5} />
              Agregar iniciativa
            </button>
          </div>
        )}

        {/* ── No empresa selected ── */}
        {!empresaActiva && !isLoading && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <p style={{ fontSize: '0.9375rem', color: '#9CA3AF' }}>
              Selecciona una empresa para ver la matriz
            </p>
          </div>
        )}

        {/* ── Push onboarding (una sola vez, tras generar el primer informe) ── */}
        {showAnalysis && <PushOnboardingCard />}

        {/* ── Calendar plan de acción (above the chart) ── */}
        {showAnalysis && (
          <CalendarioPlanAccion
            informe={informe!}
            onSelectIniciativa={setSelectedId}
          />
        )}

        {/* ── Quadrant count pills ── */}
        {hasData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {([1, 2, 3, 4] as Cuadrante[]).map((k) => (
              <QuadrantPill key={k} qKey={k} count={counts[k] ?? 0} />
            ))}
          </div>
        )}

        {/* ── Scatter chart ── */}
        {hasData && (
          <div
            className="mz-chart"
            style={{
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 16, background: '#FAFAFA', overflow: 'hidden',
            }}
          >
            <ResponsiveContainer width="100%" aspect={1.05}>
              <ScatterChart margin={{ top: 16, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="2 5" stroke="rgba(0,0,0,0.05)" />

                <XAxis
                  type="number" dataKey="x" domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={{ stroke: 'rgba(0,0,0,0.08)' }} tickLine={false}
                  label={{
                    value: 'Gobernabilidad →', position: 'insideBottom', offset: -12,
                    style: { fontSize: 10, fill: '#9CA3AF', fontWeight: 700, letterSpacing: '0.06em' },
                  }}
                />
                <YAxis
                  type="number" dataKey="y" domain={[0.5, 5.5]} ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={{ stroke: 'rgba(0,0,0,0.08)' }} tickLine={false}
                  label={{
                    value: '↑ Importancia', angle: -90, position: 'insideLeft', offset: 14,
                    style: { fontSize: 10, fill: '#9CA3AF', fontWeight: 700, letterSpacing: '0.06em' },
                  }}
                />

                {/* Quadrant background areas */}
                <ReferenceArea x1={asintota.gobernabilidad} x2={5.5} y1={asintota.importancia} y2={5.5}
                  fill="rgba(22,163,74,0.07)"
                  label={{ value: '¡Hacer ya!', position: 'insideTopRight', fill: '#16A34A', fontSize: 10, fontWeight: 700 }}
                />
                <ReferenceArea x1={0.5} x2={asintota.gobernabilidad} y1={asintota.importancia} y2={5.5}
                  fill="rgba(37,99,235,0.06)"
                  label={{ value: 'Estratégico', position: 'insideTopLeft', fill: '#2563EB', fontSize: 10, fontWeight: 700 }}
                />
                <ReferenceArea x1={asintota.gobernabilidad} x2={5.5} y1={0.5} y2={asintota.importancia}
                  fill="rgba(217,119,6,0.06)"
                  label={{ value: 'Rutina', position: 'insideBottomRight', fill: '#D97706', fontSize: 10, fontWeight: 700 }}
                />
                <ReferenceArea x1={0.5} x2={asintota.gobernabilidad} y1={0.5} y2={asintota.importancia}
                  fill="rgba(107,114,128,0.05)"
                  label={{ value: 'Descartar', position: 'insideBottomLeft', fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }}
                />

                {/* Asíntota divider lines */}
                <ReferenceLine x={asintota.gobernabilidad} stroke="rgba(0,0,0,0.2)" strokeDasharray="4 3" strokeWidth={1.5} />
                <ReferenceLine y={asintota.importancia}   stroke="rgba(0,0,0,0.2)" strokeDasharray="4 3" strokeWidth={1.5} />

                {/* Data dots — clickable */}
                <Scatter
                  data={chartData}
                  shape={(p: ScatterShapeProps) => {
                    const cx  = p.cx as number;
                    const cy  = p.cy as number;
                    const dot = p.payload as ChartPoint;
                    if (typeof cx !== 'number' || typeof cy !== 'number' || !dot) return <g />;

                    const q          = CUADRANTES[dot.cuadrante as Cuadrante];
                    const isSelected = selectedId === dot.id;

                    return (
                      <g
                        key={dot.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedId(isSelected ? null : dot.id)}
                        onTouchEnd={(e) => { e.preventDefault(); setSelectedId(isSelected ? null : dot.id); }}
                      >
                        {/* Tap target — transparent, larger hit area */}
                        <circle cx={cx} cy={cy} r={22} fill="transparent" />

                        {/* Selection ring */}
                        {isSelected && <circle cx={cx} cy={cy} r={14} fill={q.color} opacity={0.18} />}
                        {isSelected && <circle cx={cx} cy={cy} r={12} fill="none" stroke={q.color} strokeWidth={2} />}

                        {/* Glow halo */}
                        <circle cx={cx} cy={cy} r={14} fill={q.color} opacity={isSelected ? 0 : 0.09} />
                        {/* Main dot */}
                        <circle cx={cx} cy={cy} r={7} fill={q.color} />
                        {/* White ring */}
                        <circle cx={cx} cy={cy} r={7} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth={2} />
                      </g>
                    );
                  }}
                />

                {/* Hover tooltip */}
                <RTooltip
                  cursor={false}
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
                        {informe && (
                          <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', margin: '6px 0 0' }}>
                            Toca para ver el plan de acción
                          </p>
                        )}
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

        {/* ── Generating hint (when informe isn't ready yet but chart is) ── */}
        {hasData && !informe && !isLoading && (
          <div style={{
            marginTop: '1rem',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 12, background: '#FAFAFA',
            padding: '0.875rem 1rem',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Info size={14} color="#9CA3AF" />
            <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', margin: 0 }}>
              Toca el botón ↻ para generar el análisis estratégico de cada iniciativa.
            </p>
          </div>
        )}

        {/* ── Initiative detail panel ── */}
        {showAnalysis && (
          <div style={{ marginTop: '1rem' }}>
            <IniciativaDetailPanel
              iniciativa={selectedIniciativa}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}

      </div>
    </div>
  );
}
