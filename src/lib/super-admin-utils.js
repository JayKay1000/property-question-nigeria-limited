/**
 * Super Admin Dashboard helpers
 * Signup verification & approval status config + formatting.
 */
import { ROLE_DEFINITIONS, resolveRole } from '@/lib/rbac/roles';

export const ACCOUNT_STATUS_CONFIG = {
  pending_verification: { label: 'Pending Verification', tone: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  email_verified: { label: 'Email Verified', tone: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  phone_verified: { label: 'Phone Verified', tone: 'bg-cyan-100 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' },
  pending_approval: { label: 'Pending Approval', tone: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  active: { label: 'Active', tone: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  suspended: { label: 'Suspended', tone: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  rejected: { label: 'Rejected', tone: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  disabled: { label: 'Disabled', tone: 'bg-slate-200 text-slate-600 border-slate-300', dot: 'bg-slate-500' },
};

export const AGENT_VERIFICATION_CONFIG = {
  not_applicable: { label: 'N/A', tone: 'bg-slate-100 text-slate-500' },
  pending: { label: 'Pending', tone: 'bg-amber-100 text-amber-700' },
  under_review: { label: 'Under Review', tone: 'bg-blue-100 text-blue-700' },
  approved: { label: 'Approved', tone: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', tone: 'bg-rose-100 text-rose-700' },
  returned: { label: 'Returned', tone: 'bg-orange-100 text-orange-700' },
  suspended: { label: 'Suspended', tone: 'bg-red-100 text-red-700' },
};

export const ROLE_TONE = {
  super_admin: 'bg-flame-100 text-flame-700 border-flame-200',
  administrator: 'bg-brand-100 text-brand-700 border-brand-200',
  admin: 'bg-brand-100 text-brand-700 border-brand-200',
  verified_agent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  prospective_agent: 'bg-amber-100 text-amber-700 border-amber-200',
  customer: 'bg-slate-100 text-slate-600 border-slate-200',
  user: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function getStatusConfig(status) {
  return ACCOUNT_STATUS_CONFIG[status] || { label: status || 'Unknown', tone: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' };
}

export function getRoleLabel(roleKey) {
  const resolved = resolveRole(roleKey);
  return ROLE_DEFINITIONS[resolved]?.label || roleKey || 'Unknown';
}

export function getRoleTone(roleKey) {
  const resolved = resolveRole(roleKey);
  return ROLE_TONE[resolved] || ROLE_TONE[roleKey] || 'bg-slate-100 text-slate-600 border-slate-200';
}

export function isAgentApplicant(user) {
  const r = resolveRole(user?.role);
  return r === 'prospective_agent' || r === 'verified_agent' || user?.agent_verification_status === 'pending' || user?.agent_verification_status === 'under_review';
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-NG', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function fullName(user) {
  if (!user) return 'Unknown';
  return user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.display_name || user.email?.split('@')[0] || 'Unnamed';
}