import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

/**
 * Records a user's feedback on a recommended property and, when the feedback
 * expresses a clear preference intent, updates the user's explicit taste
 * profile preferences accordingly.
 *
 * Feedback types:
 *   like, save_for_later — recorded (saving uses the existing toggleSavedProperty
 *                          function separately from the frontend)
 *   not_interested        — recorded; property excluded from future recommendations
 *   too_expensive         — recorded; property excluded from future recommendations
 *   show_similar          — recorded; no preference change (frontend handles search)
 *   prefer_location       — recorded; adds the property's location to preferred_locations
 *   prefer_type           — recorded; adds the property's type to preferred_property_types
 *
 * "A click alone must not be treated as proof of preference." Only prefer_location
 * and prefer_type update explicit preferences — they are explicit intent actions
 * (the button literally states the preference). not_interested and too_expensive
 * are suppression signals, not preference additions.
 *
 * Requires authentication.
 */
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const {
      property_id,
      property_title,
      feedback_type,
      location_value,
      property_type_value,
    } = body;

    if (!property_id || !feedback_type) {
      return Response.json({ error: "property_id and feedback_type are required" }, { status: 400 });
    }

    // Record the feedback event
    await base44.entities.PropertyFeedback.create({
      user_id: user.id,
      property_id,
      property_title,
      feedback_type,
      location_value: location_value || null,
      property_type_value: property_type_value || null,
      created_at: new Date().toISOString(),
    });

    // Update explicit preferences only for clear intent actions
    const profileResult = await base44.entities.PropertyTasteProfile.filter(
      { user_id: user.id },
      { limit: 1 }
    );
    const profile = profileResult.items?.[0];

    let preferenceUpdated = false;
    let updatedField = null;

    if (profile) {
      const updates: any = {};
      const now = new Date().toISOString();

      if (feedback_type === "prefer_location" && location_value) {
        const locations = profile.preferred_locations || [];
        if (!locations.includes(location_value)) {
          updates.preferred_locations = [...locations, location_value];
          preferenceUpdated = true;
          updatedField = "preferred_locations";
        }
      }

      if (feedback_type === "prefer_type" && property_type_value) {
        const types = profile.preferred_property_types || [];
        if (!types.includes(property_type_value)) {
          updates.preferred_property_types = [...types, property_type_value];
          preferenceUpdated = true;
          updatedField = "preferred_property_types";
        }
      }

      if (preferenceUpdated) {
        updates.last_updated_at = now;
        await base44.entities.PropertyTasteProfile.update(profile.id, updates);
      }
    }

    return Response.json({
      recorded: true,
      feedback_type,
      preferenceUpdated,
      updatedField,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}