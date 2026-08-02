import { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Users, Scale, Eye, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SecurityCompliance() {
  const [permissions, setPermissions] = useState([]);
  const [shares, setShares] = useState([]);
  const [accessLogs, setAccessLogs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.MediaPermission.list('-created_date', 100).catch(() => []),
      base44.entities.FileSharing.list('-created_date', 100).catch(() => []),
      base44.entities.FileAccessLog.list('-access_timestamp', 100).catch(() => []),
      base44.entities.Document.list('-created_date', 200).catch(() => []),
    ]).then(([p, s, l, d]) => { setPermissions(p); setShares(s); setAccessLogs(l); setDocuments(d); }).finally(() => setLoading(false));
  }, []);

  const restrictedDocs = documents.filter((d) => d.confidentiality_level === 'restricted');
  const confidentialDocs = documents.filter((d) => d.confidentiality_level === 'confidential');
  const legalHoldDocs = documents.filter((d) => d.is_legal_hold);
  const expiredShares = shares.filter((s) => s.is_expired || (s.expiry_date && new Date(s.expiry_date) < new Date()));
  const revokedShares = shares.filter((s) => s.is_revoked);
  const externalShares = shares.filter((s) => s.sharing_type === 'external' || s.sharing_type === 'public_link');
  const deniedAccess = accessLogs.filter((l) => l.result === 'denied');
  const downloads = accessLogs.filter((l) => l.action === 'download');
  const views = accessLogs.filter((l) => l.action === 'view');

  const accessByUser = {};
  accessLogs.forEach((l) => { if (l.user_name) accessByUser[l.user_name] = (accessByUser[l.user_name] || 0) + 1; });
  const topUsers = Object.entries(accessByUser).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Lock className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{restrictedDocs.length}</p><p className="text-xs text-muted-foreground">Restricted Documents</p></CardContent></Card>
        <Card><CardContent className="p-4"><Users className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{permissions.length}</p><p className="text-xs text-muted-foreground">Active Permissions</p></CardContent></Card>
        <Card><CardContent className="p-4"><Eye className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{accessLogs.length}</p><p className="text-xs text-muted-foreground">Access Events</p></CardContent></Card>
        <Card><CardContent className="p-4"><Scale className="h-5 w-5 text-destructive" /><p className="mt-2 font-heading text-2xl font-bold">{legalHoldDocs.length}</p><p className="text-xs text-muted-foreground">Legal Hold</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-brand-700" /> Access Audit Log</CardTitle></CardHeader>
        <CardContent>
          {accessLogs.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No access events recorded.</p> : (
            <div className="space-y-2">
              {accessLogs.slice(0, 15).map((l) => (
                <div key={l.id} className="flex items-center justify-between rounded-lg border p-2.5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${l.result === 'denied' ? 'bg-destructive/10' : 'bg-brand-50'}`}>
                      {l.action === 'download' ? <Download className="h-3.5 w-3.5 text-brand-700" /> : <Eye className="h-3.5 w-3.5 text-brand-700" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium capitalize">{l.action?.replace(/_/g, ' ')} · {l.entity_name || 'Asset'}</p>
                      <p className="text-xs text-muted-foreground">{l.user_name || 'Anonymous'} · {l.access_timestamp ? new Date(l.access_timestamp).toLocaleString() : ''}</p>
                    </div>
                  </div>
                  <Badge variant={l.result === 'denied' ? 'destructive' : 'default'} className="text-xs">{l.result}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Eye className="h-4 w-4 text-info" /> Active File Shares</CardTitle></CardHeader>
          <CardContent>
            {shares.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No shares created.</p> : (
              <div className="space-y-2">
                {shares.slice(0, 10).map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{s.entity_name || 'Shared asset'}</p><p className="text-xs text-muted-foreground">{s.sharing_type?.replace(/_/g, ' ')} · {s.shared_by_name || ''}</p></div>
                    <div className="flex gap-1">
                      {s.is_expired && <Badge variant="secondary" className="text-xs">Expired</Badge>}
                      {s.is_revoked && <Badge variant="destructive" className="text-xs">Revoked</Badge>}
                      {!s.is_expired && !s.is_revoked && <Badge variant="default" className="text-xs">Active</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-brand-700" /> Top Users by Access</CardTitle></CardHeader>
          <CardContent>
            {topUsers.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No user activity.</p> : (
              <div className="space-y-2">
                {topUsers.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between rounded-lg border p-2.5">
                    <span className="text-sm font-medium">{name}</span>
                    <Badge variant="secondary" className="text-xs">{count} events</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {(deniedAccess.length > 0 || expiredShares.length > 0) && (
        <Card className="border-destructive/30">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm text-destructive"><ShieldCheck className="h-4 w-4" /> Security Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {deniedAccess.length > 0 && <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-2.5"><span className="text-sm">{deniedAccess.length} denied access attempts</span><Badge variant="destructive" className="text-xs">Investigate</Badge></div>}
            {expiredShares.length > 0 && <div className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-2.5"><span className="text-sm">{expiredShares.length} expired share links</span><Badge variant="secondary" className="text-xs">Cleanup</Badge></div>}
            {externalShares.length > 0 && <div className="flex items-center justify-between rounded-lg border border-info/30 bg-info/5 p-2.5"><span className="text-sm">{externalShares.length} external/public share links active</span><Badge variant="default" className="text-xs">Review</Badge></div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}