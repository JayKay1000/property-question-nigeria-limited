import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, GraduationCap, BadgeCheck, Smartphone, Globe, BarChart3, ArrowRight, LogIn, Loader2, ChevronDown, Users, Award, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { AGENT_BENEFITS, FAQ_ITEMS } from '@/lib/agent-utils';
import AgentSearchBar from '@/components/agents/AgentSearchBar';
import AgentFilterPanel from '@/components/agents/AgentFilterPanel';
import AgentCard from '@/components/agents/AgentCard';

const defaultFilters = { keyword: '', state: '', verification: '', specialization: '', verifiedOnly: false, topRated: false };
const ICON_MAP = { TrendingUp, GraduationCap, BadgeCheck, Smartphone, Globe, BarChart3 };

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [showFilters, setShowFilters] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Agent.list('-created_date', 200).catch(() => []),
      base44.entities.LookupState.list('sort_order', 100).catch(() => []),
    ]).then(([a, s]) => { setAgents(a.filter((ag) => ag.status === 'active')); setStates(s); }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = [...agents];
    const f = filters;
    if (f.keyword) {
      const kw = f.keyword.toLowerCase();
      result = result.filter((a) => a.full_name?.toLowerCase().includes(kw) || a.agent_code?.toLowerCase().includes(kw) || a.specialization?.toLowerCase().includes(kw));
    }
    if (f.state) result = result.filter((a) => a.service_areas?.some((sa) => sa.toLowerCase().includes(f.state.toLowerCase())));
    if (f.verification === 'verified') result = result.filter((a) => a.verification_status === 'verified' || a.status === 'verified' || a.status === 'active');
    else if (f.verification) result = result.filter((a) => a.status === f.verification);
    if (f.specialization) result = result.filter((a) => a.specialization?.toLowerCase().includes(f.specialization.toLowerCase()));
    if (f.verifiedOnly) result = result.filter((a) => a.verification_status === 'verified');
    if (f.topRated) result = result.filter((a) => (a.rating || 0) >= 4);
    return result;
  }, [agents, filters]);

  const stats = [
    { label: 'Active Agents', value: agents.filter((a) => a.status === 'active').length },
    { label: 'Verified Agents', value: agents.filter((a) => a.verification_status === 'verified').length },
    { label: 'Total Sales', value: agents.reduce((s, a) => s + (a.total_sales || 0), 0) },
    { label: 'States Covered', value: states.length },
  ];

  return (
    <div className="min-h-screen bg-ice-50 pb-20 pt-24 lg:pt-28">
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900 pb-14 pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800" />
        <div className="container-wide section-pad relative">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-flame-500/20 px-3 py-1 text-xs font-semibold text-flame-300">
                <BadgeCheck className="h-3 w-3" /> Join Our Agent Network
              </span>
              <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
                Become a <span className="text-flame-500">Verified Agent</span>
              </h1>
              <p className="mt-4 text-lg text-white/70">
                Join Property Question Nigeria's elite network of real estate professionals. Get verified, certified, and start earning competitive commissions nationwide.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-flame-500 hover:bg-flame-600">
                  <Link to="/agents/register"><TrendingUp className="mr-2 h-5 w-5" /> Apply Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  <Link to="/login"><LogIn className="mr-2 h-5 w-5" /> Agent Login</Link>
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                    <p className="font-heading text-3xl font-bold text-flame-500">{s.value}</p>
                    <p className="mt-1 text-sm text-white/60">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container-wide section-pad mt-10">
        <div className="mb-6 text-center">
          <h2 className="font-heading text-2xl font-bold text-brand-900">Why Join Property Question?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Everything you need to succeed as a real estate professional</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {AGENT_BENEFITS.map((b, i) => {
            const Icon = ICON_MAP[b.icon] || TrendingUp;
            return (
              <div key={i} className="rounded-xl border border-brand-100 bg-white p-5 transition hover:border-flame-200 hover:shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-flame-50 text-flame-600"><Icon className="h-6 w-6" /></div>
                <h3 className="mt-3 font-heading text-base font-bold text-brand-900">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Verification process */}
      <section className="container-wide section-pad mt-10">
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-ice-50 to-white p-6 sm:p-10">
          <div className="mb-6 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-flame-500" />
            <h2 className="mt-3 font-heading text-2xl font-bold text-brand-900">Our Verification Process</h2>
            <p className="mt-2 text-sm text-muted-foreground">A rigorous multi-stage verification ensuring only qualified agents represent our brand</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '1', title: 'Register', desc: 'Complete the online application form' },
              { step: '2', title: 'Upload Documents', desc: 'Submit ID, photo, and utility bill' },
              { step: '3', title: 'Verification', desc: 'Identity, compliance & background review' },
              { step: '4', title: 'Get Certified', desc: 'Receive your verified agent badge' },
            ].map((s, i) => (
              <div key={i} className="relative rounded-xl border border-brand-100 bg-white p-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-flame-500 font-heading text-sm font-bold text-white">{s.step}</span>
                <h3 className="mt-3 font-heading text-sm font-bold text-brand-900">{s.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Directory */}
      <section className="container-wide section-pad mt-10">
        <div className="mb-6 text-center">
          <Users className="mx-auto h-8 w-8 text-brand-700" />
          <h2 className="mt-2 font-heading text-2xl font-bold text-brand-900">Find an Agent</h2>
          <p className="mt-1 text-sm text-muted-foreground">Browse our network of verified real estate professionals</p>
        </div>
        <AgentSearchBar filters={filters} setFilters={setFilters} states={states} onSearch={() => {}} />
        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-28">
              <AgentFilterPanel filters={filters} setFilters={setFilters} onClear={() => setFilters({ ...defaultFilters })} />
            </div>
          </aside>
          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-flame-500" />
                <p className="mt-4 text-sm text-muted-foreground">Loading agents...</p>
              </div>
            ) : filtered.length > 0 ? (
              <>
                <p className="mb-4 text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? 'agent' : 'agents'} found</p>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filtered.slice(0, 12).map((a) => <AgentCard key={a.id} agent={a} />)}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-20 text-center">
                <Users className="h-12 w-12 text-brand-200" />
                <h3 className="mt-4 font-heading text-lg font-semibold text-brand-900">No Agents Found</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">No agents match your search. Try adjusting filters or be the first to join.</p>
                <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
                  <Link to="/agents/register"><TrendingUp className="mr-2 h-4 w-4" /> Become an Agent</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-wide section-pad mt-12">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center font-heading text-2xl font-bold text-brand-900">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-brand-100 bg-white">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left">
                  <span className="font-heading text-sm font-bold text-brand-900">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && <div className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-wide section-pad mt-12">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 p-8 text-center sm:p-12">
          <Award className="mx-auto h-12 w-12 text-flame-500" />
          <h2 className="mt-4 font-heading text-2xl font-bold text-white sm:text-3xl">Ready to Start Your Real Estate Career?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/70">Join our network today and take the first step toward a rewarding career in Nigerian real estate.</p>
          <Button asChild size="lg" className="mt-6 bg-flame-500 hover:bg-flame-600">
            <Link to="/agents/register"><TrendingUp className="mr-2 h-5 w-5" /> Apply Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}