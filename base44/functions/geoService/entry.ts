/**
 * geoService — the single secure server-side gateway for all geo provider calls.
 *
 * Actions:
 *   capabilities → which travel modes / providers are genuinely available
 *   search       → address & place autocomplete (Nominatim)
 *   reverse      → reverse geocode a coordinate (Nominatim)
 *   route        → origin → destination road route (OSRM) — driving only
 *   nearby       → points of interest around a point (Overpass)
 *
 * WHY A SERVER GATEWAY: provider keys/rate policy and response shaping stay off
 * the client. No secret is required by the providers currently configured, but
 * exposing them directly from the browser would put our User-Agent, caching and
 * rate-limit policy in the visitor's hands and invite abuse of a shared public
 * endpoint. Everything below validates, clamps and rate-limits before any
 * outbound request.
 *
 * AUTH: the GIS map, property pages and route planner are public surfaces, so
 * this endpoint works for anonymous visitors as well as signed-in users — it
 * returns only public geographic data and never reads app entities. Abuse is
 * bounded by the per-client rate limiter below.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import {
  searchPlaces,
  reverseGeocode,
  computeRoute,
  findNearby,
  providerCapabilities,
  isValidLatLng,
  num,
  sanitizeText,
} from '../../shared/geo-providers.ts';

// Best-effort per-client throttle (resets on cold start). The platform's own
// rate limiting remains the primary protection; this bounds expensive provider
// calls from a single client on a warm instance.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMITS: Record<string, number> = { search: 60, reverse: 60, route: 60, nearby: 12, capabilities: 120 };

function clientKey(req: Request): string {
  const ip =
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-real-ip') ||
    (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() ||
    'unknown';
  return ip || 'unknown';
}

function throttled(req: Request, action: string): boolean {
  const key = `${clientKey(req)}:${action}`;
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  const limit = LIMITS[action] ?? 30;
  if (recent.length >= limit) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 2000) hits.clear();
  return false;
}

export default async function (req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    // Auth is optional on this public surface — never let it block a visitor.
    await base44.auth.me().catch(() => null);

    const body = await req.json().catch(() => ({}));
    const action = sanitizeText(body?.action, 20);

    if (!action || !LIMITS[action]) {
      return Response.json({ error: 'Unknown action', allowed: Object.keys(LIMITS) }, { status: 400 });
    }

    if (throttled(req, action)) {
      return Response.json(
        { ok: false, code: 'RATE_LIMITED', error: 'Too many requests. Please wait a moment and try again.' },
        { status: 429 },
      );
    }

    if (action === 'capabilities') {
      return Response.json({ ok: true, ...providerCapabilities() });
    }

    if (action === 'search') {
      const result = await searchPlaces(sanitizeText(body?.query, 200), {
        limit: num(body?.limit) ?? 6,
        near: isValidLatLng(body?.nearLat, body?.nearLng) ? { lat: num(body.nearLat) as number, lng: num(body.nearLng) as number } : undefined,
      });
      if (!result.ok) return Response.json({ ok: false, ...result }, { status: result.code === 'QUERY_TOO_SHORT' ? 400 : 503 });
      return Response.json({ ok: true, attribution: '© OpenStreetMap contributors', ...result });
    }

    if (action === 'reverse') {
      const lat = num(body?.lat);
      const lng = num(body?.lng);
      if (!isValidLatLng(lat, lng)) {
        return Response.json({ ok: false, code: 'INVALID_COORDINATES', error: 'Invalid coordinates.' }, { status: 400 });
      }
      const result = await reverseGeocode(lat as number, lng as number);
      if (!result.ok) {
        return Response.json({ ok: false, ...result }, { status: result.code === 'INVALID_COORDINATES' ? 400 : result.code === 'NO_ADDRESS' ? 404 : 503 });
      }
      return Response.json({ ok: true, ...result });
    }

    if (action === 'route') {
      const origin = { lat: num(body?.origin?.lat), lng: num(body?.origin?.lng) };
      const destination = { lat: num(body?.destination?.lat), lng: num(body?.destination?.lng) };
      const result = await computeRoute({
        origin: { lat: origin.lat as number, lng: origin.lng as number },
        destination: { lat: destination.lat as number, lng: destination.lng as number },
        mode: sanitizeText(body?.mode, 20) || 'drive',
      });
      if (!result.ok) {
        const status = result.code === 'INVALID_ORIGIN' || result.code === 'INVALID_DESTINATION' ? 400 : result.code === 'UNSUPPORTED_MODE' || result.code === 'NO_ROUTE' ? 422 : 503;
        return Response.json({ ok: false, ...result }, { status });
      }
      return Response.json({ ok: true, ...result });
    }

    if (action === 'nearby') {
      const result = await findNearby({
        lat: num(body?.lat) as number,
        lng: num(body?.lng) as number,
        radiusM: num(body?.radiusM) ?? 3000,
        limit: num(body?.limit) ?? 60,
      });
      if (!result.ok) {
        return Response.json({ ok: false, ...result }, { status: result.code === 'INVALID_COORDINATES' ? 400 : 503 });
      }
      return Response.json({ ok: true, ...result });
    }

    return Response.json({ error: 'Unhandled action' }, { status: 400 });
  } catch (error) {
    return Response.json({ ok: false, code: 'SERVER_ERROR', error: (error as Error)?.message || 'Unexpected server error' }, { status: 500 });
  }
}