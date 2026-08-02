import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Hammer, KeyRound, Layers, TrendingUp, Users } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';

const services = [
  { icon: Building2, title: 'Real Estate Sales', desc: 'Buy and sell premium properties across Nigeria with confidence.', href: '/services/sales' },
  { icon: Hammer, title: 'Construction', desc: 'World-class building and infrastructure solutions delivered on time.', href: '/services/construction' },
  { icon: KeyRound, title: 'Property Management', desc: 'Comprehensive care for your properties and tenants.', href: '/services/management' },
  { icon: Layers, title: 'Estate Development', desc: 'End-to-end estate planning, development, and delivery.', href: '/services/development' },
  { icon: TrendingUp, title: 'Buy2Flip', desc: 'Strategic property flipping investment program with returns.', href: '/buy2flip' },
  { icon: Users, title: 'Agent Management', desc: 'Professional agent network with tools and support.', href: '/agents' },
];

export default function ServicesPreview() {
  return (
    <section className="py-20 lg:py-28">
      <div className="container-wide section-pad">
        <SectionHeader
          eyebrow="What We Do"
          title="Comprehensive Real Estate Solutions"
          description="Every service you need to buy, build, manage, or invest in Nigerian real estate — all under one roof."
        />
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.title} delay={i * 0.08}>
              <Link
                to={service.href}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-flame-200 hover:shadow-card-hover lg:p-7"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-colors group-hover:bg-flame-500 group-hover:text-white ${i % 2 === 0 ? 'bg-brand-50 text-brand-700' : 'bg-ice-100 text-ice-700'}`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading text-lg font-bold text-brand-900">{service.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{service.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-flame-600">
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute right-0 top-0 h-24 w-24 -translate-y-12 translate-x-12 rounded-full bg-flame-50 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}