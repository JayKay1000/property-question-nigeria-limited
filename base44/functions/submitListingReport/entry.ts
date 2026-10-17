import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { normalizePhone, normalizeEmail } from "../../shared/marketplace-tiers.ts";
import { isPubliclyVisible, createAuditLog } from "../../shared/marketplace-listings.ts";

const VALID_REASONS = [
  "scam_impersonation",
  "incorrect_details",
  "duplicate",
  "no_longer_available",
  "unauthorized_advertising",
  "suspicious_payment",
  "other",
];

// Simple in-memory rate limiting per IP+property (resets on cold start).
// This is a best-effort throttle; the platform's own rate limiting provides the
// primary protection. This adds a per-property spam guard on top.
const recentReports: Map<string, number> = new Map();
const THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);

    const body = await req.json().catch(() => ({}));
    const { property_id, report_reason, description, reporter_name, reporter_email, reporter_phone } = body;

    if (!property_id || !report_reason || !description) {
      return Response.json({ error: "Property ID, reason, and description are required." }, { status: 400 });
    }
    if (!VALID_REASONS.includes(report_reason)) {
      return Response.json({ error: "Invalid report reason." }, { status: 400 });
    }
    if (String(description).trim().length < 10) {
      return Response.json({ error: "Please provide a description of at least 10 characters." }, { status: 400 });
    }

    // Verify the property exists and is publicly visible — prevents arbitrary property IDs
    const property = await base44.asServiceRole.entities.Property.get(property_id).catch(() => null);
    if (!property || !isPubliclyVisible(property)) {
      return Response.json({ error: "Property not found or no longer available." }, { status: 404 });
    }

    // Rate limiting: one report per property per 5 minutes from the same source
    // Use reporter email or a session marker; fall back to "anon" if nothing
    const rateKey = `${property_id}:${reporter_email || reporter_phone || "anon"}`;
    const lastReport = recentReports.get(rateKey);
    const now = Date.now();
    if (lastReport && now - lastReport < THROTTLE_MS) {
      return Response.json({ error: "You have already reported this listing recently. Please wait a few minutes." }, { status: 429 });
    }
    recentReports.set(rateKey, now);
    // Clean old entries occasionally
    if (recentReports.size > 500) {
      for (const [k, t] of recentReports) {
        if (now - t > THROTTLE_MS) recentReports.delete(k);
      }
    }

    // Determine if the reporter is an authenticated user (optional)
    let reporterUserId: string | undefined;
    try {
      const user = await base44.auth.me();
      if (user) reporterUserId = user.id;
    } catch {
      // Not authenticated — that's fine, reports are anonymous-capable
    }

    const report = await base44.asServiceRole.entities.ListingReport.create({
      property_id,
      property_title: property.title,
      report_reason,
      description: String(description).trim().slice(0, 2000),
      reporter_name: reporter_name ? String(reporter_name).trim().slice(0, 200) : "",
      reporter_email: reporter_email ? normalizeEmail(reporter_email) : "",
      reporter_phone: reporter_phone ? normalizePhone(reporter_phone) : "",
      reporter_user_id: reporterUserId || "",
      status: "new",
      admin_action: "none",
    });

    // Audit log — do NOT include reporter contact details in the log
    await createAuditLog(base44, {
      action: "listing_report_submitted",
      category: "security",
      module: "properties",
      entity_name: "ListingReport",
      entity_id: report.id,
      entity_display_name: property.title,
      result: "success",
      severity: "medium",
      details: `Report submitted for listing "${property.title}" — reason: ${report_reason}.`,
    });

    return Response.json({ success: true, report_id: report.id });
  } catch (error) {
    return Response.json({ error: "Failed to submit report." }, { status: 500 });
  }
}