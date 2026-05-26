import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { getSliderLabel } from '@/lib/utils';
import type { ValorIGO } from '@/types/iniciativa.types';

interface SliderIGOProps {
  tipo:     'imp' | 'gob';
  value:    ValorIGO;
  onChange: (v: ValorIGO) => void;
  label:    string;
}

/* Colors for each step */
const COLORS: Record<number, { hex: string; bg: string }> = {
  1: { hex: '#DC2626', bg: '#FEF2F2' },
  2: { hex: '#EA580C', bg: '#FFF7ED' },
  3: { hex: '#CA8A04', bg: '#FEFCE8' },
  4: { hex: '#65A30D', bg: '#F7FEE7' },
  5: { hex: '#16A34A', bg: '#F0FDF4' },
};

export function SliderIGO({ tipo, value, onChange, label }: SliderIGOProps) {
  const dotRef   = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const c        = COLORS[value];

  /* Bounce when value changes */
  useEffect(() => {
    if (dotRef.current) {
      gsap.fromTo(
        dotRef.current,
        { scale: 1.4 },
        { scale: 1, duration: 0.35, ease: 'elastic.out(1.2, 0.5)' },
      );
    }
    if (badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { opacity: 0, y: -4 },
        { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' },
      );
    }
  }, [value]);

  const pct = ((value - 1) / 4) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280' }}>
          {label}
        </span>
        <span
          ref={badgeRef}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 10px', borderRadius: 999,
            fontSize: '0.6875rem', fontWeight: 700,
            background: c.bg, color: c.hex,
            border: `1px solid ${c.hex}22`,
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: c.hex, flexShrink: 0,
          }} />
          {value}/5
        </span>
      </div>

      {/* Slider track */}
      <div style={{ position: 'relative', padding: '0.5rem 0', cursor: 'pointer' }}>
        {/* Background track */}
        <div style={{
          height: 6, borderRadius: 999,
          background: 'rgba(0,0,0,0.06)',
          position: 'relative', overflow: 'visible',
        }}>
          {/* Filled portion */}
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: `${pct}%`,
            background: c.hex,
            borderRadius: 999,
            transition: 'width 0.2s ease, background 0.2s ease',
          }} />
          {/* Dot handle */}
          <div
            ref={dotRef}
            style={{
              position: 'absolute', top: '50%',
              left: `${pct}%`,
              transform: 'translate(-50%, -50%)',
              width: 18, height: 18, borderRadius: '50%',
              background: '#FFFFFF',
              border: `2.5px solid ${c.hex}`,
              boxShadow: `0 2px 8px ${c.hex}40`,
              transition: 'border-color 0.2s, box-shadow 0.2s',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Invisible native range input overlaid */}
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value) as ValorIGO)}
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            opacity: 0, cursor: 'pointer', margin: 0,
          }}
        />
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2 }}>
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
            }}
          >
            <div style={{
              width: n === value ? 7 : 5,
              height: n === value ? 7 : 5,
              borderRadius: '50%',
              background: n <= value ? COLORS[n].hex : 'rgba(0,0,0,0.12)',
              transition: 'all 0.15s',
            }} />
          </button>
        ))}
      </div>

      {/* Semantic label */}
      <p style={{
        fontSize: '0.8125rem', color: c.hex, fontWeight: 500,
        textAlign: 'center', lineHeight: 1.3, minHeight: '1.2em',
        transition: 'color 0.2s',
      }}>
        {getSliderLabel(value, tipo)}
      </p>
    </div>
  );
}
