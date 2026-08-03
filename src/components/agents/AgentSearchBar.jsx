import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function AgentSearchBar({ filters, setFilters, states, onSearch }) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-premium-lg">
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={filters.keyword || ''}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
            placeholder="Search by name, agent code, or specialization..."
            className="h-12 border-brand-200 bg-ice-50 pl-10 text-base" />
          {filters.keyword && (
            <button onClick={() => setFilters({ ...filters, keyword: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-900">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Select value={filters.state || '__all__'} onValueChange={(v) => setFilters({ ...filters, state: v === '__all__' ? '' : v })}>
          <SelectTrigger className="h-12 w-full border-brand-200 bg-ice-50 text-base lg:w-48">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="__all__">All States</SelectItem>
            {states.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.verification || '__all__'} onValueChange={(v) => setFilters({ ...filters, verification: v === '__all__' ? '' : v })}>
          <SelectTrigger className="h-12 w-full border-brand-200 bg-ice-50 text-base lg:w-48">
            <SelectValue placeholder="All Agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Agents</SelectItem>
            <SelectItem value="verified">Verified Only</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onSearch} size="lg" className="h-12 bg-flame-500 px-8 text-base hover:bg-flame-600">
          <Search className="mr-2 h-5 w-5" /> Search
        </Button>
      </div>
    </div>
  );
}