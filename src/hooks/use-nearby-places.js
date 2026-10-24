import { useCallback, useEffect, useRef, useState } from 'react';
import { findNearby, createRequestGuard } from '@/lib/geo-service-client';
import { hasCoordinates } from '@/lib/geo-utils';

/**
 * Nearby places for one property.
 *
 * Live places come from the OpenStreetMap provider through the secure geo
 * service; PQNL's own verified landmark records are merged in by the panel that
 * displays them. Out-of-order responses are dropped, so changing the radius
 * quickly can never leave a stale list on screen.
 */
export function useNearbyPlaces(property, { radiusM = 2000, limit = 40 } = {}) {
  const [state, setState] = useState({ loading: false, loaded: false, error: null, places: [], radiusM });
  const guardRef = useRef(null);
  if (!guardRef.current) guardRef.current = createRequestGuard();

  const usable = hasCoordinates(property);
  const lat = property?.latitude;
  const lng = property?.longitude;

  const load = useCallback(
    async (requestedRadius) => {
      if (!usable) return;
      const radius = requestedRadius || state.radiusM;
      const token = guardRef.current.next();
      setState((prev) => ({ ...prev, loading: true, error: null, radiusM: radius }));
      const res = await findNearby({ lat, lng, radiusM: radius, limit });
      if (!guardRef.current.isLatest(token)) return;
      if (!res.ok) {
        setState({ loading: false, loaded: true, error: res.message, places: [], radiusM: radius });
        return;
      }
      setState({
        loading: false,
        loaded: true,
        error: null,
        radiusM: res.radiusM || radius,
        places: (res.places || []).map((place) => ({ ...place, latitude: place.lat, longitude: place.lng })),
      });
    },
    [usable, lat, lng, limit, state.radiusM],
  );

  const setRadius = useCallback((radius) => setState((prev) => ({ ...prev, radiusM: radius })), []);

  useEffect(() => {
    if (!usable) {
      setState({ loading: false, loaded: false, error: null, places: [], radiusM });
      return;
    }
    load(radiusM);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usable, lat, lng]);

  return { ...state, load, setRadius };
}