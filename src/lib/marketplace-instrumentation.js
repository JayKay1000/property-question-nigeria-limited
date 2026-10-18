/**
 * Minimal discovery instrumentation for the marketplace.
 * Records search events and property views through existing SearchLog and
 * PropertyView entities. All calls are best-effort and never throw —
 * instrumentation must not break the user experience.
 *
 * Privacy: no personal contact information, full messages, or PII is logged.
 * Anonymous visitors are tracked via a session-scoped random ID stored in
 * sessionStorage (not a persistent cookie).
 */
import { base44 } from '@/api/base44Client';

const SESSION_KEY = 'pq_marketplace_session';
let _sessionId = null;

export function getSessionId() {
  if (_sessionId) return _sessionId;
  try {
    _sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!_sessionId) {
      _sessionId = 'ms-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(SESSION_KEY, _sessionId);
    }
  } catch {
    _sessionId = 'ms-' + Date.now();
  }
  return _sessionId;
}

export function getDeviceType() {
  if (typeof window === 'undefined') return 'unknown';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Logs a marketplace search to the SearchLog entity.
 * Records only the keyword, filter criteria, result count, and an anonymous
 * session ID — never personal contact information or full messages.
 */
export async function logMarketplaceSearch({ query, filters, resultsCount, zeroResults }) {
  try {
    const user = await base44.auth.me().catch(() => null);
    await base44.entities.SearchLog.create({
      search_query: query || '',
      filters: filters || {},
      result_type: 'properties',
      results_count: resultsCount || 0,
      zero_results: !!zeroResults,
      user_id: user?.id || null,
      session_id: getSessionId(),
      device_type: getDeviceType(),
    });
  } catch { /* best-effort */ }
}

/**
 * Logs a property detail view to the PropertyView entity.
 * Records only the property ID, title, viewer ID (if authenticated), and
 * an anonymous device type. No personal contact information is logged.
 */
export async function logPropertyView({ propertyId, propertyTitle, source }) {
  try {
    const user = await base44.auth.me().catch(() => null);
    await base44.entities.PropertyView.create({
      property_id: propertyId,
      property_title: propertyTitle || '',
      viewer_id: user?.id || null,
      view_date: new Date().toISOString(),
      source: source || 'website',
      device_type: getDeviceType(),
    });
  } catch { /* best-effort */ }
}