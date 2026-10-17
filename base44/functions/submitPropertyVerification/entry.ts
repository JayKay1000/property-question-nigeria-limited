import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { getAgentForUser, createAuditLog } from "../../shared/marketplace-listings.ts";
import { validateDocumentFilename } from "../../shared/marketplace-tiers.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { property_id, evidence_type, evidence_description, document_file_uri, document_filename } = body;

    if (!property_id || !evidence_type || !document_file_uri || !document_filename) {
      return Response.json({ error: "Missing required fields." }, { status: 400 });
    }

    const validTypes = ["ownership_document", "authority_to_market", "title_document", "other_supporting_evidence"];
    if (!validTypes.includes(evidence_type)) {
      return Response.json({ error: "Invalid evidence type." }, { status: 400 });
    }

    const fileCheck = validateDocumentFilename(document_filename);
    if (!fileCheck.valid) return Response.json({ error: fileCheck.error }, { status: 400 });

    const agent = await getAgentForUser(base44, user.id);
    if (!agent) return Response.json({ error: "Agent profile not found." }, { status: 404 });

    if (["suspended", "terminated", "inactive"].includes(agent.status)) {
      return Response.json({ error: "Your agent account is not active." }, { status: 403 });
    }

    // Verify the agent owns this property
    const property = await base44.asServiceRole.entities.Property.get(property_id).catch(() => null);
    if (!property) return Response.json({ error: "Property not found." }, { status: 404 });

    if (property.owner_user_id !== user.id) {
      return Response.json({ error: "You can only request verification for your own listings." }, { status: 403 });
    }

    // Check for existing pending verification on this property
    const existing = await base44.asServiceRole.entities.PropertyVerification.filter({
      property_id,
      status: "pending",
    });
    const existingItems = (existing.items || existing) as any[];
    if (existingItems.length) {
      return Response.json({ error: "A property verification request is already pending for this listing." }, { status: 409 });
    }

    // If a previous verification was revoked or rejected, allow resubmission
    // but mark the new one as pending (not resubmitted — the status enum handles that)

    const verification = await base44.asServiceRole.entities.PropertyVerification.create({
      property_id,
      property_title: property.title,
      agent_id: agent.id,
      user_id: user.id,
      agent_name: agent.full_name,
      evidence_type,
      evidence_description: evidence_description || "",
      document_file_uri,
      document_filename,
      status: "pending",
      submitted_at: new Date().toISOString(),
    });

    // Update property verification status cache
    await base44.asServiceRole.entities.Property.update(property_id, {
      property_verification_status: "pending",
    });

    await createAuditLog(base44, {
      action: "property_verification_submitted",
      category: "approval",
      module: "properties",
      entity_name: "PropertyVerification",
      entity_id: verification.id,
      entity_display_name: property.title,
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      details: `Agent submitted property verification (${evidence_type}) for listing.`,
    });

    return Response.json({ success: true, verification_id: verification.id });
  } catch (error) {
    return Response.json({ error: "Failed to submit property verification." }, { status: 500 });
  }
}