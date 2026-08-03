import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { PRICE_RANGES, CLASSIFICATION_CONFIG, COMMON_AMENITIES } from '@/lib/property-utils';

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];
const BATHROOM_OPTIONS = [1, 2, 3, 4];

export default function FilterPanel({ filters, setFilters, propertyTypes, onClear }) {
  const update = (key, value) => setFilters({ ...filters, [key]: value });

  const toggleAmenity = (amenity) => {
    const current = filters.amenities || [];
    update('amenities', current.includes(amenity) ? current.filter((a) => a !== amenity) : [...current, amenity]);
  };

  const toggleFlag = (key) => update(key, !filters[key]);

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-card">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-base font-bold text-brand-900">
          <SlidersHorizontal className="h-4 w-4 text-flame-500" /> Filters
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-muted-foreground hover:text-flame-600">
          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Clear All
        </Button>
      </div>

      {/* Price Range */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-brand-800">Price Range</label>
        <Select value={filters.priceRange || 'Any Price'} onValueChange={(v) => {
          const range = PRICE_RANGES.find((r) => r.label === v);
          if (range) {
            update('priceRange', v);
            update('priceMin', range.min);
            update('priceMax', range.max === Infinity ? undefined : range.max);
          }
        }}>
          <SelectTrigger className="h-10 border-brand-200 bg-ice-50">
            <SelectValue placeholder="Any Price" />
          </SelectTrigger>
          <SelectContent>
            {PRICE_RANGES.map((r) => <SelectItem key={r.label} value={r.label}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Bedrooms */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-brand-800">Bedrooms</label>
        <div className="flex flex-wrap gap-2">
          {BEDROOM_OPTIONS.map((n) => (
            <button key={n} onClick={() => update('bedrooms', filters.bedrooms === n ? undefined : n)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filters.bedrooms === n ? 'bg-brand-900 text-white' : 'bg-ice-100 text-brand-700 hover:bg-ice-200'
              }`}>
              {n}+
            </button>
          ))}
        </div>
      </div>

      {/* Bathrooms */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-brand-800">Bathrooms</label>
        <div className="flex flex-wrap gap-2">
          {BATHROOM_OPTIONS.map((n) => (
            <button key={n} onClick={() => update('bathrooms', filters.bathrooms === n ? undefined : n)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filters.bathrooms === n ? 'bg-brand-900 text-white' : 'bg-ice-100 text-brand-700 hover:bg-ice-200'
              }`}>
              {n}+
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-brand-800">Property Type</label>
        <div className="space-y-2">
          {propertyTypes.slice(0, 8).map((t) => (
            <label key={t.id} className="flex cursor-pointer items-center gap-2 text-sm text-brand-700">
              <Checkbox checked={filters.propertyType === t.code}
                onCheckedChange={(checked) => update('propertyType', checked ? t.code : '')} />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      {/* Classification */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-brand-800">Classification</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CLASSIFICATION_CONFIG).map(([key, label]) => (
            <button key={key} onClick={() => update('classification', filters.classification === key ? undefined : key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.classification === key ? 'bg-flame-500 text-white' : 'bg-ice-100 text-brand-700 hover:bg-ice-200'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-semibold text-brand-800">Amenities</label>
        <div className="space-y-2">
          {COMMON_AMENITIES.map((a) => (
            <label key={a} className="flex cursor-pointer items-center gap-2 text-sm text-brand-700">
              <Checkbox checked={(filters.amenities || []).includes(a)} onCheckedChange={() => toggleAmenity(a)} />
              {a}
            </label>
          ))}
        </div>
      </div>

      {/* Special Flags */}
      <div className="mb-2">
        <label className="mb-2 block text-sm font-semibold text-brand-800">Special Flags</label>
        <div className="space-y-2">
          {[
            { key: 'featured', label: 'Featured Only' },
            { key: 'exclusive', label: 'Exclusive Listings' },
            { key: 'verified', label: 'Verified Properties' },
          ].map((f) => (
            <label key={f.key} className="flex cursor-pointer items-center gap-2 text-sm text-brand-700">
              <Checkbox checked={!!filters[f.key]} onCheckedChange={() => toggleFlag(f.key)} />
              {f.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}