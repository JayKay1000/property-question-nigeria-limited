import { useEffect, useState } from 'react';
import { Briefcase, Building2, TrendingUp, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS = {
  planning: 'secondary', survey_completed: 'secondary', approval_pending: 'secondary',
  infrastructure_development: 'default', construction: 'default', selling: 'default',
  allocation: 'default', handover: 'default', completed: 'default',
  suspended: 'destructive', cancelled: 'destructive', archived: 'secondary',
};

export default function PortfolioDashboard() {
  const [projects, setProjects] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Project.list('-created_date', 100).catch(() => []),
      base44.entities.ProjectMilestone.list('-created_date', 100).catch(() => []),
    ]).then(([p, m]) => { setProjects(p); setMilestones(m); }).finally(() => setLoading(false));
  }, []);

  const active = projects.filter((p) => !['completed', 'cancelled', 'archived'].includes(p.status));
  const completed = projects.filter((p) => p.status === 'completed');
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget_ngn || 0), 0);
  const avgProgress = projects.length ? Math.round(projects.reduce((s, p) => s + (p.progress_percentage || 0), 0) / projects.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Briefcase className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{projects.length}</p><p className="text-xs text-muted-foreground">Total Projects</p></CardContent></Card>
        <Card><CardContent className="p-4"><TrendingUp className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{active.length}</p><p className="text-xs text-muted-foreground">Active Projects</p></CardContent></Card>
        <Card><CardContent className="p-4"><Building2 className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{completed.length}</p><p className="text-xs text-muted-foreground">Completed</p></CardContent></Card>
        <Card><CardContent className="p-4"><Clock className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{avgProgress}%</p><p className="text-xs text-muted-foreground">Avg Progress</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Briefcase className="h-4 w-4 text-brand-700" /> Project Portfolio</CardTitle></CardHeader>
        <CardContent>
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : projects.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center"><Briefcase className="h-12 w-12 text-muted-foreground/40" /><p className="mt-4 text-sm text-muted-foreground">No projects registered yet.</p></div>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50"><Building2 className="h-5 w-5 text-brand-700" /></div>
                    <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.reference_number || p.code || ''} · {p.location_city || p.location_state || ''}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:block w-24"><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-brand-500" style={{ width: `${p.progress_percentage || 0}%` }} /></div></div>
                    <Badge variant={STATUS_COLORS[p.status] || 'secondary'} className="text-xs capitalize">{p.status?.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-flame-600" /> Recent Milestones</CardTitle></CardHeader>
        <CardContent>
          {milestones.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No milestones tracked yet.</p> : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {milestones.slice(0, 9).map((m) => (
                <div key={m.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{m.milestone_name}</p>
                  <p className="text-xs text-muted-foreground">{m.project_name || ''}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{m.actual_date || m.planned_date || 'No date'}</span>
                    <Badge variant={m.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{m.percentage_complete || 0}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}