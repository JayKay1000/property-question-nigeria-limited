import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Send, User, Calendar, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { ENQUIRY_STATUS_CONFIG } from '@/lib/customer-portal-utils';

export default function EnquiryHistory({ enquiries, userId, userName, userEmail, userPhone }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
      });
      toast({ title: 'Enquiry submitted!', description: 'Our team will contact you shortly.' });
      setShowForm(false);
      setForm({ property_id: '', property_title: '', message: '', preferred_contact_method: 'phone' });
    } catch {
      toast({ title: 'Failed to submit', variant: 'destructive' });
    } finally { setSubmitting(false); }
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
            return (
              <div key={e.id} className="rounded-xl border border-brand-100 bg-white p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {e.property_id ? (
                      <Link to={`/properties/${e.property_id}`} className="font-heading text-sm font-bold text-brand-900 hover:text-flame-600">{e.property_title || 'Property Enquiry'}</Link>
                    ) : (
                      <h3 className="font-heading text-sm font-bold text-brand-900">{e.property_title || 'General Enquiry'}</h3>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{e.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(e.created_date).toLocaleDateString('en-NG')}</span>
                      {e.assigned_to_name && <span className="flex items-center gap-1"><User className="h-3 w-3" /> {e.assigned_to_name}</span>}
                      {e.next_follow_up_date && <span className="text-flame-600">Next follow-up: {new Date(e.next_follow_up_date).toLocaleDateString('en-NG')}</span>}
                    </div>
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