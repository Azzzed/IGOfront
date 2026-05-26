import { useCallback, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { useEmpresaStore } from '@/store/empresaStore';
import type { Empresa, EmpresaRequest, EmpresaResponse, EmpresasListResponse } from '@/types/empresa.types';

export function useEmpresas() {
  const {
    empresas, setEmpresas,
    empresaActiva, setEmpresaActiva,
    addEmpresa, updateEmpresa, removeEmpresa,
  } = useEmpresaStore();

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const fetchEmpresas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<EmpresasListResponse>('/empresas');
      setEmpresas(res.data.data.empresas);
    } catch {
      setError('No se pudieron cargar las empresas');
    } finally {
      setLoading(false);
    }
  }, [setEmpresas]);

  useEffect(() => { fetchEmpresas(); }, [fetchEmpresas]);

  const crearEmpresa = useCallback(async (data: EmpresaRequest): Promise<Empresa> => {
    const res = await api.post<EmpresaResponse>('/empresas', data);
    const empresa = res.data.data.empresa;
    addEmpresa(empresa);
    return empresa;
  }, [addEmpresa]);

  const actualizarEmpresa = useCallback(async (id: number, data: Partial<EmpresaRequest>): Promise<void> => {
    await api.put(`/empresas/${id}`, data);
    updateEmpresa(id, data);
  }, [updateEmpresa]);

  const eliminarEmpresa = useCallback(async (id: number): Promise<void> => {
    await api.delete(`/empresas/${id}`);
    removeEmpresa(id);
  }, [removeEmpresa]);

  const seleccionarEmpresa = useCallback((empresa: Empresa) => {
    setEmpresaActiva(empresa);
  }, [setEmpresaActiva]);

  return {
    empresas,
    empresaActiva,
    loading,
    error,
    fetchEmpresas,
    crearEmpresa,
    actualizarEmpresa,
    eliminarEmpresa,
    seleccionarEmpresa,
  };
}
