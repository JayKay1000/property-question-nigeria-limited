import { useEffect, useState } from 'react';
import { FileCheck, Clock, Users, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const RESERVATION_COLORS = { pending: 'secondary', active: 'default', expired: 'destructive', converted: 'default', cancelled: 'secondary', refunded: 'secondary' };
const ALLOCATION_COLORS = { pending: 'secondary', approved: 'default', rejected: 'destructive', revoked: 'destructive', transferred: 'secondary' };

export default function AllocationConsole() {
  const [reservations, setReservations] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [purchasers, setPurchasers] = useState([]);
  const [ownership, setOwnership] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.PlotReservation.list('-created_date', 100).catch(() => []),
      base44.entities.PlotAllocation.list('-created_date', 100).catch(() => []),
      base44.entities.PlotPurchaser.list('-created_date', 100).catch(() => []),
      base44.entities.PlotOwnershipHistory.list('-transfer_date', 50).catch(() => []),
    ]).then(([r, a, p, o]) => { setReservations(r); setAllocations(a); setPurchasers(p); setOwnership(o); }).finally(() => setLoading(false));
  }, []);

  const activeReservations = reservations.filter((r) => r.reservation_status === 'active' || r.reservation_status === 'pending');
  const pendingAllocations = allocations.filter((a) => a.status === 'pending');
  const approvedAllocations = allocations.filter((a) => a.status === 'approved');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card><CardContent className="p-4"><Clock className="h-5 w-5 text-warning" /><p className="mt-2 font-heading text-2xl font-bold">{activeReservations.length}</p><p className="text-xs text-muted-foreground">Active Reservations</p></CardContent></Card>
        <Card><CardContent className="p-4"><FileCheck className="h-5 w-5 text-flame-600" /><p className="mt-2 font-heading text-2xl font-bold">{pendingAllocations.length}</p><p className="text-xs text-muted-foreground">Pending Allocations</p></CardContent></Card>
        <Card><CardContent className="p-4"><UserCheck className="h-5 w-5 text-success" /><p className="mt-2 font-heading text-2xl font-bold">{approvedAllocations.length}</p><p className="text-xs text-muted-foreground">Approved Allocations</p></CardContent></Card>
        <Card><CardContent className="p-4"><Users className="h-5 w-5 text-brand-700" /><p className="mt-2 font-heading text-2xl font-bold">{purchasers.length}</p><p className="text-xs text-muted-foreground">Plot Purchasers</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-warning" /> Reservation Queue</CardTitle></CardHeader>
          <CardContent>
            {loading ? <p className="py-6 text-center text-sm text-muted-foreground">Loading...</p> : activeReservations.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No active reservations.</p>
            ) : (
              <div className="space-y-2">
                {activeReservations.slice(0, 10).map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{r.plot_number || 'Plot'} · {r.customer_name}</p><p className="text-xs text-muted-foreground">{r.estate_name || ''} · Expires {r.expiry_date || 'N/A'}</p></div>
                    <Badge variant={RESERVATION_COLORS[r.reservation_status] || 'secondary'} className="text-xs capitalize">{r.reservation_status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><FileCheck className="h-4 w-4 text-flame-600" /> Allocation Approvals</CardTitle></CardHeader>
          <CardContent>
            {pendingAllocations.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No pending allocations.</p> : (
              <div className="space-y-2">
                {pendingAllocations.slice(0, 10).map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg border p-2.5">
                    <div><p className="text-sm font-medium">{a.plot_number || 'Plot'} · {a.purchaser_name}</p><p className="text-xs text-muted-foreground">{a.estate_name || ''} · {a.allocation_date || 'Pending date'}</p></div>
                    <Badge variant={ALLOCATION_COLORS[a.status] || 'secondary'} className="text-xs capitalize">{a.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-brand-700" /> Plot Purchasers</CardTitle></CardHeader>
        <CardContent>
          {purchasers.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No purchasers registered yet.</p> : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {purchasers.slice(0, 12).map((p) => (
                <div key={p.id} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{p.purchaser_name}</p>
                  <p className="text-xs text-muted-foreground">{p.plot_number || p.estate_name || ''}</p>
                  <div className="mt-1.5 flex gap-2">
                    <Badge variant={p.payment_status === 'fully_paid' ? 'default' : 'secondary'} className="text-xs capitalize">{p.payment_status?.replace(/_/g, ' ')}</Badge>
                    <Badge variant="outline" className="text-xs capitalize">{p.documentation_progress?.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><FileCheck className="h-4 w-4 text-success" /> Ownership Transfer History</CardTitle></CardHeader>
        <CardContent>
          {ownership.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No ownership transfers recorded.</p> : (
            <div className="space-y-2">
              {ownership.slice(0, 10).map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-lg border p-2.5 text-sm">
                  <span className="text-muted-foreground">{o.previous_owner_name || '—'}</span>
                  <span className="text-flame-600">→</span>
                  <span className="font-medium">{o.new_owner_name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{o.transfer_date} · {o.transfer_method}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}