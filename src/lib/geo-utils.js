/**
 * Pure formatting and link helpers for the PQNL GIS & smart navigation system.
 *
 * No provider calls live here — this module only turns already-received data
 * (coordinates, distances, durations) into readable text and into correctly
 * encoded external navigation URLs. It never invents a distance, duration or
 * route: every value it formats comes from the routing service or from a
 * straight-line calculation that is explicitly labelled as such.
 */

/** Validates a coordinate pair, rejecting nulls, strings, NaN and out-of-range values. */
export function isValidCoordinate(lat, lng) {
  const a = typeof lat === 'string' ? Number(lat) : lat;
  const b = typeof lng === 'string' ? Number(lng) : lng;
  return (
    typeof a === 'number' && typeof b === 'number' &&
    Number.isFinite(a) && Number.isFinite(b) &&
    a >= -90 && a <= 90 && b >= -180 && b <= 180 &&
    a !== 0 && b !== 0
  );
}

/** True when a record carries a usable coordinate pair. */
export function hasCoordinates(entity) {
  return isValidCoordinate(entity?.latitude, entity?.longitude);
}

/** "480 m" / "3.4 km" / "128 km" */
export function formatDistance(km) {
  if (km == null || !Number.isFinite(km)) return null;
  if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** "19 min" / "1 hr 25 min" — always an estimate unless the caller says otherwise. */
export function formatDuration(minutes) {
  if (minutes == null || !Number.isFinite(minutes)) return null;
  const m = Math.max(1, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const hours = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

export function formatCoordinates(lat, lng, precision = 5) {
  if (!isValidCoordinate(lat, lng)) return null;
  return `${Number(lat).toFixed(precision)}, ${Number(lng).toFixed(precision)}`;
}

/**
 * Reads a typed coordinate pair: "6.5244, 3.3792", "6.5244 3.3792",
 * "6.5244N 3.3792E" or "N6.5244, E3.3792". Returns {lat, lng} or null.
 */
export function parseCoordinates(text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  const cleaned = text.trim().replace(/[()\[\]]/g, ' ');
  const numbers = cleaned.match(/-?\d+(?:\.\d+)?/g);
  if (!numbers || numbers.length < 2) return null;
  const lat = Number(numbers[0]);
  const lng = Number(numbers[1]);
  if (!isValidCoordinate(lat, lng)) return null;
  return { lat, lng };
}

/** Travel modes shown in the route planner, with their external-maps equivalents. */
export const TRAVEL_MODES = [
  { id: 'drive', label: 'Driving', mapsTravelmode: 'driving' },
  { id: 'walk', label: 'Walking', mapsTravelmode: 'walking' },
  { id: 'cycle', label: 'Cycling', mapsTravelmode: 'bicycling' },
  { id: 'motorcycle', label: 'Motorcycle', mapsTravelmode: null },
];

export function travelModeLabel(mode) {
  return TRAVEL_MODES.find((m) => m.id === mode)?.label || 'Driving';
}

/** Google Maps directions deep link — the navigation fallback when routing is unavailable. */
export function buildGoogleMapsDirectionsUrl({ origin, destination, mode = 'drive', navigate = false, destinationLabel } = {}) {
  const params = new URLSearchParams({ api: '1' });
  if (destination) {
    params.set('destination', isValidCoordinate(destination.lat, destination.lng)
      ? `${destination.lat},${destination.lng}`
      : destinationLabel || '');
  } else if (destinationLabel) {
    params.set('destination', destinationLabel);
  }
  if (origin && isValidCoordinate(origin.lat, origin.lng)) {
    params.set('origin', `${origin.lat},${origin.lng}`);
  }
  const travelmode = TRAVEL_MODES.find((m) => m.id === mode)?.mapsTravelmode;
  if (travelmode) params.set('travelmode', travelmode);
  if (navigate) params.set('dir_action', 'navigate');
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Google Maps place link for a coordinate or a textual address. */
export function buildGoogleMapsSearchUrl({ lat, lng, label } = {}) {
  const query = isValidCoordinate(lat, lng) ? `${lat},${lng}` : label || '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Apple Maps link for iOS/macOS visitors. */
export function buildAppleMapsUrl({ lat, lng, label } = {}) {
  if (isValidCoordinate(lat, lng)) {
    return `https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
  }
  return `https://maps.apple.com/?q=${encodeURIComponent(label || '')}`;
}

/** External turn-by-turn navigation (Google Maps) — this site never provides live guidance itself. */
export function buildExternalNavigationUrl({ origin, destination, mode = 'drive', destinationLabel } = {}) {
  return buildGoogleMapsDirectionsUrl({ origin, destination, mode, navigate: true, destinationLabel });
}

/** A shareable link back to a property's own page. */
export function buildPropertyShareUrl(propertyId) {
  if (!propertyId || typeof window === 'undefined') return '';
  return `${window.location.origin}/properties/${propertyId}`;
}

/** A shareable route preview: destination property plus the chosen origin and mode. */
export function buildRouteShareUrl({ propertyId, origin, mode = 'drive' } = {}) {
  if (!propertyId || typeof window === 'undefined') return '';
  const params = new URLSearchParams({ property: propertyId, mode });
  if (origin && isValidCoordinate(origin.lat, origin.lng)) {
    params.set('origin', `${Number(origin.lat).toFixed(5)},${Number(origin.lng).toFixed(5)}`);
  }
  return `${window.location.origin}/gis?${params.toString()}`;
}

/** Plain share text for a location, used with the Web Share API and clipboard fallback. */
export function buildLocationShareText(property) {
  if (!property) return '';
  const parts = [property.title];
  const where = [property.address_line || property.property_address, property.estate, property.city, property.state].filter(Boolean).join(', ');
  if (where) parts.push(where);
  const coords = formatCoordinates(property.latitude, property.longitude);
  if (coords) parts.push(`Coordinates: ${coords}`);
  parts.push(buildPropertyShareUrl(property.id));
  return parts.filter(Boolean).join('\n');
}

/** Native share sheet when available, otherwise copies to the clipboard. */
export async function shareLocation({ title, text }) {
  try {
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title, text });
      return { ok: true, method: 'share' };
    }
  } catch (error) {
    // A cancelled share sheet is not an error worth surfacing.
    if (error?.name === 'AbortError') return { ok: true, method: 'cancelled' };
  }
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true, method: 'clipboard' };
  } catch {
    return { ok: false, method: 'none' };
  }
}

/**
 * Reads the property-boundary geometry from a PropertyLocation record.
 * Accepts either the {lat, lng} point array or a GeoJSON polygon.
 * Returns an array of [lat, lng] pairs for Leaflet, or [] when unusable.
 */
export function boundaryToLatLngs(location) {
  if (!location) return [];
  const points = Array.isArray(location.boundary_points) ? location.boundary_points : [];
  const fromPoints = points
    .map((p) => (isValidCoordinate(p?.lat, p?.lng) ? [Number(p.lat), Number(p.lng)] : null))
    .filter(Boolean);
  if (fromPoints.length >= 3) return fromPoints;

  const ring = location.boundary_geojson?.coordinates?.[0];
  if (Array.isArray(ring)) {
    const fromGeo = ring
      .map((c) => (Array.isArray(c) && isValidCoordinate(c[1], c[0]) ? [Number(c[1]), Number(c[0])] : null))
      .filter(Boolean);
    if (fromGeo.length >= 3) return fromGeo;
  }
  return [];
}

export const VERIFICATION_DISPLAY = {
  verified: { label: 'Location verified', tone: 'verified', description: 'Position confirmed by PQNL staff.' },
  approximate: { label: 'Approximate location', tone: 'approximate', description: 'Position is indicative and may be offset.' },
  unverified: { label: 'Location not verified', tone: 'unverified', description: 'Position has not been checked by PQNL staff.' },
};

export const COORDINATE_SOURCE_LABELS = {
  manual_map_pick: 'Placed on the map',
  address_geocode: 'Geocoded from the address',
  survey_document: 'From a survey document',
  gps_field_capture: 'Captured on site (GPS)',
  legacy_import: 'Imported from an earlier record',
};