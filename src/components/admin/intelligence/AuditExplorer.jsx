import { useEffect, useState } from 'react';
import { FileSearch, Filter, Download, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const RESULT_COLORS = { success: 'default', failure: 'destructive', denied: 'destructive', warning: 'secondary' };
const SEVERITY_COLORS = { info: 'secondary', low: 'secondary', medium: 'default', high: 'destructive', critical: 'destructive' };

export default function AuditExplorer() {
  const [logs, setLogs] = useState([]);
  const [changes, setChanges] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [search, setSearch] = useState('');
  const [filterModule, setFilterModule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.AuditLog.list('-created_date', 100).catch(() => []),
      base44.entities.EntityChange.list('-created_date', 50).catch(() => []),
      base44.entities.ApprovalHistory.list('-created_date', 50).catch(() => []),
    ]).then(([l, c, a]) => { setLogs(l); setChanges(c); setApprovals(a); }).finally(() => setLoading(false));
  }, []);

  const modules = [...new Set(logs.map((l) => l.module))];
  const filtered = logs.filter((l) =>
    (!search || (l.action?.toLowerCase().includes(search.toLowerCase()) || l.user_name?.toLowerCase().includes(search.toLowerCase()) || l.details?.toLowerCase().includes(search.toLowerCase()))) &&
    (!filterModule || l.module === filterModule)
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><FileSearch className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{logs.length}</p><p className="text-xs text-muted-foreground">Audit Events</p></CardContent></Card>
        <Card><CardContent className="p-4"><ChevronRight className="h-5 w-5 text-info" /><p className="mt-2 font-heading text-2xl font-bold">{changes.length}</p><p className="text-xs text-muted-foreground">Entity Changes</p></CardContent></Card>
        <Card><CardContent className="p-4"><Filter className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{approvals.filter(a => a.decision === 'pending').length}</p><p className="text-xs text-muted-foreground">Pending Approvals</p></CardContent></Card>
        <Card><CardContent className="p-4"><Download className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{logs.filter(l => l.result === 'failure').length}</p><p className="text-xs text-muted-foreground">Failed Actions</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2"><FileSearch className="h-4 w-4 text-brand-700" /> Audit Event Explorer</span>
            <div className="relative w-56">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="h-9 pl-9" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {modules.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              <button onClick={() => setFilterModule(null)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${!filterModule ? 'bg-brand-700 text-white' : 'hover:bg-muted'}`}>All Modules</button>
              {modules.map((m) => <button key={m} onClick={() => setFilterModule(filterModule === m ? null : m)} className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize ${filterModule === m ? 'bg-flame-500 text-white' : 'hover:bg-muted'}`}>{m?.replace(/_/g, ' ')}</button>)}
            </div>
          )}
          {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p> : filtered.length === 0 ? <p className="py-12 text-center text-sm text-muted-foreground">No audit events found.</p> : (
            <div className="space-y-2">
              {filtered.slice(0, 25).map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50"><FileSearch className="h-4 w-4 text-brand-700" /></div>
                    <div>
                      <p className="text-sm font-medium">{log.action} <span className="text-muted-foreground">·</span> {log.entity_name || log.category}</p>
                      <p className="text-xs text-muted-foreground">{log.user_name || 'System'} · {log.created_date ? new Date(log.created_date).toLocaleString() : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.severity && <Badge variant={SEVERITY_COLORS[log.severity] || 'secondary'} className="text-xs capitalize">{log.severity}</Badge>}
                    <Badge variant={RESULT_COLORS[log.result] || 'secondary'} className="text-xs capitalize">{log.result}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {changes.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><ChevronRight className="h-4 w-4 text-info" /> Recent Entity Changes</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {changes.slice(0, 10).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-2.5">
                <div><p className="text-sm font-medium">{c.entity_name}: {c.field_changed}</p><p className="text-xs text-muted-foreground">{c.changed_by_name || ''} · {c.change_type}</p></div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground line-through">{c.previous_value || '—'}</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="font-medium">{c.new_value || '—'}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}