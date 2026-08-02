import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Moon, Sun, LogOut, User, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRBAC } from '@/lib/rbac/useRBAC';
import { base44 } from '@/api/base44Client';
import { dashboardNav } from '@/lib/dashboard-nav';

export default function DashboardTopbar({ onMobileMenu }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const rbac = useRBAC();
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState('');

  const currentItem =
    [...dashboardNav]
      .sort((a, b) => b.href.length - a.href.length)
      .find(item => pathname.startsWith(item.href)) || { label: 'Dashboard' };

  const toggleTheme = () => {
    setDark(d => !d);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = () => base44.auth.logout('/login');

  const userName = rbac.user?.full_name || rbac.user?.email || 'User';
  const initials = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMobileMenu}
        className="rounded-lg p-2 text-brand-800 hover:bg-brand-50 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="hidden text-lg font-heading font-bold text-brand-900 sm:block">
        {currentItem.label}
      </h1>

      <div className="relative ml-auto hidden max-w-xs flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search properties, people, documents…"
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-brand-800 hover:bg-brand-50"
          aria-label="Toggle theme"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative rounded-lg p-2 text-brand-800 hover:bg-brand-50"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-flame-500 text-[10px] font-bold text-white">
                3
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 text-sm font-semibold text-brand-900">Notifications</div>
            <DropdownMenuSeparator />
            {[
              { text: 'New enquiry on Lekki Property', time: '5m ago' },
              { text: 'Inspection scheduled for tomorrow', time: '1h ago' },
              { text: 'Buy2Flip payment confirmed', time: '3h ago' },
            ].map((n, i) => (
              <DropdownMenuItem key={i} className="flex-col items-start py-2">
                <span className="text-sm text-brand-900">{n.text}</span>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white hover:bg-brand-700">
              {initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-brand-900">{userName}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {rbac.role ? rbac.role.replace(/_/g, ' ') : 'member'}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}