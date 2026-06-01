import { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { X } from 'lucide-react';
import { ChecklistAccion } from '@/components/informe/ChecklistAccion';
import { CUADRANTES, CATEGORIA_OPTIONS } from '@/lib/utils';
import type { IniciativaInforme } from '@/types/informe.types';
import type { Cuadrante } from '@/types/iniciativa.types';

/* ── Helpers ── */

function ValueDots({ value, color }: { value: number; color: string }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
            background: i <= value ? color : 'rgba(0,0,0,0.10)',
          }}
        />
      ))}
    </div>
  );
}

function getCatLabel(value: string): string {
  return CATEGORIA_OPTIONS.find((c) => c.value === value)?.label ?? value;
}

/* ── Shared panel content ── */

function PanelContent({
  iniciativa,
  onClose,
  isMobile,
}: {
  iniciativa: IniciativaInforme;
  onClose: () => void;
  isMobile: boolean;
}) {
  const q = CUADRANTES[iniciativa.cuadrante as Cuadrante];

  return (
    <>
      {/* Handle bar (mobile only) */}
      {isMobile && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0.25rem' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'rgba(0,0,0,0.12)' }} />
        </div>
      )}

      {/* Header: badges + close */}
      <div
        style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 12,
          padding: `${isMobile ? '0.5rem' : '0.875rem'} 1.25rem 0`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', flex: 1 }}>
          {/* Cuadrante */}
          <span style={{
            fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.03em',
            color: q.color, background: q.bg, border: `1px solid ${q.border}`,
            borderRadius: 6, padding: '2px 8px',
          }}>
            {iniciativa.etiqueta}
          </span>
          {/* Categoría */}
          <span style={{
            fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.03em',
            color: '#6B7280', background: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.07)',
            borderRadius: 6, padding: '2px 7px',
          }}>
            {getCatLabel(iniciativa.categoria)}
          </span>
        </div>

        <button
          onClick={onClose}
          style={{
            width: 28, height: 28, borderRadius: 999, flexShrink: 0,
            background: 'rgba(0,0,0,0.05)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={13} color="#6B7280" strokeWidth={2} />
        </button>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: '0.9375rem', fontWeight: 700, color: '#0A0A0A',
        letterSpacing: '-0.01em', lineHeight: 1.35, margin: 0,
        padding: '0.5rem 1.25rem 0.625rem',
      }}>
        {iniciativa.titulo}
      </h3>

      {/* IGO scores */}
      <div style={{
        display: 'flex', gap: 18, flexWrap: 'wrap',
        padding: '0 1.25rem 0.75rem',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>IMP</span>
          <ValueDots value={iniciativa.importancia} color={q.color} />
          <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>{iniciativa.importancia}/5</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>GOB</span>
          <ValueDots value={iniciativa.gobernabilidad} color={q.color} />
          <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>{iniciativa.gobernabilidad}/5</span>
        </div>
      </div>

      {/* Plan de acción */}
      <div style={{ padding: '0.5rem 1.25rem' }}>
        <p style={{
          fontSize: '0.625rem', fontWeight: 800,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          color: '#9CA3AF', margin: '0 0 2px',
        }}>
          Plan de acción
        </p>

        {iniciativa.acciones.length === 0 ? (
          <p style={{ fontSize: '0.75rem', color: '#9CA3AF', padding: '0.5rem 0' }}>
            Sin acciones definidas
          </p>
        ) : (
          iniciativa.acciones.map((accion, i) => (
            <ChecklistAccion key={i} accion={accion} index={i} />
          ))
        )}

        {/* Safe bottom spacing on mobile (above BottomNav) */}
        {isMobile && <div style={{ height: 16 }} />}
      </div>
    </>
  );
}

/* ── Main component ── */

interface Props {
  iniciativa: IniciativaInforme | null;
  onClose: () => void;
}

export function IniciativaDetailPanel({ iniciativa, onClose }: Props) {
  const panelRef   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isFirst    = useRef(true);

  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768,
  );

  useEffect(() => {
    const mq      = window.matchMedia('(max-width: 767px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* Body scroll lock — mobile only */
  useEffect(() => {
    if (!isMobile) return;
    document.body.classList.toggle('igo-drawer-open', !!iniciativa);
    return () => document.body.classList.remove('igo-drawer-open');
  }, [iniciativa, isMobile]);

  /* GSAP animation */
  useEffect(() => {
    const panel   = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel) return;

    const open = !!iniciativa;

    /* First mount — set initial hidden state without animating */
    if (isFirst.current) {
      isFirst.current = false;
      if (isMobile) {
        gsap.set(panel, { y: '100%' });
        if (overlay) gsap.set(overlay, { opacity: 0 });
      } else {
        gsap.set(panel, { display: 'none', opacity: 0, y: -8 });
      }
      return;
    }

    if (isMobile) {
      if (overlay) {
        gsap.to(overlay, {
          opacity: open ? 1 : 0,
          duration: open ? 0.25 : 0.2,
          ease: open ? 'power2.out' : 'power2.in',
        });
      }
      gsap.to(panel, {
        y: open ? 0 : '100%',
        duration: open ? 0.35 : 0.28,
        ease: open ? 'power3.out' : 'power3.in',
      });
    } else {
      if (open) {
        gsap.set(panel, { display: 'block' });
        gsap.fromTo(
          panel,
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' },
        );
      } else {
        gsap.to(panel, {
          opacity: 0, y: -8, duration: 0.2, ease: 'power2.in',
          onComplete: () => { if (panel) gsap.set(panel, { display: 'none' }); },
        });
      }
    }
  }, [iniciativa, isMobile]);

  /* ── Mobile: fixed bottom sheet ── */
  if (isMobile) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          pointerEvents: iniciativa ? 'auto' : 'none',
        }}
      >
        <div
          ref={overlayRef}
          onClick={onClose}
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
        />
        <div
          ref={panelRef}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            maxWidth: 480, margin: '0 auto',
            background: '#FFFFFF',
            borderRadius: '20px 20px 0 0',
            maxHeight: '85dvh',
            overflowY: 'auto',
          }}
        >
          {iniciativa && (
            <PanelContent iniciativa={iniciativa} onClose={onClose} isMobile />
          )}
        </div>
      </div>
    );
  }

  /* ── Desktop: inline card below the chart ── */
  return (
    <div
      ref={panelRef}
      style={{
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 16,
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {iniciativa && (
        <PanelContent iniciativa={iniciativa} onClose={onClose} isMobile={false} />
      )}
    </div>
  );
}
