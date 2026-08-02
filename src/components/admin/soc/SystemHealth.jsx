import { CheckCircle, AlertCircle, XCircle, Server, Database, HardDrive, Cpu, Cloud, Archive } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const healthItems = [
  { label: 'API Gateway', icon: Cloud, status: 'operational', detail: 'All endpoints responding' },
  { label: 'Database', icon: Database, status: 'operational', detail: 'Connection pool healthy' },
  { label: 'File Storage', icon: HardDrive, status: 'operational', detail: 'Media uploads active' },
  { label: 'Background Jobs', icon: Cpu, status: 'operational', detail: 'No failed tasks' },
  { label: 'Authentication', icon: Server, status: 'operational', detail: 'Auth service responsive' },
  { label: 'Backup System', icon: Archive, status: 'degraded', detail: 'Last backup 2h ago — verification pending' },
];

const statusConfig = {
  operational: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', label: 'Operational' },
  degraded: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning/10', label: 'Degraded' },
  down: { icon: XCircle, color: 'text-error', bg: 'bg-error/10', label: 'Down' },
};

export default function SystemHealth() {
  const operational = healthItems.filter((h) => h.status === 'operational').length;
  const total = healthItems.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overall System Status</p>
            <p className="text-2xl font-bold text-brand-900">{operational}/{total} Services Operational</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-7 w-7 text-success" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {healthItems.map((item) => {
          const Icon = item.icon;
          const cfg = statusConfig[item.status];
          const StatusIcon = cfg.icon;
          return (
            <Card key={item.label}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-muted p-2 text-brand-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-brand-900">{item.label}</p>
                  </div>
                  <StatusIcon className={cn('h-5 w-5', cfg.color)} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{item.detail}</p>
                <span className={cn('mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium', cfg.bg, cfg.color)}>
                  {cfg.label}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}