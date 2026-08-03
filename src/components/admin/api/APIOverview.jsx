import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Zap, Activity, Plug, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { integrationHealthConfig, formatNumber, formatDateTime } from '@/lib/platform-utils';

export default function APIOverview() {
  const [endpoints, setEndpoints] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [e, i] = await Promise.all([
          base44.entities.APIEndpoint.list('-created_date', 200),
          base44.entities.IntegrationConfig.list('-created_date', 200),
        ]);
        setEndpoints(e); setIntegrations(i);
      } catch { /* */ }
      setLoading(false);
    })();
  }, []);

  const activeEndpoints = endpoints.filter(e => e.status === 'active').length;
  const totalRequests = endpoints.reduce((s, e) => s + (e.request_count || 0), 0);
  const totalErrors = endpoints.reduce((s, e) => s + (e.error_count || 0), 0);
  const avgResponse = endpoints.length > 0 ? Math.round(endpoints.reduce((s, e) => s + (e.avg_response_ms || 0), 0) / endpoints.length) : 0;
  const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : '0.00';
  const connected = integrations.filter(i => i.status === 'connected').length;
  const healthy = integrations.filter(i => i.health === 'healthy').length;
  const down = integrations.filter(i => i.health === 'down').length;

  const stats = [
    { label: 'Total Endpoints', value: endpoints.length, icon: Server, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Active Endpoints', value: activeEndpoints, icon: Zap, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Integrations', value: integrations.length, icon: Plug, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'Connected', value: connected, icon: Plug, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Healthy', value: healthy, icon: Activity, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Down', value: down, icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10' },
    { label: 'Total Requests', value: formatNumber(totalRequests), icon: TrendingUp, color: 'text-ice-600', bg: 'bg-ice-50' },
    { label: 'Avg Response', value: `${avgResponse}ms`, icon: Clock, color: 'text-ice-600', bg: 'bg-ice-50' },
    { label: 'Error Rate', value: `${errorRate}%`, icon: AlertTriangle, color: totalErrors > 0 ? 'text-error' : 'text-success', bg: totalErrors > 0 ? 'bg-error/10' : 'bg-success/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
            <p className="text-xl font-heading font-bold">{loading ? '…' : s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-heading font-bold mb-4">Integration Health</h3>
          <div className="space-y-2">
            {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>}
            {!loading && integrations.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No integrations configured.</p>}
            {!loading && integrations.map(i => {
              const h = integrationHealthConfig[i.health] || integrationHealthConfig.unknown;
              return (
                <div key={i.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="min-w-0"><p className="font-medium truncate">{i.name}</p><p className="text-xs text-muted-foreground">{i.provider} · {i.endpoints_count || 0} endpoints · {i.last_sync ? `Synced ${formatDateTime(i.last_sync)}` : 'Never synced'}</p></div>
                  <Badge variant="secondary" className={h.className}><span className={`inline-block w-2 h-2 rounded-full ${h.dot} mr-1.5`} />{h.label}</Badge>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-heading font-bold mb-4">Busiest Endpoints</h3>
          <div className="space-y-2">
            {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>}
            {!loading && endpoints.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No endpoints registered.</p>}
            {!loading && [...endpoints].sort((a, b) => (b.request_count || 0) - (a.request_count || 0)).slice(0, 6).map(e => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="min-w-0"><p className="font-mono text-sm truncate">{e.method} {e.path}</p><p className="text-xs text-muted-foreground">{e.avg_response_ms || 0}ms · {(e.error_count || 0)} errors</p></div>
                <Badge variant="secondary" className="bg-ice-50 text-ice-700 border-0">{formatNumber(e.request_count || 0)} calls</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}