import { useEffect, useState } from 'react';
import { AlertTriangle, Lock, ShieldAlert, LogIn, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function IdentitySecurityCenter() {
  const [failedLogins, setFailedLogins] = useState([]);
  const [activeLocks, setActiveLocks] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [recentLogins, setRecentLogins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.FailedLoginAttempt.list('-created_date', 15).catch(() => []),
      base44.entities.AccountLock.filter({ is_active: true }, '-created_date', 15).catch(() => []),
      base44.entities.SecurityEvent.list('-created_date', 10).catch(() => []),
      base44.entities.LoginHistory.list('-created_date', 10).catch(() => []),
    ]).then(([failed, locks, events, logins]) => {
      setFailedLogins(failed);
      setActiveLocks(locks);
      setSecurityEvents(events);
      setRecentLogins(logins);
    }).finally(() => setLoading(false));
  }, []);

  const severityColor = { low: 'secondary', medium: 'default', high: 'destructive', critical: 'destructive' };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4">
          <AlertTriangle className="h-5 w-5 text-warning" /><p className="mt-2 font-heading text-2xl font-bold">{failedLogins.length}</p>
          <p className="text-xs text-muted-foreground">Failed Login Attempts</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <Lock className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{activeLocks.length}</p>
          <p className="text-xs text-muted-foreground">Active Account Locks</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <ShieldAlert className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{securityEvents.length}</p>
          <p className="text-xs text-muted-foreground">Recent Security Events</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <LogIn className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{recentLogins.length}</p>
          <p className="text-xs text-muted-foreground">Recent Logins</p>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Lock className="h-4 w-4 text-destructive" /> Active Account Locks</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : activeLocks.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center"><Lock className="h-10 w-10 text-success/30" /><p className="mt-2 text-sm text-muted-foreground">No active account locks.</p></div>
            ) : (
              <div className="space-y-2">
                {activeLocks.map((l) => (
                  <div key={l.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div><p className="text-sm font-medium">{l.user_email || 'Unknown user'}</p><p className="text-xs text-muted-foreground capitalize">{(l.lock_reason || '').replace(/_/g, ' ')}</p></div>
                    <Badge variant="destructive" className="text-xs">{l.is_automatic ? 'Auto' : 'Manual'}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><AlertTriangle className="h-4 w-4 text-warning" /> Failed Login Attempts</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : failedLogins.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center"><Activity className="h-10 w-10 text-success/30" /><p className="mt-2 text-sm text-muted-foreground">No failed login attempts.</p></div>
            ) : (
              <div className="space-y-2">
                {failedLogins.map((f) => (
                  <div key={f.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div><p className="text-sm font-medium">{f.user_email}</p><p className="text-xs text-muted-foreground capitalize">{(f.failure_reason || '').replace(/_/g, ' ')} · {f.ip_address || 'No IP'}</p></div>
                    <Badge variant="outline" className="text-xs">{f.attempt_count_for_ip || 1}x</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ShieldAlert className="h-4 w-4 text-flame-600" /> Recent Security Events</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : securityEvents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No recent security events.</p>
          ) : (
            <div className="space-y-2">
              {securityEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="text-sm font-medium capitalize">{(e.event_type || '').replace(/_/g, ' ')}</p><p className="text-xs text-muted-foreground">{e.description || e.user_email || ''}</p></div>
                  <Badge variant={severityColor[e.severity] || 'secondary'} className="text-xs">{e.severity}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}