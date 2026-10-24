import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Share2, TriangleAlert, BadgeCheck, Milestone, Info, Route } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import {
  hasCoordinates, boundaryToLatLngs, formatCoordinates, VERIFICATION_DISPLAY, COORDINATE_SOURCE_LABELS,
  buildExternalNavigationUrl, buildGoogleMapsDirectionsUrl, buildGoogleMapsSearchUrl, buildLocationShareText, shareLocation,
} from '@/lib/geo-utils';
import { reverseGeocode } from '@/lib/geo-service-client';
import { useRoutePlanner } from '@/hooks/use-route-planner';
import { useNearbyPlaces } from '@/hooks/use-nearby-places';
import MapView from '@/components/gis/MapView';
import RoutePlanner from '@/components/gis/RoutePlanner';
import NearbyPlacesPanel from '@/components/gis/NearbyPlacesPanel';

const TONE_CLASSES = {
  verified: 'border-success/30 bg-success/10 text-success',
  approximate: 'border-amber-200 bg-amber-50 text-amber-800',
  unverified: 'border-border bg-secondary text-muted-foreground',
};

/**
 * "Location & Directions" for a single property.
 *
 * Everything here is honest about what is and is not known: a position is only
 * called verified when a PropertyLocation record says so, the road access point
 * is shown separately from the plot position, straight-line distances are
 * labelled as such, and walking/cycling road routes are reported as unavailable
 * rather than invented. Live turn-by-turn guidance is handed to the visitor's
 * own navigation app.
 */
export default function LocationDirections({ property }) {
  const [locationRecord, setLocationRecord] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [landmarks, setLandmarks] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [pickingMode, setPickingMode] = useState(null);
  const [notice, setNotice] = useState(null);
  const [sharing, setSharing] = useState(false);
  const apiRef = useRef(null);

  const usable = hasCoordinates(property);
  const nearby = useNearbyPlaces(property, { radiusM: 2000 });
  // The routing destination is applied once the verification record has loaded,
  // so a recorded road access point can be used for the final approach.
  const planner = useRoutePlanner({ mode: 'drive' });

  useEffect(() => {
    let cancelled = false;
    setLocationLoading(true);
    base44.entities.PropertyLocation.filter({ property_id: property.id }, { limit: 1 })
      .then((res) => {
        if (cancelled) return;
        const items = res?.items || res || [];
        setLocationRecord(items[0] || null);
      })
      .catch(() => {
        if (!cancelled) setLocationRecord(null);
      })
      .finally(() => {
        if (!cancelled) setLocationLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [property.id]);

  useEffect(() => {
    base44.entities.Landmark.list('-created_date', 100).then(setLandmarks).catch(() => setLandmarks([]));
  }, []);

  const boundary = useMemo(() => boundaryToLatLngs(locationRecord), [locationRecord]);
  const accessPoint =
    locationRecord?.access_point_latitude != null && locationRecord?.access_point_longitude != null
      ? {
          lat: locationRecord.access_point_latitude,
          lng: locationRecord.access_point_longitude,
          instructions: locationRecord.access_instructions,
        }
      : null;

  // Destination: the recorded road access point is the place a driver can
  // actually reach, while the plot position stays marked separately on the map.
  const destinationApplied = useRef(false);
  useEffect(() => {
    if (locationLoading || destinationApplied.current || !usable) return;
    destinationApplied.current = true;
    const viaAccess = accessPoint != null;
    planner.setDestination({
      label: viaAccess ? `Road access point — ${property.title}` : property.title,
      shortLabel: property.title,
      lat: viaAccess ? accessPoint.lat : property.latitude,
      lng: viaAccess ? accessPoint.lng : property.longitude,
      propertyId: property.id,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationLoading, usable, accessPoint, property.id, property.title]);

  const verification = VERIFICATION_DISPLAY[locationRecord?.location_verification_status || 'unverified'];
  const toneClass = TONE_CLASSES[verification.tone] || TONE_CLASSES.unverified;
  const coordinates = formatCoordinates(property.latitude, property.longitude);
  const accessCoordinates = formatCoordinates(locationRecord?.access_point_latitude, locationRecord?.access_point_longitude);
  const addressLine = [property.address_line || property.property_address, property.estate, property.city, property.state]
    .filter(Boolean)
    .join(', ');

  const locate = useCallback((onSuccess) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setNotice('This browser does not support location sharing. Search for a starting point instead.');
      return;
    }
    setLocating(true);
    setNotice(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation([coords.lat, coords.lng]);
        setLocating(false);
        onSuccess?.(coords);
      },
      (error) => {
        setLocating(false);
        setNotice(
          error?.code === 1
            ? 'Location permission was denied. You can still search for a starting point or pick one on the map.'
            : 'We could not determine your location. Search for a starting point or pick one on the map instead.',
        );
      },
      { enableHighAccuracy: true, timeout: 12000 },
    );
  }, []);

  const handleUseCurrentLocation = useCallback(() => {
    locate((coords) => planner.setOrigin({ ...coords, label: 'My current location' }));
  }, [locate, planner]);

  const handleMapPick = useCallback(
    async (point) => {
      const mode = pickingMode;
      if (!mode) return;
      setPickingMode(null);
      const res = await reverseGeocode(point.lat, point.lng);
      const label = res?.ok && res.result ? res.result.shortLabel || res.result.label : 'Point selected on the map';
      if (mode === 'origin') planner.setOrigin({ ...point, label });
      else planner.setDestination({ ...point, label });
    },
    [pickingMode, planner],
  );

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

  const handleShare = useCallback(async () => {
    setSharing(true);
    const result = await shareLocation({ title: property.title, text: buildLocationShareText(property) });
    setSharing(false);
    if (result.method === 'clipboard') setNotice('Location details copied to your clipboard.');
    if (result.method === 'none') setNotice('We could not share this location on this device.');
  }, [property]);

  const routeForMap = planner.result ? { ...planner.result, activeIndex: planner.activeIndex } : null;

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-heading text-xl font-bold text-brand-900 sm:text-2xl">
            <Route className="h-5 w-5 text-flame-500" /> Location & Directions
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            See exactly where this property sits, what is around it, and plan how to get there.
          </p>
        </div>
        <Button onClick={handleShare} variant="outline" className="border-brand-200">
          <Share2 className="mr-1.5 h-4 w-4" /> Share location
        </Button>
      </div>

      {notice && (
        <p className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> <span>{notice}</span>
        </p>
      )}

      {!usable && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-start gap-2 text-sm font-semibold text-amber-900">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" /> This property has no mapped coordinates yet
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-800">
            We cannot place it on the map or calculate travel distance because its position has not been verified. The address below is still
            accurate as recorded, and you can open it in Google Maps to find the area. Our team can confirm the exact position on request.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={buildGoogleMapsSearchUrl({ label: addressLine || property.title })}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-brand-900 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-800"
            >
              Search this address in Google Maps
            </a>
          </div>
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          {usable && (
            <div className="h-[380px] overflow-hidden rounded-2xl border border-brand-100 sm:h-[440px]">
              <MapView
                properties={[property]}
                landmarks={[]}
                selectedProperty={property}
                onSelectProperty={() => {}}
                mapType="street"
                route={routeForMap}
                origin={planner.origin}
                destination={planner.destination}
                userLocation={userLocation}
                accessPoint={accessPoint}
                boundary={boundary}
                nearbyPlaces={nearby.places}
                showNearby
                showBoundary
                pickingMode={pickingMode}
                onMapPick={handleMapPick}
                apiRef={apiRef}
              />
            </div>
          )}

          <div className="rounded-2xl border border-brand-100 bg-ice-50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-brand-900">
              <MapPin className="h-4 w-4 text-flame-500" /> Address
            </h3>
            <p className="mt-1.5 text-sm text-brand-800">{addressLine || 'Address not recorded'}</p>
            {coordinates && <p className="mt-1 text-xs text-muted-foreground">Coordinates: {coordinates}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={buildGoogleMapsSearchUrl(usable ? { lat: property.latitude, lng: property.longitude } : { label: addressLine || property.title })}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-ice-50"
              >
                Open in Google Maps
              </a>
              {usable && (
                <a
                  href={buildGoogleMapsDirectionsUrl({
                    destination: { lat: property.latitude, lng: property.longitude },
                    mode: planner.mode,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-ice-50"
                >
                  Directions in Google Maps
                </a>
              )}
            </div>
          </div>

          <NearbyPlacesPanel
            property={property}
            landmarks={landmarks}
            livePlaces={nearby.places}
            liveState={nearby}
            radiusM={nearby.radiusM}
            onRadiusChange={nearby.setRadius}
            onLoadLive={nearby.load}
            onFocusPlace={(place) => apiRef.current?.flyTo(place.latitude, place.longitude, 16)}
            onDirections={(place) => {
              planner.setDestination({ label: place.name, shortLabel: place.name, lat: place.latitude, lng: place.longitude });
              setPickingMode(null);
            }}
          />
        </div>

        <div className="space-y-4 lg:col-span-2">
          {locationLoading ? (
            <div className="rounded-2xl border border-brand-100 bg-white p-4">
              <div className="h-4 w-32 animate-pulse rounded bg-secondary" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-secondary" />
              <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-secondary" />
            </div>
          ) : (
            <div className={`rounded-2xl border p-4 ${toneClass}`}>
              <p className="flex items-center gap-2 text-sm font-bold">
                {locationRecord?.location_verification_status === 'verified' ? (
                  <BadgeCheck className="h-4 w-4" />
                ) : (
                  <TriangleAlert className="h-4 w-4" />
                )}
                {verification.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed opacity-90">{verification.description}</p>
              {locationRecord?.coordinate_source && (
                <p className="mt-2 text-xs opacity-90">Position source: {COORDINATE_SOURCE_LABELS[locationRecord.coordinate_source] || locationRecord.coordinate_source}</p>
              )}
              {locationRecord?.location_verified_at && (
                <p className="mt-1 text-[11px] opacity-80">
                  Checked {new Date(locationRecord.location_verified_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
                  {locationRecord.location_verified_by_name ? ` by ${locationRecord.location_verified_by_name}` : ''}
                </p>
              )}
              {locationRecord?.map_precision_note && (
                <p className="mt-2 rounded-lg bg-white/70 p-2 text-[11px] leading-relaxed">{locationRecord.map_precision_note}</p>
              )}
            </div>
          )}

          {accessPoint ? (
            <div className="rounded-2xl border border-brand-100 bg-white p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-brand-900">
                <Milestone className="h-4 w-4 text-success" /> Road access point
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                The entrance used to reach the plot may differ from the plot position itself — especially for land.
              </p>
              {accessCoordinates && <p className="mt-1.5 text-xs text-brand-800">Access coordinates: {accessCoordinates}</p>}
              {locationRecord?.access_instructions && (
                <p className="mt-2 rounded-lg bg-ice-50 p-2 text-xs leading-relaxed text-brand-800">{locationRecord.access_instructions}</p>
              )}
            </div>
          ) : (
            locationRecord && (
              <div className="rounded-2xl border border-brand-100 bg-white p-4">
                <h3 className="flex items-center gap-2 text-sm font-bold text-brand-900">
                  <Milestone className="h-4 w-4 text-muted-foreground" /> Road access point
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  No separate road access point has been recorded for this property yet.
                </p>
              </div>
            )
          )}

          {usable && (
            <div className="rounded-2xl border border-brand-100 bg-white p-4">
              <RoutePlanner
                title="Get directions"
                origin={planner.origin}
                onOriginChange={planner.setOrigin}
                destination={planner.destination}
                onDestinationChange={planner.setDestination}
                mode={planner.mode}
                onModeChange={planner.setMode}
                supportedModes={planner.supportedModes}
                result={planner.result}
                loading={planner.loading}
                activeIndex={planner.activeIndex}
                onActiveIndexChange={planner.setActiveIndex}
                onRecalculate={planner.recompute}
                onClear={planner.clearRoute}
                onReverse={planner.reverse}
                onStartNavigation={handleStartNavigation}
                onOpenInMaps={() => {
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
                }}
                onShare={handleShare}
                sharing={sharing}
                pickingMode={pickingMode}
                onPickOrigin={() => setPickingMode('origin')}
                onPickDestination={() => setPickingMode('destination')}
                onUseCurrentLocation={handleUseCurrentLocation}
                locating={locating}
                near={{ lat: property.latitude, lng: property.longitude }}
              />
              {accessPoint && (
                <p className="mt-2 rounded-lg bg-ice-50 p-2 text-[11px] leading-relaxed text-brand-800">
                  Routing is set to the recorded road access point, which is where a driver can actually turn in. The plot position is marked
                  separately on the map — you can change the destination above to route to the plot itself.
                </p>
              )}
              <p className="mt-3 flex items-start gap-1.5 border-t border-brand-100 pt-3 text-[10px] leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                  Distance and time are estimates from the mapped road network with no live traffic. Walking, cycling and motorcycle road
                  routes are not served by our routing provider — use the Google Maps buttons for those modes.
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}