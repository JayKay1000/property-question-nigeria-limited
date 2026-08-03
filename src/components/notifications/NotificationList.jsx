import { useState } from 'react';
import { Bell, CheckCheck, Inbox, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NOTIFICATION_CATEGORIES, groupNotificationsByDate, filterNotificationsByCategory } from '@/lib/notification-utils';
import NotificationCard from './NotificationCard';

const TAB_KEYS = ['all', ...NOTIFICATION_CATEGORIES.map((c) => c.key)];

export default function NotificationList({ notifications, loading, onMarkRead, onArchive, onMarkAll }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const filtered = activeCategory === 'all' ? notifications : filterNotificationsByCategory(notifications, [activeCategory]);
  const groups = groupNotificationsByDate(filtered);
  const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-flame-600" />
          <h2 className="font-heading text-xl font-bold text-brand-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-flame-500 px-2 text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAll}
            className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </button>
        )}
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5 border-b pb-3">
        {TAB_KEYS.map((key) => {
          const label = key === 'all' ? 'All' : NOTIFICATION_CATEGORIES.find((c) => c.key === key)?.label;
          const count = key === 'all' ? notifications?.length : filterNotificationsByCategory(notifications, [key]).length;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                activeCategory === key
                  ? 'bg-brand-900 text-white'
                  : 'text-brand-600 hover:bg-brand-50'
              )}
            >
              {label}
              {count > 0 && key !== 'all' && (
                <span className={cn('ml-1.5 text-xs', activeCategory === key ? 'text-flame-400' : 'text-muted-foreground')}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : filtered?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-ice-100">
            <Inbox className="h-8 w-8 text-ice-400" />
          </div>
          <p className="font-heading text-lg font-semibold text-brand-800">No notifications</p>
          <p className="mt-1 text-sm text-muted-foreground">You'll see updates here as they arrive</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([dateLabel, items]) =>
            items.length === 0 ? null : (
              <div key={dateLabel}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{dateLabel}</h3>
                <div className="space-y-2">
                  {items.map((n) => (
                    <NotificationCard key={n.id} notification={n} onMarkRead={onMarkRead} onArchive={onArchive} />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}