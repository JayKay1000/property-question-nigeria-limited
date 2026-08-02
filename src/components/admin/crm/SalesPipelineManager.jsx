import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Target, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const PIPELINE_STAGES = ['lead', 'qualified', 'inspection', 'negotiation', 'reservation', 'payment', 'allocation', 'closed'];
const STAGE_COLORS = {
  lead: 'bg-muted-foreground/20', qualified: 'bg-info/30', inspection: 'bg-info/50',
  negotiation: 'bg-warning/40', reservation: 'bg-flame-500/60', payment: 'bg-flame-500',
  allocation: 'bg-success/60', closed: 'bg-success',
};

export default function SalesPipelineManager() {
  const [pipelines, setPipelines] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.SalesPipeline.list('-created_date', 200).catch(() => []),
      base44.entities.Opportunity.list('-created_date', 200).catch(() => []),
    ]).then(([p, o]) => { setPipelines(p); setOpportunities(o); }).finally(() => setLoading(false));
  }, []);

  const byStage = (stage) => pipelines.filter((p) => p.current_stage === stage);
  const totalPipelineValue = pipelines.reduce((s, p) => s + (p.pipeline_value_ngn || 0), 0);
  const weightedValue = pipelines.reduce((s, p) => s + (p.weighted_value_ngn || 0), 0);
  const wonDeals = pipelines.filter((p) => p.closed_won);
  const wonValue = wonDeals.reduce((s, p) => s + (p.pipeline_value_ngn || 0), 0);
  const activeOpps = opportunities.filter((o) => !['won', 'lost'].includes(o.stage));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{pipelines.length}</p><p className="text-xs text-muted-foreground">Pipeline Deals</p></CardContent></Card>
        <Card><CardContent className="p-4"><DollarSign className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">₦{(totalPipelineValue / 1_000_000).toFixed(1)}M</p><p className="text-xs text-muted-foreground">Total Pipeline Value</p></CardContent></Card>
        <Card><CardContent className="p-4"><Target className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">₦{(weightedValue / 1_000_000).toFixed(1)}M</p><p className="text-xs text-muted-foreground">Weighted Value</p></CardContent></Card>
        <Card><CardContent className="p-4"><DollarSign className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{wonDeals.length}</p><p className="text-xs text-muted-foreground">Won Deals · ₦{(wonValue / 1_000_000).toFixed(1)}M</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-brand-700" /> Sales Pipeline by Stage</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {PIPELINE_STAGES.map((stage) => {
                const deals = byStage(stage);
                const value = deals.reduce((s, d) => s + (d.pipeline_value_ngn || 0), 0);
                return (
                  <div key={stage} className="rounded-lg border p-3">
                    <div className={`mb-2 h-2 rounded-full ${STAGE_COLORS[stage]}`} />
                    <p className="text-xs font-semibold capitalize">{stage.replace(/_/g, ' ')}</p>
                    <p className="mt-1 font-heading text-xl font-bold">{deals.length}</p>
                    <p className="text-xs text-muted-foreground">₦{(value / 1_000_000).toFixed(1)}M</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Target className="h-4 w-4 text-flame-600" /> Active Opportunities</CardTitle></CardHeader>
          <CardContent>
            {activeOpps.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No active opportunities.</p> : (
              <div className="space-y-2">
                {activeOpps.slice(0, 10).map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{o.customer_name || 'Unknown'}</p><p className="text-xs text-muted-foreground">{o.opportunity_type?.replace(/_/g, ' ')}</p></div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-flame-600">₦{((o.expected_value_ngn || 0) / 1_000_000).toFixed(1)}M</span>
                      <Badge variant="secondary" className="text-xs capitalize">{o.stage?.replace(/_/g, ' ')}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-success" /> Won Deals</CardTitle></CardHeader>
          <CardContent>
            {wonDeals.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No won deals yet.</p> : (
              <div className="space-y-2">
                {wonDeals.slice(0, 10).map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{d.customer_name || 'Unknown'}</p><p className="text-xs text-muted-foreground">Closed {d.closed_date || ''}</p></div>
                    <span className="text-sm font-bold text-success">₦{((d.pipeline_value_ngn || 0) / 1_000_000).toFixed(1)}M</span>
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