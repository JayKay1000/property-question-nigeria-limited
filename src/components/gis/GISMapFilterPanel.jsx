import { SlidersHorizontal, Star, Building2, Bed, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export default function GISMapFilterPanel({ filters, setFilters, onClear, maxPrice }) {
  const update = (key, value) => setFilters({ ...filters, [key]: value });
  const priceRange = filters.priceRange || [0, maxPrice || 500000000];

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
          <SlidersHorizontal className="h-4 w-4 text-flame-500" /> Map Filters
        </h3>
        <button onClick={onClear} className="text-xs text-flame-600 hover:underline">Clear</button>
      </div>

      <div className="space-y-5">
        {/* Property type */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Property Type</label>
          <Select value={filters.propertyType || '__all__'} onValueChange={(v) => update('propertyType', v === '__all__' ? '' : v)}>
            <SelectTrigger className="h-10 border-brand-200 bg-ice-50"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="duplex">Duplex</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Availability */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Availability</label>
          <Select value={filters.availability || '__all__'} onValueChange={(v) => update('availability', v === '__all__' ? '' : v)}>
            <SelectTrigger className="h-10 border-brand-200 bg-ice-50"><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Any Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price range */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Max Price: ₦{(priceRange[1] / 1000000).toFixed(0)}M
          </label>
          <Slider value={[priceRange[1]]} max={maxPrice || 500000000} step={5000000}
            onValueChange={(v) => update('priceRange', [0, v[0]])}
            className="text-flame-500" />
        </div>

        {/* Bedrooms */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Min Bedrooms</label>
          <Select value={String(filters.bedrooms || '0')} onValueChange={(v) => update('bedrooms', v === '0' ? undefined : Number(v))}>
            <SelectTrigger className="h-10 border-brand-200 bg-ice-50"><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Toggles */}
        <div className="space-y-2.5 border-t border-border pt-4">
          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox checked={!!filters.featured} onCheckedChange={(c) => update('featured', c || undefined)} />
            <span className="flex items-center gap-1.5 text-sm text-brand-900"><Star className="h-3.5 w-3.5 text-flame-500" /> Featured only</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox checked={!!filters.hasTour} onCheckedChange={(c) => update('hasTour', c || undefined)} />
            <span className="flex items-center gap-1.5 text-sm text-brand-900"><Eye className="h-3.5 w-3.5 text-info" /> Has virtual tour</span>
          </label>
        </div>

        <Button onClick={onClear} variant="outline" className="w-full border-brand-200">Clear All Filters</Button>
      </div>
    </div>
  );
}