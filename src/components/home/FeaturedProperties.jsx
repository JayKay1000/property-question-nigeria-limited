import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';

const properties = [
  { title: 'Modern Luxury Villa', location: 'Lekki Phase 1, Lagos', price: '₦450M', beds: 5, baths: 6, area: '450 sqm', tag: 'For Sale', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format&fit=crop' },
  { title: 'Waterfront Apartment', location: 'Ikoyi, Lagos', price: '₦320M', beds: 4, baths: 3, area: '280 sqm', tag: 'For Sale', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&auto=format&fit=crop' },
  { title: 'Contemporary Family Home', location: 'Maitama, Abuja', price: '₦280M', beds: 4, baths: 5, area: '350 sqm', tag: 'New', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&auto=format&fit=crop' },
  { title: 'Smart Townhouse', location: 'Victoria Island, Lagos', price: '₦190M', beds: 3, baths: 3, area: '220 sqm', tag: 'For Sale', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80&auto=format&fit=crop' },
];

export default function FeaturedProperties() {
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
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {properties.map((prop, i) => (
            <Reveal key={prop.title} delay={i * 0.08}>
              <Link to="/properties" className="group block overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={prop.image} alt={prop.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <span className="absolute left-3 top-3 rounded-full bg-flame-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
                    {prop.tag}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-950/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 text-flame-500" />{prop.location}
                  </div>
                  <h3 className="mt-1 font-heading text-base font-bold text-brand-900">{prop.title}</h3>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{prop.beds}</span>
                    <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{prop.baths}</span>
                    <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5" />{prop.area}</span>
                  </div>
                  <div className="mt-3 border-t border-brand-50 pt-3">
                    <span className="font-heading text-lg font-bold text-flame-600">{prop.price}</span>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}