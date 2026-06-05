import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Plus, Building2, MapPin, ArrowRight } from 'lucide-react';
import { OrganicLoader } from '@/components/common/OrganicLoader';
import { useEmpresas } from '@/hooks/useEmpresas';
import { SECTOR_OPTIONS, TAMANO_OPTIONS, CUADRANTES } from '@/lib/utils';
import type { Empresa } from '@/types/empresa.types';

/* ─── helpers ─── */
function sectorLabel(val: string) {
  return SECTOR_OPTIONS.find((o) => o.value === val)?.label ?? val;
}
function tamanoLabel(val: string) {
  return TAMANO_OPTIONS.find((o) => o.value === val)?.label ?? val;
}

/* ─── EmpresaCard ─── */
function EmpresaCard({ empresa, onSelect }: { empresa: Empresa; onSelect: () => void }) {
  const q = CUADRANTES[1]; // verde placeholder
  const initials = empresa.nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <button
      onClick={onSelect}
      className="card-item group text-left w-full"
      style={{
        background: '#FFFFFF',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '1rem',
        padding: '1.375rem',
        cursor: 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.16)';
        e.currentTarget.style.boxShadow   = '0 4px 20px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)';
        e.currentTarget.style.boxShadow   = 'none';
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#0A0A0A',
            color: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.8125rem', fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#0A0A0A', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 4 }}>
            {empresa.nombre}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              fontSize: '0.6875rem', fontWeight: 600,
              padding: '2px 8px', borderRadius: 999,
              background: q.bg, color: q.color, border: `1px solid ${q.border}`,
            }}>
              {sectorLabel(empresa.sector)}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
              {tamanoLabel(empresa.tamano)}
            </span>
          </div>
        </div>
      </div>

      {/* Location + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={12} strokeWidth={1.5} style={{ color: '#9CA3AF', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8125rem', color: '#9CA3AF' }}>
            {empresa.ciudad}, {empresa.pais}
          </span>
        </div>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: '0.8125rem', fontWeight: 600, color: '#0A0A0A',
          }}
        >
          Ver iniciativas
          <ArrowRight size={13} strokeWidth={2} style={{ transition: 'transform 0.15s' }}
            className="group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}

/* ─── EmpresasPage ─── */
export default function EmpresasPage() {
  const navigate  = useNavigate();
  const pageRef   = useRef<HTMLDivElement>(null);
  const { empresas, loading, error, seleccionarEmpresa } = useEmpresas();

  useGSAP(
    () => {
      gsap.fromTo('.page-header',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
      );
      gsap.fromTo('.card-item',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.38, stagger: 0.07, ease: 'power2.out', delay: 0.15 },
      );
    },
    { scope: pageRef, dependencies: [empresas.length] },
  );

  const handleSelect = (empresa: Empresa) => {
    seleccionarEmpresa(empresa);
    navigate('/iniciativas');
  };

  const handleNuevaEmpresa = () => {
    navigate('/onboarding');
  };

  return (
    <div ref={pageRef} style={{ padding: '2rem 1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div
        className="page-header"
        style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: '#0A0A0A',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Mis empresas
          </h1>
          <p style={{ marginTop: '0.375rem', fontSize: '0.9375rem', color: '#6B7280' }}>
            Selecciona una empresa para gestionar sus iniciativas
          </p>
        </div>

        <button
          onClick={handleNuevaEmpresa}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.625rem 1.125rem',
            borderRadius: 10,
            background: '#0A0A0A', color: '#FFFFFF',
            border: 'none', cursor: 'pointer',
            fontSize: '0.875rem', fontWeight: 600,
            transition: 'background 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#374151'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#0A0A0A'; }}
        >
          <Plus size={15} strokeWidth={2} />
          Nueva empresa
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3.5rem 1rem' }}>
          <OrganicLoader variant="dark" size="sm" label="Cargando empresas…" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <p style={{ color: '#DC2626', fontSize: '0.9375rem' }}>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && empresas.length === 0 && (
        <div className="card-item" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <div
            style={{
              width: 64, height: 64, borderRadius: 16,
              background: 'rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}
          >
            <Building2 size={28} strokeWidth={1.5} style={{ color: '#9CA3AF' }} />
          </div>
          <h2
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: '1.5rem', fontWeight: 400, fontStyle: 'italic',
              color: '#0A0A0A', marginBottom: '0.5rem',
            }}
          >
            Aún no tienes empresas
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: '0.9375rem', maxWidth: 320, margin: '0 auto 1.75rem' }}>
            Crea tu primera empresa para empezar a gestionar tus iniciativas estratégicas
          </p>
          <button
            onClick={handleNuevaEmpresa}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', borderRadius: 10,
              background: '#0A0A0A', color: '#FFFFFF',
              border: 'none', cursor: 'pointer',
              fontSize: '0.9375rem', fontWeight: 600,
            }}
          >
            <Plus size={16} strokeWidth={2} />
            Crear empresa
          </button>
        </div>
      )}

      {/* Grid de empresas */}
      {!loading && empresas.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '0.875rem',
          }}
        >
          {empresas.map((empresa) => (
            <EmpresaCard
              key={empresa.id}
              empresa={empresa}
              onSelect={() => handleSelect(empresa)}
            />
          ))}

          {/* Card "+" agregar nueva */}
          <button
            onClick={handleNuevaEmpresa}
            className="card-item"
            style={{
              background: 'transparent',
              border: '1.5px dashed rgba(0,0,0,0.12)',
              borderRadius: '1rem',
              padding: '1.375rem',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '0.75rem', minHeight: 140,
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)';
              e.currentTarget.style.background  = 'rgba(0,0,0,0.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)';
              e.currentTarget.style.background  = 'transparent';
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={18} strokeWidth={1.5} style={{ color: '#9CA3AF' }} />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#9CA3AF' }}>
              Agregar empresa
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
