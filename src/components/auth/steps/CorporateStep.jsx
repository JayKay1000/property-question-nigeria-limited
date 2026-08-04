import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/auth/RegControls";

export default function CorporateStep({ form, set }) {
  return (
    <div className="space-y-4">
      <Field label="Company / organisation name" value={form.companyName} onChange={(v) => set("companyName", v)} placeholder="Acme Real Estate Ltd" required />
      <Field label="Company registration number (RC)" value={form.companyRegNumber} onChange={(v) => set("companyRegNumber", v)} placeholder="RC1234567" />
      <div>
        <Label className="mb-1.5 block text-sm text-brand-900">Company address</Label>
        <Textarea value={form.companyAddress} onChange={(e) => set("companyAddress", e.target.value)} rows={2} placeholder="Head office address" className="bg-ice-50" />
      </div>
      <Field label="Your role / designation" value={form.contactRole} onChange={(v) => set("contactRole", v)} placeholder="Managing Director" required />
    </div>
  );
}