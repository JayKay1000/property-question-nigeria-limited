import { Link } from 'react-router-dom';
import { CheckCheck, Archive, MoreVertical, Mail, Megaphone, Settings, AlertTriangle, Clock, ShieldCheck, Users, Building2, Building, CreditCard, UserCircle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime, truncateBody, NOTIFICATION_CATEGORIES } from '@/lib/notification-utils';
import { useState } from 'react';
import DeliveryStatusBadge from './DeliveryStatusBadge';

const ICON_MAP = { Mail, Megaphone, Settings, AlertTriangle, Clock, ShieldCheck, Users, Building2, Building, CreditCard, UserCircle, Bell };

export default function NotificationCard({ notification, onMarkRead, onArchive }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cat = NOTIFICATION_CATEGORIES.find((c) => c.key === notification.category) || NOTIFICATION_CATEGORIES[0];
  const IconComp = ICON_MAP[cat.icon] || Bell;
  const unread = !notification.is_read;

  const content = (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 transition-all',
        unread ? 'border-flame-200 bg-flame-50/30 shadow-sm' : 'border-border bg-white hover:bg-ice-50/40'
      )}
    >
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', cat.bg)}>
        <IconComp className={cn('h-5 w-5', cat.color)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn('font-heading text-sm', unread ? 'font-semibold text-brand-900' : 'font-medium text-brand-700')}>
            {notification.subject || 'Notification'}
          </h4>
          {unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-flame-500" />}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{truncateBody(notification.body, 140)}</p>
        <div className="mt-2 flex items-center gap-2">
          <DeliveryStatusBadge status={notification.status} />
          <span className="text-xs text-muted-foreground">{formatRelativeTime(notification.sent_at || notification.created_date)}</span>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', cat.bg, cat.color)}>{cat.label}</span>
        </div>
      </div>
      <div className="relative shrink-0">
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen((v) => !v); }}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-9 z-10 w-40 rounded-lg border bg-white p-1 shadow-premium" onClick={(e) => e.stopPropagation()}>
            {unread && (
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); onMarkRead?.(notification.id); }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-brand-700 hover:bg-brand-50"
              >
                <CheckCheck className="h-4 w-4" /> Mark as read
              </button>
            )}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false); onArchive?.(notification.id); }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-brand-700 hover:bg-brand-50"
            >
              <Archive className="h-4 w-4" /> Archive
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return notification.action_url ? (
    <Link to={notification.action_url} onClick={() => { if (unread) onMarkRead?.(notification.id); }}>
      {content}
    </Link>
  ) : content;
}