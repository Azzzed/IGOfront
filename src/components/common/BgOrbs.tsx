import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface BgOrbsProps {
  variant?: 'auth' | 'app' | 'admin';
}

/* Más orbs, más grandes, más blur — efecto nube orgánica */
const configs = {
  auth: [
    /* núcleo principal — grande, derecha */
    { w: 700, h: 560, color: 'rgba(167,139,250,0.30)', top: '-180px',  right: '-120px',  dur: 18, dx:  30, dy: -20 },
    /* azul cielo — izquierda */
    { w: 520, h: 520, color: 'rgba(147,197,253,0.22)', bottom: '-80px', left: '-120px',   dur: 22, dx: -25, dy:  18 },
    /* verde agua — centro */
    { w: 380, h: 340, color: 'rgba(110,231,183,0.16)', top: '35%',      left: '25%',      dur: 15, dx:  18, dy: -14 },
    /* rosa suave — parte alta izquierda */
    { w: 320, h: 300, color: 'rgba(249,168,212,0.18)', top: '-60px',    left: '-60px',    dur: 20, dx:  22, dy:  16 },
    /* ámbar — parte baja derecha */
    { w: 260, h: 240, color: 'rgba(252,211,77,0.13)',  bottom: '5%',    right: '8%',      dur: 17, dx: -18, dy: -20 },
  ],
  app: [
    { w: 650, h: 580, color: 'rgba(167,139,250,0.18)', top: '-200px',  right: '-150px',  dur: 20, dx:  28, dy: -18 },
    { w: 480, h: 480, color: 'rgba(147,197,253,0.15)', bottom: '0px',  left: '-150px',   dur: 24, dx: -22, dy:  15 },
    { w: 340, h: 320, color: 'rgba(249,168,212,0.12)', top: '30%',     left: '30%',      dur: 16, dx:  16, dy: -12 },
    { w: 280, h: 260, color: 'rgba(110,231,183,0.10)', bottom: '20%',  right: '15%',     dur: 19, dx: -14, dy:  16 },
  ],
  admin: [
    { w: 560, h: 520, color: 'rgba(110,231,183,0.18)', top: '-100px',   left: '-100px',   dur: 21, dx:  24, dy: -16 },
    { w: 400, h: 380, color: 'rgba(167,139,250,0.15)', bottom: '80px',  right: '-50px',   dur: 17, dx: -20, dy:  18 },
    { w: 280, h: 260, color: 'rgba(147,197,253,0.12)', top: '40%',      left: '40%',      dur: 19, dx:  16, dy: -14 },
  ],
} as const;

type OrbCfg = (typeof configs)[keyof typeof configs][number];

export function BgOrbs({ variant = 'app' }: BgOrbsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const orbs = ref.current?.querySelectorAll<HTMLElement>('.cloud-orb');
      orbs?.forEach((orb, i) => {
        const cfg = (configs[variant] as readonly OrbCfg[])[i];
        if (!cfg) return;
        gsap.to(orb, {
          x: cfg.dx,
          y: cfg.dy,
          duration: cfg.dur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 1.4,
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [variant]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {(configs[variant] as readonly OrbCfg[]).map((c, i) => (
        <div
          key={i}
          className="cloud-orb"
          style={{
            position:  'absolute',
            width:     c.w,
            height:    c.h,
            borderRadius: '50%',
            background: c.color,
            filter: 'blur(110px)',
            top:    'top'    in c ? (c as { top?: string }).top    : undefined,
            bottom: 'bottom' in c ? (c as { bottom?: string }).bottom : undefined,
            left:   'left'   in c ? (c as { left?: string }).left   : undefined,
            right:  'right'  in c ? (c as { right?: string }).right  : undefined,
          }}
        />
      ))}
    </div>
  );
}
