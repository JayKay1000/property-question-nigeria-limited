import React from "react";
import { Field } from "@/components/auth/RegControls";

export default function AgentBankingStep({ form, set }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-1 text-sm font-semibold text-brand-900">Banking Information</h3>
        <p className="mb-3 text-xs text-muted-foreground">Used for future commission payouts.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Account name" value={form.bankAccountName} onChange={(v) => set("bankAccountName", v)} required />
          <Field label="Account number" value={form.bankAccountNumber} onChange={(v) => set("bankAccountNumber", v)} required />
          <Field label="Bank name" value={form.bankName} onChange={(v) => set("bankName", v)} required />
        </div>
      </div>
      <div className="border-t border-border pt-4">
        <h3 className="mb-3 text-sm font-semibold text-brand-900">Emergency Contact</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" value={form.emergencyName} onChange={(v) => set("emergencyName", v)} required />
          <Field label="Relationship" value={form.emergencyRelationship} onChange={(v) => set("emergencyRelationship", v)} placeholder="Sibling" />
          <Field label="Phone number" value={form.emergencyPhone} onChange={(v) => set("emergencyPhone", v)} type="tel" required />
          <Field label="Email" value={form.emergencyEmail} onChange={(v) => set("emergencyEmail", v)} type="email" />
        </div>
      </div>
    </div>
  );
}