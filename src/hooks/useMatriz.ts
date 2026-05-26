import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/axios';
import type { MatrizData, MatrizResponse } from '@/types/iniciativa.types';

export function useMatriz(empresaId: number | null) {
  const [matrizData, setMatrizData] = useState<MatrizData | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fetchMatriz = useCallback(async () => {
    if (!empresaId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<MatrizResponse>(`/empresas/${empresaId}/matriz`);
      setMatrizData(res.data.data);
    } catch {
      setError('No se pudo cargar la matriz');
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  useEffect(() => { fetchMatriz(); }, [fetchMatriz]);

  return { matrizData, loading, error, fetchMatriz };
}
