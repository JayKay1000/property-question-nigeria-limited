import { TrendingUp, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import { MILESTONE_STATUS_CONFIG } from '@/lib/project-utils';

export default function ConstructionTimeline({ milestones = [], progressPercentage = 0 }) {
  const sorted = [...milestones].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || new Date(a.planned_date || 0) - new Date(b.planned_date || 0));

  const statusIcons = {
    not_started: Clock,
    in_progress: TrendingUp,
    completed: CheckCircle2,
    delayed: AlertCircle,
    cancelled: XCircle,
  };

  return (
    <div>
      {/* Overall progress bar */}
      <div className="mb-6 rounded-xl border border-brand-100 bg-ice-50 p-5">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="flex items-center gap-2 font-heading text-sm font-bold text-brand-900">
            <TrendingUp className="h-4 w-4 text-flame-500" /> Overall Completion
          </h4>
          <span className="font-heading text-2xl font-bold text-flame-600">{progressPercentage}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-brand-100">
          <div className="h-full rounded-full bg-gradient-to-r from-flame-400 to-flame-600 transition-all duration-700" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      {/* Milestone timeline */}
      {sorted.length > 0 ? (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-brand-100" />
          <div className="space-y-6">
            {sorted.map((m, i) => {
              const cfg = MILESTONE_STATUS_CONFIG[m.status] || MILESTONE_STATUS_CONFIG.not_started;
              const Icon = statusIcons[m.status] || Clock;
              const isCompleted = m.status === 'completed';
              return (
                <div key={m.id || i} className="relative flex gap-4">
                  <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.className}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className={`flex-1 rounded-xl border p-4 ${isCompleted ? 'border-success/30 bg-success/5' : 'border-brand-100 bg-white'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h5 className="font-semibold text-brand-900">{m.milestone_name}</h5>
                        {m.description && <p className="mt-0.5 text-sm text-muted-foreground">{m.description}</p>}
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}>{cfg.label}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
                      {m.planned_date && <span><strong className="text-brand-700">Planned:</strong> {new Date(m.planned_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      {m.actual_date && <span><strong className="text-brand-700">Completed:</strong> {new Date(m.actual_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      {m.percentage_complete != null && m.status !== 'completed' && (
                        <span><strong className="text-brand-700">Progress:</strong> {m.percentage_complete}%</span>
                      )}
                      {m.responsible_team && <span><strong className="text-brand-700">Team:</strong> {m.responsible_team}</span>}
                    </div>
                    {m.status === 'in_progress' && m.percentage_complete != null && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
                        <div className="h-full rounded-full bg-flame-500" style={{ width: `${m.percentage_complete}%` }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center rounded-xl bg-ice-50 text-center">
          <Clock className="h-8 w-8 text-brand-200" />
          <p className="mt-2 text-sm font-medium text-muted-foreground">No milestones published yet</p>
        </div>
      )}
    </div>
  );
}