/**
 * Client-side marketplace tier display utilities.
 * The authoritative tier is always derived server-side — these are for display only.
 */

export const TIER_CONFIG = {
  basic: {
    label: 'Basic Agent',
    limit: 10,
    color: 'text-brand-700',
    badge: 'bg-brand-100 text-brand-700 border-brand-200',
    description: 'Free registration with up to 10 active listings.',
  },
  identity_verified: {
    label: 'Identity Verified',
    limit: 50,
    color: 'text-info',
    badge: 'bg-info/10 text-info border-info/20',
    description: 'Up to 50 active listings after identity document approval.',
  },
  address_verified: {
    label: 'Address Verified',
    limit: Infinity,
    color: 'text-success',
    badge: 'bg-success/10 text-success border-success/20',
    description: 'Unlimited active listings after identity and address approval.',
  },
};

export const VERIFICATION_STATUS_CONFIG = {
  not_submitted: { label: 'Not Submitted', color: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground border-border' },
  pending: { label: 'Pending Review', color: 'text-warning', badge: 'bg-warning/10 text-warning border-warning/20' },
  approved: { label: 'Approved', color: 'text-success', badge: 'bg-success/10 text-success border-success/20' },
  rejected: { label: 'Rejected', color: 'text-error', badge: 'bg-error/10 text-error border-error/20' },
};

export const IDENTITY_DOCUMENT_TYPES = [
  { value: 'international_passport', label: 'International Passport' },
  { value: 'drivers_license', label: "Driver's Licence" },
  { value: 'national_id', label: 'National Identity Card' },
  { value: 'voters_card', label: 'Voter Registration Card' },
];

export const ADDRESS_DOCUMENT_TYPES = [
  { value: 'utility_bill', label: 'Utility Bill (Electricity, Water, Gas)' },
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'tenancy_agreement', label: 'Tenancy Agreement' },
  { value: 'land_document', label: 'Certificate of Occupancy / Land Document' },
];

export function normalizePhone(phone) {
  if (!phone) return phone;
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) return trimmed;
  if (/^0\d{10}$/.test(trimmed)) return '+234' + trimmed.slice(1);
  if (/^234\d{10}$/.test(trimmed)) return '+' + trimmed;
  return trimmed;
}

export function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}