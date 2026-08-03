import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, MapPin, User, Clock, X, Star, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { INSPECTION_STATUS_CONFIG } from '@/lib/customer-portal-utils';

export default function InspectionBookings({ inspections, userId, onRefresh }) {
  const { toast } = useToast();
  const [feedbackFor, setFeedbackFor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, notes: '' });

  const handleCancel = async (id) => {
    try {
      await base44.entities.InspectionRequest.update(id, { status: 'cancelled' });
      toast({ title: 'Inspection cancelled' });
      onRefresh?.();
    } catch { toast({ title: 'Failed to cancel', variant: 'destructive' }); }
  };

  const submitFeedback = async () => {
    setSubmitting(true);
    try {
      await base44.entities.InspectionRequest.update(feedbackFor, {
        feedback_rating: feedback.rating,
        feedback_notes: feedback.notes,
      });
      toast({ title: 'Feedback submitted!' });
      setFeedbackFor(null);
      setFeedback({ rating: 5, notes: '' });
      onRefresh?.();
    } catch { toast({ title: 'Failed to submit', variant: 'destructive' }); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-brand-900">Site Inspections</h2>
        <Button asChild className="bg-flame-500 hover:bg-flame-600">
          <Link to="/properties"><CalendarCheck className="mr-1.5 h-4 w-4" /> Book Inspection</Link>
        </Button>
      </div>

      {inspections.length > 0 ? (
        <div className="space-y-3">
          {inspections.map((ins) => {
            const status = INSPECTION_STATUS_CONFIG[ins.status] || INSPECTION_STATUS_CONFIG.pending;
            const date = ins.confirmed_date || ins.requested_date;
            const time = ins.confirmed_time || ins.requested_time;
            const canCancel = ['pending', 'confirmed'].includes(ins.status);
            const canFeedback = ins.status === 'completed' && !ins.feedback_rating;

            return (
              <div key={ins.id} className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {ins.property_id ? (
                      <Link to={`/properties/${ins.property_id}`} className="font-heading text-sm font-bold text-brand-900 hover:text-flame-600">{ins.property_title || 'Property Inspection'}</Link>
                    ) : (
                      <h3 className="font-heading text-sm font-bold text-brand-900">{ins.property_title || 'Inspection'}</h3>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarCheck className="h-3 w-3" /> {date ? new Date(date).toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date TBD'}</span>
                      {time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {time}</span>}
                      {ins.sales_representative_name && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {ins.sales_representative_name}</span>}
                      {ins.number_of_attendees > 1 && <span>{ins.number_of_attendees} attendees</span>}
                    </div>
                    {ins.inspection_notes && <p className="mt-2 text-sm text-muted-foreground">{ins.inspection_notes}</p>}
                    {ins.feedback_rating && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">Your rating:</span>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s <= ins.feedback_rating ? 'fill-flame-500 text-flame-500' : 'text-border'}`} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className={status.badge}>{status.label}</Badge>
                    <div className="flex gap-2">
                      {canCancel && (
                        <button onClick={() => handleCancel(ins.id)} className="text-xs font-medium text-error hover:underline">Cancel</button>
                      )}
                      {canFeedback && (
                        <button onClick={() => setFeedbackFor(ins.id)} className="text-xs font-medium text-flame-600 hover:underline">Leave Feedback</button>
                      )}
                    </div>
                  </div>
                </div>

                {feedbackFor === ins.id && (
                  <div className="mt-3 rounded-lg border border-brand-100 bg-ice-50 p-3">
                    <Label className="mb-1.5 block text-sm text-brand-900">Rating</Label>
                    <div className="mb-3 flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setFeedback({ ...feedback, rating: s })}>
                          <Star className={`h-5 w-5 ${s <= feedback.rating ? 'fill-flame-500 text-flame-500' : 'text-border'}`} />
                        </button>
                      ))}
                    </div>
                    <Textarea value={feedback.notes} onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })}
                      placeholder="Share your inspection experience..." rows={2} className="bg-white" />
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={submitFeedback} disabled={submitting} className="bg-flame-500 hover:bg-flame-600">
                        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Feedback'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setFeedbackFor(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
          <CalendarCheck className="h-12 w-12 text-brand-200" />
          <h3 className="mt-4 font-heading text-lg font-semibold text-brand-900">No Inspections Booked</h3>
          <p className="mt-1 text-sm text-muted-foreground">Book a site inspection from any property or project page.</p>
          <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
            <Link to="/properties">Find Properties <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      )}
    </div>
  );
}