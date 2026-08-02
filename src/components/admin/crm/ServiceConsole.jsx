import { useEffect, useState } from 'react';
import { Headphones, AlertCircle, MessageSquare, Star, Wrench } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PRIORITY_COLORS = { low: 'secondary', medium: 'secondary', high: 'default', urgent: 'destructive', critical: 'destructive' };
const TICKET_STATUS_COLORS = { open: 'default', in_progress: 'default', waiting_customer: 'secondary', escalated: 'destructive', resolved: 'default', closed: 'secondary', reopened: 'destructive' };

export default function ServiceConsole() {
  const [tickets, setTickets] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.SupportTicket.list('-created_date', 100).catch(() => []),
      base44.entities.Complaint.list('-created_date', 50).catch(() => []),
      base44.entities.Feedback.list('-created_date', 50).catch(() => []),
      base44.entities.ServiceRequest.list('-created_date', 50).catch(() => []),
    ]).then(([t, c, f, s]) => { setTickets(t); setComplaints(c); setFeedback(f); setServiceRequests(s); }).finally(() => setLoading(false));
  }, []);

  const openTickets = tickets.filter((t) => ['open', 'in_progress', 'waiting_customer', 'escalated'].includes(t.status));
  const slaBreached = tickets.filter((t) => t.sla_breached);
  const escalated = tickets.filter((t) => t.status === 'escalated');
  const pendingFeedback = feedback.filter((f) => f.moderation_status === 'pending');
  const avgRating = feedback.length > 0 ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1) : '—';
  const openComplaints = complaints.filter((c) => !['resolved', 'withdrawn'].includes(c.status));
  const openServiceReqs = serviceRequests.filter((s) => !['completed', 'cancelled'].includes(s.status));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Headphones className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{openTickets.length}</p><p className="text-xs text-muted-foreground">Open Tickets</p></CardContent></Card>
        <Card><CardContent className="p-4"><AlertCircle className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{slaBreached.length}</p><p className="text-xs text-muted-foreground">SLA Breached</p></CardContent></Card>
        <Card><CardContent className="p-4"><Star className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{avgRating}</p><p className="text-xs text-muted-foreground">Avg Rating</p></CardContent></Card>
        <Card><CardContent className="p-4"><Wrench className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{openServiceReqs.length}</p><p className="text-xs text-muted-foreground">Service Requests</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Headphones className="h-4 w-4 text-brand-700" /> Support Ticket Queue</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : openTickets.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">No open tickets.</p>
          ) : (
            <div className="space-y-2">
              {openTickets.slice(0, 15).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50"><Headphones className="h-4 w-4 text-brand-700" /></div>
                    <div><p className="text-sm font-medium">{t.subject}</p><p className="text-xs text-muted-foreground">{t.ticket_number} · {t.customer_name} · {t.category?.replace(/_/g, ' ')}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.sla_breached && <Badge variant="destructive" className="text-xs">SLA Breached</Badge>}
                    <Badge variant={PRIORITY_COLORS[t.priority] || 'secondary'} className="text-xs">{t.priority}</Badge>
                    <Badge variant={TICKET_STATUS_COLORS[t.status] || 'secondary'} className="text-xs capitalize">{t.status?.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><AlertCircle className="h-4 w-4 text-destructive" /> Active Complaints</CardTitle></CardHeader>
          <CardContent>
            {openComplaints.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No active complaints.</p> : (
              <div className="space-y-2">
                {openComplaints.slice(0, 8).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{c.subject}</p><p className="text-xs text-muted-foreground">{c.customer_name} · {c.complaint_type?.replace(/_/g, ' ')}</p></div>
                    <Badge variant={c.severity === 'critical' || c.severity === 'severe' ? 'destructive' : 'secondary'} className="text-xs capitalize">{c.severity}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><MessageSquare className="h-4 w-4 text-flame-600" /> Pending Feedback Moderation</CardTitle></CardHeader>
          <CardContent>
            {pendingFeedback.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No pending feedback.</p> : (
              <div className="space-y-2">
                {pendingFeedback.slice(0, 8).map((f) => (
                  <div key={f.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{f.subject || f.feedback_type}</p><p className="text-xs text-muted-foreground">{f.customer_name} · {f.rating ? `${'★'.repeat(f.rating)}` : 'No rating'}</p></div>
                    <Badge variant="secondary" className="text-xs capitalize">{f.moderation_status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {escalated.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> Escalated Tickets</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {escalated.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div><p className="text-sm font-medium">{t.subject}</p><p className="text-xs text-muted-foreground">{t.ticket_number} · Escalated to {t.escalated_to || 'Management'}</p></div>
                <Badge variant="destructive" className="text-xs">Escalated</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}