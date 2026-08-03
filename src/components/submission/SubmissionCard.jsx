import { Link } from 'react-router-dom';
import { FileText, MapPin, Calendar, User, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SUBMISSION_STATUS_CONFIG, formatPrice } from '@/lib/submission-utils';

export default function SubmissionCard({ submission }) {
  const status = SUBMISSION_STATUS_CONFIG[submission.status] || SUBMISSION_STATUS_CONFIG.draft;

  return (
    <Link to={`/submit/track?ref=${submission.submission_reference || submission.id}`}
      className="group block rounded-2xl border border-brand-100 bg-ice-50 p-5 transition hover:border-flame-200 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {submission.submission_reference && <span className="font-mono text-xs font-bold text-flame-600">{submission.submission_reference}</span>}
            <Badge variant="outline" className={`text-[10px] ${status.badge}`}>{status.label}</Badge>
          </div>
          <h3 className="mt-2 font-heading text-base font-bold text-brand-900 group-hover:text-flame-600 line-clamp-1">{submission.property_title || 'Untitled Property'}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {submission.owner_name}</span>
            {submission.location_city && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {submission.location_city}</span>}
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(submission.created_date).toLocaleDateString('en-NG')}</span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-flame-500" />
      </div>
      {submission.asking_price_ngn != null && (
        <p className="mt-3 font-heading text-sm font-bold text-brand-900">{formatPrice(submission.asking_price_ngn)}</p>
      )}
    </Link>
  );
}