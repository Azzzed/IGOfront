import { create } from 'zustand';
import type { Empresa } from '@/types/empresa.types';

interface EmpresaState {
  empresas: Empresa[];
  empresaActiva: Empresa | null;
  setEmpresas: (empresas: Empresa[]) => void;
  setEmpresaActiva: (empresa: Empresa | null) => void;
  addEmpresa: (empresa: Empresa) => void;
  updateEmpresa: (id: number, data: Partial<Empresa>) => void;
  removeEmpresa: (id: number) => void;
}

export const useEmpresaStore = create<EmpresaState>((set) => ({
  empresas: [],
  empresaActiva: null,

  setEmpresas: (empresas) => set({ empresas }),

  setEmpresaActiva: (empresa) => set({ empresaActiva: empresa }),

  addEmpresa: (empresa) =>
    set((state) => ({ empresas: [...state.empresas, empresa] })),

  updateEmpresa: (id, data) =>
    set((state) => ({
      empresas: state.empresas.map((e) => (e.id === id ? { ...e, ...data } : e)),
      empresaActiva:
        state.empresaActiva?.id === id
          ? { ...state.empresaActiva, ...data }
          : state.empresaActiva,
    })),

  removeEmpresa: (id) =>
    set((state) => ({
      empresas: state.empresas.filter((e) => e.id !== id),
      empresaActiva: state.empresaActiva?.id === id ? null : state.empresaActiva,
    })),
}));
