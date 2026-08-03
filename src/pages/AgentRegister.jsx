import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, User, MapPin, Briefcase, Upload, Check, Mail, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import RegistrationSteps from '@/components/agents/RegistrationSteps';
import DocumentUploader from '@/components/agents/DocumentUploader';
import { DOCUMENT_TYPE_CONFIG, REGISTRATION_STEPS } from '@/lib/agent-utils';

export default function AgentRegister() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', date_of_birth: '', gender: '',
    address: '', state: '', lga: '', city: '',
    occupation: '', years_experience: '', bio: '', specialization: 'residential',
    service_areas: [], languages: [],
    bank_name: '', bank_account_number: '', bank_account_name: '',
    emergency_contact_name: '', emergency_contact_phone: '',
  });
  const [docs, setDocs] = useState({});

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const requiredDocs = ['government_id', 'passport_photograph', 'utility_bill'];
  const optionalDocs = ['professional_certificate', 'signed_agreement', 'agency_license', 'tax_identification', 'bank_verification', 'proof_of_address'];

  const handleDoc = (type, url) => {
    setDocs((p) => ({ ...p, [type]: url }));
  };

  const validateStep = () => {
    if (step === 0) return form.full_name && form.email && form.phone && form.date_of_birth;
    if (step === 1) return form.address && form.state && form.city;
    if (step === 2) return form.occupation && form.bio;
    if (step === 3) return requiredDocs.every((d) => docs[d]);
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const agent = await base44.entities.Agent.create({
        ...form,
        status: 'pending',
        verification_status: 'unverified',
        years_experience: form.years_experience ? Number(form.years_experience) : undefined,
      });

      // Create agent document records
      const docEntries = Object.entries(docs).filter(([, url]) => url);
      for (const [type, url] of docEntries) {
        await base44.entities.AgentDocument.create({
          document_id: `doc-${Date.now()}-${type}`,
          agent_id: agent.id,
          agent_name: form.full_name,
          document_type: type,
          file_url: url,
          verification_status: 'pending',
        });
      }

      setSubmitted(agent);
      toast({ title: 'Application submitted!', description: 'We will review your application and contact you shortly.' });
    } catch (err) {
      toast({ title: 'Failed to submit', description: 'Please check your details and try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice-50 pt-20">
        <div className="mx-4 max-w-md rounded-2xl border border-success/20 bg-white p-8 text-center shadow-premium-lg">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold text-brand-900">Application Received!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you, {submitted.full_name}. Your agent application has been submitted successfully. Our team will review your documents and contact you within 3–7 business days.
          </p>
          {submitted.agent_code && <p className="mt-3 rounded-lg bg-ice-50 p-2 text-sm font-semibold text-brand-900">Agent Code: {submitted.agent_code}</p>}
          <div className="mt-6 flex gap-3">
            <Button asChild className="flex-1 bg-flame-500 hover:bg-flame-600">
              <Link to="/agents">Back to Agents</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-brand-200">
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const stepIcons = [User, MapPin, Briefcase, Upload, CheckCircle2];

  return (
    <div className="min-h-screen bg-ice-50 pt-20 lg:pt-24">
      <div className="container-wide section-pad py-8">
        <div className="mx-auto max-w-3xl">
          <Link to="/agents" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-900">
            <ArrowLeft className="h-4 w-4" /> Back to Agents
          </Link>

          <div className="mb-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
            <h1 className="mb-1 font-heading text-2xl font-bold text-brand-900">Agent Registration</h1>
            <p className="mb-6 text-sm text-muted-foreground">Complete all steps to join our network of verified real estate professionals.</p>
            <RegistrationSteps currentStep={step} />
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
            {/* Step 0: Personal */}
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900"><User className="h-5 w-5 text-flame-500" /> Personal Information</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full Name *" value={form.full_name} onChange={(v) => set('full_name', v)} placeholder="John Doe" />
                  <Field label="Email *" type="email" value={form.email} onChange={(v) => set('email', v)} placeholder="you@email.com" />
                  <Field label="Mobile Number *" value={form.phone} onChange={(v) => set('phone', v)} placeholder="+234..." />
                  <Field label="Date of Birth *" type="date" value={form.date_of_birth} onChange={(v) => set('date_of_birth', v)} />
                  <div>
                    <Label className="mb-1.5 block text-sm text-brand-900">Gender</Label>
                    <Select value={form.gender || '__none__'} onValueChange={(v) => set('gender', v === '__none__' ? '' : v)}>
                      <SelectTrigger className="h-10 bg-ice-50"><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Prefer not to say</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Contact & Address */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900"><MapPin className="h-5 w-5 text-flame-500" /> Contact & Address</h2>
                <Field label="Residential Address *" value={form.address} onChange={(v) => set('address', v)} placeholder="House number, street name" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="State *" value={form.state} onChange={(v) => set('state', v)} placeholder="e.g. Lagos" />
                  <Field label="LGA" value={form.lga} onChange={(v) => set('lga', v)} placeholder="e.g. Ikeja" />
                  <Field label="City *" value={form.city} onChange={(v) => set('city', v)} placeholder="e.g. Ikeja" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm text-brand-900">Preferred Operating Areas</Label>
                  <Input value={form.service_areas.join(', ')} onChange={(e) => set('service_areas', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    placeholder="Lagos, Abuja, Port Harcourt (comma separated)" className="bg-ice-50" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm text-brand-900">Languages Spoken</Label>
                  <Input value={form.languages.join(', ')} onChange={(e) => set('languages', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    placeholder="English, Yoruba, Hausa (comma separated)" className="bg-ice-50" />
                </div>
              </div>
            )}

            {/* Step 2: Professional */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900"><Briefcase className="h-5 w-5 text-flame-500" /> Professional Profile</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Current Occupation *" value={form.occupation} onChange={(v) => set('occupation', v)} placeholder="e.g. Real Estate Agent" />
                  <div>
                    <Label className="mb-1.5 block text-sm text-brand-900">Years of Experience</Label>
                    <Input type="number" value={form.years_experience} onChange={(e) => set('years_experience', e.target.value)} placeholder="e.g. 5" className="bg-ice-50" />
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm text-brand-900">Specialization</Label>
                  <Select value={form.specialization} onValueChange={(v) => set('specialization', v)}>
                    <SelectTrigger className="h-10 bg-ice-50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="mixed_use">Mixed Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm text-brand-900">Professional Biography *</Label>
                  <Textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} placeholder="Tell us about your experience and why you want to join..." rows={4} className="bg-ice-50" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-border pt-4">
                  <Field label="Bank Name" value={form.bank_name} onChange={(v) => set('bank_name', v)} placeholder="e.g. GTBank" />
                  <Field label="Account Number" value={form.bank_account_number} onChange={(v) => set('bank_account_number', v)} placeholder="0123456789" />
                  <Field label="Account Name" value={form.bank_account_name} onChange={(v) => set('bank_account_name', v)} placeholder="John Doe" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Emergency Contact Name" value={form.emergency_contact_name} onChange={(v) => set('emergency_contact_name', v)} placeholder="Contact person" />
                  <Field label="Emergency Contact Phone" value={form.emergency_contact_phone} onChange={(v) => set('emergency_contact_phone', v)} placeholder="+234..." />
                </div>
              </div>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900"><Upload className="h-5 w-5 text-flame-500" /> Document Upload</h2>
                <p className="text-sm text-muted-foreground">Upload the required documents below. All files are securely stored and confidentially reviewed.</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {requiredDocs.map((type) => (
                    <DocumentUploader key={type} label={DOCUMENT_TYPE_CONFIG[type].label} required onUploaded={(url) => handleDoc(type, url)} />
                  ))}
                </div>
                <div className="border-t border-border pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Optional Documents (Recommended)</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {optionalDocs.map((type) => (
                      <DocumentUploader key={type} label={DOCUMENT_TYPE_CONFIG[type].label} onUploaded={(url) => handleDoc(type, url)} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900"><CheckCircle2 className="h-5 w-5 text-flame-500" /> Review & Submit</h2>
                <p className="text-sm text-muted-foreground">Please review your information before submitting.</p>
                <ReviewSection title="Personal" data={{ Name: form.full_name, Email: form.email, Phone: form.phone, 'Date of Birth': form.date_of_birth }} />
                <ReviewSection title="Address" data={{ Address: form.address, State: form.state, LGA: form.lga, City: form.city }} />
                <ReviewSection title="Professional" data={{ Occupation: form.occupation, Experience: `${form.years_experience || 0} years`, Specialization: form.specialization, Bio: form.bio }} />
                <ReviewSection title="Documents" data={Object.fromEntries(Object.entries(docs).filter(([, u]) => u).map(([t, u]) => [DOCUMENT_TYPE_CONFIG[t]?.label || t, '✓ Uploaded']))} />
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="border-brand-200">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Previous
              </Button>
              {step < REGISTRATION_STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!validateStep()} className="bg-flame-500 hover:bg-flame-600">
                  Next <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting} className="bg-success hover:bg-success/90">
                  {submitting ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Submitting...</> : <><Check className="mr-1.5 h-4 w-4" /> Submit Application</>}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm text-brand-900">{label}</Label>
      <Input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-10 bg-ice-50" />
    </div>
  );
}

function ReviewSection({ title, data }) {
  return (
    <div className="rounded-xl border border-brand-100 bg-ice-50 p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="space-y-1.5">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{k}</span>
            <span className="text-right font-medium text-brand-900">{v || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}