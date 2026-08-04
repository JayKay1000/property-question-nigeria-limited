import React from "react";
import { User, Phone, MapPin } from "lucide-react";
import { Field, SelectField } from "@/components/auth/RegControls";

const COUNTRIES = ["Nigeria", "Ghana", "United Kingdom", "United States", "Canada", "South Africa", "UAE", "Other"];

export default function PersonalStep({ form, set }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name" value={form.firstName} onChange={(v) => set("firstName", v)} placeholder="John" required icon={User} />
        <Field label="Last name" value={form.lastName} onChange={(v) => set("lastName", v)} placeholder="Doe" required />
      </div>
      <Field label="Phone number" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+234 800 000 0000" required icon={Phone} type="tel" />
      <SelectField label="Country" value={form.country} onValueChange={(v) => set("country", v)} options={COUNTRIES.map((c) => ({ value: c, label: c }))} required />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="State" value={form.state} onChange={(v) => set("state", v)} placeholder="Lagos" required icon={MapPin} />
        <Field label="City" value={form.city} onChange={(v) => set("city", v)} placeholder="Lekki" required />
      </div>
    </div>
  );
}