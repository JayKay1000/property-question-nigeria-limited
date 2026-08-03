import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function LeadForm({ inquiryType = 'consultation', sourcePage = 'contact', compact = false }) {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', subject: '', message: '',
    inquiry_type: inquiryType, preferred_contact_method: 'email',
  });
  const [status, setStatus] = useState('idle');

  const handleChange = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await base44.entities.ContactSubmission.create({
        ...form,
        source_page: sourcePage,
        status: 'new',
      });
      setStatus('success');
      setForm({ full_name: '', email: '', phone: '', subject: '', message: '', inquiry_type: inquiryType, preferred_contact_method: 'email' });
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center text-center py-8">
        <CheckCircle2 className="w-16 h-16 text-success mb-4" />
        <h3 className="text-xl font-heading font-semibold mb-2">Thank You!</h3>
        <p className="text-muted-foreground">Your request has been received. Our team will contact you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lf-name">Full Name *</Label>
          <Input id="lf-name" required value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} placeholder="Enter your name" />
        </div>
        <div>
          <Label htmlFor="lf-email">Email *</Label>
          <Input id="lf-email" type="email" required value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="you@email.com" />
        </div>
        <div>
          <Label htmlFor="lf-phone">Phone</Label>
          <Input id="lf-phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+234..." />
        </div>
        {!compact && (
          <div>
            <Label htmlFor="lf-type">Inquiry Type</Label>
            <Select value={form.inquiry_type} onValueChange={(v) => handleChange('inquiry_type', v)}>
              <SelectTrigger id="lf-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation Request</SelectItem>
                <SelectItem value="inspection">Inspection Booking</SelectItem>
                <SelectItem value="general">General Inquiry</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="career">Career</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="lf-subject">Subject</Label>
        <Input id="lf-subject" value={form.subject} onChange={(e) => handleChange('subject', e.target.value)} placeholder="Brief subject" />
      </div>
      <div>
        <Label htmlFor="lf-msg">Message *</Label>
        <Textarea id="lf-msg" required value={form.message} onChange={(e) => handleChange('message', e.target.value)} placeholder="How can we help you?" rows={4} />
      </div>
      {status === 'error' && <p className="text-sm text-destructive">Submission failed. Please try again or call us directly.</p>}
      <Button type="submit" disabled={status === 'loading'} className="w-full md:w-auto bg-flame-500 hover:bg-flame-600 text-white border-0">
        {status === 'loading' ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Request'}
      </Button>
    </form>
  );
}