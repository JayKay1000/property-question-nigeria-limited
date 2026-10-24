/**
 * Shared geo provider layer for the PQNL GIS, Smart Navigation & Directions system.
 *
 * PROVIDERS (all keyless OpenStreetMap-based; chosen because no Google Maps
 * Platform credentials are configured for this app):
 *   - Nominatim  → address / place search + reverse geocoding
 *   - OSRM       → road route geometry, distance and duration
 *   - Overpass   → nearby places / points of interest
 *
 * HONESTY CONTRACT (enforced here, not in the UI):
 *   - The public OSRM demo server serves a single CAR profile. It returns the
 *     same car route for /foot, /bike and /driving, so walking, cycling and
 *     motorcycle routes are reported as UNSUPPORTED rather than shown as if
 *     they were real. Callers receive `directDistanceKm` (straight-line only,
 *     no duration) so the UI can be explicit about that distinction.
 *   - No route result is ever synthesised. If a provider fails, we fail.
 *   - OSRM has no live traffic feed, so every route is marked
 *     `trafficAware: false` and must be described as an estimate.
 *
 * ATTRIBUTION / USAGE POLICY: © OpenStreetMap contributors (ODbL). All three
 * providers require a descriptive User-Agent, conservative request rates and
 * caching. Nominatim calls are serialised to >= 1.1s apart and results are
 * cached in-process; route and place results are cached with short TTLs.
 */

export const OSM_ATTRIBUTION = '© OpenStreetMap contributors';
export const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
export const OSRM_DRIVING_URL = 'https://router.project-osrm.org/route/v1/driving';
// Primary Overpass instance plus one independent mirror, tried in order.
export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const USER_AGENT = 'PQNL-PropertyQuestion/1.0 (+https://propertyquestion.net)';

/** Travel modes and whether the configured provider genuinely serves them. */
export const ROUTING_MODES = [
  { id: 'drive', label: 'Driving', supported: true, providerProfile: 'driving' },
  { id: 'walk', label: 'Walking', supported: false, providerProfile: null },
  { id: 'cycle', label: 'Cycling', supported: false, providerProfile: null },
  { id: 'motorcycle', label: 'Motorcycle', supported: false, providerProfile: null },
] as const;

export function supportedModeIds(): string[] {
  return ROUTING_MODES.filter((m) => m.supported).map((m) => m.id);
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

export function isValidLatLng(lat: unknown, lng: unknown): boolean {
  const a = typeof lat === 'string' ? Number(lat) : lat;
  const b = typeof lng === 'string' ? Number(lng) : lng;
  return (
    typeof a === 'number' && typeof b === 'number' &&
    Number.isFinite(a) && Number.isFinite(b) &&
    a >= -90 && a <= 90 && b >= -180 && b <= 180 &&
    a !== 0 && b !== 0 // (0,0) is the null island — never a real Nigerian property
  );
}

export function num(value: unknown): number | null {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
}

/** Trims, collapses whitespace and hard-caps length before any provider call. */
export function sanitizeText(value: unknown, max = 200): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

// ---------------------------------------------------------------------------
// In-process caches (respect provider caching terms; survive warm instances)
// ---------------------------------------------------------------------------

type CacheEntry = { at: number; value: unknown };
const geocodeCache = new Map<string, CacheEntry>();
const routeCache = new Map<string, CacheEntry>();
const nearbyCache = new Map<string, CacheEntry>();
const GEOCODE_TTL = 24 * 60 * 60 * 1000;
const ROUTE_TTL = 5 * 60 * 1000;
const NEARBY_TTL = 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 400;

function cacheGet(cache: Map<string, CacheEntry>, key: string, ttl: number): unknown | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > ttl) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function cacheSet(cache: Map<string, CacheEntry>, key: string, value: unknown): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { at: Date.now(), value });
}

// ---------------------------------------------------------------------------
// Nominatim — serialised to respect the 1 request/second usage policy
// ---------------------------------------------------------------------------

let nominatimChain: Promise<unknown> = Promise.resolve();
let lastNominatimAt = 0;

function nominatimFetch(url: string): Promise<Response> {
  const run = async (): Promise<Response> => {
    const wait = Math.max(0, 1100 - (Date.now() - lastNominatimAt));
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastNominatimAt = Date.now();
    return fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(12000),
    });
  };
  const next = nominatimChain.then(run, run);
  nominatimChain = next.catch(() => undefined);
  return next;
}

export type PlaceResult = {
  id: string;
  label: string;
  shortLabel: string;
  lat: number;
  lng: number;
  category: string;
  type: string;
  source: 'nominatim';
};

function toPlaceResult(raw: any): PlaceResult | null {
  const lat = num(raw?.lat);
  const lng = num(raw?.lon);
  if (!isValidLatLng(lat, lng)) return null;
  const label = sanitizeText(raw?.display_name, 300);
  return {
    id: `${raw?.osm_type || 'osm'}-${raw?.osm_id || label}`,
    label,
    shortLabel: sanitizeText(raw?.name, 120) || label.split(',')[0] || 'Selected location',
    lat: lat as number,
    lng: lng as number,
    category: sanitizeText(raw?.category, 40) || 'place',
    type: sanitizeText(raw?.type, 40) || 'place',
    source: 'nominatim',
  };
}

export async function searchPlaces(query: string, options: { limit?: number; near?: { lat: number; lng: number } } = {}) {
  const q = sanitizeText(query, 200);
  if (q.length < 2) {
    return { ok: false as const, code: 'QUERY_TOO_SHORT', message: 'Enter at least 2 characters to search.' };
  }
  const limit = Math.min(Math.max(options.limit ?? 6, 1), 8);
  const key = `s:${q.toLowerCase()}:${limit}:${options.near ? `${options.near.lat.toFixed(2)},${options.near.lng.toFixed(2)}` : ''}`;
  const cached = cacheGet(geocodeCache, key, GEOCODE_TTL);
  if (cached) return { ok: true as const, results: cached as PlaceResult[], cached: true };

  const params = new URLSearchParams({
    format: 'jsonv2',
    q,
    limit: String(limit),
    addressdetails: '1',
    dedupe: '1',
    'accept-language': 'en',
  });
  if (options.near && isValidLatLng(options.near.lat, options.near.lng)) {
    // Soft bias (~50km box) — never bounded, so an exact address still wins.
    const d = 0.45;
    params.set('viewbox', [options.near.lng - d, options.near.lat + d, options.near.lng + d, options.near.lat - d].join(','));
  }

  let res: Response;
  try {
    res = await nominatimFetch(`${NOMINATIM_URL}/search?${params.toString()}`);
  } catch (error) {
    return { ok: false as const, code: 'PROVIDER_UNREACHABLE', message: 'Location search is temporarily unavailable.', detail: (error as Error)?.message };
  }
  if (!res.ok) {
    return { ok: false as const, code: res.status === 429 ? 'PROVIDER_RATE_LIMITED' : 'PROVIDER_ERROR', message: res.status === 429 ? 'Too many location searches — please wait a moment.' : 'Location search provider returned an error.', status: res.status };
  }
  const raw = await res.json().catch(() => null);
  const results = (Array.isArray(raw) ? raw : []).map(toPlaceResult).filter(Boolean) as PlaceResult[];
  cacheSet(geocodeCache, key, results);
  return { ok: true as const, results };
}

export async function reverseGeocode(lat: number, lng: number) {
  if (!isValidLatLng(lat, lng)) {
    return { ok: false as const, code: 'INVALID_COORDINATES', message: 'Those coordinates are not a valid location.' };
  }
  const key = `r:${lat.toFixed(5)},${lng.toFixed(5)}`;
  const cached = cacheGet(geocodeCache, key, GEOCODE_TTL);
  if (cached) return { ok: true as const, result: cached as PlaceResult, cached: true };

  const params = new URLSearchParams({ format: 'jsonv2', lat: String(lat), lon: String(lng), zoom: '16', addressdetails: '1' });
  let res: Response;
  try {
    res = await nominatimFetch(`${NOMINATIM_URL}/reverse?${params.toString()}`);
  } catch (error) {
    return { ok: false as const, code: 'PROVIDER_UNREACHABLE', message: 'Address lookup is temporarily unavailable.', detail: (error as Error)?.message };
  }
  if (!res.ok) {
    return { ok: false as const, code: 'PROVIDER_ERROR', message: 'Address lookup provider returned an error.', status: res.status };
  }
  const raw = await res.json().catch(() => null);
  const result = raw && raw.lat ? toPlaceResult(raw) : null;
  if (!result) {
    return { ok: false as const, code: 'NO_ADDRESS', message: 'No address found at that point.' };
  }
  cacheSet(geocodeCache, key, result);
  return { ok: true as const, result };
}

// ---------------------------------------------------------------------------
// OSRM — genuine road routing for the driving profile only
// ---------------------------------------------------------------------------

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type RouteOption = {
  index: number;
  label: string;
  distanceKm: number;
  durationMinutes: number;
  geometry: [number, number][];
};

export async function computeRoute(params: { origin: { lat: number; lng: number }; destination: { lat: number; lng: number }; mode?: string }) {
  const { origin, destination } = params;
  const mode = sanitizeText(params.mode, 20) || 'drive';

  if (!isValidLatLng(origin?.lat, origin?.lng)) {
    return { ok: false as const, code: 'INVALID_ORIGIN', message: 'The starting location is not a valid coordinate. Search for a place or pick a point on the map.' };
  }
  if (!isValidLatLng(destination?.lat, destination?.lng)) {
    return { ok: false as const, code: 'INVALID_DESTINATION', message: 'This property has no usable coordinates, so a route cannot be computed.' };
  }

  const directDistanceKm = haversineKm(origin.lat, origin.lng, destination.lat, destination.lng);
  const modeConfig = ROUTING_MODES.find((m) => m.id === mode);

  // Refuse to fake a mode the provider does not serve. Straight-line distance
  // is returned so the UI can state it explicitly as a direct distance.
  if (!modeConfig || !modeConfig.supported || !modeConfig.providerProfile) {
    return {
      ok: false as const,
      code: 'UNSUPPORTED_MODE',
      mode,
      directDistanceKm,
      message: `Road ${modeConfig?.label?.toLowerCase() || mode} routing is not available from the configured provider. Use "Open in Google Maps" for that travel mode.`,
    };
  }

  const key = `d:${origin.lat.toFixed(5)},${origin.lng.toFixed(5)}:${destination.lat.toFixed(5)},${destination.lng.toFixed(5)}`;
  const cached = cacheGet(routeCache, key, ROUTE_TTL);
  if (cached) return { ok: true as const, ...(cached as object) };

  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const params2 = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    alternatives: '2',
    steps: 'false',
    annotations: 'false',
  });

  let res: Response;
  try {
    res = await fetch(`${OSRM_DRIVING_URL}/${coords}?${params2.toString()}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    return { ok: false as const, code: 'PROVIDER_UNREACHABLE', message: 'The routing service could not be reached. Check your connection and try again.', detail: (error as Error)?.message, directDistanceKm };
  }
  if (!res.ok) {
    return { ok: false as const, code: res.status === 429 ? 'PROVIDER_RATE_LIMITED' : 'PROVIDER_ERROR', message: res.status === 429 ? 'Too many routing requests — please wait a moment.' : 'The routing service returned an error.', status: res.status, directDistanceKm };
  }

  const json = await res.json().catch(() => null);
  if (!json || json.code !== 'Ok' || !Array.isArray(json.routes) || json.routes.length === 0) {
    return {
      ok: false as const,
      code: 'NO_ROUTE',
      message: 'No drivable route was found between those points. The destination may be unreachable by road or the coordinates may be approximate.',
      directDistanceKm,
    };
  }

  const routes: RouteOption[] = json.routes
    .filter((r: any) => r?.distance > 0 && Array.isArray(r?.geometry?.coordinates))
    .map((r: any, i: number) => ({
      index: i,
      label: '',
      distanceKm: Math.round((r.distance / 1000) * 100) / 100,
      durationMinutes: Math.max(1, Math.round(r.duration / 60)),
      geometry: r.geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]),
    }));

  if (routes.length === 0) {
    return { ok: false as const, code: 'NO_ROUTE', message: 'No drivable route was found between those points.', directDistanceKm };
  }

  routes.sort((a, b) => a.durationMinutes - b.durationMinutes);
  routes.forEach((r, i) => {
    r.index = i;
    r.label = i === 0 ? 'Fastest route' : `Alternative ${i}`;
  });

  const payload = {
    provider: 'osrm',
    providerLabel: 'OSRM / OpenStreetMap road network',
    attribution: OSM_ATTRIBUTION,
    mode: 'drive',
    trafficAware: false,
    estimated: true,
    disclaimer: 'Estimated from OpenStreetMap road data. No live traffic is included.',
    directDistanceKm: Math.round(directDistanceKm * 100) / 100,
    routes,
  };
  cacheSet(routeCache, key, payload);
  return { ok: true as const, ...payload };
}

// ---------------------------------------------------------------------------
// Overpass — nearby places / points of interest
// ---------------------------------------------------------------------------

/** OSM tags → PQNL place categories (keys align with the map icon config). */
const AMENITY_MAP: Record<string, string> = {
  hospital: 'hospital', clinic: 'hospital', doctors: 'hospital', pharmacy: 'pharmacy',
  school: 'school', college: 'university', university: 'university', kindergarten: 'school',
  bank: 'bank', atm: 'atm', bureau_de_change: 'bank',
  restaurant: 'restaurant', cafe: 'restaurant', fast_food: 'restaurant',
  marketplace: 'market', police: 'police_station', fire_station: 'fire_station',
  townhall: 'government_office', courthouse: 'government_office', post_office: 'government_office',
  fuel: 'fuel_station', place_of_worship: 'place_of_worship',
  bus_station: 'bus_stop', ferry_terminal: 'bus_stop', taxi: 'bus_stop',
  cinema: 'tourist_attraction', theatre: 'tourist_attraction', community_centre: 'government_office',
};
const SHOP_MAP: Record<string, string> = {
  supermarket: 'shopping_mall', mall: 'shopping_mall', department_store: 'shopping_mall',
  convenience: 'market', wholesale: 'market',
};
const LEISURE_MAP: Record<string, string> = { park: 'park', stadium: 'stadium', sports_centre: 'stadium', pitch: 'stadium', garden: 'park' };
const TOURISM_MAP: Record<string, string> = { hotel: 'hotel', museum: 'tourist_attraction', attraction: 'tourist_attraction', viewpoint: 'tourist_attraction' };

function classifyPlace(tags: any): string | null {
  if (!tags) return null;
  if (tags.amenity && AMENITY_MAP[tags.amenity]) return AMENITY_MAP[tags.amenity];
  if (tags.shop && SHOP_MAP[tags.shop]) return SHOP_MAP[tags.shop];
  if (tags.leisure && LEISURE_MAP[tags.leisure]) return LEISURE_MAP[tags.leisure];
  if (tags.tourism && TOURISM_MAP[tags.tourism]) return TOURISM_MAP[tags.tourism];
  if (tags.railway === 'station' || tags.railway === 'halt') return 'rail_station';
  if (tags.aeroway === 'aerodrome') return 'airport';
  if (tags.highway === 'motorway_junction') return 'junction';
  return null;
}

export async function findNearby(params: { lat: number; lng: number; radiusM?: number; limit?: number }) {
  const { lat, lng } = params;
  if (!isValidLatLng(lat, lng)) {
    return { ok: false as const, code: 'INVALID_COORDINATES', message: 'Nearby places need a valid property location.' };
  }
  const radiusM = Math.min(Math.max(Math.round(params.radiusM ?? 1500), 300), 5000);
  const limit = Math.min(Math.max(params.limit ?? 40, 10), 80);
  const key = `n:${lat.toFixed(4)},${lng.toFixed(4)}:${radiusM}:${limit}`;
  const cached = cacheGet(nearbyCache, key, NEARBY_TTL);
  if (cached) return { ok: true as const, places: cached as any[], cached: true };

  // Category-limited query — three focused statements, never an unbounded area
  // dump. Kept deliberately narrow because the public Overpass instances are
  // frequently saturated; a failed call must return fast so the UI can fall
  // back to PQNL's own verified landmark records.
  const q = `[out:json][timeout:12];(` +
    `nwr(around:${radiusM},${lat},${lng})[amenity~"^(hospital|clinic|doctors|pharmacy|school|college|university|bank|atm|restaurant|cafe|marketplace|police|fire_station|townhall|fuel|place_of_worship|bus_station|cinema)$"];` +
    `nwr(around:${radiusM},${lat},${lng})[shop~"^(supermarket|mall|department_store|convenience)$"];` +
    `nwr(around:${radiusM},${lat},${lng})[railway~"^(station|halt)$"];` +
    `nwr(around:${radiusM},${lat},${lng})[aeroway=aerodrome];` +
    `);out center ${limit};`;

  // Try the primary instance, then one independent mirror.
  let json: any = null;
  let lastStatus = 0;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    let res: Response;
    try {
      res = await fetch(`${endpoint}?data=${encodeURIComponent(q)}`, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: AbortSignal.timeout(15000),
      });
    } catch (error) {
      lastStatus = 0;
      continue;
    }
    if (!res.ok) {
      lastStatus = res.status;
      continue;
    }
    json = await res.json().catch(() => null);
    if (json) break;
  }

  if (!json) {
    if (lastStatus === 429) {
      return { ok: false as const, code: 'PROVIDER_RATE_LIMITED', message: 'Nearby places are rate limited right now — please try again shortly.', status: 429 };
    }
    return {
      ok: false as const,
      code: lastStatus === 0 ? 'PROVIDER_UNREACHABLE' : 'PROVIDER_ERROR',
      message: 'Nearby places are temporarily unavailable from the OpenStreetMap provider. Try again shortly.',
      status: lastStatus || undefined,
    };
  }
  const elements = Array.isArray(json?.elements) ? json.elements : [];
  const places = elements
    .map((el: any) => {
      const category = classifyPlace(el.tags);
      if (!category) return null;
      const plat = num(el.lat) ?? num(el.center?.lat);
      const plng = num(el.lon) ?? num(el.center?.lon);
      if (!isValidLatLng(plat, plng)) return null;
      const name = sanitizeText(el.tags?.name, 140);
      if (!name) return null; // unnamed POIs add noise, not value
      return {
        id: `${el.type}-${el.id}`,
        name,
        category,
        lat: plat as number,
        lng: plng as number,
        distanceKm: Math.round(haversineKm(lat, lng, plat as number, plng as number) * 100) / 100,
        straightLine: true,
        address: sanitizeText([el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', '), 160) || null,
        source: 'openstreetmap',
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.distanceKm - b.distanceKm)
    .slice(0, limit);

  cacheSet(nearbyCache, key, places);
  return { ok: true as const, attribution: OSM_ATTRIBUTION, radiusM, places };
}

export function providerCapabilities() {
  return {
    routing: {
      provider: 'osrm',
      providerLabel: 'OSRM (OpenStreetMap road network)',
      supportedModes: supportedModeIds(),
      unsupportedModes: ROUTING_MODES.filter((m) => !m.supported).map((m) => m.id),
      trafficAware: false,
      alternatives: true,
      note: 'No Google Maps Platform credentials are configured, so road routing uses OpenStreetMap data with no live traffic. Walking, cycling and motorcycle road routes are not served by this provider.',
    },
    geocoding: { provider: 'nominatim', providerLabel: 'Nominatim (OpenStreetMap)', attribution: OSM_ATTRIBUTION, coverage: 'Worldwide, OpenStreetMap coverage quality varies by area' },
    nearby: { provider: 'overpass', providerLabel: 'Overpass API (OpenStreetMap)', attribution: OSM_ATTRIBUTION },
    attribution: OSM_ATTRIBUTION,
  };
}