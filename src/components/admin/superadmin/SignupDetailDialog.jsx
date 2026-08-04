import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Ban, ShieldCheck, RotateCcw, UserCog } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { ROLE_DEFINITIONS, ALL_ROLES } from '@/lib/rbac/roles';
import { getStatusConfig, getRoleLabel, formatDate, formatDateTime, fullName, isAgentApplicant, AGENT_VERIFICATION_CONFIG } from '@/lib/super-admin-utils';
import AgentDocumentsPanel from '@/components/admin/superadmin/AgentDocumentsPanel';

const INFO_ROWS = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'country', label: 'Country' },
  { key: 'state', label: 'State' },
  { key: 'city', label: 'City' },
  { key: 'address', label: 'Address' },
  { key: 'department', label: 'Department' },
  { key: 'referral_code', label: 'Referral Code' },
  { key: 'communication_preference', label: 'Comms Preference' },
];

export default function SignupDetailDialog({ user, currentUserId, onClose, onAction }) {
  const [role, setRole] = useState(user?.role || 'customer');
  const [savingRole, setSavingRole] = useState(false);
  const { toast } = useToast();
  const isYou = user?.id === currentUserId;

  useEffect(() => {
    setRole(user?.role || 'customer');
  }, [user?.id]);

  if (!user) return null;

  const handleSaveRole = async () => {
    setSavingRole(true);
    try {
      await base44.entities.User.update(user.id, { role });
      toast({ title: 'Role updated', description: `${fullName(user)} is now ${getRoleLabel(role)}.` });
      onAction('role', { ...user, role });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Could not update role', description: e?.message || 'Try again later.' });
    } finally {
      setSavingRole(false);
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700">{fullName(user).charAt(0).toUpperCase()}</span>
            {fullName(user)}
            {isYou && <Badge variant="outline" className="border-flame-200 bg-flame-50 text-flame-700">You</Badge>}
          </DialogTitle>
          <DialogDescription>Review signup details and take approval action.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
          {/* Status & verification */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusConfig(user.account_status).tone}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${getStatusConfig(user.account_status).dot}`} />
              {getStatusConfig(user.account_status).label}
            </span>
            {isAgentApplicant(user) && (
              <Badge variant="outline" className={AGENT_VERIFICATION_CONFIG[user.agent_verification_status]?.tone}>
                Agent: {AGENT_VERIFICATION_CONFIG[user.agent_verification_status]?.label}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">Joined {formatDate(user.created_date)}</span>
          </div>

          {/* Profile info */}
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2">
            {INFO_ROWS.map((r) => (
              <div key={r.key} className="flex justify-between gap-2 text-sm">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="text-right font-medium text-foreground">{user[r.key] || '—'}</span>
              </div>
            ))}
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Email Verified</span>
              <span className="font-medium text-foreground">{user.account_status === 'email_verified' || user.account_status === 'active' || user.account_status === 'phone_verified' ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Phone Verified</span>
              <span className="font-medium text-foreground">{user.phone_verified ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium text-foreground">{formatDateTime(user.updated_date)}</span>
            </div>
          </div>

          {/* Role management */}
          {!isYou && (
            <div className="rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2">
                <UserCog className="h-4 w-4 text-brand-700" />
                <Label className="text-sm font-semibold">Assign Role</Label>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-9 w-full sm:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {ALL_ROLES.filter((r) => r !== 'guest').map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_DEFINITIONS[r]?.label || r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleSaveRole} disabled={savingRole || role === user.role}>
                  {savingRole ? 'Saving…' : 'Update Role'}
                </Button>
              </div>
              {role === 'super_admin' && (
                <p className="mt-2 text-xs text-amber-600">Super admin grants unrestricted access to every module.</p>
              )}
            </div>
          )}

          {isAgentApplicant(user) && <AgentDocumentsPanel userId={user.id} />}
        </div>

        <DialogFooter className="flex-wrap gap-2 sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {!isYou && (
              <>
                {user.account_status !== 'active' && (
                  <Button size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700" onClick={() => onAction('approve', user)}>
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </Button>
                )}
                {user.account_status === 'pending_verification' && (
                  <Button size="sm" variant="outline" className="gap-1.5 text-blue-700" onClick={() => onAction('verify', user)}>
                    <ShieldCheck className="h-4 w-4" /> Verify
                  </Button>
                )}
                {user.account_status !== 'rejected' && user.account_status !== 'active' && (
                  <Button size="sm" variant="outline" className="gap-1.5 text-rose-700 hover:bg-rose-50" onClick={() => onAction('reject', user)}>
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                )}
                {user.account_status === 'active' && (
                  <Button size="sm" variant="outline" className="gap-1.5 text-red-700 hover:bg-red-50" onClick={() => onAction('suspend', user)}>
                    <Ban className="h-4 w-4" /> Suspend
                  </Button>
                )}
                {(user.account_status === 'suspended' || user.account_status === 'rejected') && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => onAction('reactivate', user)}>
                    <RotateCcw className="h-4 w-4" /> Reactivate
                  </Button>
                )}
              </>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}