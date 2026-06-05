/**
 * OrganicLoader — metaball blobs animados con GSAP
 *
 * Técnica: filtro SVG "goo" (feGaussianBlur + feColorMatrix sobre el canal alfa).
 * A diferencia del viejo `filter: blur() contrast()` sobre un fondo sólido:
 *   • Es TRANSPARENTE — no pinta una caja blanca/negra detrás de los blobs,
 *     así se integra con cualquier fondo (gradientes, orbs, móvil).
 *   • Es NÍTIDO — el filtro SVG no produce el aliasing pixelado del contrast()
 *     extremo cuando el loader es pequeño en pantallas de alta densidad.
 *
 * variant="dark"  → blobs negros  (para fondos claros)
 * variant="light" → blobs blancos (para overlays oscuros / fullScreen dark)
 */

import { useRef, useId } from 'react';
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
   container = bounding-box del canvas
   b0–b3     = diámetros de cada blob
   orbit     = radio de movimiento de los satélites
   blur      = stdDeviation del feGaussianBlur (mayor = se funden más lejos)
*/
const CFG = {
  sm: { container: 72,  b0: 24, b1: 18, b2: 16, b3: 13, orbit: 11, blur: 4 },
  md: { container: 120, b0: 40, b1: 30, b2: 26, b3: 21, orbit: 18, blur: 6 },
  lg: { container: 176, b0: 58, b1: 44, b2: 38, b3: 30, orbit: 26, blur: 9 },
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

  /* ID único del filtro SVG — evita colisiones si hay varios loaders en pantalla */
  const rawId    = useId();
  const filterId = `goo-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;

  const cfg        = CFG[size];
  const blobColor  = variant === 'dark' ? '#0A0A0A' : '#FFFFFF';
  const labelColor = variant === 'dark' ? '#374151' : 'rgba(255,255,255,0.75)';

  /* ── GSAP: cada blob tiene tweens x/y independientes con fases distintas
        → curva de Lissajous orgánica que nunca se repite visualmente ── */
  useGSAP(() => {
    const o = cfg.orbit;

    gsap.to(b0Ref.current, {
      scale: 1.16, duration: 2.3, repeat: -1, yoyo: true, ease: 'sine.inOut',
    });

    gsap.to(b1Ref.current, { x:  o * 1.5, duration: 2.0, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to(b1Ref.current, { y: -o * 1.1, duration: 2.7, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.5 });

    gsap.to(b2Ref.current, { x: -o * 1.3, duration: 1.9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.7 });
    gsap.to(b2Ref.current, { y:  o * 0.9, duration: 2.4, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.2 });
    gsap.to(b2Ref.current, { scale: 1.12, duration: 3.1, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    gsap.to(b3Ref.current, { x:  o * 0.8, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.1 });
    gsap.to(b3Ref.current, { y:  o * 1.2, duration: 2.1, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.4 });
    gsap.to(b3Ref.current, { scale: 1.25, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.9 });
  }, { scope: containerRef });

  /* ── Posición inicial de cada blob (centrado + offset) ── */
  const blobStyle = (
    diameter: number,
    offsetX = 0,
    offsetY = 0,
  ): React.CSSProperties => ({
    position:     'absolute',
    left:         `calc(50% + ${offsetX - diameter / 2}px)`,
    top:          `calc(50% + ${offsetY - diameter / 2}px)`,
    width:        diameter,
    height:       diameter,
    borderRadius: '50%',
    background:   blobColor,
    willChange:   'transform',
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
      {/* SVG goo filter (sin dimensiones visibles — solo define el filtro) */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation={cfg.blur} result="blur" />
            {/* Sharpen alpha: blobs se funden donde el blur se solapa, bordes nítidos */}
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
            />
          </filter>
        </defs>
      </svg>

      {/* Canvas — TRANSPARENTE, el filtro goo funde los blobs sin caja de fondo */}
      <div
        style={{
          width:      cfg.container,
          height:     cfg.container,
          position:   'relative',
          filter:     `url(#${filterId})`,
          flexShrink: 0,
        }}
      >
        <div ref={b0Ref} style={blobStyle(cfg.b0)} />
        <div ref={b1Ref} style={blobStyle(cfg.b1,  cfg.orbit * 0.6, -cfg.orbit * 0.4)} />
        <div ref={b2Ref} style={blobStyle(cfg.b2, -cfg.orbit * 0.5,  cfg.orbit * 0.5)} />
        <div ref={b3Ref} style={blobStyle(cfg.b3,  cfg.orbit * 0.4,  cfg.orbit * 0.7)} />
      </div>

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
          background:     variant === 'dark' ? '#FFFFFF' : '#0A0A0A',
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
