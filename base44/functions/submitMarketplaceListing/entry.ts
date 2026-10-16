import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { getAgentForUser, checkListingCapacity, createAuditLog } from "../../shared/marketplace-listings.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { listing_id } = body;
    if (!listing_id) return Response.json({ error: "Listing ID is required." }, { status: 400 });

    const agent = await getAgentForUser(base44, user.id);
    if (!agent) return Response.json({ error: "Agent profile not found." }, { status: 404 });

    const listing = await base44.asServiceRole.entities.Property.get(listing_id);
    if (!listing) return Response.json({ error: "Listing not found." }, { status: 404 });

    // Ownership check
    if (listing.owner_user_id !== user.id) {
      await createAuditLog(base44, {
        action: "marketplace_listing_unauthorized_submit",
        category: "property_management",
        module: "properties",
        entity_name: "Property",
        entity_id: listing_id,
        entity_display_name: listing.title,
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
        result: "denied",
        severity: "high",
        details: "Agent attempted to submit a listing they do not own.",
      });
      return Response.json({ error: "You do not have permission to submit this listing." }, { status: 403 });
    }

    // Only drafts and rejected listings can be submitted
    if (!["draft", "rejected"].includes(listing.status)) {
      return Response.json({ error: "Only draft or rejected listings can be submitted for review." }, { status: 400 });
    }

    // Capacity check — count active listings BEFORE this one becomes active
    const capacity = await checkListingCapacity(base44, agent);
    if (!capacity.canPublish) {
      await createAuditLog(base44, {
        action: "marketplace_publishing_denied",
        category: "approval",
        module: "properties",
        entity_name: "Property",
        entity_id: listing_id,
        entity_display_name: listing.title,
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
        result: "denied",
        severity: "medium",
        details: `Submit denied — agent at tier limit (${capacity.tier}, ${capacity.activeCount}/${capacity.limit === Infinity ? "∞" : capacity.limit}).`,
      });
      return Response.json({
        error: `You have reached your tier limit of ${capacity.limit === Infinity ? "∞" : capacity.limit} active listings. Deactivate an existing listing or complete the next verification tier to increase your limit.`,
        tier: capacity.tier,
        active_listings: capacity.activeCount,
        limit: capacity.limit,
      }, { status: 403 });
    }

    // Submit for moderation — status becomes pending_approval, stays private
    await base44.asServiceRole.entities.Property.update(listing_id, {
      status: "pending_approval",
      visibility: "private",
      marketplace_rejection_reason: "",
    });

    await createAuditLog(base44, {
      action: "marketplace_listing_submitted",
      category: "property_management",
      module: "properties",
      entity_name: "Property",
      entity_id: listing_id,
      entity_display_name: listing.title,
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      details: "Agent submitted listing for moderation review.",
    });

    return Response.json({ success: true, listing_id });
  } catch (error) {
    return Response.json({ error: "Failed to submit listing." }, { status: 500 });
  }
}