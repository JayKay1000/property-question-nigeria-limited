import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isPubliclyVisible } from '../../shared/marketplace-listings.ts';
import { normalizePhone, normalizeEmail } from '../../shared/marketplace-tiers.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { property_id, customer_name, customer_phone, customer_email, message, preferred_contact_method } = body;

    // Validate required fields
    if (!property_id || !customer_name || !message) {
      return Response.json({ error: 'Your name, a message, and the property are required.' }, { status: 400 });
    }
    if (!customer_phone && !customer_email) {
      return Response.json({ error: 'A phone number or email address is required so the advertiser can reach you.' }, { status: 400 });
    }

    // Fetch property and verify it is publicly eligible (server-side, not trusted from client)
    const property = await base44.asServiceRole.entities.Property.get(property_id).catch(() => null);
    if (!property || !isPubliclyVisible(property)) {
      return Response.json({ error: 'This property is not available for enquiries.' }, { status: 404 });
    }

    // Derive the advertiser agent server-side — never trust client-supplied agent/assignment IDs
    let agent = null;
    if (property.listing_agent_id) {
      agent = await base44.asServiceRole.entities.Agent.get(property.listing_agent_id).catch(() => null);
    }

    // Spam throttle: reject duplicate enquiry from same phone/email for same property within 10 minutes
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const throttleQuery: Record<string, any> = { property_id, created_date: { $gte: tenMinAgo } };
    if (customer_phone) {
      throttleQuery.customer_phone = normalizePhone(customer_phone);
    } else {
      throttleQuery.customer_email = normalizeEmail(customer_email);
    }
    const recent = await base44.asServiceRole.entities.PropertyEnquiry.filter(throttleQuery, { limit: 1 });
    const recentItems = (recent as any).items || recent;
    if (recentItems.length > 0) {
      return Response.json({ error: 'You have already sent an enquiry for this property recently. Please wait for a response.' }, { status: 429 });
    }

    // Capture the current user if authenticated (optional — guests can submit)
    const user = await base44.auth.me().catch(() => null);

    // Create the enquiry via service role so assigned_to_id is set to the agent's user_id
    // (the client cannot override the destination advertiser)
    const enquiry = await base44.asServiceRole.entities.PropertyEnquiry.create({
      property_id: property.id,
      property_title: property.title,
      customer_id: user?.id || null,
      customer_name: String(customer_name).trim().slice(0, 200),
      customer_email: customer_email ? normalizeEmail(customer_email) : null,
      customer_phone: customer_phone ? normalizePhone(customer_phone) : null,
      message: String(message).trim().slice(0, 5000),
      preferred_contact_method: preferred_contact_method || 'phone',
      source: 'website',
      status: 'new',
      assigned_to_id: agent?.user_id || null,
      agent_id: agent?.id || null,
      agent_name: agent?.full_name || property.listing_agent_name || null,
    });

    const reference = 'ENQ-' + String(enquiry.id).slice(-8).toUpperCase();

    return Response.json({ success: true, enquiry_id: enquiry.id, reference });
  } catch (error) {
    return Response.json({ error: 'Failed to submit enquiry. Please try again.' }, { status: 500 });
  }
}