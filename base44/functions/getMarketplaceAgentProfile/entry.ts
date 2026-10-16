import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { deriveEffectiveTier, getTierLimit } from '../../shared/marketplace-tiers.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Find agent record for this user
    const agents = await base44.entities.Agent.filter({ user_id: user.id });
    if (!agents.length) return Response.json({ error: 'Agent profile not found.' }, { status: 404 });
    const agent = agents[0];

    // Fetch all verification records for this user (RLS allows own user)
    const verifications = await base44.entities.AgentVerification.filter({ user_id: user.id }, { sort: '-submitted_at', limit: 50 });
    const items = verifications.items || verifications;

    // Derive effective tier from verification records (authoritative source)
    const identityApproved = (items as any[]).some(v => v.verification_type === 'identity' && v.status === 'approved');
    const addressApproved = (items as any[]).some(v => v.verification_type === 'address' && v.status === 'approved');
    const identityPending = (items as any[]).some(v => v.verification_type === 'identity' && v.status === 'pending');
    const addressPending = (items as any[]).some(v => v.verification_type === 'address' && v.status === 'pending');

    const identityStatus = identityApproved ? 'approved' : (identityPending ? 'pending' : (agent.identity_verification_status || 'not_submitted'));
    const addressStatus = addressApproved ? 'approved' : (addressPending ? 'pending' : (agent.address_verification_status || 'not_submitted'));

    const effectiveTier = deriveEffectiveTier(identityStatus, addressStatus);
    const listingLimit = getTierLimit(effectiveTier);

    // Count active published listings
    const activeQuery = {
      listing_agent_id: agent.id,
      visibility: 'public',
      status: { $in: ['published', 'active', 'approved', 'verified'] }
    };
    const activeCount = await base44.entities.Property.count(activeQuery);

    return Response.json({
      agent: {
        id: agent.id,
        full_name: agent.full_name,
        first_name: agent.first_name,
        last_name: agent.last_name,
        email: agent.email,
        phone: agent.phone,
        photo_url: agent.photo_url,
        bio: agent.bio,
        status: agent.status,
        agent_code: agent.agent_code,
      },
      tier: {
        effective_tier: effectiveTier,
        listing_limit: listingLimit === Infinity ? null : listingLimit,
        listing_limit_display: listingLimit === Infinity ? 'Unlimited' : String(listingLimit),
        active_listings: activeCount,
        remaining: listingLimit === Infinity ? null : Math.max(0, listingLimit - activeCount),
        can_publish: listingLimit === Infinity ? true : activeCount < listingLimit,
      },
      verification: {
        identity_status: identityStatus,
        address_status: addressStatus,
        identity_approved: identityApproved,
        address_approved: addressApproved,
      },
      verifications: (items as any[]).map(v => ({
        id: v.id,
        verification_type: v.verification_type,
        document_type: v.document_type,
        status: v.status,
        submitted_at: v.submitted_at,
        reviewed_at: v.reviewed_at,
        rejection_reason: v.rejection_reason,
        reviewer_name: v.reviewer_name,
      })),
    });
  } catch (error) {
    return Response.json({ error: 'Failed to load agent profile.' }, { status: 500 });
  }
}