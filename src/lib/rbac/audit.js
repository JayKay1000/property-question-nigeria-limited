/**
 * Audit Logging Utility
 *
 * Records security-sensitive events to the AuditLog entity.
 * Every role change, permission change, approval decision, and
 * administrative action should pass through here.
 */
import { base44 } from '@/api/base44Client';

/**
 * Log a single audit event. Safe to call from anywhere — errors are
 * swallowed so logging never breaks the calling flow.
 */
export async function logAuditEvent({
  action,
  category = 'system',
  resource,
  resource_id,
  resource_name,
  outcome = 'success',
  details,
  metadata,
}) {
  try {
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      /* not authenticated */
    }

    await base44.entities.AuditLog.create({
      user_id: user?.id || 'anonymous',
      user_name: user?.full_name || user?.display_name || 'Anonymous',
      user_email: user?.email || '',
      user_role: user?.role || 'guest',
      action,
      category,
      resource,
      resource_id,
      resource_name,
      outcome,
      details,
      metadata,
      device_info: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Convenience helpers for common audit events.
 */
export const audit = {
  login: (outcome = 'success') =>
    logAuditEvent({ action: 'login', category: 'auth', outcome }),

  logout: () =>
    logAuditEvent({ action: 'logout', category: 'auth' }),

  failedLogin: (email) =>
    logAuditEvent({
      action: 'failed_login',
      category: 'auth',
      outcome: 'failure',
      details: `Failed login attempt for ${email}`,
    }),

  roleAssign: (userId, role) =>
    logAuditEvent({
      action: 'role_assign',
      category: 'role_management',
      resource: 'user',
      resource_id: userId,
      details: `Assigned role: ${role}`,
    }),

  roleChange: (userId, oldRole, newRole) =>
    logAuditEvent({
      action: 'role_change',
      category: 'role_management',
      resource: 'user',
      resource_id: userId,
      details: `Role changed from ${oldRole} to ${newRole}`,
    }),

  roleRemove: (userId, role) =>
    logAuditEvent({
      action: 'role_remove',
      category: 'role_management',
      resource: 'user',
      resource_id: userId,
      details: `Removed role: ${role}`,
    }),

  permissionChange: (details) =>
    logAuditEvent({ action: 'permission_change', category: 'security', details }),

  accountSuspend: (userId) =>
    logAuditEvent({
      action: 'account_suspend',
      category: 'user_management',
      resource: 'user',
      resource_id: userId,
      details: 'Account suspended',
    }),

  accountActivate: (userId) =>
    logAuditEvent({
      action: 'account_activate',
      category: 'user_management',
      resource: 'user',
      resource_id: userId,
      details: 'Account activated',
    }),

  approval: (resource, resourceId, decision, comments) =>
    logAuditEvent({
      action: `approval_${decision}`,
      category: 'approval',
      resource,
      resource_id: resourceId,
      details: comments || `Approval decision: ${decision}`,
    }),

  denied: (action, resource) =>
    logAuditEvent({
      action: `denied_${action}`,
      category: 'security',
      resource,
      outcome: 'denied',
      details: `Access denied: ${action} on ${resource}`,
    }),

  documentVerify: (documentId, outcome) =>
    logAuditEvent({
      action: 'document_verification',
      category: 'document',
      resource: 'document',
      resource_id: documentId,
      outcome,
      details: `Document verification ${outcome}`,
    }),

  featureFlag: (key, enabled) =>
    logAuditEvent({
      action: 'feature_flag_change',
      category: 'system',
      resource: 'feature_flag',
      resource_id: key,
      details: `Feature flag ${key} ${enabled ? 'enabled' : 'disabled'}`,
    }),

  adminAction: (action, details) =>
    logAuditEvent({ action, category: 'system', details }),
};