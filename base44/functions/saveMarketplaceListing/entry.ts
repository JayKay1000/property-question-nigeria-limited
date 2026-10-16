import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import {
  getAgentForUser,
  sanitizeListingData,
  validateListingData,
  createAuditLog,
} from "../../shared/marketplace-listings.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { listing_id, listing_data } = body;

    if (!listing_data || typeof listing_data !== "object") {
      return Response.json({ error: "Listing data is required." }, { status: 400 });
    }

    const agent = await getAgentForUser(base44, user.id);
    if (!agent) return Response.json({ error: "Agent profile not found." }, { status: 404 });

    if (["suspended", "terminated", "inactive"].includes(agent.status)) {
      return Response.json({ error: "Your agent account is not active." }, { status: 403 });
    }

    // Sanitize: strip all protected fields the client must not control
    const data = sanitizeListingData(listing_data);

    // Validate
    const validation = validateListingData(data);
    if (!validation.valid) return Response.json({ error: validation.error }, { status: 400 });

    if (listing_id) {
      // ── UPDATE existing listing ──
      const existing = await base44.asServiceRole.entities.Property.get(listing_id);
      if (!existing) return Response.json({ error: "Listing not found." }, { status: 404 });

      // Ownership check: only the original creator can edit
      if (existing.owner_user_id !== user.id) {
        await createAuditLog(base44, {
          action: "marketplace_listing_unauthorized_edit",
          category: "property_management",
          module: "properties",
          entity_name: "Property",
          entity_id: listing_id,
          entity_display_name: existing.title,
          user_id: user.id,
          user_email: user.email,
          user_role: user.role,
          result: "denied",
          severity: "high",
          details: "Agent attempted to edit a listing they do not own.",
        });
        return Response.json({ error: "You do not have permission to edit this listing." }, { status: 403 });
      }

      // Only allow edits when the listing is in an editable state
      if (!["draft", "pending_approval", "rejected", "published", "active", "approved", "verified"].includes(existing.status)) {
        return Response.json({ error: "This listing cannot be edited in its current state." }, { status: 400 });
      }

      // Update — service role bypasses RLS; ownership already verified
      const updated = await base44.asServiceRole.entities.Property.update(listing_id, {
        ...data,
        // If editing a published listing, keep it published (no re-review needed for content edits)
        // status and visibility are NOT in `data` (sanitized out), so they stay unchanged
      });

      await createAuditLog(base44, {
        action: "marketplace_listing_edited",
        category: "property_management",
        module: "properties",
        entity_name: "Property",
        entity_id: listing_id,
        entity_display_name: data.title || existing.title,
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
        details: "Agent edited marketplace listing.",
      });

      return Response.json({ success: true, listing_id: listing_id, listing: updated });
    } else {
      // ── CREATE new draft ──
      const newListing = await base44.asServiceRole.entities.Property.create({
        ...data,
        // Server-side ownership fields — never from the client
        owner_user_id: user.id,
        owner_name: agent.full_name,
        listing_agent_id: agent.id,
        listing_agent_name: agent.full_name,
        status: "draft",
        visibility: "private",
        is_new_listing: true,
        view_count: 0,
        favorite_count: 0,
      });

      await createAuditLog(base44, {
        action: "marketplace_listing_draft_created",
        category: "property_management",
        module: "properties",
        entity_name: "Property",
        entity_id: newListing.id,
        entity_display_name: data.title,
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
        details: "Agent created a new marketplace listing draft.",
      });

      return Response.json({ success: true, listing_id: newListing.id, listing: newListing });
    }
  } catch (error) {
    return Response.json({ error: "Failed to save listing." }, { status: 500 });
  }
}