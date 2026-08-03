import { Filter, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PROPERTY_TYPES, PROPERTY_CLASSIFICATIONS, NIGERIAN_STATES } from '@/lib/search-utils';

export default function SearchFilterPanel({ filters, setFilters, onClear, resultCount }) {
  const set = (key, value) => setFilters((p) => ({ ...p, [key]: value }));

  const hasActiveFilters = Object.values(filters).some((v) => v !== '' && v !== false && v !== undefined && v !== null);

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-base font-bold text-brand-900"><Filter className="h-4 w-4 text-flame-500" /> Filters</h3>
        {hasActiveFilters && (
          <button onClick={onClear} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-flame-600">
            <RotateCcw className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Property type */}
        <FilterGroup label="Property Type">
          <Select value={filters.propertyType || ''} onValueChange={(v) => set('propertyType', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-10 bg-ice-50 text-sm"><SelectValue placeholder="Any type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any type</SelectItem>
              {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterGroup>

        {/* Classification */}
        <FilterGroup label="Classification">
          <Select value={filters.classification || ''} onValueChange={(v) => set('classification', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-10 bg-ice-50 text-sm"><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any classification</SelectItem>
              {PROPERTY_CLASSIFICATIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterGroup>

        {/* Price range */}
        <FilterGroup label="Price Range (₦)">
          <div className="flex items-center gap-2">
            <Input type="number" value={filters.minPrice || ''} onChange={(e) => set('minPrice', e.target.value)} placeholder="Min" className="h-10 bg-ice-50 text-sm" />
            <span className="text-muted-foreground">–</span>
            <Input type="number" value={filters.maxPrice || ''} onChange={(e) => set('maxPrice', e.target.value)} placeholder="Max" className="h-10 bg-ice-50 text-sm" />
          </div>
        </FilterGroup>

        {/* Bedrooms */}
        <FilterGroup label="Bedrooms">
          <div className="flex flex-wrap gap-2">
            {['', '1', '2', '3', '4', '5'].map((n) => (
              <button key={n} onClick={() => set('bedrooms', n)} className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${filters.bedrooms === n ? 'border-flame-500 bg-flame-50 text-flame-600' : 'border-brand-200 bg-ice-50 text-brand-700 hover:border-flame-300'}`}>
                {n === '' ? 'Any' : n === '5' ? '5+' : n}
              </button>
            ))}
          </div>
        </FilterGroup>

        {/* Bathrooms */}
        <FilterGroup label="Bathrooms">
          <div className="flex flex-wrap gap-2">
            {['', '1', '2', '3', '4'].map((n) => (
              <button key={n} onClick={() => set('bathrooms', n)} className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${filters.bathrooms === n ? 'border-flame-500 bg-flame-50 text-flame-600' : 'border-brand-200 bg-ice-50 text-brand-700 hover:border-flame-300'}`}>
                {n === '' ? 'Any' : n === '4' ? '4+' : n}
              </button>
            ))}
          </div>
        </FilterGroup>

        {/* State */}
        <FilterGroup label="State">
          <Select value={filters.state || ''} onValueChange={(v) => set('state', v === 'all' ? '' : v)}>
            <SelectTrigger className="h-10 bg-ice-50 text-sm"><SelectValue placeholder="Any state" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any state</SelectItem>
              {NIGERIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterGroup>

        {/* City */}
        <FilterGroup label="City">
          <Input value={filters.city || ''} onChange={(e) => set('city', e.target.value)} placeholder="Enter city" className="h-10 bg-ice-50 text-sm" />
        </FilterGroup>

        {/* Special flags */}
        <FilterGroup label="Special">
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox checked={filters.featured || false} onCheckedChange={(c) => set('featured', c || false)} />
              <span className="text-sm text-brand-900">Featured listings only</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox checked={filters.buy2flip || false} onCheckedChange={(c) => set('buy2flip', c || false)} />
              <span className="text-sm text-brand-900">Buy2Flip eligible</span>
            </label>
          </div>
        </FilterGroup>
      </div>

      {resultCount !== undefined && (
        <div className="mt-4 rounded-lg bg-ice-50 px-3 py-2 text-center text-sm font-medium text-brand-700">
          {resultCount} result{resultCount !== 1 ? 's' : ''} found
        </div>
      )}
    </div>
  );
}

function FilterGroup({ label, children }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-semibold text-brand-900">{label}</Label>
      {children}
    </div>
  );
}