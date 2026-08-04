import React from "react";
import { Field, CheckRow } from "@/components/auth/RegControls";
import { Label } from "@/components/ui/label";

export default function AgentDeclarationStep({ form, set }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
        By signing below, you declare that the information you have provided is accurate and complete to the best of your knowledge.
      </div>
      <CheckRow id="dec-correct" label="I certify that all information supplied is correct." checked={form.decCertCorrect} onChange={(v) => set("decCertCorrect", v)} />
      <CheckRow id="dec-terms" label="I agree to the Agent Terms." checked={form.decAgreeTerms} onChange={(v) => set("decAgreeTerms", v)} />
      <CheckRow id="dec-verify" label="I understand verification is required before approval." checked={form.decUnderstandVerify} onChange={(v) => set("decUnderstandVerify", v)} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-sm text-brand-900">Electronic signature (full name) <span className="text-error">*</span></Label>
          <Field value={form.electronicSignature} onChange={(v) => set("electronicSignature", v)} placeholder="Type your full name" required />
        </div>
        <div>
          <Label className="mb-1.5 block text-sm text-brand-900">Date</Label>
          <Field value={form.declarationDate || today} onChange={(v) => set("declarationDate", v)} type="date" />
        </div>
      </div>
    </div>
  );
}