import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationBell({ unreadCount, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-lg p-2 transition-colors text-brand-800 hover:bg-brand-50'
      )}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-flame-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
          {unreadCount > 99 ? '99+' : unreadCount}
          <span className="absolute inset-0 rounded-full bg-flame-500 opacity-60 animate-ping" style={{ animationDuration: '2s' }} />
        </span>
      )}
    </button>
  );
}