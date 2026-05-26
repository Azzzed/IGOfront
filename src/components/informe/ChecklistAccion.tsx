import { useState } from 'react';
import type { AccionInforme } from '@/types/informe.types';

interface Props {
  accion: AccionInforme;
  index: number;
}

export function ChecklistAccion({ accion, index }: Props) {
  const [checked, setChecked] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        padding: '0.625rem 0',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Square checkbox */}
      <button
        onClick={() => setChecked((v) => !v)}
        aria-label={checked ? 'Marcar como pendiente' : 'Marcar como completada'}
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          flexShrink: 0,
          border: checked ? 'none' : '1.5px solid rgba(0,0,0,0.25)',
          background: checked ? '#0A0A0A' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
          transition: 'background 0.15s, border 0.15s',
        }}
      >
        {checked && (
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path
              d="M1 3.5L3.5 6L8 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: checked ? '#9CA3AF' : '#0A0A0A',
            margin: 0,
            textDecoration: checked ? 'line-through' : 'none',
            lineHeight: 1.4,
            transition: 'color 0.15s',
          }}
        >
          {index + 1}. {accion.titulo}
        </p>
        <p
          style={{
            fontSize: '0.75rem',
            color: '#6B7280',
            margin: '3px 0 0',
            lineHeight: 1.5,
            opacity: checked ? 0.55 : 1,
            transition: 'opacity 0.15s',
          }}
        >
          {accion.descripcion}
        </p>
      </div>
    </div>
  );
}
