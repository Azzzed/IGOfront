import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';
import { Menu, X, TrendingUp, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/empresas',    label: 'Empresas' },
  { to: '/iniciativas', label: 'Iniciativas' },
  { to: '/matriz',      label: 'Matriz IGO' },
  { to: '/informe',     label: 'Informe IA' },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 'top -60',
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    if (mobileOpen && mobileRef.current) {
      gsap.fromTo(
        mobileRef.current,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' },
      );
    }
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          background: scrolled
            ? 'rgba(255,255,255,0.95)'
            : 'rgba(255,255,255,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: scrolled
            ? '1px solid rgba(0,0,0,0.10)'
            : '1px solid rgba(0,0,0,0.05)',
          transition: 'background 0.3s ease, border-color 0.3s ease',
          padding: '0 1.5rem',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link
          to={isAuthenticated ? '/empresas' : '/login'}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#0A0A0A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TrendingUp size={16} color="white" strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.9375rem',
              letterSpacing: '-0.02em',
              color: '#0A0A0A',
            }}
          >
            IGO app
          </span>
        </Link>

        {/* Desktop nav — solo si autenticado */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-[rgba(0,0,0,0.06)] text-[#0A0A0A]'
                      : 'text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[rgba(0,0,0,0.04)]',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Derecha */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[rgba(0,0,0,0.04)] transition-all duration-150"
              >
                <LogOut size={14} strokeWidth={1.5} />
                Salir
              </button>

              <button
                className="md:hidden p-2 rounded-lg hover:bg-[rgba(0,0,0,0.05)] transition-colors text-[#0A0A0A]"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Menú"
              >
                {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:block text-sm font-medium text-[#6B7280] hover:text-[#0A0A0A] transition-colors px-3 py-1.5"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: '#0A0A0A',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = '#374151'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#0A0A0A'; }}
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Menú mobile */}
      {mobileOpen && isAuthenticated && (
        <div
          ref={mobileRef}
          style={{
            position: 'fixed',
            top: 60, left: 0, right: 0,
            zIndex: 99,
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            padding: '0.5rem 1.5rem 1rem',
          }}
        >
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center py-3 text-sm font-medium border-b border-[rgba(0,0,0,0.05)] last:border-0 transition-colors',
                  isActive ? 'text-[#0A0A0A]' : 'text-[#6B7280]',
                )
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 pt-3 text-sm font-medium text-[#6B7280] hover:text-[#0A0A0A] transition-colors"
          >
            <LogOut size={14} strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      )}
    </>
  );
}
