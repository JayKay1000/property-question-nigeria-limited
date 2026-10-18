import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MarketplaceSearch from '@/components/marketplace/MarketplaceSearch';
import CategoryShortcuts from '@/components/marketplace/CategoryShortcuts';
import PropertyDiscovery from '@/components/marketplace/PropertyDiscovery';
import AgentParticipation from '@/components/marketplace/AgentParticipation';
import RecommendationFeed from '@/components/taste/RecommendationFeed';
import SaveSearchDialog from '@/components/marketplace/SaveSearchDialog';
import SavedSearchPanel from '@/components/marketplace/SavedSearchPanel';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { defaultFilters } from '@/lib/marketplace-search';

export default function Marketplace() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => {
    const next = { ...defaultFilters };
    const pt = searchParams.get('propertyType');
    const st = searchParams.get('state');
    if (pt) next.propertyType = pt;
    if (st) next.state = st;
    return next;
  });
  const [sort, setSort] = useState('newest');
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setIsAuthed).catch(() => setIsAuthed(false));
  }, []);

  useEffect(() => {
    base44.entities.LookupPropertyType.list('sort_order', 50)
      .then((types) => setPropertyTypes(types.filter((t) => t.is_active !== false)))
      .catch(() => setPropertyTypes([]));
  }, []);

  const handleShowSimilar = (property) => {
    const next = { ...defaultFilters };
    if (property.property_type) next.propertyType = property.property_type;
    if (property.state) next.state = property.state;
    setFilters(next);
    setTimeout(() => {
      document.getElementById('marketplace-discovery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
      <section className="relative overflow-hidden bg-brand-900">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-flame-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h1 className="text-3xl font-heading font-bold text-white sm:text-4xl lg:text-5xl">
              Nigeria's Property <span className="text-flame-500">Marketplace</span>
            </h1>
            <p className="mt-3 text-base text-white/70 sm:text-lg">
              Discover property advertisements from agents across Nigeria. Find homes, land, and commercial spaces — all in one place.
            </p>
          </div>
          <MarketplaceSearch filters={filters} setFilters={setFilters} propertyTypes={propertyTypes} />
          {isAuthed && (
            <div className="mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(true)}
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Bell className="mr-2 h-4 w-4" /> Save this Search
              </Button>
            </div>
          )}
        </div>
      </section>

      <CategoryShortcuts />
      <SavedSearchPanel />
      <RecommendationFeed onShowSimilar={handleShowSimilar} />
      <div id="marketplace-discovery">
        <PropertyDiscovery
          filters={filters}
          setFilters={setFilters}
          sort={sort}
          setSort={setSort}
          propertyTypes={propertyTypes}
        />
      </div>
      <AgentParticipation />
      <SaveSearchDialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} filters={filters} sort={sort} />
    </>
  );
}