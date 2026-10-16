/**
 * Shared marketplace tier logic — imported by backend functions.
 * The effective tier is ALWAYS derived from approved AgentVerification records,
 * never from a client-supplied field.
 */

export const TIER_LIMITS: Record<string, number> = {
  basic: 10,
  identity_verified: 50,
  address_verified: Infinity,
};

export const TIER_LABELS: Record<string, string> = {
  basic: "Basic Agent",
  identity_verified: "Identity Verified",
  address_verified: "Address Verified",
};

export const IDENTITY_DOCUMENT_TYPES = [
  { value: "international_passport", label: "International Passport" },
  { value: "drivers_license", label: "Driver's Licence" },
  { value: "national_id", label: "National Identity Card" },
  { value: "voters_card", label: "Voter Registration Card" },
];

export const ADDRESS_DOCUMENT_TYPES = [
  { value: "utility_bill", label: "Utility Bill (Electricity, Water, Gas)" },
  { value: "bank_statement", label: "Bank Statement" },
  { value: "tenancy_agreement", label: "Tenancy Agreement" },
  { value: "land_document", label: "Certificate of Occupancy / Land Document" },
];

export const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * Derives the effective tier from identity and address verification statuses.
 * An agent cannot skip identity verification to reach address verification.
 */
export function deriveEffectiveTier(identityStatus: string, addressStatus: string): string {
  if (identityStatus === "approved" && addressStatus === "approved") return "address_verified";
  if (identityStatus === "approved") return "identity_verified";
  return "basic";
}

export function getTierLimit(tier: string): number {
  return TIER_LIMITS[tier] ?? TIER_LIMITS.basic;
}

export function validateDocumentFilename(filename: string): { valid: boolean; error?: string } {
  if (!filename) return { valid: false, error: "Filename is required." };
  const ext = filename.toLowerCase().match(/\.[a-z0-9]+$/)?.[0];
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: "Invalid file type. Only PDF, JPG, and PNG are accepted." };
  }
  return { valid: true };
}

/**
 * Normalizes a Nigerian phone number to +234 format when practical.
 * Accepts +234..., 234..., 0... formats. Leaves international numbers unchanged.
 */
export function normalizePhone(phone: string): string {
  if (!phone) return phone;
  const trimmed = phone.trim();
  // Already international with +
  if (trimmed.startsWith("+")) return trimmed;
  // Nigerian local format: 0XXXXXXXXXX → +234XXXXXXXXX
  if (/^0\d{10}$/.test(trimmed)) return "+234" + trimmed.slice(1);
  // Nigerian without leading 0 or +: 234XXXXXXXXX
  if (/^234\d{10}$/.test(trimmed)) return "+" + trimmed;
  return trimmed;
}

/**
 * Normalizes email to lowercase and trims whitespace.
 */
export function normalizeEmail(email: string): string {
  return (email || "").trim().toLowerCase();
}