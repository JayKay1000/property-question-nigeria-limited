import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';

const typeMap = {
  info: { icon: Info, color: 'text-info' },
  success: { icon: CheckCircle, color: 'text-success' },
  warning: { icon: AlertCircle, color: 'text-warning' },
};

export default function NotificationList({ notifications = [] }) {
  const items =
    notifications.length > 0
      ? notifications
      : [
          { type: 'info', text: 'New properties available in Lekki Phase 2', time: '2h ago' },
          { type: 'success', text: 'Your inspection request was approved', time: '5h ago' },
          { type: 'warning', text: 'Complete your profile to unlock all features', time: '1d ago' },
        ];

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-card">
      <h3 className="mb-4 flex items-center gap-2 font-heading font-bold text-brand-900">
        <Bell className="h-4 w-4 text-flame-500" />
        Notifications
      </h3>
      <div className="space-y-1">
        {items.map((n, i) => {
          const config = typeMap[n.type] || typeMap.info;
          const Icon = config.icon;
          return (
            <div key={i} className="flex gap-3 rounded-lg p-2 hover:bg-soft-gray">
              <Icon className={`h-5 w-5 shrink-0 ${config.color}`} />
              <div className="flex-1">
                <p className="text-sm text-brand-900">{n.text}</p>
                <p className="text-xs text-muted-foreground">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}