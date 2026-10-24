/**
 * Client for the geoService backend gateway.
 *
 * Every function here RESOLVES (never throws) with a normalised result:
 *   { ok: true, ...data }  or  { ok: false, code, message }
 * so callers can render a real error state without try/catch noise.
 *
 * Two safeguards against wasted provider calls and stale UI:
 *  - a short-lived in-memory cache (results the providers permit caching), and
 *  - `createRequestGuard()`, which callers use to drop out-of-order responses
 *    from a fast-typing user.
 */

import { base44 } from '@/api/base44Client';

const CACHE_TTL = {
  capabilities: 60 * 60 * 1000,
  search: 10 * 60 * 1000,
  reverse: 60 * 60 * 1000,
  route: 2 * 60 * 1000,
  nearby: 30 * 60 * 1000,
};

const cache = new Map();
const MAX_ENTRIES = 200;

function cacheGet(key, ttl) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > ttl) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function cacheSet(key, value) {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { at: Date.now(), value });
}

export function clearGeoServiceCache() {
  cache.clear();
}

/** Turns a thrown SDK/axios error into a readable, non-throwing failure. */
function normalizeFailure(error) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (data && typeof data === 'object') {
    return {
      ok: false,
      code: data.code || (status === 429 ? 'RATE_LIMITED' : 'REQUEST_FAILED'),
      message: data.message || data.error || 'The navigation service could not complete that request.',
      directDistanceKm: data.directDistanceKm,
      mode: data.mode,
    };
  }
  if (status === 429) return { ok: false, code: 'RATE_LIMITED', message: 'Too many requests — please wait a moment and try again.' };
  if (status === 401 || status === 403) return { ok: false, code: 'UNAUTHORIZED', message: 'The navigation service refused this request.' };
  if (!error?.response) return { ok: false, code: 'NETWORK_ERROR', message: 'Could not reach the navigation service. Check your connection and try again.' };
  return { ok: false, code: 'SERVER_ERROR', message: 'The navigation service returned an unexpected error.' };
}

async function call(action, payload, cacheKey) {
  if (cacheKey) {
    const cached = cacheGet(cacheKey, CACHE_TTL[action]);
    if (cached) return cached;
  }
  let result;
  try {
    const response = await base44.functions.invoke('geoService', { action, ...payload });
    const data = response?.data;
    result = data && typeof data === 'object' ? data : { ok: false, code: 'EMPTY_RESPONSE', message: 'No response from the navigation service.' };
  } catch (error) {
    result = normalizeFailure(error);
  }
  // Only successful results are cached — a provider failure must be retryable.
  if (cacheKey && result?.ok) cacheSet(cacheKey, result);
  return result;
}

/** Which travel modes and providers are actually available (server-declared, never guessed). */
export function geoCapabilities() {
  return call('capabilities', {});
}

export function searchPlaces(query, { near, limit = 6 } = {}) {
  const trimmed = (query || '').trim();
  if (trimmed.length < 2) {
    return Promise.resolve({ ok: true, results: [], tooShort: true });
  }
  const nearKey = near ? `${near.lat.toFixed(2)},${near.lng.toFixed(2)}` : '-';
  return call('search', { query: trimmed, limit, nearLat: near?.lat, nearLng: near?.lng }, `search:${trimmed.toLowerCase()}:${nearKey}`);
}

export function reverseGeocode(lat, lng) {
  return call('reverse', { lat, lng }, `reverse:${Number(lat).toFixed(5)},${Number(lng).toFixed(5)}`);
}

export function computeRoute({ origin, destination, mode = 'drive' }) {
  if (!origin || !destination) {
    return Promise.resolve({ ok: false, code: 'MISSING_POINT', message: 'Choose both a starting point and a destination.' });
  }
  return call(
    'route',
    { origin, destination, mode },
    `route:${origin.lat.toFixed(5)},${origin.lng.toFixed(5)}:${destination.lat.toFixed(5)},${destination.lng.toFixed(5)}:${mode}`,
  );
}

export function findNearby({ lat, lng, radiusM = 1500, limit = 40 }) {
  return call('nearby', { lat, lng, radiusM, limit }, `nearby:${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}:${radiusM}`);
}

/**
 * Stale-response guard. A caller bumps `next()` before each request and only
 * applies the result when `isLatest(token)` still holds.
 */
export function createRequestGuard() {
  let current = 0;
  return {
    next() {
      current += 1;
      return current;
    },
    isLatest(token) {
      return token === current;
    },
  };
}

/** Debounce helper for autocomplete inputs. */
export function debounce(fn, wait = 350) {
  let timer;
  const wrapped = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  wrapped.cancel = () => clearTimeout(timer);
  return wrapped;
}