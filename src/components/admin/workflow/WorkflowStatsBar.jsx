import React from 'react';
import { Card } from '@/components/ui/card';
import { Workflow, PlayCircle, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

export default function WorkflowStatsBar({ stats }) {
  const items = [
    { label: 'Total Workflows', value: stats.total || 0, icon: Workflow, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active', value: stats.active || 0, icon: PlayCircle, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Completed Runs', value: stats.completed || 0, icon: CheckCircle2, color: 'text-info', bg: 'bg-info/10' },
    { label: 'Failed Runs', value: stats.failed || 0, icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10' },
    { label: 'Automation Rules', value: stats.rules || 0, icon: Zap, color: 'text-flame-600', bg: 'bg-flame-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      {items.map((item) => (
        <Card key={item.label} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-1 text-2xl font-bold font-heading">{item.value.toLocaleString()}</p>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}>
              <item.icon className={`h-6 w-6 ${item.color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}