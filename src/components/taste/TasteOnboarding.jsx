import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Sparkles, ShieldCheck } from 'lucide-react';
import ChipInput from './ChipInput';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import {
  TASTE_PROPERTY_TYPES, TASTE_PRIORITIES, TASTE_PURPOSES, BUDGET_PRESETS,
  NIGERIAN_STATE_SUGGESTIONS, BEDROOM_OPTIONS, DEFAULT_TASTE_PROFILE,
  getSessionProfile, setSessionProfile,
} from '@/lib/taste-utils';
import { COMMON_AMENITIES, CONDITION_CONFIG, FURNISHING_CONFIG } from '@/lib/property-utils';
import { cn } from '@/lib/utils';

/**
 * Optional preference-setup dialog. On save, persists to the backend
 * (authenticated users) or localStorage (anonymous visitors). Skippable.
 */
export default function TasteOnboarding({ open, onClose, isAuthenticated, onSaved, initialProfile }) {
  const { toast } = useToast();
  const [form, setForm] = useState(DEFAULT_TASTE_PROFILE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialProfile || (isAuthenticated ? DEFAULT_TASTE_PROFILE : getSessionProfile()) || DEFAULT_TASTE_PROFILE);
    }
  }, [open, initialProfile, isAuthenticated]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const selectBudgetPreset = (preset) => {
    update('budget_min_ngn', preset.min);
    update('budget_max_ngn', preset.max);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isAuthenticated) {
        await base44.functions.invoke('saveTasteProfile', { action: 'save', preferences: form });
      } else {
        setSessionProfile({ ...form, onboarding_completed: true, personalization_enabled: true });
      }
      toast({ title: 'Preferences saved', description: 'Your recommendations will update shortly.' });
      onSaved?.();
      onClose?.();
    } catch (err) {
      toast({ title: 'Could not save preferences', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    try {
      if (isAuthenticated) {
        await base44.functions.invoke('saveTasteProfile', { action: 'skip_onboarding' });
      }
      onClose?.();
    } catch {
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  const activeBudgetPreset = BUDGET_PRESETS.find(
    (p) => p.min === form.budget_min_ngn && p.max === form.budget_max_ngn
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose?.()}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-flame-500" />
            Personalize your property search
          </DialogTitle>
          <DialogDescription>
            Tell us what you're looking for and we'll rank listings by how well they match.
            You can skip this and use the regular marketplace, or change these anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Transaction purpose */}
          <div>
            <Label className="mb-2 block">I'm looking to</Label>
            <div className="flex flex-wrap gap-2">
              {TASTE_PURPOSES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => update('transaction_purpose', p.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                    form.transaction_purpose === p.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:bg-accent'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <Label className="mb-2 block">Preferred locations</Label>
            <ChipInput
              values={form.preferred_locations}
              onChange={(v) => update('preferred_locations', v)}
              placeholder="Type a state or city and press Enter"
              suggestions={NIGERIAN_STATE_SUGGESTIONS}
            />
          </div>

          {/* Property types */}
          <div>
            <Label className="mb-2 block">Property types</Label>
            <div className="flex flex-wrap gap-2">
              {TASTE_PROPERTY_TYPES.map((t) => {
                const active = form.preferred_property_types.includes(t.value);
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      const types = form.preferred_property_types;
                      update('preferred_property_types',
                        active ? types.filter((x) => x !== t.value) : [...types, t.value]);
                    }}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                      active ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget */}
          <div>
            <Label className="mb-2 block">Budget range</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {BUDGET_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => selectBudgetPreset(p)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                    activeBudgetPreset === p ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min ₦"
                value={form.budget_min_ngn ?? ''}
                onChange={(e) => update('budget_min_ngn', e.target.value ? Number(e.target.value) : null)}
              />
              <Input
                type="number"
                placeholder="Max ₦"
                value={form.budget_max_ngn ?? ''}
                onChange={(e) => update('budget_max_ngn', e.target.value ? Number(e.target.value) : null)}
              />
            </div>
          </div>

          {/* Bedrooms + Condition + Furnishing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="mb-2 block">Min bedrooms</Label>
              <Select
                value={String(form.min_bedrooms ?? '')}
                onValueChange={(v) => update('min_bedrooms', v ? Number(v) : null)}
              >
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  {BEDROOM_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Condition</Label>
              <Select
                value={form.condition_preference ?? ''}
                onValueChange={(v) => update('condition_preference', v || null)}
              >
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Any</SelectItem>
                  {Object.entries(CONDITION_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Furnishing</Label>
              <Select
                value={form.furnishing_preference ?? ''}
                onValueChange={(v) => update('furnishing_preference', v || null)}
              >
                <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Any</SelectItem>
                  {Object.entries(FURNISHING_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <Label className="mb-2 block">Important amenities</Label>
            <ChipInput
              values={form.preferred_amenities}
              onChange={(v) => update('preferred_amenities', v)}
              placeholder="Type an amenity and press Enter"
              suggestions={COMMON_AMENITIES}
            />
          </div>

          {/* Priority */}
          <div>
            <Label className="mb-2 block">What matters most to you?</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TASTE_PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => update('priority', p.value)}
                  className={cn(
                    'text-left p-3 rounded-lg border transition-colors',
                    form.priority === p.value
                      ? 'bg-primary/5 border-primary ring-1 ring-primary'
                      : 'border-border hover:bg-accent'
                  )}
                >
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0 text-success" />
            <span>
              Your preferences are private and visible only to you. We use them solely to
              rank listings — we do not infer income, family status, or other sensitive data.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleSkip} disabled={saving}>
            Skip for now
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save preferences'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}