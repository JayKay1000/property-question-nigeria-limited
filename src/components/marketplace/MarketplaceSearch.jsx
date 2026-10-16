import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'house', label: 'Houses' },
  { value: 'apartment', label: 'Apartments' },
  { value: 'land', label: 'Land & Plots' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'duplex', label: 'Duplexes' },
];

const purposes = [
  { value: 'sale', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'land', label: 'Land' },
];

export default function MarketplaceSearch() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [purpose, setPurpose] = useState('sale');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set('loc', location);
    if (category) params.set('type', category);
    if (purpose === 'land') {
      params.set('type', 'land');
    } else if (purpose) {
      params.set('purpose', purpose);
    }
    navigate(`/properties${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-white p-3 shadow-premium sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="e.g. Lagos, Abuja, Lekki..."
            className="h-11 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus:border-flame-500 focus:ring-1 focus:ring-flame-500"
          />
        </div>
        <div className="lg:w-48">
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Tag className="h-3.5 w-3.5" /> Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11 border-input bg-transparent"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="lg:w-40">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Transaction</label>
          <Select value={purpose} onValueChange={setPurpose}>
            <SelectTrigger className="h-11 border-input bg-transparent"><SelectValue /></SelectTrigger>
            <SelectContent>
              {purposes.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSearch} className="h-11 bg-flame-500 px-6 text-white hover:bg-flame-600 lg:px-8">
          <Search className="mr-1.5 h-4 w-4" /> Search
        </Button>
      </div>
      <div className="mt-2 flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
        <span>Popular:</span>
        {['Lekki', 'Abuja', 'Ikeja', 'Yaba'].map((tag) => (
          <button
            key={tag}
            onClick={() => { setLocation(tag); }}
            className="rounded-full bg-brand-50 px-2.5 py-0.5 font-medium text-brand-700 transition-colors hover:bg-brand-100"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}