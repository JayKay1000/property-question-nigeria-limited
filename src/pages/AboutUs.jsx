import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHero from '@/components/marketing/PageHero';
import CTASection from '@/components/marketing/CTASection';
import LeadershipTeam from '@/components/about/LeadershipTeam';
import { Card } from '@/components/ui/card';
import { Target, Eye, Heart, Award, MapPin, TrendingUp, Users, Building2 } from 'lucide-react';
import { formatDate } from '@/lib/marketing-utils';

const coreValues = [
{ icon: Target, title: 'Excellence', description: 'We deliver to the highest international standards in everything we do.' },
{ icon: Heart, title: 'Integrity', description: 'Transparency and honesty guide every transaction and relationship.' },
{ icon: Award, title: 'Innovation', description: 'We embrace technology and innovation to serve our clients better.' },
{ icon: Users, title: 'Client Focus', description: 'Our clients are at the centre of every decision we make.' }];


export default function AboutUs() {
  const [team, setTeam] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [t, m, a] = await Promise.all([
        base44.entities.TeamMember.filter({ is_active: true, leadership_level: 'executive' }, 'sort_order', 10),
        base44.entities.CompanyMilestone.filter({ is_active: true }, 'sort_order', 20),
        base44.entities.CompanyAward.filter({ is_active: true }, 'sort_order', 10)]
        );
        setTeam(t);setMilestones(m);setAwards(a);
      } catch (e) {/* empty state */}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <PageHero
        title="PROPERTY QUESTION NIGERIA LIMITED"
        subtitle="Building Nigeria's most trusted real estate, construction, and property management enterprise — one home, one investment, one community at a time."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About Us' }]} />
      

      {/* Mission & Vision */}
      <section className="section-pad py-16 lg:py-24">
        <div className="container-wide grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8 lg:p-10 border-l-4 border-l-flame-500">
            <Target className="w-10 h-10 text-flame-500 mb-4" />
            <h2 className="text-2xl font-heading font-bold mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">To become a pillar of success and unparalleled authority by: 
- Reaching a minimum of 100,000 potential clients daily. 
- Ensuring customer satisfaction 
- Operating with the highest standards of corporate governance - Minimising property-related risks 
- Becoming a globally recognized R



            </p>
          </Card>
          <Card className="p-8 lg:p-10 border-l-4 border-l-ice-500">
            <Eye className="w-10 h-10 text-ice-500 mb-4" />
            <h2 className="text-2xl font-heading font-bold mb-3">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">To become a household name in the Nigerian Real Estate industry.


            </p>
          </Card>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-ice-50 section-pad py-16 lg:py-24">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">The principles that guide every decision and every relationship.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((v) => <Card key={v.title} className="p-6 text-center hover:shadow-card-hover transition-shadow">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-flame-50 flex items-center justify-center mb-4">
                  <v.icon className="w-7 h-7 text-flame-600" />
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Company Story / Milestones */}
      <section className="section-pad py-16 lg:py-24">
        <div className="container-wide">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">Our Journey</h2>
          {loading ? <div className="flex justify-center"><div className="w-8 h-8 border-4 border-flame-200 border-t-flame-500 rounded-full animate-spin" /></div> : milestones.length === 0 ? <p className="text-center text-muted-foreground">Milestones will be displayed here.</p> :

          <div className="relative max-w-4xl mx-auto">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />
              {milestones.map((m, i) =>
            <div key={m.id} className={`relative mb-8 md:mb-12 flex ${i % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}>
                  <div className={`pl-12 md:pl-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <Card className="p-5">
                      <span className="inline-block px-3 py-1 rounded-full bg-flame-50 text-flame-700 text-xs font-semibold mb-2">{m.year}</span>
                      <h3 className="font-heading font-semibold mb-1">{m.title}</h3>
                      <p className="text-sm text-muted-foreground">{m.description}</p>
                    </Card>
                  </div>
                  <div className="absolute left-4 md:left-1/2 top-4 w-3 h-3 rounded-full bg-flame-500 ring-4 ring-flame-100 md:-translate-x-1/2" />
                </div>
            )}
            </div>
          }
        </div>
      </section>

      <LeadershipTeam />

      {/* Awards */}
      {awards.length > 0 &&
      <section className="section-pad py-16 lg:py-24">
          <div className="container-wide">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">Awards & Recognitions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {awards.map((a) =>
            <Card key={a.id} className="p-6 text-center">
                  <Award className="w-10 h-10 text-flame-500 mx-auto mb-3" />
                  <h3 className="font-heading font-semibold mb-1">{a.award_name}</h3>
                  <p className="text-sm text-muted-foreground">{a.awarding_body}</p>
                  <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-ice-50 text-ice-700 text-xs font-semibold">{a.year_received}</span>
                </Card>
            )}
            </div>
          </div>
        </section>
      }

      <CTASection />
    </div>);

}