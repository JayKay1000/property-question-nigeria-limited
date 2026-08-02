import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function QuickActions({ actions = [] }) {
  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-card">
      <h3 className="mb-4 flex items-center gap-2 font-heading font-bold text-brand-900">
        <Zap className="h-4 w-4 text-flame-500" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              to={action.href}
              className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-center transition-colors hover:border-flame-300 hover:bg-flame-50"
            >
              <Icon className="h-5 w-5 text-flame-600" />
              <span className="text-xs font-medium text-brand-900">{action.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}