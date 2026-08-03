import { SlidersHorizontal, Star, Bed, Building2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export default function TourFilterPanel({ filters, setFilters, onClear }) {
  const update = (key, value) => setFilters({ ...filters, [key]: value });

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
          <SlidersHorizontal className="h-4 w-4 text-flame-500" /> Tour Filters
        </h3>
        <button onClick={onClear} className="text-xs text-flame-600 hover:underline">Clear All</button>
      </div>

      <div className="space-y-5">
        {/* Tour type */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tour Type</label>
          <Select value={filters.tourType || '__all__'} onValueChange={(v) => update('tourType', v === '__all__' ? '' : v)}>
            <SelectTrigger className="h-10 border-brand-200 bg-ice-50"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Types</SelectItem>
              <SelectItem value="360_tour">360° Tours</SelectItem>
              <SelectItem value="vr_tour">VR Tours</SelectItem>
              <SelectItem value="panorama">Panoramas</SelectItem>
              <SelectItem value="guided_tour">Guided Tours</SelectItem>
              <SelectItem value="interactive">Interactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property type */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Property Type</label>
          <Select value={filters.propertyType || '__all__'} onValueChange={(v) => update('propertyType', v === '__all__' ? '' : v)}>
            <SelectTrigger className="h-10 border-brand-200 bg-ice-50"><SelectValue placeholder="All Properties" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Properties</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="villa">Villa</SelectItem>
              <SelectItem value="duplex">Duplex</SelectItem>
            </SelectContent>
          </Select>
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
            <Checkbox checked={!!filters.has360} onCheckedChange={(c) => update('has360', c || undefined)} />
            <span className="flex items-center gap-1.5 text-sm text-brand-900"><Building2 className="h-3.5 w-3.5 text-info" /> With 360° media</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox checked={!!filters.hasDrone} onCheckedChange={(c) => update('hasDrone', c || undefined)} />
            <span className="flex items-center gap-1.5 text-sm text-brand-900"><Building2 className="h-3.5 w-3.5 text-brand-700" /> With drone footage</span>
          </label>
        </div>

        <Button onClick={onClear} variant="outline" className="w-full border-brand-200">Clear All Filters</Button>
      </div>
    </div>
  );
}