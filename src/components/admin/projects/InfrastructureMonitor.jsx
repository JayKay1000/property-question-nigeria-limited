import { useEffect, useState } from 'react';
import { HardHat, Wrench, Zap, Droplets, Shield, TreePine } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TYPE_ICONS = {
  road: HardHat, drainage: Droplets, electricity: Zap, street_light: Zap,
  water_supply: Droplets, borehole: Droplets, sewage: Droplets, perimeter_fence: Shield,
  gate_house: Shield, security_post: Shield, park: TreePine, playground: TreePine,
  club_house: HardHat, health_centre: HardHat, school: HardHat, shopping_centre: HardHat,
};

const STATUS_COLORS = { planned: 'secondary', survey: 'secondary', under_construction: 'default', completed: 'default', inspected: 'default', operational: 'default', maintenance: 'secondary', delayed: 'destructive' };

export default function InfrastructureMonitor() {
  const [infra, setInfra] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.EstateInfrastructure.list('-created_date', 200).catch(() => []),
      base44.entities.ProjectContractor.filter({ status: 'active' }).catch(() => []),
      base44.entities.SiteInspection.list('-created_date', 50).catch(() => []),
    ]).then(([i, c, s]) => { setInfra(i); setContractors(c); setInspections(s); }).finally(() => setLoading(false));
  }, []);

  const byType = {};
  infra.forEach((i) => { byType[i.infrastructure_type] = (byType[i.infrastructure_type] || 0) + 1; });
  const completed = infra.filter((i) => i.status === 'completed' || i.status === 'operational');
  const inProgress = infra.filter((i) => i.status === 'under_construction');
  const avgCompletion = infra.length ? Math.round(infra.reduce((s, i) => s + (i.completion_percentage || 0), 0) / infra.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><HardHat className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{infra.length}</p><p className="text-xs text-muted-foreground">Infrastructure Assets</p></CardContent></Card>
        <Card><CardContent className="p-4"><Wrench className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{inProgress.length}</p><p className="text-xs text-muted-foreground">Under Construction</p></CardContent></Card>
        <Card><CardContent className="p-4"><HardHat className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{completed.length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-4"><Wrench className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{avgCompletion}%</p><p className="text-xs text-muted-foreground">Avg Completion</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><HardHat className="h-4 w-4 text-brand-700" /> Infrastructure by Type</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(byType).map(([type, count]) => {
              const Icon = TYPE_ICONS[type] || HardHat;
              return <Badge key={type} variant="outline" className="text-xs gap-1 capitalize"><Icon className="h-3 w-3" />{type.replace(/_/g, ' ')}: {count}</Badge>;
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Wrench className="h-4 w-4 text-flame-600" /> Active Contractors</CardTitle></CardHeader>
          <CardContent>
            {contractors.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No active contractors.</p> : (
              <div className="space-y-2">
                {contractors.slice(0, 8).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{c.contractor_name}</p><p className="text-xs text-muted-foreground">{c.scope_of_work || c.specialization || ''}</p></div>
                    {c.performance_rating > 0 && <Badge variant="outline" className="text-xs">{c.performance_rating}/5</Badge>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><HardHat className="h-4 w-4 text-success" /> Infrastructure Progress</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : infra.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No infrastructure assets tracked yet.</p>
          ) : (
            <div className="space-y-2">
              {infra.slice(0, 20).map((i) => {
                const Icon = TYPE_ICONS[i.infrastructure_type] || HardHat;
                return (
                  <div key={i.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between"><p className="text-sm font-medium">{i.infrastructure_name}</p><Badge variant={STATUS_COLORS[i.status] || 'secondary'} className="text-xs capitalize">{i.status?.replace(/_/g, ' ')}</Badge></div>
                      <p className="text-xs text-muted-foreground">{i.estate_name || ''} {i.responsible_contractor_name ? `· ${i.responsible_contractor_name}` : ''}</p>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand-500" style={{ width: `${i.completion_percentage || 0}%` }} /></div>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{i.completion_percentage || 0}%</span>
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