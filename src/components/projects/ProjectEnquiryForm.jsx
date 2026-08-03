import { useState } from 'react';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function ProjectEnquiryForm({ project }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', contactMethod: 'phone', plotPreference: '', budget: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      toast({ title: 'Please fill in your name and phone number', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const message = `Project: ${project.name}\nPlot Preference: ${form.plotPreference || 'Not specified'}\nBudget: ${form.budget || 'Not specified'}\n\n${form.message || ''}`;
      await base44.entities.Lead.create({
        full_name: form.name,
        email: form.email || undefined,
        phone: form.phone,
        source: 'website',
        status: 'new',
        interest_type: 'project',
        interest_ref: project.name,
        project_id: project.id,
        notes: message,
      });
      setSubmitted(true);
      toast({ title: 'Enquiry submitted successfully!', description: 'A project consultant will contact you shortly.' });
    } catch (err) {
      toast({ title: 'Failed to submit enquiry', description: 'Please try again or call us directly.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-success/20 bg-success/5 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-7 w-7 text-success" />
        </div>
        <h4 className="mt-4 font-heading text-lg font-bold text-brand-900">Enquiry Submitted!</h4>
        <p className="mt-1 text-sm text-muted-foreground">Thank you for your interest in {project.name}. Our project consultant will contact you within 24 hours.</p>
        <Button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', contactMethod: 'phone', plotPreference: '', budget: '', message: '' }); }}
          variant="outline" className="mt-4 border-brand-200">Submit Another Enquiry</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-brand-100 bg-ice-50 p-5">
      <h4 className="font-heading text-base font-bold text-brand-900">Enquire About This Project</h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Full Name *</Label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} className="h-10 bg-white" placeholder="Your name" required />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Phone Number *</Label>
          <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="h-10 bg-white" placeholder="+234..." required />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</Label>
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="h-10 bg-white" placeholder="you@email.com" />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Preferred Contact</Label>
          <Select value={form.contactMethod} onValueChange={(v) => set('contactMethod', v)}>
            <SelectTrigger className="h-10 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="phone">Phone Call</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Plot Preference</Label>
          <Input value={form.plotPreference} onChange={(e) => set('plotPreference', e.target.value)} className="h-10 bg-white" placeholder="e.g. Corner plot, 600sqm" />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Budget Range</Label>
          <Input value={form.budget} onChange={(e) => set('budget', e.target.value)} className="h-10 bg-white" placeholder="e.g. ₦5M – ₦20M" />
        </div>
      </div>
      <div>
        <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Questions / Message</Label>
        <Textarea value={form.message} onChange={(e) => set('message', e.target.value)} className="bg-white" rows={3} placeholder="Tell us what you'd like to know..." />
      </div>
      <Button type="submit" disabled={submitting} className="w-full bg-flame-500 hover:bg-flame-600">
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Enquiry</>}
      </Button>
    </form>
  );
}