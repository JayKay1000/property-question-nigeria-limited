import { useState, useCallback, useEffect } from 'react';
import { Loader2, MessageSquare, CalendarCheck, CheckCircle2, XCircle, Clock, Send, ChevronRight, X, Star, Phone, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { ENQUIRY_STATUS_CONFIG, INSPECTION_STATUS_CONFIG } from '@/lib/customer-portal-utils';
import { INQUIRY_CATEGORY_LABELS } from '@/lib/enquiry-utils';

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'site_visit_scheduled', label: 'Inspections' },
  { key: 'resolved', label: 'Resolved' },
];

const ENQUIRY_STATUS_OPTIONS = [
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'site_visit_scheduled', label: 'Site Visit Scheduled' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' },
  { value: 'nurturing', label: 'Nurturing' },
  { value: 'resolved', label: 'Resolved' },
];

export default function AgentEnquiryInbox() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('getAgentEnquiries', { status: tab });
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load enquiries.');
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (enquiryId, action, params = {}) => {
    setActionLoading(true);
    try {
      await base44.functions.invoke('manageEnquiry', { enquiry_id: enquiryId, action, ...params });
      toast({ title: 'Action completed successfully.' });
      await load();
      // Refresh selected enquiry data
      if (selected?.id === enquiryId) {
        const res = await base44.functions.invoke('getAgentEnquiries', { status: 'all' });
        const updated = res.data.enquiries.find((e) => e.id === enquiryId);
        setSelected(updated || null);
      }
    } catch (e) {
      toast({ title: e.response?.data?.error || 'Action failed.', variant: 'destructive' });
    }
    setActionLoading(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-flame-500" /></div>;
  }

  if (error) {
    return <div className="rounded-xl border border-error/20 bg-error/5 p-4 text-sm text-error">{error}</div>;
  }

  const { enquiries, counts } = data;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard icon={MessageSquare} label="New" value={counts.new} color="text-info" bg="bg-info/10" />
        <SummaryCard icon={Clock} label="Contacted" value={counts.contacted} color="text-warning" bg="bg-warning/10" />
        <SummaryCard icon={CalendarCheck} label="Inspections" value={counts.scheduled} color="text-flame-600" bg="bg-flame/5" />
        <SummaryCard icon={CheckCircle2} label="Resolved" value={counts.resolved} color="text-success" bg="bg-success/10" />
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap border-b-2 px-3 py-2 text-xs font-semibold transition-colors ${
              tab === t.key ? 'border-flame-500 text-flame-600' : 'border-transparent text-muted-foreground hover:text-brand-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Enquiry list */}
      {enquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-white py-12 text-center">
          <MessageSquare className="h-10 w-10 text-brand-200" />
          <p className="mt-3 text-sm text-muted-foreground">No enquiries in this category.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {enquiries.map((e) => (
            <EnquiryRow key={e.id} enquiry={e} onSelect={() => setSelected(e)} />
          ))}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <EnquiryDetailPanel
          enquiry={selected}
          onClose={() => setSelected(null)}
          onAction={handleAction}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${bg}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <p className="font-heading text-xl font-bold text-brand-900">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EnquiryRow({ enquiry, onSelect }) {
  const status = ENQUIRY_STATUS_CONFIG[enquiry.status] || ENQUIRY_STATUS_CONFIG.new;
  const insp = enquiry.inspection;
  const inspStatus = insp ? INSPECTION_STATUS_CONFIG[insp.status] : null;

  return (
    <button
      onClick={onSelect}
      className="w-full rounded-xl border border-border bg-white p-4 text-left shadow-sm transition-all hover:border-flame/30 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {enquiry.reference && <span className="font-mono text-xs text-muted-foreground">{enquiry.reference}</span>}
            <Badge variant="outline" className={status.badge}>{status.label}</Badge>
            {enquiry.inquiry_category && INQUIRY_CATEGORY_LABELS[enquiry.inquiry_category] && (
              <span className="hidden rounded-full bg-ice-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 sm:inline">
                {INQUIRY_CATEGORY_LABELS[enquiry.inquiry_category]}
              </span>
            )}
          </div>
          <p className="mt-1.5 font-heading text-sm font-bold text-brand-900">{enquiry.property_title || 'Property Enquiry'}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">From: {enquiry.customer_name}</p>
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{enquiry.message}</p>
          {insp && inspStatus && (
            <div className="mt-2 flex items-center gap-2">
              <CalendarCheck className="h-3 w-3 text-flame-500" />
              <Badge variant="outline" className={inspStatus.badge}>{inspStatus.label}</Badge>
              <span className="text-[10px] text-muted-foreground">
                {insp.confirmed_date || insp.requested_date || insp.proposed_date
                  ? new Date(insp.confirmed_date || insp.requested_date || insp.proposed_date).toLocaleDateString('en-NG')
                  : 'Date TBD'}
              </span>
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </div>
    </button>
  );
}

function EnquiryDetailPanel({ enquiry, onClose, onAction, actionLoading }) {
  const [responseText, setResponseText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [proposeDate, setProposeDate] = useState('');
  const [proposeTime, setProposeTime] = useState('');
  const [completeNotes, setCompleteNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const insp = enquiry.inspection;
  const inspStatus = insp ? INSPECTION_STATUS_CONFIG[insp.status] : null;
  const status = ENQUIRY_STATUS_CONFIG[enquiry.status] || ENQUIRY_STATUS_CONFIG.new;

  const canConfirm = insp && insp.status === 'pending';
  const canPropose = insp && (insp.status === 'pending' || insp.status === 'rescheduled');
  const canComplete = insp && insp.status === 'confirmed';
  const canCancel = insp && ['pending', 'confirmed', 'rescheduled'].includes(insp.status);
  const canResolve = !['resolved', 'closed_won', 'closed_lost'].includes(enquiry.status);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-0 sm:p-4">
      <div className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 flex h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-t-2xl border border-border bg-white shadow-premium-lg sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {enquiry.reference && <span className="font-mono text-xs text-muted-foreground">{enquiry.reference}</span>}
              <Badge variant="outline" className={status.badge}>{status.label}</Badge>
            </div>
            <h3 className="mt-1 truncate font-heading text-sm font-bold text-brand-900">{enquiry.property_title}</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Customer info */}
          <div className="rounded-xl border border-border bg-ice-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Buyer</p>
            <p className="mt-1 font-heading text-sm font-bold text-brand-900">{enquiry.customer_name}</p>
            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {enquiry.customer_phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {enquiry.customer_phone}</span>}
              {enquiry.customer_email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {enquiry.customer_email}</span>}
              {enquiry.preferred_contact_method && <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> Prefers: {enquiry.preferred_contact_method}</span>}
            </div>
          </div>

          {/* Inquiry category and questions */}
          {enquiry.inquiry_category && INQUIRY_CATEGORY_LABELS[enquiry.inquiry_category] && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Category</p>
              <p className="mt-0.5 text-sm text-brand-900">{INQUIRY_CATEGORY_LABELS[enquiry.inquiry_category]}</p>
            </div>
          )}
          {enquiry.questions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Questions</p>
              <ul className="mt-1 space-y-1">
                {enquiry.questions.map((q, i) => (
                  <li key={i} className="text-xs text-brand-800">• {q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Message */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Message</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-brand-800">{enquiry.message}</p>
          </div>

          {/* Inspection section */}
          {enquiry.inspection_requested && (
            <div className="rounded-xl border border-flame/20 bg-flame/5 p-3">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-flame-700">
                  <CalendarCheck className="h-3.5 w-3.5" /> Site Inspection
                </p>
                {inspStatus && <Badge variant="outline" className={inspStatus.badge}>{inspStatus.label}</Badge>}
              </div>
              {insp && (
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p>Requested: <span className="font-medium text-brand-900">{insp.requested_date ? new Date(insp.requested_date).toLocaleDateString('en-NG') : 'N/A'}</span> {insp.requested_time || ''}</p>
                  {insp.confirmed_date && <p>Confirmed: <span className="font-medium text-success">{new Date(insp.confirmed_date).toLocaleDateString('en-NG')}</span> {insp.confirmed_time || ''}</p>}
                  {insp.proposed_date && <p>Proposed: <span className="font-medium text-flame-600">{new Date(insp.proposed_date).toLocaleDateString('en-NG')}</span> {insp.proposed_time || ''} (awaiting buyer response)</p>}
                  {insp.cancelled_reason && <p>Cancelled: {insp.cancelled_reason}</p>}
                </div>
              )}

              {/* Inspection actions */}
              <div className="mt-3 space-y-2">
                {canConfirm && (
                  <Button size="sm" className="w-full bg-success hover:bg-success/90" disabled={actionLoading}
                    onClick={() => onAction(enquiry.id, 'confirm_inspection')}>
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Confirm Requested Time
                  </Button>
                )}
                {canPropose && (
                  <div className="space-y-1.5 rounded-lg border border-border bg-white p-2">
                    <p className="text-[10px] font-semibold text-muted-foreground">Propose Alternative Time</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Input type="date" value={proposeDate} onChange={(e) => setProposeDate(e.target.value)} className="h-8 text-xs" />
                      <Input type="time" value={proposeTime} onChange={(e) => setProposeTime(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <Button size="sm" variant="outline" className="w-full border-flame/30 text-flame-600 hover:bg-flame/5" disabled={actionLoading || !proposeDate}
                      onClick={() => onAction(enquiry.id, 'propose_inspection', { proposed_date: proposeDate, proposed_time: proposeTime })}>
                      Propose Alternative
                    </Button>
                  </div>
                )}
                {canComplete && (
                  <div className="space-y-1.5 rounded-lg border border-border bg-white p-2">
                    <Textarea value={completeNotes} onChange={(e) => setCompleteNotes(e.target.value)} placeholder="Inspection notes (optional)" rows={2} className="text-xs" />
                    <div className="flex gap-1.5">
                      <Button size="sm" className="flex-1 bg-success hover:bg-success/90" disabled={actionLoading}
                        onClick={() => onAction(enquiry.id, 'complete_inspection', { notes: completeNotes })}>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Mark Completed
                      </Button>
                      <Button size="sm" variant="outline" className="border-error/30 text-error hover:bg-error/5" disabled={actionLoading}
                        onClick={() => onAction(enquiry.id, 'mark_no_show')}>
                        No Show
                      </Button>
                    </div>
                  </div>
                )}
                {canCancel && (
                  <div className="space-y-1.5 rounded-lg border border-border bg-white p-2">
                    <Input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason for cancellation (optional)" className="h-8 text-xs" />
                    <Button size="sm" variant="outline" className="w-full border-error/30 text-error hover:bg-error/5" disabled={actionLoading}
                      onClick={() => onAction(enquiry.id, 'cancel_inspection', { reason: cancelReason })}>
                      <XCircle className="mr-1 h-3.5 w-3.5" /> Cancel Inspection
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Follow-up history */}
          {enquiry.follow_up_history?.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Activity Log</p>
              <div className="mt-1 space-y-1.5">
                {enquiry.follow_up_history.slice().reverse().map((h, i) => (
                  <div key={i} className="rounded-lg border border-border/50 bg-ice-50 px-2.5 py-1.5 text-xs">
                    <span className="font-medium text-brand-900">{h.by_name || 'Agent'}</span>
                    <span className="text-muted-foreground"> — {h.action.replace(/_/g, ' ')}</span>
                    {h.note && <p className="mt-0.5 text-muted-foreground">{h.note}</p>}
                    {h.to && <p className="mt-0.5 text-muted-foreground">Status → {h.to}</p>}
                    <p className="text-[10px] text-muted-foreground/70">{new Date(h.timestamp).toLocaleString('en-NG')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-border p-4 space-y-2">
          {/* Response */}
          <div className="flex gap-2">
            <Textarea value={responseText} onChange={(e) => setResponseText(e.target.value)} placeholder="Type a response note..." rows={2} className="text-sm" />
            <Button size="sm" className="self-end bg-brand-900 hover:bg-brand-800" disabled={actionLoading || !responseText.trim()}
              onClick={() => { onAction(enquiry.id, 'respond', { note: responseText }); setResponseText(''); }}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
          {/* Status update + resolve */}
          <div className="flex gap-2">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="h-9 flex-1 text-xs"><SelectValue placeholder="Update status..." /></SelectTrigger>
              <SelectContent>
                {ENQUIRY_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" disabled={actionLoading || !newStatus}
              onClick={() => { onAction(enquiry.id, 'update_status', { status: newStatus }); setNewStatus(''); }}>
              Update
            </Button>
            {canResolve && (
              <Button size="sm" className="bg-success hover:bg-success/90" disabled={actionLoading}
                onClick={() => onAction(enquiry.id, 'mark_resolved')}>
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Resolve
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}