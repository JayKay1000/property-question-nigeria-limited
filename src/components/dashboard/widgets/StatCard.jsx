import { cn } from '@/lib/utils';

const colorMap = {
  flame: 'bg-flame-50 text-flame-600',
  info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
  brand: 'bg-brand-50 text-brand-700',
};

export default function StatCard({ label, value, icon: Icon, trend, color = 'flame' }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-heading font-bold text-brand-900">{value}</p>
        </div>
        {Icon && (
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', colorMap[color])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend && <p className="mt-2 text-xs text-muted-foreground">{trend}</p>}
    </div>
  );
}