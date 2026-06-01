import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/axios';
import type { MatrizData, MatrizResponse } from '@/types/iniciativa.types';
import type { InformeDB, InformeResponse } from '@/types/informe.types';

/**
 * Hook que orquesta la carga de la Matriz IGO + el Informe estratégico.
 *
 * Flujo al montar:
 *  1. GET /empresas/{id}/matriz
 *  2. Si hay ≥ 2 iniciativas → GET /empresas/{id}/informe/ultimo
 *     - Si existe    → usa directamente (sin llamar a Groq)
 *     - Si 404       → POST /empresas/{id}/informe (auto-genera)
 *
 * El informe solo se regenera con el botón manual (regenerar()).
 */
export function useMatrizConInforme(empresaId: number | null) {
  const [matrizData,     setMatrizData]     = useState<MatrizData | null>(null);
  const [informe,        setInforme]        = useState<InformeDB | null>(null);
  const [loadingMatriz,  setLoadingMatriz]  = useState(false);
  const [loadingInforme, setLoadingInforme] = useState(false);
  const [generating,     setGenerating]     = useState(false);
  const [error,          setError]          = useState<string | null>(null);

  /* ── Core helpers ── */

  const doFetchMatriz = useCallback(async (id: number): Promise<MatrizData | null> => {
    setLoadingMatriz(true);
    try {
      const res = await api.get<MatrizResponse>(`/empresas/${id}/matriz`);
      setMatrizData(res.data.data);
      return res.data.data;
    } catch {
      setError('No se pudo cargar la matriz');
      return null;
    } finally {
      setLoadingMatriz(false);
    }
  }, []);

  const doFetchInforme = useCallback(async (id: number): Promise<InformeDB | 'not_found' | 'error'> => {
    try {
      const res = await api.get<InformeResponse>(`/empresas/${id}/informe/ultimo`);
      return res.data.data.informe;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      return status === 404 ? 'not_found' : 'error';
    }
  }, []);

  const doGenerarInforme = useCallback(async (id: number): Promise<InformeDB | null> => {
    setGenerating(true);
    try {
      const res = await api.post<InformeResponse>(
        `/empresas/${id}/informe`,
        {},
        { timeout: 90_000 },
      );
      return res.data.data.informe;
    } catch {
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  /* ── Initial load ── */

  const initialize = useCallback(async (id: number) => {
    setError(null);

    // 1. Fetch matriz
    const matriz = await doFetchMatriz(id);
    if (!matriz || matriz.iniciativas.length < 2) return;

    // 2. Check for existing informe
    setLoadingInforme(true);
    const result = await doFetchInforme(id);
    setLoadingInforme(false);

    if (result === 'error') {
      setError('No se pudo verificar el análisis estratégico');
      return;
    }

    if (result !== 'not_found') {
      // Existing informe found — use it, do NOT call Groq
      setInforme(result);
      return;
    }

    // 3. No informe → auto-generate
    const generated = await doGenerarInforme(id);
    if (generated) {
      setInforme(generated);
    } else {
      setError('No se pudo generar el análisis automáticamente');
    }
  }, [doFetchMatriz, doFetchInforme, doGenerarInforme]);

  useEffect(() => {
    if (!empresaId) return;
    setMatrizData(null);
    setInforme(null);
    void initialize(empresaId);
  }, [empresaId, initialize]);

  /* ── Manual regenerate (always calls Groq) ── */

  const regenerar = useCallback(async () => {
    if (!empresaId) return;
    setError(null);

    const matriz = await doFetchMatriz(empresaId);
    if (!matriz || matriz.iniciativas.length < 2) return;

    const generated = await doGenerarInforme(empresaId);
    if (generated) {
      setInforme(generated);
    } else {
      setError('Error al regenerar el informe');
    }
  }, [empresaId, doFetchMatriz, doGenerarInforme]);

  return {
    matrizData,
    informe,
    loadingMatriz,
    loadingInforme,
    generating,
    error,
    regenerar,
  };
}
