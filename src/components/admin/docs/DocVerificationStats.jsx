import React from 'react';
import { FileStack, ShieldCheck, Clock, XCircle, Building2 } from 'lucide-react';

export default function DocVerificationStats({ docs }) {
  const verified = docs.filter((d) => d.verification_status === 'verified').length;
  const pending = docs.filter((d) => ['unverified', 'pending'].includes(d.verification_status)).length;
  const rejected = docs.filter((d) => d.verification_status === 'rejected').length;
  const propertyDocs = docs.filter((d) => ['property_listing', 'property_submission'].includes(d.source)).length;

  const items = [
    { icon: FileStack, label: 'Total Documents', value: docs.length, tone: 'text-brand-700' },
    { icon: ShieldCheck, label: 'Verified', value: verified, tone: 'text-emerald-500' },
    { icon: Clock, label: 'Pending', value: pending, tone: 'text-amber-500' },
    { icon: XCircle, label: 'Rejected', value: rejected, tone: 'text-rose-500' },
    { icon: Building2, label: 'Property Docs', value: propertyDocs, tone: 'text-flame-500' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((it) => (
        <div key={it.label} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{it.label}</span>
            <it.icon className={`h-4 w-4 ${it.tone}`} />
          </div>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">{it.value}</p>
        </div>
      ))}
    </div>
  );
}