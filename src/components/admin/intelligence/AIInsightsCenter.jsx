import { useEffect, useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Sparkles, Target, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const INSIGHT_ICONS = { demand_forecast: TrendingUp, property_recommendation: Target, sales_prediction: TrendingUp, lead_scoring: Target, anomaly_detection: AlertTriangle, executive_summary: Sparkles, market_trend: TrendingUp, churn_prediction: AlertTriangle, price_optimization: TrendingUp, risk_assessment: AlertTriangle, operational_recommendation: Lightbulb };
const STATUS_COLORS = { draft: 'secondary', active: 'default', reviewed: 'default', actioned: 'default', archived: 'secondary', rejected: 'destructive' };
const TREND_COLORS = { up: 'text-success', down: 'text-destructive', flat: 'text-muted-foreground', volatile: 'text-warning', unknown: 'text-muted-foreground' };

export default function AIInsightsCenter() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AIInsight.list('-created_date', 100).then(setInsights).finally(() => setLoading(false));
  }, []);

  const activeInsights = insights.filter((i) => i.status === 'active');
  const byType = {};
  insights.forEach((i) => { byType[i.insight_type] = (byType[i.insight_type] || 0) + 1; });
  const highConfidence = insights.filter((i) => (i.confidence_score || 0) > 75);

  return (
    <div className="space-y-6">
      <Card className="border-flame-500/30 bg-flame-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-flame-600" />
            <div>
              <p className="text-sm font-medium">AI Insights Center — Future-Ready</p>
              <p className="text-xs text-muted-foreground">Predictive analytics, demand forecasting, lead scoring, churn prediction, and executive narrative summaries. Configure AI models and workflows to populate insights.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Brain className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{insights.length}</p><p className="text-xs text-muted-foreground">Total Insights</p></CardContent></Card>
        <Card><CardContent className="p-4"><Sparkles className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{activeInsights.length}</p><p className="text-xs text-muted-foreground">Active</p></CardContent></Card>
        <Card><CardContent className="p-4"><Target className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{highConfidence.length}</p><p className="text-xs text-muted-foreground">High Confidence</p></CardContent></Card>
        <Card><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{Object.keys(byType).length}</p><p className="text-xs text-muted-foreground">Insight Types</p></CardContent></Card>
      </div>

      {Object.keys(byType).length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Brain className="h-4 w-4 text-brand-700" /> Insights by Type</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, count]) => <Badge key={type} variant="secondary" className="text-xs capitalize">{type?.replace(/_/g, ' ')} ({count})</Badge>)}</div></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Sparkles className="h-4 w-4 text-flame-600" /> Generated Insights</CardTitle></CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="py-12 text-center">
              <Brain className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">No AI insights generated yet.</p>
              <p className="text-xs text-muted-foreground">Insights will appear here once AI models and workflows are configured.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight) => {
                const Icon = INSIGHT_ICONS[insight.insight_type] || Brain;
                return (
                  <div key={insight.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50"><Icon className="h-5 w-5 text-brand-700" /></div>
                        <div>
                          <p className="text-sm font-medium">{insight.insight_name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{insight.insight_type?.replace(/_/g, ' ')} · {insight.model_name || 'AI Model'} {insight.model_version && `v${insight.model_version}`}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {insight.confidence_score != null && <Badge variant={insight.confidence_score > 75 ? 'default' : 'secondary'} className="text-xs">{insight.confidence_score}% confidence</Badge>}
                        <Badge variant={STATUS_COLORS[insight.status] || 'secondary'} className="text-xs capitalize">{insight.status}</Badge>
                      </div>
                    </div>
                    {insight.description && <p className="mt-2 text-sm text-muted-foreground">{insight.description}</p>}
                    {insight.narrative_summary && <p className="mt-2 rounded-lg bg-muted p-2.5 text-sm italic">{insight.narrative_summary}</p>}
                    {insight.recommendation && <p className="mt-2 text-sm"><span className="font-medium text-flame-600">Recommendation:</span> {insight.recommendation}</p>}
                    {insight.key_factors?.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{insight.key_factors.map((f, i) => <Badge key={i} variant="outline" className="text-xs">{f}</Badge>)}</div>}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}