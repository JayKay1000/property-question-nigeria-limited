import React, { useState, useEffect } from 'react';
import { FileText, Loader2, ShieldCheck, ShieldAlert, Eye, Download, Paperclip } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Image } from '@/components/ui/image';
import { Badge } from '@/components/ui/badge';

const DOC_TYPE_LABELS = {
  government_id: 'Government ID',
  passport_photograph: 'Passport Photograph',
  utility_bill: 'Utility Bill',
  professional_certificate: 'Professional Certificate',
  signed_agreement: 'Signed Agreement',
  agency_license: 'Agency License',
  tax_identification: 'Tax Identification',
  bank_verification: 'Bank Verification',
  proof_of_address: 'Proof of Address',
  employment_letter: 'Employment Letter',
  drivers_license: "Driver's License",
  national_id: 'National ID',
  international_passport: 'International Passport',
  voter_card: 'Voter Card',
  selfie_with_id: 'Selfie with ID',
  cac_certificate: 'CAC Certificate',
  other: 'Other Document',
};

const VERIFICATION_TONE = {
  unverified: 'bg-slate-100 text-slate-600',
  pending: 'bg-amber-100 text-amber-700',
  verified: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  expired: 'bg-orange-100 text-orange-700',
};

const IMAGE_RE = /\.(jpe?g|png|webp|gif|bmp)(\?|$)/i;

function isImageUrl(url) {
  return !!url && IMAGE_RE.test(url);
}

export default function AgentDocumentsPanel({ userId }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    base44.entities.AgentDocument.filter({ agent_id: userId }, '-created_date', 50)
      .catch(() => [])
      .then((list) => setDocs(Array.isArray(list) ? list : []))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading uploaded documents…
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        <Paperclip className="h-4 w-4" /> No documents uploaded by this applicant.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-brand-700" />
        <h4 className="text-sm font-semibold text-foreground">Uploaded Documents</h4>
        <span className="text-xs text-muted-foreground">({docs.length})</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {docs.map((d) => {
          const img = isImageUrl(d.file_url) || isImageUrl(d.thumbnail_url);
          const src = d.file_url || d.thumbnail_url;
          return (
            <div key={d.id} className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="flex h-32 items-center justify-center bg-muted/40">
                {img ? (
                  <a href={d.file_url} target="_blank" rel="noreferrer" className="block h-full w-full">
                    <Image src={src} alt={DOC_TYPE_LABELS[d.document_type] || 'Document'} fittingType="fill" className="h-full w-full" />
                  </a>
                ) : (
                  <a href={d.file_url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-1 text-brand-700 hover:text-flame-600">
                    <FileText className="h-9 w-9" />
                    <span className="text-xs font-medium">View file</span>
                  </a>
                )}
              </div>
              <div className="space-y-1 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-foreground">{DOC_TYPE_LABELS[d.document_type] || d.document_type}</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${VERIFICATION_TONE[d.verification_status] || 'bg-slate-100 text-slate-600'}`}>
                    {d.verification_status || 'unverified'}
                  </span>
                </div>
                {d.document_number && <p className="text-xs text-muted-foreground">No: {d.document_number}</p>}
                {d.issued_by && <p className="text-xs text-muted-foreground">Issued by: {d.issued_by}</p>}
                <div className="flex gap-2 pt-1">
                  {d.file_url && (
                    <a href={d.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-flame-600">
                      <Eye className="h-3.5 w-3.5" /> View
                    </a>
                  )}
                  {d.file_url && (
                    <a href={d.file_url} download className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}