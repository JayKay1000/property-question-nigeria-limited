import React, { useState, useEffect } from 'react';
import { Loader2, Save, X, ImagePlus, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import {
  propertyTypeOptions, listingPurposeOptions, propertyClassificationOptions,
  propertyConditionOptions, furnishingOptions, nigerianStates,
} from '@/lib/upload-utils';
import { COMMON_AMENITIES, formatPrice } from '@/lib/property-utils';

const blank = {
  title: '', short_description: '', description: '', price: '',
  listing_purpose: 'sale', property_type: 'house',
  bedrooms: '', bathrooms: '', parking_spaces: '',
  land_size_sqm: '', built_up_area_sqm: '', year_built: '',
  property_classification: 'standard', property_condition: 'good', furnishing_status: 'unfurnished',
  state: '', city: '', district: '', address_line: '',
  amenities: [], highlights: '',
};

export default function PropertyListingForm({ open, onOpenChange, onSaved, editing, user, isAgent }) {
  const [form, setForm] = useState(blank);
  const [featured, setFeatured] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        ...blank,
        title: editing.property_title || editing.title || '',
        short_description: editing.short_description || '',
        description: editing.description || '',
        price: editing.preferred_price ?? editing.price ?? '',
        property_type: editing.property_type || 'house',
        listing_purpose: editing.listing_purpose || 'sale',
        bedrooms: editing.bedrooms ?? '',
        bathrooms: editing.bathrooms ?? '',
        parking_spaces: editing.parking_spaces ?? '',
        land_size_sqm: editing.land_size_sqm ?? '',
        built_up_area_sqm: editing.built_up_area_sqm ?? '',
        year_built: editing.year_built ?? '',
        property_classification: editing.property_classification || 'standard',
        property_condition: editing.property_condition || 'good',
        furnishing_status: editing.furnishing_status || 'unfurnished',
        state: editing.state || '',
        city: editing.city || '',
        district: editing.district || '',
        address_line: editing.address_line || '',
        amenities: editing.amenities || [],
        highlights: Array.isArray(editing.highlights) ? editing.highlights.join(', ') : (editing.highlights || ''),
      });
    } else {
      setForm(blank);
    }
    setFeatured(null);
    setGallery([]);
  }, [open, editing]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setNum = (k, v) => set(k, v === '' ? '' : Number(v));

  const toggleAmenity = (a) =>
    setForm((p) => ({
      ...p,
      amenities: p.amenities.includes(a) ? p.amenities.filter((x) => x !== a) : [...p.amenities, a],
    }));

  const uploadFile = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return file_url;
  };

  const submit = async () => {
    if (!form.title?.trim()) { toast({ title: 'Title is required', variant: 'destructive' }); return; }
    if (!form.property_type) { toast({ title: 'Property type is required', variant: 'destructive' }); return; }
    if (!form.state) { toast({ title: 'Please select a state', variant: 'destructive' }); return; }
    if (!form.price) { toast({ title: 'Price is required', variant: 'destructive' }); return; }
    setBusy(true);
    try {
      let featured_image_url = editing?.featured_image_url || null;
      let image_urls = editing?.image_urls || [];
      if (featured || gallery.length) {
        if (featured) featured_image_url = await uploadFile(featured);
        if (gallery.length) image_urls = [...image_urls, ...(await Promise.all(gallery.map(uploadFile)))];
      }
      const ref = editing?.reference_number || `PQ-PROP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const slug = (form.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const payload = {
        property_title: form.title,
        short_description: form.short_description || '',
        description: form.description || '',
        property_address: [form.address_line, form.district, form.city, form.state].filter(Boolean).join(', '),
        preferred_price: form.price === '' ? null : Number(form.price),
        currency: 'NGN',
        property_type: form.property_type,
        listing_purpose: form.listing_purpose,
        bedrooms: form.bedrooms === '' ? null : Number(form.bedrooms),
        bathrooms: form.bathrooms === '' ? null : Number(form.bathrooms),
        parking_spaces: form.parking_spaces === '' ? null : Number(form.parking_spaces),
        land_size_sqm: form.land_size_sqm === '' ? null : Number(form.land_size_sqm),
        built_up_area_sqm: form.built_up_area_sqm === '' ? null : Number(form.built_up_area_sqm),
        year_built: form.year_built === '' ? null : Number(form.year_built),
        property_classification: form.property_classification,
        property_condition: form.property_condition,
        furnishing_status: form.furnishing_status,
        state: form.state,
        city: form.city,
        district: form.district,
        address_line: form.address_line,
        amenities: form.amenities || [],
        highlights: (form.highlights || '').split(',').map((s) => s.trim()).filter(Boolean),
        featured_image_url,
        image_urls,
        reference_number: ref,
        slug,
        submitter_type: isAgent ? 'agent' : 'homeowner',
        owner_id: user.id,
        owner_name: user.full_name || user.email,
        owner_email: user.email,
        status: editing?.status || 'submitted',
        visibility: 'public',
      };
      if (editing) {
        await base44.entities.PropertyListing.update(editing.id, payload);
        toast({ title: 'Submission updated', description: 'Your listing has been updated and will be reviewed by admin.' });
      } else {
        await base44.entities.PropertyListing.create(payload);
        toast({ title: 'Submitted for approval', description: 'Your property is pending admin approval before going live.' });
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast({ title: 'Failed to save listing', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Listing' : 'List a New Property'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. 4-Bedroom Detached Duplex, Lekki Phase 2" />
          </div>
          <div>
            <Label>Short Description</Label>
            <Input value={form.short_description} onChange={(e) => set('short_description', e.target.value)} placeholder="One-line summary shown on property cards" maxLength={140} />
          </div>
          <div>
            <Label>Full Description</Label>
            <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} placeholder="Detailed description of the property..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price (₦)</Label>
              <Input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="e.g. 75000000" />
            </div>
            <div>
              <Label>Purpose</Label>
              <Select value={form.listing_purpose} onValueChange={(v) => set('listing_purpose', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {listingPurposeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Property Type *</Label>
              <Select value={form.property_type} onValueChange={(v) => set('property_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {propertyTypeOptions.map((o) => <SelectItem key={o} value={o}>{o.replace(/_/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Classification</Label>
              <Select value={form.property_classification} onValueChange={(v) => set('property_classification', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {propertyClassificationOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div><Label>Bedrooms</Label><Input type="number" value={form.bedrooms} onChange={(e) => setNum('bedrooms', e.target.value)} /></div>
            <div><Label>Bathrooms</Label><Input type="number" value={form.bathrooms} onChange={(e) => setNum('bathrooms', e.target.value)} /></div>
            <div><Label>Parking</Label><Input type="number" value={form.parking_spaces} onChange={(e) => setNum('parking_spaces', e.target.value)} /></div>
            <div><Label>Year Built</Label><Input type="number" value={form.year_built} onChange={(e) => setNum('year_built', e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><Label>Land Size (sqm)</Label><Input type="number" value={form.land_size_sqm} onChange={(e) => setNum('land_size_sqm', e.target.value)} /></div>
            <div><Label>Built-up Area (sqm)</Label><Input type="number" value={form.built_up_area_sqm} onChange={(e) => setNum('built_up_area_sqm', e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Condition</Label>
              <Select value={form.property_condition} onValueChange={(v) => set('property_condition', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {propertyConditionOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Furnishing</Label>
              <Select value={form.furnishing_status} onValueChange={(v) => set('furnishing_status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {furnishingOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>State *</Label>
              <Select value={form.state} onValueChange={(v) => set('state', v)}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {nigerianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>City</Label><Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Lekki" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>District / Area</Label><Input value={form.district} onChange={(e) => set('district', e.target.value)} placeholder="e.g. Lekki Phase 2" /></div>
            <div><Label>Address</Label><Input value={form.address_line} onChange={(e) => set('address_line', e.target.value)} placeholder="Street address" /></div>
          </div>

          <div>
            <Label>Highlights (comma separated)</Label>
            <Input value={form.highlights} onChange={(e) => set('highlights', e.target.value)} placeholder="e.g. Borehole, Solar power, C of O" />
          </div>

          <div>
            <Label>Amenities</Label>
            <div className="flex flex-wrap gap-2">
              {COMMON_AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    form.amenities.includes(a)
                      ? 'border-flame-500 bg-flame-50 text-flame-700'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <Label>Featured Image</Label>
            <div className="flex items-center gap-3">
              <label className="flex h-20 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 text-muted-foreground hover:border-flame-400 hover:text-flame-600">
                {featured ? <span className="text-xs font-medium text-flame-600">Selected</span> : <><ImagePlus className="h-5 w-5 mr-1" /><span className="text-xs">Upload</span></>}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFeatured(e.target.files[0])} />
              </label>
              {featured && (
                <button onClick={() => setFeatured(null)} className="text-xs text-destructive hover:underline">Remove</button>
              )}
            </div>
          </div>
          <div>
            <Label>Gallery Images</Label>
            <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground hover:border-flame-400 hover:text-flame-600">
              <Upload className="h-4 w-4" /> {gallery.length ? `${gallery.length} image(s) selected` : 'Click to upload multiple images'}
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setGallery(Array.from(e.target.files || []))} />
            </label>
            {gallery.length > 0 && (
              <button onClick={() => setGallery([])} className="mt-1 text-xs text-destructive hover:underline">Clear selection</button>
            )}
          </div>
          {editing?.image_urls?.length > 0 && (
            <p className="text-xs text-muted-foreground">Existing gallery images are kept. New uploads will be added.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy} className="bg-flame-500 hover:bg-flame-600">
            {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            {editing ? 'Update Submission' : 'Submit for Approval'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}