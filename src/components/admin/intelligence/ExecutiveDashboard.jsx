import { useEffect, useState } from 'react';
import { Building2, Users, TrendingUp, HardHat, DollarSign, ArrowUp, ArrowDown, Minus, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ExecutiveDashboard() {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BusinessKPI.list('-sort_order', 100).then(setKpis).finally(() => setLoading(false));
  }, []);

  const execKPIs = kpis.filter((k) => k.is_executive);
  const displayKPIs = execKPIs.length > 0 ? execKPIs : kpis;

  const TREND_ICONS = { up: ArrowUp, down: ArrowDown, flat: Minus };
  const TREND_COLORS = { up: 'text-success', down: 'text-destructive', flat: 'text-muted-foreground' };
  const CATEGORY_ICONS = { properties: Building2, customers: Users, growth: TrendingUp, projects: HardHat, finance: DollarSign, crm: Users, buy2flip: TrendingUp, agents: Users, marketing: TrendingUp, operations: Activity, construction: HardHat };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {loading ? Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="p-4"><div className="h-20 animate-pulse rounded bg-muted" /></CardContent></Card>) :
          displayKPIs.slice(0, 12).map((kpi) => {
            const Icon = CATEGORY_ICONS[kpi.category] || TrendingUp;
            const TrendIcon = TREND_ICONS[kpi.trend] || Minus;
            return (
              <Card key={kpi.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50"><Icon className="h-4 w-4 text-brand-700" /></div>
                    {kpi.trend && <TrendIcon className={`h-4 w-4 ${TREND_COLORS[kpi.trend]}`} />}
                  </div>
                  <p className="mt-2 font-heading text-2xl font-bold">{kpi.value?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">{kpi.kpi_name}</p>
                  {kpi.trend_percentage != null && kpi.trend !== 'unknown' && (
                    <p className={`mt-1 text-xs ${TREND_COLORS[kpi.trend]}`}>{kpi.trend_percentage > 0 ? '+' : ''}{kpi.trend_percentage}% vs last period</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        }
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-brand-700" /> KPI Catalog</CardTitle></CardHeader>
        <CardContent>
          {kpis.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No KPIs defined. Seed data will populate executive metrics.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4">KPI</th><th className="pb-2 pr-4">Category</th><th className="pb-2 pr-4">Value</th><th className="pb-2 pr-4">Period</th><th className="pb-2 pr-4">Trend</th><th className="pb-2 pr-4">Executive</th>
                </tr></thead>
                <tbody>
                  {kpis.map((kpi) => (
                    <tr key={kpi.id} className="border-b last:border-0">
                      <td className="py-2.5 pr-4"><p className="font-medium">{kpi.kpi_name}</p><p className="text-xs text-muted-foreground">{kpi.kpi_code}</p></td>
                      <td className="py-2.5 pr-4"><Badge variant="secondary" className="text-xs capitalize">{kpi.category}</Badge></td>
                      <td className="py-2.5 pr-4 font-medium">{kpi.value?.toLocaleString() || 0} {kpi.unit && <span className="text-xs text-muted-foreground">{kpi.unit}</span>}</td>
                      <td className="py-2.5 pr-4 capitalize text-xs">{kpi.period}</td>
                      <td className="py-2.5 pr-4"><Badge variant={kpi.trend === 'up' ? 'default' : kpi.trend === 'down' ? 'destructive' : 'secondary'} className="text-xs capitalize">{kpi.trend || '—'}</Badge></td>
                      <td className="py-2.5 pr-4">{kpi.is_executive ? <Badge variant="default" className="text-xs">Yes</Badge> : <Badge variant="outline" className="text-xs">No</Badge>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}