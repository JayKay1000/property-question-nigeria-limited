import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DocVerificationStats from '@/components/admin/docs/DocVerificationStats';
import DocVerificationCard from '@/components/admin/docs/DocVerificationCard';
import MediaPreviewDialog from '@/components/admin/media/MediaPreviewDialog';
import { fileNameFromUrl } from '@/lib/media-download';

const AGENT_DOC_LABELS = {
  government_id: 'Government ID', passport_photograph: 'Passport Photograph', utility_bill: 'Utility Bill',
  professional_certificate: 'Professional Certificate', signed_agreement: 'Signed Agreement',
  agency_license: 'Agency License', tax_identification: 'Tax Identification', bank_verification: 'Bank Verification',
  proof_of_address: 'Proof of Address', employment_letter: 'Employment Letter', drivers_license: "Driver's License",
  national_id: 'National ID', international_passport: 'International Passport', voter_card: "Voter's Card",
  selfie_with_id: 'Selfie with ID', cac_certificate: 'CAC Certificate', other: 'Other',
};

const SOURCE_LABEL = {
  agent_kyc: 'Agent KYC / ID',
  customer_doc: 'Customer Document',
  property_listing: 'Property Listing Doc',
  property_submission: 'Submission Doc',
};

export default function DocumentVerificationHub() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('all');
  const [vStatus, setVStatus] = useState('all');
  const [preview, setPreview] = useState(null);
  const [busyKey, setBusyKey] = useState(null);
  const [verifier, setVerifier] = useState({ id: '', name: '' });

  useEffect(() => {
    base44.auth.me().then((u) => setVerifier({ id: u?.id || '', name: u?.full_name || u?.email || '' })).catch(() => {});
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [agentDocs, customerDocs, listings, submissions] = await Promise.all([
        base44.entities.AgentDocument.list('-created_date', 500).catch(() => []),
        base44.entities.CustomerDocument.list('-created_date', 500).catch(() => []),
        base44.entities.PropertyListing.list('-created_date', 500).catch(() => []),
        base44.entities.PropertySubmission.list('-created_date', 500).catch(() => []),
      ]);
      const list = [];
      (Array.isArray(agentDocs) ? agentDocs : []).forEach((d) => {
        if (d.file_url) list.push({
          key: `ag-${d.id}`, source: 'agent_kyc', file_url: d.file_url,
          file_name: fileNameFromUrl(d.file_url), doc_type_label: AGENT_DOC_LABELS[d.document_type] || d.document_type || 'ID Document',
          owner_name: d.agent_name, context_title: `Agent KYC — ${d.agent_name || 'Unknown agent'}`,
          verification_status: d.verification_status || 'unverified', record_id: d.id,
        });
      });
      (Array.isArray(customerDocs) ? customerDocs : []).forEach((d) => {
        if (d.document_url) list.push({
          key: `cd-${d.id}`, source: 'customer_doc', file_url: d.document_url,
          file_name: d.document_name || fileNameFromUrl(d.document_url), doc_type_label: d.document_type || 'Document',
          owner_name: d.customer_name, context_title: `${d.customer_name || 'Customer'} — ${d.document_name || ''}`,
          verification_status: d.verified ? 'verified' : 'unverified', record_id: d.id,
        });
      });
      (Array.isArray(listings) ? listings : []).forEach((l) => {
        (l.document_urls || []).forEach((u, i) => {
          if (!u) return;
          list.push({
            key: `pl-${l.id}-${i}`, source: 'property_listing', file_url: u, file_name: fileNameFromUrl(u),
            doc_type_label: 'Property Document', owner_name: l.owner_name,
            context_title: l.property_title || 'Property listing', verification_status: 'na', record_id: l.id,
          });
        });
      });
      (Array.isArray(submissions) ? submissions : []).forEach((s) => {
        (s.documents || []).forEach((d, i) => {
          if (!d?.file_url) return;
          list.push({
            key: `ps-${s.id}-${i}`, source: 'property_submission', file_url: d.file_url,
            file_name: d.file_name || fileNameFromUrl(d.file_url), doc_type_label: d.doc_type || 'Property Document',
            owner_name: s.owner_name, context_title: s.property_title || 'Property submission',
            verification_status: 'na', record_id: s.id,
          });
        });
        if (s.poa_uploaded_url) list.push({
          key: `ps-poa-${s.id}`, source: 'property_submission', file_url: s.poa_uploaded_url, file_name: 'Power of Attorney',
          doc_type_label: 'Power of Attorney', owner_name: s.owner_name, context_title: s.property_title || 'Property submission',
          verification_status: s.poa_review_status || 'na', record_id: s.id,
        });
        if (s.signature_url) list.push({
          key: `ps-sig-${s.id}`, source: 'property_submission', file_url: s.signature_url, file_name: 'Signature',
          doc_type_label: 'Signature', owner_name: s.owner_name, context_title: s.property_title || 'Property submission',
          verification_status: 'na', record_id: s.id,
        });
      });
      setDocs(list);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      if (source !== 'all' && d.source !== source) return false;
      if (vStatus !== 'all') {
        if (vStatus === 'pending' && !['unverified', 'pending'].includes(d.verification_status)) return false;
        if (vStatus === 'verified' && d.verification_status !== 'verified') return false;
        if (vStatus === 'rejected' && d.verification_status !== 'rejected') return false;
        if (vStatus === 'na' && d.verification_status !== 'na') return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${d.context_title} ${d.owner_name} ${d.file_name} ${d.doc_type_label}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [docs, search, source, vStatus]);

  const verify = async (doc) => {
    setBusyKey(doc.key);
    try {
      const stamp = new Date().toISOString();
      if (doc.source === 'agent_kyc') {
        await base44.entities.AgentDocument.update(doc.record_id, { verification_status: 'verified', verified_by: verifier.id, verified_at: stamp });
      } else if (doc.source === 'customer_doc') {
        await base44.entities.CustomerDocument.update(doc.record_id, { verified: true, verified_by: verifier.id, verified_at: stamp });
      }
      await load();
    } finally { setBusyKey(null); }
  };

  const reject = async (doc) => {
    const reason = window.prompt('Reason for rejection (optional):') || '';
    setBusyKey(doc.key);
    try {
      const stamp = new Date().toISOString();
      if (doc.source === 'agent_kyc') {
        await base44.entities.AgentDocument.update(doc.record_id, { verification_status: 'rejected', rejection_reason: reason, verified_by: verifier.id, verified_at: stamp });
      } else if (doc.source === 'customer_doc') {
        await base44.entities.CustomerDocument.update(doc.record_id, { verified: false, verified_by: verifier.id, verified_at: stamp });
      }
      await load();
    } finally { setBusyKey(null); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Document Verification Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">Preview, download, and verify all property documents and identification files submitted by agents, homeowners, and corporate clients.</p>
      </div>

      <DocVerificationStats docs={docs} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search owner, file, type…" className="pl-8" />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-[170px]"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {Object.entries(SOURCE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={vStatus} onValueChange={setVStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="na">Listing approval</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-700" />
          <p className="mt-3 text-sm text-muted-foreground">Loading documents…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">No documents match your filters.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filtered.map((doc) => (
            <DocVerificationCard
              key={doc.key}
              doc={doc}
              onPreview={(d) => setPreview({ url: d.file_url, name: d.file_name })}
              onVerify={verify}
              onReject={reject}
              busy={busyKey === doc.key}
            />
          ))}
        </div>
      )}

      <MediaPreviewDialog media={preview} onClose={() => setPreview(null)} />
    </div>
  );
}