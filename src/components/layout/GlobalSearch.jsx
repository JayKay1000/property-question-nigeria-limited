import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Building2, FileText, MapPin, Users } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const categories = [
  { icon: Building2, label: 'Properties', results: ['Luxury Villa in Lekki', '3-Bed Apartment in Ikoyi', 'Land in Epe'] },
  { icon: FileText, label: 'Blog', results: ['Lagos Property Market 2026', 'Buy2Flip Investment Guide'] },
  { icon: MapPin, label: 'Locations', results: ['Lekki', 'Victoria Island', 'Abuja'] },
  { icon: Users, label: 'Agents', results: ['Find an Agent'] },
];

export default function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const goToSearch = (q) => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-brand-950/60 p-4 pt-[15vh] backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-premium-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-brand-100 px-5 py-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && query.trim()) goToSearch(query); }}
                placeholder="Search properties, projects, locations..."
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              {query.trim() && (
                <button onClick={() => goToSearch(query)} className="rounded-lg bg-flame-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-flame-600">Search</button>
              )}
              <button onClick={onClose} className="rounded-lg p-1 text-muted-foreground hover:bg-brand-50" aria-label="Close search">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-3">
              {query ? (
                <div className="space-y-0.5">
                  {categories.map((cat) =>
                    cat.results
                      .filter((r) => r.toLowerCase().includes(query.toLowerCase()))
                      .map((result) => (
                        <Link
                          key={result}
                          to={`/search?q=${encodeURIComponent(result)}`}
                          onClick={onClose}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-brand-50"
                        >
                          <cat.icon className="h-4 w-4 text-flame-500" />
                          <span className="text-sm text-brand-900">{result}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{cat.label}</span>
                        </Link>
                      ))
                  )}
                </div>
              ) : (
                <div>
                  <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trending</p>
                  {['Luxury homes in Lekki', 'Buy2Flip opportunities', 'New estate projects'].map((t) => (
                    <button
                      key={t}
                      onClick={() => goToSearch(t)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-brand-50"
                    >
                      <TrendingUp className="h-4 w-4 text-flame-500" />
                      <span className="text-sm text-brand-900">{t}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}