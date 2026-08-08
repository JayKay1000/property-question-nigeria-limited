import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { HardHat, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import DashboardModuleShell, { StatusPill, EmptyState, formatDate } from '@/components/dashboard/DashboardModuleShell';
import { Link } from 'react-router-dom';

const CONSTRUCTION_STAGES = ['infrastructure_development', 'construction', 'selling', 'allocation', 'handover'];

export default function ConstructionManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Project.list('-created_date', 100).then(setProjects).catch(() => setProjects([])).finally(() => setLoading(false));
  }, []);

  const active = useMemo(() => projects.filter((p) => CONSTRUCTION_STAGES.includes(p.status)), [projects]);

  const stats = useMemo(() => [
    { label: 'Active Projects', value: active.length, icon: HardHat, color: 'flame' },
    { label: 'Completed', value: projects.filter((p) => p.status === 'completed').length, icon: CheckCircle, color: 'success' },
    { label: 'Suspended', value: projects.filter((p) => p.status === 'suspended').length, icon: AlertCircle, color: 'error' },
    { label: 'Total Projects', value: projects.length, icon: Building2, color: 'info' },
  ], [projects, active]);

  const avgProgress = active.length ? Math.round(active.reduce((s, p) => s + (p.progress_percentage || 0), 0) / active.length) : 0;

  return (
    <DashboardModuleShell title="Construction" description="Monitor active construction projects, milestones, and progress." icon={HardHat} stats={stats} loading={loading}>
      {active.length === 0 ? (
        <EmptyState icon={HardHat} title="No active construction" description="Projects in construction phase will appear here." />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white p-4 shadow-card">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-brand-900">Average Progress Across Active Projects</span>
              <span className="font-heading font-bold text-flame-600">{avgProgress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-flame-500 transition-all" style={{ width: `${avgProgress}%` }} />
            </div>
          </div>
          <div className="grid gap-3">
            {active.map((p) => (
              <div key={p.id} className="rounded-xl border border-border bg-white p-4 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-bold text-brand-900">{p.name}</p>
                      <StatusPill status={p.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{[p.location_city, p.location_lga, p.location_state].filter(Boolean).join(', ') || 'Location not set'}</p>
                  </div>
                  <Link to={`/projects/${p.id}`} className="text-sm font-medium text-flame-600 hover:underline">View Project</Link>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{p.progress_percentage || 0}%</span>
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand-700 transition-all" style={{ width: `${p.progress_percentage || 0}%` }} />
                  </div>
                </div>
                {p.estimated_completion_date && <p className="mt-2 text-xs text-muted-foreground">Est. completion: {formatDate(p.estimated_completion_date)}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardModuleShell>
  );
}