import React from "react";
import DocumentUploader from "@/components/agents/DocumentUploader";

const REQUIRED = [
  { key: "passport_photograph", label: "Passport Photograph" },
  { key: "government_id", label: "Government-Issued ID" },
  { key: "utility_bill", label: "Utility Bill" },
  { key: "proof_of_address", label: "Proof of Address" },
  { key: "selfie_with_id", label: "Selfie Holding ID" },
];

const OPTIONAL = [
  { key: "drivers_license", label: "Driver's License" },
  { key: "national_id", label: "National ID" },
  { key: "international_passport", label: "International Passport" },
  { key: "voter_card", label: "Voter Card" },
  { key: "cac_certificate", label: "CAC Certificate (registered business)" },
];

export default function AgentIdentityStep({ docs, setDoc }) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Upload clear copies of your documents. All files are securely stored and confidentially reviewed.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REQUIRED.map((d) => (
          <DocumentUploader key={d.key} label={d.label} required onUploaded={(url) => setDoc(d.key, url)} />
        ))}
      </div>
      <div className="border-t border-border pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Additional Documents (Optional)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {OPTIONAL.map((d) => (
            <DocumentUploader key={d.key} label={d.label} onUploaded={(url) => setDoc(d.key, url)} />
          ))}
        </div>
      </div>
    </div>
  );
}