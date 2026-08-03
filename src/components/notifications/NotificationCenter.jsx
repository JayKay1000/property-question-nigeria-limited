import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, X, Inbox, Mail, Megaphone, Settings, AlertTriangle, Clock, ShieldCheck, Users, Building2, Building, CreditCard, UserCircle } from 'lucide-react';
import { formatRelativeTime, truncateBody, getNotificationIcon } from '@/lib/notification-utils';
import { cn } from '@/lib/utils';

const ICON_MAP = { transactional: Mail, marketing: Megaphone, system: Settings, alert: AlertTriangle, reminder: Clock, verification: ShieldCheck, crm: Users, property: Building2, project: Building, payment: CreditCard, account: UserCircle, Bell };

export default function NotificationCenter({ open, onClose, notifications, onMarkRead, onMarkAllRead, onViewAll }) {
  const unread = (notifications || []).filter((n) => !n.is_read);
  const recent = (notifications || []).slice(0, 8);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="absolute right-4 top-16 z-[71] w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border bg-white shadow-premium-lg"
          >
            <div className="flex items-center justify-between border-b bg-brand-900 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-flame-400" />
                <h3 className="font-heading text-sm font-semibold">Notifications</h3>
                {unread.length > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-flame-500 px-1 text-[10px] font-bold">
                    {unread.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread.length > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/80 hover:bg-white/10"
                  >
                    <CheckCheck className="h-3.5 w-3.5" /> Mark all
                  </button>
                )}
                <button onClick={onClose} className="rounded-lg p-1 text-white/80 hover:bg-white/10">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {recent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Inbox className="mb-2 h-10 w-10 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-brand-700">You're all caught up</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">No new notifications</p>
                </div>
              ) : (
                recent.map((n) => {
                  const IconComp = ICON_MAP[n.category] || Bell;
                  const unreadFlag = !n.is_read;
                  return (
                    <Link
                      key={n.id}
                      to={n.action_url || '/notifications'}
                      onClick={() => { if (unreadFlag) onMarkRead?.(n.id); onClose?.(); }}
                      className={cn(
                        'flex items-start gap-3 border-b px-4 py-3 transition-colors hover:bg-ice-50',
                        unreadFlag && 'bg-flame-50/40'
                      )}
                    >
                      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', unreadFlag ? 'bg-flame-100' : 'bg-muted')}>
                        <IconComp className={cn('h-4 w-4', unreadFlag ? 'text-flame-600' : 'text-muted-foreground')} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm', unreadFlag ? 'font-semibold text-brand-900' : 'font-medium text-brand-700')}>
                          {n.subject || 'Notification'}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{truncateBody(n.body, 80)}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground/70">{formatRelativeTime(n.sent_at || n.created_date)}</p>
                      </div>
                      {unreadFlag && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-flame-500" />}
                    </Link>
                  );
                })
              )}
            </div>

            <div className="border-t bg-ice-50 px-4 py-2.5">
              <button
                onClick={() => { onViewAll?.(); onClose?.(); }}
                className="w-full text-center text-sm font-semibold text-flame-600 hover:text-flame-700"
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}