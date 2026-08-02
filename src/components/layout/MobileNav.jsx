import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import { navItems } from '@/lib/navigation';

export default function MobileNav({ open, onClose }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-brand-950/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[70] flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-brand-100 px-5 py-4">
              <Logo />
              <button onClick={onClose} className="rounded-lg p-2 text-brand-800 hover:bg-brand-50" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <nav className="space-y-0.5">
                {navItems.map((item) => (
                  <div key={item.key}>
                    {item.mega ? (
                      <button
                        onClick={() => setExpanded(expanded === item.key ? null : item.key)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-brand-900 hover:bg-brand-50"
                      >
                        {item.label}
                        <ChevronDown className={`h-4 w-4 transition-transform ${expanded === item.key ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-brand-900 hover:bg-brand-50"
                      >
                        {item.label}
                      </Link>
                    )}
                    {item.mega && expanded === item.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-brand-100 pl-3"
                      >
                        {item.mega.sections.flatMap((s) => s.links).map((link) => (
                          <Link
                            key={link.label}
                            to={link.href}
                            onClick={onClose}
                            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-brand-50 hover:text-flame-600"
                          >
                            {link.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            <div className="space-y-2 border-t border-brand-100 p-5">
              <Button asChild className="w-full bg-flame-500 hover:bg-flame-600 text-white">
                <Link to="/register" onClick={onClose}>Get Started</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/login" onClick={onClose}>Login</Link>
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}