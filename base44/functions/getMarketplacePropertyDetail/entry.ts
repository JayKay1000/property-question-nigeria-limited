import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isPubliclyVisible, getPublicAgent } from '../../shared/marketplace-listings.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const property_id = body.property_id;
    if (!property_id) return Response.json({ error: 'Property ID is required.' }, { status: 400 });

    // Fetch property via service role so we can check eligibility ourselves
    const property = await base44.asServiceRole.entities.Property.get(property_id).catch(() => null);
    if (!property || !isPubliclyVisible(property)) {
      return Response.json({ error: 'Property not found or no longer available.' }, { status: 404 });
    }

    // Fetch agent public profile if one is linked
    let agent = null;
    if (property.listing_agent_id) {
      const agentRecord = await base44.asServiceRole.entities.Agent.get(property.listing_agent_id).catch(() => null);
      agent = getPublicAgent(agentRecord);
    }

    return Response.json({ property, agent });
  } catch (error) {
    return Response.json({ error: 'Failed to load property details.' }, { status: 500 });
  }
}