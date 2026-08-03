import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader, SkipForward, Clock } from 'lucide-react';
import { EXECUTION_STATUS, formatDuration } from '@/lib/automation-utils';

export default function ExecutionLogTable({ logs = [] }) {
  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No execution logs yet</p>
        <p className="text-xs text-muted-foreground/70">Workflow runs will appear here</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Workflow</th>
            <th className="pb-2 pr-4 font-medium">Trigger</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium">Duration</th>
            <th className="pb-2 pr-4 font-medium">Steps</th>
            <th className="pb-2 pr-4 font-medium">Started</th>
            <th className="pb-2 font-medium">Triggered By</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const statusInfo = EXECUTION_STATUS[log.status] || EXECUTION_STATUS.completed;
            const Icon = statusInfo.icon === 'Loader' ? Loader : statusInfo.icon === 'CheckCircle2' ? CheckCircle2 : statusInfo.icon === 'XCircle' ? XCircle : SkipForward;
            return (
              <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2.5 pr-4">
                  <p className="font-medium">{log.workflow_name || log.workflow_code}</p>
                  {log.trigger_record_summary && <p className="text-xs text-muted-foreground line-clamp-1">{log.trigger_record_summary}</p>}
                </td>
                <td className="py-2.5 pr-4 text-xs text-muted-foreground">{log.trigger_entity || log.trigger_type}</td>
                <td className="py-2.5 pr-4">
                  <Badge className={statusInfo.color}>
                    <Icon className="mr-1 h-3 w-3" />
                    {statusInfo.label}
                  </Badge>
                </td>
                <td className="py-2.5 pr-4 text-xs">{formatDuration(log.duration_ms)}</td>
                <td className="py-2.5 pr-4 text-xs">
                  <span className="text-success">{log.successful_steps || 0}</span>
                  <span className="text-muted-foreground"> / {log.total_steps || 0}</span>
                  {log.failed_steps > 0 && <span className="text-error"> ({log.failed_steps} failed)</span>}
                </td>
                <td className="py-2.5 pr-4 text-xs text-muted-foreground">
                  {log.started_at ? new Date(log.started_at).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                </td>
                <td className="py-2.5 text-xs text-muted-foreground">{log.triggered_by_name || log.triggered_by || 'System'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}