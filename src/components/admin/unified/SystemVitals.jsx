import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Server, Shield, Calendar, Plug, Workflow, Bell, AlertTriangle, CheckCircle2, Activity, Gauge } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { integrationHealthConfig, formatNumber, formatDateTime } from '@/lib/platform-utils';

export default function SystemVitals() {
  const [vitals, setVitals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const tryList = async (name, limit = 100) => { try { return await base44.entities[name].list('-created_date', limit); } catch { return []; } };
      const [integrations, endpoints, bookings, slots, workflows, notifications, auditLogs, errors] = await Promise.all([
        tryList('IntegrationConfig'), tryList('APIEndpoint'), tryList('Booking'), tryList('BookingSlot'),
        tryList('WorkflowDefinition'), tryList('Notification'), tryList('AuditLog', 1), tryList('ErrorLog', 5),
      ]);
      setVitals({
        integrations, endpoints, bookings, slots, workflows, notifications, auditCount: auditLogs.length === 1 ? 'active' : 'idle', recentErrors: errors,
      });
      setLoading(false);
    })();
  }, []);

  const healthy = vitals.integrations?.filter(i => i.health === 'healthy').length || 0;
  const degraded = vitals.integrations?.filter(i => i.health === 'degraded').length || 0;
  const down = vitals.integrations?.filter(i => i.health === 'down').length || 0;
  const pendingBookings = vitals.bookings?.filter(b => b.status === 'pending').length || 0;
  const availableSlots = vitals.slots?.filter(s => s.status === 'available').length || 0;
  const activeWorkflows = vitals.workflows?.filter(w => w.status === 'active').length || 0;
  const totalRequests = vitals.endpoints?.reduce((s, e) => s + (e.request_count || 0), 0) || 0;
  const totalErrors = vitals.endpoints?.reduce((s, e) => s + (e.error_count || 0), 0) || 0;
  const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(2) : '0.00';
  const platformScore = healthy + activeWorkflows + availableSlots > 0 ? Math.min(99, 70 + healthy * 3 + activeWorkflows) : 100;

  const vitalsCards = [
    { label: 'Platform Score', value: `${platformScore}%`, icon: Gauge, color: platformScore > 90 ? 'text-success' : 'text-warning', bg: platformScore > 90 ? 'bg-success/10' : 'bg-warning/15' },
    { label: 'Healthy Integrations', value: healthy, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Degraded', value: degraded, icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/15' },
    { label: 'Down', value: down, icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10' },
    { label: 'API Requests', value: formatNumber(totalRequests), icon: Activity, color: 'text-ice-600', bg: 'bg-ice-50' },
    { label: 'Error Rate', value: `${errorRate}%`, icon: AlertTriangle, color: totalErrors > 0 ? 'text-error' : 'text-success', bg: totalErrors > 0 ? 'bg-error/10' : 'bg-success/10' },
    { label: 'Pending Bookings', value: pendingBookings, icon: Calendar, color: 'text-warning', bg: 'bg-warning/15' },
    { label: 'Available Slots', value: availableSlots, icon: Calendar, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Active Workflows', value: activeWorkflows, icon: Workflow, color: 'text-flame-600', bg: 'bg-flame-50' },
    { label: 'Endpoints', value: vitals.endpoints?.length || 0, icon: Server, color: 'text-ice-600', bg: 'bg-ice-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading font-bold mb-4 flex items-center gap-2"><Cpu className="w-5 h-5 text-flame-500" /> System Vitals</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {vitalsCards.map(v => (
            <Card key={v.label} className="p-4">
              <div className={`w-9 h-9 rounded-lg ${v.bg} flex items-center justify-center mb-2`}><v.icon className={`w-4 h-4 ${v.color}`} /></div>
              <p className="text-xl font-heading font-bold">{loading ? '…' : v.value}</p>
              <p className="text-xs text-muted-foreground">{v.label}</p>
            </Card>
          ))}
        </div>
      </div>

      {vitals.recentErrors && vitals.recentErrors.length > 0 && (
        <Card className="p-5">
          <h3 className="font-heading font-bold mb-4 flex items-center gap-2 text-error"><AlertTriangle className="w-5 h-5" /> Recent Errors</h3>
          <div className="space-y-2">
            {vitals.recentErrors.slice(0, 5).map((e, idx) => (
              <div key={e.id || idx} className="flex items-center justify-between p-3 rounded-lg border border-error/20 bg-error/5">
                <div className="min-w-0"><p className="font-medium text-sm truncate">{e.error_message || e.message || 'Unknown error'}</p><p className="text-xs text-muted-foreground">{e.entity_name || e.source || 'System'}</p></div>
                <span className="text-xs text-muted-foreground shrink-0">{formatDateTime(e.created_date)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}