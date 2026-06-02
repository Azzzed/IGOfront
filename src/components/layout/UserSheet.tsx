import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { gsap } from 'gsap';
import { toast } from 'sonner';
import { X, Eye, EyeOff, Loader2, Building2, LogOut, UserCheck, Bell, BellOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/* ─── Validation schema ─── */
const schema = z
  .object({
    nombre:               z.string().min(2, 'Ingresa tu nombre completo'),
    email:                z.string().email('Correo inválido'),
    password:             z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string(),
    consentimiento:       z.boolean(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmation'],
  })
  .refine((d) => d.consentimiento, {
    message: 'Debes aceptar los términos',
    path: ['consentimiento'],
  });

type FormData = z.infer<typeof schema>;

/* ─── Shared input style ─── */
const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  height: 44,
  borderRadius: 12,
  border: '1.5px solid rgba(0,0,0,0.12)',
  padding: '0 14px',
  fontSize: '0.9375rem',
  color: '#0A0A0A',
  background: '#FAFAFA',
  outline: 'none',
  boxSizing: 'border-box',
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.07em',
  textTransform: 'uppercase',
  color: '#9CA3AF',
  marginBottom: 6,
  display: 'block',
};

/* ─── Push notifications control ─── */

function PushSection() {
  const { estado, activar, desactivar, probar } = usePushNotifications();

  const isLoading     = estado === 'cargando';
  const isOn          = estado === 'activado';
  const noSoportado   = estado === 'no-soportado';
  const sinPermiso    = estado === 'sin-permiso';
  const showToggle    = !noSoportado && !sinPermiso;

  return (
    <div style={{
      borderTop: '1px solid rgba(0,0,0,0.06)',
      paddingTop: '1rem',
      marginTop: '0.625rem',
    }}>
      {/* Section label */}
      <p style={{
        fontSize: '0.5625rem', fontWeight: 800,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: '#9CA3AF', margin: '0 0 0.75rem',
      }}>
        Notificaciones
      </p>

      {/* No soportado */}
      {noSoportado && (
        <p style={{ fontSize: '0.8125rem', color: '#9CA3AF', margin: 0 }}>
          Tu navegador no soporta notificaciones push.
        </p>
      )}

      {/* Permiso denegado */}
      {sinPermiso && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: '#FFFBEB', border: '1px solid #FDE68A',
          borderRadius: 10, padding: '0.75rem',
        }}>
          <AlertTriangle size={14} color="#D97706" strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: '0.8125rem', color: '#92400E', margin: 0, lineHeight: 1.5 }}>
            Las notificaciones están <strong>bloqueadas</strong>. Para habilitarlas,
            ve a <strong>Configuración del sitio</strong> en tu navegador
            y cambia el permiso a "Permitir".
          </p>
        </div>
      )}

      {/* Toggle + test button */}
      {showToggle && (
        <>
          {/* Toggle row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 12,
            padding: '0.5rem 0',
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '0.875rem', fontWeight: 600,
                color: '#0A0A0A', margin: 0, lineHeight: 1.3,
              }}>
                Recordatorios del plan
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '2px 0 0' }}>
                {isOn
                  ? 'Recibirás avisos cada mañana'
                  : 'Te avisamos lo que toca hacer hoy'}
              </p>
            </div>

            {/* Pill toggle */}
            <button
              aria-label={isOn ? 'Desactivar notificaciones' : 'Activar notificaciones'}
              onClick={() => void (isOn ? desactivar() : activar())}
              disabled={isLoading}
              style={{
                width: 46, height: 26, borderRadius: 999,
                border: 'none', flexShrink: 0,
                background: isLoading
                  ? '#D1D5DB'
                  : isOn
                    ? '#0A0A0A'
                    : 'rgba(0,0,0,0.12)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                position: 'relative',
                transition: 'background 0.2s ease',
              }}
            >
              {/* Knob */}
              <div style={{
                position: 'absolute',
                top: 3,
                left: isOn ? 23 : 3,
                width: 20, height: 20,
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                transition: 'left 0.2s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isLoading && (
                  <Loader2 size={10} color="#9CA3AF" strokeWidth={2.5} className="animate-spin" />
                )}
              </div>
            </button>
          </div>

          {/* Test button — only when active */}
          {isOn && (
            <button
              onClick={() => void probar()}
              style={{
                width: '100%', height: 38, borderRadius: 10,
                background: 'rgba(0,0,0,0.04)',
                color: '#374151',
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: '0.8125rem', fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                marginTop: '0.25rem',
                transition: 'background 0.15s',
              }}
            >
              <Bell size={13} strokeWidth={2} />
              Enviar notificación de prueba
            </button>
          )}

          {/* Status icon — subtle */}
          {!isOn && !isLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <BellOff size={11} color="#D1D5DB" strokeWidth={2} />
              <span style={{ fontSize: '0.6875rem', color: '#D1D5DB' }}>Sin notificaciones activas</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Registro form (inside the sheet) ─── */
function RegistroForm({ onBack }: { onBack: () => void }) {
  const { migrarInvitado, registro }    = useAuth();
  const user                            = useAuthStore((s) => s.user);
  const [showPwd, setShowPwd]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      if (user?.tipo === 'invitado' && user.token_invitado) {
        await migrarInvitado({
          token_invitado:        user.token_invitado,
          nombre:                data.nombre,
          email:                 data.email,
          password:              data.password,
          password_confirmation: data.password_confirmation,
          consentimiento:        data.consentimiento,
        });
      } else {
        await registro({
          nombre:                data.nombre,
          email:                 data.email,
          password:              data.password,
          password_confirmation: data.password_confirmation,
          consentimiento:        data.consentimiento,
        });
      }
      toast.success('¡Cuenta creada! Bienvenido a IGO Manager');
      onBack(); // close form — sheet will close via parent
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ paddingTop: '0.25rem' }}>
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: '0.8125rem', fontWeight: 600, color: '#6B7280',
          padding: '0 0 1rem', display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        ← Volver
      </button>

      <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.02em', margin: '0 0 1.25rem' }}>
        Crea tu cuenta
      </h2>

      {/* Nombre */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={LABEL_STYLE}>Nombre completo</label>
        <input
          {...register('nombre')}
          placeholder="Tu nombre"
          style={{ ...INPUT_STYLE, borderColor: errors.nombre ? '#FCA5A5' : 'rgba(0,0,0,0.12)' }}
        />
        {errors.nombre && (
          <p style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: 4 }}>{errors.nombre.message}</p>
        )}
      </div>

      {/* Email */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={LABEL_STYLE}>Correo electrónico</label>
        <input
          {...register('email')}
          type="email"
          placeholder="tu@correo.com"
          style={{ ...INPUT_STYLE, borderColor: errors.email ? '#FCA5A5' : 'rgba(0,0,0,0.12)' }}
        />
        {errors.email && (
          <p style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: 4 }}>{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={LABEL_STYLE}>Contraseña</label>
        <div style={{ position: 'relative' }}>
          <input
            {...register('password')}
            type={showPwd ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            style={{ ...INPUT_STYLE, paddingRight: 44, borderColor: errors.password ? '#FCA5A5' : 'rgba(0,0,0,0.12)' }}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
              display: 'flex', alignItems: 'center',
            }}
          >
            {showPwd ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
          </button>
        </div>
        {errors.password && (
          <p style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: 4 }}>{errors.password.message}</p>
        )}
      </div>

      {/* Confirm password */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={LABEL_STYLE}>Confirmar contraseña</label>
        <div style={{ position: 'relative' }}>
          <input
            {...register('password_confirmation')}
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repite la contraseña"
            style={{ ...INPUT_STYLE, paddingRight: 44, borderColor: errors.password_confirmation ? '#FCA5A5' : 'rgba(0,0,0,0.12)' }}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
              display: 'flex', alignItems: 'center',
            }}
          >
            {showConfirm ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
          </button>
        </div>
        {errors.password_confirmation && (
          <p style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: 4 }}>{errors.password_confirmation.message}</p>
        )}
      </div>

      {/* Términos */}
      <label
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          marginBottom: '1.5rem', cursor: 'pointer',
        }}
      >
        <input
          {...register('consentimiento')}
          type="checkbox"
          style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: '#0A0A0A', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '0.8125rem', color: '#6B7280', lineHeight: 1.5 }}>
          Acepto los{' '}
          <span style={{ color: '#0A0A0A', fontWeight: 600 }}>términos y condiciones</span>
          {' '}de IGO Manager
        </span>
      </label>
      {errors.consentimiento && (
        <p style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: -12, marginBottom: 12 }}>
          {errors.consentimiento.message}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        style={{
          width: '100%', height: 48, borderRadius: 14,
          background: submitting ? '#374151' : '#0A0A0A',
          color: '#FFFFFF', border: 'none',
          fontSize: '0.9375rem', fontWeight: 700,
          letterSpacing: '-0.01em', cursor: submitting ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 0.15s',
        }}
      >
        {submitting && <Loader2 size={15} strokeWidth={2.5} className="animate-spin" />}
        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
    </form>
  );
}

/* ─── Main UserSheet ─── */
interface Props {
  open: boolean;
  onClose: () => void;
}

export function UserSheet({ open, onClose }: Props) {
  const sheetRef   = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isFirst    = useRef(true);
  const [step, setStep]           = useState<'main' | 'registro'>('main');
  const [loggingOut, setLoggingOut] = useState(false);

  const user      = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const navigate  = useNavigate();
  const isInvitado = !user || user.tipo === 'invitado';

  /* Body scroll lock */
  useEffect(() => {
    if (open) {
      document.body.classList.add('igo-drawer-open');
    } else {
      document.body.classList.remove('igo-drawer-open');
    }
    return () => document.body.classList.remove('igo-drawer-open');
  }, [open]);

  /* Reset form step when closing */
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setStep('main'), 320);
      return () => clearTimeout(timer);
    }
  }, [open]);

  /* GSAP animation */
  useEffect(() => {
    if (!sheetRef.current || !overlayRef.current) return;

    if (isFirst.current) {
      isFirst.current = false;
      gsap.set(sheetRef.current, { y: '100%' });
      gsap.set(overlayRef.current, { opacity: 0 });
      return;
    }

    if (open) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.to(sheetRef.current,   { y: 0,       duration: 0.35, ease: 'power3.out' });
    } else {
      gsap.to(overlayRef.current, { opacity: 0,     duration: 0.2,  ease: 'power2.in' });
      gsap.to(sheetRef.current,   { y: '100%',      duration: 0.28, ease: 'power3.in' });
    }
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  const handleCambiarEmpresa = () => {
    navigate('/empresas');
    onClose();
  };

  const handleIniciarSesion = () => {
    navigate('/login');
    onClose();
  };

  /* ── Logout loading screen ── */
  if (loggingOut) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 500,
          background: '#FFFFFF',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '1rem',
        }}
      >
        <Loader2
          size={36}
          strokeWidth={2}
          color="#0A0A0A"
          className="animate-spin"
        />
        <p
          style={{
            fontSize: '0.9375rem',
            fontWeight: 600,
            color: '#0A0A0A',
            letterSpacing: '-0.01em',
            margin: 0,
          }}
        >
          Cerrando sesión…
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        pointerEvents: open ? 'auto' : 'none',
      }}
    >
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          maxWidth: 480,
          margin: '0 auto',
          background: '#FFFFFF',
          borderRadius: '20px 20px 0 0',
          padding: '0 1.25rem 2.5rem',
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '0.75rem 0 0.25rem' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'rgba(0,0,0,0.12)' }} />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 10, right: 14,
            width: 32, height: 32, borderRadius: 999,
            background: 'rgba(0,0,0,0.05)', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={14} color="#6B7280" strokeWidth={2} />
        </button>

        <div style={{ paddingTop: '0.5rem' }}>
          {step === 'registro' ? (
            <RegistroForm onBack={() => setStep('main')} />
          ) : isInvitado ? (
            /* ── Invitado view ── */
            <div>
              {/* Header */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0.75rem 1rem',
                  background: 'rgba(0,0,0,0.03)',
                  border: '1px solid rgba(0,0,0,0.07)',
                  borderRadius: 14,
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    background: 'linear-gradient(135deg, #F3F4F6, #E5E7EB)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <UserCheck size={18} color="#6B7280" strokeWidth={2} />
                </div>
                <div>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0A0A0A', margin: 0, letterSpacing: '-0.01em' }}>
                    Modo exploración
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: '2px 0 0' }}>
                    Estás usando IGO sin cuenta
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#6B7280', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Crea una cuenta para guardar tus empresas e iniciativas de forma permanente y acceder desde cualquier dispositivo.
              </p>

              {/* Crear cuenta */}
              <button
                onClick={() => setStep('registro')}
                style={{
                  width: '100%', height: 48, borderRadius: 14,
                  background: '#0A0A0A', color: '#FFFFFF', border: 'none',
                  fontSize: '0.9375rem', fontWeight: 700,
                  letterSpacing: '-0.01em', cursor: 'pointer',
                  marginBottom: '0.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.15s',
                }}
              >
                Crear cuenta gratuita
              </button>

              {/* Iniciar sesión */}
              <button
                onClick={handleIniciarSesion}
                style={{
                  width: '100%', height: 44, borderRadius: 14,
                  background: 'rgba(0,0,0,0.04)', color: '#374151', border: '1px solid rgba(0,0,0,0.08)',
                  fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
              >
                Ya tengo cuenta — Iniciar sesión
              </button>
            </div>
          ) : (
            /* ── Registrado view ── */
            <div>
              {/* User info */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '0.875rem 1rem',
                  background: 'rgba(0,0,0,0.03)',
                  border: '1px solid rgba(0,0,0,0.07)',
                  borderRadius: 14,
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#0A0A0A',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em' }}>
                    {(user?.nombre ?? 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.9375rem', fontWeight: 700,
                      color: '#0A0A0A', margin: 0,
                      letterSpacing: '-0.01em',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.nombre ?? 'Usuario'}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem', color: '#9CA3AF',
                      margin: '2px 0 0',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                  >
                    {user?.email ?? ''}
                  </p>
                </div>
              </div>

              {/* Cambiar empresa */}
              <button
                onClick={handleCambiarEmpresa}
                style={{
                  width: '100%', height: 48, borderRadius: 14,
                  background: 'rgba(0,0,0,0.04)',
                  color: '#0A0A0A', border: '1px solid rgba(0,0,0,0.08)',
                  fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginBottom: '0.625rem',
                  transition: 'background 0.15s',
                }}
              >
                <Building2 size={16} strokeWidth={2} />
                Cambiar empresa
              </button>

              {/* Push notifications */}
              <PushSection />

              {/* Cerrar sesión */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', height: 48, borderRadius: 14,
                  background: '#FEF2F2',
                  color: '#DC2626', border: '1px solid #FECACA',
                  fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'background 0.15s',
                }}
              >
                <LogOut size={16} strokeWidth={2} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
