import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Building2, Map as MapIcon, HardHat, Users, FolderClosed, Bell, Workflow, BrainCircuit, Wallet, Megaphone, FileText, Shield, Plug, CalendarDays, Database, Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { formatNumber } from '@/lib/platform-utils';

export default function ModuleHealthGrid() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const tryCount = async (name) => { try { const r = await base44.entities[name].list('-created_date', 1); return r.length; } catch { return null; } };
      const entries = await Promise.all([
        ['properties', tryCount('Property')],
        ['gis', tryCount('MapMarker')],
        ['projects', tryCount('Project')],
        ['leads', tryCount('Lead')],
        ['media', tryCount('MediaAsset')],
        ['notifications', tryCount('Notification')],
        ['workflows', tryCount('WorkflowDefinition')],
        ['ai', tryCount('AIRequestLog')],
        ['finance', tryCount('Invoice')],
        ['marketing', tryCount('SEOKeyword')],
        ['cms', tryCount('SiteContent')],
        ['identity', tryCount('UserSession')],
        ['api', tryCount('APIEndpoint')],
        ['scheduling', tryCount('Booking')],
        ['audit', tryCount('AuditLog')],
      ]);
      const obj = {}; entries.forEach(([k, v]) => { obj[k] = v; });
      setCounts(obj); setLoading(false);
    })();
  }, []);

  const modules = [
    { key: 'properties', label: 'Properties', icon: Building2, href: '/admin/property-center', color: 'text-brand-600', bg: 'bg-brand-50' },
    { key: 'gis', label: 'GIS Intelligence', icon: MapIcon, href: '/admin/gis', color: 'text-success', bg: 'bg-success/10' },
    { key: 'projects', label: 'Projects', icon: HardHat, href: '/admin/projects', color: 'text-flame-600', bg: 'bg-flame-50' },
    { key: 'leads', label: 'CRM & Leads', icon: Users, href: '/admin/crm', color: 'text-ice-600', bg: 'bg-ice-50' },
    { key: 'media', label: 'Media & Docs', icon: FolderClosed, href: '/admin/media-docs', color: 'text-flame-600', bg: 'bg-flame-50' },
    { key: 'notifications', label: 'Notifications', icon: Bell, href: '/admin/notifications', color: 'text-ice-600', bg: 'bg-ice-50' },
    { key: 'workflows', label: 'Workflow Engine', icon: Workflow, href: '/admin/workflows', color: 'text-brand-600', bg: 'bg-brand-50' },
    { key: 'ai', label: 'AI Center', icon: BrainCircuit, href: '/admin/ai', color: 'text-flame-600', bg: 'bg-flame-50' },
    { key: 'finance', label: 'Financial Center', icon: Wallet, href: '/admin/finance', color: 'text-success', bg: 'bg-success/10' },
    { key: 'marketing', label: 'Marketing & SEO', icon: Megaphone, href: '/admin/marketing', color: 'text-flame-600', bg: 'bg-flame-50' },
    { key: 'cms', label: 'CMS', icon: FileText, href: '/admin/cms', color: 'text-brand-600', bg: 'bg-brand-50' },
    { key: 'api', label: 'API Gateway', icon: Plug, href: '/admin/api-gateway', color: 'text-ice-600', bg: 'bg-ice-50' },
    { key: 'scheduling', label: 'Scheduling', icon: CalendarDays, href: '/admin/scheduling', color: 'text-success', bg: 'bg-success/10' },
    { key: 'identity', label: 'Identity & Access', icon: Shield, href: '/admin/identity', color: 'text-brand-600', bg: 'bg-brand-50' },
    { key: 'audit', label: 'Audit & SOC', icon: Database, href: '/admin/audit-logs', color: 'text-ice-600', bg: 'bg-ice-50' },
  ];

  return (
    <div>
      <h3 className="font-heading font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-flame-500" /> Platform Modules</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {modules.map(m => {
          const count = counts[m.key];
          const status = loading ? 'loading' : (count == null ? 'nodata' : count > 0 ? 'operational' : 'empty');
          return (
            <Link key={m.key} to={m.href}>
              <Card className="p-4 hover:shadow-card-hover transition-shadow cursor-pointer h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center`}><m.icon className={`w-5 h-5 ${m.color}`} /></div>
                  <StatusDot status={status} />
                </div>
                <p className="font-heading font-semibold text-sm mb-1">{m.label}</p>
                <p className="text-xs text-muted-foreground">{loading ? '…' : count != null ? `${formatNumber(count)} records` : 'No data'}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StatusDot({ status }) {
  const cfg = {
    loading: { color: 'bg-muted-foreground', label: 'Loading' },
    operational: { color: 'bg-success', label: 'Operational' },
    empty: { color: 'bg-warning', label: 'Empty' },
    nodata: { color: 'bg-muted-foreground', label: 'No data' },
  }[status] || { color: 'bg-muted-foreground', label: '—' };
  return <span title={cfg.label} className={`inline-block w-2.5 h-2.5 rounded-full ${cfg.color}`} />;
}