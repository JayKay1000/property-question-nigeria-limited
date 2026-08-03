import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHero from '@/components/marketing/PageHero';
import CTASection from '@/components/marketing/CTASection';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, HardHat, Briefcase, Search, TrendingUp, FileBarChart, Megaphone, Users, ArrowRight } from 'lucide-react';
import { serviceCategoryLabels } from '@/lib/marketing-utils';

const iconMap = {
  Building2, HardHat, Briefcase, Search, TrendingUp, FileBarChart, Megaphone, Users,
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.Service.filter({ is_active: true }, 'sort_order', 20);
        setServices(data);
      } catch (e) { /* empty */ }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <PageHero
        title="Our Services"
        subtitle="Comprehensive real estate, construction, and advisory services designed to meet every property need across Nigeria."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
      />

      <section className="section-pad py-16 lg:py-24">
        <div className="container-wide">
          {loading ? (
            <div className="flex justify-center"><div className="w-8 h-8 border-4 border-flame-200 border-t-flame-500 rounded-full animate-spin" /></div>
          ) : services.length === 0 ? (
            <div className="max-w-3xl mx-auto space-y-6">
              {Object.entries(serviceCategoryLabels).map(([key, label], i) => (
                <Card key={key} className="p-8">
                  <h3 className="text-xl font-heading font-bold mb-3">{label}</h3>
                  <p className="text-muted-foreground mb-4">Professional {label.toLowerCase()} services delivered to the highest standards.</p>
                  <Button asChild variant="link" className="text-flame-600 px-0">
                    <Link to="/contact">Learn more <ArrowRight className="w-4 h-4 ml-1" /></Link>
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc) => {
                const Icon = iconMap[svc.icon] || Building2;
                return (
                  <Card key={svc.id} className="p-7 group hover:shadow-card-hover transition-all hover:-translate-y-1 duration-300">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-flame-50 to-flame-100 flex items-center justify-center mb-5">
                      <Icon className="w-7 h-7 text-flame-600" />
                    </div>
                    <h3 className="text-xl font-heading font-bold mb-2">{svc.service_name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{svc.short_description}</p>
                    {svc.features?.length > 0 && (
                      <ul className="space-y-1.5 mb-5">
                        {svc.features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="w-1.5 h-1.5 rounded-full bg-flame-500 mt-1.5 flex-shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Button asChild variant="link" className="text-flame-600 px-0 group-hover:gap-2 transition-all">
                      <Link to="/contact">Enquire <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" /></Link>
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Need a Custom Solution?"
        subtitle="Our advisory team can tailor any service to your specific needs. Let's discuss your requirements."
        primaryLabel="Book a Consultation"
        secondaryLabel="View Properties"
      />
    </div>
  );
}