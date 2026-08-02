import { cn } from '@/lib/utils';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white px-6 py-16 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-flame-50 text-flame-400">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="mt-4 text-lg font-heading font-semibold text-brand-900">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}