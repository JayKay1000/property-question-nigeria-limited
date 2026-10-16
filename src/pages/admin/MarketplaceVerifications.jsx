import { useState, useEffect, useCallback } from 'react';
import { Loader2, ShieldCheck, CheckCircle2, XCircle, FileText, Eye, Inbox, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { IDENTITY_DOCUMENT_TYPES, ADDRESS_DOCUMENT_TYPES } from '@/lib/marketplace-utils';
import MarketplaceListingReview from '@/components/marketplace/MarketplaceListingReview';

const ALL_DOC_TYPES = [...IDENTITY_DOCUMENT_TYPES, ...ADDRESS_DOCUMENT_TYPES];
const docLabel = (val) => ALL_DOC_TYPES.find((d) => d.value === val)?.label || val;

export default function MarketplaceVerifications() {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [selected, setSelected] = useState(null);
  const [docUrl, setDocUrl] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [action, setAction] = useState(null); // 'approve' | 'reject'
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('verifications');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pend, rec] = await Promise.all([
        base44.entities.AgentVerification.filter({ status: 'pending' }, { sort: '-submitted_at', limit: 50 }),
        base44.entities.AgentVerification.filter({ status: { $in: ['approved', 'rejected'] } }, { sort: '-reviewed_at', limit: 20 }),
      ]);
      setPending(pend.items || pend);
      setRecent(rec.items || rec);
    } catch {
      setPending([]); setRecent([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const viewDocument = async (verification) => {
    setLoadingDoc(true);
    setDocUrl(null);
    try {
      const res = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: verification.document_file_uri, expires_in: 300 });
      setDocUrl(res.signed_url);
    } catch {
      setError('Failed to load document.');
    }
    setLoadingDoc(false);
  };

  const handleReview = async () => {
    if (!selected) return;
    if (action === 'reject' && !reason.trim()) { setError('A rejection reason is required.'); return; }
    setError('');
    setProcessing(true);
    try {
      await base44.functions.invoke('reviewMarketplaceVerification', {
        verification_id: selected.id,
        action: action === 'approve' ? 'approve' : 'reject',
        rejection_reason: reason.trim(),
      });
      setSelected(null);
      setDocUrl(null);
      setAction(null);
      setReason('');
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Review failed.');
    }
    setProcessing(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-flame-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-brand-900">
          <ShieldCheck className="h-6 w-6 text-flame-500" /> Marketplace Verification Review
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Review agent identity and address verification submissions for tier upgrades.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-white p-1">
        <button onClick={() => setTab('verifications')} className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${tab === 'verifications' ? 'bg-brand-900 text-white' : 'text-muted-foreground hover:bg-brand-50'}`}>
          <ShieldCheck className="mr-1.5 inline h-4 w-4" /> Agent Verifications
        </button>
        <button onClick={() => setTab('listings')} className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${tab === 'listings' ? 'bg-brand-900 text-white' : 'text-muted-foreground hover:bg-brand-50'}`}>
          <FileText className="mr-1.5 inline h-4 w-4" /> Listing Reviews
        </button>
      </div>

      {tab === 'listings' && <MarketplaceListingReview />}

      {/* Pending queue */}
      {tab === 'verifications' && (
      <>
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-heading font-bold text-brand-900">
          <Clock className="h-4 w-4 text-warning" /> Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white py-10 text-center">
            <Inbox className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No pending verification requests.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {pending.map((v) => (
              <div key={v.id} className="rounded-xl border border-border bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${v.verification_type === 'identity' ? 'bg-info/10' : 'bg-success/10'}`}>
                      {v.verification_type === 'identity' ? <FileText className="h-5 w-5 text-info" /> : <FileText className="h-5 w-5 text-success" />}
                    </div>
                    <div>
                      <p className="font-heading text-sm font-bold text-brand-900">{v.agent_name}</p>
                      <p className="text-xs text-muted-foreground">{v.agent_email}</p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className={`border-0 ${v.verification_type === 'identity' ? 'bg-info/10 text-info' : 'bg-success/10 text-success'}`}>
                          {v.verification_type === 'identity' ? 'Tier 2: Identity' : 'Tier 3: Address'}
                        </Badge>
                        <Badge variant="secondary" className="border-0 bg-brand-50 text-brand-700">{docLabel(v.document_type)}</Badge>
                        <Badge variant="secondary" className="border-0 bg-muted text-muted-foreground">
                          {new Date(v.submitted_at).toLocaleDateString()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => { setSelected(v); setDocUrl(null); setAction(null); setReason(''); }} size="sm" className="bg-brand-900 text-white hover:bg-brand-800">
                    <Eye className="mr-1.5 h-3.5 w-3.5" /> Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review dialog */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-1 font-heading text-lg font-bold text-brand-900">Review Verification</h3>
            <p className="mb-4 text-sm text-muted-foreground">{selected.agent_name} — {selected.verification_type === 'identity' ? 'Identity' : 'Address'} verification</p>

            {/* Document viewer */}
            <div className="mb-4 rounded-xl border border-border bg-brand-50/30 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-800"><FileText className="h-3.5 w-3.5" /> {selected.document_filename}</span>
                <Button onClick={() => viewDocument(selected)} variant="outline" size="sm" disabled={loadingDoc} className="h-7 border-brand-200">
                  {loadingDoc ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Eye className="mr-1 h-3.5 w-3.5" /> View</>}
                </Button>
              </div>
              {docUrl && (
                <div className="overflow-hidden rounded-lg border border-border">
                  {docUrl.match(/\.(jpg|jpeg|png)$/i) ? (
                    <img src={docUrl} alt="Document" className="max-h-80 w-full object-contain bg-brand-50" />
                  ) : (
                    <iframe src={docUrl} title="Document" className="h-80 w-full" />
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button
                  onClick={() => setAction('approve')}
                  variant={action === 'approve' ? 'default' : 'outline'}
                  className={`flex-1 ${action === 'approve' ? 'bg-success text-white hover:bg-success/90' : 'border-success/30 text-success hover:bg-success/5'}`}
                >
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
                </Button>
                <Button
                  onClick={() => setAction('reject')}
                  variant={action === 'reject' ? 'default' : 'outline'}
                  className={`flex-1 ${action === 'reject' ? 'bg-error text-white hover:bg-error/90' : 'border-error/30 text-error hover:bg-error/5'}`}
                >
                  <XCircle className="mr-1.5 h-4 w-4" /> Reject
                </Button>
              </div>

              {action === 'reject' && (
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Rejection reason (required) — the agent will see this message."
                  rows={3}
                  className="border-error/20"
                />
              )}

              {error && <p className="text-sm text-error">{error}</p>}

              <div className="flex gap-2">
                <Button onClick={() => setSelected(null)} variant="ghost" className="text-muted-foreground">Cancel</Button>
                <Button onClick={handleReview} disabled={!action || processing} className="flex-1 bg-brand-900 text-white hover:bg-brand-800">
                  {processing ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Processing…</> : 'Confirm Review'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent reviews */}
      {recent.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-heading font-bold text-brand-900">Recently Reviewed</h2>
          <div className="space-y-2">
            {recent.map((v) => (
              <div key={v.id} className="flex items-center justify-between rounded-lg border border-border bg-white px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full ${v.status === 'approved' ? 'bg-success/10' : 'bg-error/10'}`}>
                    {v.status === 'approved' ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-error" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-brand-900">{v.agent_name}</p>
                    <p className="text-xs text-muted-foreground">{v.verification_type === 'identity' ? 'Identity' : 'Address'} · {docLabel(v.document_type)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{v.reviewer_name}</p>
                  <p className="text-xs text-muted-foreground">{v.reviewed_at && new Date(v.reviewed_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}