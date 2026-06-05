import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  Plus, Zap, LayoutGrid, Loader2, X, ChevronRight, Trash2,
  Search, SlidersHorizontal, ChevronDown, Hand,
} from 'lucide-react';
import { OrganicLoader } from '@/components/common/OrganicLoader';
import { toast } from 'sonner';
import { useEmpresaStore } from '@/store/empresaStore';
import { useIniciativas } from '@/hooks/useIniciativas';
import { CUADRANTES, CATEGORIA_OPTIONS } from '@/lib/utils';
import { SliderIGO } from '@/components/iniciativa/SliderIGO';
import type { Iniciativa, ValorIGO, Categoria } from '@/types/iniciativa.types';

/* ─── helpers ─── */
function categoriaLabel(val: string) {
  return CATEGORIA_OPTIONS.find((o) => o.value === val)?.label ?? val;
}
function calcCuadrante(imp: ValorIGO, gob: ValorIGO): 1 | 2 | 3 | 4 {
  if (imp >= 3 && gob >= 3) return 1;
  if (imp >= 3 && gob < 3)  return 2;
  if (imp < 3  && gob >= 3) return 3;
  return 4;
}
const METRIC_COLORS: Record<number, string> = { 1:'#DC2626',2:'#EA580C',3:'#CA8A04',4:'#65A30D',5:'#16A34A' };
const METRIC_BG:     Record<number, string> = { 1:'#FEF2F2',2:'#FFF7ED',3:'#FEFCE8',4:'#F7FEE7',5:'#F0FDF4' };

/* ─── Coach steps data ─── */
const COACH_STEPS = [
  {
    stepLabel: 'IMPORTANCIA',
    title:     '¿Qué tan importante es para tu empresa?',
    desc:      'Valora el impacto estratégico en los resultados del negocio. Desde "no impacta" hasta "sin esto el negocio no avanza".',
    target:    'imp' as const,
  },
  {
    stepLabel: 'GOBERNABILIDAD',
    title:     '¿Cuánto control tienes para ejecutarla?',
    desc:      'Evalúa tu capacidad real de sacarla adelante HOY: recursos, equipo, limitantes. Sé honesto.',
    target:    'gob' as const,
  },
  {
    stepLabel: 'CUADRANTE IGO',
    title:     'El cuadrante se calcula solo',
    desc:      'Con importancia + gobernabilidad el sistema ubica la iniciativa en ¡Hacer ya!, Estratégico, Rutina o Descartar.',
    target:    'result' as const,
  },
];

/* ─── Coach Overlay ─── */
interface CoachOverlayProps {
  step:   number;
  onNext: () => void;
  onSkip: () => void;
}
function CoachOverlay({ step, onNext, onSkip }: CoachOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const iconRef    = useRef<HTMLButtonElement>(null);
  const data       = COACH_STEPS[step - 1];

  useEffect(() => {
    if (!overlayRef.current) return;
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    if (iconRef.current) {
      gsap.killTweensOf(iconRef.current);
      gsap.fromTo(iconRef.current,
        { y: -6 },
        { y: 6, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' },
      );
    }
  }, [step]);

  /* Step 3 (cuadrante) uses an inline card — no overlay */
  if (step === 3) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute', inset: 0, zIndex: 15,
        background: 'rgba(6,6,6,0.87)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 'inherit',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* ── Progress bar ── */}
      <div style={{ width: '100%', display: 'flex', gap: 4, padding: '1.5rem 1.5rem 0' }}>
        {COACH_STEPS.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 2, borderRadius: 999,
            background: i < step ? 'rgba(255,255,255,0.70)' : 'rgba(255,255,255,0.10)',
            transition: 'background 0.35s',
          }} />
        ))}
      </div>

      {/* ── Tutorial content ── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', textAlign: 'center',
        padding: '1.25rem 1.75rem 0.875rem',
        maxWidth: 360, width: '100%',
      }}>
        <span style={{
          fontSize: '0.5625rem', fontWeight: 800, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)',
          display: 'block', marginBottom: '0.5rem',
        }}>
          {data.stepLabel}
        </span>
        <h3 style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: '1.3rem', fontWeight: 400, fontStyle: 'italic',
          color: '#FFFFFF', lineHeight: 1.25, letterSpacing: '-0.01em',
          margin: 0, marginBottom: '0.5rem',
        }}>
          {data.title}
        </h3>
        <p style={{
          color: 'rgba(255,255,255,0.42)',
          fontSize: '0.8125rem', lineHeight: 1.55, margin: 0,
        }}>
          {data.desc}
        </p>
      </div>

      {/* ── Controls — siempre visibles encima del slider ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', paddingBottom: '0.5rem',
      }}>
        {/* "Omitir" — discreet link */}
        <button
          onClick={onSkip}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', fontWeight: 500,
            padding: '0.25rem 0.875rem', marginBottom: '0.625rem',
            letterSpacing: '0.02em',
          }}
        >
          Omitir tutorial
        </button>

        {/* Big tappable zone: hand + wavy line → slider below */}
        <button
          ref={iconRef}
          onClick={onNext}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, WebkitTapHighlightColor: 'transparent',
          }}
          aria-label={step >= 2 ? 'Entendido' : 'Siguiente paso'}
        >
          {/* Hand icon circle */}
          <div
            style={{
              width: 58, height: 58, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.42)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.22)';
            }}
          >
            <Hand size={25} strokeWidth={1.5} color="rgba(255,255,255,0.80)" />
          </div>

          {/* Label */}
          <span style={{
            marginTop: '0.5rem',
            fontSize: '0.8125rem', fontWeight: 700,
            color: '#FFFFFF', letterSpacing: '0.01em',
          }}>
            {step >= 2 ? 'Entendido ✓' : 'Siguiente →'}
          </span>

          {/* Wavy dashed line — pointing down toward the highlighted slider */}
          <svg width="16" height="48" viewBox="0 0 16 48" fill="none" style={{ marginTop: '0.375rem' }}>
            <path
              d="M8 0 C12 7, 4 14, 8 22 C12 30, 4 36, 8 44 C10 46, 8 48, 8 48"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              fill="none"
            />
          </svg>
          {/* Arrowhead */}
          <svg width="12" height="7" viewBox="0 0 12 7" fill="none" style={{ marginTop: -1 }}>
            <path d="M6 7L0 0H12L6 7Z" fill="rgba(255,255,255,0.18)" />
          </svg>
        </button>
      </div>

      {/* Flex spacer — slider punches through in this empty area below */}
      <div style={{ flex: 1 }} />
    </div>
  );
}

/* ─── MetricPill ─── */
function MetricPill({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ flex: 1, borderRadius: 8, padding: '0.5rem 0.625rem', background: METRIC_BG[value], border: `1px solid ${METRIC_COLORS[value]}22` }}>
      <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 3 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {([1,2,3,4,5] as const).map((n) => (
          <div key={n} style={{ flex: 1, height: 4, borderRadius: 999, background: n <= value ? METRIC_COLORS[value] : 'rgba(0,0,0,0.08)' }} />
        ))}
      </div>
    </div>
  );
}

/* ─── IniciativaCard ─── */
function IniciativaCard({ ini, onEdit, onDelete }: { ini: Iniciativa; onEdit: () => void; onDelete: () => void }) {
  const q = CUADRANTES[ini.cuadrante];
  return (
    <div
      className="card-item group"
      style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '1rem', padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor='rgba(0,0,0,0.14)'; (e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(0,0,0,0.06)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor='rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.boxShadow='none'; }}
      onClick={onEdit}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0A0A0A', letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 6 }}>{ini.titulo}</p>
          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: q.bg, color: q.color, border: `1px solid ${q.border}` }}>
            {q.label}
          </span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: '#D1D5DB', opacity: 0, transition: 'opacity 0.15s, color 0.15s', flexShrink: 0 }}
          className="group-hover:opacity-100"
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color='#DC2626'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color='#D1D5DB'; }}>
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <MetricPill label="Importancia" value={ini.importancia} />
        <MetricPill label="Gobernabilidad" value={ini.gobernabilidad} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>{categoriaLabel(ini.categoria)}</span>
        <ChevronRight size={14} strokeWidth={1.5} style={{ color: '#D1D5DB' }} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}

/* ─── Drawer ─── */
interface DrawerProps {
  open:       boolean;
  ini?:       Iniciativa | null;
  isFirst:    boolean;
  empresaId:  number | null;
  onClose:    () => void;
  onSave:     (data: { titulo: string; categoria: Categoria; importancia: ValorIGO; gobernabilidad: ValorIGO }) => Promise<void>;
  onDelete?:  () => Promise<void>;
}

function Drawer({ open, ini, isFirst, empresaId, onClose, onSave, onDelete }: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  const [titulo,          setTitulo]          = useState('');
  const [categoria,       setCategoria]       = useState<Categoria>('gestion_operativa');
  const [importancia,     setImportancia]     = useState<ValorIGO>(3);
  const [gobernabilidad,  setGobernabilidad]  = useState<ValorIGO>(3);
  const [saving,          setSaving]          = useState(false);
  const [slidersTouched,  setSlidersTouched]  = useState(false);
  const [coachStep,       setCoachStep]       = useState(0); // 0 = off

  /* Coach key — scoped per empresa so each new company gets the tutorial */
  const coachKey = `igo_coach_done_${empresaId ?? 'x'}`;

  /* Sync fields when editing */
  useEffect(() => {
    if (!open) return;
    if (ini) {
      setTitulo(ini.titulo);
      setCategoria(ini.categoria);
      setImportancia(ini.importancia);
      setGobernabilidad(ini.gobernabilidad);
      setSlidersTouched(false);
      setCoachStep(0);
    } else {
      setTitulo('');
      setCategoria('gestion_operativa');
      setImportancia(3);
      setGobernabilidad(3);
      setSlidersTouched(false);
      if (isFirst && !localStorage.getItem(coachKey)) {
        setTimeout(() => setCoachStep(1), 420); // wait for panel slide-in
      } else {
        setCoachStep(0);
      }
    }
  }, [open, ini, isFirst, coachKey]);

  /* Body scroll-lock + hide BottomNav while drawer is open */
  useEffect(() => {
    if (open) {
      document.body.classList.add('igo-drawer-open');
    } else {
      document.body.classList.remove('igo-drawer-open');
    }
    return () => {
      document.body.classList.remove('igo-drawer-open');
    };
  }, [open]);

  /* GSAP open/close */
  useEffect(() => {
    const overlay = overlayRef.current;
    const panel   = panelRef.current;
    if (!overlay || !panel) return;
    if (open) {
      gsap.set(overlay, { display: 'flex' });
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: 'power2.out' });
      gsap.fromTo(panel,   { y: '100%' },  { y: '0%',  duration: 0.38, ease: 'power3.out' });
    } else {
      gsap.to(panel,   { y: '100%',  duration: 0.28, ease: 'power2.in' });
      gsap.to(overlay, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => gsap.set(overlay, { display: 'none' }) });
    }
  }, [open]);

  /* Cuadrante preview — consistent with card */
  const previewCuadrante = (ini && !slidersTouched) ? ini.cuadrante : calcCuadrante(importancia, gobernabilidad);
  const previewQ = CUADRANTES[previewCuadrante];

  const handleImpChange = (v: ValorIGO) => { setImportancia(v);    setSlidersTouched(true); };
  const handleGobChange = (v: ValorIGO) => { setGobernabilidad(v); setSlidersTouched(true); };

  const handleCoachNext = () => {
    if (coachStep >= COACH_STEPS.length) {
      localStorage.setItem(coachKey, 'true');
      setCoachStep(0);
    } else {
      setCoachStep((s) => s + 1);
    }
  };
  const handleCoachSkip = () => {
    localStorage.setItem(coachKey, 'true');
    setCoachStep(0);
  };

  const handleSave = async () => {
    if (!titulo.trim()) { toast.error('El título es requerido'); return; }
    setSaving(true);
    try {
      await onSave({ titulo: titulo.trim(), categoria, importancia, gobernabilidad });
      onClose();
    } catch {
      toast.error('No se pudo guardar la iniciativa');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('¿Eliminar esta iniciativa?')) return;
    try { await onDelete(); onClose(); } catch { toast.error('No se pudo eliminar'); }
  };

  const isCoachActive = coachStep > 0;
  const showCoach     = isCoachActive && coachStep <= 2;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (!saving && e.target === overlayRef.current) onClose(); }}
      style={{
        display: 'none', position: 'fixed', inset: 0, zIndex: 200,
        alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)',
      }}
    >
      <div
        ref={panelRef}
        style={{
          width: '100%', maxWidth: 640,
          background: '#FFFFFF',
          borderRadius: '1.25rem 1.25rem 0 0',
          maxHeight: '92dvh',
          overflowY: isCoachActive && coachStep <= 2 ? 'hidden' : 'auto',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          position: 'relative',
        }}
      >
        {/* Coach overlay — sits ON TOP of panel content */}
        {showCoach && (
          <CoachOverlay
            step={coachStep}
            onNext={handleCoachNext}
            onSkip={handleCoachSkip}
          />
        )}

        {/* Panel content */}
        <div style={{ padding: '1.5rem 1.5rem 3.5rem' }}>
          {/* Drag handle */}
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'rgba(0,0,0,0.12)', margin: '0 auto 1.5rem' }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.375rem', fontWeight: 400, fontStyle: 'italic', color: '#0A0A0A', margin: 0, letterSpacing: '-0.01em' }}>
                {ini ? 'Editar iniciativa' : 'Nueva iniciativa'}
              </h2>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: 999, background: previewQ.bg, color: previewQ.color, border: `1px solid ${previewQ.border}`, transition: 'all 0.25s' }}>
                {previewQ.label}
              </span>
            </div>
            <button onClick={() => { if (!saving) onClose(); }}
              style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', opacity: saving ? 0.4 : 1 }}>
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* ─── Form fields — disabled overlay when saving ─── */}
          <div style={{ position: 'relative' }}>
            {/* Saving lock overlay */}
            {saving && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 5,
                background: 'rgba(255,255,255,0.65)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(1px)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', padding: '10px 18px', borderRadius: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.10)', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <Loader2 size={14} className="animate-spin" style={{ color: '#0A0A0A' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#0A0A0A' }}>Guardando...</span>
                </div>
              </div>
            )}

            {/* Título */}
            <div style={{ marginBottom: '1.125rem' }}>
              <label style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', display: 'block', marginBottom: 6 }}>
                Título
              </label>
              <input
                type="text" value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej: Implementar sistema de gestión..."
                disabled={saving}
                autoFocus
                style={{
                  width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem',
                  border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 12, outline: 'none',
                  background: saving ? '#F9FAFB' : '#FFFFFF', color: '#0A0A0A',
                  transition: 'border-color 0.15s', boxSizing: 'border-box',
                  cursor: saving ? 'not-allowed' : 'text',
                }}
                onFocus={(e) => { if (!saving) e.currentTarget.style.borderColor = 'rgba(0,0,0,0.35)'; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; }}
              />
            </div>

            {/* Categoría */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280', display: 'block', marginBottom: 6 }}>
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as Categoria)}
                disabled={saving}
                style={{
                  width: '100%', padding: '0.875rem 1rem', fontSize: '0.9375rem',
                  border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 12, outline: 'none',
                  background: saving ? '#F9FAFB' : '#FFFFFF', color: '#0A0A0A',
                  cursor: saving ? 'not-allowed' : 'pointer', appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem',
                }}
              >
                {CATEGORIA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Sliders — highlighted individually based on coach step */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>

              {/* Importancia */}
              <div style={{
                borderRadius: 14, padding: '1rem',
                background: '#FFFFFF',
                border: coachStep === 1
                  ? '1.5px solid rgba(255,255,255,0.6)'
                  : '1px solid rgba(0,0,0,0.08)',
                position: 'relative',
                zIndex: coachStep === 1 ? 20 : 'auto',
                boxShadow: coachStep === 1
                  ? '0 0 0 6px rgba(255,255,255,1), 0 0 0 8px rgba(255,255,255,0.18), 0 16px 48px rgba(0,0,0,0.28)'
                  : 'none',
                transition: 'box-shadow 0.35s, border-color 0.35s',
              }}>
                <SliderIGO tipo="imp" value={importancia} onChange={handleImpChange} label="Importancia estratégica" />
              </div>

              {/* Separator — hidden during coach */}
              {!isCoachActive && <div style={{ height: 1, background: 'rgba(0,0,0,0.06)' }} />}

              {/* Gobernabilidad */}
              <div style={{
                borderRadius: 14, padding: '1rem',
                background: '#FFFFFF',
                border: coachStep === 2
                  ? '1.5px solid rgba(255,255,255,0.6)'
                  : '1px solid rgba(0,0,0,0.08)',
                position: 'relative',
                zIndex: coachStep === 2 ? 20 : 'auto',
                boxShadow: coachStep === 2
                  ? '0 0 0 6px rgba(255,255,255,1), 0 0 0 8px rgba(255,255,255,0.18), 0 16px 48px rgba(0,0,0,0.28)'
                  : 'none',
                transition: 'box-shadow 0.35s, border-color 0.35s',
              }}>
                <SliderIGO tipo="gob" value={gobernabilidad} onChange={handleGobChange} label="Gobernabilidad" />
              </div>
            </div>

            {/* Coach step 3 — cuadrante explanation (inline card, no overlay) */}
            {coachStep === 3 && (
              <div style={{
                background: '#0A0A0A', borderRadius: 14, padding: '1.125rem',
                marginBottom: '1.25rem',
              }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: '0.75rem' }}>
                  {COACH_STEPS.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 2.5, borderRadius: 999, background: i < 3 ? '#FFFFFF' : 'rgba(255,255,255,0.15)' }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', display: 'block', marginBottom: '0.375rem' }}>
                  {COACH_STEPS[2].stepLabel}
                </span>
                <p style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.375rem' }}>
                  {COACH_STEPS[2].title}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8125rem', lineHeight: 1.55, marginBottom: '1rem' }}>
                  {COACH_STEPS[2].desc}
                </p>
                {/* Live cuadrante preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.625rem 0.875rem', background: previewQ.bg, borderRadius: 10, marginBottom: '1rem', border: `1px solid ${previewQ.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: previewQ.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: previewQ.color }}>{previewQ.label}</span>
                  <span style={{ fontSize: '0.8125rem', color: '#9CA3AF', marginLeft: 'auto' }}>I:{importancia} G:{gobernabilidad}</span>
                </div>
                <button
                  onClick={handleCoachNext}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: 'none', background: '#FFFFFF', color: '#0A0A0A', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700 }}
                >
                  Entendido ✓
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            {ini && onDelete && (
              <button onClick={handleDelete} disabled={saving}
                style={{ padding: '0.875rem 1rem', borderRadius: 12, border: '1px solid rgba(220,38,38,0.18)', background: '#FEF2F2', color: '#DC2626', cursor: saving ? 'not-allowed' : 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: saving ? 0.5 : 1 }}>
                <Trash2 size={16} strokeWidth={1.5} />
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !titulo.trim()}
              style={{
                flex: 1, padding: '0.875rem', borderRadius: 12,
                background: saving || !titulo.trim() ? '#9CA3AF' : '#0A0A0A',
                color: '#FFFFFF', border: 'none',
                cursor: saving || !titulo.trim() ? 'not-allowed' : 'pointer',
                fontSize: '0.9375rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => { if (!saving && titulo.trim()) (e.currentTarget as HTMLElement).style.background = '#374151'; }}
              onMouseLeave={(e) => { if (!saving && titulo.trim()) (e.currentTarget as HTMLElement).style.background = '#0A0A0A'; }}
            >
              {saving
                ? <><Loader2 size={15} className="animate-spin" /> Guardando...</>
                : ini ? 'Guardar cambios' : 'Crear iniciativa'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Filter pill ─── */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '5px 12px', borderRadius: 999, flexShrink: 0, fontSize: '0.8125rem', fontWeight: active ? 600 : 500, background: active ? '#0A0A0A' : 'rgba(0,0,0,0.04)', color: active ? '#FFFFFF' : '#6B7280', border: active ? 'none' : '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'all 0.15s' }}>
      {label}
    </button>
  );
}

/* ─── IniciativasPage ─── */
export default function IniciativasPage() {
  const navigate       = useNavigate();
  const { empresaActiva } = useEmpresaStore();
  const pageRef        = useRef<HTMLDivElement>(null);

  const { iniciativas, loading, error, crearIniciativa, actualizarIniciativa, eliminarIniciativa } = useIniciativas(empresaActiva?.id ?? null);

  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [editIniciativa, setEditIniciativa] = useState<Iniciativa | null>(null);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [filterQ,        setFilterQ]        = useState<number>(0);
  const [filterCat,      setFilterCat]      = useState<string>('');
  const [filterImp,      setFilterImp]      = useState<number>(0);
  const [filterGob,      setFilterGob]      = useState<number>(0);
  const [showFilters,    setShowFilters]    = useState(false);

  useEffect(() => { if (!empresaActiva) navigate('/empresas'); }, [empresaActiva, navigate]);

  useGSAP(
    () => {
      gsap.fromTo('.page-header', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
      gsap.fromTo('.card-item',   { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.38, stagger: 0.07, ease: 'power2.out', delay: 0.15 });
    },
    { scope: pageRef, dependencies: [iniciativas.length] },
  );

  const openNew  = () => { setEditIniciativa(null);  setDrawerOpen(true); };
  const openEdit = (ini: Iniciativa) => { setEditIniciativa(ini); setDrawerOpen(true); };

  const handleSave = async (data: { titulo: string; categoria: Categoria; importancia: ValorIGO; gobernabilidad: ValorIGO }) => {
    if (editIniciativa) { await actualizarIniciativa(editIniciativa.id, data); toast.success('Iniciativa actualizada'); }
    else                { await crearIniciativa(data);                        toast.success('Iniciativa creada');      }
  };
  const handleDelete = async () => {
    if (!editIniciativa) return;
    await eliminarIniciativa(editIniciativa.id);
    toast.success('Iniciativa eliminada');
  };

  const filtered = iniciativas.filter((ini) => {
    if (searchQuery && !ini.titulo.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterQ   && ini.cuadrante      !== filterQ)  return false;
    if (filterCat && ini.categoria      !== filterCat) return false;
    if (filterImp && ini.importancia    !== filterImp) return false;
    if (filterGob && ini.gobernabilidad !== filterGob) return false;
    return true;
  });

  const activeFiltersCount = [filterQ, filterCat, filterImp, filterGob].filter(Boolean).length;
  const clearFilters = () => { setFilterQ(0); setFilterCat(''); setFilterImp(0); setFilterGob(0); setSearchQuery(''); };

  const byQ: Record<1|2|3|4, Iniciativa[]> = { 1:[], 2:[], 3:[], 4:[] };
  filtered.forEach((i) => { byQ[i.cuadrante].push(i); });
  const activeGroups = ([1,2,3,4] as const).filter((k) => byQ[k].length > 0);
  const useGrouped   = activeGroups.length > 1 && !filterQ;

  return (
    <div ref={pageRef} style={{ padding: '2rem 1.5rem', maxWidth: 900, margin: '0 auto' }}>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <button onClick={() => navigate('/empresas')} style={{ fontSize: '0.8125rem', color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 500 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color='#6B7280'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color='#9CA3AF'; }}>
              Mis empresas
            </button>
            <span style={{ color: '#D1D5DB', fontSize: '0.75rem' }}>›</span>
            <span style={{ fontSize: '0.8125rem', color: '#0A0A0A', fontWeight: 600 }}>{empresaActiva?.nombre}</span>
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 400, fontStyle: 'italic', color: '#0A0A0A', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0 }}>
            Iniciativas
          </h1>
          <p style={{ marginTop: '0.375rem', fontSize: '0.9375rem', color: '#6B7280' }}>
            {iniciativas.length > 0 ? `${iniciativas.length} iniciativa${iniciativas.length!==1?'s':''} registrada${iniciativas.length!==1?'s':''}` : 'Registra las iniciativas de tu empresa'}
          </p>
        </div>
        <button onClick={openNew}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.125rem', borderRadius: 10, background: '#0A0A0A', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'background 0.15s', flexShrink: 0 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background='#374151'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background='#0A0A0A'; }}>
          <Plus size={15} strokeWidth={2} /> Nueva iniciativa
        </button>
      </div>

      {/* Filters */}
      {iniciativas.length > 0 && (
        <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={14} strokeWidth={1.75} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar iniciativa..."
                style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.25rem', fontSize: '0.875rem', border: '1px solid rgba(0,0,0,0.10)', borderRadius: 10, outline: 'none', background: '#FFFFFF', color: '#0A0A0A', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
                onFocus={(e) => { e.currentTarget.style.borderColor='rgba(0,0,0,0.28)'; }}
                onBlur={(e)  => { e.currentTarget.style.borderColor='rgba(0,0,0,0.10)'; }} />
            </div>
            <button onClick={() => setShowFilters((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0.625rem 0.875rem', borderRadius: 10, border: '1px solid rgba(0,0,0,0.10)', background: activeFiltersCount > 0 ? '#0A0A0A' : '#FFFFFF', color: activeFiltersCount > 0 ? '#FFFFFF' : '#6B7280', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.15s', flexShrink: 0 }}>
              <SlidersHorizontal size={14} strokeWidth={1.75} />
              Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              <ChevronDown size={12} strokeWidth={2} style={{ transition: 'transform 0.2s', transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            {activeFiltersCount > 0 && (
              <button onClick={clearFilters}
                style={{ padding: '0.625rem 0.875rem', borderRadius: 10, border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', color: '#9CA3AF', cursor: 'pointer', fontSize: '0.8125rem', flexShrink: 0, transition: 'color 0.15s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color='#0A0A0A'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color='#9CA3AF'; }}>
                Limpiar
              </button>
            )}
          </div>

          {showFilters && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.875rem', background: 'rgba(0,0,0,0.02)', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
              <div>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.375rem' }}>Estado IGO</p>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {([1,2,3,4] as const).map((q) => <FilterPill key={q} label={CUADRANTES[q].label} active={filterQ===q} onClick={() => setFilterQ(filterQ===q?0:q)} />)}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.375rem' }}>Importancia</p>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {[1,2,3,4,5].map((n) => <FilterPill key={n} label={`${n}/5`} active={filterImp===n} onClick={() => setFilterImp(filterImp===n?0:n)} />)}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.375rem' }}>Gobernabilidad</p>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {[1,2,3,4,5].map((n) => <FilterPill key={n} label={`${n}/5`} active={filterGob===n} onClick={() => setFilterGob(filterGob===n?0:n)} />)}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9CA3AF', marginBottom: '0.375rem' }}>Categoría</p>
                <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                  {CATEGORIA_OPTIONS.map((o) => <FilterPill key={o.value} label={o.label} active={filterCat===o.value} onClick={() => setFilterCat(filterCat===o.value?'':o.value)} />)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem 1rem' }}>
          <OrganicLoader variant="dark" size="sm" label="Cargando iniciativas…" />
        </div>
      )}

      {/* Error */}
      {error && !loading && <div style={{ textAlign: 'center', padding: '4rem 1rem' }}><p style={{ color: '#DC2626', fontSize: '0.9375rem' }}>{error}</p></div>}

      {/* Empty */}
      {!loading && !error && iniciativas.length === 0 && (
        <div className="card-item" style={{ textAlign: 'center', padding: '5rem 1rem', border: '1.5px dashed rgba(0,0,0,0.10)', borderRadius: '1.25rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Zap size={28} strokeWidth={1.5} style={{ color: '#9CA3AF' }} />
          </div>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: '1.5rem', fontWeight: 400, fontStyle: 'italic', color: '#0A0A0A', marginBottom: '0.5rem' }}>Sin iniciativas todavía</h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.9375rem', maxWidth: 320, margin: '0 auto 1.75rem' }}>Registra las iniciativas estratégicas de tu empresa para analizarlas en la Matriz IGO</p>
          <button onClick={openNew} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: 10, background: '#0A0A0A', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: '0.9375rem', fontWeight: 600 }}>
            <Plus size={16} strokeWidth={2} /> Agregar primera iniciativa
          </button>
        </div>
      )}

      {/* No filter results */}
      {!loading && !error && iniciativas.length > 0 && filtered.length === 0 && (
        <div className="card-item" style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '1rem' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.9375rem', marginBottom: '0.75rem' }}>No hay iniciativas con esos filtros</p>
          <button onClick={clearFilters} style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0A0A0A', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Limpiar filtros</button>
        </div>
      )}

      {/* List */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {useGrouped
            ? activeGroups.map((qKey) => {
                const group = byQ[qKey]; const q = CUADRANTES[qKey];
                return (
                  <section key={qKey}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: q.color }} />
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: q.color }}>{q.label}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>{group.length}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                      {group.map((ini) => <IniciativaCard key={ini.id} ini={ini} onEdit={() => openEdit(ini)} onDelete={async () => { await eliminarIniciativa(ini.id); toast.success('Eliminada'); }} />)}
                    </div>
                  </section>
                );
              })
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {filtered.map((ini) => <IniciativaCard key={ini.id} ini={ini} onEdit={() => openEdit(ini)} onDelete={async () => { await eliminarIniciativa(ini.id); toast.success('Eliminada'); }} />)}
              </div>
            )
          }
          {iniciativas.length >= 2 && (
            <div className="card-item" style={{ padding: '1.25rem 1.5rem', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0A0A0A', marginBottom: 2 }}>Ver en la Matriz IGO</p>
                <p style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>Analiza el posicionamiento de tus {iniciativas.length} iniciativas</p>
              </div>
              <button onClick={() => navigate('/matriz')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.625rem 1.125rem', borderRadius: 10, background: '#0A0A0A', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'background 0.15s', flexShrink: 0 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background='#374151'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background='#0A0A0A'; }}>
                <LayoutGrid size={14} strokeWidth={2} /> Ver matriz
              </button>
            </div>
          )}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        ini={editIniciativa}
        isFirst={iniciativas.length === 0}
        empresaId={empresaActiva?.id ?? null}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        onDelete={editIniciativa ? handleDelete : undefined}
      />
    </div>
  );
}
