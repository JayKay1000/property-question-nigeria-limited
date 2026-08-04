import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, ArrowRight, MapPin, Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';
import { base44 } from '@/api/base44Client';
import { formatPrice, buildShortLocation, ACTIVE_STATUSES } from '@/lib/property-utils';

export default function FeaturedProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Property.filter(
          { status: { $in: ACTIVE_STATUSES }, visibility: 'public' },
          '-created_date', 4
        );
        setProperties(Array.isArray(res) ? res : []);
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="bg-ice-100 py-20 lg:py-28">
      <div className="container-wide section-pad">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            align="left"
            eyebrow="Featured Listings"
            title="Premium Properties for Sale"
            description="Handpicked luxury properties across Nigeria's most sought-after locations."
            className="mx-0"
          />
          <Button asChild variant="outline" className="shrink-0 border-brand-200 text-brand-800 hover:bg-brand-50">
            <Link to="/properties">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        {loading ? (
          <div className="mt-12 flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
          </div>
        ) : properties.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/40" />
            <h3 className="mt-3 font-heading text-sm font-bold text-brand-900">No properties listed yet</h3>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">Newly uploaded properties will appear here. Check back soon.</p>
            <Button asChild className="mt-5 bg-flame-500 hover:bg-flame-600">
              <Link to="/properties">Browse all properties</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {properties.map((prop, i) => {
              const img = prop.featured_image_url || prop.image_urls?.[0];
              const location = buildShortLocation(prop);
              const tag = prop.listing_purpose === 'rent' ? 'For Rent' : prop.is_new_listing ? 'New' : 'For Sale';
              return (
                <Reveal key={prop.id} delay={i * 0.08}>
                  <Link to={`/properties/${prop.id}`} className="group block overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {img ? (
                        <Image src={img} alt={prop.title} fittingType="fill" className="h-full w-full transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center"><Building2 className="h-8 w-8 text-muted-foreground/40" /></div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-flame-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
                        {tag}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 text-flame-500" />{location || '—'}
                      </div>
                      <h3 className="mt-1 font-heading text-base font-bold text-brand-900">{prop.title}</h3>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{prop.bedrooms ?? 0}</span>
                        <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{prop.bathrooms ?? 0}</span>
                        <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{prop.land_size_sqm ? `${prop.land_size_sqm} sqm` : '—'}</span>
                      </div>
                      <div className="mt-3 border-t border-brand-50 pt-3">
                        <span className="font-heading text-lg font-bold text-flame-600">{formatPrice(prop.price)}</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}