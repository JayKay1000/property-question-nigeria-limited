import MarketplaceSearch from '@/components/marketplace/MarketplaceSearch';
import CategoryShortcuts from '@/components/marketplace/CategoryShortcuts';
import PropertyDiscovery from '@/components/marketplace/PropertyDiscovery';
import AgentParticipation from '@/components/marketplace/AgentParticipation';

export default function Marketplace() {
  return (
    <>
      {/* Hero / Search area */}
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
          <MarketplaceSearch />
        </div>
      </section>

      <CategoryShortcuts />
      <PropertyDiscovery />
      <AgentParticipation />
    </>
  );
}