import { SlidersHorizontal, BadgeCheck, Star } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

export default function AgentFilterPanel({ filters, setFilters, onClear }) {
  const update = (key, value) => setFilters({ ...filters, [key]: value });

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
          <SlidersHorizontal className="h-4 w-4 text-flame-500" /> Filters
        </h3>
        <button onClick={onClear} className="text-xs text-flame-600 hover:underline">Clear</button>
      </div>

      <div className="space-y-5">
        {/* Verification status */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Verification Status</label>
          <Select value={filters.verification || '__all__'} onValueChange={(v) => update('verification', v === '__all__' ? '' : v)}>
            <SelectTrigger className="h-10 border-brand-200 bg-ice-50"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Agents</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Specialization */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Specialization</label>
          <Select value={filters.specialization || '__all__'} onValueChange={(v) => update('specialization', v === '__all__' ? '' : v)}>
            <SelectTrigger className="h-10 border-brand-200 bg-ice-50"><SelectValue placeholder="All" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Specializations</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="mixed_use">Mixed Use</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Toggles */}
        <div className="space-y-2.5 border-t border-border pt-4">
          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox checked={!!filters.verifiedOnly} onCheckedChange={(c) => update('verifiedOnly', c || undefined)} />
            <span className="flex items-center gap-1.5 text-sm text-brand-900"><BadgeCheck className="h-3.5 w-3.5 text-info" /> Verified agents only</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox checked={!!filters.topRated} onCheckedChange={(c) => update('topRated', c || undefined)} />
            <span className="flex items-center gap-1.5 text-sm text-brand-900"><Star className="h-3.5 w-3.5 text-flame-500" /> Top rated (4+ stars)</span>
          </label>
        </div>

        <Button onClick={onClear} variant="outline" className="w-full border-brand-200">Clear All Filters</Button>
      </div>
    </div>
  );
}