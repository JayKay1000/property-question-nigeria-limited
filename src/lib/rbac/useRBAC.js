/**
 * useRBAC — Primary authorization hook
 *
 * Reads the current authenticated user from AuthContext, resolves their
 * role(s), computes the effective permission set, and exposes check
 * functions. All client-side authorization flows through this hook.
 */
import { useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ROLE_DEFINITIONS, resolveRole, getRoleLevel } from './roles';
import { WILDCARD_PERMISSION } from './permissions';

export function useRBAC() {
  const { user } = useAuth();

  return useMemo(() => {
    // ── Not authenticated → Guest ─────────────────────────────────────────
    if (!user) {
      return {
        user: null,
        role: 'guest',
        roles: ['guest'],
        permissions: [],
        level: 0,
        hasPermission: () => false,
        hasAnyPermission: () => false,
        hasAllPermissions: () => false,
        hasRole: () => false,
        hasAnyRole: () => false,
        isAtLeastLevel: () => false,
        isSuperAdmin: false,
        isAdmin: false,
        isStaff: false,
      };
    }

    // ── Resolve roles ───────────────────────────────────────────────────
    const primaryRole = resolveRole(user.role);
    const additionalRoles = (user.additional_roles || []).map(resolveRole);
    const allRoles = [primaryRole, ...additionalRoles.filter(r => r !== primaryRole)];

    // ── Compute permissions ──────────────────────────────────────────────
    let permissions = new Set();
    let isSuperAdmin = false;

    for (const roleKey of allRoles) {
      const def = ROLE_DEFINITIONS[roleKey];
      if (!def) continue;
      if (def.permissions.includes(WILDCARD_PERMISSION)) {
        isSuperAdmin = true;
        permissions = new Set([WILDCARD_PERMISSION]);
        break;
      }
      def.permissions.forEach((p) => permissions.add(p));
    }

    // ── Merge custom permissions from the user record ───────────────────
    if (user.custom_permissions && !isSuperAdmin) {
      user.custom_permissions.forEach((p) => {
        if (p === WILDCARD_PERMISSION) {
          isSuperAdmin = true;
          permissions = new Set([WILDCARD_PERMISSION]);
        } else {
          permissions.add(p);
        }
      });
    }

    const hasWildcard = permissions.has(WILDCARD_PERMISSION);

    // ── Check functions ──────────────────────────────────────────────────
    const hasPermission = (perm) => {
      if (!perm) return true;
      if (hasWildcard) return true;
      return permissions.has(perm);
    };

    const hasAnyPermission = (perms) => {
      if (!perms || perms.length === 0) return true;
      return perms.some(hasPermission);
    };

    const hasAllPermissions = (perms) => {
      if (!perms || perms.length === 0) return true;
      return perms.every(hasPermission);
    };

    const hasRole = (role) => allRoles.includes(resolveRole(role));
    const hasAnyRole = (roles) => roles.some((r) => allRoles.includes(resolveRole(r)));

    const maxLevel = Math.max(...allRoles.map((r) => getRoleLevel(r)));
    const isAtLeastLevel = (level) => maxLevel >= level;

    // ── Convenience flags ────────────────────────────────────────────────
    const isAdmin = isAtLeastLevel(4);   // administrator or super_admin
    const isStaff = isAtLeastLevel(2);   // any staff role or above
    const isAgent = allRoles.includes('verified_agent') || allRoles.includes('prospective_agent');

    return {
      user,
      role: primaryRole,
      roles: allRoles,
      permissions: Array.from(permissions),
      level: maxLevel,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      hasRole,
      hasAnyRole,
      isAtLeastLevel,
      isSuperAdmin,
      isAdmin,
      isStaff,
      isAgent,
    };
  }, [user]);
}