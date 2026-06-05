import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { FileText, Loader2, RefreshCw, Sparkles, Printer } from 'lucide-react';
import { OrganicLoader } from '@/components/common/OrganicLoader';
import { useEmpresaStore } from '@/store/empresaStore';
import { useInforme } from '@/hooks/useInforme';
import { InformeIGO } from '@/components/informe/InformeIGO';

export default function InformePage() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const empresaActiva = useEmpresaStore((s) => s.empresaActiva);
  const { informe, loading, generating, error, fetchInforme, generarInforme } =
    useInforme(empresaActiva?.id ?? null);

  const isBusy = loading || generating;

  useGSAP(
    () => {
      gsap.fromTo(
        '.inf-page-header',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
      );
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} style={{ paddingBottom: '2rem' }}>

      {/* ── Page header ── */}
      <div
        className="inf-page-header"
        style={{ padding: '1.75rem 1.25rem 1.25rem', maxWidth: 700, margin: '0 auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          {/* Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.2rem' }}>
              <div
                style={{
                  width: 34, height: 34, borderRadius: 9,
                  background: '#0A0A0A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <FileText size={16} color="white" strokeWidth={2.5} />
              </div>
              <h1
                style={{
                  fontSize: '1.375rem', fontWeight: 800,
                  color: '#0A0A0A', letterSpacing: '-0.03em', margin: 0,
                }}
              >
                Informe IGO
              </h1>
            </div>
            {empresaActiva && (
              <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', marginLeft: 44, marginTop: 1 }}>
                {empresaActiva.nombre}
              </p>
            )}
          </div>

          {/* Action buttons — only shown when empresa is active */}
          {empresaActiva && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
              {/* Refresh */}
              <button
                onClick={() => void fetchInforme()}
                disabled={isBusy}
                title="Actualizar"
                style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
                  cursor: isBusy ? 'not-allowed' : 'pointer',
                  opacity: isBusy ? 0.45 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#6B7280',
                }}
              >
                <RefreshCw size={14} strokeWidth={2} />
              </button>

              {/* Generate / Regenerate */}
              <button
                onClick={() => void generarInforme()}
                disabled={isBusy}
                title={informe ? 'Regenerar informe' : 'Generar informe'}
                style={{
                  height: 36, borderRadius: 10, flexShrink: 0,
                  background: '#0A0A0A', border: 'none',
                  cursor: isBusy ? 'not-allowed' : 'pointer',
                  opacity: isBusy ? 0.45 : 1,
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0 14px', color: '#FFFFFF',
                  fontSize: '0.8125rem', fontWeight: 600,
                }}
              >
                {generating ? (
                  <Loader2 size={13} strokeWidth={2.5} className="animate-spin" />
                ) : (
                  <Sparkles size={13} strokeWidth={2.5} />
                )}
                <span className="hidden md:inline">
                  {informe ? 'Regenerar' : 'Generar'}
                </span>
              </button>

              {/* PDF export — desktop only, inline */}
              {informe && (
                <button
                  onClick={() => window.print()}
                  title="Exportar PDF"
                  className="hidden md:flex items-center gap-1.5"
                  style={{
                    height: 36, borderRadius: 10,
                    background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    padding: '0 14px', color: '#374151',
                    fontSize: '0.8125rem', fontWeight: 600,
                  }}
                >
                  <Printer size={13} strokeWidth={2} />
                  <span>Exportar PDF</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 1.25rem' }}>

        {/* No empresa selected */}
        {!empresaActiva && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div
              style={{
                width: 56, height: 56, borderRadius: 14,
                background: '#F8F8F8', border: '1px solid rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}
            >
              <FileText size={24} color="#9CA3AF" />
            </div>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0A0A0A', marginBottom: 4 }}>
              Selecciona una empresa
            </p>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>
              Elige una empresa activa para ver su informe IGO
            </p>
          </div>
        )}

        {/* Loading initial fetch */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 1rem' }}>
            <OrganicLoader variant="dark" size="sm" label="Cargando informe…" />
          </div>
        )}

        {/* Generating via Groq */}
        {!loading && generating && (
          <div
            style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              minHeight: 280, gap: 0,
            }}
          >
            <OrganicLoader variant="dark" size="md" label="Generando informe con IA…" />
            <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', margin: '0.5rem 0 0', textAlign: 'center' }}>
              Esto puede tardar hasta 30 segundos…
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && !generating && error && (
          <div
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '1rem',
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12,
              marginBottom: 16,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', flexShrink: 0, marginTop: 5 }} />
            <span style={{ fontSize: '0.875rem', color: '#DC2626', lineHeight: 1.5 }}>{error}</span>
          </div>
        )}

        {/* Empty — no informe yet */}
        {!loading && !generating && !error && !informe && empresaActiva && (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
            <div
              style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'linear-gradient(135deg, #F8F8F8 0%, #F0F0F0 100%)',
                border: '1px solid rgba(0,0,0,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Sparkles size={28} color="#9CA3AF" />
            </div>
            <p
              style={{
                fontSize: '1.125rem', fontWeight: 700,
                color: '#0A0A0A', marginBottom: 8,
                letterSpacing: '-0.02em',
              }}
            >
              Sin informe todavía
            </p>
            <p
              style={{
                fontSize: '0.875rem', color: '#6B7280',
                maxWidth: 300, margin: '0 auto 1.75rem', lineHeight: 1.6,
              }}
            >
              Genera el primer informe IGO para {empresaActiva.nombre}. La IA analizará tus
              iniciativas y te dará un plan de acción concreto.
            </p>
            <button
              onClick={() => void generarInforme()}
              style={{
                height: 44, borderRadius: 12,
                background: '#0A0A0A', border: 'none',
                cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0 22px', color: '#FFFFFF',
                fontSize: '0.9375rem', fontWeight: 600,
                letterSpacing: '-0.01em',
              }}
            >
              <Sparkles size={16} strokeWidth={2.5} />
              Generar primer informe
            </button>
          </div>
        )}

        {/* Informe loaded */}
        {!loading && !generating && informe && (
          <InformeIGO informe={informe} />
        )}
      </div>

      {/* ── PDF button — mobile fixed pill ── */}
      {informe && !isBusy && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed',
            bottom: 80,
            left: 0, right: 0,
            display: 'flex',
            justifyContent: 'center',
            padding: '0 1.25rem',
            zIndex: 40,
            pointerEvents: 'none',
          }}
        >
          <button
            onClick={() => window.print()}
            style={{
              height: 44, borderRadius: 22,
              background: '#0A0A0A', border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0 24px', color: '#FFFFFF',
              fontSize: '0.875rem', fontWeight: 600,
              boxShadow: '0 4px 24px rgba(0,0,0,0.20)',
              pointerEvents: 'all',
            }}
          >
            <Printer size={14} strokeWidth={2} />
            Exportar PDF
          </button>
        </div>
      )}
    </div>
  );
}
