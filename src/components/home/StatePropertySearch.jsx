import { useEffect, useState } from 'react';
import { MapPin, Search, Building2, Loader2, ShieldCheck, Store, Home as HomeIcon } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image } from '@/components/ui/image';
import Reveal from '@/components/ui/Reveal';

const formatPrice = (price) => {
  if (!price) return 'Price on request';
  if (price >= 1_000_000_000) return `₦${(price / 1_000_000_000).toFixed(1)}B`;
  if (price >= 1_000_000) return `₦${(price / 1_000_000).toFixed(1)}M`;
  return `₦${price.toLocaleString('en-NG')}`;
};

const PURPOSE_TAG = { sale: 'For Sale', rent: 'For Rent', lease: 'For Lease' };

function ResultCard({ property }) {
  const location = [property.city, property.state].filter(Boolean).join(', ');
  const image = property.featured_image_url || property.image_urls?.[0];
  const isCompany = !property.listing_agent_id && !property.listing_agent_name;

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden">
        {image ? (
          <Image src={image} alt={property.title} fittingType="fill" className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand-50 text-brand-200">
            <HomeIcon className="h-12 w-12" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {property.listing_purpose && (
            <span className="rounded-full bg-flame-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              {PURPOSE_TAG[property.listing_purpose] || 'For Sale'}
            </span>
          )}
          {property.verified && (
            <span className="flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate font-heading font-semibold text-brand-900">{property.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-flame-500" /> {location || 'Location unavailable'}
        </p>
        <p className="mt-2 text-lg font-heading font-bold text-flame-600">{formatPrice(property.price)}</p>
        <div className="mt-3 flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          {property.bedrooms != null && <span className="flex items-center gap-1">🛏 {property.bedrooms} Beds</span>}
          {property.bathrooms != null && <span className="flex items-center gap-1">🛁 {property.bathrooms} Baths</span>}
          {property.land_size_sqm && <span className="flex items-center gap-1">📐 {property.land_size_sqm} sqm</span>}
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3">
          {isCompany ? (
            <span className="flex items-center gap-1 text-xs font-medium text-brand-700">
              <Store className="h-3.5 w-3.5" /> Company Listed
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> {property.listing_agent_name || 'Verified Agent'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StatePropertySearch() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [properties, setProperties] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    base44.entities.LookupState.list('sort_order', 100)
      .then(setStates)
      .catch(() => setStates([]))
      .finally(() => setLoadingStates(false));
  }, []);

  const handleSearch = () => {
    if (!selectedState) return;
    setLoadingProperties(true);
    setHasSearched(true);
    setProperties([]);
    base44.entities.Property.filter({ state: selectedState, visibility: 'public' }, '-created_date', 24)
      .then((results) => {
        const activeStatuses = ['published', 'active', 'approved', 'verified'];
        setProperties(results.filter((p) => activeStatuses.includes(p.status)));
      })
      .catch(() => setProperties([]))
      .finally(() => setLoadingProperties(false));
  };

  return (
    <section className="relative z-20 -mt-20 bg-ice-50 pb-20 pt-24 lg:pb-28">
      <div className="container-wide section-pad">
        <Reveal>
          <div className="mx-auto max-w-3xl rounded-2xl border border-brand-100 bg-white p-6 shadow-premium-lg sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                <MapPin className="h-6 w-6 text-brand-700" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-brand-900 sm:text-2xl">Find Properties by State</h2>
                <p className="text-sm text-muted-foreground">Select a state to explore available listings from our company and verified agents</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="h-12 flex-1 border-brand-200 bg-ice-50 text-base">
                  <SelectValue placeholder={loadingStates ? 'Loading states...' : 'Select your preferred state'} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {states.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSearch}
                disabled={!selectedState || loadingProperties}
                size="lg"
                className="h-12 bg-flame-500 px-8 text-base hover:bg-flame-600"
              >
                {loadingProperties ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                Search
              </Button>
            </div>
          </div>
        </Reveal>

        {hasSearched && (
          <div className="mt-10">
            {loadingProperties ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-flame-500" />
                <p className="mt-4 text-sm text-muted-foreground">Searching for properties in {selectedState}...</p>
              </div>
            ) : properties.length > 0 ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-2xl font-bold text-brand-900">
                      {properties.length} {properties.length === 1 ? 'Property' : 'Properties'} in {selectedState}
                    </h3>
                    <p className="text-sm text-muted-foreground">Listed by our company and verified agents</p>
                  </div>
                  <Badge variant="secondary" className="hidden sm:flex gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> {selectedState}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {properties.map((p, i) => (
                    <Reveal key={p.id} delay={i * 0.05}>
                      <ResultCard property={p} />
                    </Reveal>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ice-100">
                  <Building2 className="h-8 w-8 text-brand-300" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-semibold text-brand-900">No properties found in {selectedState}</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  We don't have any active listings in {selectedState} right now. Please check back soon or try another state.
                </p>
                <Button
                  onClick={() => { setHasSearched(false); setSelectedState(''); }}
                  variant="outline"
                  className="mt-6 border-brand-200 text-brand-800 hover:bg-brand-50"
                >
                  Search another state
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}