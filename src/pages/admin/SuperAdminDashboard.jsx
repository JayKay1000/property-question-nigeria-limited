import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, ShieldCheck, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import SignupApprovalStats from '@/components/admin/superadmin/SignupApprovalStats';
import SignupApprovalTable from '@/components/admin/superadmin/SignupApprovalTable';
import SignupDetailDialog from '@/components/admin/superadmin/SignupDetailDialog';
import { getStatusConfig, isAgentApplicant } from '@/lib/super-admin-utils';

const STATUS_FILTERS = [
  { value: '__all', label: 'All Statuses' },
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'email_verified', label: 'Email Verified' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
];

export default function SuperAdminDashboard() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('__all');
  const [selected, setSelected] = useState(null);
  const [actingId, setActingId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.User.list('-created_date', 200);
      setUsers(list);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Failed to load signups', description: e?.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const counts = useMemo(() => ({
    total: users.length,
    pending: users.filter((u) => ['pending_verification', 'email_verified', 'phone_verified', 'pending_approval'].includes(u.account_status)).length,
    active: users.filter((u) => u.account_status === 'active').length,
    suspended: users.filter((u) => u.account_status === 'suspended').length,
    rejected: users.filter((u) => u.account_status === 'rejected').length,
    agents: users.filter(isAgentApplicant).length,
  }), [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter !== '__all' && u.account_status !== statusFilter) return false;
      if (!q) return true;
      return [u.full_name, u.first_name, u.last_name, u.email, u.phone, u.role].filter(Boolean).some((v) => v.toLowerCase().includes(q));
    });
  }, [users, search, statusFilter]);

  const handleAction = async (action, u) => {
    if (u.id === currentUser?.id && (action === 'suspend' || action === 'reject')) {
      toast({ variant: 'destructive', title: 'Action not allowed', description: 'You cannot suspend or reject your own account.' });
      return;
    }
    setActingId(u.id);
    const patches = {
      approve: { account_status: 'active' },
      verify: { account_status: 'email_verified' },
      reject: { account_status: 'rejected' },
      suspend: { account_status: 'suspended' },
      reactivate: { account_status: 'active' },
      role: null,
    };
    const patch = patches[action];
    if (!patch) return;
    try {
      if (action === 'role') {
        setUsers((prev) => prev.map((x) => (x.id === u.id ? u : x)));
      } else {
        const extra = isAgentApplicant(u)
          ? (action === 'approve' ? { agent_verification_status: 'approved' } : action === 'reject' ? { agent_verification_status: 'rejected' } : {})
          : {};
        const updated = await base44.entities.User.update(u.id, { ...patch, ...extra });
        setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
        toast({ title: `Signup ${action}d`, description: `${u.full_name || u.email} → ${getStatusConfig(patch.account_status).label}.` });
      }
      if (action === 'role') setSelected(u);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Action failed', description: e?.message || 'You may lack permission to manage this user.' });
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-foreground">
            <ShieldCheck className="h-6 w-6 text-flame-600" />
            Super Admin — Signup Approvals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Verify, approve, suspend, or reject every signup across the platform.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={loadUsers} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <SignupApprovalStats counts={counts} />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, phone, or role…" className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <SignupApprovalTable
        users={filtered}
        loading={loading}
        currentUserId={currentUser?.id}
        onAction={handleAction}
        onOpen={setSelected}
      />

      <SignupDetailDialog
        user={selected}
        currentUserId={currentUser?.id}
        onClose={() => setSelected(null)}
        onAction={handleAction}
      />
    </div>
  );
}