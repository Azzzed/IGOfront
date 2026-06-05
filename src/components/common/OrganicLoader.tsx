/**
 * OrganicLoader — metaball blobs animados con GSAP
 *
 * Técnica: filter: blur(X) contrast(Y) sobre un contenedor con fondo sólido.
 * Las bolas circulares se fusionan orgánicamente donde se solapan.
 * El efecto visual replica exactamente la referencia: blobs fluidos que
 * orbitan, respiran y se unen como células vivas.
 *
 * variant="dark"  → blobs negros sobre fondo blanco  (páginas claras)
 * variant="light" → blobs blancos sobre fondo negro  (overlays oscuros)
 */

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

/* ─── Tipos ─── */

interface OrganicLoaderProps {
  variant?:    'dark' | 'light';
  size?:       'sm' | 'md' | 'lg';
  label?:      string;
  fullScreen?: boolean;
}

/* ─── Config por tamaño ────────────────────────────────────────────
   container = bounding-box total del canvas de metaballs
   b0–b3     = diámetros de cada blob
   orbit     = radio de movimiento de los satélites
   blur      = radio de desenfoque (px)
   contrast  = factor de contraste (cuanto más alto, más "snap" en los bordes)
*/
const CFG = {
  sm: { container: 80,  b0: 28, b1: 22, b2: 20, b3: 16, orbit: 12, blur: 6,  contrast: 18 },
  md: { container: 130, b0: 44, b1: 34, b2: 30, b3: 24, orbit: 20, blur: 10, contrast: 20 },
  lg: { container: 190, b0: 64, b1: 50, b2: 44, b3: 34, orbit: 28, blur: 14, contrast: 22 },
} as const;

/* ─── Componente ─── */

export function OrganicLoader({
  variant    = 'dark',
  size       = 'md',
  label,
  fullScreen = false,
}: OrganicLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const b0Ref = useRef<HTMLDivElement>(null);
  const b1Ref = useRef<HTMLDivElement>(null);
  const b2Ref = useRef<HTMLDivElement>(null);
  const b3Ref = useRef<HTMLDivElement>(null);

  const cfg       = CFG[size];
  const blobColor = variant === 'dark' ? '#0A0A0A' : '#FFFFFF';
  const bgColor   = variant === 'dark' ? '#FFFFFF' : '#0A0A0A';
  const labelColor = variant === 'dark' ? '#374151' : 'rgba(255,255,255,0.7)';

  /* ── GSAP: cada blob tiene dos tweens independientes (x e y)
        con duraciones y fases distintas → curva de Lissajous orgánica ── */
  useGSAP(() => {
    const o = cfg.orbit;

    /* Blob 0 — central, solo respira */
    gsap.to(b0Ref.current, {
      scale:    1.18,
      duration: 2.3,
      repeat:   -1,
      yoyo:     true,
      ease:     'sine.inOut',
    });

    /* Blob 1 — órbita lenta, arriba-derecha */
    gsap.to(b1Ref.current, {
      x:        o * 1.5,
      duration: 2.0,
      repeat:   -1,
      yoyo:     true,
      ease:     'sine.inOut',
    });
    gsap.to(b1Ref.current, {
      y:        -o * 1.1,
      duration: 2.7,
      repeat:   -1,
      yoyo:     true,
      ease:     'sine.inOut',
      delay:    0.5,
    });

    /* Blob 2 — órbita media, abajo-izquierda */
    gsap.to(b2Ref.current, {
      x:        -o * 1.3,
      duration: 1.9,
      repeat:   -1,
      yoyo:     true,
      ease:     'sine.inOut',
      delay:    0.7,
    });
    gsap.to(b2Ref.current, {
      y:        o * 0.9,
      duration: 2.4,
      repeat:   -1,
      yoyo:     true,
      ease:     'sine.inOut',
      delay:    0.2,
    });
    gsap.to(b2Ref.current, {
      scale:    1.12,
      duration: 3.1,
      repeat:   -1,
      yoyo:     true,
      ease:     'sine.inOut',
    });

    /* Blob 3 — pequeño, errático, abajo-derecha */
    gsap.to(b3Ref.current, {
      x:        o * 0.8,
      duration: 1.5,
      repeat:   -1,
      yoyo:     true,
      ease:     'sine.inOut',
      delay:    1.1,
    });
    gsap.to(b3Ref.current, {
      y:        o * 1.2,
      duration: 2.1,
      repeat:   -1,
      yoyo:     true,
      ease:     'sine.inOut',
      delay:    0.4,
    });
    gsap.to(b3Ref.current, {
      scale:    1.25,
      duration: 1.8,
      repeat:   -1,
      yoyo:     true,
      ease:     'sine.inOut',
      delay:    0.9,
    });
  }, { scope: containerRef });

  /* ── Helper para calcular la posición inicial CSS de cada blob ── */
  const blobStyle = (
    diameter: number,
    offsetX:  number = 0,
    offsetY:  number = 0,
  ): React.CSSProperties => ({
    position:     'absolute',
    /* top/left desde el centro del canvas menos el radio del blob */
    left:         `calc(50% + ${offsetX - diameter / 2}px)`,
    top:          `calc(50% + ${offsetY - diameter / 2}px)`,
    width:        diameter,
    height:       diameter,
    borderRadius: '50%',
    background:   blobColor,
  });

  const canvas = (
    <div
      ref={containerRef}
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        gap:            label ? (size === 'sm' ? '0.625rem' : '1.125rem') : 0,
      }}
    >
      {/* Canvas del efecto metaball */}
      <div
        style={{
          width:      cfg.container,
          height:     cfg.container,
          position:   'relative',
          /* La magia: blur "derrite" los bordes, contrast los "chasquea"
             de vuelta a sólido → las bolas se fusionan orgánicamente    */
          filter:     `blur(${cfg.blur}px) contrast(${cfg.contrast})`,
          background: bgColor,
          flexShrink: 0,
        }}
      >
        {/* Blob central */}
        <div ref={b0Ref} style={blobStyle(cfg.b0)} />

        {/* Satélite 1 — arriba-derecha */}
        <div ref={b1Ref} style={blobStyle(cfg.b1, cfg.orbit * 0.6, -cfg.orbit * 0.4)} />

        {/* Satélite 2 — abajo-izquierda */}
        <div ref={b2Ref} style={blobStyle(cfg.b2, -cfg.orbit * 0.5, cfg.orbit * 0.5)} />

        {/* Satélite 3 — abajo-derecha, pequeño */}
        <div ref={b3Ref} style={blobStyle(cfg.b3, cfg.orbit * 0.4, cfg.orbit * 0.7)} />
      </div>

      {/* Label opcional debajo */}
      {label && (
        <p
          style={{
            margin:        0,
            fontSize:      size === 'sm' ? '0.75rem' : '0.9375rem',
            fontWeight:    600,
            color:         labelColor,
            letterSpacing: '-0.01em',
            textAlign:     'center',
          }}
        >
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          position:       'fixed',
          inset:          0,
          zIndex:         9999,
          background:     bgColor,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}
      >
        {canvas}
      </div>
    );
  }

  return canvas;
}
