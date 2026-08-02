/**
 * PermissionGuard — Conditionally render children based on permissions.
 *
 * Usage:
 *   <PermissionGuard permission="properties.create">
 *     <CreateButton />
 *   </PermissionGuard>
 *
 *   <PermissionGuard permissions={['crm.view', 'crm.create']} requireAll>
 *     <CRMPanel />
 *   </PermissionGuard>
 *
 *   <PermissionGuard permission="settings.edit" fallback={<ReadOnlyNotice />}>
 *     <SettingsForm />
 *   </PermissionGuard>
 */
import { useRBAC } from './useRBAC';

export default function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
}) {
  const rbac = useRBAC();

  let allowed = true;
  if (permission) {
    allowed = rbac.hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    allowed = requireAll
      ? rbac.hasAllPermissions(permissions)
      : rbac.hasAnyPermission(permissions);
  }

  if (!allowed) return fallback;
  return children;
}