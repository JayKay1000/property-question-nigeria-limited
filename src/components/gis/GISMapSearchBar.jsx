import { Search, MapPin, X, Crosshair, Loader2, TriangleAlert, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RADIUS_OPTIONS } from '@/lib/gis-map-utils';

/** Keyword / state / radius filter bar for the discovery map. */
export default function GISMapSearchBar({
  filters,
  setFilters,
  states = [],
  radiusKm = 0,
  onRadiusChange,
  onLocateMe,
  locating = false,
  locationNotice,
  onResetFilters,
  filtersActive = false,
}) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-3 shadow-premium-lg sm:p-4">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <label htmlFor="gis-keyword" className="sr-only">Search properties by name, estate, city or reference</label>
          <Input
            id="gis-keyword"
            value={filters.keyword || ''}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            placeholder="Search by property, estate, city, or reference…"
            className="h-11 border-brand-200 bg-ice-50 pl-10"
          />
          {filters.keyword && (
            <button
              type="button"
              onClick={() => setFilters({ ...filters, keyword: '' })}
              aria-label="Clear keyword search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-900"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={filters.state || '__all__'} onValueChange={(value) => setFilters({ ...filters, state: value === '__all__' ? '' : value })}>
          <SelectTrigger className="h-11 w-full border-brand-200 bg-ice-50 lg:w-44" aria-label="Filter by state">
            <MapPin className="mr-1.5 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="__all__">All States</SelectItem>
            {states.map((s) => (
              <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(radiusKm || 0)} onValueChange={(value) => onRadiusChange?.(value === '0' ? 0 : Number(value))}>
          <SelectTrigger className="h-11 w-full border-brand-200 bg-ice-50 lg:w-36" aria-label="Filter by distance from your location">
            <Crosshair className="mr-1.5 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Radius" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any distance</SelectItem>
            {RADIUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={onLocateMe} variant="outline" size="lg" disabled={locating} className="h-11 border-brand-200 hover:bg-ice-50">
          {locating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Crosshair className="mr-1.5 h-4 w-4 text-flame-500" />}
          Near me
        </Button>

        {filtersActive && (
          <Button onClick={onResetFilters} variant="ghost" size="lg" className="h-11 text-muted-foreground hover:text-brand-900">
            <RotateCcw className="mr-1.5 h-4 w-4" /> Reset
          </Button>
        )}
      </div>

      {locationNotice && (
        <p className="mt-2.5 flex items-start gap-2 rounded-lg bg-amber-50 p-2 text-xs leading-relaxed text-amber-800">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{locationNotice}</span>
        </p>
      )}
    </div>
  );
}