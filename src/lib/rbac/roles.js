/**
 * RBAC Role Definitions
 * Property Question Nigeria Limited — Enterprise PropTech Platform
 *
 * 16 default roles with fine-grained permission mappings.
 * Super Administrator uses a wildcard ('*') for unrestricted access.
 */

// ─── Role Definitions ────────────────────────────────────────────────────────
export const ROLE_DEFINITIONS = {
  guest: {
    key: 'guest',
    label: 'Guest',
    description: 'Unauthenticated visitor with public access only.',
    level: 0,
    permissions: [],
  },

  customer: {
    key: 'customer',
    label: 'Customer',
    description: 'Registered customer — saved properties, inspections, Buy2Flip participation, and property submissions.',
    level: 1,
    permissions: [
      'properties.view', 'properties.save', 'properties.submit',
      'projects.view', 'buy2flip.view', 'buy2flip.join',
      'blog.view', 'notifications.view',
      'documents.download', 'inspections.create',
    ],
  },

  prospective_agent: {
    key: 'prospective_agent',
    label: 'Prospective Agent',
    description: 'Agent applicant pending verification — can complete profile, upload documents, and edit application.',
    level: 1,
    permissions: [
      'agents.view', 'documents.upload', 'applications.view', 'applications.edit',
      'notifications.view',
    ],
  },

  verified_agent: {
    key: 'verified_agent',
    label: 'Verified Agent',
    description: 'Approved agent with marketing tools, lead access, commission tracking, and performance analytics.',
    level: 2,
    permissions: [
      'properties.view', 'properties.market',
      'agents.view', 'agents.share',
      'crm.view', 'documents.download',
      'commissions.view', 'inspections.schedule',
      'analytics.view', 'notifications.view',
    ],
  },

  sales_executive: {
    key: 'sales_executive',
    label: 'Sales Executive',
    description: 'Manages assigned customers, creates inspection appointments, and uploads assigned property listings.',
    level: 2,
    permissions: [
      'crm.view', 'crm.create', 'crm.edit', 'crm.communicate',
      'inspections.create', 'inspections.schedule',
      'properties.create', 'properties.edit',
      'quotations.create', 'quotations.view',
      'analytics.view', 'notifications.view',
    ],
  },

  construction_officer: {
    key: 'construction_officer',
    label: 'Construction Officer',
    description: 'Updates project progress, uploads construction photos, and manages construction milestones.',
    level: 2,
    permissions: [
      'construction.view', 'construction.create', 'construction.edit',
      'construction.publish', 'construction.upload',
      'projects.view', 'notifications.view',
    ],
  },

  property_manager: {
    key: 'property_manager',
    label: 'Property Manager',
    description: 'Manages rental properties, maintenance requests, tenants, and occupancy.',
    level: 2,
    permissions: [
      'property_mgmt.view', 'property_mgmt.create', 'property_mgmt.edit',
      'property_mgmt.publish', 'property_mgmt.assign',
      'maintenance.view', 'maintenance.create', 'maintenance.edit',
      'notifications.view',
    ],
  },

  buy2flip_manager: {
    key: 'buy2flip_manager',
    label: 'Buy2Flip Manager',
    description: 'Manages Buy2Flip plans, reviews participant applications, and publishes product updates.',
    level: 2,
    permissions: [
      'buy2flip.view', 'buy2flip.create', 'buy2flip.edit',
      'buy2flip.publish', 'buy2flip.approve', 'buy2flip.reject',
      'documents.upload', 'notifications.view',
    ],
  },

  customer_service: {
    key: 'customer_service',
    label: 'Customer Service Officer',
    description: 'Responds to enquiries, manages support tickets, views customer history, and escalates issues.',
    level: 2,
    permissions: [
      'support.view', 'support.respond', 'support.escalate', 'support.assign',
      'crm.view', 'notifications.view',
    ],
  },

  legal_officer: {
    key: 'legal_officer',
    label: 'Legal Officer',
    description: 'Reviews legal documents, approves/rejects legal submissions, and manages Power of Attorney workflows.',
    level: 2,
    permissions: [
      'documents.view', 'documents.approve', 'documents.reject', 'documents.verify',
      'notifications.view',
    ],
  },

  finance_officer: {
    key: 'finance_officer',
    label: 'Finance Officer',
    description: 'Views financial transactions, generates financial reports, and monitors Buy2Flip payment records.',
    level: 2,
    permissions: [
      'reports.view', 'reports.export', 'reports.create',
      'buy2flip.view', 'notifications.view',
    ],
  },

  marketing_officer: {
    key: 'marketing_officer',
    label: 'Marketing Officer',
    description: 'Publishes blogs, manages banners and newsletters, and creates promotional campaigns.',
    level: 2,
    permissions: [
      'blog.view', 'blog.create', 'blog.edit', 'blog.publish',
      'marketing.view', 'marketing.create', 'marketing.edit',
      'marketing.publish', 'marketing.schedule',
      'media.view', 'media.upload', 'media.edit',
      'notifications.view',
    ],
  },

  hr_officer: {
    key: 'hr_officer',
    label: 'HR Officer',
    description: 'Manages staff records, publishes career opportunities, and reviews employment applications.',
    level: 2,
    permissions: [
      'users.view', 'careers.view', 'careers.create', 'careers.edit', 'careers.publish',
      'applications.view', 'notifications.view',
    ],
  },

  department_manager: {
    key: 'department_manager',
    label: 'Department Manager',
    description: 'Supervises staff within their department, approves departmental workflows, reviews reports, and assigns work.',
    level: 3,
    permissions: [
      'users.view', 'reports.view', 'analytics.view',
      'support.view', 'support.assign',
      'notifications.view',
    ],
  },

  administrator: {
    key: 'administrator',
    label: 'Administrator',
    description: 'Broad administrative access across properties, projects, Buy2Flip, media, customers, agents, reports, and content.',
    level: 4,
    permissions: [
      'properties.view', 'properties.create', 'properties.edit', 'properties.delete',
      'properties.publish', 'properties.archive', 'properties.restore', 'properties.export',
      'projects.view', 'projects.create', 'projects.edit', 'projects.delete',
      'projects.publish', 'projects.archive', 'projects.restore',
      'buy2flip.view', 'buy2flip.create', 'buy2flip.edit', 'buy2flip.publish',
      'construction.view', 'construction.create', 'construction.edit', 'construction.publish',
      'property_mgmt.view', 'property_mgmt.create', 'property_mgmt.edit', 'property_mgmt.publish',
      'maintenance.view', 'maintenance.create', 'maintenance.edit',
      'crm.view', 'crm.create', 'crm.edit', 'crm.delete', 'crm.assign', 'crm.export',
      'media.view', 'media.upload', 'media.edit', 'media.delete',
      'blog.view', 'blog.create', 'blog.edit', 'blog.delete', 'blog.publish', 'blog.archive',
      'marketing.view', 'marketing.create', 'marketing.edit', 'marketing.publish',
      'reports.view', 'reports.export', 'reports.create',
      'analytics.view', 'settings.view', 'settings.edit',
      'notifications.view', 'notifications.create', 'notifications.send',
      'documents.view', 'documents.upload', 'documents.download',
      'maps.view', 'estate.view', 'estate.create', 'estate.edit', 'estate.publish',
      'tours.view', 'tours.create', 'tours.edit', 'tours.publish',
      'support.view', 'support.respond', 'support.assign',
      'agents.view', 'agents.verify', 'agents.suspend', 'agents.activate',
      'agents.deactivate', 'agents.assign', 'applications.view', 'commissions.view',
      'users.view', 'users.create', 'users.edit', 'users.assign',
      'users.suspend', 'users.activate',
      'careers.view', 'careers.create', 'careers.edit', 'careers.publish',
      'quotations.view', 'quotations.create',
      'inspections.view', 'inspections.create', 'inspections.schedule',
    ],
  },

  super_admin: {
    key: 'super_admin',
    label: 'Super Administrator',
    description: 'Unrestricted access to all modules, settings, security, audit logs, and role management.',
    level: 5,
    permissions: ['*'],
  },
};

// ─── Legacy role mapping (backwards compatibility) ────────────────────────────
export const LEGACY_ROLE_MAP = {
  admin: 'administrator',
  user: 'customer',
  agent: 'verified_agent',
  staff: 'administrator',
  super_admin: 'super_admin',
};

// ─── Exports ──────────────────────────────────────────────────────────────────
export const ALL_ROLES = Object.keys(ROLE_DEFINITIONS);

export const ROLE_LEVELS = {
  guest: 0, customer: 1, prospective_agent: 1, verified_agent: 2,
  sales_executive: 2, construction_officer: 2, property_manager: 2,
  buy2flip_manager: 2, customer_service: 2, legal_officer: 2,
  finance_officer: 2, marketing_officer: 2, hr_officer: 2,
  department_manager: 3, administrator: 4, super_admin: 5,
};

export function getRoleDefinition(roleKey) {
  return ROLE_DEFINITIONS[roleKey] || ROLE_DEFINITIONS.customer;
}

export function resolveRole(role) {
  if (ROLE_DEFINITIONS[role]) return role;
  return LEGACY_ROLE_MAP[role] || 'customer';
}

export function getRoleLevel(roleKey) {
  return ROLE_LEVELS[resolveRole(roleKey)] ?? 0;
}

export function isRoleAtLeast(roleKey, minLevel) {
  return getRoleLevel(roleKey) >= minLevel;
}