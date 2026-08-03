import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, LayoutDashboard, FileText, Send, Activity, Workflow, BarChart3, TrendingUp, TrendingDown, Mail, Smartphone, CheckCheck, AlertCircle, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { NOTIFICATION_STATUS, CAMPAIGN_STATUS, NOTIFICATION_CATEGORIES, calculateCampaignMetrics, formatRelativeTime } from '@/lib/notification-utils';
import DeliveryStatusBadge from '@/components/notifications/DeliveryStatusBadge';
import PageHeader from '@/components/ui/PageHeader';

export default function NotificationCenterAdmin() {
  const [stats, setStats] = useState({ total: 0, sent: 0, delivered: 0, read: 0, failed: 0, unread: 0 });
  const [recentLogs, setRecentLogs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [logs, tmpls, cmps, rls] = await Promise.all([
        base44.entities.NotificationLog.list('-created_date', 100),
        base44.entities.NotificationTemplate.filter({ is_active: true }, 'sort_order', 50),
        base44.entities.CommunicationCampaign.list('-created_date', 20),
        base44.entities.NotificationRule.filter({ is_active: true }, 'sort_order', 30),
      ]);
      setRecentLogs(logs || []);
      setTemplates(tmpls || []);
      setCampaigns(cmps || []);
      setRules(rls || []);

      const sent = (logs || []).filter((l) => ['sent', 'delivered', 'read'].includes(l.status)).length;
      const delivered = (logs || []).filter((l) => ['delivered', 'read'].includes(l.status)).length;
      const read = (logs || []).filter((l) => l.status === 'read').length;
      const failed = (logs || []).filter((l) => ['failed', 'bounced'].includes(l.status)).length;
      const unread = (logs || []).filter((l) => !l.is_read).length;
      setStats({ total: (logs || []).length, sent, delivered, read, failed, unread });
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader
        title="Notification & Communication Center"
        subtitle="Enterprise omnichannel communication, campaign management, and delivery analytics"
        icon={Bell}
        actions={<Badge className="bg-flame-100 text-flame-700">Admin</Badge>}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard icon={Send} label="Total Sent" value={stats.sent} color="text-ice-600" bg="bg-ice-100" />
        <KpiCard icon={CheckCheck} label="Delivered" value={stats.delivered} color="text-success" bg="bg-green-100" />
        <KpiCard icon={Mail} label="Read" value={stats.read} color="text-flame-600" bg="bg-flame-100" />
        <KpiCard icon={AlertCircle} label="Failed" value={stats.failed} color="text-error" bg="bg-red-100" />
        <KpiCard icon={Bell} label="Unread" value={stats.unread} color="text-warning" bg="bg-amber-100" />
        <KpiCard icon={FileText} label="Templates" value={templates.length} color="text-brand-600" bg="bg-brand-100" />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="overview" className="gap-1.5"><LayoutDashboard className="h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5"><FileText className="h-4 w-4" /> Templates</TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-1.5"><Send className="h-4 w-4" /> Campaigns</TabsTrigger>
          <TabsTrigger value="delivery" className="gap-1.5"><Activity className="h-4 w-4" /> Delivery</TabsTrigger>
          <TabsTrigger value="rules" className="gap-1.5"><Workflow className="h-4 w-4" /> Rules</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-0 shadow-card">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BarChart3 className="h-4 w-4 text-flame-600" /> Channel Distribution</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['email', 'sms', 'push', 'in_app'].map((ch) => {
                    const count = recentLogs.filter((l) => l.channel === ch).length;
                    const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    const labels = { email: 'Email', sms: 'SMS', push: 'Push', in_app: 'In-App' };
                    const colors = { email: 'bg-ice-500', sms: 'bg-success', push: 'bg-flame-500', in_app: 'bg-brand-600' };
                    return (
                      <div key={ch}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-medium text-brand-700">{labels[ch]}</span>
                          <span className="text-muted-foreground">{count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className={cn('h-full rounded-full', colors[ch])} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-card">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="h-4 w-4 text-flame-600" /> Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {recentLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center gap-2 rounded-lg border p-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-brand-800">{log.subject || log.template_code || 'Notification'}</p>
                        <p className="text-xs text-muted-foreground">{log.recipient_name || log.recipient_email} · {formatRelativeTime(log.created_date)}</p>
                      </div>
                      <DeliveryStatusBadge status={log.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card className="border-0 shadow-card">
            <CardHeader><CardTitle className="text-base">Notification Templates</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((t) => {
                  const cat = NOTIFICATION_CATEGORIES.find((c) => c.key === t.category);
                  return (
                    <div key={t.id} className="rounded-xl border p-4 hover:shadow-card-hover">
                      <div className="flex items-center justify-between">
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', cat?.bg, cat?.color)}>{cat?.label || t.category}</span>
                        <Badge variant="outline" className="text-xs">{t.channel}</Badge>
                      </div>
                      <h4 className="mt-2 font-heading text-sm font-semibold text-brand-900">{t.template_name}</h4>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{t.description || t.body_template?.substring(0, 80)}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <code className="rounded bg-muted px-1.5 py-0.5">{t.template_code}</code>
                        {t.trigger_event && <span>· triggers on {t.trigger_event}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card className="border-0 shadow-card">
            <CardHeader><CardTitle className="text-base">Communication Campaigns</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="py-2">Campaign</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Sent</th>
                      <th className="py-2 text-right">Delivered</th>
                      <th className="py-2 text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c) => {
                      const metrics = calculateCampaignMetrics(c);
                      const stCfg = CAMPAIGN_STATUS[c.status] || CAMPAIGN_STATUS.draft;
                      return (
                        <tr key={c.id} className="border-b last:border-0 hover:bg-ice-50/40">
                          <td className="py-3">
                            <p className="font-medium text-brand-800">{c.campaign_name}</p>
                            <p className="text-xs text-muted-foreground">{c.campaign_reference} · {formatRelativeTime(c.scheduled_at || c.created_date)}</p>
                          </td>
                          <td className="py-3"><Badge variant="outline" className="text-xs">{c.campaign_type}</Badge></td>
                          <td className="py-3"><span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', stCfg.bg, stCfg.color)}>{stCfg.label}</span></td>
                          <td className="py-3 text-right text-sm font-medium text-brand-700">{c.sent_count || 0}</td>
                          <td className="py-3 text-right text-sm text-brand-700">{c.delivered_count || 0}</td>
                          <td className="py-3 text-right text-sm font-semibold text-flame-600">{metrics.deliveryRate}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery">
          <Card className="border-0 shadow-card">
            <CardHeader><CardTitle className="text-base">Delivery Log</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="py-2">Recipient</th>
                      <th className="py-2">Channel</th>
                      <th className="py-2">Subject</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.slice(0, 30).map((log) => (
                      <tr key={log.id} className="border-b last:border-0 hover:bg-ice-50/40">
                        <td className="py-3 text-sm text-brand-700">{log.recipient_name || log.recipient_email || '—'}</td>
                        <td className="py-3"><Badge variant="outline" className="text-xs">{log.channel}</Badge></td>
                        <td className="py-3 text-sm text-brand-700 max-w-xs truncate">{log.subject || '—'}</td>
                        <td className="py-3"><DeliveryStatusBadge status={log.status} /></td>
                        <td className="py-3 text-xs text-muted-foreground">{formatRelativeTime(log.sent_at || log.created_date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rules Tab */}
        <TabsContent value="rules">
          <Card className="border-0 shadow-card">
            <CardHeader><CardTitle className="text-base">Automation Rules</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {rules.map((r) => (
                  <div key={r.id} className="rounded-xl border p-4 hover:shadow-card-hover">
                    <div className="flex items-center justify-between">
                      <h4 className="font-heading text-sm font-semibold text-brand-900">{r.rule_name || r.rule_code}</h4>
                      <div className={cn('h-2 w-2 rounded-full', r.is_active ? 'bg-success' : 'bg-muted')} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{r.description || 'No description'}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <Badge variant="outline" className="text-xs">On {r.trigger_entity} {r.trigger_event}</Badge>
                      {r.channels?.map((ch) => (
                        <Badge key={ch} variant="outline" className="text-xs">{ch}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color, bg }) {
  return (
    <Card className="border-0 shadow-card">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', bg)}>
          <Icon className={cn('h-5 w-5', color)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-heading text-xl font-bold text-brand-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}