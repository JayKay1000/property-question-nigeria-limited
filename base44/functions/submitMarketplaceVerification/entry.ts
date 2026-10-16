import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { validateDocumentFilename, normalizePhone } from '../../shared/marketplace-tiers.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { verification_type, document_type, document_file_uri, document_filename } = body;

    if (!['identity', 'address'].includes(verification_type)) {
      return Response.json({ error: 'Invalid verification type.' }, { status: 400 });
    }
    if (!document_type || !document_file_uri || !document_filename) {
      return Response.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const fileCheck = validateDocumentFilename(document_filename);
    if (!fileCheck.valid) return Response.json({ error: fileCheck.error }, { status: 400 });

    // Find agent record for this user
    const agents = await base44.entities.Agent.filter({ user_id: user.id });
    if (!agents.length) return Response.json({ error: 'Agent profile not found.' }, { status: 404 });
    const agent = agents[0];

    // Check account status — suspended/inactive agents cannot submit
    if (['suspended', 'terminated', 'inactive'].includes(agent.status)) {
      return Response.json({ error: 'Your account is not active. Please contact support.' }, { status: 403 });
    }

    // For address verification, identity must be approved first
    if (verification_type === 'address') {
      const identityApproved = await base44.asServiceRole.entities.AgentVerification.filter({
        user_id: user.id, verification_type: 'identity', status: 'approved'
      });
      if (!identityApproved.length) {
        return Response.json({ error: 'Identity verification must be approved before submitting address verification.' }, { status: 400 });
      }
    }

    // Check for existing pending submission of the same type
    const existing = await base44.entities.AgentVerification.filter({
      user_id: user.id, verification_type, status: 'pending'
    });
    if (existing.length) {
      return Response.json({ error: 'You already have a pending ' + verification_type + ' verification. Please wait for review.' }, { status: 409 });
    }

    // Create verification record
    const verification = await base44.entities.AgentVerification.create({
      agent_id: agent.id,
      user_id: user.id,
      agent_name: agent.full_name,
      agent_email: agent.email,
      verification_type,
      document_type,
      document_file_uri,
      document_filename,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    });

    // Update agent verification status cache (service role — bypasses RLS)
    const statusField = verification_type === 'identity' ? 'identity_verification_status' : 'address_verification_status';
    await base44.asServiceRole.entities.Agent.update(agent.id, { [statusField]: 'pending' });

    // Audit log
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'marketplace_verification_submitted',
      category: 'approval',
      module: 'agents',
      entity_name: 'AgentVerification',
      entity_id: verification.id,
      entity_display_name: agent.full_name,
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      result: 'success',
      severity: 'medium',
      details: 'Agent submitted ' + verification_type + ' verification (' + document_type + ')',
      event_timestamp: new Date().toISOString(),
      source: 'web',
    }).catch(() => {});

    return Response.json({ success: true, verification_id: verification.id });
  } catch (error) {
    return Response.json({ error: 'An error occurred during submission. Please try again.' }, { status: 500 });
  }
}