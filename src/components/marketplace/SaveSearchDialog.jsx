import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { Loader2, Bell } from 'lucide-react';

const ALERT_TYPE_OPTIONS = [
  { value: 'new_listing', label: 'New matching listings' },
  { value: 'price_reduction', label: 'Price reductions' },
  { value: 'availability_change', label: 'Availability changes' },
  { value: 'material_update', label: 'Material listing updates' },
  { value: 'listing_unavailable', label: 'Listing becomes unavailable' },
  { value: 'status_change', label: 'Status changes' },
];

const FREQUENCY_OPTIONS = [
  { value: 'immediate', label: 'Immediate (checked every 6 hours)' },
  { value: 'daily_digest', label: 'Daily digest' },
  { value: 'weekly_digest', label: 'Weekly digest' },
];

export default function SaveSearchDialog({ open, onClose, filters, sort }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alertTypes, setAlertTypes] = useState(['new_listing', 'price_reduction']);
  const [frequency, setFrequency] = useState('immediate');
  const [channels, setChannels] = useState(['in_app', 'email']);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await base44.functions.invoke('manageSavedSearch', {
        action: 'create',
        search_name: name.trim(),
        filters,
        sort_preference: sort,
        search_query: filters.keyword || '',
        alerts_enabled: alertsEnabled,
        alert_types: alertTypes,
        alert_frequency: frequency,
        alert_channels: channels,
      });
      toast({
        title: 'Search saved!',
        description: alertsEnabled ? 'You\'ll receive alerts for matching properties.' : 'Search saved without alerts.',
      });
      setName('');
      setAlertsEnabled(true);
      setAlertTypes(['new_listing', 'price_reduction']);
      setFrequency('immediate');
      setChannels(['in_app', 'email']);
      onClose();
    } catch (e) {
      toast({ title: 'Failed to save search', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleAlertType = (type) => {
    setAlertTypes((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);
  };

  const toggleChannel = (ch) => {
    setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Save this Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="search-name">Search name</Label>
            <Input
              id="search-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 3-bed Lagos apartments"
              className="mt-1"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="alerts-enabled" checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
            <Label htmlFor="alerts-enabled" className="cursor-pointer">Enable alerts for this search</Label>
          </div>

          {alertsEnabled && (
            <>
              <div>
                <Label>Alert me about</Label>
                <div className="mt-2 space-y-2">
                  {ALERT_TYPE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex cursor-pointer items-center gap-2 text-sm">
                      <Checkbox
                        checked={alertTypes.includes(opt.value)}
                        onCheckedChange={() => toggleAlertType(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Delivery channels</Label>
                <div className="mt-2 flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox checked={channels.includes('in_app')} onCheckedChange={() => toggleChannel('in_app')} />
                    In-app
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox checked={channels.includes('email')} onCheckedChange={() => toggleChannel('email')} />
                    Email
                  </label>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  SMS and push alerts require additional provider configuration.
                </p>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()} className="bg-flame-500 hover:bg-flame-600">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
            Save Search
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}