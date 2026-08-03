import { TrendingUp, ShieldCheck, BadgeDollarSign, Users, Eye, Lock } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';

const benefits = [
{ icon: TrendingUp, title: 'High ROI Potential', desc: 'Access curated property flipping opportunities with strong, projected returns across Nigeria.' },
{ icon: ShieldCheck, title: 'Verified Listings', desc: 'Every property is vetted and verified by our investment team before it reaches you.' },
{ icon: BadgeDollarSign, title: 'Transparent Pricing', desc: 'Clear cost breakdowns with no hidden fees or surprise charges at any stage.' },
{ icon: Users, title: 'Expert Support', desc: 'Dedicated investment advisors guide you through every flip from start to finish.' },
{ icon: Eye, title: 'Full Visibility', desc: 'Track project progress, costs, and timelines in real time on the Buy2Flip platform.' },
{ icon: Lock, title: 'Secure Transactions', desc: 'Bank-grade security protecting your investments, documents, and personal data.' }];


export default function Benefits() {
  return (
    <section className="section-pad py-20">
      <div className="container-wide">
        <Reveal>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="inline-block rounded-full bg-flame-50 px-4 py-1.5 text-sm font-medium text-flame-600">
              Why Buy2Flip
            </span>
            <h2 className="mt-4 text-3xl font-heading font-bold text-brand-900 sm:text-4xl">Subscribe with Confidence

            </h2>
            <p className="mt-3 text-muted-foreground">
              Buy2Flip combines property expertise with investment intelligence to deliver exceptional flipping opportunities.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <Reveal key={b.title} delay={i * 0.08}>
                <div className="group h-full rounded-xl border border-border bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-flame-50 text-flame-600 transition-colors group-hover:bg-flame-500 group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-heading font-semibold text-brand-900">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </div>
              </Reveal>);

          })}
        </div>
      </div>
    </section>);

}