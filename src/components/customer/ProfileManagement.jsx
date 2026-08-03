import { useState } from 'react';
import { UserCircle, Save, Loader2, Camera, Shield, Bell, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

export default function ProfileManagement({ customer, user, onUpdate }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: customer?.first_name || user?.full_name?.split(' ')[0] || '',
    last_name: customer?.last_name || user?.full_name?.split(' ').slice(1).join(' ') || '',
    email: customer?.email || user?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    state: customer?.state || '',
    lga: customer?.lga || '',
    city: customer?.city || '',
    preferred_contact_method: customer?.preferred_contact_method || 'phone',
    occupation: customer?.occupation || '',
    customer_type: customer?.customer_type || 'individual',
    consent_marketing: customer?.consent_marketing || false,
    consent_data_processing: customer?.consent_data_processing ?? true,
    consent_third_party: customer?.consent_third_party || false,
  });

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const fullName = `${form.first_name} ${form.last_name}`.trim();
      if (customer?.id) {
        await base44.entities.Customer.update(customer.id, { ...form, full_name: fullName });
      } else {
        await base44.entities.Customer.create({
          ...form,
          full_name: fullName,
          user_id: user?.id,
          status: 'active',
          lifecycle_stage: 'lead',
        });
      }
      toast({ title: 'Profile saved!', description: 'Your changes have been saved.' });
      onUpdate?.();
    } catch {
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-bold text-brand-900">My Profile</h2>

      {/* Profile header */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-brand-900">
              {customer?.photo_url ? (
                <img src={customer.photo_url} alt={form.first_name} className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-10 w-10 text-white/40" />
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-flame-500 text-white shadow-lg hover:bg-flame-600">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-brand-900">{form.first_name} {form.last_name}</h3>
            <p className="text-sm text-muted-foreground">{form.email}</p>
            {customer?.reference_number && <p className="mt-0.5 text-xs text-flame-600">Ref: {customer.reference_number}</p>}
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-base font-bold text-brand-900"><UserCircle className="h-4 w-4 text-flame-500" /> Personal Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">First Name</Label>
            <Input value={form.first_name} onChange={(e) => set('first_name', e.target.value)} className="bg-ice-50" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">Last Name</Label>
            <Input value={form.last_name} onChange={(e) => set('last_name', e.target.value)} className="bg-ice-50" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="bg-ice-50" disabled={!!user?.email} />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">Phone</Label>
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+234..." className="bg-ice-50" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">Customer Type</Label>
            <Select value={form.customer_type} onValueChange={(v) => set('customer_type', v)}>
              <SelectTrigger className="h-10 bg-ice-50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="diaspora">Diaspora</SelectItem>
                <SelectItem value="government">Government</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">Occupation</Label>
            <Input value={form.occupation} onChange={(e) => set('occupation', e.target.value)} className="bg-ice-50" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <h3 className="mb-4 font-heading text-base font-bold text-brand-900">Address</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label className="mb-1.5 block text-sm text-brand-900">Residential Address</Label>
            <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="House number, street" className="bg-ice-50" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">State</Label>
            <Input value={form.state} onChange={(e) => set('state', e.target.value)} className="bg-ice-50" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">LGA</Label>
            <Input value={form.lga} onChange={(e) => set('lga', e.target.value)} className="bg-ice-50" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">City</Label>
            <Input value={form.city} onChange={(e) => set('city', e.target.value)} className="bg-ice-50" />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">Preferred Contact Method</Label>
            <Select value={form.preferred_contact_method} onValueChange={(v) => set('preferred_contact_method', v)}>
              <SelectTrigger className="h-10 bg-ice-50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="in_person">In Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Preferences & consents */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-base font-bold text-brand-900"><Bell className="h-4 w-4 text-flame-500" /> Communication Preferences</h3>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox checked={form.consent_marketing} onCheckedChange={(c) => set('consent_marketing', c || false)} />
            <span className="text-sm text-brand-900">I consent to receive marketing communications about properties and offers.</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox checked={form.consent_data_processing} onCheckedChange={(c) => set('consent_data_processing', c ?? false)} />
            <span className="text-sm text-brand-900">I consent to data processing for service delivery.</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <Checkbox checked={form.consent_third_party} onCheckedChange={(c) => set('consent_third_party', c || false)} />
            <span className="text-sm text-brand-900">I consent to sharing my data with trusted partners for property-related services.</span>
          </label>
        </div>
      </div>

      {/* Security links */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-base font-bold text-brand-900"><Lock className="h-4 w-4 text-flame-500" /> Security</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="border-brand-200" disabled><Shield className="mr-1.5 h-4 w-4" /> Enable MFA</Button>
          <Button variant="outline" className="border-brand-200" disabled><Lock className="mr-1.5 h-4 w-4" /> Change Password</Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Multi-factor authentication and password changes are managed through your account settings.</p>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-flame-500 hover:bg-flame-600">
          {saving ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-1.5 h-4 w-4" /> Save Changes</>}
        </Button>
      </div>
    </div>
  );
}