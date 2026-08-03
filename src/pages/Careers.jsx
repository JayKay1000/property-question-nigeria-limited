import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHero from '@/components/marketing/PageHero';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Clock, Users, Heart, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { departmentLabels, formatDate } from '@/lib/marketing-utils';

const jobTypeLabels = {
  full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract', internship: 'Internship', remote: 'Remote',
};

const culture = [
  { icon: Heart, title: 'People First', description: 'A supportive culture that values every team member.' },
  { icon: TrendingUp, title: 'Growth', description: 'Continuous learning and career advancement opportunities.' },
  { icon: Award, title: 'Excellence', description: 'We celebrate achievements and reward outstanding work.' },
  { icon: Users, title: 'Collaboration', description: 'Work alongside industry leaders and innovators.' },
];

const benefits = [
  'Competitive salary packages', 'Health insurance', 'Performance bonuses',
  'Professional development fund', 'Flexible working arrangements', 'Paid time off',
  'Staff property discounts', 'Mentorship programmes',
];

export default function Careers() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await base44.entities.JobPosting.filter({ is_active: true, status: 'active' }, 'posted_date', 30);
        setJobs(data);
      } catch (e) { /* empty */ }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen">
      <PageHero
        title="Build Your Career With Us"
        subtitle="Join a team that's redefining real estate in Nigeria. Grow, innovate, and make a lasting impact."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Careers' }]}
      />

      {/* Culture */}
      <section className="section-pad py-16 lg:py-24">
        <div className="container-wide">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-3">Why Work With Us</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">Our culture is built on excellence, innovation, and genuine care for our people.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {culture.map((c) => (
              <Card key={c.title} className="p-6 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-flame-50 flex items-center justify-center mb-4">
                  <c.icon className="w-6 h-6 text-flame-600" />
                </div>
                <h3 className="font-heading font-semibold mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-ice-50 section-pad py-16 lg:py-24">
        <div className="container-wide max-w-4xl">
          <h2 className="text-3xl font-heading font-bold text-center mb-10">Employee Benefits</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-flame-500 flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="section-pad py-16 lg:py-24">
        <div className="container-wide max-w-4xl">
          <h2 className="text-3xl font-heading font-bold mb-10">Open Positions</h2>
          {loading ? (
            <div className="flex justify-center"><div className="w-8 h-8 border-4 border-flame-200 border-t-flame-500 rounded-full animate-spin" /></div>
          ) : jobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No open positions at the moment, but we're always looking for great talent.</p>
              <Button asChild className="bg-flame-500 hover:bg-flame-600 text-white border-0">
                <a href="/contact">Send us your CV</a>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="p-6 hover:shadow-card-hover transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-heading font-bold mb-2">{job.job_title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="bg-flame-50 text-flame-700 border-0">{departmentLabels[job.department] || job.department}</Badge>
                        {job.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>}
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {jobTypeLabels[job.job_type]}</span>
                        {job.application_deadline && <span className="text-error">Deadline: {formatDate(job.application_deadline)}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{job.description}</p>
                    </div>
                    <Button asChild className="bg-flame-500 hover:bg-flame-600 text-white border-0 whitespace-nowrap">
                      <a href="/contact">Apply Now <ArrowRight className="w-4 h-4 ml-1" /></a>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}