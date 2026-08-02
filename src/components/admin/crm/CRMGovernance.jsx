import { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Copy, CheckCircle2, Mail, Phone, FileText, Clock, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function CRMGovernance() {
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Customer.list('-created_date', 200).catch(() => []),
      base44.entities.Lead.list('-created_date', 200).catch(() => []),
      base44.entities.CRMActivity.list('-created_date', 200).catch(() => []),
    ]).then(([c, l, a]) => { setCustomers(c); setLeads(l); setActivities(a); }).finally(() => setLoading(false));
  }, []);

  const missingEmail = customers.filter((c) => !c.email);
  const missingPhone = customers.filter((c) => !c.phone);
  const missingRM = customers.filter((c) => !c.relationship_manager_id && !c.assigned_agent_id);
  const unassignedLeads = leads.filter((l) => !l.assigned_to_id);
  const dormantLeads = leads.filter((l) => l.status === 'dormant');
  const staleLeads = leads.filter((l) => {
    if (!l.next_follow_up_date) return false;
    return new Date(l.next_follow_up_date) < new Date() && l.status !== 'converted' && l.status !== 'lost';
  });
  const duplicateEmails = (() => {
    const seen = {}; const dups = [];
    customers.forEach((c) => { if (c.email) { if (seen[c.email.toLowerCase()]) dups.push(c.email); seen[c.email.toLowerCase()] = true; } });
    return [...new Set(dups)];
  })();
  const duplicatePhones = (() => {
    const seen = {}; const dups = [];
    customers.forEach((c) => { if (c.phone) { if (seen[c.phone]) dups.push(c.phone); seen[c.phone] = true; } });
    return [...new Set(dups)];
  })();
  const noConsent = customers.filter((c) => !c.consent_marketing);

  const completeness = customers.length > 0 ? Math.round(((customers.length - missingEmail.length - missingPhone.length) / customers.length) * 100) : 0;

  const checks = [
    { label: 'Customers Missing Email', count: missingEmail.length, total: customers.length, icon: Mail, color: 'text-warning' },
    { label: 'Customers Missing Phone', count: missingPhone.length, total: customers.length, icon: Phone, color: 'text-warning' },
    { label: 'Customers Without RM/Agent', count: missingRM.length, total: customers.length, icon: AlertTriangle, color: 'text-flame-600' },
    { label: 'Unassigned Leads', count: unassignedLeads.length, total: leads.length, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Dormant Leads', count: dormantLeads.length, total: leads.length, icon: Clock, color: 'text-warning' },
    { label: 'Overdue Follow-ups', count: staleLeads.length, total: leads.length, icon: Clock, color: 'text-destructive' },
    { label: 'Duplicate Emails', count: duplicateEmails.length, total: customers.length, icon: Copy, color: 'text-destructive' },
    { label: 'Duplicate Phones', count: duplicatePhones.length, total: customers.length, icon: Copy, color: 'text-destructive' },
    { label: 'No Marketing Consent', count: noConsent.length, total: customers.length, icon: FileText, color: 'text-info' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Users className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{customers.length}</p><p className="text-xs text-muted-foreground">Total Customers</p></CardContent></Card>
        <Card><CardContent className="p-4"><ShieldCheck className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{completeness}%</p><p className="text-xs text-muted-foreground">Data Completeness</p></CardContent></Card>
        <Card><CardContent className="p-4"><AlertTriangle className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{checks.filter((c) => c.count > 0).length}</p><p className="text-xs text-muted-foreground">Issues Detected</p></CardContent></Card>
        <Card><CardContent className="p-4"><CheckCircle2 className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{activities.length}</p><p className="text-xs text-muted-foreground">Logged Activities</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map((check) => (
          <Card key={check.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <check.icon className={`h-5 w-5 ${check.color}`} />
                  <div><p className="text-sm font-medium">{check.label}</p><p className="text-xs text-muted-foreground">{check.count} of {check.total}</p></div>
                </div>
                <Badge variant={check.count > 0 ? 'destructive' : 'default'} className="text-xs">{check.count > 0 ? 'Action Needed' : 'OK'}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {duplicateEmails.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Copy className="h-4 w-4 text-destructive" /> Duplicate Email Addresses</CardTitle></CardHeader>
          <CardContent><div className="flex flex-wrap gap-2">{duplicateEmails.map((e, i) => <Badge key={i} variant="destructive" className="text-xs">{e}</Badge>)}</div></CardContent>
        </Card>
      )}

      {staleLeads.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-destructive" /> Overdue Follow-up Leads</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {staleLeads.slice(0, 10).map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-2.5">
                <div><p className="text-sm font-medium">{l.full_name}</p><p className="text-xs text-muted-foreground">Follow-up due: {l.next_follow_up_date}</p></div>
                <Badge variant="destructive" className="text-xs capitalize">{l.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}