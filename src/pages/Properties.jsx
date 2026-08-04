import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, LayoutGrid, Map as MapIcon, Loader2, Building2, X, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { SORT_OPTIONS, ACTIVE_STATUSES } from '@/lib/property-utils';
import SearchBar from '@/components/properties/SearchBar';
import FilterPanel from '@/components/properties/FilterPanel';
import ListingCard from '@/components/properties/ListingCard';
import CompareTray from '@/components/properties/CompareTray';

const PAGE_SIZE = 12;
const SAVE_KEY = 'pq_saved_properties';
const COMPARE_KEY = 'pq_compare_properties';

const defaultFilters = {
  keyword: '', state: '', lga: '', propertyType: '', purpose: '',
  priceRange: '', priceMin: undefined, priceMax: undefined,
  bedrooms: undefined, bathrooms: undefined,
  classification: undefined, amenities: [],
  featured: false, exclusive: false, verified: false,
};

export default function Properties() {
  const [searchParams] = useSearchParams();
  const [allProperties, setAllProperties] = useState([]);
  const [states, setStates] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [compareProperties, setCompareProperties] = useState([]);

  // Load saved & compare from localStorage
  useEffect(() => {
    setSavedIds(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
    setCompareIds(JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]'));
  }, []);

  // Fetch lookup data
  useEffect(() => {
    Promise.all([
      base44.entities.LookupState.list('sort_order', 100).catch(() => []),
      base44.entities.LookupPropertyType.list('sort_order', 50).catch(() => []),
    ]).then(([s, t]) => { setStates(s); setPropertyTypes(t); });
  }, []);

  // Fetch properties
  useEffect(() => {
    setLoading(true);
    base44.entities.Property.filter({ visibility: 'public' }, '-created_date', 200)
      .then((results) => {
        setAllProperties(results.filter((p) => ACTIVE_STATUSES.includes(p.status)));
      })
      .catch(() => setAllProperties([]))
      .finally(() => setLoading(false));
  }, []);

  // Apply URL params on mount
  useEffect(() => {
    const type = searchParams.get('type');
    const loc = searchParams.get('loc');
    const tag = searchParams.get('tag');
    setFilters((prev) => ({
      ...prev,
      propertyType: type || '',
      keyword: loc || '',
      classification: tag === 'luxury' ? 'luxury' : tag === 'new' ? '' : prev.classification,
    }));
  }, [searchParams]);

  // Fetch compare property details
  useEffect(() => {
    if (compareIds.length === 0) { setCompareProperties([]); return; }
    Promise.all(compareIds.map((id) => base44.entities.Property.get(id).catch(() => null)))
      .then((props) => setCompareProperties(props.filter(Boolean)));
  }, [compareIds]);

  // Filter + sort (memoized)
  const filtered = useMemo(() => {
    let result = [...allProperties];
    const f = filters;
    if (f.keyword) {
      const kw = f.keyword.toLowerCase();
      result = result.filter((p) =>
        p.title?.toLowerCase().includes(kw) ||
        p.reference_number?.toLowerCase().includes(kw) ||
        p.city?.toLowerCase().includes(kw) ||
        p.state?.toLowerCase().includes(kw) ||
        p.estate?.toLowerCase().includes(kw)
      );
    }
    if (f.state) result = result.filter((p) => p.state === f.state);
    if (f.lga) result = result.filter((p) => p.lga === f.lga);
    if (f.propertyType) result = result.filter((p) => p.property_type === f.propertyType);
    if (f.purpose) result = result.filter((p) => p.listing_purpose === f.purpose);
    if (f.priceMin != null) result = result.filter((p) => (p.price || 0) >= f.priceMin);
    if (f.priceMax != null) result = result.filter((p) => (p.price || 0) <= f.priceMax);
    if (f.bedrooms) result = result.filter((p) => (p.bedrooms || 0) >= f.bedrooms);
    if (f.bathrooms) result = result.filter((p) => (p.bathrooms || 0) >= f.bathrooms);
    if (f.classification) result = result.filter((p) => p.property_classification === f.classification);
    if (f.amenities?.length) result = result.filter((p) => f.amenities.every((a) => p.amenities?.includes(a)));
    if (f.featured) result = result.filter((p) => p.is_featured);
    if (f.exclusive) result = result.filter((p) => p.is_exclusive);
    if (f.verified) result = result.filter((p) => p.verified);

    switch (sort) {
      case 'newest': result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)); break;
      case 'oldest': result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)); break;
      case 'price_low': result.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price_high': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case 'featured': result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)); break;
      case 'most_viewed': result.sort((a, b) => (b.view_count || 0) - (a.view_count || 0)); break;
      case 'most_saved': result.sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0)); break;
    }
    return result;
  }, [allProperties, filters, sort]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filters, sort]);

  const handleSave = useCallback((property) => {
    setSavedIds((prev) => {
      const next = prev.includes(property.id)
        ? prev.filter((id) => id !== property.id)
        : [...prev, property.id];
      localStorage.setItem(SAVE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleCompare = useCallback((property) => {
    setCompareIds((prev) => {
      let next;
      if (prev.includes(property.id)) {
        next = prev.filter((id) => id !== property.id);
      } else if (prev.length >= 4) {
        next = [...prev.slice(1), property.id];
      } else {
        next = [...prev, property.id];
      }
      localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const activeFilterCount = [
    filters.keyword, filters.state, filters.lga, filters.propertyType, filters.purpose,
    filters.priceRange, filters.bedrooms, filters.bathrooms, filters.classification,
    ...(filters.amenities || []),
    filters.featured && 'featured', filters.exclusive && 'exclusive', filters.verified && 'verified',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-ice-50 pb-20 pt-24 lg:pt-28">
      {/* Hero Search */}
      <section className="relative overflow-hidden bg-brand-900 pb-8 pt-12">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 to-brand-800" />
        <div className="container-wide section-pad relative">
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Find Your <span className="text-flame-500">Dream Property</span>
          </h1>
          <p className="mt-2 text-white/70">Search from our premium collection of properties across Nigeria</p>
        </div>
      </section>

      <section className="container-wide section-pad -mt-8 relative z-10">
        <SearchBar filters={filters} setFilters={setFilters} states={states} propertyTypes={propertyTypes} onSearch={() => setPage(1)} />
      </section>

      {/* Main Layout */}
      <section className="container-wide section-pad mt-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filter sidebar - desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28">
              <FilterPanel filters={filters} setFilters={setFilters} propertyTypes={propertyTypes}
                onClear={() => setFilters({ ...defaultFilters })} />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-brand-900">
                  {loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'Property' : 'Properties'} Found`}
                </h2>
                {activeFilterCount > 0 && (
                  <button onClick={() => setFilters({ ...defaultFilters })}
                    className="text-xs text-flame-600 hover:underline">
                    Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(true)} className="lg:hidden border-brand-200">
                  <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
                </Button>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="h-9 w-48 border-brand-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-10 w-10 animate-spin text-flame-500" />
                <p className="mt-4 text-sm text-muted-foreground">Loading properties...</p>
              </div>
            ) : visible.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((p) => (
                    <ListingCard key={p.id} property={p}
                      onSave={handleSave} isSaved={savedIds.includes(p.id)}
                      onCompare={handleCompare} isCompared={compareIds.includes(p.id)} />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <Button onClick={() => setPage((p) => p + 1)} variant="outline" size="lg"
                      className="border-brand-200 px-8 hover:bg-brand-50">
                      Load More Properties
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ice-100">
                  <Inbox className="h-8 w-8 text-brand-300" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-brand-900">No Properties Found</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Try adjusting your search filters or exploring different locations.
                </p>
                <Button onClick={() => setFilters({ ...defaultFilters })} variant="outline" className="mt-6 border-brand-200">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-brand-900">Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}><X className="h-5 w-5" /></Button>
            </div>
            <FilterPanel filters={filters} setFilters={setFilters} propertyTypes={propertyTypes}
              onClear={() => setFilters({ ...defaultFilters })} />
            <Button onClick={() => setShowFilters(false)} className="mt-4 w-full bg-flame-500 hover:bg-flame-600">
              Show {filtered.length} Results
            </Button>
          </div>
        </div>
      )}

      {/* Compare tray */}
      <CompareTray properties={compareProperties}
        onRemove={(id) => setCompareIds((prev) => {
          const next = prev.filter((pid) => pid !== id);
          localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
          return next;
        })}
        onClear={() => { setCompareIds([]); localStorage.setItem(COMPARE_KEY, '[]'); }} />
    </div>
  );
}