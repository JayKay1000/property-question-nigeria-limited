import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Upload, X, ImagePlus, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  propertyTypeOptions, listingPurposeOptions, propertyStatusOptions, propertyClassificationOptions,
  propertyConditionOptions, furnishingOptions, availabilityOptions, visibilityOptions, nigerianStates,
} from '@/lib/upload-utils';

export default function PropertyUploadForm() {
  const [form, setForm] = useState({
    status: 'published', listing_purpose: 'sale', availability_status: 'available', property_classification: 'standard',
    property_condition: 'good', furnishing_status: 'unfurnished', visibility: 'public', currency: 'NGN',
    is_featured: false, is_premium: false, is_new_listing: true, bedrooms: 0, bathrooms: 0, parking_spaces: 0,
  });
  const [featuredImage, setFeaturedImage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const { toast } = useToast();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setNum = (k, v) => setForm(p => ({ ...p, [k]: v === '' ? null : Number(v) }));

  const uploadFile = async (file) => { const { file_url } = await base44.integrations.Core.UploadFile({ file }); return file_url; };

  const save = async () => {
    if (!form.title) { toast({ title: 'Property title is required', variant: 'destructive' }); return; }
    if (!form.property_type) { toast({ title: 'Property type is required', variant: 'destructive' }); return; }
    setSaving(true);
    try {
      let featured_image_url = null;
      let image_urls = [];
      if (featuredImage || gallery.length > 0) {
        setUploading(true);
        if (featuredImage) featured_image_url = await uploadFile(featuredImage);
        if (gallery.length > 0) image_urls = await Promise.all(gallery.map(uploadFile));
        setUploading(false);
      }
      const ref = `PQ-PROP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
      const slug = (form.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const payload = {
        ...form,
        reference_number: ref,
        property_code: ref,
        slug,
        featured_image_url,
        image_urls,
        published_at: form.status === 'published' || form.status === 'active' ? new Date().toISOString() : undefined,
      };
      const created = await base44.entities.Property.create(payload);
      setSaved(created);
      toast({ title: 'Property created successfully', description: ref });
      // reset
      setForm({ status: 'published', listing_purpose: 'sale', availability_status: 'available', property_classification: 'standard', property_condition: 'good', furnishing_status: 'unfurnished', visibility: 'public', currency: 'NGN', is_featured: false, is_premium: false, is_new_listing: true, bedrooms: 0, bathrooms: 0, parking_spaces: 0 });
      setFeaturedImage(null); setGallery([]);
    } catch (e) { toast({ title: 'Error creating property', description: e.message, variant: 'destructive' }); }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {saved && (
        <Card className="p-4 border-success/30 bg-success/5 flex items-center justify-between">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-success" /><div><p className="font-medium">Property created: {saved.title}</p><p className="text-xs text-muted-foreground">Reference {saved.reference_number}</p></div></div>
          <Button size="sm" variant="outline" onClick={() => setSaved(null)}>Create another</Button>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2"><Label>Property Title *</Label><Input value={form.title || ''} placeholder="4 Bedroom Detached House with Pool - Lekki Phase 1" onChange={e => set('title', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Property Type *</Label><Select value={form.property_type || ''} onValueChange={v => set('property_type', v)}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{propertyTypeOptions.map(o => <SelectItem key={o} value={o} className="capitalize">{o.replace(/_/g, ' ')}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Listing Purpose</Label><Select value={form.listing_purpose} onValueChange={v => set('listing_purpose', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{listingPurposeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Classification</Label><Select value={form.property_classification} onValueChange={v => set('property_classification', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{propertyClassificationOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Status</Label><Select value={form.status} onValueChange={v => set('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{propertyStatusOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Short Description</Label><Input value={form.short_description || ''} placeholder="Brief one-line summary for cards" onChange={e => set('short_description', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Condition</Label><Select value={form.property_condition} onValueChange={v => set('property_condition', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{propertyConditionOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Full Description</Label><Textarea value={form.description || ''} rows={4} placeholder="Detailed property description, features, and selling points…" onChange={e => set('description', e.target.value)} /></div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4">Pricing & Specifications</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5"><Label>Price (₦)</Label><Input type="number" value={form.price ?? ''} onChange={e => setNum('price', e.target.value)} placeholder="450000000" /></div>
          <div className="space-y-1.5"><Label>Bedrooms</Label><Input type="number" value={form.bedrooms ?? 0} onChange={e => setNum('bedrooms', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Bathrooms</Label><Input type="number" value={form.bathrooms ?? 0} onChange={e => setNum('bathrooms', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Parking</Label><Input type="number" value={form.parking_spaces ?? 0} onChange={e => setNum('parking_spaces', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Land Size (sqm)</Label><Input type="number" value={form.land_size_sqm ?? ''} onChange={e => setNum('land_size_sqm', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Built-up Area (sqm)</Label><Input type="number" value={form.built_up_area_sqm ?? ''} onChange={e => setNum('built_up_area_sqm', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Year Built</Label><Input type="number" value={form.year_built ?? ''} onChange={e => setNum('year_built', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Furnishing</Label><Select value={form.furnishing_status} onValueChange={v => set('furnishing_status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{furnishingOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4">Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>State</Label><Select value={form.state || ''} onValueChange={v => set('state', v)}><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{nigerianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>City / Town</Label><Input value={form.city || ''} placeholder="Lekki" onChange={e => set('city', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>LGA</Label><Input value={form.lga || ''} placeholder="Eti-Osa" onChange={e => set('lga', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>District / Area</Label><Input value={form.district || ''} placeholder="Lekki Phase 1" onChange={e => set('district', e.target.value)} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label>Address Line</Label><Input value={form.address_line || ''} placeholder="24 Admiralty Way, Lekki Phase 1" onChange={e => set('address_line', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Latitude</Label><Input type="number" step="any" value={form.latitude ?? ''} onChange={e => setNum('latitude', e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Longitude</Label><Input type="number" step="any" value={form.longitude ?? ''} onChange={e => setNum('longitude', e.target.value)} /></div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4">Images</h3>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Featured Image</Label>
            {featuredImage ? (
              <div className="relative inline-block">
                <img src={URL.createObjectURL(featuredImage)} alt="featured" className="w-40 h-28 object-cover rounded-lg border" />
                <button onClick={() => setFeaturedImage(null)} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-40 h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-flame-500 hover:bg-flame-50/50 transition-colors">
                <ImagePlus className="w-6 h-6 text-muted-foreground mb-1" /><span className="text-xs text-muted-foreground">Click to upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFeaturedImage(f); }} />
              </label>
            )}
          </div>
          <div>
            <Label className="mb-2 block">Image Gallery ({gallery.length})</Label>
            <div className="flex gap-2 flex-wrap">
              {gallery.map((f, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(f)} alt={`gallery-${i}`} className="w-24 h-20 object-cover rounded-lg border" />
                  <button onClick={() => setGallery(g => g.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-24 h-20 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-flame-500 hover:bg-flame-50/50 transition-colors">
                <ImagePlus className="w-5 h-5 text-muted-foreground" /><span className="text-xs text-muted-foreground">Add</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => { const fs = Array.from(e.target.files || []); if (fs.length) setGallery(g => [...g, ...fs]); }} />
              </label>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="font-heading font-bold mb-4">Listing Options</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5"><Label>Availability</Label><Select value={form.availability_status} onValueChange={v => set('availability_status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{availabilityOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Visibility</Label><Select value={form.visibility} onValueChange={v => set('visibility', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{visibilityOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5 flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="h-4 w-4 accent-flame-500" /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!form.is_premium} onChange={e => set('is_premium', e.target.checked)} className="h-4 w-4 accent-flame-500" /> Premium</label>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2 sticky bottom-4">
        <Button onClick={save} disabled={saving} className="bg-flame-500 hover:bg-flame-600 text-white border-0 shadow-lg">
          {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {uploading ? 'Uploading images…' : 'Saving…'}</> : <><Save className="w-4 h-4 mr-2" /> Create Property</>}
        </Button>
      </div>
    </div>
  );
}