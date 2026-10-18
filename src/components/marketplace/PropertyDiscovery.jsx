import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Inbox, SlidersHorizontal, X, AlertCircle, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { SORT_OPTIONS } from '@/lib/property-utils';
import { buildMarketplaceQuery, MARKETPLACE_PAGE_SIZE, normalizeSortKey, defaultFilters } from '@/lib/marketplace-search';
import { logMarketplaceSearch } from '@/lib/marketplace-instrumentation';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import PropertyAdCard from './PropertyAdCard';
import MarketplaceFilters from './MarketplaceFilters';

const SAVE_KEY = 'pq_saved_properties';
const MARKETPLACE_SORTS = SORT_OPTIONS.filter((s) =>
  ['newest', 'price_low', 'price_high', 'featured', 'most_viewed', 'most_saved'].includes(s.value)
);

export default function PropertyDiscovery({ filters, setFilters, sort, setSort, propertyTypes }) {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const reqIdRef = useRef(0);

  // Check auth and load saved property IDs.
  // Authenticated users: load from SavedProperty entity (server), and migrate
  // any existing browser saves to the server so they are not lost.
  // Anonymous visitors: use localStorage (browser-based saves).
  useEffect(() => {
    let active = true;
    base44.auth.isAuthenticated().then(async (authed) => {
      if (!active) return;
      setIsAuthenticated(authed);
      if (authed) {
        try {
          const user = await base44.auth.me();
          if (!user || !active) return;
          const res = await base44.entities.SavedProperty.filter(
            { user_id: user.id },
            { limit: 500, fields: ['property_id'] }
          );
          if (!active) return;
          const serverSaved = (res.items || res).map((s) => s.property_id);

          // Migrate browser saves to server (best-effort, avoid duplicates)
          const browserSaves = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]');
          const toMigrate = browserSaves.filter((pid) => !serverSaved.includes(pid));
          if (toMigrate.length > 0) {
            try {
              await base44.entities.SavedProperty.bulkCreate(
                toMigrate.map((pid) => ({
                  user_id: user.id,
                  property_id: pid,
                  saved_date: new Date().toISOString(),
                  collection_name: 'Favorites',
                }))
              );
            } catch { /* best-effort */ }
            localStorage.removeItem(SAVE_KEY);
          }
          if (active) setSavedIds([...new Set([...serverSaved, ...toMigrate])]);
        } catch {
          if (active) setSavedIds(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
        }
      } else {
        if (active) setSavedIds(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
      }
    }).catch(() => {
      if (active) setSavedIds(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
    });
    return () => { active = false; };
  }, []);

  // Fetch first page on filter/sort change.
  // Stale requests are ignored via reqIdRef — a newer filter change increments
  // the ref, so an older in-flight response is discarded before setState.
  useEffect(() => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    const query = buildMarketplaceQuery(filters);
    const sortKey = normalizeSortKey(sort);

    // Count failure is swallowed separately so a count error does not hide
    // properties that loaded successfully.
    Promise.all([
      base44.entities.Property.filter(query, { sort: sortKey, limit: MARKETPLACE_PAGE_SIZE }),
      base44.entities.Property.count(query).catch(() => null),
    ]).then(([page, total]) => {
      if (reqId !== reqIdRef.current) return;
      setItems(page.items || []);
      setCursor(page.next_cursor || null);
      setHasMore(!!page.has_more);
      setCount(total || 0);
    }).catch(() => {
      if (reqId !== reqIdRef.current) return;
      setError('Unable to load properties. Please check your connection and try again.');
      setItems([]);
      setCount(0);
      setHasMore(false);
    }).finally(() => {
      if (reqId === reqIdRef.current) setLoading(false);
    });
  }, [filters, sort]);

  // Debounced search instrumentation — logs after results settle, only when
  // active criteria exist (not the default empty browse). 2s debounce prevents
  // a flood of logs from rapid filter changes.
  const logTimerRef = useRef(null);
  useEffect(() => {
    if (loading || error) return;
    if (logTimerRef.current) clearTimeout(logTimerRef.current);
    logTimerRef.current = setTimeout(() => {
      const hasCriteria = !!(
        filters.keyword || filters.state || filters.lga || filters.propertyType ||
        filters.purpose || filters.priceMin != null || filters.priceMax != null ||
        filters.bedrooms || filters.bathrooms || filters.classification ||
        (filters.amenities && filters.amenities.length > 0) || filters.featured || filters.jointVenture
      );
      if (hasCriteria) {
        logMarketplaceSearch({
          query: filters.keyword || '',
          filters,
          resultsCount: count,
          zeroResults: count === 0,
        }).catch(() => {});
      }
    }, 2000);
    return () => { if (logTimerRef.current) clearTimeout(logTimerRef.current); };
  }, [filters, sort, loading, error, count]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    const reqId = reqIdRef.current;
    setLoadingMore(true);
    try {
      const query = buildMarketplaceQuery(filters);
      const sortKey = normalizeSortKey(sort);
      const page = await base44.entities.Property.filter(query, { sort: sortKey, limit: MARKETPLACE_PAGE_SIZE, cursor });
      if (reqId !== reqIdRef.current) return;
      // Deduplicate by ID — a listing's sort position may shift between page
      // requests (e.g. view_count increased), so the same listing could appear
      // on two pages. The cursor handles most of this, but we dedup as a guard.
      const newItems = page.items || [];
      setItems((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        return [...prev, ...newItems.filter((p) => !existing.has(p.id))];
      });
      setCursor(page.next_cursor || null);
      setHasMore(!!page.has_more);
    } catch {
      // On load-more error, stop pagination but keep existing results
      setHasMore(false);
    }
    if (reqId === reqIdRef.current) setLoadingMore(false);
  };

  const handleSave = useCallback(async (property) => {
    if (isAuthenticated) {
      try {
        const res = await base44.functions.invoke('toggleSavedProperty', { property_id: property.id });
        setSavedIds((prev) => res.data.saved ? [...prev, property.id] : prev.filter((id) => id !== property.id));
      } catch { /* ignore */ }
    } else {
      setSavedIds((prev) => {
        const next = prev.includes(property.id) ? prev.filter((id) => id !== property.id) : [...prev, property.id];
        localStorage.setItem(SAVE_KEY, JSON.stringify(next));
        return next;
      });
    }
  }, [isAuthenticated]);

  const clearFilters = () => setFilters({ ...defaultFilters });

  const retrySearch = () => {
    // Trigger a re-fetch by creating a new filters object reference
    setFilters({ ...filters });
  };

  const activeFilterCount = [
    filters.keyword, filters.state, filters.lga, filters.propertyType, filters.purpose,
    filters.priceRange, filters.bedrooms, filters.bathrooms, filters.classification,
    ...(filters.amenities || []),
    filters.featured && 'featured', filters.jointVenture && 'jointVenture',
  ].filter(Boolean).length;

  return (
    <section id="explore" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold text-brand-900">Explore Properties</h2>
          <p className="mt-0.5 text-sm text-muted-foreground" aria-live="polite">
            {loading ? 'Searching…' : error ? 'Search failed' : `${count} ${count === 1 ? 'property' : 'properties'} found`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Filter sidebar - desktop */}
        <aside className="hidden w-64 shrink-0 lg:block" aria-label="Property filters">
          <div className="sticky top-20">
            <MarketplaceFilters filters={filters} setFilters={setFilters} propertyTypes={propertyTypes} onClear={clearFilters} />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(true)} className="border-border lg:hidden" aria-label="Open filter panel">
              <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="hidden text-xs text-flame-600 hover:underline lg:block">
                Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
              </button>
            )}
            <label className="sr-only" htmlFor="marketplace-sort">Sort order</label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger id="marketplace-sort" className="ml-auto h-9 w-44 border-border bg-white text-sm" aria-label="Sort properties">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MARKETPLACE_SORTS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20" role="status" aria-live="polite">
              <Loader2 className="h-8 w-8 animate-spin text-flame-500" />
              <p className="mt-3 text-sm text-muted-foreground">Loading property advertisements…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-error/20 bg-error/5 py-16 text-center" role="alert">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
                <AlertCircle className="h-7 w-7 text-error" />
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold text-brand-900">Search Failed</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>
              <Button onClick={retrySearch} variant="outline" className="mt-5 border-brand-200 hover:bg-brand-50">
                <RotateCcw className="mr-1.5 h-4 w-4" /> Retry Search
              </Button>
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((p) => (
                  <PropertyAdCard key={p.id} property={p} onSave={handleSave} isSaved={savedIds.includes(p.id)} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button onClick={loadMore} variant="outline" disabled={loadingMore}
                    className="border-brand-200 px-8 hover:bg-brand-50">
                    {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</> : 'Load More Properties'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
                <Inbox className="h-7 w-7 text-brand-300" />
              </div>
              <h3 className="mt-4 font-heading text-base font-semibold text-brand-900">No Properties Found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {activeFilterCount > 0
                  ? 'Try adjusting your search filters or exploring a different area.'
                  : 'Property advertisements will appear here as soon as agents list on the PQNL Marketplace.'}
              </p>
              {activeFilterCount > 0 ? (
                <Button onClick={clearFilters} variant="outline" className="mt-5 border-brand-200 hover:bg-brand-50">
                  Clear All Filters
                </Button>
              ) : (
                <Button asChild className="mt-5 bg-flame-500 text-white hover:bg-flame-600">
                  <Link to="/submit">Be the first to list</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter panel">
          <div className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[#fbfaf9] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-base font-bold text-brand-900">Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} aria-label="Close filter panel"><X className="h-5 w-5" /></Button>
            </div>
            <MarketplaceFilters filters={filters} setFilters={setFilters} propertyTypes={propertyTypes} onClear={clearFilters} />
            <Button onClick={() => setShowFilters(false)} className="mt-3 w-full bg-flame-500 text-white hover:bg-flame-600">
              Show {count} Results
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}