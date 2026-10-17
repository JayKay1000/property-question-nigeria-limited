import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { deriveEffectiveTier, getTierLimit } from "../../shared/marketplace-tiers.ts";
import { createAuditLog, ACTIVE_PUBLISHED_STATUSES } from "../../shared/marketplace-listings.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ error: "Only administrators can revoke verifications." }, { status: 403 });
    }

    const body = await req.json();
    const { verification_id, revocation_reason } = body;

    if (!verification_id) return Response.json({ error: "Verification ID is required." }, { status: 400 });
    if (!revocation_reason?.trim()) {
      return Response.json({ error: "A revocation reason is required." }, { status: 400 });
    }

    const verification = await base44.asServiceRole.entities.AgentVerification.get(verification_id);
    if (!verification) return Response.json({ error: "Verification record not found." }, { status: 404 });

    if (verification.status !== "approved") {
      return Response.json({ error: "Only approved verifications can be revoked." }, { status: 400 });
    }

    // Prevent self-revocation
    if (verification.user_id === user.id) {
      return Response.json({ error: "You cannot revoke your own verification." }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Revoke the verification record
    await base44.asServiceRole.entities.AgentVerification.update(verification_id, {
      status: "revoked",
      revoked_at: now,
      revoked_by: user.id,
      revocation_reason: revocation_reason.trim(),
    });

    // Recompute the agent's effective tier from remaining approved verifications
    const agent = await base44.asServiceRole.entities.Agent.get(verification.agent_id);
    if (!agent) return Response.json({ error: "Agent record not found." }, { status: 404 });

    const verifications = await base44.asServiceRole.entities.AgentVerification.filter({
      user_id: agent.user_id,
      status: "approved",
    });
    const vItems = (verifications.items || verifications) as any[];
    const identityApproved = vItems.some((v) => v.verification_type === "identity");
    const addressApproved = vItems.some((v) => v.verification_type === "address");

    const effectiveTier = deriveEffectiveTier(
      identityApproved ? "approved" : "not_submitted",
      addressApproved ? "approved" : "not_submitted",
    );

    const statusField = verification.verification_type === "identity"
      ? "identity_verification_status"
      : "address_verification_status";

    // If identity was revoked, address is no longer valid either (Tier 3 requires Tier 2)
    const agentUpdate: Record<string, any> = {
      tier: effectiveTier,
      [statusField]: "revoked",
    };
    if (verification.verification_type === "identity" && !identityApproved) {
      // Identity revoked → address verification can no longer grant Tier 3
      agentUpdate.address_verification_status = addressApproved ? "revoked" : agent.address_verification_status;
    }

    await base44.asServiceRole.entities.Agent.update(agent.id, agentUpdate);

    // Check if the agent now exceeds their new tier limit — surface but do NOT auto-unpublish
    const limit = getTierLimit(effectiveTier);
    let excessListings: any[] = [];
    if (limit !== Infinity) {
      const activeResult = await base44.asServiceRole.entities.Property.filter({
        listing_agent_id: agent.id,
        visibility: "public",
        status: { $in: ACTIVE_PUBLISHED_STATUSES },
      }, { limit: 200, fields: ["id", "title", "status"] });
      const activeItems = (activeResult.items || activeResult) as any[];
      if (activeItems.length > limit) {
        excessListings = activeItems.slice(limit);
      }
    }

    await createAuditLog(base44, {
      action: "marketplace_verification_revoked",
      category: "approval",
      module: "agents",
      entity_name: "AgentVerification",
      entity_id: verification_id,
      entity_display_name: agent.full_name,
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      result: "warning",
      severity: "high",
      details: `Revoked ${verification.verification_type} verification for ${agent.full_name}. Reason: ${revocation_reason.trim()}. New tier: ${effectiveTier}. Excess listings: ${excessListings.length}.`,
    });

    return Response.json({
      success: true,
      new_tier: effectiveTier,
      excess_listings: excessListings.map((l) => ({ id: l.id, title: l.title })),
      message: excessListings.length > 0
        ? `Agent tier reduced to ${effectiveTier}. ${excessListings.length} listing(s) now exceed the tier limit and should be reviewed.`
        : `Agent tier reduced to ${effectiveTier}.`,
    });
  } catch (error) {
    return Response.json({ error: "Failed to revoke verification." }, { status: 500 });
  }
}