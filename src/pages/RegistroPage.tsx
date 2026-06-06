import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Eye, EyeOff, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { cn, extractApiError } from '@/lib/utils';
import { BgOrbs } from '@/components/common/BgOrbs';

const schema = z
  .object({
    nombre:                z.string().min(2, 'Mínimo 2 caracteres'),
    email:                 z.string().email('Correo inválido'),
    password:              z.string().min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Al menos una mayúscula')
      .regex(/[0-9]/, 'Al menos un número'),
    password_confirmation: z.string(),
    consentimiento:        z.boolean().refine((v) => v, { message: 'Acepta los términos' }),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  });

type FormData = z.infer<typeof schema>;

/* ─── Pill switcher ─── */
function AuthPill() {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'rgba(255,255,255,0.70)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 999,
        padding: '4px',
        marginBottom: '1.25rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      <Link
        to="/login"
        style={{
          padding: '0.375rem 1.1rem',
          borderRadius: 999,
          fontSize: '0.8125rem',
          fontWeight: 500,
          color: '#6B7280',
          textDecoration: 'none',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#0A0A0A'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#6B7280'; }}
      >
        Iniciar sesión
      </Link>
      <span
        style={{
          padding: '0.375rem 1.1rem',
          borderRadius: 999,
          fontSize: '0.8125rem',
          fontWeight: 600,
          background: '#0A0A0A',
          color: '#FFFFFF',
          userSelect: 'none',
        }}
      >
        Crear cuenta
      </span>
    </div>
  );
}

/* ─── Field helpers ─── */
const labelStyle: React.CSSProperties = {
  fontSize: '0.6875rem', fontWeight: 600,
  letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280',
};

function FieldWrap({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: '#DC2626' }}>{error}</p>}
    </div>
  );
}

function Input({ id, type = 'text', placeholder, error, suffix, ...rest }: {
  id: string; type?: string; placeholder?: string; error?: string;
  suffix?: React.ReactNode; [k: string]: unknown;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input id={id} type={type} placeholder={placeholder}
        className={cn('input-igo', error && 'error', suffix && 'pr-11')}
        {...(rest as React.InputHTMLAttributes<HTMLInputElement>)} />
      {suffix && (
        <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>{suffix}</div>
      )}
    </div>
  );
}

/* ─── RegistroPage ─── */
export default function RegistroPage() {
  const navigate      = useNavigate();
  const { registro, upgrade, isAuthenticated, user } = useAuth();
  const containerRef  = useRef<HTMLDivElement>(null);

  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  useGSAP(
    () => {
      gsap.fromTo('.reg-wrap',    { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' });
      gsap.fromTo('.field-item',  { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out', delay: 0.2 });
    },
    { scope: containerRef },
  );

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      /*
       * Si hay una sesión de exploración activa (invitado autenticado), hacemos
       * UPGRADE IN-PLACE en vez de crear una cuenta nueva: así la empresa del
       * invitado se conserva y no queda huérfana. Solo registramos de cero
       * cuando NO hay sesión previa o ya es una cuenta registrada.
       */
      const esUpgrade = isAuthenticated && user?.tipo !== 'registrado';

      if (esUpgrade) {
        await upgrade({
          nombre: data.nombre,
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
          consentimiento: data.consentimiento,
        });
        toast.success('¡Cuenta vinculada! Tus datos se conservaron.');
        // La empresa del invitado se conserva → ir directo a empresas
        localStorage.setItem('igo_onboarding_done', 'true');
        navigate('/empresas');
      } else {
        await registro({
          nombre: data.nombre,
          email: data.email,
          password: data.password,
          password_confirmation: data.password_confirmation,
          consentimiento: data.consentimiento,
        });
        toast.success('¡Cuenta creada! Cuéntanos sobre tu empresa');
        // Cuenta nueva → nunca tiene empresa todavía → siempre onboarding
        localStorage.removeItem('igo_onboarding_done');
        navigate('/onboarding');
      }
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Error al crear la cuenta'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} style={{ minHeight: '100dvh', background: '#FFFFFF', position: 'relative' }}>
      <BgOrbs variant="auth" />

      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1rem', position: 'relative', zIndex: 1,
      }}>
        <div className="reg-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 460 }}>

          {/* Pill switcher */}
          <AuthPill />

          {/* Card */}
          <div style={{
            width: '100%',
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '1.25rem', padding: '2.25rem 2rem',
            boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <TrendingUp size={18} color="white" strokeWidth={2.5} />
              </div>
              <h1 style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: '1.75rem', fontWeight: 400, fontStyle: 'italic',
                letterSpacing: '-0.01em', color: '#0A0A0A',
                lineHeight: 1.2, textAlign: 'center', margin: 0,
              }}>
                Crear cuenta
              </h1>
              <p style={{ marginTop: '0.375rem', fontSize: '0.875rem', color: '#6B7280', textAlign: 'center' }}>
                Empieza a gestionar tus iniciativas estratégicas
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div className="field-item">
                <FieldWrap label="Nombre completo" id="nombre" error={errors.nombre?.message}>
                  <Input id="nombre" placeholder="Juan Pérez" error={errors.nombre?.message} {...register('nombre')} />
                </FieldWrap>
              </div>

              <div className="field-item">
                <FieldWrap label="Correo electrónico" id="email" error={errors.email?.message}>
                  <Input id="email" type="email" placeholder="juan@empresa.com" error={errors.email?.message} {...register('email')} />
                </FieldWrap>
              </div>

              <div className="field-item">
                <FieldWrap label="Contraseña" id="password" error={errors.password?.message}>
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Mín. 8 car., 1 mayúscula, 1 número"
                    error={errors.password?.message}
                    suffix={
                      <button type="button" tabIndex={-1} onClick={() => setShowPass(v => !v)}
                        style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {showPass ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                      </button>
                    }
                    {...register('password')}
                  />
                </FieldWrap>
              </div>

              <div className="field-item">
                <FieldWrap label="Confirmar contraseña" id="password_confirmation" error={errors.password_confirmation?.message}>
                  <Input
                    id="password_confirmation"
                    type={showConf ? 'text' : 'password'}
                    placeholder="••••••••"
                    error={errors.password_confirmation?.message}
                    suffix={
                      <button type="button" tabIndex={-1} onClick={() => setShowConf(v => !v)}
                        style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        {showConf ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                      </button>
                    }
                    {...register('password_confirmation')}
                  />
                </FieldWrap>
              </div>

              <div className="field-item" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                <input
                  id="consentimiento" type="checkbox"
                  style={{ marginTop: 2, width: 15, height: 15, accentColor: '#0A0A0A', cursor: 'pointer', flexShrink: 0 }}
                  {...register('consentimiento')}
                />
                <label htmlFor="consentimiento" style={{ fontSize: '0.8125rem', color: '#6B7280', lineHeight: 1.5, cursor: 'pointer' }}>
                  Acepto los <span style={{ color: '#0A0A0A', fontWeight: 600 }}>términos y condiciones</span> y la política de privacidad.
                </label>
              </div>
              {errors.consentimiento && (
                <p style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: -6 }}>{errors.consentimiento.message}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-press field-item"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.875rem', borderRadius: '0.625rem',
                  fontSize: '0.9375rem', fontWeight: 600,
                  color: '#FFFFFF', background: isLoading ? '#9CA3AF' : '#0A0A0A',
                  border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s', width: '100%', marginTop: '0.375rem',
                }}
                onMouseEnter={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#374151'; }}
                onMouseLeave={(e) => { if (!isLoading) (e.currentTarget as HTMLElement).style.background = '#0A0A0A'; }}
              >
                {isLoading
                  ? <><Loader2 size={15} className="animate-spin" /> Creando cuenta...</>
                  : <>Crear cuenta <ArrowRight size={15} strokeWidth={2} /></>
                }
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6B7280', marginTop: '1.25rem' }}>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" style={{ color: '#0A0A0A', fontWeight: 600, textDecoration: 'none' }}>Iniciar sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
