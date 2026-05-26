import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';

import LoginPage       from '@/pages/LoginPage';
import RegistroPage    from '@/pages/RegistroPage';
import OnboardingPage  from '@/pages/OnboardingPage';
import EmpresasPage    from '@/pages/EmpresasPage';
import IniciativasPage from '@/pages/IniciativasPage';
import MatrizPage      from '@/pages/MatrizPage';
import InformePage     from '@/pages/InformePage';
import PlanPage        from '@/pages/PlanPage';
import AdminPage       from '@/pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.08)',
            color: '#0A0A0A',
            fontFamily: 'Inter Variable, system-ui, sans-serif',
            fontSize: '13.5px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          },
        }}
      />

      <Routes>
        {/* Públicas */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        {/* Protegidas SIN layout (pantalla completa) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* Protegidas con layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/empresas"    element={<EmpresasPage />} />
            <Route path="/iniciativas" element={<IniciativasPage />} />
            <Route path="/matriz"      element={<MatrizPage />} />
            <Route path="/informe"     element={<InformePage />} />
            <Route path="/plan/:id"    element={<PlanPage />} />
            <Route path="/admin"       element={<AdminPage />} />
          </Route>
        </Route>

        <Route path="/"  element={<Navigate to="/empresas" replace />} />
        <Route path="*"  element={<Navigate to="/login"    replace />} />
      </Routes>
    </BrowserRouter>
  );
}
