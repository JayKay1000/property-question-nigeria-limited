import { useState } from 'react';
import { Loader2, Edit3, Send, Archive, RotateCcw, Eye, MapPin, Clock, XCircle, CheckCircle2, ShieldCheck, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { formatPrice, buildShortLocation, getPrimaryImage, PURPOSE_CONFIG } from '@/lib/property-utils';
import PropertyVerificationSubmit from './PropertyVerificationSubmit';

const STATUS_CONFIG = {
  draft: { label: 'Draft', badge: 'bg-brand-50 text-brand-700 border-brand-200', icon: Edit3 },
  pending_approval: { label: 'Pending Review', badge: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  published: { label: 'Published', badge: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  active: { label: 'Active', badge: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  approved: { label: 'Approved', badge: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  verified: { label: 'Verified', badge: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', badge: 'bg-error/10 text-error border-error/20', icon: XCircle },
  inactive: { label: 'Archived', badge: 'bg-muted text-muted-foreground border-border', icon: Archive },
  suspended: { label: 'Suspended', badge: 'bg-error/10 text-error border-error/20', icon: XCircle },
};

const PROP_VERIF_CONFIG = {
  not_submitted: { label: '', badge: '' },
  pending: { label: 'Verification Pending', badge: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Property Verified', badge: 'bg-flame/10 text-flame-700 border-flame/20' },
  rejected: { label: 'Verification Rejected', badge: 'bg-error/10 text-error border-error/20' },
  evidence_requested: { label: 'Evidence Requested', badge: 'bg-info/10 text-info border-info/20' },
  revoked: { label: 'Verification Revoked', badge: 'bg-error/10 text-error border-error/20' },
};

export default function AgentListingCard({ listing, onAction, actionLoading, onVerificationDone }) {
  const [showVerify, setShowVerify] = useState(false);
  const image = getPrimaryImage(listing);
  const location = buildShortLocation(listing);
  const status = STATUS_CONFIG[listing.status] || STATUS_CONFIG.draft;
  const StatusIcon = status.icon;
  const purpose = PURPOSE_CONFIG[listing.listing_purpose] || 'For Sale';
  const isPublished = ['published', 'active', 'approved', 'verified'].includes(listing.status);
  const propVerif = PROP_VERIF_CONFIG[listing.property_verification_status] || PROP_VERIF_CONFIG.not_submitted;
  const canRequestVerif = isPublished && !['pending', 'approved'].includes(listing.property_verification_status);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-brand-50/30 sm:flex-row">
      {/* Thumbnail */}
      <Link to={isPublished ? `/properties/${listing.id}` : '#'} className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-brand-50 sm:h-20 sm:w-28 sm:aspect-auto">
        {image ? (
          <Image src={image} alt={listing.title} fittingType="fit" className="h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-200"><MapPin className="h-6 w-6" /></div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-heading text-sm font-bold text-brand-900">{formatPrice(listing.price)}</p>
            <p className="truncate text-sm text-brand-800">{listing.title}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" /> {location || 'Location not set'}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${status.badge}`}>
              <StatusIcon className="h-3 w-3" /> {status.label}
            </span>
            {propVerif.label && (
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${propVerif.badge}`}>
                <Home className="h-2.5 w-2.5" /> {propVerif.label}
              </span>
            )}
          </div>
        </div>

        {/* Rejection reason */}
        {listing.status === 'rejected' && listing.marketplace_rejection_reason && (
          <div className="mt-2 rounded-lg border border-error/20 bg-error/5 p-2">
            <p className="text-xs text-error"><strong>Rejection reason:</strong> {listing.marketplace_rejection_reason}</p>
          </div>
        )}

        {/* Verification submit form */}
        {showVerify && (
          <div className="mt-2">
            <PropertyVerificationSubmit
              listing={listing}
              onDone={() => { setShowVerify(false); onVerificationDone?.(); }}
              onCancel={() => setShowVerify(false)}
            />
          </div>
        )}

        {/* Actions */}
        {!showVerify && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Button asChild size="sm" variant="outline" className="h-7 border-brand-200 px-2.5 text-xs hover:bg-brand-50">
              <Link to={`/marketplace/agent/properties/${listing.id}/edit`}><Edit3 className="mr-1 h-3 w-3" /> Edit</Link>
            </Button>

            {(listing.status === 'draft' || listing.status === 'rejected') && (
              <Button
                onClick={() => onAction('submit', listing)}
                disabled={actionLoading}
                size="sm"
                className="h-7 bg-flame-500 px-2.5 text-xs text-white hover:bg-flame-600"
              >
                {actionLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Send className="mr-1 h-3 w-3" />}
                Submit for Review
              </Button>
            )}

            {canRequestVerif && (
              <Button
                onClick={() => setShowVerify(true)}
                size="sm"
                variant="outline"
                className="h-7 border-flame/30 px-2.5 text-xs text-flame-600 hover:bg-flame/5"
              >
                <ShieldCheck className="mr-1 h-3 w-3" /> Verify Property
              </Button>
            )}

            {isPublished && (
              <Button
                onClick={() => onAction('archive', listing)}
                disabled={actionLoading}
                size="sm"
                variant="outline"
                className="h-7 border-brand-200 px-2.5 text-xs hover:bg-brand-50"
              >
                {actionLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Archive className="mr-1 h-3 w-3" />}
                Archive
              </Button>
            )}

            {listing.status === 'inactive' && (
              <Button
                onClick={() => onAction('reactivate', listing)}
                disabled={actionLoading}
                size="sm"
                variant="outline"
                className="h-7 border-success/30 px-2.5 text-xs text-success hover:bg-success/5"
              >
                {actionLoading ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RotateCcw className="mr-1 h-3 w-3" />}
                Reactivate
              </Button>
            )}

            {isPublished && (
              <Button asChild size="sm" variant="ghost" className="h-7 px-2.5 text-xs text-muted-foreground hover:bg-brand-50">
                <Link to={`/properties/${listing.id}`}><Eye className="mr-1 h-3 w-3" /> View</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}