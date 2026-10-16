import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { getAgentForUser, createAuditLog } from "../../shared/marketplace-listings.ts";

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
      return Response.json({ error: "You do not have permission to archive this listing." }, { status: 403 });
    }

    // Only active/pending/draft listings can be archived
    if (["inactive", "rejected"].includes(listing.status)) {
      return Response.json({ error: "This listing is already archived or rejected." }, { status: 400 });
    }

    await base44.asServiceRole.entities.Property.update(listing_id, {
      status: "inactive",
      visibility: "private",
    });

    await createAuditLog(base44, {
      action: "marketplace_listing_archived",
      category: "property_management",
      module: "properties",
      entity_name: "Property",
      entity_id: listing_id,
      entity_display_name: listing.title,
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      details: "Agent archived/deactivated marketplace listing.",
    });

    return Response.json({ success: true, listing_id });
  } catch (error) {
    return Response.json({ error: "Failed to archive listing." }, { status: 500 });
  }
}