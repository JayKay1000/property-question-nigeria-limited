import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHero from '@/components/marketing/PageHero';
import CTASection from '@/components/marketing/CTASection';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, GraduationCap, Stethoscope, Leaf, Building, HandHeart } from 'lucide-react';
import { csrCategoryLabels } from '@/lib/marketing-utils';

const categoryIcons = {
  education: GraduationCap,
  health: Stethoscope,
  environment: Leaf,
  community: Users,
  youth_empowerment: Heart,
  infrastructure: Building,
  charity: HandHeart,
};

export default function CSR() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.CSRProject.filter({ is_active: true }, 'sort_order', 30);
        setProjects(data);
      } catch (e) { /* empty */ }
      setLoading(false);
    })();
  }, []);

  const totalBeneficiaries = projects.reduce((sum, p) => sum + (p.beneficiary_count || 0), 0);

  return (
    <div className="min-h-screen">
      <PageHero
        title="Corporate Social Responsibility"
        subtitle="Giving back to the communities that make our work possible — through education, health, environment, and empowerment initiatives."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'CSR' }]}
      />

      {/* Impact Stats */}
      <section className="section-pad py-12 lg:py-16">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-heading font-bold text-flame-600">{projects.length || 0}+</p>
              <p className="text-sm text-muted-foreground mt-1">Initiatives</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-heading font-bold text-flame-600">{totalBeneficiaries.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">Beneficiaries</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-heading font-bold text-flame-600">7</p>
              <p className="text-sm text-muted-foreground mt-1">Focus Areas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-heading font-bold text-flame-600">36</p>
              <p className="text-sm text-muted-foreground mt-1">States Reach</p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="bg-ice-50 section-pad py-16 lg:py-24">
        <div className="container-wide">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Our CSR Initiatives</h2>
          {loading ? (
            <div className="flex justify-center"><div className="w-8 h-8 border-4 border-flame-200 border-t-flame-500 rounded-full animate-spin" /></div>
          ) : projects.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(csrCategoryLabels).map(([key, label]) => {
                const Icon = categoryIcons[key] || Heart;
                return (
                  <Card key={key} className="p-7">
                    <div className="w-12 h-12 rounded-xl bg-flame-50 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-flame-600" />
                    </div>
                    <h3 className="font-heading font-semibold mb-2">{label}</h3>
                    <p className="text-sm text-muted-foreground">We actively invest in {label.toLowerCase()} initiatives across Nigeria, making a measurable difference in communities.</p>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => {
                const Icon = categoryIcons[p.csr_category] || Heart;
                return (
                  <Card key={p.id} className="overflow-hidden hover:shadow-card-hover transition-shadow">
                    {p.image_url && (
                      <div className="aspect-video overflow-hidden bg-gradient-to-br from-brand-100 to-ice-100">
                        <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-flame-50 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-flame-600" />
                        </div>
                        <Badge variant="secondary" className="bg-ice-50 text-ice-700 border-0">{csrCategoryLabels[p.csr_category]}</Badge>
                      </div>
                      <h3 className="font-heading font-bold mb-2">{p.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{p.description}</p>
                      <div className="flex items-center justify-between text-sm pt-3 border-t">
                        {p.location && <span className="text-muted-foreground">{p.location}</span>}
                        <Badge variant="outline" className="capitalize">{p.status}</Badge>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection
        title="Want to Partner With Us?"
        subtitle="We collaborate with organisations and individuals who share our commitment to community development."
        primaryLabel="Get in Touch"
        primaryHref="/contact"
        secondaryLabel="Learn About Us"
        secondaryHref="/about"
      />
    </div>
  );
}