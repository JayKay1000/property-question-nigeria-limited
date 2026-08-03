import { Rocket, ArrowRight, TrendingUp, Shield, Clock, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const BENEFITS = [
  { icon: TrendingUp, title: 'High Returns', desc: 'Access curated investment opportunities with competitive returns.' },
  { icon: Shield, title: 'Secure Investment', desc: 'All properties are verified and legally documented.' },
  { icon: Clock, title: 'Fast Flipping', desc: 'Turn around properties quickly with our network of buyers.' },
  { icon: Users, title: 'Expert Support', desc: 'Dedicated investment advisors guide you through every step.' },
];

const FAQS = [
  { q: 'What is Buy2Flip?', a: 'Buy2Flip is our property investment platform that helps you find, purchase, and flip properties for profit.' },
  { q: 'How much can I invest?', a: 'Investment opportunities range from affordable entry points to premium properties. Visit the platform for current listings.' },
  { q: 'Is my investment secure?', a: 'Yes. All Buy2Flip properties undergo the same rigorous verification as our standard listings.' },
  { q: 'How do I get started?', a: 'Click "Launch Buy2Flip" to access the dedicated platform and explore available investment opportunities.' },
];

export default function Buy2FlipGateway() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 p-6 sm:p-10">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-flame-500/20 px-3 py-1 text-xs font-semibold text-flame-300">
            <Rocket className="h-3 w-3" /> Property Investment Platform
          </span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-white">Buy2Flip</h2>
          <p className="mt-3 text-white/70">
            Access Property Question Nigeria's dedicated investment platform. Find verified properties, flip for profit, and grow your real estate portfolio with expert guidance.
          </p>
          <a href="/buy2flip" target="_blank" rel="noopener noreferrer"
            onClick={() => base44.analytics?.track?.({ eventName: 'buy2flip_launch_click', properties: { source: 'customer_portal' } })}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-flame-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-flame-600">
            <Rocket className="h-5 w-5" /> Launch Buy2Flip <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Benefits */}
      <div>
        <h3 className="mb-4 font-heading text-lg font-bold text-brand-900">Why Buy2Flip?</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="rounded-xl border border-brand-100 bg-ice-50 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-flame-50 text-flame-600"><Icon className="h-6 w-6" /></div>
                <h4 className="mt-3 font-heading text-sm font-bold text-brand-900">{b.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="mb-4 font-heading text-lg font-bold text-brand-900">Buy2Flip FAQ</h3>
        <div className="space-y-2">
          {FAQS.map((item, i) => (
            <div key={i} className="rounded-xl border border-brand-100 bg-white p-4">
              <h4 className="font-heading text-sm font-bold text-brand-900">{item.q}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-2xl border border-flame-200 bg-flame-50 p-6 text-center">
        <Rocket className="mx-auto h-10 w-10 text-flame-500" />
        <h3 className="mt-3 font-heading text-xl font-bold text-brand-900">Ready to Start Investing?</h3>
        <p className="mt-1 text-sm text-muted-foreground">Launch the Buy2Flip platform and explore investment opportunities.</p>
        <a href="/buy2flip" target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-flame-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-flame-600">
          <Rocket className="h-4 w-4" /> Launch Buy2Flip <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}