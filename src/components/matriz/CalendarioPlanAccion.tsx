import { useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, isWithinInterval, isToday,
  addWeeks, subWeeks, addMonths, subMonths,
  addDays, differenceInWeeks,
  parseISO, startOfDay, endOfDay, isSameDay,
} from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Zap } from 'lucide-react';
import { CUADRANTES } from '@/lib/utils';
import type { InformeDB, IniciativaInforme, PlazoInforme } from '@/types/informe.types';
import type { Cuadrante } from '@/types/iniciativa.types';

/* ─── Spanish locale constants ─── */

const WEEK_DAYS   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MESES       = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MESES_CORTO = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

/* ─── Types ─── */

type IniciativaConPlazo = IniciativaInforme & { plazo: PlazoInforme };

interface AccionConFecha {
  titulo:        string;
  descripcion:   string;
  fecha:         Date;
  iniciativaId:  number;
  cuadrante:     Cuadrante;
  accionIndex:   number;
  totalAcciones: number;
}

interface IniciativaEnPeriodo {
  ini:              IniciativaConPlazo;
  semanaActual:     number;   // 1-based (only meaningful in week mode)
  totalSemanas:     number;
  periodoStart:     Date;     // clipped to visible range
  periodoEnd:       Date;     // clipped to visible range
  accionesEnPeriodo: AccionConFecha[];
}

/* ─── Pure helpers ─── */

function fmtDate(d: Date): string {
  return `${d.getDate()} ${MESES_CORTO[d.getMonth()]}`;
}

function getRangeLabel(mode: 'week' | 'month', date: Date): string {
  if (mode === 'month') {
    return `${MESES[date.getMonth()]} ${date.getFullYear()}`;
  }
  const s = startOfWeek(date, { weekStartsOn: 1 });
  const e = endOfWeek(date, { weekStartsOn: 1 });
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} – ${e.getDate()} ${MESES_CORTO[s.getMonth()]} ${s.getFullYear()}`;
  }
  return `${fmtDate(s)} – ${fmtDate(e)} ${e.getFullYear()}`;
}

function getWeekRows(date: Date): Date[][] {
  return [eachDayOfInterval({
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end:   endOfWeek(date,   { weekStartsOn: 1 }),
  })];
}

function getMonthRows(date: Date): Date[][] {
  const gridStart = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
  const gridEnd   = endOfWeek(endOfMonth(date),     { weekStartsOn: 1 });
  const all       = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const weeks: Date[][] = [];
  for (let i = 0; i < all.length; i += 7) weeks.push(all.slice(i, i + 7));
  return weeks;
}

function parseFecha(fecha: string): Date {
  return startOfDay(parseISO(fecha));
}

/** Distributes an initiative's acciones evenly across its plazo.
 *  Returns an AccionConFecha[] with a computed date for each action. */
function computeAccionesDates(ini: IniciativaConPlazo): AccionConFecha[] {
  const { acciones, plazo } = ini;
  if (acciones.length === 0) return [];

  const start    = parseFecha(plazo.fecha_inicio);
  const totalDays = Math.max(plazo.duracion_dias - 1, 0);

  return acciones.map((accion, i) => {
    const offset = acciones.length === 1
      ? 0
      : Math.round((i / (acciones.length - 1)) * totalDays);

    return {
      ...accion,
      fecha:         addDays(start, offset),
      iniciativaId:  ini.id,
      cuadrante:     ini.cuadrante as Cuadrante,
      accionIndex:   i,
      totalAcciones: acciones.length,
    };
  });
}

/** Returns week-position info for an initiative within a visible week range. */
function getWeekPosition(ini: IniciativaConPlazo, visibleStart: Date) {
  const iniStart = parseFecha(ini.plazo.fecha_inicio);
  const iniEnd   = parseFecha(ini.plazo.fecha_fin);

  const iniWeekStart  = startOfWeek(iniStart, { weekStartsOn: 1 });
  const iniWeekEnd    = startOfWeek(iniEnd,   { weekStartsOn: 1 });
  const totalSemanas  = differenceInWeeks(iniWeekEnd, iniWeekStart) + 1;

  const currentWeekStart = startOfWeek(visibleStart, { weekStartsOn: 1 });
  const semanaActual     = differenceInWeeks(currentWeekStart, iniWeekStart) + 1;

  return { semanaActual, totalSemanas };
}

/** Returns all acciones from all initiatives that land on a given day. */
function getAccionesOnDay(day: Date, allAcciones: AccionConFecha[]): AccionConFecha[] {
  return allAcciones.filter((a) => isSameDay(a.fecha, day));
}

/** Returns all initiatives whose plazo overlaps a given day. */
function getDayInitiativas(day: Date, inis: IniciativaConPlazo[]): IniciativaConPlazo[] {
  const dayNorm = startOfDay(day);
  return inis.filter((i) => {
    const s = parseFecha(i.plazo.fecha_inicio);
    const e = endOfDay(parseFecha(i.plazo.fecha_fin));
    return isWithinInterval(dayNorm, { start: s, end: e });
  });
}

/* ─── DayCell ─── */

interface DayCellProps {
  day:            Date;
  iniciativas:    IniciativaConPlazo[];
  acciones:       AccionConFecha[];
  isCurrentMonth: boolean;
  onSelectDay:    (day: Date) => void;
}

function DayCell({ day, iniciativas, acciones, isCurrentMonth, onSelectDay }: DayCellProps) {
  const today     = isToday(day);
  const hasIni    = iniciativas.length > 0;
  const hasAccion = acciones.length > 0;
  const quads     = [...new Set(iniciativas.map((i) => i.cuadrante))].slice(0, 3);
  const isActive  = hasIni || hasAccion;

  return (
    <div
      className="cal-day"
      onClick={() => isActive && onSelectDay(day)}
      onMouseEnter={(e) => {
        if (!isActive) return;
        gsap.to(e.currentTarget, { scale: 1.06, duration: 0.15, ease: 'power2.out' });
      }}
      onMouseLeave={(e) => {
        gsap.to(e.currentTarget, { scale: 1, duration: 0.15, ease: 'power2.out' });
      }}
      style={{
        position: 'relative',
        borderRadius: 8,
        padding: '5px 2px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        minHeight: 52,
        cursor: isActive ? 'pointer' : 'default',
        background: today ? 'rgba(0,0,0,0.03)' : 'transparent',
        userSelect: 'none',
      }}
    >
      {today && (
        <div
          className="cal-today-ring"
          style={{
            position: 'absolute', inset: 0,
            borderRadius: 8,
            border: '2px solid #0A0A0A',
            pointerEvents: 'none',
          }}
        />
      )}

      <span style={{
        fontSize: '0.8125rem',
        fontWeight: today ? 700 : 500,
        color: !isCurrentMonth ? '#D1D5DB' : today ? '#0A0A0A' : '#374151',
        lineHeight: 1,
      }}>
        {day.getDate()}
      </span>

      {/* Initiative range dots */}
      {hasIni && (
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {quads.map((q) => (
            <div
              key={q}
              className="cal-dot"
              style={{
                width: 5, height: 5, borderRadius: '50%',
                background: CUADRANTES[q as Cuadrante].color,
                flexShrink: 0,
              }}
            />
          ))}
          {iniciativas.length > 3 && (
            <span style={{ fontSize: '0.5rem', color: '#9CA3AF', fontWeight: 700, lineHeight: '5px' }}>
              +{iniciativas.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Action indicator — small lightning bolt / square on action days */}
      {hasAccion && (
        <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {acciones.slice(0, 3).map((a, i) => (
            <div
              key={i}
              className="cal-dot"
              title={a.titulo}
              style={{
                width: 5, height: 5,
                borderRadius: 1,          /* square = action (vs round = initiative) */
                background: CUADRANTES[a.cuadrante].color,
                opacity: 0.85,
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── IniciativaRow (list below the calendar) ─── */

interface IniciativaRowProps {
  entry:    IniciativaEnPeriodo;
  onSelect: (id: number) => void;
}

function IniciativaRow({ entry, onSelect }: IniciativaRowProps) {
  const { ini, semanaActual, totalSemanas, periodoStart, periodoEnd, accionesEnPeriodo } = entry;
  const q = CUADRANTES[ini.cuadrante as Cuadrante];
  const isMultiWeek = totalSemanas > 1;

  return (
    <button
      onClick={() => onSelect(ini.id)}
      style={{
        width: '100%', textAlign: 'left',
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '0.75rem 0',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'stretch', gap: 12,
      }}
    >
      {/* Color bar */}
      <div
        className="cal-bar"
        style={{
          width: 3, borderRadius: 2,
          background: q.color,
          flexShrink: 0, minHeight: 44,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top row: badge + week position */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{
            display: 'inline-block',
            fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.03em',
            color: q.color, background: q.bg, border: `1px solid ${q.border}`,
            borderRadius: 4, padding: '1px 6px',
          }}>
            {ini.etiqueta}
          </span>

          {isMultiWeek && (
            <span style={{
              display: 'inline-block',
              fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.04em',
              color: '#9CA3AF', background: 'rgba(0,0,0,0.04)',
              borderRadius: 4, padding: '1px 6px',
            }}>
              Sem. {semanaActual}/{totalSemanas}
            </span>
          )}
        </div>

        {/* Title */}
        <p style={{
          fontSize: '0.875rem', fontWeight: 600, color: '#0A0A0A',
          margin: 0, lineHeight: 1.35,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
        }}>
          {ini.titulo}
        </p>

        {/* Period range (clipped to visible) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          <Clock size={10} color="#9CA3AF" strokeWidth={2} />
          <span style={{ fontSize: '0.6875rem', color: '#9CA3AF' }}>
            {isMultiWeek
              ? `${fmtDate(periodoStart)} → ${fmtDate(periodoEnd)} · (total: ${fmtDate(parseFecha(ini.plazo.fecha_inicio))} → ${fmtDate(parseFecha(ini.plazo.fecha_fin))})`
              : `${fmtDate(parseFecha(ini.plazo.fecha_inicio))} → ${fmtDate(parseFecha(ini.plazo.fecha_fin))} · ${ini.plazo.descripcion_plazo}`
            }
          </span>
        </div>

        {/* Actions in this period */}
        {accionesEnPeriodo.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {accionesEnPeriodo.map((accion, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 6,
                  background: q.bg,
                  border: `1px solid ${q.border}`,
                  borderRadius: 6, padding: '5px 8px',
                }}
              >
                <Zap
                  size={9}
                  color={q.color}
                  strokeWidth={2.5}
                  style={{ marginTop: 3, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.75rem', fontWeight: 600, color: '#0A0A0A',
                    margin: 0, lineHeight: 1.3,
                  }}>
                    {accion.titulo}
                  </p>
                  <span style={{ fontSize: '0.625rem', color: '#9CA3AF' }}>
                    {fmtDate(accion.fecha)} · acción {accion.accionIndex + 1} de {accion.totalAcciones}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </button>
  );
}

/* ─── Main component ─── */

interface Props {
  informe:            InformeDB;
  onSelectIniciativa: (id: number) => void;
}

export function CalendarioPlanAccion({ informe, onSelectIniciativa }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef      = useRef<HTMLDivElement>(null);

  const [viewMode,    setViewMode]    = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(() => new Date());

  /* Filtered + sorted iniciativas with non-null plazo */
  const iniciativas = useMemo((): IniciativaConPlazo[] => {
    const raw = informe.contenido?.iniciativas ?? [];
    return raw
      .filter((i): i is IniciativaConPlazo =>
        i.plazo !== null &&
        i.plazo !== undefined &&
        typeof (i.plazo as PlazoInforme).fecha_inicio === 'string' &&
        typeof (i.plazo as PlazoInforme).fecha_fin    === 'string',
      )
      .sort((a, b) =>
        parseFecha(a.plazo.fecha_inicio).getTime() - parseFecha(b.plazo.fecha_inicio).getTime(),
      );
  }, [informe]);

  /* Pre-compute all acciones with dates */
  const todasLasAcciones = useMemo(
    () => iniciativas.flatMap(computeAccionesDates),
    [iniciativas],
  );

  /* Grid rows */
  const rows = useMemo(
    () => viewMode === 'week' ? getWeekRows(currentDate) : getMonthRows(currentDate),
    [viewMode, currentDate],
  );

  /* Visible range */
  const visibleRange = useMemo(() => ({
    start: startOfDay(rows[0][0]),
    end:   endOfDay(rows[rows.length - 1][6]),
  }), [rows]);

  /* Initiatives overlapping with visible range */
  const visibleIniciativas = useMemo(() => iniciativas.filter((i) => {
    const s = parseFecha(i.plazo.fecha_inicio);
    const e = endOfDay(parseFecha(i.plazo.fecha_fin));
    return s <= visibleRange.end && e >= visibleRange.start;
  }), [iniciativas, visibleRange]);

  /* Acciones within visible range */
  const visibleAcciones = useMemo(
    () => todasLasAcciones.filter((a) =>
      isWithinInterval(a.fecha, { start: visibleRange.start, end: visibleRange.end }),
    ),
    [todasLasAcciones, visibleRange],
  );

  /* Build IniciativaEnPeriodo list for the sidebar */
  const iniEnPeriodo = useMemo((): IniciativaEnPeriodo[] =>
    visibleIniciativas.map((ini) => {
      const iniStart = parseFecha(ini.plazo.fecha_inicio);
      const iniEnd   = parseFecha(ini.plazo.fecha_fin);

      const periodoStart = iniStart < visibleRange.start ? visibleRange.start : iniStart;
      const periodoEnd   = iniEnd   > visibleRange.end   ? visibleRange.end   : iniEnd;

      const { semanaActual, totalSemanas } = viewMode === 'week'
        ? getWeekPosition(ini, visibleRange.start)
        : { semanaActual: 1, totalSemanas: 1 };

      const accionesEnPeriodo = todasLasAcciones.filter(
        (a) =>
          a.iniciativaId === ini.id &&
          isWithinInterval(a.fecha, { start: visibleRange.start, end: visibleRange.end }),
      );

      return { ini, semanaActual, totalSemanas, periodoStart, periodoEnd, accionesEnPeriodo };
    }),
    [visibleIniciativas, visibleRange, todasLasAcciones, viewMode],
  );

  /* Counts per quadrant */
  const counts = useMemo(() => {
    const c: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
    visibleIniciativas.forEach((i) => { if (i.cuadrante !== 4) c[i.cuadrante] = (c[i.cuadrante] ?? 0) + 1; });
    return c;
  }, [visibleIniciativas]);

  const rangeLabel  = getRangeLabel(viewMode, currentDate);
  const companyName = informe.contenido.empresa ?? '';

  /* ── Navigation ── */

  const navigatePrev = () => {
    const grid = gridRef.current;
    if (!grid) return;
    gsap.to(grid, {
      opacity: 0, x: 28, duration: 0.14, ease: 'power2.in',
      onComplete: () =>
        setCurrentDate((d) => viewMode === 'week' ? subWeeks(d, 1) : subMonths(d, 1)),
    });
  };

  const navigateNext = () => {
    const grid = gridRef.current;
    if (!grid) return;
    gsap.to(grid, {
      opacity: 0, x: -28, duration: 0.14, ease: 'power2.in',
      onComplete: () =>
        setCurrentDate((d) => viewMode === 'week' ? addWeeks(d, 1) : addMonths(d, 1)),
    });
  };

  /* ── Toggle week/month ── */

  const handleToggle = (newMode: 'week' | 'month') => {
    if (newMode === viewMode) return;
    const grid = gridRef.current;
    if (!grid) return;
    gsap.to(grid, {
      opacity: 0, y: -8, duration: 0.14, ease: 'power2.in',
      onComplete: () => setViewMode(newMode),
    });
  };

  /* ── Day click ── */

  const handleDayClick = (day: Date) => {
    const dayInis = getDayInitiativas(day, iniciativas);
    if (dayInis.length > 0) onSelectIniciativa(dayInis[0].id);
    else {
      const dayActions = getAccionesOnDay(day, todasLasAcciones);
      if (dayActions.length > 0) onSelectIniciativa(dayActions[0].iniciativaId);
    }
  };

  /* ── GSAP: one-time entrance ── */

  useGSAP(
    () => {
      gsap.fromTo('.cal-card',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      );
    },
    { scope: containerRef, dependencies: [] },
  );

  /* ── GSAP: grid re-entrance on view/date change ── */

  useGSAP(
    () => {
      const grid = gridRef.current;
      if (!grid) return;

      const currX = gsap.getProperty(grid, 'x') as number;
      const fromX = currX < -1 ? 28 : currX > 1 ? -28 : 0;

      gsap.set(grid, { opacity: 1, y: 0, x: fromX });

      if (Math.abs(fromX) > 1) {
        gsap.to(grid, { x: 0, duration: 0.26, ease: 'power2.out' });
      }

      gsap.fromTo('.cal-day',
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, duration: 0.26, stagger: 0.04, ease: 'power2.out' },
      );

      gsap.fromTo('.cal-dot',
        { scale: 0 },
        { scale: 1, duration: 0.22, stagger: 0.025, ease: 'back.out(1.7)', delay: 0.05 },
      );

      gsap.to('.cal-today-ring', {
        opacity: 0.45, duration: 2,
        repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 0.4,
      });

      gsap.fromTo('.cal-bar',
        { scaleY: 0 },
        { scaleY: 1, duration: 0.24, stagger: 0.04, ease: 'power2.out', transformOrigin: 'top', delay: 0.08 },
      );
    },
    { scope: containerRef, dependencies: [viewMode, currentDate] },
  );

  /* ── Render ── */

  return (
    <div ref={containerRef}>
      <div
        className="cal-card"
        style={{
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: 16,
          background: '#FFFFFF',
          overflow: 'hidden',
          marginBottom: '1.25rem',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '1rem 1.25rem 0.75rem',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarDays size={17} color="#0A0A0A" strokeWidth={2} />
            <div>
              <p style={{
                fontSize: '0.9375rem', fontWeight: 700,
                color: '#0A0A0A', letterSpacing: '-0.01em',
                margin: 0, lineHeight: 1,
              }}>
                Plan de acción
              </p>
              <p style={{ fontSize: '0.6875rem', color: '#9CA3AF', margin: '3px 0 0' }}>
                {companyName ? `${companyName} · ` : ''}{rangeLabel}
              </p>
            </div>
          </div>

          {/* Week / Mes toggle */}
          <div style={{
            display: 'inline-flex',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 999, padding: 3,
          }}>
            {(['week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleToggle(mode)}
                style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  padding: '4px 12px', borderRadius: 999, border: 'none',
                  cursor: 'pointer',
                  background: viewMode === mode ? '#0A0A0A' : 'transparent',
                  color: viewMode === mode ? '#FFFFFF' : '#6B7280',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {mode === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>

        {/* ── Navigation row ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.625rem 1rem 0.25rem',
        }}>
          <button
            onClick={navigatePrev}
            style={{
              width: 28, height: 28, borderRadius: 8, border: 'none',
              background: 'rgba(0,0,0,0.05)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6B7280',
            }}
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </button>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151' }}>
            {rangeLabel}
          </span>
          <button
            onClick={navigateNext}
            style={{
              width: 28, height: 28, borderRadius: 8, border: 'none',
              background: 'rgba(0,0,0,0.05)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6B7280',
            }}
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Day-name header row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          padding: '0 0.875rem', marginBottom: 2,
        }}>
          {WEEK_DAYS.map((d) => (
            <div key={d} style={{
              textAlign: 'center',
              fontSize: '0.5625rem', fontWeight: 700,
              color: '#9CA3AF', letterSpacing: '0.05em',
              textTransform: 'uppercase', paddingBottom: 4,
            }}>
              {d}
            </div>
          ))}
        </div>

        {/* ── Calendar grid ── */}
        <div ref={gridRef} style={{ padding: '0 0.875rem 0.75rem' }}>
          {rows.map((week, wi) => (
            <div
              key={wi}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}
            >
              {week.map((day) => {
                const dayInis     = getDayInitiativas(day, iniciativas);
                const dayAcciones = getAccionesOnDay(day, todasLasAcciones);
                const inCurrent   = viewMode === 'week' || day.getMonth() === currentDate.getMonth();
                return (
                  <DayCell
                    key={day.toISOString()}
                    day={day}
                    iniciativas={dayInis}
                    acciones={dayAcciones}
                    isCurrentMonth={inCurrent}
                    onSelectDay={handleDayClick}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Legend ── */}
        {visibleIniciativas.length > 0 && (
          <div style={{
            display: 'flex', gap: 14, flexWrap: 'wrap',
            padding: '0.5rem 1.25rem',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            alignItems: 'center',
          }}>
            {([1, 2, 3] as Cuadrante[]).filter((q) => (counts[q] ?? 0) > 0).map((q) => (
              <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: CUADRANTES[q].color }} />
                <span style={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: 500 }}>
                  {CUADRANTES[q].label}&nbsp;·&nbsp;{counts[q]}
                </span>
              </div>
            ))}
            {visibleAcciones.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: 1, background: '#9CA3AF' }} />
                <span style={{ fontSize: '0.6875rem', color: '#6B7280', fontWeight: 500 }}>
                  {visibleAcciones.length} acción{visibleAcciones.length !== 1 ? 'es' : ''} programada{visibleAcciones.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Initiatives list ── */}
        {iniEnPeriodo.length > 0 ? (
          <div style={{ padding: '0 1.25rem 0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <p style={{
              fontSize: '0.5625rem', fontWeight: 800,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#9CA3AF', margin: '0.75rem 0 0.25rem',
            }}>
              Iniciativas en este periodo
            </p>
            {iniEnPeriodo.map((entry) => (
              <IniciativaRow key={entry.ini.id} entry={entry} onSelect={onSelectIniciativa} />
            ))}
            <div style={{ height: 4 }} />
          </div>
        ) : (
          <div style={{ padding: '1.25rem 1.25rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', margin: 0, textAlign: 'center' }}>
              Sin iniciativas programadas en este periodo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
