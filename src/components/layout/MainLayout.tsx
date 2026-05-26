import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { BgOrbs } from '@/components/common/BgOrbs';

/* ─── MainLayout ─── */
export default function MainLayout() {
  return (
    <div className="min-h-[100dvh] flex" style={{ background: '#FFFFFF' }}>
      <BgOrbs variant="app" />

      <Sidebar />

      {/* Main content */}
      <main
        className="flex-1 md:ml-60 flex flex-col min-h-[100dvh] overflow-x-hidden relative"
        style={{ zIndex: 1 }}
      >
        <div className="flex-1 pb-36 md:pb-0">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
