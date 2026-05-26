import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, TrendingUp, FileText, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useEmpresaStore } from '@/store/empresaStore';
import { UserSheet } from './UserSheet';

const TABS = [
  { to: '/empresas',    icon: Home,        label: 'Inicio',  needsEmpresa: false },
  { to: '/iniciativas', icon: LayoutGrid,  label: 'Tareas',  needsEmpresa: true  },
  { to: '/matriz',      icon: TrendingUp,  label: 'Matriz',  needsEmpresa: true  },
  { to: '/informe',     icon: FileText,    label: 'Informe', needsEmpresa: true  },
] as const;

export default function BottomNav() {
  const empresas      = useEmpresaStore((s) => s.empresas);
  const empresaActiva = useEmpresaStore((s) => s.empresaActiva);
  const hasEmpresa    = empresas.length > 0 || !!empresaActiva;

  const [sheetOpen, setSheetOpen] = useState(false);

  const handleProtectedClick = (_label: string) => {
    toast('Selecciona una empresa para continuar', {
      duration: 3000,
      icon: '🏢',
    });
  };

  return (
    <>
      <div
        className="igo-bottom-nav fixed md:hidden"
        style={{
          bottom: '1.25rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        {/* Warning pill — solo cuando no tiene ninguna empresa registrada */}
        {!hasEmpresa && (
          <button
            onClick={() => toast('Crea tu primera empresa para continuar', { duration: 3000 })}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 999,
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(217,119,6,0.12)',
              whiteSpace: 'nowrap',
            }}
          >
            <AlertCircle size={13} strokeWidth={2} style={{ color: '#D97706', flexShrink: 0 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#D97706' }}>
              Registra tu empresa para continuar
            </span>
          </button>
        )}

        {/* Nav pill */}
        <nav>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 2,
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 999, padding: '5px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            {TABS.map(({ to, icon: Icon, label, needsEmpresa }) => {
              const needsToast = needsEmpresa && !empresaActiva;

              if (needsToast) {
                /* Tab protegido sin empresa activa → toast, no navegar */
                return (
                  <button
                    key={to}
                    onClick={() => handleProtectedClick(label)}
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: '8px 13px', borderRadius: 999,
                      minWidth: 52, border: 'none', background: 'transparent',
                      cursor: 'pointer', color: '#C4C9D4', gap: 1,
                    }}
                  >
                    <Icon size={17} strokeWidth={1.5} />
                    <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.02em', lineHeight: 1, marginTop: 2 }}>
                      {label}
                    </span>
                  </button>
                );
              }

              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive: a }) =>
                    cn(
                      'flex flex-col items-center justify-center gap-px transition-all duration-200',
                      a ? 'text-white' : 'text-[#9CA3AF] hover:text-[#6B7280]',
                    )
                  }
                  style={({ isActive: a }) => ({
                    padding: '8px 13px', borderRadius: 999,
                    background: a ? '#0A0A0A' : 'transparent',
                    minWidth: 52,
                  })}
                >
                  {({ isActive: a }) => (
                    <>
                      <Icon size={17} strokeWidth={a ? 2.5 : 1.5} />
                      <span style={{ fontSize: 9, fontWeight: a ? 600 : 500, letterSpacing: '0.02em', lineHeight: 1, marginTop: 2 }}>
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}

            {/* Tab de usuario — siempre clickable */}
            <button
              onClick={() => setSheetOpen(true)}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '8px 13px', borderRadius: 999,
                minWidth: 52, border: 'none',
                background: sheetOpen ? '#0A0A0A' : 'transparent',
                cursor: 'pointer',
                color: sheetOpen ? '#FFFFFF' : '#9CA3AF',
                gap: 1, transition: 'background 0.2s, color 0.2s',
              }}
            >
              <User size={17} strokeWidth={sheetOpen ? 2.5 : 1.5} />
              <span style={{ fontSize: 9, fontWeight: sheetOpen ? 600 : 500, letterSpacing: '0.02em', lineHeight: 1, marginTop: 2 }}>
                Perfil
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Bottom sheet de usuario */}
      <UserSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
