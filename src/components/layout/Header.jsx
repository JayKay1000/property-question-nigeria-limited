import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Search, Menu, ChevronDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import { navItems } from '@/lib/navigation';
import { useRBAC } from '@/lib/rbac/useRBAC';
import MegaMenu from './MegaMenu';
import MobileNav from './MobileNav';
import GlobalSearch from './GlobalSearch';
import NotificationCenter from '@/components/notifications/NotificationCenter';

export default function Header() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const rbac = useRBAC();
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const transparent = isHome && !scrolled;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          transparent ? 'bg-transparent py-4' : 'bg-white/90 backdrop-blur-xl shadow-premium py-2.5'
        }`}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="container-wide section-pad flex items-center justify-between gap-4">
          <Logo variant={transparent ? 'light' : 'dark'} />

          <nav className="hidden items-center gap-0.5 lg:flex">
            {navItems.map((item) => (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => setActiveMenu(item.mega ? item.key : null)}
              >
                <Link
                  to={item.href}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    transparent
                      ? 'text-white/90 hover:text-white hover:bg-white/10'
                      : 'text-brand-800 hover:text-flame-600 hover:bg-brand-50'
                  }`}
                >
                  {item.label}
                  {item.mega && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
                </Link>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className={`rounded-lg p-2 transition-colors ${
                transparent ? 'text-white hover:bg-white/10' : 'text-brand-800 hover:bg-brand-50'
              }`}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <div className="hidden items-center gap-1.5 md:flex">
              {rbac.isAdmin && (
                <Button asChild variant="ghost" size="sm" className={transparent ? 'text-white hover:bg-white/10 hover:text-white' : 'text-brand-800'}>
                  <Link to="/admin/rbac"><Shield className="mr-1.5 h-4 w-4" />Dashboard</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm" className={transparent ? 'text-white hover:bg-white/10 hover:text-white' : 'text-brand-800'}>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-flame-500 hover:bg-flame-600 text-white">
                <Link to="/register">Register</Link>
              </Button>
            </div>
            <button
              className={`rounded-lg p-2 transition-colors md:hidden ${transparent ? 'text-white' : 'text-brand-800'}`}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {activeMenu && (
            <MegaMenu item={navItems.find((i) => i.key === activeMenu)} />
          )}
        </AnimatePresence>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}