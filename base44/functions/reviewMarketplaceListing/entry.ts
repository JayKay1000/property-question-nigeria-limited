import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { createAuditLog } from "../../shared/marketplace-listings.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Admin-only operation
    if (user.role !== "admin") {
      return Response.json({ error: "Only administrators can review marketplace listings." }, { status: 403 });
    }

    const body = await req.json();
    const { listing_id, action, rejection_reason } = body;
    if (!listing_id) return Response.json({ error: "Listing ID is required." }, { status: 400 });
    if (!["approve", "reject"].includes(action)) {
      return Response.json({ error: "Invalid action. Use 'approve' or 'reject'." }, { status: 400 });
    }

    const listing = await base44.asServiceRole.entities.Property.get(listing_id);
    if (!listing) return Response.json({ error: "Listing not found." }, { status: 404 });

    // Only pending_approval listings can be reviewed
    if (listing.status !== "pending_approval") {
      return Response.json({ error: "This listing is not pending review." }, { status: 400 });
    }

    if (action === "approve") {
      await base44.asServiceRole.entities.Property.update(listing_id, {
        status: "published",
        visibility: "public",
        published_at: listing.published_at || new Date().toISOString(),
        marketplace_rejection_reason: "",
      });

      await createAuditLog(base44, {
        action: "marketplace_listing_approved",
        category: "approval",
        module: "properties",
        entity_name: "Property",
        entity_id: listing_id,
        entity_display_name: listing.title,
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
        details: "Admin approved marketplace listing for publication.",
      });

      return Response.json({ success: true, listing_id, status: "published" });
    } else {
      if (!rejection_reason || !String(rejection_reason).trim()) {
        return Response.json({ error: "A rejection reason is required." }, { status: 400 });
      }

      await base44.asServiceRole.entities.Property.update(listing_id, {
        status: "rejected",
        visibility: "private",
        marketplace_rejection_reason: String(rejection_reason).trim(),
      });

      await createAuditLog(base44, {
        action: "marketplace_listing_rejected",
        category: "approval",
        module: "properties",
        entity_name: "Property",
        entity_id: listing_id,
        entity_display_name: listing.title,
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
        result: "warning",
        severity: "medium",
        details: `Admin rejected marketplace listing: ${String(rejection_reason).trim()}`,
      });

      return Response.json({ success: true, listing_id, status: "rejected" });
    }
  } catch (error) {
    return Response.json({ error: "Failed to review listing." }, { status: 500 });
  }
}