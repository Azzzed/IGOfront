import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  TrendingUp,
  FileText,
  BarChart2,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';

const NAV_ITEMS = [
  { to: '/empresas',    icon: Home,       label: 'Empresas'    },
  { to: '/iniciativas', icon: LayoutGrid, label: 'Iniciativas' },
  { to: '/matriz',      icon: TrendingUp, label: 'Matriz IGO'  },
  { to: '/informe',     icon: FileText,   label: 'Informe IA'  },
  { to: '/admin',       icon: BarChart2,  label: 'Admin'       },
] as const;

export default function Sidebar() {
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-60 z-40"
      style={{
        background: '#FAFAFA',
        borderRight: '1px solid rgba(0,0,0,0.08)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: '#0A0A0A' }}
        >
          <TrendingUp size={15} color="white" strokeWidth={2.5} />
        </div>
        <div>
          <p
            style={{
              fontWeight: 700,
              fontSize: '0.875rem',
              letterSpacing: '-0.02em',
              color: '#0A0A0A',
              lineHeight: 1,
            }}
          >
            IGO app
          </p>
          <p
            style={{
              fontSize: '0.625rem',
              color: '#9CA3AF',
              marginTop: 3,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Estrategia
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-[rgba(0,0,0,0.06)] text-[#0A0A0A]'
                      : 'text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[rgba(0,0,0,0.04)]',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={16}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      className="flex-shrink-0"
                    />
                    <span className="flex-1">{label}</span>
                    {isActive && (
                      <ChevronRight size={14} strokeWidth={1.5} style={{ color: '#9CA3AF' }} />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User + Logout */}
      <div
        className="px-3 py-4 space-y-1"
        style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
      >
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: '#0A0A0A',
                color: '#FFFFFF',
              }}
            >
              {user.nombre?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: '#0A0A0A',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.nombre ?? 'Invitado'}
              </p>
              <p
                style={{
                  fontSize: '0.6875rem',
                  color: '#9CA3AF',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.email ?? 'Sin cuenta'}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[rgba(0,0,0,0.04)] transition-all duration-150"
        >
          <LogOut size={15} strokeWidth={1.5} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
