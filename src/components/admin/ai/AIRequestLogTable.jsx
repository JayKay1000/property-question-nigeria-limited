import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { AI_REQUEST_STATUS, AI_CONVERSATION_TYPES, getFeatureInfo, formatTokens } from '@/lib/ai-utils';

export default function AIRequestLogTable({ logs = [] }) {
  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-10 w-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">No AI requests logged yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Type</th>
            <th className="pb-2 pr-4 font-medium">User</th>
            <th className="pb-2 pr-4 font-medium">Prompt</th>
            <th className="pb-2 pr-4 font-medium">Model</th>
            <th className="pb-2 pr-4 font-medium">Tokens</th>
            <th className="pb-2 pr-4 font-medium">Credits</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 pr-4 font-medium">Time</th>
            <th className="pb-2 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const statusInfo = AI_REQUEST_STATUS[log.status] || AI_REQUEST_STATUS.success;
            const featureInfo = getFeatureInfo(log.request_type);
            return (
              <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: featureInfo.color }} />
                    <span className="text-xs font-medium">{featureInfo.name}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 text-xs">{log.user_name || '—'}</td>
                <td className="py-2.5 pr-4 max-w-[200px]">
                  <p className="text-xs text-muted-foreground line-clamp-1">{log.input_prompt || '—'}</p>
                </td>
                <td className="py-2.5 pr-4 text-xs text-muted-foreground">{log.model_used || '—'}</td>
                <td className="py-2.5 pr-4 text-xs">{formatTokens((log.tokens_input || 0) + (log.tokens_output || 0))}</td>
                <td className="py-2.5 pr-4 text-xs">{log.credits_used || 0}</td>
                <td className="py-2.5 pr-4">
                  <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                </td>
                <td className="py-2.5 pr-4 text-xs text-muted-foreground">{log.response_time_ms ? `${log.response_time_ms}ms` : '—'}</td>
                <td className="py-2.5 text-xs text-muted-foreground">
                  {log.request_timestamp ? new Date(log.request_timestamp).toLocaleDateString('en-NG', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}