import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Send, User, Calendar, CalendarCheck, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { ENQUIRY_STATUS_CONFIG, INSPECTION_STATUS_CONFIG } from '@/lib/customer-portal-utils';
import { INQUIRY_CATEGORY_LABELS } from '@/lib/enquiry-utils';

export default function EnquiryHistory({ enquiries, userId, userName, userEmail, userPhone, onRefresh }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [form, setForm] = useState({ property_id: '', property_title: '', message: '', preferred_contact_method: 'phone' });

  const handleSubmit = async () => {
    if (!form.message.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.PropertyEnquiry.create({
        ...form,
        customer_id: userId,
        customer_name: userName,
        customer_email: userEmail,
        customer_phone: userPhone,
        status: 'new',
        source: 'website',
        inquiry_category: 'general_info',
      });
      toast({ title: 'Enquiry submitted!', description: 'Our team will contact you shortly.' });
      setShowForm(false);
      setForm({ property_id: '', property_title: '', message: '', preferred_contact_method: 'phone' });
      onRefresh?.();
    } catch {
      toast({ title: 'Failed to submit', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleInspectionAction = async (inspectionId, action, params = {}) => {
    setActionLoading(inspectionId + action);
    try {
      await base44.functions.invoke('manageBuyerInspection', { inspection_id: inspectionId, action, ...params });
      toast({ title: 'Inspection updated successfully.' });
      onRefresh?.();
    } catch (e) {
      toast({ title: e.response?.data?.error || 'Action failed.', variant: 'destructive' });
    }
    setActionLoading(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-brand-900">My Enquiries</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-flame-500 hover:bg-flame-600">
          <MessageSquare className="mr-1.5 h-4 w-4" /> {showForm ? 'Cancel' : 'New Enquiry'}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-brand-100 bg-ice-50 p-5">
          <h3 className="mb-4 font-heading text-base font-bold text-brand-900">Submit a New Enquiry</h3>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-sm text-brand-900">Property Title (optional)</Label>
              <input value={form.property_title} onChange={(e) => setForm({ ...form, property_title: e.target.value })}
                placeholder="e.g. 4 Bedroom Duplex in Lekki"
                className="h-10 w-full rounded-md border border-brand-200 bg-white px-3 text-sm" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm text-brand-900">Message *</Label>
              <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your enquiry..." rows={4} className="bg-white" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm text-brand-900">Preferred Contact Method</Label>
              <Select value={form.preferred_contact_method} onValueChange={(v) => setForm({ ...form, preferred_contact_method: v })}>
                <SelectTrigger className="h-10 bg-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSubmit} disabled={submitting || !form.message.trim()} className="bg-flame-500 hover:bg-flame-600">
              {submitting ? 'Submitting...' : <><Send className="mr-1.5 h-4 w-4" /> Submit Enquiry</>}
            </Button>
          </div>
        </div>
      )}

      {enquiries.length > 0 ? (
        <div className="space-y-3">
          {enquiries.map((e) => {
            const status = ENQUIRY_STATUS_CONFIG[e.status] || ENQUIRY_STATUS_CONFIG.new;
            const insp = e.inspection;
            const inspStatus = insp ? INSPECTION_STATUS_CONFIG[insp.status] : null;
            const canAcceptProposed = insp && insp.status === 'rescheduled' && insp.proposed_date;
            const canCancelInspection = insp && ['pending', 'confirmed', 'rescheduled'].includes(insp.status);
            const catLabel = INQUIRY_CATEGORY_LABELS[e.inquiry_category];

            return (
              <div key={e.id} className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {e.reference && <span className="font-mono text-xs text-muted-foreground">{e.reference}</span>}
                      {e.property_id ? (
                        <Link to={`/properties/${e.property_id}`} className="font-heading text-sm font-bold text-brand-900 hover:text-flame-600">{e.property_title || 'Property Enquiry'}</Link>
                      ) : (
                        <h3 className="font-heading text-sm font-bold text-brand-900">{e.property_title || 'General Enquiry'}</h3>
                      )}
                    </div>
                    {catLabel && catLabel !== 'General Information' && (
                      <span className="mt-1 inline-block rounded-full bg-ice-50 px-2 py-0.5 text-[10px] font-medium text-brand-700">{catLabel}</span>
                    )}
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{e.message}</p>

                    {/* Inspection status */}
                    {insp && inspStatus && (
                      <div className="mt-2 rounded-lg border border-flame/15 bg-flame/5 p-2.5">
                        <div className="flex items-center gap-2">
                          <CalendarCheck className="h-3.5 w-3.5 text-flame-600" />
                          <Badge variant="outline" className={inspStatus.badge}>{inspStatus.label}</Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {insp.confirmed_date ? new Date(insp.confirmed_date).toLocaleDateString('en-NG') : insp.proposed_date ? `Proposed: ${new Date(insp.proposed_date).toLocaleDateString('en-NG')}` : insp.requested_date ? new Date(insp.requested_date).toLocaleDateString('en-NG') : 'Date TBD'}
                            {insp.confirmed_time || insp.proposed_time || insp.requested_time ? ` ${insp.confirmed_time || insp.proposed_time || insp.requested_time}` : ''}
                          </span>
                        </div>
                        {canAcceptProposed && (
                          <div className="mt-2 flex gap-2">
                            <Button size="sm" className="h-7 bg-success hover:bg-success/90 text-xs" disabled={actionLoading === e.id + 'accept_proposed_time'}
                              onClick={() => handleInspectionAction(insp.id, 'accept_proposed_time')}>
                              {actionLoading === e.id + 'accept_proposed_time' ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="mr-1 h-3 w-3" />} Accept Proposed Time
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 border-error/30 text-error hover:bg-error/5 text-xs" disabled={actionLoading === e.id + 'cancel_decline'}
                              onClick={() => handleInspectionAction(insp.id, 'cancel_inspection', { reason: 'Declined proposed time' })}>
                              <XCircle className="mr-1 h-3 w-3" /> Decline
                            </Button>
                          </div>
                        )}
                        {canCancelInspection && !canAcceptProposed && (
                          <button onClick={() => handleInspectionAction(insp.id, 'cancel_inspection')} disabled={actionLoading === e.id + 'cancel_inspection'}
                            className="mt-1.5 text-xs font-medium text-error hover:underline">
                            {actionLoading === e.id + 'cancel_inspection' ? 'Cancelling...' : 'Cancel Inspection'}
                          </button>
                        )}
                      </div>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(e.created_date).toLocaleDateString('en-NG')}</span>
                      {e.agent_name && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {e.agent_name}</span>}
                      {e.next_follow_up_date && <span className="text-flame-600">Next follow-up: {new Date(e.next_follow_up_date).toLocaleDateString('en-NG')}</span>}
                    </div>

                    {/* Agent responses */}
                    {e.follow_up_history?.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {e.follow_up_history.filter((h) => h.note).slice(-2).map((h, i) => (
                          <div key={i} className="rounded-lg bg-ice-50 px-2.5 py-1.5 text-xs">
                            <span className="font-medium text-brand-900">{h.by_name || 'Agent'}</span>
                            <p className="mt-0.5 text-muted-foreground">{h.note}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className={status.badge}>{status.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-16 text-center">
          <MessageSquare className="h-12 w-12 text-brand-200" />
          <h3 className="mt-4 font-heading text-lg font-semibold text-brand-900">No Enquiries Yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">Submit an enquiry about any property to get started.</p>
          <Button asChild className="mt-6 bg-flame-500 hover:bg-flame-600">
            <Link to="/properties">Browse Properties <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      )}
    </div>
  );
}