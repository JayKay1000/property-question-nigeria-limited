import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Loader2, ArrowLeft, ArrowRight, Check, Image as ImageIcon, Home, FileText, ShieldCheck, AlertCircle, Save, Send, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { COMMON_AMENITIES, CLASSIFICATION_CONFIG, CONDITION_CONFIG, FURNISHING_CONFIG, PURPOSE_CONFIG, formatPrice } from '@/lib/property-utils';
import PropertyPhotoUploader from '@/components/marketplace/PropertyPhotoUploader';
import MarketplaceHeader from '@/components/marketplace/MarketplaceHeader';
import MarketplaceFooter from '@/components/marketplace/MarketplaceFooter';

const PROPERTY_CATEGORIES = {
  residential: { label: 'Residential', types: ['Apartment', 'Flat', 'Bungalow', 'Duplex', 'Detached House', 'Terrace', 'Villa', 'Maisonette', 'Penthouse', 'Townhouse'] },
  land: { label: 'Land & Plots', types: ['Plot of Land', 'Agricultural Land', 'Commercial Land', 'Industrial Land'] },
  commercial: { label: 'Commercial', types: ['Office', 'Shop', 'Warehouse', 'Factory', 'Hotel', 'Event Center', 'Shopping Complex', 'Restaurant'] },
};

const STEPS = ['Transaction', 'Details', 'Photos', 'Review'];

const defaultForm = {
  listing_purpose: 'sale', property_type: '', property_classification: '',
  title: '', description: '', price: '', currency: 'NGN', pricing_frequency: '',
  state: '', city: '', lga: '', district: '', estate: '', address_line: '',
  bedrooms: '', bathrooms: '', toilets: '', parking_spaces: '',
  land_size_sqm: '', built_up_area_sqm: '', year_built: '', plot_dimensions: '',
  property_condition: '', furnishing_status: '', amenities: [], is_joint_venture: false,
  ownership_confirmed: false,
};

export default function MarketplacePropertyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(defaultForm);
  const [images, setImages] = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [category, setCategory] = useState('residential');
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const isLand = category === 'land';

  // Load existing listing for editing
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await base44.entities.Property.get(id);
        setForm({
          listing_purpose: p.listing_purpose || 'sale',
          property_type: p.property_type || '',
          property_classification: p.property_classification || '',
          title: p.title || '', description: p.description || '',
          price: p.price ?? '', currency: p.currency || 'NGN', pricing_frequency: p.pricing_frequency || '',
          state: p.state || '', city: p.city || '', lga: p.lga || '', district: p.district || '',
          estate: p.estate || '', address_line: p.address_line || '',
          bedrooms: p.bedrooms ?? '', bathrooms: p.bathrooms ?? '', toilets: p.toilets ?? '',
          parking_spaces: p.parking_spaces ?? '', land_size_sqm: p.land_size_sqm ?? '',
          built_up_area_sqm: p.built_up_area_sqm ?? '', year_built: p.year_built ?? '',
          plot_dimensions: p.plot_dimensions || '', property_condition: p.property_condition || '',
          furnishing_status: p.furnishing_status || '', amenities: p.amenities || [],
          is_joint_venture: p.is_joint_venture || false, ownership_confirmed: p.ownership_confirmed || false,
        });
        const imgs = [];
        if (p.featured_image_url) imgs.push(p.featured_image_url);
        if (p.image_urls) imgs.push(...p.image_urls);
        const deduped = [...new Set(imgs)];
        setImages(deduped);
        setCoverIndex(0);
        // Detect category from property_type
        for (const [cat, cfg] of Object.entries(PROPERTY_CATEGORIES)) {
          if (cfg.types.includes(p.property_type)) { setCategory(cat); break; }
        }
      } catch {
        setError('Listing not found or you do not have permission to edit it.');
      }
      setLoading(false);
    })();
  }, [id]);

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const set = (key, value) => { setForm((p) => ({ ...p, [key]: value })); setDirty(true); };
  const toggleAmenity = (a) => {
    setForm((p) => ({ ...p, amenities: p.amenities.includes(a) ? p.amenities.filter((x) => x !== a) : [...p.amenities, a] }));
    setDirty(true);
  };

  const validateStep = (s) => {
    if (s === 0) {
      if (!form.listing_purpose) return 'Select a transaction type.';
      if (!form.property_type) return 'Select a property type.';
    }
    if (s === 1) {
      if (!form.title.trim()) return 'Advertisement title is required.';
      if (!form.state.trim()) return 'State is required.';
      if (form.price && Number(form.price) < 0) return 'Price cannot be negative.';
    }
    if (s === 3) {
      if (!form.ownership_confirmed) return 'You must confirm ownership or marketing authority.';
    }
    return null;
  };

  const next = () => { const err = validateStep(step); if (err) { setError(err); return; } setError(''); setStep((s) => Math.min(s + 1, 3)); };
  const prev = () => { setError(''); setStep((s) => Math.max(s - 1, 0)); };

  const buildListingData = () => {
    const data = { ...form };
    // Convert numeric fields
    ['price', 'bedrooms', 'bathrooms', 'toilets', 'parking_spaces', 'land_size_sqm', 'built_up_area_sqm', 'year_built'].forEach((f) => {
      data[f] = data[f] === '' ? undefined : Number(data[f]);
    });
    // Cover image is the selected one; the rest form the gallery
    const safeCover = Math.min(Math.max(coverIndex, 0), Math.max(images.length - 1, 0));
    data.featured_image_url = images.length ? images[safeCover] : '';
    data.image_urls = images.filter((_, i) => i !== safeCover);
    // Ownership timestamp
    if (form.ownership_confirmed) data.ownership_confirmed_at = new Date().toISOString();
    return data;
  };

  const handleSave = async (submit = false) => {
    const err = validateStep(1) || validateStep(0);
    if (err) { setError(err); setStep(err.includes('transaction') || err.includes('property type') ? 0 : 1); return; }
    if (submit && !form.ownership_confirmed) { setError('You must confirm ownership before submitting.'); setStep(3); return; }
    setSaving(true);
    setError('');
    try {
      const listing_data = buildListingData();
      const res = await base44.functions.invoke('saveMarketplaceListing', { listing_id: id || null, listing_data });
      const newId = res.data?.listing_id || res.listing_id;
      if (submit && newId) {
        await base44.functions.invoke('submitMarketplaceListing', { listing_id: newId });
      }
      setDirty(false);
      navigate('/marketplace/agent/dashboard');
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to save. Please try again.');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf9]">
        <MarketplaceHeader />
        <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-flame-500" /></div>
        <MarketplaceFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfaf9]">
      <MarketplaceHeader />
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <Link to="/marketplace/agent/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-900">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <h1 className="mb-1 font-heading text-2xl font-bold text-brand-900">{id ? 'Edit Property' : 'Post New Property'}</h1>
        <p className="mb-6 text-sm text-muted-foreground">Create a property advertisement for the PQNL Marketplace.</p>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={i} className="flex flex-1 items-center">
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i < step ? 'bg-success text-white' : i === step ? 'bg-flame-500 text-white' : 'bg-brand-100 text-muted-foreground'
              }`}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`mx-1.5 h-0.5 flex-1 rounded ${i < step ? 'bg-success' : 'bg-brand-100'}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-6">
          {/* Step 0: Transaction & Category */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <Label className="mb-2 block text-sm font-semibold text-brand-900">Transaction Type *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PURPOSE_CONFIG).map(([val, label]) => (
                    <button key={val} onClick={() => set('listing_purpose', val)}
                      className={`rounded-lg border p-3 text-center text-sm font-semibold transition ${
                        form.listing_purpose === val ? 'border-flame-500 bg-flame-50 text-flame-700' : 'border-border text-muted-foreground hover:bg-brand-50'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-sm font-semibold text-brand-900">Property Category *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PROPERTY_CATEGORIES).map(([val, cfg]) => (
                    <button key={val} onClick={() => { setCategory(val); set('property_type', ''); }}
                      className={`rounded-lg border p-3 text-center text-sm font-semibold transition ${
                        category === val ? 'border-flame-500 bg-flame-50 text-flame-700' : 'border-border text-muted-foreground hover:bg-brand-50'
                      }`}>
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-sm font-semibold text-brand-900">Property Type *</Label>
                <Select value={form.property_type || '__none__'} onValueChange={(v) => set('property_type', v === '__none__' ? '' : v)}>
                  <SelectTrigger className="h-10 border-input bg-white"><SelectValue placeholder="Select property type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Select…</SelectItem>
                    {PROPERTY_CATEGORIES[category].types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block text-sm font-semibold text-brand-900">Classification (optional)</Label>
                <Select value={form.property_classification || '__none__'} onValueChange={(v) => set('property_classification', v === '__none__' ? '' : v)}>
                  <SelectTrigger className="h-10 border-input bg-white"><SelectValue placeholder="Select classification" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {Object.entries(CLASSIFICATION_CONFIG).map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Step 1: Property Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-brand-900">Advertisement Title *</Label>
                <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. 3 Bedroom Detached House in Lekki Phase 1" className="h-10" />
              </div>

              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-brand-900">Description</Label>
                <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} placeholder="Describe the property features, location advantages, and key selling points…" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold text-brand-900">Price (₦) *</Label>
                  <Input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="5000000" className="h-10" min="0" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold text-brand-900">Currency</Label>
                  <Select value={form.currency} onValueChange={(v) => set('currency', v)}>
                    <SelectTrigger className="h-10 border-input bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">₦ NGN</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(form.listing_purpose === 'rent' || form.listing_purpose === 'lease') && (
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold text-brand-900">Pricing Frequency</Label>
                  <Select value={form.pricing_frequency || '__none__'} onValueChange={(v) => set('pricing_frequency', v === '__none__' ? '' : v)}>
                    <SelectTrigger className="h-10 border-input bg-white"><SelectValue placeholder="Select frequency" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">One-time</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold text-brand-900">State *</Label>
                  <Input value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="Lagos" className="h-10" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold text-brand-900">City / Town</Label>
                  <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Lekki" className="h-10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold text-brand-900">LGA</Label>
                  <Input value={form.lga} onChange={(e) => set('lga', e.target.value)} placeholder="Eti-Osa" className="h-10" />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm font-semibold text-brand-900">Neighbourhood / District</Label>
                  <Input value={form.district} onChange={(e) => set('district', e.target.value)} placeholder="Lekki Phase 1" className="h-10" />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block text-sm font-semibold text-brand-900">Address / Location Description</Label>
                <Input value={form.address_line} onChange={(e) => set('address_line', e.target.value)} placeholder="Street address or landmark description" className="h-10" />
              </div>

              {/* Conditional fields for non-land */}
              {!isLand && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div><Label className="mb-1 block text-xs font-semibold text-brand-800">Bedrooms</Label><Input type="number" value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} placeholder="3" className="h-10" min="0" /></div>
                  <div><Label className="mb-1 block text-xs font-semibold text-brand-800">Bathrooms</Label><Input type="number" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} placeholder="2" className="h-10" min="0" /></div>
                  <div><Label className="mb-1 block text-xs font-semibold text-brand-800">Toilets</Label><Input type="number" value={form.toilets} onChange={(e) => set('toilets', e.target.value)} placeholder="4" className="h-10" min="0" /></div>
                  <div><Label className="mb-1 block text-xs font-semibold text-brand-800">Parking</Label><Input type="number" value={form.parking_spaces} onChange={(e) => set('parking_spaces', e.target.value)} placeholder="2" className="h-10" min="0" /></div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div><Label className="mb-1 block text-xs font-semibold text-brand-800">Land Size (sqm)</Label><Input type="number" value={form.land_size_sqm} onChange={(e) => set('land_size_sqm', e.target.value)} placeholder="600" className="h-10" min="0" /></div>
                {!isLand && <div><Label className="mb-1 block text-xs font-semibold text-brand-800">Floor Area (sqm)</Label><Input type="number" value={form.built_up_area_sqm} onChange={(e) => set('built_up_area_sqm', e.target.value)} placeholder="250" className="h-10" min="0" /></div>}
                {isLand && <div><Label className="mb-1 block text-xs font-semibold text-brand-800">Plot Dimensions</Label><Input value={form.plot_dimensions} onChange={(e) => set('plot_dimensions', e.target.value)} placeholder="100 x 50 ft" className="h-10" /></div>}
              </div>

              {!isLand && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="mb-1 block text-xs font-semibold text-brand-800">Year Built</Label>
                    <Input type="number" value={form.year_built} onChange={(e) => set('year_built', e.target.value)} placeholder="2020" className="h-10" min="0" />
                  </div>
                  <div>
                    <Label className="mb-1 block text-xs font-semibold text-brand-800">Condition</Label>
                    <Select value={form.property_condition || '__none__'} onValueChange={(v) => set('property_condition', v === '__none__' ? '' : v)}>
                      <SelectTrigger className="h-10 border-input bg-white text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">—</SelectItem>
                        {Object.entries(CONDITION_CONFIG).map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1 block text-xs font-semibold text-brand-800">Furnishing</Label>
                    <Select value={form.furnishing_status || '__none__'} onValueChange={(v) => set('furnishing_status', v === '__none__' ? '' : v)}>
                      <SelectTrigger className="h-10 border-input bg-white text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">—</SelectItem>
                        {Object.entries(FURNISHING_CONFIG).map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Amenities */}
              <div>
                <Label className="mb-2 block text-sm font-semibold text-brand-900">Amenities</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_AMENITIES.map((a) => (
                    <button key={a} onClick={() => toggleAmenity(a)} type="button"
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        form.amenities.includes(a) ? 'border-flame-500 bg-flame-50 text-flame-700' : 'border-border text-muted-foreground hover:bg-brand-50'
                      }`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2">
                <Checkbox checked={form.is_joint_venture} onCheckedChange={(c) => set('is_joint_venture', !!c)} />
                <span className="text-sm text-brand-700">This is a Joint Venture property</span>
              </label>
            </div>
          )}

          {/* Step 2: Photos */}
          {step === 2 && (
            <div>
              <h3 className="mb-1 font-heading text-base font-bold text-brand-900">Property Photographs</h3>
              <p className="mb-4 text-sm text-muted-foreground">Upload genuine photos of the property. The first photo will be the cover image shown in search results.</p>
              <PropertyPhotoUploader
                images={images}
                onChange={(imgs) => { setImages(imgs); setDirty(true); }}
                coverIndex={coverIndex}
                onCoverChange={(idx) => { setCoverIndex(idx); setDirty(true); }}
              />
            </div>
          )}

          {/* Step 3: Review & Save */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="mb-1 font-heading text-base font-bold text-brand-900">Review Your Advertisement</h3>
                <p className="mb-4 text-sm text-muted-foreground">Check the details below before saving or submitting.</p>
              </div>

              {/* Preview card */}
              <div className="overflow-hidden rounded-xl border border-border">
                {images[Math.min(Math.max(coverIndex, 0), Math.max(images.length - 1, 0))] ? (
                  <img src={images[Math.min(Math.max(coverIndex, 0), Math.max(images.length - 1, 0))]} alt={form.title} className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-brand-50 text-brand-200"><ImageIcon className="h-10 w-10" /></div>
                )}
                <div className="p-3">
                  <p className="font-heading text-lg font-bold text-brand-900">{form.price ? formatPrice(Number(form.price)) : 'Price on request'}</p>
                  <p className="text-sm font-medium text-brand-800">{form.title || 'Untitled property'}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{[form.city, form.state].filter(Boolean).join(', ') || 'Location not set'}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-border bg-brand-50/30 p-3 text-sm">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  <dt className="text-muted-foreground">Type</dt><dd className="text-brand-900">{form.property_type || '—'}</dd>
                  <dt className="text-muted-foreground">Purpose</dt><dd className="text-brand-900">{PURPOSE_CONFIG[form.listing_purpose] || '—'}</dd>
                  {!isLand && <><dt className="text-muted-foreground">Bedrooms</dt><dd className="text-brand-900">{form.bedrooms || '—'}</dd></>}
                  <dt className="text-muted-foreground">Land Size</dt><dd className="text-brand-900">{form.land_size_sqm ? `${form.land_size_sqm} sqm` : '—'}</dd>
                  <dt className="text-muted-foreground">Photos</dt><dd className="text-brand-900">{images.length}</dd>
                </dl>
              </div>

              {/* Ownership declaration */}
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border bg-brand-50/50 p-3">
                <Checkbox checked={form.ownership_confirmed} onCheckedChange={(c) => set('ownership_confirmed', !!c)} className="mt-0.5" />
                <span className="text-xs leading-relaxed text-brand-700">
                  I confirm that I own this property or have been authorised to market it. I understand that this declaration does not constitute legal title verification by PQNL, and that PQNL may review or remove the advertisement if the declaration is found to be false.
                </span>
              </label>
            </div>
          )}

          {error && <div className="mt-4 rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">{error}</div>}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button onClick={prev} variant="outline" disabled={step === 0 || saving} className="border-brand-200 hover:bg-brand-50">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <div className="flex gap-2">
              {step < 3 ? (
                <Button onClick={next} className="bg-brand-900 text-white hover:bg-brand-800">
                  Next <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button onClick={() => handleSave(false)} disabled={saving} variant="outline" className="border-brand-200 hover:bg-brand-50">
                    {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                    Save Draft
                  </Button>
                  <Button onClick={() => handleSave(true)} disabled={saving} className="bg-flame-500 text-white hover:bg-flame-600">
                    {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Send className="mr-1.5 h-4 w-4" />}
                    Submit for Review
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick save for draft (available from any step) */}
        {step < 3 && (
          <div className="mt-3 text-center">
            <Button onClick={() => handleSave(false)} disabled={saving} variant="ghost" size="sm" className="text-muted-foreground">
              {saving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
              Save as Draft
            </Button>
          </div>
        )}
      </div>
      <MarketplaceFooter />
    </div>
  );
}