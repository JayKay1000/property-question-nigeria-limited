import { Link } from 'react-router-dom';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';

const locations = [
  { name: 'Lekki', count: '120 properties', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80&auto=format&fit=crop' },
  { name: 'Ikoyi', count: '85 properties', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80&auto=format&fit=crop' },
  { name: 'Victoria Island', count: '95 properties', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80&auto=format&fit=crop' },
  { name: 'Abuja', count: '70 properties', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80&auto=format&fit=crop' },
];

export default function LocationsSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-wide section-pad">
        <SectionHeader
          eyebrow="Explore by Location"
          title="Properties in Top Locations"
          description="Discover premium real estate in Nigeria's most desirable neighborhoods."
        />
        <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {locations.map((loc, i) => (
            <Reveal key={loc.name} delay={i * 0.08}>
              <Link to={`/properties?loc=${loc.name.toLowerCase().replace(/\s/g, '')}`} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl">
                <img src={loc.image} alt={loc.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <h3 className="font-heading text-lg font-bold text-white">{loc.name}</h3>
                  <p className="text-xs text-white/70">{loc.count}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}