import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, Inbox, X, SlidersHorizontal, Star, Eye, Navigation, Clock, CheckCircle2, Play, ArrowRight, MapPin, Building2, Video, Camera, Box, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { TOUR_SORT_OPTIONS, formatNumber } from '@/lib/tour-utils';
import { ACTIVE_STATUSES } from '@/lib/property-utils';
import TourSearchBar from '@/components/tours/TourSearchBar';
import TourFilterPanel from '@/components/tours/TourFilterPanel';
import TourCard from '@/components/tours/TourCard';

const PAGE_SIZE = 9;
const SAVE_KEY = 'pq_saved_tours';

const defaultFilters = {
  keyword: '', state: '', tourType: '', propertyType: '',
  bedrooms: undefined, featured: false, has360: false, hasDrone: false,
};

const benefitIcons = { Clock, Eye, Navigation, CheckCircle2 };

export default function Tours() {
  const [searchParams] = useSearchParams();
  const [tours, setTours] = useState([]);
  const [properties, setProperties] = useState({});
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    setSavedIds(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
  }, []);

  useEffect(() => {
    base44.entities.LookupState.list('sort_order', 100).catch(() => []).then(setStates);
  }, []);

  // Fetch virtual tours
  useEffect(() => {
    setLoading(true);
    base44.entities.VirtualTour.list('-created_date', 200)
      .then((results) => setTours(results))
      .catch(() => setTours([]))
      .finally(() => setLoading(false));
  }, []);

  // Batch-fetch associated properties
  useEffect(() => {
    if (tours.length === 0) return;
    const propIds = [...new Set(tours.map((t) => t.property_id).filter(Boolean))];
    Promise.all(propIds.map((id) => base44.entities.Property.get(id).catch(() => null)))
      .then((props) => {
        const map = {};
        props.filter(Boolean).forEach((p) => { map[p.id] = p; });
        setProperties(map);
      });
  }, [tours]);

  useEffect(() => {
    const type = searchParams.get('type');
    const loc = searchParams.get('loc');
    setFilters((prev) => ({ ...prev, tourType: type || '', keyword: loc || '' }));
  }, [searchParams]);

  const toursWithProps = useMemo(() =>
    tours.map((t) => ({ tour: t, property: properties[t.property_id] })).filter((tp) => tp.property),
    [tours, properties]);

  const filtered = useMemo(() => {
    let result = [...toursWithProps];
    const f = filters;
    if (f.keyword) {
      const kw = f.keyword.toLowerCase();
      result = result.filter(({ tour, property }) =>
        property?.title?.toLowerCase().includes(kw) ||
        property?.reference_number?.toLowerCase().includes(kw) ||
        property?.city?.toLowerCase().includes(kw) ||
        property?.state?.toLowerCase().includes(kw) ||
        tour?.title?.toLowerCase().includes(kw)
      );
    }
    if (f.state) result = result.filter(({ property }) => property?.state === f.state);
    if (f.tourType) result = result.filter(({ tour }) => tour?.tour_type === f.tourType);
    if (f.propertyType) result = result.filter(({ property }) => property?.property_type === f.propertyType);
    if (f.bedrooms) result = result.filter(({ property }) => (property?.bedrooms || 0) >= f.bedrooms);
    if (f.featured) result = result.filter(({ property }) => property?.is_featured);

    switch (sort) {
      case 'newest': result.sort((a, b) => new Date(b.tour.created_date) - new Date(a.tour.created_date)); break;
      case 'oldest': result.sort((a, b) => new Date(a.tour.created_date) - new Date(b.tour.created_date)); break;
      case 'featured': result.sort((a, b) => (b.property?.is_featured ? 1 : 0) - (a.property?.is_featured ? 1 : 0)); break;
      case 'price_low': result.sort((a, b) => (a.property?.price || 0) - (b.property?.price || 0)); break;
      case 'price_high': result.sort((a, b) => (b.property?.price || 0) - (a.property?.price || 0)); break;
    }
    return result;
  }, [toursWithProps, filters, sort]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  useEffect(() => { setPage(1); }, [filters, sort]);

  const handleSave = useCallback((tour) => {
    setSavedIds((prev) => {
      const next = prev.includes(tour.id) ? prev.filter((id) => id !== tour.id) : [...prev, tour.id];
      localStorage.setItem(SAVE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleShare = useCallback((tour) => {
    if (navigator.share) navigator.share({ title: tour.title || 'Property Tour', url: window.location.origin + '/tours/' + tour.id });
  }, []);

  const activeFilterCount = [
    filters.keyword, filters.state, filters.tourType, filters.propertyType,
    filters.bedrooms, filters.featured && 'featured', filters.has360 && 'has360', filters.hasDrone && 'hasDrone',
  ].filter(Boolean).length;

  const stats = [
    { icon: Eye, label: 'Virtual Tours', value: tours.length },
    { icon: Building2, label: 'Properties with Tours', value: Object.keys(properties).length },
    { icon: Navigation, label: '360° Experiences', value: tours.filter((t) => t.tour_type === '360_tour').length },
    { icon: Video, label: 'Video Tours', value: tours.filter((t) => t.tour_type === 'guided_tour').length },
  ];

  const tourTypes = [
    { icon: Eye, label: '360° Tours', desc: 'Immersive panoramic views', color: 'text-info' },
    { icon: Box, label: 'VR Tours', desc: 'Virtual reality experiences', color: 'text-brand-700' },
    { icon: Scan, label: 'Panoramas', desc: 'Wide-angle property views', color: 'text-flame-500' },
    { icon: Navigation, label: 'Guided Tours', desc: 'Hosted walkthrough videos', color: 'text-success' },
    { icon: Camera, label: 'Drone Flyovers', desc: 'Aerial estate footage', color: 'text-purple-600' },
    { icon: Play, label: 'Video Tours', desc: 'Cinematic property videos', color: 'text-flame-600' },
  ];

  return (
    <div className="min-h-screen bg-ice-50 pb-20 pt-24 lg:pt-28">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900 pb-14 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800" />
        <div className="container-wide section-pad relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-flame-500/20 px-3 py-1 text-xs font-semibold text-flame-300">
              <Play className="h-3 w-3 fill-flame-400" /> Immersive Virtual Experience
            </span>
            <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
              Explore Properties <span className="text-flame-500">Virtually</span>
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Take immersive 360° tours, drone flyovers, and guided walkthroughs of premium properties across Nigeria — anytime, anywhere.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="bg-flame-500 hover:bg-flame-600">
                <a href="#tours-grid"><Play className="mr-2 h-4 w-4 fill-white" /> Browse Tours</a>
              </Button>
              <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20" asChild>
                <Link to="/properties"><Building2 className="mr-2 h-4 w-4" /> View Listings</Link>
              </Button>
            </div>
          </div>
          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <s.icon className="h-5 w-5 text-flame-400" />
                <p className="mt-2 font-heading text-2xl font-bold text-white">{formatNumber(s.value)}</p>
                <p className="text-xs text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tour types */}
      <section className="container-wide section-pad mt-10">
        <h2 className="mb-5 font-heading text-xl font-bold text-brand-900">Tour Experiences</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {tourTypes.map((t, i) => (
            <div key={i} className="rounded-xl border border-brand-100 bg-white p-4 text-center transition hover:border-flame-200 hover:shadow-card">
              <t.icon className={`mx-auto h-8 w-8 ${t.color}`} />
              <p className="mt-2 text-sm font-semibold text-brand-900">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="container-wide section-pad mt-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Clock, title: 'Explore Anytime', desc: 'Visit properties 24/7 — no appointment needed.' },
            { icon: Eye, title: 'Full Immersion', desc: '360° views and drone footage give the full picture.' },
            { icon: Navigation, title: 'Room-by-Room', desc: 'Navigate naturally between spaces and scenes.' },
            { icon: CheckCircle2, title: 'Informed Decisions', desc: 'Experience before booking physical inspections.' },
          ].map((b, i) => (
            <div key={i} className="rounded-xl border border-brand-100 bg-ice-50 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-flame-50 text-flame-600"><b.icon className="h-5 w-5" /></div>
              <h3 className="mt-3 font-heading text-sm font-bold text-brand-900">{b.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Search */}
      <section className="container-wide section-pad mt-10">
        <TourSearchBar filters={filters} setFilters={setFilters} states={states} onSearch={() => setPage(1)} />
      </section>

      {/* Main layout */}
      <section id="tours-grid" className="container-wide section-pad mt-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-28">
              <TourFilterPanel filters={filters} setFilters={setFilters} onClear={() => setFilters({ ...defaultFilters })} />
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-brand-900">
                  {loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'Tour' : 'Tours'} Available`}
                </h2>
                {activeFilterCount > 0 && (
                  <button onClick={() => setFilters({ ...defaultFilters })} className="text-xs text-flame-600 hover:underline">
                    Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowFilters(true)} className="border-brand-200 lg:hidden">
                  <SlidersHorizontal className="mr-1.5 h-4 w-4" /> Filters
                </Button>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="h-9 w-48 border-brand-200 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TOUR_SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-10 w-10 animate-spin text-flame-500" />
                <p className="mt-4 text-sm text-muted-foreground">Loading tours...</p>
              </div>
            ) : visible.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map(({ tour, property }) => (
                    <TourCard key={tour.id} tour={tour} property={property} onSave={handleSave} isSaved={savedIds.includes(tour.id)} onShare={handleShare} />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <Button onClick={() => setPage((p) => p + 1)} variant="outline" size="lg" className="border-brand-200 px-8 hover:bg-brand-50">Load More Tours</Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ice-100"><Eye className="h-8 w-8 text-brand-300" /></div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-brand-900">No Virtual Tours Yet</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">Virtual tours will appear here once they're published. Browse our property listings in the meantime.</p>
                <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
                  <Link to="/properties"><Building2 className="mr-2 h-4 w-4" /> Browse Properties</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-wide section-pad mt-12">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 p-8 text-center sm:p-12">
          <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">Ready for a Physical Visit?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/70">After exploring virtually, book a guided site inspection with our property consultants.</p>
          <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
            <Link to="/properties"><MapPin className="mr-2 h-4 w-4" /> Book a Site Inspection <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
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
            <TourFilterPanel filters={filters} setFilters={setFilters} onClear={() => setFilters({ ...defaultFilters })} />
            <Button onClick={() => setShowFilters(false)} className="mt-4 w-full bg-flame-500 hover:bg-flame-600">Show {filtered.length} Tours</Button>
          </div>
        </div>
      )}
    </div>
  );
}