import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, ShieldCheck, Users, BarChart3, Settings, Globe, ArrowRight, ArrowLeft, Loader2, Check, Download, ChevronDown, Home, MapPin, FileText, Image, Scale, CheckCircle2, BookOpen, Upload, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import SubmissionSteps from '@/components/submission/SubmissionSteps';
import SignaturePad from '@/components/submission/SignaturePad';
import PowerOfAttorneyPanel from '@/components/submission/PowerOfAttorneyPanel';
import {
  SUBMISSION_STEPS, REQUIRED_DOCUMENTS, PROPERTY_TYPES, SERVICES, DECLARATIONS,
  SUBMISSION_GUIDELINES, OWNER_BENEFITS, FAQ_ITEMS, SUBMISSION_STATUS_CONFIG,
  generateSubmissionReference,
} from '@/lib/submission-utils';
import { formatPrice } from '@/lib/property-utils';

const ICON_MAP = { Megaphone, ShieldCheck, Users, BarChart3, Settings, Globe, BookOpen, Home, MapPin, FileText, Image, Scale, CheckCircle2, Upload, User, Search, Download };

export default function PropertySubmit() {
  const { toast } = useToast();
  const [step, setStep] = useState(-1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [poaData, setPoaData] = useState({});
  const [signature, setSignature] = useState(null);
  const [signatureMethod, setSignatureMethod] = useState('typed');
  const [uploads, setUploads] = useState({});
  const [mediaUploading, setMediaUploading] = useState(false);
  const [decl, setDecl] = useState({});

  const [form, setForm] = useState({
    owner_name: '', owner_email: '', owner_phone: '', owner_address: '', owner_state: '', owner_lga: '', owner_city: '',
    owner_nationality: 'Nigerian', owner_contact_method: 'phone', owner_id_number: '', owner_type: 'individual',
    co_owners: [], property_title: '', property_type: 'house', property_description: '', property_purpose: 'sale',
    services_requested: ['sale'], current_occupancy: 'vacant', construction_status: 'completed',
    bedrooms: '', bathrooms: '', land_size_sqm: '', building_size_sqm: '', year_built: '', asking_price_ngn: '',
    is_negotiable: true, encumbrances: '', utilities_available: [], accessibility: '', nearby_landmarks: '',
    location_state: '', location_lga: '', location_city: '', location_district: '', location_estate: '',
    location_street: '', location_plot_number: '', gps_latitude: '', gps_longitude: '', media_urls: [],
  });

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const validateStep = () => {
    if (step === 1) return form.owner_name && form.owner_email && form.owner_phone && form.owner_address;
    if (step === 2) return form.property_title && form.property_type && form.property_description;
    if (step === 3) return form.location_state && form.location_city;
    if (step === 4) return ['certificate_of_occupancy', 'deed_of_assignment', 'survey_plan'].every((d) => uploads[d]);
    if (step === 7) {
      const allDecl = DECLARATIONS.every((d) => decl[d.key]);
      return allDecl && signature;
    }
    return true;
  };

  const handleDocUpload = async (type, file) => {
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploads((p) => ({ ...p, [type]: { url: file_url, name: file.name } }));
  };

  const handleMediaUpload = async (files) => {
    if (!files?.length) return;
    setMediaUploading(true);
    try {
      const urls = [];
      for (const f of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
        urls.push(file_url);
      }
      set('media_urls', [...form.media_urls, ...urls]);
    } catch { /* silent */ }
    finally { setMediaUploading(false); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const ref = generateSubmissionReference();
      const documents = Object.entries(uploads).filter(([, v]) => v?.url).map(([type, v]) => ({
        doc_type: type, file_url: v.url, file_name: v.name, uploaded_at: new Date().toISOString(),
      }));

      const poa_status = poaData.poa_wishes_to_proceed || poaData.poa_uploaded_url ? 'pending_review' : 'not_required';

      const submission = await base44.entities.PropertySubmission.create({
        ...form,
        submission_reference: ref,
        status: 'submitted',
        documents,
        signature_url: signature,
        signature_method: signatureMethod,
        declarations_accepted: decl,
        poa_wishes_to_proceed: poaData.poa_wishes_to_proceed || false,
        poa_info: poaData,
        poa_uploaded_url: poaData.poa_uploaded_url || '',
        poa_review_status: poa_status,
        timeline: [{ event: 'Submission received', timestamp: new Date().toISOString() }],
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        land_size_sqm: form.land_size_sqm ? Number(form.land_size_sqm) : undefined,
        building_size_sqm: form.building_size_sqm ? Number(form.building_size_sqm) : undefined,
        year_built: form.year_built ? Number(form.year_built) : undefined,
        asking_price_ngn: form.asking_price_ngn ? Number(form.asking_price_ngn) : undefined,
        gps_latitude: form.gps_latitude ? Number(form.gps_latitude) : undefined,
        gps_longitude: form.gps_longitude ? Number(form.gps_longitude) : undefined,
      });

      setSubmitted({ ref, ...submission });
      toast({ title: 'Submission received!', description: `Your tracking reference is ${ref}` });
    } catch (err) {
      toast({ title: 'Submission failed', description: 'Please try again.', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  // Landing page
  if (step === -1 && !submitted) {
    return (
      <div className="min-h-screen bg-ice-50 pt-20 lg:pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden bg-brand-900 pb-14 pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800" />
          <div className="container-wide section-pad relative">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-flame-500/20 px-3 py-1 text-xs font-semibold text-flame-300">
                <Home className="h-3 w-3" /> Property Owner Submission
              </span>
              <h1 className="mt-4 font-heading text-4xl font-bold leading-tight text-white sm:text-5xl">
                Submit Your <span className="text-flame-500">Property</span>
              </h1>
              <p className="mt-4 text-lg text-white/70">
                List your property for sale, lease, management, or valuation with Property Question Nigeria. Our team handles verification, legal review, and professional marketing.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => setStep(0)} className="bg-flame-500 hover:bg-flame-600">
                  <Upload className="mr-2 h-5 w-5" /> Submit Your Property <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                  <Link to="/submit/track"><Search className="mr-2 h-5 w-5" /> Track Existing Submission</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="container-wide section-pad mt-10">
          <div className="mb-6 text-center">
            <h2 className="font-heading text-2xl font-bold text-brand-900">Why List With Property Question?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Professional services that maximise your property's potential</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OWNER_BENEFITS.map((b, i) => {
              const Icon = ICON_MAP[b.icon] || Megaphone;
              return (
                <div key={i} className="rounded-xl border border-brand-100 bg-white p-5 transition hover:border-flame-200 hover:shadow-card">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-flame-50 text-flame-600"><Icon className="h-6 w-6" /></div>
                  <h3 className="mt-3 font-heading text-base font-bold text-brand-900">{b.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Process overview */}
        <section className="container-wide section-pad mt-10">
          <div className="overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-ice-50 to-white p-6 sm:p-10">
            <div className="mb-6 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-flame-500" />
              <h2 className="mt-3 font-heading text-2xl font-bold text-brand-900">Submission Process</h2>
              <p className="mt-2 text-sm text-muted-foreground">A guided workflow from submission to listing</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: '1', title: 'Submit', desc: 'Complete the online form with property details' },
                { step: '2', title: 'Upload Documents', desc: 'Provide title documents and media' },
                { step: '3', title: 'Review', desc: 'Legal, GIS, and marketing verification' },
                { step: '4', title: 'Get Listed', desc: 'Your property goes live with a verified agent' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-brand-100 bg-white p-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-flame-500 font-heading text-sm font-bold text-white">{s.step}</span>
                  <h3 className="mt-3 font-heading text-sm font-bold text-brand-900">{s.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container-wide section-pad mt-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-center font-heading text-2xl font-bold text-brand-900">Frequently Asked Questions</h2>
            <div className="space-y-3">
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
        </section>

        {/* CTA */}
        <section className="container-wide section-pad mt-12 pb-16">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-800 to-brand-950 p-8 text-center sm:p-12">
            <Upload className="mx-auto h-12 w-12 text-flame-500" />
            <h2 className="mt-4 font-heading text-2xl font-bold text-white sm:text-3xl">Ready to List Your Property?</h2>
            <p className="mx-auto mt-3 max-w-lg text-white/70">Start your submission today and let our team handle the rest.</p>
            <Button size="lg" onClick={() => setStep(0)} className="mt-6 bg-flame-500 hover:bg-flame-600">
              <Upload className="mr-2 h-5 w-5" /> Submit Your Property <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // Success page
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice-50 pt-20">
        <div className="mx-4 max-w-md rounded-2xl border border-success/20 bg-white p-8 text-center shadow-premium-lg">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-8 w-8 text-success" />
          </div>
          <h1 className="mt-4 font-heading text-2xl font-bold text-brand-900">Submission Received!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Thank you, {submitted.owner_name}. Your property submission has been received. Our team will review it and contact you within 5–10 business days.
          </p>
          <div className="mt-4 rounded-lg bg-ice-50 p-3">
            <p className="text-xs text-muted-foreground">Your Tracking Reference</p>
            <p className="font-mono text-lg font-bold text-flame-600">{submitted.submission_reference}</p>
          </div>
          <div className="mt-6 flex gap-3">
            <Button asChild className="flex-1 bg-flame-500 hover:bg-flame-600">
              <Link to={`/submit/track?ref=${submitted.submission_reference}`}>Track Submission</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 border-brand-200">
              <Link to="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Submission form
  return (
    <div className="min-h-screen bg-ice-50 pt-20 lg:pt-24">
      <div className="container-wide section-pad py-8">
        <div className="mx-auto max-w-4xl">
          <Link to="/submit" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-900">
            <ArrowLeft className="h-4 w-4" /> Back to Landing
          </Link>

          <div className="mb-8 rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
            <h1 className="mb-1 font-heading text-2xl font-bold text-brand-900">Property Submission</h1>
            <p className="mb-6 text-sm text-muted-foreground">Complete all steps to submit your property for review.</p>
            <SubmissionSteps currentStep={step} />
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-6 shadow-card">
            {/* Step 0: Guidelines */}
            {step === 0 && (
              <div className="space-y-5">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900"><BookOpen className="h-5 w-5 text-flame-500" /> Submission Guidelines</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SUBMISSION_GUIDELINES.map((g, i) => (
                    <div key={i} className="rounded-xl border border-brand-100 bg-ice-50 p-4">
                      <h3 className="font-heading text-sm font-bold text-brand-900">{g.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{g.desc}</p>
                    </div>
                  ))}
                </div>
                {/* Downloadable form */}
                <div className="rounded-xl border border-flame-200 bg-flame-50/50 p-4">
                  <h3 className="flex items-center gap-2 font-heading text-sm font-bold text-brand-900"><Download className="h-4 w-4 text-flame-500" /> Downloadable Submission Form</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Download our editable form to prepare your information offline, then upload the completed version in the document step.</p>
                  <Button variant="outline" size="sm" className="mt-3 border-flame-300 text-flame-600 hover:bg-flame-100">
                    <Download className="mr-1.5 h-4 w-4" /> Download Form (DOCX)
                  </Button>
                </div>
              </div>
            )}

            {/* Step 1: Owner */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900"><User className="h-5 w-5 text-flame-500" /> Owner Information</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Full Name *" value={form.owner_name} onChange={(v) => set('owner_name', v)} />
                  <Field label="Email *" type="email" value={form.owner_email} onChange={(v) => set('owner_email', v)} />
                  <Field label="Phone *" value={form.owner_phone} onChange={(v) => set('owner_phone', v)} placeholder="+234..." />
                  <div>
                    <Label className="mb-1.5 block text-sm text-brand-900">Owner Type</Label>
                    <Select value={form.owner_type} onValueChange={(v) => set('owner_type', v)}>
                      <SelectTrigger className="h-10 bg-ice-50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="joint_venture">Joint Venture</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Field label="Residential Address *" value={form.owner_address} onChange={(v) => set('owner_address', v)} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="State *" value={form.owner_state} onChange={(v) => set('owner_state', v)} />
                  <Field label="LGA" value={form.owner_lga} onChange={(v) => set('owner_lga', v)} />
                  <Field label="City" value={form.owner_city} onChange={(v) => set('owner_city', v)} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="Nationality" value={form.owner_nationality} onChange={(v) => set('owner_nationality', v)} />
                  <div>
                    <Label className="mb-1.5 block text-sm text-brand-900">Preferred Contact</Label>
                    <Select value={form.owner_contact_method} onValueChange={(v) => set('owner_contact_method', v)}>
                      <SelectTrigger className="h-10 bg-ice-50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Field label="ID Number (NIN/Other)" value={form.owner_id_number} onChange={(v) => set('owner_id_number', v)} />
                </div>
              </div>
            )}

            {/* Step 2: Property */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900"><Home className="h-5 w-5 text-flame-500" /> Property Details</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Property Title *" value={form.property_title} onChange={(v) => set('property_title', v)} placeholder="e.g. 4 Bedroom Detached Duplex" />
                  <div>
                    <Label className="mb-1.5 block text-sm text-brand-900">Property Type *</Label>
                    <Select value={form.property_type} onValueChange={(v) => set('property_type', v)}>
                      <SelectTrigger className="h-10 bg-ice-50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm text-brand-900">Description *</Label>
                  <Textarea value={form.property_description} onChange={(e) => set('property_description', e.target.value)} rows={4} placeholder="Describe your property in detail..." className="bg-ice-50" />
                </div>
                <div>
                  <Label className="mb-2 block text-sm text-brand-900">Services Requested</Label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.map((s) => {
                      const selected = form.services_requested.includes(s.key);
                      return (
                        <button key={s.key} type="button" onClick={() => {
                          set('services_requested', selected ? form.services_requested.filter((k) => k !== s.key) : [...form.services_requested, s.key]);
                        }} className={`rounded-lg border px-3 py-1.5 text-sm transition ${selected ? 'border-flame-500 bg-flame-500 text-white' : 'border-brand-200 bg-ice-50 text-brand-700 hover:border-flame-300'}`}>
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <Label className="mb-1.5 block text-sm text-brand-900">Current Occupancy</Label>
                    <Select value={form.current_occupancy} onValueChange={(v) => set('current_occupancy', v)}>
                      <SelectTrigger className="h-10 bg-ice-50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacant">Vacant</SelectItem>
                        <SelectItem value="owner_occupied">Owner Occupied</SelectItem>
                        <SelectItem value="tenant_occupied">Tenant Occupied</SelectItem>
                        <SelectItem value="under_construction">Under Construction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block text-sm text-brand-900">Construction Status</Label>
                    <Select value={form.construction_status} onValueChange={(v) => set('construction_status', v)}>
                      <SelectTrigger className="h-10 bg-ice-50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="renovation_needed">Renovation Needed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Field label="Year Built" type="number" value={form.year_built} onChange={(v) => set('year_built', v)} />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Field label="Bedrooms" type="number" value={form.bedrooms} onChange={(v) => set('bedrooms', v)} />
                  <Field label="Bathrooms" type="number" value={form.bathrooms} onChange={(v) => set('bathrooms', v)} />
                  <Field label="Land Size (sqm)" type="number" value={form.land_size_sqm} onChange={(v) => set('land_size_sqm', v)} />
                  <Field label="Building Size (sqm)" type="number" value={form.building_size_sqm} onChange={(v) => set('building_size_sqm', v)} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Asking Price (NGN)" type="number" value={form.asking_price_ngn} onChange={(v) => set('asking_price_ngn', v)} />
                  <label className="flex cursor-pointer items-center gap-2.5 pt-6">
                    <Checkbox checked={form.is_negotiable} onCheckedChange={(c) => set('is_negotiable', c)} />
                    <span className="text-sm text-brand-900">Price is negotiable</span>
                  </label>
                </div>
                <Field label="Existing Encumbrances (if any)" value={form.encumbrances} onChange={(v) => set('encumbrances', v)} placeholder="None, or describe..." />
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900"><MapPin className="h-5 w-5 text-flame-500" /> Property Location</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <Field label="State *" value={form.location_state} onChange={(v) => set('location_state', v)} />
                  <Field label="LGA" value={form.location_lga} onChange={(v) => set('location_lga', v)} />
                  <Field label="City *" value={form.location_city} onChange={(v) => set('location_city', v)} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="District" value={form.location_district} onChange={(v) => set('location_district', v)} />
                  <Field label="Estate" value={form.location_estate} onChange={(v) => set('location_estate', v)} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Street" value={form.location_street} onChange={(v) => set('location_street', v)} />
                  <Field label="Plot Number" value={form.location_plot_number} onChange={(v) => set('location_plot_number', v)} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="GPS Latitude" type="number" value={form.gps_latitude} onChange={(v) => set('gps_latitude', v)} placeholder="e.g. 6.5244" />
                  <Field label="GPS Longitude" type="number" value={form.gps_longitude} onChange={(v) => set('gps_longitude', v)} placeholder="e.g. 3.3792" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Nearby Landmarks" value={form.nearby_landmarks} onChange={(v) => set('nearby_landmarks', v)} placeholder="e.g. Near Lekki Phase 1" />
                  <Field label="Accessibility" value={form.accessibility} onChange={(v) => set('accessibility', v)} placeholder="e.g. Tarred road access" />
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {step === 4 && (
              <div className="space-y-5">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900"><FileText className="h-5 w-5 text-flame-500" /> Document Upload</h2>
                <p className="text-sm text-muted-foreground">Upload your property documents. Required documents are marked with *.</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {REQUIRED_DOCUMENTS.map((doc) => (
                    <DocUploadField key={doc.key} doc={doc} uploaded={uploads[doc.key]} onUpload={(file) => handleDocUpload(doc.key, file)} />
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Media */}
            {step === 5 && (
              <div className="space-y-5">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900"><Image className="h-5 w-5 text-flame-500" /> Media Upload</h2>
                <p className="text-sm text-muted-foreground">Upload property photographs, videos, drone footage, or 360 media. You can upload multiple files.</p>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-ice-50 p-8 text-center transition hover:border-flame-400 hover:bg-flame-50">
                  {mediaUploading ? <Loader2 className="h-8 w-8 animate-spin text-flame-500" /> : <Upload className="h-8 w-8 text-muted-foreground" />}
                  <p className="mt-2 text-sm text-muted-foreground">{mediaUploading ? 'Uploading...' : 'Click or drag to upload media'}</p>
                  <p className="text-xs text-muted-foreground/60">JPG, PNG, MP4, MOV (max 10MB per file)</p>
                  <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={(e) => handleMediaUpload(Array.from(e.target.files))} />
                </label>
                {form.media_urls.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {form.media_urls.map((url, i) => (
                      <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-brand-100 bg-brand-100">
                        <img src={url} alt={`Media ${i + 1}`} className="h-full w-full object-cover" />
                        <button onClick={() => set('media_urls', form.media_urls.filter((_, j) => j !== i))}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-error hover:bg-white">&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 6: PoA */}
            {step === 6 && <PowerOfAttorneyPanel data={poaData} onChange={setPoaData} />}

            {/* Step 7: Review & Declarations */}
            {step === 7 && (
              <div className="space-y-5">
                <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-brand-900"><CheckCircle2 className="h-5 w-5 text-flame-500" /> Review & Declarations</h2>
                {/* Summary */}
                <div className="space-y-3">
                  <ReviewSection title="Owner" data={{ Name: form.owner_name, Email: form.owner_email, Phone: form.owner_phone, Type: form.owner_type, Address: form.owner_address }} />
                  <ReviewSection title="Property" data={{ Title: form.property_title, Type: form.property_type, Purpose: form.property_purpose, 'Asking Price': form.asking_price_ngn ? formatPrice(Number(form.asking_price_ngn)) : '—', Description: form.property_description?.slice(0, 100) + '...' }} />
                  <ReviewSection title="Location" data={{ State: form.location_state, LGA: form.location_lga, City: form.location_city, Estate: form.location_estate || '—' }} />
                  <ReviewSection title="Documents" data={Object.fromEntries(Object.entries(uploads).filter(([, v]) => v).map(([k, v]) => [k.replace(/_/g, ' '), '✓ Uploaded']))} />
                  <ReviewSection title="Media" data={{ 'Media files': `${form.media_urls.length} uploaded` }} />
                </div>

                {/* Declarations */}
                <div className="rounded-xl border border-brand-100 bg-ice-50 p-5">
                  <h3 className="mb-3 font-heading text-sm font-bold text-brand-900">Legal Declarations</h3>
                  <div className="space-y-3">
                    {DECLARATIONS.map((d) => (
                      <label key={d.key} className="flex cursor-pointer items-start gap-2.5">
                        <Checkbox checked={!!decl[d.key]} onCheckedChange={(c) => setDecl((p) => ({ ...p, [d.key]: c }))} className="mt-0.5" />
                        <span className="text-sm text-brand-900">{d.text}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Signature */}
                <div className="rounded-xl border border-brand-100 bg-ice-50 p-5">
                  <h3 className="mb-3 font-heading text-sm font-bold text-brand-900">Digital Signature</h3>
                  <SignaturePad onSigned={setSignature} signatureUrl={signature} method={signatureMethod} onMethodChange={setSignatureMethod} />
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
              <Button variant="outline" onClick={() => setStep((s) => Math.max(-1, s - 1))} disabled={step <= 0} className="border-brand-200">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Previous
              </Button>
              {step < SUBMISSION_STEPS.length - 1 ? (
                <Button onClick={() => setStep((s) => s + 1)} disabled={!validateStep()} className="bg-flame-500 hover:bg-flame-600">
                  Next <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting || !validateStep()} className="bg-success hover:bg-success/90">
                  {submitting ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Submitting...</> : <><Check className="mr-1.5 h-4 w-4" /> Submit for Review</>}
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
            <span className="text-right font-medium text-brand-900 capitalize">{v || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocUploadField({ doc, uploaded, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try { await onUpload(file); } catch { /* silent */ }
    finally { setUploading(false); }
  };
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-brand-900">{doc.label} {doc.required && <span className="text-error">*</span>}</label>
      {uploaded ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/5 p-3">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <span className="flex-1 truncate text-sm text-brand-900">{uploaded.name}</span>
          <button onClick={() => onUpload(null)} className="text-xs text-error hover:underline">Remove</button>
        </div>
      ) : (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-ice-50 p-4 text-center transition hover:border-flame-400 hover:bg-flame-50">
          {uploading ? <Loader2 className="h-5 w-5 animate-spin text-flame-500" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
          <p className="mt-1.5 text-xs text-muted-foreground">{uploading ? 'Uploading...' : 'Click to upload'}</p>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </label>
      )}
    </div>
  );
}