import { Search, MapPin, Building2, Tag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { PURPOSE_CONFIG } from '@/lib/property-utils';
import { NIGERIA_STATES, getLGAsForState } from '@/lib/nigeria-locations';

export default function SearchBar({ filters, setFilters, states, propertyTypes, onSearch }) {
  const purposes = Object.entries(PURPOSE_CONFIG);
  const lgaOptions = getLGAsForState(filters.state);

  return (
    <div className="rounded-2xl border border-brand-100 bg-white p-4 shadow-premium-lg sm:p-6">
      {/* Purpose tabs */}
      <div className="mb-4 flex gap-2">
        {purposes.map(([key, label]) => (
          <button key={key} onClick={() => setFilters({ ...filters, purpose: filters.purpose === key ? '' : key })}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              filters.purpose === key ? 'bg-flame-500 text-white shadow-md' : 'bg-ice-100 text-brand-700 hover:bg-ice-200'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Search inputs */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={filters.keyword || ''}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
            placeholder="Search by title, reference, or keyword…"
            className="h-12 border-brand-200 bg-ice-50 pl-10 text-base" />
          {filters.keyword && (
            <button onClick={() => setFilters({ ...filters, keyword: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-900">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={filters.state || '__all__'} onValueChange={(v) => setFilters({ ...filters, state: v === '__all__' ? '' : v, lga: '' })}>
          <SelectTrigger className="h-12 w-full border-brand-200 bg-ice-50 text-base lg:w-48">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="__all__">All States</SelectItem>
            {NIGERIA_STATES.map((s) => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.lga || '__all__'} onValueChange={(v) => setFilters({ ...filters, lga: v === '__all__' ? '' : v })} disabled={!filters.state}>
          <SelectTrigger className="h-12 w-full border-brand-200 bg-ice-50 text-base lg:w-48 disabled:opacity-50">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder={filters.state ? 'All LGAs' : 'Select state first'} />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="__all__">All LGAs</SelectItem>
            {lgaOptions.map((lga) => <SelectItem key={lga} value={lga}>{lga}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.propertyType || '__all__'} onValueChange={(v) => setFilters({ ...filters, propertyType: v === '__all__' ? '' : v })}>
          <SelectTrigger className="h-12 w-full border-brand-200 bg-ice-50 text-base lg:w-48">
            <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem value="__all__">All Types</SelectItem>
            {propertyTypes.map((t) => <SelectItem key={t.id} value={t.code}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button onClick={onSearch} size="lg" className="h-12 bg-flame-500 px-8 text-base hover:bg-flame-600">
          <Search className="mr-2 h-5 w-5" /> Search
        </Button>
      </div>

      {/* Quick tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Tag className="h-3.5 w-3.5" /> Popular:
        </span>
        <button onClick={() => setFilters({ ...filters, jointVenture: !filters.jointVenture })}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            filters.jointVenture ? 'bg-flame-500 text-white shadow-md' : 'border border-brand-200 bg-ice-50 text-brand-700 hover:bg-flame-50 hover:text-flame-600 hover:border-flame-300'
          }`}>
          Joint Venture
        </button>
        {['Luxury', 'Lekki', 'Abuja', 'Land', 'New Developments'].map((tag) => (
          <button key={tag} onClick={() => setFilters({ ...filters, keyword: tag })}
            className="rounded-full border border-brand-200 bg-ice-50 px-3 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-flame-50 hover:text-flame-600 hover:border-flame-300">
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}