import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopbar from './DashboardTopbar';
import DashboardBreadcrumb from './DashboardBreadcrumb';
import CommandPalette from '@/components/ui/CommandPalette';

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <div className="min-h-screen bg-soft-gray">
      <DashboardSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className={`transition-[padding] duration-300 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <DashboardTopbar
          onMobileMenu={() => setMobileOpen(true)}
          onSearchClick={() => setCommandOpen(true)}
        />
        <main className="section-pad mx-auto max-w-[1440px] py-6">
          <DashboardBreadcrumb />
          <Outlet />
        </main>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}