import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Mic, TrendingUp, Clock, Home, Building2, User, MapPin } from 'lucide-react';
import { getSearchHistory, TRENDING_SEARCHES } from '@/lib/search-utils';

const SUGGESTION_ICONS = { properties: Home, projects: Building2, agents: User, locations: MapPin };

export default function SearchBar({ initialQuery = '', onSearch, compact = false }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState({ properties: [], projects: [], agents: [] });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < 2) { setSuggestions({ properties: [], projects: [], agents: [] }); return; }
    setLoading(true);
    try {
      const { base44 } = await import('@/api/base44Client');
      const [props, projs, agts] = await Promise.all([
        base44.entities.Property.filter({}, '-created_date', 4).catch(() => []),
        base44.entities.Project.filter({}, '-created_date', 3).catch(() => []),
        base44.entities.Agent.filter({ status: 'active' }, '-created_date', 3).catch(() => []),
      ]);
      const ql = q.toLowerCase();
      setSuggestions({
        properties: props.filter((p) => (p.title || '').toLowerCase().includes(ql) || (p.city || '').toLowerCase().includes(ql) || (p.state || '').toLowerCase().includes(ql)).slice(0, 4),
        projects: projs.filter((p) => (p.name || '').toLowerCase().includes(ql) || (p.location_city || '').toLowerCase().includes(ql)).slice(0, 3),
        agents: agts.filter((a) => (a.full_name || '').toLowerCase().includes(ql) || (a.specialization || '').toLowerCase().includes(ql)).slice(0, 3),
      });
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handleClick = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setFocused(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (q) => {
    const finalQuery = q || query;
    if (!finalQuery.trim()) return;
    setFocused(false);
    if (onSearch) { onSearch(finalQuery); }
    else { navigate(`/search?q=${encodeURIComponent(finalQuery.trim())}`); }
  };

  const history = getSearchHistory();
  const flatSuggestions = [
    ...suggestions.properties.map((p) => ({ type: 'properties', label: p.title, sub: `${p.city || ''} ${p.state || ''}`, id: p.id, url: `/properties/${p.id}` })),
    ...suggestions.projects.map((p) => ({ type: 'projects', label: p.name, sub: p.location_city || p.location_state || '', id: p.id, url: `/projects/${p.id}` })),
    ...suggestions.agents.map((a) => ({ type: 'agents', label: a.full_name, sub: a.specialization || 'Agent', id: a.id, url: `/agents/${a.id}` })),
  ];

  const hasSuggestions = flatSuggestions.length > 0;
  const showDropdown = focused && (query.length >= 2 || history.length > 0);

  return (
    <div ref={containerRef} className={`relative ${compact ? '' : 'w-full'}`}>
      <div className={`flex items-center gap-2 rounded-xl border bg-white transition ${focused ? 'border-flame-400 ring-2 ring-flame-100' : 'border-brand-200'} ${compact ? 'px-3 py-1.5' : 'px-4 py-2.5'}`}>
        <Search className={`shrink-0 ${compact ? 'h-4 w-4' : 'h-5 w-5'} text-brand-400`} />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIndex(-1); }}
          onFocus={() => setFocused(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleSearch(); }
            else if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, flatSuggestions.length - 1)); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, -1)); }
            else if (e.key === 'Escape') setFocused(false);
          }}
          placeholder="Search properties, projects, agents, locations..."
          className={`flex-1 bg-transparent text-brand-900 outline-none placeholder:text-brand-300 ${compact ? 'text-sm' : 'text-base'}`}
          aria-label="Search"
        />
        {loading && <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-200 border-t-flame-500" />}
        {!loading && query && (
          <button onClick={() => { setQuery(''); setActiveIndex(-1); }} className="shrink-0 text-brand-300 hover:text-brand-500"><X className="h-4 w-4" /></button>
        )}
        <button className="shrink-0 rounded-lg p-1 text-brand-400 hover:bg-ice-50 hover:text-flame-500" title="Voice search (coming soon)" aria-label="Voice search">
          <Mic className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
        </button>
        {!compact && (
          <button onClick={() => handleSearch()} className="shrink-0 rounded-lg bg-flame-500 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-flame-600">
            Search
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-brand-100 bg-white shadow-premium-lg">
          {/* Live suggestions */}
          {hasSuggestions && (
            <div className="p-2">
              {suggestions.properties.length > 0 && <SuggestionGroup label="Properties" items={suggestions.properties.map((p) => ({ label: p.title, sub: `${p.city || ''} ${p.state || ''}`, url: `/properties/${p.id}` }))} icon="properties" activeIndex={activeIndex} setActiveIndex={setActiveIndex} onNavigate={navigate} />}
              {suggestions.projects.length > 0 && <SuggestionGroup label="Projects" items={suggestions.projects.map((p) => ({ label: p.name, sub: p.location_city || p.location_state || '', url: `/projects/${p.id}` }))} icon="projects" activeIndex={activeIndex} setActiveIndex={setActiveIndex} onNavigate={navigate} />}
              {suggestions.agents.length > 0 && <SuggestionGroup label="Agents" items={suggestions.agents.map((a) => ({ label: a.full_name, sub: a.specialization || 'Agent', url: `/agents/${a.id}` }))} icon="agents" activeIndex={activeIndex} setActiveIndex={setActiveIndex} onNavigate={navigate} />}
            </div>
          )}

          {/* Recent searches */}
          {!query && history.length > 0 && (
            <div className="border-t border-brand-100 p-2">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> Recent Searches</p>
              {history.map((h, i) => (
                <button key={i} onClick={() => { setQuery(h); handleSearch(h); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-brand-700 hover:bg-ice-50">
                  <Clock className="h-3.5 w-3.5 text-brand-300" /> {h}
                </button>
              ))}
            </div>
          )}

          {/* Trending */}
          {!query && (
            <div className="border-t border-brand-100 p-2">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> Trending Searches</p>
              <div className="flex flex-wrap gap-1.5 p-2">
                {TRENDING_SEARCHES.map((t) => (
                  <button key={t} onClick={() => { setQuery(t); handleSearch(t); }} className="rounded-full border border-brand-200 bg-ice-50 px-3 py-1 text-xs text-brand-700 hover:border-flame-300 hover:bg-flame-50 hover:text-flame-600">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results for query */}
          {query.length >= 2 && !hasSuggestions && !loading && (
            <div className="p-6 text-center">
              <Search className="mx-auto h-8 w-8 text-brand-200" />
              <p className="mt-2 text-sm text-muted-foreground">No suggestions for "{query}"</p>
              <button onClick={() => handleSearch()} className="mt-3 text-sm font-semibold text-flame-600 hover:underline">Search for "{query}" →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionGroup({ label, items, icon, activeIndex, setActiveIndex, onNavigate }) {
  const Icon = SUGGESTION_ICONS[icon] || Search;
  return (
    <div>
      <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {items.map((item, i) => {
        const globalIndex = activeIndex;
        return (
          <button
            key={i}
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => { onNavigate(item.url); }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition ${globalIndex === i ? 'bg-flame-50' : 'hover:bg-ice-50'}`}
          >
            <Icon className="h-4 w-4 shrink-0 text-flame-500" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-brand-900">{item.label}</p>
              {item.sub && <p className="truncate text-xs text-muted-foreground">{item.sub}</p>}
            </div>
          </button>
        );
      })}
    </div>
  );
}