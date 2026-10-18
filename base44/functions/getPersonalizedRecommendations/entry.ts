import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { rankProperties, ELIGIBLE_STATUSES, type TasteProfile } from "../../shared/taste-engine.ts";

/**
 * Returns personalized property recommendations for the current user.
 *
 * Authenticated users: reads their PropertyTasteProfile from the database
 * (RLS-protected — only the owner's profile is visible), fetches eligible
 * public listings, scores them, and returns ranked results with explanations.
 *
 * Anonymous visitors: uses a session-level profile passed in the request body
 * (non-persistent — never reads another user's saved preferences).
 *
 * If personalization is disabled or no profile exists, returns an empty list
 * with a flag so the frontend can fall back to the regular marketplace.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    let profile: TasteProfile | null = null;
    let excludedIds = new Set<string>();
    let isAnonymous = !user;

    if (user) {
      // Fetch the user's taste profile (RLS ensures only own profile is visible)
      const profileResult = await base44.entities.PropertyTasteProfile.filter(
        { user_id: user.id },
        { limit: 1 }
      );
      profile = (profileResult.items && profileResult.items[0]) || null;

      if (profile && profile.personalization_enabled === false) {
        return Response.json({
          recommendations: [],
          personalizationEnabled: false,
          needsOnboarding: false,
        });
      }

      if (!profile || (!profile.onboarding_completed && !profile.onboarding_skipped)) {
        // No completed profile — user needs onboarding
        return Response.json({
          recommendations: [],
          personalizationEnabled: true,
          needsOnboarding: true,
        });
      }

      // Fetch dismissed properties (not_interested / too_expensive) to exclude
      const feedbackResult = await base44.entities.PropertyFeedback.filter(
        { user_id: user.id, feedback_type: { $in: ["not_interested", "too_expensive"] } },
        { limit: 200, fields: ["property_id"] }
      );
      (feedbackResult.items || []).forEach((f: any) => {
        if (f.property_id) excludedIds.add(f.property_id);
      });
    } else {
      // Anonymous — use session profile from request body
      const body = await req.json().catch(() => ({}));
      if (body.session_profile) {
        profile = body.session_profile as TasteProfile;
        if (body.excluded_ids && Array.isArray(body.excluded_ids)) {
          body.excluded_ids.forEach((id: string) => excludedIds.add(id));
        }
      }
    }

    if (!profile) {
      return Response.json({
        recommendations: [],
        personalizationEnabled: true,
        needsOnboarding: !isAnonymous,
      });
    }

    // Build query for eligible public listings
    const query: any = {
      visibility: "public",
      status: { $in: ELIGIBLE_STATUSES },
    };

    // Transaction purpose — hard filter
    if (profile.transaction_purpose && profile.transaction_purpose !== "any") {
      query.listing_purpose = profile.transaction_purpose;
    }

    // Budget max — hard filter with 15% margin (don't show properties way above budget)
    if (profile.budget_max_ngn != null) {
      query.price = { $lte: profile.budget_max_ngn * 1.15 };
    }

    // Fetch eligible properties (public read — works for both auth and anon)
    const propertyResult = await base44.entities.Property.filter(
      query,
      {
        sort: "-created_date",
        limit: 100,
        fields: [
          "id", "title", "price", "currency", "listing_purpose", "property_type",
          "bedrooms", "bathrooms", "toilets", "parking_spaces", "state", "city",
          "lga", "district", "estate", "amenities", "image_urls", "featured_image_url",
          "property_condition", "furnishing_status", "description", "view_count",
          "created_date", "is_featured", "is_premium", "availability_status",
          "status", "visibility", "suspended_at", "latitude", "longitude",
          "land_size_sqm", "built_up_area_sqm", "slug",
        ],
      }
    );

    const properties = propertyResult.items || [];

    // Rank by preference score
    const ranked = rankProperties(properties, profile, excludedIds);

    // Return top 12 with explanations
    const topRecommendations = ranked.slice(0, 12);

    return Response.json({
      recommendations: topRecommendations,
      personalizationEnabled: true,
      needsOnboarding: false,
      profile: {
        transaction_purpose: profile.transaction_purpose,
        priority: profile.priority,
        preferred_locations: profile.preferred_locations,
        budget_max_ngn: profile.budget_max_ngn,
      },
      totalEligible: properties.length,
      totalScored: ranked.length,
      isAnonymous,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}