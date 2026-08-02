/**
 * Entity Registry — Database Governance Metadata
 *
 * Central catalog of all platform entities grouped by business domain,
 * with governance metadata for the Database Governance Center.
 *
 * Built-in lifecycle fields on every entity (managed by platform):
 *   id, created_date, updated_date, created_by_id
 */

export const entityDomains = [
  { name: 'Identity & Authentication', icon: 'Users', entities: ['User'] },
  { name: 'Security & Audit', icon: 'Shield', entities: ['AuditLog', 'SecurityEvent', 'FeatureFlag', 'ConsentRecord', 'DataPrivacyRequest', 'UserSession'] },
  { name: 'Properties', icon: 'Building2', entities: ['Property'] },
  { name: 'Projects', icon: 'HardHat', entities: ['Project', 'ConstructionProject'] },
  { name: 'Agents', icon: 'UserCog', entities: ['Agent'] },
  { name: 'Customers', icon: 'Users', entities: ['Customer'] },
  { name: 'CRM', icon: 'Contact', entities: ['Lead'] },
  { name: 'Documents', icon: 'FileText', entities: ['Document'] },
  { name: 'Notifications', icon: 'Bell', entities: ['Notification'] },
  { name: 'Lookup Data', icon: 'List', entities: ['LookupPropertyType', 'LookupState', 'LookupDocumentType'] },
];

export const entityMetadata = {
  User: {
    description: 'Built-in user entity for authentication, identity, and profile management. Users join via invites.',
    sensitivity: 'confidential',
    owner: 'Self (User)',
    softDelete: false,
    rls: 'Users can read/update own profile. Admins can list/manage all users.',
  },
  AuditLog: {
    description: 'Tamper-resistant record of all significant security and administrative actions across the platform.',
    sensitivity: 'internal',
    owner: 'System',
    softDelete: false,
    rls: 'Admins and security officers have read access. Records are append-only.',
  },
  SecurityEvent: {
    description: 'Security incident and event monitoring — failed logins, suspicious activity, role changes, and more.',
    sensitivity: 'confidential',
    owner: 'System',
    softDelete: false,
    rls: 'Security officers and admins have read access.',
  },
  FeatureFlag: {
    description: 'Platform feature toggle configuration controlling module availability across the platform.',
    sensitivity: 'internal',
    owner: 'System Admin',
    softDelete: false,
    rls: 'Admins have full CRUD. Public flags are readable by all authenticated users.',
  },
  ConsentRecord: {
    description: 'User consent records for marketing, data processing, cookies, and policy acceptance.',
    sensitivity: 'confidential',
    owner: 'Self (User)',
    softDelete: false,
    rls: 'Users can read own consent records. Admins can read all.',
  },
  DataPrivacyRequest: {
    description: 'Data subject access, correction, deletion, portability, and objection requests.',
    sensitivity: 'restricted',
    owner: 'Requesting User',
    softDelete: true,
    rls: 'Users can create and read own requests. Admins manage all requests.',
  },
  UserSession: {
    description: 'Active user session tracking — device, IP, login method, and activity timestamps.',
    sensitivity: 'restricted',
    owner: 'Self (User)',
    softDelete: false,
    rls: 'Users can read and revoke own sessions. Admins can view all sessions.',
  },
  Property: {
    description: 'Central property listing entity — the core business record for all property listings across the platform.',
    sensitivity: 'internal',
    owner: 'Listing Agent',
    softDelete: true,
    rls: 'Public can read published listings. Agents manage own listings. Admins manage all.',
  },
  Project: {
    description: 'Estate development and construction project entity with units, budget, timeline, and manager tracking.',
    sensitivity: 'internal',
    owner: 'Project Manager',
    softDelete: true,
    rls: 'Public can read published projects. Staff manage assigned projects. Admins manage all.',
  },
  ConstructionProject: {
    description: 'Construction tracking entity with milestones, progress, supervisor, and contractor information.',
    sensitivity: 'internal',
    owner: 'Construction Supervisor',
    softDelete: true,
    rls: 'Staff and supervisors manage assigned projects. Admins manage all.',
  },
  Agent: {
    description: 'Agent profile entity with verification, licensing, performance metrics, and commission tracking.',
    sensitivity: 'confidential',
    owner: 'Self (Agent)',
    softDelete: true,
    rls: 'Public can read active agent profiles. Agents manage own profile. Admins manage all.',
  },
  Customer: {
    description: 'Customer profile entity with preferences, budget, purchase history, and assigned agent.',
    sensitivity: 'confidential',
    owner: 'Self (Customer)',
    softDelete: true,
    rls: 'Customers manage own profile. Assigned agents can read. Admins manage all.',
  },
  Lead: {
    description: 'CRM lead entity tracking prospects from inquiry through conversion with source and assignment.',
    sensitivity: 'confidential',
    owner: 'Assigned Agent',
    softDelete: true,
    rls: 'Assigned agents manage own leads. Admins manage all.',
  },
  Document: {
    description: 'Document management entity with verification, versioning, visibility controls, and access restrictions.',
    sensitivity: 'restricted',
    owner: 'Uploader',
    softDelete: true,
    rls: 'Access controlled by visibility field. Restricted documents require admin or owner access.',
  },
  Notification: {
    description: 'Centralized notification entity supporting in-app, email, SMS, push, and system alerts.',
    sensitivity: 'confidential',
    owner: 'Recipient',
    softDelete: false,
    rls: 'Users can read own notifications. Admins can send system-wide notifications.',
  },
  LookupPropertyType: {
    description: 'Lookup table for property types — house, apartment, land, commercial, etc.',
    sensitivity: 'public',
    owner: 'System Admin',
    softDelete: false,
    rls: 'Publicly readable. Admin-managed.',
  },
  LookupState: {
    description: 'Lookup table for Nigerian states and FCT with regional grouping.',
    sensitivity: 'public',
    owner: 'System Admin',
    softDelete: false,
    rls: 'Publicly readable. Admin-managed.',
  },
  LookupDocumentType: {
    description: 'Lookup table for document types with sensitivity classification and verification requirements.',
    sensitivity: 'public',
    owner: 'System Admin',
    softDelete: false,
    rls: 'Publicly readable. Admin-managed.',
  },
};

export const totalEntityCount = entityDomains.reduce((sum, d) => sum + d.entities.length, 0);