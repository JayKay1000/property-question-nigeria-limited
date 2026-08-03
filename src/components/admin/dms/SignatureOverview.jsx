import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PenTool, Send, CheckCircle2, XCircle, Clock, FileText, ScanText } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { signatureStatusConfig, documentTypeLabels, formatDateTime } from '@/lib/enterprise-ops-utils';

export default function SignatureOverview() {
  const [sigs, setSigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { setLoading(true); try { setSigs(await base44.entities.ESignature.list('-created_date', 200)); } catch { /* */ } setLoading(false); })(); }, []);

  const counts = { draft: 0, sent: 0, viewed: 0, signed: 0, declined: 0, expired: 0, voided: 0 };
  sigs.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });

  const stats = [
    { label: 'Total Requests', value: sigs.length, icon: PenTool, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Pending (Sent)', value: counts.sent, icon: Send, color: 'text-ice-600', bg: 'bg-ice-50' },
    { label: 'Viewed', value: counts.viewed, icon: Clock, color: 'text-ice-600', bg: 'bg-ice-50' },
    { label: 'Signed', value: counts.signed, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Declined', value: counts.declined, icon: XCircle, color: 'text-error', bg: 'bg-error/10' },
    { label: 'Expired', value: counts.expired, icon: Clock, color: 'text-warning', bg: 'bg-warning/15' },
  ];
  const completionRate = sigs.length > 0 ? Math.round((counts.signed / sigs.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          <h3 className="font-heading font-bold mb-4">Signature Completion</h3>
          <div className="flex items-center gap-4">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" /><circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--success))" strokeWidth="10" strokeDasharray={`${(completionRate / 100) * 264} 264`} strokeLinecap="round" /></svg>
              <div className="absolute inset-0 flex items-center justify-center"><span className="text-2xl font-heading font-bold">{completionRate}%</span></div>
            </div>
            <div className="flex-1 space-y-2">
              {Object.entries(signatureStatusConfig).map(([k, cfg]) => counts[k] > 0 && (
                <div key={k} className="flex justify-between text-sm"><span>{cfg.label}</span><Badge variant="secondary" className={cfg.className}>{counts[k]}</Badge></div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-heading font-bold mb-4 flex items-center gap-2"><ScanText className="w-5 h-5 text-flame-500" /> Recent Activity</h3>
          <div className="space-y-2">
            {loading && <p className="text-sm text-muted-foreground text-center py-4">Loading…</p>}
            {!loading && sigs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No signature requests.</p>}
            {!loading && sigs.slice(0, 6).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="min-w-0 flex items-center gap-2"><FileText className="w-4 h-4 text-muted-foreground shrink-0" /><div className="min-w-0"><p className="font-medium truncate text-sm">{s.document_title}</p><p className="text-xs text-muted-foreground truncate">{s.signer_name} · {documentTypeLabels[s.document_type]}</p></div></div>
                <div className="text-right shrink-0"><Badge variant="secondary" className={signatureStatusConfig[s.status]?.className || ''}>{signatureStatusConfig[s.status]?.label || s.status}</Badge><p className="text-xs text-muted-foreground mt-1">{formatDateTime(s.signed_at || s.created_date)}</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}