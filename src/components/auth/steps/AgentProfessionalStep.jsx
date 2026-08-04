import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, SelectField } from "@/components/auth/RegControls";

const EXP_OPTIONS = [
  { value: "0-1", label: "0-1 years" },
  { value: "2-5", label: "2-5 years" },
  { value: "6-10", label: "6-10 years" },
  { value: "10+", label: "10+ years" },
];
const RE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "some", label: "Some experience" },
  { value: "experienced", label: "Experienced" },
  { value: "expert", label: "Expert" },
];

export default function AgentProfessionalStep({ form, set }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Occupation" value={form.occupation} onChange={(v) => set("occupation", v)} placeholder="Real Estate Agent" required />
        <SelectField label="Years of experience" value={form.yearsExperience} onValueChange={(v) => set("yearsExperience", v)} options={EXP_OPTIONS} />
      </div>
      <SelectField label="Real estate experience" value={form.realEstateExperience} onValueChange={(v) => set("realEstateExperience", v)} options={RE_OPTIONS} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Company (optional)" value={form.company} onChange={(v) => set("company", v)} placeholder="Agency name" />
        <Field label="LinkedIn profile (optional)" value={form.linkedin} onChange={(v) => set("linkedin", v)} placeholder="linkedin.com/in/..." />
      </div>
      <Field label="Professional certifications (optional)" value={form.certifications} onChange={(v) => set("certifications", v)} placeholder="NIESV, etc." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Areas of operation" value={form.areasOfOperation} onChange={(v) => set("areasOfOperation", v)} placeholder="Lagos, Abuja" required />
        <Field label="Preferred states" value={form.preferredStates} onChange={(v) => set("preferredStates", v)} placeholder="Lagos, Ogun" />
      </div>
      <Field label="Languages spoken" value={form.languages} onChange={(v) => set("languages", v)} placeholder="English, Yoruba" required />
      <div>
        <Label className="mb-1.5 block text-sm text-brand-900">Professional biography</Label>
        <Textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4} className="bg-ice-50" placeholder="Tell us about your experience..." />
      </div>
    </div>
  );
}