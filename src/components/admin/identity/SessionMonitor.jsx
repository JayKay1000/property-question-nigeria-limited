import { useEffect, useState } from 'react';
import { Monitor, Smartphone, Globe, Trash2, ShieldCheck, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function SessionMonitor() {
  const [sessions, setSessions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      base44.entities.UserSession.filter({ is_active: true }, '-created_date', 50).catch(() => []),
      base44.entities.UserDevice.list('-last_used', 50).catch(() => []),
    ]).then(([s, d]) => {
      setSessions(s);
      setDevices(d);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const terminateSession = async (id) => {
    await base44.entities.UserSession.update(id, { is_active: false });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Active Sessions', value: sessions.length, icon: Monitor, color: 'text-flame-600' },
          { label: 'Registered Devices', value: devices.length, icon: Smartphone, color: 'text-brand-700' },
          { label: 'Trusted Devices', value: devices.filter((d) => d.is_trusted).length, icon: ShieldCheck, color: 'text-success' },
          { label: 'Mobile Devices', value: devices.filter((d) => d.device_type === 'mobile').length, icon: Globe, color: 'text-info' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <p className="mt-2 font-heading text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><Monitor className="h-4 w-4 text-brand-700" /> Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No active sessions.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                      <Monitor className="h-4 w-4 text-brand-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.device_name || s.user_email || 'Unknown session'}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {s.ip_address && <span>{s.ip_address}</span>}
                        {s.location && <span>· {s.location}</span>}
                        {s.login_method && <Badge variant="outline" className="text-xs">{s.login_method}</Badge>}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => terminateSession(s.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Revoke
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm"><Smartphone className="h-4 w-4 text-brand-700" /> Registered Devices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading devices...</p>
          ) : devices.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No registered devices.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {devices.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.device_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{d.browser} · {d.operating_system}</p>
                  </div>
                  {d.is_trusted && <Badge className="bg-success/10 text-success gap-1"><ShieldCheck className="h-3 w-3" />Trusted</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}