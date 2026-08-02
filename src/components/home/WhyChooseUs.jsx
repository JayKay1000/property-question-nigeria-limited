import { Link } from 'react-router-dom';
import { Shield, Award, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';

const features = [
  { icon: Shield, title: 'Trusted & Secure', desc: 'Every transaction is transparent and legally backed.' },
  { icon: Award, title: 'Award-Winning Quality', desc: 'Recognised for excellence in construction and service.' },
  { icon: Clock, title: 'On-Time Delivery', desc: 'We deliver projects on schedule, every time.' },
  { icon: TrendingUp, title: 'High ROI Investments', desc: 'Properties that appreciate in value over time.' },
];

const IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=80&auto=format&fit=crop';

export default function WhyChooseUs() {
  return (
    <section className="bg-ice-50 py-20 lg:py-28">
      <div className="container-wide section-pad">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative">
              <img src={IMAGE} alt="Luxury property" loading="lazy" className="aspect-[4/5] w-full rounded-3xl object-cover shadow-premium-lg" />
              <div className="absolute -bottom-6 -right-6 hidden rounded-2xl border border-brand-100 bg-white p-5 shadow-premium-lg sm:block">
                <div className="font-heading text-3xl font-bold text-flame-600">98%</div>
                <div className="text-xs text-muted-foreground">Client Satisfaction</div>
              </div>
              <div className="absolute -left-6 -top-6 hidden rounded-2xl bg-brand-800 p-5 text-white shadow-premium-lg sm:block">
                <div className="font-heading text-3xl font-bold">15+</div>
                <div className="text-xs text-white/60">Years Experience</div>
              </div>
            </div>
          </Reveal>
          <div>
            <SectionHeader
              align="left"
              eyebrow="Why Choose Us"
              title="Built on Trust, Driven by Innovation"
              description="We combine deep local expertise with cutting-edge technology to deliver exceptional real estate experiences."
              className="mx-0"
            />
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.08}>
                  <div className="flex gap-4">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${i % 2 === 0 ? 'bg-flame-50 text-flame-600' : 'bg-ice-100 text-ice-700'}`}>
                      <f.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-brand-900">{f.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3}>
              <Button asChild size="lg" className="mt-8 bg-brand-800 hover:bg-brand-900 text-white">
                <Link to="/about">Learn More About Us <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}