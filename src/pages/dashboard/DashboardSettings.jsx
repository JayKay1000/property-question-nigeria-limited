import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Save, Loader2, Lock, Bell, Shield, ShieldCheck } from 'lucide-react';

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT (Abuja)', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export default function DashboardSettings() {
  const { user, checkUserAuth } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    phone: user?.phone || '',
    address: user?.address || '',
    state: user?.state || '',
    lga: user?.lga || '',
    city: user?.city || '',
    occupation: user?.occupation || '',
    preferred_contact_method: user?.preferred_contact_method || 'email',
    consent_marketing: user?.consent_marketing ?? true,
    consent_data_processing: user?.consent_data_processing ?? true,
    consent_third_party: user?.consent_third_party ?? false,
  });

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(form);
      await checkUserAuth();
      toast({ title: 'Settings saved', description: 'Your profile has been updated.' });
    } catch (err) {
      toast({ title: 'Failed to save', description: err.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const initials = (user?.full_name || user?.email || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-brand-900">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, contact details, and communication preferences.</p>
      </div>

      {/* Profile header */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-900 font-heading text-lg font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-bold text-brand-900">{user?.full_name || 'User'}</h3>
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {user?.role && <Badge className="bg-brand-100 text-brand-800 capitalize">{String(user.role).replace(/_/g, ' ')}</Badge>}
              {user?.account_type && <Badge className="bg-flame-100 text-flame-700 capitalize">{String(user.account_type).replace(/_/g, ' ')}</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-base font-bold text-brand-900"><UserCircle className="h-4 w-4 text-flame-500" /> Contact Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">Full Name</Label>
            <Input value={user?.full_name || ''} disabled className="bg-muted/40" />
            <p className="mt-1 text-xs text-muted-foreground">Contact an administrator to change your name.</p>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">Email</Label>
            <Input value={user?.email || ''} disabled className="bg-muted/40" />
            <p className="mt-1 text-xs text-muted-foreground">Email is managed by your account provider.</p>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm text-brand-900">Phone</Label>
            <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+234..." className="bg-ice-50" />
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
            <Select value={form.state} onValueChange={(v) => set('state', v)}>
              <SelectTrigger className="h-10 bg-ice-50"><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {NIGERIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
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
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Preferences & consents */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-base font-bold text-brand-900"><Bell className="h-4 w-4 text-flame-500" /> Communication Preferences</h3>
        <div className="space-y-3">
          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox checked={form.consent_marketing} onCheckedChange={(c) => set('consent_marketing', c ?? false)} className="mt-0.5" />
            <span className="text-sm text-brand-900">I consent to receive marketing communications about properties, projects, and offers.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox checked={form.consent_data_processing} onCheckedChange={(c) => set('consent_data_processing', c ?? false)} className="mt-0.5" />
            <span className="text-sm text-brand-900">I consent to data processing for service delivery and account management.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2.5">
            <Checkbox checked={form.consent_third_party} onCheckedChange={(c) => set('consent_third_party', c ?? false)} className="mt-0.5" />
            <span className="text-sm text-brand-900">I consent to sharing my data with trusted partners for property-related services.</span>
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="rounded-2xl border border-brand-100 bg-white p-5 shadow-card">
        <h3 className="mb-3 flex items-center gap-2 font-heading text-base font-bold text-brand-900"><Lock className="h-4 w-4 text-flame-500" /> Security</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="border-brand-200" disabled><Shield className="mr-1.5 h-4 w-4" /> Enable MFA</Button>
          <Button variant="outline" className="border-brand-200" disabled><Lock className="mr-1.5 h-4 w-4" /> Change Password</Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Multi-factor authentication and password changes are managed through your account provider.</p>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between rounded-2xl border border-brand-100 bg-white p-4 shadow-card">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-success" /> Changes are saved to your account securely.</p>
        <Button onClick={handleSave} disabled={saving} className="bg-flame-500 hover:bg-flame-600">
          {saving ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-1.5 h-4 w-4" /> Save Changes</>}
        </Button>
      </div>
    </div>
  );
}