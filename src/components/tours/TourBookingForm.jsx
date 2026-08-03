import { useState } from 'react';
import { CalendarCheck, Loader2, CheckCircle2, Video, MapPin, Car } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function TourBookingForm({ property, tour }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', date: '', time: 'Morning', type: 'physical', attendees: 1, transport: false });
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
        property_id: property.id,
        property_title: property.title,
        customer_name: form.name,
        customer_email: form.email || undefined,
        customer_phone: form.phone,
        requested_date: form.date,
        requested_time: form.time,
        number_of_attendees: Number(form.attendees) || 1,
        transportation_needed: form.transport,
        inspection_notes: form.type === 'virtual' ? 'Live video walkthrough requested' : 'Physical site inspection requested',
        status: 'pending',
      });
      setBooked(true);
      toast({ title: 'Inspection booked!', description: form.type === 'virtual' ? 'We will send you a video call link.' : 'We will confirm your appointment shortly.' });
    } catch (err) {
      toast({ title: 'Failed to book inspection', description: 'Please try again or call us.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (booked) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-success/20 bg-success/5 p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10"><CheckCircle2 className="h-6 w-6 text-success" /></div>
        <h4 className="mt-3 font-heading text-base font-bold text-brand-900">{form.type === 'virtual' ? 'Video Walkthrough Booked!' : 'Inspection Booked!'}</h4>
        <p className="mt-1 text-sm text-muted-foreground">We'll confirm your {form.type === 'virtual' ? 'virtual' : 'site'} visit for {new Date(form.date).toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' })} shortly.</p>
        <Button onClick={() => { setBooked(false); setForm({ name: '', email: '', phone: '', date: '', time: 'Morning', type: 'physical', attendees: 1, transport: false }); }}
          variant="outline" size="sm" className="mt-4 border-brand-200">Book Another</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-brand-100 bg-ice-50 p-5">
      <h4 className="flex items-center gap-2 font-heading text-base font-bold text-brand-900">
        <CalendarCheck className="h-5 w-5 text-flame-500" /> Book an Inspection
      </h4>

      {/* Inspection type toggle */}
      <div className="flex gap-2">
        <button type="button" onClick={() => set('type', 'physical')}
          className={`flex flex-1 items-center gap-1.5 rounded-lg border p-2.5 text-sm font-medium transition ${form.type === 'physical' ? 'border-flame-500 bg-flame-50 text-flame-700' : 'border-brand-200 bg-white text-muted-foreground'}`}>
          <MapPin className="h-4 w-4" /> Physical Visit
        </button>
        <button type="button" onClick={() => set('type', 'virtual')}
          className={`flex flex-1 items-center gap-1.5 rounded-lg border p-2.5 text-sm font-medium transition ${form.type === 'virtual' ? 'border-flame-500 bg-flame-50 text-flame-700' : 'border-brand-200 bg-white text-muted-foreground'}`}>
          <Video className="h-4 w-4" /> Live Video
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div>
          <Label className="mb-1 block text-xs text-muted-foreground">Name *</Label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} className="h-9 bg-white" placeholder="Your name" required />
        </div>
        <div>
          <Label className="mb-1 block text-xs text-muted-foreground">Phone *</Label>
          <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="h-9 bg-white" placeholder="+234..." required />
        </div>
      </div>
      <div>
        <Label className="mb-1 block text-xs text-muted-foreground">Email</Label>
        <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="h-9 bg-white" placeholder="you@email.com" />
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div>
          <Label className="mb-1 block text-xs text-muted-foreground">Date *</Label>
          <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="h-9 bg-white" required />
        </div>
        <div>
          <Label className="mb-1 block text-xs text-muted-foreground">Time Slot</Label>
          <Select value={form.time} onValueChange={(v) => set('time', v)}>
            <SelectTrigger className="h-9 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Morning">Morning (9–12)</SelectItem>
              <SelectItem value="Afternoon">Afternoon (12–3)</SelectItem>
              <SelectItem value="Evening">Evening (3–6)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {form.type === 'physical' && (
        <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-brand-200 bg-white p-2.5">
          <Checkbox checked={form.transport} onCheckedChange={(c) => set('transport', c || false)} />
          <span className="flex items-center gap-1.5 text-sm text-brand-900"><Car className="h-3.5 w-3.5" /> Need transportation</span>
        </label>
      )}
      <Button type="submit" disabled={submitting} className="w-full bg-flame-500 hover:bg-flame-600">
        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Booking...</> : <><CalendarCheck className="mr-2 h-4 w-4" /> Book {form.type === 'virtual' ? 'Video Walkthrough' : 'Site Inspection'}</>}
      </Button>
    </form>
  );
}