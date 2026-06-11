/**
 * LogoBrand — Matriz IGO en miniatura
 *
 * Diseño: cuadrícula 2×2 que representa los cuadrantes IGO.
 * El cuadrante Q1 (arriba-derecha, "¡Hacer ya!") brilla con fondo
 * blanco sólido y anima con un pulso suave.
 * Los otros cuadrantes tienen opacidades progresivamente menores
 * según su prioridad (Q2 estratégico → Q3 rutina → Q4 descartar).
 */

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

interface LogoBrandProps {
  /** Diámetro en px. 32 para sidebar, 44 para login. */
  size?: number;
  /** Forma del contenedor. 'circle' = 50%, 'squircle' = radio proporcional */
  shape?: 'circle' | 'squircle';
}

export function LogoBrand({ size = 32, shape = 'circle' }: LogoBrandProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const q1Ref        = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    /* Q1 "¡Hacer ya!" — respira con opacidad para indicar acción */
    gsap.to(q1Ref.current, {
      opacity:  0.68,
      duration: 2.0,
      repeat:   -1,
      yoyo:     true,
      ease:     'sine.inOut',
    });
  }, { scope: containerRef });

  const borderRadius = shape === 'circle' ? '50%' : `${Math.round(size * 0.24)}px`;

  /* Geometría interna proporcional al tamaño */
  const pad      = Math.round(size * 0.18);
  const gap      = Math.max(1, Math.round(size * 0.07));
  const inner    = size - pad * 2;
  const cellSize = (inner - gap) / 2;
  const cellR    = `${Math.max(1, Math.round(cellSize * 0.28))}px`;

  const cell = (opacity: number, ref?: React.RefObject<HTMLDivElement>) => (
    <div
      ref={ref}
      style={{
        width:        cellSize,
        height:       cellSize,
        borderRadius: cellR,
        background:   `rgba(255,255,255,${opacity})`,
        flexShrink:   0,
      }}
    />
  );

  return (
    <div
      ref={containerRef}
      style={{
        width:        size,
        height:       size,
        borderRadius,
        background:   '#0A0A0A',
        flexShrink:   0,
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
      }}
    >
      {/* 2×2 grid — disposición idéntica a la Matriz IGO */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: `${cellSize}px ${cellSize}px`,
          gridTemplateRows:    `${cellSize}px ${cellSize}px`,
          gap:                 `${gap}px`,
        }}
      >
        {cell(0.22)}          {/* Q2 arriba-izq  — Estratégico  */}
        {cell(0.96, q1Ref)}   {/* Q1 arriba-der  — ¡Hacer ya!  */}
        {cell(0.07)}          {/* Q4 abajo-izq   — Descartar   */}
        {cell(0.15)}          {/* Q3 abajo-der   — Rutina      */}
      </div>
    </div>
  );
}
