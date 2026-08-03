// Shared utilities for enterprise ops modules (5.4 DMS, 5.5 Media, 5.10 Security)

// ===== 5.4 DMS / E-Signature =====
export const signatureStatusConfig = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-0' },
  sent: { label: 'Sent', className: 'bg-ice-50 text-ice-700 border-0' },
  viewed: { label: 'Viewed', className: 'bg-ice-50 text-ice-700 border-0' },
  signed: { label: 'Signed', className: 'bg-success/10 text-success border-0' },
  declined: { label: 'Declined', className: 'bg-error/10 text-error border-0' },
  expired: { label: 'Expired', className: 'bg-warning/15 text-warning border-0' },
  voided: { label: 'Voided', className: 'bg-muted text-muted-foreground border-0' },
};

export const documentTypeLabels = {
  contract: 'Contract', agreement: 'Agreement', power_of_attorney: 'Power of Attorney',
  nda: 'NDA', offer_letter: 'Offer Letter', receipt: 'Receipt', deed: 'Deed', other: 'Other',
};

// ===== 5.5 Media =====
export const transcodeStatusConfig = {
  queued: { label: 'Queued', className: 'bg-muted text-muted-foreground border-0' },
  processing: { label: 'Processing', className: 'bg-ice-50 text-ice-700 border-0' },
  completed: { label: 'Completed', className: 'bg-success/10 text-success border-0' },
  failed: { label: 'Failed', className: 'bg-error/10 text-error border-0' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-0' },
};

export const outputFormatLabels = { mp4: 'MP4', webm: 'WebM', hls: 'HLS', webp: 'WebP', mp3: 'MP3', ogg: 'OGG', pdf: 'PDF' };
export const sourceTypeLabels = { video: 'Video', image: 'Image', audio: 'Audio', document: 'Document' };
export const watermarkPositionLabels = {
  'top-left': 'Top Left', 'top-right': 'Top Right', 'bottom-left': 'Bottom Left',
  'bottom-right': 'Bottom Right', center: 'Center', tile: 'Tiled',
};
export const applyToLabels = { all: 'All Media', images: 'Images', videos: 'Videos', documents: 'Documents' };

// ===== 5.10 Security =====
export const vulnerabilitySeverityConfig = {
  critical: { label: 'Critical', className: 'bg-error text-white border-0' },
  high: { label: 'High', className: 'bg-error/10 text-error border-0' },
  medium: { label: 'Medium', className: 'bg-warning/15 text-warning border-0' },
  low: { label: 'Low', className: 'bg-ice-50 text-ice-700 border-0' },
  info: { label: 'Info', className: 'bg-muted text-muted-foreground border-0' },
};

export const vulnerabilityStatusConfig = {
  open: { label: 'Open', className: 'bg-error/10 text-error border-0' },
  in_progress: { label: 'In Progress', className: 'bg-warning/15 text-warning border-0' },
  mitigated: { label: 'Mitigated', className: 'bg-ice-50 text-ice-700 border-0' },
  resolved: { label: 'Resolved', className: 'bg-success/10 text-success border-0' },
  false_positive: { label: 'False Positive', className: 'bg-muted text-muted-foreground border-0' },
};

export const vulnCategoryLabels = {
  injection: 'Injection', xss: 'XSS', csrf: 'CSRF', auth: 'Authentication',
  access_control: 'Access Control', data_exposure: 'Data Exposure',
  misconfiguration: 'Misconfiguration', dependency: 'Dependency', ddos: 'DDoS', other: 'Other',
};

export const policyCategoryLabels = {
  access_control: 'Access Control', data_protection: 'Data Protection', password: 'Password',
  encryption: 'Encryption', incident_response: 'Incident Response', compliance: 'Compliance',
  network: 'Network', endpoint: 'Endpoint', backup: 'Backup', privacy: 'Privacy', audit: 'Audit',
};

export const policyFrameworkLabels = {
  iso27001: 'ISO 27001', pci_dss: 'PCI DSS', gdpr: 'GDPR', ndpr: 'NDPR (Nigeria)',
  soc2: 'SOC 2', nist: 'NIST', custom: 'Custom',
};

export const policyStatusConfig = {
  active: { label: 'Active', className: 'bg-success/10 text-success border-0' },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-0' },
  under_review: { label: 'Under Review', className: 'bg-warning/15 text-warning border-0' },
  deprecated: { label: 'Deprecated', className: 'bg-muted text-muted-foreground border-0' },
};

export const complianceLevelConfig = {
  compliant: { label: 'Compliant', className: 'bg-success/10 text-success border-0' },
  partially_compliant: { label: 'Partially', className: 'bg-warning/15 text-warning border-0' },
  non_compliant: { label: 'Non-Compliant', className: 'bg-error/10 text-error border-0' },
  not_assessed: { label: 'Not Assessed', className: 'bg-muted text-muted-foreground border-0' },
};

// ===== Formatters =====
export function formatDate(value) {
  if (!value) return '—';
  try { return new Date(value).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return String(value); }
}
export function formatDateTime(value) {
  if (!value) return '—';
  try { return new Date(value).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return String(value); }
}
export function formatNumber(n) { if (n == null) return '—'; return Number(n).toLocaleString('en-NG'); }