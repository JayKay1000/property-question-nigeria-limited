import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import PageHeader from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Loader2, Bell } from 'lucide-react';

const DEFAULT_PREFS = {
  channel_email_enabled: true,
  channel_sms_enabled: true,
  channel_push_enabled: true,
  channel_in_app_enabled: true,
  channel_whatsapp_enabled: false,
  category_transactional_email: true,
  category_transactional_sms: true,
  category_marketing_email: false,
  category_marketing_sms: false,
  category_system_email: true,
  category_system_sms: false,
  category_alert_email: true,
  category_alert_sms: true,
  category_reminder_email: true,
  category_reminder_sms: true,
  category_crm_email: true,
  category_crm_sms: false,
  category_property_email: true,
  category_project_email: true,
  category_payment_email: true,
  category_payment_sms: true,
  category_account_email: true,
  category_account_sms: true,
  digest_enabled: false,
  digest_frequency: 'daily',
  digest_time: '08:00',
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
  quiet_hours_channel: 'push',
  language: 'en',
  timezone: 'Africa/Lagos',
};

export default function NotificationSettings() {
  const { toast } = useToast();
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [prefsId, setPrefsId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPrefs = useCallback(async () => {
    try {
      const me = await base44.auth.me();
      const existing = await base44.entities.NotificationPreference.filter({ user_id: me.id });
      if (existing && existing.length > 0) {
        setPrefs({ ...DEFAULT_PREFS, ...existing[0] });
        setPrefsId(existing[0].id);
      } else {
        const created = await base44.entities.NotificationPreference.create({ ...DEFAULT_PREFS, user_id: me.id });
        setPrefsId(created.id);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPrefs(); }, [loadPrefs]);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (prefsId) {
        await base44.entities.NotificationPreference.update(prefsId, prefs);
      }
      toast({ title: 'Preferences saved', description: 'Your notification settings have been updated.' });
    } catch (err) {
      toast({ title: 'Save failed', description: 'Could not save preferences. Please try again.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-ice-50/40 pt-20 pb-16">
      <div className="container-wide section-pad max-w-4xl">
        <PageHeader
          title="Notification Settings"
          subtitle="Control how and when you receive communications from Property Question Nigeria"
          icon={Settings}
        />
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-flame-500" />
          </div>
        ) : (
          <div className="mt-6">
            <NotificationPreferences
              preferences={prefs}
              onChange={setPrefs}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        )}
      </div>
    </div>
  );
}