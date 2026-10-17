import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { createAuditLog } from "../../shared/marketplace-listings.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ error: "Only administrators can review property verification." }, { status: 403 });
    }

    const body = await req.json();
    const { verification_id, action, rejection_reason, review_scope_notes, approved_scope } = body;

    if (!verification_id || !["approve", "reject", "request_evidence"].includes(action)) {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }
    if (action === "reject" && !rejection_reason?.trim()) {
      return Response.json({ error: "A rejection reason is required." }, { status: 400 });
    }

    const verification = await base44.asServiceRole.entities.PropertyVerification.get(verification_id);
    if (!verification) return Response.json({ error: "Verification record not found." }, { status: 404 });

    if (verification.status !== "pending") {
      return Response.json({ error: "This verification has already been reviewed." }, { status: 409 });
    }

    // Prevent self-review (agent reviewing their own property's verification)
    if (verification.user_id === user.id) {
      return Response.json({ error: "You cannot review your own property verification." }, { status: 403 });
    }

    const now = new Date().toISOString();
    let newStatus: string;

    if (action === "approve") {
      newStatus = "approved";
      await base44.asServiceRole.entities.PropertyVerification.update(verification_id, {
        status: newStatus,
        reviewed_at: now,
        reviewed_by: user.id,
        reviewer_name: user.full_name || user.email,
        review_scope_notes: review_scope_notes || "",
        approved_scope: approved_scope || "",
        rejection_reason: "",
      });

      // Update the property's verification status cache
      await base44.asServiceRole.entities.Property.update(verification.property_id, {
        property_verification_status: "approved",
        property_verification_scope: approved_scope || review_scope_notes || "",
      });
    } else if (action === "request_evidence") {
      newStatus = "evidence_requested";
      await base44.asServiceRole.entities.PropertyVerification.update(verification_id, {
        status: newStatus,
        reviewed_at: now,
        reviewed_by: user.id,
        reviewer_name: user.full_name || user.email,
        review_scope_notes: rejection_reason || "Additional evidence requested.",
      });

      await base44.asServiceRole.entities.Property.update(verification.property_id, {
        property_verification_status: "evidence_requested",
      });
    } else {
      newStatus = "rejected";
      await base44.asServiceRole.entities.PropertyVerification.update(verification_id, {
        status: newStatus,
        reviewed_at: now,
        reviewed_by: user.id,
        reviewer_name: user.full_name || user.email,
        rejection_reason: rejection_reason.trim(),
      });

      await base44.asServiceRole.entities.Property.update(verification.property_id, {
        property_verification_status: "rejected",
      });
    }

    await createAuditLog(base44, {
      action: "property_verification_" + newStatus,
      category: "approval",
      module: "properties",
      entity_name: "PropertyVerification",
      entity_id: verification_id,
      entity_display_name: verification.property_title,
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      severity: action === "approve" ? "high" : "medium",
      details: action === "approve"
        ? `Approved property verification for "${verification.property_title}". Scope: ${approved_scope || "not specified"}`
        : action === "request_evidence"
        ? `Requested additional evidence for property verification of "${verification.property_title}".`
        : `Rejected property verification for "${verification.property_title}". Reason: ${rejection_reason.trim()}`,
    });

    return Response.json({ success: true, status: newStatus });
  } catch (error) {
    return Response.json({ error: "Failed to review property verification." }, { status: 500 });
  }
}