import { useState, useEffect, useCallback } from 'react';
import { Loader2, Flag, Inbox, Clock, CheckCircle2, XCircle, AlertTriangle, Eye, Ban, RotateCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const REASON_LABELS = {
  scam_impersonation: 'Suspected scam/impersonation',
  incorrect_details: 'Incorrect details',
  duplicate: 'Suspected duplicate',
  no_longer_available: 'No longer available',
  unauthorized_advertising: 'Unauthorized advertising',
  suspicious_payment: 'Suspicious payment',
  other: 'Other concern',
};

const STATUS_CONFIG = {
  new: { label: 'New', badge: 'bg-warning/10 text-warning border-warning/20' },
  under_review: { label: 'Under Review', badge: 'bg-info/10 text-info border-info/20' },
  dismissed: { label: 'Dismissed', badge: 'bg-muted text-muted-foreground border-border' },
  escalated: { label: 'Escalated', badge: 'bg-error/10 text-error border-error/20' },
  resolved: { label: 'Resolved', badge: 'bg-success/10 text-success border-success/20' },
};

export default function MarketplaceComplaints() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null);
  const [notes, setNotes] = useState('');
  const [suspendListing, setSuspendListing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('open');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let query;
      if (tab === 'open') {
        query = { status: { $in: ['new', 'under_review', 'escalated'] } };
      } else {
        query = { status: { $in: ['dismissed', 'resolved'] } };
      }
      const result = await base44.entities.ListingReport.filter(query, { sort: '-created_date', limit: 50 });
      setReports(result.items || result);
    } catch {
      setReports([]);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleReview = async () => {
    if (!selected || !action) return;
    setError('');
    setProcessing(true);
    try {
      await base44.functions.invoke('reviewListingReport', {
        report_id: selected.id,
        action,
        review_notes: notes.trim(),
        suspend_listing: suspendListing,
      });
      setSelected(null);
      setAction(null);
      setNotes('');
      setSuspendListing(false);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Review failed.');
    }
    setProcessing(false);
  };

  const reportCount = reports.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-brand-900">
          <Flag className="h-6 w-6 text-error" /> Listing Reports & Complaints
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Review and investigate reports submitted by marketplace visitors.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-white p-1">
        <button onClick={() => setTab('open')} className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${tab === 'open' ? 'bg-brand-900 text-white' : 'text-muted-foreground hover:bg-brand-50'}`}>
          <Clock className="mr-1.5 inline h-4 w-4" /> Open Reports
        </button>
        <button onClick={() => setTab('closed')} className={`flex-1 rounded-md px-3 py-2 text-sm font-semibold transition ${tab === 'closed' ? 'bg-brand-900 text-white' : 'text-muted-foreground hover:bg-brand-50'}`}>
          <CheckCircle2 className="mr-1.5 inline h-4 w-4" /> Closed Reports
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-flame-500" /></div>
      ) : reportCount === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white py-10 text-center">
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">No {tab === 'open' ? 'open' : 'closed'} reports.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {reports.map((r) => {
            const statusCfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.new;
            return (
              <div key={r.id} className="rounded-xl border border-border bg-white p-4 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-error/10">
                      <Flag className="h-5 w-5 text-error" />
                    </div>
                    <div>
                      <p className="font-heading text-sm font-bold text-brand-900">{r.property_title || 'Unknown listing'}</p>
                      <p className="text-xs text-muted-foreground">{REASON_LABELS[r.report_reason] || r.report_reason}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className={`border-0 ${statusCfg.badge}`}>{statusCfg.label}</Badge>
                        <Badge variant="secondary" className="border-0 bg-muted text-muted-foreground">
                          {new Date(r.created_date).toLocaleDateString()}
                        </Badge>
                        {r.admin_action === 'listing_suspended' && (
                          <Badge variant="secondary" className="border-0 bg-error/10 text-error">Listing suspended</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {['new', 'under_review', 'escalated'].includes(r.status) && (
                    <Button onClick={() => { setSelected(r); setAction(null); setNotes(''); setSuspendListing(false); }} size="sm" className="bg-brand-900 text-white hover:bg-brand-800">
                      <Eye className="mr-1.5 h-3.5 w-3.5" /> Review
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review dialog */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-1 font-heading text-lg font-bold text-brand-900">Review Report</h3>
            <p className="mb-4 text-sm text-muted-foreground">{selected.property_title}</p>

            <div className="mb-4 space-y-2 rounded-xl border border-border bg-brand-50/30 p-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="border-0 bg-error/10 text-error">{REASON_LABELS[selected.report_reason]}</Badge>
                <Badge variant="secondary" className="border-0 bg-muted text-muted-foreground">{new Date(selected.created_date).toLocaleDateString()}</Badge>
              </div>
              <p className="text-sm text-brand-800">{selected.description}</p>
              {(selected.reporter_name || selected.reporter_email || selected.reporter_phone) && (
                <div className="border-t border-border/50 pt-2 text-xs text-muted-foreground">
                  <p className="font-semibold text-brand-700">Reporter contact (private):</p>
                  {selected.reporter_name && <p>Name: {selected.reporter_name}</p>}
                  {selected.reporter_email && <p>Email: {selected.reporter_email}</p>}
                  {selected.reporter_phone && <p>Phone: {selected.reporter_phone}</p>}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="mb-1.5 text-xs font-semibold text-brand-900">Investigation notes</p>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Record your findings..." rows={3} className="text-sm" />
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-error/20 bg-error/5 p-3">
                <input type="checkbox" id="suspend" checked={suspendListing} onChange={(e) => setSuspendListing(e.target.checked)} className="h-4 w-4 rounded border-border" />
                <label htmlFor="suspend" className="flex items-center gap-1.5 text-sm text-error">
                  <Ban className="h-3.5 w-3.5" /> Suspend this listing immediately
                </label>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setAction('dismiss')} variant={action === 'dismiss' ? 'default' : 'outline'}
                  className={`flex-1 ${action === 'dismiss' ? 'bg-muted text-brand-900' : 'border-border text-muted-foreground'}`}>
                  <XCircle className="mr-1.5 h-4 w-4" /> Dismiss
                </Button>
                <Button onClick={() => setAction('escalate')} variant={action === 'escalate' ? 'default' : 'outline'}
                  className={`flex-1 ${action === 'escalate' ? 'bg-error text-white' : 'border-error/30 text-error hover:bg-error/5'}`}>
                  <AlertTriangle className="mr-1.5 h-4 w-4" /> Escalate
                </Button>
                <Button onClick={() => setAction('resolve')} variant={action === 'resolve' ? 'default' : 'outline'}
                  className={`flex-1 ${action === 'resolve' ? 'bg-success text-white' : 'border-success/30 text-success hover:bg-success/5'}`}>
                  <CheckCircle2 className="mr-1.5 h-4 w-4" /> Resolve
                </Button>
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              <div className="flex gap-2">
                <Button onClick={() => setSelected(null)} variant="ghost" className="text-muted-foreground">Cancel</Button>
                <Button onClick={handleReview} disabled={!action || processing} className="flex-1 bg-brand-900 text-white hover:bg-brand-800">
                  {processing ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Processing…</> : 'Confirm Action'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}