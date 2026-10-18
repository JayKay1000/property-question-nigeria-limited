import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

/**
 * Creates, updates, resets, or disables the current user's PropertyTasteProfile.
 *
 * Actions:
 *   save            — create or update preferences (marks onboarding completed)
 *   skip_onboarding — dismiss the onboarding prompt (personalization stays off)
 *   reset           — clear all preferences back to defaults (keeps personalization on)
 *   disable         — turn off personalization
 *   enable          — turn personalization back on
 *
 * Requires authentication — preferences belong to the authenticated user only.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, preferences } = body;
    const now = new Date().toISOString();

    // Find existing profile
    const existingResult = await base44.entities.PropertyTasteProfile.filter(
      { user_id: user.id },
      { limit: 1 }
    );
    const existing = existingResult.items?.[0];

    if (action === "reset") {
      const defaultProfile = {
        user_id: user.id,
        transaction_purpose: "any",
        preferred_locations: [],
        preferred_property_types: [],
        budget_min_ngn: null,
        budget_max_ngn: null,
        min_bedrooms: null,
        preferred_amenities: [],
        condition_preference: null,
        furnishing_preference: null,
        priority: "balanced",
        personalization_enabled: true,
        onboarding_completed: false,
        onboarding_completed_at: null,
        onboarding_skipped: false,
        onboarding_skipped_at: null,
        last_updated_at: now,
      };
      if (existing) {
        await base44.entities.PropertyTasteProfile.update(existing.id, defaultProfile);
      } else {
        await base44.entities.PropertyTasteProfile.create(defaultProfile);
      }
      return Response.json({ profile: defaultProfile, action: "reset" });
    }

    if (action === "disable") {
      if (existing) {
        await base44.entities.PropertyTasteProfile.update(existing.id, {
          personalization_enabled: false,
          last_updated_at: now,
        });
      } else {
        await base44.entities.PropertyTasteProfile.create({
          user_id: user.id,
          personalization_enabled: false,
          last_updated_at: now,
        });
      }
      return Response.json({ personalizationEnabled: false });
    }

    if (action === "enable") {
      if (existing) {
        await base44.entities.PropertyTasteProfile.update(existing.id, {
          personalization_enabled: true,
          last_updated_at: now,
        });
      }
      return Response.json({ personalizationEnabled: true });
    }

    if (action === "skip_onboarding") {
      const skipData = {
        user_id: user.id,
        onboarding_skipped: true,
        onboarding_skipped_at: now,
        personalization_enabled: false,
        last_updated_at: now,
      };
      if (existing) {
        await base44.entities.PropertyTasteProfile.update(existing.id, skipData);
      } else {
        await base44.entities.PropertyTasteProfile.create(skipData);
      }
      return Response.json({ skipped: true });
    }

    // action === "save"
    const profileData = {
      user_id: user.id,
      transaction_purpose: preferences.transaction_purpose || "any",
      preferred_locations: preferences.preferred_locations || [],
      preferred_property_types: preferences.preferred_property_types || [],
      budget_min_ngn: preferences.budget_min_ngn ?? null,
      budget_max_ngn: preferences.budget_max_ngn ?? null,
      min_bedrooms: preferences.min_bedrooms ?? null,
      preferred_amenities: preferences.preferred_amenities || [],
      condition_preference: preferences.condition_preference || null,
      furnishing_preference: preferences.furnishing_preference || null,
      priority: preferences.priority || "balanced",
      onboarding_completed: true,
      onboarding_completed_at: now,
      onboarding_skipped: false,
      personalization_enabled: true,
      last_updated_at: now,
    };

    if (existing) {
      const updated = await base44.entities.PropertyTasteProfile.update(existing.id, profileData);
      return Response.json({ profile: updated, action: "updated" });
    } else {
      const created = await base44.entities.PropertyTasteProfile.create(profileData);
      return Response.json({ profile: created, action: "created" });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}