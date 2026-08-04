import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Field, SelectField } from "@/components/auth/RegControls";

const PROPERTY_TYPES = ["Residential", "Commercial", "Land", "Industrial", "Mixed Use"];
const CONTACT_METHODS = ["Email", "Phone", "SMS", "WhatsApp"];

export default function OwnerPropertyStep({ form, set }) {
  return (
    <div className="space-y-4">
      <SelectField label="Property type" value={form.propertyType} onValueChange={(v) => set("propertyType", v)} options={PROPERTY_TYPES.map((p) => ({ value: p, label: p }))} required />
      <Field label="Property location" value={form.propertyLocation} onChange={(v) => set("propertyLocation", v)} placeholder="e.g. Lekki, Lagos" required />
      <div>
        <Label className="mb-1.5 block text-sm text-brand-900">Reason for listing <span className="text-error">*</span></Label>
        <Textarea
          value={form.reasonForListing}
          onChange={(e) => set("reasonForListing", e.target.value)}
          rows={3}
          placeholder="e.g. Selling, leasing, joint venture..."
          className="bg-ice-50"
        />
      </div>
      <SelectField label="Preferred contact method" value={form.preferredContact} onValueChange={(v) => set("preferredContact", v)} options={CONTACT_METHODS.map((c) => ({ value: c, label: c }))} />
    </div>
  );
}