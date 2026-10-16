import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { deriveEffectiveTier } from '../../shared/marketplace-tiers.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden. Only administrators can review verifications.' }, { status: 403 });

    const body = await req.json();
    const { verification_id, action, rejection_reason } = body;

    if (!verification_id || !['approve', 'reject'].includes(action)) {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }
    if (action === 'reject' && !rejection_reason?.trim()) {
      return Response.json({ error: 'A rejection reason is required.' }, { status: 400 });
    }

    // Fetch the verification record (service role to bypass RLS)
    const verification = await base44.asServiceRole.entities.AgentVerification.get(verification_id);
    if (!verification) return Response.json({ error: 'Verification record not found.' }, { status: 404 });
    if (verification.status !== 'pending') {
      return Response.json({ error: 'This verification has already been reviewed.' }, { status: 409 });
    }

    // Prevent self-review
    if (verification.user_id === user.id) {
      return Response.json({ error: 'You cannot review your own verification submission.' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // Update verification record
    await base44.asServiceRole.entities.AgentVerification.update(verification_id, {
      status: newStatus,
      reviewed_at: now,
      reviewed_by: user.id,
      reviewer_name: user.full_name || user.email,
      rejection_reason: action === 'reject' ? rejection_reason.trim() : undefined,
    });

    // Fetch agent record
    const agent = await base44.asServiceRole.entities.Agent.get(verification.agent_id);
    if (!agent) return Response.json({ error: 'Agent record not found.' }, { status: 404 });

    // Update agent verification status cache
    const statusField = verification.verification_type === 'identity' ? 'identity_verification_status' : 'address_verification_status';
    const agentUpdate = { [statusField]: newStatus };

    // Derive effective tier from both verification statuses
    const identityStatus = verification.verification_type === 'identity' ? newStatus : (agent.identity_verification_status || 'not_submitted');
    const addressStatus = verification.verification_type === 'address' ? newStatus : (agent.address_verification_status || 'not_submitted');
    const effectiveTier = deriveEffectiveTier(identityStatus, addressStatus);
    agentUpdate.tier = effectiveTier;

    await base44.asServiceRole.entities.Agent.update(agent.id, agentUpdate);

    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'marketplace_verification_' + newStatus,
      category: 'approval',
      module: 'agents',
      entity_name: 'AgentVerification',
      entity_id: verification_id,
      entity_display_name: agent.full_name,
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      result: 'success',
      severity: action === 'approve' ? 'high' : 'medium',
      details: action === 'approve'
        ? 'Approved ' + verification.verification_type + ' verification for ' + agent.full_name + ' — tier set to ' + effectiveTier
        : 'Rejected ' + verification.verification_type + ' verification for ' + agent.full_name + ' — reason: ' + rejection_reason.trim(),
      event_timestamp: now,
      source: 'web',
    }).catch(() => {});

    return Response.json({ success: true, status: newStatus, effective_tier: effectiveTier });
  } catch (error) {
    return Response.json({ error: 'An error occurred during review.' }, { status: 500 });
  }
}