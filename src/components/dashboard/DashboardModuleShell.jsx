import StatCard from '@/components/dashboard/widgets/StatCard';
import { Construction } from 'lucide-react';

export function formatNGN(amount) {
  if (amount == null || isNaN(Number(amount))) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-NG');
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

const pillColors = {
  active: 'bg-success/10 text-success', verified: 'bg-success/10 text-success', approved: 'bg-success/10 text-success',
  paid: 'bg-success/10 text-success', confirmed: 'bg-success/10 text-success', resolved: 'bg-success/10 text-success',
  completed: 'bg-success/10 text-success', published: 'bg-success/10 text-success', subscribed: 'bg-success/10 text-success',
  converted: 'bg-success/10 text-success', available: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning', new: 'bg-info/10 text-info', open: 'bg-info/10 text-info',
  submitted: 'bg-info/10 text-info', sent: 'bg-info/10 text-info', in_progress: 'bg-warning/10 text-warning',
  acknowledged: 'bg-info/10 text-info', contacted: 'bg-warning/10 text-warning', interested: 'bg-flame-50 text-flame-600',
  qualified: 'bg-info/10 text-info', negotiating: 'bg-warning/10 text-warning', inspection_scheduled: 'bg-info/10 text-info',
  escalated: 'bg-error/10 text-error', urgent: 'bg-error/10 text-error', overdue: 'bg-error/10 text-error',
  disputed: 'bg-error/10 text-error', rejected: 'bg-error/10 text-error', suspended: 'bg-error/10 text-error',
  cancelled: 'bg-muted text-muted-foreground', lost: 'bg-error/10 text-error', dormant: 'bg-muted text-muted-foreground',
  archived: 'bg-muted text-muted-foreground', inactive: 'bg-muted text-muted-foreground',
  draft: 'bg-muted text-muted-foreground', unverified: 'bg-muted text-muted-foreground',
  partially_paid: 'bg-warning/10 text-warning', reserved: 'bg-flame-50 text-flame-600', sold: 'bg-error/10 text-error',
};

export function StatusPill({ status }) {
  const key = String(status || '').toLowerCase();
  const cls = pillColors[key] || 'bg-muted text-muted-foreground';
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}>{key.replace(/_/g, ' ')}</span>;
}

export function EmptyState({ icon: Icon = Construction, title = 'No records yet', description = 'Data will appear here once available.' }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground"><Icon className="h-7 w-7" /></div>
      <h3 className="mt-3 font-heading font-bold text-brand-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default function DashboardModuleShell({ title, description, icon: Icon, stats = [], actions, loading, children }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon && <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-flame-50 text-flame-600"><Icon className="h-5 w-5" /></div>}
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-900">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {stats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => <StatCard key={i} {...s} />)}
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-700" /></div>
      ) : children}
    </div>
  );
}