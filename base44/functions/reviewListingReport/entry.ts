import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { createAuditLog, ACTIVE_PUBLISHED_STATUSES } from "../../shared/marketplace-listings.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ error: "Only administrators can review listing reports." }, { status: 403 });
    }

    const body = await req.json();
    const { report_id, action, review_notes, suspend_listing } = body;

    if (!report_id || !["dismiss", "escalate", "resolve"].includes(action)) {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }

    const report = await base44.asServiceRole.entities.ListingReport.get(report_id);
    if (!report) return Response.json({ error: "Report not found." }, { status: 404 });

    if (report.status === "dismissed" || report.status === "resolved") {
      return Response.json({ error: "This report has already been closed." }, { status: 409 });
    }

    const now = new Date().toISOString();
    const newStatus = action === "dismiss" ? "dismissed" : action === "escalate" ? "escalated" : "resolved";
    const adminAction = suspend_listing ? "listing_suspended" : "none";

    await base44.asServiceRole.entities.ListingReport.update(report_id, {
      status: newStatus,
      reviewed_by: user.id,
      reviewer_name: user.full_name || user.email,
      reviewed_at: now,
      review_notes: review_notes || "",
      admin_action: adminAction,
    });

    // If suspend_listing is true, suspend the property
    if (suspend_listing) {
      const property = await base44.asServiceRole.entities.Property.get(report.property_id).catch(() => null);
      if (property && ACTIVE_PUBLISHED_STATUSES.includes(property.status)) {
        await base44.asServiceRole.entities.Property.update(report.property_id, {
          status: "suspended",
          visibility: "private",
          suspended_at: now,
          suspended_by: user.id,
          suspension_reason: `Suspended due to listing report: ${report.report_reason}`,
        });

        await createAuditLog(base44, {
          action: "marketplace_listing_suspended",
          category: "security",
          module: "properties",
          entity_name: "Property",
          entity_id: report.property_id,
          entity_display_name: report.property_title,
          user_id: user.id,
          user_email: user.email,
          user_role: user.role,
          result: "warning",
          severity: "high",
          details: `Listing suspended due to report ${report_id} (${report.report_reason}).`,
        });
      }
    }

    await createAuditLog(base44, {
      action: "listing_report_" + newStatus,
      category: "security",
      module: "properties",
      entity_name: "ListingReport",
      entity_id: report_id,
      entity_display_name: report.property_title,
      user_id: user.id,
      user_email: user.email,
      user_role: user.role,
      details: `Report ${newStatus} for listing "${report.property_title}". Notes: ${review_notes || "none"}.`,
    });

    return Response.json({ success: true, status: newStatus, admin_action: adminAction });
  } catch (error) {
    return Response.json({ error: "Failed to review report." }, { status: 500 });
  }
}