import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, SelectField } from "@/components/auth/RegControls";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import { nigeriaStates } from "@/data/nigeriaLocations";

const COUNTRIES = ["Nigeria", "Ghana", "United Kingdom", "United States", "Canada", "South Africa", "UAE", "Other"];
const GENDERS = [{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "other", label: "Prefer not to say" }];
const STATE_OPTIONS = Object.keys(nigeriaStates).map((s) => ({ value: s, label: s }));

export default function AgentPersonalStep({ form, set }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="First name" value={form.firstName} onChange={(v) => set("firstName", v)} placeholder="John" required />
        <Field label="Middle name" value={form.middleName} onChange={(v) => set("middleName", v)} placeholder="Olu" />
        <Field label="Last name" value={form.lastName} onChange={(v) => set("lastName", v)} placeholder="Doe" required />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Gender" value={form.gender} onValueChange={(v) => set("gender", v)} options={GENDERS} />
        <Field label="Date of birth" value={form.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} type="date" required />
      </div>
      <SelectField label="Nationality" value={form.nationality} onValueChange={(v) => set("nationality", v)} options={COUNTRIES.map((c) => ({ value: c, label: c }))} required />
      <Field label="Official address" value={form.address} onChange={(v) => set("address", v)} placeholder="House no, street" required icon={MapPin} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="City" value={form.city} onChange={(v) => set("city", v)} required />
        <SelectField
          label="State"
          value={form.state}
          onValueChange={(v) => { set("state", v); set("lga", ""); }}
          options={STATE_OPTIONS}
          placeholder="Select state"
          required
        />
        <SelectField
          label="LGA"
          value={form.lga}
          onValueChange={(v) => set("lga", v)}
          options={(nigeriaStates[form.state] || []).map((lga) => ({ value: lga, label: lga }))}
          placeholder={form.state ? "Select LGA" : "Select state first"}
          required
        />
      </div>
      <Field label="Phone number" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+234 800 000 0000" required icon={Phone} type="tel" />
      <div className="space-y-2">
        <Label className="text-sm text-brand-900">Email <span className="text-error">*</span></Label>
        <Field value={form.email} onChange={(v) => set("email", v)} placeholder="you@example.com" type="email" icon={Mail} required />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-brand-900">Password <span className="text-error">*</span></Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type={show ? "text" : "password"}
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="••••••••"
            className="h-11 bg-ice-50 pl-10 pr-10"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-800">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <PasswordStrengthMeter password={form.password} />
      </div>
      <div className="space-y-2">
        <Label className="text-sm text-brand-900">Confirm password <span className="text-error">*</span></Label>
        <Field value={form.confirmPassword} onChange={(v) => set("confirmPassword", v)} placeholder="••••••••" type={show ? "text" : "password"} required />
      </div>
    </div>
  );
}