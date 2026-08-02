import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ScrollText, Download, Wrench, Megaphone, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

export default function OperationalTools() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [maintenanceFlag, setMaintenanceFlag] = useState(null);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    base44.entities.FeatureFlag.filter({ key: 'maintenance_mode' }).then((flags) => {
      setMaintenanceFlag(flags[0] || null);
    });
  }, []);

  const toggleMaintenance = async (enabled) => {
    setToggling(true);
    try {
      if (maintenanceFlag) {
        await base44.entities.FeatureFlag.update(maintenanceFlag.id, { enabled });
        setMaintenanceFlag({ ...maintenanceFlag, enabled });
      } else {
        const created = await base44.entities.FeatureFlag.create({
          key: 'maintenance_mode',
          label: 'Maintenance Mode',
          description: 'When enabled, the platform shows a maintenance page to non-admin users',
          module: 'support',
          enabled,
          is_public: true,
        });
        setMaintenanceFlag(created);
      }
      toast({ title: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}` });
    } catch {
      toast({ title: 'Failed to update maintenance mode', variant: 'destructive' });
    } finally {
      setToggling(false);
    }
  };

  const exportReport = async () => {
    try {
      const [events, audits] = await Promise.all([
        base44.entities.SecurityEvent.list('-created_date', 100),
        base44.entities.AuditLog.list('-created_date', 100),
      ]);
      const report = { generated_at: new Date().toISOString(), security_events: events, audit_logs: audits };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compliance-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Compliance report exported' });
    } catch {
      toast({ title: 'Export failed', variant: 'destructive' });
    }
  };

  const tools = [
    { label: 'Search Audit Logs', icon: ScrollText, desc: 'View and filter system audit records', action: () => navigate('/admin/audit-logs') },
    { label: 'Export Compliance Report', icon: Download, desc: 'Download security events and audit logs', action: exportReport },
    { label: 'View RBAC Matrix', icon: ExternalLink, desc: 'Review roles and permissions', action: () => navigate('/admin/rbac') },
    { label: 'Feature Flags', icon: Wrench, desc: 'Manage platform feature toggles', action: () => navigate('/admin/feature-flags') },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-900">
            <Megaphone className="h-5 w-5 text-flame-500" /> Emergency Maintenance Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-brand-900">Maintenance Mode</p>
              <p className="text-xs text-muted-foreground">When enabled, non-admin users see a maintenance page</p>
            </div>
            <Switch
              checked={maintenanceFlag?.enabled || false}
              disabled={toggling}
              onCheckedChange={toggleMaintenance}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card key={tool.label} className="cursor-pointer transition-shadow hover:shadow-card-hover">
              <CardContent className="p-4" onClick={tool.action}>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-flame-50 p-2.5 text-flame-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-900">{tool.label}</p>
                    <p className="text-xs text-muted-foreground">{tool.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}