import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, LayoutGrid, TrendingUp, User } from 'lucide-react';

const tabs = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Properties', href: '/properties', icon: Building2 },
  { label: 'Projects', href: '/projects', icon: LayoutGrid },
  { label: 'Buy2Flip', href: '/buy2flip', icon: TrendingUp },
  { label: 'Account', href: '/dashboard', icon: User },
];

export default function BottomTabBar() {
  const { pathname } = useLocation();

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-white/95 backdrop-blur-xl md:hidden">
      {tabs.map((tab) => {
        const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.label}
            to={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${active ? 'text-flame-600' : 'text-muted-foreground'}`}
          >
            <Icon className="h-5 w-5" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}