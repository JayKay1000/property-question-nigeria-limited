/**
 * Property Taste Engine — shared scoring and ranking logic.
 *
 * RANKING FORMULA (deterministic, transparent, no ML):
 *
 *   1. MANDATORY CONSTRAINTS (hard filters — cannot be overridden by score):
 *      - visibility == "public"
 *      - status in [published, active, approved, verified]
 *      - availability_status NOT in [sold, withdrawn, off_market]
 *      - not suspended (suspended_at is null)
 *      - transaction_purpose matches profile (if profile sets one other than "any")
 *      - price <= budget_max * 1.15 (if profile sets budget_max — 15% margin)
 *
 *   2. PREFERENCE MATCH SCORE (additive, weighted by priority):
 *      - Location match:   weight varies by priority (15–35 pts)
 *      - Property type:     weight varies by priority (10–12 pts)
 *      - Budget fit:        full match = weight (15–30 pts); near = 50%
 *      - Bedrooms met:      weight varies by priority (10–30 pts)
 *      - Amenity matches:   per-amenity (5–8 pts each, capped at 25)
 *      - Condition match:   8 pts
 *      - Furnishing match:  8 pts
 *
 *   3. SUPPORTING SIGNALS (small, never overriding):
 *      - Completeness bonus: up to 10 pts (description, images, location, price)
 *      - Freshness bonus: up to 5 pts (< 7 days = 5, < 30 = 3, < 90 = 1)
 *      - Engagement: up to 1.5 pts from view_count (capped, low weight)
 *
 *   4. PENALTIES:
 *      - Properties marked "not_interested" or "too_expensive" are excluded
 *        from future recommendations.
 *
 *   5. PAID PROMOTIONS:
 *      - is_featured / is_premium do NOT affect the score. A featured property
 *        can show a "Featured" badge but its rank is determined by relevance,
 *        not by payment.
 *
 *   6. TIE-BREAKING (deterministic, consistent across visits):
 *      - Primary: score DESC
 *      - Secondary: created_date DESC (newer first)
 *      - Tertiary: id ASC (lexicographic, stable)
 *
 * DATA FIELDS USED:
 *   Profile: transaction_purpose, preferred_locations, preferred_property_types,
 *            budget_min_ngn, budget_max_ngn, min_bedrooms, preferred_amenities,
 *            condition_preference, furnishing_preference, priority
 *   Property: visibility, status, availability_status, suspended_at, listing_purpose,
 *             price, property_type, state, city, lga, district, bedrooms, amenities,
 *             property_condition, furnishing_status, description, image_urls,
 *             featured_image_url, view_count, created_date, is_featured, is_premium
 *
 * ACCESS POLICY:
 *   PropertyTasteProfile and PropertyFeedback are owner-only via RLS.
 *   Anonymous visitors receive session-level (non-persistent) recommendations
 *   using a profile passed in the request body — they never see another user's
 *   saved preferences.
 */

export const ELIGIBLE_STATUSES = ["published", "active", "approved", "verified"];
export const WITHDRAWN_AVAILABILITY = ["sold", "withdrawn", "off_market"];

export interface TasteProfile {
  transaction_purpose?: string;
  preferred_locations?: string[];
  preferred_property_types?: string[];
  budget_min_ngn?: number | null;
  budget_max_ngn?: number | null;
  min_bedrooms?: number | null;
  preferred_amenities?: string[];
  condition_preference?: string | null;
  furnishing_preference?: string | null;
  priority?: string;
  personalization_enabled?: boolean;
}

export interface ScoredProperty {
  property: any;
  score: number;
  reasons: string[];
  missingInfo: string[];
}

export interface ScoreResult {
  score: number;
  reasons: string[];
  missingInfo: string[];
}

/**
 * Mandatory eligibility check — a property that fails this is never shown
 * as a recommendation, regardless of how well it matches preferences.
 */
export function isEligible(p: any): boolean {
  if (!p) return false;
  if (p.visibility !== "public") return false;
  if (!ELIGIBLE_STATUSES.includes(p.status)) return false;
  if (WITHDRAWN_AVAILABILITY.includes(p.availability_status)) return false;
  if (p.suspended_at) return false;
  return true;
}

const PRIORITY_WEIGHTS: Record<string, {
  location: number; type: number; budget: number; bedrooms: number;
  amenityEach: number; condition: number;
}> = {
  affordability: { location: 15, type: 10, budget: 30, bedrooms: 10, amenityEach: 5, condition: 8 },
  location:      { location: 35, type: 10, budget: 15, bedrooms: 10, amenityEach: 5, condition: 8 },
  space:         { location: 15, type: 10, budget: 15, bedrooms: 30, amenityEach: 5, condition: 8 },
  amenities:    { location: 15, type: 10, budget: 15, bedrooms: 10, amenityEach: 8, condition: 8 },
  balanced:      { location: 20, type: 12, budget: 20, bedrooms: 12, amenityEach: 6, condition: 8 },
};

function lower(s: any): string {
  return s ? String(s).toLowerCase() : "";
}

function lowerArray(arr: any): string[] {
  return Array.isArray(arr) ? arr.map(lower).filter(Boolean) : [];
}

/**
 * Scores a single property against the user's taste profile.
 * Returns the numeric score plus human-readable reasons and missing-info notes
 * for the explanation UI.
 */
export function scoreProperty(p: any, profile: TasteProfile): ScoreResult {
  const reasons: string[] = [];
  const missingInfo: string[] = [];
  let score = 0;
  const w = PRIORITY_WEIGHTS[profile.priority || "balanced"] || PRIORITY_WEIGHTS.balanced;

  // --- Location match ---
  const preferredLocations = lowerArray(profile.preferred_locations);
  if (preferredLocations.length > 0) {
    const propLocations = [p.state, p.city, p.lga, p.district, p.estate]
      .map(lower).filter(Boolean);
    const matched = preferredLocations.some(loc =>
      propLocations.some(pl => pl === loc || pl.includes(loc) || loc.includes(pl))
    );
    if (matched) {
      score += w.location;
      reasons.push("Matches your preferred location");
    }
  }

  // --- Property type match ---
  const preferredTypes = lowerArray(profile.preferred_property_types);
  if (preferredTypes.length > 0 && p.property_type) {
    if (preferredTypes.includes(lower(p.property_type))) {
      score += w.type;
      reasons.push("Matches your preferred property type");
    }
  }

  // --- Budget fit ---
  const budgetMin = profile.budget_min_ngn;
  const budgetMax = profile.budget_max_ngn;
  if (budgetMax != null && p.price != null) {
    if (budgetMin != null && p.price >= budgetMin && p.price <= budgetMax) {
      score += w.budget;
      reasons.push("Within your stated budget");
    } else if (budgetMin == null && p.price <= budgetMax) {
      score += w.budget;
      reasons.push("Within your stated budget");
    } else if (p.price <= budgetMax * 1.1) {
      score += w.budget * 0.5;
      reasons.push("Slightly above your budget");
    }
  }

  // --- Bedroom match ---
  if (profile.min_bedrooms != null) {
    if (p.bedrooms != null && p.bedrooms >= profile.min_bedrooms) {
      score += w.bedrooms;
      reasons.push(`Has ${p.bedrooms} bedroom${p.bedrooms === 1 ? "" : "s"} (meets your minimum of ${profile.min_bedrooms})`);
    } else if (p.bedrooms == null) {
      missingInfo.push("Bedroom count not listed");
    }
  }

  // --- Amenity matches ---
  const preferredAmenities = lowerArray(profile.preferred_amenities);
  if (preferredAmenities.length > 0 && Array.isArray(p.amenities)) {
    const propAmenities = lowerArray(p.amenities);
    const matched = preferredAmenities.filter(a => propAmenities.includes(a));
    if (matched.length > 0) {
      const amenityScore = Math.min(matched.length * w.amenityEach, 25);
      score += amenityScore;
      reasons.push(`Includes ${matched.length} requested amenit${matched.length === 1 ? "y" : "ies"}`);
    }
  }

  // --- Condition match ---
  if (profile.condition_preference && p.property_condition) {
    if (lower(p.property_condition) === lower(profile.condition_preference)) {
      score += w.condition;
      reasons.push("Matches your preferred condition");
    }
  }

  // --- Furnishing match ---
  if (profile.furnishing_preference && p.furnishing_status) {
    if (lower(p.furnishing_status) === lower(profile.furnishing_preference)) {
      score += w.condition;
      reasons.push("Matches your furnishing preference");
    }
  }

  // --- Completeness bonus (max 10) ---
  let completeness = 0;
  if (p.description) completeness += 0.25;
  if (p.image_urls && p.image_urls.length > 0) completeness += 0.25;
  if (p.state || p.city) completeness += 0.25;
  if (p.price != null) completeness += 0.25;
  score += completeness * 10;

  // --- Freshness bonus (max 5) ---
  if (p.created_date) {
    const created = new Date(p.created_date).getTime();
    if (!isNaN(created)) {
      const daysOld = (Date.now() - created) / 86400000;
      if (daysOld < 7) score += 5;
      else if (daysOld < 30) score += 3;
      else if (daysOld < 90) score += 1;
    }
  }

  // --- Engagement signal (max 1.5, very low weight — supporting only) ---
  if (p.view_count && p.view_count > 0) {
    score += Math.min(p.view_count / 100, 5) * 0.3;
  }

  // NOTE: is_featured / is_premium deliberately do NOT affect score.

  return { score: Math.round(score * 100) / 100, reasons, missingInfo };
}

/**
 * Filters, scores, and ranks properties. Returns a deterministically sorted
 * array of scored properties with explanations. Properties the user has
 * dismissed (not_interested / too_expensive) are excluded.
 */
export function rankProperties(
  properties: any[],
  profile: TasteProfile,
  excludedIds: Set<string>
): ScoredProperty[] {
  const scored = properties
    .filter(p => isEligible(p))
    .filter(p => !excludedIds.has(p.id))
    .map(p => {
      const { score, reasons, missingInfo } = scoreProperty(p, profile);
      return { property: p, score, reasons, missingInfo };
    });

  // Deterministic sort: score DESC, then created_date DESC, then id ASC
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aDate = new Date(a.property.created_date || 0).getTime();
    const bDate = new Date(b.property.created_date || 0).getTime();
    if (bDate !== aDate) return bDate - aDate;
    return (a.property.id || "").localeCompare(b.property.id || "");
  });

  return scored;
}