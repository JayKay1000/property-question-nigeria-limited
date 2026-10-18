import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

/**
 * Returns the authenticated buyer's own enquiries with linked inspection status.
 * Only enquiries where customer_id matches the user's id are returned.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const enquiriesResult = await base44.entities.PropertyEnquiry.filter(
      { customer_id: user.id },
      { sort: '-created_date', limit: 100 }
    );
    const enquiries = (enquiriesResult.items || enquiriesResult) as any[];

    // Fetch linked inspection requests in one batch
    const inspectionIds = enquiries.map((e) => e.inspection_request_id).filter(Boolean);
    let inspectionMap: Record<string, any> = {};
    if (inspectionIds.length > 0) {
      const inspResult = await base44.entities.InspectionRequest.filter(
        { id: { $in: inspectionIds } },
        { limit: 100 }
      );
      const inspItems = (inspResult.items || inspResult) as any[];
      for (const ins of inspItems) {
        inspectionMap[ins.id] = ins;
      }
    }

    return Response.json({
      enquiries: enquiries.map((e) => ({
        id: e.id,
        reference: e.reference || null,
        property_id: e.property_id,
        property_title: e.property_title,
        inquiry_category: e.inquiry_category || 'general_info',
        questions: e.questions || [],
        message: e.message,
        preferred_contact_method: e.preferred_contact_method,
        status: e.status,
        agent_name: e.agent_name || e.assigned_to_name || null,
        inspection_requested: !!e.inspection_requested,
        inspection_request_id: e.inspection_request_id || null,
        inspection: e.inspection_request_id ? inspectionMap[e.inspection_request_id] || null : null,
        follow_up_history: e.follow_up_history || [],
        resolved_at: e.resolved_at || null,
        created_date: e.created_date,
        updated_date: e.updated_date,
      })),
    });
  } catch (error) {
    return Response.json({ error: 'Failed to load your enquiries.' }, { status: 500 });
  }
}