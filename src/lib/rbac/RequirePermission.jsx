/**
 * RequirePermission — Route-level guard.
 *
 * Renders <AccessDenied> when the current user lacks the required
 * permission(s). Use inside <Route> elements to protect entire pages.
 *
 *   <Route path="/admin/rbac" element={
 *     <RequirePermission permission="security.view">
 *       <RBACDashboard />
 *     </RequirePermission>
 *   } />
 */
import AccessDenied from '@/pages/AccessDenied';
import { useRBAC } from './useRBAC';

export default function RequirePermission({
  permission,
  permissions,
  requireAll = false,
  children,
}) {
  const rbac = useRBAC();

  let allowed = true;
  let required = '';
  if (permission) {
    allowed = rbac.hasPermission(permission);
    required = permission;
  } else if (permissions && permissions.length > 0) {
    allowed = requireAll
      ? rbac.hasAllPermissions(permissions)
      : rbac.hasAnyPermission(permissions);
    required = permissions.join(', ');
  }

  if (!allowed) {
    return <AccessDenied requiredPermission={required} />;
  }

  return children;
}