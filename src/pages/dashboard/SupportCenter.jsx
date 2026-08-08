import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Headphones, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import DashboardModuleShell, { StatusPill, EmptyState, formatDate } from '@/components/dashboard/DashboardModuleShell';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUSES = ['open', 'in_progress', 'waiting_customer', 'escalated', 'resolved', 'closed', 'reopened'];

export default function SupportCenter() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    base44.entities.SupportTicket.list('-created_date', 100).then(setTickets).catch(() => setTickets([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => tickets.filter((t) => {
    const ms = !search || (t.subject || '').toLowerCase().includes(search.toLowerCase()) || (t.customer_name || '').toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === 'all' || t.status === statusFilter;
    return ms && mf;
  }), [tickets, search, statusFilter]);

  const stats = useMemo(() => [
    { label: 'Open Tickets', value: tickets.filter((t) => t.status === 'open').length, icon: Headphones, color: 'flame' },
    { label: 'In Progress', value: tickets.filter((t) => t.status === 'in_progress').length, icon: Clock, color: 'warning' },
    { label: 'Escalated', value: tickets.filter((t) => t.status === 'escalated').length, icon: AlertCircle, color: 'error' },
    { label: 'Resolved', value: tickets.filter((t) => t.status === 'resolved').length, icon: CheckCircle, color: 'success' },
  ], [tickets]);

  return (
    <DashboardModuleShell title="Support" description="Manage support tickets, enquiries, and customer issues." icon={Headphones} stats={stats} loading={loading}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white sm:max-w-xs" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 bg-white sm:w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Headphones} title="No support tickets" description="Customer support tickets will appear here." />
      ) : (
        <div className="grid gap-3">
          {filtered.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 shadow-card">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">#{t.ticket_number || '—'}</span>
                  <p className="font-medium text-brand-900">{t.subject || 'Untitled ticket'}</p>
                  <StatusPill status={t.status} />
                  {t.priority === 'urgent' && <span className="rounded-full bg-error/10 px-2 py-0.5 text-xs font-medium text-error">Urgent</span>}
                </div>
                <p className="text-sm text-muted-foreground">{t.customer_name || '—'} · {(t.category || 'enquiry').replace(/_/g, ' ')}</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">{formatDate(t.created_date)}</div>
            </div>
          ))}
        </div>
      )}
    </DashboardModuleShell>
  );
}