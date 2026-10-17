/**
 * Shared marketplace listing logic — imported by Phase 4 backend functions.
 * Handles listing data sanitization, validation, agent lookup, and capacity checks.
 */
import { deriveEffectiveTier, getTierLimit } from "./marketplace-tiers.ts";

// Fields the agent is allowed to set on a Property listing
export const ALLOWED_LISTING_FIELDS = [
  "title", "short_description", "description",
  "property_address", "price", "currency", "listing_purpose", "pricing_frequency",
  "property_type", "bedrooms", "bathrooms", "toilets", "parking_spaces",
  "land_size_sqm", "built_up_area_sqm", "year_built", "plot_dimensions",
  "property_classification", "property_condition", "furnishing_status",
  "state", "city", "lga", "district", "estate", "address_line",
  "amenities", "highlights",
  "featured_image_url", "image_urls",
  "is_joint_venture",
  "ownership_confirmed", "ownership_confirmed_at",
];

export const ACTIVE_PUBLISHED_STATUSES = ["published", "active", "approved", "verified"];

/**
 * Strips any protected fields from the client-supplied data, keeping only
 * agent-settable content fields. This prevents the client from overriding
 * ownership, status, visibility, moderation results, or metrics.
 */
export function sanitizeListingData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const key of ALLOWED_LISTING_FIELDS) {
    if (data[key] !== undefined) sanitized[key] = data[key];
  }
  return sanitized;
}

/**
 * Validates required fields and numeric constraints on listing data.
 */
export function validateListingData(data: Record<string, any>): { valid: boolean; error?: string } {
  if (!data.title || !String(data.title).trim()) return { valid: false, error: "Advertisement title is required." };
  if (!data.listing_purpose) return { valid: false, error: "Transaction type is required." };
  if (data.price != null && (typeof data.price !== "number" || data.price < 0)) {
    return { valid: false, error: "Price must be a non-negative number." };
  }
  const numericFields = ["bedrooms", "bathrooms", "toilets", "parking_spaces", "land_size_sqm", "built_up_area_sqm", "year_built"];
  for (const f of numericFields) {
    if (data[f] != null && (typeof data[f] !== "number" || data[f] < 0)) {
      return { valid: false, error: `${f} must be a non-negative number.` };
    }
  }
  // Photo limit: featured image + gallery images must not exceed 20 total
  const MAX_PHOTOS = 20;
  const photoCount = (data.featured_image_url ? 1 : 0) + (Array.isArray(data.image_urls) ? data.image_urls.length : 0);
  if (photoCount > MAX_PHOTOS) {
    return { valid: false, error: `A property listing can have at most ${MAX_PHOTOS} photos.` };
  }
  return { valid: true };
}

/**
 * Finds the agent record for the authenticated user.
 * Returns null if no agent profile exists.
 */
export async function getAgentForUser(base44: any, userId: string) {
  const agents = await base44.entities.Agent.filter({ user_id: userId });
  if (!agents.length) return null;
  return agents[0];
}

/**
 * Checks whether the agent can publish another active listing.
 * Derives the effective tier from approved verification records (authoritative),
 * counts active published listings, and returns capacity info.
 */
export async function checkListingCapacity(base44: any, agent: any) {
  if (["suspended", "terminated", "inactive"].includes(agent.status)) {
    return {
      canPublish: false,
      reason: `Your agent account is ${agent.status}. Please contact support.`,
      tier: "basic",
      activeCount: 0,
      limit: 10,
      remaining: 0,
    };
  }

  const verifications = await base44.asServiceRole.entities.AgentVerification.filter({
    user_id: agent.user_id, status: "approved",
  });
  const vItems = (verifications.items || verifications) as any[];
  const identityApproved = vItems.some((v) => v.verification_type === "identity");
  const addressApproved = vItems.some((v) => v.verification_type === "address");
  const effectiveTier = deriveEffectiveTier(
    identityApproved ? "approved" : "not_submitted",
    addressApproved ? "approved" : "not_submitted",
  );
  const limit = getTierLimit(effectiveTier);

  const activeCount = await base44.entities.Property.count({
    listing_agent_id: agent.id,
    visibility: "public",
    status: { $in: ACTIVE_PUBLISHED_STATUSES },
  });

  const canPublish = limit === Infinity ? true : activeCount < limit;
  const remaining = limit === Infinity ? null : Math.max(0, limit - activeCount);

  return { canPublish, reason: null, tier: effectiveTier, activeCount, limit, remaining };
}

/**
 * Creates an audit log entry (best-effort, never throws).
 */
export async function createAuditLog(base44: any, entry: Record<string, any>) {
  await base44.asServiceRole.entities.AuditLog.create({
    event_timestamp: new Date().toISOString(),
    source: "web",
    result: "success",
    severity: "info",
    ...entry,
  }).catch(() => {});
}

// ─── Phase 5: Public property detail & enquiry support ───

/**
 * Fields from the Agent entity that are safe to show to the public.
 * Excludes address, date_of_birth, emergency contacts, and other private data.
 */
export const PUBLIC_AGENT_FIELDS = [
  "id", "full_name", "first_name", "last_name", "photo_url",
  "bio", "specialization", "years_experience", "service_areas",
  "languages", "agent_code", "email", "phone",
  "identity_verification_status", "address_verification_status",
  "verification_status", "tier", "status",
  "rating", "review_count", "total_listings",
];

/**
 * Returns a stripped-down agent object containing only public fields.
 * Never returns private fields like address, DOB, or emergency contacts.
 */
export function getPublicAgent(agent: any): Record<string, any> | null {
  if (!agent) return null;
  const result: Record<string, any> = {};
  for (const key of PUBLIC_AGENT_FIELDS) {
    if (agent[key] !== undefined) result[key] = agent[key];
  }
  // Derived display flags (from authoritative verification records)
  result.identity_verified = agent.identity_verification_status === "approved";
  result.address_verified = agent.address_verification_status === "approved";
  return result;
}

/**
 * Checks whether a property is eligible for public display.
 * Draft, pending, rejected, suspended, archived, and inactive listings are not public.
 */
export function isPubliclyVisible(property: any): boolean {
  if (!property) return false;
  if (property.visibility !== "public") return false;
  return ACTIVE_PUBLISHED_STATUSES.includes(property.status);
}

// ─── Phase 6: Material edit re-review ───

/**
 * Fields whose modification on a published listing constitutes a "material change"
 * that requires re-moderation before the new content is shown publicly.
 * Cosmetic edits (e.g. adding an amenity) are not material; changing price,
 * location, description, or photos is.
 */
export const MATERIAL_EDIT_FIELDS = [
  "title",
  "description",
  "short_description",
  "price",
  "listing_purpose",
  "pricing_frequency",
  "property_address",
  "state",
  "city",
  "lga",
  "district",
  "estate",
  "address_line",
  "latitude",
  "longitude",
  "property_type",
  "bedrooms",
  "bathrooms",
  "toilets",
  "parking_spaces",
  "land_size_sqm",
  "built_up_area_sqm",
  "year_built",
  "featured_image_url",
  "image_urls",
];

/**
 * Compares the existing listing with the incoming sanitized data and returns
 * true if any material field has changed. Used to decide whether a published
 * listing should be sent back to pending_approval.
 */
export function hasMaterialChanges(existing: any, incoming: any): boolean {
  for (const field of MATERIAL_EDIT_FIELDS) {
    const oldVal = existing[field];
    const newVal = incoming[field];
    if (field === "image_urls" || field === "featured_image_url") {
      if (JSON.stringify(oldVal || []) !== JSON.stringify(newVal || [])) return true;
      continue;
    }
    if (oldVal !== newVal) return true;
  }
  return false;
}

// ─── Phase 6: Duplicate / suspicious detection ───

/**
 * Normalizes text for fuzzy comparison: lowercase, trim, collapse whitespace,
 * remove common punctuation. Does NOT remove all characters — only normalizes.
 */
export function normalizeForComparison(text: string): string {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/[""]/g, "");
}

/**
 * Computes a similarity score between two normalized strings (0 = no overlap,
 * 1 = identical). Uses a simple token-overlap ratio — sufficient for flagging
 * potential duplicates for human review, not a full fuzzy match.
 */
export function textSimilarity(a: string, b: string): number {
  const na = normalizeForComparison(a);
  const nb = normalizeForComparison(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  const tokensA = new Set(na.split(" "));
  const tokensB = new Set(nb.split(" "));
  let common = 0;
  for (const t of tokensA) if (tokensB.has(t)) common++;
  const max = Math.max(tokensA.size, tokensB.size);
  return max === 0 ? 0 : common / max;
}

/**
 * Finds potential duplicate listings for a given property by comparing
 * normalized title, price, location, and listing purpose across other
 * active listings. Returns potential matches with similarity info.
 * This flags for human review — it does NOT declare fraud.
 */
export async function findPotentialDuplicates(base44: any, property: any): Promise<any[]> {
  if (!property) return [];
  const query: Record<string, any> = {
    status: { $in: ACTIVE_PUBLISHED_STATUSES },
    visibility: "public",
  };
  if (property.listing_purpose) query.listing_purpose = property.listing_purpose;
  if (property.state) query.state = property.state;

  const result = await base44.asServiceRole.entities.Property.filter(query, {
    sort: "-created_date",
    limit: 100,
    fields: [
      "id", "title", "price", "listing_purpose", "state", "city", "district",
      "listing_agent_id", "listing_agent_name", "owner_user_id", "featured_image_url",
    ],
  });
  const candidates = (result.items || result) as any[];

  const duplicates: any[] = [];
  for (const c of candidates) {
    if (c.id === property.id) continue;
    const titleSim = textSimilarity(property.title, c.title);
    const priceMatch =
      property.price != null && c.price != null && Number(property.price) === Number(c.price);
    const locationMatch =
      (property.city && c.city && normalizeForComparison(property.city) === normalizeForComparison(c.city)) ||
      (property.district && c.district && normalizeForComparison(property.district) === normalizeForComparison(c.district));
    const sameAgent = property.listing_agent_id && property.listing_agent_id === c.listing_agent_id;

    if (titleSim >= 0.8 && (priceMatch || locationMatch)) {
      duplicates.push({
        property_id: c.id,
        title: c.title,
        price: c.price,
        listing_agent_name: c.listing_agent_name,
        same_agent: !!sameAgent,
        title_similarity: Math.round(titleSim * 100) / 100,
        price_match: priceMatch,
        location_match: locationMatch,
        indicator: sameAgent
          ? "Same agent posted a very similar listing"
          : "Different agent posted a very similar listing",
      });
    }
  }
  return duplicates;
}

/**
 * Risk indicator labels for display in the admin moderation interface.
 */
export const RISK_INDICATOR_LABELS: Record<string, string> = {
  potential_duplicate: "Potential duplicate listing",
  price_drop_large: "Large price reduction since last approval",
  multiple_reports: "Multiple reports filed against this listing",
  re_posted: "Listing re-posted multiple times",
  agent_unverified: "Agent identity not yet verified",
};