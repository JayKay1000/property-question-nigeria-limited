import { useEffect, useState } from 'react';
import { Activity, Server, Cpu, HardDrive, AlertCircle, Clock, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS = { healthy: 'default', degraded: 'secondary', warning: 'secondary', critical: 'destructive', down: 'destructive', maintenance: 'secondary' };

export default function SystemMonitoringConsole() {
  const [health, setHealth] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [queues, setQueues] = useState([]);
  const [apiMetrics, setApiMetrics] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.SystemHealth.list('-created_date', 50).catch(() => []),
      base44.entities.BackgroundJob.list('-created_date', 50).catch(() => []),
      base44.entities.QueueMetric.list('-created_date', 30).catch(() => []),
      base44.entities.APIMetric.list('-created_date', 30).catch(() => []),
      base44.entities.ErrorLog.list('-created_date', 50).catch(() => []),
    ]).then(([h, j, q, a, e]) => { setHealth(h); setJobs(j); setQueues(q); setApiMetrics(a); setErrors(e); }).finally(() => setLoading(false));
  }, []);

  const unhealthyComponents = health.filter((h) => ['degraded', 'warning', 'critical', 'down'].includes(h.status));
  const failedJobs = jobs.filter((j) => j.status === 'failed');
  const processingJobs = jobs.filter((j) => ['queued', 'processing', 'retrying'].includes(j.status));
  const openErrors = errors.filter((e) => ['open', 'investigating'].includes(e.resolution_status));
  const congestedQueues = queues.filter((q) => ['congested', 'stalled'].includes(q.status));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card><CardContent className="p-4"><Server className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{health.length}</p><p className="text-xs text-muted-foreground">Components</p></CardContent></Card>
        <Card><CardContent className="p-4"><Activity className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{processingJobs.length}</p><p className="text-xs text-muted-foreground">Active Jobs</p></CardContent></Card>
        <Card><CardContent className="p-4"><AlertCircle className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{failedJobs.length}</p><p className="text-xs text-muted-foreground">Failed Jobs</p></CardContent></Card>
        <Card><CardContent className="p-4"><Zap className="h-5 w-5 text-warning" /><p className="mt-2 font-heading text-2xl font-bold">{congestedQueues.length}</p><p className="text-xs text-muted-foreground">Queue Alerts</p></CardContent></Card>
        <Card><CardContent className="p-4"><AlertCircle className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{openErrors.length}</p><p className="text-xs text-muted-foreground">Open Errors</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Server className="h-4 w-4 text-brand-700" /> System Health</CardTitle></CardHeader>
        <CardContent>
          {health.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No system health data. Monitoring will populate this view.</p> : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {health.map((h) => (
                <div key={h.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{h.component?.replace(/_/g, ' ')}</span>
                    <Badge variant={STATUS_COLORS[h.status] || 'secondary'} className="text-xs capitalize">{h.status}</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {h.uptime_percentage != null && <span>Uptime: {h.uptime_percentage}%</span>}
                    {h.cpu_usage_percentage != null && <span>CPU: {h.cpu_usage_percentage}%</span>}
                    {h.memory_usage_percentage != null && <span>RAM: {h.memory_usage_percentage}%</span>}
                    {h.storage_usage_percentage != null && <span>Storage: {h.storage_usage_percentage}%</span>}
                    {h.api_response_avg_ms != null && <span>API: {h.api_response_avg_ms}ms</span>}
                    {h.database_query_avg_ms != null && <span>DB: {h.database_query_avg_ms}ms</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-info" /> Background Jobs</CardTitle></CardHeader>
          <CardContent>
            {jobs.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No background jobs tracked.</p> : (
              <div className="space-y-2">
                {jobs.slice(0, 10).map((j) => (
                  <div key={j.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{j.job_name}</p><p className="text-xs text-muted-foreground capitalize">{j.job_type?.replace(/_/g, ' ')} · {j.duration_seconds || 0}s</p></div>
                    <Badge variant={j.status === 'completed' ? 'default' : j.status === 'failed' ? 'destructive' : 'secondary'} className="text-xs capitalize">{j.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><AlertCircle className="h-4 w-4 text-destructive" /> Error Log</CardTitle></CardHeader>
          <CardContent>
            {errors.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No errors logged.</p> : (
              <div className="space-y-2">
                {errors.slice(0, 10).map((e) => (
                  <div key={e.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{e.error_code}: {e.error_message?.substring(0, 60)}</p><p className="text-xs text-muted-foreground capitalize">{e.module} · {e.severity}</p></div>
                    <Badge variant={e.resolution_status === 'resolved' ? 'default' : 'destructive'} className="text-xs capitalize">{e.resolution_status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {apiMetrics.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Zap className="h-4 w-4 text-flame-600" /> API Performance</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {apiMetrics.slice(0, 10).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-lg border p-2.5">
                  <div><p className="text-sm font-medium">{a.api_name}</p><p className="text-xs text-muted-foreground">{a.request_count} requests · {a.avg_response_time_ms || 0}ms avg</p></div>
                  <Badge variant={a.success_rate_percentage > 95 ? 'default' : a.success_rate_percentage > 80 ? 'secondary' : 'destructive'} className="text-xs">{a.success_rate_percentage?.toFixed(1)}% success</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}