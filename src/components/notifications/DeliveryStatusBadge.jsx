import { cn } from '@/lib/utils';
import { NOTIFICATION_STATUS } from '@/lib/notification-utils';

export default function DeliveryStatusBadge({ status, size = 'sm' }) {
  const config = NOTIFICATION_STATUS[status] || NOTIFICATION_STATUS.queued;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        config.bg, config.color,
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        size === 'lg' && 'px-3 py-1.5 text-base',
      )}
    >
      <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'} />
      {config.label}
    </span>
  );
}