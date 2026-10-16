import { Link } from 'react-router-dom';
import { Plus, Users, TrendingUp, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const benefits = [
  { icon: Users, title: 'Reach More Buyers', desc: 'Showcase your listings to thousands of property seekers across Nigeria.' },
  { icon: TrendingUp, title: 'Grow Your Business', desc: 'Connect with serious buyers and renters actively searching for property.' },
  { icon: ShieldCheck, title: 'Trusted Platform', desc: 'Benefit from PQNL brand credibility and a professional marketplace.' },
];

export default function AgentParticipation() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-ice-50">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-12">
              <span className="inline-block rounded-full bg-flame-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-flame-700">For Agents</span>
              <h2 className="mt-3 text-2xl font-heading font-bold text-brand-900">Advertise on the PQNL Marketplace</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Property Question Nigeria Limited provides a dedicated platform for agents to showcase their listings and connect with potential buyers and renters across the country.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="bg-flame-500 text-white hover:bg-flame-600">
                  <Link to="/submit"><Plus className="mr-1.5 h-4 w-4" /> Post a Property</Link>
                </Button>
                <Button asChild variant="outline" className="border-brand-200 hover:bg-white">
                  <Link to="/agents">Find Agents</Link>
                </Button>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-4 p-8 lg:p-12">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.title} className="flex items-start gap-3 rounded-xl border border-border bg-white p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-flame-50 text-flame-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-heading font-semibold text-brand-900">{b.title}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">{b.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}