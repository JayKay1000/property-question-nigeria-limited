import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, ShieldCheck, Bug, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { vulnerabilitySeverityConfig, vulnerabilityStatusConfig, policyStatusConfig, complianceLevelConfig, policyCategoryLabels, formatDate } from '@/lib/enterprise-ops-utils';

export default function SecurityOpsOverview() {
  const [vulns, setVulns] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [v, p] = await Promise.all([
          base44.entities.VulnerabilityReport.list('-created_date', 200),
          base44.entities.SecurityPolicy.list('-created_date', 200),
        ]);
        setVulns(v); setPolicies(p);
      } catch { /* */ }
      setLoading(false);
    })();
  }, []);

  const openVulns = vulns.filter(v => v.status === 'open' || v.status === 'in_progress').length;
  const critical = vulns.filter(v => v.severity === 'critical').length;
  const high = vulns.filter(v => v.severity === 'high').length;
  const resolved = vulns.filter(v => v.status === 'resolved').length;
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const compliant = policies.filter(p => p.compliance_level === 'compliant').length;
  const nonCompliant = policies.filter(p => p.compliance_level === 'non_compliant').length;
  const complianceRate = policies.length > 0 ? Math.round((compliant / policies.length) * 100) : 0;

  const stats = [
    { label: 'Open Vulns', value: openVulns, icon: Bug, color: openVulns > 0 ? 'text-error' : 'text-success', bg: openVulns > 0 ? 'bg-error/10' : 'bg-success/10' },
    { label: 'Critical', value: critical, icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10' },
    { label: 'High', value: high, icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/15' },
    { label: 'Resolved', value: resolved, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Active Policies', value: activePolicies, icon: ShieldCheck, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Compliant', value: compliant, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Non-Compliant', value: nonCompliant, icon: ShieldAlert, color: 'text-error', bg: 'bg-error/10' },
    { label: 'Compliance Rate', value: `${complianceRate}%`, icon: Lock, color: 'text-flame-600', bg: 'bg-flame-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-2`}><s.icon className={`w-4 h-4 ${s.color}`} /></div>
            <p className="text-xl font-heading font-bold">{loading ? '…' : s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-heading font-bold mb-4 flex items-center gap-2 text-error"><Bug className="w-5 h-5" /> Priority Vulnerabilities</h3>
          <div className="space-y-2">
            {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>}
            {!loading && vulns.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No vulnerabilities reported.</p>}
            {!loading && [...vulns].sort((a, b) => { const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 }; return (order[a.severity] || 5) - (order[b.severity] || 5); }).filter(v => v.status === 'open' || v.status === 'in_progress').slice(0, 6).map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="min-w-0"><p className="font-medium truncate text-sm">{v.title}</p><p className="text-xs text-muted-foreground truncate">{v.affected_system || 'System'}{v.cvss_score ? ` · CVSS ${v.cvss_score}` : ''}</p></div>
                <div className="flex items-center gap-2 shrink-0"><Badge variant="secondary" className={vulnerabilitySeverityConfig[v.severity]?.className || ''}>{vulnerabilitySeverityConfig[v.severity]?.label || v.severity}</Badge><Badge variant="secondary" className={vulnerabilityStatusConfig[v.status]?.className || ''}>{vulnerabilityStatusConfig[v.status]?.label || v.status}</Badge></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-heading font-bold mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-flame-500" /> Policy Compliance</h3>
          <div className="space-y-2">
            {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>}
            {!loading && policies.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No policies defined.</p>}
            {!loading && policies.slice(0, 6).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="min-w-0"><p className="font-medium truncate text-sm">{p.title}</p><p className="text-xs text-muted-foreground truncate">{policyCategoryLabels[p.category]}{p.next_review ? ` · Review ${formatDate(p.next_review)}` : ''}</p></div>
                <Badge variant="secondary" className={complianceLevelConfig[p.compliance_level]?.className || '' + ' shrink-0'}>{complianceLevelConfig[p.compliance_level]?.label || p.compliance_level}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}