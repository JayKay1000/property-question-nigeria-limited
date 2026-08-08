import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, UserPlus, CheckCircle, Target } from 'lucide-react';
import DashboardModuleShell, { StatusPill, EmptyState, formatDate } from '@/components/dashboard/DashboardModuleShell';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUSES = ['new', 'contacted', 'qualified', 'interested', 'inspection_scheduled', 'negotiating', 'reserved', 'converted', 'lost', 'dormant', 'nurturing'];

export default function LeadsManager() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    base44.entities.Lead.list('-created_date', 100).then(setLeads).catch(() => setLeads([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => leads.filter((l) => {
    const ms = !search || (l.full_name || '').toLowerCase().includes(search.toLowerCase()) || (l.email || '').toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === 'all' || l.status === statusFilter;
    return ms && mf;
  }), [leads, search, statusFilter]);

  const stats = useMemo(() => [
    { label: 'Total Leads', value: leads.length, icon: Users, color: 'flame' },
    { label: 'New', value: leads.filter((l) => l.status === 'new').length, icon: UserPlus, color: 'info' },
    { label: 'Qualified', value: leads.filter((l) => l.status === 'qualified').length, icon: Target, color: 'warning' },
    { label: 'Converted', value: leads.filter((l) => l.status === 'converted').length, icon: CheckCircle, color: 'success' },
  ], [leads]);

  return (
    <DashboardModuleShell title="Leads" description="Track and manage your sales leads through the pipeline." icon={Users} stats={stats} loading={loading}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white sm:max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 bg-white sm:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No leads found" description="Leads from enquiries and campaigns will appear here." />
      ) : (
        <div className="grid gap-3">
          {filtered.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 shadow-card">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-heading font-bold text-brand-900">{l.full_name || 'Unknown'}</p>
                  <StatusPill status={l.status} />
                  {l.priority === 'urgent' && <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">Urgent</span>}
                </div>
                <p className="truncate text-sm text-muted-foreground">{l.email || l.phone || 'No contact'} {l.interest_type ? `· ${l.interest_type}` : ''}</p>
                {l.assigned_to_name && <p className="text-xs text-muted-foreground">Assigned: {l.assigned_to_name}</p>}
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="font-medium capitalize text-brand-900">{l.score_level || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(l.created_date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardModuleShell>
  );
}