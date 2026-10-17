import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle2, XCircle, FileText, Eye, MapPin, Bed, Bath, Maximize, Clock, Inbox, Ban, RotateCcw, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Image } from '@/components/ui/image';
import { base44 } from '@/api/base44Client';
import { formatPrice, buildShortLocation, getPrimaryImage, PURPOSE_CONFIG } from '@/lib/property-utils';

export default function MarketplaceListingReview() {
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState([]);
  const [suspended, setSuspended] = useState([]);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [riskIndicators, setRiskIndicators] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [view, setView] = useState('pending');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pend, susp] = await Promise.all([
        base44.entities.Property.filter({ status: 'pending_approval' }, { sort: '-updated_date', limit: 50 }),
        base44.entities.Property.filter({ status: 'suspended' }, { sort: '-suspended_at', limit: 50 }),
      ]);
      setPending(pend.items || pend);
      setSuspended(susp.items || susp);
    } catch {
      setPending([]); setSuspended([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadRiskIndicators = async (listing) => {
    setLoadingRisk(true);
    setRiskIndicators(null);
    try {
      const res = await base44.functions.invoke('getListingRiskIndicators', { listing_id: listing.id });
      setRiskIndicators(res.data?.indicators || []);
    } catch {
      setRiskIndicators([]);
    }
    setLoadingRisk(false);
  };

  const handleReview = async () => {
    if (!selected) return;
    if (action === 'reject' && !reason.trim()) { setError('A rejection reason is required.'); return; }
    setError('');
    setProcessing(true);
    try {
      if (action === 'suspend') {
        if (!reason.trim()) { setError('A suspension reason is required.'); return; }
        await base44.functions.invoke('moderateMarketplaceListing', { listing_id: selected.id, action: 'suspend', reason: reason.trim() });
      } else if (action === 'restore') {
        await base44.functions.invoke('moderateMarketplaceListing', { listing_id: selected.id, action: 'restore' });
      } else {
        await base44.functions.invoke('reviewMarketplaceListing', { listing_id: selected.id, action, rejection_reason: reason.trim() });
      }
      setSelected(null); setAction(null); setReason(''); setRiskIndicators(null);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Action failed.');
    }
    setProcessing(false);
  };

  const openReview = (listing) => {
    setSelected(listing);
    setAction(null);
    setReason('');
    setError('');
    setRiskIndicators(null);
    loadRiskIndicators(listing);
  };

  const renderListingCard = (p, isSuspended = false) => {
    const image = getPrimaryImage(p);
    const location = buildShortLocation(p);
    return (
      <div key={p.id} className="rounded-xl border border-border bg-white p-4 shadow-card">
        <div className="flex items-start gap-3">
          <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-50">
            {image ? <Image src={image} alt={p.title} fittingType="fit" className="h-full w-full" /> : <div className="flex h-full items-center justify-center text-brand-200"><FileText className="h-5 w-5" /></div>}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-bold text-brand-900">{formatPrice(p.price)}</p>
            <p className="truncate text-sm text-brand-800">{p.title}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="border-0 bg-flame-50 text-flame-700">{PURPOSE_CONFIG[p.listing_purpose] || 'For Sale'}</Badge>
              <Badge variant="secondary" className="border-0 bg-brand-50 text-brand-700">{p.property_type || '—'}</Badge>
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {location || '—'}</span>
              {isSuspended && <Badge variant="secondary" className="border-0 bg-error/10 text-error">Suspended</Badge>}
            </div>
            {!isNaN(p.bedrooms) && <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
              {p.bedrooms != null && <span className="flex items-center gap-0.5"><Bed className="h-3 w-3" /> {p.bedrooms}</span>}
              {p.bathrooms != null && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" /> {p.bathrooms}</span>}
              {p.land_size_sqm != null && <span className="flex items-center gap-0.5"><Maximize className="h-3 w-3" /> {p.land_size_sqm} sqm</span>}
            </div>}
          </div>
          <Button onClick={() => openReview(p)} size="sm" className="bg-brand-900 text-white hover:bg-brand-800">
            <Eye className="mr-1.5 h-3.5 w-3.5" /> {isSuspended ? 'Review' : 'Review'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Sub-view toggle */}
      <div className="mb-4 flex gap-2">
        <button onClick={() => setView('pending')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === 'pending' ? 'bg-brand-900 text-white' : 'border border-border bg-white text-muted-foreground hover:bg-brand-50'}`}>
          <Clock className="mr-1 inline h-3.5 w-3.5" /> Pending ({pending.length})
        </button>
        <button onClick={() => setView('suspended')} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === 'suspended' ? 'bg-brand-900 text-white' : 'border border-border bg-white text-muted-foreground hover:bg-brand-50'}`}>
          <Ban className="mr-1 inline h-3.5 w-3.5" /> Suspended ({suspended.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-flame-500" /></div>
      ) : view === 'pending' ? (
        pending.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white py-10 text-center">
            <Inbox className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No pending listing reviews.</p>
          </div>
        ) : (
          <div className="grid gap-3">{pending.map((p) => renderListingCard(p))}</div>
        )
      ) : view === 'suspended' ? (
        suspended.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-white py-10 text-center">
            <Inbox className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 text-sm text-muted-foreground">No suspended listings.</p>
          </div>
        ) : (
          <div className="grid gap-3">{suspended.map((p) => renderListingCard(p, true))}</div>
        )
      ) : null}

      {/* Review dialog */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-1 font-heading text-lg font-bold text-brand-900">Review Listing</h3>
            <p className="mb-4 text-sm text-muted-foreground">{selected.title}</p>

            {/* Risk indicators */}
            {(loadingRisk || (riskIndicators && riskIndicators.length > 0)) && (
              <div className="mb-4 rounded-xl border border-warning/20 bg-warning/5 p-3">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" /> Risk Indicators
                </p>
                {loadingRisk ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking…</div>
                ) : (
                  <div className="space-y-1.5">
                    {riskIndicators.map((ind, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-brand-800">
                        <AlertCircle className={`mt-0.5 h-3 w-3 shrink-0 ${ind.severity === 'high' ? 'text-error' : ind.severity === 'medium' ? 'text-warning' : 'text-muted-foreground'}`} />
                        <div>
                          <p className="font-medium">{ind.label}</p>
                          {ind.type === 'potential_duplicate' && ind.details?.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {ind.details.slice(0, 3).map((d, j) => (
                                <p key={j} className="text-muted-foreground">· {d.indicator} ({Math.round(d.title_similarity * 100)}% title match{d.price_match ? ', same price' : ''})</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <p className="mt-1 text-[10px] text-muted-foreground">These are potential issues for review — not confirmed fraud.</p>
                  </div>
                )}
              </div>
            )}

            {/* Listing details */}
            <div className="mb-4 max-h-60 space-y-2 overflow-y-auto rounded-xl border border-border bg-brand-50/30 p-4">
              {getPrimaryImage(selected) && (
                <img src={getPrimaryImage(selected)} alt={selected.title} className="mb-2 aspect-[4/3] w-full rounded-lg object-cover" />
              )}
              <p className="font-heading text-lg font-bold text-brand-900">{formatPrice(selected.price)}</p>
              <p className="text-sm text-brand-700">{selected.description || 'No description provided.'}</p>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <span className="text-muted-foreground">Type:</span><span className="text-brand-900">{selected.property_type || '—'}</span>
                <span className="text-muted-foreground">Purpose:</span><span className="text-brand-900">{PURPOSE_CONFIG[selected.listing_purpose] || '—'}</span>
                <span className="text-muted-foreground">Location:</span><span className="text-brand-900">{buildShortLocation(selected) || '—'}</span>
                <span className="text-muted-foreground">Agent:</span><span className="text-brand-900">{selected.listing_agent_name || '—'}</span>
                {selected.suspension_reason && <><span className="text-muted-foreground">Suspended for:</span><span className="text-error">{selected.suspension_reason}</span></>}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {selected.status === 'pending_approval' && (
                  <>
                    <Button onClick={() => setAction('approve')} variant={action === 'approve' ? 'default' : 'outline'}
                      className={`flex-1 ${action === 'approve' ? 'bg-success text-white hover:bg-success/90' : 'border-success/30 text-success hover:bg-success/5'}`}>
                      <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve & Publish
                    </Button>
                    <Button onClick={() => setAction('reject')} variant={action === 'reject' ? 'default' : 'outline'}
                      className={`flex-1 ${action === 'reject' ? 'bg-error text-white hover:bg-error/90' : 'border-error/30 text-error hover:bg-error/5'}`}>
                      <XCircle className="mr-1.5 h-4 w-4" /> Reject
                    </Button>
                  </>
                )}
                {selected.status === 'suspended' && (
                  <Button onClick={() => setAction('restore')} variant={action === 'restore' ? 'default' : 'outline'}
                    className={`flex-1 ${action === 'restore' ? 'bg-success text-white hover:bg-success/90' : 'border-success/30 text-success hover:bg-success/5'}`}>
                    <RotateCcw className="mr-1.5 h-4 w-4" /> Restore Listing
                  </Button>
                )}
                {['published', 'active', 'approved', 'verified'].includes(selected.status) && (
                  <Button onClick={() => setAction('suspend')} variant={action === 'suspend' ? 'default' : 'outline'}
                    className={`flex-1 ${action === 'suspend' ? 'bg-error text-white hover:bg-error/90' : 'border-error/30 text-error hover:bg-error/5'}`}>
                    <Ban className="mr-1.5 h-4 w-4" /> Suspend
                  </Button>
                )}
              </div>

              {(action === 'reject' || action === 'suspend') && (
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder={`${action === 'reject' ? 'Rejection' : 'Suspension'} reason (required)`} rows={3} className="border-error/20" />
              )}

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