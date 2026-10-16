import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { deriveEffectiveTier, getTierLimit } from '../../shared/marketplace-tiers.ts';

/**
 * Capacity check — called by Phase 4 before publishing a property.
 * Derives the agent's identity and tier from authenticated server-side context,
 * counts active listings against the authoritative data source, and returns
 * whether the agent can publish.
 *
 * This is the trusted server-side enforcement mechanism. Frontend checks are
 * advisory only.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Find agent record for this user
    const agents = await base44.entities.Agent.filter({ user_id: user.id });
    if (!agents.length) return Response.json({ error: 'Agent profile not found.' }, { status: 404 });
    const agent = agents[0];

    // Check account status
    if (['suspended', 'terminated', 'inactive'].includes(agent.status)) {
      return Response.json({
        can_publish: false,
        reason: 'Your agent account is ' + agent.status + '. Please contact support.',
        tier: 'basic',
        active_listings: 0,
        limit: 10,
      }, { status: 200 });
    }

    // Derive effective tier from verification records (authoritative)
    const verifications = await base44.asServiceRole.entities.AgentVerification.filter({
      user_id: user.id, status: 'approved'
    });
    const vItems = verifications.items || verifications;
    const identityApproved = (vItems as any[]).some(v => v.verification_type === 'identity');
    const addressApproved = (vItems as any[]).some(v => v.verification_type === 'address');
    const effectiveTier = deriveEffectiveTier(
      identityApproved ? 'approved' : 'not_submitted',
      addressApproved ? 'approved' : 'not_submitted'
    );
    const limit = getTierLimit(effectiveTier);

    // Count active published listings
    const activeQuery = {
      listing_agent_id: agent.id,
      visibility: 'public',
      status: { $in: ['published', 'active', 'approved', 'verified'] }
    };
    const activeCount = await base44.entities.Property.count(activeQuery);

    const canPublish = limit === Infinity ? true : activeCount < limit;
    const remaining = limit === Infinity ? null : Math.max(0, limit - activeCount);

    // Audit denied publication attempts
    if (!canPublish) {
      await base44.asServiceRole.entities.AuditLog.create({
        action: 'marketplace_publishing_denied',
        category: 'approval',
        module: 'agents',
        entity_name: 'Agent',
        entity_id: agent.id,
        entity_display_name: agent.full_name,
        user_id: user.id,
        user_email: user.email,
        user_role: user.role,
        result: 'denied',
        severity: 'medium',
        details: 'Publishing denied — agent at tier limit (' + effectiveTier + ', ' + activeCount + '/' + (limit === Infinity ? '∞' : limit) + ')',
        event_timestamp: new Date().toISOString(),
        source: 'web',
      }).catch(() => {});
    }

    return Response.json({
      can_publish: canPublish,
      reason: canPublish ? null : 'You have reached your tier limit of ' + limit + ' active listings. Verify your identity or address to increase your limit.',
      tier: effectiveTier,
      active_listings: activeCount,
      limit: limit === Infinity ? null : limit,
      remaining,
    });
  } catch (error) {
    return Response.json({ error: 'Failed to check listing capacity.' }, { status: 500 });
  }
}