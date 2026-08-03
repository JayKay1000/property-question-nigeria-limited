import { useEffect, useState } from 'react';
import { TrendingUp, Users, MapPin, Filter, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BusinessIntelligenceHub() {
  const [conversions, setConversions] = useState([]);
  const [customerAnalytics, setCustomerAnalytics] = useState([]);
  const [eventMetrics, setEventMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.ConversionMetric.list('-created_date', 50).catch(() => []),
      base44.entities.CustomerAnalytic.list('-created_date', 50).catch(() => []),
      base44.entities.EventMetric.list('-created_date', 100).catch(() => []),
    ]).then(([c, ca, em]) => { setConversions(c); setCustomerAnalytics(ca); setEventMetrics(em); }).finally(() => setLoading(false));
  }, []);

  const eventByType = {};
  eventMetrics.forEach((e) => { eventByType[e.event_type] = (eventByType[e.event_type] || 0) + (e.count || 1); });

  const maxConversion = conversions.length > 0 ? Math.max(...conversions.map((c) => c.from_count || 0), 1) : 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{conversions.length}</p><p className="text-xs text-muted-foreground">Conversion Funnels</p></CardContent></Card>
        <Card><CardContent className="p-4"><Users className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{customerAnalytics.length}</p><p className="text-xs text-muted-foreground">Customer Analytics</p></CardContent></Card>
        <Card><CardContent className="p-4"><MapPin className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{Object.keys(eventByType).length}</p><p className="text-xs text-muted-foreground">Event Types</p></CardContent></Card>
        <Card><CardContent className="p-4"><DollarSign className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{Object.values(eventByType).reduce((a, b) => a + b, 0)}</p><p className="text-xs text-muted-foreground">Total Events</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-brand-700" /> Conversion Funnels</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {conversions.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No conversion data. CRM activities will populate funnels.</p> : conversions.map((c) => (
            <div key={c.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{c.from_stage} → {c.to_stage}</p>
                <Badge variant={c.conversion_rate > 50 ? 'default' : c.conversion_rate > 20 ? 'secondary' : 'destructive'} className="text-xs">{c.conversion_rate?.toFixed(1)}% conversion</Badge>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <span>{c.from_count} → {c.to_count}</span>
                <span>·</span>
                <span>{c.drop_off_count} drop-off</span>
                {c.avg_time_to_convert_hours > 0 && <><span>·</span><span>avg {c.avg_time_to_convert_hours}h</span></>}
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${c.conversion_rate || 0}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-info" /> Customer Analytics</CardTitle></CardHeader>
          <CardContent>
            {customerAnalytics.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No customer analytics data.</p> : (
              <div className="space-y-2">
                {customerAnalytics.slice(0, 10).map((ca) => (
                  <div key={ca.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium capitalize">{ca.analytic_type?.replace(/_/g, ' ')}</p><p className="text-xs text-muted-foreground">{ca.metric_name}</p></div>
                    <Badge variant="secondary" className="text-xs">{ca.metric_value} {ca.metric_unit || ''}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Filter className="h-4 w-4 text-brand-700" /> Event Metrics</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(eventByType).length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No event metrics recorded.</p> : (
              <div className="space-y-2">
                {Object.entries(eventByType).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between rounded-lg border p-2.5">
                    <span className="text-sm capitalize">{type?.replace(/_/g, ' ')}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}