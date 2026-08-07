import React, { useState } from "react";
import { Loader2, CheckCircle2, XCircle, Clock, Mail, Phone, MapPin, Briefcase, Download, Eye, FileText, ShieldCheck, Package } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { downloadAll } from "@/lib/media-download";

const DOC_TYPE_LABELS = {
  government_id: "Government ID",
  passport_photograph: "Passport Photograph",
  utility_bill: "Utility Bill",
  professional_certificate: "Professional Certificate",
  signed_agreement: "Signed Agreement",
  agency_license: "Agency License",
  tax_identification: "Tax Identification",
  bank_verification: "Bank Verification",
  proof_of_address: "Proof of Address",
  employment_letter: "Employment Letter",
  drivers_license: "Driver's License",
  national_id: "National ID",
  international_passport: "International Passport",
  voter_card: "Voter Card",
  selfie_with_id: "Selfie with ID",
  cac_certificate: "CAC Certificate",
  other: "Other Document",
};

const IMAGE_RE = /\.(jpe?g|png|webp|gif|bmp)(\?|$)/i;
const isImageUrl = (url) => !!url && IMAGE_RE.test(url);

export default function AgentReviewSheet({ agent, docs = [], open, onClose, onDecided }) {
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [docBusy, setDocBusy] = useState(null);

  if (!agent) return null;

  const updateAgent = async (patch) => {
    setBusy(true);
    try {
      const me = await base44.auth.me().catch(() => null);
      const now = new Date().toISOString();
      const payload = { ...patch, verified_at: now };
      if (me?.id) payload.verified_by = me.id;
      if (patch.verification_status === "verified" && !agent.agent_code) {
        payload.agent_code = `PQ-AGT-${Date.now().toString().slice(-6)}`;
      }
      if (reason && patch.verification_status === "rejected") {
        payload.metadata = { ...(agent.metadata || {}), rejection_reason: reason };
      }
      await base44.entities.Agent.update(agent.id, payload);
      onDecided();
    } catch (err) {
      console.error("Agent update failed:", err);
      setBusy(false);
    }
  };

  const setDocStatus = async (doc, status) => {
    setDocBusy(doc.id);
    try {
      const me = await base44.auth.me().catch(() => null);
      await base44.entities.AgentDocument.update(doc.id, {
        verification_status: status,
        verified_by: me?.id || "",
        verified_at: new Date().toISOString(),
      });
      onDecided();
    } catch (err) {
      console.error("Doc update failed:", err);
    } finally {
      setDocBusy(null);
    }
  };

  const handleDownloadAll = () => {
    const urls = docs.filter((d) => d.file_url).map((d) => d.file_url);
    if (urls.length) downloadAll(urls, `${agent.full_name || "agent"}`);
  };

  const m = agent.metadata || {};

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Agent Application Review</SheetTitle>
        </SheetHeader>

        {/* Profile header */}
        <div className="mt-4 flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-brand-100">
            {agent.photo_url ? (
              <img src={agent.photo_url} alt={agent.full_name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-700">
                {agent.full_name?.charAt(0) || "A"}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-bold text-foreground">{agent.full_name}</h3>
            {agent.agent_code && <p className="text-xs text-muted-foreground">{agent.agent_code}</p>}
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {agent.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" />{agent.email}</span>}
              {agent.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{agent.phone}</span>}
              {agent.specialization && <span className="inline-flex items-center gap-1"><Briefcase className="h-3 w-3" />{agent.specialization}</span>}
            </div>
            {(agent.resident_state || agent.service_areas?.length) && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {agent.resident_state || agent.service_areas?.join(", ")}
              </div>
            )}
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/30 p-3 text-xs">
          {agent.resident_lga && <Info label="LGA" value={agent.resident_lga} />}
          {agent.address && <Info label="Official address" value={agent.address} />}
          {m.gender && <Info label="Gender" value={m.gender} />}
          {m.date_of_birth && <Info label="Date of birth" value={m.date_of_birth} />}
          {m.nationality && <Info label="Nationality" value={m.nationality} />}
          {m.occupation && <Info label="Occupation" value={m.occupation} />}
          {m.years_experience != null && <Info label="Years experience" value={m.years_experience} />}
          {m.company && <Info label="Company" value={m.company} />}
          {m.linkedin && <Info label="LinkedIn" value={m.linkedin} />}
          {agent.languages?.length > 0 && <Info label="Languages" value={agent.languages.join(", ")} />}
          {agent.service_areas?.length > 0 && <Info label="Service areas" value={agent.service_areas.join(", ")} />}
        </div>

        {agent.bio && (
          <div className="mt-3 rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Bio</p>
            <p className="mt-1 text-xs leading-relaxed text-foreground">{agent.bio}</p>
          </div>
        )}

        {/* Documents */}
        <div className="mt-5 rounded-xl border border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-700" />
              <h4 className="text-sm font-semibold text-foreground">Uploaded Documents</h4>
              <span className="text-xs text-muted-foreground">({docs.length})</span>
            </div>
            {docs.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                <Package className="mr-1 h-3.5 w-3.5" /> Download all
              </Button>
            )}
          </div>

          {docs.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">No documents uploaded by this applicant.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {docs.map((d) => {
                const img = isImageUrl(d.file_url) || isImageUrl(d.thumbnail_url);
                return (
                  <div key={d.id} className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="flex h-28 items-center justify-center bg-muted/40">
                      {img ? (
                        <a href={d.file_url} target="_blank" rel="noreferrer" className="block h-full w-full">
                          <img src={d.file_url || d.thumbnail_url} alt="document" className="h-full w-full object-cover" />
                        </a>
                      ) : (
                        <a href={d.file_url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-brand-700">
                          <FileText className="h-8 w-8" />
                          <span className="text-[11px] font-medium">View file</span>
                        </a>
                      )}
                    </div>
                    <div className="space-y-1.5 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-xs font-medium text-foreground">{DOC_TYPE_LABELS[d.document_type] || d.document_type}</p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                            d.verification_status === "verified"
                              ? "bg-emerald-100 text-emerald-700"
                              : d.verification_status === "rejected"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {d.verification_status || "unverified"}
                        </span>
                      </div>
                      {d.document_number && <p className="text-[11px] text-muted-foreground">No: {d.document_number}</p>}
                      {d.issued_by && <p className="text-[11px] text-muted-foreground">Issued by: {d.issued_by}</p>}
                      <div className="flex items-center gap-3 pt-1">
                        {d.file_url && (
                          <a href={d.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 hover:text-flame-600">
                            <Eye className="h-3.5 w-3.5" /> View
                          </a>
                        )}
                        {d.file_url && (
                          <a href={d.file_url} download className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
                            <Download className="h-3.5 w-3.5" /> Download
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 border-t border-border pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={docBusy === d.id || d.verification_status === "verified"}
                          onClick={() => setDocStatus(d, "verified")}
                          className="h-7 flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Verify
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={docBusy === d.id || d.verification_status === "rejected"}
                          onClick={() => setDocStatus(d, "rejected")}
                          className="h-7 flex-1 border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                          <XCircle className="mr-1 h-3 w-3" /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rejection reason */}
        {rejectOpen && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
            <label className="text-xs font-medium text-rose-700">Reason for rejection (optional)</label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="mt-1 bg-white" placeholder="e.g. Documents unclear, incomplete application…" />
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => updateAgent({ status: "under_review", verification_status: "pending" })} disabled={busy || agent.status === "under_review"}>
            <Clock className="mr-1 h-4 w-4" /> Mark Under Review
          </Button>
          {rejectOpen ? (
            <Button variant="destructive" onClick={() => updateAgent({ status: "inactive", verification_status: "rejected" })} disabled={busy} className="flex-1">
              {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />} Confirm Reject
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => setRejectOpen(true)} disabled={busy} className="flex-1">
              <XCircle className="mr-1 h-4 w-4" /> Reject
            </Button>
          )}
          <Button onClick={() => updateAgent({ status: "active", verification_status: "verified" })} disabled={busy} className="flex-1 bg-success hover:bg-success/90">
            {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-1 h-4 w-4" />} Approve Agent
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Info({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-foreground" title={value}>{value}</p>
    </div>
  );
}