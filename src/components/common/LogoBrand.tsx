/**
 * LogoBrand — logo circular animado con órbitas de puntos
 *
 * Diferente al OrganicLoader (metaball blur+contrast):
 *   • Forma circular limpia — fondo negro, borde-radio 50%
 *   • Dos puntos blancos orbitando en sentidos opuestos y velocidades distintas
 *   • Punto central que respira (scale)
 *   • Sin blur — animación orbital precisa, más "logo" que "loader"
 *
 * Uso: reemplaza el TrendingUp estático en Login y Sidebar
 */

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface LogoBrandProps {
  /** Diámetro en px. 32 para sidebar, 44 para login. */
  size?: number;
  /** Forma del contenedor. 'circle' = 50%, 'squircle' = 10px radius */
  shape?: 'circle' | 'squircle';
}

export function LogoBrand({ size = 32, shape = 'circle' }: LogoBrandProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const arm1Ref      = useRef<HTMLDivElement>(null);  // inner orbit
  const arm2Ref      = useRef<HTMLDivElement>(null);  // outer orbit
  const centerRef    = useRef<HTMLDivElement>(null);  // center dot

  /* Proporciones relativas al tamaño */
  const dotCenter = Math.max(3, Math.round(size * 0.155));
  const dot1      = Math.max(2, Math.round(size * 0.12));
  const dot2      = Math.max(2, Math.round(size * 0.085));
  const r1        = size * 0.215;   // radio órbita interna
  const r2        = size * 0.32;    // radio órbita externa

  useGSAP(() => {
    /* Punto central — respira suave */
    gsap.to(centerRef.current, {
      scale:           1.45,
      duration:        2.2,
      repeat:          -1,
      yoyo:            true,
      ease:            'sine.inOut',
      transformOrigin: '50% 50%',
    });

    /* Brazo 1 — gira en sentido antihorario, despacio */
    gsap.fromTo(
      arm1Ref.current,
      { rotation: 0 },
      {
        rotation:        -360,
        duration:        3.8,
        repeat:          -1,
        ease:            'none',
        transformOrigin: '50% 50%',
      },
    );

    /* Brazo 2 — gira en sentido horario, más rápido, desfasado */
    gsap.fromTo(
      arm2Ref.current,
      { rotation: 140 },   // desfase inicial para composición asimétrica
      {
        rotation:        140 + 360,
        duration:        2.3,
        repeat:          -1,
        ease:            'none',
        transformOrigin: '50% 50%',
      },
    );
  }, { scope: containerRef });

  const borderRadius = shape === 'circle' ? '50%' : Math.round(size * 0.24);

  return (
    <div
      ref={containerRef}
      style={{
        width:        size,
        height:       size,
        borderRadius,
        background:   '#0A0A0A',
        position:     'relative',
        flexShrink:   0,
        overflow:     'hidden',  /* clip limpio al círculo/squircle */
      }}
    >
      {/* Punto central — respira */}
      <div
        ref={centerRef}
        style={{
          position:     'absolute',
          width:        dotCenter,
          height:       dotCenter,
          borderRadius: '50%',
          background:   '#FFFFFF',
          top:          `calc(50% - ${dotCenter / 2}px)`,
          left:         `calc(50% - ${dotCenter / 2}px)`,
        }}
      />

      {/* Brazo de órbita interna — el punto está en la posición 12h del brazo */}
      <div
        ref={arm1Ref}
        style={{ position: 'absolute', inset: 0 }}
      >
        <div
          style={{
            position:     'absolute',
            width:        dot1,
            height:       dot1,
            borderRadius: '50%',
            background:   'rgba(255,255,255,0.92)',
            /* posición: radio r1 arriba del centro */
            top:          `calc(50% - ${r1 + dot1 / 2}px)`,
            left:         `calc(50% - ${dot1 / 2}px)`,
          }}
        />
      </div>

      {/* Brazo de órbita externa — punto más pequeño */}
      <div
        ref={arm2Ref}
        style={{ position: 'absolute', inset: 0 }}
      >
        <div
          style={{
            position:     'absolute',
            width:        dot2,
            height:       dot2,
            borderRadius: '50%',
            background:   'rgba(255,255,255,0.65)',
            top:          `calc(50% - ${r2 + dot2 / 2}px)`,
            left:         `calc(50% - ${dot2 / 2}px)`,
          }}
        />
      </div>
    </div>
  );
}
