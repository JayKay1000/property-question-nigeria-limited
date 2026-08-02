import { ShieldCheck, Lock, FileCheck, ScrollText } from 'lucide-react';
import Reveal from '@/components/ui/Reveal';

const items = [
  { icon: Lock, title: 'Encrypted Data', desc: 'All sensitive data encrypted at rest and in transit.' },
  { icon: FileCheck, title: 'Verified Listings', desc: 'Every property undergoes rigorous verification checks.' },
  { icon: ScrollText, title: 'Full Audit Trail', desc: 'Complete transparency on all transactions and actions.' },
  { icon: ShieldCheck, title: 'Regulatory Ready', desc: 'Compliance with Nigerian data protection standards.' },
];

export default function SecurityNotice() {
  return (
    <section className="section-pad py-16">
      <div className="container-wide">
        <Reveal>
          <div className="overflow-hidden rounded-2xl bg-brand-900 p-8 text-white sm:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-flame-500/20 text-flame-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="mb-3 text-2xl font-heading font-bold sm:text-3xl">
                  Security You Can Trust
                </h2>
                <p className="text-sm leading-relaxed text-brand-200">
                  Buy2Flip is built on the same enterprise-grade security foundation as Property Question
                  Nigeria Limited. Your data, documents, and investments are protected with bank-grade
                  encryption and comprehensive audit logging.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-xl bg-white/5 p-5">
                      <Icon className="mb-3 h-6 w-6 text-flame-400" />
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className="mt-1 text-xs text-brand-200">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}