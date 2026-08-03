// Shared utilities for platform operations modules (5.6, 5.8, 5.14)

export const httpMethodConfig = {
  GET: { className: 'bg-ice-50 text-ice-700 border-0' },
  POST: { className: 'bg-success/10 text-success border-0' },
  PUT: { className: 'bg-warning/15 text-warning border-0' },
  PATCH: { className: 'bg-flame-50 text-flame-700 border-0' },
  DELETE: { className: 'bg-error/10 text-error border-0' },
  HEAD: { className: 'bg-muted text-muted-foreground border-0' },
  OPTIONS: { className: 'bg-muted text-muted-foreground border-0' },
};

export const endpointCategoryLabels = {
  crm: 'CRM', property: 'Property', project: 'Project', media: 'Media',
  finance: 'Finance', notification: 'Notifications', auth: 'Auth',
  integration: 'Integration', webhook: 'Webhook', general: 'General',
};

export const authTypeLabels = {
  public: 'Public', api_key: 'API Key', oauth: 'OAuth', jwt: 'JWT', webhook: 'Webhook',
  basic: 'Basic', none: 'None',
};

export const endpointStatusConfig = {
  active: { label: 'Active', className: 'bg-success/10 text-success border-0' },
  deprecated: { label: 'Deprecated', className: 'bg-muted text-muted-foreground border-0' },
  maintenance: { label: 'Maintenance', className: 'bg-warning/15 text-warning border-0' },
  disabled: { label: 'Disabled', className: 'bg-error/10 text-error border-0' },
};

export const integrationStatusConfig = {
  connected: { label: 'Connected', className: 'bg-success/10 text-success border-0' },
  disabled: { label: 'Disabled', className: 'bg-muted text-muted-foreground border-0' },
  error: { label: 'Error', className: 'bg-error/10 text-error border-0' },
  pending: { label: 'Pending', className: 'bg-warning/15 text-warning border-0' },
  expired: { label: 'Expired', className: 'bg-error/10 text-error border-0' },
};

export const integrationHealthConfig = {
  healthy: { label: 'Healthy', className: 'bg-success/10 text-success border-0', dot: 'bg-success' },
  degraded: { label: 'Degraded', className: 'bg-warning/15 text-warning border-0', dot: 'bg-warning' },
  down: { label: 'Down', className: 'bg-error/10 text-error border-0', dot: 'bg-error' },
  unknown: { label: 'Unknown', className: 'bg-muted text-muted-foreground border-0', dot: 'bg-muted-foreground' },
};

export const integrationCategoryLabels = {
  payments: 'Payments', email: 'Email', sms: 'SMS', storage: 'Storage', maps: 'Maps',
  analytics: 'Analytics', crm: 'CRM', marketing: 'Marketing', ai: 'AI', auth: 'Auth',
  social: 'Social', productivity: 'Productivity', general: 'General',
};

export const environmentLabels = {
  production: 'Production', staging: 'Staging', sandbox: 'Sandbox', development: 'Development',
};

export const bookingStatusConfig = {
  pending: { label: 'Pending', className: 'bg-warning/15 text-warning border-0' },
  confirmed: { label: 'Confirmed', className: 'bg-success/10 text-success border-0' },
  cancelled: { label: 'Cancelled', className: 'bg-error/10 text-error border-0' },
  completed: { label: 'Completed', className: 'bg-ice-50 text-ice-700 border-0' },
  no_show: { label: 'No-Show', className: 'bg-muted text-muted-foreground border-0' },
  rescheduled: { label: 'Rescheduled', className: 'bg-flame-50 text-flame-700 border-0' },
};

export const bookingTypeLabels = {
  tour: 'Tour', inspection: 'Inspection', consultation: 'Consultation',
  viewing: 'Viewing', meeting: 'Meeting', valuation: 'Valuation',
};

export const slotStatusConfig = {
  available: { label: 'Available', className: 'bg-success/10 text-success border-0' },
  limited: { label: 'Limited', className: 'bg-warning/15 text-warning border-0' },
  full: { label: 'Full', className: 'bg-error/10 text-error border-0' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground border-0' },
  blocked: { label: 'Blocked', className: 'bg-charcoal text-white border-0' },
};

export const resourceTypeLabels = {
  agent: 'Agent', property: 'Property', project: 'Project', tour: 'Tour',
  inspection: 'Inspection', consultation: 'Consultation', office: 'Office',
};

export function formatDateTime(value) {
  if (!value) return '—';
  try { return new Date(value).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return String(value); }
}
export function formatDate(value) {
  if (!value) return '—';
  try { return new Date(value).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return String(value); }
}
export function formatNumber(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-NG');
}
export function formatCurrency(n) {
  if (n == null) return '—';
  return '₦' + Number(n).toLocaleString('en-NG');
}