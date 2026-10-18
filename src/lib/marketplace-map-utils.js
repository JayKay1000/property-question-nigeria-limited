/**
 * Marketplace map utilities — coordinate validation, client-side clustering,
 * and viewport-bounds filtering for the map-based discovery view.
 *
 * GEOGRAPHIC QUERY STRATEGY:
 *   The Base44 entity SDK does not support server-side bounding-box ($geoWithin)
 *   queries. The safe alternative (per the Phase 2 spec) is:
 *   1. Fetch the same filtered result set as the grid (bounded by the shared
 *      search criteria — status, visibility, price, type, etc. — never an
 *      unbounded national query).
 *   2. Request latitude/longitude fields on that fetch.
 *   3. Filter by map viewport bounds client-side for map display only.
 *
 *   This keeps the map and grid on the same inventory and the same criteria,
 *   with the viewport acting as a map-only display filter.
 */

/**
 * Validates that lat/lng are real numbers within geographic range.
 * Rejects null, undefined, strings, NaN, Infinity, and out-of-range values.
 */
export function isValidCoordinate(lat, lng) {
  return (
    typeof lat === 'number' && typeof lng === 'number' &&
    !isNaN(lat) && !isNaN(lng) &&
    isFinite(lat) && isFinite(lng) &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

/**
 * Checks whether a coordinate point falls within a Leaflet LatLngBounds.
 * Accepts both Leaflet LatLngBounds objects and plain {getSouth, getNorth, ...} shapes.
 */
export function isWithinBounds(lat, lng, bounds) {
  if (!bounds) return true;
  try {
    if (typeof bounds.getSouth === 'function') {
      return (
        lat >= bounds.getSouth() && lat <= bounds.getNorth() &&
        lng >= bounds.getWest() && lng <= bounds.getEast()
      );
    }
  } catch { /* fall through */ }
  // Fallback for serialized bounds
  if (bounds._southWest && bounds._northEast) {
    return (
      lat >= bounds._southWest.lat && lat <= bounds._northEast.lat &&
      lng >= bounds._southWest.lng && lng <= bounds._northEast.lng
    );
  }
  return true;
}

/**
 * Grid-based clustering: groups nearby markers into cells whose size depends
 * on the current zoom level. At high zoom (>= 14) every marker is individual.
 * At lower zoom, markers in the same grid cell are merged into a cluster
 * centered on the average of its members.
 *
 * Returns an array of { type: 'single', property } | { type: 'cluster', properties, center }.
 */
export function clusterMarkers(items, zoom) {
  if (!items || items.length === 0) return [];

  // No clustering at high zoom — show every marker
  if (zoom >= 14) {
    return items.map((property) => ({ type: 'single', property }));
  }

  // Grid cell size shrinks as zoom increases
  const gridSize =
    zoom >= 12 ? 0.01 :
    zoom >= 10 ? 0.02 :
    zoom >= 8  ? 0.05 :
    zoom >= 6  ? 0.2 :
    0.5;

  const clusters = new Map();
  for (const property of items) {
    const key = `${Math.floor(property.latitude / gridSize)},${Math.floor(property.longitude / gridSize)}`;
    if (!clusters.has(key)) clusters.set(key, []);
    clusters.get(key).push(property);
  }

  const result = [];
  for (const props of clusters.values()) {
    if (props.length === 1) {
      result.push({ type: 'single', property: props[0] });
    } else {
      const avgLat = props.reduce((s, p) => s + p.latitude, 0) / props.length;
      const avgLng = props.reduce((s, p) => s + p.longitude, 0) / props.length;
      result.push({ type: 'cluster', properties: props, center: [avgLat, avgLng] });
    }
  }
  return result;
}

/** Splits an array of properties into those with valid coords and those without. */
export function partitionByCoordinates(items) {
  const withCoords = [];
  const withoutCoords = [];
  for (const p of items) {
    if (isValidCoordinate(p.latitude, p.longitude)) {
      withCoords.push(p);
    } else {
      withoutCoords.push(p);
    }
  }
  return { withCoords, withoutCoords };
}