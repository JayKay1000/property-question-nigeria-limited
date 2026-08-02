import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('pq-cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handle = (value) => {
    localStorage.setItem('pq-cookie-consent', value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.4 }}
          className="fixed bottom-4 left-4 right-4 z-[55] mx-auto max-w-2xl rounded-2xl border border-brand-100 bg-white p-5 shadow-premium-lg md:left-6 md:right-auto"
        >
          <div className="flex items-start gap-4">
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-flame-50 sm:flex">
              <Cookie className="h-5 w-5 text-flame-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-brand-900">
                We use cookies to enhance your browsing experience. By continuing, you agree to our{' '}
                <Link to="/cookies" className="font-medium text-flame-600 hover:underline">Cookie Policy</Link>.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" className="bg-flame-500 hover:bg-flame-600 text-white" onClick={() => handle('accepted')}>
                  Accept All
                </Button>
                <Button size="sm" variant="outline" onClick={() => handle('essential')}>
                  Essential Only
                </Button>
              </div>
            </div>
            <button onClick={() => handle('dismissed')} className="rounded-lg p-1 text-muted-foreground hover:bg-brand-50" aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}