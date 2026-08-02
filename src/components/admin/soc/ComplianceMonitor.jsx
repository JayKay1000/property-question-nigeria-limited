import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { FileCheck, ShieldCheck, ScrollText, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function ComplianceMonitor() {
  const [privacyRequests, setPrivacyRequests] = useState([]);
  const [consents, setConsents] = useState([]);
  const [auditCount, setAuditCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.DataPrivacyRequest.filter({ status: 'pending' }, '-created_date', 10),
      base44.entities.ConsentRecord.list('-created_date', 10),
      base44.entities.AuditLog.list('-created_date', 1),
    ])
      .then(([reqs, cons, audits]) => {
        setPrivacyRequests(reqs);
        setConsents(cons);
        setAuditCount(audits.length);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-flame-500" />
      </div>
    );
  }

  const stats = [
    { label: 'Pending Privacy Requests', value: privacyRequests.length, icon: FileCheck, color: 'text-warning' },
    { label: 'Recent Consent Records', value: consents.length, icon: ShieldCheck, color: 'text-success' },
    { label: 'Audit Log Entries', value: auditCount, icon: ScrollText, color: 'text-brand-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={cn('rounded-lg bg-muted p-2.5', s.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-brand-900">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-brand-900">
            <AlertCircle className="h-5 w-5 text-flame-500" /> Pending Data Privacy Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {privacyRequests.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No pending privacy requests.</p>
          ) : (
            <div className="space-y-2">
              {privacyRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-medium capitalize text-brand-900">{req.request_type} Request</p>
                    <p className="text-xs text-muted-foreground">{req.user_email || 'Unknown user'}</p>
                  </div>
                  <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">Pending</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}