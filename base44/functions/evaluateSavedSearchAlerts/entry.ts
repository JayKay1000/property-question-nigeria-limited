import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  evaluateSearch,
  shouldEvaluateSearch,
  isDigestFrequency
} from '../../shared/saved-search-engine.ts';

/**
 * evaluateSavedSearchAlerts — the Opportunity Radar matching engine.
 *
 * Admin-only (called by the scheduled workflow). For each active saved
 * search with alerts enabled, evaluates matching properties against
 * the canonical marketplace query and delivers alerts for:
 *   - New listings, price reductions, availability changes,
 *     material updates, listings becoming unavailable, status changes.
 *
 * Duplicate suppression via SearchAlertLog prevents re-alerting the same
 * property event. Delivery failures are logged but don't lose the search.
 */
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const adminBase44 = base44.asServiceRole;
    const now = new Date();

    // Get all saved searches with alerts enabled
    const { items: searches } = await adminBase44.entities.SavedSearch.filter(
      { alerts_enabled: true },
      { sort: '-created_date', limit: 500 }
    );

    if (searches.length === 0) {
      return Response.json({
        ok: true,
        stats: { total: 0, evaluated: 0, sent: 0, failed: 0, skipped: 0 }
      });
    }

    // Batch fetch user emails for email delivery
    const userIds = [];
    const seenIds = new Set();
    for (const s of searches) {
      if (s.user_id && !seenIds.has(s.user_id)) {
        userIds.push(s.user_id);
        seenIds.add(s.user_id);
      }
    }

    let emailMap = new Map();
    try {
      const usersResult = await adminBase44.entities.User.filter({ id: { $in: userIds } });
      const users = Array.isArray(usersResult) ? usersResult : (usersResult.items || []);
      for (const u of users) {
        emailMap.set(u.id, u.email);
      }
    } catch (e) { /* User query may fail — email delivery will be skipped */ }

    // Batch fetch notification preferences
    let prefMap = new Map();
    try {
      const { items: prefs } = await adminBase44.entities.NotificationPreference.filter(
        { user_id: { $in: userIds } },
        { limit: 500 }
      );
      for (const p of prefs) {
        prefMap.set(p.user_id, p);
      }
    } catch (e) { /* No preferences — defaults apply */ }

    // Enrich searches with email and preferences
    const enrichedSearches = searches.map(function (s) {
      return {
        ...s,
        user_email: emailMap.get(s.user_id),
        user_pref: prefMap.get(s.user_id),
      };
    });

    const stats = {
      total: enrichedSearches.length,
      evaluated: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    for (const search of enrichedSearches) {
      try {
        if (!shouldEvaluateSearch(search, now)) {
          stats.skipped++;
          continue;
        }

        const since = search.last_evaluated_at || search.created_date || now.toISOString();
        const result = await evaluateSearch(adminBase44, search, since, now);
        stats.evaluated++;
        stats.sent += result.sent;
        stats.failed += result.failed;

        // Update timestamps on the saved search
        const update = {
          last_evaluated_at: now.toISOString(),
          last_match_count: result.sent + result.failed,
        };
        if (result.sent > 0) {
          update.last_alerted_at = now.toISOString();
        }
        if (isDigestFrequency(search)) {
          update.last_digest_sent_at = now.toISOString();
        }

        await adminBase44.entities.SavedSearch.update(search.id, update);
      } catch (e) {
        stats.failed++;
        // Continue to next search — one failure must not stop the run
      }
    }

    return Response.json({ ok: true, stats: stats });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}