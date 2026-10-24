import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, SlidersHorizontal, Navigation, Share2, Building2, MapPin, Star, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { calculateDistance, parseLatLngParam } from '@/lib/gis-map-utils';
import {
  hasCoordinates, boundaryToLatLngs, formatCoordinates, buildRouteShareUrl,
  buildExternalNavigationUrl, buildGoogleMapsDirectionsUrl, shareLocation,
} from '@/lib/geo-utils';
import { reverseGeocode } from '@/lib/geo-service-client';
import { useRoutePlanner } from '@/hooks/use-route-planner';
import { useNearbyPlaces } from '@/hooks/use-nearby-places';
import GISMapSearchBar from '@/components/gis/GISMapSearchBar';
import GISMapFilterPanel from '@/components/gis/GISMapFilterPanel';
import GisResultsList from '@/components/gis/GisResultsList';
import LocationInsightsPanel from '@/components/gis/LocationInsightsPanel';
import NearbyPlacesPanel from '@/components/gis/NearbyPlacesPanel';
import GisMapHeader from '@/components/gis/GisMapHeader';
import GisMapCanvas from '@/components/gis/GisMapCanvas';

const defaultFilters = {
  keyword: '', state: '', propertyType: '', availability: '',
  bedrooms: undefined, featured: false, hasTour: false, priceRange: [0, 500000000],
};

const PROPERTY_PAGE_SIZE = 300;
const NEARBY_RADIUS_M = 2000;

/**
 * GIS Location Intelligence — property discovery on the map.
 *
 * This page owns data and state: it loads public listings, their verified
 * location records and landmarks, applies filters, and coordinates the route
 * planner and nearby-places lookups. The map surface itself lives in
 * GisMapCanvas so each file stays focused.
 */
export default function GISMap() {
  const [properties, setProperties] = useState([]);
  const [states, setStates] = useState([]);
  const [landmarks, setLandmarks] = useState([]);
  const [locationRecords, setLocationRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [mapType, setMapType] = useState('street');
  const [showBoundary, setShowBoundary] = useState(true);
  const [showNearby, setShowNearby] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showList, setShowList] = useState(false);
  const [radiusKm, setRadiusKm] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState(null);
  const [notice, setNotice] = useState(null);
  const [pickingMode, setPickingMode] = useState(null);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [resizeTrigger, setResizeTrigger] = useState(0);
  const [fitToken, setFitToken] = useState({ value: 0, mode: 'fit' });
  const [sharing, setSharing] = useState(false);
  const [urlHandled, setUrlHandled] = useState(false);

  const apiRef = useRef(null);
  const planner = useRoutePlanner({ mode: 'drive' });
  const nearby = useNearbyPlaces(selectedProperty, { radiusM: NEARBY_RADIUS_M });
  const { setOrigin, setDestination, setMode } = planner;

  // ---------------------------------------------------------------- data load
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      base44.entities.Property.list('-created_date', PROPERTY_PAGE_SIZE),
      base44.entities.LookupState.list('sort_order', 100).catch(() => []),
      base44.entities.Landmark.list('-created_date', 100).catch(() => []),
      base44.entities.PropertyLocation.list('-created_date', 500).catch(() => []),
    ])
      .then(([props, sts, lms, locations]) => {
        if (cancelled) return;
        setProperties(props || []);
        setStates(sts || []);
        setLandmarks(lms || []);
        const byProperty = {};
        (locations || []).forEach((record) => {
          if (record?.property_id) byProperty[record.property_id] = record;
        });
        setLocationRecords(byProperty);
      })
      .catch(() => {
        if (!cancelled) setLoadError('We could not load the map data. Please refresh the page.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------- shared-route deep links
  useEffect(() => {
    if (urlHandled || loading) return;
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get('property');
    const originParam = parseLatLngParam(params.get('origin'));
    const modeParam = params.get('mode');
    if (!propertyId && !originParam && !modeParam) {
      setUrlHandled(true);
      return;
    }
    if (modeParam) setMode(['drive', 'walk', 'cycle', 'motorcycle'].includes(modeParam) ? modeParam : 'drive');
    if (originParam) {
      setOrigin({ ...originParam, label: 'Shared starting point' });
      reverseGeocode(originParam.lat, originParam.lng).then((res) => {
        if (res?.ok && res.result) {
          setOrigin({ ...originParam, label: res.result.shortLabel || res.result.label || 'Shared starting point' });
        }
      });
    }
    if (propertyId) {
      const match = properties.find((p) => p.id === propertyId);
      if (match && hasCoordinates(match)) {
        setSelectedProperty(match);
        setDestination({ label: match.title, shortLabel: match.title, lat: match.latitude, lng: match.longitude, propertyId: match.id });
        setPlannerOpen(true);
      } else if (match) {
        setSelectedProperty(match);
        setNotice('This property has no mapped coordinates yet, so a route cannot be calculated for this shared link.');
      }
    }
    setUrlHandled(true);
  }, [urlHandled, loading, properties, setOrigin, setDestination, setMode]);

  // Leaflet must recalculate its size when the canvas container changes size.
  useEffect(() => {
    setResizeTrigger((token) => token + 1);
  }, [fullscreen]);

  // ------------------------------------------------------------------ filters
  // A verified PropertyLocation position takes precedence over the coordinates
  // captured when the listing was created (managed in the GIS Command Center's
  // Location Verification tab).
  const effectiveProperties = useMemo(
    () =>
      properties.map((property) => {
        const record = locationRecords[property.id];
        if (record && hasCoordinates(record)) {
          return { ...property, latitude: record.latitude, longitude: record.longitude };
        }
        return property;
      }),
    [properties, locationRecords],
  );

  const filtered = useMemo(() => {
    const f = filters;
    let result = [...effectiveProperties];
    if (f.keyword) {
      const kw = f.keyword.toLowerCase();
      result = result.filter((p) =>
        p.title?.toLowerCase().includes(kw) ||
        p.reference_number?.toLowerCase().includes(kw) ||
        p.city?.toLowerCase().includes(kw) ||
        p.state?.toLowerCase().includes(kw) ||
        p.estate?.toLowerCase().includes(kw),
      );
    }
    if (f.state) result = result.filter((p) => p.state === f.state);
    if (f.propertyType) result = result.filter((p) => p.property_type === f.propertyType);
    if (f.availability) result = result.filter((p) => p.availability_status === f.availability);
    if (f.bedrooms) result = result.filter((p) => (p.bedrooms || 0) >= f.bedrooms);
    if (f.featured) result = result.filter((p) => p.is_featured);
    if (f.hasTour) result = result.filter((p) => p.virtual_tour_url || p.tour_360_urls?.length);
    if (f.priceRange && f.priceRange[1] < 500000000) result = result.filter((p) => (p.price || 0) <= f.priceRange[1]);
    if (radiusKm > 0 && userLocation) {
      result = result.filter(
        (p) => hasCoordinates(p) && calculateDistance(userLocation[0], userLocation[1], p.latitude, p.longitude) <= radiusKm,
      );
    }
    return result;
  }, [effectiveProperties, filters, radiusKm, userLocation]);

  const mappedResults = useMemo(() => filtered.filter(hasCoordinates), [filtered]);
  const unmappedResults = useMemo(() => filtered.filter((p) => !hasCoordinates(p)), [filtered]);
  const radiusCenter = userLocation && radiusKm > 0 ? userLocation : null;

  const selectedLocation = selectedProperty ? locationRecords[selectedProperty.id] : null;
  const selectedBoundary = useMemo(() => boundaryToLatLngs(selectedLocation), [selectedLocation]);
  const selectedAccessPoint =
    selectedLocation?.access_point_latitude != null && selectedLocation?.access_point_longitude != null
      ? {
          lat: selectedLocation.access_point_latitude,
          lng: selectedLocation.access_point_longitude,
          instructions: selectedLocation.access_instructions,
        }
      : null;

  // ------------------------------------------------------------- geolocation
  const locate = useCallback((onSuccess) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationNotice('This browser does not support location sharing. Search for a place or pick a point on the map instead.');
      return;
    }
    setLocating(true);
    setLocationNotice(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserLocation(coords);
        setLocating(false);
        onSuccess?.({ lat: coords[0], lng: coords[1] });
      },
      (error) => {
        setLocating(false);
        setLocationNotice(
          error?.code === 1
            ? 'Location permission was denied. You can still search for a place or pick a point on the map.'
            : 'We could not determine your location. Search for a place or pick a point on the map instead.',
        );
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }, []);

  const handleLocateMe = useCallback(() => {
    locate((coords) => {
      if (radiusKm === 0) setRadiusKm(10);
      apiRef.current?.flyTo(coords.lat, coords.lng, 12);
    });
  }, [locate, radiusKm]);

  const handleRadiusChange = useCallback(
    (km) => {
      setRadiusKm(km);
      if (km > 0 && !userLocation) handleLocateMe();
    },
    [userLocation, handleLocateMe],
  );

  // ------------------------------------------------------------- route planning
  const labelForPoint = useCallback(async (point) => {
    const res = await reverseGeocode(point.lat, point.lng);
    if (res?.ok && res.result) return res.result.shortLabel || res.result.label || 'Point selected on the map';
    return 'Point selected on the map';
  }, []);

  const planRouteTo = useCallback(
    (property) => {
      if (!property) return;
      setSelectedProperty(property);
      setShowList(false);
      if (!hasCoordinates(property)) {
        setNotice(
          'This property has no mapped coordinates yet, so a route cannot be calculated. Its agent contact details are still available on the property page.',
        );
        return;
      }
      setNotice(null);
      setDestination({
        label: property.title,
        shortLabel: property.title,
        lat: property.latitude,
        lng: property.longitude,
        propertyId: property.id,
      });
      setPlannerOpen(true);
    },
    [setDestination],
  );

  const selectProperty = useCallback(
    (property) => {
      if (!property) return;
      setSelectedProperty(property);
      setShowList(false);
      setNotice(null);
      if (pickingMode === 'destination') {
        setPickingMode(null);
        if (hasCoordinates(property)) {
          setDestination({
            label: property.title,
            shortLabel: property.title,
            lat: property.latitude,
            lng: property.longitude,
            propertyId: property.id,
          });
        } else {
          setNotice('That property has no mapped coordinates, so it cannot be a destination. Pick another point or search for a place.');
        }
      }
    },
    [pickingMode, setDestination],
  );

  const handleMapPick = useCallback(
    async (point) => {
      const mode = pickingMode;
      if (!mode) return;
      setPickingMode(null);
      const label = await labelForPoint(point);
      if (mode === 'origin') {
        setOrigin({ ...point, label });
        setPlannerOpen(true);
      } else {
        setDestination({ ...point, label });
        setPlannerOpen(true);
      }
    },
    [pickingMode, labelForPoint, setOrigin, setDestination],
  );

  const handleUseCurrentLocationAsOrigin = useCallback(() => {
    // The label stays generic: the visitor's precise position is not sent to a
    // geocoding provider just to caption it.
    locate((coords) => {
      setOrigin({ ...coords, label: 'My current location' });
      setPlannerOpen(true);
    });
  }, [locate, setOrigin]);

  const handleStartNavigation = useCallback(() => {
    if (!planner.destination) return;
    window.open(
      buildExternalNavigationUrl({
        origin: planner.origin,
        destination: planner.destination,
        mode: planner.mode,
        destinationLabel: planner.destination.label,
      }),
      '_blank',
      'noopener,noreferrer',
    );
  }, [planner.origin, planner.destination, planner.mode]);

  const handleOpenInMaps = useCallback(() => {
    if (!planner.destination) return;
    window.open(
      buildGoogleMapsDirectionsUrl({
        origin: planner.origin,
        destination: planner.destination,
        mode: planner.mode,
        destinationLabel: planner.destination.label,
      }),
      '_blank',
      'noopener,noreferrer',
    );
  }, [planner.origin, planner.destination, planner.mode]);

  const handleShareRoute = useCallback(async () => {
    const destination = planner.destination;
    if (!destination) return;
    setSharing(true);
    const link = destination.propertyId
      ? buildRouteShareUrl({ propertyId: destination.propertyId, origin: planner.origin, mode: planner.mode })
      : null;
    const coords = formatCoordinates(destination.lat, destination.lng);
    const text = link
      ? `Route to ${destination.label} (${planner.mode}) on Property Question: ${link}`
      : `Destination ${destination.label}${coords ? ` at ${coords}` : ''}`;
    const result = await shareLocation({ title: 'Property Question route', text });
    setSharing(false);
    if (result.method === 'clipboard') setNotice('Route link copied to your clipboard.');
    if (result.method === 'none') setNotice('We could not share that link on this device.');
  }, [planner.destination, planner.origin, planner.mode]);

  const handleShareProperty = useCallback(async () => {
    if (!selectedProperty) return;
    const coords = formatCoordinates(selectedProperty.latitude, selectedProperty.longitude);
    const text = `${selectedProperty.title}${coords ? ` — ${coords}` : ''} · ${window.location.origin}/properties/${selectedProperty.id}`;
    const result = await shareLocation({ title: selectedProperty.title, text });
    if (result.method === 'clipboard') setNotice('Property link copied to your clipboard.');
  }, [selectedProperty]);

  // Nearby places are owned by the shared hook, so the map and the property page
  // behave identically.

  // -------------------------------------------------------------------- map ui
  const resetFilters = () => {
    setFilters({ ...defaultFilters });
    setRadiusKm(0);
  };
  const filtersActive =
    Boolean(
      filters.keyword || filters.state || filters.propertyType || filters.availability ||
      filters.bedrooms || filters.featured || filters.hasTour,
    ) ||
    (filters.priceRange?.[1] ?? 0) < 500000000 ||
    radiusKm > 0;

  const stats = [
    { icon: Building2, label: `${properties.length} Properties` },
    { icon: MapPin, label: `${mappedResults.length} Mapped` },
    { icon: Star, label: `${filtered.length} Showing` },
  ];
  if (unmappedResults.length > 0) stats.push({ icon: TriangleAlert, label: `${unmappedResults.length} Unmapped` });

  const canvasState = {
    mappedResults, unmappedResults, landmarks, locationRecords,
    selectedProperty, selectedLocation, selectedBoundary, selectedAccessPoint,
    mapType, showBoundary, showNearby, radiusCenter, radiusKm, userLocation,
    fitToken, resizeTrigger, pickingMode, plannerOpen, fullscreen, showList,
    loading, loadError, nearby, planner, sharing, locating,
  };
  const canvasHandlers = {
    onSelectProperty: selectProperty,
    onMapPick: handleMapPick,
    onLocate: handleLocateMe,
    onFitAll: () => {
      setFitToken((token) => ({ value: token.value + 1, mode: 'fit' }));
      setShowList(false);
    },
    onResetView: () => setFitToken((token) => ({ value: token.value + 1, mode: 'reset' })),
    onToggleFullscreen: () => setFullscreen((value) => !value),
    onToggleList: () => setShowList((value) => !value),
    onSetMapType: setMapType,
    onToggleBoundary: () => setShowBoundary((value) => !value),
    onToggleNearby: () => setShowNearby((value) => !value),
    onPlanRoute: planRouteTo,
    onClosePreview: () => setSelectedProperty(null),
    onShareProperty: handleShareProperty,
    onClosePlanner: () => {
      setPlannerOpen(false);
      setPickingMode(null);
    },
    onPickOrigin: () => setPickingMode('origin'),
    onPickDestination: () => setPickingMode('destination'),
    onUseCurrentLocation: handleUseCurrentLocationAsOrigin,
    onStartNavigation: handleStartNavigation,
    onOpenInMaps: handleOpenInMaps,
    onShareRoute: handleShareRoute,
    setOrigin,
    setDestination,
    setMode,
    onActiveIndexChange: planner.setActiveIndex,
    onRecalculate: planner.recompute,
    onClearRoute: planner.clearRoute,
    onReverse: planner.reverse,
  };

  return (
    <div className="min-h-screen bg-ice-50 pt-16 lg:pt-20">
      <GisMapHeader stats={stats} />

      <div className="container-wide section-pad mt-4">
        <GISMapSearchBar
          filters={filters}
          setFilters={setFilters}
          states={states}
          radiusKm={radiusKm}
          onRadiusChange={handleRadiusChange}
          onLocateMe={handleLocateMe}
          locating={locating}
          locationNotice={locationNotice}
          onResetFilters={resetFilters}
          filtersActive={filtersActive}
        />
      </div>

      {notice && (
        <div className="container-wide section-pad mt-3">
          <div className="flex items-start justify-between gap-3 rounded-xl border border-brand-200 bg-white p-3 text-sm text-brand-800">
            <span className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-flame-500" /> {notice}
            </span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss message" className="text-muted-foreground hover:text-brand-900">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="container-wide section-pad mt-4 pb-10">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <aside className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-28 space-y-4">
              <GISMapFilterPanel filters={filters} setFilters={setFilters} onClear={resetFilters} maxPrice={500000000} />
              <LocationInsightsPanel properties={mappedResults} totalStates={states.length} />
              {selectedProperty && (
                <NearbyPlacesPanel
                  property={selectedProperty}
                  landmarks={landmarks}
                  livePlaces={nearby.places}
                  liveState={nearby}
                  radiusM={nearby.radiusM}
                  onRadiusChange={nearby.setRadius}
                  onLoadLive={nearby.load}
                  onFocusPlace={(place) => apiRef.current?.flyTo(place.latitude, place.longitude, 16)}
                  onDirections={(place) => {
                    setDestination({ label: place.name, shortLabel: place.name, lat: place.latitude, lng: place.longitude });
                    setPlannerOpen(true);
                  }}
                />
              )}
            </div>
          </aside>

          <div className="lg:col-span-3">
            <GisMapCanvas state={canvasState} handlers={canvasHandlers} apiRef={apiRef} />

            {!fullscreen && (
              <div className="mt-5 hidden lg:block">
                <div className="mb-2 flex items-center justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters((value) => !value)}>
                    <SlidersHorizontal className="mr-1 h-4 w-4" /> {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                </div>
                {showFilters && (
                  <div className="mb-4 rounded-2xl border border-brand-100 bg-white p-4">
                    <GISMapFilterPanel filters={filters} setFilters={setFilters} onClear={resetFilters} maxPrice={500000000} />
                  </div>
                )}
                <GisResultsList
                  properties={mappedResults}
                  unmapped={unmappedResults}
                  locationRecords={locationRecords}
                  selectedProperty={selectedProperty}
                  onSelect={selectProperty}
                  onPlanRoute={planRouteTo}
                />
              </div>
            )}

            {/* Listings without coordinates stay reachable on small screens too. */}
            <div className="mt-4 lg:hidden">
              <GisResultsList
                properties={mappedResults}
                unmapped={unmappedResults}
                locationRecords={locationRecords}
                selectedProperty={selectedProperty}
                onSelect={selectProperty}
                onPlanRoute={planRouteTo}
                maxItems={6}
              />
            </div>

            {!fullscreen && selectedProperty && (
              <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
                <Button onClick={() => planRouteTo(selectedProperty)} className="flex-1 bg-flame-500 hover:bg-flame-600">
                  <Navigation className="mr-1.5 h-4 w-4" /> Plan a route
                </Button>
                <Button variant="outline" className="flex-1 border-brand-200" onClick={handleShareProperty}>
                  <Share2 className="mr-1.5 h-4 w-4" /> Share
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-[1400] lg:hidden">
          <div className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-brand-900">Filters</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} aria-label="Close filters">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <GISMapFilterPanel filters={filters} setFilters={setFilters} onClear={resetFilters} maxPrice={500000000} />
          </div>
        </div>
      )}
    </div>
  );
}