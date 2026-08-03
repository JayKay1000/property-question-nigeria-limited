import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Loader2, Inbox, X, Star, TrendingUp, Maximize, Grid3x3, MapPin, ArrowRight, Award, Users, HardHat, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { PROJECT_SORT_OPTIONS, PUBLIC_PROJECT_STATUSES, buildShortLocation, getProjectImage, formatNumber, formatPrice } from '@/lib/project-utils';
import { Image } from '@/components/ui/image';
import ProjectSearchBar from '@/components/projects/ProjectSearchBar';
import ProjectFilterPanel from '@/components/projects/ProjectFilterPanel';
import ProjectCard from '@/components/projects/ProjectCard';
import ProjectCompareBar from '@/components/projects/ProjectCompareBar';

const PAGE_SIZE = 9;
const SAVE_KEY = 'pq_saved_projects';
const COMPARE_KEY = 'pq_compare_projects';

const defaultFilters = {
  keyword: '', state: '', category: '', status: '',
  priceRange: '', priceMin: undefined, priceMax: undefined,
  minCompletion: undefined, featured: false, hasAvailable: false, buy2flip: false,
};

export default function Projects() {
  const [searchParams] = useSearchParams();
  const [allProjects, setAllProjects] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [savedIds, setSavedIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [compareProjects, setCompareProjects] = useState([]);

  useEffect(() => {
    setSavedIds(JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'));
    setCompareIds(JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]'));
  }, []);

  useEffect(() => {
    base44.entities.LookupState.list('sort_order', 100).catch(() => []).then(setStates);
  }, []);

  useEffect(() => {
    setLoading(true);
    base44.entities.Project.filter({ visibility: 'public' }, '-created_date', 200)
      .then((results) => setAllProjects(results.filter((p) => PUBLIC_PROJECT_STATUSES.includes(p.status))))
      .catch(() => setAllProjects([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    const loc = searchParams.get('loc');
    const status = searchParams.get('status');
    setFilters((prev) => ({ ...prev, category: cat || '', keyword: loc || '', status: status || '' }));
  }, [searchParams]);

  useEffect(() => {
    if (compareIds.length === 0) { setCompareProjects([]); return; }
    Promise.all(compareIds.map((id) => base44.entities.Project.get(id).catch(() => null)))
      .then((ps) => setCompareProjects(ps.filter(Boolean)));
  }, [compareIds]);

  const featuredProjects = useMemo(() => allProjects.filter((p) => p.is_featured).slice(0, 3), [allProjects]);

  const filtered = useMemo(() => {
    let result = [...allProjects];
    const f = filters;
    if (f.keyword) {
      const kw = f.keyword.toLowerCase();
      result = result.filter((p) =>
        p.name?.toLowerCase().includes(kw) ||
        p.reference_number?.toLowerCase().includes(kw) ||
        p.location_city?.toLowerCase().includes(kw) ||
        p.location_state?.toLowerCase().includes(kw) ||
        p.short_description?.toLowerCase().includes(kw)
      );
    }
    if (f.state) result = result.filter((p) => p.location_state === f.state);
    if (f.category) result = result.filter((p) => p.project_category === f.category || p.project_type === f.category);
    if (f.status) result = result.filter((p) => p.status === f.status);
    if (f.priceMin != null) result = result.filter((p) => (p.budget_ngn || 0) >= f.priceMin);
    if (f.priceMax != null) result = result.filter((p) => (p.budget_ngn || Infinity) <= f.priceMax);
    if (f.minCompletion) result = result.filter((p) => (p.progress_percentage || 0) >= f.minCompletion);
    if (f.featured) result = result.filter((p) => p.is_featured);
    if (f.hasAvailable) result = result.filter((p) => (p.units_available || 0) > 0);

    switch (sort) {
      case 'newest': result.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)); break;
      case 'oldest': result.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)); break;
      case 'featured': result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0)); break;
      case 'progress_high': result.sort((a, b) => (b.progress_percentage || 0) - (a.progress_percentage || 0)); break;
      case 'progress_low': result.sort((a, b) => (a.progress_percentage || 0) - (b.progress_percentage || 0)); break;
      case 'plots_available': result.sort((a, b) => (b.units_available || 0) - (a.units_available || 0)); break;
    }
    return result;
  }, [allProjects, filters, sort]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  useEffect(() => { setPage(1); }, [filters, sort]);

  const handleSave = useCallback((project) => {
    setSavedIds((prev) => {
      const next = prev.includes(project.id) ? prev.filter((id) => id !== project.id) : [...prev, project.id];
      localStorage.setItem(SAVE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const handleCompare = useCallback((project) => {
    setCompareIds((prev) => {
      let next;
      if (prev.includes(project.id)) next = prev.filter((id) => id !== project.id);
      else if (prev.length >= 4) next = [...prev.slice(1), project.id];
      else next = [...prev, project.id];
      localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const activeFilterCount = [
    filters.keyword, filters.state, filters.category, filters.status,
    filters.priceRange, filters.minCompletion,
    filters.featured && 'featured', filters.hasAvailable && 'hasAvailable', filters.buy2flip && 'buy2flip',
  ].filter(Boolean).length;

  const stats = [
    { icon: Building2, label: 'Active Projects', value: allProjects.length },
    { icon: Grid3x3, label: 'Total Plots', value: allProjects.reduce((s, p) => s + (p.total_units || 0), 0) },
    { icon: TrendingUp, label: 'Available Plots', value: allProjects.reduce((s, p) => s + (p.units_available || 0), 0) },
    { icon: Award, label: 'Completed', value: allProjects.filter((p) => p.status === 'completed').length },
  ];

  return (
    <div className="min-h-screen bg-ice-50 pb-20 pt-24 lg:pt-28">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900 pb-12 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800" />
        <div className="container-wide section-pad relative">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-flame-500/20 px-3 py-1 text-xs font-semibold text-flame-300">
              <Star className="h-3 w-3 fill-flame-400" /> Enterprise Estate Developments
            </span>
            <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
              Discover Nigeria's <span className="text-flame-500">Premier</span> Estate Developments
            </h1>
            <p className="mt-4 text-lg text-white/70">
              Explore master-planned communities, track construction progress, visualize plot layouts, and invest in verified estate projects across all 36 states.
            </p>
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

      {/* Featured developments */}
      {featuredProjects.length > 0 && !loading && (
        <section className="container-wide section-pad mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-brand-900">
              <Star className="h-5 w-5 fill-flame-500 text-flame-500" /> Featured Developments
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {featuredProjects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="group block overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card transition hover:shadow-card-hover">
                <div className="relative aspect-[16/9] overflow-hidden">
                  {getProjectImage(p) ? (
                    <Image src={getProjectImage(p)} alt={p.name} fittingType="fill" className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-950"><Building2 className="h-10 w-10 text-brand-400" /></div>
                  )}
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-flame-500 px-2.5 py-1 text-xs font-semibold text-white">
                    <Star className="h-3 w-3 fill-white" /> Featured
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-heading text-lg font-bold text-brand-900 group-hover:text-flame-600">{p.name}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{buildShortLocation(p) || 'Nigeria'}</p>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{p.short_description || (p.description ? p.description.slice(0, 120) + '…' : '')}</p>
                  <div className="mt-3 flex items-center justify-between">
                    {p.budget_ngn != null ? (
                      <div><p className="text-[10px] uppercase text-muted-foreground">From</p><p className="font-heading text-lg font-bold text-flame-600">{formatPrice(p.budget_ngn)}</p></div>
                    ) : <span className="text-sm text-muted-foreground">Price on request</span>}
                    <span className="flex items-center gap-1 text-sm font-medium text-flame-600">View <ArrowRight className="h-4 w-4" /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Search */}
      <section className="container-wide section-pad mt-10">
        <ProjectSearchBar filters={filters} setFilters={setFilters} states={states} projectTypes={[]} onSearch={() => setPage(1)} />
      </section>

      {/* Main layout */}
      <section className="container-wide section-pad mt-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-28">
              <ProjectFilterPanel filters={filters} setFilters={setFilters} onClear={() => setFilters({ ...defaultFilters })} />
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-lg font-bold text-brand-900">
                  {loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'Project' : 'Projects'} Found`}
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
                    {PROJECT_SORT_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-10 w-10 animate-spin text-flame-500" />
                <p className="mt-4 text-sm text-muted-foreground">Loading projects...</p>
              </div>
            ) : visible.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((p) => (
                    <ProjectCard key={p.id} project={p} onSave={handleSave} isSaved={savedIds.includes(p.id)} onCompare={handleCompare} isCompared={compareIds.includes(p.id)} />
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-8 flex justify-center">
                    <Button onClick={() => setPage((p) => p + 1)} variant="outline" size="lg" className="border-brand-200 px-8 hover:bg-brand-50">Load More Projects</Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ice-100"><Inbox className="h-8 w-8 text-brand-300" /></div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-brand-900">No Projects Found</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">Try adjusting your search filters or exploring different locations.</p>
                <Button onClick={() => setFilters({ ...defaultFilters })} variant="outline" className="mt-6 border-brand-200">Clear All Filters</Button>
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
            <ProjectFilterPanel filters={filters} setFilters={setFilters} onClear={() => setFilters({ ...defaultFilters })} />
            <Button onClick={() => setShowFilters(false)} className="mt-4 w-full bg-flame-500 hover:bg-flame-600">Show {filtered.length} Results</Button>
          </div>
        </div>
      )}

      <ProjectCompareBar projects={compareProjects}
        onRemove={(id) => setCompareIds((prev) => { const next = prev.filter((pid) => pid !== id); localStorage.setItem(COMPARE_KEY, JSON.stringify(next)); return next; })}
        onClear={() => { setCompareIds([]); localStorage.setItem(COMPARE_KEY, '[]'); }} />
    </div>
  );
}