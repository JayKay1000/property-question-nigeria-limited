import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';

const mpNav = [
  { label: 'Explore', href: '/marketplace#explore' },
  { label: 'For Sale', href: '/properties?purpose=sale' },
  { label: 'For Rent', href: '/properties?purpose=rent' },
  { label: 'Land & Plots', href: '/properties?type=land' },
  { label: 'Commercial', href: '/properties?type=commercial' },
  { label: 'New Projects', href: '/projects' },
];

export default function MarketplaceHeader() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isActive = pathname === '/marketplace';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Logo variant="dark" className="shrink-0" />
          <span className="hidden rounded-md bg-brand-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand-700 sm:inline-block">
            Marketplace
          </span>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {mpNav.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive && item.href.startsWith('/marketplace')
                  ? 'text-flame-600'
                  : 'text-brand-800 hover:bg-brand-50 hover:text-flame-600'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden text-brand-700 hover:text-flame-600 md:inline-flex">
            <Link to="/"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to PQNL</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden text-brand-700 hover:text-flame-600 sm:inline-flex">
            <Link to="/marketplace/agent/register">Become an Agent</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden text-brand-700 hover:text-flame-600 sm:inline-flex">
            <Link to="/marketplace/agent/dashboard">Dashboard</Link>
          </Button>
          <Button asChild size="sm" className="bg-flame-500 text-white hover:bg-flame-600">
            <Link to="/marketplace/agent/properties/new"><Plus className="mr-1.5 h-4 w-4" /> Post Property</Link>
          </Button>
          <button
            className="rounded-lg p-2 text-brand-800 hover:bg-brand-50 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open marketplace menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[80%] max-w-xs flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Logo variant="dark" />
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-brand-800 hover:bg-brand-50" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {mpNav.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-brand-900 hover:bg-brand-50 hover:text-flame-600"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back to PQNL Website
              </Link>
            </nav>
            <div className="border-t border-border p-4 space-y-2">
              <Button asChild variant="outline" className="w-full border-brand-200 hover:bg-brand-50">
                <Link to="/marketplace/agent/register" onClick={() => setMobileOpen(false)}>Become an Agent</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-brand-200 hover:bg-brand-50">
                <Link to="/marketplace/agent/dashboard" onClick={() => setMobileOpen(false)}>Agent Dashboard</Link>
              </Button>
              <Button asChild className="w-full bg-flame-500 text-white hover:bg-flame-600">
                <Link to="/marketplace/agent/properties/new" onClick={() => setMobileOpen(false)}><Plus className="mr-1.5 h-4 w-4" /> Post Property</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}