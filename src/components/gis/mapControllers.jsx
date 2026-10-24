import { useEffect } from 'react';
import { useMap, useMapEvents } from 'react-leaflet';
import { NIGERIA_CENTER, NIGERIA_ZOOM } from '@/lib/gis-map-utils';

/**
 * Imperative bridge between the map instance and the toolbar buttons rendered
 * over it, plus the small controllers that react to selection, fitting, screen
 * changes and map clicks. Kept together because they all need the Leaflet map.
 */

export function MapApiBridge({ apiRef, onZoomChange }) {
  const map = useMap();

  useEffect(() => {
    const api = {
      zoomIn: () => map.zoomIn(),
      zoomOut: () => map.zoomOut(),
      flyTo: (lat, lng, zoom) => map.flyTo([lat, lng], zoom ?? Math.max(map.getZoom(), 14), { duration: 1.1 }),
      reset: () => map.setView(NIGERIA_CENTER, NIGERIA_ZOOM),
      getZoom: () => map.getZoom(),
      invalidate: () => map.invalidateSize(),
      fitPoints: (points, options = {}) => {
        if (!points?.length) return false;
        if (points.length === 1) {
          map.flyTo(points[0], options.maxZoom || 15, { duration: 1.1 });
          return true;
        }
        map.fitBounds(points, { padding: [40, 40], maxZoom: options.maxZoom || 15 });
        return true;
      },
    };
    apiRef.current = api;
    return () => {
      if (apiRef.current === api) apiRef.current = null;
    };
  }, [map, apiRef]);

  useMapEvents({
    zoomend: () => onZoomChange?.(map.getZoom()),
  });

  return null;
}

/** Flies to a newly selected property or destination, and to a computed route. */
export function SelectionController({ focus, routeBounds }) {
  const map = useMap();

  useEffect(() => {
    if (routeBounds?.length) {
      // Slightly wider padding so the origin and destination pins stay visible.
      map.fitBounds(routeBounds, { padding: [60, 60], maxZoom: 16 });
      return;
    }
    if (focus?.latitude != null && focus?.longitude != null) {
      map.flyTo([focus.latitude, focus.longitude], Math.max(map.getZoom(), 14), { duration: 1.1 });
    }
  }, [focus?.id, routeBounds, map]);

  return null;
}

/** Applies an explicit "fit all results" / "reset view" request from the toolbar. */
export function FitController({ token, points, mode }) {
  const map = useMap();
  const tokenValue = token?.value;
  const tokenMode = token?.mode;

  useEffect(() => {
    if (!tokenValue) return;
    if (tokenMode === 'reset') {
      map.setView(NIGERIA_CENTER, NIGERIA_ZOOM);
      return;
    }
    if (!points?.length) return;
    if (points.length === 1) {
      map.flyTo(points[0], 15, { duration: 1.1 });
      return;
    }
    map.fitBounds(points, { padding: [50, 50], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenValue, tokenMode, map, points]);

  return null;
}

/** Collects a tapped map point while the visitor is choosing a location. */
export function ClickPicker({ active, onPick }) {
  useMapEvents({
    click(event) {
      if (!active) return;
      onPick?.({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

/** Leaflet needs a size recalculation after the canvas container resizes. */
export function ResizeController({ trigger }) {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 260);
    return () => clearTimeout(timer);
  }, [trigger, map]);
  return null;
}

/** Zoom readout used by the clustering logic. */
export function ZoomWatcher({ onZoomChange }) {
  const map = useMap();
  useEffect(() => {
    onZoomChange?.(map.getZoom());
  }, [map, onZoomChange]);
  return null;
}