import { useState } from 'react';
import { CalendarCheck, Loader2, CheckCircle2, Car } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function SiteInspectionBooking({ project }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: 'Morning', attendees: 1, transport: false });
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState(false);

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date) {
      toast({ title: 'Please fill in name, phone and preferred date', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.InspectionRequest.create({
        property_id: project.id,
        property_title: project.name,
        customer_name: form.name,
        customer_email: form.email || undefined,
        customer_phone: form.phone,
        requested_date: form.date,
        requested_time: form.time,
        number_of_attendees: Number(form.attendees) || 1,
        transportation_needed: form.transport,
        status: 'pending',
      });
      setBooked(true);
      toast({ title: 'Site inspection booked!', description: 'We will confirm your appointment shortly.' });
    } catch (err) {
      toast({ title: 'Failed to book inspection', description: 'Please try again or call us.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (booked) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-success/20 bg-success/5 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-7 w-7 text-success" />
        </div>
        <h4 className="mt-4 font-heading text-lg font-bold text-brand-900">Inspection Scheduled!</h4>
        <p className="mt-1 text-sm text-muted-foreground">Your site visit for {project.name} on {new Date(form.date).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} is being processed. We'll confirm via {form.time}.</p>
        <Button onClick={() => { setBooked(false); setForm({ name: '', email: '', phone: '', date: '', time: 'Morning', attendees: 1, transport: false }); }}
          variant="outline" className="mt-4 border-brand-200">Book Another Inspection</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-brand-100 bg-ice-50 p-5">
      <h4 className="flex items-center gap-2 font-heading text-base font-bold text-brand-900">
        <CalendarCheck className="h-5 w-5 text-flame-500" /> Schedule Site Inspection
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Full Name *</Label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} className="h-10 bg-white" placeholder="Your name" required />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Phone *</Label>
          <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="h-10 bg-white" placeholder="+234..." required />
        </div>
      </div>
      <div>
        <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</Label>
        <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="h-10 bg-white" placeholder="you@email.com" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Preferred Date *</Label>
          <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="h-10 bg-white" required />
        </div>
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Time Slot</Label>
          <Select value={form.time} onValueChange={(v) => set('time', v)}>
            <SelectTrigger className="h-10 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Morning">Morning (9am – 12pm)</SelectItem>
              <SelectItem value="Afternoon">Afternoon (12pm – 3pm)</SelectItem>
              <SelectItem value="Evening">Evening (3pm – 6pm)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1.5 block text-xs font-medium text-muted-foreground">Number of Attendees</Label>
          <Input type="number" min="1" max="20" value={form.attendees} onChange={(e) => set('attendees', e.target.value)} className="h-10 bg-white" />
        </div>
        <div className="flex items-end">
          <label className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border border-brand-200 bg-white p-2.5">
            <Checkbox checked={form.transport} onCheckedChange={(c) => set('transport', c || false)} />
            <span className="flex items-center gap-1.5 text-sm text-brand-900"><Car className="h-3.5 w-3.5" /> Need transportation</span>
          </label>
        </div>
      </div>
      <Button type="submit" disabled={submitting} className="w-full bg-flame-500 hover:bg-flame-600">
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</> : <><CalendarCheck className="mr-2 h-4 w-4" /> Book Site Inspection</>}
      </Button>
    </form>
  );
}