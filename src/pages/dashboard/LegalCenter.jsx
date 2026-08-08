import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Scale, FileText, CheckCircle, Clock } from 'lucide-react';
import DashboardModuleShell, { StatusPill, EmptyState, formatDate } from '@/components/dashboard/DashboardModuleShell';

export default function LegalCenter() {
  const [docs, setDocs] = useState([]);
  const [sigs, setSigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.LegalDocument.list('-created_date', 50).catch(() => []),
      base44.entities.ESignature.list('-created_date', 50).catch(() => []),
    ]).then(([d, s]) => { setDocs(d); setSigs(s); }).finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => [
    { label: 'Pending Reviews', value: docs.filter((d) => d.verification_status === 'pending').length, icon: Clock, color: 'warning' },
    { label: 'Verified', value: docs.filter((d) => d.verification_status === 'verified').length, icon: CheckCircle, color: 'success' },
    { label: 'POA Submissions', value: docs.filter((d) => d.legal_document_type === 'power_of_attorney').length, icon: FileText, color: 'info' },
    { label: 'Signatures Pending', value: sigs.filter((s) => !['signed', 'declined', 'voided', 'expired'].includes(s.status)).length, icon: Scale, color: 'flame' },
  ], [docs, sigs]);

  return (
    <DashboardModuleShell title="Legal" description="Review legal documents, verify titles, and manage e-signatures." icon={Scale} stats={stats} loading={loading}>
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-heading text-base font-bold text-brand-900">Legal Documents</h3>
          {docs.length === 0 ? (
            <EmptyState icon={FileText} title="No legal documents" description="Title documents and legal filings will appear here." />
          ) : (
            <div className="grid gap-3">
              {docs.slice(0, 10).map((d) => (
                <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 shadow-card">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium capitalize text-brand-900">{(d.legal_document_type || 'document').replace(/_/g, ' ')}</p>
                      <StatusPill status={d.verification_status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{d.owner_name || d.property_reference || '—'} {d.issued_by ? `· ${d.issued_by}` : ''}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">{formatDate(d.issue_date || d.created_date)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-3 font-heading text-base font-bold text-brand-900">E-Signature Requests</h3>
          {sigs.length === 0 ? (
            <EmptyState icon={Scale} title="No signature requests" description="Pending e-signature requests will appear here." />
          ) : (
            <div className="grid gap-3">
              {sigs.slice(0, 10).map((s) => (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 shadow-card">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-brand-900">{s.document_title || 'Untitled document'}</p>
                      <StatusPill status={s.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{s.signer_name || '—'} {s.signer_email ? `· ${s.signer_email}` : ''}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">{formatDate(s.signed_at || s.created_date)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardModuleShell>
  );
}