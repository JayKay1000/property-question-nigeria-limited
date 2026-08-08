import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { UserCog, Users, CheckCircle, Award } from 'lucide-react';
import DashboardModuleShell, { StatusPill, EmptyState, formatDate } from '@/components/dashboard/DashboardModuleShell';
import { Input } from '@/components/ui/input';

export default function CustomersManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.entities.Customer.list('-created_date', 100).then(setCustomers).catch(() => setCustomers([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => customers.filter((c) => !search || (c.full_name || '').toLowerCase().includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase())), [customers, search]);

  const stats = useMemo(() => [
    { label: 'Total Customers', value: customers.length, icon: Users, color: 'flame' },
    { label: 'Active', value: customers.filter((c) => c.status === 'active').length, icon: CheckCircle, color: 'success' },
    { label: 'Verified', value: customers.filter((c) => c.verification_status === 'verified').length, icon: CheckCircle, color: 'info' },
    { label: 'VIP', value: customers.filter((c) => c.status === 'vip').length, icon: Award, color: 'warning' },
  ], [customers]);

  return (
    <DashboardModuleShell title="Customers" description="Manage customer relationships and lifecycle stages." icon={UserCog} stats={stats} loading={loading}>
      <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white sm:max-w-xs" />
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description="Customers will appear here once registered." />
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 shadow-card">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-heading font-bold text-brand-900">{c.full_name || 'Unknown'}</p>
                  <StatusPill status={c.status} />
                  {c.verification_status === 'verified' && <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">Verified</span>}
                </div>
                <p className="truncate text-sm text-muted-foreground">{c.email || c.phone || 'No contact'} · {c.customer_type || 'individual'}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Lifecycle</p>
                <p className="text-sm font-medium capitalize text-brand-900">{(c.lifecycle_stage || 'lead').replace(/_/g, ' ')}</p>
                <p className="text-xs text-muted-foreground">{formatDate(c.created_date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardModuleShell>
  );
}