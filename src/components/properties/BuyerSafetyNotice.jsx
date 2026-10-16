import { ShieldAlert } from 'lucide-react';

export default function BuyerSafetyNotice() {
  return (
    <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
      <div className="flex gap-3">
        <ShieldAlert className="h-5 w-5 shrink-0 text-warning" />
        <div>
          <h3 className="text-sm font-semibold text-brand-900">Buyer Safety Notice</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Always verify property ownership, title documents, and availability independently before making any payment.
            PQNL does not inspect, authenticate, or guarantee any marketplace listing. An agent's identity verification
            confirms only their identity, not the property's legitimacy. Never pay in full before conducting your own
            due diligence and legal checks.
          </p>
        </div>
      </div>
    </div>
  );
}