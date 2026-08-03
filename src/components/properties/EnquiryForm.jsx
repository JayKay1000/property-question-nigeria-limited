import { useState } from 'react';
import { Send, Loader2, CheckCircle2, Phone, Mail, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function EnquiryForm({ property, defaultType = 'enquiry' }) {
  const { toast } = useToast();
  const [type, setType] = useState(defaultType); // 'enquiry' | 'inspection'
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', contactMethod: 'phone', message: '',
    inspectionDate: '', inspectionTime: '', attendees: 1,
  });

  const set = (key, val) => setForm({ ...form, [key]: val });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast({ title: 'Please fill in your name and phone number', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      // Create PropertyEnquiry
      await base44.entities.PropertyEnquiry.create({
        property_id: property.id,
        property_title: property.title,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        message: form.message || (type === 'inspection'
          ? `Inspection request for ${property.title} on ${form.inspectionDate} at ${form.inspectionTime}`
          : 'Property enquiry from website'),
        preferred_contact_method: form.contactMethod,
        source: 'website',
        status: 'new',
        assigned_to_id: property.listing_agent_id || '',
        assigned_to_name: property.listing_agent_name || '',
      });

      // Also create a Lead for CRM
      await base44.entities.Lead.create({
        full_name: form.name,
        email: form.email,
        phone: form.phone,
        source: 'website',
        status: 'new',
        priority: 'medium',
        interest_type: type === 'inspection' ? 'inspection' : 'enquiry',
        interest_ref: property.reference_number || property.id,
        property_id: property.id,
        notes: form.message || `Enquiry about ${property.title}`,
        assigned_to_id: property.listing_agent_id || '',
        assigned_to_name: property.listing_agent_name || '',
      });

      // If inspection, create InspectionRequest too
      if (type === 'inspection' && form.inspectionDate) {
        await base44.entities.InspectionRequest.create({
          property_id: property.id,
          property_title: property.title,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          requested_date: form.inspectionDate,
          requested_time: form.inspectionTime || 'Morning',
          status: 'pending',
          number_of_attendees: parseInt(form.attendees) || 1,
          sales_representative_id: property.listing_agent_id || '',
          sales_representative_name: property.listing_agent_name || '',
          inspection_notes: form.message || '',
        });
      }

      setSubmitted(true);
      toast({ title: type === 'inspection' ? 'Inspection request sent!' : 'Enquiry sent!',
        description: 'An agent will contact you shortly.' });
    } catch (err) {
      toast({ title: 'Failed to submit', description: err.message || 'Please try again', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-success/20 bg-success/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h3 className="mt-3 font-heading text-lg font-bold text-brand-900">Request Received!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Thank you for your interest. Our team will contact you within 24 hours.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', contactMethod: 'phone', message: '', inspectionDate: '', inspectionTime: '', attendees: 1 }); }}>
          Send Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Type toggle */}
      <div className="flex gap-2">
        <button type="button" onClick={() => setType('enquiry')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${type === 'enquiry' ? 'bg-brand-900 text-white' : 'bg-ice-100 text-brand-700'}`}>
          <MessageSquare className="h-3.5 w-3.5" /> Enquiry
        </button>
        <button type="button" onClick={() => setType('inspection')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${type === 'inspection' ? 'bg-flame-500 text-white' : 'bg-ice-100 text-brand-700'}`}>
          <Calendar className="h-3.5 w-3.5" /> Book Inspection
        </button>
      </div>

      <div>
        <Label className="text-xs">Full Name *</Label>
        <Input value={form.name} onChange={(e) => set('name', e.target.value)} className="h-10" placeholder="Your full name" required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Phone *</Label>
          <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="h-10" placeholder="+234..." required />
        </div>
        <div>
          <Label className="text-xs">Email</Label>
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="h-10" placeholder="you@email.com" />
        </div>
      </div>
      <div>
        <Label className="text-xs">Preferred Contact</Label>
        <Select value={form.contactMethod} onValueChange={(v) => set('contactMethod', v)}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="phone"><span className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> Phone Call</span></SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="email"><span className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> Email</span></SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {type === 'inspection' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Preferred Date *</Label>
            <Input type="date" value={form.inspectionDate} onChange={(e) => set('inspectionDate', e.target.value)} className="h-10" required />
          </div>
          <div>
            <Label className="text-xs">Time Slot</Label>
            <Select value={form.inspectionTime || undefined} onValueChange={(v) => set('inspectionTime', v)}>
              <SelectTrigger className="h-10"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning">Morning (9-12)</SelectItem>
                <SelectItem value="Afternoon">Afternoon (12-3)</SelectItem>
                <SelectItem value="Evening">Evening (3-6)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div>
        <Label className="text-xs">Message</Label>
        <Textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={2}
          placeholder={type === 'inspection' ? 'Any special requests?' : 'I am interested in this property...'} />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-flame-500 hover:bg-flame-600">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Send className="mr-2 h-4 w-4" /> {type === 'inspection' ? 'Book Inspection' : 'Send Enquiry'}</>}
      </Button>
    </form>
  );
}