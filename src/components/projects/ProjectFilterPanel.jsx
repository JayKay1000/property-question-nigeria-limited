import { SlidersHorizontal, X, Star, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { PROJECT_STATUS_CONFIG, PROJECT_PRICE_RANGES, PROJECT_CATEGORY_LABELS } from '@/lib/project-utils';

export default function ProjectFilterPanel({ filters, setFilters, onClear }) {
  const update = (key, value) => setFilters({ ...filters, [key]: value });
  const publicStatuses = ['planning', 'construction', 'selling', 'allocation', 'handover', 'completed'];

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
          <SlidersHorizontal className="h-4 w-4 text-flame-500" /> Advanced Filters
        </h3>
        <button onClick={onClear} className="text-xs text-flame-600 hover:underline">Clear All</button>
      </div>

      <div className="space-y-5">
        {/* Status */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Project Status</label>
          <Select value={filters.status || '__all__'} onValueChange={(v) => update('status', v === '__all__' ? '' : v)}>
            <SelectTrigger className="h-10 border-brand-200 bg-ice-50"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Statuses</SelectItem>
              {publicStatuses.map((s) => (
                <SelectItem key={s} value={s}>{PROJECT_STATUS_CONFIG[s]?.label || s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price range */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Starting Price</label>
          <Select value={filters.priceRange || 'Any Price'} onValueChange={(v) => {
            const range = PROJECT_PRICE_RANGES.find((r) => r.label === v);
            if (range) {
              update('priceRange', v);
              update('priceMin', range.min === 0 ? undefined : range.min);
              update('priceMax', range.max === Infinity ? undefined : range.max);
            }
          }}>
            <SelectTrigger className="h-10 border-brand-200 bg-ice-50"><SelectValue placeholder="Any Price" /></SelectTrigger>
            <SelectContent>
              {PROJECT_PRICE_RANGES.map((r) => <SelectItem key={r.label} value={r.label}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Completion % */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Min Completion</label>
          <Select value={String(filters.minCompletion || '0')} onValueChange={(v) => update('minCompletion', v === '0' ? undefined : Number(v))}>
            <SelectTrigger className="h-10 border-brand-200 bg-ice-50"><SelectValue placeholder="Any Progress" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Progress</SelectItem>
              <SelectItem value="25">25%+</SelectItem>
              <SelectItem value="50">50%+</SelectItem>
              <SelectItem value="75">75%+</SelectItem>
              <SelectItem value="90">90%+</SelectItem>
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
            <Checkbox checked={!!filters.hasAvailable} onCheckedChange={(c) => update('hasAvailable', c || undefined)} />
            <span className="flex items-center gap-1.5 text-sm text-brand-900"><TrendingUp className="h-3.5 w-3.5 text-success" /> Plots available</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox checked={!!filters.buy2flip} onCheckedChange={(c) => update('buy2flip', c || undefined)} />
            <span className="text-sm text-brand-900">Buy2Flip eligible</span>
          </label>
        </div>

        {onClear && (
          <Button onClick={onClear} variant="outline" className="w-full border-brand-200">Clear All Filters</Button>
        )}
      </div>
    </div>
  );
}