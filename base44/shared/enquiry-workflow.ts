/**
 * Shared enquiry and inspection workflow logic — imported by Phase 6 backend functions.
 * Handles status transition validation, reference generation, and enquiry/inspection
 * lifecycle rules. This is the authoritative server-side validation layer.
 */

export const INQUIRY_CATEGORIES = [
  "general_info",
  "pricing",
  "inspection_request",
  "financing",
  "documentation",
  "availability",
  "joint_venture",
  "other",
] as const;

export const ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "site_visit_scheduled",
  "negotiating",
  "closed_won",
  "closed_lost",
  "nurturing",
  "resolved",
] as const;

export const INSPECTION_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rescheduled",
  "no_show",
] as const;

/**
 * Valid status transitions for an enquiry.
 * The agent may move an enquiry forward through the pipeline or mark it resolved.
 * "new" is the initial state set on creation.
 */
const ENQUIRY_TRANSITIONS: Record<string, string[]> = {
  new: ["contacted", "qualified", "site_visit_scheduled", "negotiating", "closed_won", "closed_lost", "nurturing", "resolved"],
  contacted: ["qualified", "site_visit_scheduled", "negotiating", "closed_won", "closed_lost", "nurturing", "resolved"],
  qualified: ["site_visit_scheduled", "negotiating", "closed_won", "closed_lost", "nurturing", "resolved"],
  site_visit_scheduled: ["negotiating", "closed_won", "closed_lost", "nurturing", "resolved"],
  negotiating: ["closed_won", "closed_lost", "nurturing", "resolved"],
  nurturing: ["contacted", "qualified", "site_visit_scheduled", "negotiating", "closed_won", "closed_lost", "resolved"],
  closed_won: ["resolved"],
  closed_lost: ["resolved"],
  resolved: [],
};

/**
 * Valid status transitions for an inspection request.
 *
 * pending     → confirmed, rescheduled, cancelled
 * rescheduled → confirmed, cancelled   (buyer accepts or declines the proposed time)
 * confirmed   → completed, cancelled, no_show
 * completed   → (terminal)
 * cancelled   → (terminal)
 * no_show     → (terminal)
 */
const INSPECTION_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "rescheduled", "cancelled"],
  rescheduled: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function isValidEnquiryTransition(from: string, to: string): boolean {
  if (from === to) return true;
  const allowed = ENQUIRY_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function isValidInspectionTransition(from: string, to: string): boolean {
  if (from === to) return true;
  const allowed = INSPECTION_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function isValidInquiryCategory(cat: string): boolean {
  return (INQUIRY_CATEGORIES as readonly string[]).includes(cat);
}

/**
 * Generates a human-readable enquiry reference from the record ID.
 */
export function generateReference(id: string): string {
  return "ENQ-" + String(id).slice(-8).toUpperCase();
}

/**
 * Actions that an agent can perform on an enquiry via manageEnquiry.
 * Each action is validated server-side for ownership and state.
 */
export const AGENT_ACTIONS = [
  "respond",
  "update_status",
  "propose_inspection",
  "confirm_inspection",
  "decline_inspection",
  "cancel_inspection",
  "complete_inspection",
  "mark_no_show",
  "mark_resolved",
] as const;

/**
 * Actions that a buyer can perform on their inspection via manageBuyerInspection.
 */
export const BUYER_ACTIONS = [
  "accept_proposed_time",
  "cancel_inspection",
  "submit_feedback",
] as const;