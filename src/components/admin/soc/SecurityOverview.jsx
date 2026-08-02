import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ShieldAlert, Lock, AlertTriangle, Activity, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const severityClass = {
  critical: 'bg-error/10 text-error',
  high: 'bg-flame-50 text-flame-600',
  medium: 'bg-warning/10 text-warning',
  low: 'bg-info/10 text-info',
};

export default function SecurityOverview() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.SecurityEvent.list('-created_date', 20)
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  const failed = events.filter((e) => e.event_type === 'failed_login').length;
  const locked = events.filter((e) => e.event_type === 'locked_account').length;
  const highRisk = events.filter((e) => e.severity === 'high' || e.severity === 'critical').length;
  const suspicious = events.filter((e) => e.event_type === 'suspicious_activity').length;

  const stats = [
    { label: 'Failed Logins', value: failed, icon: AlertTriangle, color: 'text-warning' },
    { label: 'Locked Accounts', value: locked, icon: Lock, color: 'text-error' },
    { label: 'High-Risk Events', value: highRisk, icon: ShieldAlert, color: 'text-error' },
    { label: 'Suspicious Activity', value: suspicious, icon: Activity, color: 'text-flame-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={cn('rounded-lg bg-muted p-2.5', s.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-900">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-900">
            <Eye className="h-5 w-5 text-flame-500" /> Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-flame-500" />
            </div>
          ) : events.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No security events recorded.</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div key={event.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', severityClass[event.severity] || severityClass.low)}>
                    {event.severity}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brand-900">{event.description || event.event_type?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">{event.user_email || 'System'} · {event.ip_address || '—'}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(event.created_date).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}