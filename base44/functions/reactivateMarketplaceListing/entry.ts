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
      return Response.json({ error: "You do not have permission to reactivate this listing." }, { status: 403 });
    }

    // Only inactive listings can be reactivated
    if (listing.status !== "inactive") {
      return Response.json({ error: "Only archived listings can be reactivated." }, { status: 400 });
    }

    // Capacity check — reactivating creates a new active listing
    const capacity = await checkListingCapacity(base44, agent);
    if (!capacity.canPublish) {
      await createAuditLog(base44, {
        action: "marketplace_reactivation_denied",
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
        details: `Reactivation denied — agent at tier limit (${capacity.tier}, ${capacity.activeCount}/${capacity.limit === Infinity ? "∞" : capacity.limit}).`,
      });
      return Response.json({
        error: `You have reached your tier limit of ${capacity.limit === Infinity ? "∞" : capacity.limit} active listings. Deactivate another listing first.`,
        tier: capacity.tier,
        active_listings: capacity.activeCount,
        limit: capacity.limit,
      }, { status: 403 });
    }

    // If the listing was previously published (has published_at), reactivate directly to published.
    // Otherwise, send it back for moderation.
    const wasPublished = !!listing.published_at;
    const newStatus = wasPublished ? "published" : "pending_approval";
    const newVisibility = wasPublished ? "public" : "private";
    const updateData: Record<string, any> = {
      status: newStatus,
      visibility: newVisibility,
    };
    if (wasPublished && !listing.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    await base44.asServiceRole.entities.Property.update(listing_id, updateData);

    await createAuditLog(base44, {
      action: "marketplace_listing_reactivated",
      category: "property_management",
      module: "properties",
      entity_name: "Property",
      entity_id: listing_id,
      entity_display_name: listing.title,
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      details: `Agent reactivated listing to ${newStatus}.`,
    });

    return Response.json({ success: true, listing_id, new_status: newStatus });
  } catch (error) {
    return Response.json({ error: "Failed to reactivate listing." }, { status: 500 });
  }
}