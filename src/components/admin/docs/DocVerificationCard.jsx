import React from 'react';
import { Download, Eye, ShieldCheck, XCircle, ExternalLink, FileText, UserCog, Building2, FileSignature } from 'lucide-react';
import { downloadFile } from '@/lib/media-download';

const STATUS_TONE = {
  verified: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  unverified: 'bg-slate-100 text-slate-600',
  rejected: 'bg-rose-100 text-rose-700',
  expired: 'bg-orange-100 text-orange-700',
  na: 'bg-slate-100 text-slate-500',
};

const SOURCE_ICON = {
  agent_kyc: UserCog,
  customer_doc: FileText,
  property_listing: Building2,
  property_submission: FileSignature,
};

export default function DocVerificationCard({ doc, onPreview, onVerify, onReject, busy }) {
  const Icon = SOURCE_ICON[doc.source] || FileText;
  const canVerify = doc.source === 'agent_kyc' || doc.source === 'customer_doc';
  const statusLabel = doc.verification_status === 'na' ? 'Listing approval' : doc.verification_status;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-heading text-sm font-bold text-foreground">{doc.context_title}</h3>
            <p className="truncate text-xs text-muted-foreground">{doc.file_name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {doc.owner_name || '—'} • {doc.doc_type_label}
            </p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${STATUS_TONE[doc.verification_status] || 'bg-slate-100 text-slate-600'}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onPreview(doc)} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
          <Eye className="h-3.5 w-3.5" /> Preview
        </button>
        <button type="button" onClick={() => downloadFile(doc.file_url, doc.file_name)} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
          <Download className="h-3.5 w-3.5" /> Download
        </button>
        {canVerify && doc.verification_status !== 'verified' && (
          <button type="button" onClick={() => onVerify(doc)} disabled={busy} className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50">
            <ShieldCheck className="h-3.5 w-3.5" /> Verify
          </button>
        )}
        {canVerify && (
          <button type="button" onClick={() => onReject(doc)} disabled={busy} className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50">
            <XCircle className="h-3.5 w-3.5" /> Reject
          </button>
        )}
        {doc.source === 'property_listing' && (
          <a href="/admin/property-review" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-muted">
            <ExternalLink className="h-3.5 w-3.5" /> Open Approval
          </a>
        )}
      </div>
    </div>
  );
}