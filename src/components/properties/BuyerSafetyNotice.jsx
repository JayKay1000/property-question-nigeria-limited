import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function BuyerSafetyNotice() {
  return (
    <div className="rounded-xl border border-warning/20 bg-warning/5 p-4">
      <div className="flex gap-3">
        <ShieldAlert className="h-5 w-5 shrink-0 text-warning" />
        <div>
          <h3 className="text-sm font-semibold text-brand-900">Buyer Safety Notice</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            PQNL does not inspect, authenticate, or guarantee any marketplace listing. Protect yourself:
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
              <span>Independently verify property ownership and title documents before any payment.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
              <span>Confirm the advertiser has authority to market the property.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
              <span>Inspect the property in person and confirm its availability.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
              <span>Use qualified legal and property professionals for due diligence.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
              <span>Never pay deposits or full amounts to unverified recipients. Avoid wire transfers to personal accounts.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
              <span>Report suspicious advertisements using the "Report this listing" button below.</span>
            </li>
          </ul>
          <p className="mt-2 text-[10px] italic text-muted-foreground/80">
            Agent identity verification confirms only the agent's identity, not the property's legitimacy.
            Property verification confirms evidence was reviewed under the stated scope — it does not constitute
            a land registry search, title confirmation, or legal ownership guarantee.
          </p>
        </div>
      </div>
    </div>
  );
}