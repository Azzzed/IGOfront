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
import { BgOrbs } from '@/components/common/BgOrbs';
import { cn } from '@/lib/utils';
import api from '@/lib/axios';
import type { EmpresasListResponse } from '@/types/empresa.types';

const schema = z.object({
  email:    z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
type FormData = z.infer<typeof schema>;

/* ─── Pill switcher Login ↔ Registro ─── */
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
        Iniciar sesión
      </span>
      <Link
        to="/registro"
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
        Crear cuenta
      </Link>
    </div>
  );
}

function InputField({
  label, id, type = 'text', placeholder, error, suffix, ...rest
}: {
  label: string; id: string; type?: string; placeholder?: string;
  error?: string; suffix?: React.ReactNode; [key: string]: unknown;
}) {
  return (
    <div className="field-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <label
        htmlFor={id}
        style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B7280' }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className={cn('input-igo', error && 'error', suffix && 'pr-11')}
          {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
        />
        {suffix && (
          <div style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}>
            {suffix}
          </div>
        )}
      </div>
      {error && <p style={{ fontSize: '0.75rem', color: '#DC2626' }}>{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, crearInvitado } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingInvitado, setIsLoadingInvitado] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useGSAP(
    () => {
      gsap.fromTo('.login-wrap',
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' },
      );
      gsap.fromTo('.field-item',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.38, stagger: 0.07, ease: 'power2.out', delay: 0.2 },
      );
      gsap.fromTo('.login-actions',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out', delay: 0.42 },
      );
    },
    { scope: containerRef },
  );

  /* ─── Navegación post-auth — siempre basada en el servidor ─── */
  const postAuthNav = async () => {
    try {
      const res = await api.get<EmpresasListResponse>('/empresas');
      const empresas = res.data?.data?.empresas ?? [];
      if (empresas.length === 0) {
        localStorage.removeItem('igo_onboarding_done');
        navigate('/onboarding');
      } else {
        localStorage.setItem('igo_onboarding_done', 'true');
        navigate('/empresas');
      }
    } catch {
      // Si falla la consulta (p.ej. sin conexión), ir a onboarding igual
      navigate('/onboarding');
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await login(data);
      toast.success('Bienvenido de vuelta');
      await postAuthNav();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Credenciales incorrectas';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvitado = async () => {
    setIsLoadingInvitado(true);
    try {
      await crearInvitado();
      toast.success('Sesión de exploración iniciada');
      await postAuthNav();
    } catch {
      toast.error('No se pudo iniciar la sesión');
    } finally {
      setIsLoadingInvitado(false);
    }
  };

  return (
    <div ref={containerRef} style={{ minHeight: '100dvh', background: '#FFFFFF', position: 'relative' }}>
      <BgOrbs variant="auth" />

      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div className="login-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 420 }}>

          {/* Pill switcher flotante */}
          <AuthPill />

          {/* Card */}
          <div
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: '1.25rem',
              padding: '2.25rem 2rem',
              boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
            }}
          >
            {/* Brand */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.75rem' }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: 10, background: '#0A0A0A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.875rem',
                }}
              >
                <TrendingUp size={20} color="white" strokeWidth={2.5} />
              </div>
              {/* Instrument Serif para el headline */}
              <h1
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: '2rem',
                  fontWeight: 400,
                  fontStyle: 'italic',
                  letterSpacing: '-0.01em',
                  color: '#0A0A0A',
                  lineHeight: 1.15,
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                Bienvenido a IGO app
              </h1>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6B7280', textAlign: 'center' }}>
                Tu herramienta de priorización estratégica
              </p>
            </div>

            <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', marginBottom: '1.5rem' }} />

            <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <InputField
                label="Correo electrónico" id="email" type="email" placeholder="tu@empresa.com"
                error={errors.email?.message} {...register('email')}
              />
              <InputField
                label="Contraseña" id="password"
                type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                error={errors.password?.message}
                suffix={
                  <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)}
                    style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                  </button>
                }
                {...register('password')}
              />

              <div className="login-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', paddingTop: '0.25rem' }}>
                <button
                  type="submit" disabled={isLoading}
                  className="btn-press"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.875rem', borderRadius: '0.625rem',
                    fontSize: '0.9375rem', fontWeight: 600,
                    color: '#FFFFFF', background: isLoading ? '#9CA3AF' : '#0A0A0A',
                    border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {isLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <>Iniciar sesión <ArrowRight size={15} strokeWidth={2} /></>}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
                  <span style={{ fontSize: '0.6875rem', color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>o</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,0.08)' }} />
                </div>

                <button
                  type="button" onClick={handleInvitado} disabled={isLoadingInvitado}
                  className="btn-press"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.875rem', borderRadius: '0.625rem',
                    fontSize: '0.9375rem', fontWeight: 500,
                    color: '#6B7280', background: 'transparent',
                    border: '1px solid rgba(0,0,0,0.12)',
                    cursor: isLoadingInvitado ? 'not-allowed' : 'pointer',
                    transition: 'border-color 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => { const b = e.currentTarget; b.style.borderColor = 'rgba(0,0,0,0.22)'; b.style.color = '#0A0A0A'; }}
                  onMouseLeave={(e) => { const b = e.currentTarget; b.style.borderColor = 'rgba(0,0,0,0.12)'; b.style.color = '#6B7280'; }}
                >
                  {isLoadingInvitado ? <Loader2 size={15} className="animate-spin" /> : 'Continuar sin cuenta'}
                </button>
              </div>
            </form>

            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6B7280', marginTop: '1.25rem' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/registro" style={{ color: '#0A0A0A', fontWeight: 600, textDecoration: 'none' }}>
                Crear cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
