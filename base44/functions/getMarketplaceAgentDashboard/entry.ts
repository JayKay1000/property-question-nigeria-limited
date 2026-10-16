import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { deriveEffectiveTier, getTierLimit } from "../../shared/marketplace-tiers.ts";
import { getAgentForUser, ACTIVE_PUBLISHED_STATUSES } from "../../shared/marketplace-listings.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const agent = await getAgentForUser(base44, user.id);
    if (!agent) return Response.json({ error: "Agent profile not found." }, { status: 404 });

    // Derive tier
    const verifications = await base44.asServiceRole.entities.AgentVerification.filter({
      user_id: user.id, status: "approved",
    });
    const vItems = (verifications.items || verifications) as any[];
    const identityApproved = vItems.some((v) => v.verification_type === "identity");
    const addressApproved = vItems.some((v) => v.verification_type === "address");
    const effectiveTier = deriveEffectiveTier(
      identityApproved ? "approved" : "not_submitted",
      addressApproved ? "approved" : "not_submitted",
    );
    const listingLimit = getTierLimit(effectiveTier);

    // Count listings by status
    const baseQuery = { listing_agent_id: agent.id };
    const [activeCount, draftCount, pendingCount, rejectedCount, inactiveCount] = await Promise.all([
      base44.entities.Property.count({ ...baseQuery, status: { $in: ACTIVE_PUBLISHED_STATUSES }, visibility: "public" }),
      base44.entities.Property.count({ ...baseQuery, status: "draft" }),
      base44.entities.Property.count({ ...baseQuery, status: "pending_approval" }),
      base44.entities.Property.count({ ...baseQuery, status: "rejected" }),
      base44.entities.Property.count({ ...baseQuery, status: "inactive" }),
    ]);

    // Fetch all the agent's listings (sorted by most recent)
    const listingsResult = await base44.entities.Property.filter(
      { listing_agent_id: agent.id },
      { sort: "-updated_date", limit: 100 },
    );
    const listings = (listingsResult.items || listingsResult) as any[];

    return Response.json({
      agent: {
        id: agent.id,
        full_name: agent.full_name,
        email: agent.email,
        phone: agent.phone,
        status: agent.status,
        agent_code: agent.agent_code,
        photo_url: agent.photo_url,
      },
      tier: {
        effective_tier: effectiveTier,
        listing_limit: listingLimit === Infinity ? null : listingLimit,
        listing_limit_display: listingLimit === Infinity ? "Unlimited" : String(listingLimit),
        active_listings: activeCount,
        remaining: listingLimit === Infinity ? null : Math.max(0, listingLimit - activeCount),
        can_publish: listingLimit === Infinity ? true : activeCount < listingLimit,
      },
      counts: {
        active: activeCount,
        drafts: draftCount,
        pending: pendingCount,
        rejected: rejectedCount,
        inactive: inactiveCount,
        total: listings.length,
      },
      listings: listings.map((p) => ({
        id: p.id,
        title: p.title,
        price: p.price,
        currency: p.currency,
        listing_purpose: p.listing_purpose,
        pricing_frequency: p.pricing_frequency,
        property_type: p.property_type,
        state: p.state,
        city: p.city,
        status: p.status,
        visibility: p.visibility,
        featured_image_url: p.featured_image_url,
        image_urls: p.image_urls,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        land_size_sqm: p.land_size_sqm,
        updated_date: p.updated_date,
        created_date: p.created_date,
        published_at: p.published_at,
        marketplace_rejection_reason: p.marketplace_rejection_reason,
        view_count: p.view_count,
      })),
    });
  } catch (error) {
    return Response.json({ error: "Failed to load dashboard." }, { status: 500 });
  }
}