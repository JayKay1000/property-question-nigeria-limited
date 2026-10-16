import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRICE_RANGES, CLASSIFICATION_CONFIG, COMMON_AMENITIES } from '@/lib/property-utils';

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];
const BATHROOM_OPTIONS = [1, 2, 3, 4];

export default function MarketplaceFilters({ filters, setFilters, propertyTypes, onClear }) {
  const update = (key, value) => setFilters({ ...filters, [key]: value });
  const toggleAmenity = (amenity) => {
    const current = filters.amenities || [];
    update('amenities', current.includes(amenity) ? current.filter((a) => a !== amenity) : [...current, amenity]);
  };
  const toggleFlag = (key) => update(key, !filters[key]);

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-heading font-bold text-brand-900">
          <SlidersHorizontal className="h-4 w-4 text-flame-500" /> Filters
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs text-muted-foreground hover:text-flame-600">
          <RotateCcw className="mr-1 h-3 w-3" /> Clear
        </Button>
      </div>

      {/* Price Range */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold text-brand-800">Price Range</label>
        <Select value={filters.priceRange || 'Any Price'} onValueChange={(v) => {
          const range = PRICE_RANGES.find((r) => r.label === v);
          if (range) {
            update('priceRange', v);
            update('priceMin', range.min === 0 ? undefined : range.min);
            update('priceMax', range.max === Infinity ? undefined : range.max);
          }
        }}>
          <SelectTrigger className="h-9 border-input bg-transparent text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PRICE_RANGES.map((r) => <SelectItem key={r.label} value={r.label}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Bedrooms */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold text-brand-800">Bedrooms</label>
        <div className="flex flex-wrap gap-1.5">
          {BEDROOM_OPTIONS.map((n) => (
            <button key={n} onClick={() => update('bedrooms', filters.bedrooms === n ? undefined : n)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                filters.bedrooms === n ? 'bg-brand-900 text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}>
              {n}+
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold text-brand-800">Bathrooms</label>
        <div className="flex flex-wrap gap-1.5">
          {BATHROOM_OPTIONS.map((n) => (
            <button key={n} onClick={() => update('bathrooms', filters.bathrooms === n ? undefined : n)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                filters.bathrooms === n ? 'bg-brand-900 text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}>
              {n}+
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold text-brand-800">Property Type</label>
        <div className="space-y-1.5">
          {propertyTypes.slice(0, 8).map((t) => (
            <label key={t.id} className="flex cursor-pointer items-center gap-2 text-xs text-brand-700">
              <Checkbox checked={filters.propertyType === t.code}
                onCheckedChange={(checked) => update('propertyType', checked ? t.code : '')} />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {/* Classification */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold text-brand-800">Classification</label>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(CLASSIFICATION_CONFIG).map(([key, label]) => (
            <button key={key} onClick={() => update('classification', filters.classification === key ? undefined : key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                filters.classification === key ? 'bg-flame-500 text-white' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-4">
        <label className="mb-1.5 block text-xs font-semibold text-brand-800">Amenities</label>
        <div className="space-y-1.5">
          {COMMON_AMENITIES.map((a) => (
            <label key={a} className="flex cursor-pointer items-center gap-2 text-xs text-brand-700">
              <Checkbox checked={(filters.amenities || []).includes(a)} onCheckedChange={() => toggleAmenity(a)} />
              {a}
            </label>
          ))}
        </div>
      </div>

      {/* Special Flags */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-brand-800">Special</label>
        <div className="space-y-1.5">
          {[
            { key: 'featured', label: 'Featured Only' },
            { key: 'jointVenture', label: 'Joint Venture' },
          ].map((f) => (
            <label key={f.key} className="flex cursor-pointer items-center gap-2 text-xs text-brand-700">
              <Checkbox checked={!!filters[f.key]} onCheckedChange={() => toggleFlag(f.key)} />
              {f.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}