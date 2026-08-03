import { useState } from 'react';
import { LifeBuoy, Send, ChevronDown, MessageSquare, Phone, Mail, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { TICKET_CATEGORIES, TICKET_STATUS_CONFIG, FAQ_ITEMS, generateTicketNumber } from '@/lib/customer-portal-utils';

export default function SupportCentre({ tickets, userId, userName, userEmail, userPhone, onRefresh }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ subject: '', description: '', category: 'enquiry', priority: 'medium' });

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.description.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.SupportTicket.create({
        ticket_number: generateTicketNumber(),
        customer_id: userId,
        customer_name: userName,
        customer_email: userEmail,
        customer_phone: userPhone,
        subject: form.subject,
        description: form.description,
        category: form.category,
        priority: form.priority,
        status: 'open',
        created_channel: 'customer_portal',
      });
      toast({ title: 'Support request submitted!', description: 'Our team will respond shortly.' });
      setShowForm(false);
      setForm({ subject: '', description: '', category: 'enquiry', priority: 'medium' });
      onRefresh?.();
    } catch {
      toast({ title: 'Failed to submit', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold text-brand-900">Support Centre</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-flame-500 hover:bg-flame-600">
          <LifeBuoy className="mr-1.5 h-4 w-4" /> {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {/* Contact options */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-brand-100 bg-ice-50 p-4 text-center">
          <Phone className="mx-auto h-6 w-6 text-flame-500" />
          <h3 className="mt-2 font-heading text-sm font-bold text-brand-900">Call Us</h3>
          <p className="text-xs text-muted-foreground">+234 1 234 5678</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-ice-50 p-4 text-center">
          <Mail className="mx-auto h-6 w-6 text-flame-500" />
          <h3 className="mt-2 font-heading text-sm font-bold text-brand-900">Email Us</h3>
          <p className="text-xs text-muted-foreground">support@propertyquestion.net</p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-ice-50 p-4 text-center">
          <MessageSquare className="mx-auto h-6 w-6 text-flame-500" />
          <h3 className="mt-2 font-heading text-sm font-bold text-brand-900">Live Chat</h3>
          <p className="text-xs text-muted-foreground">Coming soon</p>
        </div>
      </div>

      {/* New request form */}
      {showForm && (
        <div className="rounded-2xl border border-brand-100 bg-ice-50 p-5">
          <h3 className="mb-4 font-heading text-base font-bold text-brand-900">Submit a Support Request</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-sm text-brand-900">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="h-10 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block text-sm text-brand-900">Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger className="h-10 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm text-brand-900">Subject *</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief summary of your request" className="bg-white" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm text-brand-900">Description *</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Describe your request in detail..." className="bg-white" />
            </div>
            <Button onClick={handleSubmit} disabled={submitting || !form.subject.trim() || !form.description.trim()} className="bg-flame-500 hover:bg-flame-600">
              {submitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />} Submit Request
            </Button>
          </div>
        </div>
      )}

      {/* My tickets */}
      {tickets.length > 0 && (
        <div>
          <h3 className="mb-3 font-heading text-base font-bold text-brand-900">My Support Tickets</h3>
          <div className="space-y-2">
            {tickets.map((t) => {
              const status = TICKET_STATUS_CONFIG[t.status] || TICKET_STATUS_CONFIG.open;
              return (
                <div key={t.id} className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-flame-600">{t.ticket_number}</span>
                        <Badge variant="outline" className={status.badge}>{status.label}</Badge>
                      </div>
                      <h4 className="mt-1.5 font-heading text-sm font-bold text-brand-900">{t.subject}</h4>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{t.description}</p>
                      <p className="mt-1.5 text-xs text-muted-foreground">{new Date(t.created_date).toLocaleDateString('en-NG')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FAQ */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-heading text-base font-bold text-brand-900"><HelpCircle className="h-4 w-4 text-flame-500" /> Frequently Asked Questions</h3>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-brand-100 bg-white">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left">
                <span className="font-heading text-sm font-bold text-brand-900">{item.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <div className="px-4 pb-4 text-sm text-muted-foreground">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}