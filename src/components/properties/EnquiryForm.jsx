import { useState, useMemo, useEffect } from 'react';
import { Send, Loader2, CheckCircle2, Phone, Mail, MessageCircle, CalendarCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { INQUIRY_CATEGORIES, generateQuestions, buildPrefilledMessage } from '@/lib/enquiry-utils';

export default function EnquiryForm({ property, onSuccess }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', message: '', contactMethod: 'phone',
    category: 'general_info', questions: [],
    inspectionRequested: false, inspectionDate: '', inspectionTime: '',
  });

  const availableQuestions = useMemo(() => generateQuestions(property), [property]);
  const listingRef = property?.reference_number || property?.property_code || '';

  // Prefill the message when category or questions change (only if user hasn't heavily edited)
  const [messageEdited, setMessageEdited] = useState(false);
  useEffect(() => {
    if (!messageEdited) {
      const prefilled = buildPrefilledMessage(property, form.category, form.questions);
      setForm((f) => ({ ...f, message: prefilled }));
    }
  }, [form.category, form.questions, property, messageEdited]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleQuestion = (q) => {
    setForm((f) => ({
      ...f,
      questions: f.questions.includes(q) ? f.questions.filter((x) => x !== q) : [...f.questions, q],
    }));
  };

  // Auto-enable inspection fields when category is inspection_request
  const inspectionEnabled = form.category === 'inspection_request' || form.inspectionRequested;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) { setError('Please enter your name.'); return; }
    if (!form.phone.trim() && !form.email.trim()) { setError('A phone number or email is required.'); return; }
    if (!form.message.trim()) { setError('Please enter a message.'); return; }
    if (inspectionEnabled && !form.inspectionDate) { setError('Please select a preferred inspection date.'); return; }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('submitPropertyEnquiry', {
        property_id: property.id,
        customer_name: form.name.trim(),
        customer_phone: form.phone.trim() || null,
        customer_email: form.email.trim() || null,
        message: form.message.trim(),
        preferred_contact_method: form.contactMethod,
        inquiry_category: form.category,
        questions: form.questions,
        inspection_requested: inspectionEnabled,
        preferred_inspection_date: inspectionEnabled ? form.inspectionDate : null,
        preferred_inspection_time: inspectionEnabled ? form.inspectionTime : null,
      });
      setSubmitted(res.data.reference || 'Submitted');
      toast({ title: 'Enquiry sent!', description: 'The advertiser will contact you soon.' });
      onSuccess?.(res.data);
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
        {inspectionEnabled && (
          <p className="mt-1 text-xs text-flame-600 font-medium">Your site inspection request has been forwarded to the advertiser for confirmation.</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">The advertiser will contact you using your preferred method.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => {
          setSubmitted(null);
          setMessageEdited(false);
          setForm({ name: '', phone: '', email: '', message: '', contactMethod: 'phone', category: 'general_info', questions: [], inspectionRequested: false, inspectionDate: '', inspectionTime: '' });
        }}>
          Send Another Enquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {listingRef && (
        <div className="rounded-lg bg-ice-50 border border-ice-200 px-3 py-2 text-xs text-muted-foreground">
          Listing Reference: <span className="font-mono font-semibold text-brand-900">{listingRef}</span>
        </div>
      )}

      <div>
        <Label htmlFor="eq-cat" className="text-xs">Inquiry Category</Label>
        <Select value={form.category} onValueChange={(v) => set('category', v)}>
          <SelectTrigger id="eq-cat" className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            {INQUIRY_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Structured questions */}
      {availableQuestions.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowQuestions(!showQuestions)}
            className="flex w-full items-center justify-between text-xs font-medium text-brand-700 hover:text-flame-600"
          >
            <span>Select questions to include ({form.questions.length} selected)</span>
            {showQuestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showQuestions && (
            <div className="mt-2 max-h-44 space-y-2 overflow-y-auto rounded-lg border border-border bg-ice-50 p-3">
              {availableQuestions.map((q) => (
                <div key={q} className="flex items-start gap-2">
                  <Checkbox id={`q-${q}`} checked={form.questions.includes(q)} onCheckedChange={() => toggleQuestion(q)} className="mt-0.5" />
                  <label htmlFor={`q-${q}`} className="text-xs leading-relaxed text-brand-800 cursor-pointer">{q}</label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Inspection scheduling */}
      {(inspectionEnabled || form.category === 'inspection_request') && (
        <div className="rounded-lg border border-flame/20 bg-flame/5 p-3 space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-flame-700">
            <CalendarCheck className="h-3.5 w-3.5" /> Site Inspection Request
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="eq-idate" className="text-xs">Preferred Date *</Label>
              <Input id="eq-idate" type="date" value={form.inspectionDate} onChange={(e) => set('inspectionDate', e.target.value)} className="h-10" />
            </div>
            <div>
              <Label htmlFor="eq-itime" className="text-xs">Preferred Time</Label>
              <Input id="eq-itime" type="time" value={form.inspectionTime} onChange={(e) => set('inspectionTime', e.target.value)} className="h-10" />
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">The advertiser will confirm or propose an alternative time.</p>
        </div>
      )}

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
        <Textarea id="eq-msg" value={form.message} onChange={(e) => { set('message', e.target.value); setMessageEdited(true); }} rows={4}
          placeholder={`I am interested in ${property.title}. Please share more details.`} />
        <p className="mt-0.5 text-[10px] text-muted-foreground">Edit the message above before sending.</p>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full bg-flame-500 hover:bg-flame-600">
        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : <><Send className="mr-2 h-4 w-4" /> Send Enquiry</>}
      </Button>
    </form>
  );
}