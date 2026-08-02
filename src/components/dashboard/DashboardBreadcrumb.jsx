import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, LayoutDashboard } from 'lucide-react';
import { dashboardNav } from '@/lib/dashboard-nav';

export default function DashboardBreadcrumb() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  const items = segments.map((seg, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const navItem = dashboardNav.find(n => n.href === path);
    return {
      label: navItem?.label || seg.charAt(0).toUpperCase() + seg.slice(1),
      path,
    };
  });

  return (
    <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-flame-600">
        <LayoutDashboard className="h-3.5 w-3.5" />
        <span>Dashboard</span>
      </Link>
      {items.map((item, i) => (
        <span key={item.path} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {i === items.length - 1 ? (
            <span className="font-medium text-brand-900">{item.label}</span>
          ) : (
            <Link to={item.path} className="hover:text-flame-600">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}