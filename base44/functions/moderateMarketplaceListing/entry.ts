import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { createAuditLog, ACTIVE_PUBLISHED_STATUSES } from "../../shared/marketplace-listings.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ error: "Only administrators can moderate listings." }, { status: 403 });
    }

    const body = await req.json();
    const { listing_id, action, reason } = body;

    if (!listing_id || !["suspend", "restore"].includes(action)) {
      return Response.json({ error: "Invalid request. Use 'suspend' or 'restore'." }, { status: 400 });
    }

    const listing = await base44.asServiceRole.entities.Property.get(listing_id);
    if (!listing) return Response.json({ error: "Listing not found." }, { status: 404 });

    const now = new Date().toISOString();

    if (action === "suspend") {
      if (!ACTIVE_PUBLISHED_STATUSES.includes(listing.status)) {
        return Response.json({ error: "Only published listings can be suspended." }, { status: 400 });
      }
      if (!reason?.trim()) {
        return Response.json({ error: "A suspension reason is required." }, { status: 400 });
      }

      await base44.asServiceRole.entities.Property.update(listing_id, {
        status: "suspended",
        visibility: "private",
        suspended_at: now,
        suspended_by: user.id,
        suspension_reason: reason.trim(),
      });

      await createAuditLog(base44, {
        action: "marketplace_listing_suspended",
        category: "approval",
        module: "properties",
        entity_name: "Property",
        entity_id: listing_id,
        entity_display_name: listing.title,
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
        result: "warning",
        severity: "high",
        details: `Admin suspended listing. Reason: ${reason.trim()}`,
      });

      return Response.json({ success: true, listing_id, status: "suspended" });
    }

    // Restore
    if (listing.status !== "suspended") {
      return Response.json({ error: "Only suspended listings can be restored." }, { status: 400 });
    }

    await base44.asServiceRole.entities.Property.update(listing_id, {
      status: "published",
      visibility: "public",
      suspended_at: "",
      suspended_by: "",
      suspension_reason: "",
    });

    await createAuditLog(base44, {
      action: "marketplace_listing_restored",
      category: "approval",
      module: "properties",
      entity_name: "Property",
      entity_id: listing_id,
      entity_display_name: listing.title,
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      details: "Admin restored suspended listing to published.",
    });

    return Response.json({ success: true, listing_id, status: "published" });
  } catch (error) {
    return Response.json({ error: "Failed to moderate listing." }, { status: 500 });
  }
}