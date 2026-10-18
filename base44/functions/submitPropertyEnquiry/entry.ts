import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isPubliclyVisible } from '../../shared/marketplace-listings.ts';
import { normalizePhone, normalizeEmail } from '../../shared/marketplace-tiers.ts';
import { isValidInquiryCategory, generateReference } from '../../shared/enquiry-workflow.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const {
      property_id,
      customer_name,
      customer_phone,
      customer_email,
      message,
      preferred_contact_method,
      inquiry_category,
      questions,
      inspection_requested,
      preferred_inspection_date,
      preferred_inspection_time,
    } = body;

    // Validate required fields
    if (!property_id || !customer_name || !message) {
      return Response.json({ error: 'Your name, a message, and the property are required.' }, { status: 400 });
    }
    if (!customer_phone && !customer_email) {
      return Response.json({ error: 'A phone number or email address is required so the advertiser can reach you.' }, { status: 400 });
    }

    // Validate inquiry category if provided
    if (inquiry_category && !isValidInquiryCategory(inquiry_category)) {
      return Response.json({ error: 'Invalid inquiry category.' }, { status: 400 });
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

    // Sanitize questions array
    const cleanQuestions = Array.isArray(questions)
      ? questions.filter((q) => typeof q === 'string').map((q) => String(q).trim().slice(0, 300)).slice(0, 20)
      : [];

    // Create the enquiry via service role so assigned_to_id is set to the agent's user_id
    const enquiryData: Record<string, any> = {
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
      inquiry_category: inquiry_category || 'general_info',
      questions: cleanQuestions,
      inspection_requested: !!inspection_requested,
      preferred_inspection_date: inspection_requested ? preferred_inspection_date || null : null,
      preferred_inspection_time: inspection_requested ? preferred_inspection_time || null : null,
    };

    const enquiry = await base44.asServiceRole.entities.PropertyEnquiry.create(enquiryData);

    const reference = generateReference(enquiry.id);

    // Update the reference on the enquiry record
    await base44.asServiceRole.entities.PropertyEnquiry.update(enquiry.id, { reference });

    // If the buyer requested an inspection, create an InspectionRequest linked to this enquiry
    let inspectionId = null;
    if (inspection_requested && preferred_inspection_date) {
      const inspection = await base44.asServiceRole.entities.InspectionRequest.create({
        property_id: property.id,
        property_title: property.title,
        enquiry_id: enquiry.id,
        agent_id: agent?.id || null,
        customer_id: user?.id || null,
        customer_name: String(customer_name).trim().slice(0, 200),
        customer_email: customer_email ? normalizeEmail(customer_email) : null,
        customer_phone: customer_phone ? normalizePhone(customer_phone) : null,
        requested_date: preferred_inspection_date,
        requested_time: preferred_inspection_time || null,
        sales_representative_id: agent?.user_id || null,
        sales_representative_name: agent?.full_name || property.listing_agent_name || null,
        status: 'pending',
        number_of_attendees: 1,
      });
      inspectionId = inspection.id;

      // Link the inspection back to the enquiry
      await base44.asServiceRole.entities.PropertyEnquiry.update(enquiry.id, {
        inspection_request_id: inspectionId,
        status: 'site_visit_scheduled',
      });
    }

    return Response.json({ success: true, enquiry_id: enquiry.id, reference, inspection_request_id: inspectionId });
  } catch (error) {
    return Response.json({ error: 'Failed to submit enquiry. Please try again.' }, { status: 500 });
  }
}