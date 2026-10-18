/**
 * Taste Engine — client-side constants, session storage, and helpers.
 */

export const TASTE_PROPERTY_TYPES = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'terrace', label: 'Terrace' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'factory', label: 'Factory' },
];

export const TASTE_PRIORITIES = [
  { value: 'affordability', label: 'Affordability', description: 'Prioritize properties within your budget' },
  { value: 'location', label: 'Location', description: 'Prioritize properties in your preferred areas' },
  { value: 'space', label: 'Space', description: 'Prioritize properties with enough bedrooms' },
  { value: 'amenities', label: 'Amenities', description: 'Prioritize properties with desired amenities' },
  { value: 'balanced', label: 'Balanced', description: 'Weigh all factors equally' },
];

export const TASTE_PURPOSES = [
  { value: 'any', label: 'Any' },
  { value: 'sale', label: 'Buy' },
  { value: 'rent', label: 'Rent' },
  { value: 'lease', label: 'Lease' },
];

export const BUDGET_PRESETS = [
  { label: 'Under ₦10M', min: 0, max: 10_000_000 },
  { label: '₦10M – ₦50M', min: 10_000_000, max: 50_000_000 },
  { label: '₦50M – ₦100M', min: 50_000_000, max: 100_000_000 },
  { label: '₦100M – ₦500M', min: 100_000_000, max: 500_000_000 },
  { label: '₦500M+', min: 500_000_000, max: null },
];

export const NIGERIAN_STATE_SUGGESTIONS = [
  'Lagos', 'Abuja', 'Rivers', 'Oyo', 'Kano', 'Enugu', 'Delta',
  'Anambra', 'Ogun', 'Kaduna', 'Edo', 'Imo', 'Cross River', 'Akwa Ibom',
];

export const BEDROOM_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 1, label: '1+' },
  { value: 2, label: '2+' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 5, label: '5+' },
];

export const DEFAULT_TASTE_PROFILE = {
  transaction_purpose: 'any',
  preferred_locations: [],
  preferred_property_types: [],
  budget_min_ngn: null,
  budget_max_ngn: null,
  min_bedrooms: null,
  preferred_amenities: [],
  condition_preference: null,
  furnishing_preference: null,
  priority: 'balanced',
};

export const SESSION_PROFILE_KEY = 'pqnl_taste_session_profile';
export const SESSION_EXCLUDED_KEY = 'pqnl_taste_excluded_ids';

export function getSessionProfile() {
  try {
    const raw = localStorage.getItem(SESSION_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function setSessionProfile(profile) {
  try {
    localStorage.setItem(SESSION_PROFILE_KEY, JSON.stringify(profile));
  } catch { /* ignore */ }
}

export function clearSessionProfile() {
  try {
    localStorage.removeItem(SESSION_PROFILE_KEY);
    localStorage.removeItem(SESSION_EXCLUDED_KEY);
  } catch { /* ignore */ }
}

export function getSessionExcludedIds() {
  try {
    const raw = localStorage.getItem(SESSION_EXCLUDED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addSessionExcludedId(id) {
  const ids = getSessionExcludedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    try { localStorage.setItem(SESSION_EXCLUDED_KEY, JSON.stringify(ids)); } catch { /* ignore */ }
  }
  return ids;
}

export function formatBudget(min, max) {
  if (min == null && max == null) return 'Any budget';
  const fmt = (n) => {
    if (n >= 1_000_000_000) return `₦${Math.round(n / 1_000_000_000)}B`;
    if (n >= 1_000_000) return `₦${Math.round(n / 1_000_000)}M`;
    return `₦${n.toLocaleString('en-NG')}`;
  };
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (max != null) return `Up to ${fmt(max)}`;
  return `From ${fmt(min)}`;
}