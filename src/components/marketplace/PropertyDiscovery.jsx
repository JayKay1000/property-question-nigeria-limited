import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Inbox, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ACTIVE_STATUSES } from '@/lib/property-utils';
import { Button } from '@/components/ui/button';
import PropertyAdCard from './PropertyAdCard';

const SAVE_KEY = 'pq_saved_properties';

export default function PropertyDiscovery() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    setSavedIds(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
  }, []);

  useEffect(() => {
    base44.entities.Property.filter({ visibility: 'public' }, '-created_date', 12)
      .then((results) => setProperties(results.filter((p) => ACTIVE_STATUSES.includes(p.status))))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback((property) => {
    setSavedIds((prev) => {
      const next = prev.includes(property.id) ? prev.filter((id) => id !== property.id) : [...prev, property.id];
      localStorage.setItem(SAVE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <section id="explore" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold text-brand-900">Explore Properties</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Browse the latest property advertisements from agents across Nigeria.</p>
        </div>
        <Button asChild variant="outline" size="sm" className="hidden shrink-0 border-brand-200 hover:bg-brand-50 sm:inline-flex">
          <Link to="/properties">View All <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-flame-500" />
          <p className="mt-3 text-sm text-muted-foreground">Loading property advertisements...</p>
        </div>
      ) : properties.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {properties.map((p) => (
              <PropertyAdCard key={p.id} property={p} onSave={handleSave} isSaved={savedIds.includes(p.id)} />
            ))}
          </div>
          <div className="mt-8 flex justify-center sm:hidden">
            <Button asChild variant="outline" className="border-brand-200 hover:bg-brand-50">
              <Link to="/properties">View All Properties <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
            <Inbox className="h-7 w-7 text-brand-300" />
          </div>
          <h3 className="mt-4 font-heading text-base font-semibold text-brand-900">No Listings Yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Property advertisements will appear here as soon as agents start listing on the PQNL Marketplace.
          </p>
          <Button asChild className="mt-5 bg-flame-500 text-white hover:bg-flame-600">
            <Link to="/submit">Be the first to list</Link>
          </Button>
        </div>
      )}
    </section>
  );
}