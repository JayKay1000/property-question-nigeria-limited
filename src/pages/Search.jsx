import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, Map, List, ArrowRight, Search as SearchIcon, Sparkles } from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';
import SearchFilterPanel from '@/components/search/SearchFilterPanel';
import ResultCard from '@/components/search/ResultCard';
import SavedSearches from '@/components/search/SavedSearches';
import SearchHistory from '@/components/search/SearchHistory';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { SEARCH_TABS, SORT_OPTIONS, searchAll, sortResults, logSearch, addSearchHistory } from '@/lib/search-utils';

const EMPTY_FILTERS = { propertyType: '', classification: '', minPrice: '', maxPrice: '', bedrooms: '', bathrooms: '', state: '', city: '', featured: false, buy2flip: false };

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [filters, setFilters] = useState({ ...EMPTY_FILTERS });
  const [activeTab, setActiveTab] = useState(params.get('type') || 'all');
  const [sort, setSort] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [results, setResults] = useState({ properties: [], projects: [], agents: [], total: 0, durationMs: 0 });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const loggedRef = useRef(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const doSearch = useCallback(async (q, f) => {
    setLoading(true);
    try {
      const res = await searchAll(q, f);
      setResults(res);
      if (!loggedRef.current) {
        addSearchHistory(q);
        logSearch({ query: q, filters: f, resultsCount: res.total, durationMs: res.durationMs, userId: user?.id });
        loggedRef.current = true;
      }
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => {
    const q = params.get('q') || '';
    setQuery(q);
    loggedRef.current = false;
    if (q) doSearch(q, filters);
    else { setResults({ properties: [], projects: [], agents: [], total: 0, durationMs: 0 }); setLoading(false); }
  }, [params]);

  useEffect(() => {
    if (query) doSearch(query, filters);
  }, [filters, doSearch]);

  const handleSearch = (q) => {
    setQuery(q);
    setParams({ q, type: activeTab !== 'all' ? activeTab : undefined });
  };

  const handleClearFilters = () => { setFilters({ ...EMPTY_FILTERS }); };

  const handleTrack = (resultId, resultType) => {
    logSearch({ query, filters, userId: user?.id, clickedResultId: resultId, clickedResultType: resultType });
  };

  // Combine and sort results per tab
  const sortedProps = sortResults(results.properties, sort);
  const sortedProjects = sortResults(results.projects, sort);
  const sortedAgents = sortResults(results.agents, sort);
  const allResults = [...sortedProps.map((p) => ({ ...p, _type: 'properties' })), ...sortedProjects.map((p) => ({ ...p, _type: 'projects' })), ...sortedAgents.map((a) => ({ ...a, _type: 'agents' }))];

  const tabCounts = {
    all: allResults.length,
    properties: sortedProps.length,
    projects: sortedProjects.length,
    agents: sortedAgents.length,
    locations: 0,
  };

  const displayResults = activeTab === 'all' ? allResults : activeTab === 'properties' ? sortedProps.map((p) => ({ ...p, _type: 'properties' })) : activeTab === 'projects' ? sortedProjects.map((p) => ({ ...p, _type: 'projects' })) : activeTab === 'agents' ? sortedAgents.map((a) => ({ ...a, _type: 'agents' })) : [];

  return (
    <div className="min-h-screen bg-ice-50 pt-16 lg:pt-20">
      {/* Search header */}
      <div className="border-b border-brand-100 bg-white">
        <div className="container-wide section-pad py-4">
          <SearchBar initialQuery={query} onSearch={handleSearch} />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {SEARCH_TABS.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${activeTab === tab.key ? 'bg-brand-900 text-white' : 'text-brand-700 hover:bg-ice-50'}`}>
                  {tab.label}
                  {tabCounts[tab.key] > 0 && <span className={`rounded-full px-1.5 text-xs ${activeTab === tab.key ? 'bg-white/20' : 'bg-brand-100'}`}>{tabCounts[tab.key]}</span>}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="lg:hidden border-brand-200">
                <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" /> Filters
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowMap(!showMap)} className="hidden border-brand-200 sm:inline-flex">
                {showMap ? <List className="mr-1.5 h-3.5 w-3.5" /> : <Map className="mr-1.5 h-3.5 w-3.5" />}
                {showMap ? 'List' : 'Map'}
              </Button>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-9 w-40 border-brand-200 bg-white text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide section-pad py-6">
        <div className="flex gap-6">
          {/* Filter sidebar */}
          <aside className={`w-72 shrink-0 space-y-4 ${showFilters ? 'fixed inset-0 z-50 overflow-y-auto bg-white p-4' : 'hidden'} lg:block lg:static lg:bg-transparent lg:p-0`}>
            {showFilters && (
              <div className="mb-2 flex items-center justify-between lg:hidden">
                <h3 className="font-heading text-base font-bold text-brand-900">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-muted-foreground">✕</button>
              </div>
            )}
            <SearchFilterPanel filters={filters} setFilters={setFilters} onClear={handleClearFilters} resultCount={results.total} />
            <SavedSearches currentQuery={query} currentFilters={filters} userId={user?.id} />
            <SearchHistory onSearch={handleSearch} />
          </aside>

          {/* Results */}
          <div className="min-w-0 flex-1">
            {/* Search summary */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">
                {loading ? 'Searching...' : query ? <>Showing <span className="font-semibold text-brand-900">{results.total}</span> results for "<span className="font-semibold text-brand-900">{query}</span>" {results.durationMs > 0 && <span className="text-xs">({results.durationMs}ms)</span>}</> : 'Start your search above'}
              </p>
              {query && !loading && results.total === 0 && (
                <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">Zero results</span>
              )}
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-brand-100 bg-white p-4">
                    <div className="mb-4 h-40 rounded-xl bg-brand-100" />
                    <div className="mb-2 h-4 w-3/4 rounded bg-brand-100" />
                    <div className="mb-2 h-3 w-1/2 rounded bg-brand-100" />
                    <div className="h-6 w-1/3 rounded bg-brand-100" />
                  </div>
                ))}
              </div>
            ) : displayResults.length > 0 ? (
              <>
                {/* Map placeholder */}
                {showMap && (
                  <div className="mb-4 flex h-64 items-center justify-center rounded-2xl border border-brand-100 bg-white">
                    <div className="text-center">
                      <Map className="mx-auto h-10 w-10 text-brand-200" />
                      <p className="mt-2 text-sm text-muted-foreground">Map view — switch to the <Link to="/gis" className="text-flame-600 hover:underline">GIS Map</Link> for full interactive search</p>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {displayResults.map((item) => (
                    <ResultCard key={item.id} result={item} type={item._type} onTrack={handleTrack} />
                  ))}
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-20 text-center">
                <SearchIcon className="h-16 w-16 text-brand-200" />
                <h3 className="mt-4 font-heading text-xl font-bold text-brand-900">{query ? 'No results found' : 'Search the platform'}</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  {query ? <>We couldn't find anything for "{query}". Try adjusting your filters or search terms.</> : 'Search across properties, projects, agents, and locations.'}
                </p>
                {query && (
                  <Button onClick={handleClearFilters} variant="outline" className="mt-6 border-brand-200">
                    Clear filters and try again
                  </Button>
                )}
                {!query && (
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {['4 bedroom house Lekki', 'Land in Ibeju-Lekki', 'Duplex in Abuja', 'Buy2Flip investment'].map((s) => (
                      <button key={s} onClick={() => handleSearch(s)} className="rounded-full border border-brand-200 bg-white px-4 py-2 text-sm text-brand-700 hover:border-flame-300 hover:bg-flame-50 hover:text-flame-600">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {!loading && results.total > 0 && (
              <div className="mt-8 rounded-2xl border border-flame-200 bg-flame-50 p-5">
                <h3 className="flex items-center gap-2 font-heading text-base font-bold text-brand-900"><Sparkles className="h-4 w-4 text-flame-500" /> Recommended for You</h3>
                <p className="mt-1 text-sm text-muted-foreground">Based on your search activity and preferences.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Explore estates in Epe', 'New properties this week', 'Investment opportunities', 'View all featured listings'].map((r) => (
                    <button key={r} onClick={() => handleSearch(r)} className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm font-medium text-brand-700 hover:border-flame-300 hover:text-flame-600">
                      {r} <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}