import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Clock, Target } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LEAD_STATUS_CATEGORY = { won: 'Won', lost: 'Lost', dormant: 'Dormant' };

export default function ExecutiveAnalytics() {
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [conversions, setConversions] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Lead.list('-created_date', 200).catch(() => []),
      base44.entities.Customer.list('-created_date', 200).catch(() => []),
      base44.entities.LeadConversion.list('-conversion_date', 100).catch(() => []),
      base44.entities.CRMMetrics.list('-created_date', 100).catch(() => []),
      base44.entities.Opportunity.list('-created_date', 200).catch(() => []),
    ]).then(([l, c, conv, m, o]) => { setLeads(l); setCustomers(c); setConversions(conv); setMetrics(m); setOpportunities(o); }).finally(() => setLoading(false));
  }, []);

  const convertedLeads = leads.filter((l) => l.status === 'converted');
  const conversionRate = leads.length > 0 ? ((convertedLeads.length / leads.length) * 100).toFixed(1) : 0;
  const totalConversionValue = conversions.reduce((s, c) => s + (c.conversion_value_ngn || 0), 0);
  const avgTimeToConvert = conversions.length > 0 ? Math.round(conversions.reduce((s, c) => s + (c.time_to_convert_days || 0), 0) / conversions.length) : 0;

  const totalExpectedValue = opportunities.reduce((s, o) => s + (o.expected_value_ngn || 0), 0);
  const wonValue = opportunities.filter((o) => o.is_won).reduce((s, o) => s + (o.actual_value_ngn || o.expected_value_ngn || 0), 0);

  const bySource = {};
  leads.forEach((l) => { bySource[l.source] = (bySource[l.source] || 0) + 1; });
  const topSources = Object.entries(bySource).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxSource = topSources.length ? topSources[0][1] : 1;

  const byStage = {};
  customers.forEach((c) => { byStage[c.lifecycle_stage] = (byStage[c.lifecycle_stage] || 0) + 1; });

  const byScore = { cold: 0, warm: 0, hot: 0 };
  leads.forEach((l) => { if (l.score_level) byScore[l.score_level] = (byScore[l.score_level] || 0) + 1; });

  const cacMetrics = metrics.filter((m) => m.metric_type === 'customer_acquisition_cost');
  const ltvMetrics = metrics.filter((m) => m.metric_type === 'lifetime_value');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{conversionRate}%</p><p className="text-xs text-muted-foreground">Lead Conversion Rate</p></CardContent></Card>
        <Card><CardContent className="p-4"><DollarSign className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">₦{(totalConversionValue / 1_000_000).toFixed(1)}M</p><p className="text-xs text-muted-foreground">Total Conversion Value</p></CardContent></Card>
        <Card><CardContent className="p-4"><Clock className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{avgTimeToConvert}d</p><p className="text-xs text-muted-foreground">Avg Time to Convert</p></CardContent></Card>
        <Card><CardContent className="p-4"><DollarSign className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">₦{(wonValue / 1_000_000).toFixed(1)}M</p><p className="text-xs text-muted-foreground">Won Revenue</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Target className="h-4 w-4 text-brand-700" /> Lead Source Performance</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {topSources.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No lead source data.</p> : topSources.map(([source, count]) => (
            <div key={source} className="flex items-center gap-3">
              <span className="w-32 truncate text-sm capitalize">{source?.replace(/_/g, ' ')}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand-500" style={{ width: `${(count / maxSource) * 100}%` }} /></div>
              <Badge variant="secondary" className="w-12 justify-center text-xs">{count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-flame-600" /> Customer Lifecycle Distribution</CardTitle></CardHeader>
          <CardContent>
            {Object.keys(byStage).length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No lifecycle data.</p> : (
              <div className="flex flex-wrap gap-3">
                {Object.entries(byStage).map(([stage, count]) => (
                  <div key={stage} className="flex flex-col items-center rounded-lg border p-3 px-6">
                    <span className="font-heading text-2xl font-bold">{count}</span>
                    <span className="text-xs capitalize text-muted-foreground">{stage?.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-success" /> Lead Score Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center rounded-lg border border-info/30 bg-info/5 p-6"><span className="font-heading text-3xl font-bold text-info">{byScore.cold}</span><span className="text-xs text-muted-foreground">Cold</span></div>
              <div className="flex flex-col items-center rounded-lg border border-warning/30 bg-warning/5 p-6"><span className="font-heading text-3xl font-bold text-warning">{byScore.warm}</span><span className="text-xs text-muted-foreground">Warm</span></div>
              <div className="flex flex-col items-center rounded-lg border border-destructive/30 bg-destructive/5 p-6"><span className="font-heading text-3xl font-bold text-destructive">{byScore.hot}</span><span className="text-xs text-muted-foreground">Hot</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><BarChart3 className="h-4 w-4 text-brand-700" /> Key CRM Metrics</CardTitle></CardHeader>
        <CardContent>
          {metrics.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No metrics recorded yet.</p> : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {metrics.slice(0, 12).map((m) => (
                <div key={m.id} className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">{m.metric_name}</p>
                  <p className="mt-1 font-heading text-xl font-bold">{m.metric_value.toLocaleString()} {m.metric_unit}</p>
                  <p className="text-xs text-muted-foreground capitalize">{m.metric_period?.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}