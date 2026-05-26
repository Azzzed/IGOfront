import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { BgOrbs } from '@/components/common/BgOrbs';
import { SECTOR_OPTIONS, TAMANO_OPTIONS, GENERO_OPTIONS, EDAD_OPTIONS } from '@/lib/utils';
import type { EmpresaResponse } from '@/types/empresa.types';

/* ─── Definición de pasos ─── */
const STEPS = [
  {
    key:         'nombre',
    type:        'text'    as const,
    question:    '¿Cómo se llama\ntu empresa?',
    placeholder: 'Mi empresa...',
    hint:        'Puedes cambiarlo cuando quieras',
  },
  {
    key:      'sector',
    type:     'options' as const,
    question: '¿En qué sector\nopera?',
    options:  SECTOR_OPTIONS,
    cols:     2 as const,
  },
  {
    key:      'tamano',
    type:     'options' as const,
    question: '¿Qué tan grande\nes tu empresa?',
    options:  TAMANO_OPTIONS,
    cols:     1 as const,
  },
  {
    key:      'genero_empresario',
    type:     'options' as const,
    question: '¿Cuál es\ntu género?',
    options:  GENERO_OPTIONS,
    cols:     1 as const,
  },
  {
    key:      'rango_edad',
    type:     'options' as const,
    question: '¿Cuál es tu\nrango de edad?',
    options:  EDAD_OPTIONS,
    cols:     1 as const,
  },
  {
    key:      'ubicacion',
    type:     'location' as const,
    question: '¿Desde dónde\noperas?',
    hint:     'País y ciudad de tu empresa',
  },
] as const;

type StepKey  = (typeof STEPS)[number]['key'];
type Answers  = Partial<Record<StepKey | 'pais' | 'ciudad', string>>;

/* ─── Página ─── */
export default function OnboardingPage() {
  const navigate      = useNavigate();
  const contentRef    = useRef<HTMLDivElement>(null);
  const inputRef      = useRef<HTMLInputElement>(null);

  const [stepIdx,    setStepIdx]    = useState(0);
  const [answers,    setAnswers]    = useState<Answers>({});
  const [textVal,    setTextVal]    = useState('');
  const [pais,       setPais]       = useState('Colombia');
  const [ciudad,     setCiudad]     = useState('');
  const [selected,   setSelected]   = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const step     = STEPS[stepIdx];
  const total    = STEPS.length;
  const progress = (stepIdx / total) * 100;

  /* Focus automático al cambiar de paso */
  useEffect(() => {
    setTextVal('');
    setSelected(null);
    setTimeout(() => inputRef.current?.focus(), 350);
  }, [stepIdx]);

  /* Transición GSAP entre pasos */
  const transition = useCallback((nextFn: () => void) => {
    const el = contentRef.current;
    if (!el) { nextFn(); return; }
    gsap.timeline()
      .to(el,  { opacity: 0, y: -20, duration: 0.2,  ease: 'power2.in'  })
      .call(nextFn)
      .fromTo(el, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' });
  }, []);

  /* Envío final */
  const submit = useCallback(async (finalAnswers: Answers) => {
    setSubmitting(true);
    try {
      await api.post<EmpresaResponse>('/empresas', {
        nombre:            finalAnswers.nombre            || 'Mi Empresa',
        sector:            finalAnswers.sector            || 'otro',
        tamano:            finalAnswers.tamano            || 'micro',
        genero_empresario: finalAnswers.genero_empresario || 'otro',
        rango_edad:        finalAnswers.rango_edad        || '26-35',
        pais:              finalAnswers.pais              || 'Colombia',
        ciudad:            finalAnswers.ciudad            || 'Sin ciudad',
      });
      toast.success('¡Empresa creada!');
    } catch {
      /* empresa opcional — continuar de todos modos */
    } finally {
      localStorage.setItem('igo_onboarding_done', 'true');
      navigate('/empresas');
    }
  }, [navigate]);

  /* Avanzar al siguiente paso */
  const goNext = useCallback((key: string, value: string) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    if (stepIdx < total - 1) {
      transition(() => setStepIdx(s => s + 1));
    } else {
      submit(updated);
    }
  }, [stepIdx, total, answers, transition, submit]);

  const handleOptionClick = (value: string) => {
    setSelected(value);
    setTimeout(() => goNext(step.key, value), 200);
  };

  const handleTextSubmit = () => {
    if (!textVal.trim()) return;
    goNext(step.key, textVal.trim());
  };

  const handleLocationSubmit = () => {
    const updated = { ...answers, pais: pais || 'Colombia', ciudad: ciudad || 'Sin ciudad' };
    submit(updated);
  };

  /* ─── Render ─── */
  return (
    <div style={{ minHeight: '100dvh', background: '#FFFFFF', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <BgOrbs variant="auth" />

      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: 'rgba(0,0,0,0.06)', zIndex: 10 }}>
        <div style={{
          height: '100%', background: '#0A0A0A',
          width: `${progress}%`,
          transition: 'width 0.45s ease',
          borderRadius: '0 2px 2px 0',
        }} />
      </div>

      {/* Contador */}
      <div style={{ position: 'fixed', top: '0.875rem', right: '1.25rem', zIndex: 10 }}>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.06em' }}>
          {stepIdx + 1}&nbsp;/&nbsp;{total}
        </span>
      </div>

      {/* Contenido del paso */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4.5rem 1.25rem 5.5rem',
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 560,
          margin: '0 auto',
        }}
      >
        {/* Pregunta en Instrument Serif */}
        <h1
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: 'clamp(1.875rem, 6vw, 2.75rem)',
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#0A0A0A',
            textAlign: 'center',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            marginBottom: step.type === 'options' ? '1.75rem' : '1rem',
            whiteSpace: 'pre-line',
          }}
        >
          {step.question}
        </h1>

        {'hint' in step && step.hint && (
          <p style={{ fontSize: '0.875rem', color: '#9CA3AF', textAlign: 'center', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
            {step.hint}
          </p>
        )}

        {/* ── Paso texto ── */}
        {step.type === 'text' && (
          <div style={{ width: '100%', maxWidth: 400 }}>
            <div style={{ position: 'relative' }}>
              <input
                ref={inputRef}
                type="text"
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                placeholder={'placeholder' in step ? step.placeholder : ''}
                autoFocus
                style={{
                  width: '100%',
                  padding: '1rem 3.5rem 1rem 1.25rem',
                  fontSize: '1.0625rem',
                  border: '1.5px solid rgba(0,0,0,0.12)',
                  borderRadius: 14,
                  outline: 'none',
                  background: '#FFFFFF',
                  color: '#0A0A0A',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e)  => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.40)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.04)'; }}
                onBlur={(e)   => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <button
                onClick={handleTextSubmit}
                disabled={!textVal.trim()}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  width: 36, height: 36, borderRadius: 10,
                  background: textVal.trim() ? '#0A0A0A' : 'rgba(0,0,0,0.05)',
                  border: 'none',
                  cursor: textVal.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
              >
                <ArrowRight size={16} color={textVal.trim() ? '#FFFFFF' : '#9CA3AF'} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        {/* ── Paso opciones ── */}
        {step.type === 'options' && 'options' in step && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: step.cols === 2 ? 'repeat(2, 1fr)' : '1fr',
            gap: '0.5rem',
            width: '100%',
            maxWidth: step.cols === 2 ? 480 : 360,
          }}>
            {step.options.map((opt) => {
              const isSel = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleOptionClick(opt.value)}
                  style={{
                    padding: '0.9rem 1.125rem',
                    borderRadius: 12,
                    border: `1.5px solid ${isSel ? '#0A0A0A' : 'rgba(0,0,0,0.10)'}`,
                    background: isSel ? '#0A0A0A' : '#FFFFFF',
                    color: isSel ? '#FFFFFF' : '#0A0A0A',
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    boxShadow: isSel ? '0 2px 12px rgba(0,0,0,0.15)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSel) {
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)';
                      e.currentTarget.style.background  = 'rgba(0,0,0,0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSel) {
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)';
                      e.currentTarget.style.background  = '#FFFFFF';
                    }
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Paso ubicación ── */}
        {step.type === 'location' && (
          <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <input
              ref={inputRef}
              type="text"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              placeholder="País"
              autoFocus
              style={{
                width: '100%', padding: '1rem 1.25rem',
                fontSize: '1.0625rem',
                border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 14,
                outline: 'none', background: '#FFFFFF', color: '#0A0A0A',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.40)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.04)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <input
              type="text"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLocationSubmit()}
              placeholder="Ciudad"
              style={{
                width: '100%', padding: '1rem 1.25rem',
                fontSize: '1.0625rem',
                border: '1.5px solid rgba(0,0,0,0.12)', borderRadius: 14,
                outline: 'none', background: '#FFFFFF', color: '#0A0A0A',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.40)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.04)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button
              onClick={handleLocationSubmit}
              disabled={submitting}
              style={{
                padding: '1rem', borderRadius: 12,
                background: '#0A0A0A', color: '#FFFFFF',
                border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '0.9375rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                marginTop: '0.25rem',
              }}
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /> Creando empresa...</>
                : <>Finalizar <ArrowRight size={15} strokeWidth={2} /></>}
            </button>
          </div>
        )}
      </div>

      {/* Omitir todo */}
      <div style={{ position: 'fixed', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <button
          onClick={() => { localStorage.setItem('igo_onboarding_done', 'true'); navigate('/empresas'); }}
          style={{
            fontSize: '0.8125rem', color: '#9CA3AF', fontWeight: 500,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '0.5rem 1rem', transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#6B7280'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; }}
        >
          Omitir por ahora →
        </button>
      </div>
    </div>
  );
}
