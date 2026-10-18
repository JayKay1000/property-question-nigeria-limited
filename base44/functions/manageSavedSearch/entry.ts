import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

/**
 * manageSavedSearch — CRUD operations for user saved searches.
 * Called by the frontend (user-scoped). RLS enforces ownership on all ops.
 *
 * Actions: create | update | delete | list
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const action = body.action;

    // --- CREATE ---
    if (action === 'create') {
      if (!body.search_name || !String(body.search_name).trim()) {
        return Response.json({ error: 'search_name is required' }, { status: 400 });
      }
      if (body.filters && body.filters.priceMin != null && body.filters.priceMax != null && body.filters.priceMin > body.filters.priceMax) {
        return Response.json({ error: 'Minimum price cannot exceed maximum price' }, { status: 400 });
      }

      const now = new Date().toISOString();
      const alertsEnabled = !!body.alerts_enabled;

      const search = await base44.entities.SavedSearch.create({
        user_id: user.id,
        search_name: String(body.search_name).trim(),
        search_query: body.search_query || '',
        filters: body.filters || {},
        sort_preference: body.sort_preference || 'newest',
        result_type: 'properties',
        alerts_enabled: alertsEnabled,
        alert_types: body.alert_types || ['new_listing'],
        alert_frequency: body.alert_frequency || 'immediate',
        alert_channels: body.alert_channels || ['in_app'],
        last_match_count: 0,
        // Set baseline to now when alerts are enabled so the first
        // evaluation only catches changes after creation
        last_evaluated_at: alertsEnabled ? now : undefined,
      });
      return Response.json({ ok: true, search: search });
    }

    // --- UPDATE ---
    if (action === 'update') {
      if (!body.search_id) return Response.json({ error: 'search_id is required' }, { status: 400 });

      const update = {};
      if (body.search_name != null) update.search_name = String(body.search_name).trim();
      if (body.filters != null) update.filters = body.filters;
      if (body.sort_preference != null) update.sort_preference = body.sort_preference;
      if (body.alert_types != null) update.alert_types = body.alert_types;
      if (body.alert_frequency != null) update.alert_frequency = body.alert_frequency;
      if (body.alert_channels != null) update.alert_channels = body.alert_channels;

      if (body.alerts_enabled != null) {
        update.alerts_enabled = body.alerts_enabled;
        // If enabling alerts and never evaluated, set baseline to now
        if (body.alerts_enabled) {
          try {
            const existing = await base44.entities.SavedSearch.get(body.search_id);
            if (existing && !existing.last_evaluated_at) {
              update.last_evaluated_at = new Date().toISOString();
            }
          } catch (e) { /* RLS will block if not owner */ }
        }
      }

      // RLS enforces ownership — throws if search_id belongs to another user
      const updated = await base44.entities.SavedSearch.update(body.search_id, update);
      return Response.json({ ok: true, search: updated });
    }

    // --- DELETE ---
    if (action === 'delete') {
      if (!body.search_id) return Response.json({ error: 'search_id is required' }, { status: 400 });

      // RLS enforces ownership
      await base44.entities.SavedSearch.delete(body.search_id);

      // Clean up alert logs for this search (service role for thoroughness)
      try {
        await base44.asServiceRole.entities.SearchAlertLog.deleteMany({
          saved_search_id: body.search_id,
          user_id: user.id
        });
      } catch (e) { /* non-critical */ }

      return Response.json({ ok: true });
    }

    // --- LIST ---
    if (action === 'list') {
      const { items: searches } = await base44.entities.SavedSearch.filter(
        { user_id: user.id },
        { sort: '-created_date', limit: 100 }
      );
      return Response.json({ ok: true, searches: searches });
    }

    return Response.json({ error: 'Invalid action. Use create, update, delete, or list.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}