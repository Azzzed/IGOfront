# IGO Manager — Frontend React
## REFERENCIA VISUAL OBLIGATORIA: https://www.retellai.com/
Lee esta URL antes de generar cualquier pantalla. El diseño de IGO Manager
se inspira DIRECTAMENTE en Retell AI. Fondo blanco, texto negro, nubes de
color difusas, navbar con blur. NO dark mode, NO neon, NO glassmorphism oscuro.

---

## Identidad Visual — LEER PRIMERO

### Filosofía
Blanco, limpio, editorial, premium. Como una consultora de alto nivel.
El empresario debe sentir que usa una herramienta seria y moderna,
no una app de startup genérica. Inspirado en Retell AI:
- Fondo blanco puro `#FFFFFF` o `#FAFAFA`
- Texto negro `#0A0A0A` — fuerte, legible, directo
- Tipografía grande y bold en los títulos
- Nubes de color difusas en el fondo (no neon, tonos pastel suaves)
- Sin sombras pesadas, sin glassmorphism oscuro
- Espaciado generoso — respira

### Paleta de colores
```css
/* Fondos */
--bg-primary:    #FFFFFF;
--bg-secondary:  #F8F8F8;
--bg-card:       #FFFFFF;

/* Texto */
--text-primary:   #0A0A0A;
--text-secondary: #6B7280;
--text-muted:     #9CA3AF;

/* Bordes */
--border:         rgba(0, 0, 0, 0.08);
--border-hover:   rgba(0, 0, 0, 0.15);

/* Acento único — sin neon */
--accent:         #1A1A1A;
--accent-hover:   #374151;

/* Nubes de color de fondo (como Retell AI) */
--cloud-purple:   rgba(167, 139, 250, 0.25);   /* lila suave */
--cloud-blue:     rgba(147, 197, 253, 0.20);   /* azul cielo */
--cloud-green:    rgba(110, 231, 183, 0.18);   /* verde agua */
--cloud-pink:     rgba(249, 168, 212, 0.20);   /* rosa pálido */
--cloud-amber:    rgba(252, 211, 77, 0.15);    /* ámbar muy suave */

/* Cuadrantes IGO — colores con personalidad pero no neon */
--q1-color:  #16A34A;   /* verde bosque — Hacer ya */
--q1-bg:     #F0FDF4;
--q2-color:  #2563EB;   /* azul real — Estratégico */
--q2-bg:     #EFF6FF;
--q3-color:  #D97706;   /* ámbar cálido — Rutina */
--q3-bg:     #FFFBEB;
--q4-color:  #6B7280;   /* gris — Descartar */
--q4-bg:     #F9FAFB;

/* Sliders IGO — degradé de rojo a verde según valor */
--slider-1:  #DC2626;   /* rojo */
--slider-2:  #EA580C;   /* naranja */
--slider-3:  #CA8A04;   /* ámbar */
--slider-4:  #65A30D;   /* verde lima */
--slider-5:  #16A34A;   /* verde */
```

### Nubes de color en el fondo (como Retell AI)
El efecto clave de Retell AI son los orbs/nubes de color difusas
que flotan en el fondo blanco. Se implementa así:
```css
.bg-orbs {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
}
/* Posiciones de los orbs — varían por página */
.orb-1 { width: 600px; height: 600px; background: var(--cloud-purple); top: -200px; right: -100px; }
.orb-2 { width: 400px; height: 400px; background: var(--cloud-blue);   bottom: 100px; left: -150px; }
.orb-3 { width: 300px; height: 300px; background: var(--cloud-green);  top: 40%; right: 20%; }
```

### Navbar — estilo Retell AI
```css
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  /* Frosted glass sobre fondo blanco */
  background: rgba(255, 255, 255, 0.80);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  /* Sin sombra — el blur hace el trabajo */
}
/* Al hacer scroll, el borde se hace un poco más visible */
.navbar.scrolled {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(0, 0, 0, 0.10);
}
```

### Tipografía — estilo editorial Retell AI
```
Font: Inter, system-ui, sans-serif
Títulos grandes: font-size 2.5rem–4rem, font-weight 700–800, letter-spacing -0.03em
Subtítulos:      font-size 1.1rem, font-weight 400, color var(--text-secondary)
Labels:          font-size 0.75rem, font-weight 600, letter-spacing 0.08em, UPPERCASE
Body:            font-size 0.9375rem, line-height 1.6
```

### Sliders IGO — dinámicos e intuitivos
```typescript
/* El color de los sliders cambia según el valor */
export const getSliderColor = (value: number) => ({
  1: { color: '#DC2626', label: 'Casi sin impacto',     bg: '#FEF2F2' },
  2: { color: '#EA580C', label: 'Impacto bajo',         bg: '#FFF7ED' },
  3: { color: '#CA8A04', label: 'Impacto moderado',     bg: '#FEFCE8' },
  4: { color: '#65A30D', label: 'Alto impacto',         bg: '#F7FEE7' },
  5: { color: '#16A34A', label: 'Impacto crítico',      bg: '#F0FDF4' },
}[value]);

export const getGobColor = (value: number) => ({
  1: { color: '#DC2626', label: 'Sin capacidad ahora',    bg: '#FEF2F2' },
  2: { color: '#EA580C', label: 'Capacidad limitada',     bg: '#FFF7ED' },
  3: { color: '#CA8A04', label: 'Capacidad moderada',     bg: '#FEFCE8' },
  4: { color: '#65A30D', label: 'Buena capacidad',        bg: '#F7FEE7' },
  5: { color: '#16A34A', label: 'Tengo todo para hacerlo',bg: '#F0FDF4' },
}[value]);
```

El slider tiene:
- Track con color dinámico (no gris estático)
- Label de texto debajo que cambia con animación fade
- Badge de color que muestra el valor con su significado
- Micro-bounce al soltar con GSAP

### Animaciones — suaves y significativas
```typescript
/* Entrada de página — como Retell AI */
gsap.fromTo('.page-enter', 
  { opacity: 0, y: 16 },
  { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
);

/* Cards en stagger */
gsap.fromTo('.card-item',
  { opacity: 0, y: 12 },
  { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }
);

/* Orbs flotando en el fondo — movimiento muy sutil */
gsap.to('.orb-1', {
  x: 30, y: -20, duration: 8,
  repeat: -1, yoyo: true, ease: 'sine.inOut'
});

/* Punto de la matriz IGO */
gsap.to(puntoRef.current, {
  x: newX, y: newY,
  duration: 0.35, ease: 'power2.inOut'
});

/* Scroll reveal — texto que aparece al hacer scroll */
gsap.fromTo(elemento, 
  { opacity: 0, y: 24 },
  { opacity: 1, y: 0, scrollTrigger: { trigger: elemento, start: 'top 85%' }}
);

/* Navbar que cambia al hacer scroll */
ScrollTrigger.create({
  start: 'top -80',
  onEnter: () => navbar.classList.add('scrolled'),
  onLeaveBack: () => navbar.classList.remove('scrolled'),
});
```

---

## Stack
- React 18 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui (Radix + preset Mira)
- Zustand para estado global
- Axios para llamadas a la API Laravel
- React Hook Form + Zod para formularios
- GSAP + @gsap/react + ScrollTrigger para animaciones
- Recharts para la matriz IGO
- React Router DOM para rutas
- date-fns para fechas
- Sonner para notificaciones

## API Backend
- Base URL: VITE_API_URL (http://127.0.0.1:8000/api/v1)
- Auth: Bearer token en Authorization header
- Token guardado en localStorage: "igo_token"
- Cliente en src/lib/axios.ts

## Estructura de carpetas
```
src/
├── components/
│   ├── ui/               ← shadcn (NUNCA editar)
│   ├── common/
│   │   ├── BgOrbs.tsx        ← nubes de color animadas (como Retell AI)
│   │   ├── Navbar.tsx        ← navbar blur + scroll effect
│   │   └── BottomNav.tsx     ← nav inferior mobile
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegistroForm.tsx
│   │   └── InvitadoForm.tsx
│   ├── empresa/
│   │   ├── FormEmpresa.tsx
│   │   ├── ListaEmpresas.tsx
│   │   └── SelectorEmpresa.tsx
│   ├── iniciativa/
│   │   ├── FormIniciativa.tsx
│   │   ├── ListaIniciativas.tsx
│   │   └── SliderIGO.tsx
│   ├── matriz/
│   │   ├── MatrizIGO.tsx
│   │   └── InfoAsintota.tsx
│   ├── informe/
│   │   ├── InformeIGO.tsx
│   │   ├── ChecklistAccion.tsx
│   │   └── BotonExportarPDF.tsx
│   ├── plan/
│   │   ├── FormPlan.tsx
│   │   └── EstadoPlan.tsx
│   └── admin/
│       ├── DashboardAdmin.tsx
│       └── GraficaSector.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── RegistroPage.tsx
│   ├── EmpresasPage.tsx
│   ├── IniciativasPage.tsx
│   ├── MatrizPage.tsx
│   ├── InformePage.tsx
│   ├── PlanPage.tsx
│   └── AdminPage.tsx
├── store/
│   ├── authStore.ts
│   └── empresaStore.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useEmpresas.ts
│   ├── useIniciativas.ts
│   ├── useMatriz.ts
│   ├── useInforme.ts
│   └── usePlan.ts
├── lib/
│   ├── axios.ts
│   └── utils.ts
└── types/
    ├── auth.types.ts
    ├── empresa.types.ts
    ├── iniciativa.types.ts
    ├── plan.types.ts
    └── informe.types.ts
```

## Reglas absolutas

1. **Fondo BLANCO siempre. NO dark mode por defecto.**
   El fondo base es #FFFFFF. Las nubes de color van encima, difusas.
   El dark mode es opcional y se añade en fases posteriores.

2. **Texto NEGRO sobre blanco. Sin colores de texto creativos.**
   Títulos: #0A0A0A. Secundario: #6B7280. Muted: #9CA3AF.

3. **Navbar siempre con backdrop-filter: blur(20px).**
   Al inicio: fondo blanco 80% de opacidad.
   Con scroll: fondo blanco 95% + borde un poco más visible.

4. **Nubes de color (orbs) en TODAS las páginas.**
   El componente BgOrbs.tsx va en el layout base.
   Los orbs tienen diferentes posiciones y colores por sección,
   pero siempre difusos, nunca saturados.

5. **Tipografía editorial en los títulos.**
   font-weight: 700-800, letter-spacing: -0.03em, tamaño generoso.
   Los títulos de sección se inspiran en "Built to Scale" de Retell:
   palabras en líneas separadas, algunas en color acento.

6. **Sliders IGO con color dinámico.**
   Nunca un slider gris estático. El color cambia según el valor.

7. **Mobile first siempre.**
   Diseña para 375px. Breakpoints: base → md → lg.
   En mobile: bottom navigation bar. En desktop: sidebar.

8. **GSAP para todas las animaciones.**
   Entradas de página, stagger de cards, orbs flotando,
   punto de la matriz. Ninguna animación con solo CSS.

9. **Nunca hagas llamadas a la API en componentes.**
   Todo en src/hooks/.

10. **TypeScript estricto. Nunca uses `any`.**

11. **ScrollTrigger de GSAP para reveal al hacer scroll.**
    Los elementos importantes entran al viewport con animación.

12. **Cards con borde sutil: 1px solid rgba(0,0,0,0.08).**
    Sin sombras pesadas. El borde es la frontera, no box-shadow.

## Componente BgOrbs.tsx (OBLIGATORIO en layout)
```tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface BgOrbsProps {
  variant?: 'auth' | 'app' | 'admin';
}

export function BgOrbs({ variant = 'app' }: BgOrbsProps) {
  const orbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orbs = orbsRef.current?.querySelectorAll('.orb');
    orbs?.forEach((orb, i) => {
      gsap.to(orb, {
        x: (i % 2 === 0 ? 1 : -1) * (20 + i * 8),
        y: (i % 2 === 0 ? -1 : 1) * (15 + i * 5),
        duration: 6 + i * 2,
        repeat: -1, yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.8,
      });
    });
  }, []);

  const configs = {
    auth: [
      { size: 500, color: 'rgba(167,139,250,0.22)', top: '-150px', right: '-100px' },
      { size: 350, color: 'rgba(147,197,253,0.18)', bottom: '-50px', left: '-100px' },
      { size: 250, color: 'rgba(110,231,183,0.15)', top: '40%', right: '25%' },
    ],
    app: [
      { size: 600, color: 'rgba(167,139,250,0.18)', top: '-200px', right: '-150px' },
      { size: 400, color: 'rgba(147,197,253,0.15)', bottom: '0px', left: '-150px' },
      { size: 300, color: 'rgba(249,168,212,0.12)', top: '30%', left: '30%' },
    ],
    admin: [
      { size: 500, color: 'rgba(110,231,183,0.18)', top: '-100px', left: '-100px' },
      { size: 350, color: 'rgba(167,139,250,0.15)', bottom: '100px', right: '-50px' },
    ],
  };

  return (
    <div
      ref={orbsRef}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
      }}
    >
      {configs[variant].map((c, i) => (
        <div
          key={i}
          className="orb"
          style={{
            position: 'absolute',
            width: c.size, height: c.size,
            borderRadius: '50%',
            background: c.color,
            filter: 'blur(80px)',
            ...c,
          }}
        />
      ))}
    </div>
  );
}
```

## Componente Navbar.tsx (OBLIGATORIO)
```tsx
/* Navbar con blur y scroll effect — inspirado en Retell AI */
useEffect(() => {
  ScrollTrigger.create({
    start: 'top -60',
    onEnter: () => setScrolled(true),
    onLeaveBack: () => setScrolled(false),
  });
}, []);

/* Estilos */
const navStyle = {
  position: 'fixed' as const,
  top: 0, left: 0, right: 0, zIndex: 100,
  background: scrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderBottom: scrolled
    ? '1px solid rgba(0,0,0,0.10)'
    : '1px solid rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  padding: '0 1.5rem',
  height: '60px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};
```

## Cuadrantes IGO
```typescript
export const CUADRANTES = {
  1: { label: '¡Hacer ya!',  color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  2: { label: 'Estratégico', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  3: { label: 'Rutina',      color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  4: { label: 'Descartar',   color: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
} as const;
```

## Axios (src/lib/axios.ts)
```typescript
import axios from 'axios';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  withCredentials: true,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('igo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('igo_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export default api;
```

## Rutas
```
/login          → LoginPage
/registro       → RegistroPage
/               → EmpresasPage (si auth) o /login
/empresas       → EmpresasPage
/empresas/nueva → FormEmpresa
/iniciativas    → IniciativasPage
/iniciativas/nueva → FormIniciativa
/matriz         → MatrizPage
/informe        → InformePage
/plan/:id       → PlanPage
/admin          → AdminPage (solo admin)
```

## Orden de desarrollo FASE 1
```
□ index.css con variables CSS completas (fondo blanco, nubes, etc.)
□ src/lib/axios.ts
□ src/types/ completo
□ src/store/authStore.ts + empresaStore.ts
□ src/hooks/useAuth.ts
□ BgOrbs.tsx (componente de nubes animadas)
□ Navbar.tsx (blur + scroll effect)
□ BottomNav.tsx (mobile)
□ ProtectedRoute.tsx
□ App.tsx con rutas + tema base blanco
□ LoginPage: fondo blanco + orbs + navbar blur + form limpio
□ RegistroPage: stepper 2 pasos con slide GSAP
```

## Skills instaladas en .claude/
Usar activamente:
- design-taste-frontend   → decisiones de diseño senior
- gpt-taste               → UX premium + GSAP
- high-end-visual-design  → estética agencia
- imagegen-frontend-mobile → mobile first
- imagegen-frontend-web   → web
- full-output-enforcement → no truncar
- gsap-react / gsap-core / gsap-timeline / gsap-utils
- impeccable              → auditoría

## Variables de entorno
```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```