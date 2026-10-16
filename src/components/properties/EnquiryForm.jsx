import { useState } from 'react';
import { Send, Loader2, CheckCircle2, Phone, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function EnquiryForm({ property }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null); // holds reference string
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '', contactMethod: 'phone' });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Please enter your name.'); return; }
    if (!form.phone.trim() && !form.email.trim()) { setError('A phone number or email is required.'); return; }
    if (!form.message.trim()) { setError('Please enter a message.'); return; }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('submitPropertyEnquiry', {
        property_id: property.id,
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim() || null,
        customer_email: form.email.trim() || null,
        message: form.message.trim(),
        preferred_contact_method: form.contactMethod,
      });
      setSubmitted(res.data.reference || 'Submitted');
      toast({ title: 'Enquiry sent!', description: 'The advertiser will contact you soon.' });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-success/20 bg-success/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h3 className="mt-3 font-heading text-lg font-bold text-brand-900">Enquiry Received</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your enquiry has been recorded. Reference: <span className="font-mono font-semibold text-brand-900">{submitted}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">The advertiser will contact you using your preferred method.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => {
          setSubmitted(null);
          setForm({ name: '', phone: '', email: '', message: '', contactMethod: 'phone' });
        }}>
          Send Another Enquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="eq-name" className="text-xs">Full Name *</Label>
        <Input id="eq-name" value={form.name} onChange={(e) => set('name', e.target.value)} className="h-10" placeholder="Your full name" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="eq-phone" className="text-xs">Phone</Label>
          <Input id="eq-phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="h-10" placeholder="+234..." />
        </div>
        <div>
          <Label htmlFor="eq-email" className="text-xs">Email</Label>
          <Input id="eq-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="h-10" placeholder="you@email.com" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Provide at least a phone number or email so the advertiser can reach you.</p>
      <div>
        <Label htmlFor="eq-contact" className="text-xs">Preferred Contact</Label>
        <Select value={form.contactMethod} onValueChange={(v) => set('contactMethod', v)}>
          <SelectTrigger id="eq-contact" className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="phone"><span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Phone Call</span></SelectItem>
            <SelectItem value="whatsapp"><span className="flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</span></SelectItem>
            <SelectItem value="email"><span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> Email</span></SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="eq-msg" className="text-xs">Message *</Label>
        <Textarea id="eq-msg" value={form.message} onChange={(e) => set('message', e.target.value)} rows={3}
          placeholder={`I am interested in ${property.title}. Please share more details.`} />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full bg-flame-500 hover:bg-flame-600">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Send className="mr-2 h-4 w-4" /> Send Enquiry</>}
      </Button>
    </form>
  );
}