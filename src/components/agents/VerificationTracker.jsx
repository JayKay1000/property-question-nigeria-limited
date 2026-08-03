import { FileText, Mail, Phone, Upload, UserCheck, ShieldCheck, Search, Award, BadgeCheck, Check, XCircle, Clock } from 'lucide-react';
import { VERIFICATION_STAGES } from '@/lib/agent-utils';

const STAGE_ICONS = { FileText, Mail, Phone, Upload, UserCheck, ShieldCheck, Search, Award, BadgeCheck };

export default function VerificationTracker({ agent }) {
  const currentIndex = (() => {
    if (agent?.verification_status === 'rejected' || agent?.status === 'rejected' || agent?.status === 'suspended' || agent?.status === 'terminated') return -1;
    const map = { pending: 0, under_review: 4, verified: 8, active: 8, inactive: 8 };
    return map[agent?.status] ?? 0;
  })();

  const isRejected = agent?.verification_status === 'rejected';

  if (isRejected) {
    return (
      <div className="rounded-xl border border-error/20 bg-error/5 p-5 text-center">
        <XCircle className="mx-auto h-10 w-10 text-error" />
        <h4 className="mt-3 font-heading text-base font-bold text-error">Verification Rejected</h4>
        <p className="mt-1 text-sm text-muted-foreground">Your application was not approved. Please contact support for more information.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-100 bg-ice-50 p-5">
      <h4 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
        <ShieldCheck className="h-4 w-4 text-flame-500" /> Verification Progress
      </h4>
      <div className="space-y-3">
        {VERIFICATION_STAGES.map((stage, i) => {
          const Icon = STAGE_ICONS[stage.icon] || Clock;
          const isComplete = i < currentIndex;
          const isActive = i === currentIndex;
          const isPending = i > currentIndex;
          return (
            <div key={stage.key} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition ${isComplete ? 'border-success bg-success text-white' : isActive ? 'border-flame-500 bg-flame-50 text-flame-500' : 'border-border bg-white text-muted-foreground'}`}>
                {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isActive ? 'text-flame-600' : isComplete ? 'text-brand-900' : 'text-muted-foreground'}`}>{stage.label}</p>
                {isActive && <p className="text-xs text-flame-500">In progress...</p>}
                {isPending && <p className="text-xs text-muted-foreground/60">Pending</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}