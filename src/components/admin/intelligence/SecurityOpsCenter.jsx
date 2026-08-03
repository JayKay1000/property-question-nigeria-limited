import { useEffect, useState } from 'react';
import { ShieldAlert, Lock, UserCog, AlertTriangle, Eye, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SEVERITY_COLORS = { low: 'secondary', medium: 'default', high: 'destructive', critical: 'destructive' };

export default function SecurityOpsCenter() {
  const [events, setEvents] = useState([]);
  const [threats, setThreats] = useState([]);
  const [loginStats, setLoginStats] = useState([]);
  const [permChanges, setPermChanges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.SecurityEvent.list('-created_date', 100).catch(() => []),
      base44.entities.ThreatDetection.list('-detected_at', 50).catch(() => []),
      base44.entities.LoginAnalytic.list('-metric_date', 30).catch(() => []),
      base44.entities.PermissionChange.list('-changed_date', 50).catch(() => []),
    ]).then(([e, t, l, p]) => { setEvents(e); setThreats(t); setLoginStats(l); setPermChanges(p); }).finally(() => setLoading(false));
  }, []);

  const criticalEvents = events.filter((e) => ['high', 'critical'].includes(e.severity));
  const unresolvedEvents = events.filter((e) => !e.resolved);
  const activeThreats = threats.filter((t) => ['detected', 'investigating'].includes(t.status));
  const failedLogins = events.filter((e) => e.event_type === 'failed_login');
  const recentPermChanges = permChanges.slice(0, 10);

  const eventByType = {};
  events.forEach((e) => { eventByType[e.event_type] = (eventByType[e.event_type] || 0) + 1; });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><ShieldAlert className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{criticalEvents.length}</p><p className="text-xs text-muted-foreground">Critical Events</p></CardContent></Card>
        <Card><CardContent className="p-4"><AlertTriangle className="h-5 w-5 text-warning" /><p className="mt-2 font-heading text-2xl font-bold">{unresolvedEvents.length}</p><p className="text-xs text-muted-foreground">Unresolved</p></CardContent></Card>
        <Card><CardContent className="p-4"><Lock className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{activeThreats.length}</p><p className="text-xs text-muted-foreground">Active Threats</p></CardContent></Card>
        <Card><CardContent className="p-4"><Lock className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{failedLogins.length}</p><p className="text-xs text-muted-foreground">Failed Logins</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ShieldAlert className="h-4 w-4 text-destructive" /> Live Security Events</CardTitle></CardHeader>
        <CardContent>
          {events.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No security events recorded.</p> : (
            <div className="space-y-2">
              {events.slice(0, 20).map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${e.resolved ? 'bg-muted' : 'bg-destructive/10'}`}><ShieldAlert className={`h-4 w-4 ${e.resolved ? 'text-muted-foreground' : 'text-destructive'}`} /></div>
                    <div><p className="text-sm font-medium capitalize">{e.event_type?.replace(/_/g, ' ')}</p><p className="text-xs text-muted-foreground">{e.user_email || 'System'} · {e.description || ''}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={SEVERITY_COLORS[e.severity] || 'secondary'} className="text-xs capitalize">{e.severity}</Badge>
                    {e.resolved ? <Badge variant="default" className="text-xs">Resolved</Badge> : <Badge variant="destructive" className="text-xs">Open</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Lock className="h-4 w-4 text-flame-600" /> Threat Detection</CardTitle></CardHeader>
          <CardContent>
            {threats.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No threats detected.</p> : (
              <div className="space-y-2">
                {threats.slice(0, 10).map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium capitalize">{t.threat_type?.replace(/_/g, ' ')}</p><p className="text-xs text-muted-foreground">{t.source_ip || ''} · {t.confidence_score}% confidence</p></div>
                    <Badge variant={t.status === 'mitigated' || t.status === 'blocked' ? 'default' : 'destructive'} className="text-xs capitalize">{t.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><UserCog className="h-4 w-4 text-brand-700" /> Permission Changes</CardTitle></CardHeader>
          <CardContent>
            {recentPermChanges.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No permission changes logged.</p> : (
              <div className="space-y-2">
                {recentPermChanges.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{p.role_name} → {p.permission_name}</p><p className="text-xs text-muted-foreground">{p.changed_by_name || ''} · {p.change_type}</p></div>
                    <Badge variant={p.new_effect === 'allow' ? 'default' : 'destructive'} className="text-xs capitalize">{p.new_effect}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {Object.keys(eventByType).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Activity className="h-4 w-4 text-info" /> Security Events by Type</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{Object.entries(eventByType).sort((a, b) => b[1] - a[1]).map(([type, count]) => <Badge key={type} variant="secondary" className="text-xs capitalize">{type?.replace(/_/g, ' ')} ({count})</Badge>)}</div></CardContent>
        </Card>
      )}
    </div>
  );
}