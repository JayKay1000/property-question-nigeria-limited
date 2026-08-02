import {
  Activity, CheckCircle, FileText, Calendar,
  MessageSquare, User, Upload, Bell,
} from 'lucide-react';

const iconMap = {
  profile: User,
  property: FileText,
  inspection: Calendar,
  enquiry: MessageSquare,
  document: Upload,
  approval: CheckCircle,
  notification: Bell,
  default: Activity,
};

export default function ActivityTimeline({ activities = [] }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-card">
      <h3 className="mb-4 font-heading font-bold text-brand-900">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No recent activity.</p>
      ) : (
        <div className="space-y-4">
          {activities.map((act, i) => {
            const Icon = iconMap[act.type] || iconMap.default;
            return (
              <div key={i} className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm text-brand-900">{act.text}</p>
                  <p className="text-xs text-muted-foreground">{act.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}