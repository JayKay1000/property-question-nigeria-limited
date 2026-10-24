import { useCallback, useEffect, useRef, useState } from 'react';
import { computeRoute, geoCapabilities, createRequestGuard } from '@/lib/geo-service-client';
import { isValidCoordinate } from '@/lib/geo-utils';

/**
 * Route-planning state shared by the GIS map and the property details page.
 *
 * The route is recalculated automatically whenever the origin, destination or
 * travel mode changes (debounced, with stale responses dropped). Everything it
 * exposes comes from the routing service — the hook never synthesises a route,
 * a distance or a duration.
 */
export function useRoutePlanner({
  origin: initialOrigin = null,
  destination: initialDestination = null,
  mode: initialMode = 'drive',
  autoCompute = true,
} = {}) {
  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [mode, setMode] = useState(initialMode);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [supportedModes, setSupportedModes] = useState(['drive']);
  const [nonce, setNonce] = useState(0);

  const guardRef = useRef(null);
  if (!guardRef.current) guardRef.current = createRequestGuard();

  useEffect(() => {
    let cancelled = false;
    geoCapabilities()
      .then((res) => {
        if (cancelled) return;
        if (res?.ok && Array.isArray(res.routing?.supportedModes)) setSupportedModes(res.routing.supportedModes);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const ready = isValidCoordinate(origin?.lat, origin?.lng) && isValidCoordinate(destination?.lat, destination?.lng);

  useEffect(() => {
    if (!ready) {
      setResult(null);
      setLoading(false);
      return undefined;
    }
    if (!autoCompute) return undefined;

    const timer = setTimeout(async () => {
      const token = guardRef.current.next();
      setLoading(true);
      const res = await computeRoute({
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        mode,
      });
      if (!guardRef.current.isLatest(token)) return; // a newer request already started
      setResult(res);
      setActiveIndex(0);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, autoCompute, origin?.lat, origin?.lng, destination?.lat, destination?.lng, mode, nonce]);

  const recompute = useCallback(() => setNonce((n) => n + 1), []);

  const clearRoute = useCallback(() => {
    setOrigin(null);
    setDestination(null);
    setResult(null);
    setActiveIndex(0);
  }, []);

  const reverse = useCallback(() => {
    if (!origin || !destination) return;
    setOrigin({ ...destination });
    setDestination({ ...origin });
  }, [origin, destination]);

  const activeRoute = result?.ok ? result.routes?.[activeIndex] || result.routes?.[0] || null : null;

  return {
    origin,
    setOrigin,
    destination,
    setDestination,
    mode,
    setMode,
    result,
    loading,
    activeRoute,
    activeIndex,
    setActiveIndex,
    supportedModes,
    modeSupported: supportedModes.includes(mode),
    ready,
    recompute,
    clearRoute,
    reverse,
  };
}