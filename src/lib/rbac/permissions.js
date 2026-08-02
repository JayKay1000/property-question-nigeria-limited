/**
 * RBAC Permission Definitions
 * Property Question Nigeria Limited — Enterprise PropTech Platform
 *
 * All permissions follow the `resource.action` convention.
 * No permissions are hard-coded into pages; all authorization
 * decisions are driven by these definitions and role mappings.
 */

// ─── Resources ───────────────────────────────────────────────────────────────
export const RESOURCES = [
  'users', 'roles', 'properties', 'projects', 'buy2flip', 'construction',
  'property_mgmt', 'crm', 'media', 'blog', 'marketing', 'reports',
  'analytics', 'settings', 'security', 'notifications', 'documents',
  'maps', 'estate', 'tours', 'support', 'agents', 'inspections',
  'commissions', 'quotations', 'maintenance', 'careers', 'applications',
];

// ─── Standard Actions ────────────────────────────────────────────────────────
export const ACTIONS = [
  'view', 'create', 'edit', 'delete', 'approve', 'reject', 'publish',
  'archive', 'restore', 'export', 'import', 'assign', 'reassign',
  'verify', 'suspend', 'activate', 'deactivate', 'download', 'upload',
  'share', 'save', 'submit', 'join', 'respond', 'escalate', 'schedule',
  'market', 'communicate', 'send',
];

// ─── Permission Groups (fine-grained) ─────────────────────────────────────────
export const PERMISSION_GROUPS = {
  'User Management': [
    'users.view', 'users.create', 'users.edit', 'users.delete',
    'users.assign', 'users.suspend', 'users.activate', 'users.deactivate',
  ],
  'Role Management': [
    'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
  ],
  'Property Management': [
    'properties.view', 'properties.create', 'properties.edit', 'properties.delete',
    'properties.publish', 'properties.archive', 'properties.restore',
    'properties.export', 'properties.save', 'properties.submit', 'properties.market',
  ],
  'Project Management': [
    'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
    'projects.publish', 'projects.archive', 'projects.restore',
  ],
  'Buy2Flip': [
    'buy2flip.view', 'buy2flip.create', 'buy2flip.edit', 'buy2flip.delete',
    'buy2flip.publish', 'buy2flip.approve', 'buy2flip.reject', 'buy2flip.join',
  ],
  'Construction': [
    'construction.view', 'construction.create', 'construction.edit',
    'construction.publish', 'construction.upload',
  ],
  'Property Management Services': [
    'property_mgmt.view', 'property_mgmt.create', 'property_mgmt.edit',
    'property_mgmt.publish', 'property_mgmt.assign',
    'maintenance.view', 'maintenance.create', 'maintenance.edit',
  ],
  'CRM': [
    'crm.view', 'crm.create', 'crm.edit', 'crm.delete',
    'crm.assign', 'crm.reassign', 'crm.export', 'crm.communicate',
  ],
  'Inspections': [
    'inspections.view', 'inspections.create', 'inspections.schedule',
  ],
  'Media': [
    'media.view', 'media.upload', 'media.edit', 'media.delete', 'media.share',
  ],
  'Blog': [
    'blog.view', 'blog.create', 'blog.edit', 'blog.delete',
    'blog.publish', 'blog.archive',
  ],
  'Marketing': [
    'marketing.view', 'marketing.create', 'marketing.edit',
    'marketing.publish', 'marketing.schedule',
  ],
  'Reports': [
    'reports.view', 'reports.export', 'reports.create',
  ],
  'Analytics': [
    'analytics.view', 'analytics.export',
  ],
  'Settings': [
    'settings.view', 'settings.edit',
  ],
  'Security': [
    'security.view', 'security.edit', 'security.audit_logs',
    'security.feature_flags', 'security.maintenance_mode',
    'security.soc', 'security.export', 'security.governance',
  ],
  'Notifications': [
    'notifications.view', 'notifications.create', 'notifications.send',
  ],
  'Documents': [
    'documents.view', 'documents.upload', 'documents.download',
    'documents.approve', 'documents.reject', 'documents.verify',
  ],
  'Maps & Estate Layouts': [
    'maps.view', 'maps.edit',
    'estate.view', 'estate.create', 'estate.edit', 'estate.publish',
  ],
  'Property Tours': [
    'tours.view', 'tours.create', 'tours.edit', 'tours.publish',
  ],
  'Support': [
    'support.view', 'support.respond', 'support.escalate', 'support.assign',
  ],
  'Agent Management': [
    'agents.view', 'agents.verify', 'agents.suspend', 'agents.activate',
    'agents.deactivate', 'agents.assign', 'agents.share',
    'applications.view', 'applications.edit',
    'commissions.view',
  ],
  'Careers & HR': [
    'careers.view', 'careers.create', 'careers.edit', 'careers.publish',
  ],
  'Sales': [
    'quotations.create', 'quotations.view',
  ],
};

// ─── Derived helpers ─────────────────────────────────────────────────────────
export const ALL_PERMISSIONS = Object.values(PERMISSION_GROUPS).flat();

export const WILDCARD_PERMISSION = '*';

/** Parse a permission string into { resource, action } */
export function parsePermission(permission) {
  const [resource, action] = permission.split('.');
  return { resource, action };
}

/** Check if a permission string is valid */
export function isValidPermission(permission) {
  if (permission === WILDCARD_PERMISSION) return true;
  return ALL_PERMISSIONS.includes(permission);
}

/** Get all permissions for a given resource */
export function getPermissionsForResource(resource) {
  return ALL_PERMISSIONS.filter((p) => p.startsWith(`${resource}.`));
}

/** Get all permissions in a given group */
export function getPermissionsForGroup(groupName) {
  return PERMISSION_GROUPS[groupName] || [];
}