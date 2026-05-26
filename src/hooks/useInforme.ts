import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/axios';
import type { InformeDB, InformeResponse } from '@/types/informe.types';

export function useInforme(empresaId: number | null) {
  const [informe, setInforme]       = useState<InformeDB | null>(null);
  const [loading, setLoading]       = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fetchInforme = useCallback(async () => {
    if (!empresaId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<InformeResponse>(`/empresas/${empresaId}/informe/ultimo`);
      console.log('JSON recibido del backend (fetch):', JSON.stringify(res.data.data.informe, null, 2));
      setInforme(res.data.data.informe);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) {
        setInforme(null); // Aún no tiene informe — no es un error
      } else {
        setError('No se pudo cargar el informe');
      }
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => {
    setInforme(null);
    setError(null);
    void fetchInforme();
  }, [fetchInforme]);

  const generarInforme = useCallback(async () => {
    if (!empresaId) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post<InformeResponse>(
        `/empresas/${empresaId}/informe`,
        {},
        { timeout: 90_000 },
      );
      console.log('JSON recibido del backend (generar):', JSON.stringify(res.data.data.informe, null, 2));
      setInforme(res.data.data.informe);
    } catch {
      setError('Error al generar el informe. Verifica que tengas iniciativas cargadas e intenta de nuevo.');
    } finally {
      setGenerating(false);
    }
  }, [empresaId]);

  return { informe, loading, generating, error, fetchInforme, generarInforme };
}
