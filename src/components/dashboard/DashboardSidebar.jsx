import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, X } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { dashboardNav } from '@/lib/dashboard-nav';
import { useRBAC } from '@/lib/rbac/useRBAC';

export default function DashboardSidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { pathname } = useLocation();
  const rbac = useRBAC();

  const filteredNav = dashboardNav.filter(
    item => !item.permission || rbac.hasPermission(item.permission)
  );

  const isActive = (href) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onCloseMobile} />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 h-full bg-brand-900 text-white transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          {!collapsed && <Logo variant="light" className="scale-90" />}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              className="hidden rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:block"
              aria-label="Toggle sidebar"
            >
              <ChevronLeft className={`h-5 w-5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav
          className="overflow-y-auto py-4 scrollbar-hide"
          style={{ maxHeight: 'calc(100vh - 4rem)' }}
        >
          {filteredNav.map(item => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={`mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-flame-500 text-white shadow-glow-flame'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}