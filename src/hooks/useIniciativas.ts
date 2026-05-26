import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/axios';
import type {
  Iniciativa,
  IniciativaRequest,
  IniciativaResponse,
  IniciativasListResponse,
  MatrizData,
  MatrizResponse,
} from '@/types/iniciativa.types';

export function useIniciativas(empresaId: number | null) {
  const [iniciativas, setIniciativas] = useState<Iniciativa[]>([]);
  const [matriz, setMatriz]           = useState<MatrizData | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const fetchIniciativas = useCallback(async () => {
    if (!empresaId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<IniciativasListResponse>(`/empresas/${empresaId}/iniciativas`);
      setIniciativas(res.data.data.iniciativas);
    } catch {
      setError('No se pudieron cargar las iniciativas');
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  const fetchMatriz = useCallback(async () => {
    if (!empresaId) return;
    try {
      const res = await api.get<MatrizResponse>(`/empresas/${empresaId}/matriz`);
      setMatriz(res.data.data);
    } catch {
      // silencioso
    }
  }, [empresaId]);

  useEffect(() => { fetchIniciativas(); }, [fetchIniciativas]);

  const crearIniciativa = useCallback(async (data: IniciativaRequest): Promise<Iniciativa> => {
    if (!empresaId) throw new Error('Sin empresa activa');
    const res = await api.post<IniciativaResponse>(`/empresas/${empresaId}/iniciativas`, data);
    const ini = res.data.data.iniciativa;
    setIniciativas((prev) => [...prev, ini]);
    return ini;
  }, [empresaId]);

  const actualizarIniciativa = useCallback(async (id: number, data: Partial<IniciativaRequest>): Promise<void> => {
    const res = await api.put<IniciativaResponse>(`/iniciativas/${id}`, data);
    const updated = res.data.data.iniciativa;
    setIniciativas((prev) => prev.map((i) => (i.id === id ? updated : i)));
  }, []);

  const eliminarIniciativa = useCallback(async (id: number): Promise<void> => {
    await api.delete(`/iniciativas/${id}`);
    setIniciativas((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return {
    iniciativas,
    matriz,
    loading,
    error,
    fetchIniciativas,
    fetchMatriz,
    crearIniciativa,
    actualizarIniciativa,
    eliminarIniciativa,
  };
}
