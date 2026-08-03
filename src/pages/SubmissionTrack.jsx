import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, Search, ArrowLeft, FileText, MapPin, Calendar, CheckCircle2, Clock, AlertCircle, XCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import SubmissionCard from '@/components/submission/SubmissionCard';
import { SUBMISSION_STATUS_CONFIG, REVIEW_STAGES, formatPrice } from '@/lib/submission-utils';

export default function SubmissionTrack() {
  const [params] = useSearchParams();
  const refParam = params.get('ref');
  const [ref, setRef] = useState(refParam || '');
  const [searched, setSearched] = useState(!!refParam);
  const [submission, setSubmission] = useState(null);
  const [allSubs, setAllSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (refParam) doSearch(refParam);
    base44.entities.PropertySubmission.list('-created_date', 50).then(setAllSubs).catch(() => {});
  }, []);

  const doSearch = async (searchRef) => {
    setLoading(true);
    setError('');
    setSubmission(null);
    try {
      const results = await base44.entities.PropertySubmission.filter({ submission_reference: searchRef }, '-created_date', 1);
      if (results.length > 0) setSubmission(results[0]);
      else setError('No submission found with that reference. Please check and try again.');
    } catch {
      setError('Unable to search at this time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStageIndex = submission ? REVIEW_STAGES.findIndex((s) => s.key === submission.status) : -1;

  return (
    <div className="min-h-screen bg-ice-50 pt-20 lg:pt-24">
      <div className="container-wide section-pad py-8">
        <div className="mx-auto max-w-4xl">
          <Link to="/submit" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-900">
            <ArrowLeft className="h-4 w-4" /> Back to Submission
          </Link>

          <div className="mb-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
            <h1 className="font-heading text-2xl font-bold text-brand-900">Track Your Submission</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your tracking reference to monitor your submission status.</p>
            <div className="mt-4 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={ref} onChange={(e) => setRef(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch(ref)} placeholder="e.g. PQ-SUB-2024-0001" className="h-12 border-brand-200 bg-ice-50 pl-10" />
              </div>
              <Button onClick={() => doSearch(ref)} disabled={loading || !ref} size="lg" className="h-12 bg-flame-500 hover:bg-flame-600">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              </Button>
            </div>
            {error && <p className="mt-3 text-sm text-error">{error}</p>}
          </div>

          {/* Submission detail */}
          {submission && (
            <div className="space-y-5">
              {/* Status header */}
              <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-flame-600">{submission.submission_reference}</span>
                      <Badge variant="outline" className={SUBMISSION_STATUS_CONFIG[submission.status]?.badge}>{SUBMISSION_STATUS_CONFIG[submission.status]?.label}</Badge>
                    </div>
                    <h2 className="mt-2 font-heading text-xl font-bold text-brand-900">{submission.property_title}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {submission.owner_name}</span>
                      {submission.location_city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {submission.location_city}</span>}
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(submission.created_date).toLocaleDateString('en-NG')}</span>
                    </div>
                  </div>
                  {submission.asking_price_ngn != null && (
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Asking Price</p>
                      <p className="font-heading text-lg font-bold text-brand-900">{formatPrice(submission.asking_price_ngn)}</p>
                    </div>
                  )}
                </div>

                {/* Rejected status */}
                {submission.status === 'rejected' && submission.rejection_reason && (
                  <div className="mt-4 flex gap-3 rounded-lg border border-error/20 bg-error/5 p-3">
                    <XCircle className="h-5 w-5 shrink-0 text-error" />
                    <div>
                      <p className="text-sm font-semibold text-error">Submission Rejected</p>
                      <p className="text-sm text-muted-foreground">{submission.rejection_reason}</p>
                    </div>
                  </div>
                )}

                {/* Info requested */}
                {submission.status === 'info_requested' && submission.additional_info_request && (
                  <div className="mt-4 flex gap-3 rounded-lg border border-flame-200 bg-flame-50 p-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-flame-600" />
                    <div>
                      <p className="text-sm font-semibold text-flame-600">Additional Information Required</p>
                      <p className="text-sm text-muted-foreground">{submission.additional_info_request}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Review progress */}
              <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
                <h3 className="mb-4 font-heading text-base font-bold text-brand-900">Review Progress</h3>
                <div className="space-y-3">
                  {REVIEW_STAGES.map((stage, i) => {
                    const isComplete = i < currentStageIndex;
                    const isActive = i === currentStageIndex;
                    const isPending = i > currentStageIndex;
                    const isRejected = submission.status === 'rejected' && stage.key === 'approved';
                    return (
                      <div key={stage.key} className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${isComplete ? 'border-success bg-success text-white' : isActive ? 'border-flame-500 bg-flame-50 text-flame-500' : 'border-border bg-white text-muted-foreground'}`}>
                          {isComplete ? <CheckCircle2 className="h-4 w-4" /> : isRejected ? <XCircle className="h-4 w-4 text-error" /> : isActive ? <Clock className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isActive ? 'text-flame-600' : isComplete ? 'text-brand-900' : 'text-muted-foreground'}`}>{stage.label}</p>
                          {isActive && <p className="text-xs text-flame-500">In progress...</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assigned reviewer */}
              {submission.assigned_reviewer_name && (
                <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
                  <h3 className="mb-2 font-heading text-sm font-bold text-brand-900">Assigned Reviewer</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ice-100 text-brand-700"><User className="h-5 w-5" /></div>
                    <div>
                      <p className="text-sm font-semibold text-brand-900">{submission.assigned_reviewer_name}</p>
                      <p className="text-xs text-muted-foreground">Your dedicated review officer</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {submission.timeline?.length > 0 && (
                <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
                  <h3 className="mb-4 font-heading text-base font-bold text-brand-900">Activity Timeline</h3>
                  <div className="space-y-3">
                    {[...submission.timeline].reverse().map((t, i) => (
                      <div key={i} className="flex items-start gap-3 border-l-2 border-brand-100 pl-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-brand-900">{t.event}</p>
                          <p className="text-xs text-muted-foreground">{new Date(t.timestamp).toLocaleString('en-NG')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All submissions (if no search done) */}
          {!searched && allSubs.length > 0 && (
            <div>
              <h2 className="mb-4 font-heading text-lg font-bold text-brand-900">Recent Submissions</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {allSubs.slice(0, 8).map((s) => <SubmissionCard key={s.id} submission={s} />)}
              </div>
            </div>
          )}

          {!searched && allSubs.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
              <FileText className="h-12 w-12 text-brand-200" />
              <h3 className="mt-4 font-heading text-lg font-semibold text-brand-900">No Submissions Yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Submit your property to get started.</p>
              <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
                <Link to="/submit">Submit a Property</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}