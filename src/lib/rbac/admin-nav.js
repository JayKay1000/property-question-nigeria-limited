/**
 * Admin Portal Navigation
 *
 * Each item declares the permission required to see it.
 * The sidebar filters these via useFilteredNav so only authorized
 * items appear for the current user.
 */
export const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: 'LayoutDashboard', permission: null },
  { label: 'SOC Dashboard', href: '/admin/soc', icon: 'ShieldAlert', permission: 'security.view' },
  { label: 'Identity Center', href: '/admin/identity', icon: 'IdCard', permission: 'security.view' },
  { label: 'DB Governance', href: '/admin/database', icon: 'Database', permission: 'security.view' },
  { label: 'Property Center', href: '/admin/property-center', icon: 'Building2', permission: 'properties.view' },
  { label: 'RBAC Overview', href: '/admin/rbac', icon: 'Shield', permission: 'security.view' },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: 'ScrollText', permission: 'security.audit_logs' },
  { label: 'Feature Flags', href: '/admin/feature-flags', icon: 'Flag', permission: 'security.feature_flags' },
  { label: 'Users', href: '/admin/users', icon: 'Users', permission: 'users.view' },
  { label: 'Properties', href: '/admin/properties', icon: 'Building2', permission: 'properties.view' },
  { label: 'Projects', href: '/admin/projects', icon: 'HardHat', permission: 'projects.view' },
  { label: 'Buy2Flip', href: '/admin/buy2flip', icon: 'TrendingUp', permission: 'buy2flip.view' },
  { label: 'CRM', href: '/admin/crm', icon: 'Contact', permission: 'crm.view' },
  { label: 'Media', href: '/admin/media', icon: 'Image', permission: 'media.view' },
  { label: 'Blog', href: '/admin/blog', icon: 'FileText', permission: 'blog.view' },
  { label: 'Reports', href: '/admin/reports', icon: 'BarChart3', permission: 'reports.view' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings', permission: 'settings.view' },
];