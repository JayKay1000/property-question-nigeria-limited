import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { getAgentForUser } from '../../shared/marketplace-listings.ts';

/**
 * Returns the enquiry inbox for the authenticated agent.
 * Only enquiries where assigned_to_id matches the agent's user_id are returned.
 * Includes property snapshots and linked inspection request status.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const agent = await getAgentForUser(base44, user.id);
    if (!agent) return Response.json({ error: 'Agent profile not found.' }, { status: 404 });

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get('status') || 'all';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 100);

    // Build query — always scoped to this agent's user_id
    const query: Record<string, any> = { assigned_to_id: user.id };
    if (statusFilter !== 'all') {
      query.status = statusFilter;
    }

    const enquiriesResult = await base44.entities.PropertyEnquiry.filter(query, {
      sort: '-created_date',
      limit,
    });
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

    // Count enquiries by status for summary badges
    const [newCount, contactedCount, scheduledCount, resolvedCount, total] = await Promise.all([
      base44.entities.PropertyEnquiry.count({ assigned_to_id: user.id, status: 'new' }),
      base44.entities.PropertyEnquiry.count({ assigned_to_id: user.id, status: 'contacted' }),
      base44.entities.PropertyEnquiry.count({ assigned_to_id: user.id, status: 'site_visit_scheduled' }),
      base44.entities.PropertyEnquiry.count({ assigned_to_id: user.id, status: 'resolved' }),
      base44.entities.PropertyEnquiry.count({ assigned_to_id: user.id }),
    ]);

    return Response.json({
      enquiries: enquiries.map((e) => ({
        id: e.id,
        reference: e.reference || null,
        property_id: e.property_id,
        property_title: e.property_title,
        inquiry_category: e.inquiry_category || 'general_info',
        questions: e.questions || [],
        customer_name: e.customer_name,
        customer_email: e.customer_email,
        customer_phone: e.customer_phone,
        message: e.message,
        preferred_contact_method: e.preferred_contact_method,
        status: e.status,
        inspection_requested: !!e.inspection_requested,
        preferred_inspection_date: e.preferred_inspection_date || null,
        preferred_inspection_time: e.preferred_inspection_time || null,
        inspection_request_id: e.inspection_request_id || null,
        inspection: e.inspection_request_id ? inspectionMap[e.inspection_request_id] || null : null,
        follow_up_history: e.follow_up_history || [],
        next_follow_up_date: e.next_follow_up_date || null,
        resolved_at: e.resolved_at || null,
        created_date: e.created_date,
        updated_date: e.updated_date,
      })),
      counts: {
        new: newCount,
        contacted: contactedCount,
        scheduled: scheduledCount,
        resolved: resolvedCount,
        total,
      },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to load enquiries.' }, { status: 500 });
  }
}