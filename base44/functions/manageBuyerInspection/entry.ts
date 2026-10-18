import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { isValidInspectionTransition, BUYER_ACTIONS } from '../../shared/enquiry-workflow.ts';

/**
 * Buyer-side inspection management. All actions are validated server-side:
 * the caller must be the buyer who owns the inspection (customer_id === user.id).
 *
 * Actions:
 *   accept_proposed_time — accept the agent's proposed alternative time (→ confirmed)
 *   cancel_inspection    — cancel the inspection (→ cancelled)
 *   submit_feedback      — leave a rating and notes after a completed inspection
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { inspection_id, action, ...params } = body;

    if (!inspection_id || !action) {
      return Response.json({ error: 'Inspection ID and action are required.' }, { status: 400 });
    }
    if (!(BUYER_ACTIONS as readonly string[]).includes(action)) {
      return Response.json({ error: 'Invalid action.' }, { status: 400 });
    }

    // Fetch the inspection and verify ownership — the buyer must be the customer_id
    const inspection = await base44.asServiceRole.entities.InspectionRequest.get(inspection_id).catch(() => null);
    if (!inspection) {
      return Response.json({ error: 'Inspection request not found.' }, { status: 404 });
    }
    if (inspection.customer_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'You are not authorized to manage this inspection.' }, { status: 403 });
    }

    switch (action) {
      case 'accept_proposed_time': {
        if (!isValidInspectionTransition(inspection.status, 'confirmed')) {
          return Response.json({ error: `Cannot accept a proposed time for an inspection in "${inspection.status}" state.` }, { status: 400 });
        }
        if (!inspection.proposed_date) {
          return Response.json({ error: 'No proposed time to accept.' }, { status: 400 });
        }
        await base44.asServiceRole.entities.InspectionRequest.update(inspection_id, {
          status: 'confirmed',
          confirmed_date: inspection.proposed_date,
          confirmed_time: inspection.proposed_time || null,
        });
        return Response.json({ success: true, inspection_status: 'confirmed' });
      }

      case 'cancel_inspection': {
        if (!isValidInspectionTransition(inspection.status, 'cancelled')) {
          return Response.json({ error: `Cannot cancel an inspection in "${inspection.status}" state.` }, { status: 400 });
        }
        const reason = String(params.reason || '').trim().slice(0, 1000);
        await base44.asServiceRole.entities.InspectionRequest.update(inspection_id, {
          status: 'cancelled',
          cancelled_reason: reason || null,
          cancelled_by: user.id,
        });
        return Response.json({ success: true, inspection_status: 'cancelled' });
      }

      case 'submit_feedback': {
        if (inspection.status !== 'completed') {
          return Response.json({ error: 'Feedback can only be submitted for completed inspections.' }, { status: 400 });
        }
        const rating = Number(params.rating);
        if (!rating || rating < 1 || rating > 5) {
          return Response.json({ error: 'A rating between 1 and 5 is required.' }, { status: 400 });
        }
        const notes = String(params.notes || '').trim().slice(0, 5000);
        await base44.asServiceRole.entities.InspectionRequest.update(inspection_id, {
          feedback_rating: rating,
          feedback_notes: notes || null,
        });
        return Response.json({ success: true });
      }

      default:
        return Response.json({ error: 'Unknown action.' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: 'Failed to process inspection action.' }, { status: 500 });
  }
}