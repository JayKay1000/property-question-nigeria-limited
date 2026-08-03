import { Search, MapPin, X, Crosshair } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RADIUS_OPTIONS } from '@/lib/gis-map-utils';

export default function GISMapSearchBar({ filters, setFilters, states, onLocateMe, onRadiusChange }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-3 shadow-premium-lg sm:p-4">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={filters.keyword || ''}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            placeholder="Search by property, estate, city, or reference..."
            className="h-11 border-brand-200 bg-ice-50 pl-10" />
          {filters.keyword && (
            <button onClick={() => setFilters({ ...filters, keyword: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-900">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={filters.state || '__all__'} onValueChange={(v) => setFilters({ ...filters, state: v === '__all__' ? '' : v })}>
          <SelectTrigger className="h-11 w-full border-brand-200 bg-ice-50 lg:w-44">
            <MapPin className="mr-1.5 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="__all__">All States</SelectItem>
            {states.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={String(filters.radiusKm || '0')} onValueChange={(v) => onRadiusChange?.(v === '0' ? 0 : Number(v))}>
          <SelectTrigger className="h-11 w-full border-brand-200 bg-ice-50 lg:w-32">
            <Crosshair className="mr-1.5 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Radius" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">No radius</SelectItem>
            {RADIUS_OPTIONS.map((r) => <SelectItem key={r.value} value={String(r.value)}>{r.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button onClick={onLocateMe} variant="outline" size="lg" className="h-11 border-brand-200 hover:bg-ice-50">
          <Crosshair className="mr-1.5 h-4 w-4 text-flame-500" /> Near Me
        </Button>
      </div>
    </div>
  );
}