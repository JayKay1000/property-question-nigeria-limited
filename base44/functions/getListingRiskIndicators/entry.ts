import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";
import { findPotentialDuplicates } from "../../shared/marketplace-listings.ts";

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ error: "Only administrators can view risk indicators." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { listing_id } = body;
    if (!listing_id) return Response.json({ error: "Listing ID is required." }, { status: 400 });

    const listing = await base44.asServiceRole.entities.Property.get(listing_id);
    if (!listing) return Response.json({ error: "Listing not found." }, { status: 404 });

    const indicators: any[] = [];

    // 1. Potential duplicates
    const duplicates = await findPotentialDuplicates(base44, listing);
    if (duplicates.length > 0) {
      indicators.push({
        type: "potential_duplicate",
        label: "Potential duplicate listing",
        severity: "medium",
        count: duplicates.length,
        details: duplicates,
      });
    }

    // 2. Multiple reports against this listing
    const reportsResult = await base44.asServiceRole.entities.ListingReport.filter({
      property_id: listing_id,
      status: { $in: ["new", "under_review", "escalated"] },
    });
    const reports = (reportsResult.items || reportsResult) as any[];
    if (reports.length > 0) {
      indicators.push({
        type: "multiple_reports",
        label: `${reports.length} active report(s) filed against this listing`,
        severity: reports.length >= 3 ? "high" : "medium",
        count: reports.length,
        details: reports.map((r) => ({ report_reason: r.report_reason, status: r.status })),
      });
    }

    // 3. Agent identity not yet verified
    if (listing.listing_agent_id) {
      const agent = await base44.asServiceRole.entities.Agent.get(listing.listing_agent_id).catch(() => null);
      if (agent && agent.identity_verification_status !== "approved") {
        indicators.push({
          type: "agent_unverified",
          label: "Agent identity not yet verified",
          severity: "low",
        });
      }
    }

    // 4. Large price drop since publication (if price was reduced by > 20%)
    // We check the audit log for the original approval price vs current
    // This is a best-effort check — if no audit history is available, skip
    if (listing.published_at && listing.price != null) {
      const auditResult = await base44.asServiceRole.entities.AuditLog.filter({
        action: "marketplace_listing_approved",
        entity_id: listing_id,
      }, { sort: "-event_timestamp", limit: 1 });
      const auditItems = (auditResult.items || auditResult) as any[];
      // We don't store the original price in the audit log details, so we can't
      // compare directly. This indicator requires a price-history entity to be
      // fully reliable — documented as a future enhancement.
    }

    return Response.json({ listing_id, indicators });
  } catch (error) {
    return Response.json({ error: "Failed to load risk indicators." }, { status: 500 });
  }
}