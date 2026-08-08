import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Briefcase, Building2, Wrench, CheckCircle, Clock } from 'lucide-react';
import DashboardModuleShell, { StatusPill, EmptyState, formatDate } from '@/components/dashboard/DashboardModuleShell';
import { Link } from 'react-router-dom';

export default function PropertyManagement() {
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Property.list('-created_date', 100).catch(() => []),
      base44.entities.ServiceRequest.list('-created_date', 50).catch(() => []),
    ]).then(([p, r]) => { setProperties(p); setRequests(r); }).finally(() => setLoading(false));
  }, []);

  const openRequests = requests.filter((r) => !['completed', 'cancelled'].includes(r.status));

  const stats = useMemo(() => [
    { label: 'Managed Properties', value: properties.length, icon: Building2, color: 'flame' },
    { label: 'Open Requests', value: openRequests.length, icon: Wrench, color: 'warning' },
    { label: 'In Progress', value: requests.filter((r) => r.status === 'in_progress').length, icon: Clock, color: 'info' },
    { label: 'Completed', value: requests.filter((r) => r.status === 'completed').length, icon: CheckCircle, color: 'success' },
  ], [properties, requests, openRequests]);

  return (
    <DashboardModuleShell title="Property Management" description="Manage properties, maintenance requests, and inspections." icon={Briefcase} stats={stats} loading={loading}>
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 font-heading text-base font-bold text-brand-900">Maintenance Requests</h3>
          {requests.length === 0 ? (
            <EmptyState icon={Wrench} title="No maintenance requests" description="Service and maintenance requests will appear here." />
          ) : (
            <div className="grid gap-3">
              {requests.slice(0, 10).map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 shadow-card">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-brand-900">{r.subject || 'Untitled request'}</p>
                      <StatusPill status={r.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{(r.request_type || '').replace(/_/g, ' ')} · {r.property_name || r.customer_name || '—'}</p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">{formatDate(r.requested_date || r.created_date)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-3 font-heading text-base font-bold text-brand-900">Managed Properties</h3>
          {properties.length === 0 ? (
            <EmptyState icon={Building2} title="No properties" description="Properties will appear here once added." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {properties.slice(0, 9).map((p) => (
                <Link key={p.id} to={`/properties/${p.id}`} className="block rounded-xl border border-border bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover">
                  <p className="font-heading font-bold text-brand-900">{p.title || 'Untitled'}</p>
                  <p className="text-sm text-muted-foreground">{[p.city, p.state].filter(Boolean).join(', ') || 'Location not set'}</p>
                  <div className="mt-2"><StatusPill status={p.availability_status || p.status} /></div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardModuleShell>
  );
}