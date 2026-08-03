import { useState } from 'react';
import { Mail, Smartphone, Bell, MessageSquare, MessageCircle, Clock, Save, Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DIGEST_FREQUENCIES } from '@/lib/notification-utils';

const CHANNELS = [
  { key: 'channel_email_enabled', label: 'Email', icon: Mail, color: 'text-ice-600' },
  { key: 'channel_sms_enabled', label: 'SMS', icon: Smartphone, color: 'text-success' },
  { key: 'channel_push_enabled', label: 'Push', icon: Bell, color: 'text-flame-600' },
  { key: 'channel_in_app_enabled', label: 'In-App', icon: MessageSquare, color: 'text-brand-600' },
  { key: 'channel_whatsapp_enabled', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600' },
];

const CATEGORY_MATRIX = [
  { cat: 'transactional', label: 'Transactional', locked: true, channels: ['email', 'sms'] },
  { cat: 'marketing', label: 'Marketing', locked: false, channels: ['email', 'sms'] },
  { cat: 'system', label: 'System', locked: false, channels: ['email', 'sms'] },
  { cat: 'alert', label: 'Alerts', locked: false, channels: ['email', 'sms'] },
  { cat: 'reminder', label: 'Reminders', locked: false, channels: ['email', 'sms'] },
  { cat: 'crm', label: 'CRM', locked: false, channels: ['email', 'sms'] },
  { cat: 'property', label: 'Property', locked: false, channels: ['email'] },
  { cat: 'project', label: 'Project', locked: false, channels: ['email'] },
  { cat: 'payment', label: 'Payment', locked: false, channels: ['email', 'sms'] },
  { cat: 'account', label: 'Account', locked: false, channels: ['email', 'sms'] },
];

export default function NotificationPreferences({ preferences, onChange, onSave, saving }) {
  const [local, setLocal] = useState(preferences || {});

  const update = (key, value) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    onChange?.(updated);
  };

  return (
    <div className="space-y-6">
      {/* Channel Settings */}
      <div className="rounded-2xl border bg-white p-5 shadow-card">
        <h3 className="mb-4 font-heading text-lg font-semibold text-brand-900">Communication Channels</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CHANNELS.map((ch) => {
            const Icon = ch.icon;
            return (
              <div key={ch.key} className={cn('flex flex-col items-center gap-2 rounded-xl border p-4 text-center', local[ch.key] ? 'border-flame-200 bg-flame-50/40' : 'border-border')}>
                <Icon className={cn('h-6 w-6', ch.color)} />
                <span className="text-sm font-medium text-brand-700">{ch.label}</span>
                <Switch checked={!!local[ch.key]} onCheckedChange={(v) => update(ch.key, v)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Preferences Matrix */}
      <div className="rounded-2xl border bg-white p-5 shadow-card">
        <h3 className="mb-4 font-heading text-lg font-semibold text-brand-900">Category Preferences</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left text-sm font-medium text-muted-foreground">Category</th>
                <th className="py-2 text-center text-sm font-medium text-muted-foreground">Email</th>
                <th className="py-2 text-center text-sm font-medium text-muted-foreground">SMS</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_MATRIX.map((row) => {
                const emailKey = `category_${row.cat}_email`;
                const smsKey = `category_${row.cat}_sms`;
                return (
                  <tr key={row.cat} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-brand-700">{row.label}</span>
                        {row.locked && (
                          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground" title="Required for account security">
                            <Lock className="h-3 w-3" /> Required
                          </span>
                        )}
                      </div>
                    </td>
                    {row.channels.includes('email') ? (
                      <td className="py-3 text-center">
                        <Switch checked={!!local[emailKey]} onCheckedChange={(v) => update(emailKey, v)} disabled={row.locked} />
                      </td>
                    ) : <td className="py-3 text-center text-muted-foreground">—</td>}
                    {row.channels.includes('sms') ? (
                      <td className="py-3 text-center">
                        <Switch checked={!!local[smsKey]} onCheckedChange={(v) => update(smsKey, v)} disabled={row.locked} />
                      </td>
                    ) : <td className="py-3 text-center text-muted-foreground">—</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Digest Settings */}
      <div className="rounded-2xl border bg-white p-5 shadow-card">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-brand-900">
          <Clock className="h-5 w-5 text-flame-600" /> Digest Settings
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Label className="text-sm text-brand-700">Batch notifications into a digest</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">Reduce notification frequency by combining into a summary</p>
          </div>
          <Switch checked={!!local.digest_enabled} onCheckedChange={(v) => update('digest_enabled', v)} />
        </div>
        {local.digest_enabled && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-sm text-brand-700">Frequency</Label>
              <Select value={local.digest_frequency || 'daily'} onValueChange={(v) => update('digest_frequency', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DIGEST_FREQUENCIES.map((f) => (
                    <SelectItem key={f.key} value={f.key}>{f.label} — {f.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm text-brand-700">Delivery Time</Label>
              <Input
                type="time"
                value={local.digest_time || '08:00'}
                onChange={(e) => update('digest_time', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Quiet Hours */}
      <div className="rounded-2xl border bg-white p-5 shadow-card">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-brand-900">
          <Bell className="h-5 w-5 text-flame-600" /> Quiet Hours
        </h3>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Label className="text-sm text-brand-700">Suppress notifications during quiet hours</Label>
            <p className="mt-0.5 text-xs text-muted-foreground">Non-urgent notifications will be held until quiet hours end</p>
          </div>
          <Switch checked={!!local.quiet_hours_enabled} onCheckedChange={(v) => update('quiet_hours_enabled', v)} />
        </div>
        {local.quiet_hours_enabled && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-1.5 block text-sm text-brand-700">Start</Label>
              <Input type="time" value={local.quiet_hours_start || '22:00'} onChange={(e) => update('quiet_hours_start', e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm text-brand-700">End</Label>
              <Input type="time" value={local.quiet_hours_end || '07:00'} onChange={(e) => update('quiet_hours_end', e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm text-brand-700">Applies To</Label>
              <Select value={local.quiet_hours_channel || 'push'} onValueChange={(v) => update('quiet_hours_channel', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="sms">SMS Only</SelectItem>
                  <SelectItem value="push">Push Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving} className="bg-flame-600 text-white hover:bg-flame-700">
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
}