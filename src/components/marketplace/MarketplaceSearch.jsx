import { useState, useEffect } from 'react';
import { Search, MapPin, Building2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PURPOSE_CONFIG, ACTIVE_STATUSES } from '@/lib/property-utils';
import { NIGERIA_STATES, getLGAsForState } from '@/lib/nigeria-locations';
import { base44 } from '@/api/base44Client';

const BASE_QUERY = { visibility: 'public', status: { $in: ACTIVE_STATUSES } };
const normalizeLga = (lga) => (lga || '').replace(/\s*LGA\s*$/i, '').replace(/[-/]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

export default function MarketplaceSearch({ filters, setFilters, propertyTypes }) {
  const [keywordInput, setKeywordInput] = useState(filters.keyword || '');
  const lgaOptions = getLGAsForState(filters.state);
  const [stateCounts, setStateCounts] = useState({});
  const [lgaCounts, setLgaCounts] = useState({});
  const [totalAds, setTotalAds] = useState(0);

  useEffect(() => { setKeywordInput(filters.keyword || ''); }, [filters.keyword]);

  useEffect(() => {
    base44.entities.Property.aggregate({ query: BASE_QUERY, groupBy: 'state' })
      .then((res) => {
        const map = {};
        let total = 0;
        (res.rows || []).forEach((r) => { if (r.state) { map[r.state] = r.count; total += r.count; } });
        setStateCounts(map);
        setTotalAds(total);
      })
      .catch(() => setStateCounts({}));
  }, []);

  useEffect(() => {
    if (!filters.state) { setLgaCounts({}); return; }
    base44.entities.Property.aggregate({ query: { ...BASE_QUERY, state: filters.state }, groupBy: 'lga' })
      .then((res) => {
        const map = {};
        (res.rows || []).forEach((r) => { if (r.lga) map[normalizeLga(r.lga)] = r.count; });
        setLgaCounts(map);
      })
      .catch(() => setLgaCounts({}));
  }, [filters.state]);

  const submitKeyword = () => setFilters({ ...filters, keyword: keywordInput });

  const purposes = [['', 'All'], ...Object.entries(PURPOSE_CONFIG)];

  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-white/20 bg-white p-3 shadow-premium-lg sm:p-4">
      {/* Purpose tabs */}
      <div className="mb-3 flex gap-2">
        {purposes.map(([key, label]) => (
          <button
            key={key || 'all'}
            onClick={() => setFilters({ ...filters, purpose: key })}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
              filters.purpose === key ? 'bg-flame-500 text-white shadow' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search inputs */}
      <div className="flex flex-col gap-2.5 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitKeyword()}
            placeholder="Search by title, estate, or keyword…"
            aria-label="Search by keyword"
            className="h-11 w-full rounded-lg border border-input bg-transparent pl-10 pr-9 text-sm outline-none transition-colors focus:border-flame-500 focus:ring-1 focus:ring-flame-500"
          />
          {keywordInput && (
            <button onClick={() => { setKeywordInput(''); setFilters({ ...filters, keyword: '' }); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-900">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={filters.state || '__all__'} onValueChange={(v) => setFilters({ ...filters, state: v === '__all__' ? '' : v, lga: '' })}>
          <SelectTrigger className="h-11 w-full border-input bg-transparent lg:w-44" aria-label="Filter by state">
            <MapPin className="mr-1.5 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="__all__">All States ({totalAds})</SelectItem>
            {NIGERIA_STATES.map((s) => (
              <SelectItem key={s.name} value={s.name}>
                {s.name}{stateCounts[s.name] ? ` (${stateCounts[s.name]})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.lga || '__all__'} onValueChange={(v) => setFilters({ ...filters, lga: v === '__all__' ? '' : v })} disabled={!filters.state}>
          <SelectTrigger className="h-11 w-full border-input bg-transparent lg:w-40 disabled:opacity-50" aria-label="Filter by local government area">
            <SelectValue placeholder={filters.state ? 'All LGAs' : 'Select state'} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="__all__">All LGAs ({stateCounts[filters.state] || 0})</SelectItem>
            {lgaOptions.map((lga) => (
              <SelectItem key={lga} value={lga}>
                {lga}{lgaCounts[normalizeLga(lga)] ? ` (${lgaCounts[normalizeLga(lga)]})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.propertyType || '__all__'} onValueChange={(v) => setFilters({ ...filters, propertyType: v === '__all__' ? '' : v })}>
          <SelectTrigger className="h-11 w-full border-input bg-transparent lg:w-44" aria-label="Filter by property type">
            <Building2 className="mr-1.5 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="__all__">All Types</SelectItem>
            {propertyTypes.map((t) => <SelectItem key={t.id} value={t.code}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button onClick={submitKeyword} className="h-11 bg-flame-500 px-6 text-white hover:bg-flame-600 lg:px-8">
          <Search className="mr-1.5 h-4 w-4" /> Search
        </Button>
      </div>
    </div>
  );
}