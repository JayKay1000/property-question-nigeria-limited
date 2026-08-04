import React from 'react';
import { CheckCircle2, XCircle, Ban, ShieldCheck, Eye, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStatusConfig, getRoleLabel, getRoleTone, formatDate, fullName, isAgentApplicant, AGENT_VERIFICATION_CONFIG } from '@/lib/super-admin-utils';

export default function SignupApprovalTable({ users, loading, currentUserId, onAction, onOpen }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/60" />
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Eye className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">No signups match your filters</p>
        <p className="text-xs text-muted-foreground">Try clearing the search or status filter.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Applicant</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">Signed Up</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const status = getStatusConfig(u.account_status);
              const agent = isAgentApplicant(u);
              const isYou = u.id === currentUserId;
              return (
                <tr key={u.id} className="group transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <button onClick={() => onOpen(u)} className="flex items-center gap-3 text-left">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                        {fullName(u).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-foreground">{fullName(u)}</p>
                          {isYou && <Badge variant="outline" className="border-flame-200 bg-flame-50 text-flame-700">You</Badge>}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleTone(u.role)}`}>
                      {getRoleLabel(u.role)}
                    </span>
                    {agent && (
                      <div className="mt-1">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${AGENT_VERIFICATION_CONFIG[u.agent_verification_status]?.tone || 'bg-slate-100 text-slate-500'}`}>
                          Agent: {AGENT_VERIFICATION_CONFIG[u.agent_verification_status]?.label || u.agent_verification_status}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.tone}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">{formatDate(u.created_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {u.account_status !== 'active' && (
                        <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-emerald-700 hover:bg-emerald-50" onClick={() => onAction('approve', u)}>
                          <CheckCircle2 className="h-4 w-4" /> Approve
                        </Button>
                      )}
                      {u.account_status === 'pending_verification' && (
                        <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-blue-700 hover:bg-blue-50" onClick={() => onAction('verify', u)}>
                          <Mail className="h-4 w-4" /> Verify
                        </Button>
                      )}
                      {u.account_status === 'active' && !isYou && (
                        <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-red-700 hover:bg-red-50" onClick={() => onAction('suspend', u)}>
                          <Ban className="h-4 w-4" /> Suspend
                        </Button>
                      )}
                      {u.account_status !== 'rejected' && !isYou && u.account_status !== 'active' && (
                        <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-rose-700 hover:bg-rose-50" onClick={() => onAction('reject', u)}>
                          <XCircle className="h-4 w-4" /> Reject
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => onOpen(u)}>
                        <Eye className="h-4 w-4" /> Review
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}