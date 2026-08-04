import React from "react";
import { CheckRow } from "@/components/auth/RegControls";

export default function ConsentStep({ form, set }) {
  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
        Please review and accept our legal documents to create your account. Your consent is recorded with a timestamp.
      </div>
      <CheckRow id="terms" label="I agree to the " link="Terms of Service" linkTo="/terms" checked={form.termsAccepted} onChange={(v) => set("termsAccepted", v)} />
      <CheckRow id="privacy" label="I agree to the " link="Privacy Policy" linkTo="/privacy" checked={form.privacyAccepted} onChange={(v) => set("privacyAccepted", v)} />
      <CheckRow id="cookie" label="I agree to the " link="Cookie Policy" linkTo="/cookies" checked={form.cookieAccepted} onChange={(v) => set("cookieAccepted", v)} />
      <CheckRow id="data" label="I consent to " link="Data Processing" linkTo="/privacy" checked={form.dataProcessingAccepted} onChange={(v) => set("dataProcessingAccepted", v)} />
    </div>
  );
}