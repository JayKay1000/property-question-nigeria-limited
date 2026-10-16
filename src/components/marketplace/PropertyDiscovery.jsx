import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Inbox, SlidersHorizontal, X, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { ACTIVE_STATUSES, SORT_OPTIONS } from '@/lib/property-utils';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import PropertyAdCard from './PropertyAdCard';
import MarketplaceFilters from './MarketplaceFilters';

const PAGE_SIZE = 12;
const SAVE_KEY = 'pq_saved_properties';
const MARKETPLACE_SORTS = SORT_OPTIONS.filter((s) => ['newest', 'price_low', 'price_high', 'featured', 'most_viewed', 'most_saved'].includes(s.value));

const SORT_MAP = {
  newest: '-created_date',
  oldest: 'created_date',
  price_low: 'price',
  price_high: '-price',
  featured: '-is_featured',
  most_viewed: '-view_count',
  most_saved: '-favorite_count',
};

function buildQuery(filters) {
  const query = { visibility: 'public', status: { $in: ACTIVE_STATUSES } };
  if (filters.purpose) query.listing_purpose = filters.purpose;
  if (filters.propertyType) query.property_type = filters.propertyType;
  if (filters.state) query.state = filters.state;
  if (filters.lga) query.lga = filters.lga;
  if (filters.priceMin != null || filters.priceMax != null) {
    query.price = {};
    if (filters.priceMin != null) query.price.$gte = filters.priceMin;
    if (filters.priceMax != null) query.price.$lte = filters.priceMax;
  }
  if (filters.bedrooms) query.bedrooms = { $gte: filters.bedrooms };
  if (filters.bathrooms) query.bathrooms = { $gte: filters.bathrooms };
  if (filters.classification) query.property_classification = filters.classification;
  if (filters.featured) query.is_featured = true;
  if (filters.jointVenture) query.is_joint_venture = true;
  if (filters.amenities?.length) query.amenities = { $all: filters.amenities };
  if (filters.keyword) {
    const kw = filters.keyword;
    query.$or = [
      { title: { $regex: kw, $options: 'i' } },
      { reference_number: { $regex: kw, $options: 'i' } },
      { city: { $regex: kw, $options: 'i' } },
      { estate: { $regex: kw, $options: 'i' } },
    ];
  }
  return query;
}

export default function PropertyDiscovery({ filters, setFilters, sort, setSort, propertyTypes }) {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSavedIds(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
  }, []);

  // Fetch first page on filter/sort change
  useEffect(() => {
    let active = true;
    setLoading(true);
    const query = buildQuery(filters);
    const sortKey = SORT_MAP[sort] || '-created_date';
    Promise.all([
      base44.entities.Property.filter(query, { sort: sortKey, limit: PAGE_SIZE }),
      base44.entities.Property.count(query),
    ]).then(([page, total]) => {
      if (!active) return;
      setItems(page.items || []);
      setCursor(page.next_cursor || null);
      setHasMore(!!page.has_more);
      setCount(total || 0);
    }).catch(() => {
      if (!active) return;
      setItems([]); setCount(0); setHasMore(false);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [filters, sort]);

  const loadMore = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const query = buildQuery(filters);
      const sortKey = SORT_MAP[sort] || '-created_date';
      const page = await base44.entities.Property.filter(query, { sort: sortKey, limit: PAGE_SIZE, cursor });
      setItems((prev) => [...prev, ...(page.items || [])]);
      setCursor(page.next_cursor || null);
      setHasMore(!!page.has_more);
    } catch { /* ignore */ }
    setLoadingMore(false);
  };

  const handleSave = useCallback((property) => {
    setSavedIds((prev) => {
      const next = prev.includes(property.id) ? prev.filter((id) => id !== property.id) : [...prev, property.id];
      localStorage.setItem(SAVE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearFilters = () => setFilters({ keyword: '', state: '', lga: '', propertyType: '', purpose: '', priceRange: '', priceMin: undefined, priceMax: undefined, bedrooms: undefined, bathrooms: undefined, classification: undefined, amenities: [], featured: false, jointVenture: false });

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
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading ? 'Searching…' : `${count} ${count === 1 ? 'property' : 'properties'} found`}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Filter sidebar - desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20">
            <MarketplaceFilters filters={filters} setFilters={setFilters} propertyTypes={propertyTypes} onClear={clearFilters} />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(true)} className="border-border lg:hidden">
              <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="hidden text-xs text-flame-600 hover:underline lg:block">
                Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
              </button>
            )}
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="ml-auto h-9 w-44 border-border bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MARKETPLACE_SORTS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-flame-500" />
              <p className="mt-3 text-sm text-muted-foreground">Loading property advertisements…</p>
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
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[#fbfaf9] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-heading text-base font-bold text-brand-900">Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></Button>
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