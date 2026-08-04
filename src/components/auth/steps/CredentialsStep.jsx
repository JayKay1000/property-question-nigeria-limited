import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/auth/RegControls";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";

export default function CredentialsStep({ form, set }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm text-brand-900">Email address <span className="text-error">*</span></Label>
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