import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  AGENT_ACTIONS,
  isValidEnquiryTransition,
  isValidInspectionTransition,
} from '../../shared/enquiry-workflow.ts';

/**
 * Agent-side enquiry management. All actions are validated server-side:
 * the caller must be the assigned agent (assigned_to_id === user.id).
 *
 * Actions:
 *   respond               — add a follow-up note to the enquiry
 *   update_status         — change the enquiry pipeline status
 *   propose_inspection    — propose an alternative inspection time (→ rescheduled)
 *   confirm_inspection    — confirm the buyer's requested time (→ confirmed)
 *   decline_inspection    — decline the inspection request (→ cancelled)
 *   cancel_inspection     — cancel a confirmed/pending inspection (→ cancelled)
 *   complete_inspection   — mark the inspection as occurred (→ completed)
 *   mark_no_show          — mark the buyer as not showing up (→ no_show)
 *   mark_resolved         — mark the enquiry as resolved
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { enquiry_id, action, ...params } = body;

    if (!enquiry_id || !action) {
      return Response.json({ error: 'Enquiry ID and action are required.' }, { status: 400 });
    }
    if (!(AGENT_ACTIONS as readonly string[]).includes(action)) {
      return Response.json({ error: 'Invalid action.' }, { status: 400 });
    }

    // Fetch the enquiry and verify ownership — the agent must be the assigned_to_id
    const enquiry = await base44.asServiceRole.entities.PropertyEnquiry.get(enquiry_id).catch(() => null);
    if (!enquiry) {
      return Response.json({ error: 'Enquiry not found.' }, { status: 404 });
    }
    if (enquiry.assigned_to_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'You are not authorized to manage this enquiry.' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const followUpHistory = Array.isArray(enquiry.follow_up_history) ? [...enquiry.follow_up_history] : [];

    switch (action) {
      case 'respond': {
        const note = String(params.note || '').trim();
        if (!note) return Response.json({ error: 'A response note is required.' }, { status: 400 });
        followUpHistory.push({
          action: 'respond',
          by: user.id,
          by_name: user.full_name || user.email,
          note: note.slice(0, 5000),
          timestamp: now,
        });
        const updateData: Record<string, any> = { follow_up_history: followUpHistory };
        // Auto-move from "new" to "contacted" on first response
        if (enquiry.status === 'new') {
          updateData.status = 'contacted';
        }
        await base44.asServiceRole.entities.PropertyEnquiry.update(enquiry_id, updateData);
        return Response.json({ success: true, status: updateData.status || enquiry.status });
      }

      case 'update_status': {
        const newStatus = String(params.status || '').trim();
        if (!isValidEnquiryTransition(enquiry.status, newStatus)) {
          return Response.json({
            error: `Cannot transition enquiry from "${enquiry.status}" to "${newStatus}".`,
          }, { status: 400 });
        }
        followUpHistory.push({
          action: 'status_change',
          by: user.id,
          by_name: user.full_name || user.email,
          from: enquiry.status,
          to: newStatus,
          timestamp: now,
        });
        await base44.asServiceRole.entities.PropertyEnquiry.update(enquiry_id, {
          status: newStatus,
          follow_up_history: followUpHistory,
        });
        return Response.json({ success: true, status: newStatus });
      }

      case 'propose_inspection': {
        if (!enquiry.inspection_request_id) {
          return Response.json({ error: 'No inspection request linked to this enquiry.' }, { status: 400 });
        }
        const inspection = await base44.asServiceRole.entities.InspectionRequest.get(enquiry.inspection_request_id).catch(() => null);
        if (!inspection) {
          return Response.json({ error: 'Inspection request not found.' }, { status: 404 });
        }
        if (!isValidInspectionTransition(inspection.status, 'rescheduled')) {
          return Response.json({ error: `Cannot propose a new time for an inspection in "${inspection.status}" state.` }, { status: 400 });
        }
        const proposedDate = String(params.proposed_date || '').trim();
        const proposedTime = String(params.proposed_time || '').trim();
        if (!proposedDate) {
          return Response.json({ error: 'A proposed date is required.' }, { status: 400 });
        }
        await base44.asServiceRole.entities.InspectionRequest.update(enquiry.inspection_request_id, {
          status: 'rescheduled',
          proposed_date: proposedDate,
          proposed_time: proposedTime || null,
          proposed_by: 'agent',
        });
        followUpHistory.push({
          action: 'propose_inspection',
          by: user.id,
          by_name: user.full_name || user.email,
          proposed_date: proposedDate,
          proposed_time: proposedTime || null,
          timestamp: now,
        });
        await base44.asServiceRole.entities.PropertyEnquiry.update(enquiry_id, { follow_up_history: followUpHistory });
        return Response.json({ success: true, inspection_status: 'rescheduled' });
      }

      case 'confirm_inspection': {
        if (!enquiry.inspection_request_id) {
          return Response.json({ error: 'No inspection request linked to this enquiry.' }, { status: 400 });
        }
        const inspection = await base44.asServiceRole.entities.InspectionRequest.get(enquiry.inspection_request_id).catch(() => null);
        if (!inspection) {
          return Response.json({ error: 'Inspection request not found.' }, { status: 404 });
        }
        if (!isValidInspectionTransition(inspection.status, 'confirmed')) {
          return Response.json({ error: `Cannot confirm an inspection in "${inspection.status}" state.` }, { status: 400 });
        }
        // Confirm the buyer's originally requested time
        await base44.asServiceRole.entities.InspectionRequest.update(enquiry.inspection_request_id, {
          status: 'confirmed',
          confirmed_date: inspection.requested_date,
          confirmed_time: inspection.requested_time || null,
        });
        followUpHistory.push({
          action: 'confirm_inspection',
          by: user.id,
          by_name: user.full_name || user.email,
          confirmed_date: inspection.requested_date,
          timestamp: now,
        });
        await base44.asServiceRole.entities.PropertyEnquiry.update(enquiry_id, {
          status: 'site_visit_scheduled',
          follow_up_history: followUpHistory,
        });
        return Response.json({ success: true, inspection_status: 'confirmed' });
      }

      case 'decline_inspection':
      case 'cancel_inspection': {
        if (!enquiry.inspection_request_id) {
          return Response.json({ error: 'No inspection request linked to this enquiry.' }, { status: 400 });
        }
        const inspection = await base44.asServiceRole.entities.InspectionRequest.get(enquiry.inspection_request_id).catch(() => null);
        if (!inspection) {
          return Response.json({ error: 'Inspection request not found.' }, { status: 404 });
        }
        if (!isValidInspectionTransition(inspection.status, 'cancelled')) {
          return Response.json({ error: `Cannot cancel an inspection in "${inspection.status}" state.` }, { status: 400 });
        }
        const reason = String(params.reason || '').trim().slice(0, 1000);
        await base44.asServiceRole.entities.InspectionRequest.update(enquiry.inspection_request_id, {
          status: 'cancelled',
          cancelled_reason: reason || null,
          cancelled_by: user.id,
        });
        followUpHistory.push({
          action: action === 'decline_inspection' ? 'decline_inspection' : 'cancel_inspection',
          by: user.id,
          by_name: user.full_name || user.email,
          reason: reason || null,
          timestamp: now,
        });
        await base44.asServiceRole.entities.PropertyEnquiry.update(enquiry_id, { follow_up_history: followUpHistory });
        return Response.json({ success: true, inspection_status: 'cancelled' });
      }

      case 'complete_inspection': {
        if (!enquiry.inspection_request_id) {
          return Response.json({ error: 'No inspection request linked to this enquiry.' }, { status: 400 });
        }
        const inspection = await base44.asServiceRole.entities.InspectionRequest.get(enquiry.inspection_request_id).catch(() => null);
        if (!inspection) {
          return Response.json({ error: 'Inspection request not found.' }, { status: 404 });
        }
        if (!isValidInspectionTransition(inspection.status, 'completed')) {
          return Response.json({ error: `Cannot complete an inspection in "${inspection.status}" state.` }, { status: 400 });
        }
        const notes = String(params.notes || '').trim().slice(0, 5000);
        await base44.asServiceRole.entities.InspectionRequest.update(enquiry.inspection_request_id, {
          status: 'completed',
          inspection_notes: notes || inspection.inspection_notes || null,
        });
        followUpHistory.push({
          action: 'complete_inspection',
          by: user.id,
          by_name: user.full_name || user.email,
          notes: notes || null,
          timestamp: now,
        });
        await base44.asServiceRole.entities.PropertyEnquiry.update(enquiry_id, { follow_up_history: followUpHistory });
        return Response.json({ success: true, inspection_status: 'completed' });
      }

      case 'mark_no_show': {
        if (!enquiry.inspection_request_id) {
          return Response.json({ error: 'No inspection request linked to this enquiry.' }, { status: 400 });
        }
        const inspection = await base44.asServiceRole.entities.InspectionRequest.get(enquiry.inspection_request_id).catch(() => null);
        if (!inspection) {
          return Response.json({ error: 'Inspection request not found.' }, { status: 404 });
        }
        if (!isValidInspectionTransition(inspection.status, 'no_show')) {
          return Response.json({ error: `Cannot mark no-show for an inspection in "${inspection.status}" state.` }, { status: 400 });
        }
        await base44.asServiceRole.entities.InspectionRequest.update(enquiry.inspection_request_id, {
          status: 'no_show',
        });
        followUpHistory.push({
          action: 'mark_no_show',
          by: user.id,
          by_name: user.full_name || user.email,
          timestamp: now,
        });
        await base44.asServiceRole.entities.PropertyEnquiry.update(enquiry_id, { follow_up_history: followUpHistory });
        return Response.json({ success: true, inspection_status: 'no_show' });
      }

      case 'mark_resolved': {
        if (!isValidEnquiryTransition(enquiry.status, 'resolved')) {
          return Response.json({ error: `Cannot resolve an enquiry in "${enquiry.status}" state.` }, { status: 400 });
        }
        followUpHistory.push({
          action: 'mark_resolved',
          by: user.id,
          by_name: user.full_name || user.email,
          timestamp: now,
        });
        await base44.asServiceRole.entities.PropertyEnquiry.update(enquiry_id, {
          status: 'resolved',
          resolved_at: now,
          resolved_by: user.id,
          follow_up_history: followUpHistory,
        });
        return Response.json({ success: true, status: 'resolved' });
      }

      default:
        return Response.json({ error: 'Unknown action.' }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: 'Failed to process enquiry action.' }, { status: 500 });
  }
}