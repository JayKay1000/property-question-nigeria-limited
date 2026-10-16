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
 * Draft, pending, rejected, archived, and inactive listings are not public.
 */
export function isPubliclyVisible(property: any): boolean {
  if (!property) return false;
  if (property.visibility !== "public") return false;
  return ACTIVE_PUBLISHED_STATUSES.includes(property.status);
}